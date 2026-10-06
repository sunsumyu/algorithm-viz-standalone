import { describe, it, expect } from 'vitest';
import {
  buildIntervalMergeSteps,
  INTERVAL_MERGE_SEGMENT_TREE_CODES,
  INTERVAL_MERGE_SEGMENT_TREE_LINES,
} from './interval-merge-step-compiler';
import { renderIntervalMergeCanvas } from './interval-merge-canvas-adapter';

describe('IntervalMergeSegmentTree 113 Step Compiler & Canvas Adapter', () => {
  const nums = [2, -4, 3, -1, 2, -3, 4, -1];

  it('should compute maximum subarray sum correctly', () => {
    const steps = buildIntervalMergeSteps(nums);

    expect(steps.length).toBeGreaterThan(5);
    expect(steps[0].codeLine).toEqual(INTERVAL_MERGE_SEGMENT_TREE_LINES.entry);

    const lastStep = steps[steps.length - 1];
    // 最大连续子段: [3, -1, 2, -3, 4] = 5
    expect(lastStep.bestMaxSum).toBe(5);
    expect(lastStep.decision).toContain('线段树区间合并建树完成');
    expect(lastStep.statusBadge?.type).toBe('success');

    for (const step of steps) {
      expect(step.nums.length).toBe(nums.length);
      expect(step.codeLine).toBeDefined();
    }
  });

  it('should contain 1-based code lines across languages', () => {
    expect(INTERVAL_MERGE_SEGMENT_TREE_CODES.java.join('\n')).toContain('pushUp');
    expect(INTERVAL_MERGE_SEGMENT_TREE_CODES.cpp.join('\n')).toContain('pushUp');
    expect(INTERVAL_MERGE_SEGMENT_TREE_CODES.python.join('\n')).toContain('push_up');
    expect(INTERVAL_MERGE_SEGMENT_TREE_CODES.javascript.join('\n')).toContain('pushUp');

    for (const [, line] of Object.entries(INTERVAL_MERGE_SEGMENT_TREE_LINES)) {
      const target = line as unknown as Record<string, number>;
      expect(target.java).toBeGreaterThan(0);
      expect(target.cpp).toBeGreaterThan(0);
      expect(target.python).toBeGreaterThan(0);
      expect(target.javascript).toBeGreaterThan(0);
    }
  });

  it('should render canvas into mock container without crashing', () => {
    const steps = buildIntervalMergeSteps(nums);
    const container = { innerHTML: '' } as unknown as HTMLElement;
    renderIntervalMergeCanvas(container, steps[steps.length - 1]);

    expect(container.innerHTML).toContain('区间合并节点四元组展板');
    expect(container.innerHTML).toContain('区间合并核心公式');
  });
});
