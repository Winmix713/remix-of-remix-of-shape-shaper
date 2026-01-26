import { memo, useMemo } from 'react';
import { ZoomIn, ZoomOut, Maximize, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CanvasContainerProps {
  zoom: number;
  panX: number;
  panY: number;
  isPanning: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onZoomTo100: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}

export const CanvasContainer = memo<CanvasContainerProps>(({
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
}) => {
  const canvasStyle = useMemo(() => ({
    transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
    transformOrigin: 'center center',
  }), [zoom, panX, panY]);

  const zoomPercentage = Math.round(zoom * 100);

  return (
    <div className="flex-1 relative flex flex-col overflow-hidden bg-muted dark:bg-zinc-950">
      {/* Zoom Controls */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-lg border border-border p-1 shadow-sm">
        <button
          onClick={onZoomOut}
          className="p-1.5 rounded hover:bg-muted transition-colors"
          aria-label="Zoom out"
          title="Zoom out (Ctrl+-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        
        <button
          onClick={onZoomTo100}
          className="px-2 py-1 text-xs font-medium hover:bg-muted rounded transition-colors min-w-[3.5rem] text-center"
          aria-label="Zoom to 100%"
          title="Zoom to 100% (Ctrl+1)"
        >
          {zoomPercentage}%
        </button>
        
        <button
          onClick={onZoomIn}
          className="p-1.5 rounded hover:bg-muted transition-colors"
          aria-label="Zoom in"
          title="Zoom in (Ctrl++)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        
        <div className="w-px h-4 bg-border mx-0.5" />
        
        <button
          onClick={onResetView}
          className="p-1.5 rounded hover:bg-muted transition-colors"
          aria-label="Reset view"
          title="Reset view (Ctrl+0)"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Hint */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 text-[10px] text-muted-foreground/60">
        <span className="flex items-center gap-1">
          <kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">Space</kbd>
          <span>+ Drag to pan</span>
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">Scroll</kbd>
          <span>to zoom</span>
        </span>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className={cn(
          "flex-1 relative overflow-hidden",
          isPanning && "cursor-grabbing"
        )}
        style={{ cursor: isPanning ? 'grabbing' : 'default' }}
      >
        {/* Grid Background */}
        <div 
          className="absolute inset-0 bg-grid pointer-events-none opacity-30"
          style={{ 
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
          aria-hidden="true"
        />

        {/* Zoomable/Pannable Content */}
        <div 
          className="absolute inset-0 flex items-center justify-center transition-transform duration-75"
          style={canvasStyle}
        >
          {children}
        </div>
      </div>
    </div>
  );
});

CanvasContainer.displayName = 'CanvasContainer';
