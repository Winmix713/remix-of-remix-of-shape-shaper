import { useState, useEffect, useCallback } from 'react';
import { SuperellipseState } from './useSuperellipse';
import { 
  createStorageError, 
  logError, 
  isStorageAvailable,
  StorageError,
  ErrorCode 
} from '@/lib/errors';

export type Preset = {
  id: string;
  name: string;
  state: SuperellipseState;
  createdAt: number;
};

const STORAGE_KEY = 'superellipse-presets';

// In-memory fallback for when localStorage is unavailable
let memoryStorage: Preset[] = [];

export function usePresets() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [error, setError] = useState<StorageError | null>(null);
  const [storageAvailable, setStorageAvailable] = useState<boolean>(true);

  // Check storage availability on mount
  useEffect(() => {
    const available = isStorageAvailable();
    setStorageAvailable(available);
    
    if (!available) {
      const storageError = new StorageError(
        'localStorage is not available',
        ErrorCode.E_STORAGE_NOT_AVAILABLE
      );
      setError(storageError);
      logError(storageError);
    }
  }, []);

  // Load presets from storage
  useEffect(() => {
    try {
      if (!storageAvailable) {
        // Use in-memory fallback
        setPresets(memoryStorage);
        return;
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Validate preset data structure
        if (Array.isArray(parsed)) {
          setPresets(parsed);
          memoryStorage = parsed; // Sync with memory storage
        } else {
          throw new Error('Invalid preset data structure');
        }
      }
    } catch (err) {
      const storageError = createStorageError('load', err as Error);
      setError(storageError);
      logError(storageError);
      
      // Fallback to empty array on error
      setPresets([]);
    }
  }, [storageAvailable]);

  // Save presets to storage
  useEffect(() => {
    if (presets.length === 0 && !storageAvailable) {
      // Don't try to save empty presets on initial load
      return;
    }

    try {
      if (!storageAvailable) {
        // Use in-memory fallback
        memoryStorage = presets;
        return;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
      memoryStorage = presets; // Keep memory storage in sync
      
      // Clear error if save succeeds
      if (error) {
        setError(null);
      }
    } catch (err) {
      const storageError = createStorageError('save', err as Error);
      setError(storageError);
      logError(storageError);
      
      // Fallback to memory storage
      memoryStorage = presets;
    }
  }, [presets, storageAvailable, error]);

  const savePreset = useCallback((name: string, state: SuperellipseState): Preset | null => {
    try {
      const preset: Preset = {
        id: `preset-${Date.now()}`,
        name,
        state,
        createdAt: Date.now(),
      };
      
      setPresets(prev => [...prev, preset]);
      return preset;
    } catch (err) {
      const storageError = createStorageError('savePreset', err as Error);
      setError(storageError);
      logError(storageError);
      return null;
    }
  }, []);

  const loadPreset = useCallback((id: string): SuperellipseState | null => {
    try {
      const preset = presets.find(p => p.id === id);
      return preset ? preset.state : null;
    } catch (err) {
      const storageError = createStorageError('loadPreset', err as Error);
      setError(storageError);
      logError(storageError);
      return null;
    }
  }, [presets]);

  const deletePreset = useCallback((id: string): boolean => {
    try {
      setPresets(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      const storageError = createStorageError('deletePreset', err as Error);
      setError(storageError);
      logError(storageError);
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    error,
    clearError,
    storageAvailable,
  };
}
