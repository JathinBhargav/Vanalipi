import React, { useState } from 'react';
import { Sparkles, X, Palette, Image as ImageIcon, Wand2, RefreshCw, User, Check } from 'lucide-react';
import { ART_STYLES, IMAGE_SIZES } from '../data/constants';
import { ImageSize, AspectRatio, CustomProtagonist } from '../types';
import { CharacterAvatar } from './CharacterAvatar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pageNumber: number;
  currentPrompt: string;
  currentSize?: ImageSize;
  currentRatio?: AspectRatio;
  onGenerate: (
    newPrompt: string,
    size: ImageSize,
    ratio: AspectRatio,
    style: string,
    protagonistDescription?: string
  ) => Promise<void>;
  isGenerating: boolean;
  currentProtagonist?: CustomProtagonist | null;
}

export const IllustrationGeneratorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  pageNumber,
  currentPrompt,
  currentSize = '1K',
  currentRatio = '4:3',
  onGenerate,
  isGenerating,
  currentProtagonist,
}) => {
  const [selectedSize, setSelectedSize] = useState<ImageSize>(currentSize);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(currentRatio);
  const [selectedStyle, setSelectedStyle] = useState<string>(ART_STYLES[0].id);
  const [customPrompt, setCustomPrompt] = useState<string>(currentPrompt);
  const [enhancements, setEnhancements] = useState<string[]>([]);
  const [includeProtagonist, setIncludeProtagonist] = useState<boolean>(true);

  if (!isOpen) return null;

  const quickPuffs = [
    '✨ Add glittering stardust',
    '🦋 Add dancing colorful butterflies',
    '🌙 Set under a dreamy twilight sky',
    '🌸 Fill with blooming glowing flowers',
    '🌈 Add a gentle pastel rainbow',
    '🎈 Add whimsical floating balloons',
  ];

  const toggleEnhancement = (puff: string) => {
    if (enhancements.includes(puff)) {
      setEnhancements(enhancements.filter((p) => p !== puff));
    } else {
      setEnhancements([...enhancements, puff]);
    }
  };

  const handleGenerateClick = async () => {
    let finalPrompt = customPrompt.trim();
    if (enhancements.length > 0) {
      finalPrompt += `. Include: ${enhancements.join(', ')}`;
    }

    const protagonistDesc =
      includeProtagonist && currentProtagonist?.description
        ? currentProtagonist.description
        : undefined;

    await onGenerate(finalPrompt, selectedSize, selectedRatio, selectedStyle, protagonistDesc);
    onClose();
  };

  return (
    <div
      id="illustration-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="illustration-modal-card"
        className="relative w-full max-w-2xl bg-amber-50/95 border-2 border-amber-300/80 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-slate-800"
      >
        {/* Close Button */}
        <button
          id="close-illustration-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-amber-200/50 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-amber-200 text-amber-900 rounded-xl shadow-xs">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-amber-950 font-heading">
              Paint New Illustration (Page {pageNumber})
            </h2>
            <p className="text-sm text-amber-800/80">
              Powered by <span className="font-semibold text-amber-900">Gemini 3 Pro Image</span> model
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Protagonist Inclusion Box (if active) */}
          {currentProtagonist && (
            <div className="p-3.5 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-amber-400 overflow-hidden bg-white shrink-0">
                  <CharacterAvatar character={currentProtagonist} size="sm" showBadge={false} />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <span>Feature Your Protagonist:</span>
                    <span className="text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md">{currentProtagonist.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                    {currentProtagonist.description}
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={includeProtagonist}
                  onChange={(e) => setIncludeProtagonist(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-amber-900">Include Hero</span>
              </label>
            </div>
          )}

          {/* Image Size Selection (Required Affordance: 1K, 2K, 4K) */}
          <div id="image-size-selection-group">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                Image Resolution (Size)
              </label>
              <span className="text-xs text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full font-medium">
                Gemini 3 Pro High-Res
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {IMAGE_SIZES.map((sz) => {
                const isSelected = selectedSize === sz.value;
                return (
                  <button
                    key={sz.value}
                    id={`image-size-btn-${sz.value}`}
                    type="button"
                    onClick={() => setSelectedSize(sz.value)}
                    className={`flex flex-col text-left p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-amber-600 bg-amber-100/90 shadow-sm ring-2 ring-amber-400/50'
                        : 'border-amber-200/80 bg-white/70 hover:bg-white hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-base text-amber-950">{sz.value}</span>
                      {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />}
                    </div>
                    <span className="text-xs text-slate-600 line-clamp-2">{sz.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div id="aspect-ratio-group">
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Canvas Shape (Aspect Ratio)
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { val: '4:3' as AspectRatio, label: '4:3 Book Landscape' },
                { val: '1:1' as AspectRatio, label: '1:1 Square Card' },
                { val: '16:9' as AspectRatio, label: '16:9 Cinema Wide' },
                { val: '3:4' as AspectRatio, label: '3:4 Portrait Book' },
              ].map((ratio) => (
                <button
                  key={ratio.val}
                  type="button"
                  id={`ratio-btn-${ratio.val.replace(':', '-')}`}
                  onClick={() => setSelectedRatio(ratio.val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    selectedRatio === ratio.val
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white/80 text-slate-700 border-amber-200 hover:bg-amber-100/60'
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {/* Art Style Selector */}
          <div id="art-style-group">
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Illustration Art Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ART_STYLES.map((style) => {
                const isSelected = selectedStyle === style.id;
                return (
                  <button
                    key={style.id}
                    id={`art-style-btn-${style.id.replace(/\s+/g, '-')}`}
                    type="button"
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-2.5 text-left rounded-xl border transition-all flex items-start justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/90 ring-1 ring-indigo-400'
                        : 'border-amber-200/70 bg-white/70 hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900">{style.name}</div>
                      <div className="text-xs text-slate-600">{style.description}</div>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded-md shrink-0 ml-2">
                      {style.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scene Prompt */}
          <div id="scene-prompt-group">
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Page Scene Description
            </label>
            <textarea
              id="illustration-prompt-input"
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full p-3 rounded-xl border border-amber-300/90 bg-white text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-inner"
              placeholder="Describe what to draw for this page..."
            />
          </div>

          {/* Quick Magical Touches */}
          <div id="quick-enhancements-group">
            <label className="text-xs font-bold text-amber-900 block mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Optional Magic Sprinkles (Click to add):
            </label>
            <div className="flex flex-wrap gap-2">
              {quickPuffs.map((puff) => {
                const isChecked = enhancements.includes(puff);
                return (
                  <button
                    key={puff}
                    type="button"
                    onClick={() => toggleEnhancement(puff)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      isChecked
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-white/90 text-amber-900 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {puff}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              id="cancel-illustration-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 hover:bg-amber-200/50 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-generate-illustration-btn"
              type="button"
              disabled={isGenerating || !customPrompt.trim()}
              onClick={handleGenerateClick}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating {selectedSize} Art...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Paint with Gemini 3 Pro ({selectedSize})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
