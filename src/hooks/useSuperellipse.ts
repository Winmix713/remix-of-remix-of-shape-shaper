import { useState, useMemo } from 'react';
import { getSuperellipsePath } from '../utils/math';

export type GradientStop = {
  color: string;
  position: number;
};

export interface SuperellipseState {
  // Dimensions
  width: number;
  height: number;
  exp: number;
  smoothing: number;
  
  // Colors
  colorMode: 'solid' | 'linear' | 'radial' | 'conic';
  solidColor: string;
  solidOpacity: number;
  gradientStops: GradientStop[];
  gradientAngle: number;
  
  // Glow (OKLCH)
  enabled: boolean;
  hue: number;
  chroma: number;
  lightness: number;
  glowMaskSize: number;
  glowScale: number;
  glowPositionX: number;
  glowPositionY: number;
  glowOpacity: number;
  glowBlur: number;
  glowSpread: number;
  
  // Effects
  blur: number;
  backdropBlur: number;
  noiseEnabled: boolean;
  noiseIntensity: number;
  
  // Border/Stroke
  borderEnabled: boolean;
  strokeColor: string;
  strokeWidth: number;
  strokePosition: 'inside' | 'center' | 'outside';
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  strokeOpacity: number;
  
  // Shadow
  shadowDistance: number;
  shadowIntensity: number;
}

const DEFAULT_STATE: SuperellipseState = {
  width: 320,
  height: 400,
  exp: 4.0,
  smoothing: 0.5,
  
  colorMode: 'solid',
  solidColor: '#FF9F00',
  solidOpacity: 100,
  gradientStops: [
    { color: '#6366F1', position: 0 },
    { color: '#A855F7', position: 50 },
    { color: '#EC4899', position: 100 },
  ],
  gradientAngle: 135,
  
  enabled: true,
  hue: 40,
  chroma: 0.18,
  lightness: 78,
  glowMaskSize: 0.3,
  glowScale: 0.9,
  glowPositionX: -590,
  glowPositionY: -1070,
  glowOpacity: 100,
  glowBlur: 120,
  glowSpread: 40,
  
  blur: 0,
  backdropBlur: 0,
  noiseEnabled: true,
  noiseIntensity: 35,
  
  borderEnabled: false,
  strokeColor: '#FFFFFF',
  strokeWidth: 2,
  strokePosition: 'inside',
  strokeStyle: 'solid',
  strokeOpacity: 100,
  
  shadowDistance: 10,
  shadowIntensity: 30,
};

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

export function useSuperellipse() {
  const [state, setState] = useState<SuperellipseState>(DEFAULT_STATE);

  const pathData = useMemo(() => {
    return getSuperellipsePath(state.width, state.height, state.exp, { steps: state.width > 500 ? 720 : 360 });
  }, [state.width, state.height, state.exp]);

  const updateState = (updates: Partial<SuperellipseState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const updateGradientStop = (index: number, updates: Partial<GradientStop>) => {
    const newStops = [...state.gradientStops];
    newStops[index] = { ...newStops[index], ...updates };
    updateState({ gradientStops: newStops });
  };

  const resetState = () => {
    setState(DEFAULT_STATE);
  };

  const loadState = (newState: SuperellipseState) => {
    setState(newState);
  };

  const randomizeGlow = () => {
    const randomH = Math.floor(Math.random() * 360);
    const randomL = 60 + Math.random() * 30;
    const randomC = 0.1 + Math.random() * 0.2;
    
    const hex = hslToHex(randomH, 80, 60);
    
    updateState({
      hue: randomH,
      lightness: randomL,
      chroma: randomC,
      solidColor: hex,
      glowPositionX: -100 + Math.random() * 200,
      glowPositionY: -100 + Math.random() * 100,
      glowScale: 0.8 + Math.random() * 1.4,
    });
  };

  return { 
    state, 
    updateState, 
    updateGradientStop,
    resetState,
    loadState,
    randomizeGlow,
    pathData 
  };
}
