import React from 'react';
import { Shuffle, Sun, Moon } from 'lucide-react';
import { SuperellipseState } from '../../../hooks/useSuperellipse';
import { CustomSlider } from '../CustomSlider';
import { HexColorPicker } from '../HexColorPicker';

interface GlowTabProps {
  state: SuperellipseState;
  updateState: (updates: Partial<SuperellipseState>) => void;
  onRandomize?: () => void;
  theme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

export const GlowTab: React.FC<GlowTabProps> = ({ state, updateState, onRandomize, theme = 'dark', onThemeChange }) => {
  const color = `oklch(${state.lightness}% ${state.chroma} ${state.hue})`;

  const handleHexColorChange = (hue: number, chroma: number, lightness: number) => {
    updateState({ hue, chroma, lightness });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Toggle + Theme Selector */}
      <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Glow Effect</h2>
          <p className="text-[10px] text-zinc-500">4-layer progressive blur</p>
        </div>
        
        {/* Theme Selector */}
        {onThemeChange && (
          <div className="flex items-center gap-1 mr-3" role="group" aria-label="Theme selection">
            <button
              onClick={() => onThemeChange('light')}
              className={`p-1.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                theme === 'light'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 hover:bg-zinc-300 dark:hover:bg-zinc-600'
              }`}
              title="Light mode"
              aria-label="Switch to light theme"
              aria-pressed={theme === 'light'}
            >
              <Sun className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              onClick={() => onThemeChange('dark')}
              className={`p-1.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                theme === 'dark'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 hover:bg-zinc-300 dark:hover:bg-zinc-600'
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
          onClick={() => updateState({ enabled: !state.enabled })}
          role="switch"
          aria-checked={state.enabled}
          aria-label="Toggle glow effect"
          className={`relative w-10 h-6 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            state.enabled ? 'bg-indigo-500' : 'bg-zinc-200 dark:bg-zinc-700'
          }`}
        >
          <span
            className="block w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
            style={{
              transform: state.enabled ? 'translateX(1.25rem)' : 'translateX(0.125rem)',
              margin: '0.25rem',
            }}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Hex Color Picker */}
      <HexColorPicker
        hue={state.hue}
        chroma={state.chroma}
        lightness={state.lightness}
        onColorChange={handleHexColorChange}
      />

      {/* OKLCH Sliders */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] text-zinc-500">
            <label htmlFor="hue-slider">Hue</label>
            <span aria-live="polite">{state.hue}°</span>
          </div>
          <div className="relative h-4 rounded-full overflow-hidden">
            <div 
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to right, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7, #ef4444)' }}
              aria-hidden="true"
            />
            <input
              id="hue-slider"
              type="range"
              min={0}
              max={360}
              value={state.hue}
              onChange={(e) => updateState({ hue: Number(e.target.value) })}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-10 focus:outline-none"
              aria-label="Hue slider"
              aria-valuemin={0}
              aria-valuemax={360}
              aria-valuenow={state.hue}
              aria-valuetext={`${state.hue} degrees`}
            />
            <div
              className="absolute top-0 h-full border-r-2 border-white shadow-sm pointer-events-none"
              style={{ width: `${(state.hue / 360) * 100}%` }}
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] text-zinc-500">
            <label htmlFor="chroma-slider">Chroma</label>
            <span aria-live="polite">{state.chroma.toFixed(2)}</span>
          </div>
          <div className="relative h-4 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
            <input
              id="chroma-slider"
              type="range"
              min={0}
              max={0.4}
              step={0.01}
              value={state.chroma}
              onChange={(e) => updateState({ chroma: Number(e.target.value) })}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-10 focus:outline-none"
              aria-label="Chroma slider"
              aria-valuemin={0}
              aria-valuemax={0.4}
              aria-valuenow={state.chroma}
              aria-valuetext={state.chroma.toFixed(2)}
            />
            <div
              className="absolute top-0 h-full bg-zinc-400 dark:bg-zinc-500 rounded-full transition-all"
              style={{ width: `${(state.chroma / 0.4) * 100}%` }}
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] text-zinc-500">
            <label htmlFor="lightness-slider">Lightness</label>
            <span aria-live="polite">{Math.round(state.lightness)}%</span>
          </div>
          <div className="relative h-4 rounded-full overflow-hidden">
            <div 
              className="absolute inset-0 opacity-30"
              style={{ background: 'linear-gradient(to right, #000000, #ffffff)' }}
              aria-hidden="true"
            />
            <input
              id="lightness-slider"
              type="range"
              min={0}
              max={100}
              value={state.lightness}
              onChange={(e) => updateState({ lightness: Number(e.target.value) })}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-10 focus:outline-none"
              aria-label="Lightness slider"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={state.lightness}
              aria-valuetext={`${Math.round(state.lightness)} percent`}
            />
            <div
              className="absolute top-0 h-full bg-zinc-400 dark:bg-zinc-500 rounded-full transition-all"
              style={{ width: `${state.lightness}%` }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

      {/* Shape Configuration */}
      <div className="space-y-4">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Glow Shape</p>
        
        <CustomSlider
          label="Mask Size"
          value={Math.round(state.glowMaskSize * 100)}
          min={0}
          max={100}
          step={1}
          onChange={(val) => updateState({ glowMaskSize: val / 100 })}
          unit="%"
        />

        <CustomSlider
          label="Scale"
          value={state.glowScale}
          min={0.5}
          max={3}
          step={0.1}
          onChange={(val) => updateState({ glowScale: val })}
          unit="x"
        />
      </div>

      <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

      {/* Position */}
      <div className="space-y-4">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Position</p>
        
        <CustomSlider
          label="Offset X"
          value={state.glowPositionX}
          min={-1200}
          max={400}
          step={10}
          onChange={(val) => updateState({ glowPositionX: val })}
          unit="px"
        />
        <CustomSlider
          label="Offset Y"
          value={state.glowPositionY}
          min={-1800}
          max={400}
          step={10}
          onChange={(val) => updateState({ glowPositionY: val })}
          unit="px"
        />
      </div>

      <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

      {/* Advanced Glow */}
      <div className="space-y-4">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Advanced Effects</p>
        
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
      </div>

      {/* Random Generator */}
      {onRandomize && (
        <button
          onClick={onRandomize}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="Generate random spotlight colors"
        >
          <Shuffle className="w-4 h-4" aria-hidden="true" />
          Random Spotlight
        </button>
      )}
    </div>
  );
};
