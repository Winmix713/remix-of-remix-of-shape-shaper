import { memo, useState, useCallback } from 'react';
import { Eye, EyeOff, Lock, Unlock, GripVertical, Trash2, Copy, Square, Image, Type, Folder, Volume2, VolumeX } from 'lucide-react';
import { Layer } from '@/types/layers';
import { cn } from '@/lib/utils';
import { LayerContextMenu } from './LayerContextMenu';
import { Slider } from '@/components/ui/slider';

interface LayerItemProps {
  layer: Layer;
  isSelected: boolean;
  isDragging?: boolean;
  index: number;
  totalLayers: number;
  onSelect: (layerId: string) => void;
  onToggleVisibility: (layerId: string) => void;
  onToggleLock: (layerId: string) => void;
  onToggleSolo: (layerId: string) => void;
  onDuplicate: (layerId: string) => void;
  onRemove: (layerId: string) => void;
  onRename: (layerId: string, newName: string) => void;
  onSetOpacity: (layerId: string, opacity: number) => void;
  onMoveLayer: (layerId: string, direction: 'up' | 'down') => void;
  onMoveToIndex: (layerId: string, newIndex: number) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
}

const LAYER_TYPE_ICONS = {
  shape: Square,
  image: Image,
  text: Type,
  group: Folder,
};

export const LayerItem = memo<LayerItemProps>(({
  layer,
  isSelected,
  isDragging,
  index,
  totalLayers,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onToggleSolo,
  onDuplicate,
  onRemove,
  onRename,
  onSetOpacity,
  onMoveLayer,
  onMoveToIndex,
  onDragStart,
  onDragOver,
  onDragEnd,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);
  const [showOpacity, setShowOpacity] = useState(false);

  const TypeIcon = LAYER_TYPE_ICONS[layer.type];

  const handleDoubleClick = useCallback(() => {
    if (!layer.locked) {
      setIsEditing(true);
      setEditName(layer.name);
    }
  }, [layer.locked, layer.name]);

  const handleNameSubmit = useCallback(() => {
    if (editName.trim() && editName !== layer.name) {
      onRename(layer.id, editName.trim());
    }
    setIsEditing(false);
  }, [editName, layer.id, layer.name, onRename]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setEditName(layer.name);
      setIsEditing(false);
    }
  }, [handleNameSubmit, layer.name]);

  const layerContent = (
    <div
      draggable={!layer.locked}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(layer.id)}
      onMouseEnter={() => setShowOpacity(true)}
      onMouseLeave={() => setShowOpacity(false)}
      className={cn(
        "group flex flex-col gap-1 px-2 py-1.5 rounded-lg transition-all duration-150 cursor-pointer",
        isSelected 
          ? "bg-primary/10 border border-primary/30" 
          : "hover:bg-muted/50 border border-transparent",
        isDragging && "opacity-50 scale-95",
        !layer.visible && "opacity-50",
        layer.solo && "ring-1 ring-primary/50"
      )}
      role="listitem"
      aria-selected={isSelected}
      aria-label={`Layer: ${layer.name}`}
    >
      {/* Main Row */}
      <div className="flex items-center gap-2">
        {/* Drag Handle */}
        <div 
          className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          aria-hidden="true"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        {/* Visibility Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(layer.id);
          }}
          className="text-muted-foreground/70 hover:text-foreground transition-colors p-0.5"
          aria-label={layer.visible ? "Hide layer" : "Show layer"}
        >
          {layer.visible ? (
            <Eye className="w-3.5 h-3.5" />
          ) : (
            <EyeOff className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Lock Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock(layer.id);
          }}
          className={cn(
            "text-muted-foreground/70 hover:text-foreground transition-colors p-0.5",
            layer.locked && "text-primary"
          )}
          aria-label={layer.locked ? "Unlock layer" : "Lock layer"}
        >
          {layer.locked ? (
            <Lock className="w-3.5 h-3.5" />
          ) : (
            <Unlock className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Solo Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSolo(layer.id);
          }}
          className={cn(
            "text-muted-foreground/70 hover:text-foreground transition-colors p-0.5",
            layer.solo && "text-primary"
          )}
          aria-label={layer.solo ? "Unsolo layer" : "Solo layer"}
        >
          {layer.solo ? (
            <Volume2 className="w-3.5 h-3.5" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Type Icon */}
        <TypeIcon className="w-3.5 h-3.5 text-muted-foreground/70 flex-shrink-0" />

        {/* Layer Name */}
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 text-xs bg-background border border-primary/50 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-primary/30"
            aria-label="Edit layer name"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span 
            onDoubleClick={handleDoubleClick}
            className="flex-1 text-xs font-medium truncate select-none"
            title={layer.name}
          >
            {layer.name}
          </span>
        )}

        {/* Opacity Badge */}
        {layer.opacity < 100 && !showOpacity && (
          <span className="text-[9px] text-muted-foreground bg-muted px-1 rounded">
            {layer.opacity}%
          </span>
        )}

        {/* Action Buttons (visible on hover) */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(layer.id);
            }}
            className="p-1 text-muted-foreground/70 hover:text-foreground rounded hover:bg-muted/50 transition-colors"
            aria-label="Duplicate layer"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(layer.id);
            }}
            className="p-1 text-muted-foreground/70 hover:text-destructive rounded hover:bg-destructive/10 transition-colors"
            aria-label="Delete layer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Inline Opacity Slider (visible on hover when selected) */}
      {showOpacity && isSelected && !layer.locked && (
        <div 
          className="flex items-center gap-2 pl-6 pr-2 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[9px] text-muted-foreground w-8">Opacity</span>
          <Slider
            value={[layer.opacity]}
            onValueChange={([value]) => onSetOpacity(layer.id, value)}
            min={0}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-[9px] text-muted-foreground w-8 text-right">{layer.opacity}%</span>
        </div>
      )}
    </div>
  );

  return (
    <LayerContextMenu
      layer={layer}
      onDuplicate={() => onDuplicate(layer.id)}
      onDelete={() => onRemove(layer.id)}
      onToggleVisibility={() => onToggleVisibility(layer.id)}
      onToggleLock={() => onToggleLock(layer.id)}
      onMoveUp={() => onMoveLayer(layer.id, 'up')}
      onMoveDown={() => onMoveLayer(layer.id, 'down')}
      onMoveToTop={() => onMoveToIndex(layer.id, 0)}
      onMoveToBottom={() => onMoveToIndex(layer.id, totalLayers - 1)}
      isFirst={index === 0}
      isLast={index === totalLayers - 1}
    >
      {layerContent}
    </LayerContextMenu>
  );
});

LayerItem.displayName = 'LayerItem';
