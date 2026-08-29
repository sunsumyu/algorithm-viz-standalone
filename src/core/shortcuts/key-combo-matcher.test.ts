import { describe, it, expect } from 'vitest';
import {
  normalizeSingleKey,
  normalizeKeyCombo,
  eventToKeyCombo,
  formatKeyComboDisplay
} from './key-combo-matcher';

describe('KeyComboMatcher Guard Tests', () => {
  describe('normalizeSingleKey', () => {
    it('should normalize space representations to "Space"', () => {
      expect(normalizeSingleKey(' ')).toBe('Space');
      expect(normalizeSingleKey('space')).toBe('Space');
      expect(normalizeSingleKey('spacebar')).toBe('Space');
    });

    it('should normalize arrow keys', () => {
      expect(normalizeSingleKey('arrowright')).toBe('ArrowRight');
      expect(normalizeSingleKey('right')).toBe('ArrowRight');
      expect(normalizeSingleKey('arrowleft')).toBe('ArrowLeft');
      expect(normalizeSingleKey('left')).toBe('ArrowLeft');
    });

    it('should normalize brackets and symbols', () => {
      expect(normalizeSingleKey('[')).toBe('[');
      expect(normalizeSingleKey(']')).toBe(']');
      expect(normalizeSingleKey('bracketleft')).toBe('[');
      expect(normalizeSingleKey('bracketright')).toBe(']');
      expect(normalizeSingleKey('=')).toBe('=');
      expect(normalizeSingleKey('-')).toBe('-');
      expect(normalizeSingleKey('?')).toBe('?');
    });

    it('should uppercase single letters and numbers', () => {
      expect(normalizeSingleKey('k')).toBe('K');
      expect(normalizeSingleKey('m')).toBe('M');
      expect(normalizeSingleKey('1')).toBe('1');
    });
  });

  describe('normalizeKeyCombo', () => {
    it('should order modifiers canonically (Ctrl+Alt+Shift+Meta+Key)', () => {
      expect(normalizeKeyCombo('k+ctrl')).toBe('Ctrl+K');
      expect(normalizeKeyCombo('shift+alt+ctrl+p')).toBe('Ctrl+Alt+Shift+P');
      expect(normalizeKeyCombo('meta+ctrl+k')).toBe('Ctrl+Meta+K');
    });

    it('should handle single key shortcuts', () => {
      expect(normalizeKeyCombo('space')).toBe('Space');
      expect(normalizeKeyCombo('[')).toBe('[');
      expect(normalizeKeyCombo(']')).toBe(']');
      expect(normalizeKeyCombo('r')).toBe('R');
      expect(normalizeKeyCombo('escape')).toBe('Escape');
    });

    it('should normalize Shift+/ to ?', () => {
      expect(normalizeKeyCombo('shift+/')).toBe('?');
      expect(normalizeKeyCombo('ctrl+shift+/')).toBe('Ctrl+?');
    });
  });

  describe('eventToKeyCombo', () => {
    it('should parse event with modifiers', () => {
      const event = {
        key: 'k',
        ctrlKey: true
      };
      expect(eventToKeyCombo(event)).toBe('Ctrl+K');
    });

    it('should parse Space key', () => {
      const event = {
        key: ' '
      };
      expect(eventToKeyCombo(event)).toBe('Space');
    });

    it('should parse ? without duplicating Shift', () => {
      const event = {
        key: '?',
        shiftKey: true
      };
      expect(eventToKeyCombo(event)).toBe('?');
    });

    it('should parse BracketLeft [ and BracketRight ]', () => {
      expect(eventToKeyCombo({ key: '[' })).toBe('[');
      expect(eventToKeyCombo({ key: ']' })).toBe(']');
    });
  });

  describe('formatKeyComboDisplay', () => {
    it('should split combo into UI badge array with special symbols', () => {
      expect(formatKeyComboDisplay('Ctrl+K')).toEqual(['Ctrl', 'K']);
      expect(formatKeyComboDisplay('Alt+ArrowLeft')).toEqual(['Alt', '←']);
      expect(formatKeyComboDisplay('Alt+ArrowRight')).toEqual(['Alt', '→']);
      expect(formatKeyComboDisplay('Space')).toEqual(['Space']);
      expect(formatKeyComboDisplay('Escape')).toEqual(['Esc']);
      expect(formatKeyComboDisplay('[')).toEqual(['[']);
      expect(formatKeyComboDisplay(']')).toEqual([']']);
    });
  });
});
