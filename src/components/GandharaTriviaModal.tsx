import React, { useState } from 'react';
import { X, Sparkles, Award, Compass, BookOpen, CheckCircle, HelpCircle, Star, Volume2 } from 'lucide-react';
import { playInteractiveSound } from '../utils/audioEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface Glyph {
  symbol: string;
  ancientName: string;
  meaning: string;
  pronunciation: string;
  funFact: string;
}

const GLYPHS: Glyph[] = [
  {
    symbol: '𐨯𐨂',
    ancientName: 'Surya / Miira',
    meaning: 'The Radiant Sun',
    pronunciation: '"SOO-ree-yah"',
    funFact: 'In ancient Gandhara art, the sun was carved as a wheel of golden light guiding weary explorers through mountain passes!'
  },
  {
    symbol: '𐨤𐨿𐨪',
    ancientName: 'Prasada',
    meaning: 'Sacred Sun Temple',
    pronunciation: '"PRAH-sah-dah"',
    funFact: 'Ancient temples in Lipisutra were aligned with the equinox, allowing the first morning ray to illuminate the inner sanctum!'
  },
  {
    symbol: '𐨫𐨁',
    ancientName: 'Lipi',
    meaning: 'The Inscribed Script',
    pronunciation: '"LEE-pee"',
    funFact: 'Kharosthi lipi was written from right to left using reed pens dipped in dark walnut ink on birch bark scrolls!'
  },
  {
    symbol: '𐨬𐨣',
    ancientName: 'Vana',
    meaning: 'Whispering Forest',
    pronunciation: '"VAH-nah"',
    funFact: 'The word "Vana" means lush mystical woods where giant sal trees whispered tales to travelling wanderers.'
  },
  {
    symbol: '𐨨𐨒',
    ancientName: 'Marga',
    meaning: 'The Hidden Trail',
    pronunciation: '"MAHR-gah"',
    funFact: 'Ancient maps carved on rock steles guided explorers safely through the Khyber gorges towards the Silk Road.'
  }
];

const TRIVIA_QUESTIONS = [
  {
    id: 1,
    question: 'How did ancient scribes in Gandhara write the Kharosthi script?',
    options: [
      'From right to left using reed pens on birch bark',
      'Using spray paint on modern brick walls',
      'Typing on mechanical stone keyboards',
      'Using smoke signals across valleys'
    ],
    correctIndex: 0,
    explanation: 'Correct! Kharosthi was written right to left, often on delicate Himalayan birch bark (Bhurja-patra)!'
  },
  {
    id: 2,
    question: 'What clue did Maya find engraved on the ancient stone tablet?',
    options: [
      'A glowing celestial map leading to the Sun Temple',
      'A recipe for spicy samosas',
      'A grocery list of prehistoric berries',
      'A warning not to pet the baby dragons'
    ],
    correctIndex: 0,
    explanation: 'Awesome! The stone tablet glowed with Kharosthi runes pointing straight to the Sun Temple of Lipisutra!'
  },
  {
    id: 3,
    question: 'What special art style made ancient Gandhara statues world-famous?',
    options: [
      'A blend of Greco-Roman drapery and Indian meditative serenity',
      'Pixel art created from colored chalk',
      'Pure neon abstract cubism',
      'Cardboard cutouts dipped in wax'
    ],
    correctIndex: 0,
    explanation: 'Spot on! Gandharan art famously united classical flowing robes with serene eastern spiritual aesthetics!'
  }
];

export const GandharaTriviaModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'decoder' | 'quiz' | 'chamber'>('decoder');
  const [selectedGlyph, setSelectedGlyph] = useState<Glyph>(GLYPHS[0]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [completedQuiz, setCompletedQuiz] = useState(false);

  // Chamber puzzle state (choose 3 runes in order: Vana -> Lipi -> Surya)
  const [chamberRunes, setChamberRunes] = useState<string[]>([]);
  const [chamberUnlocked, setChamberUnlocked] = useState(false);

  if (!isOpen) return null;

  const handleSelectGlyph = (g: Glyph) => {
    setSelectedGlyph(g);
    playInteractiveSound('twinkle');
  };

  const handleAnswerQuiz = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    const isCorrect = index === TRIVIA_QUESTIONS[quizIndex].correctIndex;
    if (isCorrect) {
      setScore(s => s + 100);
      playInteractiveSound('chime');
    } else {
      playInteractiveSound('boing');
    }
  };

  const handleNextQuestion = () => {
    if (quizIndex < TRIVIA_QUESTIONS.length - 1) {
      setQuizIndex(q => q + 1);
      setSelectedAnswer(null);
    } else {
      setCompletedQuiz(true);
      playInteractiveSound('twinkle');
    }
  };

  const handleAddChamberRune = (symbol: string) => {
    if (chamberRunes.length >= 3 || chamberUnlocked) return;
    const next = [...chamberRunes, symbol];
    setChamberRunes(next);
    playInteractiveSound('boing');

    if (next.length === 3) {
      // Check if sequence is valid
      if (next[0] === '𐨬𐨣' && next[1] === '𐨫𐨁' && next[2] === '𐨯𐨂') {
        setChamberUnlocked(true);
        setScore(s => s + 250);
        playInteractiveSound('twinkle');
      } else {
        setTimeout(() => {
          setChamberRunes([]);
          playInteractiveSound('roar');
        }, 800);
      }
    }
  };

  const resetChamber = () => {
    setChamberRunes([]);
    setChamberUnlocked(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-2xl bg-[#faf6eb] border-4 border-black rounded-3xl shadow-[8px_8px_0px_#000] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#fbbf24] border-b-4 border-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏺</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bangers text-black tracking-wide leading-none">
                GANDHARA &amp; LIPISUTRA LORE VAULT
              </h2>
              <p className="text-xs font-comic font-bold text-amber-950">
                Ancient Kharosthi Glyphs, Temple Secrets &amp; Kid Trivia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border-2 border-black flex items-center justify-center text-black hover:bg-red-400 hover:text-white transition-colors shadow-[2px_2px_0px_#000]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b-2 border-black bg-amber-100 p-2 gap-2 text-sm font-bangers">
          <button
            onClick={() => setActiveTab('decoder')}
            className={`flex-1 py-2 px-3 rounded-xl border-2 border-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'decoder'
                ? 'bg-[#fb923c] text-white shadow-[2px_2px_0px_#000]'
                : 'bg-white text-black hover:bg-amber-50'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Glyph Decoder</span>
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 py-2 px-3 rounded-xl border-2 border-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'bg-[#fb923c] text-white shadow-[2px_2px_0px_#000]'
                : 'bg-white text-black hover:bg-amber-50'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Temple Trivia ({score} pts)</span>
          </button>
          <button
            onClick={() => setActiveTab('chamber')}
            className={`flex-1 py-2 px-3 rounded-xl border-2 border-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'chamber'
                ? 'bg-[#fb923c] text-white shadow-[2px_2px_0px_#000]'
                : 'bg-white text-black hover:bg-amber-50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Riddle Chamber</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'decoder' && (
            <div>
              <div className="bg-yellow-100 border-2 border-black rounded-2xl p-3 mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bangers text-black text-base">SELECT AN ANCIENT KHAROSTHI GLYPH:</h3>
                  <p className="text-xs font-comic text-slate-800">
                    Tap a symbol inscribed on ancient Gandharan stones to reveal its pronunciation and secrets!
                  </p>
                </div>
                <div className="bg-amber-300 text-amber-950 font-bangers text-xs px-2.5 py-1 rounded-lg border border-black shadow-[1px_1px_0px_#000]">
                  5 GLYPHS
                </div>
              </div>

              {/* Glyph Row */}
              <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-5">
                {GLYPHS.map((g) => (
                  <button
                    key={g.meaning}
                    onClick={() => handleSelectGlyph(g)}
                    className={`aspect-square rounded-2xl border-3 border-black flex flex-col items-center justify-center p-2 transition-transform active:scale-95 ${
                      selectedGlyph.meaning === g.meaning
                        ? 'bg-[#fde047] shadow-[4px_4px_0px_#000] scale-105'
                        : 'bg-white hover:bg-amber-50 shadow-[2px_2px_0px_#000]'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl select-none font-serif text-amber-950">
                      {g.symbol}
                    </span>
                    <span className="text-[10px] font-bangers text-slate-900 mt-1 line-clamp-1">
                      {g.ancientName.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Detail Card */}
              <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000] relative">
                <div className="flex items-start justify-between gap-3 border-b-2 border-black/10 pb-3 mb-3">
                  <div>
                    <span className="bg-[#fde047] text-black font-bangers text-xs px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
                      LIPISUTRA CODE
                    </span>
                    <h4 className="text-2xl font-bangers text-slate-950 mt-1">
                      {selectedGlyph.meaning}
                    </h4>
                    <p className="text-xs font-comic font-bold text-amber-900">
                      Ancient Word: <span className="underline">{selectedGlyph.ancientName}</span> • Pronounced: <span className="italic">{selectedGlyph.pronunciation}</span>
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-black flex items-center justify-center text-4xl font-serif text-black shadow-inner shrink-0">
                    {selectedGlyph.symbol}
                  </div>
                </div>

                <div className="bg-[#fef3c7] border-2 border-black/20 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 font-bangers text-xs text-amber-950 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                    <span>ANCIENT SCRIBE'S CHRONICLE:</span>
                  </div>
                  <p className="text-sm font-comic font-bold text-slate-900 leading-relaxed">
                    {selectedGlyph.funFact}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quiz' && (
            <div>
              {!completedQuiz ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-black/10 pb-2">
                    <span className="font-bangers text-sm text-slate-800">
                      QUESTION {quizIndex + 1} OF {TRIVIA_QUESTIONS.length}
                    </span>
                    <span className="font-bangers text-sm text-orange-600 bg-orange-100 border border-black px-2 py-0.5 rounded">
                      SCORE: {score} XP
                    </span>
                  </div>

                  <div className="bg-white border-3 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000]">
                    <h3 className="font-bangers text-lg text-slate-950 mb-3">
                      {TRIVIA_QUESTIONS[quizIndex].question}
                    </h3>

                    <div className="space-y-2">
                      {TRIVIA_QUESTIONS[quizIndex].options.map((opt, idx) => {
                        const isChosen = selectedAnswer === idx;
                        const isCorrect = idx === TRIVIA_QUESTIONS[quizIndex].correctIndex;
                        let btnStyle = 'bg-amber-50 hover:bg-amber-100 text-black border-black';
                        if (selectedAnswer !== null) {
                          if (isCorrect) btnStyle = 'bg-emerald-300 text-black border-black font-bold';
                          else if (isChosen) btnStyle = 'bg-red-300 text-black border-black';
                        }

                        return (
                          <button
                            key={opt}
                            onClick={() => handleAnswerQuiz(idx)}
                            disabled={selectedAnswer !== null}
                            className={`w-full text-left p-3 rounded-xl border-2 font-comic text-sm transition-all shadow-[2px_2px_0px_#000] ${btnStyle}`}
                          >
                            <span className="font-bangers mr-2">{String.fromCharCode(65 + idx)}.</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {selectedAnswer !== null && (
                      <div className="mt-4 pt-3 border-t-2 border-black/10 flex items-center justify-between">
                        <p className="text-xs font-comic font-bold text-slate-800">
                          {TRIVIA_QUESTIONS[quizIndex].explanation}
                        </p>
                        <button
                          onClick={handleNextQuestion}
                          className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bangers text-sm border-2 border-black shadow-[2px_2px_0px_#000] shrink-0 ml-3"
                        >
                          NEXT ➔
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white border-3 border-black rounded-2xl p-6 text-center shadow-[4px_4px_0px_#000] space-y-3">
                  <div className="w-16 h-16 rounded-full bg-yellow-400 border-3 border-black mx-auto flex items-center justify-center text-3xl shadow-[3px_3px_0px_#000]">
                    🏆
                  </div>
                  <h3 className="text-2xl font-bangers text-black">
                    TRIVIA MASTER CONQUERED!
                  </h3>
                  <p className="text-sm font-comic font-bold text-slate-700">
                    You earned <span className="text-orange-600 font-black">{score} XP</span> and unlocked the honorary title of:
                  </p>
                  <div className="inline-block px-4 py-2 bg-yellow-300 border-2 border-black rounded-xl font-bangers text-lg tracking-wider text-black shadow-[3px_3px_0px_#000]">
                    ★ MASTER GANDHARA EPIGRAPHER ★
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        setQuizIndex(0);
                        setSelectedAnswer(null);
                        setCompletedQuiz(false);
                      }}
                      className="mt-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bangers text-sm border-2 border-black hover:bg-slate-800"
                    >
                      PLAY AGAIN
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'chamber' && (
            <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000]">
              <div className="text-center mb-4">
                <span className="bg-amber-300 text-black font-bangers text-xs px-2.5 py-0.5 rounded border border-black">
                  SUN TEMPLE DOOR CODE
                </span>
                <h3 className="text-xl font-bangers text-slate-950 mt-1">
                  ALIGN THE 3 ANCIENT SACRED RUNES
                </h3>
                <p className="text-xs font-comic font-bold text-slate-700">
                  Maya's riddle clue: "First comes the whispering <span className="text-emerald-700 font-bold">Forest (𐨬𐨣)</span>, followed by the carved <span className="text-amber-700 font-bold">Script (𐨫𐨁)</span>, greeting the rising <span className="text-orange-600 font-bold">Sun (𐨯𐨂)</span>."
                </p>
              </div>

              {/* Rune Slots */}
              <div className="flex justify-center gap-3 mb-5">
                {[0, 1, 2].map((idx) => (
                  <div
                    key={idx}
                    className="w-20 h-20 rounded-2xl border-3 border-black bg-amber-50 flex items-center justify-center text-4xl font-serif text-slate-900 shadow-inner"
                  >
                    {chamberRunes[idx] || (
                      <span className="text-slate-300 text-2xl font-bangers">?</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Status */}
              {chamberUnlocked ? (
                <div className="bg-emerald-100 border-2 border-emerald-600 rounded-xl p-3 text-center mb-4 animate-in zoom-in">
                  <div className="flex items-center justify-center gap-1.5 font-bangers text-emerald-950 text-base">
                    <CheckCircle className="w-5 h-5 text-emerald-700" />
                    <span>DOOR OF THE SUN TEMPLE UNLOCKED! (+250 XP)</span>
                  </div>
                  <p className="text-xs font-comic font-bold text-emerald-900 mt-0.5">
                    Golden light streams through the sanctuary gates illuminating the celestial altar!
                  </p>
                  <button
                    onClick={resetChamber}
                    className="mt-2 text-xs font-bangers px-3 py-1 bg-white border border-black rounded shadow"
                  >
                    RESET RUNES
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {GLYPHS.map((g) => (
                    <button
                      key={g.ancientName}
                      onClick={() => handleAddChamberRune(g.symbol)}
                      disabled={chamberRunes.length >= 3}
                      className="p-2.5 rounded-xl border-2 border-black bg-yellow-200 hover:bg-yellow-300 active:scale-95 transition-all text-center shadow-[2px_2px_0px_#000]"
                    >
                      <div className="text-2xl font-serif text-black">{g.symbol}</div>
                      <div className="text-[9px] font-bangers text-slate-900 mt-0.5 truncate">
                        {g.meaning.split(' ')[1] || g.meaning}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-amber-100 border-t-2 border-black p-3 text-center">
          <p className="text-[11px] font-comic font-bold text-amber-950">
            ★ Inscribed for Vanalipi Junior Explorers • Based on historical Gandharan &amp; Kharosthi inscriptions ★
          </p>
        </div>
      </div>
    </div>
  );
};
