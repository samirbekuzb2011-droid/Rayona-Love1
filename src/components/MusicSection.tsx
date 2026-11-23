import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Music,
  Pause,
  Play,
  Plus,
  Trash2,
  Volume2,
} from 'lucide-react';
import { MusicTrack } from '../types';
import { formatDuration } from '../lib/ambientAudio';

interface MusicSectionProps {
  tracks: MusicTrack[];
  activeTrackId: string;
  isPlaying: boolean;
  volume: number;
  onSelectTrack: (trackId: string) => void;
  onTogglePlay: () => void;
  onVolumeChange: (val: number) => void;
  onAddTrack: (data: {
    title: string;
    artist: string;
    durationSec: number;
    audioBlob: Blob;
  }) => Promise<void>;
  onDeleteTrack: (trackId: string) => Promise<void>;
}

export function MusicSection({
  tracks,
  activeTrackId,
  isPlaying,
  volume,
  onSelectTrack,
  onTogglePlay,
  onVolumeChange,
  onAddTrack,
  onDeleteTrack,
}: MusicSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFilePick = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      setUploadError('Выбери аудиофайл в формате MP3, WAV, M4A или OGG.');
      return;
    }
    setUploadError('');
    setIsUploading(true);

    const url = URL.createObjectURL(file);
    const probe = new Audio(url);
    const cleanName = file.name.replace(/\.[^/.]+$/, '');

    const finalize = (dur: number) => {
      URL.revokeObjectURL(url);
      onAddTrack({
        title: cleanName,
        artist: 'Наша песня',
        durationSec: Math.max(1, Math.round(dur)),
        audioBlob: file,
      })
        .catch(() => setUploadError('Не удалось добавить трек.'))
        .finally(() => setIsUploading(false));
    };

    probe.onloadedmetadata = () => finalize(probe.duration || 180);
    probe.onerror = () => finalize(180);
  };

  return (
    <section id="music" className="py-16 sm:py-24">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs sm:text-sm font-medium text-[#C83E4D] mb-2">
              Фоновая музыка
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#1C1917]">
              Мелодии для нашего настроения
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-[#F3EFEA] border border-[#E5DFD7]">
              <Volume2 className="w-4 h-4 text-[#57534E]" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={volume}
                aria-label="Громкость фоновой музыки"
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-24 accent-[#C83E4D] cursor-pointer"
              />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={(e) => handleFilePick(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#1C1917] hover:bg-[#292524] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              <span>{isUploading ? 'Загрузка...' : 'Добавить свою песню'}</span>
            </button>
          </div>
        </div>

        {uploadError && (
          <p className="text-sm text-[#C83E4D] mb-4">{uploadError}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tracks.map((track) => {
            const isActive = track.id === activeTrackId;
            const trackPlaying = isActive && isPlaying;

            return (
              <motion.div
                key={track.id}
                layout
                className={`rounded-2xl p-5 border transition-colors flex items-center justify-between gap-4 ${
                  isActive
                    ? 'bg-white border-[#C83E4D]/50 shadow-xs'
                    : 'bg-white/70 border-[#E5DFD7] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (isActive) {
                        onTogglePlay();
                      } else {
                        onSelectTrack(track.id);
                      }
                    }}
                    aria-label={
                      trackPlaying ? `Пауза ${track.title}` : `Включить ${track.title}`
                    }
                    className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                      trackPlaying
                        ? 'bg-[#C83E4D] text-white'
                        : 'bg-[#F3EFEA] text-[#1C1917] hover:bg-[#EAE3DA]'
                    }`}
                  >
                    {trackPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 translate-x-0.5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <h3 className="font-serif text-xl font-medium text-[#1C1917] truncate">
                      {track.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#78716C] mt-0.5">
                      <span className="truncate">{track.artist}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {formatDuration(track.durationSec)}
                      </span>
                      {track.isBuiltIn && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Встроенная</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isActive && (
                    <Music
                      className={`w-4 h-4 text-[#C83E4D] ${
                        trackPlaying ? 'opacity-100' : 'opacity-45'
                      }`}
                    />
                  )}
                  {!track.isBuiltIn && (
                    <button
                      type="button"
                      onClick={() => onDeleteTrack(track.id)}
                      aria-label={`Удалить трек ${track.title}`}
                      className="p-2 text-[#78716C] hover:text-[#C83E4D] hover:bg-[#F3EFEA] rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
