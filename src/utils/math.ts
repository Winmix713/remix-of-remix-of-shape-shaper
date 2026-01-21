// ============================================================================
// MATHEMATICAL UTILITIES FOR SUPERELLIPSE GENERATION
// ============================================================================

/**
 * Superellipse state interface
 */
export interface SuperellipseState {
  // Dimensions
  width: number;
  height: number;
  exp: number; // Exponent for superellipse formula
  
  // Color
  colorMode: 'solid' | 'linear' | 'radial' | 'conic';
  solidColor: string;
  solidOpacity: number;
  gradientStops: Array<{ color: string; position: number }>;
  gradientAngle: number;
  
  // Effects
  blur: number;
  backdropBlur: number;
  
  // Glow
  enabled: boolean;
  glowScale: number;
  glowPositionX: number;
  glowPositionY: number;
  lightness: number;
  chroma: number;
  hue: number;
  
  // Border
  borderEnabled: boolean;
  strokeColor: string;
  strokeWidth: number;
  strokeOpacity: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
}

/**
 * SVG generation options
 */
export interface SVGOptions {
  includeGlow?: boolean;
  includeBorder?: boolean;
  optimize?: boolean;
  precision?: number; // Decimal places for coordinates
}

/**
 * CSS generation options
 */
export interface CSSOptions {
  includeGlow?: boolean;
  includeBorder?: boolean;
  useCustomProperties?: boolean; // Use CSS variables
  addComments?: boolean;
  format?: 'minified' | 'pretty';
}

// ============================================================================
// TYPES FOR ASYMMETRIC CORNERS
// ============================================================================

export interface CornerExponents {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}

// ============================================================================
// CORE MATHEMATICAL FUNCTIONS
// ============================================================================

/**
 * Get the exponent for a given angle based on corner exponents
 * Uses smooth interpolation between corners
 */
function getExponentForAngle(
  angle: number, 
  corners: CornerExponents
): number {
  // Normalize angle to 0-2PI
  const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  
  // Define corner positions (in radians)
  // Top-right: 0, Top-left: PI/2, Bottom-left: PI, Bottom-right: 3PI/2
  const cornerAngles = [
    { angle: Math.PI * 0.25, exp: corners.topRight },      // Top-right quadrant center
    { angle: Math.PI * 0.75, exp: corners.topLeft },       // Top-left quadrant center
    { angle: Math.PI * 1.25, exp: corners.bottomLeft },    // Bottom-left quadrant center
    { angle: Math.PI * 1.75, exp: corners.bottomRight },   // Bottom-right quadrant center
  ];
  
  // Find which quadrant we're in and blend
  for (let i = 0; i < 4; i++) {
    const curr = cornerAngles[i];
    const next = cornerAngles[(i + 1) % 4];
    const nextAngle = next.angle <= curr.angle ? next.angle + 2 * Math.PI : next.angle;
    
    if (normalizedAngle >= curr.angle - Math.PI * 0.25 && 
        normalizedAngle < curr.angle + Math.PI * 0.25) {
      return curr.exp;
    }
  }
  
  return corners.topRight; // Fallback
}

/**
 * Generate SVG path data string for a superellipse with asymmetric corners
 */
export function getAsymmetricSuperellipsePath(
  w: number,
  h: number,
  corners: CornerExponents,
  options: { steps?: number; precision?: number } = {}
): string {
  const { steps = 360, precision = 2 } = options;
  
  if (w <= 0 || h <= 0) {
    throw new Error('Width and height must be positive numbers');
  }
  
  const a = w / 2;
  const b = h / 2;
  const points: string[] = [];
  
  for (let i = 0; i <= steps; i++) {
    const t = (i * 2 * Math.PI) / steps;
    const cosT = Math.cos(t);
    const sinT = Math.sin(t);
    
    // Get the exponent for this angle
    const n = Math.max(0.5, getExponentForAngle(t, corners));
    
    const x = a * Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / n);
    const y = b * Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / n);
    
    const finalX = (x + a).toFixed(precision);
    const finalY = (y + b).toFixed(precision);
    
    points.push(`${finalX} ${finalY}`);
  }
  
  return `M ${points.join(' L ')} Z`;
}

/**
 * Generate SVG path data string for a superellipse
 * @param w - Width of the superellipse
 * @param h - Height of the superellipse
 * @param n - Exponent (shape parameter)
 * @param options - Generation options
 * @returns SVG path data string
 */
export function getSuperellipsePath(
  w: number,
  h: number,
  n: number,
  options: { steps?: number; precision?: number } = {}
): string {
  const { steps = 360, precision = 2 } = options;
  
  // Validate inputs
  if (w <= 0 || h <= 0 || n <= 0) {
    throw new Error('Width, height, and exponent must be positive numbers');
  }
  
  const a = w / 2;
  const b = h / 2;
  const points: string[] = [];
  
  // Generate points along the superellipse curve
  for (let i = 0; i <= steps; i++) {
    const t = (i * 2 * Math.PI) / steps;
    const cosT = Math.cos(t);
    const sinT = Math.sin(t);
    
    // Superellipse parametric equations
    const x = a * Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / n);
    const y = b * Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / n);
    
    // Translate to center
    const finalX = (x + a).toFixed(precision);
    const finalY = (y + b).toFixed(precision);
    
    points.push(`${finalX} ${finalY}`);
  }
  
  // Construct path data
  return `M ${points.join(' L ')} Z`;
}

/**
 * Calculate the perimeter of a superellipse (approximate)
 * @param w - Width
 * @param h - Height
 * @param n - Exponent
 * @returns Approximate perimeter
 */
export function getSuperellipsePerimeter(w: number, h: number, n: number): number {
  const a = w / 2;
  const b = h / 2;
  const steps = 1000;
  let perimeter = 0;
  
  let prevX = a;
  let prevY = 0;
  
  for (let i = 1; i <= steps; i++) {
    const t = (i * 2 * Math.PI) / steps;
    const cosT = Math.cos(t);
    const sinT = Math.sin(t);
    
    const x = a * Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / n) + a;
    const y = b * Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / n) + b;
    
    const dx = x - prevX;
    const dy = y - prevY;
    perimeter += Math.sqrt(dx * dx + dy * dy);
    
    prevX = x;
    prevY = y;
  }
  
  return perimeter;
}

/**
 * Calculate the area of a superellipse (approximate)
 * @param w - Width
 * @param h - Height
 * @param n - Exponent
 * @returns Approximate area
 */
export function getSuperellipseArea(w: number, h: number, n: number): number {
  const a = w / 2;
  const b = h / 2;
  
  // Using the formula: Area = 4ab * Γ(1 + 1/n)² / Γ(1 + 2/n)
  // For practical purposes, we'll use numerical integration
  const steps = 1000;
  let area = 0;
  
  for (let i = 0; i < steps; i++) {
    const t = (i * 2 * Math.PI) / steps;
    const cosT = Math.cos(t);
    const sinT = Math.sin(t);
    
    const x = a * Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / n);
    const y = b * Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / n);
    
    // Shoelace formula
    const nextT = ((i + 1) * 2 * Math.PI) / steps;
    const nextCosT = Math.cos(nextT);
    const nextSinT = Math.sin(nextT);
    const nextX = a * Math.sign(nextCosT) * Math.pow(Math.abs(nextCosT), 2 / n);
    const nextY = b * Math.sign(nextSinT) * Math.pow(Math.abs(nextSinT), 2 / n);
    
    area += x * nextY - nextX * y;
  }
  
  return Math.abs(area / 2);
}

// ============================================================================
// CSS GENERATION
// ============================================================================

/**
 * Generate CSS code from superellipse state
 * @param state - Superellipse configuration
 * @param pathData - SVG path data
 * @param options - CSS generation options
 * @returns CSS code string
 */
export function generateCSS(
  state: SuperellipseState,
  pathData: string,
  options: CSSOptions = {}
): string {
  const {
    includeGlow = true,
    includeBorder = true,
    useCustomProperties = false,
    addComments = true,
    format = 'pretty',
  } = options;

  const lines: string[] = [];
  const indent = format === 'minified' ? '' : '  ';
  const lineBreak = format === 'minified' ? '' : '\n';
  
  // CSS Custom Properties
  if (useCustomProperties) {
    lines.push(`:root {`);
    lines.push(`${indent}--superellipse-width: ${state.width}px;`);
    lines.push(`${indent}--superellipse-height: ${state.height}px;`);
    lines.push(`${indent}--superellipse-color: ${state.solidColor};`);
    lines.push(`${indent}--superellipse-opacity: ${state.solidOpacity / 100};`);
    lines.push(`}`);
    lines.push(lineBreak);
  }
  
  // Main Superellipse Shape
  if (addComments) lines.push(`/* Superellipse Shape */`);
  lines.push(`.superellipse {`);
  
  if (useCustomProperties) {
    lines.push(`${indent}width: var(--superellipse-width);`);
    lines.push(`${indent}height: var(--superellipse-height);`);
  } else {
    lines.push(`${indent}width: ${state.width}px;`);
    lines.push(`${indent}height: ${state.height}px;`);
  }
  
  lines.push(`${indent}position: relative;`);
  lines.push(`${indent}clip-path: path('${pathData}');`);
  
  // Background
  if (state.colorMode === 'solid') {
    const color = useCustomProperties ? 'var(--superellipse-color)' : state.solidColor;
    lines.push(`${indent}background-color: ${color};`);
    
    if (state.solidOpacity < 100) {
      const opacity = useCustomProperties ? 'var(--superellipse-opacity)' : (state.solidOpacity / 100);
      lines.push(`${indent}opacity: ${opacity};`);
    }
  } else {
    const stopsStr = state.gradientStops
      .map(s => `${s.color} ${s.position}%`)
      .join(', ');
      
    switch (state.colorMode) {
      case 'linear':
        lines.push(`${indent}background: linear-gradient(${state.gradientAngle}deg, ${stopsStr});`);
        break;
      case 'radial':
        lines.push(`${indent}background: radial-gradient(circle, ${stopsStr});`);
        break;
      case 'conic':
        lines.push(`${indent}background: conic-gradient(from ${state.gradientAngle}deg, ${stopsStr});`);
        break;
    }
  }
  
  // Effects
  const filters: string[] = [];
  if (state.blur > 0) {
    filters.push(`blur(${state.blur}px)`);
  }
  if (filters.length > 0) {
    lines.push(`${indent}filter: ${filters.join(' ')};`);
  }
  
  if (state.backdropBlur > 0) {
    lines.push(`${indent}backdrop-filter: blur(${state.backdropBlur}px);`);
    lines.push(`${indent}-webkit-backdrop-filter: blur(${state.backdropBlur}px);`);
  }
  
  lines.push(`}`);
  lines.push(lineBreak);
  
  // Glow Effect
  if (includeGlow && state.enabled) {
    if (addComments) lines.push(`/* Glow Effect */`);
    lines.push(`.superellipse::before {`);
    lines.push(`${indent}content: '';`);
    lines.push(`${indent}position: absolute;`);
    lines.push(`${indent}width: ${Math.round(state.width * state.glowScale)}px;`);
    lines.push(`${indent}height: ${Math.round(state.height * state.glowScale)}px;`);
    lines.push(`${indent}top: ${state.glowPositionY}px;`);
    lines.push(`${indent}left: ${state.glowPositionX}px;`);
    lines.push(`${indent}background-color: oklch(${state.lightness}% ${state.chroma} ${state.hue});`);
    lines.push(`${indent}filter: blur(80px);`);
    lines.push(`${indent}opacity: 0.4;`);
    lines.push(`${indent}mix-blend-mode: screen;`);
    lines.push(`${indent}pointer-events: none;`);
    lines.push(`${indent}z-index: -1;`);
    lines.push(`}`);
    lines.push(lineBreak);
  }
  
  // Border
  if (includeBorder && state.borderEnabled) {
    if (addComments) lines.push(`/* Border (use with SVG) */`);
    lines.push(`.superellipse-border {`);
    lines.push(`${indent}stroke: ${state.strokeColor};`);
    lines.push(`${indent}stroke-width: ${state.strokeWidth}px;`);
    lines.push(`${indent}stroke-opacity: ${state.strokeOpacity / 100};`);
    lines.push(`${indent}fill: none;`);
    
    if (state.strokeStyle === 'dashed') {
      lines.push(`${indent}stroke-dasharray: 8 4;`);
    } else if (state.strokeStyle === 'dotted') {
      lines.push(`${indent}stroke-dasharray: 2 2;`);
    }
    
    lines.push(`}`);
  }
  
  return format === 'minified' 
    ? lines.join('').replace(/\s+/g, ' ').trim()
    : lines.join('\n');
}

// ============================================================================
// SVG GENERATION
// ============================================================================

/**
 * Generate complete SVG string
 * @param state - Superellipse configuration
 * @param pathData - SVG path data
 * @param options - SVG generation options
 * @returns Complete SVG markup
 */
export function generateSVG(
  state: SuperellipseState,
  pathData: string,
  options: SVGOptions = {}
): string {
  const {
    includeGlow = true,
    includeBorder = true,
    optimize = false,
    precision = 2,
  } = options;

  let fillValue = state.solidColor;
  let gradientDef = '';
  let glowDef = '';
  
  // Generate gradient definition if needed
  if (state.colorMode !== 'solid') {
    const gradientId = `gradient-${Date.now()}`;
    const stopsXml = state.gradientStops
      .map(s => `    <stop offset="${s.position}%" stop-color="${s.color}" />`)
      .join('\n');
    
    if (state.colorMode === 'linear') {
      const angle = state.gradientAngle;
      const radians = ((angle - 90) * Math.PI) / 180;
      const x1 = (50 + 50 * Math.cos(radians)).toFixed(precision);
      const y1 = (50 + 50 * Math.sin(radians)).toFixed(precision);
      const x2 = (50 - 50 * Math.cos(radians)).toFixed(precision);
      const y2 = (50 - 50 * Math.sin(radians)).toFixed(precision);
      
      gradientDef = `  <linearGradient id="${gradientId}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
${stopsXml}
  </linearGradient>`;
    } else if (state.colorMode === 'radial') {
      gradientDef = `  <radialGradient id="${gradientId}" cx="50%" cy="50%" r="50%">
${stopsXml}
  </radialGradient>`;
    } else if (state.colorMode === 'conic') {
      // SVG doesn't natively support conic gradients, convert to multiple linear gradients
      gradientDef = `  <!-- Conic gradients require CSS or complex SVG patterns -->
  <radialGradient id="${gradientId}" cx="50%" cy="50%">
${stopsXml}
  </radialGradient>`;
    }
    
    fillValue = `url(#${gradientId})`;
  }
  
  // Generate glow effect
  if (includeGlow && state.enabled) {
    const glowId = `glow-${Date.now()}`;
    
    glowDef = `  <filter id="${glowId}" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
    <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.4 0"/>
    <feBlend mode="screen" in2="SourceGraphic"/>
  </filter>`;
  }
  
  // Build SVG content
  const defs = [gradientDef, glowDef].filter(Boolean).join('\n');
  const hasFilters = state.blur > 0;
  const filterDef = hasFilters 
    ? `  <filter id="blur-filter">
    <feGaussianBlur in="SourceGraphic" stdDeviation="${state.blur}" />
  </filter>` 
    : '';
  
  const mainPath = `  <path 
    d="${pathData}" 
    fill="${fillValue}" 
    opacity="${state.solidOpacity / 100}"${hasFilters ? '\n    filter="url(#blur-filter)"' : ''}
  />`;
  
  const borderPath = includeBorder && state.borderEnabled
    ? `  <path 
    d="${pathData}" 
    fill="none" 
    stroke="${state.strokeColor}" 
    stroke-width="${state.strokeWidth}" 
    stroke-opacity="${state.strokeOpacity / 100}"${state.strokeStyle !== 'solid' ? `\n    stroke-dasharray="${state.strokeStyle === 'dashed' ? '8 4' : '2 2'}"` : ''}
  />`
    : '';
  
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg 
  width="${state.width}" 
  height="${state.height}" 
  viewBox="0 0 ${state.width} ${state.height}" 
  xmlns="http://www.w3.org/2000/svg"
  ${optimize ? '' : 'xmlns:xlink="http://www.w3.org/1999/xlink"'}
>
${defs || filterDef ? `  <defs>\n${defs}\n${filterDef}\n  </defs>` : ''}
${mainPath}
${borderPath}
</svg>`;

  return optimize 
    ? svgContent.replace(/\n\s*/g, '').replace(/\s+/g, ' ')
    : svgContent;
}

/**
 * Download SVG file
 * @param state - Superellipse configuration
 * @param pathData - SVG path data
 * @param filename - Output filename
 * @param options - SVG generation options
 */
export function downloadSVG(
  state: SuperellipseState,
  pathData: string,
  filename: string = 'superellipse.svg',
  options: SVGOptions = {}
): void {
  try {
    const svg = generateSVG(state, pathData, options);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Failed to download SVG:', error);
    throw new Error('SVG download failed');
  }
}

/**
 * Export SVG as PNG (using Canvas API)
 * @param state - Superellipse configuration
 * @param pathData - SVG path data
 * @param filename - Output filename
 * @param scale - Scale multiplier for resolution
 */
export async function downloadPNG(
  state: SuperellipseState,
  pathData: string,
  filename: string = 'superellipse.png',
  scale: number = 2
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const svg = generateSVG(state, pathData);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      canvas.width = state.width * scale;
      canvas.height = state.height * scale;
      
      const img = new Image();
      img.onload = () => {
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }
          
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          resolve();
        }, 'image/png');
      };
      
      img.onerror = () => reject(new Error('Failed to load SVG image'));
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    } catch (error) {
      reject(error);
    }
  });
}
