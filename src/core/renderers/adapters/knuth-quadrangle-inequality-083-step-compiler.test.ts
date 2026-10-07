// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { buildKnuth083Steps } from './knuth-quadrangle-inequality-083-step-compiler';
import { renderKnuthQuadrangleCanvas } from './knuth-quadrangle-inequality-083-canvas-adapter';

describe('KnuthQuadrangle083 Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('决策区间夹逼剪枝，以 O(N^2) 准确求出石子合并最优代价 20', () => {
    const steps = buildKnuth083Steps();
    expect(steps.length).toBeGreaterThan(4);

    const last = steps[steps.length - 1];
    expect(last.minCost).toBe(20);
  });

  it('Canvas 适配器 DOM 挂载无崩溃且包含公式卡片', () => {
    const steps = buildKnuth083Steps();
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      renderKnuthQuadrangleCanvas(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
      expect(container.innerHTML).toContain('dsp-formula-card');
    }
  });
});
