import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImagePlus, X } from 'lucide-react';
import { PhotoMemory } from '../types';

interface AddPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPhoto: (data: {
    title: string;
    caption: string;
    category: PhotoMemory['category'];
    dateLabel: string;
    file: Blob;
  }) => Promise<void>;
}

const CATEGORIES: PhotoMemory['category'][] = ['Прогулки', 'Утро', 'Вечер', 'Нежность'];

export function AddPhotoModal({ isOpen, onClose, onAddPhoto }: AddPhotoModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<PhotoMemory['category']>('Нежность');
  const [dateLabel, setDateLabel] = useState(() =>
    new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (selected: File | null) => {
    if (!selected) return;
    if (!selected.type.startsWith('image/')) {
      setErrorMsg('Пожалуйста, выбери файл изображения (JPG, PNG, WebP).');
      return;
    }
    setErrorMsg('');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const resetAndClose = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setTitle('');
    setCaption('');
    setErrorMsg('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Сначала выбери фотографию.');
      return;
    }
    setIsSaving(true);
    try {
      await onAddPhoto({
        title: title.trim() || 'Наш особенный момент',
        caption: caption.trim() || 'С тобой каждый снимок хранит тепло.',
        category,
        dateLabel: dateLabel.trim() || 'Сегодня',
        file,
      });
      resetAndClose();
    } catch {
      setErrorMsg('Не удалось сохранить фотографию. Попробуй ещё раз.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1C1917]/60 backdrop-blur-sm"
          onClick={resetAndClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#FAF8F5] border border-[#E5DFD7] rounded-2xl p-6 sm:p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E5DFD7]">
              <div>
                <p className="text-xs font-medium text-[#C83E4D] mb-1">Новый снимок</p>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1C1917]">
                  Добавить фотографию
                </h2>
              </div>
              <button
                type="button"
                onClick={resetAndClose}
                aria-label="Закрыть окно"
                className="p-2 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F3EFEA] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileChange(e.dataTransfer.files?.[0] ?? null);
                }}
                onClick={() => fileInputRef.current?.click()}
                className="relative rounded-xl border border-dashed border-[#C7BEB4] hover:border-[#C83E4D] bg-[#F3EFEA]/60 transition-colors cursor-pointer overflow-hidden"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
                {previewUrl ? (
                  <div className="relative h-56 w-full">
                    <img
                      src={previewUrl}
                      alt="Предпросмотр выбранной фотографии"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-xs text-white text-center">
                      Нажми, чтобы выбрать другую фотографию
                    </div>
                  </div>
                ) : (
                  <div className="py-10 px-6 text-center">
                    <ImagePlus className="w-8 h-8 mx-auto text-[#78716C] mb-2" strokeWidth={1.5} />
                    <p className="text-sm font-medium text-[#1C1917]">
                      Выбери фото или перетащи сюда
                    </p>
                    <p className="text-xs text-[#78716C] mt-1">
                      Фотография сохранится прямо в архиве
                    </p>
                  </div>
                )}
              </div>

              {errorMsg && (
                <p className="text-xs font-medium text-[#C83E4D]">{errorMsg}</p>
              )}

              <div>
                <label className="block text-xs font-medium text-[#57534E] mb-1.5">
                  Заголовок момента
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Например: Прогулка под дождём"
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5DFD7] rounded-lg text-[#1C1917]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#57534E] mb-1.5">
                    Раздел
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PhotoMemory['category'])}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5DFD7] rounded-lg text-[#1C1917]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#57534E] mb-1.5">
                    Дата
                  </label>
                  <input
                    type="text"
                    value={dateLabel}
                    onChange={(e) => setDateLabel(e.target.value)}
                    placeholder="14 октября"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5DFD7] rounded-lg text-[#1C1917]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#57534E] mb-1.5">
                  Комментарий или история к снимку
                </label>
                <textarea
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Напиши, что ты чувствовал в этот момент..."
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5DFD7] rounded-lg text-[#1C1917] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-4 py-2.5 text-sm font-medium text-[#57534E] hover:text-[#1C1917] rounded-lg transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-[#C83E4D] hover:bg-[#AE3240] rounded-lg transition-colors cursor-pointer disabled:opacity-55"
                >
                  {isSaving ? 'Сохранение...' : 'Сохранить момент'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
