/**
 * EffectItem Component
 * 
 * Individual effect control with expandable parameters panel.
 */

import { memo, useCallback, type FC } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  GripVertical, 
  Trash2,
  CircleDot,
  Square,
  Sparkles
} from 'lucide-react';
import { 
  Effect, 
  EffectType, 
  BlurParams, 
  DropShadowParams, 
  InnerShadowParams, 
  InnerGlowParams,
  NoiseParams,
  EFFECT_TYPE_LABELS 
} from '@/types/effects';
import { CustomSlider } from '../CustomSlider';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface EffectItemProps {
  effect: Effect;
  isDragging?: boolean;
  onUpdate: (updates: Partial<Effect>) => void;
  onUpdateParams: (params: Partial<Effect['params']>) => void;
  onRemove: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

// ============================================================================
// Effect Icons
// ============================================================================

const EFFECT_ICONS: Record<EffectType, typeof CircleDot> = {
  blur: CircleDot,
  'drop-shadow': Square,
  'inner-shadow': Square,
  'inner-glow': Sparkles,
  noise: Sparkles,
};

// ============================================================================
// Parameter Editors
// ============================================================================

const BlurEditor: FC<{ 
  params: BlurParams; 
  onChange: (params: Partial<BlurParams>) => void;
}> = memo(({ params, onChange }) => (
  <div className="space-y-3">
    <CustomSlider
      label="Radius"
      value={params.radius}
      min={0}
      max={100}
      step={1}
      onChange={(val) => onChange({ radius: val })}
      unit="px"
    />
  </div>
));
BlurEditor.displayName = 'BlurEditor';

const DropShadowEditor: FC<{ 
  params: DropShadowParams; 
  onChange: (params: Partial<DropShadowParams>) => void;
}> = memo(({ params, onChange }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <CustomSlider
        label="Offset X"
        value={params.offsetX}
        min={-100}
        max={100}
        step={1}
        onChange={(val) => onChange({ offsetX: val })}
        unit="px"
      />
      <CustomSlider
        label="Offset Y"
        value={params.offsetY}
        min={-100}
        max={100}
        step={1}
        onChange={(val) => onChange({ offsetY: val })}
        unit="px"
      />
    </div>
    <CustomSlider
      label="Blur"
      value={params.blur}
      min={0}
      max={100}
      step={1}
      onChange={(val) => onChange({ blur: val })}
      unit="px"
    />
    <CustomSlider
      label="Spread"
      value={params.spread}
      min={0}
      max={50}
      step={1}
      onChange={(val) => onChange({ spread: val })}
      unit="px"
    />
    <CustomSlider
      label="Opacity"
      value={params.opacity}
      min={0}
      max={100}
      step={1}
      onChange={(val) => onChange({ opacity: val })}
      unit="%"
    />
    <div className="flex items-center gap-2">
      <label className="text-xs text-muted-foreground">Color</label>
      <input
        type="color"
        value={params.color}
        onChange={(e) => onChange({ color: e.target.value })}
        className="w-8 h-8 rounded border border-border cursor-pointer"
      />
      <input
        type="text"
        value={params.color.toUpperCase()}
        onChange={(e) => {
          if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
            onChange({ color: e.target.value });
          }
        }}
        className="flex-1 px-2 py-1 bg-muted border border-border rounded text-xs font-mono"
        maxLength={7}
      />
    </div>
  </div>
));
DropShadowEditor.displayName = 'DropShadowEditor';

const InnerShadowEditor: FC<{ 
  params: InnerShadowParams; 
  onChange: (params: Partial<InnerShadowParams>) => void;
}> = memo(({ params, onChange }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <CustomSlider
        label="Offset X"
        value={params.offsetX}
        min={-50}
        max={50}
        step={1}
        onChange={(val) => onChange({ offsetX: val })}
        unit="px"
      />
      <CustomSlider
        label="Offset Y"
        value={params.offsetY}
        min={-50}
        max={50}
        step={1}
        onChange={(val) => onChange({ offsetY: val })}
        unit="px"
      />
    </div>
    <CustomSlider
      label="Blur"
      value={params.blur}
      min={0}
      max={50}
      step={1}
      onChange={(val) => onChange({ blur: val })}
      unit="px"
    />
    <CustomSlider
      label="Opacity"
      value={params.opacity}
      min={0}
      max={100}
      step={1}
      onChange={(val) => onChange({ opacity: val })}
      unit="%"
    />
    <div className="flex items-center gap-2">
      <label className="text-xs text-muted-foreground">Color</label>
      <input
        type="color"
        value={params.color}
        onChange={(e) => onChange({ color: e.target.value })}
        className="w-8 h-8 rounded border border-border cursor-pointer"
      />
    </div>
  </div>
));
InnerShadowEditor.displayName = 'InnerShadowEditor';

const InnerGlowEditor: FC<{ 
  params: InnerGlowParams; 
  onChange: (params: Partial<InnerGlowParams>) => void;
}> = memo(({ params, onChange }) => (
  <div className="space-y-3">
    <CustomSlider
      label="Blur"
      value={params.blur}
      min={0}
      max={50}
      step={1}
      onChange={(val) => onChange({ blur: val })}
      unit="px"
    />
    <CustomSlider
      label="Spread"
      value={params.spread}
      min={0}
      max={30}
      step={1}
      onChange={(val) => onChange({ spread: val })}
      unit="px"
    />
    <CustomSlider
      label="Opacity"
      value={params.opacity}
      min={0}
      max={100}
      step={1}
      onChange={(val) => onChange({ opacity: val })}
      unit="%"
    />
    <div className="flex items-center gap-2">
      <label className="text-xs text-muted-foreground">Color</label>
      <input
        type="color"
        value={params.color}
        onChange={(e) => onChange({ color: e.target.value })}
        className="w-8 h-8 rounded border border-border cursor-pointer"
      />
    </div>
  </div>
));
InnerGlowEditor.displayName = 'InnerGlowEditor';

const NoiseEditor: FC<{ 
  params: NoiseParams; 
  onChange: (params: Partial<NoiseParams>) => void;
}> = memo(({ params, onChange }) => (
  <div className="space-y-3">
    <CustomSlider
      label="Intensity"
      value={params.intensity}
      min={0}
      max={100}
      step={1}
      onChange={(val) => onChange({ intensity: val })}
      unit="%"
    />
    <CustomSlider
      label="Scale"
      value={params.scale * 100}
      min={50}
      max={300}
      step={10}
      onChange={(val) => onChange({ scale: val / 100 })}
      unit="%"
    />
    <label className="flex items-center gap-2 text-xs">
      <input
        type="checkbox"
        checked={params.animated}
        onChange={(e) => onChange({ animated: e.target.checked })}
        className="rounded border-border"
      />
      <span className="text-muted-foreground">Animated</span>
    </label>
  </div>
));
NoiseEditor.displayName = 'NoiseEditor';

// ============================================================================
// Main Component
// ============================================================================

export const EffectItem: FC<EffectItemProps> = memo(({
  effect,
  isDragging,
  onUpdate,
  onUpdateParams,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
}) => {
  const Icon = EFFECT_ICONS[effect.type];
  
  const toggleExpanded = useCallback(() => {
    onUpdate({ expanded: !effect.expanded });
  }, [effect.expanded, onUpdate]);
  
  const toggleEnabled = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate({ enabled: !effect.enabled });
  }, [effect.enabled, onUpdate]);
  
  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  }, [onRemove]);
  
  const renderParamsEditor = () => {
    switch (effect.type) {
      case 'blur':
        return <BlurEditor params={effect.params as BlurParams} onChange={onUpdateParams} />;
      case 'drop-shadow':
        return <DropShadowEditor params={effect.params as DropShadowParams} onChange={onUpdateParams} />;
      case 'inner-shadow':
        return <InnerShadowEditor params={effect.params as InnerShadowParams} onChange={onUpdateParams} />;
      case 'inner-glow':
        return <InnerGlowEditor params={effect.params as InnerGlowParams} onChange={onUpdateParams} />;
      case 'noise':
        return <NoiseEditor params={effect.params as NoiseParams} onChange={onUpdateParams} />;
      default:
        return null;
    }
  };
  
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={cn(
        "border border-border rounded-lg overflow-hidden transition-all",
        isDragging && "opacity-50 scale-95",
        !effect.enabled && "opacity-60"
      )}
    >
      {/* Header */}
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center gap-2 px-3 py-2 bg-muted/50 hover:bg-muted transition-colors"
      >
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground cursor-grab" />
        
        <button
          onClick={toggleEnabled}
          className="p-0.5 hover:bg-background rounded"
        >
          {effect.enabled ? (
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
        
        <Icon className="w-3.5 h-3.5 text-primary" />
        
        <span className="flex-1 text-left text-xs font-medium">
          {effect.name}
        </span>
        
        <button
          onClick={handleRemove}
          className="p-0.5 hover:bg-destructive/10 rounded"
        >
          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
        </button>
        
        {effect.expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </button>
      
      {/* Parameters */}
      {effect.expanded && (
        <div className="p-3 space-y-3 border-t border-border bg-background">
          {renderParamsEditor()}
        </div>
      )}
    </div>
  );
});

EffectItem.displayName = 'EffectItem';

export default EffectItem;
