// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  buildUniqueSubstringsWraparound066Steps,
  UNIQUE_SUBSTRINGS_WRAPAROUND_PRESETS,
} from './unique-substrings-wraparound-step-compiler';
import { renderUniqueSubstringsWraparoundCanvas } from './unique-substrings-wraparound-canvas-adapter';

describe('UniqueSubstringsWraparoundStepCompiler & CanvasAdapter 伴生测试', () => {
  it('buildUniqueSubstringsWraparound066Steps 应正确推导 "zab" 答案为 6', () => {
    const steps = buildUniqueSubstringsWraparound066Steps('preset_zab');
    expect(steps.length).toBeGreaterThan(3);

    const last = steps[steps.length - 1];
    expect(last.totalAns).toBe(6);
    for (const step of steps) {
      expect(step.line).toBeGreaterThan(0);
      expect(step.codeLine).toBeDefined();
    }
  });

  it('buildUniqueSubstringsWraparound066Steps 应正确推导 "cac" 答案为 2', () => {
    const steps = buildUniqueSubstringsWraparound066Steps('preset_cac');
    const last = steps[steps.length - 1];
    expect(last.totalAns).toBe(2);
  });

  it('CanvasAdapter 渲染 26 槽位网格应无崩溃', () => {
    const steps = buildUniqueSubstringsWraparound066Steps('preset_zab');
    const container = document.createElement('div');

    renderUniqueSubstringsWraparoundCanvas(container, steps[2]);
    expect(container.innerHTML).toContain('待匹配母串');
  });
});
