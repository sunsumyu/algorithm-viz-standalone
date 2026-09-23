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
    'partition-equal-subset-sum',
    'multiple-knapsack',
    'candy',
    'min-arrows',
    'non-overlapping',
    'merge-intervals',
    'partition-labels',
    'lemonade',
    'monotone-digits',
    'two-city-scheduling',
    'meeting-rooms-ii',
    'course-schedule-iii',
    'largest-number',
    'minimum-cost-connect-sticks',
    'minimum-eat-oranges',
    'absolute-value-add-to-array',
    'cutting-bamboo',
    'ipo',
    'maximum-product-k-parts',
    'meeting-monopoly',
    'meeting-one-day',
  ]);

  private static readonly TREE_PROBLEM_IDS = new Set([
    'max-distance-in-tree',
    'largest-bst-subtree',
    'max-path-sum',
    'tree-diameter',
    'binary-tree-cameras',
    'tree-cameras',
    'course-selection',
    'minimum-fuel-cost',
    'longest-path-different-characters',
    'party-without-boss',
    'height-removal-queries',
    'minimum-score-after-removals',
    'house-robber-iii'
  ]);

  /**
   * 判断目标模型或参数是否为树型问题
   */
  public static isTreeProblem(modelId: string, params?: Record<string, any>): boolean {
    return this.TREE_PROBLEM_IDS.has(modelId) || !!(params && (params.root !== undefined || (params.edges !== undefined && !params.grid)));
  }

  /**
   * 判断目标模型或参数是否为纯一维线性动规问题
   */
  public static isPure1DProblem(modelId: string, params?: Record<string, any>): boolean {
    if (this.PURE_1D_PROBLEM_IDS.has(modelId)) return true;
    if (params && params.m === 1) return true;
    return false;
  }

  /**
   * 归一化解析算法默认参数与维度
   */
  public static resolve(modelId: string, params?: Record<string, any>, currentStage?: string): ResolvedDimensions {
    if (this.isTreeProblem(modelId, params)) {
      return { m: 1, n: 6, is1D: true, category: 'tree' };
    }

    if (!params) {
      return { m: 1, n: 6, is1D: true, category: '1d-linear' };
    }

    let m = 1;
    let n = 6;
    let category: ResolvedDimensions['category'] = '1d-linear';

    // 0. 特殊二维费用背包 (如 ones-and-zeroes: strs 结合 m 个 0 和 n 个 1)
    if (params.strs !== undefined && params.m !== undefined && params.n !== undefined) {
      m = Number(params.m) + 1;
      n = Number(params.n) + 1;
      category = 'knapsack';
      return { m, n, is1D: false, category };
    }

    // 0.1 优先检测是否具备双序列参数 (避免被后续的 params.m / params.n 误判为普通网格)
    const hasSequenceParams = !!(
      (params.nums1 !== undefined && params.nums2 !== undefined) ||
      (params.text1 !== undefined && params.text2 !== undefined) ||
      (params.word1 !== undefined && params.word2 !== undefined) ||
      (params.s !== undefined && params.t !== undefined) ||
      (params.s1 !== undefined && params.s2 !== undefined) ||
      (params.g !== undefined && params.s !== undefined)
    );

    // 1. 显式 m/n 网格类型 (例如不同路径、最小路径和)
    if (!hasSequenceParams && (this.GRID_PROBLEM_IDS.has(modelId) || (params.m !== undefined && params.n !== undefined))) {
      m = Number(params.m ?? 3);
      n = Number(params.n ?? 3);
      category = '2d-grid';
      return { m, n, is1D: false, category };
    }

    // 2. 双序列匹配类型 (nums1/nums2, text1/text2, word1/word2, s/t, s1/s2, g/s)
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

    if (params.s1 !== undefined && params.s2 !== undefined) {
      m = String(params.s1).length + 1;
      n = String(params.s2).length + 1;
      category = '2d-sequence';
      return { m, n, is1D: false, category };
    }

    if (params.g !== undefined && params.s !== undefined) {
      const g = this.toArray(params.g);
      const s = this.toArray(params.s);
      const isStage2or3 = currentStage === 'stage-2' || currentStage === 'stage-3';
      const isExplicit1D = currentStage === 'stage-1' || currentStage === 'stage-4';

      if (isExplicit1D) {
        // Stage 1 (双指针贪心) 与 Stage 4 (空间压缩) 为纯粹的一维双指针推进
        m = 1;
        n = g.length;
        category = '1d-linear';
        return { m, n, is1D: true, category };
      } else {
        // Stage 2 (备忘录) 与 Stage 3 (DP填表) 及默认目录维度为完备 (m+1) x (n+1) 二维矩阵
        m = g.length + 1;
        n = s.length + 1;
        category = '2d-sequence';
        return { m, n, is1D: false, category };
      }
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
      const wArr = params.weights ? this.toArray(params.weights) : (params.nums ? this.toArray(params.nums) : []);
      const isStage4 = currentStage === 'stage-4' || currentStage === 'stage-5';
      m = (!isStage4 && wArr.length > 0) ? wArr.length : 1;
      n = bag > 0 ? bag + 1 : 6;
      category = 'knapsack';
      const is1D = isStage4 || m <= 1 || this.PURE_1D_PROBLEM_IDS.has(modelId);
      return { m, n, is1D, category };
    }

    // 5. 纯一维数组与区间类型 (points / intervals / ratings / nums)
    if (params.points !== undefined) {
      const points = this.toArray(params.points);
      m = 1;
      n = points.length;
      category = '1d-linear';
      return { m, n, is1D: true, category };
    }

    if (params.intervals !== undefined) {
      const intervals = this.toArray(params.intervals);
      m = 1;
      n = intervals.length;
      category = '1d-linear';
      return { m, n, is1D: true, category };
    }

    if (params.events !== undefined) {
      const events = this.toArray(params.events);
      m = 1;
      n = events.length;
      category = '1d-linear';
      return { m, n, is1D: true, category };
    }

    if (params.ratings !== undefined) {
      const ratings = this.toArray(params.ratings);
      m = 1;
      n = ratings.length;
      category = '1d-linear';
      return { m, n, is1D: true, category };
    }

    if (params.sticks !== undefined) {
      const sticks = this.toArray(params.sticks);
      m = 1;
      n = sticks.length;
      category = '1d-linear';
      return { m, n, is1D: true, category };
    }

    if (params.courses !== undefined) {
      const courses = this.toArray(params.courses);
      m = 1;
      n = courses.length;
      category = '1d-linear';
      return { m, n, is1D: true, category };
    }

    if (params.costs !== undefined) {
      const costs = this.toArray(params.costs);
      m = 1;
      n = costs.length;
      category = '1d-linear';
      return { m, n, is1D: true, category };
    }

    if (params.profits !== undefined) {
      const profits = this.toArray(params.profits);
      m = 1;
      n = profits.length;
      category = '1d-linear';
      return { m, n, is1D: true, category };
    }

    if (params.nums !== undefined) {
      const nums = this.toArray(params.nums);
      m = 1;
      n = nums.length;
      category = '1d-linear';
      return { m, n, is1D: true, category };
    }

    if (params.bills !== undefined) {
      const bills = this.toArray(params.bills);
      m = 1;
      n = bills.length;
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

    if (modelId === 'monotone-digits' && params.n !== undefined) {
      m = 1;
      n = String(params.n).length;
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

  private static toArray(val: any): any[] {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          // fallback to split
        }
      }
      return val.split(',').map(s => Number(s.trim()));
    }
    return [Number(val)];
  }
}
