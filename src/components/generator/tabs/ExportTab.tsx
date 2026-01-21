import React, { useState, useMemo, useCallback } from 'react';
import { Download, FileCode, FileJson, Copy, Check, Image, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createPngExportError, createSvgExportError, logError, toUserMessage } from '@/lib/errors';

// ============================================================================
// TYPES
// ============================================================================

interface SuperellipseState {
  width: number;
  height: number;
  exp: number;
  gradientStops: Array<{ color: string; position: number }>;
  // Allow additional properties for other state fields
  [key: string]: unknown;
}

interface ExportTabProps {
  state: SuperellipseState;
  pathData: string;
}

// ============================================================================
// UTILITY FUNCTIONS (mock implementations)
// ============================================================================

const generateCSS = (state: SuperellipseState, pathData: string): string => {
  return `.superellipse {
  width: ${state.width}px;
  height: ${state.height}px;
  clip-path: path('${pathData}');
  background: linear-gradient(135deg, ${state.gradientStops.map(s => s.color).join(', ')});
}`;
};

const generateSVG = (state: SuperellipseState, pathData: string): string => {
  return `<svg width="${state.width}" height="${state.height}" xmlns="http://www.w3.org/2000/svg">
  <path d="${pathData}" fill="url(#gradient)"/>
  <defs>
    <linearGradient id="gradient">
      ${state.gradientStops.map((s, i) => 
        `<stop offset="${s.position}%" stop-color="${s.color}"/>`
      ).join('\n      ')}
    </linearGradient>
  </defs>
</svg>`;
};

const downloadSVG = (state: SuperellipseState, pathData: string, filename: string): void => {
  try {
    const svg = generateSVG(state, pathData);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    const exportError = createSvgExportError(error as Error);
    logError(exportError);
    throw exportError;
  }
};

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

interface CopyButtonProps {
  content: string;
  label?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const CopyButton: React.FC<CopyButtonProps> = ({ 
  content, 
  label = 'Copy',
  onSuccess,
  onError 
}) => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setError(false);
      onSuccess?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError(true);
      onError?.(err as Error);
      setTimeout(() => setError(false), 3000);
    }
  }, [content, onSuccess, onError]);

  return (
    <button
      onClick={handleCopy}
      aria-label={`${label} to clipboard`}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
      disabled={copied || error}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-green-500" />
          <span className="text-green-500">Copied!</span>
        </>
      ) : error ? (
        <>
          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          <span className="text-red-500">Failed</span>
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
  language: 'css' | 'json';
  isVisible: boolean;
  id: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, isVisible, id }) => {
  const colorClass = language === 'css' ? 'text-green-400' : 'text-blue-400';
  
  if (!isVisible) return null;
  
  return (
    <div id={id} className="animate-fade-in">
      <div className="relative bg-zinc-900 dark:bg-black border border-zinc-700 dark:border-zinc-800 rounded-lg overflow-hidden">
        <div className="absolute top-2 right-2 text-[10px] text-zinc-500 uppercase tracking-wider">
          {language}
        </div>
        <pre 
          className={`p-4 pt-8 text-[11px] leading-relaxed ${colorClass} overflow-x-auto max-h-64 font-mono`}
          role="region"
          aria-label={`${language.toUpperCase()} code`}
        >
          {code}
        </pre>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-zinc-900 dark:from-black to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ExportTab: React.FC<ExportTabProps> = ({ state, pathData }) => {
  const [showCSS, setShowCSS] = useState(false);
  const [showJSON, setShowJSON] = useState(false);
  const [downloadingPNG, setDownloadingPNG] = useState(false);

  // Memoized code generation
  const cssCode = useMemo(() => generateCSS(state, pathData), [state, pathData]);
  const jsonCode = useMemo(() => JSON.stringify(state, null, 2), [state]);

  const handleDownloadSVG = useCallback(() => {
    try {
      downloadSVG(state, pathData, `superellipse-${Date.now()}.svg`);
      toast.success('SVG downloaded successfully', {
        description: 'Your superellipse has been saved',
        duration: 3000,
      });
    } catch (error) {
      const userMessage = toUserMessage(error);
      toast.error(userMessage.message, {
        description: userMessage.hint,
        duration: 5000,
      });
    }
  }, [state, pathData]);

  const handleDownloadPNG = useCallback(async () => {
    setDownloadingPNG(true);
    try {
      const svg = generateSVG(state, pathData);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw createPngExportError(new Error('Canvas context not available'));
      }
      
      const img = new window.Image();
      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        try {
          canvas.width = state.width * 2; // 2x for better quality
          canvas.height = state.height * 2;
          ctx.scale(2, 2);
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (!blob) {
              const blobError = createPngExportError(new Error('Blob creation failed'));
              logError(blobError);
              const userMessage = toUserMessage(blobError);
              toast.error(userMessage.message, {
                description: userMessage.hint,
                duration: 5000,
              });
              setDownloadingPNG(false);
              URL.revokeObjectURL(url);
              return;
            }
            
            const pngUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = `superellipse-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(pngUrl);
            URL.revokeObjectURL(url);
            
            setDownloadingPNG(false);
            toast.success('PNG downloaded successfully', {
              description: 'High-resolution image saved',
              duration: 3000,
            });
          }, 'image/png');
        } catch (err) {
          const exportError = createPngExportError(err as Error);
          logError(exportError);
          const userMessage = toUserMessage(exportError);
          toast.error(userMessage.message, {
            description: userMessage.hint,
            duration: 5000,
          });
          setDownloadingPNG(false);
          URL.revokeObjectURL(url);
        }
      };
      
      img.onerror = () => {
        const imgError = createPngExportError(new Error('Failed to load SVG image'));
        logError(imgError);
        const userMessage = toUserMessage(imgError);
        toast.error(userMessage.message, {
          description: userMessage.hint,
          duration: 5000,
        });
        setDownloadingPNG(false);
        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (error) {
      const exportError = createPngExportError(error as Error);
      logError(exportError);
      const userMessage = toUserMessage(exportError);
      toast.error(userMessage.message, {
        description: userMessage.hint,
        duration: 5000,
      });
      setDownloadingPNG(false);
    }
  }, [state, pathData]);

  return (
    <div className="space-y-4 animate-fade-in">
      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 px-1 flex items-center gap-2">
        <Download className="w-3.5 h-3.5" />
        Export Options
      </p>

      {/* Download Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleDownloadSVG}
          aria-label="Download current superellipse as SVG"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-b from-indigo-500 to-indigo-600 text-white text-sm font-medium shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-indigo-700 active:scale-[0.98] transition-all"
        >
          <Image className="w-4 h-4" />
          SVG
        </button>
        
        <button
          onClick={handleDownloadPNG}
          disabled={downloadingPNG}
          aria-label="Download current superellipse as PNG"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/20 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {downloadingPNG ? 'Processing...' : 'PNG'}
        </button>
      </div>

      {/* CSS Export */}
      <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowCSS(!showCSS)}
            aria-expanded={showCSS}
            aria-controls="css-code-block"
            className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <FileCode className="w-4 h-4" />
            CSS Code
          </button>
          <CopyButton content={cssCode} label="Copy CSS" />
        </div>

        <CodeBlock 
          code={cssCode}
          language="css"
          isVisible={showCSS}
          id="css-code-block"
        />
      </div>

      {/* JSON Export */}
      <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowJSON(!showJSON)}
            aria-expanded={showJSON}
            aria-controls="json-code-block"
            className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <FileJson className="w-4 h-4" />
            JSON Configuration
          </button>
          <CopyButton content={jsonCode} label="Copy JSON" />
        </div>

        <CodeBlock 
          code={jsonCode}
          language="json"
          isVisible={showJSON}
          id="json-code-block"
        />
      </div>

      {/* Info */}
      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg space-y-2">
        <p className="text-xs font-medium text-amber-900 dark:text-amber-200">Export Formats</p>
        <ul className="text-[10px] text-amber-700 dark:text-amber-300 space-y-1 leading-relaxed">
          <li><strong>SVG:</strong> Scalable vector graphics for web and design</li>
          <li><strong>PNG:</strong> Raster image format with transparency</li>
          <li><strong>CSS:</strong> Ready-to-use stylesheet code</li>
          <li><strong>JSON:</strong> Configuration for sharing and backup</li>
        </ul>
      </div>
    </div>
  );
};
