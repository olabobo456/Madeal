import React, { useState, useRef, useEffect } from 'react';
import { Info, HelpCircle, X, Sparkles } from 'lucide-react';
import { TermExplanation } from '../utils/legalTerms';

interface TermInfoTooltipProps {
  info: TermExplanation;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const TermInfoTooltip: React.FC<TermInfoTooltipProps> = ({
  info,
  label,
  className = '',
  size = 'sm',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-flex items-center align-middle ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => {
          // Delay close slightly for smooth hover
        }}
        aria-label={`Explain ${info.title}`}
        className="inline-flex items-center gap-1 text-[#7E635F] hover:text-[#59171B] transition-colors p-0.5 rounded-full hover:bg-[#FAF3EC] cursor-pointer focus:outline-none"
      >
        {label && <span className="text-[11px] font-semibold text-[#59171B] underline decoration-dotted">{label}</span>}
        <Info className={size === 'sm' ? 'w-3.5 h-3.5 text-[#59171B]' : 'w-4 h-4 text-[#59171B]'} />
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div
          ref={popoverRef}
          onMouseLeave={() => setIsOpen(false)}
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 bg-white rounded-2xl p-4 border border-[#ECD9CB] shadow-payno-lg text-left animate-in fade-in zoom-in-95"
          style={{ maxWidth: 'calc(100vw - 32px)' }}
        >
          {/* Header with Layman Tag */}
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#F5E8DC]">
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF3EC] text-[#59171B] text-[10px] font-bold tracking-wide uppercase">
                <Sparkles className="w-3 h-3 text-[#59171B]" />
                In Plain English
              </span>
              <h4 className="font-heading text-xs font-bold text-[#230B0D] mt-1">
                {info.title}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[#7E635F] hover:text-[#230B0D] p-1 rounded-lg hover:bg-[#FAF3EC] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Layman Translation */}
          <div className="mt-2.5 bg-[#FAF3EC] rounded-xl p-2.5 border border-[#ECD9CB]/60">
            <span className="text-[10px] uppercase font-bold text-[#59171B] block">
              What this means:
            </span>
            <p className="text-xs font-medium text-[#230B0D] mt-0.5 leading-relaxed">
              {info.shortLayman}
            </p>
          </div>

          {/* Deep Explanation */}
          <div className="mt-2.5 space-y-2 text-[11px] text-[#7E635F] leading-relaxed">
            <p>{info.fullExplanation}</p>

            {info.creatorTip && (
              <div className="p-2 rounded-lg bg-[#FAF3EC]/60 border border-[#ECD9CB]/40 text-[#59171B]">
                <span className="font-bold block text-[10px] uppercase">💡 Creator Tip:</span>
                <span className="text-[11px] text-[#230B0D]">{info.creatorTip}</span>
              </div>
            )}
          </div>

          {/* Triangle Pointer */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-3 h-3 bg-white border-b border-r border-[#ECD9CB] rotate-45" />
        </div>
      )}
    </div>
  );
};
