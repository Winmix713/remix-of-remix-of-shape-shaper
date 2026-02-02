import { useState, useCallback, type FC } from 'react';
import { SuperellipseState } from '../../../hooks/useSuperellipse';
import { CustomSlider } from '../CustomSlider';
import { EffectStack } from '../effects';
import { Effect, createEffect, EFFECT_PRESETS } from '@/types/effects';

interface EffectsTabProps {
  state: SuperellipseState;
  updateState: (updates: Partial<SuperellipseState>) => void;
}

export const EffectsTab: FC<EffectsTabProps> = ({ state, updateState }) => {
  // Local state for effect stack (will be moved to global state later)
  const [effects, setEffects] = useState<Effect[]>([]);

  // Blur value validation
  const handleBlurChange = (val: number) => {
    updateState({ blur: Math.max(0, Math.min(50, val)) });
  };

  const handleBackdropBlurChange = (val: number) => {
    updateState({ backdropBlur: Math.max(0, Math.min(30, val)) });
  };

  // Toggle border with optional reset
  const handleBorderToggle = () => {
    const newBorderEnabled = !state.borderEnabled;
    if (!newBorderEnabled) {
      updateState({
        borderEnabled: false,
        strokeWidth: 2,
        strokeColor: '#000000',
        strokeOpacity: 100,
        strokePosition: 'center',
        strokeStyle: 'solid'
      });
    } else {
      updateState({ borderEnabled: true });
    }
  };

  // Toggle noise with optional reset
  const handleNoiseToggle = () => {
    const newNoiseEnabled = !state.noiseEnabled;
    if (!newNoiseEnabled) {
      updateState({
        noiseEnabled: false,
        noiseIntensity: 30
      });
    } else {
      updateState({ noiseEnabled: true });
    }
  };

  const handleEffectsChange = useCallback((newEffects: Effect[]) => {
    setEffects(newEffects);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Effect Stack */}
      <EffectStack 
        effects={effects} 
        onChange={handleEffectsChange}
      />

      <div className="h-px bg-border" />

      {/* Legacy Blur Effects */}
      <div className="space-y-4">
        <p className="text-xs font-medium text-muted-foreground">Basic Effects</p>
        <div>
          <CustomSlider
            label="Blur"
            value={state.blur || 0}
            min={0}
            max={50}
            step={1}
            onChange={handleBlurChange}
            unit="px"
          />
          <p 
            className="text-[10px] text-muted-foreground px-1 mt-1"
            id="blur-description"
          >
            Apply gaussian blur to the entire shape
          </p>
        </div>

        <div>
          <CustomSlider
            label="Backdrop Blur"
            value={state.backdropBlur}
            min={0}
            max={30}
            step={1}
            onChange={handleBackdropBlurChange}
            unit="px"
          />
          <p 
            className="text-[10px] text-muted-foreground px-1 mt-1"
            id="backdrop-blur-description"
          >
            Blur the background (glassmorphism effect)
          </p>
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Border/Stroke Controls */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-foreground">Stroke</p>
            <p className="text-[10px] text-muted-foreground">Add border outline</p>
          </div>
          <button
            onClick={handleBorderToggle}
            className={`relative w-10 h-6 rounded-full transition-all ${
              state.borderEnabled ? 'bg-primary' : 'bg-muted'
            }`}
            role="switch"
            aria-checked={state.borderEnabled}
            aria-label={state.borderEnabled ? "Disable stroke" : "Enable stroke"}
          >
            <span
              className="block w-4 h-4 rounded-full bg-background shadow-sm transition-transform"
              style={{
                transform: state.borderEnabled ? 'translateX(1.25rem)' : 'translateX(0.125rem)',
                margin: '0.25rem',
              }}
            />
          </button>
        </div>

        {state.borderEnabled && (
          <div className="space-y-4 animate-fade-in">
            {/* Stroke Color */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground px-1">
                Stroke Color
              </label>
              <div className="flex items-center p-1 bg-muted rounded-[0.625rem]">
                <div className="relative size-7 mr-3 rounded-md border border-border overflow-hidden">
                  <input
                    type="color"
                    value={state.strokeColor || '#000000'}
                    onChange={(e) => updateState({ strokeColor: e.target.value })}
                    className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer opacity-0 z-10"
                    aria-label="Stroke color picker"
                  />
                  <div className="w-full h-full" style={{ backgroundColor: state.strokeColor || '#000000' }} />
                </div>
                <input
                  type="text"
                  value={(state.strokeColor || '#000000').toUpperCase()}
                  onChange={(e) => updateState({ strokeColor: e.target.value })}
                  className="flex-1 bg-transparent border-none text-sm font-mono text-foreground uppercase focus:outline-none"
                  maxLength={7}
                  placeholder="#000000"
                  aria-label="Stroke hex color code"
                />
              </div>
            </div>

            <CustomSlider
              label="Stroke Width"
              value={state.strokeWidth}
              min={0}
              max={20}
              step={1}
              onChange={(val) => updateState({ strokeWidth: val })}
              unit="px"
            />

            {/* Position */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground px-1">Position</p>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Stroke position">
                {(['inside', 'center', 'outside'] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => updateState({ strokePosition: pos })}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-all capitalize ${
                      state.strokePosition === pos
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    aria-pressed={state.strokePosition === pos}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground px-1">Style</p>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Stroke style">
                {(['solid', 'dashed', 'dotted'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => updateState({ strokeStyle: style })}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-all capitalize ${
                      state.strokeStyle === style
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    aria-pressed={state.strokeStyle === style}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <CustomSlider
              label="Stroke Opacity"
              value={state.strokeOpacity}
              min={0}
              max={100}
              step={1}
              onChange={(val) => updateState({ strokeOpacity: val })}
              unit="%"
            />
          </div>
        )}
      </div>

      <div className="h-px bg-border" />

      {/* Noise Overlay */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-foreground">Noise Overlay</p>
            <p className="text-[10px] text-muted-foreground">Add texture grain</p>
          </div>
          <button
            onClick={handleNoiseToggle}
            className={`relative w-10 h-6 rounded-full transition-all ${
              state.noiseEnabled ? 'bg-primary' : 'bg-muted'
            }`}
            role="switch"
            aria-checked={state.noiseEnabled}
            aria-label={state.noiseEnabled ? "Disable noise overlay" : "Enable noise overlay"}
          >
            <span
              className="block w-4 h-4 rounded-full bg-background shadow-sm transition-transform"
              style={{
                transform: state.noiseEnabled ? 'translateX(1.25rem)' : 'translateX(0.125rem)',
                margin: '0.25rem',
              }}
            />
          </button>
        </div>

        {state.noiseEnabled && (
          <div className="animate-fade-in">
            <CustomSlider
              label="Noise Intensity"
              value={state.noiseIntensity}
              min={0}
              max={100}
              step={1}
              onChange={(val) => updateState({ noiseIntensity: val })}
              unit="%"
            />
          </div>
        )}
      </div>

      {/* Quick Effect Presets */}
      <div className="space-y-2 pt-4 border-t border-border">
        <p className="text-xs font-medium text-muted-foreground px-1">Quick Effects</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateState({ 
              blur: 0, 
              backdropBlur: 0, 
              borderEnabled: false, 
              noiseEnabled: false 
            })}
            className="px-3 py-2 text-xs font-medium bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            aria-label="Apply no effects preset"
          >
            None
          </button>
          <button
            onClick={() => updateState({ 
              blur: 0, 
              backdropBlur: 12, 
              borderEnabled: true, 
              strokeWidth: 1, 
              strokeColor: '#FFFFFF', 
              strokeOpacity: 20, 
              strokePosition: 'inside',
              noiseEnabled: false 
            })}
            className="px-3 py-2 text-xs font-medium bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            aria-label="Apply glass effect preset"
          >
            Glass
          </button>
          <button
            onClick={() => updateState({ 
              blur: 5, 
              backdropBlur: 0, 
              borderEnabled: false, 
              noiseEnabled: false 
            })}
            className="px-3 py-2 text-xs font-medium bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            aria-label="Apply soft effect preset"
          >
            Soft
          </button>
          <button
            onClick={() => updateState({ 
              blur: 0, 
              backdropBlur: 0, 
              borderEnabled: false, 
              noiseEnabled: true, 
              noiseIntensity: 40 
            })}
            className="px-3 py-2 text-xs font-medium bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            aria-label="Apply textured effect preset"
          >
            Textured
          </button>
        </div>
      </div>
    </div>
  );
};
