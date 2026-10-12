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

  it('应当能正确为 Card 2 渲染优先队列小根堆动态管道与入出堆动效', () => {
    const steps = buildNetworkDelaySteps(true);
    const container = document.createElement('div');

    // 1. 入堆步骤 (initPq / pushPq)
    const pushStep = steps.find((s) => s.pqAction === 'push');
    expect(pushStep).toBeDefined();
    NetworkDelayCanvasAdapter.renderMetrics(container, pushStep!);
    expect(container.innerHTML).toContain('优先队列小根堆');
    expect(container.innerHTML).toContain('📥 入堆');
    expect(container.innerHTML).toContain('distance[]');
    expect(container.innerHTML).toContain('visited[]');

    // 2. 出堆步骤 (popNode)
    const popStep = steps.find((s) => s.pqAction === 'poll');
    expect(popStep).toBeDefined();
    NetworkDelayCanvasAdapter.renderMetrics(container, popStep!);
    expect(container.innerHTML).toContain('📤 出堆');
    expect(container.innerHTML).toContain('出堆锁定');

    // 3. 终态队列排空
    const doneStep = steps[steps.length - 1];
    NetworkDelayCanvasAdapter.renderMetrics(container, doneStep);
    expect(container.innerHTML).toContain('广播收敛');

    // 4. 校验遍历 distance[1] 时绝不会误高亮 distance[4]
    const checkStep1 = steps.find((s) => s.status === 'check' && s.activeArray === 'dist' && s.activeSlot === 1);
    expect(checkStep1).toBeDefined();
    NetworkDelayCanvasAdapter.renderMetrics(container, checkStep1!);
    // 应当只有 1 个被高亮的黄色背景 #fef08a
    const yellowMatches = container.innerHTML.match(/#fef08a/g);
    expect(yellowMatches?.length).toBe(1);
  });
});
