import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Volume1,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Palette,
  Maximize2,
  Minimize2,
  MessageCircle,
  Loader2,
  Mic,
  Trash2,
  User,
  Music,
  Check,
  Eye,
  EyeOff,
  Edit3,
  Share2,
  Printer,
  BookOpen,
  Zap,
} from 'lucide-react';
import { Story, VoiceName, CustomProtagonist, InteractiveElement } from '../types';
import { VOICE_OPTIONS } from '../data/constants';
import { playInteractiveSound, playComicPageTurnSound } from '../utils/audioEffects';
import { VoiceRecorderModal } from './VoiceRecorderModal';
import { CharacterAvatar } from './CharacterAvatar';
import { VanalipiComicSpread } from './VanalipiComicSpread';
import { GandharaTriviaModal } from './GandharaTriviaModal';

interface Props {
  story: Story;
  currentPageIndex: number;
  onPageChange: (index: number) => void;
  selectedVoice: VoiceName;
  onVoiceChange: (voice: VoiceName) => void;
  onOpenIllustrationModal: () => void;
  onOpenCompanionChat: () => void;
  onGenerateAudioForPage: (pageIndex: number, voice: VoiceName, style?: string) => Promise<string | undefined>;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onSavePageRecording: (pageIndex: number, audioUrl: string, duration: number) => void;
  onDeletePageRecording: (pageIndex: number) => void;
  currentProtagonist: CustomProtagonist | null;
  onOpenCharacterCreator: () => void;
  onOpenShareStory?: () => void;
  onOpenPrintStory?: () => void;
}

// Comic action sound stickers available across panels
const COMIC_ACTION_STICKERS = [
  { text: 'POW!', sound: 'boing', color: 'bg-red-500 text-yellow-300' },
  { text: 'WHOOSH!', sound: 'flutter', color: 'bg-cyan-500 text-white' },
  { text: 'ZAP!', sound: 'twinkle', color: 'bg-yellow-400 text-black' },
  { text: 'GIGGLE!', sound: 'giggle', color: 'bg-pink-500 text-white' },
  { text: 'CHIRP!', sound: 'chirp', color: 'bg-emerald-500 text-white' },
];

export const StoryReader: React.FC<Props> = ({
  story,
  currentPageIndex,
  onPageChange,
  selectedVoice,
  onVoiceChange,
  onOpenIllustrationModal,
  onOpenCompanionChat,
  onGenerateAudioForPage,
  fontSize,
  onFontSizeChange,
  onSavePageRecording,
  onDeletePageRecording,
  currentProtagonist,
  onOpenCharacterCreator,
  onOpenShareStory,
  onOpenPrintStory,
}) => {
  const page = story.pages[currentPageIndex];
  const totalPages = story.pages.length;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [narrationStyle, setNarrationStyle] = useState<'cheerful' | 'calm' | 'energetic'>('cheerful');
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);

  // Comic mode vs classic book mode (default is comic book mode!)
  const [isComicMode, setIsComicMode] = useState(true);

  // Dynamic Neo-Pop Multi-Panel Comic Spread View (matching reference image)
  const [isSpreadMode, setIsSpreadMode] = useState(story.id === 'vanalipi-lipisutra');
  const [isTriviaOpen, setIsTriviaOpen] = useState(false);

  // Sync spread mode when story changes
  useEffect(() => {
    setIsSpreadMode(story.id === 'vanalipi-lipisutra');
  }, [story.id]);

  // Authentic Comic Book 3D Page Flip State
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const [flipFromIndex, setFlipFromIndex] = useState(currentPageIndex);
  const [flipTargetIndex, setFlipTargetIndex] = useState(currentPageIndex);
  const flipTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio source selection: 'ai' | 'user'
  const [activeAudioSource, setActiveAudioSource] = useState<'ai' | 'user'>('ai');

  // Voice recording modal state
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);

  // Interactive hotspots visibility & effect feedback
  const [showHotspots, setShowHotspots] = useState(true);
  const [activeElementEffect, setActiveElementEffect] = useState<{
    id: string;
    label: string;
    icon: string;
    soundDescription: string;
  } | null>(null);
  const [animatingElementId, setAnimatingElementId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Automatically select 'user' audio if page already has a recording and we switch pages
  useEffect(() => {
    if (page?.userRecordingUrl) {
      setActiveAudioSource('user');
    } else {
      setActiveAudioSource('ai');
    }
  }, [currentPageIndex, page?.userRecordingUrl]);

  // Stop audio when changing page
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setAudioProgress(0);
      setCurrentTime(0);
    }
  }, [currentPageIndex, story.id]);

  /**
   * Authentic Physical Comic Book 3D Page Turn
   * Peels the page leaf across the center saddle-stitch spine with tactile paper rustle audio!
   */
  const handlePageTurn = (targetIndex: number, direction: 'next' | 'prev') => {
    if (isFlipping) return;
    if (targetIndex < 0 || targetIndex >= totalPages || targetIndex === currentPageIndex) return;

    // Clear previous timer
    if (flipTimerRef.current) clearTimeout(flipTimerRef.current);

    // Stop currently playing voice narration
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    // Play tactile physical comic book paper turn sound (friction whoosh + snap)
    playComicPageTurnSound();

    setIsFlipping(true);
    setFlipDirection(direction);
    setFlipFromIndex(currentPageIndex);
    setFlipTargetIndex(targetIndex);

    // Complete the 3D page flip after the leaf crosses the spine (680ms)
    flipTimerRef.current = setTimeout(() => {
      onPageChange(targetIndex);
      setIsFlipping(false);
    }, 680);
  };

  // Keyboard navigation with 3D flip effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' && currentPageIndex < totalPages - 1) {
        handlePageTurn(currentPageIndex + 1, 'next');
      } else if (e.key === 'ArrowLeft' && currentPageIndex > 0) {
        handlePageTurn(currentPageIndex - 1, 'prev');
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        togglePlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageIndex, totalPages, page?.audioUrl, page?.userRecordingUrl, activeAudioSource]);

  const togglePlayPause = async () => {
    if (!page) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    // Play User Voice Recording
    if (activeAudioSource === 'user') {
      if (page.userRecordingUrl) {
        playAudioFromUrl(page.userRecordingUrl);
      } else {
        // Open recorder modal if no user recording yet
        setIsRecorderOpen(true);
      }
      return;
    }

    // Play AI Narration
    if (page.audioUrl) {
      playAudioFromUrl(page.audioUrl);
      return;
    }

    // Otherwise generate TTS with Gemini
    setIsLoadingAudio(true);
    try {
      const url = await onGenerateAudioForPage(currentPageIndex, selectedVoice, narrationStyle);
      if (url) {
        playAudioFromUrl(url);
      }
    } catch (err) {
      console.error('TTS error:', err);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const playAudioFromUrl = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      setAudioDuration(audio.duration || 0);
    };

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setCurrentTime(audio.currentTime);
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
      setAudioProgress(0);
      setCurrentTime(0);
    };

    audio.onerror = (e) => {
      console.error('Audio playback error:', e);
      setIsPlaying(false);
    };

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.warn('Playback error or blocked by browser policy:', err);
        setIsPlaying(false);
      });
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercent = parseFloat(e.target.value);
    setAudioProgress(newPercent);
    if (audioRef.current && audioDuration) {
      audioRef.current.currentTime = (newPercent / 100) * audioDuration;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  /**
   * Handle tapping an interactive element or character
   */
  const handleTapInteractiveElement = (elem: InteractiveElement) => {
    playInteractiveSound(elem.soundType);

    setAnimatingElementId(elem.id);
    setTimeout(() => {
      setAnimatingElementId((curr) => (curr === elem.id ? null : curr));
    }, 700);

    setActiveElementEffect({
      id: elem.id,
      label: elem.label,
      icon: elem.icon || '✨',
      soundDescription: elem.soundDescription || 'Tapped!',
    });

    setTimeout(() => {
      setActiveElementEffect((curr) => (curr?.id === elem.id ? null : curr));
    }, 2400);
  };

  /**
   * Handle tapping a comic sound decal
   */
  const handleTapComicSticker = (sound: string, text: string) => {
    playInteractiveSound(sound as any);
    setActiveElementEffect({
      id: `sticker-${text}`,
      label: 'Comic Sound FX',
      icon: '💥',
      soundDescription: text,
    });
    setTimeout(() => {
      setActiveElementEffect((curr) => (curr?.id === `sticker-${text}` ? null : curr));
    }, 2000);
  };

  if (!page) return null;

  // Fallback interactive elements if none declared
  const interactiveItems: InteractiveElement[] =
    page.interactiveElements && page.interactiveElements.length > 0
      ? page.interactiveElements
      : [
          {
            id: 'default-character',
            label: 'Story Hero',
            icon: '✨',
            x: 50,
            y: 55,
            soundType: 'giggle',
            animation: 'bounce',
            soundDescription: 'Happy giggle!',
          },
          {
            id: 'default-star',
            label: 'Shining Star',
            icon: '⭐',
            x: 75,
            y: 20,
            soundType: 'twinkle',
            animation: 'sparkle',
            soundDescription: 'Twinkle chime!',
          },
          {
            id: 'default-flower',
            label: 'Gentle Blossom',
            icon: '🌸',
            x: 25,
            y: 70,
            soundType: 'wiggle',
            animation: 'wiggle',
            soundDescription: 'Wiggle bloom!',
          },
        ];

  // Dynamic page allocation for open physical comic book spread & in-flight 3D flips
  const leftPageIdx = Math.max(
    0,
    Math.min(totalPages - 1, isFlipping && flipDirection === 'prev' ? flipTargetIndex : currentPageIndex)
  );
  const rightPageIdx = Math.max(
    0,
    Math.min(totalPages - 1, isFlipping && flipDirection === 'next' ? flipTargetIndex : currentPageIndex)
  );
  const leftDisplayPage = story.pages[leftPageIdx] || page;
  const rightDisplayPage = story.pages[rightPageIdx] || page;

  return (
    <div id="story-reader-container" className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-3 sm:py-5">
      {/* Top Comic Bar: Category, Story Title, Protagonist & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3 px-1 sm:px-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bangers text-xs uppercase tracking-wider text-black bg-yellow-400 border-2 border-black px-2.5 py-0.5 rounded-md shadow-[2px_2px_0px_#000]">
            {story.category}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-bangers tracking-wide leading-tight">
            {story.title}
          </h2>
        </div>

        {/* Action Controls: Neo-Pop Spread, Trivia, Share, Print, Comic Mode Toggle, Hero Badge, Text Size */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle: Neo-Pop Spread (reference image) vs Studio Book */}
          <div className="flex items-center bg-amber-200 border-2 border-black p-0.5 rounded-xl shadow-[2px_2px_0px_#000]">
            <button
              id="view-mode-spread-btn"
              type="button"
              onClick={() => setIsSpreadMode(true)}
              className={`px-2.5 py-1 rounded-lg font-bangers text-xs transition-all flex items-center gap-1 border ${
                isSpreadMode
                  ? 'bg-[#fb923c] text-white border-black shadow-[1px_1px_0px_#000]'
                  : 'bg-transparent text-black border-transparent hover:bg-amber-300'
              }`}
              title="Neo-Pop Irregular Comic Grid Layout as in Reference Image"
            >
              <span>🎨 NEO-POP SPREAD</span>
            </button>
            <button
              id="view-mode-studio-btn"
              type="button"
              onClick={() => setIsSpreadMode(false)}
              className={`px-2.5 py-1 rounded-lg font-bangers text-xs transition-all flex items-center gap-1 border ${
                !isSpreadMode
                  ? 'bg-[#fb923c] text-white border-black shadow-[1px_1px_0px_#000]'
                  : 'bg-transparent text-black border-transparent hover:bg-amber-300'
              }`}
              title="Studio Book 3D Turning Page Mode"
            >
              <span>📖 STUDIO BOOK</span>
            </button>
          </div>

          {/* Gandhara Lore Trivia Vault Trigger */}
          <button
            id="reader-trivia-btn"
            type="button"
            onClick={() => setIsTriviaOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#fde047] hover:bg-[#facc15] text-black border-2 border-black text-xs font-bangers tracking-wide shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="Open Gandhara & Lipisutra Ancient Trivia & Glyph Decoder"
          >
            <span className="text-sm">🏺</span>
            <span>LORE VAULT</span>
          </button>

          {/* Comic Book Mode Toggle (for studio book) */}
          {!isSpreadMode && (
            <button
              id="toggle-comic-mode-btn"
              type="button"
              onClick={() => setIsComicMode(!isComicMode)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 border-black text-xs font-bold font-comic shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all ${
                isComicMode
                  ? 'bg-yellow-300 text-slate-950'
                  : 'bg-white text-slate-700 hover:bg-yellow-100'
              }`}
              title="Toggle between Comic Book layout and Classic Picture Book layout"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>{isComicMode ? 'Comic: ON' : 'Comic: OFF'}</span>
            </button>
          )}

          {/* Share Story Button */}
          {onOpenShareStory && (
            <button
              id="reader-share-story-btn"
              type="button"
              onClick={onOpenShareStory}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-slate-950 border-2 border-black text-xs font-bold font-comic shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              title="Share story via link with serialized hash data"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden sm:inline">Share</span>
            </button>
          )}

          {/* Print Story Button */}
          {onOpenPrintStory && (
            <button
              id="reader-print-story-btn"
              type="button"
              onClick={onOpenPrintStory}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white hover:bg-amber-100 text-slate-950 border-2 border-black text-xs font-bold font-comic shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              title="Print comic page or full comic book"
            >
              <Printer className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden sm:inline">Print</span>
            </button>
          )}

          {/* Active Protagonist Badge */}
          {currentProtagonist ? (
            <button
              id="active-protagonist-badge"
              onClick={onOpenCharacterCreator}
              className="flex items-center gap-1.5 bg-amber-200 hover:bg-amber-300 border-2 border-black rounded-xl px-2.5 py-1 shadow-[2px_2px_0px_#000] transition-all group"
              title="Customize hero protagonist"
            >
              <div className="w-5 h-5 rounded-full overflow-hidden border border-black shrink-0 bg-white">
                <CharacterAvatar character={currentProtagonist} size="sm" showBadge={false} />
              </div>
              <span className="text-xs font-bold font-comic text-slate-950">
                Hero: {currentProtagonist.name}
              </span>
              <Edit3 className="w-3 h-3 text-amber-700" />
            </button>
          ) : (
            <button
              id="create-protagonist-pill-btn"
              onClick={onOpenCharacterCreator}
              className="flex items-center gap-1.5 bg-white hover:bg-amber-100 border-2 border-black rounded-xl px-2.5 py-1 shadow-[2px_2px_0px_#000] text-xs font-bold font-comic text-slate-900 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-amber-700" />
              <span>Hero Studio</span>
            </button>
          )}

          {/* Text Size Control */}
          <div className="flex items-center gap-1 bg-white border-2 border-black rounded-xl px-2 py-0.5 shadow-[2px_2px_0px_#000]">
            <span className="text-[10px] font-bold font-bangers uppercase text-slate-600">Text</span>
            <button
              id="decrease-font-btn"
              onClick={() => onFontSizeChange(Math.max(16, fontSize - 2))}
              title="Make text smaller"
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-amber-200 text-black text-xs font-black"
            >
              -
            </button>
            <span className="text-xs font-mono font-bold text-slate-800">{fontSize}</span>
            <button
              id="increase-font-btn"
              onClick={() => onFontSizeChange(Math.min(28, fontSize + 2))}
              title="Make text larger"
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-amber-200 text-black text-xs font-black"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* AUTHENTIC OPEN COMIC BOOK STAGE & 3D PAGE-TURNING SPREAD                  */}
      {/* ========================================================================= */}
      {isSpreadMode ? (
        <div className="w-full py-2">
          <VanalipiComicSpread
            onOpenTrivia={() => setIsTriviaOpen(true)}
            onOpenIllustrationModal={onOpenIllustrationModal}
            onOpenShareStory={onOpenShareStory}
          />
        </div>
      ) : (
        <div className="comic-book-perspective w-full py-2">
        {/* Comic Studio Drafting Mat / Ambient Desk Surround */}
        <div className="relative p-1 sm:p-3 bg-gradient-to-b from-amber-950/20 via-amber-900/10 to-amber-950/25 rounded-3xl">
          
          {/* Stacked Paper Edges (Visualizing Physical Book Thickness Underneath) */}
          <div 
            className="absolute -left-1 sm:-left-2 top-3 bottom-3 w-2 sm:w-2.5 rounded-l-md comic-paper-stack-left hidden sm:block pointer-events-none transition-all duration-500 z-10"
            style={{ opacity: Math.min(1, 0.45 + (currentPageIndex / Math.max(1, totalPages - 1)) * 0.55) }}
            title={`Pages Read: ${currentPageIndex + 1}`}
          />
          <div 
            className="absolute -right-1 sm:-right-2 top-3 bottom-3 w-2 sm:w-2.5 rounded-r-md comic-paper-stack-right hidden sm:block pointer-events-none transition-all duration-500 z-10"
            style={{ opacity: Math.min(1, 0.45 + ((totalPages - 1 - currentPageIndex) / Math.max(1, totalPages - 1)) * 0.55) }}
            title={`Pages Remaining: ${totalPages - currentPageIndex}`}
          />

          {/* THE PHYSICAL OPEN COMIC BOOK SPREAD */}
          <div
            id="storybook-comic-book"
            className="comic-book-spread relative rounded-2xl overflow-hidden border-4 border-black shadow-[8px_8px_0px_#000] min-h-[580px] flex flex-col lg:flex-row bg-[#faf6eb]"
          >
            {/* ------------------------------------------------------------- */}
            {/* LEFT PAGE: Comic Panel Artwork, Masthead & Interactive Hotspots */}
            {/* ------------------------------------------------------------- */}
            <div
              id="page-illustration-panel"
              className="relative flex-1 p-4 sm:p-5 flex flex-col justify-between border-b-4 lg:border-b-0 border-black bg-[#faf6eb] comic-newsprint-texture select-none"
            >
              {/* Vintage Comic Masthead Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-black/15">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="bg-red-600 text-white font-bangers text-xs px-2 py-0.5 rounded border border-black tracking-wider shadow-[1px_1px_0px_#000]">
                    PANEL {leftDisplayPage.pageNumber}
                  </span>
                  <span className="text-[11px] font-bangers tracking-wider text-slate-800 uppercase hidden sm:inline">
                    ★ VANALIPI COMICS • 25¢ ★
                  </span>
                </div>

                {/* Vintage Comics Code Authority Seal */}
                <div className="flex items-center gap-1 bg-white border-2 border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_#000] text-[9px] font-bangers text-black uppercase tracking-tight">
                  <span className="text-red-600 font-black">★</span>
                  <span>COMICS CODE APPROVED</span>
                </div>
              </div>

            {/* Artwork Frame with Comic Outlines & Interactive Hotspots */}
            <div
              className={`relative w-full aspect-4/3 rounded-2xl overflow-hidden shadow-md bg-amber-200/50 group select-none ${
                isComicMode ? 'border-3 border-black shadow-[4px_4px_0px_#000]' : 'border border-amber-300'
              }`}
            >
              {leftDisplayPage.imageUrl ? (
                <img
                  src={leftDisplayPage.imageUrl}
                  alt={`Comic panel illustration for page ${leftDisplayPage.pageNumber}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-amber-900">
                  <Palette className="w-12 h-12 text-amber-500 mb-2 animate-bounce" />
                  <p className="font-black text-lg font-bangers tracking-wide">
                    READY FOR YOUR COMIC ART!
                  </p>
                  <p className="text-xs font-comic font-bold text-amber-800 max-w-xs mt-1">
                    Click "Paint Comic Art" below to synthesize vibrant illustrations with Gemini 3 Pro!
                  </p>
                </div>
              )}

              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 z-20">
                <span className="text-[11px] font-bangers tracking-wider bg-black text-yellow-300 px-2.5 py-0.5 rounded-md border border-yellow-300 flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  GEMINI 3 PRO ({leftDisplayPage.imageSize || '1K'})
                </span>
              </div>

              {/* Hotspots Toggle & Fullscreen Buttons */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                <button
                  id="toggle-hotspots-btn"
                  onClick={() => setShowHotspots(!showHotspots)}
                  className={`p-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-bangers tracking-wide flex items-center gap-1 border border-black shadow-md transition-all ${
                    showHotspots
                      ? 'bg-yellow-400 text-black font-bold'
                      : 'bg-black text-white hover:bg-slate-800'
                  }`}
                  title="Toggle interactive sound effects"
                >
                  {showHotspots ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">SOUNDS {showHotspots ? 'ON' : 'OFF'}</span>
                </button>

                {page.imageUrl && (
                  <button
                    id="fullscreen-img-btn"
                    onClick={() => setIsImageFullscreen(!isImageFullscreen)}
                    className="p-1.5 rounded-full bg-black hover:bg-slate-800 text-white border border-white/40 shadow-md transition-all"
                    title="Toggle Fullscreen"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Comic Action FX stickers positioned over artwork */}
              {isComicMode && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 z-20">
                  <button
                    type="button"
                    onClick={() => handleTapComicSticker('boing', 'POW!')}
                    className="comic-burst bg-red-600 hover:bg-red-500 text-yellow-300 font-bangers text-[11px] px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] rotate-6 hover:rotate-12 transition-transform cursor-pointer"
                    title="Tap for comic POW sound!"
                  >
                    POW!
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTapComicSticker('flutter', 'WHOOSH!')}
                    className="comic-burst bg-cyan-500 hover:bg-cyan-400 text-white font-bangers text-[11px] px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] -rotate-6 hover:-rotate-12 transition-transform cursor-pointer"
                    title="Tap for comic WHOOSH sound!"
                  >
                    WHOOSH!
                  </button>
                </div>
              )}

              {/* ========================================================================= */}
              {/* INTERACTIVE HOTSPOTS OVERLAY                                              */}
              {/* ========================================================================= */}
              {showHotspots && (
                <div className="absolute inset-0 pointer-events-none z-10">
                  {interactiveItems.map((elem) => {
                    const isCurrentAnimating = animatingElementId === elem.id;

                    let animClass = '';
                    if (elem.animation === 'bounce') animClass = isCurrentAnimating ? 'scale-130 -translate-y-3' : 'hover:scale-115 animate-bounce';
                    else if (elem.animation === 'wiggle') animClass = isCurrentAnimating ? 'rotate-18 scale-125' : 'hover:scale-115';
                    else if (elem.animation === 'pulse') animClass = isCurrentAnimating ? 'scale-135' : 'hover:scale-115 animate-pulse';
                    else if (elem.animation === 'sparkle') animClass = isCurrentAnimating ? 'scale-130 rotate-45' : 'hover:scale-115';
                    else animClass = isCurrentAnimating ? 'scale-125 -translate-y-2' : 'hover:scale-115';

                    return (
                      <button
                        key={elem.id}
                        id={`interactive-hotspot-${elem.id}`}
                        type="button"
                        onClick={() => handleTapInteractiveElement(elem)}
                        style={{ left: `${elem.x}%`, top: `${elem.y}%` }}
                        className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-full cursor-pointer transition-all duration-300 group/spot focus:outline-none ${animClass}`}
                        title={`Tap to interact with ${elem.label}!`}
                      >
                        {/* Radiating pulse ring */}
                        <span className="absolute inset-0 rounded-full bg-yellow-400/50 animate-ping opacity-60" />

                        {/* Main body with comic border */}
                        <span className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border-2 border-black text-lg sm:text-xl shadow-[3px_3px_0px_#000] group-hover/spot:bg-yellow-200 transition-colors">
                          {elem.icon}
                        </span>

                        {/* Tooltip Label */}
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-black text-yellow-300 font-bangers text-[10px] whitespace-nowrap opacity-0 group-hover/spot:opacity-100 transition-opacity pointer-events-none shadow-md border border-yellow-300">
                          {elem.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Active Sound Feedback Bubble (pops up on tap) */}
              {activeElementEffect && (
                <div
                  id="sound-effect-toast"
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-black text-yellow-300 border-2 border-yellow-400 rounded-full px-4 py-1.5 shadow-[4px_4px_0px_#000] flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200"
                >
                  <span className="text-base">{activeElementEffect.icon}</span>
                  <span className="text-xs font-bangers text-white">{activeElementEffect.label}:</span>
                  <span className="text-xs font-bold font-comic italic text-yellow-300">
                    {activeElementEffect.soundDescription}
                  </span>
                </div>
              )}

              {/* Generation Overlay if painting art */}
              {page.isGeneratingImage && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-white text-center z-30">
                  <Loader2 className="w-10 h-10 text-yellow-400 animate-spin mb-3" />
                  <h4 className="font-bangers text-2xl text-yellow-300 tracking-wide">
                    PAINTING COMIC PANEL {page.pageNumber}...
                  </h4>
                  <p className="text-xs font-comic font-bold text-amber-200 mt-1 max-w-xs">
                    Gemini 3 Pro is crafting your {page.imageSize || '1K'} illustration with vivid comic details!
                  </p>
                </div>
              )}
            </div>

            {/* Quick Tap Strip for Kids */}
            <div className="mt-3 py-2 px-3 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1 text-[11px] font-bangers uppercase text-slate-900 shrink-0">
                <span>SOUND BUDDIES:</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {interactiveItems.map((elem) => (
                  <button
                    key={elem.id}
                    id={`tap-buddy-btn-${elem.id}`}
                    onClick={() => handleTapInteractiveElement(elem)}
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg border-2 border-black text-xs font-comic font-bold transition-all shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 ${
                      animatingElementId === elem.id
                        ? 'bg-yellow-400 text-slate-950 scale-105'
                        : 'bg-amber-50 hover:bg-amber-100 text-slate-900'
                    }`}
                    title={elem.soundDescription}
                  >
                    <span>{elem.icon}</span>
                    <span>{elem.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Illustration Prompt & Paint Button Footer */}
            <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
              <div className="text-xs text-slate-700 font-comic font-semibold line-clamp-1 flex-1">
                🎨 <span className="italic">{leftDisplayPage.illustrationPrompt.slice(0, 55)}...</span>
              </div>

              <button
                id="paint-illustration-btn"
                onClick={onOpenIllustrationModal}
                disabled={leftDisplayPage.isGeneratingImage}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bangers text-sm tracking-wide border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all shrink-0 disabled:opacity-50"
              >
                <Palette className="w-4 h-4" />
                <span>Paint Comic Art (1K/2K/4K)</span>
              </button>
            </div>

            {/* Bottom Margin with Comic Page Number */}
            <div className="pt-2 mt-2 flex items-center justify-between text-xs font-comic font-bold text-slate-600 border-t border-black/10">
              <span className="font-mono text-slate-800">PAGE {leftDisplayPage.pageNumber * 2 - 1}</span>
              <span className="italic text-[11px] text-amber-900 hidden sm:inline">Left Page (Panel Art)</span>
            </div>

            {/* Interactive Bottom-Left Dog-Ear Curl (Flip to Previous Page) */}
            {currentPageIndex > 0 && !isFlipping && (
              <div
                id="comic-prev-corner-dog-ear"
                onClick={() => handlePageTurn(currentPageIndex - 1, 'prev')}
                className="comic-dog-ear-curl-left group/curl flex items-end justify-start p-1.5 cursor-pointer select-none"
                title="Click or drag to turn back to previous comic page!"
              >
                <div className="font-bangers text-[10px] text-amber-950 font-black tracking-tighter opacity-80 group-hover/curl:opacity-100 group-hover/curl:scale-110 transition-transform">
                  ⤺ PREV
                </div>
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* PHYSICAL COMIC BOOK CENTER SPINE: Crease Valley & Staples    */}
          {/* ------------------------------------------------------------- */}
          <div 
            id="comic-book-center-spine"
            className="hidden lg:flex w-7 sm:w-8 comic-spine-crease flex-col justify-between items-center py-6 relative z-20 select-none shrink-0"
            title="Comic Book Saddle-Stitch Binding"
          >
            {/* Top Metallic Saddle Staple */}
            <div className="flex flex-col items-center">
              <div className="w-1.5 h-0.5 bg-black/70 rounded-full mb-0.5" />
              <div className="comic-staple-metal w-2 h-8 rounded-sm shadow-md" />
              <div className="w-1.5 h-0.5 bg-black/70 rounded-full mt-0.5" />
            </div>

            {/* Spine Text Label */}
            <div className="rotate-90 text-[9px] font-bangers text-black/40 tracking-widest uppercase my-auto select-none">
              FOLD
            </div>

            {/* Bottom Metallic Saddle Staple */}
            <div className="flex flex-col items-center">
              <div className="w-1.5 h-0.5 bg-black/70 rounded-full mb-0.5" />
              <div className="comic-staple-metal w-2 h-8 rounded-sm shadow-md" />
              <div className="w-1.5 h-0.5 bg-black/70 rounded-full mt-0.5" />
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* RIGHT PAGE: Comic Story Narrative, Speech Balloon & Narration */}
          {/* ------------------------------------------------------------- */}
          <div
            id="page-text-panel"
            className="relative flex-1 p-4 sm:p-6 flex flex-col justify-between bg-[#faf6eb] comic-newsprint-texture"
          >
            <div>
              {/* Comic Page Bar */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-black/15">
                <span className="font-bangers text-lg text-slate-950 tracking-wider">
                  CHAPTER {rightDisplayPage.pageNumber}: {story.title.toUpperCase()}
                </span>

                {/* Page Progress Indicator with 3D flip triggers */}
                <div className="flex items-center gap-1.5">
                  {story.pages.map((_, idx) => (
                    <button
                      key={idx}
                      id={`page-dot-${idx}`}
                      onClick={() => handlePageTurn(idx, idx > currentPageIndex ? 'next' : 'prev')}
                      className={`h-3 rounded-full border border-black transition-all ${
                        idx === currentPageIndex
                          ? 'w-7 bg-orange-500 shadow-[2px_2px_0px_#000]'
                          : 'w-3 bg-white hover:bg-yellow-300'
                      }`}
                      title={`Flip to Page ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Comic Yellow Narrator Dispatch Caption Box */}
              {isComicMode && (
                <div className="bg-yellow-300 border-3 border-black rounded-xl p-3 mb-4 shadow-[3px_3px_0px_#000]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bangers text-xs tracking-wider uppercase text-yellow-950 flex items-center gap-1">
                      ★ NARRATOR'S DISPATCH
                    </span>
                    <span className="text-[10px] font-comic font-bold text-yellow-900 bg-yellow-400 px-1.5 py-0.5 rounded border border-yellow-700">
                      CHAPTER {rightDisplayPage.pageNumber}
                    </span>
                  </div>
                  <p className="text-xs font-comic font-bold italic text-slate-950 line-clamp-2">
                    "{rightDisplayPage.illustrationPrompt.slice(0, 100)}..."
                  </p>
                </div>
              )}

              {/* Main Story Text in Comic Speech Balloon */}
              <div
                className={`relative bg-white ${
                  isComicMode
                    ? 'border-3 border-black rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_#000] comic-bubble-tail'
                    : 'border border-amber-200 rounded-2xl p-5 sm:p-6 shadow-sm'
                }`}
              >
                <div
                  id="story-page-text-content"
                  className="font-comic font-bold text-slate-950 leading-relaxed sm:leading-loose tracking-wide transition-all select-text"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {rightDisplayPage.text}
                </div>

                {/* Comic sound stickers row inside the speech balloon */}
                {isComicMode && (
                  <div className="mt-4 pt-3 border-t border-black/10 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bangers text-slate-500 tracking-wider">
                      SOUND FX:
                    </span>
                    {COMIC_ACTION_STICKERS.map((stk) => (
                      <button
                        key={stk.text}
                        type="button"
                        onClick={() => handleTapComicSticker(stk.sound, stk.text)}
                        className={`text-[10px] font-bangers px-2 py-0.5 rounded-md border border-black shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer ${stk.color}`}
                        title={`Play ${stk.text} effect`}
                      >
                        {stk.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* DUAL NARRATION STUDIO: AI GEMINI TTS & USER VOICE RECORDING               */}
            {/* ========================================================================= */}
            <div
              id="narration-player-card"
              className="mt-6 pt-3 space-y-3 bg-white border-3 border-black p-3.5 rounded-2xl shadow-[4px_4px_0px_#000]"
            >
              {/* Top Selector: AI Narration vs User Voice Recording */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b-2 border-black/10">
                <div className="flex items-center gap-1.5 p-1 bg-amber-100 border border-black rounded-xl">
                  <button
                    id="select-ai-narration-tab"
                    type="button"
                    onClick={() => {
                      if (isPlaying) audioRef.current?.pause();
                      setIsPlaying(false);
                      setActiveAudioSource('ai');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bangers tracking-wide transition-all ${
                      activeAudioSource === 'ai'
                        ? 'bg-yellow-400 text-black border border-black shadow-[2px_2px_0px_#000]'
                        : 'text-slate-700 hover:text-black'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-black" />
                    <span>AI Narration (Gemini)</span>
                  </button>

                  <button
                    id="select-user-narration-tab"
                    type="button"
                    onClick={() => {
                      if (isPlaying) audioRef.current?.pause();
                      setIsPlaying(false);
                      setActiveAudioSource('user');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bangers tracking-wide transition-all ${
                      activeAudioSource === 'user'
                        ? 'bg-red-600 text-white border border-black shadow-[2px_2px_0px_#000]'
                        : 'text-slate-700 hover:text-black'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>My Voice Recording</span>
                    {page.userRecordingUrl && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" title="Recording available" />
                    )}
                  </button>
                </div>

                {/* Record / Re-record voice button */}
                <button
                  id="open-voice-recorder-btn"
                  type="button"
                  onClick={() => setIsRecorderOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 border-2 border-black font-bangers text-xs shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{page.userRecordingUrl ? 'Re-record Voice' : 'Record Reading'}</span>
                </button>
              </div>

              {/* Playback Controls & Voice Details */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                {/* Main Play / Pause Button */}
                <div className="flex items-center gap-3">
                  <button
                    id="toggle-read-aloud-btn"
                    onClick={togglePlayPause}
                    disabled={isLoadingAudio}
                    className={`flex items-center gap-2 px-5 py-2 rounded-2xl font-bangers text-base tracking-wide border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all ${
                      activeAudioSource === 'user'
                        ? isPlaying
                          ? 'bg-red-700 text-white'
                          : 'bg-red-600 hover:bg-red-500 text-white'
                        : isPlaying
                        ? 'bg-orange-700 text-white'
                        : 'bg-orange-500 hover:bg-orange-400 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoadingAudio ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Synthesizing Voice...</span>
                      </>
                    ) : isPlaying ? (
                      <>
                        <Pause className="w-5 h-5" />
                        <span>Pause Narration</span>
                      </>
                    ) : activeAudioSource === 'user' ? (
                      page.userRecordingUrl ? (
                        <>
                          <Play className="w-5 h-5" />
                          <span>Play My Recording</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5" />
                          <span>Record Reading</span>
                        </>
                      )
                    ) : (
                      <>
                        <Volume2 className="w-5 h-5" />
                        <span>Read Comic Aloud</span>
                      </>
                    )}
                  </button>

                  {isPlaying && (
                    <div className="flex items-center gap-1.5 text-xs font-comic font-bold animate-pulse">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          activeAudioSource === 'user' ? 'bg-red-600' : 'bg-orange-600'
                        }`}
                      />
                      <span className={activeAudioSource === 'user' ? 'text-red-700' : 'text-orange-700'}>
                        {activeAudioSource === 'user' ? 'Playing voice recording...' : 'Reading aloud...'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Source-specific configuration */}
                {activeAudioSource === 'ai' ? (
                  /* Gemini TTS Voice Selector */
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-bangers uppercase text-slate-700">Voice:</label>
                    <select
                      id="narration-voice-select"
                      value={selectedVoice}
                      onChange={(e) => onVoiceChange(e.target.value as VoiceName)}
                      className="text-xs font-bold font-comic px-2 py-1 rounded-xl border-2 border-black bg-white text-slate-900 focus:outline-none shadow-[2px_2px_0px_#000]"
                    >
                      {VOICE_OPTIONS.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.label} ({v.name})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  /* User Voice Recording Details */
                  <div className="flex items-center gap-2">
                    {page.userRecordingUrl ? (
                      <div className="flex items-center gap-2 text-xs font-bold font-comic text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-xl border border-black shadow-[1px_1px_0px_#000]">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Custom Voice Saved</span>
                        <button
                          id="delete-user-recording-btn"
                          onClick={() => onDeletePageRecording(currentPageIndex)}
                          title="Delete recording"
                          className="text-red-600 hover:text-red-800 ml-1 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-comic text-slate-500 italic">No recording yet for Page {page.pageNumber}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Audio Scrubber & Progress */}
              {audioDuration > 0 && (
                <div className="space-y-1 pt-1">
                  <input
                    id="narration-audio-scrubber"
                    type="range"
                    min="0"
                    max="100"
                    value={audioProgress}
                    onChange={handleSeek}
                    className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                  <div className="flex justify-between text-[11px] font-mono font-bold text-slate-600">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(audioDuration)}</span>
                  </div>
                </div>
              )}

              {/* Narration Model Attribution & Style Switcher (for AI mode) */}
              {activeAudioSource === 'ai' && (
                <div className="flex items-center justify-between text-[11px] font-comic font-bold text-slate-700 pt-1 border-t border-black/10">
                  <span>Gemini Voice: <span className="font-mono text-slate-900">3.1-flash-tts</span></span>

                  <div className="flex items-center gap-1">
                    {(['cheerful', 'calm', 'energetic'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => setNarrationStyle(style)}
                        className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bangers border border-black transition-all ${
                          narrationStyle === style
                            ? 'bg-yellow-400 text-black shadow-[1px_1px_0px_#000]'
                            : 'bg-white text-slate-600 hover:bg-yellow-100'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Book Navigation Bar (Previous / Next with 3D Page Flip / Companion Chat) */}
            <div className="mt-5 pt-3 flex items-center justify-between gap-2 border-t-2 border-black/10">
              <button
                id="prev-page-btn"
                onClick={() => handlePageTurn(currentPageIndex - 1, 'prev')}
                disabled={currentPageIndex === 0 || isFlipping}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border-2 border-black bg-white hover:bg-amber-100 text-slate-950 font-bangers text-sm tracking-wide shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>FLIP PREV</span>
              </button>

              {/* Ask Story Companion button */}
              <button
                id="ask-companion-btn"
                onClick={onOpenCompanionChat}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-purple-200 hover:bg-purple-300 text-slate-950 border-2 border-black font-bangers text-xs tracking-wide shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-purple-800" />
                <span>ASK BUDDIES</span>
              </button>

              <button
                id="next-page-btn"
                onClick={() => handlePageTurn(currentPageIndex + 1, 'next')}
                disabled={currentPageIndex === totalPages - 1 || isFlipping}
                className="flex items-center gap-1 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bangers text-sm tracking-wide border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <span>FLIP NEXT</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Margin with Comic Page Number */}
            <div className="pt-2 mt-2 flex items-center justify-between text-xs font-comic font-bold text-slate-600 border-t border-black/10">
              <span className="italic text-[11px] text-amber-900 hidden sm:inline">Right Page (Story & Voice)</span>
              <span className="font-mono text-slate-800">PAGE {rightDisplayPage.pageNumber * 2}</span>
            </div>

            {/* Interactive Bottom-Right Dog-Ear Curl (Turn to Next Page) */}
            {currentPageIndex < totalPages - 1 && !isFlipping && (
              <div
                id="comic-turn-corner-dog-ear"
                onClick={() => handlePageTurn(currentPageIndex + 1, 'next')}
                className="comic-dog-ear-curl-right group/curl flex items-end justify-end p-1.5 cursor-pointer select-none"
                title="Click or drag to turn to the next comic page!"
              >
                <div className="font-bangers text-[10px] text-amber-950 font-black tracking-tighter opacity-80 group-hover/curl:opacity-100 group-hover/curl:scale-110 transition-transform">
                  FLIP ➔
                </div>
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* ACTIVE 3D FLIPPING LEAF (Real Paper Peel & Turn Across Spine)  */}
          {/* ------------------------------------------------------------- */}
          {isFlipping && (
            <div
              className={`hidden lg:block comic-leaf-flipper ${
                flipDirection === 'next' ? 'flipping-next' : 'flipping-prev'
              }`}
            >
              {flipDirection === 'next' ? (
                <>
                  {/* Front Face: The previous right page lifting away */}
                  <div className="comic-leaf-face comic-newsprint-texture border-y-4 border-r-4 border-black p-5 flex flex-col justify-between shadow-2xl bg-[#faf6eb]">
                    <div className="relative z-10 opacity-90">
                      <div className="flex items-center justify-between pb-2 border-b-2 border-black/20 mb-3">
                        <span className="font-bangers text-xs tracking-wider uppercase text-black">
                          ★ CHAPTER {story.pages[flipFromIndex]?.pageNumber}
                        </span>
                        <span className="text-[10px] font-comic font-bold text-slate-700">TURNING PAGE...</span>
                      </div>
                      <div className="bg-yellow-300 border-2 border-black rounded-lg p-2.5 mb-3 shadow-[2px_2px_0px_#000]">
                        <p className="text-xs font-comic font-bold italic text-slate-900 line-clamp-2">
                          "{story.pages[flipFromIndex]?.illustrationPrompt.slice(0, 90)}..."
                        </p>
                      </div>
                      <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_#000]">
                        <p className="font-comic font-bold text-slate-900 text-sm leading-relaxed line-clamp-6">
                          {story.pages[flipFromIndex]?.text}
                        </p>
                      </div>
                    </div>
                    {/* Dynamic shading gradient as page lifts */}
                    <div className="absolute inset-0 bg-gradient-to-l from-black/30 via-black/10 to-transparent pointer-events-none" />
                  </div>

                  {/* Back Face: Reverse side of the physical comic paper */}
                  <div className="comic-leaf-face comic-leaf-back comic-newsprint-texture border-y-4 border-l-4 border-black p-6 flex flex-col justify-between items-center text-center shadow-2xl bg-[#f4ebd6]">
                    <div className="w-full flex items-center justify-between pb-2 border-b-2 border-black/20">
                      <span className="font-bangers text-[11px] tracking-wider text-black">VANALIPI COMIC CLASSICS</span>
                      <span className="font-bangers text-[10px] text-red-600">PAGE REVERSE</span>
                    </div>

                    {/* Vintage comic emblem watermark */}
                    <div className="my-auto flex flex-col items-center opacity-85 py-4">
                      <div className="w-16 h-16 rounded-full border-3 border-dashed border-amber-800/40 flex items-center justify-center mb-2 bg-amber-200/40">
                        <BookOpen className="w-8 h-8 text-amber-900/60" />
                      </div>
                      <div className="font-bangers text-lg text-slate-900 tracking-wide">
                        CHAPTER {story.pages[flipTargetIndex]?.pageNumber} AHEAD!
                      </div>
                      <p className="font-comic text-xs font-bold text-amber-950 max-w-xs mt-1">
                        "{story.title}"
                      </p>
                      <div className="mt-2.5 px-3 py-1 bg-yellow-300 border border-black text-[10px] font-bangers rounded shadow-sm text-black">
                        ★ COMICS CODE APPROVED ★
                      </div>
                    </div>

                    <div className="w-full text-right text-[10px] font-comic font-bold text-slate-500">
                      Page {story.pages[flipTargetIndex]?.pageNumber * 2 - 1}
                    </div>
                    {/* Landing shadow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10 pointer-events-none" />
                  </div>
                </>
              ) : (
                <>
                  {/* Front Face: The previous left page lifting away */}
                  <div className="comic-leaf-face comic-newsprint-texture border-y-4 border-l-4 border-black p-5 flex flex-col justify-between shadow-2xl bg-[#faf6eb]">
                    <div className="relative z-10 opacity-90">
                      <div className="flex items-center justify-between pb-2 border-b-2 border-black/20 mb-3">
                        <span className="font-bangers text-xs tracking-wider uppercase text-black">
                          ★ PANEL {story.pages[flipFromIndex]?.pageNumber}
                        </span>
                        <span className="text-[10px] font-comic font-bold text-slate-700">FLIPPING BACK...</span>
                      </div>
                      <div className="w-full aspect-4/3 rounded-xl overflow-hidden border-2 border-black shadow bg-amber-100 flex items-center justify-center">
                        {story.pages[flipFromIndex]?.imageUrl ? (
                          <img
                            src={story.pages[flipFromIndex]?.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Palette className="w-10 h-10 text-amber-600" />
                        )}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-transparent pointer-events-none" />
                  </div>

                  {/* Back Face: Reverse of left page */}
                  <div className="comic-leaf-face comic-leaf-back comic-newsprint-texture border-y-4 border-r-4 border-black p-6 flex flex-col justify-between items-center text-center shadow-2xl bg-[#f4ebd6]">
                    <div className="w-full flex items-center justify-between pb-2 border-b-2 border-black/20">
                      <span className="font-bangers text-[11px] tracking-wider text-black">VANALIPI COMIC CLASSICS</span>
                      <span className="font-bangers text-[10px] text-red-600">PAGE REVERSE</span>
                    </div>

                    <div className="my-auto flex flex-col items-center opacity-85 py-4">
                      <div className="w-16 h-16 rounded-full border-3 border-dashed border-amber-800/40 flex items-center justify-center mb-2 bg-amber-200/40">
                        <BookOpen className="w-8 h-8 text-amber-900/60" />
                      </div>
                      <div className="font-bangers text-lg text-slate-900 tracking-wide">
                        RETURNING TO CHAPTER {story.pages[flipTargetIndex]?.pageNumber}
                      </div>
                      <p className="font-comic text-xs font-bold text-amber-950 max-w-xs mt-1">
                        "{story.title}"
                      </p>
                    </div>

                    <div className="w-full text-left text-[10px] font-comic font-bold text-slate-500">
                      Page {story.pages[flipTargetIndex]?.pageNumber * 2}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-transparent to-black/10 pointer-events-none" />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
      )}

      {/* Gandhara Lore & Lipisutra Ancient Trivia Modal */}
      <GandharaTriviaModal
        isOpen={isTriviaOpen}
        onClose={() => setIsTriviaOpen(false)}
      />

      {/* Voice Recorder Modal */}
      <VoiceRecorderModal
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        pageNumber={page.pageNumber}
        pageText={page.text}
        storyTitle={story.title}
        existingRecordingUrl={page.userRecordingUrl}
        onSaveRecording={(url, dur) => {
          onSavePageRecording(currentPageIndex, url, dur);
          setActiveAudioSource('user');
        }}
        onDeleteRecording={() => {
          onDeletePageRecording(currentPageIndex);
          setActiveAudioSource('ai');
        }}
      />

      {/* Fullscreen Image Lightbox Modal */}
      {isImageFullscreen && page.imageUrl && (
        <div
          id="fullscreen-image-modal"
          onClick={() => setIsImageFullscreen(false)}
          className="fixed inset-0 z-50 bg-black/90 p-4 flex items-center justify-center cursor-pointer animate-in fade-in"
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            <img
              src={page.imageUrl}
              alt={`Page ${page.pageNumber} artwork`}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl border-4 border-black shadow-2xl"
            />
            <div className="mt-3 text-white text-center text-sm font-bangers tracking-wide">
              PANEL {page.pageNumber}: {story.title} ({page.imageSize || '1K'})
            </div>
            <button
              onClick={() => setIsImageFullscreen(false)}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 border border-white"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
