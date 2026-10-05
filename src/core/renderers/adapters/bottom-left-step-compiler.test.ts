// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { BottomLeftStepCompiler } from './bottom-left-step-compiler';
import { BottomLeftCanvasAdapter } from './bottom-left-canvas-adapter';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';

describe('BottomLeftStepCompiler & BottomLeftCanvasAdapter 核心深模块契约测试', () => {
  const sampleArr = [2, 1, 3];
  const complexArr = [1, 2, 3, 4, null, 5, 6, null, null, 7];

  it('1. Stage 1 (Preorder DFS): 正确推导树左下角值 1 与 7', () => {
    const root1 = buildTreeFromArr(sampleArr);
    const s1 = BottomLeftStepCompiler.compileStage1PreorderSteps(root1);
    expect(s1.length).toBeGreaterThanOrEqual(4);
    expect(s1[s1.length - 1].bottomLeft).toBe(1);

    const root2 = buildTreeFromArr(complexArr);
    const s2 = BottomLeftStepCompiler.compileStage1PreorderSteps(root2);
    expect(s2.length).toBeGreaterThanOrEqual(4);
    expect(s2[s2.length - 1].bottomLeft).toBe(7);
  });

  it('2. Stage 2 (Standard BFS): 正确推导树左下角值 1 与 7', () => {
    const root1 = buildTreeFromArr(sampleArr);
    const s1 = BottomLeftStepCompiler.compileStage2BfsSteps(root1);
    expect(s1.length).toBeGreaterThanOrEqual(4);
    expect(s1[s1.length - 1].bottomLeft).toBe(1);

    const root2 = buildTreeFromArr(complexArr);
    const s2 = BottomLeftStepCompiler.compileStage2BfsSteps(root2);
    expect(s2.length).toBeGreaterThanOrEqual(4);
    expect(s2[s2.length - 1].bottomLeft).toBe(7);
  });

  it('3. Stage 3 (Reverse BFS): 正确推导树左下角值 1 与 7', () => {
    const root1 = buildTreeFromArr(sampleArr);
    const s1 = BottomLeftStepCompiler.compileStage3ReverseBfsSteps(root1);
    expect(s1.length).toBeGreaterThanOrEqual(4);
    expect(s1[s1.length - 1].bottomLeft).toBe(1);

    const root2 = buildTreeFromArr(complexArr);
    const s2 = BottomLeftStepCompiler.compileStage3ReverseBfsSteps(root2);
    expect(s2.length).toBeGreaterThanOrEqual(4);
    expect(s2[s2.length - 1].bottomLeft).toBe(7);
  });

  it('4. 空树边界特判', () => {
    const s1 = BottomLeftStepCompiler.compileStage1PreorderSteps(null);
    expect(s1.length).toBe(3);
    expect(s1[2].action).toBe('done');
    expect(s1[2].bottomLeft).toBe(0);

    const s2 = BottomLeftStepCompiler.compileStage2BfsSteps(null);
    expect(s2.length).toBe(3);
    expect(s2[2].bottomLeft).toBe(0);

    const s3 = BottomLeftStepCompiler.compileStage3ReverseBfsSteps(null);
    expect(s3.length).toBe(3);
    expect(s3[2].bottomLeft).toBe(0);
  });

  it('5. 表现层 Canvas 与 CustomMetrics 挂载测试', () => {
    const container = document.createElement('div');
    const root = buildTreeFromArr(sampleArr);
    const steps = BottomLeftStepCompiler.compileStage1PreorderSteps(root);

    expect(() => {
      BottomLeftCanvasAdapter.renderCanvas(container, steps[steps.length - 1]);
    }).not.toThrow();

    const metricsBox = document.createElement('div');
    expect(() => {
      BottomLeftCanvasAdapter.renderCustomMetrics(metricsBox, steps[steps.length - 1]);
    }).not.toThrow();
    expect(metricsBox.innerHTML).toContain('锁定左下角');
  });
});
