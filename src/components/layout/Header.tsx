import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <>
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-zinc-900 focus:text-white dark:focus:bg-white dark:focus:text-zinc-900 focus:rounded-md focus:font-medium focus:text-sm focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 lg:px-6 bg-white/80 dark:bg-black/80 backdrop-blur-md z-50 shrink-0 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-zinc-800 to-zinc-900 dark:from-zinc-100 dark:to-zinc-300 flex items-center justify-center shadow-md" aria-hidden="true">
            <span className="text-white dark:text-black font-bold text-sm tracking-tighter">Se</span>
          </div>
          <div className="flex flex-col leading-none">
            <h1 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">Superellipse</h1>
            <span className="text-[10px] text-zinc-500 font-medium tracking-wide uppercase mt-0.5">Generator Pro</span>
          </div>
        </div>
        
        <nav aria-label="Theme settings">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500 dark:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" 
            aria-label="Toggle dark/light theme"
            aria-pressed={theme === 'dark'}
          >
            {theme === 'dark' ? <Moon className="w-5 h-5" aria-hidden="true" /> : <Sun className="w-5 h-5" aria-hidden="true" />}
          </button>
        </nav>
      </header>
    </>
  );
};
