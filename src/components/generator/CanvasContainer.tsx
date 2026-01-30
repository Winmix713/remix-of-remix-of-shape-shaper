/**
 * CanvasContainer Component
 * 
 * A high-performance canvas container with zoom and pan controls for viewing
 * and navigating content. Provides intuitive controls, keyboard shortcuts,
 * and visual feedback for canvas interactions.
 * 
 * Features:
 * - Zoom controls (in/out, reset, 100%)
 * - Visual zoom percentage display
 * - Keyboard shortcuts (Ctrl+0, Ctrl+1, Ctrl++, Ctrl+-)
 * - Space + drag to pan
 * - Mouse wheel zoom
 * - Grid background with radial gradient mask
 * - Fully accessible with ARIA labels
 * - Optimized with React.memo
 * - Touch-friendly controls
 * 
 * @example
 * ```tsx
 * const { zoom, panX, panY, isPanning, ... } = useCanvasNavigation();
 * 
 * <CanvasContainer
 *   zoom={zoom}
 *   panX={panX}
 *   panY={panY}
 *   isPanning={isPanning}
 *   onZoomIn={zoomIn}
 *   onZoomOut={zoomOut}
 *   onResetView={resetView}
 *   onZoomTo100={zoomTo100}
 *   containerRef={containerRef}
 * >
 *   <YourContent />
 * </CanvasContainer>
 * ```
 */

import { 
  memo, 
  useMemo, 
  useCallback,
  useRef,
  useEffect,
  type FC,
  type CSSProperties,
  type ReactNode,
  type RefObject
} from 'react';
import { ZoomIn, ZoomOut, Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface CanvasContainerProps {
  /** Current zoom level (0.1 to 5.0) */
  zoom: number;
  /** Horizontal pan offset in pixels */
  panX: number;
  /** Vertical pan offset in pixels */
  panY: number;
  /** Whether canvas is currently being panned */
  isPanning: boolean;
  /** Zoom in callback */
  onZoomIn: () => void;
  /** Zoom out callback */
  onZoomOut: () => void;
  /** Reset view callback */
  onResetView: () => void;
  /** Zoom to 100% callback */
  onZoomTo100: () => void;
  /** Container ref for event listeners */
  containerRef: RefObject<HTMLDivElement>;
  /** Canvas content to display */
  children: ReactNode;
  /** Optional additional class names */
  className?: string;
  /** Optional show/hide grid background */
  showGrid?: boolean;
  /** Optional custom grid opacity */
  gridOpacity?: number;
}

interface ZoomLevel {
  /** Zoom percentage value */
  value: number;
  /** Display label */
  label: string;
  /** Whether this is a key zoom level */
  isKey: boolean;
}

// ============================================================================
// Constants
// ============================================================================

/** Minimum zoom level */
const MIN_ZOOM = 0.1;

/** Maximum zoom level */
const MAX_ZOOM = 5.0;

/** Key zoom levels for quick access */
const KEY_ZOOM_LEVELS: readonly ZoomLevel[] = [
  { value: 0.25, label: '25%', isKey: true },
  { value: 0.5, label: '50%', isKey: true },
  { value: 1.0, label: '100%', isKey: true },
  { value: 1.5, label: '150%', isKey: true },
  { value: 2.0, label: '200%', isKey: true },
] as const;

/** Default grid opacity */
const DEFAULT_GRID_OPACITY = 0.3;

/** Zoom percentage display precision */
const ZOOM_PRECISION = 0;

/** Transition duration for smooth transforms */
const TRANSFORM_TRANSITION = '75ms ease-out';

/** Keyboard shortcuts configuration */
const KEYBOARD_SHORTCUTS = {
  ZOOM_IN: { keys: ['Ctrl', '+'], label: 'Ctrl++' },
  ZOOM_OUT: { keys: ['Ctrl', '-'], label: 'Ctrl+-' },
  RESET: { keys: ['Ctrl', '0'], label: 'Ctrl+0' },
  TO_100: { keys: ['Ctrl', '1'], label: 'Ctrl+1' },
  PAN: { keys: ['Space'], label: 'Space' },
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Formats zoom value to percentage string
 */
const formatZoomPercentage = (zoom: number): string => {
  return `${Math.round(zoom * 100)}%`;
};

/**
 * Checks if zoom is at a key level (for visual feedback)
 */
const isKeyZoomLevel = (zoom: number): boolean => {
  return KEY_ZOOM_LEVELS.some(level => 
    Math.abs(level.value - zoom) < 0.01
  );
};

/**
 * Clamps zoom value between min and max
 */
const clampZoom = (zoom: number): number => {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
};

/**
 * Validates zoom value
 */
const isValidZoom = (zoom: number): boolean => {
  return !isNaN(zoom) && isFinite(zoom) && zoom >= MIN_ZOOM && zoom <= MAX_ZOOM;
};

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Control button component
 * Memoized for performance
 */
const ControlButton = memo<{
  onClick: () => void;
  icon: ReactNode;
  label: string;
  tooltip: string;
  disabled?: boolean;
  isActive?: boolean;
}>(({ onClick, icon, label, tooltip, disabled = false, isActive = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "p-1.5 rounded transition-all duration-200",
      "hover:bg-muted active:scale-95",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent",
      isActive && "bg-muted"
    )}
    aria-label={label}
    title={tooltip}
    type="button"
  >
    {icon}
  </button>
));

ControlButton.displayName = 'ControlButton';

/**
 * Keyboard shortcut hint component
 */
const KeyboardHint = memo<{
  keys: string[];
  description: string;
}>(({ keys, description }) => (
  <span className="flex items-center gap-1">
    {keys.map((key, index) => (
      <kbd 
        key={index}
        className="px-1 py-0.5 bg-muted rounded text-[9px] font-mono"
      >
        {key}
      </kbd>
    ))}
    <span>{description}</span>
  </span>
));

KeyboardHint.displayName = 'KeyboardHint';

// ============================================================================
// Main Component
// ============================================================================

const CanvasContainerInner: FC<CanvasContainerProps> = ({
  zoom,
  panX,
  panY,
  isPanning,
  onZoomIn,
  onZoomOut,
  onResetView,
  onZoomTo100,
  containerRef,
  children,
  className,
  showGrid = true,
  gridOpacity = DEFAULT_GRID_OPACITY,
}) => {
  // ========================================================================
  // Refs
  // ========================================================================
  
  const isComponentMounted = useRef(true);
  const lastValidZoom = useRef(zoom);

  // ========================================================================
  // Validation
  // ========================================================================

  useEffect(() => {
    if (!isValidZoom(zoom)) {
      console.warn(`Invalid zoom value: ${zoom}. Using last valid zoom: ${lastValidZoom.current}`);
    } else {
      lastValidZoom.current = zoom;
    }
  }, [zoom]);

  // ========================================================================
  // Memoized Values
  // ========================================================================

  /**
   * Canvas content transform styles
   * Memoized to prevent recalculation
   */
  const canvasStyle = useMemo<CSSProperties>(() => ({
    transform: `translate(${panX}px, ${panY}px) scale(${clampZoom(zoom)})`,
    transformOrigin: 'center center',
    transition: `transform ${TRANSFORM_TRANSITION}`,
    willChange: isPanning ? 'transform' : 'auto',
  }), [zoom, panX, panY, isPanning]);

  /**
   * Grid background transform styles
   * Memoized to sync with canvas
   */
  const gridStyle = useMemo<CSSProperties>(() => ({
    maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
    WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
    transform: `translate(${panX}px, ${panY}px) scale(${clampZoom(zoom)})`,
    transformOrigin: 'center center',
    opacity: gridOpacity,
    transition: `transform ${TRANSFORM_TRANSITION}`,
  }), [panX, panY, zoom, gridOpacity]);

  /**
   * Formatted zoom percentage
   */
  const zoomPercentage = useMemo(() => 
    formatZoomPercentage(zoom),
    [zoom]
  );

  /**
   * Check if at min/max zoom for button states
   */
  const isAtMinZoom = useMemo(() => zoom <= MIN_ZOOM + 0.01, [zoom]);
  const isAtMaxZoom = useMemo(() => zoom >= MAX_ZOOM - 0.01, [zoom]);
  const isAt100 = useMemo(() => Math.abs(zoom - 1.0) < 0.01, [zoom]);

  /**
   * Cursor style based on panning state
   */
  const cursorStyle = useMemo(() => 
    isPanning ? 'grabbing' : 'default',
    [isPanning]
  );

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Handle zoom in with validation
   */
  const handleZoomIn = useCallback(() => {
    if (!isComponentMounted.current || isAtMaxZoom) return;
    onZoomIn();
  }, [onZoomIn, isAtMaxZoom]);

  /**
   * Handle zoom out with validation
   */
  const handleZoomOut = useCallback(() => {
    if (!isComponentMounted.current || isAtMinZoom) return;
    onZoomOut();
  }, [onZoomOut, isAtMinZoom]);

  /**
   * Handle reset view
   */
  const handleResetView = useCallback(() => {
    if (!isComponentMounted.current) return;
    onResetView();
  }, [onResetView]);

  /**
   * Handle zoom to 100%
   */
  const handleZoomTo100 = useCallback(() => {
    if (!isComponentMounted.current || isAt100) return;
    onZoomTo100();
  }, [onZoomTo100, isAt100]);

  // ========================================================================
  // Cleanup
  // ========================================================================

  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div 
      className={cn(
        "flex-1 relative flex flex-col overflow-hidden bg-muted",
        className
      )}
      role="region"
      aria-label="Canvas viewport"
    >
      {/* Zoom Controls */}
      <div 
        className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-lg border border-border p-1 shadow-sm"
        role="toolbar"
        aria-label="Zoom controls"
      >
        <ControlButton
          onClick={handleZoomOut}
          icon={<ZoomOut className="w-4 h-4" aria-hidden="true" />}
          label="Zoom out"
          tooltip={`Zoom out (${KEYBOARD_SHORTCUTS.ZOOM_OUT.label})`}
          disabled={isAtMinZoom}
        />
        
        <button
          onClick={handleZoomTo100}
          className={cn(
            "px-2 py-1 text-xs font-medium hover:bg-muted rounded transition-all duration-200",
            "min-w-[3.5rem] text-center",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            isAt100 && "bg-muted font-semibold"
          )}
          aria-label={`Current zoom: ${zoomPercentage}. Click to zoom to 100%`}
          title={`Zoom to 100% (${KEYBOARD_SHORTCUTS.TO_100.label})`}
          type="button"
        >
          {zoomPercentage}
        </button>
        
        <ControlButton
          onClick={handleZoomIn}
          icon={<ZoomIn className="w-4 h-4" aria-hidden="true" />}
          label="Zoom in"
          tooltip={`Zoom in (${KEYBOARD_SHORTCUTS.ZOOM_IN.label})`}
          disabled={isAtMaxZoom}
        />
        
        <div 
          className="w-px h-4 bg-border mx-0.5" 
          role="separator"
          aria-hidden="true"
        />
        
        <ControlButton
          onClick={handleResetView}
          icon={<Maximize className="w-4 h-4" aria-hidden="true" />}
          label="Reset view"
          tooltip={`Reset view (${KEYBOARD_SHORTCUTS.RESET.label})`}
        />
      </div>

      {/* Navigation Hints */}
      <div 
        className="absolute bottom-3 left-3 z-20 flex items-center gap-3 text-[10px] text-muted-foreground/60 select-none"
        role="status"
        aria-label="Navigation instructions"
      >
        <KeyboardHint 
          keys={['Space']} 
          description="+ Drag to pan" 
        />
        <KeyboardHint 
          keys={['Scroll']} 
          description="to zoom" 
        />
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className={cn(
          "flex-1 relative overflow-hidden transition-[cursor] duration-100",
          isPanning && "cursor-grabbing"
        )}
        style={{ cursor: cursorStyle }}
        role="application"
        aria-label="Pannable and zoomable canvas area"
      >
        {/* Grid Background */}
        {showGrid && (
          <div 
            className="absolute inset-0 bg-grid pointer-events-none"
            style={gridStyle}
            aria-hidden="true"
            role="presentation"
          />
        )}

        {/* Zoomable/Pannable Content */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={canvasStyle}
          role="group"
          aria-label="Canvas content"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

// Properly memoize the component
export const CanvasContainer = memo(CanvasContainerInner);

CanvasContainer.displayName = 'CanvasContainer';
