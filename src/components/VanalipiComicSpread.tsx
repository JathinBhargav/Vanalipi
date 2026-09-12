import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Clock, Sparkles, Volume2, ChevronLeft, ChevronRight, HelpCircle, Star, Maximize2, Share2, Compass } from 'lucide-react';
import { playInteractiveSound, playComicPageTurnSound } from '../utils/audioEffects';

interface Props {
  onOpenTrivia: () => void;
  onOpenIllustrationModal?: () => void;
  onOpenShareStory?: () => void;
}

interface ComicSpreadData {
  id: number;
  chapterTitle: string;
  leftPanel: {
    badgeText: string;
    speechBubble: string;
    actionBurst: string;
    tabletHint: string;
  };
  rightPanels: {
    panel1: {
      narration: string;
      speech: string;
    };
    panel2: {
      caption: string;
      zoomItem: string;
    };
    panel3: {
      actionBurst: string;
      thought: string;
    };
    panel4: {
      narration: string;
      climaxText: string;
    };
  };
  audioScript: {
    role: 'narration' | 'maya' | 'burst';
    text: string;
  }[];
}

const SPREADS_DATA: ComicSpreadData[] = [
  {
    id: 1,
    chapterTitle: 'CHAPTER 1: THE WHISPERING WOODS & THE SUN TEMPLE',
    leftPanel: {
      badgeText: 'PANEL 1',
      speechBubble: 'Wow! An ancient map in the whispering woods!',
      actionBurst: 'SHAZAM!',
      tabletHint: 'Ancient Kharosthi Tablet of Lipisutra'
    },
    rightPanels: {
      panel1: {
        narration: 'Maya followed the glowing trails...',
        speech: 'It leads to the Sun Temple!'
      },
      panel2: {
        caption: 'ANCIENT GANDHARA MAP',
        zoomItem: 'Sacred Temple of the Sun Coordinates'
      },
      panel3: {
        actionBurst: 'CLICK!',
        thought: 'The magnifying glass reveals the secret path!'
      },
      panel4: {
        narration: '...Deep into the heart of Lipisutra.',
        climaxText: 'The Golden Sanctuary of Dawn'
      }
    },
    audioScript: [
      { role: 'burst', text: 'Shazam!' },
      { role: 'maya', text: 'Wow! An ancient map in the whispering woods!' },
      { role: 'narration', text: 'Maya followed the glowing trails through the towering canopy...' },
      { role: 'maya', text: 'It leads to the Sun Temple!' },
      { role: 'burst', text: 'Click!' },
      { role: 'narration', text: 'The ancient lens revealed hidden glyphs... deep into the heart of Lipisutra!' }
    ]
  },
  {
    id: 2,
    chapterTitle: 'CHAPTER 2: THE RIVER OF BIRCH SCROLLS',
    leftPanel: {
      badgeText: 'PANEL 2',
      speechBubble: 'Look! The river rocks glow with ancient letters!',
      actionBurst: 'SPLASH!',
      tabletHint: 'The Stele of Kharosthi Scribes'
    },
    rightPanels: {
      panel1: {
        narration: 'Stepping across the emerald stepping stones...',
        speech: 'Each stone spells a sacred word!'
      },
      panel2: {
        caption: 'BIRCH BARK WATERMARK',
        zoomItem: 'Kharosthi Word for Friendship'
      },
      panel3: {
        actionBurst: 'SWOOSH!',
        thought: 'A golden dragon-fly guides the way!'
      },
      panel4: {
        narration: '...Guiding her safely to the grand gateway.',
        climaxText: 'The Archway of Ancient Wisdom'
      }
    },
    audioScript: [
      { role: 'burst', text: 'Splash!' },
      { role: 'maya', text: 'Look! The river rocks glow with ancient letters!' },
      { role: 'narration', text: 'Stepping across the emerald stones, Maya deciphered the ancient river steles.' },
      { role: 'maya', text: 'Each stone spells a sacred word!' },
      { role: 'burst', text: 'Swoosh!' },
      { role: 'narration', text: 'Guiding her safely to the grand gateway of dawn!' }
    ]
  },
  {
    id: 3,
    chapterTitle: 'CHAPTER 3: THE GOLDEN SANCTUARY OF DAWN',
    leftPanel: {
      badgeText: 'PANEL 3',
      speechBubble: 'The sun rises right over the golden spire!',
      actionBurst: 'KABOOM!',
      tabletHint: 'The Altar of the Solar Equinox'
    },
    rightPanels: {
      panel1: {
        narration: 'The heavy temple doors swung wide open...',
        speech: 'The golden bird sings for the sunrise!'
      },
      panel2: {
        caption: 'SOLAR EQUINOX BELL',
        zoomItem: 'Chiming with Ancient Harmonies'
      },
      panel3: {
        actionBurst: 'CHIME!',
        thought: 'The bells ring out across all of Lipisutra!'
      },
      panel4: {
        narration: '...A new adventure begins for young Maya.',
        climaxText: 'Vanalipi Explorers Forever!'
      }
    },
    audioScript: [
      { role: 'burst', text: 'Kaboom!' },
      { role: 'maya', text: 'The sun rises right over the golden spire!' },
      { role: 'narration', text: 'The heavy temple doors swung wide open to welcome the dawn.' },
      { role: 'maya', text: 'The golden bird sings for the sunrise!' },
      { role: 'burst', text: 'Chime!' },
      { role: 'narration', text: 'And so, a new legend begins in the chronicles of Vanalipi!' }
    ]
  }
];

export const VanalipiComicSpread: React.FC<Props> = ({
  onOpenTrivia,
  onOpenIllustrationModal,
  onOpenShareStory
}) => {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [isPlayingNarration, setIsPlayingNarration] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMagicMode, setIsMagicMode] = useState(false);
  const [activeNarratingIndex, setActiveNarratingIndex] = useState<number>(-1);
  const [burstAnimating, setBurstAnimating] = useState<string | null>(null);

  const currentSpread = SPREADS_DATA[spreadIndex];
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Toggle Playback Speed
  const cyclePlaybackSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    playInteractiveSound('boing');
  };

  // Turn page forward / backward
  const handleNextSpread = () => {
    if (spreadIndex < SPREADS_DATA.length - 1) {
      stopNarration();
      playComicPageTurnSound();
      setSpreadIndex(s => s + 1);
    }
  };

  const handlePrevSpread = () => {
    if (spreadIndex > 0) {
      stopNarration();
      playComicPageTurnSound();
      setSpreadIndex(s => s - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') handleNextSpread();
      if (e.key === 'ArrowLeft') handlePrevSpread();
      if (e.key === ' ') {
        e.preventDefault();
        toggleNarration();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spreadIndex, isPlayingNarration]);

  // Handle Burst Click
  const handleBurstClick = (burstText: string) => {
    setBurstAnimating(burstText);
    playInteractiveSound('roar');
    setTimeout(() => setBurstAnimating(null), 800);
  };

  // Stop narration
  const stopNarration = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingNarration(false);
    setActiveNarratingIndex(-1);
  };

  // Sequential speech narration
  const toggleNarration = () => {
    if (isPlayingNarration) {
      stopNarration();
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    setIsPlayingNarration(true);
    playInteractiveSound('chime');

    const script = currentSpread.audioScript;
    let step = 0;

    const speakNextStep = () => {
      if (step >= script.length) {
        setIsPlayingNarration(false);
        setActiveNarratingIndex(-1);
        playInteractiveSound('twinkle');
        return;
      }

      setActiveNarratingIndex(step);
      const item = script[step];
      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.rate = playbackSpeed;
      utterance.pitch = item.role === 'maya' ? 1.25 : item.role === 'burst' ? 1.4 : 1.05;

      utterance.onend = () => {
        step++;
        speakNextStep();
      };

      utterance.onerror = () => {
        setIsPlayingNarration(false);
        setActiveNarratingIndex(-1);
      };

      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    speakNextStep();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {/* ========================================================================= */}
      {/* FLOATING TOP MEDIA CONTROL PANEL                                          */}
      {/* ========================================================================= */}
      <div className="mb-4 z-20">
        <div 
          id="comic-media-control-panel"
          className="flex items-center gap-2 sm:gap-3 bg-[#1397b2] border-3 border-black rounded-full px-3 py-1.5 sm:px-4 sm:py-2 shadow-[4px_4px_0px_#000]"
        >
          {/* Narrate Button */}
          <button
            id="play-narration-btn"
            onClick={toggleNarration}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bangers text-sm sm:text-base tracking-wide transition-all border-2 border-black active:translate-x-0.5 active:translate-y-0.5 ${
              isPlayingNarration
                ? 'bg-[#fbbf24] text-black shadow-[2px_2px_0px_#000]'
                : 'bg-[#189bb5] hover:bg-[#168fa7] text-white'
            }`}
          >
            {isPlayingNarration ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>PAUSE NARRATION</span>
                {/* Live sound wave bars */}
                <div className="flex items-end gap-0.5 h-3 ml-1">
                  <span className="w-1 bg-black h-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 bg-black h-2/3 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 bg-black h-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>PLAY NARRATION</span>
              </>
            )}
          </button>

          {/* Speed Toggle */}
          <button
            id="speed-toggle-btn"
            onClick={cyclePlaybackSpeed}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#189bb5] hover:bg-[#168fa7] text-white font-bangers text-xs sm:text-sm tracking-wide border-2 border-black active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="Toggle Narration Playback Speed"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{playbackSpeed}x SPEED</span>
          </button>

          {/* Magic Mode Toggle */}
          <button
            id="magic-mode-btn"
            onClick={() => {
              setIsMagicMode(!isMagicMode);
              playInteractiveSound('twinkle');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bangers text-xs sm:text-sm tracking-wide border-2 border-black transition-all active:translate-x-0.5 active:translate-y-0.5 ${
              isMagicMode
                ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 text-black shadow-[2px_2px_0px_#000] animate-pulse'
                : 'bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white shadow-[2px_2px_0px_#000]'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isMagicMode ? 'text-black animate-spin' : 'text-yellow-200'}`} />
            <span>MAGIC MODE {isMagicMode ? 'ON' : ''}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THE COMIC BOOK STAGE & FLANKING CHEVRON BUTTONS                           */}
      {/* ========================================================================= */}
      <div className="relative w-full max-w-6xl flex items-center justify-center px-1 sm:px-2">
        {/* Left Side Turn Button (<) */}
        <button
          id="comic-turn-prev-chevron"
          onClick={handlePrevSpread}
          disabled={spreadIndex === 0}
          className="absolute -left-2 sm:-left-6 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#fde047] hover:bg-[#facc15] border-4 border-black flex items-center justify-center text-black font-black shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Turn back to previous spread"
        >
          <ChevronLeft className="w-8 h-8 stroke-[3.5]" />
        </button>

        {/* Right Side Turn Button (>) */}
        <button
          id="comic-turn-next-chevron"
          onClick={handleNextSpread}
          disabled={spreadIndex === SPREADS_DATA.length - 1}
          className="absolute -right-2 sm:-right-6 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#fde047] hover:bg-[#facc15] border-4 border-black flex items-center justify-center text-black font-black shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Turn forward to next spread"
        >
          <ChevronRight className="w-8 h-8 stroke-[3.5]" />
        </button>

        {/* ========================================================================= */}
        {/* THE OPEN COMIC BOOK (Teal Frame Container & Inner Spread)                 */}
        {/* ========================================================================= */}
        <div 
          id="vanalipi-comic-spread-container"
          className="w-full bg-[#1b9fb7] p-2.5 sm:p-4 rounded-3xl border-4 border-black shadow-[8px_8px_0px_#000]"
        >
          {/* Inner White Open Book Pages */}
          <div className="bg-white rounded-2xl border-4 border-black shadow-inner overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[560px] relative">
            
            {/* ------------------------------------------------------------- */}
            {/* LEFT PAGE: HERO COMIC PANEL                                   */}
            {/* ------------------------------------------------------------- */}
            <div 
              id="comic-left-page"
              className="lg:col-span-6 p-4 sm:p-5 flex flex-col justify-between border-b-4 lg:border-b-0 lg:border-r-4 border-black bg-[#faf6eb] relative"
            >
              {/* Magic Mode Ambient Particles */}
              {isMagicMode && (
                <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                  <div className="absolute top-6 left-12 text-yellow-400 text-xl animate-bounce">✨</div>
                  <div className="absolute bottom-16 right-12 text-amber-400 text-xl animate-ping">⭐</div>
                  <div className="absolute top-1/2 left-1/3 text-orange-400 text-sm animate-pulse">★</div>
                </div>
              )}

              {/* The Hero Panel */}
              <div className="relative rounded-2xl border-4 border-black shadow-[6px_6px_0px_#000] overflow-hidden bg-gradient-to-b from-[#bbf7d0] via-[#86efac] to-[#15803d] flex-1 flex flex-col justify-between min-h-[440px]">
                
                {/* Comic Illustrated Vector Art of Maya in the Whispering Woods */}
                <svg
                  className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                  viewBox="0 0 500 500"
                  preserveAspectRatio="xMidYMid slice"
                >
                  <defs>
                    {/* Sunbeam gradient */}
                    <linearGradient id="sunbeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fef08a" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#86efac" stopOpacity="0.0" />
                    </linearGradient>
                    {/* Tablet glow */}
                    <radialGradient id="tabletGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
                      <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Forest Background & Tall Trees */}
                  <rect width="500" height="500" fill="#a7f3d0" />
                  
                  {/* Sunbeams */}
                  <polygon points="0,0 200,0 350,500 150,500" fill="url(#sunbeamGrad)" />
                  <polygon points="250,0 450,0 500,500 300,500" fill="url(#sunbeamGrad)" opacity="0.6" />

                  {/* Distant Forest Trees */}
                  <g fill="#047857" opacity="0.6">
                    <rect x="30" y="40" width="35" height="460" rx="6" />
                    <rect x="110" y="20" width="40" height="480" rx="8" />
                    <rect x="380" y="30" width="45" height="470" rx="10" />
                    <rect x="450" y="10" width="30" height="490" rx="6" />
                  </g>

                  {/* Foliage Clouds in Canopy */}
                  <g fill="#065f46" stroke="#000000" strokeWidth="4">
                    <circle cx="50" cy="40" r="70" />
                    <circle cx="150" cy="30" r="80" />
                    <circle cx="300" cy="20" r="90" />
                    <circle cx="430" cy="35" r="80" />
                  </g>

                  {/* Ground Hill & Moss */}
                  <path d="M-20,410 Q140,360 260,420 T520,400 L520,520 L-20,520 Z" fill="#047857" stroke="#000" strokeWidth="4" />
                  <path d="M-20,440 Q180,410 320,450 T520,440 L520,520 L-20,520 Z" fill="#064e3b" stroke="#000" strokeWidth="3" />

                  {/* Mystical Glow beneath Ancient Tablet */}
                  <circle cx="170" cy="350" r="140" fill="url(#tabletGlow)" />

                  {/* ANCIENT STONE TABLET (Carved Stele with Kharosthi Glyphs) */}
                  <g id="stone-tablet-group" transform="translate(110, 240) rotate(-6)">
                    {/* Shadow */}
                    <path d="M-5,160 L125,160 L140,175 L-20,175 Z" fill="#022c22" opacity="0.6" />
                    {/* Stone Body */}
                    <path
                      d="M10,20 C10,5 30,0 60,0 C90,0 110,5 110,20 L115,160 C115,170 100,175 60,175 C20,175 5,170 5,160 Z"
                      fill="#e2e8f0"
                      stroke="#000000"
                      strokeWidth="5"
                    />
                    {/* Stone Face Shading */}
                    <path
                      d="M16,22 C16,10 32,5 60,5 C88,5 104,10 104,22 L108,155 C108,165 95,168 60,168 C25,168 12,165 12,155 Z"
                      fill="#cbd5e1"
                    />
                    {/* Ancient Inscribed Glyphs on the Stele */}
                    <g stroke="#0f172a" strokeWidth="3" fill="none" opacity="0.8">
                      {/* Kharosthi Symbols */}
                      <path d="M35,35 Q45,25 55,35 L55,50" />
                      <circle cx="75" cy="38" r="7" />
                      <line x1="75" y1="45" x2="85" y2="55" />

                      <path d="M30,65 L90,65" />
                      <path d="M45,65 Q60,85 75,65" />
                      <line x1="60" y1="65" x2="60" y2="90" />

                      <path d="M35,105 Q60,95 85,105" />
                      <path d="M40,120 L80,120 M60,110 L60,135" />
                      <circle cx="60" cy="148" r="4" fill="#0f172a" />
                    </g>
                    {/* Magical Tablet Crack */}
                    <path d="M95,30 L80,55 L88,75" stroke="#f59e0b" strokeWidth="3" fill="none" />
                  </g>

                  {/* MAYA THE EXPLORER (Vector Art Character) */}
                  <g id="maya-character" transform="translate(290, 210)">
                    {/* Backpack */}
                    <rect x="4" y="90" width="45" height="60" rx="10" fill="#92400e" stroke="#000" strokeWidth="4" />
                    <rect x="10" y="75" width="34" height="18" rx="8" fill="#b45309" stroke="#000" strokeWidth="3" />
                    
                    {/* Back Leg */}
                    <g transform="translate(18, 175) rotate(-15)">
                      <rect x="0" y="0" width="16" height="50" rx="6" fill="#1d4ed8" stroke="#000" strokeWidth="4" />
                      {/* Boot */}
                      <path d="M-4,46 L20,46 C24,46 26,58 24,68 L-8,68 Z" fill="#1e293b" stroke="#000" strokeWidth="4" />
                    </g>

                    {/* Front Leg (stepping forward towards tablet) */}
                    <g transform="translate(50, 170) rotate(22)">
                      <rect x="0" y="0" width="16" height="52" rx="6" fill="#1d4ed8" stroke="#000" strokeWidth="4" />
                      {/* Boot */}
                      <path d="M-4,46 L24,46 C28,46 30,58 28,68 L-6,68 Z" fill="#1e293b" stroke="#000" strokeWidth="4" />
                    </g>

                    {/* Torso & Blue Safari Shirt */}
                    <path d="M25,85 L85,85 L78,175 L28,175 Z" fill="#2563eb" stroke="#000" strokeWidth="4" />
                    {/* Shirt Collar & Belt */}
                    <polygon points="55,85 45,105 65,105" fill="#1d4ed8" stroke="#000" strokeWidth="3" />
                    <rect x="26" y="155" width="54" height="12" fill="#1e293b" stroke="#000" strokeWidth="3" />
                    <rect x="47" y="153" width="12" height="16" rx="2" fill="#fbbf24" stroke="#000" strokeWidth="2" />

                    {/* Left Arm reaching forward towards tablet */}
                    <g transform="translate(30, 95) rotate(-35)">
                      <rect x="-35" y="0" width="45" height="16" rx="8" fill="#2563eb" stroke="#000" strokeWidth="4" />
                      {/* Hand */}
                      <circle cx="-42" cy="8" r="9" fill="#fbbca3" stroke="#000" strokeWidth="3" />
                    </g>

                    {/* Head & Hair */}
                    {/* High Ponytail Puff */}
                    <circle cx="28" cy="40" r="28" fill="#1e1b4b" stroke="#000" strokeWidth="4" />
                    {/* Face */}
                    <ellipse cx="68" cy="55" rx="30" ry="28" fill="#fbbca3" stroke="#000" strokeWidth="4" />
                    {/* Front Hair Bangs */}
                    <path d="M42,32 C48,22 80,20 95,42 C85,42 60,36 42,32 Z" fill="#1e1b4b" stroke="#000" strokeWidth="3" />
                    {/* Ear */}
                    <circle cx="44" cy="58" r="8" fill="#fbbca3" stroke="#000" strokeWidth="3" />

                    {/* Joyful Big Eye */}
                    <ellipse cx="78" cy="52" rx="7" ry="9" fill="#000000" />
                    <circle cx="80" cy="49" r="3" fill="#ffffff" />
                    <circle cx="76" cy="55" r="1.5" fill="#ffffff" />
                    {/* Eyebrow */}
                    <path d="M70,40 Q80,36 88,42" stroke="#000000" strokeWidth="3" fill="none" />
                    {/* Cheerful Smile */}
                    <path d="M72,66 Q82,76 88,68" stroke="#000000" strokeWidth="3" fill="#ef4444" />
                    <ellipse cx="88" cy="62" rx="4" ry="3" fill="#fb7185" opacity="0.6" />
                  </g>
                </svg>

                {/* Top Floating Elements: "SHAZAM!" Starburst Badge */}
                <div className="relative p-4 flex items-start justify-between z-20">
                  {/* Starburst sound burst badge */}
                  <div
                    id="burst-shazam"
                    onClick={() => handleBurstClick('SHAZAM!')}
                    className={`cursor-pointer select-none transition-transform active:scale-95 ${
                      burstAnimating === 'SHAZAM!' ? 'scale-125 rotate-6' : 'hover:scale-110 hover:-rotate-3'
                    }`}
                    title="Click for comic sound effect!"
                  >
                    <div className="relative">
                      {/* Comic burst background star */}
                      <div className="w-28 h-28 sm:w-32 sm:h-32 comic-burst bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 border-4 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center -rotate-12">
                        <span className="font-bangers text-2xl sm:text-3xl text-white tracking-widest drop-shadow-[2px_2px_0px_#000]">
                          {currentSpread.leftPanel.actionBurst}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lore Clue Indicator */}
                  <button
                    onClick={onOpenTrivia}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fde047] hover:bg-[#facc15] border-2 border-black font-bangers text-xs tracking-wide shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                    title="Inspect ancient Kharosthi glyphs"
                  >
                    <Compass className="w-3.5 h-3.5 text-black" />
                    <span>LIPISUTRA LORE</span>
                  </button>
                </div>

                {/* Speech Bubble: "Wow! An ancient map in the whispering woods!" */}
                <div className="relative p-4 z-20 mt-auto">
                  <div className="max-w-xs ml-auto">
                    <div className="bg-white border-4 border-black rounded-3xl p-3 sm:p-4 shadow-[4px_4px_0px_#000] relative comic-bubble-tail">
                      <p className="font-lexend font-bold text-slate-950 text-sm sm:text-base leading-snug">
                        {currentSpread.leftPanel.speechBubble}
                      </p>
                    </div>
                  </div>

                  {/* Tablet Hotspot / Interaction trigger */}
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={onOpenTrivia}
                      className="group flex items-center gap-2 bg-[#fef08a] hover:bg-[#fde047] border-2 border-black px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_#000] transition-all"
                    >
                      <span className="text-base animate-bounce">📜</span>
                      <span className="font-bangers text-xs text-black">
                        {currentSpread.leftPanel.tabletHint}
                      </span>
                      <span className="text-[10px] font-bold bg-amber-400 border border-black px-1.5 py-0.2 rounded text-black group-hover:scale-105">
                        DECIPHER
                      </span>
                    </button>

                    {/* Gemini badge */}
                    <span className="text-[10px] font-bangers text-black bg-white/90 border border-black px-2 py-0.5 rounded shadow-sm">
                      VANALIPI EPISODE #{spreadIndex + 1}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* RIGHT PAGE: DYNAMIC 4-PANEL IRREGULAR COMIC GRID              */}
            {/* ------------------------------------------------------------- */}
            <div 
              id="comic-right-page"
              className="lg:col-span-6 p-4 sm:p-5 flex flex-col justify-between bg-[#faf6eb]"
            >
              <div className="grid grid-cols-2 grid-rows-2 gap-3 sm:gap-4 flex-1">
                
                {/* ----------------------------------------------------------- */}
                {/* PANEL 1 (Top-Left): Maya Following Trails                   */}
                {/* ----------------------------------------------------------- */}
                <div className="relative rounded-2xl border-4 border-black shadow-[4px_4px_0px_#000] overflow-hidden bg-gradient-to-b from-sky-200 to-emerald-200 p-2 sm:p-3 flex flex-col justify-between min-h-[210px]">
                  {/* Top Narration Yellow Box */}
                  <div className="bg-[#fde047] border-2 border-black rounded-lg p-1.5 shadow-[2px_2px_0px_#000] z-10">
                    <p className="font-lexend font-bold text-[11px] sm:text-xs text-black leading-tight">
                      {currentSpread.rightPanels.panel1.narration}
                    </p>
                  </div>

                  {/* Cartoon Vector Graphic: Maya pointing forward */}
                  <div className="my-auto flex items-center justify-center relative">
                    <svg viewBox="0 0 160 120" className="w-28 h-24 select-none">
                      {/* Trail dots */}
                      <circle cx="20" cy="100" r="4" fill="#fbbf24" stroke="#000" strokeWidth="1.5" />
                      <circle cx="45" cy="95" r="4" fill="#fbbf24" stroke="#000" strokeWidth="1.5" />
                      <circle cx="70" cy="98" r="4" fill="#fbbf24" stroke="#000" strokeWidth="1.5" />

                      {/* Maya */}
                      <g transform="translate(45, 10)">
                        {/* Body & Shirt */}
                        <rect x="20" y="45" width="30" height="40" rx="4" fill="#2563eb" stroke="#000" strokeWidth="3" />
                        {/* Arm pointing forward */}
                        <line x1="45" y1="52" x2="80" y2="40" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
                        <line x1="45" y1="52" x2="80" y2="40" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="83" cy="39" r="5" fill="#fbbca3" stroke="#000" strokeWidth="2" />
                        {/* Map in other hand */}
                        <polygon points="12,55 24,50 20,70 8,75" fill="#fef08a" stroke="#000" strokeWidth="2" />
                        {/* Head */}
                        <circle cx="35" cy="30" r="16" fill="#fbbca3" stroke="#000" strokeWidth="3" />
                        <circle cx="22" cy="22" r="14" fill="#1e1b4b" stroke="#000" strokeWidth="3" />
                        {/* Eye & Smile */}
                        <circle cx="40" cy="28" r="3.5" fill="#000" />
                        <path d="M37,36 Q42,41 46,37" stroke="#000" strokeWidth="2" fill="none" />
                      </g>
                    </svg>

                    {/* Speech bubble */}
                    <div className="absolute right-0 bottom-2 bg-white border-2 border-black rounded-xl p-1.5 shadow-[2px_2px_0px_#000] max-w-[130px]">
                      <p className="font-lexend font-bold text-[10px] sm:text-xs text-slate-900 leading-tight">
                        {currentSpread.rightPanels.panel1.speech}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ----------------------------------------------------------- */}
                {/* PANEL 2 (Top-Right): Magnifying Glass over Parchment Map   */}
                {/* ----------------------------------------------------------- */}
                <div className="relative rounded-2xl border-4 border-black shadow-[4px_4px_0px_#000] overflow-hidden bg-[#fef3c7] p-2 flex flex-col justify-between min-h-[210px]">
                  {/* Comic Action Rays radiating from center */}
                  <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
                    <line x1="100" y1="100" x2="0" y2="0" stroke="#000" strokeWidth="2" />
                    <line x1="100" y1="100" x2="200" y2="0" stroke="#000" strokeWidth="2" />
                    <line x1="100" y1="100" x2="0" y2="200" stroke="#000" strokeWidth="2" />
                    <line x1="100" y1="100" x2="200" y2="200" stroke="#000" strokeWidth="2" />
                    <line x1="100" y1="100" x2="100" y2="0" stroke="#000" strokeWidth="2" />
                    <line x1="100" y1="100" x2="200" y2="100" stroke="#000" strokeWidth="2" />
                  </svg>

                  {/* Parchment Map Drawing with Temple Glyphs */}
                  <div className="my-auto flex items-center justify-center relative">
                    <svg viewBox="0 0 180 150" className="w-36 h-32 select-none">
                      {/* Parchment outline */}
                      <path d="M15,10 L165,15 L160,135 L10,140 Z" fill="#fed7aa" stroke="#000" strokeWidth="3.5" />
                      <path d="M20,15 L160,20 L155,130 L15,135 Z" fill="#ffedd5" stroke="#92400e" strokeWidth="1" strokeDasharray="3,3" />

                      {/* Map Rivers & Mountains */}
                      <path d="M30,40 Q50,60 70,50 T120,70" stroke="#0284c7" strokeWidth="3" fill="none" />
                      <polygon points="40,90 55,65 70,90" fill="#cbd5e1" stroke="#000" strokeWidth="2" />
                      <polygon points="65,95 80,60 95,95" fill="#cbd5e1" stroke="#000" strokeWidth="2" />

                      {/* Sun Temple on Map */}
                      <g transform="translate(100, 40)">
                        <polygon points="25,5 10,35 40,35" fill="#facc15" stroke="#000" strokeWidth="2" />
                        <rect x="18" y="35" width="14" height="15" fill="#ca8a04" stroke="#000" strokeWidth="2" />
                        {/* Sun rays above temple */}
                        <circle cx="25" cy="0" r="4" fill="#f59e0b" />
                        <line x1="25" y1="-8" x2="25" y2="-4" stroke="#f59e0b" strokeWidth="2" />
                        <line x1="17" y1="-5" x2="21" y2="-2" stroke="#f59e0b" strokeWidth="2" />
                        <line x1="33" y1="-5" x2="29" y2="-2" stroke="#f59e0b" strokeWidth="2" />
                      </g>

                      {/* MAGNIFYING GLASS FOCUSING ON TEMPLE */}
                      <g transform="translate(85, 30)">
                        {/* Lens Glass */}
                        <circle cx="40" cy="40" r="32" fill="#38bdf8" fillOpacity="0.3" stroke="#1e293b" strokeWidth="5" />
                        <circle cx="40" cy="40" r="28" fill="none" stroke="#f8fafc" strokeWidth="2" opacity="0.8" />
                        {/* Handle */}
                        <line x1="18" y1="62" x2="-10" y2="90" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
                        <line x1="18" y1="62" x2="-10" y2="90" stroke="#b45309" strokeWidth="6" strokeLinecap="round" />
                      </g>
                    </svg>
                  </div>

                  {/* Caption banner */}
                  <div className="text-center bg-white border-2 border-black rounded-md py-0.5 px-1 shadow-[1px_1px_0px_#000]">
                    <span className="font-bangers text-[10px] sm:text-xs text-black tracking-wide">
                      ★ {currentSpread.rightPanels.panel2.caption} ★
                    </span>
                  </div>
                </div>

                {/* ----------------------------------------------------------- */}
                {/* PANEL 3 (Bottom-Left): Close-up with Magnifying Glass & CLICK! */}
                {/* ----------------------------------------------------------- */}
                <div className="relative rounded-2xl border-4 border-black shadow-[4px_4px_0px_#000] overflow-hidden bg-[#fed7aa] p-2 flex flex-col justify-between min-h-[210px]">
                  {/* Starburst sound burst "CLICK!" */}
                  <div 
                    id="burst-click"
                    onClick={() => handleBurstClick('CLICK!')}
                    className={`absolute top-2 right-2 cursor-pointer z-10 select-none transition-transform ${
                      burstAnimating === 'CLICK!' ? 'scale-125 rotate-12' : 'hover:scale-110'
                    }`}
                  >
                    <div className="px-2.5 py-1 bg-yellow-400 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] -rotate-6">
                      <span className="font-bangers text-sm sm:text-base text-black tracking-wider">
                        {currentSpread.rightPanels.panel3.actionBurst}
                      </span>
                    </div>
                  </div>

                  {/* Close-up Vector Art: Maya with lens over eye */}
                  <div className="my-auto flex items-center justify-center">
                    <svg viewBox="0 0 160 140" className="w-32 h-28 select-none">
                      {/* Maya Face Close-up */}
                      <g transform="translate(40, 20)">
                        {/* Hair */}
                        <circle cx="20" cy="30" r="32" fill="#1e1b4b" stroke="#000" strokeWidth="4" />
                        <circle cx="65" cy="20" r="26" fill="#1e1b4b" stroke="#000" strokeWidth="4" />
                        {/* Face */}
                        <ellipse cx="48" cy="52" rx="36" ry="34" fill="#fbbca3" stroke="#000" strokeWidth="4" />
                        {/* Normal Left Eye */}
                        <circle cx="32" cy="50" r="5" fill="#000" />
                        <circle cx="34" cy="48" r="2" fill="#fff" />
                        {/* Smile */}
                        <path d="M40,68 Q52,80 64,68" stroke="#000" strokeWidth="3" fill="#ef4444" />

                        {/* Huge Magnifying Glass in front of Right Eye! */}
                        <g transform="translate(48, 26)">
                          <circle cx="22" cy="22" r="22" fill="#38bdf8" fillOpacity="0.25" stroke="#000" strokeWidth="4" />
                          {/* Super enlarged eye under the glass! */}
                          <circle cx="22" cy="22" r="10" fill="#000" />
                          <circle cx="25" cy="19" r="4" fill="#fff" />
                          <line x1="8" y1="36" x2="-8" y2="58" stroke="#000" strokeWidth="6" strokeLinecap="round" />
                        </g>
                      </g>
                    </svg>
                  </div>

                  {/* Little thought sticker */}
                  <div className="bg-white/95 border-2 border-black rounded-lg p-1 text-center shadow-[1px_1px_0px_#000]">
                    <p className="font-comic font-bold text-[10px] text-slate-900 leading-tight">
                      "{currentSpread.rightPanels.panel3.thought}"
                    </p>
                  </div>
                </div>

                {/* ----------------------------------------------------------- */}
                {/* PANEL 4 (Bottom-Right): Majestic Sun Temple Vista           */}
                {/* ----------------------------------------------------------- */}
                <div className="relative rounded-2xl border-4 border-black shadow-[4px_4px_0px_#000] overflow-hidden bg-gradient-to-b from-[#38bdf8] via-[#bae6fd] to-[#15803d] p-2 flex flex-col justify-between min-h-[210px]">
                  {/* Sun Temple Vector Art */}
                  <svg viewBox="0 0 220 180" className="absolute inset-0 w-full h-full object-cover select-none">
                    <defs>
                      <radialGradient id="sunGlowHero" cx="50%" cy="40%" r="50%">
                        <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
                        <stop offset="70%" stopColor="#facc15" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Celestial Sun Glow */}
                    <circle cx="110" cy="50" r="70" fill="url(#sunGlowHero)" />
                    
                    {/* Golden Sun Beams */}
                    <polygon points="110,50 80,0 140,0" fill="#fef08a" opacity="0.4" />
                    <polygon points="110,50 20,20 60,0" fill="#fef08a" opacity="0.3" />
                    <polygon points="110,50 200,20 160,0" fill="#fef08a" opacity="0.3" />

                    {/* Mountain Hills */}
                    <path d="M-10,120 Q60,80 110,110 T230,100 L230,190 L-10,190 Z" fill="#15803d" stroke="#000" strokeWidth="3" />
                    <path d="M-10,140 Q80,120 150,140 T230,130 L230,190 L-10,190 Z" fill="#166534" stroke="#000" strokeWidth="3" />

                    {/* GOLDEN SUN TEMPLE OF LIPISUTRA */}
                    <g transform="translate(60, 25)">
                      {/* Temple Spire / Shikhara */}
                      <polygon points="50,10 25,65 75,65" fill="#facc15" stroke="#000" strokeWidth="3" />
                      <polygon points="50,0 45,10 55,10" fill="#ca8a04" stroke="#000" strokeWidth="2" />
                      {/* Temple Tier 2 */}
                      <rect x="15" y="65" width="70" height="25" fill="#fbbf24" stroke="#000" strokeWidth="3" />
                      {/* Columns */}
                      <line x1="28" y1="65" x2="28" y2="90" stroke="#000" strokeWidth="2" />
                      <line x1="50" y1="65" x2="50" y2="90" stroke="#000" strokeWidth="2" />
                      <line x1="72" y1="65" x2="72" y2="90" stroke="#000" strokeWidth="2" />
                      {/* Temple Base */}
                      <rect x="5" y="90" width="90" height="22" fill="#ca8a04" stroke="#000" strokeWidth="3" />
                      <polygon points="50,90 40,112 60,112" fill="#000" />
                    </g>

                    {/* Maya seen from behind in foreground looking at Temple */}
                    <g transform="translate(25, 125)">
                      {/* Backpack */}
                      <rect x="10" y="15" width="22" height="26" rx="4" fill="#92400e" stroke="#000" strokeWidth="2.5" />
                      {/* Body */}
                      <rect x="6" y="20" width="30" height="30" fill="#2563eb" stroke="#000" strokeWidth="3" />
                      {/* Head from behind */}
                      <circle cx="21" cy="12" r="14" fill="#1e1b4b" stroke="#000" strokeWidth="3" />
                      <circle cx="32" cy="6" r="8" fill="#1e1b4b" stroke="#000" strokeWidth="2.5" />
                    </g>
                  </svg>

                  {/* Bottom Narration Banner: "...Deep into the heart of Lipisutra." */}
                  <div className="mt-auto z-10">
                    <div className="bg-[#fde047] border-2 border-black rounded-lg p-2 shadow-[2px_2px_0px_#000]">
                      <p className="font-lexend font-bold text-xs sm:text-sm text-black text-center leading-tight">
                        {currentSpread.rightPanels.panel4.narration}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spread Bottom Navigation Bar */}
              <div className="mt-3 pt-2 border-t-2 border-black/15 flex items-center justify-between text-xs font-bangers">
                <span className="text-slate-800 tracking-wider">
                  SPREAD {spreadIndex + 1} OF {SPREADS_DATA.length}
                </span>

                <div className="flex items-center gap-1.5">
                  {SPREADS_DATA.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        stopNarration();
                        playComicPageTurnSound();
                        setSpreadIndex(i);
                      }}
                      className={`w-3 h-3 rounded-full border border-black transition-all ${
                        spreadIndex === i ? 'bg-orange-500 scale-125' : 'bg-white hover:bg-amber-200'
                      }`}
                      title={`Jump to Spread ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={onOpenTrivia}
                  className="text-amber-900 hover:text-black flex items-center gap-1 underline"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>TRIVIA</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
