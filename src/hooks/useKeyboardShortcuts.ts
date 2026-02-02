/**
 * useKeyboardShortcuts Hook
 * 
 * A comprehensive keyboard shortcuts handler for the Superellipse Generator.
 * Provides global keyboard shortcuts for common actions with support for
 * customizable key bindings and modifier keys.
 */

import { useCallback, useEffect, useRef } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface ShortcutAction {
  /** Unique action identifier */
  id: string;
  /** Human-readable label */
  label: string;
  /** Key combination (e.g., 'ctrl+z', 'shift+delete') */
  keys: string;
  /** Category for grouping in help modal */
  category: 'general' | 'layers' | 'canvas' | 'tools' | 'edit';
  /** Description of the action */
  description: string;
  /** Whether the shortcut is enabled */
  enabled?: boolean;
}

export interface ShortcutHandlers {
  // General
  undo?: () => void;
  redo?: () => void;
  save?: () => void;
  openExport?: () => void;
  showShortcuts?: () => void;
  
  // Layers
  duplicateLayer?: () => void;
  deleteLayer?: () => void;
  moveLayerUp?: () => void;
  moveLayerDown?: () => void;
  toggleLayerVisibility?: () => void;
  toggleLayerLock?: () => void;
  groupLayers?: () => void;
  
  // Canvas
  zoomIn?: () => void;
  zoomOut?: () => void;
  zoomTo100?: () => void;
  fitToView?: () => void;
  toggleGrid?: () => void;
  
  // Tools
  selectTool?: () => void;
  moveTool?: () => void;
  
  // Edit
  selectAll?: () => void;
  deselectAll?: () => void;
  copy?: () => void;
  paste?: () => void;
}

export interface UseKeyboardShortcutsOptions {
  /** Whether shortcuts are enabled */
  enabled?: boolean;
  /** Handler callbacks for each action */
  handlers: ShortcutHandlers;
}

// ============================================================================
// Shortcut Registry
// ============================================================================

export const SHORTCUTS: ShortcutAction[] = [
  // General
  { id: 'undo', label: 'Undo', keys: 'ctrl+z', category: 'general', description: 'Undo last action' },
  { id: 'redo', label: 'Redo', keys: 'ctrl+shift+z', category: 'general', description: 'Redo last undone action' },
  { id: 'save', label: 'Save Preset', keys: 'ctrl+s', category: 'general', description: 'Save current state as preset' },
  { id: 'openExport', label: 'Export', keys: 'ctrl+e', category: 'general', description: 'Open export modal' },
  { id: 'showShortcuts', label: 'Show Shortcuts', keys: 'ctrl+/', category: 'general', description: 'Show keyboard shortcuts' },
  
  // Layers
  { id: 'duplicateLayer', label: 'Duplicate Layer', keys: 'ctrl+d', category: 'layers', description: 'Duplicate selected layer' },
  { id: 'deleteLayer', label: 'Delete Layer', keys: 'delete', category: 'layers', description: 'Delete selected layer' },
  { id: 'moveLayerUp', label: 'Move Layer Up', keys: ']', category: 'layers', description: 'Move layer up in stack' },
  { id: 'moveLayerDown', label: 'Move Layer Down', keys: '[', category: 'layers', description: 'Move layer down in stack' },
  { id: 'toggleLayerVisibility', label: 'Toggle Visibility', keys: 'ctrl+h', category: 'layers', description: 'Toggle layer visibility' },
  { id: 'toggleLayerLock', label: 'Toggle Lock', keys: 'ctrl+l', category: 'layers', description: 'Toggle layer lock' },
  { id: 'groupLayers', label: 'Group Layers', keys: 'ctrl+g', category: 'layers', description: 'Group selected layers' },
  
  // Canvas
  { id: 'zoomIn', label: 'Zoom In', keys: 'ctrl+=', category: 'canvas', description: 'Zoom in canvas' },
  { id: 'zoomOut', label: 'Zoom Out', keys: 'ctrl+-', category: 'canvas', description: 'Zoom out canvas' },
  { id: 'zoomTo100', label: 'Zoom to 100%', keys: 'ctrl+1', category: 'canvas', description: 'Reset zoom to 100%' },
  { id: 'fitToView', label: 'Fit to View', keys: 'ctrl+0', category: 'canvas', description: 'Fit canvas to view' },
  { id: 'toggleGrid', label: 'Toggle Grid', keys: 'g', category: 'canvas', description: 'Show/hide grid overlay' },
  
  // Tools
  { id: 'selectTool', label: 'Select Tool', keys: 'v', category: 'tools', description: 'Activate select tool' },
  { id: 'moveTool', label: 'Move Tool', keys: 'm', category: 'tools', description: 'Activate move tool' },
  
  // Edit
  { id: 'selectAll', label: 'Select All', keys: 'ctrl+a', category: 'edit', description: 'Select all layers' },
  { id: 'deselectAll', label: 'Deselect All', keys: 'escape', category: 'edit', description: 'Deselect all layers' },
  { id: 'copy', label: 'Copy', keys: 'ctrl+c', category: 'edit', description: 'Copy selected layer' },
  { id: 'paste', label: 'Paste', keys: 'ctrl+v', category: 'edit', description: 'Paste copied layer' },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parses a key combination string into normalized parts
 */
const parseKeyCombo = (keys: string): { ctrl: boolean; shift: boolean; alt: boolean; key: string } => {
  const parts = keys.toLowerCase().split('+');
  return {
    ctrl: parts.includes('ctrl') || parts.includes('cmd'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
    key: parts.filter(p => !['ctrl', 'cmd', 'shift', 'alt'].includes(p))[0] || '',
  };
};

/**
 * Checks if a keyboard event matches a key combination
 */
const matchesKeyCombo = (event: KeyboardEvent, combo: string): boolean => {
  const { ctrl, shift, alt, key } = parseKeyCombo(combo);
  const eventKey = event.key.toLowerCase();
  
  // Handle special keys
  const keyMatches = 
    eventKey === key ||
    (key === '=' && (eventKey === '=' || eventKey === '+')) ||
    (key === '-' && (eventKey === '-' || eventKey === '_')) ||
    (key === '/' && eventKey === '/') ||
    (key === 'delete' && (eventKey === 'delete' || eventKey === 'backspace'));
  
  const ctrlMatches = ctrl === (event.ctrlKey || event.metaKey);
  const shiftMatches = shift === event.shiftKey;
  const altMatches = alt === event.altKey;
  
  return keyMatches && ctrlMatches && shiftMatches && altMatches;
};

/**
 * Formats key combination for display
 */
export const formatKeyCombo = (keys: string): string => {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');
  
  return keys
    .split('+')
    .map(part => {
      const lower = part.toLowerCase();
      if (lower === 'ctrl') return isMac ? '⌘' : 'Ctrl';
      if (lower === 'shift') return isMac ? '⇧' : 'Shift';
      if (lower === 'alt') return isMac ? '⌥' : 'Alt';
      if (lower === 'delete') return isMac ? '⌫' : 'Del';
      if (lower === 'escape') return 'Esc';
      return part.toUpperCase();
    })
    .join(isMac ? '' : '+');
};

/**
 * Gets shortcuts grouped by category
 */
export const getShortcutsByCategory = (): Record<string, ShortcutAction[]> => {
  return SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutAction[]>);
};

/**
 * Category labels for display
 */
export const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  layers: 'Layers',
  canvas: 'Canvas',
  tools: 'Tools',
  edit: 'Edit',
};

// ============================================================================
// Main Hook
// ============================================================================

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions): void {
  const { enabled = true, handlers } = options;
  
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    // Ignore if user is typing in an input
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Allow Escape to work even in inputs
      if (event.key !== 'Escape') {
        return;
      }
    }
    
    const currentHandlers = handlersRef.current;
    
    // Check each shortcut
    for (const shortcut of SHORTCUTS) {
      if (matchesKeyCombo(event, shortcut.keys)) {
        const handler = currentHandlers[shortcut.id as keyof ShortcutHandlers];
        if (handler) {
          event.preventDefault();
          event.stopPropagation();
          handler();
          return;
        }
      }
    }
  }, [enabled]);
  
  useEffect(() => {
    if (!enabled) return;
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}

export default useKeyboardShortcuts;
