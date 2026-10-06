// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  buildTrimBst037Steps,
  TRIM_BST_NODES,
  TRIM_DISCARD_ALL_NODES,
  TRIM_SINGLE_NODE,
} from './trim-bst-step-compiler';
import { TrimBstCanvasAdapter } from './trim-bst-canvas-adapter';

describe('trim-bst-step-compiler (LC 669 / Class 037)', () => {
  it('示例 1 (修剪至 [1, 3], 最终保留 3 个节点)', () => {
    const steps = buildTrimBst037Steps();
    expect(steps.length).toBeGreaterThanOrEqual(6);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.metrics?.['最终节点数']).toBe(3);
    expect(lastStep.statusBadge?.text).toContain('修剪完成');
  });

  it('示例 2 (区间无交集，全树修剪剪空)', () => {
    const steps = buildTrimBst037Steps('3, 0, 4', 5, 10);
    expect(steps.length).toBe(4);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.metrics?.['最终节点数']).toBe(0);
    expect(lastStep.statusBadge?.text).toContain('裁剪为空树');
  });

  it('示例 3 (单节点无需修剪)', () => {
    const steps = buildTrimBst037Steps('2', 1, 3);
    expect(steps.length).toBe(3);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.metrics?.['最终节点数']).toBe(1);
  });

  it('Canvas 适配器正常挂载 SVG', () => {
    const container = document.createElement('div');
    const steps = buildTrimBst037Steps();
    TrimBstCanvasAdapter.renderCanvas(container, steps[0]);
    expect(container.querySelector('svg')).toBeDefined();
  });
});
