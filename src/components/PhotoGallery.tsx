import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  MessageSquare,
  Pause,
  Play,
  Plus,
  Sparkles,
} from 'lucide-react';
import { PhotoCategory, PhotoMemory } from '../types';
import { SafeImage } from './SafeImage';

interface PhotoGalleryProps {
  photos: PhotoMemory[];
  onSelectPhoto: (photoId: string) => void;
  onAddPhotoClick: () => void;
}

const CATEGORIES: PhotoCategory[] = ['Все', 'Прогулки', 'Утро', 'Вечер', 'Нежность'];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 48 : -48,
    opacity: 0,
    scale: 1.03,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
      opacity: { duration: 0.45 },
      scale: { duration: 5.5, ease: 'easeOut' as const },
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -48 : 48,
    opacity: 0,
    transition: {
      duration: 0.38,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

function formatCommentsLabel(count: number): string {
  if (count === 0) return 'Без заметок';
  if (count === 1) return '1 комментарий';
  if (count >= 2 && count <= 4) return `${count} комментария`;
  return `${count} комментариев`;
}

export function PhotoGallery({
  photos,
  onSelectPhoto,
  onAddPhotoClick,
}: PhotoGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory>('Все');
  const [viewMode, setViewMode] = useState<'grid' | 'slideshow'>('grid');
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const [autoPlay, setAutoPlay] = useState(true);

  const filteredPhotos =
    selectedCategory === 'Все'
      ? photos
      : photos.filter((p) => p.category === selectedCategory);

  useEffect(() => {
    setSlideIndex(0);
  }, [selectedCategory, photos.length]);

  useEffect(() => {
    if (viewMode !== 'slideshow' || !autoPlay || filteredPhotos.length <= 1) return;
    const timer = window.setInterval(() => {
      setSlideDirection(1);
      setSlideIndex((prev) => (prev + 1) % filteredPhotos.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [viewMode, autoPlay, filteredPhotos.length]);

  const handleNextSlide = () => {
    if (filteredPhotos.length === 0) return;
    setSlideDirection(1);
    setSlideIndex((prev) => (prev + 1) % filteredPhotos.length);
  };

  const handlePrevSlide = () => {
    if (filteredPhotos.length === 0) return;
    setSlideDirection(-1);
    setSlideIndex((prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length);
  };

  const activeSlide = filteredPhotos[slideIndex];

  return (
    <section id="moments" className="py-16 sm:py-24 border-b border-[#E5DFD7]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs sm:text-sm font-medium text-[#C83E4D] mb-2">
              Галерея воспоминаний
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#1C1917]">
              Наши фотографии и заметки
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              role="group"
              aria-label="Фильтр по настроению"
              className="flex items-center gap-1 p-1 bg-[#F3EFEA] rounded-lg overflow-x-auto max-w-full"
            >
              {CATEGORIES.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-white text-[#1C1917] shadow-xs'
                        : 'text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <div
              role="group"
              aria-label="Режим просмотра"
              className="flex items-center gap-1 p-1 bg-[#F3EFEA] rounded-lg shrink-0"
            >
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#1C1917] shadow-xs'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Сетка</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('slideshow')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  viewMode === 'slideshow'
                    ? 'bg-white text-[#1C1917] shadow-xs'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Слайдшоу</span>
              </button>
            </div>
          </div>
        </div>

        {filteredPhotos.length === 0 ? (
          <div className="rounded-2xl border border-[#E5DFD7] bg-[#F3EFEA]/60 p-12 text-center">
            <p className="font-serif text-2xl text-[#1C1917] mb-2">
              В этом разделе пока нет фотографий
            </p>
            <p className="text-sm text-[#78716C] mb-6">
              Добавь первый снимок с тёплой подписью, чтобы сохранить этот момент.
            </p>
            <button
              type="button"
              onClick={onAddPhotoClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#C83E4D] hover:bg-[#AE3240] rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить фотографию</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredPhotos.map((photo, idx) => {
                const isFeatured = idx === 0 && filteredPhotos.length >= 3;
                return (
                  <motion.article
                    key={photo.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{
                      duration: 0.4,
                      delay: Math.min(idx * 0.05, 0.25),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`group flex flex-col rounded-2xl overflow-hidden bg-white border border-[#E5DFD7] ${
                      isFeatured ? 'md:col-span-2' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectPhoto(photo.id)}
                      className={`relative w-full overflow-hidden bg-[#EFEAE2] text-left cursor-pointer ${
                        isFeatured ? 'h-[320px] sm:h-[400px]' : 'h-[280px] sm:h-[320px]'
                      }`}
                    >
                      <SafeImage
                        src={photo.imageUrl}
                        alt={photo.title}
                        titleFallback={photo.title}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/80 via-black/35 to-transparent">
                        <div className="flex items-center gap-2 text-xs text-white/80 mb-1">
                          <span>{photo.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{photo.dateLabel}</span>
                        </div>
                        <h3 className="font-serif text-2xl font-medium text-white">
                          {photo.title}
                        </h3>
                      </div>
                    </button>

                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <p className="text-sm leading-relaxed text-[#57534E] line-clamp-3">
                        {photo.caption}
                      </p>

                      <div className="pt-3 border-t border-[#E5DFD7]/70 flex items-center justify-between text-xs text-[#78716C]">
                        <span className="inline-flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{formatCommentsLabel(photo.comments.length)}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => onSelectPhoto(photo.id)}
                          className="font-medium text-[#C83E4D] hover:text-[#8E2430] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          Открыть и обсудить
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="rounded-2xl overflow-hidden border border-[#E5DFD7] bg-[#1C1917] text-white">
            <div className="relative h-[400px] sm:h-[540px] overflow-hidden">
              <AnimatePresence initial={false} custom={slideDirection} mode="wait">
                {activeSlide && (
                  <motion.div
                    key={activeSlide.id}
                    custom={slideDirection}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0"
                  >
                    <SafeImage
                      src={activeSlide.imageUrl}
                      alt={activeSlide.title}
                      titleFallback={activeSlide.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/15" />
                  </motion.div>
                )}
              </AnimatePresence>

              {filteredPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    aria-label="Предыдущее фото"
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/45 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer backdrop-blur-xs"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    aria-label="Следующее фото"
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/45 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer backdrop-blur-xs"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {activeSlide && (
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-2 text-xs text-white/75 mb-2">
                      <span className="tabular-nums">
                        {slideIndex + 1} / {filteredPhotos.length}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{activeSlide.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{activeSlide.dateLabel}</span>
                    </div>
                    <h3 className="font-serif text-3xl sm:text-4xl font-medium text-white mb-2">
                      {activeSlide.title}
                    </h3>
                    <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                      {activeSlide.caption}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setAutoPlay((v) => !v)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium bg-white/15 hover:bg-white/25 text-white rounded-lg backdrop-blur-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {autoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{autoPlay ? 'Пауза' : 'Автопоказ'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectPhoto(activeSlide.id)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#C83E4D] hover:bg-[#AE3240] text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Комментарии ({activeSlide.comments.length})</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
