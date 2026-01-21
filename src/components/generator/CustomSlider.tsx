import { useEffect, useRef, useState } from 'react';

interface CustomSliderProps {
  label?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
  gradient?: string;
}

export const CustomSlider: React.FC<CustomSliderProps> = ({
  label,
  value = 0,
  min,
  max,
  step,
  onChange,
  unit = '',
  gradient,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const safeValue = typeof value === 'number' && !isNaN(value) ? value : min;
  const percentage = ((safeValue - min) / (max - min)) * 100;

  const handleDrag = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    let newValue = min + pct * (max - min);
    newValue = Math.round(newValue / step) * step;
    onChange(Math.max(min, Math.min(max, newValue)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleDrag(e.clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleDrag(e.clientX);
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  const displayValue = step < 1 
    ? safeValue.toFixed(String(step).split('.')[1]?.length || 2)
    : Math.round(safeValue);

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between items-center px-1">
          <label className="text-xs font-medium text-muted-foreground">
            {label}
          </label>
        </div>
      )}
      <div className="flex items-center gap-2">
        <div
          ref={trackRef}
          className="flex-1 h-9 bg-muted rounded-[10px] relative cursor-pointer transition-colors overflow-hidden"
          onMouseDown={handleMouseDown}
        >
          {/* Gradient background if provided */}
          {gradient && (
            <div 
              className="absolute inset-0 pointer-events-none opacity-80"
              style={{ background: gradient }}
            />
          )}
          
          {/* Fill */}
          <div
            className="absolute h-full bg-muted-foreground/20 rounded-l-[10px] transition-all pointer-events-none"
            style={{ width: `${percentage}%` }}
          />

          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-7 w-6 bg-background dark:bg-muted-foreground/30 rounded-lg shadow-md pointer-events-none transition-all"
            style={{ left: `calc(${percentage}% - 12px)` }}
          />
        </div>

        <div className="flex items-center justify-center min-w-[60px] h-9 px-2 bg-transparent border border-border rounded-[10px]">
          <span className="text-xs font-medium text-foreground">
            {displayValue}{unit}
          </span>
        </div>
      </div>
    </div>
  );
};