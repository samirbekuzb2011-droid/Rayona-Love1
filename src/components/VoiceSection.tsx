import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  Pause,
  Play,
  Square,
  Trash2,
  Upload,
  Volume2,
} from 'lucide-react';
import { VoiceMessage } from '../types';
import { formatDuration } from '../lib/ambientAudio';

interface VoiceSectionProps {
  voices: VoiceMessage[];
  onSaveVoice: (data: {
    title: string;
    note: string;
    durationSec: number;
    audioBlob: Blob;
  }) => Promise<void>;
  onDeleteVoice: (id: string) => Promise<void>;
  onVoicePlaybackChange: (isPlaying: boolean) => void;
}

export function VoiceSection({
  voices,
  onSaveVoice,
  onDeleteVoice,
  onVoicePlaybackChange,
}: VoiceSectionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [levels, setLevels] = useState<number[]>(Array(18).fill(0.18));
  const [draftBlob, setDraftBlob] = useState<Blob | null>(null);
  const [draftUrl, setDraftUrl] = useState<string | null>(null);
  const [draftDuration, setDraftDuration] = useState(0);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [micError, setMicError] = useState('');

  // Playback state for saved voice notes
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<Record<string, number>>({});
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (draftUrl) URL.revokeObjectURL(draftUrl);
      if (audioElRef.current) {
        audioElRef.current.pause();
      }
      onVoicePlaybackChange(false);
    };
  }, []);

  const stopVisualization = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setLevels(Array(18).fill(0.18));
  };

  const startRecording = async () => {
    setMicError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicError(
        'Браузер не поддерживает запись с микрофона. Ты можешь загрузить готовый аудиофайл.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      const startTime = Date.now();
      recorder.onstop = () => {
        const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        if (draftUrl) URL.revokeObjectURL(draftUrl);
        setDraftBlob(blob);
        setDraftUrl(URL.createObjectURL(blob));
        setDraftDuration(elapsed);
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        stopVisualization();
      };

      // Live audio level meter
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevels = () => {
        analyser.getByteFrequencyData(dataArray);
        const next = Array.from({ length: 18 }, (_, i) => {
          const val = dataArray[i % dataArray.length] ?? 0;
          return Math.max(0.16, Math.min(1, val / 180));
        });
        setLevels(next);
        rafRef.current = requestAnimationFrame(updateLevels);
      };
      updateLevels();

      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch {
      setMicError(
        'Не удалось получить доступ к микрофону. Проверь разрешение в браузере или загрузи аудиофайл.'
      );
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleAudioUpload = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      setMicError('Пожалуйста, выбери аудиофайл (MP3, WAV, M4A, OGG).');
      return;
    }
    setMicError('');
    const objectUrl = URL.createObjectURL(file);
    const probe = new Audio(objectUrl);
    probe.onloadedmetadata = () => {
      if (draftUrl) URL.revokeObjectURL(draftUrl);
      setDraftBlob(file);
      setDraftUrl(objectUrl);
      setDraftDuration(Math.max(1, Math.round(probe.duration || 10)));
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    probe.onerror = () => {
      if (draftUrl) URL.revokeObjectURL(draftUrl);
      setDraftBlob(file);
      setDraftUrl(objectUrl);
      setDraftDuration(10);
    };
  };

  const handleDiscardDraft = () => {
    if (draftUrl) URL.revokeObjectURL(draftUrl);
    setDraftBlob(null);
    setDraftUrl(null);
    setDraftDuration(0);
    setTitle('');
    setNote('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftBlob) return;
    setIsSaving(true);
    try {
      await onSaveVoice({
        title: title.trim() || 'Голосовое признание',
        note: note.trim() || 'Слова, которые хочется услышать ещё раз.',
        durationSec: draftDuration,
        audioBlob: draftBlob,
      });
      handleDiscardDraft();
    } finally {
      setIsSaving(false);
    }
  };

  const togglePlayVoice = (voice: VoiceMessage) => {
    if (playingId === voice.id && audioElRef.current) {
      audioElRef.current.pause();
      setPlayingId(null);
      onVoicePlaybackChange(false);
      return;
    }

    if (audioElRef.current) {
      audioElRef.current.pause();
    }

    const audio = new Audio(voice.audioUrl);
    audioElRef.current = audio;
    setPlayingId(voice.id);
    onVoicePlaybackChange(true);

    audio.ontimeupdate = () => {
      const ratio = audio.duration ? audio.currentTime / audio.duration : 0;
      setPlaybackProgress((prev) => ({ ...prev, [voice.id]: ratio }));
    };

    audio.onended = () => {
      setPlayingId(null);
      setPlaybackProgress((prev) => ({ ...prev, [voice.id]: 0 }));
      onVoicePlaybackChange(false);
    };

    audio.onerror = () => {
      setPlayingId(null);
      onVoicePlaybackChange(false);
    };

    audio.play().catch(() => {
      setPlayingId(null);
      onVoicePlaybackChange(false);
    });
  };

  return (
    <section id="voice" className="py-16 sm:py-24 border-b border-[#E5DFD7]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Recorder column */}
          <div className="lg:col-span-5">
            <p className="text-xs sm:text-sm font-medium text-[#C83E4D] mb-2">
              Голосовые послания
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#1C1917] mb-4">
              Оставить голос, когда скучаешь
            </h2>
            <p className="text-sm sm:text-base text-[#57534E] leading-relaxed mb-6">
              Запиши живое признание прямо с микрофона — фоновая музыка автоматически станет тише, когда она нажмёт воспроизведение.
            </p>

            <div className="rounded-2xl bg-white border border-[#E5DFD7] p-6 space-y-5">
              {!draftBlob ? (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[#1C1917]">
                        {isRecording ? 'Идёт запись голоса' : 'Готово к записи'}
                      </p>
                      <p className="text-xs text-[#78716C] tabular-nums mt-0.5">
                        {formatDuration(recordSeconds)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isRecording ? (
                        <button
                          type="button"
                          onClick={startRecording}
                          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#C83E4D] hover:bg-[#AE3240] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <Mic className="w-4 h-4" />
                          <span>Записать</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#1C1917] hover:bg-[#292524] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Остановить</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Compositor-only live audio bars */}
                  <div
                    aria-hidden="true"
                    className="h-14 px-4 rounded-xl bg-[#FAF8F5] border border-[#E5DFD7] flex items-center justify-between gap-1.5"
                  >
                    {levels.map((lvl, idx) => (
                      <div
                        key={idx}
                        style={{ transform: `scaleY(${lvl})` }}
                        className={`w-1.5 h-10 rounded-full origin-center transition-transform duration-75 ${
                          isRecording ? 'bg-[#C83E4D]' : 'bg-[#D6CFC7]'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#E5DFD7] flex items-center justify-between gap-4">
                    <span className="text-xs text-[#78716C]">
                      Или прикрепи готовый аудиофайл
                    </span>
                    <input
                      ref={uploadRef}
                      type="file"
                      accept="audio/*"
                      onChange={(e) => handleAudioUpload(e.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => uploadRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1C1917] bg-[#F3EFEA] hover:bg-[#EAE3DA] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Загрузить файл</span>
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E5DFD7]">
                    <span className="text-xs font-medium text-[#C83E4D]">
                      Запись готова · {formatDuration(draftDuration)}
                    </span>
                    <button
                      type="button"
                      onClick={handleDiscardDraft}
                      className="text-xs text-[#78716C] hover:text-[#1C1917] cursor-pointer"
                    >
                      Перезаписать
                    </button>
                  </div>

                  {draftUrl && (
                    <audio controls src={draftUrl} className="w-full h-10" />
                  )}

                  <div>
                    <label className="block text-xs font-medium text-[#57534E] mb-1.5">
                      Название сообщения
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Например: Перед сном"
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-[#E5DFD7] rounded-lg text-[#1C1917]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#57534E] mb-1.5">
                      Короткая заметка
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Включи, когда будешь пить утренний чай"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-[#E5DFD7] rounded-lg text-[#1C1917]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-2.5 text-sm font-medium text-white bg-[#C83E4D] hover:bg-[#AE3240] rounded-lg transition-colors cursor-pointer disabled:opacity-55"
                  >
                    {isSaving ? 'Сохранение...' : 'Сохранить голосовое'}
                  </button>
                </form>
              )}

              {micError && (
                <p className="text-xs text-[#C83E4D] leading-relaxed">{micError}</p>
              )}
            </div>
          </div>

          {/* Saved voice messages list */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-2xl font-medium text-[#1C1917]">
                Сохранённые записи
              </h3>
              <span className="text-xs text-[#78716C] tabular-nums">
                Всего: {voices.length}
              </span>
            </div>

            {voices.length === 0 ? (
              <div className="rounded-2xl border border-[#E5DFD7] bg-[#F3EFEA]/50 p-10 text-center">
                <Volume2
                  className="w-8 h-8 mx-auto text-[#78716C] mb-3"
                  strokeWidth={1.5}
                />
                <p className="font-serif text-xl text-[#1C1917] mb-1">
                  Здесь появятся твои голосовые сообщения
                </p>
                <p className="text-sm text-[#78716C]">
                  Нажми «Записать» слева, чтобы сказать пару тёплых слов прямо сейчас.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {voices.map((voice) => {
                    const isPlaying = playingId === voice.id;
                    const progress = playbackProgress[voice.id] ?? 0;

                    return (
                      <motion.div
                        key={voice.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="rounded-2xl bg-white border border-[#E5DFD7] p-5 flex items-center gap-4"
                      >
                        <button
                          type="button"
                          onClick={() => togglePlayVoice(voice)}
                          aria-label={isPlaying ? 'Пауза' : 'Воспроизвести голосовое'}
                          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                            isPlaying
                              ? 'bg-[#C83E4D] text-white'
                              : 'bg-[#F3EFEA] text-[#1C1917] hover:bg-[#EAE3DA]'
                          }`}
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5 translate-x-0.5" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-serif text-xl font-medium text-[#1C1917] truncate">
                              {voice.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-[#78716C] shrink-0 tabular-nums">
                              <span>{voice.dateLabel}</span>
                              <span aria-hidden="true">·</span>
                              <span>{formatDuration(voice.durationSec)}</span>
                            </div>
                          </div>

                          <p className="text-sm text-[#57534E] mb-3 truncate">
                            {voice.note}
                          </p>

                          <div className="h-1.5 w-full rounded-full bg-[#F3EFEA] overflow-hidden">
                            <div
                              style={{ transform: `scaleX(${progress})` }}
                              className="h-full w-full bg-[#C83E4D] origin-left transition-transform duration-100"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (playingId === voice.id && audioElRef.current) {
                              audioElRef.current.pause();
                              setPlayingId(null);
                              onVoicePlaybackChange(false);
                            }
                            onDeleteVoice(voice.id);
                          }}
                          aria-label="Удалить голосовое сообщение"
                          className="p-2 text-[#78716C] hover:text-[#C83E4D] hover:bg-[#F3EFEA] rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
