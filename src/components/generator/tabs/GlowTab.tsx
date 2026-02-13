/**
 * GlowTab Component — Refactored
 * 
 * Real-time CSS progressive blur glow effect editor.
 * Based on 4-layer OKLCH glow system with shape, position, and noise controls.
 * 
 * Sections:
 * 1. Base Color (OKLCH) — Lightness, Chroma, Hue + HEX sync
 * 2. Shape Configuration — Gradient Mask Size, Glow Scale
 * 3. Glow Position — Horizontal (X), Vertical (Y)
 * 4. Noise Overlay — Toggle + Intensity
 * 5. Advanced Effects — Opacity, Blur, Spread
 * 6. Glow Animation — Pulse, Rotate, Wave
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  Shuffle, Sun, Moon, Layers, Move, Sparkles, 
  Palette, SlidersHorizontal, Info
} from 'lucide-react';
import { SuperellipseState } from '../../../hooks/useSuperellipse';
import { CustomSlider } from '../CustomSlider';
import { HexColorPicker } from '../HexColorPicker';
import { GlowAnimationControls, GlowAnimationState, DEFAULT_GLOW_ANIMATION } from '../GlowAnimationControls';
import { CollapsibleSection } from '../CollapsibleSection';

// ============================================================================
// Types
// ============================================================================

interface GlowTabProps {
  state: SuperellipseState;
  updateState: (updates: Partial<SuperellipseState>) => void;
  onRandomize?: () => void;
  theme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

// ============================================================================
// Sub-Components
// ============================================================================

/** Glow enable toggle + theme selector header */
const GlowHeader: React.FC<{
  enabled: boolean;
  onToggle: () => void;
  theme: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
}> = ({ enabled, onToggle, theme, onThemeChange }) => (
  <div className="flex items-center justify-between bg-muted/50 p-3 rounded-xl border border-border">
    <div className="flex-1">
      <h2 className="text-sm font-semibold text-foreground">Glow Effect</h2>
      <p className="text-[10px] text-muted-foreground">4-layer progressive blur</p>
    </div>
    
    {onThemeChange && (
      <div className="flex items-center gap-1 mr-3" role="group" aria-label="Theme selection">
        <button
          onClick={() => onThemeChange('light')}
          className={`p-1.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
            theme === 'light'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
          title="Light mode"
          aria-label="Switch to light theme"
          aria-pressed={theme === 'light'}
        >
          <Sun className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <button
          onClick={() => onThemeChange('dark')}
          className={`p-1.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
            theme === 'dark'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
          title="Dark mode"
          aria-label="Switch to dark theme"
          aria-pressed={theme === 'dark'}
        >
          <Moon className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    )}
    
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={enabled}
      aria-label="Toggle glow effect"
      className={`relative w-10 h-6 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        enabled ? 'bg-primary' : 'bg-muted-foreground/20'
      }`}
    >
      <span
        className="block w-4 h-4 rounded-full bg-background shadow-sm transition-transform duration-200"
        style={{
          transform: enabled ? 'translateX(1.25rem)' : 'translateX(0.125rem)',
          margin: '0.25rem',
        }}
        aria-hidden="true"
      />
    </button>
  </div>
);

/** Info tooltip with computed values */
const ComputedValue: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between text-[10px]">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-mono text-foreground/70">{value}</span>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

export const GlowTab: React.FC<GlowTabProps> = ({ 
  state, updateState, onRandomize, theme = 'dark', onThemeChange 
}) => {
  const [glowAnimation, setGlowAnimation] = useState<GlowAnimationState>(DEFAULT_GLOW_ANIMATION);

  const handleHexColorChange = useCallback((hue: number, chroma: number, lightness: number) => {
    updateState({ hue, chroma, lightness });
  }, [updateState]);

  const updateAnimation = useCallback((updates: Partial<GlowAnimationState>) => {
    setGlowAnimation(prev => ({ ...prev, ...updates }));
  }, []);

  // Computed values from documentation formulas
  const computedOuterHeight = useMemo(() => 
    Math.round(1800 * state.glowMaskSize + 600), [state.glowMaskSize]
  );

  const oklchString = useMemo(() => 
    `oklch(${Math.round(state.lightness)}% ${state.chroma.toFixed(3)} ${Math.round(state.hue)})`,
    [state.lightness, state.chroma, state.hue]
  );

  // Hue rainbow gradient for the slider track
  const hueGradient = 'linear-gradient(to right, oklch(70% 0.25 0), oklch(70% 0.25 60), oklch(70% 0.25 120), oklch(70% 0.25 180), oklch(70% 0.25 240), oklch(70% 0.25 300), oklch(70% 0.25 360))';
  
  // Chroma gradient: gray to vibrant at current hue
  const chromaGradient = `linear-gradient(to right, oklch(${state.lightness}% 0 ${state.hue}), oklch(${state.lightness}% 0.4 ${state.hue}))`;
  
  // Lightness gradient: black to white
  const lightnessGradient = `linear-gradient(to right, oklch(0% ${state.chroma} ${state.hue}), oklch(100% ${state.chroma} ${state.hue}))`;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header: Toggle + Theme */}
      <GlowHeader
        enabled={state.enabled}
        onToggle={() => updateState({ enabled: !state.enabled })}
        theme={theme}
        onThemeChange={onThemeChange}
      />

      {/* ================================================================ */}
      {/* Section 1: Base Color — OKLCH Color Space                        */}
      {/* ================================================================ */}
      <CollapsibleSection
        title="Base Color (OKLCH)"
        icon={<Palette className="w-3.5 h-3.5 text-muted-foreground" />}
        defaultOpen={true}
      >
        {/* HEX Color Picker with bidirectional sync */}
        <HexColorPicker
          hue={state.hue}
          chroma={state.chroma}
          lightness={state.lightness}
          onColorChange={handleHexColorChange}
        />

        <div className="space-y-3 mt-3">
          {/* Lightness: 0-100% — perceptually uniform brightness */}
          <CustomSlider
            label="Lightness"
            value={state.lightness}
            min={0}
            max={100}
            step={1}
            onChange={(val) => updateState({ lightness: val })}
            unit="%"
            gradient={lightnessGradient}
          />

          {/* Chroma: 0-0.400 — color saturation/vividness */}
          <CustomSlider
            label="Chroma"
            value={state.chroma}
            min={0}
            max={0.4}
            step={0.001}
            onChange={(val) => updateState({ chroma: val })}
            gradient={chromaGradient}
          />

          {/* Hue: 0-360° — full color wheel rotation */}
          <CustomSlider
            label="Hue"
            value={state.hue}
            min={0}
            max={360}
            step={1}
            onChange={(val) => updateState({ hue: val })}
            unit="°"
            gradient={hueGradient}
          />
        </div>

        {/* OKLCH computed string */}
        <div className="mt-3 p-2 bg-muted/50 rounded-lg border border-border">
          <ComputedValue label="OKLCH" value={oklchString} />
        </div>
      </CollapsibleSection>

      {/* ================================================================ */}
      {/* Section 2: Shape Configuration                                   */}
      {/* ================================================================ */}
      <CollapsibleSection
        title="Shape Configuration"
        icon={<Layers className="w-3.5 h-3.5 text-muted-foreground" />}
        defaultOpen={true}
      >
        {/* Gradient Mask Size: 0-100% → height = 1800 × maskSize + 600 */}
        <CustomSlider
          label="Gradient Mask Size"
          value={Math.round(state.glowMaskSize * 100)}
          min={0}
          max={100}
          step={1}
          onChange={(val) => updateState({ glowMaskSize: val / 100 })}
          unit="%"
        />
        <div className="px-1">
          <ComputedValue 
            label="Outer glow height" 
            value={`${computedOuterHeight}px`} 
          />
        </div>

        {/* Glow Scale: 0.5x-3.0x — CSS transform: scale() */}
        <CustomSlider
          label="Glow Scale"
          value={state.glowScale}
          min={0.5}
          max={3}
          step={0.1}
          onChange={(val) => updateState({ glowScale: val })}
          unit="x"
        />
      </CollapsibleSection>

      {/* ================================================================ */}
      {/* Section 3: Glow Position                                         */}
      {/* ================================================================ */}
      <CollapsibleSection
        title="Glow Position"
        icon={<Move className="w-3.5 h-3.5 text-muted-foreground" />}
        defaultOpen={false}
      >
        {/* Horizontal (X): -800px to -350px */}
        <CustomSlider
          label="Horizontal (X)"
          value={state.glowPositionX}
          min={-1200}
          max={400}
          step={10}
          onChange={(val) => updateState({ glowPositionX: val })}
          unit="px"
        />

        {/* Vertical (Y): -1400px to -600px */}
        <CustomSlider
          label="Vertical (Y)"
          value={state.glowPositionY}
          min={-1800}
          max={400}
          step={10}
          onChange={(val) => updateState({ glowPositionY: val })}
          unit="px"
        />

        {/* Position + Scale interaction tip */}
        <div className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg border border-border">
          <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Position and Scale interact multiplicatively. Adjust Scale first, then fine-tune Position.
          </p>
        </div>
      </CollapsibleSection>

      {/* ================================================================ */}
      {/* Section 4: Noise Overlay                                         */}
      {/* ================================================================ */}
      <CollapsibleSection
        title="Noise Overlay"
        icon={<Sparkles className="w-3.5 h-3.5 text-muted-foreground" />}
        defaultOpen={false}
      >
        {/* Noise Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
          <div>
            <p className="text-xs font-medium text-foreground">Enable Noise</p>
            <p className="text-[10px] text-muted-foreground">SVG feTurbulence grain texture</p>
          </div>
          <button
            onClick={() => updateState({ noiseEnabled: !state.noiseEnabled })}
            role="switch"
            aria-checked={state.noiseEnabled}
            aria-label="Toggle noise overlay"
            className={`relative w-10 h-6 rounded-full transition-colors ${
              state.noiseEnabled ? 'bg-primary' : 'bg-muted-foreground/20'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-background shadow-sm transition-transform ${
                state.noiseEnabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Noise Intensity: 0-100% */}
        {state.noiseEnabled && (
          <div className="space-y-3 pt-2 animate-fade-in">
            <CustomSlider
              label="Noise Intensity"
              value={state.noiseIntensity}
              min={0}
              max={100}
              step={1}
              onChange={(val) => updateState({ noiseIntensity: val })}
              unit="%"
            />
            <p className="text-[10px] text-muted-foreground px-1">
              5-15%: subtle texture · 30-50%: visible grain · 70%+: heavy stylized
            </p>
          </div>
        )}
      </CollapsibleSection>

      {/* ================================================================ */}
      {/* Section 5: Advanced Effects                                       */}
      {/* ================================================================ */}
      <CollapsibleSection
        title="Advanced Effects"
        icon={<SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />}
        defaultOpen={false}
      >
        <CustomSlider
          label="Glow Intensity"
          value={state.glowOpacity}
          min={0}
          max={100}
          step={1}
          onChange={(val) => updateState({ glowOpacity: val })}
          unit="%"
        />

        <CustomSlider
          label="Glow Blur"
          value={state.glowBlur}
          min={0}
          max={300}
          step={1}
          onChange={(val) => updateState({ glowBlur: val })}
          unit="px"
        />

        <CustomSlider
          label="Glow Spread"
          value={state.glowSpread}
          min={0}
          max={100}
          step={1}
          onChange={(val) => updateState({ glowSpread: val })}
          unit="%"
        />

        {/* Layer info */}
        <div className="p-2 bg-muted/30 rounded-lg border border-border space-y-1">
          <p className="text-[10px] font-medium text-muted-foreground">4-Layer System</p>
          <ComputedValue label="Outer (180px blur)" value="40% opacity" />
          <ComputedValue label="Mid (120px blur)" value="60% opacity" />
          <ComputedValue label="Inner (60px blur)" value="100% opacity" />
          <ComputedValue label="Core white (80px)" value="40% opacity" />
        </div>
      </CollapsibleSection>

      {/* ================================================================ */}
      {/* Section 6: Glow Animation                                        */}
      {/* ================================================================ */}
      <GlowAnimationControls
        animation={glowAnimation}
        onUpdateAnimation={updateAnimation}
        glowHue={state.hue}
        glowChroma={state.chroma}
        glowLightness={state.lightness}
      />

      {/* Random Generator */}
      {onRandomize && (
        <button
          onClick={onRandomize}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium hover:opacity-90 transition-all shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Generate random spotlight colors"
        >
          <Shuffle className="w-4 h-4" aria-hidden="true" />
          Random Spotlight
        </button>
      )}
    </div>
  );
};