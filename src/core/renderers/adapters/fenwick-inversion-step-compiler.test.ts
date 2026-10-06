import { describe, it, expect } from 'vitest';
import {
  buildFenwickInversionSteps,
  discretize,
  FENWICK_INVERSION_CODES,
  FENWICK_INVERSION_LINES,
} from './fenwick-inversion-step-compiler';
import { renderFenwickInversionCanvas } from './fenwick-inversion-canvas-adapter';

describe('FenwickInversion 109 Step Compiler & Canvas Adapter', () => {
  const nums = [5, 4, 2, 6, 3, 1];

  it('should discretize nums keeping relative order', () => {
    const ranks = discretize(nums);
    expect(ranks).toEqual([5, 4, 2, 6, 3, 1]);

    const sorted = [1, 2, 3, 4, 5];
    expect(discretize(sorted)).toEqual([1, 2, 3, 4, 5]);

    const reversed = [5, 4, 3, 2, 1];
    expect(discretize(reversed)).toEqual([5, 4, 3, 2, 1]);
  });

  it('should generate valid inversion count steps', () => {
    const steps = buildFenwickInversionSteps(nums);

    expect(steps.length).toBeGreaterThan(5);

    // Initial step
    expect(steps[0].codeLine).toEqual(FENWICK_INVERSION_LINES.entry);

    // Final step
    const lastStep = steps[steps.length - 1];
    expect(lastStep.decision).toContain('算法完成');
    expect(lastStep.totalInversions).toBe(11);
    expect(lastStep.statusBadge?.type).toBe('success');

    for (const step of steps) {
      expect(step.nums.length).toBe(nums.length);
      expect(step.ranks.length).toBe(nums.length);
      expect(step.bitTree.length).toBe(nums.length + 1);
      expect(step.codeLine).toBeDefined();
    }
  });

  it('should yield 0 inversions for sorted array', () => {
    const steps = buildFenwickInversionSteps([1, 2, 3, 4, 5]);
    expect(steps[steps.length - 1].totalInversions).toBe(0);
  });

  it('should contain 1-based code lines across languages', () => {
    expect(FENWICK_INVERSION_CODES.java.join('\n')).toContain('countInversions');
    expect(FENWICK_INVERSION_CODES.cpp.join('\n')).toContain('countInversions');
    expect(FENWICK_INVERSION_CODES.python.join('\n')).toContain('count_inversions');
    expect(FENWICK_INVERSION_CODES.javascript.join('\n')).toContain('countInversions');

    for (const [, line] of Object.entries(FENWICK_INVERSION_LINES)) {
      const target = line as unknown as Record<string, number>;
      expect(target.java).toBeGreaterThan(0);
      expect(target.cpp).toBeGreaterThan(0);
      expect(target.python).toBeGreaterThan(0);
      expect(target.javascript).toBeGreaterThan(0);
    }
  });

  it('should render canvas into mock container without crashing', () => {
    const steps = buildFenwickInversionSteps(nums);
    const container = { innerHTML: '' } as unknown as HTMLElement;
    renderFenwickInversionCanvas(container, steps[0]);

    expect(container.innerHTML).toContain('倒序扫描序列');
    expect(container.innerHTML).toContain('逆序对动态统计看板');
  });
});
