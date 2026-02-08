import { useState, useCallback } from 'react';
import { InspectorState } from '@/types/editor';

export function useInspector() {
  const [inspectorState, setInspectorState] = useState<InspectorState>({
    active: false,
    hoveredElement: null,
    selectedElement: null,
    boundingBox: null,
  });

  const toggleInspector = useCallback(() => {
    setInspectorState(prev => ({
      ...prev,
      active: !prev.active,
      hoveredElement: null,
      selectedElement: null,
      boundingBox: null,
    }));
  }, []);

  const setHovered = useCallback((element: string | null) => {
    setInspectorState(prev => ({ ...prev, hoveredElement: element }));
  }, []);

  const setSelected = useCallback((element: string | null, box: DOMRect | null) => {
    setInspectorState(prev => ({
      ...prev,
      selectedElement: element,
      boundingBox: box,
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setInspectorState(prev => ({
      ...prev,
      hoveredElement: null,
      selectedElement: null,
      boundingBox: null,
    }));
  }, []);

  return {
    inspector: inspectorState,
    toggleInspector,
    setHovered,
    setSelected,
    clearSelection,
  };
}
