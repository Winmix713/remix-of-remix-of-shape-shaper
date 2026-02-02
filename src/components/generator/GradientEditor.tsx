/**
 * GradientEditor Component
 * 
 * A visual gradient editor with draggable color stops, angle control,
 * center position picker for radial gradients, and gradient presets.
 */

import { memo, useState, useCallback, useMemo, useRef, type FC, type MouseEvent as ReactMouseEvent } from 'react';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import { GradientStop } from '@/hooks/useSuperellipse';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface GradientEditorProps {
  stops: GradientStop[];
  angle: number;
  type: 'linear' | 'radial' | 'conic';
  onStopsChange: (stops: GradientStop[]) => void;
  onAngleChange: (angle: number) => void;
  disabled?: boolean;
}

interface GradientPreset {
  id: string;
  name: string;
  stops: GradientStop[];
}

// ============================================================================
// Presets
// ============================================================================

const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: 'sunset',
    name: 'Sunset',
    stops: [
      { color: '#FF6B6B', position: 0 },
      { color: '#FFE66D', position: 50 },
      { color: '#4ECDC4', position: 100 },
    ],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    stops: [
      { color: '#667EEA', position: 0 },
      { color: '#764BA2', position: 100 },
    ],
  },
  {
    id: 'forest',
    name: 'Forest',
    stops: [
      { color: '#134E5E', position: 0 },
      { color: '#71B280', position: 100 },
    ],
  },
  {
    id: 'fire',
    name: 'Fire',
    stops: [
      { color: '#FF0844', position: 0 },
      { color: '#FFB199', position: 100 },
    ],
  },
  {
    id: 'cosmic',
    name: 'Cosmic',
    stops: [
      { color: '#0F2027', position: 0 },
      { color: '#203A43', position: 50 },
      { color: '#2C5364', position: 100 },
    ],
  },
  {
    id: 'aurora',
    name: 'Aurora',
    stops: [
      { color: '#00C9FF', position: 0 },
      { color: '#92FE9D', position: 100 },
    ],
  },
];

// ============================================================================
// Color Stop Component
// ============================================================================

interface ColorStopHandleProps {
  stop: GradientStop;
  index: number;
  isActive: boolean;
  canDelete: boolean;
  onSelect: () => void;
  onPositionChange: (position: number) => void;
  onColorChange: (color: string) => void;
  onDelete: () => void;
}

const ColorStopHandle: FC<ColorStopHandleProps> = memo(({
  stop,
  index,
  isActive,
  canDelete,
  onSelect,
  onPositionChange,
  onColorChange,
  onDelete,
}) => {
  const handleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: ReactMouseEvent) => {
    e.preventDefault();
    onSelect();
    setIsDragging(true);

    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const parent = handleRef.current?.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const position = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      onPositionChange(Math.max(0, Math.min(100, Math.round(position))));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onSelect, onPositionChange]);

  return (
    <div
      ref={handleRef}
      className={cn(
        "absolute top-0 -translate-x-1/2 cursor-grab active:cursor-grabbing transition-transform",
        isDragging && "scale-110 z-10",
        isActive && "z-10"
      )}
      style={{ left: `${stop.position}%` }}
      onMouseDown={handleMouseDown}
    >
      {/* Color swatch */}
      <div
        className={cn(
          "w-4 h-4 rounded-full border-2 shadow-lg transition-all",
          isActive ? "border-primary ring-2 ring-primary/30" : "border-background"
        )}
        style={{ backgroundColor: stop.color }}
      />
      
      {/* Position indicator */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-muted-foreground/30" />
      
      {/* Controls when active */}
      {isActive && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-fade-in">
          <input
            type="color"
            value={stop.color}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-6 h-6 rounded cursor-pointer border border-border"
            onClick={(e) => e.stopPropagation()}
          />
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-0.5 hover:bg-destructive/10 rounded"
            >
              <Trash2 className="w-3 h-3 text-destructive" />
            </button>
          )}
        </div>
      )}
    </div>
  );
});

ColorStopHandle.displayName = 'ColorStopHandle';

// ============================================================================
// Angle Wheel Component
// ============================================================================

interface AngleWheelProps {
  angle: number;
  onChange: (angle: number) => void;
  disabled?: boolean;
}

const AngleWheel: FC<AngleWheelProps> = memo(({ angle, onChange, disabled }) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: ReactMouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);

    const updateAngle = (clientX: number, clientY: number) => {
      const wheel = wheelRef.current;
      if (!wheel) return;

      const rect = wheel.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const radians = Math.atan2(clientY - centerY, clientX - centerX);
      let degrees = (radians * 180) / Math.PI + 90;
      if (degrees < 0) degrees += 360;
      
      onChange(Math.round(degrees) % 360);
    };

    updateAngle(e.clientX, e.clientY);

    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      updateAngle(moveEvent.clientX, moveEvent.clientY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onChange, disabled]);

  return (
    <div className="flex items-center gap-3">
      <div
        ref={wheelRef}
        className={cn(
          "relative w-12 h-12 rounded-full border-2 border-border bg-muted cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onMouseDown={handleMouseDown}
      >
        {/* Angle indicator line */}
        <div
          className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-primary origin-left"
          style={{ transform: `rotate(${angle - 90}deg)` }}
        />
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
      </div>
      
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={angle}
          onChange={(e) => onChange(Math.max(0, Math.min(360, parseInt(e.target.value) || 0)))}
          min={0}
          max={360}
          className="w-14 px-2 py-1 bg-muted border border-border rounded text-xs font-mono text-center"
          disabled={disabled}
        />
        <span className="text-xs text-muted-foreground">°</span>
      </div>
    </div>
  );
});

AngleWheel.displayName = 'AngleWheel';

// ============================================================================
// Main Component
// ============================================================================

export const GradientEditor: FC<GradientEditorProps> = memo(({
  stops,
  angle,
  type,
  onStopsChange,
  onAngleChange,
  disabled = false,
}) => {
  const [activeStopIndex, setActiveStopIndex] = useState<number | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Generate gradient CSS for preview
  const gradientCSS = useMemo(() => {
    const stopsCSS = stops
      .slice()
      .sort((a, b) => a.position - b.position)
      .map(s => `${s.color} ${s.position}%`)
      .join(', ');

    switch (type) {
      case 'linear':
        return `linear-gradient(${angle}deg, ${stopsCSS})`;
      case 'radial':
        return `radial-gradient(circle, ${stopsCSS})`;
      case 'conic':
        return `conic-gradient(from ${angle}deg, ${stopsCSS})`;
      default:
        return stopsCSS;
    }
  }, [stops, angle, type]);

  // Add new stop by clicking on the bar
  const handleBarClick = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    const bar = barRef.current;
    if (!bar) return;
    
    // Ignore clicks on handles
    if ((e.target as HTMLElement).closest('[data-stop-handle]')) return;

    const rect = bar.getBoundingClientRect();
    const position = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    
    // Find adjacent colors to interpolate
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    let leftStop = sortedStops[0];
    let rightStop = sortedStops[sortedStops.length - 1];
    
    for (let i = 0; i < sortedStops.length - 1; i++) {
      if (sortedStops[i].position <= position && sortedStops[i + 1].position >= position) {
        leftStop = sortedStops[i];
        rightStop = sortedStops[i + 1];
        break;
      }
    }

    const newStop: GradientStop = {
      color: leftStop.color,
      position,
    };

    const newStops = [...stops, newStop];
    onStopsChange(newStops);
    setActiveStopIndex(newStops.length - 1);
  }, [stops, onStopsChange, disabled]);

  // Update stop position
  const handlePositionChange = useCallback((index: number, position: number) => {
    const newStops = [...stops];
    newStops[index] = { ...newStops[index], position };
    onStopsChange(newStops);
  }, [stops, onStopsChange]);

  // Update stop color
  const handleColorChange = useCallback((index: number, color: string) => {
    const newStops = [...stops];
    newStops[index] = { ...newStops[index], color };
    onStopsChange(newStops);
  }, [stops, onStopsChange]);

  // Delete stop
  const handleDeleteStop = useCallback((index: number) => {
    if (stops.length <= 2) return;
    const newStops = stops.filter((_, i) => i !== index);
    onStopsChange(newStops);
    setActiveStopIndex(null);
  }, [stops, onStopsChange]);

  // Apply preset
  const applyPreset = useCallback((preset: GradientPreset) => {
    onStopsChange([...preset.stops]);
    setActiveStopIndex(null);
  }, [onStopsChange]);

  // Reset to default
  const resetGradient = useCallback(() => {
    onStopsChange([
      { color: '#FFFFFF', position: 0 },
      { color: '#000000', position: 100 },
    ]);
    onAngleChange(90);
    setActiveStopIndex(null);
  }, [onStopsChange, onAngleChange]);

  return (
    <div className={cn("space-y-4", disabled && "opacity-50 pointer-events-none")}>
      {/* Gradient Preview Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Gradient</span>
          <button
            onClick={resetGradient}
            className="p-1 hover:bg-muted rounded transition-colors"
            title="Reset gradient"
          >
            <RotateCcw className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
        
        <div
          ref={barRef}
          className="relative h-8 rounded-lg border border-border cursor-crosshair overflow-visible"
          style={{ background: gradientCSS }}
          onClick={handleBarClick}
        >
          {/* Color Stop Handles */}
          <div className="absolute inset-x-0 -top-1 h-6">
            {stops.map((stop, index) => (
              <div key={index} data-stop-handle>
                <ColorStopHandle
                  stop={stop}
                  index={index}
                  isActive={activeStopIndex === index}
                  canDelete={stops.length > 2}
                  onSelect={() => setActiveStopIndex(index)}
                  onPositionChange={(pos) => handlePositionChange(index, pos)}
                  onColorChange={(color) => handleColorChange(index, color)}
                  onDelete={() => handleDeleteStop(index)}
                />
              </div>
            ))}
          </div>
        </div>
        
        <p className="text-[9px] text-muted-foreground text-center">
          Click on bar to add stops • Drag to reposition
        </p>
      </div>

      {/* Angle Control (for linear/conic) */}
      {(type === 'linear' || type === 'conic') && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">
            {type === 'linear' ? 'Direction' : 'Start Angle'}
          </span>
          <AngleWheel angle={angle} onChange={onAngleChange} disabled={disabled} />
        </div>
      )}

      {/* Presets */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground">Presets</span>
        <div className="grid grid-cols-3 gap-2">
          {GRADIENT_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="group relative h-8 rounded-md border border-border overflow-hidden hover:ring-2 hover:ring-primary/30 transition-all"
              style={{
                background: `linear-gradient(90deg, ${preset.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`,
              }}
              title={preset.name}
            >
              <span className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-medium">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stop List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Color Stops ({stops.length})
          </span>
          <button
            onClick={() => {
              const newStop = { color: '#888888', position: 50 };
              onStopsChange([...stops, newStop]);
            }}
            className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>
        
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {stops
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((stop, sortedIndex) => {
              const originalIndex = stops.findIndex(s => s === stop);
              return (
                <div
                  key={originalIndex}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md border transition-colors cursor-pointer",
                    activeStopIndex === originalIndex
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-muted/50"
                  )}
                  onClick={() => setActiveStopIndex(originalIndex)}
                >
                  <div
                    className="w-5 h-5 rounded-full border border-border flex-shrink-0"
                    style={{ backgroundColor: stop.color }}
                  />
                  <input
                    type="text"
                    value={stop.color.toUpperCase()}
                    onChange={(e) => {
                      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                        handleColorChange(originalIndex, e.target.value);
                      }
                    }}
                    className="flex-1 px-1.5 py-0.5 bg-muted border border-border rounded text-[10px] font-mono uppercase"
                    maxLength={7}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <input
                    type="number"
                    value={stop.position}
                    onChange={(e) => handlePositionChange(originalIndex, Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                    min={0}
                    max={100}
                    className="w-12 px-1.5 py-0.5 bg-muted border border-border rounded text-[10px] font-mono text-right"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-[10px] text-muted-foreground">%</span>
                  {stops.length > 2 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStop(originalIndex);
                      }}
                      className="p-0.5 hover:bg-destructive/10 rounded"
                    >
                      <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
});

GradientEditor.displayName = 'GradientEditor';

export default GradientEditor;