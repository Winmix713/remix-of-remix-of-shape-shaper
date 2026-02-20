/**
 * PreviewArea Component
 * 
 * A highly optimized preview component for displaying superellipse shapes with advanced
 * visual effects including multi-layer glow, noise overlay, and interactive UI elements.
 * 
 * Features:
 * - Multi-layer progressive blur glow system (4 layers)
 * - Dynamic OKLCH color generation
 * - Noise texture overlay with customizable intensity
 * - Responsive mobile frame preview
 * - Spotlight animation effects
 * - Full accessibility support (ARIA labels, semantic HTML)
 * - Performance optimized with memoization and will-change
 * 
 * @example
 * ```tsx
 * <PreviewArea
 *   state={superellipseState}
 *   pathData={generatedPath}
 *   theme="dark"
 *   onSpotlightTrigger={handleSpotlight}
 * />
 * ```
 */

import { 
  useState, 
  useCallback, 
  useMemo, 
  memo, 
  useRef,
  useEffect,
  type FC, 
  type CSSProperties 
} from 'react';
import { SuperellipseState } from '../../hooks/useSuperellipse';
import { SpotlightButton } from './SpotlightButton';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface PreviewAreaProps {
  /** Current superellipse state configuration */
  state: SuperellipseState;
  /** Generated SVG path data for clipping */
  pathData: string;
  /** Current theme mode */
  theme: 'light' | 'dark';
  /** Optional callback when spotlight effect is triggered */
  onSpotlightTrigger?: () => void;
}

interface GlowLayerConfig {
  /** Top position in pixels */
  top: number;
  /** Left position in pixels */
  left: number;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Blur radius in pixels */
  blur: number;
  /** Opacity value (0-1) */
  opacity: number;
  /** Index of color to use from color array (-1 for white) */
  colorIndex: number;
}

// ============================================================================
// Constants
// ============================================================================

/** Base64 encoded SVG noise texture */
const NOISE_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' /></filter><rect width='100%' height='100%' filter='url(%23n)' /></svg>";

/** Configuration for the 4-layer progressive blur glow system */
const GLOW_LAYERS: readonly GlowLayerConfig[] = [
  { top: 400, left: 300, width: 1800, height: 1140, blur: 180, opacity: 0.4, colorIndex: 0 },
  { top: 600, left: 460, width: 1300, height: 1300, blur: 120, opacity: 0.6, colorIndex: 1 },
  { top: 700, left: 560, width: 1000, height: 800, blur: 60, opacity: 1, colorIndex: 2 },
  { top: 800, left: 700, width: 600, height: 440, blur: 80, opacity: 0.4, colorIndex: -1 }, // White highlight
] as const;

/** Animation timing constants in milliseconds */
const ANIMATION_TIMINGS = {
  /** Fade out duration for spotlight trigger */
  FADE_OUT: 400,
  /** Delay before fade in after spotlight */
  FADE_IN_DELAY: 100,
  /** Glow transition duration */
  GLOW_TRANSITION: 500,
} as const;

/** Default frame dimensions */
const FRAME_DIMENSIONS = {
  MOBILE: { width: 300, height: 400 },
  TABLET: { width: 320, height: 480 },
} as const;

/** Minimum and maximum values for validation */
const VALIDATION = {
  MIN_OPACITY: 0,
  MAX_OPACITY: 100,
  MIN_DIMENSION: 10,
  MAX_DIMENSION: 2000,
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validates opacity value
 */
const isValidOpacity = (opacity: number): boolean => {
  return opacity >= VALIDATION.MIN_OPACITY && opacity <= VALIDATION.MAX_OPACITY;
};

/**
 * Validates dimension value
 */
const isValidDimension = (dimension: number): boolean => {
  return dimension >= VALIDATION.MIN_DIMENSION && dimension <= VALIDATION.MAX_DIMENSION;
};

/**
 * Safely clamps a number between min and max
 */
const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Generates OKLCH color string with validation
 */
const generateOKLCH = (lightness: number, chroma: number, hue: number): string => {
  const safeLightness = clamp(lightness, 0, 100);
  const safeChroma = clamp(chroma, 0, 0.4);
  const safeHue = hue % 360;
  return `oklch(${safeLightness}% ${safeChroma} ${safeHue})`;
};

// ============================================================================
// Memoized Sub-Components
// ============================================================================

/**
 * Individual glow layer component
 * Memoized to prevent unnecessary re-renders
 */
const GlowLayer = memo<{
  layer: GlowLayerConfig;
  color: string;
  customBlur?: number;
  customOpacity?: number;
}>(({ layer, color, customBlur, customOpacity }) => {
  const style = useMemo<CSSProperties>(() => ({
    top: `${layer.top}px`,
    left: `${layer.left}px`,
    width: `${layer.width}px`,
    height: `${layer.height}px`,
    filter: `blur(${customBlur ?? layer.blur}px)`,
    backgroundColor: color,
    mixBlendMode: 'screen',
    opacity: customOpacity ?? layer.opacity,
  }), [layer, color, customBlur, customOpacity]);

  return (
    <div
      className="absolute rounded-full transition-all duration-300 will-change-transform"
      style={style}
      aria-hidden="true"
    />
  );
});

GlowLayer.displayName = 'GlowLayer';

/**
 * Google logo icon component
 * Memoized for performance
 */
const GoogleIcon = memo(() => (
  <svg 
    className="w-4 h-4" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    aria-hidden="true"
    role="img"
    focusable="false"
  >
    <title>Google</title>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
));

GoogleIcon.displayName = 'GoogleIcon';

/**
 * Grid background component
 * Memoized for performance optimization
 */
const GridBackground = memo(() => (
  <div 
    className="absolute inset-0 bg-grid pointer-events-none opacity-50" 
    style={{ 
      maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
      WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
    }}
    aria-hidden="true"
    role="presentation"
  />
));

GridBackground.displayName = 'GridBackground';

// ============================================================================
// Main Component
// ============================================================================

const PreviewAreaInner: FC<PreviewAreaProps> = ({ 
  state, 
  pathData, 
  theme, 
  onSpotlightTrigger 
}) => {
  // ========================================================================
  // State Management
  // ========================================================================
  
  const [glowOpacity, setGlowOpacity] = useState(1);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const isComponentMounted = useRef(true);

  // ========================================================================
  // Validation
  // ========================================================================

  // Validate state values
  useEffect(() => {
    if (!isValidDimension(state.width) || !isValidDimension(state.height)) {
      console.warn('Invalid dimensions detected in PreviewArea state');
    }
    if (!isValidOpacity(state.solidOpacity) || !isValidOpacity(state.glowOpacity)) {
      console.warn('Invalid opacity values detected in PreviewArea state');
    }
  }, [state.width, state.height, state.solidOpacity, state.glowOpacity]);

  // ========================================================================
  // Memoized Values
  // ========================================================================

  /**
   * OKLCH color palette for glow layers
   * Memoized to prevent recalculation on every render
   */
  const glowColors = useMemo(() => {
    try {
      const color1 = generateOKLCH(state.lightness, state.chroma, state.hue);
      const color2 = generateOKLCH(
        Math.min(state.lightness + 10, 100), 
        state.chroma, 
        state.hue
      );
      const color3 = generateOKLCH(
        Math.min(state.lightness + 15, 100), 
        Math.max(state.chroma - 0.05, 0), 
        state.hue
      );
      const colorWhite = 'rgb(255, 255, 255)';
      
      return [color1, color2, color3, colorWhite];
    } catch (error) {
      console.error('Error generating glow colors:', error);
      return ['oklch(78% 0.18 40)', 'oklch(88% 0.18 40)', 'oklch(93% 0.13 40)', 'rgb(255, 255, 255)'];
    }
  }, [state.lightness, state.chroma, state.hue]);

  /**
   * Glow container positioning and opacity styles
   */
  const glowContainerStyle = useMemo<CSSProperties>(() => ({
    maskImage: 'linear-gradient(black 30%, transparent 100%)',
    WebkitMaskImage: 'linear-gradient(black 30%, transparent 100%)',
    left: `${state.glowPositionX}px`,
    top: `${state.glowPositionY}px`,
    opacity: (state.enabled ? glowOpacity : 0) * (state.glowOpacity / 100),
    transform: `scale(${state.glowScale})`,
    transition: `opacity ${ANIMATION_TIMINGS.GLOW_TRANSITION}ms ease-out`,
  }), [
    state.enabled, 
    state.glowScale, 
    state.glowPositionX, 
    state.glowPositionY, 
    state.glowOpacity, 
    glowOpacity
  ]);

  /**
   * Noise overlay background styles
   */
  const noiseStyle = useMemo<CSSProperties>(() => ({
    backgroundImage: `url("${NOISE_SVG}")`,
    backgroundSize: '200px',
    backgroundRepeat: 'repeat',
    opacity: clamp(state.noiseIntensity / 100, 0, 1),
    transition: 'opacity 300ms ease-out',
  }), [state.noiseIntensity]);

  /**
   * Main phone frame styles with gradient/color support
   * Fixed: No backgroundColor/background conflicts
   */
  const phoneFrameStyle = useMemo<CSSProperties>(() => {
    const baseStyle: CSSProperties = {
      width: `${state.width}px`,
      height: `${state.height}px`,
      clipPath: `path('${pathData}')`,
      WebkitClipPath: `path('${pathData}')`,
      transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
    };

    // Build CSS filter string from all filter properties
    const filters: string[] = [];
    if (state.blur > 0) filters.push(`blur(${state.blur}px)`);
    if (state.brightness !== 100) filters.push(`brightness(${state.brightness / 100})`);
    if (state.contrast !== 100) filters.push(`contrast(${state.contrast / 100})`);
    if (state.saturate !== 100) filters.push(`saturate(${state.saturate / 100})`);
    if (state.hueRotate !== 0) filters.push(`hue-rotate(${state.hueRotate}deg)`);
    if (state.distortionStrength > 0) filters.push(`url(#noise-distortion-filter)`);
    if (filters.length > 0) {
      baseStyle.filter = filters.join(' ');
    }

    // Backdrop blur (combines frost blur + backdrop blur)
    const totalBackdropBlur = state.backdropBlur + (state.frostBlur || 0);
    if (totalBackdropBlur > 0) {
      const blurValue = `blur(${totalBackdropBlur}px)`;
      baseStyle.backdropFilter = blurValue;
      baseStyle.WebkitBackdropFilter = blurValue;
    }

    // Inner shadow via box-shadow inset
    if (state.innerShadowBlur > 0 || state.innerShadowSpread !== 0) {
      baseStyle.boxShadow = `inset 0 0 ${state.innerShadowBlur}px ${state.innerShadowSpread}px ${state.innerShadowColor}`;
    }

    // Border configuration
    if (state.borderEnabled) {
      const borderWidth = `${state.strokeWidth}px`;
      baseStyle.borderWidth = borderWidth;
      baseStyle.borderStyle = state.strokeStyle;
      baseStyle.borderColor = state.strokeColor;
      baseStyle.outline = 'none';
      if (!baseStyle.boxShadow) baseStyle.boxShadow = 'none';
    } else {
      // Default minimal border for structure
      baseStyle.borderWidth = '4px';
      baseStyle.borderStyle = 'solid';
    }

    // Color mode handling - ONLY ONE background property
    switch (state.colorMode) {
      case 'solid':
        baseStyle.backgroundColor = state.solidColor;
        baseStyle.opacity = clamp(state.solidOpacity / 100, 0, 1);
        break;
      
      case 'linear':
        baseStyle.backgroundImage = `linear-gradient(${state.gradientAngle}deg, ${
          state.gradientStops.map(s => `${s.color} ${s.position}%`).join(', ')
        })`;
        break;
      
      case 'radial':
        baseStyle.backgroundImage = `radial-gradient(circle, ${
          state.gradientStops.map(s => `${s.color} ${s.position}%`).join(', ')
        })`;
        break;
      
      case 'conic':
        baseStyle.backgroundImage = `conic-gradient(from ${state.gradientAngle}deg, ${
          state.gradientStops.map(s => `${s.color} ${s.position}%`).join(', ')
        })`;
        break;
    }

    return baseStyle;
  }, [
    state.width, 
    state.height, 
    pathData, 
    state.colorMode, 
    state.solidColor, 
    state.solidOpacity,
    state.gradientAngle,
    state.gradientStops,
    state.blur,
    state.backdropBlur,
    state.borderEnabled,
    state.strokeWidth,
    state.strokeStyle,
    state.strokeColor,
    state.brightness,
    state.contrast,
    state.saturate,
    state.hueRotate,
    state.frostBlur,
    state.innerShadowBlur,
    state.innerShadowSpread,
    state.innerShadowColor,
  ]);

  /**
   * Stroke overlay styles (for separate opacity control)
   */
  const strokeOverlayStyle = useMemo<CSSProperties>(() => ({
    clipPath: `path('${pathData}')`,
    WebkitClipPath: `path('${pathData}')`,
    borderWidth: `${state.strokeWidth}px`,
    borderStyle: state.strokeStyle,
    borderColor: state.strokeColor,
    opacity: clamp(state.strokeOpacity / 100, 0, 1),
    transition: 'opacity 200ms ease-out',
  }), [pathData, state.strokeWidth, state.strokeStyle, state.strokeColor, state.strokeOpacity]);

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Handle spotlight trigger with proper animation timing and cleanup
   */
  const handleSpotlightTrigger = useCallback(() => {
    if (!isComponentMounted.current) return;

    // Fade out glow
    setGlowOpacity(0);
    
    // Trigger callback after fade out
    const triggerTimeout = setTimeout(() => {
      if (!isComponentMounted.current) return;
      onSpotlightTrigger?.();
      
      // Restore glow after delay
      const restoreTimeout = setTimeout(() => {
        if (!isComponentMounted.current) return;
        setGlowOpacity(1);
      }, ANIMATION_TIMINGS.FADE_IN_DELAY);
      
      timeoutRefs.current.push(restoreTimeout);
    }, ANIMATION_TIMINGS.FADE_OUT);
    
    timeoutRefs.current.push(triggerTimeout);
  }, [onSpotlightTrigger]);

  // ========================================================================
  // Cleanup
  // ========================================================================

  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
      // Clear all pending timeouts
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current = [];
    };
  }, []);

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <section 
      className="relative flex items-center justify-center overflow-visible p-6 lg:p-0"
      aria-label="Superellipse preview area"
      role="region"
    >
      {/* Grid Background */}
      <GridBackground />

      {/* SVG Noise Distortion Filter Definition */}
      {state.distortionStrength > 0 && (
        <svg
          style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
          aria-hidden="true"
        >
          <defs>
            <filter id="noise-distortion-filter">
              <feTurbulence
                type="fractalNoise"
                baseFrequency={state.noiseFrequency / 1000}
                numOctaves={3}
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={state.distortionStrength}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}

      {/* Phone Frame Container */}
      <div 
        className="sm:w-[320px] sm:h-[480px] overflow-hidden transition-all duration-500 z-10 bg-background w-[300px] h-[400px] rounded-[40px] relative shadow-2xl border border-border"
        role="presentation"
        aria-label="Mobile device preview frame"
        style={phoneFrameStyle}
      >
        {/* Stroke Overlay Layer (for independent opacity) */}
        {state.borderEnabled && (
          <div 
            className="absolute inset-0 pointer-events-none z-[15]"
            style={strokeOverlayStyle}
            aria-hidden="true"
          />
        )}
        
        {/* Glow Container - 4-layer progressive blur system */}
        {state.enabled && (
          <div 
            className="absolute w-[1700px] h-[2400px] pointer-events-none will-change-transform"
            style={glowContainerStyle}
            aria-hidden="true"
            role="presentation"
          >
            {GLOW_LAYERS.map((layer, index) => (
              <GlowLayer
                key={`glow-layer-${index}`}
                layer={layer}
                color={layer.colorIndex === -1 ? glowColors[3] : glowColors[layer.colorIndex]}
                customBlur={index === 1 ? state.glowBlur : undefined}
              />
            ))}
          </div>
        )}

        {/* Glass Tint Overlay */}
        {state.tintOpacity > 0 && (
          <div
            className="absolute inset-0 w-full h-full pointer-events-none z-[4]"
            style={{
              backgroundColor: state.tintColor,
              opacity: state.tintOpacity / 100,
            }}
            aria-hidden="true"
          />
        )}

        {/* Noise Overlay */}
        {state.noiseEnabled && (
          <div 
            className="absolute inset-0 w-full h-full pointer-events-none z-[5] mix-blend-overlay"
            style={noiseStyle}
            aria-hidden="true"
            role="presentation"
          />
        )}

        {/* UI Content Overlay */}
        <div className="absolute bottom-0 w-full p-6 pb-8 flex flex-col gap-4 z-20">
          {/* Spotlight Button */}
          {onSpotlightTrigger && (
            <SpotlightButton onTrigger={handleSpotlightTrigger} />
          )}
          
          {/* Content Section */}
          <article className="space-y-1" aria-labelledby="preview-heading">
            <p 
              className="text-[10px] font-medium tracking-widest uppercase mb-1 transition-colors text-foreground/60"
              aria-label="Category"
            >
              Collaboration Hub
            </p>
            <h1 
              id="preview-heading"
              className="text-xl font-bold leading-tight mb-2 transition-colors text-foreground"
            >
              Get More Done<br/>Together
            </h1>
            <p className="text-xs leading-relaxed transition-colors text-muted-foreground">
              Stay aligned, share ideas, and keep every project moving smoothly.
            </p>
          </article>
          
          {/* Action Buttons */}
          <div 
            className="flex flex-col gap-2 mt-2" 
            role="group" 
            aria-label="Authentication options"
          >
            <button 
              className="group w-full h-10 rounded-full flex items-center justify-center gap-2 font-medium text-xs transition-all duration-200 bg-foreground text-background hover:opacity-90 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
              aria-label="Sign in with Google"
              type="button"
            >
              <GoogleIcon />
              <span>Continue With Google</span>
            </button>
            
            <button 
              className="w-full h-10 rounded-full flex items-center justify-center font-medium text-xs transition-all duration-200 bg-muted text-muted-foreground hover:bg-muted/80 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-muted-foreground focus:ring-offset-2 focus:ring-offset-background"
              aria-label="Skip authentication"
              type="button"
            >
              Skip
            </button>
          </div>
        </div>
        
        {/* Footer Logo */}
        <div 
          className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] z-20 opacity-40 text-foreground font-mono"
          aria-label="Brand identifier"
          role="contentinfo"
        >
          ap.cx
        </div>
      </div>
    </section>
  );
};

// Properly memoize the component
export const PreviewArea = memo(PreviewAreaInner);

PreviewArea.displayName = 'PreviewArea';
