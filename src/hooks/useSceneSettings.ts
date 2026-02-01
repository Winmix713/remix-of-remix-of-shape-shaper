/**
 * useSceneSettings Hook
 * 
 * Manages global scene settings with localStorage persistence.
 */

import { useState, useCallback, useEffect } from 'react';
import { SceneSettingsState, DEFAULT_SCENE_SETTINGS } from '../components/generator/SceneSettings';

const STORAGE_KEY = 'superellipse-scene-settings';

export function useSceneSettings() {
  const [settings, setSettings] = useState<SceneSettingsState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SCENE_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load scene settings:', error);
    }
    return DEFAULT_SCENE_SETTINGS;
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save scene settings:', error);
    }
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<SceneSettingsState>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SCENE_SETTINGS);
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
  };
}

export default useSceneSettings;
