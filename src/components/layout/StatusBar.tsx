import { memo, type FC } from 'react';
import { cn } from '@/lib/utils';

interface StatusBarProps {
  dimensions: { width: number; height: number };
  zoom: number;
  activeLayer: string | null;
  inspectorActive: boolean;
}

const StatusBarInner: FC<StatusBarProps> = ({
  dimensions,
  zoom,
  activeLayer,
  inspectorActive,
}) => {
  return (
    <footer
      className="h-7 border-t border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-4 text-[10px] text-muted-foreground shrink-0 z-40 select-none"
      role="status"
      aria-label="Editor status bar"
    >
      <div className="flex items-center gap-4">
        {/* Ready indicator */}
        <span className="flex items-center gap-1.5">
          <span className={cn(
            "w-1.5 h-1.5 rounded-full",
            inspectorActive ? "bg-blue-500" : "bg-green-500"
          )} />
          {inspectorActive ? 'Inspector' : 'Ready'}
        </span>

        {/* Dimensions */}
        <span className="font-mono">
          {dimensions.width} × {dimensions.height}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Active layer */}
        {activeLayer && (
          <span className="truncate max-w-[120px]">
            Layer: {activeLayer}
          </span>
        )}

        {/* Zoom */}
        <span className="font-mono">
          {Math.round(zoom * 100)}%
        </span>

        {/* Shortcut hint */}
        <span className="hidden md:inline text-muted-foreground/50">
          <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] font-mono">Ctrl+/</kbd> Shortcuts
        </span>
      </div>
    </footer>
  );
};

export const StatusBar = memo(StatusBarInner);
StatusBar.displayName = 'StatusBar';
