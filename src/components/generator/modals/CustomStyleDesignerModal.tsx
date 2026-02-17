import { useState, useCallback, useMemo, useEffect, type FC } from 'react';
import { X, Save, Paintbrush, Code, Bookmark, Trash2 } from 'lucide-react';
import { SuperellipseState } from '@/hooks/useSuperellipse';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  STYLE_TEMPLATES,
  StyleTemplate,
  SavedPreset,
  loadCustomPresets,
  saveCustomPreset,
  deleteCustomPreset,
} from '@/types/styleTemplates';

interface CustomStyleDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: SuperellipseState;
  onApply: (updates: Partial<SuperellipseState>) => void;
}

type TabId = 'templates' | 'code' | 'presets';

export const CustomStyleDesignerModal: FC<CustomStyleDesignerModalProps> = ({
  isOpen,
  onClose,
  state,
  onApply,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<StyleTemplate | null>(null);
  const [customCSS, setCustomCSS] = useState('');
  const [presetName, setPresetName] = useState('');
  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSavedPresets(loadCustomPresets());
    }
  }, [isOpen]);

  const handleApplyTemplate = useCallback((template: StyleTemplate) => {
    setSelectedTemplate(template);
    onApply(template.values);
  }, [onApply]);

  const handleSavePreset = useCallback(() => {
    if (!presetName.trim()) return;
    const preset: SavedPreset = {
      id: `custom-${Date.now()}`,
      name: presetName.trim(),
      values: {
        brightness: state.brightness,
        contrast: state.contrast,
        saturate: state.saturate,
        hueRotate: state.hueRotate,
        frostBlur: state.frostBlur,
        tintColor: state.tintColor,
        tintOpacity: state.tintOpacity,
        innerShadowSpread: state.innerShadowSpread,
        innerShadowBlur: state.innerShadowBlur,
        innerShadowColor: state.innerShadowColor,
        noiseFrequency: state.noiseFrequency,
        distortionStrength: state.distortionStrength,
      },
      createdAt: Date.now(),
    };
    saveCustomPreset(preset);
    setSavedPresets(loadCustomPresets());
    setPresetName('');
  }, [presetName, state]);

  const handleDeletePreset = useCallback((id: string) => {
    deleteCustomPreset(id);
    setSavedPresets(loadCustomPresets());
  }, []);

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'templates', label: 'Templates', icon: <Paintbrush className="w-4 h-4" /> },
    { id: 'code', label: 'Custom Code', icon: <Code className="w-4 h-4" /> },
    { id: 'presets', label: 'My Presets', icon: <Bookmark className="w-4 h-4" /> },
  ];

  // Generate CSS summary from current state
  const cssSummary = useMemo(() => {
    const lines: string[] = [];
    if (state.brightness !== 100) lines.push(`filter: brightness(${state.brightness}%);`);
    if (state.contrast !== 100) lines.push(`filter: contrast(${state.contrast}%);`);
    if (state.saturate !== 100) lines.push(`filter: saturate(${state.saturate}%);`);
    if (state.hueRotate !== 0) lines.push(`filter: hue-rotate(${state.hueRotate}deg);`);
    if (state.frostBlur > 0) lines.push(`backdrop-filter: blur(${state.frostBlur}px);`);
    if (state.innerShadowBlur > 0) lines.push(`box-shadow: inset 0 0 ${state.innerShadowBlur}px ${state.innerShadowSpread}px ${state.innerShadowColor};`);
    return lines.join('\n') || '/* No custom effects applied */';
  }, [state]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col bg-card">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Paintbrush className="w-5 h-5" />
            Custom Style Designer
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="grid grid-cols-2 gap-3 p-1">
              {STYLE_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleApplyTemplate(template)}
                  className={`flex flex-col items-start gap-2 p-4 rounded-xl border transition-all text-left hover:shadow-md ${
                    selectedTemplate?.id === template.id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-2xl">{template.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{template.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{template.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Custom Code Tab */}
          {activeTab === 'code' && (
            <div className="space-y-3 p-1">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Current Effects CSS</p>
                <pre className="text-[11px] font-mono text-foreground whitespace-pre-wrap">{cssSummary}</pre>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Custom CSS (read-only preview)</label>
                <textarea
                  value={customCSS}
                  onChange={(e) => setCustomCSS(e.target.value)}
                  placeholder="/* Paste custom CSS here for reference */"
                  className="w-full h-40 bg-muted rounded-lg p-3 text-[11px] font-mono text-foreground resize-none border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          )}

          {/* My Presets Tab */}
          {activeTab === 'presets' && (
            <div className="space-y-3 p-1">
              {savedPresets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bookmark className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">No saved presets yet</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">Save your current effects as a preset below</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{preset.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(preset.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onApply(preset.values)}
                          className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => handleDeletePreset(preset.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 pt-4 border-t border-border shrink-0">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Preset name..."
            className="flex-1 h-9 px-3 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={handleSavePreset}
            disabled={!presetName.trim()}
            className="flex items-center gap-1.5 px-4 h-9 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors disabled:opacity-40"
          >
            <Save className="w-3.5 h-3.5" />
            Save as Preset
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Paintbrush className="w-3.5 h-3.5" />
            Apply to Canvas
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
