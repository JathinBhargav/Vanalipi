import React from 'react';
import { CustomProtagonist } from '../types';
import {
  HAIR_COLORS,
  SKIN_TONES,
  OUTFIT_COLORS,
  ACCESSORIES,
} from '../data/characterOptions';

interface Props {
  character: CustomProtagonist;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
}

export const CharacterAvatar: React.FC<Props> = ({ character, size = 'md', showBadge = true }) => {
  const skinObj = SKIN_TONES.find((s) => s.id === character.skinTone) || SKIN_TONES[0];
  const skinColor = skinObj.colorHex || '#F5D0A9';

  const hairColorObj = HAIR_COLORS.find((h) => h.id === character.hairColor) || HAIR_COLORS[0];
  const hairColor = hairColorObj.colorHex || '#78350F';

  const outfitColorObj = OUTFIT_COLORS.find((o) => o.id === character.outfitColor) || OUTFIT_COLORS[0];
  const outfitColor = outfitColorObj.colorHex || '#2563EB';

  const accessoryObj = ACCESSORIES.find((a) => a.id === character.accessory);

  const dimensionMap = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-40 h-40',
    xl: 'w-56 h-56',
  };

  const isBunny = character.species === 'star-bunny';
  const isDragon = character.species === 'baby-dragon';
  const isFox = character.species === 'forest-fox';
  const isPanda = character.species === 'cozy-panda';
  const isSprite = character.species === 'cloud-sprite';

  return (
    <div className={`relative inline-block ${dimensionMap[size]} select-none`}>
      <svg
        viewBox="0 0 160 160"
        className="w-full h-full drop-shadow-md transition-all duration-300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="100%" stopColor="#FEF3C7" />
          </radialGradient>
          <radialGradient id="cheekGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Circular background halo */}
        <circle cx="80" cy="80" r="76" fill="url(#bgGrad)" stroke="#FDE68A" strokeWidth="4" />

        {/* --- BACK BODY/HAIR/ACCESSORIES --- */}

        {/* Sprite wings */}
        {isSprite && (
          <g opacity="0.8" className="animate-pulse">
            <ellipse cx="40" cy="65" rx="24" ry="12" transform="rotate(-30 40 65)" fill="#A7F3D0" opacity="0.6" stroke="#34D399" strokeWidth="2" />
            <ellipse cx="120" cy="65" rx="24" ry="12" transform="rotate(30 120 65)" fill="#A7F3D0" opacity="0.6" stroke="#34D399" strokeWidth="2" />
          </g>
        )}

        {/* Dragon wings */}
        {isDragon && (
          <g>
            <path d="M 35 85 Q 15 50 45 45 Q 35 65 50 80 Z" fill="#818CF8" stroke="#4F46E5" strokeWidth="2" />
            <path d="M 125 85 Q 145 50 115 45 Q 125 65 110 80 Z" fill="#818CF8" stroke="#4F46E5" strokeWidth="2" />
          </g>
        )}

        {/* Bunny ears */}
        {isBunny && (
          <g>
            {/* Left ear */}
            <path d="M 52 55 C 42 10, 58 5, 62 48 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
            <path d="M 53 50 C 46 16, 56 12, 60 45 Z" fill="#FCE7F3" />
            {/* Right ear */}
            <path d="M 108 55 C 118 10, 102 5, 98 48 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
            <path d="M 107 50 C 114 16, 104 12, 100 45 Z" fill="#FCE7F3" />
          </g>
        )}

        {/* Fox ears */}
        {isFox && (
          <g>
            <path d="M 45 60 L 35 25 L 68 45 Z" fill="#EA580C" stroke="#9A3412" strokeWidth="2" />
            <path d="M 46 54 L 40 32 L 62 46 Z" fill="#FED7AA" />
            <path d="M 115 60 L 125 25 L 92 45 Z" fill="#EA580C" stroke="#9A3412" strokeWidth="2" />
            <path d="M 114 54 L 120 32 L 98 46 Z" fill="#FED7AA" />
          </g>
        )}

        {/* Panda ears */}
        {isPanda && (
          <g>
            <circle cx="48" cy="45" r="14" fill="#0F172A" />
            <circle cx="112" cy="45" r="14" fill="#0F172A" />
          </g>
        )}

        {/* Human back hair (curly puffs, braids, shoulder locks) */}
        {!isBunny && !isDragon && !isFox && !isPanda && (
          <g>
            {character.hairStyle === 'curly-afro-puffs' && (
              <>
                <circle cx="40" cy="45" r="18" fill={hairColor} />
                <circle cx="120" cy="45" r="18" fill={hairColor} />
              </>
            )}
            {character.hairStyle === 'braided-explorer' && (
              <>
                <path d="M 46 70 C 38 95, 34 110, 42 125" stroke={hairColor} strokeWidth="10" strokeLinecap="round" />
                <path d="M 114 70 C 122 95, 126 110, 118 125" stroke={hairColor} strokeWidth="10" strokeLinecap="round" />
              </>
            )}
            {character.hairStyle === 'wavy-shoulder' && (
              <path d="M 44 65 C 32 90, 36 120, 48 130 C 60 110, 100 110, 112 130 C 124 120, 128 90, 116 65 Z" fill={hairColor} />
            )}
            {character.hairStyle === 'wild-curls' && (
              <ellipse cx="80" cy="72" rx="48" ry="46" fill={hairColor} />
            )}
          </g>
        )}

        {/* --- CLOTHING / BODY --- */}
        <g id="body-and-clothes">
          {/* Main torso / clothing */}
          <path
            d="M 48 118 Q 80 112 112 118 L 126 160 L 34 160 Z"
            fill={outfitColor}
            stroke="#1E293B"
            strokeWidth="1.5"
            strokeOpacity="0.2"
          />

          {/* Clothing details */}
          {character.clothing === 'wizard-cape' && (
            <g>
              <path d="M 48 118 L 80 135 L 112 118 Z" fill="#FDE047" opacity="0.9" />
              <circle cx="80" cy="138" r="4" fill="#F59E0B" />
              {/* Little stars on cape */}
              <text x="56" y="152" fill="#FEF08A" fontSize="10">✦</text>
              <text x="96" y="150" fill="#FEF08A" fontSize="10">✦</text>
            </g>
          )}

          {character.clothing === 'explorer-vest' && (
            <g>
              <path d="M 68 122 L 68 160" stroke="#78350F" strokeWidth="2" strokeDasharray="3 2" />
              <path d="M 92 122 L 92 160" stroke="#78350F" strokeWidth="2" strokeDasharray="3 2" />
              <rect x="52" y="136" width="16" height="14" rx="3" fill="#D97706" />
              <rect x="92" y="136" width="16" height="14" rx="3" fill="#D97706" />
            </g>
          )}

          {character.clothing === 'artist-overalls' && (
            <g>
              <rect x="62" y="128" width="36" height="32" rx="4" fill="#3B82F6" opacity="0.3" />
              <circle cx="70" cy="130" r="2.5" fill="#F59E0B" />
              <circle cx="90" cy="130" r="2.5" fill="#F59E0B" />
            </g>
          )}

          {character.clothing === 'cozy-knit-sweater' && (
            <g opacity="0.5">
              <path d="M 44 135 Q 80 130 116 135" stroke="#FFFFFF" strokeWidth="3" />
              <path d="M 40 148 Q 80 143 120 148" stroke="#FFFFFF" strokeWidth="3" />
            </g>
          )}

          {character.clothing === 'superhero-tunic' && (
            <path d="M 80 128 L 86 142 L 74 142 Z" fill="#FACC15" />
          )}

          {character.clothing === 'astro-jumpsuit' && (
            <g>
              <circle cx="80" cy="140" r="8" fill="#38BDF8" opacity="0.4" />
              <text x="76" y="144" fill="#0284C7" fontSize="10" fontWeight="bold">✦</text>
            </g>
          )}
        </g>

        {/* --- HEAD & FACE --- */}
        <g id="head">
          {/* Neck */}
          <rect x="73" y="104" width="14" height="16" rx="4" fill={skinColor} />

          {/* Head base */}
          <circle
            cx="80"
            cy="78"
            r="38"
            fill={
              isPanda
                ? '#F8FAFC'
                : isDragon
                ? '#93C5FD'
                : isFox
                ? '#FB923C'
                : skinColor
            }
            stroke="#0F172A"
            strokeWidth="1.5"
            strokeOpacity="0.15"
          />

          {/* Panda eye patches */}
          {isPanda && (
            <g>
              <ellipse cx="66" cy="76" rx="9" ry="12" fill="#0F172A" transform="rotate(-15 66 76)" />
              <ellipse cx="94" cy="76" rx="9" ry="12" fill="#0F172A" transform="rotate(15 94 76)" />
            </g>
          )}

          {/* Rosy Cheeks */}
          <circle cx="60" cy="88" r="8" fill="url(#cheekGlow)" />
          <circle cx="100" cy="88" r="8" fill="url(#cheekGlow)" />

          {/* Eyes */}
          <g id="eyes">
            {/* Left Eye */}
            <circle cx="66" cy="76" r="5" fill="#1E293B" />
            <circle cx="64.5" cy="74.5" r="1.8" fill="#FFFFFF" />
            <circle cx="67.5" cy="77.5" r="0.8" fill="#FFFFFF" />

            {/* Right Eye */}
            <circle cx="94" cy="76" r="5" fill="#1E293B" />
            <circle cx="92.5" cy="74.5" r="1.8" fill="#FFFFFF" />
            <circle cx="95.5" cy="77.5" r="0.8" fill="#FFFFFF" />
          </g>

          {/* Freckles */}
          {character.facialFeature === 'cute-freckles' && (
            <g fill="#B45309" opacity="0.6">
              <circle cx="60" cy="84" r="1" />
              <circle cx="63" cy="86" r="1" />
              <circle cx="67" cy="85" r="0.8" />
              <circle cx="93" cy="85" r="0.8" />
              <circle cx="97" cy="86" r="1" />
              <circle cx="100" cy="84" r="1" />
            </g>
          )}

          {/* Nose & Smile */}
          {isFox || isDragon || isBunny || isPanda ? (
            <polygon points="78,82 82,82 80,85" fill="#1E293B" />
          ) : (
            <circle cx="80" cy="83" r="1.5" fill="#78350F" opacity="0.5" />
          )}

          {/* Cute Smile */}
          <path
            d="M 74 90 Q 80 97 86 90"
            stroke="#1E293B"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Dimples */}
          {character.facialFeature === 'rosy-dimples' && (
            <g stroke="#E11D48" strokeWidth="1.5" strokeLinecap="round">
              <path d="M 56 90 Q 55 92 56 94" fill="none" />
              <path d="M 104 90 Q 105 92 104 94" fill="none" />
            </g>
          )}

          {/* Round Glasses */}
          {character.facialFeature === 'star-glasses' && (
            <g stroke="#92400E" strokeWidth="2.5" fill="#FEF3C7" fillOpacity="0.2">
              <circle cx="66" cy="76" r="10" />
              <circle cx="94" cy="76" r="10" />
              <line x1="76" y1="76" x2="84" y2="76" />
            </g>
          )}

          {/* Aviator Goggles */}
          {character.facialFeature === 'adventurer-goggles' && (
            <g stroke="#78350F" strokeWidth="3" fill="#38BDF8" fillOpacity="0.4">
              <path d="M 45 52 L 115 52" stroke="#451A03" strokeWidth="4" />
              <circle cx="66" cy="50" r="10" />
              <circle cx="94" cy="50" r="10" />
              <line x1="76" y1="50" x2="84" y2="50" />
            </g>
          )}
        </g>

        {/* --- FRONT HAIR / HEADWEAR --- */}
        {!isBunny && !isDragon && !isFox && !isPanda && (
          <g id="front-hair">
            {character.hairStyle === 'cozy-beanie' && (
              <g>
                <path d="M 44 68 C 44 40, 116 40, 116 68 Z" fill="#DC2626" />
                <rect x="42" y="62" width="76" height="12" rx="4" fill="#B91C1C" />
                <circle cx="80" cy="38" r="7" fill="#F87171" />
                {/* Hair peeking from beanie */}
                <path d="M 48 72 Q 54 82 50 88" stroke={hairColor} strokeWidth="6" strokeLinecap="round" />
                <path d="M 112 72 Q 106 82 110 88" stroke={hairColor} strokeWidth="6" strokeLinecap="round" />
              </g>
            )}

            {character.hairStyle === 'spiky-star' && (
              <path
                d="M 45 70 Q 52 42 62 48 Q 72 35 80 44 Q 90 32 98 46 Q 110 44 115 70 C 105 60 55 60 45 70 Z"
                fill={hairColor}
              />
            )}

            {character.hairStyle === 'neat-bob' && (
              <path
                d="M 42 78 C 40 45 120 45 118 78 C 114 62 100 58 80 58 C 60 58 46 62 42 78 Z"
                fill={hairColor}
              />
            )}

            {(character.hairStyle === 'curly-afro-puffs' ||
              character.hairStyle === 'braided-explorer' ||
              character.hairStyle === 'wavy-shoulder' ||
              character.hairStyle === 'wild-curls') && (
              <path
                d="M 46 68 C 50 50, 70 54, 80 56 C 90 54, 110 50, 114 68 C 104 60, 94 62, 80 62 C 66 62, 56 60, 46 68 Z"
                fill={hairColor}
              />
            )}
          </g>
        )}

        {/* Dragon Horns & Scale details */}
        {isDragon && (
          <g fill="#FBBF24">
            <polygon points="62,48 58,32 70,44" />
            <polygon points="98,48 102,32 90,44" />
          </g>
        )}

        {/* Flower Crown Accessory */}
        {character.accessory === 'flower-crown' && (
          <g>
            <path d="M 48 58 Q 80 50 112 58" stroke="#16A34A" strokeWidth="3" fill="none" />
            <circle cx="58" cy="54" r="5" fill="#FEF08A" />
            <circle cx="70" cy="52" r="5" fill="#F472B6" />
            <circle cx="82" cy="50" r="5" fill="#93C5FD" />
            <circle cx="94" cy="52" r="5" fill="#FBBF24" />
            <circle cx="104" cy="55" r="5" fill="#F472B6" />
          </g>
        )}
      </svg>

      {/* Held Accessory Badge Icon */}
      {showBadge && accessoryObj?.icon && (
        <div
          title={accessoryObj.name}
          className="absolute -bottom-1 -right-1 bg-white border-2 border-amber-300 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-sm sm:text-base shadow-md animate-bounce"
          style={{ animationDuration: '2.5s' }}
        >
          {accessoryObj.icon}
        </div>
      )}
    </div>
  );
};
