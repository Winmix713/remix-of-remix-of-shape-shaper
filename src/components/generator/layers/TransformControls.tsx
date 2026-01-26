import { memo, useCallback } from 'react';
import { RotateCw, Link2, Link2Off } from 'lucide-react';
import { Transform, AnchorPoint } from '@/types/layers';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface TransformControlsProps {
  transform: Transform;
  onChange: (updates: Partial<Transform>) => void;
  disabled?: boolean;
}

const ANCHOR_POINTS: AnchorPoint[][] = [
  ['top-left', 'top-center', 'top-right'],
  ['center-left', 'center', 'center-right'],
  ['bottom-left', 'bottom-center', 'bottom-right'],
];

export const TransformControls = memo<TransformControlsProps>(({
  transform,
  onChange,
  disabled = false,
}) => {
  const [linkScale, setLinkScale] = React.useState(true);

  const handleScaleXChange = useCallback((value: number) => {
    if (linkScale) {
      onChange({ scaleX: value, scaleY: value });
    } else {
      onChange({ scaleX: value });
    }
  }, [linkScale, onChange]);

  const handleScaleYChange = useCallback((value: number) => {
    if (linkScale) {
      onChange({ scaleX: value, scaleY: value });
    } else {
      onChange({ scaleY: value });
    }
  }, [linkScale, onChange]);

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Transform
      </h4>

      {/* Position */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-muted-foreground">X Position</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={transform.x}
              onChange={(e) => onChange({ x: parseFloat(e.target.value) || 0 })}
              disabled={disabled}
              className="w-full h-7 text-xs bg-muted/50 border border-border rounded px-2 outline-none focus:ring-1 focus:ring-primary/30"
              aria-label="X position"
            />
            <span className="text-[10px] text-muted-foreground">px</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-muted-foreground">Y Position</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={transform.y}
              onChange={(e) => onChange({ y: parseFloat(e.target.value) || 0 })}
              disabled={disabled}
              className="w-full h-7 text-xs bg-muted/50 border border-border rounded px-2 outline-none focus:ring-1 focus:ring-primary/30"
              aria-label="Y position"
            />
            <span className="text-[10px] text-muted-foreground">px</span>
          </div>
        </div>
      </div>

      {/* Rotation */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-medium text-muted-foreground">Rotation</label>
          <span className="text-[10px] text-muted-foreground">{transform.rotation}°</span>
        </div>
        <div className="flex items-center gap-2">
          <RotateCw className="w-3.5 h-3.5 text-muted-foreground/70" />
          <Slider
            value={[transform.rotation]}
            onValueChange={([value]) => onChange({ rotation: value })}
            min={0}
            max={360}
            step={1}
            disabled={disabled}
            className="flex-1"
          />
          <input
            type="number"
            value={transform.rotation}
            onChange={(e) => onChange({ rotation: parseFloat(e.target.value) || 0 })}
            disabled={disabled}
            className="w-14 h-6 text-[10px] bg-muted/50 border border-border rounded px-1.5 text-center outline-none focus:ring-1 focus:ring-primary/30"
            min={0}
            max={360}
          />
        </div>
      </div>

      {/* Scale */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-medium text-muted-foreground">Scale</label>
          <button
            onClick={() => setLinkScale(!linkScale)}
            className={cn(
              "p-1 rounded transition-colors",
              linkScale 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={linkScale ? "Unlink scale" : "Link scale"}
          >
            {linkScale ? <Link2 className="w-3 h-3" /> : <Link2Off className="w-3 h-3" />}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">X</span>
            <Slider
              value={[transform.scaleX]}
              onValueChange={([value]) => handleScaleXChange(value)}
              min={0.1}
              max={3}
              step={0.1}
              disabled={disabled}
            />
            <span className="text-[10px] text-muted-foreground/70 text-center block">
              {transform.scaleX.toFixed(1)}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground">Y</span>
            <Slider
              value={[transform.scaleY]}
              onValueChange={([value]) => handleScaleYChange(value)}
              min={0.1}
              max={3}
              step={0.1}
              disabled={disabled}
            />
            <span className="text-[10px] text-muted-foreground/70 text-center block">
              {transform.scaleY.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Anchor Point Grid */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-medium text-muted-foreground">Anchor Point</label>
        <div className="inline-grid grid-cols-3 gap-1 p-1.5 bg-muted/30 rounded-lg">
          {ANCHOR_POINTS.map((row, rowIndex) => (
            row.map((anchor) => (
              <button
                key={anchor}
                onClick={() => onChange({ anchor })}
                disabled={disabled}
                className={cn(
                  "w-5 h-5 rounded-sm transition-all duration-150 flex items-center justify-center",
                  transform.anchor === anchor
                    ? "bg-primary shadow-sm"
                    : "bg-muted hover:bg-muted-foreground/20"
                )}
                aria-label={`Set anchor to ${anchor}`}
                aria-pressed={transform.anchor === anchor}
              >
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  transform.anchor === anchor ? "bg-primary-foreground" : "bg-muted-foreground/50"
                )} />
              </button>
            ))
          ))}
        </div>
      </div>
    </div>
  );
});

// Need to import React for useState
import React from 'react';

TransformControls.displayName = 'TransformControls';
