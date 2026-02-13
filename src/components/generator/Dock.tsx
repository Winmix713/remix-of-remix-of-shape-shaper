import React, { memo, useCallback } from 'react';
import { Sparkles, Droplets, Layers, Mountain } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SuperellipseState } from '@/hooks/useSuperellipse';

interface DockProps {
  onApplyPreset: (updates: Partial<SuperellipseState>) => void;
  className?: string;
}

interface DockItem {
  id: string;
  label: string;
  icon: React.ElementType;
  preset: Partial<SuperellipseState>;
  accentClass: string;
}

const DOCK_ITEMS: DockItem[] = [
  {
    id: 'glow',
    label: 'Glow',
    icon: Sparkles,
    accentClass: 'text-amber-400',
    preset: {
      enabled: true,
      hue: 40,
      chroma: 0.22,
      lightness: 80,
      glowBlur: 140,
      glowSpread: 50,
      glowOpacity: 100,
      glowScale: 1.0,
      colorMode: 'linear' as const,
      gradientAngle: 135,
      gradientStops: [
        { color: '#FF9F00', position: 0 },
        { color: '#FF6B00', position: 100 },
      ],
    },
  },
  {
    id: 'glass',
    label: 'Glass',
    icon: Droplets,
    accentClass: 'text-sky-400',
    preset: {
      solidColor: '#FFFFFF',
      solidOpacity: 15,
      colorMode: 'solid' as const,
      backdropBlur: 20,
      blur: 0,
      borderEnabled: true,
      strokeColor: '#FFFFFF',
      strokeWidth: 1,
      strokeOpacity: 30,
      strokePosition: 'inside' as const,
      enabled: false,
      shadowDistance: 12,
      shadowIntensity: 15,
    },
  },
  {
    id: 'neo',
    label: 'Neo',
    icon: Layers,
    accentClass: 'text-violet-400',
    preset: {
      solidColor: '#E8E8E8',
      solidOpacity: 100,
      colorMode: 'solid' as const,
      enabled: false,
      borderEnabled: false,
      backdropBlur: 0,
      blur: 0,
      shadowDistance: 18,
      shadowIntensity: 40,
      noiseEnabled: false,
    },
  },
  {
    id: 'clay',
    label: 'Clay',
    icon: Mountain,
    accentClass: 'text-rose-400',
    preset: {
      solidColor: '#F5E6D3',
      solidOpacity: 100,
      colorMode: 'solid' as const,
      enabled: false,
      borderEnabled: false,
      backdropBlur: 0,
      blur: 0,
      shadowDistance: 8,
      shadowIntensity: 25,
      noiseEnabled: true,
      noiseIntensity: 20,
      exp: 5.0,
    },
  },
];

const DockButton = memo<{
  item: DockItem;
  onClick: () => void;
}>(({ item, onClick }) => {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex flex-col items-center gap-1 px-3 py-2 rounded-xl",
        "transition-all duration-200 ease-out",
        "hover:-translate-y-1 hover:scale-110",
        "active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      )}
      aria-label={`Apply ${item.label} preset`}
      title={item.label}
      type="button"
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center",
        "bg-muted/80 backdrop-blur-sm border border-border/50",
        "group-hover:bg-accent group-hover:border-border",
        "transition-all duration-200"
      )}>
        <Icon className={cn("w-5 h-5", item.accentClass)} />
      </div>
      <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
        {item.label}
      </span>
    </button>
  );
});

DockButton.displayName = 'DockButton';

export const Dock = memo<DockProps>(({ onApplyPreset, className }) => {
  const handleApply = useCallback((preset: Partial<SuperellipseState>) => {
    onApplyPreset(preset);
  }, [onApplyPreset]);

  return (
    <div
      className={cn(
        "absolute bottom-4 left-1/2 -translate-x-1/2 z-30",
        "flex items-end gap-1 px-3 py-2",
        "bg-background/70 backdrop-blur-xl rounded-2xl",
        "border border-border/50 shadow-lg",
        className
      )}
      role="toolbar"
      aria-label="Effect presets dock"
    >
      {DOCK_ITEMS.map((item) => (
        <DockButton
          key={item.id}
          item={item}
          onClick={() => handleApply(item.preset)}
        />
      ))}
    </div>
  );
});

Dock.displayName = 'Dock';
