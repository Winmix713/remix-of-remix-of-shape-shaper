import { memo, useState, useCallback } from 'react';
import { Plus, Layers, Square, Image, Type, ChevronDown, ChevronUp, Star, Clock, Search, BookOpen } from 'lucide-react';
import { Layer, LayerType, BlendMode, Transform } from '@/types/layers';
import { SuperellipseState } from '@/hooks/useSuperellipse';
import { LayerItem } from './LayerItem';
import { BlendModeSelector } from './BlendModeSelector';
import { TransformControls } from './TransformControls';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface LayerPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  selectedLayer: Layer | null;
  onSelectLayer: (layerId: string | null) => void;
  onAddLayer: (type: LayerType) => void;
  onRemoveLayer: (layerId: string) => void;
  onUpdateLayer: (layerId: string, updates: Partial<Layer>) => void;
  onDuplicateLayer: (layerId: string) => void;
  onToggleVisibility: (layerId: string) => void;
  onToggleLock: (layerId: string) => void;
  onToggleSolo: (layerId: string) => void;
  onReorderLayers: (startIndex: number, endIndex: number) => void;
  onMoveLayer: (layerId: string, direction: 'up' | 'down') => void;
  onMoveLayerToIndex: (layerId: string, newIndex: number) => void;
  onSetBlendMode: (layerId: string, blendMode: BlendMode) => void;
  onSetOpacity: (layerId: string, opacity: number) => void;
  onUpdateTransform: (layerId: string, transform: Partial<Transform>) => void;
  onApplyShapePreset?: (updates: Partial<SuperellipseState>) => void;
}

const ADD_LAYER_OPTIONS: { type: LayerType; label: string; icon: React.ElementType }[] = [
  { type: 'shape', label: 'Shape Layer', icon: Square },
  { type: 'image', label: 'Image Layer', icon: Image },
  { type: 'text', label: 'Text Layer', icon: Type },
];

const SHAPE_PRESETS: { name: string; n: string; icon: string; updates: Partial<SuperellipseState> }[] = [
  { name: 'Squircle iOS', n: '4.0', icon: '📱', updates: { exp: 4.0, width: 320, height: 320 } },
  { name: 'Hyperellipse', n: '2.8', icon: '⬮', updates: { exp: 2.8, width: 300, height: 300 } },
  { name: 'Soft Circle', n: '2.0', icon: '⚪', updates: { exp: 2.0, width: 280, height: 280 } },
  { name: 'Rounded Rect', n: '6.0', icon: '▢', updates: { exp: 6.0, width: 400, height: 300 } },
  { name: 'Diamond', n: '1.0', icon: '◇', updates: { exp: 1.0, width: 300, height: 300 } },
  { name: 'Pill', n: '10.0', icon: '💊', updates: { exp: 10.0, width: 400, height: 180 } },
  { name: 'Blob', n: '1.5', icon: '🫧', updates: { exp: 1.5, width: 320, height: 360 } },
];

export const LayerPanel = memo<LayerPanelProps>(({
  layers,
  selectedLayerId,
  selectedLayer,
  onSelectLayer,
  onAddLayer,
  onRemoveLayer,
  onUpdateLayer,
  onDuplicateLayer,
  onToggleVisibility,
  onToggleLock,
  onToggleSolo,
  onReorderLayers,
  onMoveLayer,
  onMoveLayerToIndex,
  onSetBlendMode,
  onSetOpacity,
  onUpdateTransform,
  onApplyShapePreset,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [propertiesOpen, setPropertiesOpen] = useState(true);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorderLayers(draggedIndex, index);
      setDraggedIndex(index);
    }
  }, [draggedIndex, onReorderLayers]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  const handleRename = useCallback((layerId: string, newName: string) => {
    onUpdateLayer(layerId, { name: newName });
  }, [onUpdateLayer]);

  const [activeTab, setActiveTab] = useState<'layers' | 'assets' | 'library'>('layers');
  const [librarySearch, setLibrarySearch] = useState('');

  return (
    <aside 
      className="w-60 bg-background border-r border-border flex flex-col h-full overflow-hidden"
      role="complementary"
      aria-label="Layer panel"
    >
      {/* Sidebar Tabs */}
      <div className="flex items-center border-b border-border shrink-0">
        {(['layers', 'assets', 'library'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 px-2 py-2 text-xs font-medium capitalize transition-colors",
              activeTab === tab
                ? "text-foreground bg-muted/50 border-b-2 border-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Library Tab */}
      {activeTab === 'library' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="px-3 py-2 border-b border-border">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-muted rounded-lg">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                placeholder="Search presets..."
                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin scrollbar-thumb-muted">
            {/* Favorites */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-xs font-semibold text-foreground">Favorites</span>
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">0</span>
              </div>
              <p className="text-[10px] text-muted-foreground/70 pl-5.5">No favorites yet</p>
            </div>

            {/* Recent */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">Recent</span>
              </div>
              <p className="text-[10px] text-muted-foreground/70 pl-5.5">No recent items</p>
            </div>

            {/* Shape Presets */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">Shapes</span>
              </div>
              <div className="space-y-1">
                {SHAPE_PRESETS
                .filter(s => !librarySearch || s.name.toLowerCase().includes(librarySearch.toLowerCase()))
                .map((shape) => (
                  <button
                    key={shape.name}
                    onClick={() => onApplyShapePreset?.(shape.updates)}
                    className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-left hover:bg-muted transition-colors group active:scale-[0.98]"
                    title={`Apply ${shape.name} preset (n=${shape.n})`}
                  >
                    <span className="text-sm">{shape.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{shape.name}</p>
                      <p className="text-[10px] text-muted-foreground">n={shape.n}</p>
                    </div>
                    <span className="text-[9px] text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity">Apply</span>
                  </button>
                ))}
              </div>
            </div>

            {/* New Preset */}
            <button className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg border border-dashed border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              New Preset
            </button>
          </div>
        </div>
      )}

      {/* Assets placeholder */}
      {activeTab === 'assets' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <Image className="w-8 h-8 text-muted-foreground/30 mb-2" />
          <p className="text-xs text-muted-foreground">Assets</p>
          <p className="text-[10px] text-muted-foreground/70 mt-1">Use the Assets tab in the control panel</p>
        </div>
      )}

      {/* Layers tab content */}
      {activeTab === 'layers' && (
      <>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Layers</h2>
          <span className="text-xs text-muted-foreground">({layers.length})</span>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
              aria-label="Add new layer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {ADD_LAYER_OPTIONS.map((option) => (
              <DropdownMenuItem 
                key={option.type}
                onClick={() => onAddLayer(option.type)}
                className="text-xs"
              >
                <option.icon className="w-3.5 h-3.5 mr-2" />
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Layer List */}
      <div 
        className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-muted"
        role="list"
        aria-label="Layers"
      >
        {layers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Layers className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">No layers yet</p>
            <p className="text-[10px] text-muted-foreground/70">Click + to add a layer</p>
          </div>
        ) : (
          layers.map((layer, index) => (
            <LayerItem
              key={layer.id}
              layer={layer}
              index={index}
              totalLayers={layers.length}
              isSelected={layer.id === selectedLayerId}
              isDragging={draggedIndex === index}
              onSelect={onSelectLayer}
              onToggleVisibility={onToggleVisibility}
              onToggleLock={onToggleLock}
              onToggleSolo={onToggleSolo}
              onDuplicate={onDuplicateLayer}
              onRemove={onRemoveLayer}
              onRename={handleRename}
              onSetOpacity={onSetOpacity}
              onMoveLayer={onMoveLayer}
              onMoveToIndex={onMoveLayerToIndex}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            />
          ))
        )}
      </div>

      {/* Selected Layer Properties */}
      {selectedLayer && (
        <Collapsible
          open={propertiesOpen}
          onOpenChange={setPropertiesOpen}
          className="border-t border-border shrink-0"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium hover:bg-muted/50 transition-colors">
            <span>Properties</span>
            {propertiesOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-3 pb-3 space-y-4">
              {/* Opacity */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-medium text-muted-foreground">Opacity</label>
                  <span className="text-[10px] text-muted-foreground">{selectedLayer.opacity}%</span>
                </div>
                <Slider
                  value={[selectedLayer.opacity]}
                  onValueChange={([value]) => onSetOpacity(selectedLayer.id, value)}
                  min={0}
                  max={100}
                  step={1}
                  disabled={selectedLayer.locked}
                />
              </div>

              {/* Blend Mode */}
              <BlendModeSelector
                value={selectedLayer.blendMode}
                onChange={(mode) => onSetBlendMode(selectedLayer.id, mode)}
                disabled={selectedLayer.locked}
              />

              {/* Transform Controls */}
              <TransformControls
                transform={selectedLayer.transform}
                onChange={(updates) => onUpdateTransform(selectedLayer.id, updates)}
                disabled={selectedLayer.locked}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
      </>
      )}
    </aside>
  );
});

LayerPanel.displayName = 'LayerPanel';
