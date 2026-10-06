import { describe, it, expect } from 'vitest';
import {
  buildValueSegTreeSteps,
  VALUE_SEG_TREE_CODES,
  VALUE_SEG_TREE_CODE_LINES,
} from './value-segment-tree-112-step-compiler';
import { renderValueSegTreeCanvas } from './value-segment-tree-112-canvas-adapter';

describe('ValueSegmentTree 112 Step Compiler & Canvas Adapter', () => {
  it('should generate valid steps for kth smallest element query', () => {
    const nums = [3, 1, 5, 2, 7, 3];
    const k = 4;
    const steps = buildValueSegTreeSteps(nums, k, 8);

    expect(steps.length).toBeGreaterThan(10);

    // Initial step
    expect(steps[0].curOp).toBe('初始化');
    expect(steps[0].codeLine).toEqual(VALUE_SEG_TREE_CODE_LINES.init);

    // Final step
    const lastStep = steps[steps.length - 1];
    expect(lastStep.curOp).toBe('查询完成');
    expect(lastStep.foundVal).toBe(3);
    expect(lastStep.codeLine).toEqual(VALUE_SEG_TREE_CODE_LINES.queryHit);

    // All steps have codeLine and activeNodeId > 0
    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
      expect(step.activeNodeId).toBeGreaterThan(0);
      expect(step.nodes.length).toBeGreaterThan(0);
    }
  });

  it('should contain 1-based line mapping across 4 languages in code templates', () => {
    expect(VALUE_SEG_TREE_CODES.java).toContain('public class ValueSegmentTree');
    expect(VALUE_SEG_TREE_CODES.cpp).toContain('class ValueSegmentTree');
    expect(VALUE_SEG_TREE_CODES.python).toContain('class ValueSegmentTree:');
    expect(VALUE_SEG_TREE_CODES.typescript).toContain('class ValueSegmentTree');

    for (const [, line] of Object.entries(VALUE_SEG_TREE_CODE_LINES)) {
      const target = line as Record<string, number>;
      expect(target.java).toBeGreaterThan(0);
      expect(target.cpp).toBeGreaterThan(0);
      expect(target.python).toBeGreaterThan(0);
      expect(target.typescript).toBeGreaterThan(0);
    }
  });

  it('should render canvas into container without crashing', () => {
    const steps = buildValueSegTreeSteps([3, 1, 5, 2, 7, 3], 4, 8);
    const container = { innerHTML: '' } as unknown as HTMLElement;
    renderValueSegTreeCanvas(container, steps[0]);

    expect(container.innerHTML).toContain('当前操作类型');
    expect(container.innerHTML).toContain('目标排名 (K)');
    expect(container.innerHTML).toContain('线段树完全二叉树节点层级');
    expect(container.innerHTML).toContain('权值二分判定准则');
  });
});
