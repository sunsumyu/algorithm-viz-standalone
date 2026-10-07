// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildCoinsChangeKindsSteps,
  parseCoinsChangeInputs,
} from './coins-change-kinds-step-compiler';
import {
  renderCoinsChangeSandbox,
  renderCoinsChangeVectorMatrix,
  createCoinsChangeStages,
} from './coins-change-kinds-canvas-adapter';

describe('CoinsChangeKinds Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('正确解析 POJ 1742 找零用例并求解种类总数', () => {
    const parsed = parseCoinsChangeInputs({
      'input-m': 10,
      'input-vals': '1, 2, 4',
      'input-cnts': '2, 1, 1',
    });
    expect(parsed.m).toBe(10);
    expect(parsed.valList).toEqual([1, 2, 4]);
    expect(parsed.cntList).toEqual([2, 1, 1]);

    const steps = buildCoinsChangeKindsSteps({
      'input-m': 10,
      'input-vals': '1, 2, 4',
      'input-cnts': '2, 1, 1',
    });
    expect(steps.length).toBeGreaterThan(5);

    // 入口帧
    const s0 = steps[0];
    expect(s0.status).toBe('init');
    expect(s0.codeLine).toBeDefined();

    // 终态帧: 样例答案 8 种
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.totalKinds).toBe(8);
  });

  it('Canvas 适配器 DOM 挂载无崩溃且无 [object Object] 与未定义标记', () => {
    const steps = buildCoinsChangeKindsSteps({
      'input-m': 10,
      'input-vals': '1, 2, 4',
      'input-cnts': '2, 1, 1',
    });
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      renderCoinsChangeSandbox(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');

      renderCoinsChangeVectorMatrix(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
    }
  });

  it('四阶段声明式 stage 工厂正常生成', () => {
    const stages = createCoinsChangeStages();
    expect(stages.length).toBe(4);
    expect(stages[0].id).toBe('stage-1');
    expect(stages[3].id).toBe('stage-4');
  });
});
