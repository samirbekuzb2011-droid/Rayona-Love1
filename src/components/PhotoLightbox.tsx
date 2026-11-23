import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { PhotoMemory } from '../types';
import { SafeImage } from './SafeImage';

interface PhotoLightboxProps {
  photos: PhotoMemory[];
  selectedPhotoId: string | null;
  onClose: () => void;
  onSelectPhoto: (id: string) => void;
  onAddComment: (photoId: string, author: string, text: string) => Promise<void>;
  onDeleteComment: (photoId: string, commentId: string) => Promise<void>;
  onDeletePhoto: (photoId: string) => Promise<void>;
}

const imageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
    transition: {
      duration: 0.22,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

export function PhotoLightbox({
  photos,
  selectedPhotoId,
  onClose,
  onSelectPhoto,
  onAddComment,
  onDeleteComment,
  onDeletePhoto,
}: PhotoLightboxProps) {
  const [direction, setDirection] = useState(1);
  const [author, setAuthor] = useState<'Я' | 'Любимая'>('Я');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentIndex = photos.findIndex((p) => p.id === selectedPhotoId);
  const currentPhoto = currentIndex >= 0 ? photos[currentIndex] : null;

  const goNext = () => {
    if (photos.length <= 1 || currentIndex < 0) return;
    setDirection(1);
    const next = photos[(currentIndex + 1) % photos.length];
    onSelectPhoto(next.id);
  };

  const goPrev = () => {
    if (photos.length <= 1 || currentIndex < 0) return;
    setDirection(-1);
    const prev = photos[(currentIndex - 1 + photos.length) % photos.length];
    onSelectPhoto(prev.id);
  };

  useEffect(() => {
    if (!currentPhoto) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPhoto || !commentText.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddComment(currentPhoto.id, author, commentText.trim());
      setCommentText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {currentPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1C1917]/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-5xl max-h-[92vh] bg-[#FAF8F5] rounded-2xl overflow-hidden border border-[#E5DFD7] grid grid-cols-1 lg:grid-cols-12 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left media column */}
            <div className="lg:col-span-7 relative bg-[#141210] h-[300px] sm:h-[420px] lg:h-[620px] flex items-center justify-center overflow-hidden">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentPhoto.id}
                  custom={direction}
                  variants={imageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="w-full h-full"
                >
                  <SafeImage
                    src={currentPhoto.imageUrl}
                    alt={currentPhoto.title}
                    titleFallback={currentPhoto.title}
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              </AnimatePresence>

              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Предыдущая фотография"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Следующая фотография"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Right details + comments column */}
            <div className="lg:col-span-5 flex flex-col max-h-[52vh] lg:max-h-[620px]">
              <div className="p-5 sm:p-6 border-b border-[#E5DFD7] flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#78716C] mb-1">
                    <span>{currentPhoto.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{currentPhoto.dateLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {currentIndex + 1} из {photos.length}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-medium text-[#1C1917]">
                    {currentPhoto.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onDeletePhoto(currentPhoto.id)}
                    aria-label="Удалить фотографию"
                    title="Удалить фотографию"
                    className="p-2 text-[#78716C] hover:text-[#C83E4D] hover:bg-[#F3EFEA] rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Закрыть просмотр"
                    className="p-2 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F3EFEA] rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                <p className="text-sm sm:text-base leading-relaxed text-[#44403C]">
                  {currentPhoto.caption}
                </p>

                <div className="pt-4 border-t border-[#E5DFD7]">
                  <p className="text-xs font-medium text-[#78716C] mb-3">
                    Комментарии ({currentPhoto.comments.length})
                  </p>

                  {currentPhoto.comments.length === 0 ? (
                    <p className="text-sm text-[#78716C] py-3">
                      Пока нет комментариев — напиши пару тёплых слов к этому кадру.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <AnimatePresence initial={false}>
                        {currentPhoto.comments.map((comment) => (
                          <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.2 }}
                            className="p-3.5 rounded-xl bg-[#F3EFEA] border border-[#E5DFD7]/60"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 text-xs text-[#78716C]">
                                <span className="font-semibold text-[#1C1917]">
                                  {comment.author}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span>{comment.createdAt}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => onDeleteComment(currentPhoto.id, comment.id)}
                                aria-label="Удалить комментарий"
                                className="text-[#78716C] hover:text-[#C83E4D] p-1 transition-colors cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-sm text-[#292524] leading-relaxed">
                              {comment.text}
                            </p>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-4 sm:p-5 border-t border-[#E5DFD7] bg-white space-y-2.5"
              >
                <div className="flex items-center gap-1 p-1 bg-[#F3EFEA] rounded-lg w-fit">
                  {(['Я', 'Любимая'] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setAuthor(role)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        author === role
                          ? 'bg-white text-[#1C1917] shadow-xs'
                          : 'text-[#57534E] hover:text-[#1C1917]'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Написать комментарий к фото..."
                    className="flex-1 min-w-0 px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-[#E5DFD7] rounded-lg text-[#1C1917]"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !commentText.trim()}
                    aria-label="Отправить комментарий"
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-[#C83E4D] hover:bg-[#AE3240] disabled:opacity-45 text-white rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
