// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildLastStoneWeightIISteps,
  parseLastStoneInputs,
} from './last-stone-weight-ii-step-compiler';
import {
  renderLastStoneBoard,
  renderLastStoneStage1Canvas,
  renderLastStoneStage1Metrics,
  renderLastStoneStage4Metrics,
} from './last-stone-weight-ii-canvas-adapter';

describe('LastStoneWeightII Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('正确解析输入并编译标准案例 [2,7,4,1,8,1] 的 01 背包极小化步进', () => {
    const { stones } = parseLastStoneInputs({
      'input-stones': '2, 7, 4, 1, 8, 1',
    });
    expect(stones).toEqual([2, 7, 4, 1, 8, 1]);

    const steps = buildLastStoneWeightIISteps(stones);
    expect(steps.length).toBeGreaterThan(5);

    // 入口帧
    const s0 = steps[0];
    expect(s0.status).toBe('init');
    expect(s0.codeLine).toBeDefined();

    // 终态帧: sum=23, near=11, remain=1
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.near).toBe(11);
    expect(last.remainWeight).toBe(1);
  });

  it('边界情况：单个石头时直接返回剩余自身重量', () => {
    const steps = buildLastStoneWeightIISteps([5]);
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.remainWeight).toBe(5); // 单个石头无法放入 t=2 的子集，碰撞残留即为 5
  });

  it('Canvas 适配器 DOM 挂载无崩溃且无 [object Object] 与样式污染', () => {
    const steps = buildLastStoneWeightIISteps([2, 7, 4, 1, 8, 1]);
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      renderLastStoneBoard(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
      expect(container.innerHTML).not.toContain('NaN');

      renderLastStoneStage4Metrics(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
    }

    renderLastStoneStage1Canvas(container, {
      i: 0,
      n: 6,
      stones: [2, 7, 4, 1, 8, 1],
      decision: '放入子集 A',
      message: '测试',
      callStack: [{ name: 'dfs', args: 'i=0, rem=11' }],
    });
    expect(container.innerHTML).not.toContain('[object Object]');

    renderLastStoneStage1Metrics(container, {
      callStack: [{ name: 'dfs' }],
      remCap: 11,
    });
    expect(container.innerHTML).not.toContain('[object Object]');
  });
});
