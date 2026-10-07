// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateRecursionToDpSteps,
  RECURSION_TO_DP_038_CODES,
} from './recursion-to-dp-038-step-compiler';
import { renderRecursionToDpCanvas } from './recursion-to-dp-038-canvas-adapter';

describe('RecursionToDp038 Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('四阶段步骤生成器均能正确推演并产出充分密度步骤', () => {
    for (const stage of ['brute', 'memo', 'tab', 'rolling'] as const) {
      const steps = generateRecursionToDpSteps(6, stage);
      expect(steps.length).toBeGreaterThan(3);
      expect(steps[0].stage).toBe(stage);
      expect(steps[0].codeLine).toBeDefined();

      const last = steps[steps.length - 1];
      expect(last.stage).toBe(stage);
    }
  });

  it('代码库定义多语言完整', () => {
    expect(RECURSION_TO_DP_038_CODES.java).toContain('public static int f1');
    expect(RECURSION_TO_DP_038_CODES.cpp).toContain('int f1');
    expect(RECURSION_TO_DP_038_CODES.python).toContain('def f1');
    expect(RECURSION_TO_DP_038_CODES.typescript).toContain('f1(n: number)');
  });

  it('Canvas 适配器 DOM 挂载无崩溃且包含公式卡片', () => {
    for (const stage of ['brute', 'memo', 'tab', 'rolling'] as const) {
      const steps = generateRecursionToDpSteps(6, stage);
      renderRecursionToDpCanvas(container, steps[steps.length - 1]);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
      expect(container.innerHTML).toContain('dsp-formula-card');
    }
  });
});
