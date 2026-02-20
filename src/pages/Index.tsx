import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { Header } from '../components/layout/Header';
import { StatusBar } from '../components/layout/StatusBar';
import { PreviewArea } from '../components/generator/PreviewArea';
import { ControlPanel } from '../components/generator/ControlPanel';
import { LayerPanel } from '../components/generator/layers';
import { CanvasContainer } from '../components/generator/CanvasContainer';
import { DeviceFrame } from '../components/generator/DeviceFrame';
import { InspectorOverlay } from '../components/generator/InspectorOverlay';
import { KeyboardShortcutsModal } from '../components/generator/modals/KeyboardShortcutsModal';
import { CustomStyleDesignerModal } from '../components/generator/modals/CustomStyleDesignerModal';
import { ExportCodeModal } from '../components/generator/modals/ExportCodeModal';
import { Dock } from '../components/generator/Dock';
import { CanvasContextMenu } from '../components/generator/CanvasContextMenu';
import { CanvasHUD } from '../components/generator/CanvasHUD';
import { generateSVG } from '../utils/math';
import { useSuperellipse, SuperellipseState } from '../hooks/useSuperellipse';
import { useLayerManager } from '../hooks/useLayerManager';
import { useCanvasNavigation } from '../hooks/useCanvasNavigation';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useViewMode } from '../hooks/useViewMode';
import { useInspector } from '../hooks/useInspector';
import { generateTailwindSnippet } from '../utils/tailwindGenerator';

const Index: React.FC = () => {
  const { state, updateState, updateGradientStop, resetState, loadState, randomizeGlow, pathData, getGradientCSS } = useSuperellipse();
  const layerManager = useLayerManager();
  const canvasNav = useCanvasNavigation();
  const { viewMode, setViewMode, device, setDevice } = useViewMode();
  const { inspector, toggleInspector, setHovered, setSelected, clearSelection } = useInspector();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showStyleDesigner, setShowStyleDesigner] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Keyboard shortcut handlers
  const handleDuplicateLayer = useCallback(() => {
    if (layerManager.selectedLayerId) {
      layerManager.duplicateLayer(layerManager.selectedLayerId);
    }
  }, [layerManager]);

  const handleDeleteLayer = useCallback(() => {
    if (layerManager.selectedLayerId) {
      layerManager.removeLayer(layerManager.selectedLayerId);
    }
  }, [layerManager]);

  const handleMoveLayerUp = useCallback(() => {
    if (layerManager.selectedLayerId) {
      layerManager.moveLayer(layerManager.selectedLayerId, 'up');
    }
  }, [layerManager]);

  const handleMoveLayerDown = useCallback(() => {
    if (layerManager.selectedLayerId) {
      layerManager.moveLayer(layerManager.selectedLayerId, 'down');
    }
  }, [layerManager]);

  const handleToggleVisibility = useCallback(() => {
    if (layerManager.selectedLayerId) {
      layerManager.toggleVisibility(layerManager.selectedLayerId);
    }
  }, [layerManager]);

  const handleToggleLock = useCallback(() => {
    if (layerManager.selectedLayerId) {
      layerManager.toggleLock(layerManager.selectedLayerId);
    }
  }, [layerManager]);

  const handleSave = useCallback(() => {
    try {
      localStorage.setItem('superellipse-state', JSON.stringify(state));
      toast({
        title: 'Design saved',
        description: 'Your design has been saved to local storage.',
        duration: 2000,
      });
    } catch {
      toast({
        title: 'Save failed',
        description: 'Could not save design.',
        variant: 'destructive',
        duration: 2000,
      });
    }
  }, [state]);

  const handleApplyShapePreset = useCallback((updates: Partial<SuperellipseState>) => {
    updateState(updates);
    toast({
      title: 'Shape preset applied',
      description: `Exponent set to n=${updates.exp?.toFixed(1)}`,
      duration: 1500,
    });
  }, [updateState]);

  useKeyboardShortcuts({
    enabled: true,
    handlers: {
      undo: layerManager.undo,
      redo: layerManager.redo,
      save: handleSave,
      openExport: () => setShowExportModal(true),
      duplicateLayer: handleDuplicateLayer,
      deleteLayer: handleDeleteLayer,
      moveLayerUp: handleMoveLayerUp,
      moveLayerDown: handleMoveLayerDown,
      toggleLayerVisibility: handleToggleVisibility,
      toggleLayerLock: handleToggleLock,
      zoomIn: canvasNav.zoomIn,
      zoomOut: canvasNav.zoomOut,
      zoomTo100: canvasNav.zoomTo100,
      fitToView: canvasNav.resetView,
      showShortcuts: () => setShowShortcutsModal(true),
      deselectAll: () => layerManager.selectLayer(null),
    },
  });

  // Generated code for Code view
  const codeContent = useMemo(() => {
    return generateTailwindSnippet(state, pathData);
  }, [state, pathData]);

  return (
    <div className="bg-background text-foreground flex flex-col h-screen overflow-hidden font-sans transition-colors duration-300">
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        device={device}
        onDeviceChange={setDevice}
        inspectorActive={inspector.active}
        onToggleInspector={toggleInspector}
        onExport={() => setShowExportModal(true)}
      />
      
      <main id="main-content" className="flex-1 flex overflow-hidden relative">
        {/* Layer Panel - Left Sidebar (hidden in code/preview modes) */}
        {viewMode === 'canvas' && (
          <LayerPanel
            layers={layerManager.layers}
            selectedLayerId={layerManager.selectedLayerId}
            selectedLayer={layerManager.selectedLayer}
            onSelectLayer={layerManager.selectLayer}
            onAddLayer={layerManager.addLayer}
            onRemoveLayer={layerManager.removeLayer}
            onUpdateLayer={layerManager.updateLayer}
            onDuplicateLayer={layerManager.duplicateLayer}
            onToggleVisibility={layerManager.toggleVisibility}
            onToggleLock={layerManager.toggleLock}
            onToggleSolo={layerManager.toggleSolo}
            onReorderLayers={layerManager.reorderLayers}
            onMoveLayer={layerManager.moveLayer}
            onMoveLayerToIndex={layerManager.moveLayerToIndex}
            onSetBlendMode={layerManager.setBlendMode}
            onSetOpacity={layerManager.setOpacity}
            onUpdateTransform={layerManager.updateTransform}
            onApplyShapePreset={handleApplyShapePreset}
          />
        )}

        {/* Code View */}
        {viewMode === 'code' && (
          <div className="flex-1 overflow-auto bg-muted p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-background border border-border rounded-xl overflow-hidden shadow-lg">
                <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
                  <span className="text-xs font-medium text-muted-foreground">Generated Code</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                  </div>
                </div>
                <pre className="p-6 text-sm font-mono leading-relaxed text-foreground overflow-x-auto whitespace-pre-wrap">
                  {codeContent}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Canvas / Preview Area */}
        {(viewMode === 'canvas' || viewMode === 'preview') && (
          <CanvasContainer
            zoom={canvasNav.zoom}
            panX={canvasNav.panX}
            panY={canvasNav.panY}
            isPanning={canvasNav.isPanning}
            onZoomIn={canvasNav.zoomIn}
            onZoomOut={canvasNav.zoomOut}
            onResetView={canvasNav.resetView}
            onZoomTo100={canvasNav.zoomTo100}
            containerRef={canvasNav.containerRef}
          >
            <CanvasContextMenu
              pathData={pathData}
              state={state}
              onReset={resetState}
              getGradientCSS={getGradientCSS}
            >
              <DeviceFrame device={device}>
                <div className="relative">
                  <PreviewArea 
                    state={state} 
                    pathData={pathData} 
                    theme={theme} 
                    onSpotlightTrigger={randomizeGlow}
                  />
                  <InspectorOverlay
                    inspector={inspector}
                    shapeWidth={state.width}
                    shapeHeight={state.height}
                    onHover={setHovered}
                    onSelect={setSelected}
                  />
                </div>
              </DeviceFrame>
            </CanvasContextMenu>
            
            {/* Canvas HUD */}
            <CanvasHUD
              width={state.width}
              height={state.height}
              exp={state.exp}
              zoom={canvasNav.zoom}
            />

            {/* Dock - Effect presets */}
            {viewMode === 'canvas' && (
              <Dock onApplyPreset={updateState} />
            )}
          </CanvasContainer>
        )}

        {/* Control Panel - Right Sidebar (hidden in code/preview modes) */}
        {viewMode === 'canvas' && (
          <ControlPanel 
            state={state} 
            updateState={updateState} 
            updateGradientStop={updateGradientStop}
            resetState={resetState}
            loadState={loadState}
            randomizeGlow={randomizeGlow}
            pathData={pathData}
            theme={theme}
            onThemeChange={setTheme}
          />
        )}
      </main>

      {/* Status Bar */}
      <StatusBar
        dimensions={{ width: state.width, height: state.height }}
        zoom={canvasNav.zoom}
        activeLayer={layerManager.selectedLayer?.name ?? null}
        inspectorActive={inspector.active}
        onReset={resetState}
        onCopySVG={() => {
          const svg = generateSVG(state, pathData);
          navigator.clipboard.writeText(svg);
        }}
        onExport={() => setShowExportModal(true)}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal 
        isOpen={showShortcutsModal} 
        onClose={() => setShowShortcutsModal(false)} 
      />

      {/* Custom Style Designer Modal */}
      <CustomStyleDesignerModal
        isOpen={showStyleDesigner}
        onClose={() => setShowStyleDesigner(false)}
        state={state}
        onApply={updateState}
      />

      {/* Export Code Modal */}
      <ExportCodeModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        state={state}
        pathData={pathData}
      />
    </div>
  );
};

export default Index;
