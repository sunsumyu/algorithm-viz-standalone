// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  renderNetworkDelayCanvas,
  NetworkDelayCanvasAdapter,
} from './network-delay-canvas-adapter';
import { buildNetworkDelaySteps } from '../../../algorithms/categories/graph/network-delay-time-step-compiler';

describe('NetworkDelayCanvasAdapter', () => {
  it('应当能正确为网络延迟时间步骤渲染纯净拓扑图 SVG 沙盘', () => {
    const steps = buildNetworkDelaySteps(true);
    const container = document.createElement('div');

    // 初始步
    renderNetworkDelayCanvas(container, steps[0]);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('delay-arrow-base');
    expect(container.innerHTML).toContain('<circle');
    expect(container.innerHTML).toContain('<line');

    // 松弛广播步
    const relaxStep = steps.find((s) => s.status === 'relax') || steps[5];
    NetworkDelayCanvasAdapter.render(container, relaxStep);
    expect(container.innerHTML).toContain('<svg');

    // 结算完成步
    const doneStep = steps[steps.length - 1];
    NetworkDelayCanvasAdapter.render(container, doneStep);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('d:2ms');
  });

  it('应当能正确为含孤立点不可达网络渲染沙盘与红色警告', () => {
    const steps = buildNetworkDelaySteps(false);
    const container = document.createElement('div');

    const doneStep = steps[steps.length - 1];
    NetworkDelayCanvasAdapter.render(container, doneStep);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('d:∞');
  });
});
