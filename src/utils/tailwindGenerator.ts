import { SuperellipseState } from '@/hooks/useSuperellipse';

/**
 * Generates Tailwind CSS utility classes from the current superellipse state
 */
export function generateTailwindClasses(state: SuperellipseState, pathData: string): string {
  const classes: string[] = [];

  // Dimensions
  classes.push(`w-[${state.width}px]`);
  classes.push(`h-[${state.height}px]`);

  // Border radius approximation
  const radiusApprox = Math.round(Math.min(state.width, state.height) / (state.exp * 1.2));
  classes.push(`rounded-[${radiusApprox}px]`);

  // Color
  if (state.colorMode === 'solid') {
    classes.push(`bg-[${state.solidColor}]`);
    if (state.solidOpacity < 100) {
      classes.push(`opacity-${Math.round(state.solidOpacity / 5) * 5}`);
    }
  }

  // Border
  if (state.borderEnabled) {
    classes.push(`border-[${state.strokeWidth}px]`);
    classes.push(`border-${state.strokeStyle}`);
    classes.push(`border-[${state.strokeColor}]`);
  }

  // Effects
  if (state.blur > 0) {
    classes.push(`blur-[${state.blur}px]`);
  }
  if (state.backdropBlur > 0) {
    classes.push(`backdrop-blur-[${state.backdropBlur}px]`);
  }

  // Shadow approximation from glow
  if (state.enabled) {
    const glowColor = `oklch(${state.lightness}%_${state.chroma}_${state.hue})`;
    classes.push(`shadow-[0_0_${state.glowSpread}px_${glowColor}]`);
  }

  return classes.join(' ');
}

/**
 * Generates a full Tailwind component snippet
 */
export function generateTailwindSnippet(state: SuperellipseState, pathData: string): string {
  const classes = generateTailwindClasses(state, pathData);
  
  return `{/* Superellipse Component */}
<div
  className="${classes}"
  style={{
    clipPath: "path('${pathData}')",
${state.colorMode !== 'solid' ? `    background: "${getGradientCSS(state)}",` : ''}
  }}
/>`;
}

function getGradientCSS(state: SuperellipseState): string {
  const stops = state.gradientStops
    .map(s => `${s.color} ${s.position}%`)
    .join(', ');

  switch (state.colorMode) {
    case 'linear':
      return `linear-gradient(${state.gradientAngle}deg, ${stops})`;
    case 'radial':
      return `radial-gradient(circle, ${stops})`;
    case 'conic':
      return `conic-gradient(from ${state.gradientAngle}deg, ${stops})`;
    default:
      return state.solidColor;
  }
}
