import React from 'react';
import { BookOpen, Sparkles, Wand2, User, Share2, Printer } from 'lucide-react';
import { VoiceName, CustomProtagonist } from '../types';
import { CharacterAvatar } from './CharacterAvatar';

interface Props {
  onOpenLibrary: () => void;
  onOpenCreateStory: () => void;
  onOpenCompanionChat: () => void;
  onOpenCharacterCreator: () => void;
  onOpenShareStory: () => void;
  onOpenPrintStory: () => void;
  storyTitle: string;
  selectedVoice: VoiceName;
  currentProtagonist: CustomProtagonist | null;
}

export const Navbar: React.FC<Props> = ({
  onOpenLibrary,
  onOpenCreateStory,
  onOpenCompanionChat,
  onOpenCharacterCreator,
  onOpenShareStory,
  onOpenPrintStory,
  storyTitle,
  selectedVoice,
  currentProtagonist,
}) => {
  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-40 bg-yellow-100/95 backdrop-blur-md border-b-4 border-black shadow-[0_4px_0px_#000]"
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Comic Brand / Title */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500 border-2 border-black text-white flex items-center justify-center shadow-[2px_2px_0px_#000] shrink-0">
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 font-bangers tracking-wider leading-none">
                WONDERTALES
              </h1>
              <span className="bg-yellow-400 border border-black px-1.5 py-0.2 text-[10px] font-bangers uppercase tracking-wider rounded-sm hidden xs:inline">
                COMICS
              </span>
            </div>
            <p className="text-[11px] font-comic font-bold text-amber-950 hidden sm:block">
              Kids Comic Books, Read-Aloud &amp; Hero Studio
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Character Creator Button */}
          <button
            id="nav-character-creator-btn"
            onClick={onOpenCharacterCreator}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-slate-950 border-2 border-black font-bold text-xs shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="Create or customize your story protagonist"
          >
            {currentProtagonist ? (
              <div className="w-5 h-5 rounded-full overflow-hidden border border-black shrink-0 bg-white">
                <CharacterAvatar character={currentProtagonist} size="sm" showBadge={false} />
              </div>
            ) : (
              <User className="w-3.5 h-3.5 text-black" />
            )}
            <span className="hidden md:inline font-comic font-bold">
              {currentProtagonist ? `Hero: ${currentProtagonist.name}` : 'Hero Studio'}
            </span>
            <span className="md:hidden font-comic font-bold">Hero</span>
          </button>

          {/* Share Story Button */}
          <button
            id="nav-share-story-btn"
            onClick={onOpenShareStory}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-yellow-300 hover:bg-yellow-400 text-slate-950 border-2 border-black font-bold text-xs shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="Share story via link with serialized data"
          >
            <Share2 className="w-3.5 h-3.5 text-black" />
            <span className="hidden lg:inline font-comic font-bold">Share</span>
          </button>

          {/* Print Comic Button */}
          <button
            id="nav-print-story-btn"
            onClick={onOpenPrintStory}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-slate-950 border-2 border-black font-bold text-xs shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="Print comic page or full comic book"
          >
            <Printer className="w-3.5 h-3.5 text-black" />
            <span className="hidden lg:inline font-comic font-bold">Print</span>
          </button>

          {/* Bookshelf Library Button */}
          <button
            id="nav-library-btn"
            onClick={onOpenLibrary}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-slate-950 border-2 border-black font-bold text-xs shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-black" />
            <span className="hidden sm:inline font-comic font-bold">Bookshelf</span>
          </button>

          {/* New Story Maker Button */}
          <button
            id="nav-create-story-btn"
            onClick={onOpenCreateStory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bangers text-sm tracking-wide border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Weave Story</span>
          </button>

          {/* Story Companion Drawer Trigger */}
          <button
            id="nav-companion-btn"
            onClick={onOpenCompanionChat}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-200 hover:bg-purple-300 text-slate-950 border-2 border-black font-bold text-xs shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <span className="text-sm" role="img" aria-label="owl">
              🦉
            </span>
            <span className="hidden sm:inline font-comic font-bold">Buddies</span>
          </button>
        </div>
      </div>
    </header>
  );
};
