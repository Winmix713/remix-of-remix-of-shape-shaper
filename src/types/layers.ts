// Layer System Type Definitions

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export const BLEND_MODES: { value: BlendMode; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' },
  { value: 'hue', label: 'Hue' },
  { value: 'saturation', label: 'Saturation' },
  { value: 'color', label: 'Color' },
  { value: 'luminosity', label: 'Luminosity' },
];

export type AnchorPoint =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface Transform {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  anchor: AnchorPoint;
}

export type LayerType = 'shape' | 'image' | 'text' | 'group';

export interface LayerEffect {
  id: string;
  type: 'blur' | 'drop-shadow' | 'inner-shadow' | 'glow' | 'noise';
  enabled: boolean;
  params: Record<string, number | string>;
}

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  solo: boolean;
  opacity: number;
  blendMode: BlendMode;
  transform: Transform;
  effects: LayerEffect[];
  parentId: string | null;
  zIndex: number;
  content?: LayerContent;
}

export interface ShapeContent {
  type: 'superellipse';
  pathData?: string;
  fill?: string;
}

export interface ImageContent {
  type: 'image';
  src: string;
  alt?: string;
}

export interface TextContent {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
}

export type LayerContent = ShapeContent | ImageContent | TextContent;

export const DEFAULT_TRANSFORM: Transform = {
  x: 0,
  y: 0,
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  anchor: 'center',
};

export const getAnchorOffset = (anchor: AnchorPoint): { x: number; y: number } => {
  const map: Record<AnchorPoint, { x: number; y: number }> = {
    'top-left': { x: 0, y: 0 },
    'top-center': { x: 50, y: 0 },
    'top-right': { x: 100, y: 0 },
    'center-left': { x: 0, y: 50 },
    'center': { x: 50, y: 50 },
    'center-right': { x: 100, y: 50 },
    'bottom-left': { x: 0, y: 100 },
    'bottom-center': { x: 50, y: 100 },
    'bottom-right': { x: 100, y: 100 },
  };
  return map[anchor];
};
