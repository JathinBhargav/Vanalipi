import React from 'react';
import { BookOpen, Sparkles, Wand2, User, Share2, Printer, Home, Compass } from 'lucide-react';
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
  onGoHome?: () => void;
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
  onGoHome,
}) => {
  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-40 bg-[#fefce8]/95 backdrop-blur-md border-b-4 border-black shadow-[0_4px_0px_#000]"
    >
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 flex items-center justify-between gap-2">
        {/* Comic Brand Logo Badge (Matching reference image: Curved orange/yellow pill with bubbly 3D Vanalipi) */}
        <div 
          onClick={onGoHome}
          className="flex items-center cursor-pointer select-none group active:scale-95 transition-transform"
          title="Vanalipi Tales - Home"
        >
          <div className="relative bg-gradient-to-r from-[#fb923c] via-[#f59e0b] to-[#fde047] border-3 border-black rounded-full px-3.5 py-1 sm:px-4 sm:py-1.5 shadow-[3px_3px_0px_#000] flex items-center gap-2">
            <span className="text-xl sm:text-2xl drop-shadow-[1px_1px_0px_#000]">📖</span>
            <div className="flex flex-col leading-none">
              <div className="flex items-baseline gap-1">
                <span className="font-bangers text-2xl sm:text-3xl tracking-wide text-[#1e3a8a] drop-shadow-[2px_2px_0px_#fde047] filter" style={{ WebkitTextStroke: '1px #000' }}>
                  Vanalipi
                </span>
                <span className="font-bangers text-xs sm:text-sm text-[#fef08a] bg-[#1e293b] px-1.5 py-0.2 rounded border border-black shadow-[1px_1px_0px_#000]">
                  TALES
                </span>
              </div>
              <span className="text-[9px] font-bangers text-amber-950 tracking-wider hidden sm:block">
                KIDS DIGITAL COMIC BOOKS
              </span>
            </div>
          </div>
        </div>

        {/* Right Navigation & Profile Pills (Matching reference image) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Home Button */}
          <button
            id="nav-home-btn"
            onClick={onGoHome}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#e0f2fe] hover:bg-[#bae6fd] text-sky-950 border-2 border-black font-bangers text-xs sm:text-sm shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <Home className="w-3.5 h-3.5 text-sky-700" />
            <span className="hidden xs:inline">Home</span>
          </button>

          {/* My Library Button */}
          <button
            id="nav-library-btn"
            onClick={onOpenLibrary}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#e0f2fe] hover:bg-[#bae6fd] text-sky-950 border-2 border-black font-bangers text-xs sm:text-sm shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-700" />
            <span>My Library</span>
          </button>

          {/* @KharostikaKid User Pill */}
          <button
            id="nav-user-profile-btn"
            onClick={onOpenCharacterCreator}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#e0f2fe] hover:bg-[#bae6fd] text-sky-950 border-2 border-black font-bangers text-xs sm:text-sm shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="Active Explorer Profile: @KharostikaKid"
          >
            <div className="w-5 h-5 rounded-full bg-amber-400 border border-black flex items-center justify-center text-xs overflow-hidden shrink-0">
              {currentProtagonist ? (
                <CharacterAvatar character={currentProtagonist} size="sm" showBadge={false} />
              ) : (
                <span>👧</span>
              )}
            </div>
            <span className="hidden sm:inline font-bold">@KharostikaKid</span>
          </button>

          {/* New Story Weave Button */}
          <button
            id="nav-create-story-btn"
            onClick={onOpenCreateStory}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#fb923c] hover:bg-[#f97316] text-white font-bangers text-xs sm:text-sm border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="Create a new AI-powered comic adventure"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Weave</span>
          </button>

          {/* Companions Drawer Trigger */}
          <button
            id="nav-companion-btn"
            onClick={onOpenCompanionChat}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-full bg-[#fed7aa] hover:bg-[#fdba74] text-black font-bangers text-xs border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="Talk to Story Companion Buddies"
          >
            <span className="text-sm">🦉</span>
            <span className="hidden lg:inline">Buddies</span>
          </button>
        </div>
      </div>
    </header>
  );
};
