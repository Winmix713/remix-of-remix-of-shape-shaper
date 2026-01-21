import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 lg:px-6 bg-white/80 dark:bg-black/80 backdrop-blur-md z-50 shrink-0 sticky top-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-zinc-800 to-zinc-900 dark:from-zinc-100 dark:to-zinc-300 flex items-center justify-center shadow-md">
          <span className="text-white dark:text-black font-bold text-sm tracking-tighter">Se</span>
        </div>
        <div className="flex flex-col leading-none">
          <h1 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">Superellipse</h1>
          <span className="text-[10px] text-zinc-500 font-medium tracking-wide uppercase mt-0.5">Generator Pro</span>
        </div>
      </div>
      
      <button 
        onClick={toggleTheme}
        className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500 dark:text-zinc-400" 
        aria-label="Toggle Theme"
      >
        {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>
    </header>
  );
};
