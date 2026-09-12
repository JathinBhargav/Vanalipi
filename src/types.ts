export type InteractiveSoundType =
  | 'chirp'
  | 'wiggle'
  | 'twinkle'
  | 'boing'
  | 'giggle'
  | 'flutter'
  | 'splash'
  | 'roar'
  | 'chime'
  | 'purr';

export type InteractiveAnimationType = 'wiggle' | 'bounce' | 'spin' | 'float' | 'sparkle' | 'pulse';

export interface InteractiveElement {
  id: string;
  label: string;
  icon: string;
  x: number; // percentage from left (0 - 100)
  y: number; // percentage from top (0 - 100)
  soundType: InteractiveSoundType;
  animation: InteractiveAnimationType;
  soundDescription: string;
}

export interface CustomProtagonist {
  id: string;
  name: string;
  species: string;
  hairStyle: string;
  hairColor: string;
  skinTone: string;
  facialFeature: string;
  clothing: string;
  outfitColor: string;
  accessory: string;
  description: string;
}

export interface StoryPage {
  pageNumber: number;
  text: string;
  illustrationPrompt: string;
  imageUrl?: string;
  audioUrl?: string;
  userRecordingUrl?: string;
  userRecordingDuration?: number;
  interactiveElements?: InteractiveElement[];
  imageSize?: '1K' | '2K' | '4K';
  aspectRatio?: '4:3' | '1:1' | '16:9' | '3:4';
  isGeneratingImage?: boolean;
  isGeneratingAudio?: boolean;
  error?: string;
}

export interface Story {
  id: string;
  title: string;
  summary: string;
  category: string;
  targetAge: string;
  artStyle: string;
  coverImage?: string;
  pages: StoryPage[];
  isCustom?: boolean;
}

export type VoiceName = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

export interface VoiceOption {
  id: VoiceName;
  name: string;
  label: string;
  description: string;
  style: string;
}

export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = '4:3' | '1:1' | '16:9' | '3:4';

export interface ArtStyleOption {
  id: string;
  name: string;
  description: string;
  badge: string;
}

export type CompanionId = 'barnaby' | 'pip' | 'dash';

export interface CompanionInfo {
  id: CompanionId;
  name: string;
  roleTitle: string;
  avatarIcon: string;
  color: string;
  badge: string;
  recommendedModel: 'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite';
  modelTaskTag: 'Complex Reasoning' | 'General Conversation' | 'Fast Answers';
  description: string;
  sampleQuestions: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  companionId?: CompanionId;
  modelUsed?: string;
  audioUrl?: string;
  isSpeaking?: boolean;
}
