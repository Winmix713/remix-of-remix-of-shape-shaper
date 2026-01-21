import { useState, useCallback, useMemo, memo, type FC } from 'react';
import { SuperellipseState } from '../../hooks/useSuperellipse';
import { SpotlightButton } from './SpotlightButton';

interface PreviewAreaProps {
  state: SuperellipseState;
  pathData: string;
  theme: 'light' | 'dark';
  onSpotlightTrigger?: () => void;
}

// Constants
const NOISE_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' /></filter><rect width='100%' height='100%' filter='url(%23n)' /></svg>";

const GLOW_LAYERS = [
  { top: 400, left: 300, width: 1800, height: 1140, blur: 180, opacity: 0.4, colorIndex: 0 },
  { top: 600, left: 460, width: 1300, height: 1300, blur: 120, opacity: 0.6, colorIndex: 1 },
  { top: 700, left: 560, width: 1000, height: 800, blur: 60, opacity: 1, colorIndex: 2 },
  { top: 800, left: 700, width: 600, height: 440, blur: 80, opacity: 0.4, colorIndex: -1 }, // White highlight
] as const;

const ANIMATION_TIMINGS = {
  FADE_OUT: 400,
  FADE_IN_DELAY: 100,
  GLOW_TRANSITION: 500,
} as const;

// Memoized Glow Layer Component
const GlowLayer = memo<{
  layer: typeof GLOW_LAYERS[number];
  color: string;
}>(({ layer, color }) => (
  <div
    className="absolute rounded-full transition-all duration-300 will-change-transform"
    style={{
      top: `${layer.top}px`,
      left: `${layer.left}px`,
      width: `${layer.width}px`,
      height: `${layer.height}px`,
      filter: `blur(${layer.blur}px)`,
      background: color,
      mixBlendMode: 'screen',
      opacity: layer.opacity,
    }}
    aria-hidden="true"
  />
));

GlowLayer.displayName = 'GlowLayer';

// Memoized Google Icon Component
const GoogleIcon = memo(() => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
));

GoogleIcon.displayName = 'GoogleIcon';

export const PreviewArea: FC<PreviewAreaProps> = ({ 
  state, 
  pathData, 
  theme, 
  onSpotlightTrigger 
}) => {
  const [glowOpacity, setGlowOpacity] = useState(1);
  
  // Memoize OKLCH colors to prevent recalculation
  const glowColors = useMemo(() => {
    const color1 = `oklch(${state.lightness}% ${state.chroma} ${state.hue})`;
    const color2 = `oklch(${Math.min(state.lightness + 10, 100)}% ${state.chroma} ${state.hue})`;
    const color3 = `oklch(${Math.min(state.lightness + 15, 100)}% ${Math.max(state.chroma - 0.05, 0)} ${state.hue})`;
    const colorWhite = 'rgb(255, 255, 255)';
    
    return [color1, color2, color3, colorWhite];
  }, [state.lightness, state.chroma, state.hue]);

  // Memoize glow container styles
  const glowContainerStyle = useMemo(() => ({
    maskImage: 'linear-gradient(black 30%, transparent 100%)',
    left: '-590px',
    top: '-1070px',
    opacity: state.enabled ? glowOpacity : 0,
    transform: `scale(${state.glowScale * 0.75})`,
  }), [state.enabled, state.glowScale, glowOpacity]);

  // Memoize noise overlay styles
  const noiseStyle = useMemo(() => ({
    backgroundImage: `url("${NOISE_SVG}")`,
    backgroundSize: '200px',
    opacity: state.noiseIntensity / 100,
  }), [state.noiseIntensity]);

  // Optimized spotlight trigger with cleanup
  const handleSpotlightTrigger = useCallback(() => {
    setGlowOpacity(0);
    
    const triggerTimeout = setTimeout(() => {
      onSpotlightTrigger?.();
      
      const restoreTimeout = setTimeout(() => {
        setGlowOpacity(1);
      }, ANIMATION_TIMINGS.FADE_IN_DELAY);
      
      return () => clearTimeout(restoreTimeout);
    }, ANIMATION_TIMINGS.FADE_OUT);
    
    return () => clearTimeout(triggerTimeout);
  }, [onSpotlightTrigger]);

  return (
    <section 
      className="flex-1 relative flex items-center justify-center bg-muted dark:bg-[#050505] overflow-hidden p-6 lg:p-0 min-h-[400px]"
      aria-label="Preview area"
    >
      {/* Grid Background */}
      <div 
        className="absolute inset-0 bg-grid pointer-events-none opacity-50" 
        style={{ maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)' }}
        aria-hidden="true"
      />

      {/* Phone Frame */}
      <div 
        className="sm:w-[320px] sm:h-[480px] overflow-hidden transition-all duration-500 dark:bg-[#050505] dark:border-zinc-900 z-10 bg-background w-[300px] h-[400px] border-border border-4 rounded-[40px] relative shadow-2xl"
        role="presentation"
        aria-label="Mobile preview frame"
        style={{
          width: `${state.width}px`,
          height: `${state.height}px`,
          clipPath: `path('${pathData}')`,
          backgroundColor: state.colorMode === 'solid' ? state.solidColor : 'transparent',
          opacity: state.colorMode === 'solid' ? state.solidOpacity / 100 : 1,
          background: state.colorMode === 'linear' 
            ? `linear-gradient(${state.gradientAngle}deg, ${state.gradientStops.map(s => `${s.color} ${s.position}%`).join(', ')})`
            : state.colorMode === 'radial'
            ? `radial-gradient(circle, ${state.gradientStops.map(s => `${s.color} ${s.position}%`).join(', ')})`
            : state.colorMode === 'conic'
            ? `conic-gradient(from ${state.gradientAngle}deg, ${state.gradientStops.map(s => `${s.color} ${s.position}%`).join(', ')})`
            : undefined,
          filter: state.blur > 0 ? `blur(${state.blur}px)` : undefined,
          backdropFilter: state.backdropBlur > 0 ? `blur(${state.backdropBlur}px)` : undefined,
          WebkitBackdropFilter: state.backdropBlur > 0 ? `blur(${state.backdropBlur}px)` : undefined,
          border: state.borderEnabled 
            ? `${state.strokeWidth}px ${state.strokeStyle} ${state.strokeColor}`
            : '4px solid var(--border)',
          borderColor: state.borderEnabled ? state.strokeColor : undefined,
          borderStyle: state.borderEnabled ? state.strokeStyle : 'solid',
          borderWidth: state.borderEnabled ? `${state.strokeWidth}px` : '4px',
        }}
      >
        
        {/* Glow Container - 4-layer progressive blur system */}
        <div 
          className="absolute w-[1700px] h-[2400px] pointer-events-none transition-opacity duration-500 will-change-transform"
          style={glowContainerStyle}
          aria-hidden="true"
        >
          {GLOW_LAYERS.map((layer, index) => (
            <GlowLayer
              key={`glow-layer-${index}`}
              layer={layer}
              color={layer.colorIndex === -1 ? glowColors[3] : glowColors[layer.colorIndex]}
            />
          ))}
        </div>

        {/* Noise Overlay */}
        {state.noiseEnabled && (
          <div 
            className="absolute inset-0 w-full h-full pointer-events-none z-[5] mix-blend-overlay transition-opacity duration-300"
            style={noiseStyle}
            aria-hidden="true"
          />
        )}

        {/* UI Content Overlay */}
        <div className="absolute bottom-0 w-full p-6 pb-8 flex flex-col gap-4 z-20">
          {onSpotlightTrigger && (
            <SpotlightButton onTrigger={handleSpotlightTrigger} />
          )}
          
          {/* Content Section */}
          <article className="space-y-1">
            <p className="text-[10px] font-medium tracking-widest uppercase mb-1 transition-colors text-foreground/60">
              Collaboration Hub
            </p>
            <h1 className="text-xl font-bold leading-tight mb-2 transition-colors text-foreground">
              Get More Done<br/>Together
            </h1>
            <p className="text-xs leading-relaxed transition-colors text-muted-foreground">
              Stay aligned, share ideas, and keep every project moving smoothly.
            </p>
          </article>
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-2 mt-2" role="group" aria-label="Authentication options">
            <button 
              className="group w-full h-10 rounded-full flex items-center justify-center gap-2 font-medium text-xs transition-all duration-200 bg-foreground text-background hover:opacity-90 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
              aria-label="Sign in with Google"
            >
              <GoogleIcon />
              <span>Continue With Google</span>
            </button>
            
            <button 
              className="w-full h-10 rounded-full flex items-center justify-center font-medium text-xs transition-all duration-200 bg-muted text-muted-foreground hover:bg-muted/80 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-muted-foreground focus:ring-offset-2"
              aria-label="Skip authentication"
            >
              Skip
            </button>
          </div>
        </div>
        
        {/* Footer Logo */}
        <div 
          className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] z-20 opacity-40 text-foreground font-mono"
          aria-label="Brand identifier"
        >
          ap.cx
        </div>
      </div>
    </section>
  );
};
