// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { ZigzagStepCompiler } from './zigzag-step-compiler';
import { ZigzagCanvasAdapter } from './zigzag-canvas-adapter';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';

describe('ZigzagStepCompiler & ZigzagCanvasAdapter 核心深模块契约测试', () => {
  const sampleArr = [3, 9, 20, null, null, 15, 7];

  it('1. Stage 1 (Queue BFS): 正确推演三层锯齿折返 [[3], [20, 9], [15, 7]]', () => {
    const root = buildTreeFromArr(sampleArr);
    const steps = ZigzagStepCompiler.compileQueueSteps(root);
    expect(steps.length).toBeGreaterThanOrEqual(5);

    const last = steps[steps.length - 1];
    expect(last.action).toBe('done');
    expect(last.result).toEqual([[3], [20, 9], [15, 7]]);
    expect(last.decision).toContain('锯齿形层序遍历完成');
  });

  it('2. Stage 2 (静态双向读数组): 正确推演三层锯齿折返 [[3], [20, 9], [15, 7]]', () => {
    const root = buildTreeFromArr(sampleArr);
    const steps = ZigzagStepCompiler.compileStaticArraySteps(root);
    expect(steps.length).toBeGreaterThanOrEqual(5);

    const last = steps[steps.length - 1];
    expect(last.action).toBe('done');
    expect(last.result).toEqual([[3], [20, 9], [15, 7]]);
  });

  it('3. Stage 3 (DFS 深度映射): 正确推演三层锯齿折返 [[3], [20, 9], [15, 7]]', () => {
    const root = buildTreeFromArr(sampleArr);
    const steps = ZigzagStepCompiler.compileDfsSteps(root);
    expect(steps.length).toBeGreaterThanOrEqual(5);

    const last = steps[steps.length - 1];
    expect(last.action).toBe('done');
    expect(last.result).toEqual([[3], [20, 9], [15, 7]]);
  });

  it('4. 空树边界处理一致性', () => {
    const s1 = ZigzagStepCompiler.compileQueueSteps(null);
    expect(s1.length).toBe(2);
    expect(s1[1].action).toBe('done');
    expect(s1[1].result).toEqual([]);

    const s2 = ZigzagStepCompiler.compileStaticArraySteps(null);
    expect(s2.length).toBe(2);
    expect(s2[1].action).toBe('done');

    const s3 = ZigzagStepCompiler.compileDfsSteps(null);
    expect(s3.length).toBe(2);
    expect(s3[1].action).toBe('done');
  });

  it('5. Legacy 单测兼容适配器', () => {
    const legacy = ZigzagStepCompiler.compileLegacySteps('3, 9, 20, null, null, 15, 7');
    expect(legacy.length).toBeGreaterThanOrEqual(5);
    expect(legacy[legacy.length - 1].decision).toContain('锯齿形层序遍历完成');
  });

  it('6. ZigzagCanvasAdapter 表现层渲染能力', () => {
    const container = document.createElement('div');
    const root = buildTreeFromArr(sampleArr);
    const steps = ZigzagStepCompiler.compileQueueSteps(root);

    expect(() => {
      ZigzagCanvasAdapter.renderCanvas(container, steps[2]);
    }).not.toThrow();

    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();

    const metricsHtml = ZigzagCanvasAdapter.renderMetricsShell(
      steps[steps.length - 1],
      ZigzagCanvasAdapter.renderStage1BufferHtml([20, 9], [3], false)
    );
    expect(metricsHtml).toContain('锯齿折返结果集 ans');
  });
});
