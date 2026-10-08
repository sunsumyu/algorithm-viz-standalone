// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  renderBellmanFordCanvas,
  renderSpfaCanvas,
  renderNegativeCycleCanvas,
  BellmanFordCanvasAdapter,
} from './bellman-ford-canvas-adapter';
import { buildBFSteps } from '../../../algorithms/categories/graph/bellman-ford-step-compiler';
import { buildSPFASteps } from '../../../algorithms/categories/graph/spfa-step-compiler';
import { buildNCSteps } from '../../../algorithms/categories/graph/negative-cycle-step-compiler';

describe('BellmanFordCanvasAdapter', () => {
  it('应当能正确为 Bellman-Ford 步骤渲染 SVG 与监控状态表', () => {
    const steps = buildBFSteps();
    const container = document.createElement('div');

    // 初始步
    renderBellmanFordCanvas(container, steps[0]);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('arrow-bf');
    expect(container.innerHTML).toContain('<table');
    expect(container.innerHTML).toContain('节点');
    expect(container.innerHTML).toContain('dist');

    // 中间松弛步
    const relaxStep = steps.find((s) => s.action === 'relax') || steps[5];
    BellmanFordCanvasAdapter.renderBF(container, relaxStep);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('arrow-bf-relax');

    // 完成步
    const doneStep = steps[steps.length - 1];
    BellmanFordCanvasAdapter.renderBF(container, doneStep);
    expect(container.innerHTML).toContain('<table');
  });

  it('应当能正确为 SPFA 步骤渲染 SVG 与在队状态表', () => {
    const steps = buildSPFASteps();
    const container = document.createElement('div');

    // 初始步
    renderSpfaCanvas(container, steps[0]);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('arrow-spfa');
    expect(container.innerHTML).toContain('在队');

    // 中间出队与松弛步
    const pollStep = steps.find((s) => s.action === 'poll') || steps[7];
    BellmanFordCanvasAdapter.renderSPFA(container, pollStep);
    expect(container.innerHTML).toContain('<svg');

    // 完成步
    const doneStep = steps[steps.length - 1];
    BellmanFordCanvasAdapter.renderSPFA(container, doneStep);
    expect(container.innerHTML).toContain('在队');
  });

  it('应当能正确为负权回路检测步骤渲染 SVG 与负环高亮', () => {
    const steps = buildNCSteps();
    const container = document.createElement('div');

    // 初始步
    renderNegativeCycleCanvas(container, steps[0]);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('nc-arrow-gray');
    expect(container.innerHTML).toContain('dist[0]');

    // 负环捕获步
    const cycleStep = steps.find((s) => s.action === 'cycle-detected') || steps[steps.length - 1];
    BellmanFordCanvasAdapter.renderNegativeCycle(container, cycleStep);
    expect(container.innerHTML).toContain('nc-arrow-red');
    expect(container.innerHTML).toContain('#dc2626');
  });
});
