import React, { useState } from 'react';
import { Printer, X, FileText, Book, Palette, CheckCircle2, AlertCircle } from 'lucide-react';
import { Story } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  story: Story;
  currentPageIndex: number;
  onConfirmPrint: (mode: 'current' | 'all', coloringBook: boolean) => void;
}

export const PrintStoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  story,
  currentPageIndex,
  onConfirmPrint,
}) => {
  const [printMode, setPrintMode] = useState<'current' | 'all'>('current');
  const [coloringBook, setColoringBook] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    onConfirmPrint(printMode, coloringBook);
    onClose();
  };

  return (
    <div
      id="print-story-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="print-story-modal-card"
        className="relative w-full max-w-lg bg-amber-50 border-4 border-black shadow-[8px_8px_0px_#000] rounded-2xl p-6 sm:p-7 text-slate-900"
      >
        {/* Close Button */}
        <button
          id="close-print-story-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white border-2 border-black hover:bg-amber-200 transition-colors shadow-[2px_2px_0px_#000]"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-black" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-orange-400 border-3 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center text-slate-950 shrink-0">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-block bg-amber-700 text-white font-bangers text-xs px-2.5 py-0.5 rounded-md border-2 border-black tracking-wider uppercase shadow-[2px_2px_0px_#000]">
              Print Comic Studio
            </div>
            <h2 className="text-2xl font-black font-heading tracking-tight text-slate-950 mt-0.5">
              Print Your Comic Book
            </h2>
          </div>
        </div>

        {/* Description / Story Details */}
        <div className="bg-white border-3 border-black shadow-[3px_3px_0px_#000] rounded-xl p-3.5 mb-5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-yellow-200 border-2 border-black flex items-center justify-center shrink-0 font-bangers text-lg text-yellow-900">
            #{currentPageIndex + 1}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bangers text-lg text-slate-950 line-clamp-1">
              {story.title}
            </h3>
            <p className="text-xs text-slate-600 font-comic font-semibold">
              Currently on Page {currentPageIndex + 1} of {story.pages.length}
            </p>
          </div>
        </div>

        {/* Print Scope Selector */}
        <div className="space-y-3 mb-5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-900 font-comic">
            Select Pages to Print:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              id="select-print-current-btn"
              type="button"
              onClick={() => setPrintMode('current')}
              className={`p-3 rounded-xl border-3 border-black text-left transition-all shadow-[3px_3px_0px_#000] ${
                printMode === 'current'
                  ? 'bg-yellow-300 font-bold'
                  : 'bg-white hover:bg-amber-100 font-medium'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-slate-900" />
                <span className="font-bangers text-sm">Current Page Only</span>
              </div>
              <p className="text-[11px] text-slate-700 font-comic">
                Prints Page {currentPageIndex + 1} with comic art &amp; narrative caption.
              </p>
            </button>

            <button
              id="select-print-all-btn"
              type="button"
              onClick={() => setPrintMode('all')}
              className={`p-3 rounded-xl border-3 border-black text-left transition-all shadow-[3px_3px_0px_#000] ${
                printMode === 'all'
                  ? 'bg-yellow-300 font-bold'
                  : 'bg-white hover:bg-amber-100 font-medium'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Book className="w-4 h-4 text-slate-900" />
                <span className="font-bangers text-sm">All {story.pages.length} Pages</span>
              </div>
              <p className="text-[11px] text-slate-700 font-comic">
                Prints entire physical comic book with cover and page breaks.
              </p>
            </button>
          </div>
        </div>

        {/* Coloring Book Mode Toggle */}
        <div className="bg-purple-100 border-3 border-black rounded-xl p-3.5 mb-5 shadow-[3px_3px_0px_#000]">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              id="coloring-book-checkbox"
              type="checkbox"
              checked={coloringBook}
              onChange={(e) => setColoringBook(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-black text-purple-600 focus:ring-0 accent-purple-600 cursor-pointer"
            />
            <div>
              <div className="flex items-center gap-1.5 font-bangers text-sm text-purple-950">
                <Palette className="w-4 h-4 text-purple-700" />
                <span>Coloring Book Mode (Black &amp; White Lineart)</span>
              </div>
              <p className="text-[11px] text-purple-900 font-comic">
                Converts colored illustrations into high-contrast line pages so kids can color them with pencils &amp; crayons!
              </p>
            </div>
          </label>
        </div>

        {/* Print Note */}
        <div className="bg-amber-100 border-2 border-black rounded-xl p-2.5 mb-5 flex items-center gap-2 text-xs font-comic text-amber-950">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            Non-essential elements (navigation bars, buttons, chatbot, audio controls) are automatically hidden for a clean paper print.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t-2 border-black/20">
          <button
            id="cancel-print-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border-2 border-black font-bold text-xs text-slate-800 hover:bg-amber-100 shadow-[2px_2px_0px_#000]"
          >
            Cancel
          </button>

          <button
            id="confirm-print-action-btn"
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bangers text-base tracking-wider border-3 border-black shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <Printer className="w-5 h-5" />
            <span>Print Now!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
