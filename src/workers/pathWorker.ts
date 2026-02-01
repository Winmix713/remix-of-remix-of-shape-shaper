/**
 * Path Calculation Web Worker
 * 
 * Offloads heavy superellipse path generation to a separate thread
 * for improved performance on complex calculations.
 */

// ============================================================================
// Types
// ============================================================================

interface CornerExponents {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}

interface PathCalculationRequest {
  type: 'symmetric' | 'asymmetric' | 'per-corner';
  width: number;
  height: number;
  exp?: number;
  expX?: number;
  expY?: number;
  corners?: CornerExponents;
  options?: {
    steps?: number;
    precision?: number;
  };
}

interface PathCalculationResponse {
  success: boolean;
  path?: string;
  error?: string;
  calculationTime?: number;
}

// ============================================================================
// Path Generation Functions
// ============================================================================

function getSymmetricPath(
  w: number,
  h: number,
  n: number,
  steps: number = 360,
  precision: number = 2
): string {
  const a = w / 2;
  const b = h / 2;
  const points: string[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = (i * 2 * Math.PI) / steps;
    const cosT = Math.cos(t);
    const sinT = Math.sin(t);

    const x = a * Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / n);
    const y = b * Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / n);

    const finalX = (x + a).toFixed(precision);
    const finalY = (y + b).toFixed(precision);

    points.push(`${finalX} ${finalY}`);
  }

  return `M ${points.join(' L ')} Z`;
}

function getAsymmetricPath(
  w: number,
  h: number,
  nx: number,
  ny: number,
  steps: number = 360,
  precision: number = 2
): string {
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

function getPerCornerPath(
  w: number,
  h: number,
  corners: CornerExponents,
  steps: number = 360,
  precision: number = 2
): string {
  const a = w / 2;
  const b = h / 2;
  const points: string[] = [];

  const getExponentForAngle = (t: number): number => {
    const angle = ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    
    if (angle < Math.PI / 2) {
      const factor = angle / (Math.PI / 2);
      return corners.topRight * (1 - factor) + corners.bottomRight * factor;
    } else if (angle < Math.PI) {
      const factor = (angle - Math.PI / 2) / (Math.PI / 2);
      return corners.bottomRight * (1 - factor) + corners.bottomLeft * factor;
    } else if (angle < (3 * Math.PI) / 2) {
      const factor = (angle - Math.PI) / (Math.PI / 2);
      return corners.bottomLeft * (1 - factor) + corners.topLeft * factor;
    } else {
      const factor = (angle - (3 * Math.PI) / 2) / (Math.PI / 2);
      return corners.topLeft * (1 - factor) + corners.topRight * factor;
    }
  };

  for (let i = 0; i <= steps; i++) {
    const t = (i * 2 * Math.PI) / steps;
    const n = getExponentForAngle(t);
    
    const cosT = Math.cos(t);
    const sinT = Math.sin(t);

    const x = a * Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / n);
    const y = b * Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / n);

    const finalX = (x + a).toFixed(precision);
    const finalY = (y + b).toFixed(precision);

    points.push(`${finalX} ${finalY}`);
  }

  return `M ${points.join(' L ')} Z`;
}

// ============================================================================
// Message Handler
// ============================================================================

self.onmessage = (event: MessageEvent<PathCalculationRequest>) => {
  const startTime = performance.now();
  const request = event.data;

  try {
    const steps = request.options?.steps ?? 360;
    const precision = request.options?.precision ?? 2;

    let path: string;

    switch (request.type) {
      case 'symmetric':
        if (request.exp === undefined) {
          throw new Error('Exponent required for symmetric path');
        }
        path = getSymmetricPath(request.width, request.height, request.exp, steps, precision);
        break;

      case 'asymmetric':
        if (request.expX === undefined || request.expY === undefined) {
          throw new Error('Both expX and expY required for asymmetric path');
        }
        path = getAsymmetricPath(request.width, request.height, request.expX, request.expY, steps, precision);
        break;

      case 'per-corner':
        if (!request.corners) {
          throw new Error('Corner exponents required for per-corner path');
        }
        path = getPerCornerPath(request.width, request.height, request.corners, steps, precision);
        break;

      default:
        throw new Error(`Unknown path type: ${request.type}`);
    }

    const response: PathCalculationResponse = {
      success: true,
      path,
      calculationTime: performance.now() - startTime,
    };

    self.postMessage(response);
  } catch (error) {
    const response: PathCalculationResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      calculationTime: performance.now() - startTime,
    };

    self.postMessage(response);
  }
};

// Export for TypeScript
export {};
