import { describe, it, expect } from 'vitest';
import {
  buildLeftLeavesStage1Steps,
  buildLeftLeavesStage2BfsSteps,
  buildLeftLeavesStage3StackSteps,
  buildLeftLeavesSteps,
  parseAndBuildLeftLeavesTree,
  collectTreeValues,
} from './left-leaves-step-compiler';

describe('LeftLeavesStepCompiler (LeetCode 404)', () => {
  it('正确处理空树输入（Stage 1, 2, 3 均产生 3 步且总和为 0）', () => {
    const s1 = buildLeftLeavesStage1Steps(null);
    expect(s1.length).toBe(3);
    expect(s1[s1.length - 1].sum).toBe(0);
    expect(s1[0].codeLine).toBeDefined();

    const s2 = buildLeftLeavesStage2BfsSteps(null);
    expect(s2.length).toBe(3);
    expect(s2[s2.length - 1].sum).toBe(0);

    const s3 = buildLeftLeavesStage3StackSteps(null);
    expect(s3.length).toBe(3);
    expect(s3[s3.length - 1].sum).toBe(0);
  });

  it('单节点树避坑用例：根节点非左叶子，总和为 0', () => {
    const root = parseAndBuildLeftLeavesTree({ tree: '[1]' });
    const s1 = buildLeftLeavesStage1Steps(root);
    expect(s1[s1.length - 1].sum).toBe(0);

    const s2 = buildLeftLeavesStage2BfsSteps(root);
    expect(s2[s2.length - 1].sum).toBe(0);

    const s3 = buildLeftLeavesStage3StackSteps(root);
    expect(s3[s3.length - 1].sum).toBe(0);
  });

  it('经典二叉树 [3, 9, 20, null, null, 15, 7] 正确命中左叶子 9 与 15 (和为 24)', () => {
    const root = parseAndBuildLeftLeavesTree({ tree: '3, 9, 20, null, null, 15, 7' });

    // Stage 1: DFS 递归
    const s1 = buildLeftLeavesStage1Steps(root);
    expect(s1.length).toBeGreaterThan(10);
    expect(s1[s1.length - 1].sum).toBe(24);
    for (const step of s1) {
      expect(step.codeLine).toBeDefined();
    }

    // Stage 2: BFS 队列
    const s2 = buildLeftLeavesStage2BfsSteps(root);
    expect(s2.length).toBeGreaterThan(5);
    expect(s2[s2.length - 1].sum).toBe(24);
    for (const step of s2) {
      expect(step.codeLine).toBeDefined();
    }

    // Stage 3: 显式迭代栈
    const s3 = buildLeftLeavesStage3StackSteps(root);
    expect(s3.length).toBeGreaterThan(5);
    expect(s3[s3.length - 1].sum).toBe(24);
    for (const step of s3) {
      expect(step.codeLine).toBeDefined();
    }
  });

  it('Legacy buildLeftLeavesSteps 兼容函数与 Stage 1 保持一致', () => {
    const root = parseAndBuildLeftLeavesTree({ tree: '1, 2, 3, 4, 5' });
    const legacySteps = buildLeftLeavesSteps(root);
    const stage1Steps = buildLeftLeavesStage1Steps(root);
    expect(legacySteps.length).toBe(stage1Steps.length);
    expect(legacySteps[legacySteps.length - 1].sum).toBe(4);
  });

  it('collectTreeValues 辅助函数完整收获节点序列', () => {
    const root = parseAndBuildLeftLeavesTree({ tree: '1, 2, 3' });
    const values = collectTreeValues(root);
    expect(values).toEqual([1, 2, 3]);
  });
});
