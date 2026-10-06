import { describe, it, expect } from 'vitest';
import {
  buildSegmentTreeSteps,
  SEGMENT_TREE_CODES,
  SEGMENT_TREE_LINES,
} from './segment-tree-step-compiler';
import { renderSegmentTreeCanvas } from './segment-tree-canvas-adapter';

describe('SegmentTree 110 Step Compiler & Canvas Adapter', () => {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8];
  const ql = 2;
  const qr = 5;
  const val = 3;

  it('should generate valid range update steps with lazy propagation', () => {
    const steps = buildSegmentTreeSteps(nums, ql, qr, val);

    expect(steps.length).toBeGreaterThan(5);

    // Initial step
    expect(steps[0].codeLine).toEqual(SEGMENT_TREE_LINES.entry);
    expect(steps[0].queryL).toBe(ql);
    expect(steps[0].queryR).toBe(qr);

    // Final step
    const lastStep = steps[steps.length - 1];
    expect(lastStep.decision).toContain('区间修改完成');
    expect(lastStep.statusBadge?.type).toBe('success');

    // All steps have nodes and valid codeLine
    for (const step of steps) {
      expect(step.nodes.length).toBeGreaterThan(0);
      expect(step.activeNodeId).toBeGreaterThan(0);
      expect(step.codeLine).toBeDefined();
    }
  });

  it('should contain 1-based code lines across languages', () => {
    expect(SEGMENT_TREE_CODES.java.join('\n')).toContain('updateRange');
    expect(SEGMENT_TREE_CODES.cpp.join('\n')).toContain('updateRange');
    expect(SEGMENT_TREE_CODES.python.join('\n')).toContain('update_range');
    expect(SEGMENT_TREE_CODES.javascript.join('\n')).toContain('updateRange');

    for (const [, line] of Object.entries(SEGMENT_TREE_LINES)) {
      const target = line as unknown as Record<string, number>;
      expect(target.java).toBeGreaterThan(0);
      expect(target.cpp).toBeGreaterThan(0);
      expect(target.python).toBeGreaterThan(0);
      expect(target.javascript).toBeGreaterThan(0);
    }
  });

  it('should render canvas into mock container without crashing', () => {
    const steps = buildSegmentTreeSteps(nums, ql, qr, val);
    const container = { innerHTML: '' } as unknown as HTMLElement;
    renderSegmentTreeCanvas(container, steps[0]);

    expect(container.innerHTML).toContain('线段树 Lazy Tag 运行状态');
    expect(container.innerHTML).toContain('线段树完全二叉树节点层级');
  });
});
