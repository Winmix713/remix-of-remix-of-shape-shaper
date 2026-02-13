import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface CanvasHUDProps {
  width: number;
  height: number;
  exp: number;
  zoom: number;
  className?: string;
}

export const CanvasHUD = memo<CanvasHUDProps>(({
  width,
  height,
  exp,
  zoom,
  className,
}) => {
  return (
    <div
      className={cn(
        "absolute bottom-4 left-4 z-20",
        "flex items-center gap-3 px-3 py-1.5",
        "bg-background/60 backdrop-blur-xl rounded-lg",
        "border border-border/40 shadow-sm",
        "text-[11px] font-mono text-muted-foreground select-none",
        className
      )}
      role="status"
      aria-label="Shape information"
    >
      <span className="flex items-center gap-1">
        <span className="text-foreground/70 font-medium">{width}</span>
        <span>×</span>
        <span className="text-foreground/70 font-medium">{height}</span>
      </span>
      <span className="w-px h-3 bg-border" aria-hidden="true" />
      <span>
        n=<span className="text-foreground/70 font-medium">{exp.toFixed(1)}</span>
      </span>
    </div>
  );
});

CanvasHUD.displayName = 'CanvasHUD';
