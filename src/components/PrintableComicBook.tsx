import React from 'react';
import { Story, CustomProtagonist } from '../types';

interface Props {
  story: Story;
  currentProtagonist: CustomProtagonist | null;
  printMode: 'all' | 'current';
  currentPageIndex: number;
  coloringBookMode: boolean;
}

export const PrintableComicBook: React.FC<Props> = ({
  story,
  currentProtagonist,
  printMode,
  currentPageIndex,
  coloringBookMode,
}) => {
  const pagesToPrint =
    printMode === 'current'
      ? [story.pages[currentPageIndex]]
      : story.pages;

  return (
    <div id="printable-comic-book" className="hidden print:block w-full text-black bg-white p-4">
      {/* Cover / Header Banner */}
      <div className="comic-print-page border-4 border-black p-6 mb-8 text-center bg-yellow-50 rounded-2xl">
        <div className="inline-block bg-red-600 text-white font-bangers text-sm px-3 py-1 border-2 border-black tracking-wider uppercase mb-2">
          Vanalipi Comic Series
        </div>
        <h1 className="text-4xl font-black font-bangers uppercase tracking-wide mb-2 text-black">
          {story.title}
        </h1>
        <p className="text-sm font-comic italic text-gray-800 max-w-xl mx-auto mb-4">
          "{story.summary}"
        </p>

        <div className="flex justify-center items-center gap-4 text-xs font-bold font-comic">
          <span className="border-2 border-black px-3 py-1 bg-white rounded-md">
            Target Readers: {story.targetAge}
          </span>
          <span className="border-2 border-black px-3 py-1 bg-white rounded-md">
            Style: {story.artStyle}
          </span>
          {currentProtagonist && (
            <span className="border-2 border-black px-3 py-1 bg-amber-100 rounded-md">
              Starring Hero: {currentProtagonist.name}
            </span>
          )}
        </div>

        {coloringBookMode && (
          <div className="mt-4 inline-block bg-purple-100 border-2 border-black px-3 py-1 rounded-full text-xs font-bold">
            🎨 Color-Me-In Edition (Grab your crayons &amp; markers!)
          </div>
        )}
      </div>

      {/* Pages */}
      {pagesToPrint.map((page, idx) => {
        const actualPageNum = page.pageNumber || idx + 1;

        return (
          <div
            key={actualPageNum}
            className="comic-print-page border-4 border-black p-6 rounded-2xl bg-white mb-8"
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
          >
            {/* Top Comic Bar */}
            <div className="flex justify-between items-center pb-3 mb-4 border-b-3 border-black">
              <span className="font-bangers text-xl tracking-wider text-black">
                PANEL {actualPageNum} OF {story.pages.length}
              </span>
              <span className="font-comic font-bold text-xs bg-yellow-300 border-2 border-black px-2.5 py-0.5 rounded-md">
                PAGE {actualPageNum}
              </span>
            </div>

            {/* Comic Grid: 2 Panels Side-by-Side (or stacked) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Illustration Panel */}
              <div className="border-3 border-black rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center min-h-[300px]">
                {page.imageUrl ? (
                  <img
                    src={page.imageUrl}
                    alt={`Illustration panel for page ${actualPageNum}`}
                    referrerPolicy="no-referrer"
                    className={`w-full h-auto object-cover ${
                      coloringBookMode ? 'filter grayscale contrast-150 brightness-110' : ''
                    }`}
                  />
                ) : (
                  <div className="p-8 text-center text-gray-500 font-comic">
                    <p className="font-bold text-base mb-1">[ Story Illustration Panel ]</p>
                    <p className="text-xs italic">{page.illustrationPrompt}</p>
                  </div>
                )}
              </div>

              {/* Story Narrative & Speech Bubble Panel */}
              <div className="flex flex-col justify-between h-full space-y-4">
                {/* Yellow Comic Caption Box */}
                <div className="bg-yellow-200 border-3 border-black p-3.5 rounded-xl shadow-[3px_3px_0px_#000]">
                  <span className="font-bangers text-xs tracking-wider uppercase text-yellow-900 block mb-1">
                    ★ NARRATOR'S DISPATCH
                  </span>
                  <p className="text-xs font-comic font-bold text-black">
                    Scene: {page.illustrationPrompt.slice(0, 110)}...
                  </p>
                </div>

                {/* Main Comic Speech Balloon */}
                <div className="relative bg-white border-3 border-black p-5 rounded-2xl shadow-[4px_4px_0px_#000]">
                  <div className="font-comic text-base font-bold text-black leading-relaxed tracking-wide">
                    {page.text}
                  </div>
                </div>

                {/* Interactive Tappable Elements Listed for coloring/finding */}
                {page.interactiveElements && page.interactiveElements.length > 0 && (
                  <div className="bg-amber-50 border-2 border-black p-3 rounded-xl">
                    <span className="font-bangers text-xs tracking-wider text-amber-900 block mb-1">
                      🔍 CAN YOU SPOT THESE IN THE ARTWORK?
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs font-comic font-bold">
                      {page.interactiveElements.map((elem) => (
                        <span
                          key={elem.id}
                          className="bg-white border border-black px-2 py-0.5 rounded-md flex items-center gap-1"
                        >
                          <span>{elem.icon}</span>
                          <span>{elem.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Page Footer */}
                <div className="text-right text-[10px] font-comic font-bold text-gray-600">
                  {story.title} • Page {actualPageNum}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
