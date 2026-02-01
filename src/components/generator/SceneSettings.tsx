/**
 * SceneSettings Component
 * 
 * Global scene configuration including scale, gradient mask, and noise overlay.
 * Provides project-wide visual settings.
 */

import React, { useState, useCallback } from 'react';
import { Settings2, Maximize, Layers, Sparkles, Grid3X3, Eye, EyeOff } from 'lucide-react';
import { CustomSlider } from './CustomSlider';

// ============================================================================
// Types
// ============================================================================

export interface SceneSettingsState {
  globalScale: number;
  gradientMaskIntensity: number;
  noiseOverlayEnabled: boolean;
  noiseOverlayIntensity: number;
  noiseOverlayScale: number;
  gridVisible: boolean;
  gridSize: number;
  gridOpacity: number;
}

interface SceneSettingsProps {
  settings: SceneSettingsState;
  onUpdateSettings: (updates: Partial<SceneSettingsState>) => void;
}

// ============================================================================
// Default Settings
// ============================================================================

export const DEFAULT_SCENE_SETTINGS: SceneSettingsState = {
  globalScale: 1,
  gradientMaskIntensity: 0.5,
  noiseOverlayEnabled: false,
  noiseOverlayIntensity: 15,
  noiseOverlayScale: 1,
  gridVisible: true,
  gridSize: 40,
  gridOpacity: 5,
};

// ============================================================================
// Toggle Component
// ============================================================================

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  enabled,
  onChange,
  label,
  description,
  icon,
}) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
    <div className="flex items-center gap-3">
      {icon && (
        <div className="p-2 rounded-lg bg-background border border-border">
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-[10px] text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
    <button
      onClick={() => onChange(!enabled)}
      role="switch"
      aria-checked={enabled}
      className={`
        relative w-10 h-6 rounded-full transition-colors
        ${enabled ? 'bg-primary' : 'bg-muted-foreground/20'}
      `}
    >
      <span
        className={`
          absolute top-1 w-4 h-4 rounded-full bg-background shadow-sm transition-transform
          ${enabled ? 'translate-x-5' : 'translate-x-1'}
        `}
      />
    </button>
  </div>
);

// ============================================================================
// Collapsible Section
// ============================================================================

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  children,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-medium text-foreground">{title}</span>
        </div>
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-3 space-y-4 bg-card animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const SceneSettings: React.FC<SceneSettingsProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const handleUpdate = useCallback(<K extends keyof SceneSettingsState>(
    key: K,
    value: SceneSettingsState[K]
  ) => {
    onUpdateSettings({ [key]: value });
  }, [onUpdateSettings]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        <Settings2 className="w-4 h-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-semibold text-foreground">Scene Settings</p>
          <p className="text-[10px] text-muted-foreground">Global visual configuration</p>
        </div>
      </div>

      {/* Global Scale */}
      <CollapsibleSection
        title="Transform"
        icon={<Maximize className="w-3.5 h-3.5 text-muted-foreground" />}
      >
        <CustomSlider
          label="Global Scale"
          value={settings.globalScale}
          min={0.1}
          max={3}
          step={0.1}
          onChange={(val) => handleUpdate('globalScale', val)}
          unit="x"
        />
      </CollapsibleSection>

      {/* Gradient Mask */}
      <CollapsibleSection
        title="Gradient Mask"
        icon={<Layers className="w-3.5 h-3.5 text-muted-foreground" />}
      >
        <CustomSlider
          label="Mask Intensity"
          value={Math.round(settings.gradientMaskIntensity * 100)}
          min={0}
          max={100}
          step={1}
          onChange={(val) => handleUpdate('gradientMaskIntensity', val / 100)}
          unit="%"
        />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Controls the edge softness of the gradient overlay mask applied to the scene.
        </p>
      </CollapsibleSection>

      {/* Noise Overlay */}
      <CollapsibleSection
        title="Noise Overlay"
        icon={<Sparkles className="w-3.5 h-3.5 text-muted-foreground" />}
      >
        <ToggleSwitch
          enabled={settings.noiseOverlayEnabled}
          onChange={(val) => handleUpdate('noiseOverlayEnabled', val)}
          label="Enable Noise"
          description="Add film grain texture"
          icon={settings.noiseOverlayEnabled 
            ? <Eye className="w-3.5 h-3.5 text-primary" />
            : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
          }
        />

        {settings.noiseOverlayEnabled && (
          <div className="space-y-4 pt-2 animate-fade-in">
            <CustomSlider
              label="Noise Intensity"
              value={settings.noiseOverlayIntensity}
              min={0}
              max={100}
              step={1}
              onChange={(val) => handleUpdate('noiseOverlayIntensity', val)}
              unit="%"
            />
            <CustomSlider
              label="Noise Scale"
              value={settings.noiseOverlayScale}
              min={0.5}
              max={4}
              step={0.1}
              onChange={(val) => handleUpdate('noiseOverlayScale', val)}
              unit="x"
            />
          </div>
        )}
      </CollapsibleSection>

      {/* Grid Settings */}
      <CollapsibleSection
        title="Canvas Grid"
        icon={<Grid3X3 className="w-3.5 h-3.5 text-muted-foreground" />}
        defaultOpen={false}
      >
        <ToggleSwitch
          enabled={settings.gridVisible}
          onChange={(val) => handleUpdate('gridVisible', val)}
          label="Show Grid"
          description="Display alignment grid"
          icon={<Grid3X3 className="w-3.5 h-3.5" />}
        />

        {settings.gridVisible && (
          <div className="space-y-4 pt-2 animate-fade-in">
            <CustomSlider
              label="Grid Size"
              value={settings.gridSize}
              min={10}
              max={100}
              step={5}
              onChange={(val) => handleUpdate('gridSize', val)}
              unit="px"
            />
            <CustomSlider
              label="Grid Opacity"
              value={settings.gridOpacity}
              min={1}
              max={30}
              step={1}
              onChange={(val) => handleUpdate('gridOpacity', val)}
              unit="%"
            />
          </div>
        )}
      </CollapsibleSection>

      {/* Info */}
      <div className="p-3 bg-muted/50 border border-border rounded-lg">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Scene settings affect the entire canvas and all layers. Changes apply globally to the preview and export.
        </p>
      </div>
    </div>
  );
};

export default SceneSettings;
