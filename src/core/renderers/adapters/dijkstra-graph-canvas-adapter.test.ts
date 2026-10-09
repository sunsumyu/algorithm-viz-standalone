// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  renderDijkstraBasicCanvas,
  renderDijkstraHeapCanvas,
  renderDijkstraIndexHeapCanvas,
  DijkstraGraphCanvasAdapter,
} from './dijkstra-graph-canvas-adapter';
import { buildDJBSteps } from '../../../algorithms/categories/graph/dijkstra-basic-step-compiler';
import { buildDJHSteps } from '../../../algorithms/categories/graph/dijkstra-heap-step-compiler';
import { buildIndexHeapSteps } from '../../../algorithms/categories/graph/dijkstra-index-heap-step-compiler';

describe('DijkstraGraphCanvasAdapter', () => {
  it('应当能正确为朴素 Dijkstra 步骤渲染纯净拓扑图 SVG 沙盘', () => {
    const steps = buildDJBSteps();
    const container = document.createElement('div');

    // 测试初始步
    renderDijkstraBasicCanvas(container, steps[0]);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('arrow-djb');
    expect(container.innerHTML).toContain('<circle');
    expect(container.innerHTML).toContain('<line');

    // 测试中间松弛步
    const relaxStep = steps.find((s) => s.action === 'relax') || steps[5];
    DijkstraGraphCanvasAdapter.renderBasic(container, relaxStep);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('arrow-djb-relax');

    // 测试完成步
    const doneStep = steps[steps.length - 1];
    DijkstraGraphCanvasAdapter.renderBasic(container, doneStep);
    expect(container.innerHTML).toContain('<svg');
  });

  it('应当能正确为堆优化 Dijkstra 步骤渲染纯净拓扑图 SVG 沙盘', () => {
    const steps = buildDJHSteps();
    const container = document.createElement('div');

    // 测试初始步
    renderDijkstraHeapCanvas(container, steps[0]);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('arrow-djh');
    expect(container.innerHTML).toContain('<circle');

    // 测试出堆步
    const pollStep = steps.find((s) => s.action === 'poll') || steps[3];
    DijkstraGraphCanvasAdapter.renderHeap(container, pollStep);
    expect(container.innerHTML).toContain('<svg');

    // 测试完成步
    const doneStep = steps[steps.length - 1];
    DijkstraGraphCanvasAdapter.renderHeap(container, doneStep);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('arrow-djh');
  });

  it('应当能正确为反向索引堆 Dijkstra 步骤渲染纯净拓扑图 SVG 沙盘', () => {
    const steps = buildIndexHeapSteps('classic_4node');
    const container = document.createElement('div');

    // 测试初始步
    renderDijkstraIndexHeapCanvas(container, steps[0]);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('arrow-dj-index');
    expect(container.innerHTML).toContain('<circle');
    expect(container.innerHTML).toContain('<line');

    // 测试 decreaseKey 步
    const decreaseStep = steps.find((s) => s.status === 'decrease') || steps[8];
    DijkstraGraphCanvasAdapter.renderIndexHeap(container, decreaseStep);
    expect(container.innerHTML).toContain('<svg');

    // 测试完成步
    const doneStep = steps[steps.length - 1];
    DijkstraGraphCanvasAdapter.renderIndexHeap(container, doneStep);
    expect(container.innerHTML).toContain('<svg');
    expect(container.innerHTML).toContain('arrow-dj-index');
  });
});
