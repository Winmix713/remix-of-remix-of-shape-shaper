import { memo, type FC } from 'react';
import { InspectorState } from '@/types/editor';

interface InspectorOverlayProps {
  inspector: InspectorState;
  shapeWidth: number;
  shapeHeight: number;
  onHover: (element: string | null) => void;
  onSelect: (element: string | null, box: DOMRect | null) => void;
}

const InspectorOverlayInner: FC<InspectorOverlayProps> = ({
  inspector,
  shapeWidth,
  shapeHeight,
  onHover,
  onSelect,
}) => {
  if (!inspector.active) return null;

  return (
    <div
      className="absolute inset-0 z-30 cursor-crosshair"
      onMouseEnter={() => onHover('superellipse-shape')}
      onMouseLeave={() => onHover(null)}
      onClick={(e) => {
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        onSelect('superellipse-shape', rect);
      }}
      role="button"
      tabIndex={0}
      aria-label="Inspector overlay - click to select element"
    >
      {/* Hover highlight */}
      {inspector.hoveredElement && !inspector.selectedElement && (
        <div
          className="absolute inset-0 border-2 border-blue-500/60 rounded-lg pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Selection highlight */}
      {inspector.selectedElement && (
        <>
          <div
            className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none"
            aria-hidden="true"
          />
          {/* Dimension label */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-mono rounded whitespace-nowrap">
            {shapeWidth} × {shapeHeight}
          </div>
        </>
      )}
    </div>
  );
};

export const InspectorOverlay = memo(InspectorOverlayInner);
InspectorOverlay.displayName = 'InspectorOverlay';
