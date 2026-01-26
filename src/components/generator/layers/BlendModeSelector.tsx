import { memo } from 'react';
import { BlendMode, BLEND_MODES } from '@/types/layers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BlendModeSelectorProps {
  value: BlendMode;
  onChange: (value: BlendMode) => void;
  disabled?: boolean;
}

export const BlendModeSelector = memo<BlendModeSelectorProps>(({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        Blend Mode
      </label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as BlendMode)}
        disabled={disabled}
      >
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Select blend mode" />
        </SelectTrigger>
        <SelectContent>
          {BLEND_MODES.map((mode) => (
            <SelectItem 
              key={mode.value} 
              value={mode.value}
              className="text-xs"
            >
              {mode.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

BlendModeSelector.displayName = 'BlendModeSelector';
