import { describe, it, expect } from 'vitest';
import {
  MergeTreesStepCompiler,
  buildMergeTreesDfsSteps,
  buildMergeTreesBfsSteps,
  buildMergeTreesSteps,
  collectAllTreeVals,
} from './merge-trees-step-compiler';

describe('MergeTreesStepCompiler', () => {
  it('Stage 1 (DFS): 经典双树合并应收敛至全合并树', () => {
    const t1Arr = [1, 3, 2, 5];
    const t2Arr = [2, 1, 3, null, 4, null, 7];
    const steps = buildMergeTreesDfsSteps(t1Arr, t2Arr);
    expect(steps.length).toBeGreaterThanOrEqual(10);
    const last = steps[steps.length - 1];
    expect(last.opType).toBe('complete');
    expect(last.mergedTree?.val).toBe(3);
    const allVals = collectAllTreeVals(last.mergedTree);
    expect(allVals.has(3)).toBe(true);
    expect(allVals.has(4)).toBe(true);
    expect(allVals.has(5)).toBe(true);
    expect(allVals.has(7)).toBe(true);
  });

  it('Stage 2 (BFS): 队列同步迭代合并应收敛至相同结构', () => {
    const t1Arr = [1, 3, 2, 5];
    const t2Arr = [2, 1, 3, null, 4, null, 7];
    const steps = buildMergeTreesBfsSteps(t1Arr, t2Arr);
    expect(steps.length).toBeGreaterThanOrEqual(10);
    const last = steps[steps.length - 1];
    expect(last.opType).toBe('complete');
    expect(last.mergedTree?.val).toBe(3);
  });

  it('空树特判: 单边为 null/空 时应直接继承另一侧', () => {
    const t1Arr = [1, 2];
    const steps1 = buildMergeTreesDfsSteps(t1Arr, []);
    expect(steps1.pop()?.mergedTree?.val).toBe(1);

    const steps2 = buildMergeTreesDfsSteps([], t1Arr);
    expect(steps2.pop()?.mergedTree?.val).toBe(1);
  });

  it('深模块 MergeTreesStepCompiler 门面静态委托正确', () => {
    const steps = MergeTreesStepCompiler.compileSteps([1], [2]);
    expect(steps.pop()?.mergedTree?.val).toBe(3);
  });
});
