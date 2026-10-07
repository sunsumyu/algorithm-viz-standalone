// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  parseWordSearchInputs,
  buildWordSearchStage1Steps,
  buildWordSearchStage2Steps,
  buildWordSearchStage3Steps,
  buildWordSearchStage4Steps,
} from './word-search-step-compiler';
import {
  createWordSearchStages,
  renderBoardGrid,
  renderPruneDashboard,
} from './word-search-canvas-adapter';

describe('WordSearchStepCompiler & CanvasAdapter 伴生测试', () => {
  const defaultInputs = {
    'input-board': JSON.stringify([
      ['A', 'B', 'C', 'E'],
      ['S', 'F', 'C', 'S'],
      ['A', 'D', 'E', 'E'],
    ]),
    'input-word': 'ABCCED',
  };

  it('parseWordSearchInputs 应正确解析与回退容错', () => {
    const res = parseWordSearchInputs(defaultInputs);
    expect(res.board.length).toBe(3);
    expect(res.word).toBe('ABCCED');

    const fallback = parseWordSearchInputs({});
    expect(fallback.board.length).toBe(3);
    expect(fallback.word).toBe('ABCCED');
  });

  it('Stage 1 暴力回溯搜索应产生充实步骤与有效行号', () => {
    const steps = buildWordSearchStage1Steps(defaultInputs);
    expect(steps.length).toBeGreaterThan(5);
    const foundStep = steps.find((s) => s.status === 'found');
    expect(foundStep).toBeDefined();
    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
      expect(step.decision).toBeTruthy();
    }
  });

  it('Stage 2 无后效性反例剖析应演示脏缓存冲突', () => {
    const steps = buildWordSearchStage2Steps(defaultInputs);
    expect(steps.length).toBeGreaterThan(5);
    const conflictSteps = steps.filter((s) => s.status === 'conflict');
    expect(conflictSteps.length).toBeGreaterThan(0);
    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
    }
  });

  it('Stage 3 原地打标回溯应正确寻路成功', () => {
    const steps = buildWordSearchStage3Steps(defaultInputs);
    expect(steps.length).toBeGreaterThan(5);
    const foundStep = steps.find((s) => s.status === 'found');
    expect(foundStep).toBeDefined();
    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
    }
  });

  it('Stage 4 首尾词频剪枝与倒序应正常生效', () => {
    const steps = buildWordSearchStage4Steps(defaultInputs);
    expect(steps.length).toBeGreaterThan(5);
    const foundStep = steps.find((s) => s.status === 'found');
    expect(foundStep).toBeDefined();
    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
    }
  });

  it('CanvasAdapter 阶段声明与渲染挂载应正常运作', () => {
    const stages = createWordSearchStages();
    expect(stages.length).toBe(4);

    const container = document.createElement('div');
    renderBoardGrid(container, [['A', 'B'], ['C', 'D']], 0, 0, [[0, 0]]);
    expect(container.innerHTML).toBeTruthy();

    const stage1Steps = buildWordSearchStage1Steps(defaultInputs);
    stages[0].primaryVisual.render(container, stage1Steps[0] as any);
    expect(container.innerHTML).toBeTruthy();
    stages[0].auxiliaryVisual.render(container, stage1Steps[0] as any);
    expect(container.innerHTML).toBeTruthy();

    renderPruneDashboard(container, stage1Steps[0]);
    expect(container.innerHTML).toBeTruthy();
  });
});
