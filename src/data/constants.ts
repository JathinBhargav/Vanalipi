import { VoiceOption, CompanionInfo, ArtStyleOption } from '../types';

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'Kore',
    name: 'Kore',
    label: 'Auntie Kore',
    description: 'Warm, expressive, and nurturing storyteller',
    style: 'cheerful',
  },
  {
    id: 'Puck',
    name: 'Puck',
    label: 'Pip & Puck',
    description: 'Bubbly, energetic, and playful narrator',
    style: 'energetic',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    label: 'Zephyr Cloud',
    description: 'Gentle, soothing, and cozy bedtime voice',
    style: 'calm',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    label: 'Captain Fenrir',
    description: 'Rich, adventurous, and grand fairytale guide',
    style: 'cheerful',
  },
  {
    id: 'Charon',
    name: 'Charon',
    label: 'Grandpa Charon',
    description: 'Calm, patient, and wise bedtime reader',
    style: 'calm',
  },
];

export const COMPANIONS: CompanionInfo[] = [
  {
    id: 'barnaby',
    name: 'Barnaby the Owl',
    roleTitle: 'Wise Story Explainer & Vocabulary Guide',
    avatarIcon: '🦉',
    color: 'bg-amber-100 border-amber-300 text-amber-900',
    badge: 'Complex Reasoning (Gemini 3.1 Pro)',
    recommendedModel: 'gemini-3.1-pro-preview',
    modelTaskTag: 'Complex Reasoning',
    description: 'Loves deep questions, explains big words simply, and discusses character feelings and life lessons.',
    sampleQuestions: [
      'What was the moral lesson of this page?',
      'Can you explain what "bioluminescent" means?',
      'Why do you think Oliver felt lonely at first?',
      'How did Oliver turn his difference into a strength?',
    ],
  },
  {
    id: 'pip',
    name: 'Pip the Sprite',
    roleTitle: 'Playful Story Weaver & Co-Creator',
    avatarIcon: '✨',
    color: 'bg-indigo-100 border-indigo-300 text-indigo-900',
    badge: 'General Tasks (Gemini 3.5 Flash)',
    recommendedModel: 'gemini-3.5-flash',
    modelTaskTag: 'General Conversation',
    description: 'Brimming with fun story ideas! Helps you imagine what happens next and invent silly adventures.',
    sampleQuestions: [
      'What if a rainbow butterfly joined the adventure?',
      'Help me invent a magic spell for Oliver!',
      'What funny sound would the cloud kittens make?',
      'Can you write a 2-line rhyming poem about this scene?',
    ],
  },
  {
    id: 'dash',
    name: 'Dash the Bunny',
    roleTitle: 'Lightning Fast Word & Rhyme Pal',
    avatarIcon: '⚡',
    color: 'bg-emerald-100 border-emerald-300 text-emerald-900',
    badge: 'Fast Tasks (Gemini 3.1 Flash Lite)',
    recommendedModel: 'gemini-3.1-flash-lite',
    modelTaskTag: 'Fast Answers',
    description: 'Zippy and energetic! Gives instant rhymes, speedy riddles, and lightning-fast definitions.',
    sampleQuestions: [
      'Fast! Give me 3 words that rhyme with "glow"!',
      'Tell me a super quick riddle about a dragon!',
      'Quick fun animal fact for kids!',
      'What rhymes with star, far, and jar?',
    ],
  },
];

export const ART_STYLES: ArtStyleOption[] = [
  {
    id: 'vibrant watercolor storybook',
    name: 'Watercolor Storybook',
    description: 'Soft flowing colors, whimsical edges, glowing highlights',
    badge: 'Classic & Cozy',
  },
  {
    id: 'warm whimsical gouache',
    name: 'Warm Gouache Paint',
    description: 'Opaque velvety brushstrokes, folk-tale charm, rich warmth',
    badge: 'Charming & Rich',
  },
  {
    id: 'claymation and 3D miniature style',
    name: '3D Clay & Miniature',
    description: 'Playful clay textures, soft toy lighting, tactile depth',
    badge: 'Fun & Tactile',
  },
  {
    id: 'chalk pastel and crayon magic',
    name: 'Chalk & Crayon Art',
    description: 'Dreamy soft textures, handwritten warmth, innocent glow',
    badge: 'Dreamy & Sweet',
  },
  {
    id: 'golden age classic fairy tale illustration',
    name: 'Classic Vintage Tale',
    description: 'Timeless detailed line art, soft parchment tones, royal aura',
    badge: 'Vintage Magic',
  },
];

export const IMAGE_SIZES: { value: '1K' | '2K' | '4K'; label: string; desc: string }[] = [
  { value: '1K', label: '1K Standard', desc: 'Fastest generation, perfect for quick reading' },
  { value: '2K', label: '2K High Definition', desc: 'Crisp vibrant details for tablets & desktop' },
  { value: '4K', label: '4K Ultra Vivid', desc: 'Maximum picture book quality & fine textures' },
];
