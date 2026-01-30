/**
 * useSuperellipse Hook
 * 
 * A comprehensive React hook for managing superellipse shapes with advanced styling options.
 * Supports symmetric and asymmetric corner radii, gradients, glow effects, borders, shadows,
 * and various visual effects with real-time path generation and state management.
 * 
 * Features:
 * - Dynamic superellipse path generation (symmetric and per-corner)
 * - Multiple color modes (solid, linear, radial, conic gradients)
 * - OKLCH-based glow effects with full customization
 * - Borders with customizable styles and positions
 * - Visual effects (blur, backdrop blur, noise)
 * - Shadow effects
 * - State persistence and randomization
 * 
 * @example
 * ```tsx
 * function SuperellipseEditor() {
 *   const { state, updateState, pathData, randomizeGlow } = useSuperellipse();
 *   
 *   return (
 *     <div>
 *       <svg>
 *         <path d={pathData} fill={state.solidColor} />
 *       </svg>
 *       <button onClick={randomizeGlow}>Randomize</button>
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { getSuperellipsePath, getPerCornerSuperellipsePath } from '../utils/math';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Gradient color stop with position
 */
export interface GradientStop {
  /** Color in hex, rgb, or any valid CSS color format */
  color: string;
  /** Position from 0-100 */
  position: number;
}

/**
 * Per-corner exponent values for asymmetric superellipses
 */
export interface CornerExponents {
  /** Top-left corner exponent */
  topLeft: number;
  /** Top-right corner exponent */
  topRight: number;
  /** Bottom-right corner exponent */
  bottomRight: number;
  /** Bottom-left corner exponent */
  bottomLeft: number;
}

/**
 * Color mode options for fill
 */
export type ColorMode = 'solid' | 'linear' | 'radial' | 'conic';

/**
 * Border/stroke position options
 */
export type StrokePosition = 'inside' | 'center' | 'outside';

/**
 * Border/stroke style options
 */
export type StrokeStyle = 'solid' | 'dashed' | 'dotted';

/**
 * Complete superellipse state
 */
export interface SuperellipseState {
  // Dimensions
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Exponent for symmetric corners (2 = circle, higher = more rectangular) */
  exp: number;
  /** Smoothing factor (0-1) */
  smoothing: number;
  
  // Asymmetric corners
  /** Enable per-corner exponents */
  useAsymmetricCorners: boolean;
  /** Individual corner exponents */
  cornerExponents: CornerExponents;
  
  // Colors
  /** Current color mode */
  colorMode: ColorMode;
  /** Solid fill color */
  solidColor: string;
  /** Solid color opacity (0-100) */
  solidOpacity: number;
  /** Gradient color stops */
  gradientStops: GradientStop[];
  /** Gradient angle in degrees (0-360) */
  gradientAngle: number;
  
  // Glow (OKLCH)
  /** Enable glow effect */
  enabled: boolean;
  /** Hue in degrees (0-360) */
  hue: number;
  /** Chroma/saturation (0-0.4) */
  chroma: number;
  /** Lightness (0-100) */
  lightness: number;
  /** Glow mask size (0-1) */
  glowMaskSize: number;
  /** Glow scale multiplier */
  glowScale: number;
  /** Glow horizontal position offset */
  glowPositionX: number;
  /** Glow vertical position offset */
  glowPositionY: number;
  /** Glow opacity (0-100) */
  glowOpacity: number;
  /** Glow blur radius in pixels */
  glowBlur: number;
  /** Glow spread in pixels */
  glowSpread: number;
  
  // Effects
  /** Main blur in pixels */
  blur: number;
  /** Backdrop blur in pixels */
  backdropBlur: number;
  /** Enable noise overlay */
  noiseEnabled: boolean;
  /** Noise intensity (0-100) */
  noiseIntensity: number;
  
  // Border/Stroke
  /** Enable border */
  borderEnabled: boolean;
  /** Stroke color */
  strokeColor: string;
  /** Stroke width in pixels */
  strokeWidth: number;
  /** Stroke position relative to path */
  strokePosition: StrokePosition;
  /** Stroke line style */
  strokeStyle: StrokeStyle;
  /** Stroke opacity (0-100) */
  strokeOpacity: number;
  
  // Shadow
  /** Shadow distance/offset in pixels */
  shadowDistance: number;
  /** Shadow intensity/opacity (0-100) */
  shadowIntensity: number;
}

/**
 * Hook return interface
 */
export interface UseSuperellipseReturn {
  /** Current superellipse state */
  state: SuperellipseState;
  /** Update state with partial values */
  updateState: (updates: Partial<SuperellipseState>) => void;
  /** Update a specific gradient stop */
  updateGradientStop: (index: number, updates: Partial<GradientStop>) => void;
  /** Add a new gradient stop */
  addGradientStop: (stop: GradientStop) => void;
  /** Remove a gradient stop by index */
  removeGradientStop: (index: number) => void;
  /** Reset state to default */
  resetState: () => void;
  /** Load a complete state */
  loadState: (newState: SuperellipseState) => void;
  /** Randomize glow and color */
  randomizeGlow: () => void;
  /** Randomize all parameters */
  randomizeAll: () => void;
  /** Generated SVG path data */
  pathData: string;
  /** Validate current state */
  isValid: boolean;
  /** Get CSS gradient string */
  getGradientCSS: () => string;
}

// ============================================================================
// Constants
// ============================================================================

/** Minimum width in pixels */
const MIN_WIDTH = 10;

/** Maximum width in pixels */
const MAX_WIDTH = 2000;

/** Minimum height in pixels */
const MIN_HEIGHT = 10;

/** Maximum height in pixels */
const MAX_HEIGHT = 2000;

/** Minimum exponent value */
const MIN_EXPONENT = 0.5;

/** Maximum exponent value */
const MAX_EXPONENT = 20;

/** Minimum opacity */
const MIN_OPACITY = 0;

/** Maximum opacity */
const MAX_OPACITY = 100;

/** Minimum gradient stop position */
const MIN_GRADIENT_POSITION = 0;

/** Maximum gradient stop position */
const MAX_GRADIENT_POSITION = 100;

/** Default superellipse state */
const DEFAULT_STATE: SuperellipseState = {
  // Dimensions
  width: 320,
  height: 400,
  exp: 4.0,
  smoothing: 0.5,
  
  // Asymmetric corners
  useAsymmetricCorners: false,
  cornerExponents: {
    topLeft: 4.0,
    topRight: 4.0,
    bottomRight: 4.0,
    bottomLeft: 4.0,
  },
  
  // Colors
  colorMode: 'solid',
  solidColor: '#FF9F00',
  solidOpacity: 100,
  gradientStops: [
    { color: '#6366F1', position: 0 },
    { color: '#A855F7', position: 50 },
    { color: '#EC4899', position: 100 },
  ],
  gradientAngle: 135,
  
  // Glow (OKLCH)
  enabled: true,
  hue: 40,
  chroma: 0.18,
  lightness: 78,
  glowMaskSize: 0.3,
  glowScale: 0.9,
  glowPositionX: -590,
  glowPositionY: -1070,
  glowOpacity: 100,
  glowBlur: 120,
  glowSpread: 40,
  
  // Effects
  blur: 0,
  backdropBlur: 0,
  noiseEnabled: true,
  noiseIntensity: 35,
  
  // Border/Stroke
  borderEnabled: false,
  strokeColor: '#FFFFFF',
  strokeWidth: 2,
  strokePosition: 'inside',
  strokeStyle: 'solid',
  strokeOpacity: 100,
  
  // Shadow
  shadowDistance: 10,
  shadowIntensity: 30,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Clamps a number between min and max values
 */
const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Validates a hex color string
 */
const isValidHexColor = (color: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

/**
 * Converts HSL to Hex color
 * @param h Hue (0-360)
 * @param s Saturation (0-100)
 * @param l Lightness (0-100)
 */
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  
  const f = (n: number): string => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

/**
 * Generates a random integer between min and max (inclusive)
 */
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generates a random float between min and max
 */
const randomFloat = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

/**
 * Validates gradient stops array
 */
const validateGradientStops = (stops: GradientStop[]): boolean => {
  if (!Array.isArray(stops) || stops.length < 2) return false;
  
  return stops.every(stop => 
    typeof stop.color === 'string' &&
    typeof stop.position === 'number' &&
    stop.position >= MIN_GRADIENT_POSITION &&
    stop.position <= MAX_GRADIENT_POSITION
  );
};

/**
 * Validates corner exponents
 */
const validateCornerExponents = (corners: CornerExponents): boolean => {
  return ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'].every(
    key => {
      const value = corners[key as keyof CornerExponents];
      return typeof value === 'number' && 
             value >= MIN_EXPONENT && 
             value <= MAX_EXPONENT;
    }
  );
};

// ============================================================================
// Main Hook
// ============================================================================

export function useSuperellipse(): UseSuperellipseReturn {
  // ========================================================================
  // State Management
  // ========================================================================
  
  const [state, setState] = useState<SuperellipseState>(DEFAULT_STATE);
  const isComponentMounted = useRef(true);
  const stateHistory = useRef<SuperellipseState[]>([]);

  // ========================================================================
  // Memoized Values
  // ========================================================================

  /**
   * Generate SVG path data based on current state
   */
  const pathData = useMemo(() => {
    try {
      if (state.useAsymmetricCorners) {
        if (!validateCornerExponents(state.cornerExponents)) {
          console.warn('Invalid corner exponents, using default');
          return getSuperellipsePath(state.width, state.height, state.exp);
        }
        
        return getPerCornerSuperellipsePath(
          state.width, 
          state.height, 
          state.cornerExponents
        );
      }
      
      return getSuperellipsePath(state.width, state.height, state.exp);
    } catch (error) {
      console.error('Error generating superellipse path:', error);
      // Fallback to simple rectangle path
      return `M 0 0 L ${state.width} 0 L ${state.width} ${state.height} L 0 ${state.height} Z`;
    }
  }, [
    state.width, 
    state.height, 
    state.exp, 
    state.useAsymmetricCorners, 
    state.cornerExponents
  ]);

  /**
   * Validate current state
   */
  const isValid = useMemo(() => {
    try {
      // Validate dimensions
      if (state.width < MIN_WIDTH || state.width > MAX_WIDTH) return false;
      if (state.height < MIN_HEIGHT || state.height > MAX_HEIGHT) return false;
      
      // Validate exponent
      if (state.exp < MIN_EXPONENT || state.exp > MAX_EXPONENT) return false;
      
      // Validate corner exponents if asymmetric
      if (state.useAsymmetricCorners && !validateCornerExponents(state.cornerExponents)) {
        return false;
      }
      
      // Validate gradient stops
      if (!validateGradientStops(state.gradientStops)) return false;
      
      // Validate opacity values
      if (state.solidOpacity < MIN_OPACITY || state.solidOpacity > MAX_OPACITY) return false;
      if (state.glowOpacity < MIN_OPACITY || state.glowOpacity > MAX_OPACITY) return false;
      if (state.strokeOpacity < MIN_OPACITY || state.strokeOpacity > MAX_OPACITY) return false;
      
      return true;
    } catch (error) {
      console.error('Error validating state:', error);
      return false;
    }
  }, [state]);

  /**
   * Generate CSS gradient string based on current state
   */
  const getGradientCSS = useCallback((): string => {
    try {
      const stops = state.gradientStops
        .map(stop => `${stop.color} ${stop.position}%`)
        .join(', ');

      switch (state.colorMode) {
        case 'linear':
          return `linear-gradient(${state.gradientAngle}deg, ${stops})`;
        case 'radial':
          return `radial-gradient(circle, ${stops})`;
        case 'conic':
          return `conic-gradient(from ${state.gradientAngle}deg, ${stops})`;
        case 'solid':
        default:
          return state.solidColor;
      }
    } catch (error) {
      console.error('Error generating gradient CSS:', error);
      return state.solidColor;
    }
  }, [state.colorMode, state.gradientStops, state.gradientAngle, state.solidColor]);

  // ========================================================================
  // State Update Functions
  // ========================================================================

  /**
   * Update state with validation
   */
  const updateState = useCallback((updates: Partial<SuperellipseState>) => {
    if (!isComponentMounted.current) return;

    setState(prev => {
      const newState = { ...prev, ...updates };
      
      // Clamp numeric values
      if (updates.width !== undefined) {
        newState.width = clamp(updates.width, MIN_WIDTH, MAX_WIDTH);
      }
      if (updates.height !== undefined) {
        newState.height = clamp(updates.height, MIN_HEIGHT, MAX_HEIGHT);
      }
      if (updates.exp !== undefined) {
        newState.exp = clamp(updates.exp, MIN_EXPONENT, MAX_EXPONENT);
      }
      if (updates.solidOpacity !== undefined) {
        newState.solidOpacity = clamp(updates.solidOpacity, MIN_OPACITY, MAX_OPACITY);
      }
      if (updates.glowOpacity !== undefined) {
        newState.glowOpacity = clamp(updates.glowOpacity, MIN_OPACITY, MAX_OPACITY);
      }
      if (updates.strokeOpacity !== undefined) {
        newState.strokeOpacity = clamp(updates.strokeOpacity, MIN_OPACITY, MAX_OPACITY);
      }
      if (updates.noiseIntensity !== undefined) {
        newState.noiseIntensity = clamp(updates.noiseIntensity, 0, 100);
      }
      if (updates.shadowIntensity !== undefined) {
        newState.shadowIntensity = clamp(updates.shadowIntensity, 0, 100);
      }
      if (updates.gradientAngle !== undefined) {
        newState.gradientAngle = updates.gradientAngle % 360;
      }
      if (updates.hue !== undefined) {
        newState.hue = updates.hue % 360;
      }
      
      return newState;
    });
  }, []);

  /**
   * Update a specific gradient stop
   */
  const updateGradientStop = useCallback((
    index: number, 
    updates: Partial<GradientStop>
  ) => {
    if (!isComponentMounted.current) return;
    
    setState(prev => {
      if (index < 0 || index >= prev.gradientStops.length) {
        console.warn(`Invalid gradient stop index: ${index}`);
        return prev;
      }

      const newStops = [...prev.gradientStops];
      newStops[index] = { 
        ...newStops[index], 
        ...updates,
        // Clamp position if provided
        position: updates.position !== undefined
          ? clamp(updates.position, MIN_GRADIENT_POSITION, MAX_GRADIENT_POSITION)
          : newStops[index].position
      };
      
      return { ...prev, gradientStops: newStops };
    });
  }, []);

  /**
   * Add a new gradient stop
   */
  const addGradientStop = useCallback((stop: GradientStop) => {
    if (!isComponentMounted.current) return;

    setState(prev => {
      const newStop = {
        ...stop,
        position: clamp(stop.position, MIN_GRADIENT_POSITION, MAX_GRADIENT_POSITION)
      };
      
      const newStops = [...prev.gradientStops, newStop].sort(
        (a, b) => a.position - b.position
      );
      
      return { ...prev, gradientStops: newStops };
    });
  }, []);

  /**
   * Remove a gradient stop by index
   */
  const removeGradientStop = useCallback((index: number) => {
    if (!isComponentMounted.current) return;

    setState(prev => {
      if (prev.gradientStops.length <= 2) {
        console.warn('Cannot remove gradient stop: minimum 2 stops required');
        return prev;
      }

      if (index < 0 || index >= prev.gradientStops.length) {
        console.warn(`Invalid gradient stop index: ${index}`);
        return prev;
      }

      const newStops = prev.gradientStops.filter((_, i) => i !== index);
      return { ...prev, gradientStops: newStops };
    });
  }, []);

  /**
   * Reset state to default
   */
  const resetState = useCallback(() => {
    if (!isComponentMounted.current) return;
    
    setState(DEFAULT_STATE);
  }, []);

  /**
   * Load a complete state
   */
  const loadState = useCallback((newState: SuperellipseState) => {
    if (!isComponentMounted.current) return;

    try {
      // Basic validation before loading
      if (typeof newState !== 'object' || newState === null) {
        console.error('Invalid state object provided to loadState');
        return;
      }

      setState(newState);
    } catch (error) {
      console.error('Error loading state:', error);
    }
  }, []);

  /**
   * Randomize glow and color properties
   */
  const randomizeGlow = useCallback(() => {
    if (!isComponentMounted.current) return;

    const randomH = randomInt(0, 360);
    const randomL = randomFloat(60, 90);
    const randomC = randomFloat(0.1, 0.3);
    const hex = hslToHex(randomH, 80, 60);
    
    updateState({
      hue: randomH,
      lightness: randomL,
      chroma: randomC,
      solidColor: hex,
      glowPositionX: randomFloat(-800, -400),
      glowPositionY: randomFloat(-1200, -800),
      glowScale: randomFloat(0.8, 1.4),
      glowBlur: randomInt(80, 160),
      glowSpread: randomInt(20, 60),
    });
  }, [updateState]);

  /**
   * Randomize all parameters
   */
  const randomizeAll = useCallback(() => {
    if (!isComponentMounted.current) return;

    const randomH = randomInt(0, 360);
    const hex = hslToHex(randomH, randomInt(60, 90), randomInt(50, 70));
    
    updateState({
      exp: randomFloat(2, 8),
      width: randomInt(200, 500),
      height: randomInt(250, 600),
      hue: randomH,
      lightness: randomFloat(60, 90),
      chroma: randomFloat(0.1, 0.3),
      solidColor: hex,
      glowPositionX: randomFloat(-800, -400),
      glowPositionY: randomFloat(-1200, -800),
      glowScale: randomFloat(0.7, 1.5),
      glowBlur: randomInt(60, 180),
      glowSpread: randomInt(10, 80),
      noiseIntensity: randomInt(20, 50),
      shadowDistance: randomInt(5, 20),
      shadowIntensity: randomInt(20, 40),
    });
  }, [updateState]);

  // ========================================================================
  // Save state history for potential undo functionality
  // ========================================================================

  useEffect(() => {
    stateHistory.current.push({ ...state });
    
    // Keep only last 50 states
    if (stateHistory.current.length > 50) {
      stateHistory.current.shift();
    }
  }, [state]);

  // ========================================================================
  // Cleanup on Unmount
  // ========================================================================

  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  // ========================================================================
  // Return API
  // ========================================================================

  return {
    state,
    updateState,
    updateGradientStop,
    addGradientStop,
    removeGradientStop,
    resetState,
    loadState,
    randomizeGlow,
    randomizeAll,
    pathData,
    isValid,
    getGradientCSS,
  };
}
