import React from 'react';
import { 
  Moon, Sun, Monitor, Tablet, Smartphone, MousePointer2,
  PanelLeft, Code2, Eye, Plus, LayoutGrid, Type, Component,
  Settings, Download
} from 'lucide-react';
import { ViewMode, DeviceType } from '@/types/editor';
import { cn } from '@/lib/utils';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  device: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  inspectorActive: boolean;
  onToggleInspector: () => void;
}

const VIEW_MODES: { mode: ViewMode; label: string; icon: React.ElementType }[] = [
  { mode: 'canvas', label: 'Canvas', icon: PanelLeft },
  { mode: 'code', label: 'Code', icon: Code2 },
  { mode: 'preview', label: 'Preview', icon: Eye },
];

const DEVICES: { type: DeviceType; label: string; icon: React.ElementType }[] = [
  { type: 'mobile', label: 'Mobile', icon: Smartphone },
  { type: 'tablet', label: 'Tablet', icon: Tablet },
  { type: 'desktop', label: 'Desktop', icon: Monitor },
];

export const Header: React.FC<HeaderProps> = ({ 
  theme, 
  toggleTheme, 
  viewMode, 
  onViewModeChange, 
  device, 
  onDeviceChange,
  inspectorActive,
  onToggleInspector,
}) => {
  return (
    <>
      {/* Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:rounded-md focus:font-medium focus:text-sm focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <header className="h-12 border-b border-border flex items-center justify-between px-3 bg-background/80 backdrop-blur-md z-50 shrink-0 sticky top-0">
        {/* Left: Logo + Quick Actions */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-foreground/90 to-foreground/70 flex items-center justify-center shadow-md" aria-hidden="true">
            <span className="text-background font-bold text-[10px] tracking-tighter">Se</span>
          </div>
          <div className="hidden md:flex flex-col leading-none mr-2">
            <span className="text-xs font-semibold tracking-tight">Superellipse</span>
            <span className="text-[9px] text-muted-foreground font-medium tracking-wide uppercase">Generator Pro</span>
          </div>

          <div className="w-px h-5 bg-border mx-1 hidden md:block" aria-hidden="true" />

          {/* Quick Action Buttons */}
          <div className="hidden lg:flex items-center gap-0.5">
            {[
              { icon: Plus, label: 'Add Element' },
              { icon: LayoutGrid, label: 'Layout' },
              { icon: Type, label: 'Type' },
              { icon: Component, label: 'Component' },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title={label}
                aria-label={label}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>

        {/* Center: View Mode Switcher */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5" role="tablist" aria-label="View mode">
          {VIEW_MODES.map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              role="tab"
              aria-selected={viewMode === mode}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition-all duration-200",
                viewMode === mode
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Right: Device + Controls */}
        <div className="flex items-center gap-1">
          {/* Device Selector */}
          <div className="hidden md:flex items-center gap-0.5 bg-muted rounded-lg p-0.5 mr-1">
            {DEVICES.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => onDeviceChange(type)}
                className={cn(
                  "p-1.5 rounded-md text-muted-foreground transition-all duration-200",
                  device === type
                    ? "bg-background text-foreground shadow-sm"
                    : "hover:text-foreground"
                )}
                title={label}
                aria-label={`Preview on ${label}`}
                aria-pressed={device === type}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          {/* Inspector Toggle */}
          <button
            onClick={onToggleInspector}
            className={cn(
              "p-1.5 rounded-md transition-all duration-200",
              inspectorActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            title="Inspector Mode (Select elements)"
            aria-label="Toggle inspector mode"
            aria-pressed={inspectorActive}
          >
            <MousePointer2 className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-border mx-0.5" aria-hidden="true" />

          {/* Settings */}
          <button 
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Theme */}
          <button 
            onClick={toggleTheme}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Toggle dark/light theme"
            aria-pressed={theme === 'dark'}
          >
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Export */}
          <button 
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Export"
            aria-label="Export project"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </header>
    </>
  );
};
