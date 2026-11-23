import { motion } from 'motion/react';
import { Pause, Play, SkipForward, Volume2 } from 'lucide-react';
import { MusicTrack } from '../types';

interface MusicDockProps {
  activeTrack: MusicTrack | undefined;
  isPlaying: boolean;
  isDucked: boolean;
  onTogglePlay: () => void;
  onNextTrack: () => void;
}

export function MusicDock({
  activeTrack,
  isPlaying,
  isDucked,
  onTogglePlay,
  onNextTrack,
}: MusicDockProps) {
  if (!activeTrack) return null;

  return (
    <motion.aside
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Мини-плеер фоновой музыки"
      className="fixed bottom-3 right-3 left-3 sm:left-auto sm:bottom-5 sm:right-6 z-40 sm:w-[330px] h-14 px-4 rounded-xl bg-[#1C1917]/95 text-white backdrop-blur-md border border-white/10 shadow-lg flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={isPlaying ? 'Пауза музыки' : 'Включить музыку'}
          className="w-9 h-9 rounded-lg bg-[#C83E4D] hover:bg-[#AE3240] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 translate-x-0.5" />
          )}
        </button>

        <div className="min-w-0">
          <p className="text-xs font-medium text-white truncate">
            {activeTrack.title}
          </p>
          <p className="text-[11px] text-white/65 truncate">
            {isDucked
              ? 'Приглушено на время голоса'
              : isPlaying
              ? 'Звучит на фоне'
              : 'Нажми, чтобы включить'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Volume2 className="w-3.5 h-3.5 text-white/55 mr-1 hidden sm:block" />
        <button
          type="button"
          onClick={onNextTrack}
          aria-label="Следующая мелодия"
          className="p-2 text-white/75 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </motion.aside>
  );
}
