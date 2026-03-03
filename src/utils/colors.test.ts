import { describe, it, expect } from 'vitest';
import { getColorVariables } from './colors';

describe('getColorVariables', () => {
  it('returns known color variables for grey', () => {
    const { bg, text } = getColorVariables('grey');
    expect(bg).toBe('#707280');
    expect(text).toBe('#ffffff');
  });

  it('returns known color variables for blue', () => {
    const { bg, text } = getColorVariables('blue');
    expect(bg).toBe('#4b87ff');
    expect(text).toBe('#ffffff');
  });

  it('returns default grey for unknown color', () => {
    const { bg, text } = getColorVariables('unknown');
    expect(bg).toBe('#707280');
    expect(text).toBe('#ffffff');
  });

  it('returns correct values for all defined colors', () => {
    const colors = ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan'];
    for (const color of colors) {
      const result = getColorVariables(color);
      expect(result).toHaveProperty('bg');
      expect(result).toHaveProperty('text');
      expect(typeof result.bg).toBe('string');
      expect(typeof result.text).toBe('string');
    }
  });
});
