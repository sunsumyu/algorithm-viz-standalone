/**
 * 问题维度与布局特征解析深模块 (ProblemDimensionResolver Deep Module)
 * 遵循单一职责与深模块原则：
 * 封装全部 1D/2D、单序列/双序列、背包、股票、网格参数维度的统一归一化计算。
 */

export interface ResolvedDimensions {
  /** 行数 / 主维度 */
  m: number;
  /** 列数 / 次维度 / 状态槽位数 */
  n: number;
  /** 是否为纯一维线性动规 (用于控制 Card 1 槽位与 m 尺寸控件隐藏) */
  is1D: boolean;
  /** 问题类别特征 */
  category: '1d-linear' | '2d-grid' | '2d-sequence' | 'knapsack' | 'stock' | 'tree';
}

export class ProblemDimensionResolver {
  private static readonly GRID_PROBLEM_IDS = new Set([
    'unique-paths',
    'unique-paths-ii',
    'min-path-sum'
  ]);

  private static readonly PURE_1D_PROBLEM_IDS = new Set([
    'fibonacci',
    'climb-stairs',
    'min-cost',
    'min-cost-climbing-stairs',
    'integer-break',
    'unique-bst',
    'decode-ways',
    'house-robber',
    'house-robber-ii',
    'house-robber-iii',
    'best-time-to-buy-and-sell-stock',
    'best-time-to-buy-and-sell-stock-ii',
    'best-time-to-buy-and-sell-stock-iii',
    'best-time-to-buy-and-sell-stock-iv',
    'best-time-to-buy-and-sell-stock-with-cooldown',
    'best-time-to-buy-and-sell-stock-with-transaction-fee',
    'longest-increasing-subsequence',
    'longest-continuous-increasing-subsequence',
    'max-subarray-dp',
    'perfect-squares',
    'coin-change',
    'coin-change-ii',
    'word-break',
    'combination-sum-iv',
    'target-sum',
    'last-stone-weight-ii',
    'complete-knapsack',
    'partition-equal-subset-sum',
    'multiple-knapsack'
  ]);

  /**
   * 归一化解析算法默认参数与维度
   */
  public static resolve(modelId: string, params?: Record<string, any>): ResolvedDimensions {
    if (!params) {
      return { m: 1, n: 6, is1D: true, category: '1d-linear' };
    }

    let m = 1;
    let n = 6;
    let category: ResolvedDimensions['category'] = '1d-linear';

    // 1. 显式 m/n 网格类型 (例如不同路径、最小路径和)
    if (this.GRID_PROBLEM_IDS.has(modelId) || (params.m !== undefined && params.n !== undefined && !params.nums1 && !params.text1)) {
      m = Number(params.m ?? 3);
      n = Number(params.n ?? 3);
      category = '2d-grid';
      return { m, n, is1D: false, category };
    }

    // 2. 双序列匹配类型 (nums1/nums2, text1/text2, word1/word2, s/t)
    if (params.nums1 !== undefined && params.nums2 !== undefined) {
      const n1 = this.toArray(params.nums1);
      const n2 = this.toArray(params.nums2);
      m = n1.length + 1;
      n = n2.length + 1;
      category = '2d-sequence';
      return { m, n, is1D: false, category };
    }

    if (params.text1 !== undefined && params.text2 !== undefined) {
      m = String(params.text1).length + 1;
      n = String(params.text2).length + 1;
      category = '2d-sequence';
      return { m, n, is1D: false, category };
    }

    if (params.word1 !== undefined && params.word2 !== undefined) {
      m = String(params.word1).length + 1;
      n = String(params.word2).length + 1;
      category = '2d-sequence';
      return { m, n, is1D: false, category };
    }

    if (params.s !== undefined && params.t !== undefined) {
      m = String(params.s).length + 1;
      n = String(params.t).length + 1;
      category = '2d-sequence';
      return { m, n, is1D: false, category };
    }

    // 3. 股票买卖系列 (prices 数组)
    if (params.prices !== undefined) {
      const prices = this.toArray(params.prices);
      m = 1;
      n = prices.length;
      category = 'stock';
      return { m, n, is1D: true, category };
    }

    // 4. 背包类问题 (weights/values/bagWeight/target)
    if (params.bagWeight !== undefined || params.target !== undefined || params.weights !== undefined) {
      const bag = Number(params.bagWeight ?? params.target ?? 0);
      m = 1;
      n = bag > 0 ? bag + 1 : 6;
      category = 'knapsack';
      return { m, n, is1D: true, category };
    }

    // 5. 纯一维数组类型 (nums)
    if (params.nums !== undefined) {
      const nums = this.toArray(params.nums);
      m = 1;
      n = nums.length;
      category = '1d-linear';
      return { m, n, is1D: true, category };
    }

    // 6. 单一字符串 (s)
    if (params.s !== undefined) {
      m = 1;
      n = String(params.s).length;
      category = '1d-linear';
      return { m, n, is1D: true, category };
    }

    // 7. 单一整数标量 (n)
    if (params.n !== undefined) {
      m = 1;
      n = Number(params.n);
      category = '1d-linear';
      return { m, n, is1D: true, category };
    }

    const is1D = m <= 1 || this.PURE_1D_PROBLEM_IDS.has(modelId);
    return { m, n, is1D, category };
  }

  private static toArray(val: any): number[] {
    if (Array.isArray(val)) return val.map(Number);
    if (typeof val === 'string') return val.split(',').map(s => Number(s.trim()));
    return [Number(val)];
  }
}
