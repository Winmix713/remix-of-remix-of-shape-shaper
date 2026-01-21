import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { PreviewArea } from '../components/generator/PreviewArea';
import { ControlPanel } from '../components/generator/ControlPanel';
import { useSuperellipse } from '../hooks/useSuperellipse';

const Index: React.FC = () => {
  const { state, updateState, updateGradientStop, resetState, loadState, randomizeGlow, pathData } = useSuperellipse();
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
    <div className="bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col h-screen overflow-hidden font-sans transition-colors duration-300">
      <Header theme={theme} toggleTheme={toggleTheme} />
      
      <main id="main-content" className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <PreviewArea 
          state={state} 
          pathData={pathData} 
          theme={theme} 
          onSpotlightTrigger={randomizeGlow}
        />
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
