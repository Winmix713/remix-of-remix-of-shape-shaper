import { useState, useCallback, useEffect, useRef } from 'react';

interface CanvasNavigationState {
  zoom: number;
  panX: number;
  panY: number;
}

interface UseCanvasNavigationReturn {
  zoom: number;
  panX: number;
  panY: number;
  isPanning: boolean;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  resetView: () => void;
  zoomTo100: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToView: () => void;
  handleWheel: (e: WheelEvent) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.1;
const DEFAULT_ZOOM = 1;

export function useCanvasNavigation(): UseCanvasNavigationReturn {
  const [state, setState] = useState<CanvasNavigationState>({
    zoom: DEFAULT_ZOOM,
    panX: 0,
    panY: 0,
  });
  
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Zoom functions
  const setZoom = useCallback((newZoom: number) => {
    setState(prev => ({
      ...prev,
      zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom)),
    }));
  }, []);

  const setPan = useCallback((x: number, y: number) => {
    setState(prev => ({ ...prev, panX: x, panY: y }));
  }, []);

  const resetView = useCallback(() => {
    setState({ zoom: DEFAULT_ZOOM, panX: 0, panY: 0 });
  }, []);

  const zoomTo100 = useCallback(() => {
    setState(prev => ({ ...prev, zoom: 1 }));
  }, []);

  const zoomIn = useCallback(() => {
    setState(prev => ({
      ...prev,
      zoom: Math.min(MAX_ZOOM, prev.zoom + ZOOM_STEP),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setState(prev => ({
      ...prev,
      zoom: Math.max(MIN_ZOOM, prev.zoom - ZOOM_STEP),
    }));
  }, []);

  const fitToView = useCallback(() => {
    // Could be enhanced to calculate based on content bounds
    resetView();
  }, [resetView]);

  // Mouse wheel zoom handler
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, state.zoom + delta));
    
    // Zoom towards cursor position
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const zoomRatio = newZoom / state.zoom;
      const newPanX = mouseX - (mouseX - state.panX) * zoomRatio;
      const newPanY = mouseY - (mouseY - state.panY) * zoomRatio;
      
      setState({
        zoom: newZoom,
        panX: newPanX,
        panY: newPanY,
      });
    } else {
      setZoom(newZoom);
    }
  }, [state.zoom, state.panX, state.panY, setZoom]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space for panning
      if (e.code === 'Space' && !isSpacePressed) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
      
      // Ctrl+0 to reset view
      if (e.ctrlKey && e.key === '0') {
        e.preventDefault();
        resetView();
      }
      
      // Ctrl+1 to zoom to 100%
      if (e.ctrlKey && e.key === '1') {
        e.preventDefault();
        zoomTo100();
      }
      
      // Ctrl++ to zoom in
      if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        zoomIn();
      }
      
      // Ctrl+- to zoom out
      if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        zoomOut();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed, resetView, zoomTo100, zoomIn, zoomOut]);

  // Mouse drag panning
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (isSpacePressed) {
        e.preventDefault();
        setIsPanning(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning && isSpacePressed) {
        const deltaX = e.clientX - lastMousePos.current.x;
        const deltaY = e.clientY - lastMousePos.current.y;
        
        setState(prev => ({
          ...prev,
          panX: prev.panX + deltaX,
          panY: prev.panY + deltaY,
        }));
        
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        container.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, isSpacePressed]);

  // Wheel event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleWheel]);

  return {
    zoom: state.zoom,
    panX: state.panX,
    panY: state.panY,
    isPanning,
    setZoom,
    setPan,
    resetView,
    zoomTo100,
    zoomIn,
    zoomOut,
    fitToView,
    handleWheel,
    containerRef,
  };
}
