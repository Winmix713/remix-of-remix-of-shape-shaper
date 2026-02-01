/**
 * GlowAnimationControls Component
 * 
 * Animation controls for glow effects including Pulse, Rotate, and Wave animations.
 * Provides real-time preview and CSS export.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Play, Pause, Zap, RotateCw, Waves, Copy, Check, Settings } from 'lucide-react';
import { CustomSlider } from './CustomSlider';

// ============================================================================
// Types
// ============================================================================

export type AnimationType = 'none' | 'pulse' | 'rotate' | 'wave';

export interface GlowAnimationState {
  type: AnimationType;
  duration: number;
  intensity: number;
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  direction: 'normal' | 'reverse' | 'alternate';
  isPlaying: boolean;
}

interface GlowAnimationControlsProps {
  animation: GlowAnimationState;
  onUpdateAnimation: (updates: Partial<GlowAnimationState>) => void;
  glowHue: number;
  glowChroma: number;
  glowLightness: number;
}

// ============================================================================
// Constants
// ============================================================================

const ANIMATION_TYPES: { id: AnimationType; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'none', label: 'None', icon: <Settings className="w-4 h-4" />, description: 'No animation' },
  { id: 'pulse', label: 'Pulse', icon: <Zap className="w-4 h-4" />, description: 'Intensity oscillation' },
  { id: 'rotate', label: 'Rotate', icon: <RotateCw className="w-4 h-4" />, description: 'Hue rotation' },
  { id: 'wave', label: 'Wave', icon: <Waves className="w-4 h-4" />, description: 'Size breathing' },
];

const EASING_OPTIONS = [
  { value: 'linear', label: 'Linear' },
  { value: 'ease', label: 'Ease' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In-Out' },
] as const;

const DIRECTION_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'reverse', label: 'Reverse' },
  { value: 'alternate', label: 'Alternate' },
] as const;

// ============================================================================
// Default State
// ============================================================================

export const DEFAULT_GLOW_ANIMATION: GlowAnimationState = {
  type: 'none',
  duration: 2,
  intensity: 50,
  easing: 'ease-in-out',
  direction: 'alternate',
  isPlaying: false,
};

// ============================================================================
// CSS Generator
// ============================================================================

const generateAnimationCSS = (
  animation: GlowAnimationState,
  hue: number,
  chroma: number,
  lightness: number
): string => {
  if (animation.type === 'none') return '/* No animation */';

  const animationName = `glow-${animation.type}`;
  let keyframes = '';
  let animationProperty = '';

  switch (animation.type) {
    case 'pulse':
      keyframes = `@keyframes ${animationName} {
  0%, 100% {
    opacity: ${(animation.intensity / 100).toFixed(2)};
    filter: blur(80px);
  }
  50% {
    opacity: ${(animation.intensity / 100 * 0.4).toFixed(2)};
    filter: blur(120px);
  }
}`;
      break;

    case 'rotate':
      keyframes = `@keyframes ${animationName} {
  0% {
    background: oklch(${lightness}% ${chroma} ${hue});
  }
  33% {
    background: oklch(${lightness}% ${chroma} ${(hue + 120) % 360});
  }
  66% {
    background: oklch(${lightness}% ${chroma} ${(hue + 240) % 360});
  }
  100% {
    background: oklch(${lightness}% ${chroma} ${hue});
  }
}`;
      break;

    case 'wave':
      keyframes = `@keyframes ${animationName} {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(${1 + animation.intensity / 100});
  }
}`;
      break;
  }

  animationProperty = `animation: ${animationName} ${animation.duration}s ${animation.easing} infinite ${animation.direction};`;

  return `/* Glow Animation: ${animation.type} */
${keyframes}

.glow-effect {
  ${animationProperty}
}`;
};

// ============================================================================
// Subcomponents
// ============================================================================

interface AnimationTypeSelectorProps {
  selected: AnimationType;
  onChange: (type: AnimationType) => void;
}

const AnimationTypeSelector: React.FC<AnimationTypeSelectorProps> = ({ selected, onChange }) => (
  <div className="grid grid-cols-4 gap-1 p-1 bg-muted rounded-lg">
    {ANIMATION_TYPES.map((anim) => (
      <button
        key={anim.id}
        onClick={() => onChange(anim.id)}
        className={`
          flex flex-col items-center gap-1 p-2 rounded-md transition-all
          ${selected === anim.id
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          }
        `}
        title={anim.description}
        aria-pressed={selected === anim.id}
      >
        {anim.icon}
        <span className="text-[9px] font-medium">{anim.label}</span>
      </button>
    ))}
  </div>
);

interface SelectFieldProps {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, value, options, onChange }) => (
  <div className="space-y-1">
    <label className="text-[10px] text-muted-foreground">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

interface CopyButtonInlineProps {
  content: string;
}

const CopyButtonInline: React.FC<CopyButtonInlineProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }, [content]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 text-[10px] rounded bg-muted hover:bg-muted-foreground/20 transition-colors text-muted-foreground"
    >
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : 'Copy CSS'}
    </button>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const GlowAnimationControls: React.FC<GlowAnimationControlsProps> = ({
  animation,
  onUpdateAnimation,
  glowHue,
  glowChroma,
  glowLightness,
}) => {
  const handleUpdate = useCallback(<K extends keyof GlowAnimationState>(
    key: K,
    value: GlowAnimationState[K]
  ) => {
    onUpdateAnimation({ [key]: value });
  }, [onUpdateAnimation]);

  const togglePlay = useCallback(() => {
    handleUpdate('isPlaying', !animation.isPlaying);
  }, [animation.isPlaying, handleUpdate]);

  const cssCode = useMemo(
    () => generateAnimationCSS(animation, glowHue, glowChroma, glowLightness),
    [animation, glowHue, glowChroma, glowLightness]
  );

  const showControls = animation.type !== 'none';

  return (
    <div className="space-y-4 p-4 bg-muted/30 border border-border rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <p className="text-xs font-semibold text-foreground">Glow Animation</p>
        </div>
        {showControls && (
          <button
            onClick={togglePlay}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
              ${animation.isPlaying
                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }
            `}
          >
            {animation.isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Preview
              </>
            )}
          </button>
        )}
      </div>

      {/* Animation Type Selector */}
      <AnimationTypeSelector
        selected={animation.type}
        onChange={(type) => handleUpdate('type', type)}
      />

      {/* Animation Controls */}
      {showControls && (
        <div className="space-y-4 pt-2 animate-fade-in">
          <CustomSlider
            label="Duration"
            value={animation.duration}
            min={0.5}
            max={10}
            step={0.5}
            onChange={(val) => handleUpdate('duration', val)}
            unit="s"
          />

          <CustomSlider
            label="Intensity"
            value={animation.intensity}
            min={10}
            max={100}
            step={5}
            onChange={(val) => handleUpdate('intensity', val)}
            unit="%"
          />

          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Easing"
              value={animation.easing}
              options={EASING_OPTIONS}
              onChange={(val) => handleUpdate('easing', val as GlowAnimationState['easing'])}
            />
            <SelectField
              label="Direction"
              value={animation.direction}
              options={DIRECTION_OPTIONS}
              onChange={(val) => handleUpdate('direction', val as GlowAnimationState['direction'])}
            />
          </div>

          {/* CSS Export */}
          <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium text-muted-foreground">Generated CSS</p>
            <CopyButtonInline content={cssCode} />
          </div>
          <pre className="p-2 text-[10px] bg-secondary text-primary rounded-md overflow-x-auto font-mono max-h-32">
            {cssCode}
          </pre>
          </div>
        </div>
      )}

      {/* Info when no animation */}
      {!showControls && (
        <p className="text-[10px] text-muted-foreground text-center py-2">
          Select an animation type to add dynamic effects to your glow.
        </p>
      )}
    </div>
  );
};

export default GlowAnimationControls;
