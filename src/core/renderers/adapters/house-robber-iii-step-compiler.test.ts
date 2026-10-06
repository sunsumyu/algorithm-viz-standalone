// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  buildHouseRobberIII037Steps,
  ROB_TREE_NODES,
  ROB_TREE_NODES_EX2,
  ROB_SINGLE_NODE,
} from './house-robber-iii-step-compiler';
import { HouseRobberIIICanvasAdapter } from './house-robber-iii-canvas-adapter';

describe('house-robber-iii-step-compiler (LC 337 / Class 037)', () => {
  it('默认用例 (示例 1: 偷根最优 Ans=7)', () => {
    const steps = buildHouseRobberIII037Steps();
    expect(steps.length).toBeGreaterThanOrEqual(7);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.metrics?.['全树最优窃取金额']).toBe(7);
    expect(lastStep.statusBadge?.text).toContain('7');
  });

  it('示例 2: 不偷根最优 (Ans=9)', () => {
    const steps = buildHouseRobberIII037Steps('3, 4, 5, 1, 3, null, 1');
    expect(steps.length).toBeGreaterThanOrEqual(7);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.metrics?.['全树最优窃取金额']).toBe(9);
    expect(lastStep.statusBadge?.text).toContain('9');
  });

  it('预设 3: 单节点抢劫 (Ans=10)', () => {
    const steps = buildHouseRobberIII037Steps('10');
    expect(steps.length).toBe(3);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.metrics?.['全树最优窃取金额']).toBe(10);
  });

  it('Canvas 适配器正常挂载 SVG 容器', () => {
    const container = document.createElement('div');
    const steps = buildHouseRobberIII037Steps();
    HouseRobberIIICanvasAdapter.renderCanvas(container, steps[0]);
    expect(container.querySelector('svg')).toBeDefined();
  });
});
