import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StoryReader } from './components/StoryReader';
import { IllustrationGeneratorModal } from './components/IllustrationGeneratorModal';
import { CompanionChatDrawer } from './components/CompanionChatDrawer';
import { CreateStoryModal } from './components/CreateStoryModal';
import { StoryLibraryModal } from './components/StoryLibraryModal';
import { CharacterCreatorModal } from './components/CharacterCreatorModal';
import { ShareStoryModal } from './components/ShareStoryModal';
import { PrintStoryModal } from './components/PrintStoryModal';
import { PrintableComicBook } from './components/PrintableComicBook';
import { INITIAL_STORIES } from './data/initialStories';
import { Story, StoryPage, VoiceName, ImageSize, AspectRatio, CustomProtagonist } from './types';
import { deserializeStoryFromHash } from './utils/shareUtils';
import { Sparkles } from 'lucide-react';

const STORAGE_KEY = 'vanalipi_stories_v3';
const LEGACY_STORAGE_KEY = 'wondertales_stories_v2';
const PROTAGONIST_STORAGE_KEY = 'vanalipi_protagonist_v2';
const LEGACY_PROTAGONIST_STORAGE_KEY = 'wondertales_protagonist_v1';

// Default starter protagonist
const DEFAULT_PROTAGONIST: CustomProtagonist = {
  id: 'hero-maya',
  name: 'Maya Explorer',
  species: 'human-kid',
  hairStyle: 'curly-afro-puffs',
  hairColor: 'chestnut-brown',
  skinTone: 'warm-honey',
  facialFeature: 'sparkly-eyes',
  clothing: 'explorer-vest',
  outfitColor: 'sunburst-gold',
  accessory: 'starlight-badge',
  description: 'Maya Explorer, a brave and curious young adventurer kid with warm honey skin, sparkling wide eyes, blue explorer attire, and an enchanted magnifying glass deciphering the ancient Lipisutra sun temples.',
};

export default function App() {
  const [stories, setStories] = useState<Story[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Always ensure vanalipi-lipisutra is available at the front
          const hasVanalipi = parsed.some((s: Story) => s.id === 'vanalipi-lipisutra');
          if (!hasVanalipi) {
            return [INITIAL_STORIES[0], ...parsed];
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load stored stories:', e);
    }
    return INITIAL_STORIES;
  });

  const [currentProtagonist, setCurrentProtagonist] = useState<CustomProtagonist | null>(() => {
    try {
      const saved = localStorage.getItem(PROTAGONIST_STORAGE_KEY) || localStorage.getItem(LEGACY_PROTAGONIST_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed;
      }
    } catch (e) {
      console.warn('Could not load stored protagonist:', e);
    }
    return DEFAULT_PROTAGONIST;
  });

  const [currentStoryId, setCurrentStoryId] = useState<string>('vanalipi-lipisutra');
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>('Kore');
  const [fontSize, setFontSize] = useState<number>(20);

  // Modals & Drawers state
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [isIllustrationModalOpen, setIsIllustrationModalOpen] = useState(false);
  const [isCompanionChatOpen, setIsCompanionChatOpen] = useState(false);
  const [isCharacterCreatorOpen, setIsCharacterCreatorOpen] = useState(false);
  const [isShareStoryOpen, setIsShareStoryOpen] = useState(false);
  const [isPrintStoryOpen, setIsPrintStoryOpen] = useState(false);

  // Print settings
  const [printScope, setPrintScope] = useState<'current' | 'all'>('current');
  const [printColoringMode, setPrintColoringMode] = useState(false);

  const [isGeneratingIllustration, setIsGeneratingIllustration] = useState(false);
  const [isTTSPlayingGlobal, setIsTTSPlayingGlobal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save stories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
    } catch (e) {
      console.warn('Could not save stories to localStorage:', e);
    }
  }, [stories]);

  // Save protagonist to localStorage
  useEffect(() => {
    try {
      if (currentProtagonist) {
        localStorage.setItem(PROTAGONIST_STORAGE_KEY, JSON.stringify(currentProtagonist));
      }
    } catch (e) {
      console.warn('Could not save protagonist to localStorage:', e);
    }
  }, [currentProtagonist]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Check URL hash for shared story on mount and on hash change
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash && window.location.hash.includes('#story=')) {
        const sharedStory = deserializeStoryFromHash(window.location.hash);
        if (sharedStory) {
          setStories((prev) => {
            const index = prev.findIndex((s) => s.id === sharedStory.id);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = sharedStory;
              return updated;
            }
            return [sharedStory, ...prev];
          });
          setCurrentStoryId(sharedStory.id);
          setCurrentPageIndex(0);
          showToast(`🎉 Shared comic "${sharedStory.title}" loaded!`);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const currentStory = stories.find((s) => s.id === currentStoryId) || stories[0];
  const currentPage = currentStory?.pages[currentPageIndex] || currentStory?.pages[0];

  /**
   * Save user voice recording for a specific page
   */
  const handleSavePageRecording = (pageIndex: number, audioUrl: string, duration: number) => {
    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== currentStory.id) return s;
        const updatedPages = [...s.pages];
        updatedPages[pageIndex] = {
          ...updatedPages[pageIndex],
          userRecordingUrl: audioUrl,
          userRecordingDuration: duration,
        };
        return { ...s, pages: updatedPages };
      })
    );
    showToast(`🎙️ Custom voice recording saved for Page ${pageIndex + 1}!`);
  };

  /**
   * Delete user voice recording for a specific page
   */
  const handleDeletePageRecording = (pageIndex: number) => {
    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== currentStory.id) return s;
        const updatedPages = [...s.pages];
        const page = { ...updatedPages[pageIndex] };
        delete page.userRecordingUrl;
        delete page.userRecordingDuration;
        updatedPages[pageIndex] = page;
        return { ...s, pages: updatedPages };
      })
    );
    showToast(`🗑️ Voice recording removed for Page ${pageIndex + 1}`);
  };

  /**
   * Save designed character protagonist
   */
  const handleSaveProtagonist = (character: CustomProtagonist) => {
    setCurrentProtagonist(character);
    showToast(`⭐ Hero "${character.name}" is now the star of your stories!`);
  };

  /**
   * Print story with custom options
   */
  const handleConfirmPrint = (mode: 'current' | 'all', coloringBook: boolean) => {
    setPrintScope(mode);
    setPrintColoringMode(coloringBook);
    // Allow DOM to update printable contents before calling print
    setTimeout(() => {
      window.print();
    }, 250);
  };

  /**
   * Generates TTS audio for a specific page using gemini-3.1-flash-tts-preview
   */
  const handleGenerateAudioForPage = async (
    pageIndex: number,
    voice: VoiceName,
    style: string = 'cheerful'
  ): Promise<string | undefined> => {
    const pageToRead = currentStory.pages[pageIndex];
    if (!pageToRead) return undefined;

    setIsTTSPlayingGlobal(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: pageToRead.text,
          voice,
          promptStyle: style,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `TTS server error (${res.status})`);
      }

      const data = await res.json();
      const audioUrl = data.audioUrl;

      setStories((prev) =>
        prev.map((s) => {
          if (s.id !== currentStory.id) return s;
          const updatedPages = [...s.pages];
          updatedPages[pageIndex] = {
            ...updatedPages[pageIndex],
            audioUrl,
          };
          return { ...s, pages: updatedPages };
        })
      );

      return audioUrl;
    } catch (err: any) {
      console.error('Error generating audio:', err);
      showToast('Narration issue: Using browser speech fallback');

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(pageToRead.text);
        utterance.rate = 0.9;
        utterance.pitch = 1.05;
        window.speechSynthesis.speak(utterance);
      }
      return undefined;
    } finally {
      setIsTTSPlayingGlobal(false);
    }
  };

  /**
   * Generates TTS audio for custom text (e.g. Chatbot message read aloud)
   */
  const handlePlayTTSGeneral = async (text: string, voice: VoiceName = selectedVoice) => {
    setIsTTSPlayingGlobal(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice,
          promptStyle: 'cheerful',
        }),
      });

      if (!res.ok) {
        throw new Error(`TTS server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        await audio.play();
      }
    } catch (err) {
      console.warn('TTS general error, fallback to speech synthesis:', err);
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } finally {
      setIsTTSPlayingGlobal(false);
    }
  };

  /**
   * Generates new illustration for current page using gemini-3-pro-image-preview
   */
  const handleGenerateIllustration = async (
    prompt: string,
    imageSize: ImageSize,
    aspectRatio: AspectRatio,
    artStyle: string,
    protagonistDescription?: string
  ) => {
    setIsGeneratingIllustration(true);

    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== currentStory.id) return s;
        const updatedPages = [...s.pages];
        updatedPages[currentPageIndex] = {
          ...updatedPages[currentPageIndex],
          isGeneratingImage: true,
          imageSize,
          aspectRatio,
        };
        return { ...s, pages: updatedPages };
      })
    );

    try {
      const res = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          imageSize,
          aspectRatio,
          artStyle,
          protagonistDescription: protagonistDescription || currentProtagonist?.description || '',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Image generation failed (${res.status})`);
      }

      const data = await res.json();

      setStories((prev) =>
        prev.map((s) => {
          if (s.id !== currentStory.id) return s;
          const updatedPages = [...s.pages];
          updatedPages[currentPageIndex] = {
            ...updatedPages[currentPageIndex],
            imageUrl: data.imageUrl,
            imageSize,
            aspectRatio,
            illustrationPrompt: prompt,
            isGeneratingImage: false,
          };
          return { ...s, pages: updatedPages };
        })
      );

      showToast(`✨ Painted new ${imageSize} comic art featuring ${currentProtagonist?.name || 'hero'}!`);
    } catch (err: any) {
      console.error('Illustration error:', err);
      showToast('Could not paint illustration. Please check connection and try again.');

      setStories((prev) =>
        prev.map((s) => {
          if (s.id !== currentStory.id) return s;
          const updatedPages = [...s.pages];
          updatedPages[currentPageIndex] = {
            ...updatedPages[currentPageIndex],
            isGeneratingImage: false,
          };
          return { ...s, pages: updatedPages };
        })
      );
    } finally {
      setIsGeneratingIllustration(false);
    }
  };

  const handleStoryCreated = (newStory: Story) => {
    setStories((prev) => [newStory, ...prev]);
    setCurrentStoryId(newStory.id);
    setCurrentPageIndex(0);
    showToast(`🎉 "${newStory.title}" has been created!`);
  };

  const handleSelectStory = (story: Story) => {
    setCurrentStoryId(story.id);
    setCurrentPageIndex(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 text-slate-800">
      {/* Top Navigation */}
      <Navbar
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenCreateStory={() => setIsCreateStoryOpen(true)}
        onOpenCompanionChat={() => setIsCompanionChatOpen(true)}
        onOpenCharacterCreator={() => setIsCharacterCreatorOpen(true)}
        onOpenShareStory={() => setIsShareStoryOpen(true)}
        onOpenPrintStory={() => setIsPrintStoryOpen(true)}
        storyTitle={currentStory.title}
        selectedVoice={selectedVoice}
        currentProtagonist={currentProtagonist}
      />

      {/* Main Story Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
        <StoryReader
          story={currentStory}
          currentPageIndex={currentPageIndex}
          onPageChange={setCurrentPageIndex}
          selectedVoice={selectedVoice}
          onVoiceChange={setSelectedVoice}
          onOpenIllustrationModal={() => setIsIllustrationModalOpen(true)}
          onOpenCompanionChat={() => setIsCompanionChatOpen(true)}
          onGenerateAudioForPage={handleGenerateAudioForPage}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          onSavePageRecording={handleSavePageRecording}
          onDeletePageRecording={handleDeletePageRecording}
          currentProtagonist={currentProtagonist}
          onOpenCharacterCreator={() => setIsCharacterCreatorOpen(true)}
          onOpenShareStory={() => setIsShareStoryOpen(true)}
          onOpenPrintStory={() => setIsPrintStoryOpen(true)}
        />
      </main>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          id="toast-notification-banner"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black text-yellow-300 text-sm font-bangers tracking-wider px-5 py-2.5 rounded-2xl shadow-[4px_4px_0px_#000] border-2 border-yellow-400 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3"
        >
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINTABLE COMIC BOOK (Rendered only during window.print())                */}
      {/* ========================================================================= */}
      <PrintableComicBook
        story={currentStory}
        currentProtagonist={currentProtagonist}
        printMode={printScope}
        currentPageIndex={currentPageIndex}
        coloringBookMode={printColoringMode}
      />

      {/* Modals & Drawers */}
      <ShareStoryModal
        isOpen={isShareStoryOpen}
        onClose={() => setIsShareStoryOpen(false)}
        story={currentStory}
      />

      <PrintStoryModal
        isOpen={isPrintStoryOpen}
        onClose={() => setIsPrintStoryOpen(false)}
        story={currentStory}
        currentPageIndex={currentPageIndex}
        onConfirmPrint={handleConfirmPrint}
      />

      <IllustrationGeneratorModal
        isOpen={isIllustrationModalOpen}
        onClose={() => setIsIllustrationModalOpen(false)}
        pageNumber={currentPage?.pageNumber || 1}
        currentPrompt={currentPage?.illustrationPrompt || ''}
        currentSize={currentPage?.imageSize || '1K'}
        currentRatio={currentPage?.aspectRatio || '4:3'}
        onGenerate={handleGenerateIllustration}
        isGenerating={isGeneratingIllustration}
        currentProtagonist={currentProtagonist}
      />

      <CompanionChatDrawer
        isOpen={isCompanionChatOpen}
        onClose={() => setIsCompanionChatOpen(false)}
        activePageText={currentPage?.text}
        activeStoryTitle={currentStory.title}
        selectedVoice={selectedVoice}
        onPlayTTS={handlePlayTTSGeneral}
        isTTSPlaying={isTTSPlayingGlobal}
      />

      <CreateStoryModal
        isOpen={isCreateStoryOpen}
        onClose={() => setIsCreateStoryOpen(false)}
        onStoryCreated={handleStoryCreated}
        currentProtagonist={currentProtagonist}
      />

      <StoryLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        stories={stories}
        currentStoryId={currentStory.id}
        onSelectStory={handleSelectStory}
        onOpenCreateStory={() => setIsCreateStoryOpen(true)}
      />

      <CharacterCreatorModal
        isOpen={isCharacterCreatorOpen}
        onClose={() => setIsCharacterCreatorOpen(false)}
        onSaveCharacter={handleSaveProtagonist}
        currentCharacter={currentProtagonist}
      />
    </div>
  );
}
