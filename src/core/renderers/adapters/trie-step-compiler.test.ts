import { describe, it, expect } from 'vitest';
import { BinaryTrieStepCompiler } from './trie-step-compiler';

describe('BinaryTrieStepCompiler (01-Trie 步进推演核心编译器门禁)', () => {
  it('1. compileTwoNumbersMaxXorSteps 应正确计算两数最大异或值并维护全局极值', () => {
    const nums = [3, 10, 5, 25, 2, 8];
    const steps = BinaryTrieStepCompiler.compileTwoNumbersMaxXorSteps(nums, 5);

    expect(steps.length).toBeGreaterThan(6);
    expect(steps[0].globalMaxXor).toBe(0);
    expect(steps[0].trieSize).toBe(1);

    const sLast = steps[steps.length - 1];
    expect(sLast.globalMaxXor).toBe(28); // 5 ^ 25 = 28
    expect(sLast.bestPair).toEqual([5, 25]);
    expect(sLast.nodesList?.length).toBeGreaterThan(5);
  });

  it('2. compileStaticArraySteps 应生成竞赛连续静态数组 tree[N][2] 内存映射推演', () => {
    const nums = [3, 10, 5, 25, 2, 8];
    const steps = BinaryTrieStepCompiler.compileStaticArraySteps(nums, 5);

    expect(steps.length).toBeGreaterThan(6);
    const sLast = steps[steps.length - 1];
    expect(sLast.globalMaxXor).toBe(28);
    expect(sLast.staticTable).toBeDefined();
    expect(sLast.staticTable?.rows.length).toBeGreaterThan(1);
    expect(sLast.stageId).toBe('stage-2');
  });

  it('3. compileSubarrayMaxXorSteps 利用前缀异或自反性正确求出子数组最大异或和', () => {
    const nums = [3, 1, 4, 2, 5];
    const steps = BinaryTrieStepCompiler.compileSubarrayMaxXorSteps(nums, 5);

    expect(steps.length).toBeGreaterThan(5);
    const sLast = steps[steps.length - 1];
    expect(sLast.globalMaxXor).toBe(7); // 1 ^ 4 ^ 2 = 7
    expect(sLast.prefixXorList?.length).toBe(6);
    expect(sLast.stageId).toBe('stage-3');
  });
});
