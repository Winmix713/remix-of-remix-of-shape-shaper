/**
 * LayerContextMenu Component
 * 
 * Context menu for layer operations (right-click menu).
 */

import { memo, type FC, type ReactNode } from 'react';
import { 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  ArrowUp, 
  ArrowDown, 
  Layers,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Layer } from '@/types/layers';

// ============================================================================
// Types
// ============================================================================

interface LayerContextMenuProps {
  layer: Layer;
  children: ReactNode;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveToTop: () => void;
  onMoveToBottom: () => void;
  isFirst: boolean;
  isLast: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export const LayerContextMenu: FC<LayerContextMenuProps> = memo(({
  layer,
  children,
  onDuplicate,
  onDelete,
  onToggleVisibility,
  onToggleLock,
  onMoveUp,
  onMoveDown,
  onMoveToTop,
  onMoveToBottom,
  isFirst,
  isLast,
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {/* Visibility & Lock */}
        <ContextMenuItem onClick={onToggleVisibility}>
          {layer.visible ? (
            <>
              <EyeOff className="mr-2 h-4 w-4" />
              Hide Layer
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Show Layer
            </>
          )}
          <ContextMenuShortcut>Ctrl+H</ContextMenuShortcut>
        </ContextMenuItem>
        
        <ContextMenuItem onClick={onToggleLock}>
          {layer.locked ? (
            <>
              <Unlock className="mr-2 h-4 w-4" />
              Unlock Layer
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Lock Layer
            </>
          )}
          <ContextMenuShortcut>Ctrl+L</ContextMenuShortcut>
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        {/* Duplicate & Delete */}
        <ContextMenuItem onClick={onDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate Layer
          <ContextMenuShortcut>Ctrl+D</ContextMenuShortcut>
        </ContextMenuItem>
        
        <ContextMenuItem 
          onClick={onDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Layer
          <ContextMenuShortcut>Del</ContextMenuShortcut>
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        {/* Layer Order */}
        <ContextMenuItem onClick={onMoveUp} disabled={isFirst}>
          <ArrowUp className="mr-2 h-4 w-4" />
          Move Up
          <ContextMenuShortcut>]</ContextMenuShortcut>
        </ContextMenuItem>
        
        <ContextMenuItem onClick={onMoveDown} disabled={isLast}>
          <ArrowDown className="mr-2 h-4 w-4" />
          Move Down
          <ContextMenuShortcut>[</ContextMenuShortcut>
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={onMoveToTop} disabled={isFirst}>
          <ChevronUp className="mr-2 h-4 w-4" />
          Move to Top
        </ContextMenuItem>
        
        <ContextMenuItem onClick={onMoveToBottom} disabled={isLast}>
          <ChevronDown className="mr-2 h-4 w-4" />
          Move to Bottom
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
});

LayerContextMenu.displayName = 'LayerContextMenu';

export default LayerContextMenu;
