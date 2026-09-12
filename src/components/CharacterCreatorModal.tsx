import React, { useState } from 'react';
import { Sparkles, X, Shuffle, Check, User, Wand2, Palette, Shield, Heart } from 'lucide-react';
import { CustomProtagonist } from '../types';
import {
  CHARACTER_SPECIES,
  HAIRSTYLES,
  HAIR_COLORS,
  SKIN_TONES,
  FACIAL_FEATURES,
  CLOTHING_OPTIONS,
  OUTFIT_COLORS,
  ACCESSORIES,
} from '../data/characterOptions';
import { CharacterAvatar } from './CharacterAvatar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentCharacter?: CustomProtagonist | null;
  onSaveCharacter: (character: CustomProtagonist) => void;
}

export const CharacterCreatorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentCharacter,
  onSaveCharacter,
}) => {
  const [activeTab, setActiveTab] = useState<'species' | 'hair' | 'face' | 'outfit' | 'accessory'>('species');

  const [name, setName] = useState(currentCharacter?.name || 'Maya the Starseeker');
  const [species, setSpecies] = useState(currentCharacter?.species || 'human-kid');
  const [hairStyle, setHairStyle] = useState(currentCharacter?.hairStyle || 'curly-afro-puffs');
  const [hairColor, setHairColor] = useState(currentCharacter?.hairColor || 'chestnut-brown');
  const [skinTone, setSkinTone] = useState(currentCharacter?.skinTone || 'warm-honey');
  const [facialFeature, setFacialFeature] = useState(currentCharacter?.facialFeature || 'sparkly-eyes');
  const [clothing, setClothing] = useState(currentCharacter?.clothing || 'explorer-vest');
  const [outfitColor, setOutfitColor] = useState(currentCharacter?.outfitColor || 'sunburst-gold');
  const [accessory, setAccessory] = useState(currentCharacter?.accessory || 'pocket-compass');

  if (!isOpen) return null;

  const currentCharacterDraft: CustomProtagonist = {
    id: currentCharacter?.id || `char-${Date.now()}`,
    name: name.trim() || 'Our Brave Hero',
    species,
    hairStyle,
    hairColor,
    skinTone,
    facialFeature,
    clothing,
    outfitColor,
    accessory,
    description: '',
  };

  const handleRandomize = () => {
    const randomSpecies = CHARACTER_SPECIES[Math.floor(Math.random() * CHARACTER_SPECIES.length)].id;
    const randomHair = HAIRSTYLES[Math.floor(Math.random() * HAIRSTYLES.length)].id;
    const randomHairColor = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].id;
    const randomSkin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)].id;
    const randomFace = FACIAL_FEATURES[Math.floor(Math.random() * FACIAL_FEATURES.length)].id;
    const randomClothing = CLOTHING_OPTIONS[Math.floor(Math.random() * CLOTHING_OPTIONS.length)].id;
    const randomOutfitColor = OUTFIT_COLORS[Math.floor(Math.random() * OUTFIT_COLORS.length)].id;
    const randomAccessory = ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)].id;

    const names = ['Leo Starfall', 'Maya Sunbeam', 'Pip Everglade', 'Luna Starlight', 'Oliver Bright', 'Robin Mosswood', 'Zoe Skyward'];
    const randomName = names[Math.floor(Math.random() * names.length)];

    setName(randomName);
    setSpecies(randomSpecies);
    setHairStyle(randomHair);
    setHairColor(randomHairColor);
    setSkinTone(randomSkin);
    setFacialFeature(randomFace);
    setClothing(randomClothing);
    setOutfitColor(randomOutfitColor);
    setAccessory(randomAccessory);
  };

  const handleSave = () => {
    const speciesObj = CHARACTER_SPECIES.find((s) => s.id === species);
    const hairStyleObj = HAIRSTYLES.find((h) => h.id === hairStyle);
    const hairColorObj = HAIR_COLORS.find((c) => c.id === hairColor);
    const skinToneObj = SKIN_TONES.find((s) => s.id === skinTone);
    const faceObj = FACIAL_FEATURES.find((f) => f.id === facialFeature);
    const clothingObj = CLOTHING_OPTIONS.find((c) => c.id === clothing);
    const outfitColorObj = OUTFIT_COLORS.find((o) => o.id === outfitColor);
    const accessoryObj = ACCESSORIES.find((a) => a.id === accessory);

    const description = `Protagonist: ${name.trim() || 'Hero'}, a ${speciesObj?.name || 'child'} with ${hairStyleObj?.name || 'hair'} in ${hairColorObj?.name || ''}, ${skinToneObj?.name || ''} skin/fur tone, wearing a ${outfitColorObj?.name || ''} ${clothingObj?.name || 'outfit'}, with ${faceObj?.name || ''} and carrying ${accessoryObj?.name || 'accessory'}.`;

    const saved: CustomProtagonist = {
      ...currentCharacterDraft,
      description,
    };

    onSaveCharacter(saved);
    onClose();
  };

  return (
    <div
      id="character-creator-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
    >
      <div
        id="character-creator-modal-card"
        className="relative w-full max-w-4xl bg-amber-50/95 border-2 border-amber-300 rounded-3xl shadow-2xl p-5 sm:p-7 max-h-[92vh] overflow-y-auto text-slate-800 flex flex-col"
      >
        {/* Close Button */}
        <button
          id="close-character-creator-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-amber-200/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-5 pr-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-orange-400 text-white rounded-2xl shadow-md">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-amber-950 font-heading">
                Design Your Story Protagonist
              </h2>
              <p className="text-xs sm:text-sm text-amber-800/80">
                Choose hair, face, clothing &amp; colors. Your hero will appear in Gemini illustrations!
              </p>
            </div>
          </div>

          <button
            id="randomize-character-btn"
            onClick={handleRandomize}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-amber-100/80 text-amber-900 border border-amber-300 font-bold text-xs shadow-2xs transition-colors shrink-0"
            title="Randomize Hero"
          >
            <Shuffle className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Magic Surprise</span>
          </button>
        </div>

        {/* Main Grid: Avatar Stage on Left, Customizer Options on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
          {/* Avatar Preview Card */}
          <div className="lg:col-span-4 bg-white/90 border border-amber-200/90 rounded-2xl p-4 flex flex-col items-center justify-between shadow-2xs">
            <div className="w-full flex flex-col items-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full mb-3">
                Live Hero Preview
              </span>

              {/* Large Avatar */}
              <div className="py-2">
                <CharacterAvatar character={currentCharacterDraft} size="xl" showBadge={true} />
              </div>

              {/* Character Name Input */}
              <div className="w-full mt-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hero Name:
                </label>
                <input
                  id="protagonist-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya the Starseeker"
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-amber-50/50 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 shadow-2xs"
                />
              </div>
            </div>

            {/* Quick Summary Pill */}
            <div className="w-full mt-4 p-2.5 bg-amber-100/50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 leading-snug">
              ✨ <span className="font-semibold">{CHARACTER_SPECIES.find((s) => s.id === species)?.name}</span> with{' '}
              <span className="font-semibold">{HAIRSTYLES.find((h) => h.id === hairStyle)?.name}</span>, dressed in{' '}
              <span className="font-semibold">{OUTFIT_COLORS.find((o) => o.id === outfitColor)?.name}</span>{' '}
              <span className="font-semibold">{CLOTHING_OPTIONS.find((c) => c.id === clothing)?.name}</span>.
            </div>
          </div>

          {/* Customization Controls Panel */}
          <div className="lg:col-span-8 bg-amber-100/40 rounded-2xl border border-amber-200 p-4 sm:p-5 flex flex-col justify-between">
            {/* Customization Tabs */}
            <div className="flex flex-wrap gap-1.5 mb-4 pb-2 border-b border-amber-200/80">
              {[
                { id: 'species', label: '1. Identity', icon: '🧑‍🚀' },
                { id: 'hair', label: '2. Hair & Skin', icon: '💇' },
                { id: 'face', label: '3. Face & Eyes', icon: '✨' },
                { id: 'outfit', label: '4. Clothing & Colors', icon: '👕' },
                { id: 'accessory', label: '5. Magic Accessory', icon: '🪄' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    activeTab === tab.id
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white/80 hover:bg-white text-slate-700 border border-amber-200'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto max-h-[360px] pr-1 space-y-4">
              {/* TAB 1: Identity & Species */}
              {activeTab === 'species' && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                    Choose Hero Archetype &amp; Species
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {CHARACTER_SPECIES.map((sp) => (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => setSpecies(sp.id)}
                        className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                          species === sp.id
                            ? 'bg-amber-100/90 border-amber-600 ring-2 ring-amber-400 shadow-2xs'
                            : 'bg-white hover:bg-amber-50 border-amber-200'
                        }`}
                      >
                        <span className="text-2xl p-1 bg-amber-50 rounded-lg">{sp.icon}</span>
                        <div>
                          <div className="font-bold text-xs text-slate-900">{sp.name}</div>
                          <div className="text-[11px] text-slate-600 leading-tight mt-0.5">
                            {sp.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: Hair & Skin */}
              {activeTab === 'hair' && (
                <div className="space-y-4">
                  {/* Skin Tone */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Skin &amp; Fur Tone
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {SKIN_TONES.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setSkinTone(st.id)}
                          title={st.name}
                          className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                            skinTone === st.id
                              ? 'bg-white border-amber-600 ring-2 ring-amber-400 shadow-2xs'
                              : 'bg-white/80 hover:bg-white border-amber-200'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-slate-300 shadow-inner"
                            style={{ backgroundColor: st.colorHex }}
                          />
                          <span className="text-slate-800">{st.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hair Style */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Hairstyle
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {HAIRSTYLES.map((hs) => (
                        <button
                          key={hs.id}
                          type="button"
                          onClick={() => setHairStyle(hs.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            hairStyle === hs.id
                              ? 'bg-amber-100/90 border-amber-600 ring-2 ring-amber-400 shadow-2xs'
                              : 'bg-white hover:bg-amber-50 border-amber-200'
                          }`}
                        >
                          <div className="font-bold text-xs text-slate-900">{hs.name}</div>
                          <div className="text-[10px] text-slate-600 mt-0.5">{hs.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hair Color */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Hair &amp; Mane Color
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {HAIR_COLORS.map((hc) => (
                        <button
                          key={hc.id}
                          type="button"
                          onClick={() => setHairColor(hc.id)}
                          title={hc.name}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                            hairColor === hc.id
                              ? 'bg-white border-amber-600 ring-2 ring-amber-400 shadow-2xs'
                              : 'bg-white/80 hover:bg-white border-amber-200'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-slate-300 shadow-inner"
                            style={{ backgroundColor: hc.colorHex }}
                          />
                          <span className="text-slate-800">{hc.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Face & Eyes */}
              {activeTab === 'face' && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                    Facial Features &amp; Glasses
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {FACIAL_FEATURES.map((ff) => (
                      <button
                        key={ff.id}
                        type="button"
                        onClick={() => setFacialFeature(ff.id)}
                        className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                          facialFeature === ff.id
                            ? 'bg-amber-100/90 border-amber-600 ring-2 ring-amber-400 shadow-2xs'
                            : 'bg-white hover:bg-amber-50 border-amber-200'
                        }`}
                      >
                        <span className="text-xl p-1 bg-amber-50 rounded-lg">{ff.icon}</span>
                        <div>
                          <div className="font-bold text-xs text-slate-900">{ff.name}</div>
                          <div className="text-[11px] text-slate-600 leading-tight mt-0.5">
                            {ff.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: Clothing & Colors */}
              {activeTab === 'outfit' && (
                <div className="space-y-4">
                  {/* Outfit Style */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Clothing Style
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {CLOTHING_OPTIONS.map((co) => (
                        <button
                          key={co.id}
                          type="button"
                          onClick={() => setClothing(co.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            clothing === co.id
                              ? 'bg-amber-100/90 border-amber-600 ring-2 ring-amber-400 shadow-2xs'
                              : 'bg-white hover:bg-amber-50 border-amber-200'
                          }`}
                        >
                          <div className="font-bold text-xs text-slate-900">{co.name}</div>
                          <div className="text-[10px] text-slate-600 mt-0.5">{co.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Outfit Color Palette */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Outfit Color Palette
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {OUTFIT_COLORS.map((oc) => (
                        <button
                          key={oc.id}
                          type="button"
                          onClick={() => setOutfitColor(oc.id)}
                          title={oc.name}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                            outfitColor === oc.id
                              ? 'bg-white border-amber-600 ring-2 ring-amber-400 shadow-2xs'
                              : 'bg-white/80 hover:bg-white border-amber-200'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-slate-300 shadow-inner"
                            style={{ backgroundColor: oc.colorHex }}
                          />
                          <span className="text-slate-800">{oc.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Magic Accessory */}
              {activeTab === 'accessory' && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                    Choose a Special Magic Item
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ACCESSORIES.map((ac) => (
                      <button
                        key={ac.id}
                        type="button"
                        onClick={() => setAccessory(ac.id)}
                        className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                          accessory === ac.id
                            ? 'bg-amber-100/90 border-amber-600 ring-2 ring-amber-400 shadow-2xs'
                            : 'bg-white hover:bg-amber-50 border-amber-200'
                        }`}
                      >
                        <span className="text-2xl p-1 bg-amber-50 rounded-lg">{ac.icon}</span>
                        <div>
                          <div className="font-bold text-xs text-slate-900">{ac.name}</div>
                          <div className="text-[11px] text-slate-600 leading-tight mt-0.5">
                            {ac.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer Actions */}
            <div className="mt-4 pt-3 flex items-center justify-between border-t border-amber-200/80">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-amber-200/50 font-semibold text-xs sm:text-sm"
              >
                Cancel
              </button>

              <button
                id="save-protagonist-btn"
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Save Hero &amp; Star in Stories</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
