import React from 'react';
import { BookOpen, X, Sparkles, Check } from 'lucide-react';
import { Story } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  stories: Story[];
  currentStoryId: string;
  onSelectStory: (story: Story) => void;
  onOpenCreateStory: () => void;
}

export const StoryLibraryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  stories,
  currentStoryId,
  onSelectStory,
  onOpenCreateStory,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="story-library-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
    >
      <div
        id="story-library-modal-card"
        className="relative w-full max-w-3xl bg-amber-50/95 border-2 border-amber-300 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-slate-800"
      >
        <button
          id="close-library-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-amber-200/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-200 text-amber-900 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-amber-950 font-heading">
                Storybook Bookshelf
              </h2>
              <p className="text-sm text-amber-800/80">
                Choose a story to read aloud and explore illustrations!
              </p>
            </div>
          </div>

          <button
            id="open-create-from-library-btn"
            onClick={() => {
              onClose();
              onOpenCreateStory();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            New Story
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {stories.map((story) => {
            const isSelected = story.id === currentStoryId;
            const cover = story.pages[0]?.imageUrl || story.coverImage;
            return (
              <div
                key={story.id}
                id={`story-card-${story.id}`}
                onClick={() => {
                  onSelectStory(story);
                  onClose();
                }}
                className={`group cursor-pointer rounded-2xl border-2 transition-all p-3.5 flex flex-col bg-white overflow-hidden relative ${
                  isSelected
                    ? 'border-amber-600 ring-2 ring-amber-400/50 shadow-md bg-amber-50/40'
                    : 'border-amber-200/80 hover:border-amber-400 hover:shadow-md'
                }`}
              >
                {/* Cover Image Thumbnail */}
                <div className="relative aspect-4/3 rounded-xl overflow-hidden mb-3 bg-amber-100">
                  {cover ? (
                    <img
                      src={cover}
                      alt={story.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-amber-700 font-bold text-sm">
                      📖 Vanalipi
                    </div>
                  )}
                  <span className="absolute top-2 right-2 text-[10px] font-bold bg-slate-900/75 text-white px-2 py-0.5 rounded-full backdrop-blur-xs">
                    {story.pages.length} Pages
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md">
                        {story.category}
                      </span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
                          <Check className="w-3.5 h-3.5" /> Reading Now
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base font-heading line-clamp-1 group-hover:text-amber-700 transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {story.summary}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-amber-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>{story.targetAge}</span>
                    <span className="text-amber-600 font-bold group-hover:translate-x-0.5 transition-transform">
                      Open Book →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
