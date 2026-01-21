import { describe, it, expect } from 'vitest';
import { 
  getSuperellipsePath, 
  getAsymmetricSuperellipsePath,
  CornerExponents 
} from '@/utils/math';

describe('getSuperellipsePath', () => {
  it('should generate a valid SVG path', () => {
    const path = getSuperellipsePath(100, 100, 2);
    expect(path).toContain('M');
    expect(path).toContain('L');
    expect(path).toContain('Z');
    expect(typeof path).toBe('string');
  });

  it('should generate a circle with exponent 2', () => {
    const path = getSuperellipsePath(100, 100, 2);
    expect(path).toBeTruthy();
    expect(path.length).toBeGreaterThan(100); // Path should be substantial
  });

  it('should generate a square-like shape with exponent 10', () => {
    const path = getSuperellipsePath(100, 100, 10);
    expect(path).toBeTruthy();
    expect(path.length).toBeGreaterThan(100);
  });

  it('should handle different aspect ratios', () => {
    const path1 = getSuperellipsePath(200, 100, 2);
    const path2 = getSuperellipsePath(100, 200, 2);
    
    expect(path1).toBeTruthy();
    expect(path2).toBeTruthy();
    expect(path1).not.toBe(path2); // Different aspect ratios should produce different paths
  });

  it('should handle various exponent values', () => {
    const exponents = [1.5, 3, 5, 8, 15];
    
    exponents.forEach(exp => {
      const path = getSuperellipsePath(100, 100, exp);
      expect(path).toBeTruthy();
      expect(path).toContain('M');
    });
  });

  it('should throw error for invalid dimensions', () => {
    expect(() => getSuperellipsePath(0, 100, 2)).toThrow('Width, height, and exponent must be positive numbers');
    expect(() => getSuperellipsePath(100, 0, 2)).toThrow('Width, height, and exponent must be positive numbers');
    expect(() => getSuperellipsePath(-10, 100, 2)).toThrow('Width, height, and exponent must be positive numbers');
  });

  it('should throw error for invalid exponent', () => {
    expect(() => getSuperellipsePath(100, 100, 0)).toThrow('Width, height, and exponent must be positive numbers');
    expect(() => getSuperellipsePath(100, 100, -1)).toThrow('Width, height, and exponent must be positive numbers');
  });

  it('should be deterministic (same input = same output)', () => {
    const path1 = getSuperellipsePath(100, 100, 2);
    const path2 = getSuperellipsePath(100, 100, 2);
    
    expect(path1).toBe(path2);
  });

  it('should respect precision option', () => {
    const pathLowPrecision = getSuperellipsePath(100, 100, 2, { precision: 0 });
    const pathHighPrecision = getSuperellipsePath(100, 100, 2, { precision: 4 });
    
    expect(pathLowPrecision.length).toBeLessThan(pathHighPrecision.length);
  });

  it('should respect steps option', () => {
    const pathFewSteps = getSuperellipsePath(100, 100, 2, { steps: 10 });
    const pathManySteps = getSuperellipsePath(100, 100, 2, { steps: 1000 });
    
    expect(pathFewSteps.length).toBeLessThan(pathManySteps.length);
  });

  it('should handle edge case: very small dimensions', () => {
    const path = getSuperellipsePath(1, 1, 2);
    expect(path).toBeTruthy();
    expect(path).toContain('M');
  });

  it('should handle edge case: very large dimensions', () => {
    const path = getSuperellipsePath(10000, 10000, 2);
    expect(path).toBeTruthy();
    expect(path).toContain('M');
  });

  it('should handle edge case: extreme exponents', () => {
    const pathLow = getSuperellipsePath(100, 100, 0.5);
    const pathHigh = getSuperellipsePath(100, 100, 100);
    
    expect(pathLow).toBeTruthy();
    expect(pathHigh).toBeTruthy();
  });
});

describe('getAsymmetricSuperellipsePath', () => {
  const symmetricCorners: CornerExponents = {
    topLeft: 2,
    topRight: 2,
    bottomRight: 2,
    bottomLeft: 2,
  };

  const asymmetricCorners: CornerExponents = {
    topLeft: 1,
    topRight: 5,
    bottomRight: 10,
    bottomLeft: 3,
  };

  it('should generate a valid SVG path', () => {
    const path = getAsymmetricSuperellipsePath(100, 100, symmetricCorners);
    expect(path).toContain('M');
    expect(path).toContain('L');
    expect(path).toContain('Z');
  });

  it('should handle symmetric corners', () => {
    const path = getAsymmetricSuperellipsePath(100, 100, symmetricCorners);
    expect(path).toBeTruthy();
    expect(path.length).toBeGreaterThan(100);
  });

  it('should handle asymmetric corners', () => {
    const path = getAsymmetricSuperellipsePath(100, 100, asymmetricCorners);
    expect(path).toBeTruthy();
    expect(path.length).toBeGreaterThan(100);
  });

  it('should produce different paths for different corner configurations', () => {
    const path1 = getAsymmetricSuperellipsePath(100, 100, symmetricCorners);
    const path2 = getAsymmetricSuperellipsePath(100, 100, asymmetricCorners);
    
    expect(path1).not.toBe(path2);
  });

  it('should throw error for invalid dimensions', () => {
    expect(() => getAsymmetricSuperellipsePath(0, 100, symmetricCorners)).toThrow('Width and height must be positive numbers');
    expect(() => getAsymmetricSuperellipsePath(100, -1, symmetricCorners)).toThrow('Width and height must be positive numbers');
  });

  it('should be deterministic', () => {
    const path1 = getAsymmetricSuperellipsePath(100, 100, asymmetricCorners);
    const path2 = getAsymmetricSuperellipsePath(100, 100, asymmetricCorners);
    
    expect(path1).toBe(path2);
  });

  it('should handle different aspect ratios', () => {
    const path1 = getAsymmetricSuperellipsePath(200, 100, asymmetricCorners);
    const path2 = getAsymmetricSuperellipsePath(100, 200, asymmetricCorners);
    
    expect(path1).toBeTruthy();
    expect(path2).toBeTruthy();
    expect(path1).not.toBe(path2);
  });

  it('should respect precision option', () => {
    const pathLowPrecision = getAsymmetricSuperellipsePath(100, 100, asymmetricCorners, { precision: 0 });
    const pathHighPrecision = getAsymmetricSuperellipsePath(100, 100, asymmetricCorners, { precision: 4 });
    
    expect(pathLowPrecision.length).toBeLessThan(pathHighPrecision.length);
  });
});
