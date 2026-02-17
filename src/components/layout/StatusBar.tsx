import { memo, useCallback, type FC } from 'react';
import { RotateCcw, Copy, Download, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface StatusBarProps {
  dimensions: { width: number; height: number };
  zoom: number;
  activeLayer: string | null;
  inspectorActive: boolean;
  onReset?: () => void;
  onCopySVG?: () => void;
  onExport?: () => void;
}

const StatusBarInner: FC<StatusBarProps> = ({
  dimensions,
  zoom,
  activeLayer,
  inspectorActive,
  onReset,
  onCopySVG,
  onExport,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopySVG = useCallback(() => {
    onCopySVG?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [onCopySVG]);

  return (
    <footer
      className="h-8 border-t border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-4 text-[10px] text-muted-foreground shrink-0 z-40 select-none"
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

        {/* Active layer */}
        {activeLayer && (
          <span className="truncate max-w-[120px]">
            Layer: {activeLayer}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Zoom */}
        <span className="font-mono mr-2">
          {Math.round(zoom * 100)}%
        </span>

        {/* Action Buttons */}
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Reset to defaults"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
        {onCopySVG && (
          <button
            onClick={handleCopySVG}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Copy SVG to clipboard"
          >
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy SVG'}</span>
          </button>
        )}
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            aria-label="Export"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Export</span>
          </button>
        )}

        {/* Shortcut hint */}
        <span className="hidden md:inline text-muted-foreground/50 ml-2">
          <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] font-mono">Ctrl+/</kbd>
        </span>
      </div>
    </footer>
  );
};

export const StatusBar = memo(StatusBarInner);
StatusBar.displayName = 'StatusBar';
