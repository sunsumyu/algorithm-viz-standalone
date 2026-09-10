import { describe, it, expect } from 'vitest';
import { ProblemDimensionResolver } from './problem-dimension-resolver';

describe('ProblemDimensionResolver (Deep Module Unit Tests)', () => {
  it('1. 正确解析网格型题目 (unique-paths, min-path-sum)', () => {
    const res = ProblemDimensionResolver.resolve('unique-paths', { m: 3, n: 7 });
    expect(res.m).toBe(3);
    expect(res.n).toBe(7);
    expect(res.is1D).toBe(false);
    expect(res.category).toBe('2d-grid');
  });

  it('2. 正确解析双序列题目 (longest-repeated-subarray nums1/nums2)', () => {
    const res = ProblemDimensionResolver.resolve('longest-repeated-subarray', {
      nums1: [1, 2, 3, 2, 1],
      nums2: [3, 2, 1, 4, 7]
    });
    expect(res.m).toBe(6);
    expect(res.n).toBe(6);
    expect(res.is1D).toBe(false);
    expect(res.category).toBe('2d-sequence');
  });

  it('3. 正确解析双字符串题目 (longest-common-subsequence text1/text2)', () => {
    const res = ProblemDimensionResolver.resolve('longest-common-subsequence', {
      text1: 'abcde',
      text2: 'ace'
    });
    expect(res.m).toBe(6);
    expect(res.n).toBe(4);
    expect(res.is1D).toBe(false);
    expect(res.category).toBe('2d-sequence');
  });

  it('4. 正确解析股票系列 (prices)', () => {
    const res = ProblemDimensionResolver.resolve('best-time-to-buy-and-sell-stock', {
      prices: [7, 1, 5, 3, 6, 4]
    });
    expect(res.m).toBe(1);
    expect(res.n).toBe(6);
    expect(res.is1D).toBe(true);
    expect(res.category).toBe('stock');
  });

  it('5. 正确解析背包与零钱问题 (bagWeight/target)', () => {
    const res = ProblemDimensionResolver.resolve('coin-change', {
      coins: [1, 2, 5],
      target: 11
    });
    expect(res.m).toBe(1);
    expect(res.n).toBe(12);
    expect(res.is1D).toBe(true);
    expect(res.category).toBe('knapsack');
  });

  it('6. 正确解析基础一维斐波那契与爬楼梯 (n: 6)', () => {
    const res = ProblemDimensionResolver.resolve('climb-stairs', { n: 5 });
    expect(res.m).toBe(1);
    expect(res.n).toBe(5);
    expect(res.is1D).toBe(true);
    expect(res.category).toBe('1d-linear');
  });

  it('7. 正确识别并解析树型 DP 题目 (height-removal-queries, minimum-score, treeRoot)', () => {
    const res1 = ProblemDimensionResolver.resolve('height-removal-queries', {
      root: [1, 3, 4, 2, null, 6, 5],
      queries: [4]
    });
    expect(res1.category).toBe('tree');
    expect(ProblemDimensionResolver.isTreeProblem('height-removal-queries')).toBe(true);

    const res2 = ProblemDimensionResolver.resolve('minimum-score-after-removals', {
      nums: [1, 5, 5, 4, 11],
      edges: [[0, 1], [1, 2], [1, 3], [3, 4]]
    });
    expect(res2.category).toBe('tree');
    expect(ProblemDimensionResolver.isTreeProblem('minimum-score-after-removals')).toBe(true);

    const res3 = ProblemDimensionResolver.resolve('custom-tree', { root: [1, 2, 3] });
    expect(res3.category).toBe('tree');
  });
});
