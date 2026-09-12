export interface OptionItem {
  id: string;
  name: string;
  description: string;
  icon?: string;
  colorHex?: string;
}

export const CHARACTER_SPECIES: OptionItem[] = [
  { id: 'human-kid', name: 'Adventurous Child', description: 'Curious, brave, and full of wonder', icon: '🧑‍🚀' },
  { id: 'star-bunny', name: 'Celestial Bunny', description: 'Long fluffy ears with twinkling star patterns', icon: '🐰' },
  { id: 'baby-dragon', name: 'Little Starlight Dragon', description: 'Gentle sparkling wings and a warm glowing tail', icon: '🐉' },
  { id: 'forest-fox', name: 'Clever Red Fox', description: 'Bushy tail, sharp ears, and friendly grin', icon: '🦊' },
  { id: 'cozy-panda', name: 'Gentle Baby Panda', description: 'Round fluffy belly, plays music and loves tea', icon: '🐼' },
  { id: 'cloud-sprite', name: 'Glow Sprite', description: 'Wings like dragonfly glass and floating stardust', icon: '🧚' },
];

export const HAIRSTYLES: OptionItem[] = [
  { id: 'curly-afro-puffs', name: 'Double Curly Puffs', description: 'Bouncy, round double puffs of curls' },
  { id: 'braided-explorer', name: 'Adventurer Braids', description: 'Neat, braided adventure strands' },
  { id: 'spiky-star', name: 'Spiky Pixie', description: 'Cheerful spiky hair styled like a star' },
  { id: 'wavy-shoulder', name: 'Soft Wavy Locks', description: 'Gentle shoulder-length wavy curls' },
  { id: 'cozy-beanie', name: 'Cozy Winter Beanie', description: 'Warm knit cap with tufts of hair peeking out' },
  { id: 'neat-bob', name: 'Cute Classic Bob', description: 'Sweet rounded bob cut with straight bangs' },
  { id: 'wild-curls', name: 'Brave Lion Curls', description: 'Big, joyous voluminous curls' },
];

export const HAIR_COLORS: OptionItem[] = [
  { id: 'honey-gold', name: 'Golden Honey', description: 'Bright sunny golden blonde', colorHex: '#F59E0B' },
  { id: 'chestnut-brown', name: 'Chestnut Brown', description: 'Warm rich autumn brown', colorHex: '#78350F' },
  { id: 'midnight-black', name: 'Midnight Raven', description: 'Deep starry raven black', colorHex: '#0F172A' },
  { id: 'ruby-auburn', name: 'Ruby Auburn', description: 'Fiery cheerful auburn ginger', colorHex: '#DC2626' },
  { id: 'lavender-violet', name: 'Enchanted Lilac', description: 'Soft pastel purple starlight', colorHex: '#A855F7' },
  { id: 'ocean-blue', name: 'Deep Sea Blue', description: 'Vibrant ocean turquoise blue', colorHex: '#2563EB' },
  { id: 'cotton-candy', name: 'Pastel Pink', description: 'Sweet strawberry cotton candy', colorHex: '#EC4899' },
];

export const SKIN_TONES: OptionItem[] = [
  { id: 'fair-peach', name: 'Peachy Warm', description: 'Soft sunlit peachy tone', colorHex: '#FCEADE' },
  { id: 'warm-honey', name: 'Honey Amber', description: 'Golden warm honey tone', colorHex: '#F5D0A9' },
  { id: 'caramel-gold', name: 'Caramel Sun', description: 'Rich sun-kissed caramel tone', colorHex: '#D4A373' },
  { id: 'rich-cocoa', name: 'Rich Cocoa', description: 'Deep velvet warm brown tone', colorHex: '#8D5524' },
  { id: 'deep-espresso', name: 'Deep Espresso', description: 'Warm dark chocolate tone', colorHex: '#4A2810' },
  { id: 'starlight-blue', name: 'Starlight Moon', description: 'Pale ethereal celestial blue', colorHex: '#BAE6FD' },
  { id: 'mint-fairy', name: 'Mint Meadow', description: 'Whimsical pastel green fairy tone', colorHex: '#D1FAE5' },
];

export const FACIAL_FEATURES: OptionItem[] = [
  { id: 'sparkly-eyes', name: 'Wide Sparkly Eyes & Cheerful Grin', description: 'Big expressive cartoon eyes with starry reflection', icon: '✨' },
  { id: 'cute-freckles', name: 'Sun Freckles & Rosy Cheeks', description: 'Adorable cluster of freckles across the nose', icon: '☀️' },
  { id: 'star-glasses', name: 'Round Wonder Glasses', description: 'Charming round tortoiseshell glasses', icon: '👓' },
  { id: 'adventurer-goggles', name: 'Brass Aviator Goggles', description: 'Perched on forehead ready for high flying', icon: '🥽' },
  { id: 'rosy-dimples', name: 'Cute Dimples & Heart Smile', description: 'Warm sweet dimpled smile', icon: '💖' },
];

export const CLOTHING_OPTIONS: OptionItem[] = [
  { id: 'explorer-vest', name: 'Explorer Vest & Pocket Bag', description: 'Canvas expedition vest with pockets for treasures' },
  { id: 'wizard-cape', name: 'Starry Wizard Cape', description: 'Magical cloak embroidered with golden constellation stars' },
  { id: 'cozy-knit-sweater', name: 'Cozy Patchwork Sweater', description: 'Warm knitted chunky sweater with soft stripes' },
  { id: 'artist-overalls', name: 'Painter Dungarees', description: 'Classic denim overalls with paint splashes and notebook' },
  { id: 'superhero-tunic', name: 'Courage Hero Tunic', description: 'Hero tunic with a flowing gold-lined cape' },
  { id: 'astro-jumpsuit', name: 'Starlight Cadet Suit', description: 'Cozy retro space adventurer jumpsuit' },
];

export const OUTFIT_COLORS: OptionItem[] = [
  { id: 'sunburst-gold', name: 'Sunburst Gold', description: 'Warm sunny golden yellow', colorHex: '#EAB308' },
  { id: 'emerald-green', name: 'Forest Emerald', description: 'Lush woodland moss green', colorHex: '#10B981' },
  { id: 'sapphire-blue', name: 'Royal Sapphire', description: 'Bold enchanted night blue', colorHex: '#2563EB' },
  { id: 'coral-tangerine', name: 'Tangerine Coral', description: 'Playful warm orange coral', colorHex: '#F97316' },
  { id: 'twilight-purple', name: 'Twilight Amethyst', description: 'Dreamy evening purple', colorHex: '#8B5CF6' },
  { id: 'berry-red', name: 'Sweet Raspberry', description: 'Vibrant cheerful berry red', colorHex: '#E11D48' },
];

export const ACCESSORIES: OptionItem[] = [
  { id: 'pocket-compass', name: 'Antique Golden Compass', description: 'Points to kindness and hidden adventures', icon: '🧭' },
  { id: 'star-wand', name: 'Twinkling Star Wand', description: 'Sparks gentle glitter trails in the air', icon: '🪄' },
  { id: 'fairy-lantern', name: 'Glowing Firefly Lantern', description: 'Soft golden jar providing cozy starlight', icon: '🏮' },
  { id: 'mini-backpack', name: 'Leaf Explorer Backpack', description: 'Holds a magnifying glass, apples, and snacks', icon: '🎒' },
  { id: 'flower-crown', name: 'Meadow Flower Crown', description: 'Woven daisies, buttercups, and ivy ribbons', icon: '👑' },
  { id: 'wooden-ukulele', name: 'Mini Wooden Ukulele', description: 'Plays cheerful lullabies and friendly tunes', icon: '🪕' },
];
