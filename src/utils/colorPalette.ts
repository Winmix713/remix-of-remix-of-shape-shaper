// ============================================================================
// COLOR PALETTE UTILITIES
// ============================================================================

/**
 * Color categories for better organization
 */
export enum ColorCategory {
  RED = 'red',
  ORANGE = 'orange',
  YELLOW = 'yellow',
  GREEN = 'green',
  BLUE = 'blue',
  PURPLE = 'purple',
  PINK = 'pink',
  NEUTRAL = 'neutral',
}

/**
 * Color definition with metadata
 */
export interface ColorDefinition {
  hex: string;
  name: string;
  category: ColorCategory;
  luminance?: number; // 0-1, calculated from hex
}

/**
 * Gradient stop definition
 */
export interface GradientStop {
  color: string;
  position: number; // 0-100
}

/**
 * Gradient preset definition
 */
export interface GradientPreset {
  id: string;
  name: string;
  description?: string;
  angle: number; // 0-360 degrees
  stops: GradientStop[];
  category?: 'warm' | 'cool' | 'nature' | 'vibrant' | 'subtle' | 'dark';
  tags?: string[];
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Calculate relative luminance of a color (WCAG standard)
 * @param hex - Hex color string (e.g., '#ff0000')
 * @returns Luminance value between 0 and 1
 */
export function calculateLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    const normalized = val / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Check if color is dark (luminance < 0.5)
 */
export function isDarkColor(hex: string): boolean {
  return calculateLuminance(hex) < 0.5;
}

/**
 * Get contrast ratio between two colors (WCAG standard)
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = calculateLuminance(hex1);
  const lum2 = calculateLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Validate hex color format
 */
export function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(hex);
}

/**
 * Normalize hex color (expand shorthand)
 */
export function normalizeHex(hex: string): string {
  if (!hex.startsWith('#')) hex = '#' + hex;
  if (hex.length === 4) {
    // Expand shorthand (#abc -> #aabbcc)
    hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  return hex.toUpperCase();
}

/**
 * Lighten or darken a color
 * @param hex - Hex color string
 * @param amount - Amount to adjust (-100 to 100)
 */
export function adjustBrightness(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const adjust = (val: number) => Math.max(0, Math.min(255, val + amount * 2.55));
  
  return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
}

// ============================================================================
// TAILWIND COLOR PALETTE
// ============================================================================

export const tailwindColors: ColorDefinition[] = [
  // Reds
  { hex: '#ef4444', name: 'Red 500', category: ColorCategory.RED },
  { hex: '#dc2626', name: 'Red 600', category: ColorCategory.RED },
  { hex: '#f87171', name: 'Red 400', category: ColorCategory.RED },
  
  // Oranges
  { hex: '#f97316', name: 'Orange 500', category: ColorCategory.ORANGE },
  { hex: '#ea580c', name: 'Orange 600', category: ColorCategory.ORANGE },
  { hex: '#fb923c', name: 'Orange 400', category: ColorCategory.ORANGE },
  
  // Yellows
  { hex: '#f59e0b', name: 'Amber 500', category: ColorCategory.YELLOW },
  { hex: '#eab308', name: 'Yellow 500', category: ColorCategory.YELLOW },
  { hex: '#fbbf24', name: 'Amber 400', category: ColorCategory.YELLOW },
  
  // Greens
  { hex: '#84cc16', name: 'Lime 500', category: ColorCategory.GREEN },
  { hex: '#22c55e', name: 'Green 500', category: ColorCategory.GREEN },
  { hex: '#10b981', name: 'Emerald 500', category: ColorCategory.GREEN },
  { hex: '#14b8a6', name: 'Teal 500', category: ColorCategory.GREEN },
  
  // Blues
  { hex: '#06b6d4', name: 'Cyan 500', category: ColorCategory.BLUE },
  { hex: '#0ea5e9', name: 'Sky 500', category: ColorCategory.BLUE },
  { hex: '#3b82f6', name: 'Blue 500', category: ColorCategory.BLUE },
  { hex: '#6366f1', name: 'Indigo 500', category: ColorCategory.BLUE },
  
  // Purples
  { hex: '#8b5cf6', name: 'Violet 500', category: ColorCategory.PURPLE },
  { hex: '#a855f7', name: 'Purple 500', category: ColorCategory.PURPLE },
  
  // Pinks
  { hex: '#d946ef', name: 'Fuchsia 500', category: ColorCategory.PINK },
  { hex: '#ec4899', name: 'Pink 500', category: ColorCategory.PINK },
  { hex: '#f43f5e', name: 'Rose 500', category: ColorCategory.PINK },
  
  // Neutrals
  { hex: '#18181b', name: 'Zinc 900', category: ColorCategory.NEUTRAL },
  { hex: '#71717a', name: 'Zinc 500', category: ColorCategory.NEUTRAL },
  { hex: '#a1a1aa', name: 'Zinc 400', category: ColorCategory.NEUTRAL },
  { hex: '#ffffff', name: 'White', category: ColorCategory.NEUTRAL },
].map(color => ({
  ...color,
  luminance: calculateLuminance(color.hex),
}));

/**
 * Get colors by category
 */
export function getColorsByCategory(category: ColorCategory): ColorDefinition[] {
  return tailwindColors.filter(c => c.category === category);
}

/**
 * Get hex colors only (for backward compatibility)
 */
export function getTailwindHexColors(): string[] {
  return tailwindColors.map(c => c.hex);
}

// ============================================================================
// GRADIENT PRESETS
// ============================================================================

export const gradientPresets: GradientPreset[] = [
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm orange to purple transition',
    angle: 135,
    category: 'warm',
    tags: ['warm', 'vibrant', 'evening'],
    stops: [
      { color: '#f59e0b', position: 0 },
      { color: '#ec4899', position: 50 },
      { color: '#8b5cf6', position: 100 },
    ],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep blue gradient',
    angle: 180,
    category: 'cool',
    tags: ['cool', 'calm', 'water'],
    stops: [
      { color: '#0ea5e9', position: 0 },
      { color: '#3b82f6', position: 50 },
      { color: '#1d4ed8', position: 100 },
    ],
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Natural green tones',
    angle: 45,
    category: 'nature',
    tags: ['nature', 'fresh', 'organic'],
    stops: [
      { color: '#84cc16', position: 0 },
      { color: '#22c55e', position: 100 },
    ],
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Dark purple gradient',
    angle: 120,
    category: 'dark',
    tags: ['dark', 'elegant', 'night'],
    stops: [
      { color: '#312e81', position: 0 },
      { color: '#4c1d95', position: 100 },
    ],
  },
  {
    id: 'candy',
    name: 'Candy',
    description: 'Sweet pastel colors',
    angle: 90,
    category: 'vibrant',
    tags: ['playful', 'bright', 'fun'],
    stops: [
      { color: '#f472b6', position: 0 },
      { color: '#c084fc', position: 50 },
      { color: '#818cf8', position: 100 },
    ],
  },
  {
    id: 'fire',
    name: 'Fire',
    description: 'Red to orange flame',
    angle: 0,
    category: 'warm',
    tags: ['hot', 'energetic', 'bold'],
    stops: [
      { color: '#ef4444', position: 0 },
      { color: '#f97316', position: 100 },
    ],
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Northern lights inspired',
    angle: 60,
    category: 'vibrant',
    tags: ['magical', 'colorful', 'dynamic'],
    stops: [
      { color: '#06b6d4', position: 0 },
      { color: '#8b5cf6', position: 50 },
      { color: '#d946ef', position: 100 },
    ],
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Simple black to white',
    angle: 180,
    category: 'subtle',
    tags: ['minimal', 'clean', 'simple'],
    stops: [
      { color: '#18181b', position: 0 },
      { color: '#71717a', position: 50 },
      { color: '#ffffff', position: 100 },
    ],
  },
  {
    id: 'tropical',
    name: 'Tropical',
    description: 'Vibrant tropical colors',
    angle: 45,
    category: 'vibrant',
    tags: ['tropical', 'summer', 'bright'],
    stops: [
      { color: '#f59e0b', position: 0 },
      { color: '#22c55e', position: 50 },
      { color: '#06b6d4', position: 100 },
    ],
  },
  {
    id: 'lavender',
    name: 'Lavender Dreams',
    description: 'Soft purple tones',
    angle: 135,
    category: 'subtle',
    tags: ['soft', 'peaceful', 'calming'],
    stops: [
      { color: '#c084fc', position: 0 },
      { color: '#e879f9', position: 100 },
    ],
  },
];

/**
 * Get gradient presets by category
 */
export function getGradientsByCategory(
  category: GradientPreset['category']
): GradientPreset[] {
  return gradientPresets.filter(g => g.category === category);
}

/**
 * Search gradients by tag
 */
export function searchGradientsByTag(tag: string): GradientPreset[] {
  const lowerTag = tag.toLowerCase();
  return gradientPresets.filter(g => 
    g.tags?.some(t => t.toLowerCase().includes(lowerTag))
  );
}

/**
 * Get gradient by ID
 */
export function getGradientById(id: string): GradientPreset | undefined {
  return gradientPresets.find(g => g.id === id);
}

/**
 * Create custom gradient preset
 */
export function createCustomGradient(
  name: string,
  stops: GradientStop[],
  angle: number = 90,
  options?: Partial<Omit<GradientPreset, 'id' | 'name' | 'stops' | 'angle'>>
): GradientPreset {
  return {
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    angle,
    stops,
    category: 'vibrant',
    ...options,
  };
}

/**
 * Generate CSS gradient string from preset
 */
export function generateGradientCSS(
  preset: GradientPreset,
  type: 'linear' | 'radial' | 'conic' = 'linear'
): string {
  const stopsStr = preset.stops
    .map(s => `${s.color} ${s.position}%`)
    .join(', ');

  switch (type) {
    case 'linear':
      return `linear-gradient(${preset.angle}deg, ${stopsStr})`;
    case 'radial':
      return `radial-gradient(circle, ${stopsStr})`;
    case 'conic':
      return `conic-gradient(from ${preset.angle}deg, ${stopsStr})`;
    default:
      return `linear-gradient(${preset.angle}deg, ${stopsStr})`;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  tailwindColors,
  gradientPresets,
  getColorsByCategory,
  getTailwindHexColors,
  getGradientsByCategory,
  searchGradientsByTag,
  getGradientById,
  createCustomGradient,
  generateGradientCSS,
  calculateLuminance,
  hexToRgb,
  rgbToHex,
  isDarkColor,
  getContrastRatio,
  isValidHex,
  normalizeHex,
  adjustBrightness,
};
