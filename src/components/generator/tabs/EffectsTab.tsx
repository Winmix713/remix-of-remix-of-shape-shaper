import { useState, useCallback, type FC } from 'react';
import { Sparkles, Sun, Contrast, Droplets, RotateCcw, Eye, Layers, Triangle, CircleDot } from 'lucide-react';
import { SuperellipseState } from '../../../hooks/useSuperellipse';
import { CustomSlider } from '../CustomSlider';
import { CollapsibleSection } from '../CollapsibleSection';
import { EffectStack } from '../effects';
import { Effect } from '@/types/effects';

interface EffectsTabProps {
  state: SuperellipseState;
  updateState: (updates: Partial<SuperellipseState>) => void;
}

// Quick filter presets
const QUICK_FILTERS = [
  { label: 'Vintage', icon: '🎞️', values: { brightness: 110, contrast: 85, saturate: 70, hueRotate: 15 } },
  { label: 'Hi-Con', icon: '⚡', values: { brightness: 105, contrast: 150, saturate: 120, hueRotate: 0 } },
  { label: 'Dreamy', icon: '✨', values: { brightness: 115, contrast: 90, saturate: 80, hueRotate: 0 } },
  { label: 'Noir', icon: '🖤', values: { brightness: 100, contrast: 140, saturate: 0, hueRotate: 0 } },
  { label: 'Warm', icon: '🔥', values: { brightness: 105, contrast: 105, saturate: 110, hueRotate: 330 } },
  { label: 'Cool', icon: '❄️', values: { brightness: 100, contrast: 105, saturate: 110, hueRotate: 180 } },
  { label: 'Fade', icon: '🌫️', values: { brightness: 120, contrast: 80, saturate: 60, hueRotate: 0 } },
  { label: 'Reset', icon: '↺', values: { brightness: 100, contrast: 100, saturate: 100, hueRotate: 0 } },
] as const;

export const EffectsTab: FC<EffectsTabProps> = ({ state, updateState }) => {
  const [effects, setEffects] = useState<Effect[]>([]);

  const handleEffectsChange = useCallback((newEffects: Effect[]) => {
    setEffects(newEffects);
  }, []);

  const isFilterActive = (filter: typeof QUICK_FILTERS[number]) => {
    return filter.values.brightness === state.brightness &&
           filter.values.contrast === state.contrast &&
           filter.values.saturate === state.saturate &&
           filter.values.hueRotate === state.hueRotate;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Quick Filters Grid */}
      <CollapsibleSection title="Quick Filters" icon={<Sparkles className="w-3.5 h-3.5" />} defaultOpen>
        <div className="grid grid-cols-4 gap-1.5">
          {QUICK_FILTERS.map((filter) => (
            <button
              key={filter.label}
              onClick={() => updateState(filter.values)}
              className={`
                flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg text-[10px] font-medium
                transition-all duration-200 
                ${isFilterActive(filter)
                  ? 'bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/50'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }
              `}
              aria-pressed={isFilterActive(filter)}
            >
              <span className="text-sm">{filter.icon}</span>
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* CSS Filters */}
      <CollapsibleSection title="Filters & Adjust" icon={<Sun className="w-3.5 h-3.5" />} defaultOpen>
        <div className="space-y-3">
          <CustomSlider
            label="Brightness"
            value={state.brightness}
            min={0}
            max={200}
            step={1}
            onChange={(val) => updateState({ brightness: val })}
            unit="%"
          />
          <CustomSlider
            label="Contrast"
            value={state.contrast}
            min={0}
            max={200}
            step={1}
            onChange={(val) => updateState({ contrast: val })}
            unit="%"
          />
          <CustomSlider
            label="Saturate"
            value={state.saturate}
            min={0}
            max={200}
            step={1}
            onChange={(val) => updateState({ saturate: val })}
            unit="%"
          />
          <CustomSlider
            label="Hue Rotate"
            value={state.hueRotate}
            min={0}
            max={360}
            step={1}
            onChange={(val) => updateState({ hueRotate: val })}
            unit="°"
            gradient="linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)"
          />
        </div>
      </CollapsibleSection>

      {/* Blur Effects */}
      <CollapsibleSection title="Blur" icon={<Eye className="w-3.5 h-3.5" />} defaultOpen>
        <div className="space-y-3">
          <CustomSlider
            label="Blur"
            value={state.blur || 0}
            min={0}
            max={50}
            step={1}
            onChange={(val) => updateState({ blur: Math.max(0, Math.min(50, val)) })}
            unit="px"
          />
          <CustomSlider
            label="Backdrop Blur"
            value={state.backdropBlur}
            min={0}
            max={30}
            step={1}
            onChange={(val) => updateState({ backdropBlur: Math.max(0, Math.min(30, val)) })}
            unit="px"
          />
        </div>
      </CollapsibleSection>

      {/* Glass Surface */}
      <CollapsibleSection title="Glass Surface" icon={<Layers className="w-3.5 h-3.5" />}>
        <div className="space-y-3">
          <CustomSlider
            label="Frost Blur"
            value={state.frostBlur}
            min={0}
            max={30}
            step={1}
            onChange={(val) => updateState({ frostBlur: val })}
            unit="px"
          />
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground px-1">Tint Color</label>
            <div className="flex items-center p-1 bg-muted rounded-[0.625rem]">
              <div className="relative size-7 mr-3 rounded-md border border-border overflow-hidden">
                <input
                  type="color"
                  value={state.tintColor}
                  onChange={(e) => updateState({ tintColor: e.target.value })}
                  className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer opacity-0 z-10"
                />
                <div className="w-full h-full" style={{ backgroundColor: state.tintColor }} />
              </div>
              <input
                type="text"
                value={state.tintColor.toUpperCase()}
                onChange={(e) => updateState({ tintColor: e.target.value })}
                className="flex-1 bg-transparent border-none text-sm font-mono text-foreground uppercase focus:outline-none"
                maxLength={7}
              />
            </div>
          </div>
          <CustomSlider
            label="Tint Opacity"
            value={state.tintOpacity}
            min={0}
            max={100}
            step={1}
            onChange={(val) => updateState({ tintOpacity: val })}
            unit="%"
          />
        </div>
      </CollapsibleSection>

      {/* Inner Shadow */}
      <CollapsibleSection title="Inner Shadow" icon={<CircleDot className="w-3.5 h-3.5" />}>
        <div className="space-y-3">
          <CustomSlider
            label="Shadow Spread"
            value={state.innerShadowSpread}
            min={-20}
            max={20}
            step={1}
            onChange={(val) => updateState({ innerShadowSpread: val })}
            unit="px"
          />
          <CustomSlider
            label="Shadow Blur"
            value={state.innerShadowBlur}
            min={0}
            max={50}
            step={1}
            onChange={(val) => updateState({ innerShadowBlur: val })}
            unit="px"
          />
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground px-1">Shadow Color</label>
            <div className="flex items-center p-1 bg-muted rounded-[0.625rem]">
              <div className="relative size-7 mr-3 rounded-md border border-border overflow-hidden">
                <input
                  type="color"
                  value={state.innerShadowColor}
                  onChange={(e) => updateState({ innerShadowColor: e.target.value })}
                  className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer opacity-0 z-10"
                />
                <div className="w-full h-full" style={{ backgroundColor: state.innerShadowColor }} />
              </div>
              <input
                type="text"
                value={state.innerShadowColor.toUpperCase()}
                onChange={(e) => updateState({ innerShadowColor: e.target.value })}
                className="flex-1 bg-transparent border-none text-sm font-mono text-foreground uppercase focus:outline-none"
                maxLength={7}
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Noise Distortion */}
      <CollapsibleSection title="Noise Distortion" icon={<Triangle className="w-3.5 h-3.5" />}>
        <div className="space-y-3">
          <CustomSlider
            label="Noise Frequency"
            value={state.noiseFrequency}
            min={1}
            max={100}
            step={1}
            onChange={(val) => updateState({ noiseFrequency: val })}
          />
          <CustomSlider
            label="Distortion Strength"
            value={state.distortionStrength}
            min={0}
            max={100}
            step={1}
            onChange={(val) => updateState({ distortionStrength: val })}
            unit="%"
          />
        </div>
      </CollapsibleSection>

      {/* Effect Stack */}
      <CollapsibleSection title="Effect Stack" icon={<Sparkles className="w-3.5 h-3.5" />}>
        <EffectStack effects={effects} onChange={handleEffectsChange} />
      </CollapsibleSection>

      {/* Stroke Controls */}
      <CollapsibleSection title="Stroke" icon={<Contrast className="w-3.5 h-3.5" />}>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Enable Stroke</p>
            <button
              onClick={() => {
                if (state.borderEnabled) {
                  updateState({ borderEnabled: false, strokeWidth: 2, strokeColor: '#000000', strokeOpacity: 100, strokePosition: 'center', strokeStyle: 'solid' });
                } else {
                  updateState({ borderEnabled: true });
                }
              }}
              className={`relative w-10 h-6 rounded-full transition-all ${state.borderEnabled ? 'bg-primary' : 'bg-muted'}`}
              role="switch"
              aria-checked={state.borderEnabled}
            >
              <span className="block w-4 h-4 rounded-full bg-background shadow-sm transition-transform" style={{ transform: state.borderEnabled ? 'translateX(1.25rem)' : 'translateX(0.125rem)', margin: '0.25rem' }} />
            </button>
          </div>

          {state.borderEnabled && (
            <div className="space-y-3 animate-fade-in">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground px-1">Stroke Color</label>
                <div className="flex items-center p-1 bg-muted rounded-[0.625rem]">
                  <div className="relative size-7 mr-3 rounded-md border border-border overflow-hidden">
                    <input type="color" value={state.strokeColor || '#000000'} onChange={(e) => updateState({ strokeColor: e.target.value })} className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer opacity-0 z-10" />
                    <div className="w-full h-full" style={{ backgroundColor: state.strokeColor || '#000000' }} />
                  </div>
                  <input type="text" value={(state.strokeColor || '#000000').toUpperCase()} onChange={(e) => updateState({ strokeColor: e.target.value })} className="flex-1 bg-transparent border-none text-sm font-mono text-foreground uppercase focus:outline-none" maxLength={7} />
                </div>
              </div>
              <CustomSlider label="Stroke Width" value={state.strokeWidth} min={0} max={20} step={1} onChange={(val) => updateState({ strokeWidth: val })} unit="px" />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground px-1">Position</p>
                <div className="grid grid-cols-3 gap-2" role="group">
                  {(['inside', 'center', 'outside'] as const).map((pos) => (
                    <button key={pos} onClick={() => updateState({ strokePosition: pos })} className={`px-3 py-2 text-xs font-medium rounded-lg transition-all capitalize ${state.strokePosition === pos ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`} aria-pressed={state.strokePosition === pos}>{pos}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground px-1">Style</p>
                <div className="grid grid-cols-3 gap-2" role="group">
                  {(['solid', 'dashed', 'dotted'] as const).map((style) => (
                    <button key={style} onClick={() => updateState({ strokeStyle: style })} className={`px-3 py-2 text-xs font-medium rounded-lg transition-all capitalize ${state.strokeStyle === style ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`} aria-pressed={state.strokeStyle === style}>{style}</button>
                  ))}
                </div>
              </div>
              <CustomSlider label="Stroke Opacity" value={state.strokeOpacity} min={0} max={100} step={1} onChange={(val) => updateState({ strokeOpacity: val })} unit="%" />
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Noise Overlay */}
      <CollapsibleSection title="Noise Overlay" icon={<Droplets className="w-3.5 h-3.5" />}>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Enable Noise</p>
            <button
              onClick={() => {
                if (state.noiseEnabled) {
                  updateState({ noiseEnabled: false, noiseIntensity: 30 });
                } else {
                  updateState({ noiseEnabled: true });
                }
              }}
              className={`relative w-10 h-6 rounded-full transition-all ${state.noiseEnabled ? 'bg-primary' : 'bg-muted'}`}
              role="switch"
              aria-checked={state.noiseEnabled}
            >
              <span className="block w-4 h-4 rounded-full bg-background shadow-sm transition-transform" style={{ transform: state.noiseEnabled ? 'translateX(1.25rem)' : 'translateX(0.125rem)', margin: '0.25rem' }} />
            </button>
          </div>
          {state.noiseEnabled && (
            <div className="animate-fade-in">
              <CustomSlider label="Noise Intensity" value={state.noiseIntensity} min={0} max={100} step={1} onChange={(val) => updateState({ noiseIntensity: val })} unit="%" />
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
};
