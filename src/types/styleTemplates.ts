import { SuperellipseState } from '@/hooks/useSuperellipse';

export interface StyleTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  values: Partial<SuperellipseState>;
}

export interface SavedPreset {
  id: string;
  name: string;
  values: Partial<SuperellipseState>;
  createdAt: number;
}

export const STYLE_TEMPLATES: StyleTemplate[] = [
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    description: 'Frosted glass with blur and transparency',
    icon: '🪟',
    values: {
      backdropBlur: 16,
      frostBlur: 8,
      tintColor: '#ffffff',
      tintOpacity: 20,
      borderEnabled: true,
      strokeWidth: 1,
      strokeColor: '#ffffff',
      strokeOpacity: 30,
      solidOpacity: 40,
    },
  },
  {
    id: 'inner-glow',
    name: 'Inner Glow',
    description: 'Soft inner light effect',
    icon: '💫',
    values: {
      innerShadowSpread: -4,
      innerShadowBlur: 20,
      innerShadowColor: '#ffffff',
      brightness: 110,
      contrast: 105,
    },
  },
  {
    id: 'retro-80s',
    name: 'Retro 80s',
    description: 'Neon-inspired vibrant look',
    icon: '🕹️',
    values: {
      saturate: 160,
      contrast: 120,
      hueRotate: 280,
      borderEnabled: true,
      strokeWidth: 2,
      strokeColor: '#ff00ff',
      strokeOpacity: 80,
      noiseEnabled: true,
      noiseIntensity: 15,
    },
  },
  {
    id: 'rainbow-gradient',
    name: 'Rainbow Gradient',
    description: 'Multi-color gradient overlay',
    icon: '🌈',
    values: {
      colorMode: 'linear',
      gradientAngle: 135,
      gradientStops: [
        { color: '#ff0000', position: 0 },
        { color: '#ff8800', position: 20 },
        { color: '#ffff00', position: 40 },
        { color: '#00ff00', position: 60 },
        { color: '#0088ff', position: 80 },
        { color: '#8800ff', position: 100 },
      ],
      saturate: 120,
    },
  },
  {
    id: 'spinning-animation',
    name: 'Spinning Animation',
    description: 'Rotating glow with dynamic feel',
    icon: '🌀',
    values: {
      enabled: true,
      glowScale: 1.3,
      glowBlur: 140,
      hueRotate: 45,
      brightness: 110,
    },
  },
  {
    id: 'morphing-shape',
    name: 'Morphing Shape',
    description: 'Organic distorted shape effect',
    icon: '🫧',
    values: {
      distortionStrength: 40,
      noiseFrequency: 50,
      frostBlur: 4,
      innerShadowBlur: 8,
      innerShadowSpread: -2,
      innerShadowColor: '#4444ff',
    },
  },
];

const CUSTOM_PRESETS_KEY = 'superellipse-custom-style-presets';

export function loadCustomPresets(): SavedPreset[] {
  try {
    const stored = localStorage.getItem(CUSTOM_PRESETS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCustomPreset(preset: SavedPreset): void {
  const presets = loadCustomPresets();
  presets.push(preset);
  localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(presets));
}

export function deleteCustomPreset(id: string): void {
  const presets = loadCustomPresets().filter(p => p.id !== id);
  localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(presets));
}
