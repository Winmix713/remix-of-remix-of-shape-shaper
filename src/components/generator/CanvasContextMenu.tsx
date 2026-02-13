import React, { memo, useCallback } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Copy, FileDown, FlipHorizontal, FlipVertical, RotateCcw, Clipboard, Image } from 'lucide-react';
import { toast } from 'sonner';

interface CanvasContextMenuProps {
  children: React.ReactNode;
  pathData: string;
  state: {
    width: number;
    height: number;
    solidColor: string;
    exp: number;
  };
  onReset: () => void;
  getGradientCSS?: () => string;
}

export const CanvasContextMenu = memo<CanvasContextMenuProps>(({
  children,
  pathData,
  state,
  onReset,
  getGradientCSS,
}) => {
  const handleCopySVG = useCallback(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${state.width} ${state.height}" width="${state.width}" height="${state.height}">
  <path d="${pathData}" fill="${state.solidColor}" />
</svg>`;
    navigator.clipboard.writeText(svg);
    toast.success('SVG copied to clipboard');
  }, [pathData, state]);

  const handleCopyCSS = useCallback(() => {
    const fill = getGradientCSS ? getGradientCSS() : state.solidColor;
    const css = `width: ${state.width}px;
height: ${state.height}px;
background: ${fill};
clip-path: path('${pathData}');`;
    navigator.clipboard.writeText(css);
    toast.success('CSS copied to clipboard');
  }, [pathData, state, getGradientCSS]);

  const handleCopyPath = useCallback(() => {
    navigator.clipboard.writeText(pathData);
    toast.success('SVG path copied');
  }, [pathData]);

  const handleExportSVG = useCallback(() => {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${state.width} ${state.height}" width="${state.width}" height="${state.height}">
  <path d="${pathData}" fill="${state.solidColor}" />
</svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `superellipse-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('SVG downloaded');
  }, [pathData, state]);

  const handleExportPNG = useCallback(() => {
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = state.width * scale;
    canvas.height = state.height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${state.width} ${state.height}" width="${state.width * scale}" height="${state.height * scale}">
      <path d="${pathData}" fill="${state.solidColor}" />
    </svg>`;
    const img = new window.Image();
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((b) => {
        if (!b) return;
        const pngUrl = URL.createObjectURL(b);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `superellipse-${Date.now()}@2x.png`;
        a.click();
        URL.revokeObjectURL(pngUrl);
        URL.revokeObjectURL(url);
        toast.success('PNG @2x downloaded');
      });
    };
    img.src = url;
  }, [pathData, state]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={handleCopySVG}>
          <Copy className="w-4 h-4 mr-2" />
          Copy SVG
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCopyCSS}>
          <Clipboard className="w-4 h-4 mr-2" />
          Copy CSS
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCopyPath}>
          <Copy className="w-4 h-4 mr-2" />
          Copy Path Data
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleExportSVG}>
          <FileDown className="w-4 h-4 mr-2" />
          Export SVG
        </ContextMenuItem>
        <ContextMenuItem onClick={handleExportPNG}>
          <Image className="w-4 h-4 mr-2" />
          Export PNG @2x
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset All
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
});

CanvasContextMenu.displayName = 'CanvasContextMenu';
