// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  buildUglyNumberII066Steps,
  UGLY_NUMBER_II_PRESETS,
} from './ugly-number-ii-step-compiler';
import { renderUglyNumberIICanvas } from './ugly-number-ii-canvas-adapter';

describe('UglyNumberIIStepCompiler & CanvasAdapter 伴生测试', () => {
  it('buildUglyNumberII066Steps 应正确推导第 10 个丑数为 12', () => {
    const steps = buildUglyNumberII066Steps('n_10');
    expect(steps.length).toBeGreaterThan(5);

    const last = steps[steps.length - 1];
    expect(last.currentUgly).toBe(12);
    for (const step of steps) {
      expect(step.line).toBeGreaterThan(0);
      expect(step.codeLine).toBeDefined();
    }
  });

  it('buildUglyNumberII066Steps 边界 n=1 应直接返回', () => {
    const steps = buildUglyNumberII066Steps('n_1');
    expect(steps.length).toBe(2);
    expect(steps[1].currentUgly).toBe(1);
  });

  it('CanvasAdapter 渲染三指针进度条应无崩溃', () => {
    const steps = buildUglyNumberII066Steps('n_10');
    const container = document.createElement('div');

    renderUglyNumberIICanvas(container, steps[3]);
    expect(container.innerHTML).toBeTruthy();
  });
});
