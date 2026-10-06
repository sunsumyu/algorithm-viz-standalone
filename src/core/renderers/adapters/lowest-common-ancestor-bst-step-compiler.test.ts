// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  buildLcaBst037Steps,
  BST_LCA_NODES,
} from './lowest-common-ancestor-bst-step-compiler';
import { LowestCommonAncestorBstCanvasAdapter } from './lowest-common-ancestor-bst-canvas-adapter';

describe('lowest-common-ancestor-bst-step-compiler (LC 235 / Class 037)', () => {
  it('默认用例 (p=3, q=5 -> LCA 节点 4)', () => {
    const steps = buildLcaBst037Steps();
    expect(steps.length).toBeGreaterThanOrEqual(4);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.metrics?.['分叉节点 (LCA)']).toBe('节点 4');
    expect(lastStep.statusBadge?.text).toContain('4');
  });

  it('分叉在根 (p=2, q=8 -> LCA 节点 6)', () => {
    const steps = buildLcaBst037Steps(undefined, 2, 8);
    expect(steps.length).toBeGreaterThanOrEqual(2);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.metrics?.['分叉节点 (LCA)']).toBe('节点 6');
  });

  it('分叉在左树自身 (p=2, q=4 -> LCA 节点 2)', () => {
    const steps = buildLcaBst037Steps(undefined, 2, 4);
    expect(steps.length).toBeGreaterThanOrEqual(2);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.metrics?.['分叉节点 (LCA)']).toBe('节点 2');
  });

  it('Canvas 适配器正常挂载 SVG', () => {
    const container = document.createElement('div');
    const steps = buildLcaBst037Steps();
    LowestCommonAncestorBstCanvasAdapter.renderCanvas(container, steps[0]);
    expect(container.querySelector('svg')).toBeDefined();
  });
});
