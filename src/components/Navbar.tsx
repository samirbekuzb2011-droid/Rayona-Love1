import { Plus } from 'lucide-react';

interface NavbarProps {
  recipientName: string;
  onAddPhotoClick: () => void;
}

export function Navbar({ recipientName, onAddPhotoClick }: NavbarProps) {
  const brandLabel = recipientName.trim() ? `Для ${recipientName.trim()}` : 'Для тебя';

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E5DFD7]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#letter"
          className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#1C1917] whitespace-nowrap shrink-0 truncate max-w-[180px] sm:max-w-[240px]"
        >
          {brandLabel}
        </a>

        <nav
          aria-label="Основная навигация"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534E]"
        >
          <a
            href="#letter"
            className="hover:text-[#1C1917] transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#C83E4D]"
          >
            Признание
          </a>
          <a
            href="#moments"
            className="hover:text-[#1C1917] transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#C83E4D]"
          >
            Моменты
          </a>
          <a
            href="#voice"
            className="hover:text-[#1C1917] transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#C83E4D]"
          >
            Голос
          </a>
          <a
            href="#music"
            className="hover:text-[#1C1917] transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#C83E4D]"
          >
            Музыка
          </a>
        </nav>

        <div className="shrink-0">
          <button
            type="button"
            onClick={onAddPhotoClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium text-white bg-[#C83E4D] hover:bg-[#AE3240] active:scale-[0.98] rounded-lg transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" strokeWidth={2} />
            <span>Добавить фото</span>
          </button>
        </div>
      </div>
    </header>
  );
}
