import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Edit3, Check } from 'lucide-react';
import { LoveLetterProfile } from '../types';

interface LoveLetterModalProps {
  isOpen: boolean;
  initialEditMode: boolean;
  profile: LoveLetterProfile;
  onClose: () => void;
  onSave: (updated: LoveLetterProfile) => Promise<void>;
}

export function LoveLetterModal({
  isOpen,
  initialEditMode,
  profile,
  onClose,
  onSave,
}: LoveLetterModalProps) {
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [draft, setDraft] = useState<LoveLetterProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(profile);
    setIsEditing(initialEditMode);
  }, [profile, initialEditMode, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(draft);
      setIsEditing(false);
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
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1C1917]/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FAF8F5] border border-[#E5DFD7] rounded-2xl p-6 sm:p-10 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#E5DFD7]">
              <div>
                <p className="text-xs font-medium text-[#C83E4D] mb-1">
                  {isEditing ? 'Редактирование признания' : 'Письмо с любовью'}
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1C1917]">
                  {isEditing ? 'Персонализировать послание' : `Для ${profile.recipientName}`}
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#57534E] hover:text-[#1C1917] bg-[#F3EFEA] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Редактировать</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Закрыть окно"
                  className="p-2 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F3EFEA] rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#57534E] mb-1.5">
                      Как зовут твою девушку
                    </label>
                    <input
                      type="text"
                      value={draft.recipientName}
                      onChange={(e) => setDraft({ ...draft, recipientName: e.target.value })}
                      placeholder="Например: Алины"
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5DFD7] rounded-lg text-[#1C1917]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#57534E] mb-1.5">
                      Твоя подпись
                    </label>
                    <input
                      type="text"
                      value={draft.senderName}
                      onChange={(e) => setDraft({ ...draft, senderName: e.target.value })}
                      placeholder="Твой навсегда"
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5DFD7] rounded-lg text-[#1C1917]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#57534E] mb-1.5">
                    Дата начала ваших отношений
                  </label>
                  <input
                    type="date"
                    value={draft.startDate}
                    onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
                    className="w-full sm:w-60 px-3.5 py-2.5 text-sm bg-white border border-[#E5DFD7] rounded-lg text-[#1C1917]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#57534E] mb-1.5">
                    Главный заголовок на первом экране
                  </label>
                  <input
                    type="text"
                    value={draft.headline}
                    onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5DFD7] rounded-lg text-[#1C1917]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#57534E] mb-1.5">
                    Короткое вступление
                  </label>
                  <textarea
                    rows={2}
                    value={draft.leadQuote}
                    onChange={(e) => setDraft({ ...draft, leadQuote: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5DFD7] rounded-lg text-[#1C1917] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#57534E] mb-1.5">
                    Полное письмо-признание
                  </label>
                  <textarea
                    rows={8}
                    value={draft.letterBody}
                    onChange={(e) => setDraft({ ...draft, letterBody: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 text-sm leading-relaxed bg-white border border-[#E5DFD7] rounded-lg text-[#1C1917]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 text-sm font-medium text-[#57534E] hover:text-[#1C1917] rounded-lg transition-colors cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#C83E4D] hover:bg-[#AE3240] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSaving ? 'Сохранение...' : 'Сохранить признание'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-6 space-y-5">
                {profile.letterBody.split('\n\n').map((paragraph, index) => (
                  <p
                    key={index}
                    className="font-serif text-xl sm:text-[1.35rem] leading-relaxed text-[#292524]"
                  >
                    {paragraph}
                  </p>
                ))}
                <div className="pt-6 border-t border-[#E5DFD7] flex items-center justify-between text-sm text-[#78716C]">
                  <span className="font-serif italic text-lg text-[#1C1917]">
                    {profile.senderName}
                  </span>
                  <span>
                    {new Date(profile.startDate).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
