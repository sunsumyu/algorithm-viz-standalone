// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  renderEVChargeCanvas,
  EVChargeCanvasAdapter,
} from './ev-charge-canvas-adapter';
import { buildEVChargeSteps } from '../../../algorithms/categories/graph/ev-charge-dijkstra-step-compiler';

describe('EVChargeCanvasAdapter', () => {
  it('应当能正确为电动车充放电步骤渲染纯净路网拓扑 SVG 沙盘', () => {
    const steps = buildEVChargeSteps('lcp35_3cities');
    const container = document.createElement('div');

    // 初始步
    renderEVChargeCanvas(container, steps[0]);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('<circle');
    expect(container.innerHTML).toContain('<line');
    expect(container.innerHTML).toContain('C0');
    expect(container.innerHTML).toContain('C1');
    expect(container.innerHTML).toContain('C2');
    expect(container.innerHTML).toContain('单价:');

    // 充电步
    const chargeStep = steps.find((s) => s.status === 'charge') || steps[3];
    EVChargeCanvasAdapter.render(container, chargeStep);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('🔋充电中');

    // 行驶步
    const moveStep = steps.find((s) => s.status === 'move') || steps[4];
    EVChargeCanvasAdapter.render(container, moveStep);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('w:');

    // 终态步
    const doneStep = steps[steps.length - 1];
    EVChargeCanvasAdapter.render(container, doneStep);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('C2');
  });

  it('应当能正确支持捷径对比路网', () => {
    const steps = buildEVChargeSteps('lcp35_shortcut');
    const container = document.createElement('div');

    const doneStep = steps[steps.length - 1];
    EVChargeCanvasAdapter.render(container, doneStep);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('C0');
  });
});
