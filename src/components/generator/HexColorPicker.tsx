/**
 * HexColorPicker Component
 * 
 * Bidirectional OKLCH ↔ HEX color picker with native color input.
 * Uses semantic design tokens for consistent theming.
 */

import React, { useState, useEffect, useCallback } from 'react';

interface HexColorPickerProps {
  hue: number;
  chroma: number;
  lightness: number;
  onColorChange: (hue: number, chroma: number, lightness: number) => void;
}

// Simplified OKLCH → HSL → HEX conversion
function oklchToHex(h: number, c: number, l: number): string {
  const hsl_h = h;
  const hsl_s = Math.min(100, c * 300);
  const hsl_l = l;
  return hslToHex(hsl_h, hsl_s, hsl_l);
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// HEX → OKLCH approximation
function hexToOklch(hex: string): { h: number; c: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  
  let h = 0;
  let s = 0;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  
  return {
    h: Math.round(h),
    c: Math.round(s * 0.4 * 100) / 100,
    l: Math.round(l * 100),
  };
}

export const HexColorPicker: React.FC<HexColorPickerProps> = ({
  hue, chroma, lightness, onColorChange,
}) => {
  const [hexValue, setHexValue] = useState(() => oklchToHex(hue, chroma, lightness));
  
  useEffect(() => {
    setHexValue(oklchToHex(hue, chroma, lightness));
  }, [hue, chroma, lightness]);

  const handleHexInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHexValue(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      const { h, c, l } = hexToOklch(value);
      onColorChange(h, c, l);
    }
  }, [onColorChange]);

  const handleColorPicker = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value.toUpperCase();
    setHexValue(hex);
    const { h, c, l } = hexToOklch(hex);
    onColorChange(h, c, l);
  }, [onColorChange]);

  return (
    <div className="flex items-center gap-3">
      <label className="text-xs font-medium text-muted-foreground flex-1">
        Base Color
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={hexValue}
          onChange={handleHexInput}
          className="w-20 h-8 px-2 text-xs font-mono bg-muted border border-border rounded-lg text-center text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
          placeholder="#FF9F00"
        />
        <div className="relative">
          <input
            type="color"
            value={hexValue}
            onChange={handleColorPicker}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="w-8 h-8 rounded-lg border border-border shadow-inner cursor-pointer"
            style={{ backgroundColor: hexValue }}
          />
        </div>
      </div>
    </div>
  );
};