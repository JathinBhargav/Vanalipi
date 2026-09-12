import React, { useState } from 'react';
import { Sparkles, X, BookOpen, Wand2, RefreshCw, User, Check } from 'lucide-react';
import { ART_STYLES, IMAGE_SIZES } from '../data/constants';
import { Story, ImageSize, CustomProtagonist } from '../types';
import { CharacterAvatar } from './CharacterAvatar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: (newStory: Story) => void;
  currentProtagonist?: CustomProtagonist | null;
}

export const CreateStoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onStoryCreated,
  currentProtagonist,
}) => {
  const [character, setCharacter] = useState(
    currentProtagonist ? `${currentProtagonist.name}, our brave hero` : 'A cheerful baby panda who plays the ukulele'
  );
  const [setting, setSetting] = useState('An enchanted crystal bamboo forest with glowing fireflies');
  const [theme, setTheme] = useState('Friendship, sharing music, and making new friends');
  const [targetAge, setTargetAge] = useState('4-7');
  const [pageCount, setPageCount] = useState(4);
  const [artStyle, setArtStyle] = useState(ART_STYLES[0].id);
  const [defaultImageSize, setDefaultImageSize] = useState<ImageSize>('1K');
  const [useProtagonist, setUseProtagonist] = useState<boolean>(!!currentProtagonist);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const characterSuggestions = [
    '🐼 A cheerful baby panda who plays ukulele',
    '🚀 A curious kitten exploring the moon',
    '🤖 A gentle robot who grows enchanted flowers',
    '🐉 A shy little dragon with rainbow-colored wings',
    '🦊 A clever fox detective solving gentle forest mysteries',
  ];

  const settingSuggestions = [
    '🌲 Crystal bamboo forest with glowing fireflies',
    '☁️ A fluffy pastel kingdom in the clouds',
    '🌊 An underwater glowing coral reef palace',
    '🏰 A cozy treehouse village with rope bridges',
  ];

  const handleGenerateStory = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character,
          setting,
          theme,
          targetAge,
          pageCount,
          artStyle,
          customProtagonist: useProtagonist && currentProtagonist ? currentProtagonist : null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      const newStory: Story = {
        id: `story-${Date.now()}`,
        title: data.title || 'A New Magical Adventure',
        summary: data.summary || `${character} in ${setting}`,
        category: 'Original Tale',
        targetAge: `${targetAge} years`,
        artStyle: data.artStyle || artStyle,
        coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
        isCustom: true,
        pages: (data.pages || []).map((p: any, idx: number) => ({
          pageNumber: p.pageNumber || idx + 1,
          text: p.text || '',
          illustrationPrompt: p.illustrationPrompt || '',
          imageSize: defaultImageSize,
          aspectRatio: '4:3',
          interactiveElements: p.interactiveElements || [
            {
              id: `elem-${idx}-1`,
              label: 'Story Hero',
              icon: '✨',
              x: 48,
              y: 54,
              soundType: 'giggle',
              animation: 'bounce',
              soundDescription: 'Hero giggle!',
            },
            {
              id: `elem-${idx}-2`,
              label: 'Magic Blossom',
              icon: '🌸',
              x: 75,
              y: 68,
              soundType: 'wiggle',
              animation: 'wiggle',
              soundDescription: 'Wiggle wobble bloom!',
            },
            {
              id: `elem-${idx}-3`,
              label: 'Starlight',
              icon: '⭐',
              x: 22,
              y: 24,
              soundType: 'twinkle',
              animation: 'sparkle',
              soundDescription: 'Twinkle chime!',
            },
          ],
        })),
      };

      onStoryCreated(newStory);
      onClose();
    } catch (err: any) {
      console.error('Failed to generate story:', err);
      setErrorMsg(err?.message || 'Could not weave story. Please try again!');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      id="create-story-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
    >
      <div
        id="create-story-modal-card"
        className="relative w-full max-w-2xl bg-amber-50/95 border-2 border-amber-300 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-slate-800"
      >
        <button
          id="close-create-story-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-amber-200/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-200 text-amber-900 rounded-xl">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-amber-950 font-heading">
              Weave a Brand New Magic Story
            </h2>
            <p className="text-sm text-amber-800/80">
              Create a custom children's tale with full AI read-aloud, interactive elements, and illustrations!
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 text-sm rounded-xl">
            {errorMsg}
          </div>
        )}

        <div className="space-y-5">
          {/* Protagonist Integration Option */}
          {currentProtagonist && (
            <div className="p-3.5 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-amber-400 overflow-hidden bg-white shrink-0">
                  <CharacterAvatar character={currentProtagonist} size="sm" showBadge={false} />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <span>Star Your Protagonist:</span>
                    <span className="text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-md">{currentProtagonist.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 line-clamp-1">
                    {currentProtagonist.description}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setUseProtagonist(!useProtagonist);
                  if (!useProtagonist) {
                    setCharacter(`${currentProtagonist.name}, our hero`);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  useProtagonist
                    ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                    : 'bg-white text-slate-700 border-amber-200'
                }`}
              >
                {useProtagonist ? '✓ Starring Hero' : 'Use Hero'}
              </button>
            </div>
          )}

          {/* Main Hero / Character */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Who is the Hero of our Story?
            </label>
            <input
              id="story-hero-input"
              type="text"
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-amber-500 shadow-2xs"
              placeholder="e.g. A tiny puppy who wants to fly..."
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {characterSuggestions.map((char, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCharacter(char.slice(2))}
                  className="text-xs bg-white text-slate-700 hover:bg-amber-100/70 border border-amber-200 rounded-full px-2.5 py-1 transition-colors"
                >
                  {char}
                </button>
              ))}
            </div>
          </div>

          {/* Setting */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Where does the Adventure happen?
            </label>
            <input
              id="story-setting-input"
              type="text"
              value={setting}
              onChange={(e) => setSetting(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-amber-500 shadow-2xs"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {settingSuggestions.map((set, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSetting(set.slice(2))}
                  className="text-xs bg-white text-slate-700 hover:bg-amber-100/70 border border-amber-200 rounded-full px-2.5 py-1 transition-colors"
                >
                  {set}
                </button>
              ))}
            </div>
          </div>

          {/* Moral & Target Age Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Heart &amp; Lesson
              </label>
              <input
                id="story-theme-input"
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-amber-500 shadow-2xs"
                placeholder="e.g. Courage, sharing, kindness"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Age Range
              </label>
              <select
                id="story-age-select"
                value={targetAge}
                onChange={(e) => setTargetAge(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-amber-500 shadow-2xs"
              >
                <option value="3-5">Little Ones (Ages 3-5)</option>
                <option value="4-7">Early Readers (Ages 4-7)</option>
                <option value="7-10">Story Explorers (Ages 7-10)</option>
              </select>
            </div>
          </div>

          {/* Pages & Image Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Number of Pages: <span className="text-amber-800 font-bold">{pageCount} pages</span>
              </label>
              <div className="flex gap-2">
                {[3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPageCount(num)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                      pageCount === num
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Default Illustration Size (Gemini 3 Pro)
              </label>
              <div className="flex gap-2">
                {IMAGE_SIZES.map((sz) => (
                  <button
                    key={sz.value}
                    type="button"
                    onClick={() => setDefaultImageSize(sz.value)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      defaultImageSize === sz.value
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50'
                    }`}
                  >
                    {sz.value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Art Style */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Illustration Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ART_STYLES.slice(0, 3).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setArtStyle(st.id)}
                  className={`p-2.5 text-left rounded-xl border text-xs transition-all ${
                    artStyle === st.id
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold ring-1 ring-indigo-400'
                      : 'bg-white text-slate-700 border-amber-200'
                  }`}
                >
                  <div className="font-semibold">{st.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-amber-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 hover:bg-amber-200/50 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-weave-story-btn"
              type="button"
              disabled={isGenerating || !character.trim()}
              onClick={handleGenerateStory}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Weaving Story with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Magical Story
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
