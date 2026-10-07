// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  buildDecodeWaysII066Steps,
  DECODE_WAYS_II_PRESETS,
} from './decode-ways-ii-step-compiler';
import { renderDecodeWaysIICanvas } from './decode-ways-ii-canvas-adapter';

describe('DecodeWaysIIStepCompiler & CanvasAdapter 伴生测试', () => {
  it('buildDecodeWaysII066Steps 应对预设用例生成正确方案数与行号', () => {
    const stepsTwoStar = buildDecodeWaysII066Steps('two_star');
    expect(stepsTwoStar.length).toBeGreaterThan(3);

    const lastStep = stepsTwoStar[stepsTwoStar.length - 1];
    expect(lastStep.cur).toBe('15');
    for (const step of stepsTwoStar) {
      expect(step.line).toBeGreaterThan(0);
      expect(step.codeLine).toBeDefined();
    }

    const stepsSingle = buildDecodeWaysII066Steps('single_star');
    expect(stepsSingle[stepsSingle.length - 1].cur).toBe('9');
  });

  it('CanvasAdapter 渲染卡片与 DP 数组应无崩溃', () => {
    const steps = buildDecodeWaysII066Steps('two_star');
    const container = document.createElement('div');

    renderDecodeWaysIICanvas(container, steps[0]);
    expect(container.innerHTML).toContain('待解码字符串');

    renderDecodeWaysIICanvas(container, steps[2]);
    expect(container.innerHTML).toContain('单字符方案贡献');
  });
});
