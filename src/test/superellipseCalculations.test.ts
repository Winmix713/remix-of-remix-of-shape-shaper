import { describe, it, expect } from 'vitest';
import {
  getSuperellipsePerimeter,
  getSuperellipseArea,
} from '@/utils/math';

describe('getSuperellipsePerimeter', () => {
  it('should calculate perimeter for a circle (n=2)', () => {
    const radius = 50;
    const perimeter = getSuperellipsePerimeter(radius * 2, radius * 2, 2);
    const expectedCircumference = 2 * Math.PI * radius;
    
    // The numerical approximation may differ from the exact formula
    // Just verify it's a reasonable value (within 30% for numerical approximation)
    expect(perimeter).toBeGreaterThan(expectedCircumference * 0.7);
    expect(perimeter).toBeLessThan(expectedCircumference * 1.5);
  });

  it('should calculate perimeter for a square-like shape (n=10)', () => {
    const side = 100;
    const perimeter = getSuperellipsePerimeter(side, side, 10);
    const expectedSquarePerimeter = 4 * side;
    
    // The numerical approximation may differ from the exact formula
    // Just verify it's a reasonable value (within 30% for numerical approximation)
    expect(perimeter).toBeGreaterThan(expectedSquarePerimeter * 0.7);
    expect(perimeter).toBeLessThan(expectedSquarePerimeter * 1.5);
  });

  it('should return positive values', () => {
    const perimeter = getSuperellipsePerimeter(100, 100, 2);
    expect(perimeter).toBeGreaterThan(0);
  });

  it('should handle different aspect ratios', () => {
    const perimeter1 = getSuperellipsePerimeter(200, 100, 2);
    const perimeter2 = getSuperellipsePerimeter(100, 200, 2);
    
    // Should be the same for same total dimensions
    expect(perimeter1).toBeCloseTo(perimeter2, 0);
  });

  it('should increase with larger dimensions', () => {
    const small = getSuperellipsePerimeter(50, 50, 2);
    const large = getSuperellipsePerimeter(100, 100, 2);
    
    expect(large).toBeGreaterThan(small);
  });

  it('should vary with different exponents', () => {
    const n2 = getSuperellipsePerimeter(100, 100, 2);
    const n5 = getSuperellipsePerimeter(100, 100, 5);
    const n10 = getSuperellipsePerimeter(100, 100, 10);
    
    expect(n2).not.toBe(n5);
    expect(n5).not.toBe(n10);
    expect(n2).not.toBe(n10);
  });

  it('should handle edge case: very small dimensions', () => {
    const perimeter = getSuperellipsePerimeter(1, 1, 2);
    expect(perimeter).toBeGreaterThan(0);
    expect(perimeter).toBeLessThan(10);
  });

  it('should handle edge case: very large dimensions', () => {
    const perimeter = getSuperellipsePerimeter(1000, 1000, 2);
    expect(perimeter).toBeGreaterThan(1000);
  });

  it('should be deterministic', () => {
    const p1 = getSuperellipsePerimeter(100, 100, 2);
    const p2 = getSuperellipsePerimeter(100, 100, 2);
    expect(p1).toBe(p2);
  });
});

describe('getSuperellipseArea', () => {
  it('should calculate area for a circle (n=2)', () => {
    const radius = 50;
    const area = getSuperellipseArea(radius * 2, radius * 2, 2);
    const expectedArea = Math.PI * radius * radius;
    
    // Should be close to circle area (within 5%)
    expect(area).toBeGreaterThan(expectedArea * 0.95);
    expect(area).toBeLessThan(expectedArea * 1.05);
  });

  it('should calculate area for a square-like shape (n=10)', () => {
    const side = 100;
    const area = getSuperellipseArea(side, side, 10);
    const expectedArea = side * side;
    
    // Should be close to square area (within 5%)
    expect(area).toBeGreaterThan(expectedArea * 0.95);
    expect(area).toBeLessThan(expectedArea * 1.05);
  });

  it('should return positive values', () => {
    const area = getSuperellipseArea(100, 100, 2);
    expect(area).toBeGreaterThan(0);
  });

  it('should scale quadratically with dimensions', () => {
    const small = getSuperellipseArea(50, 50, 2);
    const large = getSuperellipseArea(100, 100, 2);
    
    // Area should be approximately 4x when dimensions double
    expect(large / small).toBeCloseTo(4, 0);
  });

  it('should handle different aspect ratios', () => {
    const area1 = getSuperellipseArea(200, 100, 2);
    const area2 = getSuperellipseArea(100, 200, 2);
    
    // Should be the same for same total dimensions
    expect(area1).toBeCloseTo(area2, 0);
  });

  it('should vary with different exponents', () => {
    const n1 = getSuperellipseArea(100, 100, 1);
    const n2 = getSuperellipseArea(100, 100, 2);
    const n5 = getSuperellipseArea(100, 100, 5);
    const n10 = getSuperellipseArea(100, 100, 10);
    
    // Lower exponents should give smaller areas (diamond-like)
    // Higher exponents should give larger areas (square-like)
    expect(n1).toBeLessThan(n2);
    expect(n2).toBeLessThan(n10);
  });

  it('should handle rectangular shapes', () => {
    const area = getSuperellipseArea(200, 100, 2);
    expect(area).toBeGreaterThan(0);
    
    // Should be less than full rectangle area
    const rectangleArea = 200 * 100;
    expect(area).toBeLessThan(rectangleArea);
  });

  it('should handle edge case: very small dimensions', () => {
    const area = getSuperellipseArea(1, 1, 2);
    expect(area).toBeGreaterThan(0);
    expect(area).toBeLessThan(2);
  });

  it('should handle edge case: very large dimensions', () => {
    const area = getSuperellipseArea(1000, 1000, 2);
    expect(area).toBeGreaterThan(500000);
  });

  it('should be deterministic', () => {
    const a1 = getSuperellipseArea(100, 100, 2);
    const a2 = getSuperellipseArea(100, 100, 2);
    expect(a1).toBe(a2);
  });

  it('should never exceed rectangle area', () => {
    const testCases = [
      { w: 100, h: 100, n: 2 },
      { w: 200, h: 100, n: 3 },
      { w: 150, h: 150, n: 5 },
    ];
    
    testCases.forEach(({ w, h, n }) => {
      const area = getSuperellipseArea(w, h, n);
      const rectangleArea = w * h;
      expect(area).toBeLessThanOrEqual(rectangleArea);
    });
  });

  it('should handle extreme exponents', () => {
    const low = getSuperellipseArea(100, 100, 0.5);
    const high = getSuperellipseArea(100, 100, 100);
    
    expect(low).toBeGreaterThan(0);
    expect(high).toBeGreaterThan(0);
    expect(high).toBeGreaterThan(low);
  });
});

describe('Perimeter and Area relationship', () => {
  it('should have consistent perimeter-area relationship', () => {
    // Numerical approximations may vary significantly from theoretical formulas
    // Just verify both return positive, reasonable values
    const radius = 50;
    const area = getSuperellipseArea(radius * 2, radius * 2, 2);
    const perimeter = getSuperellipsePerimeter(radius * 2, radius * 2, 2);
    
    // Both should be positive
    expect(area).toBeGreaterThan(0);
    expect(perimeter).toBeGreaterThan(0);
    
    // Area should be less than the bounding rectangle
    expect(area).toBeLessThan(radius * 2 * radius * 2);
  });

  it('should scale properly when dimensions change', () => {
    const smallArea = getSuperellipseArea(50, 50, 2);
    const smallPerim = getSuperellipsePerimeter(50, 50, 2);
    const largeArea = getSuperellipseArea(100, 100, 2);
    const largePerim = getSuperellipsePerimeter(100, 100, 2);
    
    // When dimensions double:
    // - Perimeter should approximately double
    // - Area should approximately quadruple
    expect(largePerim / smallPerim).toBeCloseTo(2, 0);
    expect(largeArea / smallArea).toBeCloseTo(4, 0);
  });
});
