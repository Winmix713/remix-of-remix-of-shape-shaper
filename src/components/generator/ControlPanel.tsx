/**
 * ControlPanel Component
 * 
 * A comprehensive control panel for managing superellipse shape configurations.
 * Provides tabbed interface for different aspects of shape customization including
 * shape parameters, colors, effects, presets, and export options.
 * 
 * Features:
 * - 8 category tabs (Shape, Color, Glow, Effects, Assets, Presets, CSS, Export)
 * - Keyboard navigation support (Arrow keys)
 * - Conditional reset button based on category
 * - Responsive design with mobile optimization
 * - Full accessibility (ARIA, semantic HTML, focus management)
 * - Performance optimized with memoization
 * - Custom scrollbar styling
 * 
 * @example
 * ```tsx
 * <ControlPanel
 *   state={superellipseState}
 *   updateState={handleUpdate}
 *   updateGradientStop={handleGradientUpdate}
 *   resetState={handleReset}
 *   loadState={handleLoad}
 *   pathData={svgPath}
 *   theme="dark"
 *   onThemeChange={handleThemeChange}
 * />
 * ```
 */

import { 
  useState, 
  useMemo, 
  useCallback, 
  useRef,
  useEffect,
  type FC,
  type KeyboardEvent 
} from 'react';
import { Code2 } from 'lucide-react';
import { 
  Square, 
  Droplet, 
  Sparkles, 
  Zap, 
  Save, 
  Download, 
  Code, 
  RotateCcw, 
  Image 
} from 'lucide-react';
import { SuperellipseState, GradientStop } from '../../hooks/useSuperellipse';
import { ShapeTab } from './tabs/ShapeTab';
import { ColorTab } from './tabs/ColorTab';
import { GlowTab } from './tabs/GlowTab';
import { EffectsTab } from './tabs/EffectsTab';
import { PresetsTab } from './tabs/PresetsTab';
import { ExportTab } from './tabs/ExportTab';
import { CssTab } from './tabs/CssTab';
import { AssetsTab } from './tabs/AssetsTab';
import { QuickPresetsGrid } from './QuickPresetsGrid';
import { ExportCodeModal } from './modals/ExportCodeModal';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface ControlPanelProps {
  /** Current superellipse state */
  state: SuperellipseState;
  /** Update state callback */
  updateState: (updates: Partial<SuperellipseState>) => void;
  /** Update gradient stop callback */
  updateGradientStop: (index: number, updates: Partial<GradientStop>) => void;
  /** Reset state to defaults */
  resetState: () => void;
  /** Load complete state */
  loadState: (state: SuperellipseState) => void;
  /** Optional randomize glow callback */
  randomizeGlow?: () => void;
  /** Generated SVG path data */
  pathData: string;
  /** Current theme mode */
  theme: 'light' | 'dark';
  /** Theme change callback */
  onThemeChange: (theme: 'light' | 'dark') => void;
}

/** Available category identifiers */
type CategoryId = 'shape' | 'color' | 'glow' | 'effects' | 'assets' | 'presets' | 'css' | 'export';

/** Category configuration */
interface Category {
  /** Unique category identifier */
  id: CategoryId;
  /** Icon component to display */
  icon: React.ReactNode;
  /** Short label text */
  label: string;
  /** Full title for header */
  title: string;
  /** Descriptive text */
  description: string;
  /** Whether to show reset button for this category */
  showReset: boolean;
  /** Optional keyboard shortcut */
  shortcut?: string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Category configuration array
 * Defines all available tabs with their properties
 */
const CATEGORIES: readonly Category[] = [
  { 
    id: 'shape', 
    icon: <Square className="w-3.5 h-3.5" aria-hidden="true" />, 
    label: 'Shape', 
    title: 'Shape & Size',
    description: 'Adjust shape parameters and dimensions',
    showReset: true,
    shortcut: '1',
  },
  { 
    id: 'color', 
    icon: <Droplet className="w-3.5 h-3.5" aria-hidden="true" />, 
    label: 'Color', 
    title: 'Color & Fill',
    description: 'Configure colors and gradients',
    showReset: true,
    shortcut: '2',
  },
  { 
    id: 'glow', 
    icon: <Zap className="w-3.5 h-3.5" aria-hidden="true" />, 
    label: 'Glow', 
    title: 'Glow Effect',
    description: 'Add and customize glow effects',
    showReset: true,
    shortcut: '3',
  },
  { 
    id: 'effects', 
    icon: <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />, 
    label: 'Effects', 
    title: 'Effects & Stroke',
    description: 'Apply additional visual effects',
    showReset: true,
    shortcut: '4',
  },
  { 
    id: 'assets', 
    icon: <Image className="w-3.5 h-3.5" aria-hidden="true" />, 
    label: 'Assets', 
    title: 'Asset Library',
    description: 'Upload and manage images',
    showReset: false,
    shortcut: '5',
  },
  { 
    id: 'presets', 
    icon: <Save className="w-3.5 h-3.5" aria-hidden="true" />, 
    label: 'Presets', 
    title: 'Presets & Config',
    description: 'Save and load preset configurations',
    showReset: false,
    shortcut: '6',
  },
  { 
    id: 'css',
    icon: <Code className="w-3.5 h-3.5" aria-hidden="true" />, 
    label: 'CSS', 
    title: 'CSS Export',
    description: 'Generate CSS code for your shape',
    showReset: false,
    shortcut: '7',
  },
  { 
    id: 'export', 
    icon: <Download className="w-3.5 h-3.5" aria-hidden="true" />, 
    label: 'Export', 
    title: 'Export & Download',
    description: 'Download your creation',
    showReset: false,
    shortcut: '8',
  },
] as const;

/** Default active category */
const DEFAULT_CATEGORY: CategoryId = 'glow';

/** Scroll behavior for tab changes */
const SCROLL_OPTIONS: ScrollIntoViewOptions = {
  behavior: 'smooth',
  block: 'nearest',
  inline: 'center',
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validates if a category ID is valid
 */
const isValidCategoryId = (id: string): id is CategoryId => {
  return CATEGORIES.some(cat => cat.id === id);
};

/**
 * Gets category by ID safely
 */
const getCategoryById = (id: CategoryId): Category | undefined => {
  return CATEGORIES.find(cat => cat.id === id);
};

/**
 * Gets category index by ID
 */
const getCategoryIndex = (id: CategoryId): number => {
  return CATEGORIES.findIndex(cat => cat.id === id);
};

// ============================================================================
// Main Component
// ============================================================================

export const ControlPanel: FC<ControlPanelProps> = ({
  state,
  updateState,
  updateGradientStop,
  resetState,
  loadState,
  randomizeGlow,
  pathData,
  theme,
  onThemeChange,
}) => {
  // ========================================================================
  // State Management
  // ========================================================================
  
  const [activeCategory, setActiveCategory] = useState<CategoryId>(DEFAULT_CATEGORY);
  const [showExportModal, setShowExportModal] = useState(false);
  const tabButtonRefs = useRef<Map<CategoryId, HTMLButtonElement>>(new Map());
  const isComponentMounted = useRef(true);

  // ========================================================================
  // Memoized Values
  // ========================================================================

  /**
   * Current category configuration
   * Memoized to avoid recalculation
   */
  const currentCategory = useMemo(
    () => getCategoryById(activeCategory),
    [activeCategory]
  );

  /**
   * Current category index for navigation
   */
  const currentCategoryIndex = useMemo(
    () => getCategoryIndex(activeCategory),
    [activeCategory]
  );

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Handle category change with validation and focus management
   */
  const handleCategoryChange = useCallback((categoryId: CategoryId) => {
    if (!isComponentMounted.current) return;
    if (!isValidCategoryId(categoryId)) {
      console.warn(`Invalid category ID: ${categoryId}`);
      return;
    }

    setActiveCategory(categoryId);

    // Focus the new tab button
    requestAnimationFrame(() => {
      const button = tabButtonRefs.current.get(categoryId);
      if (button) {
        button.focus();
        button.scrollIntoView(SCROLL_OPTIONS);
      }
    });
  }, []);

  /**
   * Handle keyboard navigation with arrow keys
   */
  const handleKeyboardNavigation = useCallback((
    e: KeyboardEvent<HTMLButtonElement>, 
    currentIndex: number
  ) => {
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        newIndex = Math.min(currentIndex + 1, CATEGORIES.length - 1);
        break;
      
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = Math.max(currentIndex - 1, 0);
        break;
      
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      
      case 'End':
        e.preventDefault();
        newIndex = CATEGORIES.length - 1;
        break;
      
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      handleCategoryChange(CATEGORIES[newIndex].id);
    }
  }, [handleCategoryChange]);

  /**
   * Handle reset with confirmation for safety
   */
  const handleReset = useCallback(() => {
    if (!isComponentMounted.current) return;

    // Optional: Add confirmation dialog
    const shouldReset = window.confirm(
      'Are you sure you want to reset to default values? This action cannot be undone.'
    );

    if (shouldReset) {
      resetState();
    }
  }, [resetState]);

  /**
   * Store tab button refs for focus management
   */
  const setTabButtonRef = useCallback((categoryId: CategoryId, element: HTMLButtonElement | null) => {
    if (element) {
      tabButtonRefs.current.set(categoryId, element);
    } else {
      tabButtonRefs.current.delete(categoryId);
    }
  }, []);

  // ========================================================================
  // Global Keyboard Shortcuts
  // ========================================================================

  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Number keys for category switching (1-8)
      const category = CATEGORIES.find(cat => cat.shortcut === e.key);
      if (category && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleCategoryChange(category.id);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleCategoryChange]);

  // ========================================================================
  // Cleanup
  // ========================================================================

  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
      tabButtonRefs.current.clear();
    };
  }, []);

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <aside 
      className="flex flex-col w-full lg:w-auto lg:max-w-md bg-white dark:bg-zinc-950 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-30 h-[50vh] lg:h-auto"
      role="complementary"
      aria-label="Superellipse control panel"
    >
      {/* Tab Navigation */}
      <nav 
        className="flex items-center gap-1 px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto shrink-0 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent"
        role="tablist"
        aria-label="Control categories"
      >
        {CATEGORIES.map((category, index) => {
          const isActive = activeCategory === category.id;
          
          return (
            <button
              key={category.id}
              ref={(el) => setTabButtonRef(category.id, el)}
              onClick={() => handleCategoryChange(category.id)}
              onKeyDown={(e) => handleKeyboardNavigation(e, index)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${category.id}`}
              id={`tab-${category.id}`}
              tabIndex={isActive ? 0 : -1}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium 
                whitespace-nowrap transition-all duration-200 ease-out
                focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-950
                ${isActive
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }
              `}
              title={`${category.description}${category.shortcut ? ` (Ctrl+${category.shortcut})` : ''}`}
              aria-label={`${category.label} tab${category.shortcut ? `, keyboard shortcut Ctrl+${category.shortcut}` : ''}`}
            >
              <span className="flex-shrink-0">{category.icon}</span>
              <span className="hidden sm:inline">{category.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Header with Title and Description */}
      {currentCategory && (
        <header 
          className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0"
          aria-live="polite"
        >
          <h2 
            className="text-sm font-semibold text-zinc-900 dark:text-white"
            id={`heading-${currentCategory.id}`}
          >
            {currentCategory.title}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {currentCategory.description}
          </p>
        </header>
      )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Scrollable Content */}
        <div 
          className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent hover:scrollbar-thumb-zinc-400 dark:hover:scrollbar-thumb-zinc-600"
          role="tabpanel"
          id={`panel-${activeCategory}`}
          aria-labelledby={`tab-${activeCategory}`}
          tabIndex={0}
        >
          {activeCategory === 'shape' && (
            <ShapeTab state={state} updateState={updateState} />
          )}
          {activeCategory === 'color' && (
            <ColorTab 
              state={state} 
              updateState={updateState} 
              updateGradientStop={updateGradientStop} 
            />
          )}
          {activeCategory === 'glow' && (
            <GlowTab 
              state={state} 
              updateState={updateState} 
              onRandomize={randomizeGlow}
              theme={theme}
              onThemeChange={onThemeChange}
            />
          )}
          {activeCategory === 'effects' && (
            <EffectsTab state={state} updateState={updateState} />
          )}
          {activeCategory === 'assets' && (
            <AssetsTab />
          )}
          {activeCategory === 'presets' && (
            <PresetsTab currentState={state} onLoadPreset={loadState} />
          )}
          {activeCategory === 'css' && (
            <CssTab state={state} theme={theme} />
          )}
          {activeCategory === 'export' && (
            <>
              <ExportTab state={state} pathData={pathData} />
              <div className="mt-4 pt-4 border-t border-border">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
                >
                  <Code2 className="w-4 h-4" />
                  Export Code (SVG/CSS/React/Vue)
                </button>
              </div>
            </>
          )}

          {/* Quick Presets - shown in Shape tab */}
          {activeCategory === 'shape' && (
            <div className="mt-6 pt-4 border-t border-border">
              <QuickPresetsGrid 
                currentState={state} 
                onApplyPreset={updateState} 
              />
            </div>
          )}
        </div>

        {/* Footer - Conditional Reset Button */}
        {currentCategory?.showReset && (
          <footer className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30 shrink-0">
            <button
              onClick={handleReset}
              className="
                group w-full h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 
                bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 
                font-medium text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 
                hover:border-zinc-400 dark:hover:border-zinc-600
                active:scale-[0.98] transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-950
                flex items-center justify-center gap-2
              "
              aria-label={`Reset ${currentCategory.label.toLowerCase()} settings to default values`}
              type="button"
            >
              <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" aria-hidden="true" />
              <span>Reset to Defaults</span>
            </button>
          </footer>
        )}
      </div>

      {/* Export Code Modal */}
      <ExportCodeModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        state={state}
        pathData={pathData}
      />
    </aside>
  );
};
