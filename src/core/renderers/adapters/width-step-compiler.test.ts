// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { WidthStepCompiler } from './width-step-compiler';
import { WidthCanvasAdapter } from './width-canvas-adapter';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';

describe('WidthStepCompiler & WidthCanvasAdapter 核心深模块契约测试', () => {
  const sampleArr = [1, 3, 2, 5, 3, null, 9];

  it('1. Stage 1 (Queue BFS): 正确推导最大宽度 4 与端点契约', () => {
    const root = buildTreeFromArr(sampleArr);
    const steps = WidthStepCompiler.compileQueueSteps(root);
    expect(steps.length).toBeGreaterThan(6);

    const last = steps[steps.length - 1];
    expect(last.action).toBe('done');
    expect(last.maxWidth).toBe(4);
    expect(last.maxWidthEndpoints).toContain(5);
    expect(last.maxWidthEndpoints).toContain(9);
  });

  it('2. Stage 2 (静态连续双数组): 正确推导最大宽度 4 与端点契约', () => {
    const root = buildTreeFromArr(sampleArr);
    const steps = WidthStepCompiler.compileStaticArraySteps(root);
    expect(steps.length).toBeGreaterThan(6);

    const last = steps[steps.length - 1];
    expect(last.action).toBe('done');
    expect(last.maxWidth).toBe(4);
    expect(last.maxWidthEndpoints).toContain(5);
    expect(last.maxWidthEndpoints).toContain(9);
  });

  it('3. Stage 3 (DFS 深度映射): 正确推导最大宽度 4 与端点契约', () => {
    const root = buildTreeFromArr(sampleArr);
    const steps = WidthStepCompiler.compileDfsSteps(root);
    expect(steps.length).toBeGreaterThan(6);

    const last = steps[steps.length - 1];
    expect(last.action).toBe('done');
    expect(last.maxWidth).toBe(4);
    expect(last.maxWidthEndpoints).toContain(5);
    expect(last.maxWidthEndpoints).toContain(9);
  });

  it('4. 空树边界特判一致性', () => {
    const s1 = WidthStepCompiler.compileQueueSteps(null);
    expect(s1.length).toBe(2);
    expect(s1[1].action).toBe('done');
    expect(s1[1].maxWidth).toBe(0);

    const s2 = WidthStepCompiler.compileStaticArraySteps(null);
    expect(s2.length).toBe(2);
    expect(s2[1].action).toBe('done');
    expect(s2[1].maxWidth).toBe(0);

    const s3 = WidthStepCompiler.compileDfsSteps(null);
    expect(s3.length).toBe(2);
    expect(s3[1].action).toBe('done');
    expect(s3[1].maxWidth).toBe(0);
  });

  it('5. WidthCanvasAdapter 表现层渲染能力', () => {
    const container = document.createElement('div');
    const root = buildTreeFromArr(sampleArr);
    const steps = WidthStepCompiler.compileQueueSteps(root);

    expect(() => {
      WidthCanvasAdapter.renderCanvas(container, steps[2]);
    }).not.toThrow();

    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();

    const metricsHtml = WidthCanvasAdapter.renderMetricsShell(
      steps[steps.length - 1],
      WidthCanvasAdapter.renderStage1QueueBufferHtml(steps[steps.length - 1])
    );
    expect(metricsHtml).toContain('各层跨度结算记录');
  });
});
