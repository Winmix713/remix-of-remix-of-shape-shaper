import { useState, useCallback, useMemo } from 'react';
import { Layer, BlendMode, Transform, LayerType, LayerContent, DEFAULT_TRANSFORM } from '../types/layers';

let layerIdCounter = 0;

const generateLayerId = () => `layer-${++layerIdCounter}-${Date.now()}`;

const createDefaultLayer = (type: LayerType, name?: string, content?: LayerContent): Layer => ({
  id: generateLayerId(),
  name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} ${layerIdCounter}`,
  type,
  visible: true,
  locked: false,
  solo: false,
  opacity: 100,
  blendMode: 'normal',
  transform: { ...DEFAULT_TRANSFORM },
  effects: [],
  parentId: null,
  zIndex: 0,
  content,
});

export interface UseLayerManagerReturn {
  layers: Layer[];
  selectedLayerId: string | null;
  selectedLayer: Layer | null;
  
  // CRUD Operations
  addLayer: (type: LayerType, name?: string, content?: LayerContent) => Layer;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, updates: Partial<Layer>) => void;
  duplicateLayer: (layerId: string) => Layer | null;
  
  // Selection
  selectLayer: (layerId: string | null) => void;
  
  // Visibility & Locking
  toggleVisibility: (layerId: string) => void;
  toggleLock: (layerId: string) => void;
  toggleSolo: (layerId: string) => void;
  
  // Ordering
  moveLayer: (layerId: string, direction: 'up' | 'down') => void;
  reorderLayers: (startIndex: number, endIndex: number) => void;
  
  // Transform
  updateTransform: (layerId: string, transform: Partial<Transform>) => void;
  
  // Blend Mode
  setBlendMode: (layerId: string, blendMode: BlendMode) => void;
  
  // Opacity
  setOpacity: (layerId: string, opacity: number) => void;
  
  // Bulk Operations
  groupLayers: (layerIds: string[]) => Layer | null;
  flattenLayers: (layerIds: string[]) => void;
  clearAllLayers: () => void;
}

export function useLayerManager(): UseLayerManagerReturn {
  const [layers, setLayers] = useState<Layer[]>([
    createDefaultLayer('shape', 'Main Shape', { type: 'superellipse' }),
  ]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(
    layers[0]?.id || null
  );

  // Memoized selected layer
  const selectedLayer = useMemo(() => 
    layers.find(l => l.id === selectedLayerId) || null,
    [layers, selectedLayerId]
  );

  // Update zIndex values after any ordering change
  const updateZIndices = useCallback((layerList: Layer[]): Layer[] => {
    return layerList.map((layer, index) => ({
      ...layer,
      zIndex: index,
    }));
  }, []);

  // CRUD Operations
  const addLayer = useCallback((type: LayerType, name?: string, content?: LayerContent): Layer => {
    const newLayer = createDefaultLayer(type, name, content);
    setLayers(prev => updateZIndices([newLayer, ...prev]));
    setSelectedLayerId(newLayer.id);
    return newLayer;
  }, [updateZIndices]);

  const removeLayer = useCallback((layerId: string) => {
    setLayers(prev => {
      const filtered = prev.filter(l => l.id !== layerId);
      return updateZIndices(filtered);
    });
    setSelectedLayerId(prev => prev === layerId ? null : prev);
  }, [updateZIndices]);

  const updateLayer = useCallback((layerId: string, updates: Partial<Layer>) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, ...updates } : layer
    ));
  }, []);

  const duplicateLayer = useCallback((layerId: string): Layer | null => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return null;

    const newLayer: Layer = {
      ...layer,
      id: generateLayerId(),
      name: `${layer.name} Copy`,
      transform: {
        ...layer.transform,
        x: layer.transform.x + 20,
        y: layer.transform.y + 20,
      },
    };

    const index = layers.findIndex(l => l.id === layerId);
    setLayers(prev => {
      const newLayers = [...prev];
      newLayers.splice(index, 0, newLayer);
      return updateZIndices(newLayers);
    });
    setSelectedLayerId(newLayer.id);
    return newLayer;
  }, [layers, updateZIndices]);

  // Selection
  const selectLayer = useCallback((layerId: string | null) => {
    setSelectedLayerId(layerId);
  }, []);

  // Visibility & Locking
  const toggleVisibility = useCallback((layerId: string) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  }, []);

  const toggleLock = useCallback((layerId: string) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
    ));
  }, []);

  const toggleSolo = useCallback((layerId: string) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, solo: !layer.solo } : layer
    ));
  }, []);

  // Ordering
  const moveLayer = useCallback((layerId: string, direction: 'up' | 'down') => {
    setLayers(prev => {
      const index = prev.findIndex(l => l.id === layerId);
      if (index === -1) return prev;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newLayers = [...prev];
      [newLayers[index], newLayers[newIndex]] = [newLayers[newIndex], newLayers[index]];
      return updateZIndices(newLayers);
    });
  }, [updateZIndices]);

  const reorderLayers = useCallback((startIndex: number, endIndex: number) => {
    setLayers(prev => {
      const result = [...prev];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return updateZIndices(result);
    });
  }, [updateZIndices]);

  // Transform
  const updateTransform = useCallback((layerId: string, transform: Partial<Transform>) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId 
        ? { ...layer, transform: { ...layer.transform, ...transform } } 
        : layer
    ));
  }, []);

  // Blend Mode
  const setBlendMode = useCallback((layerId: string, blendMode: BlendMode) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, blendMode } : layer
    ));
  }, []);

  // Opacity
  const setOpacity = useCallback((layerId: string, opacity: number) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, opacity: Math.max(0, Math.min(100, opacity)) } : layer
    ));
  }, []);

  // Bulk Operations
  const groupLayers = useCallback((layerIds: string[]): Layer | null => {
    if (layerIds.length < 2) return null;

    const groupLayer = createDefaultLayer('group', `Group ${layerIdCounter}`);
    
    setLayers(prev => {
      const groupedLayers = prev
        .filter(l => layerIds.includes(l.id))
        .map(l => ({ ...l, parentId: groupLayer.id }));
      
      const otherLayers = prev.filter(l => !layerIds.includes(l.id));
      const firstGroupedIndex = prev.findIndex(l => layerIds.includes(l.id));
      
      const result = [...otherLayers];
      result.splice(firstGroupedIndex, 0, groupLayer, ...groupedLayers);
      
      return updateZIndices(result);
    });

    setSelectedLayerId(groupLayer.id);
    return groupLayer;
  }, [updateZIndices]);

  const flattenLayers = useCallback((layerIds: string[]) => {
    setLayers(prev => prev.map(layer =>
      layerIds.includes(layer.id) ? { ...layer, parentId: null } : layer
    ));
  }, []);

  const clearAllLayers = useCallback(() => {
    setLayers([]);
    setSelectedLayerId(null);
  }, []);

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
    updateTransform,
    setBlendMode,
    setOpacity,
    groupLayers,
    flattenLayers,
    clearAllLayers,
  };
}
