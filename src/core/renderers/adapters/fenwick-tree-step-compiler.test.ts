import { describe, it, expect } from 'vitest';
import {
  buildFenwickTreeSteps,
  lowbit,
  FENWICK_TREE_CODES,
  FENWICK_TREE_LINES,
} from './fenwick-tree-step-compiler';
import { renderFenwickTreeCanvas } from './fenwick-tree-canvas-adapter';

describe('FenwickTree 108 Step Compiler & Canvas Adapter', () => {
  const nums = [1, 3, 5, 7, 9, 11];

  it('should compute lowbit correctly', () => {
    expect(lowbit(1)).toBe(1);
    expect(lowbit(2)).toBe(2);
    expect(lowbit(3)).toBe(1);
    expect(lowbit(4)).toBe(4);
    expect(lowbit(6)).toBe(2);
    expect(lowbit(12)).toBe(4);
    expect(lowbit(16)).toBe(16);
  });

  it('should generate valid add steps', () => {
    const steps = buildFenwickTreeSteps(nums, 'add', 3, 5);

    expect(steps.length).toBeGreaterThan(2);

    // Initial step
    expect(steps[0].codeLine).toEqual(FENWICK_TREE_LINES.entry);
    expect(steps[0].opType).toBe('idle');

    // Final step
    const lastStep = steps[steps.length - 1];
    expect(lastStep.decision).toContain('单点增加完成');
    expect(lastStep.statusBadge?.type).toBe('success');

    for (const step of steps) {
      expect(step.nums.length).toBe(nums.length);
      expect(step.tree.length).toBe(nums.length + 1);
      expect(step.codeLine).toBeDefined();
    }
  });

  it('should generate valid prefix query steps', () => {
    const steps = buildFenwickTreeSteps(nums, 'query', 4);

    expect(steps.length).toBeGreaterThan(2);

    // Initial step
    expect(steps[0].codeLine).toEqual(FENWICK_TREE_LINES.entry);

    // Final step
    const lastStep = steps[steps.length - 1];
    expect(lastStep.decision).toContain('前缀和查询完成');
    expect(lastStep.currentSum).toBe(1 + 3 + 5 + 7); // 16
    expect(lastStep.statusBadge?.type).toBe('success');
  });

  it('should contain 1-based code lines across languages', () => {
    expect(FENWICK_TREE_CODES.java.join('\n')).toContain('add');
    expect(FENWICK_TREE_CODES.cpp.join('\n')).toContain('add');
    expect(FENWICK_TREE_CODES.python.join('\n')).toContain('add');
    expect(FENWICK_TREE_CODES.javascript.join('\n')).toContain('add');

    for (const [, line] of Object.entries(FENWICK_TREE_LINES)) {
      const target = line as unknown as Record<string, number>;
      expect(target.java).toBeGreaterThan(0);
      expect(target.cpp).toBeGreaterThan(0);
      expect(target.python).toBeGreaterThan(0);
      expect(target.javascript).toBeGreaterThan(0);
    }
  });

  it('should render canvas into mock container without crashing', () => {
    const steps = buildFenwickTreeSteps(nums, 'query', 4);
    const container = { innerHTML: '' } as unknown as HTMLElement;
    renderFenwickTreeCanvas(container, steps[0]);

    expect(container.innerHTML).toContain('树状数组状态看板');
  });
});
