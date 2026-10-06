// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  buildSparseTableSteps,
  SPARSE_TABLE_CODES,
  SparseTableStep,
} from './sparse-table-step-compiler';
import { renderSparseTableCanvas } from './sparse-table-canvas-adapter';

function verify1BasedCodeLines(steps: SparseTableStep[], codes: Record<string, string[]>) {
  expect(steps.length).toBeGreaterThan(0);
  for (const step of steps) {
    if (step.codeLine) {
      for (const lang of ['java', 'cpp', 'python', 'javascript']) {
        const line = step.codeLine[lang];
        expect(line, `Missing line mapping for ${lang}`).toBeDefined();
        expect(line, `Line must be >= 1 for ${lang}`).toBeGreaterThanOrEqual(1);
        expect(line, `Line ${line} exceeds code length ${codes[lang].length} for ${lang}`).toBeLessThanOrEqual(
          codes[lang].length
        );
      }
    }
  }
}

describe('SparseTableStepCompiler & CanvasAdapter 伴生测试', () => {
  it('应正确构建倍增矩阵并在 O(1) 内返回最值', () => {
    const nums = [3, 2, 4, 5, 6, 8, 1, 2];
    const steps = buildSparseTableSteps(nums, 2, 6);
    expect(steps.length).toBe(3);

    const lastStep = steps[steps.length - 1];
    expect(lastStep.maxAns).toBe(8);
    expect(lastStep.metrics).toBeDefined();
    expect(lastStep.metrics!['最终最大值']).toBe(8);

    verify1BasedCodeLines(steps, SPARSE_TABLE_CODES);
  });

  it('单元素区间查询应正确返回自身', () => {
    const nums = [10, 20, 30];
    const steps = buildSparseTableSteps(nums, 1, 1);
    expect(steps.length).toBe(3);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.maxAns).toBe(20);
  });

  it('空数组边界处理应返回空数组', () => {
    const steps = buildSparseTableSteps([], 0, 0);
    expect(steps).toEqual([]);
  });

  it('CanvasAdapter 应安全渲染 ST 表看板与公式卡片', () => {
    const nums = [3, 2, 4, 5, 6, 8, 1, 2];
    const steps = buildSparseTableSteps(nums, 2, 6);
    const container = document.createElement('div');
    renderSparseTableCanvas(container, steps[steps.length - 1]);
    expect(container.innerHTML).toContain('ST 表倍增矩阵');
    expect(container.innerHTML).toContain('ST 表 O(1) 查询公式');
  });
});
