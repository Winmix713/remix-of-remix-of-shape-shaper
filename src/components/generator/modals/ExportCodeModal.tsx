/**
 * ExportCodeModal Component
 * 
 * Professional multi-format code export modal with syntax highlighting,
 * one-click copy, and format-specific previews.
 * 
 * Supports: SVG, CSS, React, Vue component exports
 */

import React, { useState, useMemo, useCallback } from 'react';
import { X, Copy, Check, Download, Code2, FileCode, FileJson, Braces } from 'lucide-react';
import { SuperellipseState } from '../../../hooks/useSuperellipse';
import { generateCSS, generateSVG } from '../../../utils/math';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// ============================================================================
// Types
// ============================================================================

interface ExportCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: SuperellipseState;
  pathData: string;
}

type ExportFormat = 'svg' | 'css' | 'react' | 'vue';

interface FormatConfig {
  id: ExportFormat;
  label: string;
  icon: React.ReactNode;
  language: string;
  extension: string;
}

// ============================================================================
// Constants
// ============================================================================

const FORMATS: FormatConfig[] = [
  { id: 'svg', label: 'SVG', icon: <FileCode className="w-4 h-4" />, language: 'xml', extension: 'svg' },
  { id: 'css', label: 'CSS', icon: <Code2 className="w-4 h-4" />, language: 'css', extension: 'css' },
  { id: 'react', label: 'React', icon: <Braces className="w-4 h-4" />, language: 'tsx', extension: 'tsx' },
  { id: 'vue', label: 'Vue', icon: <FileJson className="w-4 h-4" />, language: 'vue', extension: 'vue' },
];

// ============================================================================
// Code Generators
// ============================================================================

const generateReactComponent = (state: SuperellipseState, pathData: string): string => {
  const glowColor = `oklch(${state.lightness}% ${state.chroma} ${state.hue})`;
  
  return `import React from 'react';

interface SuperellipseProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Superellipse: React.FC<SuperellipseProps> = ({ 
  className = '', 
  style 
}) => {
  return (
    <div 
      className={\`superellipse-container \${className}\`}
      style={{
        position: 'relative',
        width: ${state.width},
        height: ${state.height},
        ...style
      }}
    >
      {/* Glow Layer */}
      ${state.enabled ? `<div
        className="superellipse-glow"
        style={{
          position: 'absolute',
          inset: 0,
          background: '${glowColor}',
          filter: 'blur(${state.glowBlur}px)',
          opacity: ${(state.glowOpacity / 100).toFixed(2)},
          transform: 'scale(${state.glowScale}) translate(${state.glowPositionX}px, ${state.glowPositionY}px)',
          mixBlendMode: 'screen',
          zIndex: -1,
        }}
      />` : ''}
      
      {/* Main Shape */}
      <svg 
        width={${state.width}} 
        height={${state.height}}
        viewBox="0 0 ${state.width} ${state.height}"
        style={{ display: 'block' }}
      >
        ${state.colorMode !== 'solid' ? `<defs>
          <linearGradient id="superellipse-gradient" gradientTransform="rotate(${state.gradientAngle})">
            ${state.gradientStops.map(s => `<stop offset="${s.position}%" stopColor="${s.color}" />`).join('\n            ')}
          </linearGradient>
        </defs>` : ''}
        <path
          d="${pathData}"
          fill="${state.colorMode === 'solid' ? state.solidColor : 'url(#superellipse-gradient)'}"
          fillOpacity={${(state.solidOpacity / 100).toFixed(2)}}
        />
        ${state.borderEnabled ? `<path
          d="${pathData}"
          fill="none"
          stroke="${state.strokeColor}"
          strokeWidth={${state.strokeWidth}}
          strokeOpacity={${(state.strokeOpacity / 100).toFixed(2)}}
          ${state.strokeStyle === 'dashed' ? 'strokeDasharray="8 4"' : ''}
          ${state.strokeStyle === 'dotted' ? 'strokeDasharray="2 2"' : ''}
        />` : ''}
      </svg>
    </div>
  );
};

export default Superellipse;
`;
};

const generateVueComponent = (state: SuperellipseState, pathData: string): string => {
  const glowColor = `oklch(${state.lightness}% ${state.chroma} ${state.hue})`;
  
  return `<template>
  <div class="superellipse-container" :style="containerStyle">
    <!-- Glow Layer -->
    ${state.enabled ? `<div class="superellipse-glow" :style="glowStyle" />` : ''}
    
    <!-- Main Shape -->
    <svg 
      :width="${state.width}" 
      :height="${state.height}"
      viewBox="0 0 ${state.width} ${state.height}"
    >
      ${state.colorMode !== 'solid' ? `<defs>
        <linearGradient id="superellipse-gradient" :gradientTransform="\`rotate(${state.gradientAngle})\`">
          ${state.gradientStops.map(s => `<stop offset="${s.position}%" stop-color="${s.color}" />`).join('\n          ')}
        </linearGradient>
      </defs>` : ''}
      <path
        d="${pathData}"
        :fill="fill"
        :fill-opacity="${(state.solidOpacity / 100).toFixed(2)}"
      />
      ${state.borderEnabled ? `<path
        d="${pathData}"
        fill="none"
        stroke="${state.strokeColor}"
        :stroke-width="${state.strokeWidth}"
        :stroke-opacity="${(state.strokeOpacity / 100).toFixed(2)}"
        ${state.strokeStyle === 'dashed' ? 'stroke-dasharray="8 4"' : ''}
        ${state.strokeStyle === 'dotted' ? 'stroke-dasharray="2 2"' : ''}
      />` : ''}
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const containerStyle = computed(() => ({
  position: 'relative',
  width: '${state.width}px',
  height: '${state.height}px',
}));

const glowStyle = computed(() => ({
  position: 'absolute',
  inset: 0,
  background: '${glowColor}',
  filter: 'blur(${state.glowBlur}px)',
  opacity: ${(state.glowOpacity / 100).toFixed(2)},
  transform: 'scale(${state.glowScale}) translate(${state.glowPositionX}px, ${state.glowPositionY}px)',
  mixBlendMode: 'screen',
  zIndex: -1,
}));

const fill = computed(() => '${state.colorMode === 'solid' ? state.solidColor : 'url(#superellipse-gradient)'}');
</script>

<style scoped>
.superellipse-container {
  display: inline-block;
}
</style>
`;
};

// ============================================================================
// Subcomponents
// ============================================================================

interface CopyButtonProps {
  content: string;
  label?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ content, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }, [content]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
      aria-label={`${label} to clipboard`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          {label}
        </>
      )}
    </button>
  );
};

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const getLanguageColor = (lang: string) => {
    switch (lang) {
      case 'css': return 'text-primary';
      case 'xml': return 'text-accent-foreground';
      case 'tsx': return 'text-primary';
      case 'vue': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="relative bg-zinc-950 border border-border rounded-lg overflow-hidden">
      <div className="absolute top-2 right-2 text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
        {language}
      </div>
      <pre 
        className={`p-4 pt-8 text-[11px] leading-relaxed ${getLanguageColor(language)} overflow-auto max-h-[400px] font-mono`}
      >
        {code}
      </pre>
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const ExportCodeModal: React.FC<ExportCodeModalProps> = ({
  isOpen,
  onClose,
  state,
  pathData,
}) => {
  const [activeFormat, setActiveFormat] = useState<ExportFormat>('svg');

  // Generate code for active format
  const generatedCode = useMemo(() => {
    switch (activeFormat) {
      case 'svg':
        return generateSVG(state, pathData);
      case 'css':
        return generateCSS(state, pathData, { addComments: true, format: 'pretty' });
      case 'react':
        return generateReactComponent(state, pathData);
      case 'vue':
        return generateVueComponent(state, pathData);
      default:
        return '';
    }
  }, [activeFormat, state, pathData]);

  const currentFormat = FORMATS.find(f => f.id === activeFormat);

  const handleDownload = useCallback(() => {
    if (!currentFormat) return;
    
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `superellipse.${currentFormat.extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [generatedCode, currentFormat]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col bg-card">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Code2 className="w-5 h-5" />
            Export Code
          </DialogTitle>
        </DialogHeader>

        {/* Format Tabs */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg shrink-0">
          {FORMATS.map((format) => (
            <button
              key={format.id}
              onClick={() => setActiveFormat(format.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                ${activeFormat === format.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }
              `}
            >
              {format.icon}
              {format.label}
            </button>
          ))}
        </div>

        {/* Code Preview */}
        <div className="flex-1 overflow-hidden">
          <CodeBlock 
            code={generatedCode} 
            language={currentFormat?.language || 'text'} 
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border shrink-0">
          <p className="text-xs text-muted-foreground">
            {generatedCode.length.toLocaleString()} characters • {generatedCode.split('\n').length} lines
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background text-foreground text-xs font-medium hover:bg-muted transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download .{currentFormat?.extension}
            </button>
            <CopyButton content={generatedCode} label="Copy Code" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportCodeModal;
