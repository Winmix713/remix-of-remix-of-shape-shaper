import { describe, it, expect } from 'vitest';
import {
  hexToRgb,
  rgbToHex,
  calculateLuminance,
  isValidHex,
  normalizeHex,
  isDarkColor,
  getContrastRatio,
  adjustBrightness,
} from '@/utils/colorPalette';

describe('hexToRgb', () => {
  it('should convert valid hex colors to RGB', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
    expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('should handle hex colors without # prefix', () => {
    // hexToRgb validates format, so it needs # prefix
    // Use normalizeHex first if you have hex without prefix
    expect(hexToRgb('FF0000')).toBeNull();
    
    // This is the correct way to handle it:
    const normalized = normalizeHex('FF0000');
    expect(hexToRgb(normalized)).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('should handle shorthand hex colors', () => {
    expect(hexToRgb('#F00')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#0F0')).toEqual({ r: 0, g: 255, b: 0 });
    expect(hexToRgb('#00F')).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('should handle case-insensitive hex colors', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#Ff0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('should return null for invalid hex formats', () => {
    expect(hexToRgb('invalid')).toBeNull();
    expect(hexToRgb('#GG0000')).toBeNull();
    expect(hexToRgb('#FF00')).toBeNull();
    expect(hexToRgb('##FF0000')).toBeNull();
    expect(hexToRgb('')).toBeNull();
  });

  it('should handle various color values', () => {
    expect(hexToRgb('#808080')).toEqual({ r: 128, g: 128, b: 128 });
    expect(hexToRgb('#123456')).toEqual({ r: 18, g: 52, b: 86 });
  });
});

describe('rgbToHex', () => {
  it('should convert valid RGB to hex', () => {
    expect(rgbToHex(0, 0, 0)).toBe('#000000');
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
    expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
    expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
    expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
  });

  it('should handle RGB values in mid-range', () => {
    expect(rgbToHex(128, 128, 128)).toBe('#808080');
    expect(rgbToHex(18, 52, 86)).toBe('#123456');
  });

  it('should throw error for out-of-range values', () => {
    // With validation enabled, out-of-range values throw errors instead of clamping
    expect(() => rgbToHex(300, 0, 0)).toThrow();
    expect(() => rgbToHex(-10, 0, 0)).toThrow();
  });

  it('should throw error for invalid RGB values', () => {
    expect(() => rgbToHex(256, 0, 0)).toThrow();
    expect(() => rgbToHex(-1, 0, 0)).toThrow();
    expect(() => rgbToHex(0, 300, 0)).toThrow();
  });

  it('should handle decimal RGB values by rounding', () => {
    expect(rgbToHex(127.4, 127.4, 127.4)).toBe('#7f7f7f');
    expect(rgbToHex(127.6, 127.6, 127.6)).toBe('#808080');
  });
});

describe('hexToRgb and rgbToHex round-trip', () => {
  it('should convert hex to RGB and back', () => {
    const testColors = ['#FF0000', '#00FF00', '#0000FF', '#808080', '#FFFFFF', '#000000'];
    
    testColors.forEach(color => {
      const rgb = hexToRgb(color);
      expect(rgb).not.toBeNull();
      if (rgb) {
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        expect(hex.toUpperCase()).toBe(color.toUpperCase());
      }
    });
  });
});

describe('isValidHex', () => {
  it('should validate correct hex formats', () => {
    expect(isValidHex('#FF0000')).toBe(true);
    expect(isValidHex('#F00')).toBe(true);
    expect(isValidHex('#000000')).toBe(true);
    expect(isValidHex('#fff')).toBe(true);
  });

  it('should reject invalid hex formats', () => {
    expect(isValidHex('FF0000')).toBe(false); // Missing #
    expect(isValidHex('#GG0000')).toBe(false); // Invalid character
    expect(isValidHex('#FF00')).toBe(false); // Wrong length
    expect(isValidHex('invalid')).toBe(false);
    expect(isValidHex('')).toBe(false);
  });

  it('should handle case-insensitive validation', () => {
    expect(isValidHex('#ff0000')).toBe(true);
    expect(isValidHex('#FF0000')).toBe(true);
    expect(isValidHex('#Ff0000')).toBe(true);
  });
});

describe('normalizeHex', () => {
  it('should expand shorthand hex colors', () => {
    expect(normalizeHex('#F00')).toBe('#FF0000');
    expect(normalizeHex('#0F0')).toBe('#00FF00');
    expect(normalizeHex('#00F')).toBe('#0000FF');
  });

  it('should add # prefix if missing', () => {
    expect(normalizeHex('FF0000')).toBe('#FF0000');
  });

  it('should uppercase hex colors', () => {
    expect(normalizeHex('#ff0000')).toBe('#FF0000');
    expect(normalizeHex('#f00')).toBe('#FF0000');
  });

  it('should leave full hex colors unchanged (except case)', () => {
    expect(normalizeHex('#FF0000')).toBe('#FF0000');
    expect(normalizeHex('#000000')).toBe('#000000');
  });
});

describe('calculateLuminance', () => {
  it('should calculate luminance for black and white', () => {
    expect(calculateLuminance('#000000')).toBe(0);
    expect(calculateLuminance('#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('should calculate luminance for primary colors', () => {
    const redLum = calculateLuminance('#FF0000');
    const greenLum = calculateLuminance('#00FF00');
    const blueLum = calculateLuminance('#0000FF');
    
    expect(redLum).toBeGreaterThan(0);
    expect(greenLum).toBeGreaterThan(redLum); // Green has highest luminance
    expect(blueLum).toBeGreaterThan(0);
    expect(blueLum).toBeLessThan(redLum);
  });

  it('should calculate luminance for gray colors', () => {
    const darkGray = calculateLuminance('#404040');
    const midGray = calculateLuminance('#808080');
    const lightGray = calculateLuminance('#C0C0C0');
    
    expect(darkGray).toBeLessThan(midGray);
    expect(midGray).toBeLessThan(lightGray);
  });

  it('should throw error for invalid hex colors', () => {
    expect(() => calculateLuminance('invalid')).toThrow();
    expect(() => calculateLuminance('#GG0000')).toThrow();
  });

  it('should return values between 0 and 1', () => {
    const testColors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#808080', '#FFFFFF'];
    
    testColors.forEach(color => {
      const lum = calculateLuminance(color);
      expect(lum).toBeGreaterThanOrEqual(0);
      expect(lum).toBeLessThanOrEqual(1);
    });
  });
});

describe('isDarkColor', () => {
  it('should identify dark colors', () => {
    expect(isDarkColor('#000000')).toBe(true);
    expect(isDarkColor('#404040')).toBe(true);
    expect(isDarkColor('#0000FF')).toBe(true);
  });

  it('should identify light colors', () => {
    expect(isDarkColor('#FFFFFF')).toBe(false);
    expect(isDarkColor('#C0C0C0')).toBe(false);
    expect(isDarkColor('#00FF00')).toBe(false);
  });

  it('should handle colors near the threshold', () => {
    const result = isDarkColor('#808080');
    expect(typeof result).toBe('boolean');
  });
});

describe('getContrastRatio', () => {
  it('should calculate contrast between black and white', () => {
    const contrast = getContrastRatio('#000000', '#FFFFFF');
    expect(contrast).toBeCloseTo(21, 0); // Maximum contrast ratio
  });

  it('should calculate contrast for identical colors', () => {
    const contrast = getContrastRatio('#FF0000', '#FF0000');
    expect(contrast).toBe(1); // No contrast
  });

  it('should be symmetric (order doesn\'t matter)', () => {
    const contrast1 = getContrastRatio('#FF0000', '#00FF00');
    const contrast2 = getContrastRatio('#00FF00', '#FF0000');
    expect(contrast1).toBe(contrast2);
  });

  it('should calculate valid contrast ratios', () => {
    const testPairs = [
      ['#000000', '#808080'],
      ['#FFFFFF', '#808080'],
      ['#FF0000', '#0000FF'],
    ];
    
    testPairs.forEach(([color1, color2]) => {
      const contrast = getContrastRatio(color1, color2);
      expect(contrast).toBeGreaterThanOrEqual(1);
      expect(contrast).toBeLessThanOrEqual(21);
    });
  });
});

describe('adjustBrightness', () => {
  it('should lighten colors with positive amount', () => {
    const original = '#808080';
    const lighter = adjustBrightness(original, 20);
    
    expect(lighter).not.toBe(original);
    const originalLum = calculateLuminance(original);
    const lighterLum = calculateLuminance(lighter);
    expect(lighterLum).toBeGreaterThan(originalLum);
  });

  it('should darken colors with negative amount', () => {
    const original = '#808080';
    const darker = adjustBrightness(original, -20);
    
    expect(darker).not.toBe(original);
    const originalLum = calculateLuminance(original);
    const darkerLum = calculateLuminance(darker);
    expect(darkerLum).toBeLessThan(originalLum);
  });

  it('should not change color with zero amount', () => {
    const original = '#808080';
    const unchanged = adjustBrightness(original, 0);
    expect(unchanged).toBe(original);
  });

  it('should clamp values at boundaries', () => {
    const white = adjustBrightness('#FFFFFF', 100);
    expect(white.toUpperCase()).toBe('#FFFFFF'); // Can't get lighter
    
    const black = adjustBrightness('#000000', -100);
    expect(black.toUpperCase()).toBe('#000000'); // Can't get darker
  });

  it('should handle invalid hex gracefully', () => {
    const result = adjustBrightness('invalid', 20);
    expect(result).toBe('invalid'); // Returns original if invalid
  });
});
