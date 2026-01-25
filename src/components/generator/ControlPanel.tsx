import { useState, useMemo, useCallback } from 'react';
import { Square, Droplet, Sparkles, Zap, Save, Download, Code, RotateCcw, Image } from 'lucide-react';
import { SuperellipseState, GradientStop } from '../../hooks/useSuperellipse';
import { ShapeTab } from './tabs/ShapeTab';
import { ColorTab } from './tabs/ColorTab';
import { GlowTab } from './tabs/GlowTab';
import { EffectsTab } from './tabs/EffectsTab';
import { PresetsTab } from './tabs/PresetsTab';
import { ExportTab } from './tabs/ExportTab';
import { CssTab } from './tabs/CssTab';
import { AssetsTab } from './tabs/AssetsTab';

interface ControlPanelProps {
  state: SuperellipseState;
  updateState: (updates: Partial<SuperellipseState>) => void;
  updateGradientStop: (index: number, updates: Partial<GradientStop>) => void;
  resetState: () => void;
  loadState: (state: SuperellipseState) => void;
  randomizeGlow?: () => void;
  pathData: string;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

type CategoryId = 'shape' | 'color' | 'glow' | 'effects' | 'assets' | 'presets' | 'css' | 'export';

interface Category {
  id: CategoryId;
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
  showReset: boolean;
}

const CATEGORIES: Category[] = [
  { 
    id: 'shape', 
    icon: <Square className="w-3.5 h-3.5" />, 
    label: 'Shape', 
    title: 'Shape & Size',
    description: 'Adjust shape parameters and dimensions',
    showReset: true
  },
  { 
    id: 'color', 
    icon: <Droplet className="w-3.5 h-3.5" />, 
    label: 'Color', 
    title: 'Color & Fill',
    description: 'Configure colors and gradients',
    showReset: true
  },
  { 
    id: 'glow', 
    icon: <Zap className="w-3.5 h-3.5" />, 
    label: 'Glow', 
    title: 'Glow Effect',
    description: 'Add and customize glow effects',
    showReset: true
  },
  { 
    id: 'effects', 
    icon: <Sparkles className="w-3.5 h-3.5" />, 
    label: 'Effects', 
    title: 'Effects & Stroke',
    description: 'Apply additional visual effects',
    showReset: true
  },
  { 
    id: 'assets', 
    icon: <Image className="w-3.5 h-3.5" />, 
    label: 'Assets', 
    title: 'Asset Library',
    description: 'Upload and manage images',
    showReset: false
  },
  { 
    id: 'presets', 
    icon: <Save className="w-3.5 h-3.5" />, 
    label: 'Presets', 
    title: 'Presets & Config',
    description: 'Save and load preset configurations',
    showReset: false
  },
  { 
    id: 'css',
    icon: <Code className="w-3.5 h-3.5" />, 
    label: 'CSS', 
    title: 'CSS Export',
    description: 'Generate CSS code for your shape',
    showReset: false
  },
  { 
    id: 'export', 
    icon: <Download className="w-3.5 h-3.5" />, 
    label: 'Export', 
    title: 'Export & Download',
    description: 'Download your creation',
    showReset: false
  },
];

export const ControlPanel: React.FC<ControlPanelProps> = ({
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
  const [activeCategory, setActiveCategory] = useState<CategoryId>('glow');

  // Memoize current category to avoid recalculation
  const currentCategory = useMemo(
    () => CATEGORIES.find(c => c.id === activeCategory),
    [activeCategory]
  );

  // Memoize category change handler
  const handleCategoryChange = useCallback((categoryId: CategoryId) => {
    setActiveCategory(categoryId);
  }, []);

  // Keyboard navigation support
  const handleKeyboardNavigation = useCallback((e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'ArrowRight' && currentIndex < CATEGORIES.length - 1) {
      setActiveCategory(CATEGORIES[currentIndex + 1].id);
    } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
      setActiveCategory(CATEGORIES[currentIndex - 1].id);
    }
  }, []);

  return (
    <aside 
      className="flex flex-col w-full lg:w-auto lg:max-w-md bg-white dark:bg-zinc-950 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-30 h-[50vh] lg:h-auto"
      role="complementary"
      aria-label="Control panel"
    >
      {/* Tab Navigation */}
      <nav 
        className="flex items-center gap-1 px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto shrink-0 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700"
        role="tablist"
        aria-label="Control categories"
      >
        {CATEGORIES.map((category, index) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              onKeyDown={(e) => handleKeyboardNavigation(e, index)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${category.id}`}
              tabIndex={isActive ? 0 : -1}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium 
                whitespace-nowrap transition-all duration-200 ease-out
                focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 focus:ring-offset-2
                ${isActive
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }
              `}
              title={category.description}
            >
              <span className="flex-shrink-0">{category.icon}</span>
              <span className="hidden sm:inline">{category.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Header with Title and Description */}
      {currentCategory && (
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            {currentCategory.title}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {currentCategory.description}
          </p>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Scrollable Content */}
        <div 
          className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700"
          role="tabpanel"
          id={`panel-${activeCategory}`}
          aria-labelledby={activeCategory}
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
            <ExportTab state={state} pathData={pathData} />
          )}
        </div>

        {/* Footer - Reset Button */}
        {currentCategory?.showReset && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30 shrink-0">
            <button
              onClick={resetState}
              className="
                group w-full h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 
                bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 
                font-medium text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 
                hover:border-zinc-400 dark:hover:border-zinc-600
                active:scale-[0.98] transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 focus:ring-offset-2
                flex items-center justify-center gap-2
              "
              aria-label="Reset current settings to default values"
            >
              <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              <span>Reset to Defaults</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
