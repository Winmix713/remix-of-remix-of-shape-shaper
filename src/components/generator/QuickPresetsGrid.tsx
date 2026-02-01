/**
 * QuickPresetsGrid Component
 * 
 * Card-based quick preset selector with visual previews.
 * Provides instant access to common superellipse styles.
 */

import React, { useMemo, useCallback } from 'react';
import { Smartphone, Pill, Square, Circle, Hexagon, Star, RectangleHorizontal, Sparkles } from 'lucide-react';
import { SuperellipseState } from '../../hooks/useSuperellipse';

// ============================================================================
// Types
// ============================================================================

interface QuickPresetsGridProps {
  currentState: SuperellipseState;
  onApplyPreset: (updates: Partial<SuperellipseState>) => void;
}

interface QuickPreset {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  preview: {
    exp: number;
    aspectRatio: 'square' | 'portrait' | 'landscape';
  };
  values: Partial<SuperellipseState>;
}

// ============================================================================
// Presets Configuration
// ============================================================================

const QUICK_PRESETS: QuickPreset[] = [
  {
    id: 'ios-icon',
    name: 'iOS Icon',
    icon: <Smartphone className="w-4 h-4" />,
    description: 'Apple-style app icon',
    preview: { exp: 4.5, aspectRatio: 'square' },
    values: {
      width: 120,
      height: 120,
      exp: 4.5,
      useAsymmetricCorners: false,
    },
  },
  {
    id: 'pill',
    name: 'Pill',
    icon: <Pill className="w-4 h-4" />,
    description: 'Rounded capsule shape',
    preview: { exp: 10, aspectRatio: 'landscape' },
    values: {
      width: 200,
      height: 60,
      exp: 10,
      useAsymmetricCorners: false,
    },
  },
  {
    id: 'rounded-rect',
    name: 'Rounded',
    icon: <RectangleHorizontal className="w-4 h-4" />,
    description: 'Soft rounded corners',
    preview: { exp: 3, aspectRatio: 'landscape' },
    values: {
      width: 320,
      height: 200,
      exp: 3,
      useAsymmetricCorners: false,
    },
  },
  {
    id: 'squircle',
    name: 'Squircle',
    icon: <Square className="w-4 h-4" />,
    description: 'Perfect squircle blend',
    preview: { exp: 4, aspectRatio: 'square' },
    values: {
      width: 160,
      height: 160,
      exp: 4,
      useAsymmetricCorners: false,
    },
  },
  {
    id: 'circle',
    name: 'Circle',
    icon: <Circle className="w-4 h-4" />,
    description: 'Perfect circle',
    preview: { exp: 2, aspectRatio: 'square' },
    values: {
      width: 160,
      height: 160,
      exp: 2,
      useAsymmetricCorners: false,
    },
  },
  {
    id: 'sharp',
    name: 'Sharp',
    icon: <Hexagon className="w-4 h-4" />,
    description: 'Angular diamond shape',
    preview: { exp: 1, aspectRatio: 'square' },
    values: {
      width: 160,
      height: 160,
      exp: 1,
      useAsymmetricCorners: false,
    },
  },
  {
    id: 'card',
    name: 'Card',
    icon: <RectangleHorizontal className="w-4 h-4" />,
    description: 'UI card preset',
    preview: { exp: 5, aspectRatio: 'portrait' },
    values: {
      width: 320,
      height: 400,
      exp: 5,
      useAsymmetricCorners: false,
    },
  },
  {
    id: 'asymmetric',
    name: 'Asymmetric',
    icon: <Star className="w-4 h-4" />,
    description: 'Mixed corner radii',
    preview: { exp: 4, aspectRatio: 'square' },
    values: {
      width: 200,
      height: 200,
      exp: 4,
      useAsymmetricCorners: true,
      cornerExponents: {
        topLeft: 2,
        topRight: 6,
        bottomRight: 2,
        bottomLeft: 6,
      },
    },
  },
];

// ============================================================================
// Preview Shape Component
// ============================================================================

interface PreviewShapeProps {
  exp: number;
  aspectRatio: 'square' | 'portrait' | 'landscape';
  isActive: boolean;
}

const PreviewShape: React.FC<PreviewShapeProps> = ({ exp, aspectRatio, isActive }) => {
  const dimensions = useMemo(() => {
    switch (aspectRatio) {
      case 'portrait': return { width: 24, height: 32 };
      case 'landscape': return { width: 36, height: 16 };
      default: return { width: 28, height: 28 };
    }
  }, [aspectRatio]);

  // Simple superellipse path for preview
  const pathData = useMemo(() => {
    const { width, height } = dimensions;
    const a = width / 2;
    const b = height / 2;
    const points: string[] = [];
    const steps = 72;

    for (let i = 0; i <= steps; i++) {
      const t = (i * 2 * Math.PI) / steps;
      const cosT = Math.cos(t);
      const sinT = Math.sin(t);
      const x = a * Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / exp);
      const y = b * Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / exp);
      points.push(`${(x + a).toFixed(1)} ${(y + b).toFixed(1)}`);
    }

    return `M ${points.join(' L ')} Z`;
  }, [dimensions, exp]);

  return (
    <svg 
      width={dimensions.width} 
      height={dimensions.height}
      className="shrink-0"
    >
      <path
        d={pathData}
        className={`transition-colors ${
          isActive 
            ? 'fill-primary' 
            : 'fill-muted-foreground/30 group-hover:fill-muted-foreground/50'
        }`}
      />
    </svg>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const QuickPresetsGrid: React.FC<QuickPresetsGridProps> = ({
  currentState,
  onApplyPreset,
}) => {
  // Check if a preset is currently active
  const activePresetId = useMemo(() => {
    for (const preset of QUICK_PRESETS) {
      const vals = preset.values;
      if (
        vals.exp === currentState.exp &&
        vals.width === currentState.width &&
        vals.height === currentState.height
      ) {
        return preset.id;
      }
    }
    return null;
  }, [currentState.exp, currentState.width, currentState.height]);

  const handleApply = useCallback((preset: QuickPreset) => {
    onApplyPreset(preset.values);
  }, [onApplyPreset]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
        <p className="text-xs font-medium text-muted-foreground">Quick Presets</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {QUICK_PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;
          
          return (
            <button
              key={preset.id}
              onClick={() => handleApply(preset)}
              className={`
                group relative flex items-center gap-3 p-3 rounded-xl border transition-all
                text-left hover:scale-[1.02] active:scale-[0.98]
                ${isActive
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                }
              `}
              aria-pressed={isActive}
              aria-label={`Apply ${preset.name} preset: ${preset.description}`}
            >
              {/* Shape Preview */}
              <div className="flex items-center justify-center w-10 h-10">
                <PreviewShape 
                  exp={preset.preview.exp} 
                  aspectRatio={preset.preview.aspectRatio}
                  isActive={isActive}
                />
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${
                  isActive ? 'text-primary' : 'text-foreground'
                }`}>
                  {preset.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {preset.description}
                </p>
              </div>

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickPresetsGrid;
