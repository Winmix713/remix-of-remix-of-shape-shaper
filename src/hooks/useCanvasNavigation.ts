/**
 * useCanvasNavigation Hook
 * 
 * A comprehensive React hook for managing canvas navigation including zoom and pan functionality.
 * Supports mouse wheel zoom, keyboard shortcuts, and space-bar panning with cursor position awareness.
 * 
 * @example
 * ```tsx
 * function MyCanvas() {
 *   const { zoom, panX, panY, containerRef, zoomIn, zoomOut } = useCanvasNavigation();
 *   
 *   return (
 *     <div ref={containerRef}>
 *       <div style={{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})` }}>
 *         Canvas content
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useCallback, useEffect, useRef } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface CanvasNavigationState {
  /** Current zoom level (0.1 to 5.0) */
  zoom: number;
  /** Horizontal pan offset in pixels */
  panX: number;
  /** Vertical pan offset in pixels */
  panY: number;
}

interface UseCanvasNavigationReturn {
  /** Current zoom level */
  zoom: number;
  /** Current horizontal pan offset */
  panX: number;
  /** Current vertical pan offset */
  panY: number;
  /** Whether the canvas is currently being panned */
  isPanning: boolean;
  /** Set zoom level programmatically */
  setZoom: (zoom: number) => void;
  /** Set pan position programmatically */
  setPan: (x: number, y: number) => void;
  /** Reset view to default state (zoom: 1, pan: 0,0) */
  resetView: () => void;
  /** Set zoom to 100% (1.0) */
  zoomTo100: () => void;
  /** Increase zoom by ZOOM_STEP */
  zoomIn: () => void;
  /** Decrease zoom by ZOOM_STEP */
  zoomOut: () => void;
  /** Fit content to view (can be customized based on content bounds) */
  fitToView: () => void;
  /** Manual wheel event handler (if needed externally) */
  handleWheel: (e: WheelEvent) => void;
  /** Ref to attach to the canvas container element */
  containerRef: React.RefObject<HTMLDivElement>;
}

// ============================================================================
// Constants
// ============================================================================

/** Minimum allowed zoom level */
const MIN_ZOOM = 0.1;

/** Maximum allowed zoom level */
const MAX_ZOOM = 5;

/** Zoom increment/decrement step */
const ZOOM_STEP = 0.1;

/** Default zoom level */
const DEFAULT_ZOOM = 1;

/** Default pan position */
const DEFAULT_PAN = { x: 0, y: 0 };

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Clamps a number between min and max values
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Safely prevents default behavior on events
 */
function safePreventDefault(e: Event): void {
  if (e.cancelable) {
    e.preventDefault();
  }
}

// ============================================================================
// Main Hook
// ============================================================================

export function useCanvasNavigation(): UseCanvasNavigationReturn {
  // ========================================================================
  // State Management
  // ========================================================================
  
  const [state, setState] = useState<CanvasNavigationState>({
    zoom: DEFAULT_ZOOM,
    panX: DEFAULT_PAN.x,
    panY: DEFAULT_PAN.y,
  });

  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // ========================================================================
  // Refs
  // ========================================================================
  
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const isComponentMounted = useRef(true);

  // ========================================================================
  // Zoom Functions
  // ========================================================================

  /**
   * Sets the zoom level with bounds checking
   */
  const setZoom = useCallback((newZoom: number) => {
    if (!isComponentMounted.current) return;
    
    const clampedZoom = clamp(newZoom, MIN_ZOOM, MAX_ZOOM);
    setState(prev => ({
      ...prev,
      zoom: clampedZoom,
    }));
  }, []);

  /**
   * Sets the pan position
   */
  const setPan = useCallback((x: number, y: number) => {
    if (!isComponentMounted.current) return;
    
    setState(prev => ({
      ...prev,
      panX: x,
      panY: y,
    }));
  }, []);

  /**
   * Resets view to default state
   */
  const resetView = useCallback(() => {
    if (!isComponentMounted.current) return;
    
    setState({
      zoom: DEFAULT_ZOOM,
      panX: DEFAULT_PAN.x,
      panY: DEFAULT_PAN.y,
    });
  }, []);

  /**
   * Sets zoom to 100% (1.0)
   */
  const zoomTo100 = useCallback(() => {
    if (!isComponentMounted.current) return;
    
    setState(prev => ({
      ...prev,
      zoom: 1,
    }));
  }, []);

  /**
   * Increases zoom by ZOOM_STEP
   */
  const zoomIn = useCallback(() => {
    if (!isComponentMounted.current) return;
    
    setState(prev => ({
      ...prev,
      zoom: clamp(prev.zoom + ZOOM_STEP, MIN_ZOOM, MAX_ZOOM),
    }));
  }, []);

  /**
   * Decreases zoom by ZOOM_STEP
   */
  const zoomOut = useCallback(() => {
    if (!isComponentMounted.current) return;
    
    setState(prev => ({
      ...prev,
      zoom: clamp(prev.zoom - ZOOM_STEP, MIN_ZOOM, MAX_ZOOM),
    }));
  }, []);

  /**
   * Fits content to view
   * Note: This implementation resets to default. Override with custom logic
   * to calculate based on actual content bounds.
   */
  const fitToView = useCallback(() => {
    if (!isComponentMounted.current) return;
    
    // Can be enhanced to calculate based on content bounds
    // For now, just reset to default view
    resetView();
  }, [resetView]);

  // ========================================================================
  // Mouse Wheel Zoom Handler
  // ========================================================================

  /**
   * Handles mouse wheel events for zooming
   * Zooms towards cursor position for better UX
   */
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!isComponentMounted.current) return;
    
    safePreventDefault(e);

    // Calculate zoom delta based on wheel direction
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const newZoom = clamp(state.zoom + delta, MIN_ZOOM, MAX_ZOOM);

    // If zoom hasn't changed (at limits), don't update
    if (newZoom === state.zoom) return;

    // Zoom towards cursor position
    if (containerRef.current) {
      try {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate new pan position to keep cursor point fixed
        const zoomRatio = newZoom / state.zoom;
        const newPanX = mouseX - (mouseX - state.panX) * zoomRatio;
        const newPanY = mouseY - (mouseY - state.panY) * zoomRatio;

        setState({
          zoom: newZoom,
          panX: newPanX,
          panY: newPanY,
        });
      } catch (error) {
        // Fallback to simple zoom if calculation fails
        console.warn('Error calculating zoom position:', error);
        setZoom(newZoom);
      }
    } else {
      setZoom(newZoom);
    }
  }, [state.zoom, state.panX, state.panY, setZoom]);

  // ========================================================================
  // Keyboard Event Handlers
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

      // Space bar for panning mode
      if (e.code === 'Space' && !isSpacePressed) {
        safePreventDefault(e);
        setIsSpacePressed(true);
        return;
      }

      // Ctrl/Cmd + 0: Reset view
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        safePreventDefault(e);
        resetView();
        return;
      }

      // Ctrl/Cmd + 1: Zoom to 100%
      if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        safePreventDefault(e);
        zoomTo100();
        return;
      }

      // Ctrl/Cmd + Plus/Equals: Zoom in
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        safePreventDefault(e);
        zoomIn();
        return;
      }

      // Ctrl/Cmd + Minus: Zoom out
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        safePreventDefault(e);
        zoomOut();
        return;
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

  // ========================================================================
  // Mouse Drag Panning
  // ========================================================================

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (isSpacePressed && !isPanning) {
        safePreventDefault(e);
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
      if (isPanning) {
        setIsPanning(false);
      }
    };

    // Handle case where mouse leaves window while panning
    const handleMouseLeave = () => {
      if (isPanning) {
        setIsPanning(false);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        container.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [isPanning, isSpacePressed]);

  // ========================================================================
  // Wheel Event Listener
  // ========================================================================

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });

      return () => {
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleWheel]);

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
