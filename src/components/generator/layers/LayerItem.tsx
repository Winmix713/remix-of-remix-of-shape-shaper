import { memo, useState, useCallback } from 'react';
import { Eye, EyeOff, Lock, Unlock, GripVertical, Trash2, Copy, Square, Image, Type, Folder } from 'lucide-react';
import { Layer } from '@/types/layers';
import { cn } from '@/lib/utils';

interface LayerItemProps {
  layer: Layer;
  isSelected: boolean;
  isDragging?: boolean;
  onSelect: (layerId: string) => void;
  onToggleVisibility: (layerId: string) => void;
  onToggleLock: (layerId: string) => void;
  onDuplicate: (layerId: string) => void;
  onRemove: (layerId: string) => void;
  onRename: (layerId: string, newName: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  index: number;
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
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDuplicate,
  onRemove,
  onRename,
  onDragStart,
  onDragOver,
  onDragEnd,
  index,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);

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

  return (
    <div
      draggable={!layer.locked}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(layer.id)}
      className={cn(
        "group flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-150 cursor-pointer",
        isSelected 
          ? "bg-primary/10 border border-primary/30" 
          : "hover:bg-muted/50 border border-transparent",
        isDragging && "opacity-50 scale-95",
        !layer.visible && "opacity-50"
      )}
      role="listitem"
      aria-selected={isSelected}
      aria-label={`Layer: ${layer.name}`}
    >
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
          layer.locked && "text-amber-500"
        )}
        aria-label={layer.locked ? "Unlock layer" : "Lock layer"}
      >
        {layer.locked ? (
          <Lock className="w-3.5 h-3.5" />
        ) : (
          <Unlock className="w-3.5 h-3.5" />
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
  );
});

LayerItem.displayName = 'LayerItem';
