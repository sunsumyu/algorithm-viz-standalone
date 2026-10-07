// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  parseTreeCountInputs,
  buildTreeCountStage1Steps,
  buildTreeCountStage2Steps,
  buildTreeCountStage3Steps,
  buildTreeCountStage4Steps,
} from './tree-count-height-m-step-compiler';
import {
  createTreeCountStages,
  renderTreeSplitView,
} from './tree-count-height-m-canvas-adapter';

describe('TreeCountHeightMStepCompiler & CanvasAdapter 伴生测试', () => {
  const defaultInputs = { 'input-n': 4, 'input-m': 3 };

  it('parseTreeCountInputs 应正确解析与边界截断参数', () => {
    expect(parseTreeCountInputs({ 'input-n': '5', 'input-m': '3' })).toEqual({ n: 5, m: 3 });
    expect(parseTreeCountInputs({ 'input-n': '99', 'input-m': '-2' })).toEqual({ n: 10, m: 0 });
    expect(parseTreeCountInputs({})).toEqual({ n: 5, m: 3 });
  });

  it('Stage 1 暴力递归应生成充实步骤与有效行号', () => {
    const steps = buildTreeCountStage1Steps(defaultInputs);
    expect(steps.length).toBeGreaterThan(5);
    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
      expect(step.decision).toBeTruthy();
    }
  });

  it('Stage 2 记忆化搜索应具备命中与未命中步骤', () => {
    const steps = buildTreeCountStage2Steps(defaultInputs);
    expect(steps.length).toBeGreaterThan(5);
    const hitSteps = steps.filter((s) => s.memoHit);
    expect(hitSteps.length).toBeGreaterThan(0);
    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
    }
  });

  it('Stage 3 严格二维填表应正确计算状态', () => {
    const steps = buildTreeCountStage3Steps(defaultInputs);
    expect(steps.length).toBeGreaterThan(5);
    const finalStep = steps[steps.length - 1];
    expect(finalStep.currentVal).toBeGreaterThan(0);
    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
    }
  });

  it('Stage 4 空间优化应成功完成双列滚动', () => {
    const steps = buildTreeCountStage4Steps(defaultInputs);
    expect(steps.length).toBeGreaterThan(5);
    const finalStep = steps[steps.length - 1];
    expect(finalStep.currentVal).toBeGreaterThan(0);
    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
    }
  });

  it('CanvasAdapter 阶段声明与渲染应正常挂载且无崩溃', () => {
    const stages = createTreeCountStages();
    expect(stages.length).toBe(4);

    const container = document.createElement('div');
    renderTreeSplitView(container, 4, 3, 2);
    expect(container.innerHTML).toContain('当前规模');

    const stage1Steps = buildTreeCountStage1Steps({ 'input-n': 2, 'input-m': 2 });
    stages[0].primaryVisual.render(container, stage1Steps[0] as any);
    expect(container.innerHTML).toBeTruthy();
    stages[0].auxiliaryVisual.render(container, stage1Steps[0] as any);
    expect(container.innerHTML).toBeTruthy();

    const stage2Steps = buildTreeCountStage2Steps({ 'input-n': 2, 'input-m': 2 });
    stages[1].primaryVisual.render(container, stage2Steps[0] as any);
    expect(container.innerHTML).toBeTruthy();
    stages[1].auxiliaryVisual.render(container, stage2Steps[0] as any);
    expect(container.innerHTML).toBeTruthy();

    const stage3Steps = buildTreeCountStage3Steps({ 'input-n': 2, 'input-m': 2 });
    stages[2].primaryVisual.render(container, stage3Steps[0] as any);
    expect(container.innerHTML).toBeTruthy();
    stages[2].auxiliaryVisual.render(container, stage3Steps[0] as any);
    expect(container.innerHTML).toBeTruthy();

    const stage4Steps = buildTreeCountStage4Steps({ 'input-n': 2, 'input-m': 2 });
    stages[3].primaryVisual.render(container, stage4Steps[0] as any);
    expect(container.innerHTML).toBeTruthy();
    stages[3].auxiliaryVisual.render(container, stage4Steps[0] as any);
    expect(container.innerHTML).toBeTruthy();
  });
});
