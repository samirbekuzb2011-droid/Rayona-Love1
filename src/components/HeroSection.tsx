import { motion } from 'motion/react';
import { BookOpen, Edit3, Heart, Play, Pause } from 'lucide-react';
import { LoveLetterProfile } from '../types';
import { SafeImage } from './SafeImage';

interface HeroSectionProps {
  profile: LoveLetterProfile;
  heroImageUrl: string;
  photosCount: number;
  voicesCount: number;
  tracksCount: number;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  onOpenLetter: (editMode?: boolean) => void;
}

function calculateDaysTogether(startDateStr: string): number {
  const start = new Date(startDateStr);
  if (Number.isNaN(start.getTime())) return 1;
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function HeroSection({
  profile,
  heroImageUrl,
  photosCount,
  voicesCount,
  tracksCount,
  isMusicPlaying,
  onToggleMusic,
  onOpenLetter,
}: HeroSectionProps) {
  const daysTogether = calculateDaysTogether(profile.startDate);

  return (
    <section id="letter" className="pt-10 pb-14 sm:pt-14 sm:pb-20 border-b border-[#E5DFD7]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col justify-between py-2"
          >
            <div>
              <p className="text-xs sm:text-sm font-medium tracking-wide text-[#C83E4D] mb-4">
                {profile.kicker}
              </p>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-medium leading-[1.08] tracking-tight text-[#1C1917] mb-6">
                {profile.headline}
              </h1>

              <p className="text-base sm:text-lg leading-relaxed text-[#57534E] max-w-xl mb-8">
                {profile.leadQuote}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenLetter(false)}
                  className="inline-flex items-center gap-2.5 px-5 py-3 text-sm font-medium text-white bg-[#1C1917] hover:bg-[#292524] active:scale-[0.98] rounded-lg transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                  <span>Читать признание</span>
                </button>

                <button
                  type="button"
                  onClick={onToggleMusic}
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#1C1917] bg-[#F3EFEA] hover:bg-[#EAE3DA] active:scale-[0.98] rounded-lg transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isMusicPlaying ? (
                    <Pause className="w-4 h-4 text-[#C83E4D] shrink-0" strokeWidth={2} />
                  ) : (
                    <Play className="w-4 h-4 text-[#C83E4D] shrink-0" strokeWidth={2} />
                  )}
                  <span>{isMusicPlaying ? 'Пауза музыки' : 'Включить музыку'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenLetter(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-3 text-sm font-medium text-[#57534E] hover:text-[#1C1917] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 shrink-0" strokeWidth={1.7} />
                  <span>Изменить текст</span>
                </button>
              </div>

              <div className="pt-4 border-t border-[#E5DFD7] flex items-center gap-2 text-xs sm:text-sm text-[#78716C]">
                <Heart className="w-3.5 h-3.5 text-[#C83E4D] shrink-0" strokeWidth={2} />
                <span>{profile.senderName}</span>
                <span aria-hidden="true">·</span>
                <span>Вместе с {new Date(profile.startDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            <div className="relative h-[320px] sm:h-[420px] lg:h-full lg:min-h-[460px] rounded-2xl overflow-hidden bg-[#EFEAE2] border border-[#E5DFD7]">
              <SafeImage
                src={heroImageUrl}
                alt="Наш любимый момент вдвоём"
                titleFallback={profile.headline}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/75 via-black/30 to-transparent">
                <p className="font-serif text-xl sm:text-2xl text-white font-medium">
                  С тобой каждый день — тёплый кадр
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Full-width 4-column unboxed editorial summary strip below hero split */}
        <div className="mt-12 pt-8 border-t border-[#E5DFD7] grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <p className="font-serif text-3xl sm:text-4xl font-medium text-[#1C1917] tabular-nums">
              {daysTogether}
            </p>
            <p className="text-xs sm:text-sm text-[#78716C] mt-1">
              Дней нашей истории
            </p>
          </div>
          <div>
            <p className="font-serif text-3xl sm:text-4xl font-medium text-[#1C1917] tabular-nums">
              {photosCount}
            </p>
            <p className="text-xs sm:text-sm text-[#78716C] mt-1">
              Сохранено фотографий
            </p>
          </div>
          <div>
            <p className="font-serif text-3xl sm:text-4xl font-medium text-[#1C1917] tabular-nums">
              {voicesCount}
            </p>
            <p className="text-xs sm:text-sm text-[#78716C] mt-1">
              Голосовых посланий
            </p>
          </div>
          <div>
            <p className="font-serif text-3xl sm:text-4xl font-medium text-[#1C1917] tabular-nums">
              {tracksCount}
            </p>
            <p className="text-xs sm:text-sm text-[#78716C] mt-1">
              Мелодий в альбоме
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
