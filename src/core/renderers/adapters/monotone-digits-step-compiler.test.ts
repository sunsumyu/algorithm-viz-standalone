// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  parseNumber,
  buildMonotoneDigitsSteps,
  MONOTONE_DIGITS_CODE_LINES,
} from './monotone-digits-step-compiler';
import { renderMonotoneDigitsCanvas } from './monotone-digits-canvas-adapter';

describe('monotone-digits-step-compiler and canvas-adapter', () => {
  it('parses raw number inputs with fallback', () => {
    expect(parseNumber('123')).toBe(123);
    expect(parseNumber(456)).toBe(456);
    expect(parseNumber('invalid')).toBe(332);
  });

  it('handles single digit gracefully', () => {
    const steps = buildMonotoneDigitsSteps(7);
    expect(steps.length).toBe(1);
    expect(steps[0].action).toBe('done');
    expect(steps[0].line).toBeGreaterThanOrEqual(1);

    const container = document.createElement('div');
    renderMonotoneDigitsCanvas(container, steps[0]);
    expect(container.innerHTML).toContain('原输入数值');
  });

  it('generates steps correctly for 332 and renders canvas', () => {
    const steps = buildMonotoneDigitsSteps(332);
    expect(steps.length).toBeGreaterThan(2);

    const last = steps[steps.length - 1];
    expect(last.action).toBe('done');
    expect(parseInt(last.digits.join(''), 10)).toBe(299);
    expect(last.line).toBeGreaterThanOrEqual(1);

    const container = document.createElement('div');
    renderMonotoneDigitsCanvas(container, steps[1]);
    expect(container.innerHTML).toContain('置9起始位 flag');
  });
});
