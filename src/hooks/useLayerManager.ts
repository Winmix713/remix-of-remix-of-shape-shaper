/**
 * useLayerManager Hook
 * 
 * A comprehensive React hook for managing layers in a graphic design application.
 * Provides full CRUD operations, layer ordering, transformations, blend modes, grouping,
 * and various layer manipulations with optimized performance and type safety.
 * 
 * @example
 * ```tsx
 * function LayerPanel() {
 *   const {
 *     layers,
 *     selectedLayer,
 *     addLayer,
 *     removeLayer,
 *     updateLayer,
 *     selectLayer
 *   } = useLayerManager();
 *   
 *   return (
 *     <div>
 *       {layers.map(layer => (
 *         <LayerItem
 *           key={layer.id}
 *           layer={layer}
 *           isSelected={selectedLayer?.id === layer.id}
 *           onClick={() => selectLayer(layer.id)}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  Layer, 
  BlendMode, 
  Transform, 
  LayerType, 
  LayerContent, 
  DEFAULT_TRANSFORM 
} from '../types/layers';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface UseLayerManagerReturn {
  /** Array of all layers */
  layers: Layer[];
  /** ID of currently selected layer */
  selectedLayerId: string | null;
  /** Currently selected layer object */
  selectedLayer: Layer | null;
  
  // CRUD Operations
  /** Add a new layer */
  addLayer: (type: LayerType, name?: string, content?: LayerContent) => Layer;
  /** Remove a layer by ID */
  removeLayer: (layerId: string) => void;
  /** Update layer properties */
  updateLayer: (layerId: string, updates: Partial<Layer>) => void;
  /** Duplicate an existing layer */
  duplicateLayer: (layerId: string) => Layer | null;
  
  // Selection
  /** Select a layer by ID or deselect all */
  selectLayer: (layerId: string | null) => void;
  
  // Visibility & Locking
  /** Toggle layer visibility */
  toggleVisibility: (layerId: string) => void;
  /** Toggle layer lock state */
  toggleLock: (layerId: string) => void;
  /** Toggle layer solo state */
  toggleSolo: (layerId: string) => void;
  
  // Ordering
  /** Move layer up or down in stack */
  moveLayer: (layerId: string, direction: 'up' | 'down') => void;
  /** Reorder layers by index */
  reorderLayers: (startIndex: number, endIndex: number) => void;
  /** Move layer to specific position */
  moveLayerToIndex: (layerId: string, newIndex: number) => void;
  
  // Transform
  /** Update layer transform properties */
  updateTransform: (layerId: string, transform: Partial<Transform>) => void;
  /** Reset layer transform to default */
  resetTransform: (layerId: string) => void;
  
  // Blend Mode
  /** Set layer blend mode */
  setBlendMode: (layerId: string, blendMode: BlendMode) => void;
  
  // Opacity
  /** Set layer opacity (0-100) */
  setOpacity: (layerId: string, opacity: number) => void;
  
  // Bulk Operations
  /** Group multiple layers */
  groupLayers: (layerIds: string[]) => Layer | null;
  /** Ungroup layers */
  ungroupLayers: (groupId: string) => void;
  /** Flatten selected layers */
  flattenLayers: (layerIds: string[]) => void;
  /** Clear all layers */
  clearAllLayers: () => void;
  /** Select multiple layers */
  selectMultipleLayers: (layerIds: string[]) => void;
  
  // Utility
  /** Get layer by ID */
  getLayerById: (layerId: string) => Layer | null;
  /** Check if layer exists */
  hasLayer: (layerId: string) => boolean;
  /** Get all visible layers */
  getVisibleLayers: () => Layer[];
  /** Get layer children (for groups) */
  getLayerChildren: (layerId: string) => Layer[];
  /** Undo last action */
  undo: () => void;
  /** Redo last undone action */
  redo: () => void;
  /** Check if can undo */
  canUndo: boolean;
  /** Check if can redo */
  canRedo: boolean;
}

// ============================================================================
// Constants
// ============================================================================

/** Maximum number of history states to keep */
const MAX_HISTORY_LENGTH = 50;

/** Default duplicate offset in pixels */
const DUPLICATE_OFFSET = 20;

/** Minimum opacity value */
const MIN_OPACITY = 0;

/** Maximum opacity value */
const MAX_OPACITY = 100;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Global layer ID counter for generating unique IDs
 */
let layerIdCounter = 0;

/**
 * Generates a unique layer ID
 */
const generateLayerId = (): string => {
  return `layer-${++layerIdCounter}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Creates a default layer with given type and optional properties
 */
const createDefaultLayer = (
  type: LayerType, 
  name?: string, 
  content?: LayerContent
): Layer => ({
  id: generateLayerId(),
  name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} ${layerIdCounter}`,
  type,
  visible: true,
  locked: false,
  solo: false,
  opacity: MAX_OPACITY,
  blendMode: 'normal',
  transform: { ...DEFAULT_TRANSFORM },
  effects: [],
  parentId: null,
  zIndex: 0,
  content,
});

/**
 * Clamps a number between min and max values
 */
const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Deep clones a layer array for history management
 */
const cloneLayers = (layers: Layer[]): Layer[] => {
  return layers.map(layer => ({ ...layer }));
};

/**
 * Validates layer ID
 */
const isValidLayerId = (layerId: string | null | undefined): layerId is string => {
  return typeof layerId === 'string' && layerId.length > 0;
};

/**
 * Validates index is within bounds
 */
const isValidIndex = (index: number, arrayLength: number): boolean => {
  return index >= 0 && index < arrayLength;
};

// ============================================================================
// Main Hook
// ============================================================================

export function useLayerManager(): UseLayerManagerReturn {
  // ========================================================================
  // State Management
  // ========================================================================
  
  const [layers, setLayers] = useState<Layer[]>(() => [
    createDefaultLayer('shape', 'Main Shape', { type: 'superellipse' }),
  ]);
  
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(() => 
    layers[0]?.id || null
  );
  
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);
  
  // History management
  const [history, setHistory] = useState<Layer[][]>([cloneLayers(layers)]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // ========================================================================
  // Refs
  // ========================================================================
  
  const isComponentMounted = useRef(true);
  const isUndoRedoOperation = useRef(false);

  // ========================================================================
  // Memoized Values
  // ========================================================================

  /**
   * Currently selected layer object
   */
  const selectedLayer = useMemo(() => 
    layers.find(l => l.id === selectedLayerId) || null,
    [layers, selectedLayerId]
  );

  /**
   * Check if can undo
   */
  const canUndo = useMemo(() => historyIndex > 0, [historyIndex]);

  /**
   * Check if can redo
   */
  const canRedo = useMemo(() => historyIndex < history.length - 1, [historyIndex, history.length]);

  // ========================================================================
  // History Management
  // ========================================================================

  /**
   * Add current state to history
   */
  const addToHistory = useCallback((newLayers: Layer[]) => {
    if (isUndoRedoOperation.current) return;

    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(cloneLayers(newLayers));
      
      // Limit history length
      if (newHistory.length > MAX_HISTORY_LENGTH) {
        newHistory.shift();
        return newHistory;
      }
      
      return newHistory;
    });
    
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY_LENGTH - 1));
  }, [historyIndex]);

  /**
   * Undo last action
   */
  const undo = useCallback(() => {
    if (!canUndo) return;
    
    isUndoRedoOperation.current = true;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setLayers(cloneLayers(history[newIndex]));
    
    // Reset flag after state update
    setTimeout(() => {
      isUndoRedoOperation.current = false;
    }, 0);
  }, [canUndo, historyIndex, history]);

  /**
   * Redo last undone action
   */
  const redo = useCallback(() => {
    if (!canRedo) return;
    
    isUndoRedoOperation.current = true;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setLayers(cloneLayers(history[newIndex]));
    
    // Reset flag after state update
    setTimeout(() => {
      isUndoRedoOperation.current = false;
    }, 0);
  }, [canRedo, historyIndex, history]);

  // ========================================================================
  // Layer Utilities
  // ========================================================================

  /**
   * Update zIndex values after any ordering change
   */
  const updateZIndices = useCallback((layerList: Layer[]): Layer[] => {
    return layerList.map((layer, index) => ({
      ...layer,
      zIndex: index,
    }));
  }, []);

  /**
   * Get layer by ID
   */
  const getLayerById = useCallback((layerId: string): Layer | null => {
    return layers.find(l => l.id === layerId) || null;
  }, [layers]);

  /**
   * Check if layer exists
   */
  const hasLayer = useCallback((layerId: string): boolean => {
    return layers.some(l => l.id === layerId);
  }, [layers]);

  /**
   * Get all visible layers
   */
  const getVisibleLayers = useCallback((): Layer[] => {
    return layers.filter(layer => layer.visible);
  }, [layers]);

  /**
   * Get layer children (for groups)
   */
  const getLayerChildren = useCallback((layerId: string): Layer[] => {
    return layers.filter(layer => layer.parentId === layerId);
  }, [layers]);

  // ========================================================================
  // CRUD Operations
  // ========================================================================

  /**
   * Add a new layer
   */
  const addLayer = useCallback((
    type: LayerType, 
    name?: string, 
    content?: LayerContent
  ): Layer => {
    if (!isComponentMounted.current) {
      console.warn('Cannot add layer: component is unmounted');
      return createDefaultLayer(type, name, content);
    }

    const newLayer = createDefaultLayer(type, name, content);
    
    setLayers(prev => {
      const updated = updateZIndices([newLayer, ...prev]);
      addToHistory(updated);
      return updated;
    });
    
    setSelectedLayerId(newLayer.id);
    return newLayer;
  }, [updateZIndices, addToHistory]);

  /**
   * Remove a layer by ID
   */
  const removeLayer = useCallback((layerId: string) => {
    if (!isComponentMounted.current) return;
    if (!isValidLayerId(layerId)) {
      console.warn('Invalid layer ID provided to removeLayer');
      return;
    }

    setLayers(prev => {
      const filtered = prev.filter(l => l.id !== layerId);
      if (filtered.length === prev.length) {
        console.warn(`Layer with ID ${layerId} not found`);
        return prev;
      }
      
      const updated = updateZIndices(filtered);
      addToHistory(updated);
      return updated;
    });
    
    setSelectedLayerId(prev => prev === layerId ? null : prev);
  }, [updateZIndices, addToHistory]);

  /**
   * Update layer properties
   */
  const updateLayer = useCallback((layerId: string, updates: Partial<Layer>) => {
    if (!isComponentMounted.current) return;
    if (!isValidLayerId(layerId)) {
      console.warn('Invalid layer ID provided to updateLayer');
      return;
    }

    setLayers(prev => {
      const updated = prev.map(layer => 
        layer.id === layerId ? { ...layer, ...updates } : layer
      );
      addToHistory(updated);
      return updated;
    });
  }, [addToHistory]);

  /**
   * Duplicate an existing layer
   */
  const duplicateLayer = useCallback((layerId: string): Layer | null => {
    if (!isComponentMounted.current) return null;
    if (!isValidLayerId(layerId)) {
      console.warn('Invalid layer ID provided to duplicateLayer');
      return null;
    }

    const layer = layers.find(l => l.id === layerId);
    if (!layer) {
      console.warn(`Layer with ID ${layerId} not found`);
      return null;
    }

    const newLayer: Layer = {
      ...layer,
      id: generateLayerId(),
      name: `${layer.name} Copy`,
      transform: {
        ...layer.transform,
        x: layer.transform.x + DUPLICATE_OFFSET,
        y: layer.transform.y + DUPLICATE_OFFSET,
      },
    };

    const index = layers.findIndex(l => l.id === layerId);
    
    setLayers(prev => {
      const newLayers = [...prev];
      newLayers.splice(index, 0, newLayer);
      const updated = updateZIndices(newLayers);
      addToHistory(updated);
      return updated;
    });
    
    setSelectedLayerId(newLayer.id);
    return newLayer;
  }, [layers, updateZIndices, addToHistory]);

  // ========================================================================
  // Selection
  // ========================================================================

  /**
   * Select a layer by ID or deselect all
   */
  const selectLayer = useCallback((layerId: string | null) => {
    if (!isComponentMounted.current) return;
    
    if (layerId !== null && !hasLayer(layerId)) {
      console.warn(`Cannot select layer: ID ${layerId} not found`);
      return;
    }
    
    setSelectedLayerId(layerId);
    setSelectedLayerIds(layerId ? [layerId] : []);
  }, [hasLayer]);

  /**
   * Select multiple layers
   */
  const selectMultipleLayers = useCallback((layerIds: string[]) => {
    if (!isComponentMounted.current) return;
    
    const validIds = layerIds.filter(id => hasLayer(id));
    if (validIds.length !== layerIds.length) {
      console.warn('Some layer IDs were invalid and ignored');
    }
    
    setSelectedLayerIds(validIds);
    setSelectedLayerId(validIds[0] || null);
  }, [hasLayer]);

  // ========================================================================
  // Visibility & Locking
  // ========================================================================

  /**
   * Toggle layer visibility
   */
  const toggleVisibility = useCallback((layerId: string) => {
    if (!isComponentMounted.current) return;
    if (!isValidLayerId(layerId)) return;

    setLayers(prev => {
      const updated = prev.map(layer =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      );
      addToHistory(updated);
      return updated;
    });
  }, [addToHistory]);

  /**
   * Toggle layer lock state
   */
  const toggleLock = useCallback((layerId: string) => {
    if (!isComponentMounted.current) return;
    if (!isValidLayerId(layerId)) return;

    setLayers(prev => {
      const updated = prev.map(layer =>
        layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
      );
      addToHistory(updated);
      return updated;
    });
  }, [addToHistory]);

  /**
   * Toggle layer solo state
   */
  const toggleSolo = useCallback((layerId: string) => {
    if (!isComponentMounted.current) return;
    if (!isValidLayerId(layerId)) return;

    setLayers(prev => {
      const updated = prev.map(layer =>
        layer.id === layerId ? { ...layer, solo: !layer.solo } : layer
      );
      addToHistory(updated);
      return updated;
    });
  }, [addToHistory]);

  // ========================================================================
  // Ordering
  // ========================================================================

  /**
   * Move layer up or down in stack
   */
  const moveLayer = useCallback((layerId: string, direction: 'up' | 'down') => {
    if (!isComponentMounted.current) return;
    if (!isValidLayerId(layerId)) return;

    setLayers(prev => {
      const index = prev.findIndex(l => l.id === layerId);
      if (index === -1) {
        console.warn(`Layer with ID ${layerId} not found`);
        return prev;
      }

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (!isValidIndex(newIndex, prev.length)) {
        return prev;
      }

      const newLayers = [...prev];
      [newLayers[index], newLayers[newIndex]] = [newLayers[newIndex], newLayers[index]];
      
      const updated = updateZIndices(newLayers);
      addToHistory(updated);
      return updated;
    });
  }, [updateZIndices, addToHistory]);

  /**
   * Reorder layers by index
   */
  const reorderLayers = useCallback((startIndex: number, endIndex: number) => {
    if (!isComponentMounted.current) return;

    setLayers(prev => {
      if (!isValidIndex(startIndex, prev.length) || !isValidIndex(endIndex, prev.length)) {
        console.warn('Invalid indices provided to reorderLayers');
        return prev;
      }

      const result = [...prev];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      
      const updated = updateZIndices(result);
      addToHistory(updated);
      return updated;
    });
  }, [updateZIndices, addToHistory]);

  /**
   * Move layer to specific position
   */
  const moveLayerToIndex = useCallback((layerId: string, newIndex: number) => {
    if (!isComponentMounted.current) return;
    if (!isValidLayerId(layerId)) return;

    setLayers(prev => {
      const currentIndex = prev.findIndex(l => l.id === layerId);
      if (currentIndex === -1) {
        console.warn(`Layer with ID ${layerId} not found`);
        return prev;
      }

      if (!isValidIndex(newIndex, prev.length)) {
        console.warn('Invalid index provided to moveLayerToIndex');
        return prev;
      }

      const result = [...prev];
      const [removed] = result.splice(currentIndex, 1);
      result.splice(newIndex, 0, removed);
      
      const updated = updateZIndices(result);
      addToHistory(updated);
      return updated;
    });
  }, [updateZIndices, addToHistory]);

  // ========================================================================
  // Transform
  // ========================================================================

  /**
   * Update layer transform properties
   */
  const updateTransform = useCallback((layerId: string, transform: Partial<Transform>) => {
    if (!isComponentMounted.current) return;
    if (!isValidLayerId(layerId)) return;

    setLayers(prev => {
      const updated = prev.map(layer =>
        layer.id === layerId 
          ? { ...layer, transform: { ...layer.transform, ...transform } } 
          : layer
      );
      addToHistory(updated);
      return updated;
    });
  }, [addToHistory]);

  /**
   * Reset layer transform to default
   */
  const resetTransform = useCallback((layerId: string) => {
    if (!isComponentMounted.current) return;
    if (!isValidLayerId(layerId)) return;

    setLayers(prev => {
      const updated = prev.map(layer =>
        layer.id === layerId 
          ? { ...layer, transform: { ...DEFAULT_TRANSFORM } } 
          : layer
      );
      addToHistory(updated);
      return updated;
    });
  }, [addToHistory]);

  // ========================================================================
  // Blend Mode
  // ========================================================================

  /**
   * Set layer blend mode
   */
  const setBlendMode = useCallback((layerId: string, blendMode: BlendMode) => {
    if (!isComponentMounted.current) return;
    if (!isValidLayerId(layerId)) return;

    setLayers(prev => {
      const updated = prev.map(layer =>
        layer.id === layerId ? { ...layer, blendMode } : layer
      );
      addToHistory(updated);
      return updated;
    });
  }, [addToHistory]);

  // ========================================================================
  // Opacity
  // ========================================================================

  /**
   * Set layer opacity (0-100)
   */
  const setOpacity = useCallback((layerId: string, opacity: number) => {
    if (!isComponentMounted.current) return;
    if (!isValidLayerId(layerId)) return;

    const clampedOpacity = clamp(opacity, MIN_OPACITY, MAX_OPACITY);
    
    setLayers(prev => {
      const updated = prev.map(layer =>
        layer.id === layerId ? { ...layer, opacity: clampedOpacity } : layer
      );
      addToHistory(updated);
      return updated;
    });
  }, [addToHistory]);

  // ========================================================================
  // Bulk Operations
  // ========================================================================

  /**
   * Group multiple layers
   */
  const groupLayers = useCallback((layerIds: string[]): Layer | null => {
    if (!isComponentMounted.current) return null;
    
    if (layerIds.length < 2) {
      console.warn('At least 2 layers required for grouping');
      return null;
    }

    const validIds = layerIds.filter(id => hasLayer(id));
    if (validIds.length < 2) {
      console.warn('Not enough valid layer IDs for grouping');
      return null;
    }

    const groupLayer = createDefaultLayer('group', `Group ${layerIdCounter}`);
    
    setLayers(prev => {
      const groupedLayers = prev
        .filter(l => validIds.includes(l.id))
        .map(l => ({ ...l, parentId: groupLayer.id }));
      
      const otherLayers = prev.filter(l => !validIds.includes(l.id));
      const firstGroupedIndex = prev.findIndex(l => validIds.includes(l.id));
      
      const result = [...otherLayers];
      result.splice(firstGroupedIndex, 0, groupLayer, ...groupedLayers);
      
      const updated = updateZIndices(result);
      addToHistory(updated);
      return updated;
    });

    setSelectedLayerId(groupLayer.id);
    return groupLayer;
  }, [hasLayer, updateZIndices, addToHistory]);

  /**
   * Ungroup layers
   */
  const ungroupLayers = useCallback((groupId: string) => {
    if (!isComponentMounted.current) return;
    if (!isValidLayerId(groupId)) return;

    const group = getLayerById(groupId);
    if (!group || group.type !== 'group') {
      console.warn('Invalid group ID or layer is not a group');
      return;
    }

    setLayers(prev => {
      // Remove parent references from children
      const updated = prev.map(layer =>
        layer.parentId === groupId ? { ...layer, parentId: null } : layer
      ).filter(layer => layer.id !== groupId); // Remove the group itself
      
      addToHistory(updated);
      return updated;
    });

    if (selectedLayerId === groupId) {
      setSelectedLayerId(null);
    }
  }, [getLayerById, selectedLayerId, addToHistory]);

  /**
   * Flatten selected layers
   */
  const flattenLayers = useCallback((layerIds: string[]) => {
    if (!isComponentMounted.current) return;

    const validIds = layerIds.filter(id => hasLayer(id));
    if (validIds.length === 0) {
      console.warn('No valid layer IDs provided');
      return;
    }

    setLayers(prev => {
      const updated = prev.map(layer =>
        validIds.includes(layer.id) ? { ...layer, parentId: null } : layer
      );
      addToHistory(updated);
      return updated;
    });
  }, [hasLayer, addToHistory]);

  /**
   * Clear all layers
   */
  const clearAllLayers = useCallback(() => {
    if (!isComponentMounted.current) return;

    setLayers([]);
    setSelectedLayerId(null);
    setSelectedLayerIds([]);
    addToHistory([]);
  }, [addToHistory]);

  // ========================================================================
  // Keyboard Shortcuts
  // ========================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl/Cmd + Shift + Z: Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
        return;
      }

      // Ctrl/Cmd + Y: Redo (alternative)
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      // Delete/Backspace: Remove selected layer
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLayerId) {
        e.preventDefault();
        removeLayer(selectedLayerId);
        return;
      }

      // Ctrl/Cmd + D: Duplicate selected layer
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedLayerId) {
        e.preventDefault();
        duplicateLayer(selectedLayerId);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedLayerId, removeLayer, duplicateLayer]);

  // ========================================================================
  // Cleanup on Unmount
  // ========================================================================

  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  // ========================================================================
  // Return API
  // ========================================================================

  return {
    layers,
    selectedLayerId,
    selectedLayer,
    addLayer,
    removeLayer,
    updateLayer,
    duplicateLayer,
    selectLayer,
    toggleVisibility,
    toggleLock,
    toggleSolo,
    moveLayer,
    reorderLayers,
    moveLayerToIndex,
    updateTransform,
    resetTransform,
    setBlendMode,
    setOpacity,
    groupLayers,
    ungroupLayers,
    flattenLayers,
    clearAllLayers,
    selectMultipleLayers,
    getLayerById,
    hasLayer,
    getVisibleLayers,
    getLayerChildren,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
