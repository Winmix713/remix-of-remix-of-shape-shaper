/**
 * KeyboardShortcutsModal Component
 * 
 * A modal dialog displaying all available keyboard shortcuts organized by category.
 * Provides a searchable, categorized reference for users.
 */

import { memo, useState, useMemo, type FC } from 'react';
import { X, Search, Keyboard } from 'lucide-react';
import { 
  SHORTCUTS, 
  formatKeyCombo, 
  getShortcutsByCategory, 
  CATEGORY_LABELS,
  type ShortcutAction 
} from '@/hooks/useKeyboardShortcuts';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// ============================================================================
// Types
// ============================================================================

interface KeyboardShortcutsModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Individual shortcut row display
 */
const ShortcutRow = memo<{ shortcut: ShortcutAction }>(({ shortcut }) => (
  <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group">
    <div className="flex flex-col">
      <span className="text-sm font-medium text-foreground">
        {shortcut.label}
      </span>
      <span className="text-xs text-muted-foreground">
        {shortcut.description}
      </span>
    </div>
    <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono text-muted-foreground group-hover:border-primary/30 transition-colors">
      {formatKeyCombo(shortcut.keys)}
    </kbd>
  </div>
));

ShortcutRow.displayName = 'ShortcutRow';

/**
 * Category section with shortcuts
 */
const CategorySection = memo<{ 
  category: string; 
  shortcuts: ShortcutAction[];
  searchQuery: string;
}>(({ category, shortcuts, searchQuery }) => {
  const filteredShortcuts = useMemo(() => {
    if (!searchQuery) return shortcuts;
    
    const query = searchQuery.toLowerCase();
    return shortcuts.filter(
      s => 
        s.label.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.keys.toLowerCase().includes(query)
    );
  }, [shortcuts, searchQuery]);
  
  if (filteredShortcuts.length === 0) return null;
  
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
        {CATEGORY_LABELS[category] || category}
      </h3>
      <div className="space-y-0.5">
        {filteredShortcuts.map(shortcut => (
          <ShortcutRow key={shortcut.id} shortcut={shortcut} />
        ))}
      </div>
    </div>
  );
});

CategorySection.displayName = 'CategorySection';

// ============================================================================
// Main Component
// ============================================================================

export const KeyboardShortcutsModal: FC<KeyboardShortcutsModalProps> = memo(({
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const shortcutsByCategory = useMemo(() => getShortcutsByCategory(), []);
  
  const categoryOrder = ['general', 'layers', 'canvas', 'tools', 'edit'];
  
  const hasResults = useMemo(() => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return SHORTCUTS.some(
      s => 
        s.label.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.keys.toLowerCase().includes(query)
    );
  }, [searchQuery]);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        {/* Search Input */}
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shortcuts..."
            className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-background rounded"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
        
        {/* Shortcuts List */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 -mr-2">
          {hasResults ? (
            categoryOrder.map(category => (
              shortcutsByCategory[category] && (
                <CategorySection
                  key={category}
                  category={category}
                  shortcuts={shortcutsByCategory[category]}
                  searchQuery={searchQuery}
                />
              )
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                No shortcuts found for "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
        
        {/* Footer Tip */}
        <div className="shrink-0 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[10px] font-mono mx-1">Ctrl+/</kbd> to toggle this panel
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
});

KeyboardShortcutsModal.displayName = 'KeyboardShortcutsModal';

export default KeyboardShortcutsModal;
