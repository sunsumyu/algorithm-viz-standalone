import { describe, it, expect } from 'vitest';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import {
  MaxPathSumStepCompiler,
  buildMaxPathSumStage1Steps,
  buildMaxPathSumStage2InfoSteps,
  buildMaxPathSumStage3StackSteps,
} from './max-path-sum-step-compiler';

describe('MaxPathSumStepCompiler', () => {
  it('Stage 1: 经典拱形最值 [-10, 9, 20, null, null, 15, 7] 应收敛至 42', () => {
    const root = buildTreeFromArr([-10, 9, 20, null, null, 15, 7]);
    const steps = buildMaxPathSumStage1Steps(root);
    expect(steps.length).toBeGreaterThanOrEqual(10);
    const last = steps[steps.length - 1];
    expect(last.maxGlobalSum).toBe(42);
    expect(last.bestArchPath).toEqual(expect.arrayContaining([15, 20, 7]));
  });

  it('Stage 1: 全负数树 [-3, -2, -1] 应返回最大单个节点 -1', () => {
    const root = buildTreeFromArr([-3, -2, -1]);
    const steps = buildMaxPathSumStage1Steps(root);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].maxGlobalSum).toBe(-1);
  });

  it('Stage 2: 树形 DP 二元组 Info 数据流正确汇聚至 42', () => {
    const root = buildTreeFromArr([-10, 9, 20, null, null, 15, 7]);
    const steps = buildMaxPathSumStage2InfoSteps(root);
    expect(steps.length).toBeGreaterThanOrEqual(10);
    const last = steps[steps.length - 1];
    expect(last.maxGlobalSum).toBe(42);
    expect(last.infoResult).toBeDefined();
  });

  it('Stage 3: 显式栈后序模拟应正确遍历全树并收敛至 42', () => {
    const root = buildTreeFromArr([-10, 9, 20, null, null, 15, 7]);
    const steps = buildMaxPathSumStage3StackSteps(root);
    expect(steps.length).toBeGreaterThanOrEqual(10);
    const last = steps[steps.length - 1];
    expect(last.maxGlobalSum).toBe(42);
  });

  it('空树情况下三大 Stage 安全退出返回 0', () => {
    expect(buildMaxPathSumStage1Steps(null).pop()?.maxGlobalSum).toBe(0);
    expect(buildMaxPathSumStage2InfoSteps(null).pop()?.maxGlobalSum).toBe(0);
    expect(buildMaxPathSumStage3StackSteps(null).pop()?.maxGlobalSum).toBe(0);
  });

  it('深模块 MaxPathSumStepCompiler 静态门面委托正确', () => {
    const root = buildTreeFromArr([1, 2, 3]);
    const s1 = MaxPathSumStepCompiler.compileStage1(root);
    expect(s1.pop()?.maxGlobalSum).toBe(6);
    const s2 = MaxPathSumStepCompiler.compileStage2(root);
    expect(s2.pop()?.maxGlobalSum).toBe(6);
  });
});
