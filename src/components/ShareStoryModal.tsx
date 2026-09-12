import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  X,
  Sparkles,
  BookOpen,
  Link as LinkIcon,
  Smartphone,
} from 'lucide-react';
import { Story } from '../types';
import { getShareableStoryUrl, copyShareableStoryUrl } from '../utils/shareUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  story: Story;
}

export const ShareStoryModal: React.FC<Props> = ({ isOpen, onClose, story }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = getShareableStoryUrl(story);

  const handleCopy = async () => {
    const ok = await copyShareableStoryUrl(story);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleOpenNewTab = () => {
    window.open(shareUrl, '_blank');
  };

  return (
    <div
      id="share-story-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="share-story-modal-card"
        className="relative w-full max-w-lg bg-amber-50 border-4 border-black shadow-[8px_8px_0px_#000] rounded-2xl p-6 sm:p-7 text-slate-900"
      >
        {/* Close Button */}
        <button
          id="close-share-story-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white border-2 border-black hover:bg-amber-200 transition-colors shadow-[2px_2px_0px_#000]"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-black" />
        </button>

        {/* Comic Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-yellow-400 border-3 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center text-slate-950 shrink-0">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-block bg-red-600 text-white font-bangers text-xs px-2.5 py-0.5 rounded-md border-2 border-black tracking-wider uppercase shadow-[2px_2px_0px_#000]">
              Instant Web Share
            </div>
            <h2 className="text-2xl font-black font-heading tracking-tight text-slate-950 mt-0.5">
              Share This Comic Tale!
            </h2>
          </div>
        </div>

        {/* Story Summary Card */}
        <div className="bg-white border-3 border-black shadow-[4px_4px_0px_#000] rounded-xl p-3.5 mb-5 flex items-center gap-3">
          {story.coverImage || story.pages[0]?.imageUrl ? (
            <img
              src={story.coverImage || story.pages[0]?.imageUrl}
              alt={story.title}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-lg object-cover border-2 border-black shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-amber-200 border-2 border-black flex items-center justify-center shrink-0 text-amber-800">
              <BookOpen className="w-7 h-7" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-bangers text-lg text-slate-900 tracking-wide line-clamp-1">
              {story.title}
            </h3>
            <p className="text-xs text-slate-600 line-clamp-1 font-comic">{story.summary}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold bg-amber-100 border border-black px-2 py-0.5 rounded-md">
                {story.pages.length} Pages
              </span>
              <span className="text-[10px] font-bold bg-yellow-200 border border-black px-2 py-0.5 rounded-md">
                {story.category}
              </span>
            </div>
          </div>
        </div>

        {/* How it works info */}
        <div className="bg-yellow-100 border-2 border-black rounded-xl p-3 mb-4 text-xs font-comic font-medium text-slate-800 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            The complete story, including page text, artwork prompts, and interactive sound hot-spots, is serialized securely inside the link hash. Anyone who opens the link can read and enjoy it instantly!
          </span>
        </div>

        {/* URL Display and Copy Button */}
        <div className="space-y-2 mb-5">
          <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
            <LinkIcon className="w-3.5 h-3.5 text-amber-700" />
            Shareable URL (With Story Hash):
          </label>
          <div className="flex items-center gap-2">
            <input
              id="shareable-story-url-input"
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 text-xs font-mono bg-white border-2 border-black rounded-xl text-slate-700 focus:outline-none select-all truncate shadow-[2px_2px_0px_#000]"
            />
            <button
              id="copy-story-share-url-btn"
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-black font-bold text-xs transition-all shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 ${
                copied
                  ? 'bg-emerald-400 text-black'
                  : 'bg-yellow-400 hover:bg-yellow-300 text-black'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t-2 border-black/20">
          <button
            id="test-share-url-tab-btn"
            type="button"
            onClick={handleOpenNewTab}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-amber-800 bg-white border-2 border-black px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_#000] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in New Tab</span>
          </button>

          <button
            id="close-share-modal-done-btn"
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-black text-white font-bold text-xs hover:bg-slate-800 shadow-[3px_3px_0px_#444] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
