import { describe, it, expect } from 'vitest';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import {
  SumRootToLeafStepCompiler,
  buildSumNumbersStage1Steps,
  buildSumNumbersStage2BfsSteps,
  buildSumNumbersStage3StackSteps,
  generateSumNumbersSteps,
} from './sum-root-to-leaf-step-compiler';

describe('SumRootToLeafStepCompiler', () => {
  it('兼容接口 generateSumNumbersSteps 应收敛至 281', () => {
    const steps = generateSumNumbersSteps();
    expect(steps.length).toBeGreaterThanOrEqual(10);
    const last = steps[steps.length - 1];
    expect(last.totalSum).toBe(281);
  });

  it('Stage 1 (DFS): [4, 9, 0, 5, 1] 路径求和应收敛至 1026', () => {
    const root = buildTreeFromArr([4, 9, 0, 5, 1]);
    const steps = buildSumNumbersStage1Steps(root);
    expect(steps.length).toBeGreaterThanOrEqual(10);
    const last = steps[steps.length - 1];
    expect(last.totalSum).toBe(1026);
    expect(last.completedPaths.map((p) => p.value)).toEqual(expect.arrayContaining([495, 491, 40]));
  });

  it('Stage 2 (BFS): 双队列层序推进收敛至 1026', () => {
    const root = buildTreeFromArr([4, 9, 0, 5, 1]);
    const steps = buildSumNumbersStage2BfsSteps(root);
    expect(steps.length).toBeGreaterThanOrEqual(10);
    const last = steps[steps.length - 1];
    expect(last.totalSum).toBe(1026);
  });

  it('Stage 3 (显式双栈): 显式栈回溯模拟收敛至 1026', () => {
    const root = buildTreeFromArr([4, 9, 0, 5, 1]);
    const steps = buildSumNumbersStage3StackSteps(root);
    expect(steps.length).toBeGreaterThanOrEqual(10);
    const last = steps[steps.length - 1];
    expect(last.totalSum).toBe(1026);
  });

  it('空树情况下三大 Stage 安全退出返回 0', () => {
    expect(buildSumNumbersStage1Steps(null).pop()?.totalSum).toBe(0);
    expect(buildSumNumbersStage2BfsSteps(null).pop()?.totalSum).toBe(0);
    expect(buildSumNumbersStage3StackSteps(null).pop()?.totalSum).toBe(0);
  });

  it('单节点树 [7] 返回 7', () => {
    const root = buildTreeFromArr([7]);
    expect(buildSumNumbersStage1Steps(root).pop()?.totalSum).toBe(7);
  });

  it('深模块 SumRootToLeafStepCompiler 静态门面委托正确', () => {
    const root = buildTreeFromArr([1, 2, 3]);
    const s1 = SumRootToLeafStepCompiler.compileStage1(root);
    expect(s1.pop()?.totalSum).toBe(25);
  });
});
