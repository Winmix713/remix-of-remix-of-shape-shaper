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
  exp: number;

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
  precision?: number;
}

/**
 * CSS generation options
 */
export interface CSSOptions {
  includeGlow?: boolean;
  includeBorder?: boolean;
  useCustomProperties?: boolean;
  addComments?: boolean;
  format?: 'minified' | 'pretty';
}

// ============================================================================
// CORE MATHEMATICAL FUNCTIONS
// ============================================================================

/**
 * Symmetric superellipse path
 */
export function getSuperellipsePath(
  w: number,
  h: number,
  n: number,
  options: { steps?: number; precision?: number } = {}
): string {
  return getAsymmetricSuperellipsePath(w, h, n, n, options);
}

/**
 * Asymmetric superellipse path (different exponent for X and Y)
 */
export function getAsymmetricSuperellipsePath(
  w: number,
  h: number,
  nx: number,
  ny: number,
  options: { steps?: number; precision?: number } = {}
): string {
  const { steps = 360, precision = 2 } = options;

  if (w <= 0 || h <= 0 || nx <= 0 || ny <= 0) {
    throw new Error('Width, height and exponents must be positive numbers');
  }

  const a = w / 2;
  const b = h / 2;
  const points: string[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = (i * 2 * Math.PI) / steps;
    const cosT = Math.cos(t);
    const sinT = Math.sin(t);

    const x = a * Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / nx);
    const y = b * Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / ny);

    const finalX = (x + a).toFixed(precision);
    const finalY = (y + b).toFixed(precision);

    points.push(`${finalX} ${finalY}`);
  }

  return `M ${points.join(' L ')} Z`;
}

/**
 * Approximate perimeter
 */
export function getSuperellipsePerimeter(
  w: number,
  h: number,
  n: number
): number {
  const a = w / 2;
  const b = h / 2;
  const steps = 1000;
  let p = 0;

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
    p += Math.sqrt(dx * dx + dy * dy);

    prevX = x;
    prevY = y;
  }

  return p;
}

/**
 * Approximate area (numerical integration)
 */
export function getSuperellipseArea(
  w: number,
  h: number,
  n: number
): number {
  const a = w / 2;
  const b = h / 2;
  const steps = 1000;
  let area = 0;

  for (let i = 0; i < steps; i++) {
    const t1 = (i * 2 * Math.PI) / steps;
    const t2 = ((i + 1) * 2 * Math.PI) / steps;

    const x1 = a * Math.sign(Math.cos(t1)) * Math.pow(Math.abs(Math.cos(t1)), 2 / n);
    const y1 = b * Math.sign(Math.sin(t1)) * Math.pow(Math.abs(Math.sin(t1)), 2 / n);

    const x2 = a * Math.sign(Math.cos(t2)) * Math.pow(Math.abs(Math.cos(t2)), 2 / n);
    const y2 = b * Math.sign(Math.sin(t2)) * Math.pow(Math.abs(Math.sin(t2)), 2 / n);

    area += x1 * y2 - x2 * y1;
  }

  return Math.abs(area / 2);
}

// ============================================================================
// CSS GENERATION
// ============================================================================

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

  if (useCustomProperties) {
    lines.push(`:root {`);
    lines.push(`${indent}--se-width: ${state.width}px;`);
    lines.push(`${indent}--se-height: ${state.height}px;`);
    lines.push(`${indent}--se-color: ${state.solidColor};`);
    lines.push(`${indent}--se-opacity: ${state.solidOpacity / 100};`);
    lines.push(`}`);
    lines.push('');
  }

  if (addComments) lines.push(`/* Superellipse */`);
  lines.push(`.superellipse {`);

  lines.push(`${indent}width: ${useCustomProperties ? 'var(--se-width)' : state.width + 'px'};`);
  lines.push(`${indent}height: ${useCustomProperties ? 'var(--se-height)' : state.height + 'px'};`);
  lines.push(`${indent}position: relative;`);
  lines.push(`${indent}clip-path: path('${pathData}');`);

  if (state.colorMode === 'solid') {
    lines.push(`${indent}background: ${useCustomProperties ? 'var(--se-color)' : state.solidColor};`);
    if (state.solidOpacity < 100) {
      lines.push(`${indent}opacity: ${useCustomProperties ? 'var(--se-opacity)' : state.solidOpacity / 100};`);
    }
  } else {
    const stops = state.gradientStops.map(s => `${s.color} ${s.position}%`).join(', ');
    if (state.colorMode === 'linear') {
      lines.push(`${indent}background: linear-gradient(${state.gradientAngle}deg, ${stops});`);
    } else if (state.colorMode === 'radial') {
      lines.push(`${indent}background: radial-gradient(circle, ${stops});`);
    } else {
      lines.push(`${indent}background: conic-gradient(from ${state.gradientAngle}deg, ${stops});`);
    }
  }

  if (state.blur > 0) {
    lines.push(`${indent}filter: blur(${state.blur}px);`);
  }

  if (state.backdropBlur > 0) {
    lines.push(`${indent}backdrop-filter: blur(${state.backdropBlur}px);`);
    lines.push(`${indent}-webkit-backdrop-filter: blur(${state.backdropBlur}px);`);
  }

  lines.push(`}`);
  lines.push('');

  if (includeGlow && state.enabled) {
    if (addComments) lines.push(`/* Glow */`);
    lines.push(`.superellipse::before {`);
    lines.push(`${indent}content: '';`);
    lines.push(`${indent}position: absolute;`);
    lines.push(`${indent}inset: 0;`);
    lines.push(`${indent}background: oklch(${state.lightness}% ${state.chroma} ${state.hue});`);
    lines.push(`${indent}filter: blur(80px);`);
    lines.push(`${indent}opacity: .45;`);
    lines.push(`${indent}mix-blend-mode: screen;`);
    lines.push(`${indent}z-index: -1;`);
    lines.push(`}`);
    lines.push('');
  }

  if (includeBorder && state.borderEnabled) {
    if (addComments) lines.push(`/* SVG Border */`);
    lines.push(`.superellipse-border {`);
    lines.push(`${indent}stroke: ${state.strokeColor};`);
    lines.push(`${indent}stroke-width: ${state.strokeWidth};`);
    lines.push(`${indent}stroke-opacity: ${state.strokeOpacity / 100};`);
    lines.push(`${indent}fill: none;`);
    if (state.strokeStyle === 'dashed') lines.push(`${indent}stroke-dasharray: 8 4;`);
    if (state.strokeStyle === 'dotted') lines.push(`${indent}stroke-dasharray: 2 2;`);
    lines.push(`}`);
  }

  return format === 'minified'
    ? lines.join('').replace(/\s+/g, ' ').trim()
    : lines.join('\n');
}

// ============================================================================
// SVG GENERATION
// ============================================================================

export function generateSVG(
  state: SuperellipseState,
  pathData: string,
  options: SVGOptions = {}
): string {
  const { includeBorder = true, optimize = false } = options;

  const mainPath = `
  <path d="${pathData}"
        fill="${state.solidColor}"
        opacity="${state.solidOpacity / 100}" />`;

  const borderPath =
    includeBorder && state.borderEnabled
      ? `
  <path d="${pathData}"
        fill="none"
        stroke="${state.strokeColor}"
        stroke-width="${state.strokeWidth}"
        stroke-opacity="${state.strokeOpacity / 100}" />`
      : '';

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${state.width}" height="${state.height}"
     viewBox="0 0 ${state.width} ${state.height}"
     xmlns="http://www.w3.org/2000/svg">
${mainPath}
${borderPath}
</svg>`;

  return optimize ? svg.replace(/\n\s*/g, '').replace(/\s+/g, ' ') : svg;
}

// ============================================================================
// DOWNLOAD HELPERS
// ============================================================================

export function downloadSVG(
  state: SuperellipseState,
  pathData: string,
  filename = 'superellipse.svg'
): void {
  const svg = generateSVG(state, pathData);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

export async function downloadPNG(
  state: SuperellipseState,
  pathData: string,
  filename = 'superellipse.png',
  scale = 2
): Promise<void> {
  return new Promise((resolve, reject) => {
    const svg = generateSVG(state, pathData);
    const img = new Image();

    const canvas = document.createElement('canvas');
    canvas.width = state.width * scale;
    canvas.height = state.height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('No canvas context'));

    img.onload = () => {
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(blob => {
        if (!blob) return reject(new Error('PNG export failed'));
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        resolve();
      });
    };

    img.onerror = () => reject(new Error('SVG load failed'));
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  });
}
