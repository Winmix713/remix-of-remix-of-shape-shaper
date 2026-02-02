/**
 * EffectStack Component
 * 
 * Manages a stack of visual effects with drag-to-reorder, presets,
 * and individual effect controls.
 */

import { memo, useState, useCallback, type FC } from 'react';
import { Plus, Wand2, Layers } from 'lucide-react';
import { 
  Effect, 
  EffectType, 
  EFFECT_TYPE_LABELS, 
  EFFECT_PRESETS,
  createEffect 
} from '@/types/effects';
import { EffectItem } from './EffectItem';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

// ============================================================================
// Types
// ============================================================================

interface EffectStackProps {
  effects: Effect[];
  onChange: (effects: Effect[]) => void;
  disabled?: boolean;
}

// ============================================================================
// Effect Type Options
// ============================================================================

const EFFECT_TYPES: EffectType[] = ['blur', 'drop-shadow', 'inner-shadow', 'inner-glow', 'noise'];

// ============================================================================
// Main Component
// ============================================================================

export const EffectStack: FC<EffectStackProps> = memo(({
  effects,
  onChange,
  disabled = false,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // Add new effect
  const addEffect = useCallback((type: EffectType) => {
    const newEffect = createEffect(type);
    onChange([...effects, newEffect]);
  }, [effects, onChange]);
  
  // Apply preset
  const applyPreset = useCallback((presetId: string) => {
    const preset = EFFECT_PRESETS.find(p => p.id === presetId);
    if (preset) {
      // Clone preset effects with new IDs
      const newEffects = preset.effects.map(effect => ({
        ...effect,
        id: `${effect.id}-${Date.now()}`,
      }));
      onChange([...effects, ...newEffects]);
    }
  }, [effects, onChange]);
  
  // Update single effect
  const updateEffect = useCallback((index: number, updates: Partial<Effect>) => {
    const newEffects = [...effects];
    newEffects[index] = { ...newEffects[index], ...updates };
    onChange(newEffects);
  }, [effects, onChange]);
  
  // Update effect params
  const updateEffectParams = useCallback((index: number, params: Partial<Effect['params']>) => {
    const newEffects = [...effects];
    newEffects[index] = { 
      ...newEffects[index], 
      params: { ...newEffects[index].params, ...params } 
    };
    onChange(newEffects);
  }, [effects, onChange]);
  
  // Remove effect
  const removeEffect = useCallback((index: number) => {
    const newEffects = effects.filter((_, i) => i !== index);
    onChange(newEffects);
  }, [effects, onChange]);
  
  // Drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggedIndex !== null && draggedIndex !== index) {
      const newEffects = [...effects];
      const [moved] = newEffects.splice(draggedIndex, 1);
      newEffects.splice(index, 0, moved);
      onChange(newEffects);
      setDraggedIndex(index);
    }
  }, [draggedIndex, effects, onChange]);
  
  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);
  
  // Clear all effects
  const clearAllEffects = useCallback(() => {
    onChange([]);
  }, [onChange]);
  
  return (
    <div className={cn("space-y-4", disabled && "opacity-50 pointer-events-none")}>
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Effect Stack</span>
          <span className="text-xs text-muted-foreground">({effects.length})</span>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Presets Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium hover:bg-muted rounded-md transition-colors"
                disabled={disabled}
              >
                <Wand2 className="w-3.5 h-3.5" />
                Presets
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Apply Preset
              </DropdownMenuLabel>
              {EFFECT_PRESETS.map(preset => (
                <DropdownMenuItem
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className="flex flex-col items-start gap-0.5"
                >
                  <span className="text-xs font-medium">{preset.name}</span>
                  <span className="text-[10px] text-muted-foreground">{preset.description}</span>
                </DropdownMenuItem>
              ))}
              {effects.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={clearAllEffects}
                    className="text-destructive focus:text-destructive"
                  >
                    Clear All Effects
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Add Effect Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
                disabled={disabled}
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {EFFECT_TYPES.map(type => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => addEffect(type)}
                  className="text-xs"
                >
                  {EFFECT_TYPE_LABELS[type]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Effects List */}
      <div className="space-y-2">
        {effects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-border rounded-lg">
            <Layers className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">No effects added</p>
            <p className="text-[10px] text-muted-foreground/70">Click + Add to add an effect</p>
          </div>
        ) : (
          effects.map((effect, index) => (
            <EffectItem
              key={effect.id}
              effect={effect}
              isDragging={draggedIndex === index}
              onUpdate={(updates) => updateEffect(index, updates)}
              onUpdateParams={(params) => updateEffectParams(index, params)}
              onRemove={() => removeEffect(index)}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            />
          ))
        )}
      </div>
      
      {/* Quick Info */}
      {effects.length > 0 && (
        <div className="text-[10px] text-muted-foreground text-center">
          Drag to reorder • Effects apply top to bottom
        </div>
      )}
    </div>
  );
});

EffectStack.displayName = 'EffectStack';

export default EffectStack;
