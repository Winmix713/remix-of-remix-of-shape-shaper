import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { PreviewArea } from '../components/generator/PreviewArea';
import { ControlPanel } from '../components/generator/ControlPanel';
import { LayerPanel } from '../components/generator/layers';
import { CanvasContainer } from '../components/generator/CanvasContainer';
import { useSuperellipse } from '../hooks/useSuperellipse';
import { useLayerManager } from '../hooks/useLayerManager';
import { useCanvasNavigation } from '../hooks/useCanvasNavigation';

const Index: React.FC = () => {
  const { state, updateState, updateGradientStop, resetState, loadState, randomizeGlow, pathData } = useSuperellipse();
  const layerManager = useLayerManager();
  const canvasNav = useCanvasNavigation();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

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

  return (
    <div className="bg-background text-foreground flex flex-col h-screen overflow-hidden font-sans transition-colors duration-300">
      <Header theme={theme} toggleTheme={toggleTheme} />
      
      <main id="main-content" className="flex-1 flex overflow-hidden relative">
        {/* Layer Panel - Left Sidebar */}
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
          onReorderLayers={layerManager.reorderLayers}
          onSetBlendMode={layerManager.setBlendMode}
          onSetOpacity={layerManager.setOpacity}
          onUpdateTransform={layerManager.updateTransform}
        />

        {/* Canvas Area with Zoom/Pan */}
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
          <PreviewArea 
            state={state} 
            pathData={pathData} 
            theme={theme} 
            onSpotlightTrigger={randomizeGlow}
          />
        </CanvasContainer>

        {/* Control Panel - Right Sidebar */}
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
      </main>
    </div>
  );
};

export default Index;
