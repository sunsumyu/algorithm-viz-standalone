// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { buildRerooting080Steps } from './rerooting-tree-dp-080-step-compiler';
import { renderRerootingDpCanvas } from './rerooting-tree-dp-080-canvas-adapter';

describe('RerootingTreeDp080 Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('能正确计算全树距离和为 [4, 4, 6, 6]', () => {
    const steps = buildRerooting080Steps();
    expect(steps.length).toBeGreaterThan(4);

    const last = steps[steps.length - 1];
    expect(last.nodes.map((n) => n.ans)).toEqual([4, 4, 6, 6]);
  });

  it('Canvas 适配器 DOM 挂载无崩溃且包含公式卡片', () => {
    const steps = buildRerooting080Steps();
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      renderRerootingDpCanvas(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
      expect(container.innerHTML).toContain('dsp-formula-card');
    }
  });
});
