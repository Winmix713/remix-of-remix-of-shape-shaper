import React, { useMemo, useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { SuperellipseState } from '../../../hooks/useSuperellipse';

interface CssTabProps {
  state: SuperellipseState;
  theme: 'light' | 'dark';
}

// Helper function to generate phone frame CSS
function generatePhoneFrameCss(isDark: boolean): string[] {
  const lines: string[] = [];
  lines.push(`/* Phone Frame Container */`);
  lines.push(`.phone-frame {`);
  lines.push(`  width: 320px;`);
  lines.push(`  height: 480px;`);
  lines.push(`  overflow: hidden;`);
  lines.push(`  transition: background-color 0.5s, border-color 0.5s;`);
  lines.push(`  background-color: var(--phone-frame-bg);`);
  lines.push(`  border: 4px solid var(--phone-frame-border);`);
  lines.push(`  border-radius: 40px;`);
  lines.push(`  position: relative;`);
  lines.push(`  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);`);
  lines.push(`}`);
  return lines;
}

// Helper function to generate glow CSS layers
function generateGlowCss(state: SuperellipseState): string[] {
  const lines: string[] = [];
  
  if (!state.enabled) return lines;

  lines.push(`/* Glow Container (wrapper for all glow layers) */`);
  lines.push(`.glow-container {`);
  lines.push(`  position: absolute;`);
  lines.push(`  width: 1700px;`);
  lines.push(`  height: 2400px;`);
  lines.push(`  pointer-events: none;`);
  lines.push(`  mask-image: linear-gradient(black 30%, transparent 100%);`);
  lines.push(`  left: -590px;`);
  lines.push(`  top: -1070px;`);
  lines.push(`  transform: scale(${(state.glowScale * 0.75).toFixed(2)});`);
  lines.push(`}`);
  lines.push(``);
  
  // Layer 1: Large Background
  lines.push(`/* Glow Layer 1 - Large Background Shape (180px blur) */`);
  lines.push(`.glow-layer-1 {`);
  lines.push(`  position: absolute;`);
  lines.push(`  top: 400px;`);
  lines.push(`  left: 300px;`);
  lines.push(`  width: 1800px;`);
  lines.push(`  height: 1140px;`);
  lines.push(`  border-radius: 9999px;`);
  lines.push(`  filter: blur(180px);`);
  lines.push(`  background: var(--glow-color-1);`);
  lines.push(`  opacity: 0.4;`);
  lines.push(`  mix-blend-mode: screen;`);
  lines.push(`}`);
  lines.push(``);
  
  // Layer 2: Medium Shape
  lines.push(`/* Glow Layer 2 - Medium Shape (120px blur) */`);
  lines.push(`.glow-layer-2 {`);
  lines.push(`  position: absolute;`);
  lines.push(`  top: 600px;`);
  lines.push(`  left: 460px;`);
  lines.push(`  width: 1300px;`);
  lines.push(`  height: 1300px;`);
  lines.push(`  border-radius: 9999px;`);
  lines.push(`  filter: blur(120px);`);
  lines.push(`  background: var(--glow-color-2);`);
  lines.push(`  opacity: 0.6;`);
  lines.push(`  mix-blend-mode: screen;`);
  lines.push(`}`);
  lines.push(``);
  
  // Layer 3: Core Color
  lines.push(`/* Glow Layer 3 - Core Color (60px blur) */`);
  lines.push(`.glow-layer-3 {`);
  lines.push(`  position: absolute;`);
  lines.push(`  top: 700px;`);
  lines.push(`  left: 560px;`);
  lines.push(`  width: 1000px;`);
  lines.push(`  height: 800px;`);
  lines.push(`  border-radius: 9999px;`);
  lines.push(`  filter: blur(60px);`);
  lines.push(`  background: var(--glow-color-3);`);
  lines.push(`  opacity: 1;`);
  lines.push(`  mix-blend-mode: screen;`);
  lines.push(`}`);
  lines.push(``);
  
  // Layer 4: White Highlight
  lines.push(`/* Glow Layer 4 - White Highlight (80px blur) */`);
  lines.push(`.glow-highlight {`);
  lines.push(`  position: absolute;`);
  lines.push(`  top: 800px;`);
  lines.push(`  left: 700px;`);
  lines.push(`  width: 600px;`);
  lines.push(`  height: 440px;`);
  lines.push(`  border-radius: 9999px;`);
  lines.push(`  filter: blur(80px);`);
  lines.push(`  background: rgb(255, 255, 255);`);
  lines.push(`  opacity: 0.4;`);
  lines.push(`  mix-blend-mode: normal;`);
  lines.push(`}`);
  
  return lines;
}

// Helper function to generate noise overlay CSS
function generateNoiseCss(state: SuperellipseState): string[] {
  const lines: string[] = [];
  
  if (!state.noiseEnabled) return lines;
  
  const noiseSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' /></filter><rect width='100%' height='100%' filter='url(%23n)' /></svg>`;
  
  lines.push(`/* Noise Overlay */`);
  lines.push(`.noise-overlay {`);
  lines.push(`  position: absolute;`);
  lines.push(`  inset: 0;`);
  lines.push(`  width: 100%;`);
  lines.push(`  height: 100%;`);
  lines.push(`  pointer-events: none;`);
  lines.push(`  z-index: 5;`);
  lines.push(`  mix-blend-mode: overlay;`);
  lines.push(`  background-image: url("${noiseSvg}");`);
  lines.push(`  background-size: 200px;`);
  lines.push(`  opacity: ${(state.noiseIntensity / 100).toFixed(2)};`);
  lines.push(`}`);
  
  return lines;
}

// Helper function to generate UI content CSS
function generateUiContentCss(): string[] {
  const lines: string[] = [];
  
  lines.push(`/* UI Content Container */`);
  lines.push(`.ui-content {`);
  lines.push(`  position: absolute;`);
  lines.push(`  bottom: 0;`);
  lines.push(`  width: 100%;`);
  lines.push(`  padding: 1.5rem;`);
  lines.push(`  padding-bottom: 2rem;`);
  lines.push(`  display: flex;`);
  lines.push(`  flex-direction: column;`);
  lines.push(`  gap: 1rem;`);
  lines.push(`  z-index: 20;`);
  lines.push(`}`);
  
  return lines;
}

// Main CSS generation function
function generateDetailedCSS(state: SuperellipseState, theme: 'light' | 'dark'): string {
  const isDark = theme === 'dark';
  
  // Calculate glow colors using OKLCH
  const varColor1 = `oklch(${state.lightness}% ${state.chroma} ${state.hue})`;
  const varColor2 = `oklch(${Math.min(state.lightness + 10, 100)}% ${state.chroma} ${state.hue})`;
  const varColor3 = `oklch(${Math.min(state.lightness + 15, 100)}% ${Math.max(state.chroma - 0.05, 0)} ${state.hue})`;
  
  const lines: string[] = [];
  
  // Header
  lines.push(`/* ========================================`);
  lines.push(`   Superellipse Generator - CSS Export`);
  lines.push(`   Theme: ${isDark ? 'Dark' : 'Light'} Mode`);
  lines.push(`   ======================================== */`);
  lines.push(``);
  
  // CSS Custom Properties (Variables)
  lines.push(`/* CSS Custom Properties */`);
  lines.push(`:root {`);
  lines.push(`  /* Glow Colors */`);
  lines.push(`  --glow-color-1: ${varColor1};`);
  lines.push(`  --glow-color-2: ${varColor2};`);
  lines.push(`  --glow-color-3: ${varColor3};`);
  lines.push(``);
  lines.push(`  /* Theme Colors */`);
  lines.push(`  --phone-frame-bg: ${isDark ? '#050505' : '#ffffff'};`);
  lines.push(`  --phone-frame-border: ${isDark ? '#18181b' : '#f4f4f5'};`);
  lines.push(`}`);
  lines.push(``);
  
  // Dark mode overrides using prefers-color-scheme
  lines.push(`/* Dark Mode Color Overrides */`);
  lines.push(`@media (prefers-color-scheme: dark) {`);
  lines.push(`  :root {`);
  lines.push(`    --phone-frame-bg: #050505;`);
  lines.push(`    --phone-frame-border: #18181b;`);
  lines.push(`  }`);
  lines.push(`}`);
  lines.push(``);
  
  // Add modular CSS sections
  lines.push(...generatePhoneFrameCss(isDark));
  lines.push(``);
  lines.push(...generateGlowCss(state));
  lines.push(``);
  lines.push(...generateNoiseCss(state));
  lines.push(``);
  lines.push(...generateUiContentCss());
  
  return lines.join('\n');
}

export const CssTab: React.FC<CssTabProps> = ({ state, theme }) => {
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<'css' | 'scss'>('css');
  
  const cssCode = useMemo(() => {
    return generateDetailedCSS(state, theme);
  }, [state, theme]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cssCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([cssCode], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `superellipse-glow.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header with Controls */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Generated CSS</h3>
          <p className="text-[10px] text-zinc-500">
            {state.enabled ? '4-layer glow' : 'Base styles'} with {state.noiseEnabled ? 'noise overlay' : 'clean design'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Format Toggle */}
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => setExportFormat('css')}
              className={`px-2 py-1 text-[10px] font-medium rounded transition-all ${
                exportFormat === 'css'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              CSS
            </button>
            <button
              onClick={() => setExportFormat('scss')}
              className={`px-2 py-1 text-[10px] font-medium rounded transition-all ${
                exportFormat === 'scss'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              SCSS
            </button>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
            aria-label="Download CSS file"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              copied
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-indigo-500 text-white hover:bg-indigo-600'
            }`}
            aria-label="Copy CSS to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* CSS Code Block */}
      <div className="relative">
        <textarea
          readOnly
          value={cssCode}
          className="w-full h-[400px] p-4 font-mono text-[11px] leading-relaxed bg-zinc-900 dark:bg-zinc-950 text-zinc-100 rounded-xl border border-zinc-700 dark:border-zinc-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          aria-label="Generated CSS code"
        />
        
        {/* Line count indicator */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-zinc-800/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded text-[9px] text-zinc-400">
          {cssCode.split('\n').length} lines
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="space-y-3">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
          <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed">
            <strong className="font-semibold">Quick Start:</strong> Copy the CSS and use the class names in your HTML. 
            All styles use CSS variables for easy customization.
          </p>
        </div>

        {/* HTML Structure Example */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 mb-2">HTML Structure:</p>
          <pre className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 overflow-x-auto">
{`<div class="phone-frame">
  ${state.enabled ? `<div class="glow-container">
    <div class="glow-layer-1"></div>
    <div class="glow-layer-2"></div>
    <div class="glow-layer-3"></div>
    <div class="glow-highlight"></div>
  </div>` : ''}
  ${state.noiseEnabled ? `<div class="noise-overlay"></div>` : ''}
  <div class="ui-content">
    <!-- Your content here -->
  </div>
</div>`}
          </pre>
        </div>

        {/* Customization Tips */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/50">
          <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
            <strong className="font-semibold">Pro Tip:</strong> Modify the CSS variables in <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/50 rounded font-mono text-[10px]">:root</code> to 
            change colors dynamically without editing individual classes.
          </p>
        </div>
      </div>
    </div>
  );
};
