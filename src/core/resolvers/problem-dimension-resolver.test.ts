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
});
