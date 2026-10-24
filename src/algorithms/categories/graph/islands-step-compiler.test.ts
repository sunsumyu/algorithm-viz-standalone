import { describe, it, expect } from 'vitest';
import {
  buildIslandsDfsSteps,
  buildIslandsBfsSteps,
  buildIslandsUfSteps,
  createIslandsStageSteps,
  DEFAULT_GRID,
  PRESET_CASES,
} from './islands-step-compiler';

describe('islands-step-compiler (LC 200 岛屿数量三阶段编译器)', () => {
  const classicGrid = PRESET_CASES.classic.grid;

  it('Stage 1: DFS 递归沉岛法正确计算 3 座岛屿，且每一步具备合法代码行号和小人状态', () => {
    const steps = buildIslandsDfsSteps(classicGrid);
    expect(steps.length).toBeGreaterThan(15);

    const firstStep = steps[0];
    expect(firstStep.action).toBe('init');
    expect(firstStep.stage).toContain('Stage 1');
    expect(firstStep.adventurer).toBeDefined();

    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('done');
    expect(lastStep.count).toBe(3);

    for (const step of steps) {
      expect(typeof step.codeLine).toBe('number');
      expect(step.codeLine).toBeGreaterThanOrEqual(1);
    }
  });

  it('Stage 2: BFS 队列波浪扩散法正确计算 3 座岛屿，队列状态与小人联动正常', () => {
    const steps = buildIslandsBfsSteps(classicGrid);
    expect(steps.length).toBeGreaterThan(15);

    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('done');
    expect(lastStep.count).toBe(3);

    const pollStep = steps.find((s) => s.action === 'queuePoll');
    expect(pollStep).toBeDefined();
    expect(pollStep?.adventurer?.state).toBe('walking');

    for (const step of steps) {
      expect(typeof step.codeLine).toBe('number');
      expect(step.codeLine).toBeGreaterThanOrEqual(1);
    }
  });

  it('Stage 3: 并查集 Union-Find 正确合并相邻陆地，独立集合最终为 3', () => {
    const steps = buildIslandsUfSteps(classicGrid);
    expect(steps.length).toBeGreaterThan(10);

    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('done');
    expect(lastStep.count).toBe(3);

    const unionStep = steps.find((s) => s.action === 'union');
    expect(unionStep).toBeDefined();

    for (const step of steps) {
      expect(typeof step.codeLine).toBe('number');
      expect(step.codeLine).toBeGreaterThanOrEqual(1);
    }
  });

  it('createIslandsStageSteps 统一分发器针对各阶段无缝返回附加指标的步骤', () => {
    const s1 = createIslandsStageSteps('stage-1', DEFAULT_GRID);
    const s2 = createIslandsStageSteps('stage-2', DEFAULT_GRID);
    const s3 = createIslandsStageSteps('stage-3', DEFAULT_GRID);

    expect(s1[0].metrics).toBeDefined();
    expect(s2[0].metrics).toBeDefined();
    expect(s3[0].metrics).toBeDefined();
  });
});
