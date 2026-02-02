/**
 * Effect System Type Definitions
 * 
 * Types for the stackable effects system including blur, shadows, and glow effects.
 */

// ============================================================================
// Effect Types
// ============================================================================

export type EffectType = 'blur' | 'drop-shadow' | 'inner-shadow' | 'inner-glow' | 'noise';

export interface BlurParams {
  radius: number; // 0-100px
}

export interface DropShadowParams {
  offsetX: number;   // -100 to 100px
  offsetY: number;   // -100 to 100px
  blur: number;      // 0-100px
  spread: number;    // 0-50px
  color: string;     // hex color
  opacity: number;   // 0-100%
}

export interface InnerShadowParams {
  offsetX: number;   // -50 to 50px
  offsetY: number;   // -50 to 50px
  blur: number;      // 0-50px
  color: string;     // hex color
  opacity: number;   // 0-100%
}

export interface InnerGlowParams {
  blur: number;      // 0-50px
  color: string;     // hex color
  opacity: number;   // 0-100%
  spread: number;    // 0-30px
}

export interface NoiseParams {
  intensity: number; // 0-100%
  scale: number;     // 0.5-3
  animated: boolean;
}

export type EffectParams = 
  | BlurParams 
  | DropShadowParams 
  | InnerShadowParams 
  | InnerGlowParams 
  | NoiseParams;

// ============================================================================
// Effect Interface
// ============================================================================

export interface Effect {
  id: string;
  type: EffectType;
  name: string;
  enabled: boolean;
  expanded: boolean;
  params: EffectParams;
}

// ============================================================================
// Effect Presets
// ============================================================================

export interface EffectPreset {
  id: string;
  name: string;
  description: string;
  effects: Effect[];
}

export const EFFECT_PRESETS: EffectPreset[] = [
  {
    id: 'glass',
    name: 'Glass',
    description: 'Frosted glass morphism effect',
    effects: [
      {
        id: 'glass-blur',
        type: 'blur',
        name: 'Backdrop Blur',
        enabled: true,
        expanded: false,
        params: { radius: 20 } as BlurParams,
      },
      {
        id: 'glass-shadow',
        type: 'drop-shadow',
        name: 'Soft Shadow',
        enabled: true,
        expanded: false,
        params: {
          offsetX: 0,
          offsetY: 10,
          blur: 40,
          spread: 0,
          color: '#000000',
          opacity: 15,
        } as DropShadowParams,
      },
    ],
  },
  {
    id: 'neumorphic',
    name: 'Neumorphic',
    description: 'Soft UI style with dual shadows',
    effects: [
      {
        id: 'neu-light',
        type: 'drop-shadow',
        name: 'Light Shadow',
        enabled: true,
        expanded: false,
        params: {
          offsetX: -8,
          offsetY: -8,
          blur: 16,
          spread: 0,
          color: '#FFFFFF',
          opacity: 80,
        } as DropShadowParams,
      },
      {
        id: 'neu-dark',
        type: 'drop-shadow',
        name: 'Dark Shadow',
        enabled: true,
        expanded: false,
        params: {
          offsetX: 8,
          offsetY: 8,
          blur: 16,
          spread: 0,
          color: '#000000',
          opacity: 25,
        } as DropShadowParams,
      },
    ],
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'Glowing neon light effect',
    effects: [
      {
        id: 'neon-glow',
        type: 'inner-glow',
        name: 'Neon Glow',
        enabled: true,
        expanded: false,
        params: {
          blur: 30,
          color: '#00FF88',
          opacity: 80,
          spread: 10,
        } as InnerGlowParams,
      },
      {
        id: 'neon-shadow',
        type: 'drop-shadow',
        name: 'Outer Glow',
        enabled: true,
        expanded: false,
        params: {
          offsetX: 0,
          offsetY: 0,
          blur: 40,
          spread: 10,
          color: '#00FF88',
          opacity: 60,
        } as DropShadowParams,
      },
    ],
  },
  {
    id: 'subtle',
    name: 'Subtle',
    description: 'Minimal, elegant shadow',
    effects: [
      {
        id: 'subtle-shadow',
        type: 'drop-shadow',
        name: 'Soft Shadow',
        enabled: true,
        expanded: false,
        params: {
          offsetX: 0,
          offsetY: 4,
          blur: 12,
          spread: 0,
          color: '#000000',
          opacity: 10,
        } as DropShadowParams,
      },
    ],
  },
];

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_EFFECT_PARAMS: Record<EffectType, EffectParams> = {
  blur: { radius: 10 } as BlurParams,
  'drop-shadow': {
    offsetX: 0,
    offsetY: 8,
    blur: 24,
    spread: 0,
    color: '#000000',
    opacity: 30,
  } as DropShadowParams,
  'inner-shadow': {
    offsetX: 0,
    offsetY: 4,
    blur: 12,
    color: '#000000',
    opacity: 20,
  } as InnerShadowParams,
  'inner-glow': {
    blur: 20,
    color: '#FFFFFF',
    opacity: 50,
    spread: 5,
  } as InnerGlowParams,
  noise: {
    intensity: 15,
    scale: 1,
    animated: false,
  } as NoiseParams,
};

// ============================================================================
// Effect Labels
// ============================================================================

export const EFFECT_TYPE_LABELS: Record<EffectType, string> = {
  blur: 'Blur',
  'drop-shadow': 'Drop Shadow',
  'inner-shadow': 'Inner Shadow',
  'inner-glow': 'Inner Glow',
  noise: 'Noise',
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generates a unique effect ID
 */
let effectIdCounter = 0;
export const generateEffectId = (): string => {
  return `effect-${++effectIdCounter}-${Date.now().toString(36)}`;
};

/**
 * Creates a new effect with default parameters
 */
export const createEffect = (type: EffectType): Effect => ({
  id: generateEffectId(),
  type,
  name: EFFECT_TYPE_LABELS[type],
  enabled: true,
  expanded: true,
  params: { ...DEFAULT_EFFECT_PARAMS[type] },
});

/**
 * Converts effects to CSS filter/box-shadow string
 */
export const effectsToCSS = (effects: Effect[]): { filter: string; boxShadow: string } => {
  const filters: string[] = [];
  const shadows: string[] = [];
  
  effects.filter(e => e.enabled).forEach(effect => {
    switch (effect.type) {
      case 'blur': {
        const params = effect.params as BlurParams;
        filters.push(`blur(${params.radius}px)`);
        break;
      }
      case 'drop-shadow': {
        const params = effect.params as DropShadowParams;
        const rgba = hexToRgba(params.color, params.opacity / 100);
        shadows.push(`${params.offsetX}px ${params.offsetY}px ${params.blur}px ${params.spread}px ${rgba}`);
        break;
      }
      case 'inner-shadow': {
        const params = effect.params as InnerShadowParams;
        const rgba = hexToRgba(params.color, params.opacity / 100);
        shadows.push(`inset ${params.offsetX}px ${params.offsetY}px ${params.blur}px ${rgba}`);
        break;
      }
      case 'inner-glow': {
        const params = effect.params as InnerGlowParams;
        const rgba = hexToRgba(params.color, params.opacity / 100);
        shadows.push(`inset 0 0 ${params.blur}px ${params.spread}px ${rgba}`);
        break;
      }
    }
  });
  
  return {
    filter: filters.join(' ') || 'none',
    boxShadow: shadows.join(', ') || 'none',
  };
};

/**
 * Converts hex color to rgba string
 */
const hexToRgba = (hex: string, alpha: number): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0, 0, 0, ${alpha})`;
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
