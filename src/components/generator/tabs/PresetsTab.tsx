import { useState, useMemo, useCallback } from 'react';
import { Save, FolderOpen, Trash2, Download, Upload, Check, Search, Copy, AlertCircle, X } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface SuperellipseState {
  width: number;
  height: number;
  exp: number;
  gradientStops: Array<{ color: string; position: number }>;
  [key: string]: any;
}

interface Preset {
  id: string;
  name: string;
  state: SuperellipseState;
  createdAt: number;
}

interface PresetsTabProps {
  currentState: SuperellipseState;
  onLoadPreset: (state: SuperellipseState) => void;
}

// ============================================================================
// VALIDATION
// ============================================================================

const isValidSuperellipseState = (obj: any): obj is SuperellipseState => {
  if (typeof obj !== 'object' || obj === null) return false;
  if (typeof obj.width !== 'number' || obj.width <= 0 || obj.width > 10000) return false;
  if (typeof obj.height !== 'number' || obj.height <= 0 || obj.height > 10000) return false;
  if (typeof obj.exp !== 'number' || obj.exp < 0.5 || obj.exp > 10) return false;
  if (!Array.isArray(obj.gradientStops)) return false;
  
  for (const stop of obj.gradientStops) {
    if (typeof stop.color !== 'string' || typeof stop.position !== 'number') return false;
    if (stop.position < 0 || stop.position > 100) return false;
  }
  
  return true;
};

// ============================================================================
// HOOKS (Mock implementation)
// ============================================================================

const usePresets = () => {
  const [presets, setPresets] = useState<Preset[]>(() => {
    try {
      const stored = localStorage.getItem('superellipse-presets');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const savePreset = useCallback((name: string, state: SuperellipseState) => {
    const newPreset: Preset = {
      id: `preset-${Date.now()}-${Math.random()}`,
      name,
      state,
      createdAt: Date.now(),
    };
    
    try {
      const updated = [...presets, newPreset];
      localStorage.setItem('superellipse-presets', JSON.stringify(updated));
      setPresets(updated);
      return true;
    } catch (error) {
      console.error('Failed to save preset:', error);
      return false;
    }
  }, [presets]);

  const loadPreset = useCallback((id: string): SuperellipseState | null => {
    const preset = presets.find(p => p.id === id);
    return preset ? preset.state : null;
  }, [presets]);

  const deletePreset = useCallback((id: string) => {
    const updated = presets.filter(p => p.id !== id);
    localStorage.setItem('superellipse-presets', JSON.stringify(updated));
    setPresets(updated);
  }, [presets]);

  const duplicatePreset = useCallback((id: string) => {
    const preset = presets.find(p => p.id === id);
    if (!preset) return;
    
    savePreset(`${preset.name} (copy)`, preset.state);
  }, [presets, savePreset]);

  return { presets, savePreset, loadPreset, deletePreset, duplicatePreset };
};

// ============================================================================
// COMPONENTS
// ============================================================================

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 max-w-sm mx-4 shadow-xl">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">{title}</h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 rounded-md bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PresetsTab = ({ currentState, onLoadPreset }: PresetsTabProps) => {
  const { presets, savePreset, loadPreset, deletePreset, duplicatePreset } = usePresets();
  
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showPresetList, setShowPresetList] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; presetId: string; presetName: string }>({
    isOpen: false,
    presetId: '',
    presetName: '',
  });

  // Filtered presets based on search
  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) return presets;
    const query = searchQuery.toLowerCase();
    return presets.filter(p => p.name.toLowerCase().includes(query));
  }, [presets, searchQuery]);

  const handleSavePreset = useCallback(() => {
    const trimmedName = presetName.trim();
    
    if (!trimmedName) {
      setSaveError('Preset name cannot be empty');
      return;
    }

    if (trimmedName.length > 50) {
      setSaveError('Preset name too long (max 50 characters)');
      return;
    }

    const nameExists = presets.some(p => p.name === trimmedName);
    if (nameExists) {
      setSaveError('A preset with this name already exists');
      return;
    }

    const success = savePreset(trimmedName, currentState);
    
    if (success) {
      setPresetName('');
      setShowSaveDialog(false);
      setSaveSuccess(true);
      setSaveError(null);
      setTimeout(() => setSaveSuccess(false), 2000);
    } else {
      setSaveError('Failed to save preset. Storage might be full.');
    }
  }, [presetName, currentState, presets, savePreset]);

  const handleLoadPreset = useCallback((id: string) => {
    const state = loadPreset(id);
    if (state && isValidSuperellipseState(state)) {
      onLoadPreset(state);
      setShowPresetList(false);
    }
  }, [loadPreset, onLoadPreset]);

  const handleDeleteConfirm = useCallback(() => {
    deletePreset(deleteDialog.presetId);
    setDeleteDialog({ isOpen: false, presetId: '', presetName: '' });
  }, [deleteDialog, deletePreset]);

  const handleExportJSON = useCallback(() => {
    const json = JSON.stringify(currentState, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `superellipse-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [currentState]);

  const handleImportJSON = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const state = JSON.parse(json);
        
        if (isValidSuperellipseState(state)) {
          onLoadPreset(state);
        } else {
          alert('Invalid configuration file. Please check the file format.');
        }
      } catch {
        alert('Failed to import configuration. Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [onLoadPreset]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(navigator.language || 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Success/Error Messages */}
      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in">
          <Check className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
          <p className="text-sm text-green-700 dark:text-green-300">Preset saved successfully!</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Preset
        </button>
        <button
          onClick={() => setShowPresetList(!showPresetList)}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <FolderOpen className="w-4 h-4" />
          Load ({presets.length})
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleExportJSON}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
        <label className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          Import
          <input 
            type="file" 
            accept=".json" 
            onChange={handleImportJSON} 
            className="hidden"
            id="preset-import-input"
          />
        </label>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <p id="save-preset-label" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Save Current Configuration
            </p>
            <button
              onClick={() => {
                setShowSaveDialog(false);
                setPresetName('');
                setSaveError(null);
              }}
              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
              aria-label="Close save dialog"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <input
            type="text"
            value={presetName}
            onChange={(e) => {
              setPresetName(e.target.value);
              setSaveError(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
            placeholder="Enter preset name..."
            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
            aria-labelledby="save-preset-label"
            maxLength={50}
          />
          
          {saveError && (
            <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {saveError}
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={handleSavePreset}
              disabled={!presetName.trim()}
              className="flex-1 px-3 py-2 rounded-md bg-indigo-500 text-white text-xs font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowSaveDialog(false);
                setPresetName('');
                setSaveError(null);
              }}
              className="flex-1 px-3 py-2 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Preset List */}
      {showPresetList && (
        <div className="space-y-2 animate-fade-in">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Saved Presets</p>
            {presets.length > 3 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="pl-7 pr-2 py-1 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>
          
          <div className="max-h-64 overflow-y-auto space-y-1 p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg">
            {filteredPresets.length === 0 && !searchQuery ? (
              <div className="text-center py-8">
                <FolderOpen className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                <p className="text-xs text-zinc-500">No saved presets yet</p>
                <p className="text-[10px] text-zinc-400 mt-1">Save your first preset above</p>
              </div>
            ) : filteredPresets.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                <p className="text-xs text-zinc-500">No presets found</p>
              </div>
            ) : (
              filteredPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-2.5 bg-white dark:bg-zinc-800 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors group"
                >
                  <button 
                    onClick={() => handleLoadPreset(preset.id)} 
                    className="flex-1 text-left"
                    aria-label={`Load preset ${preset.name}`}
                  >
                    <p className="text-xs font-medium text-zinc-900 dark:text-white">{preset.name}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{formatDate(preset.createdAt)}</p>
                  </button>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => duplicatePreset(preset.id)}
                      className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/20 text-zinc-400 hover:text-blue-500 transition-colors"
                      aria-label={`Duplicate preset ${preset.name}`}
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteDialog({ 
                        isOpen: true, 
                        presetId: preset.id, 
                        presetName: preset.name 
                      })}
                      className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-colors"
                      aria-label={`Delete preset ${preset.name}`}
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-relaxed">
          <strong>Tip:</strong> Presets are saved locally in your browser. Export as JSON to share or backup.
        </p>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Preset"
        message={`Are you sure you want to delete "${deleteDialog.presetName}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog({ isOpen: false, presetId: '', presetName: '' })}
      />
    </div>
  );
};
