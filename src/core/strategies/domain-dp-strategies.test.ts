import { describe, it, expect } from 'vitest';
import { AlgorithmStrategyRegistry } from './algorithm-strategy-registry';
import { registerBuiltinStrategies } from './index';
import { AlgorithmModelRepository } from '../model-repository';
import '../../algorithms/categories/dynamic-programming/specs';

describe('Domain DP Strategies (背包、序列与一维独立算法策略)', () => {
  registerBuiltinStrategies();

  it('Knapsack: PartitionEqualSubsetSum 能够正确生成各阶段演化步骤', () => {
    const model = AlgorithmModelRepository.getModel('partition-equal-subset-sum');
    expect(model).toBeDefined();

    const s1Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 1, m: 4, n: 11 });
    expect(s1Steps).not.toBeNull();
    expect(s1Steps!.length).toBeGreaterThan(0);

    const s3Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 3, m: 4, n: 11 });
    expect(s3Steps).not.toBeNull();
    expect(s3Steps!.length).toBeGreaterThan(0);

    const s4Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 4, m: 4, n: 11 });
    expect(s4Steps).not.toBeNull();
    expect(s4Steps!.length).toBeGreaterThan(0);
  });

  it('Sequence: DistinctSubsequences 能够正确生成各阶段演化步骤', () => {
    const model = AlgorithmModelRepository.getModel('distinct-subsequences');
    expect(model).toBeDefined();

    const s1Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 1, m: 4, n: 3 });
    expect(s1Steps).not.toBeNull();
    expect(s1Steps!.length).toBeGreaterThan(0);

    const s3Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 3, m: 4, n: 3 });
    expect(s3Steps).not.toBeNull();
    expect(s3Steps!.length).toBeGreaterThan(0);
  });

  it('Interval: LongestPalindromicSubsequence 能够正确生成各阶段演化步骤', () => {
    const model = AlgorithmModelRepository.getModel('longest-palindromic-subsequence');
    expect(model).toBeDefined();

    const s3Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 3, m: 5, n: 5 });
    expect(s3Steps).not.toBeNull();
    expect(s3Steps!.length).toBeGreaterThan(0);
  });

  it('Linear 1D: Fibonacci 能够正确生成各阶段步骤', () => {
    const model = AlgorithmModelRepository.getModel('fibonacci');
    expect(model).toBeDefined();

    const s1Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 1, m: 5, n: 5 });
    expect(s1Steps).not.toBeNull();
    expect(s1Steps!.length).toBeGreaterThan(0);

    const s3Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 3, m: 5, n: 5 });
    expect(s3Steps).not.toBeNull();
    expect(s3Steps!.length).toBeGreaterThan(0);
  });

  it('Knapsack: TargetSum 能够正确生成各阶段演化步骤', () => {
    const model = AlgorithmModelRepository.getModel('target-sum');
    expect(model).toBeDefined();

    const s1Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 1, m: 5, n: 3 });
    expect(s1Steps).not.toBeNull();
    expect(s1Steps!.length).toBeGreaterThan(0);

    const s2Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 2, m: 5, n: 3, isMemo: true });
    expect(s2Steps).not.toBeNull();
    expect(s2Steps!.length).toBeGreaterThan(0);

    const s3Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 3, m: 5, n: 3 });
    expect(s3Steps).not.toBeNull();
    expect(s3Steps!.length).toBeGreaterThan(0);

    const s4Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 4, m: 5, n: 3 });
    expect(s4Steps).not.toBeNull();
    expect(s4Steps!.length).toBeGreaterThan(0);
  });

  it('Knapsack: CombinationSum4 能够正确生成各阶段演化步骤', () => {
    const model = AlgorithmModelRepository.getModel('combination-sum-iv');
    expect(model).toBeDefined();

    const s1Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 1, m: 3, n: 4 });
    expect(s1Steps).not.toBeNull();
    expect(s1Steps!.length).toBeGreaterThan(0);
    expect(s1Steps![0].treeRoot).toBeDefined();

    const s2Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 2, m: 3, n: 4, isMemo: true });
    expect(s2Steps).not.toBeNull();
    expect(s2Steps!.length).toBeGreaterThan(0);

    const s3Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 3, m: 3, n: 4 });
    expect(s3Steps).not.toBeNull();
    expect(s3Steps!.length).toBeGreaterThan(0);

    const s4Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 4, m: 3, n: 4 });
    expect(s4Steps).not.toBeNull();
    expect(s4Steps!.length).toBeGreaterThan(0);
  });

  it('TargetSumStandard: 第 73 课标准版完整生成递归树与调用栈', () => {
    const model = AlgorithmModelRepository.getModel('target-sum-standard');
    expect(model).toBeDefined();

    const s1Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 1, m: 5, n: 4 });
    expect(s1Steps).not.toBeNull();
    expect(s1Steps!.length).toBeGreaterThan(0);
    expect(s1Steps![0].treeRoot).toBeDefined();
    expect(s1Steps![0].activeNodeId).toBeDefined();
    expect(s1Steps![0].callStack).toBeDefined();

    const midStep1 = s1Steps![Math.floor(s1Steps!.length / 2)];
    expect(midStep1.treeRoot).toBeDefined();
    expect(midStep1.treeRoot!.children.length).toBeGreaterThan(0);
    expect(midStep1.activeNodeId).toBeDefined();
    expect(midStep1.callStack).toBeDefined();

    const s2Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 2, m: 5, n: 4, isMemo: true });
    expect(s2Steps).not.toBeNull();
    expect(s2Steps!.length).toBeGreaterThan(0);
    expect(s2Steps![0].treeRoot).toBeDefined();
    expect(s2Steps![0].activeNodeId).toBeDefined();
    expect(s2Steps![0].callStack).toBeDefined();

    const lastStep2 = s2Steps![s2Steps!.length - 1];
    expect(lastStep2.treeRoot).toBeDefined();
  });
});

