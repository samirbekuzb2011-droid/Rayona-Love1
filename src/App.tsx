import { useEffect, useMemo, useRef, useState } from 'react';
import { MotionConfig, motion } from 'motion/react';
import { Heart } from 'lucide-react';
import {
  LoveLetterProfile,
  MusicTrack,
  PhotoComment,
  PhotoMemory,
  VoiceMessage,
} from './types';
import {
  BUILTIN_TRACKS,
  DEFAULT_PROFILE,
  INITIAL_PHOTOS,
  deletePhotoFromDb,
  deleteTrackFromDb,
  deleteVoiceFromDb,
  loadPhotos,
  loadProfile,
  loadTracks,
  loadVoices,
  saveNewPhoto,
  saveProfile,
  saveTrackToDb,
  saveVoiceToDb,
  updatePhotoInDb,
} from './lib/storage';
import { AmbientSynthEngine } from './lib/ambientAudio';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { LoveLetterModal } from './components/LoveLetterModal';
import { PhotoGallery } from './components/PhotoGallery';
import { PhotoLightbox } from './components/PhotoLightbox';
import { AddPhotoModal } from './components/AddPhotoModal';
import { VoiceSection } from './components/VoiceSection';
import { MusicSection } from './components/MusicSection';
import { MusicDock } from './components/MusicDock';

export default function App() {
  const [profile, setProfile] = useState<LoveLetterProfile>(DEFAULT_PROFILE);
  const [photos, setPhotos] = useState<PhotoMemory[]>(INITIAL_PHOTOS);
  const [voices, setVoices] = useState<VoiceMessage[]>([]);
  const [tracks, setTracks] = useState<MusicTrack[]>(BUILTIN_TRACKS);

  // Modals & Lightbox state
  const [letterModalOpen, setLetterModalOpen] = useState(false);
  const [letterEditMode, setLetterEditMode] = useState(false);
  const [addPhotoOpen, setAddPhotoOpen] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  // Music engine state
  const [activeTrackId, setActiveTrackId] = useState<string>(BUILTIN_TRACKS[0].id);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [volume, setVolume] = useState(0.45);
  const [isDucked, setIsDucked] = useState(false);

  const synthRef = useRef<AmbientSynthEngine | null>(null);
  const customAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([loadProfile(), loadPhotos(), loadVoices(), loadTracks()]).then(
      ([loadedProfile, loadedPhotos, loadedVoices, loadedTracks]) => {
        if (!active) return;
        setProfile(loadedProfile);
        setPhotos(loadedPhotos);
        setVoices(loadedVoices);
        setTracks(loadedTracks);
        if (loadedTracks.length > 0) {
          setActiveTrackId(loadedTracks[0].id);
        }
      }
    );

    synthRef.current = new AmbientSynthEngine();
    return () => {
      active = false;
      synthRef.current?.stop();
      if (customAudioRef.current) {
        customAudioRef.current.pause();
      }
    };
  }, []);

  const activeTrack = useMemo(
    () => tracks.find((t) => t.id === activeTrackId) ?? tracks[0],
    [tracks, activeTrackId]
  );

  // Synchronize music playback when track, play state, volume, or ducking changes
  useEffect(() => {
    const synth = synthRef.current;
    if (!synth || !activeTrack) return;

    const effectiveVolume = isDucked ? volume * 0.22 : volume;
    synth.setVolume(volume);
    synth.setDucked(isDucked);

    if (customAudioRef.current) {
      customAudioRef.current.volume = Math.max(0, Math.min(1, effectiveVolume));
    }
  }, [volume, isDucked, activeTrack]);

  const stopAllMusic = () => {
    synthRef.current?.stop();
    if (customAudioRef.current) {
      customAudioRef.current.pause();
    }
  };

  const playTrack = (track: MusicTrack) => {
    stopAllMusic();
    if (track.isBuiltIn) {
      synthRef.current?.setVolume(volume);
      synthRef.current?.setDucked(isDucked);
      synthRef.current?.start(track.builtInPreset ?? 'piano');
      setIsMusicPlaying(true);
    } else if (track.audioUrl) {
      const audio = new Audio(track.audioUrl);
      audio.loop = true;
      audio.volume = isDucked ? volume * 0.22 : volume;
      customAudioRef.current = audio;
      audio
        .play()
        .then(() => setIsMusicPlaying(true))
        .catch(() => setIsMusicPlaying(false));
    }
  };

  const handleToggleMusic = () => {
    if (!activeTrack) return;
    if (isMusicPlaying) {
      stopAllMusic();
      setIsMusicPlaying(false);
    } else {
      playTrack(activeTrack);
    }
  };

  const handleSelectTrack = (trackId: string) => {
    setActiveTrackId(trackId);
    const chosen = tracks.find((t) => t.id === trackId);
    if (chosen) {
      playTrack(chosen);
    }
  };

  const handleNextTrack = () => {
    if (tracks.length === 0) return;
    const idx = tracks.findIndex((t) => t.id === activeTrackId);
    const next = tracks[(idx + 1) % tracks.length];
    handleSelectTrack(next.id);
  };

  const handleSaveProfile = async (updated: LoveLetterProfile) => {
    await saveProfile(updated);
    setProfile(updated);
  };

  const handleAddPhoto = async (data: {
    title: string;
    caption: string;
    category: PhotoMemory['category'];
    dateLabel: string;
    file: Blob;
  }) => {
    const newPhoto = await saveNewPhoto({
      id: `photo-${Date.now()}`,
      title: data.title,
      caption: data.caption,
      category: data.category,
      dateLabel: data.dateLabel,
      imageBlob: data.file,
      comments: [],
      createdAt: Date.now(),
    });
    setPhotos((prev) => [newPhoto, ...prev]);
  };

  const handleAddComment = async (
    photoId: string,
    author: string,
    text: string
  ) => {
    const newComment: PhotoComment = {
      id: `comment-${Date.now()}`,
      author,
      text,
      createdAt: new Date().toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId ? { ...p, comments: [...p.comments, newComment] } : p
      )
    );
    await updatePhotoInDb(photoId, (existing) => ({
      ...existing,
      comments: [...(existing.comments ?? []), newComment],
    }));
  };

  const handleDeleteComment = async (photoId: string, commentId: string) => {
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId
          ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) }
          : p
      )
    );
    await updatePhotoInDb(photoId, (existing) => ({
      ...existing,
      comments: (existing.comments ?? []).filter((c) => c.id !== commentId),
    }));
  };

  const handleDeletePhoto = async (photoId: string) => {
    const target = photos.find((p) => p.id === photoId);
    if (target?.isUserUploaded && target.imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(target.imageUrl);
    }
    setSelectedPhotoId(null);
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    await deletePhotoFromDb(photoId);
  };

  const handleSaveVoice = async (data: {
    title: string;
    note: string;
    durationSec: number;
    audioBlob: Blob;
  }) => {
    const saved = await saveVoiceToDb({
      id: `voice-${Date.now()}`,
      title: data.title,
      note: data.note,
      durationSec: data.durationSec,
      audioBlob: data.audioBlob,
      dateLabel: new Date().toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
      }),
      createdAt: Date.now(),
    });
    setVoices((prev) => [saved, ...prev]);
  };

  const handleDeleteVoice = async (id: string) => {
    const target = voices.find((v) => v.id === id);
    if (target?.audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(target.audioUrl);
    }
    setVoices((prev) => prev.filter((v) => v.id !== id));
    await deleteVoiceFromDb(id);
  };

  const handleAddTrack = async (data: {
    title: string;
    artist: string;
    durationSec: number;
    audioBlob: Blob;
  }) => {
    const saved = await saveTrackToDb({
      id: `track-${Date.now()}`,
      title: data.title,
      artist: data.artist,
      durationSec: data.durationSec,
      audioBlob: data.audioBlob,
      createdAt: Date.now(),
    });
    setTracks((prev) => [saved, ...prev]);
    setActiveTrackId(saved.id);
    playTrack(saved);
  };

  const handleDeleteTrack = async (trackId: string) => {
    const target = tracks.find((t) => t.id === trackId);
    if (target?.audioUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(target.audioUrl);
    }
    if (activeTrackId === trackId) {
      stopAllMusic();
      setIsMusicPlaying(false);
    }
    const nextTracks = tracks.filter((t) => t.id !== trackId);
    setTracks(nextTracks);
    if (activeTrackId === trackId && nextTracks[0]) {
      setActiveTrackId(nextTracks[0].id);
    }
    await deleteTrackFromDb(trackId);
  };

  const heroImageUrl =
    photos[0]?.imageUrl ||
    '/src/assets/images/hero_couple_golden_hour_1795402353440.jpg';

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917] pb-20 sm:pb-16">
        <Navbar
          recipientName={profile.recipientName}
          onAddPhotoClick={() => setAddPhotoOpen(true)}
        />

        <main className="flex-1">
          <HeroSection
            profile={profile}
            heroImageUrl={heroImageUrl}
            photosCount={photos.length}
            voicesCount={voices.length}
            tracksCount={tracks.length}
            isMusicPlaying={isMusicPlaying}
            onToggleMusic={handleToggleMusic}
            onOpenLetter={(editMode = false) => {
              setLetterEditMode(editMode);
              setLetterModalOpen(true);
            }}
          />

          {/* Editorial Confession Excerpt Band */}
          <section className="py-14 sm:py-20 bg-[#F3EFEA]/65 border-b border-[#E5DFD7]">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl mx-auto px-5 sm:px-8 text-center"
            >
              <Heart
                className="w-5 h-5 mx-auto text-[#C83E4D] mb-4"
                strokeWidth={1.8}
              />
              <blockquote className="font-serif text-2xl sm:text-4xl font-normal italic leading-snug text-[#1C1917] mb-5">
                «Любить тебя — значит каждый день находить в одном человеке целый мир»
              </blockquote>
              <button
                type="button"
                onClick={() => {
                  setLetterEditMode(false);
                  setLetterModalOpen(true);
                }}
                className="text-sm font-medium text-[#C83E4D] hover:text-[#8E2430] border-b border-[#C83E4D]/40 hover:border-[#8E2430] pb-0.5 transition-colors cursor-pointer"
              >
                Открыть полное письмо
              </button>
            </motion.div>
          </section>

          <PhotoGallery
            photos={photos}
            onSelectPhoto={(id) => setSelectedPhotoId(id)}
            onAddPhotoClick={() => setAddPhotoOpen(true)}
          />

          <VoiceSection
            voices={voices}
            onSaveVoice={handleSaveVoice}
            onDeleteVoice={handleDeleteVoice}
            onVoicePlaybackChange={setIsDucked}
          />

          <MusicSection
            tracks={tracks}
            activeTrackId={activeTrack?.id ?? ''}
            isPlaying={isMusicPlaying}
            volume={volume}
            onSelectTrack={handleSelectTrack}
            onTogglePlay={handleToggleMusic}
            onVolumeChange={setVolume}
            onAddTrack={handleAddTrack}
            onDeleteTrack={handleDeleteTrack}
          />
        </main>

        <footer className="border-t border-[#E5DFD7] py-10">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-[#78716C]">
            <p className="font-serif text-base text-[#1C1917]">
              Сделано с любовью · {profile.senderName}
            </p>
            <div className="flex items-center gap-6">
              <a href="#letter" className="hover:text-[#1C1917] transition-colors">
                Признание
              </a>
              <a href="#moments" className="hover:text-[#1C1917] transition-colors">
                Фотографии
              </a>
              <a href="#voice" className="hover:text-[#1C1917] transition-colors">
                Голос
              </a>
              <a href="#music" className="hover:text-[#1C1917] transition-colors">
                Музыка
              </a>
            </div>
          </div>
        </footer>

        <MusicDock
          activeTrack={activeTrack}
          isPlaying={isMusicPlaying}
          isDucked={isDucked}
          onTogglePlay={handleToggleMusic}
          onNextTrack={handleNextTrack}
        />

        <LoveLetterModal
          isOpen={letterModalOpen}
          initialEditMode={letterEditMode}
          profile={profile}
          onClose={() => setLetterModalOpen(false)}
          onSave={handleSaveProfile}
        />

        <AddPhotoModal
          isOpen={addPhotoOpen}
          onClose={() => setAddPhotoOpen(false)}
          onAddPhoto={handleAddPhoto}
        />

        <PhotoLightbox
          photos={photos}
          selectedPhotoId={selectedPhotoId}
          onClose={() => setSelectedPhotoId(null)}
          onSelectPhoto={(id) => setSelectedPhotoId(id)}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onDeletePhoto={handleDeletePhoto}
        />
      </div>
    </MotionConfig>
  );
}
