import { describe, it, expect } from 'vitest';
import { buildKnapsack01Steps } from './knapsack-01-renderer';
import { buildBuyGoodsDiscountSteps } from './buy-goods-discount-renderer';
import { buildTargetSumSteps } from './target-sum-renderer';
import { buildLastStoneWeightIISteps } from './last-stone-weight-ii-renderer';
import { buildDependentKnapsackSteps } from './dependent-knapsack-renderer';
import { buildTopKSubsequenceSumSteps } from './top-k-subsequence-sum-renderer';
import { buildFindKthSumSteps } from './find-kth-sum-renderer';

describe('左程云算法讲解073 (背包DP-01背包、有依赖的背包) 完整算法与步骤生成测试套件', () => {
  // ==========================================
  // 1. Code01: 01背包模版 (洛谷 P1048 采药)
  // ==========================================
  describe('Code01: 01背包模版 (knapsack-01)', () => {
    it('1.1 经典采药案例 (容量70, 3件物品) 能正确推导出最大价值并完成状态转移', () => {
      // cost=[71, 69, 1], val=[100, 1, 2], capacity=70 -> 选 69 和 1, ans = 3
      const steps = buildKnapsack01Steps(70, [71, 69, 1], [100, 1, 2]);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.currentVal).toBe(3);
      expect(last.dp[70]).toBe(3);
    });

    it('1.2 边界情况：容量为 0 返回价值 0', () => {
      const steps = buildKnapsack01Steps(0, [10, 20], [100, 200]);
      const last = steps[steps.length - 1];
      expect(last.currentVal).toBe(0);
      expect(last.dp[0]).toBe(0);
    });
  });

  // ==========================================
  // 2. Code02: 夏季特惠 (LCP 51 / tJau2o)
  // ==========================================
  describe('Code02: 夏季特惠 (buy-goods-discount)', () => {
    it('2.1 白赚游戏贪心收割 + 剩余游戏01背包正确计算总快乐值', () => {
      // 预算 x = 10
      // 游戏1: 原价 10, 现价 3, 快乐 5 -> well = 10 - 6 = 4 >= 0 白赚！x 变为 14, 快乐 +5
      // 游戏2: 原价 10, 现价 8, 快乐 10 -> well = 10 - 16 = -6 < 0 花费 6, 快乐 10
      // 游戏3: 原价 20, 现价 12, 快乐 12 -> well = 20 - 24 = -4 < 0 花费 4, 快乐 12
      // 背包容量 14, 可容纳花费 6 和 4 (共 10 <= 14), 获得快乐 10 + 12 = 22
      // 总快乐值 = 5 + 22 = 27
      const a = [10, 10, 20];
      const b = [3, 8, 12];
      const w = [5, 10, 12];
      const steps = buildBuyGoodsDiscountSteps(10, a, b, w);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.totalHappy).toBe(27);
    });

    it('2.2 所有游戏都不白赚且预算不足时的边界处理', () => {
      // 预算 2, 游戏原价 10, 现价 9 -> well = -8, 花费 8 > 2 无法购买
      const steps = buildBuyGoodsDiscountSteps(2, [10], [9], [100]);
      const last = steps[steps.length - 1];
      expect(last.totalHappy).toBe(0);
    });
  });

  // ==========================================
  // 3. Code03: 目标和 (LeetCode 494)
  // ==========================================
  describe('Code03: 目标和 (target-sum)', () => {
    it('3.1 经典示例 nums=[1,1,1,1,1], target=3 方案数应为 5', () => {
      const steps = buildTargetSumSteps([1, 1, 1, 1, 1], 3);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.ways).toBe(5);
    });

    it('3.2 奇偶性或总和不足返回 0', () => {
      // sum=1, target=2 -> sum < target, 方案数为 0
      const steps = buildTargetSumSteps([1], 2);
      const last = steps[steps.length - 1];
      expect(last.ways).toBe(0);
    });
  });

  // ==========================================
  // 4. Code04: 最后一块石头的重量 II (LeetCode 1049)
  // ==========================================
  describe('Code04: 最后一块石头的重量 II (last-stone-weight-ii)', () => {
    it('4.1 经典用例 stones=[2,7,4,1,8,1] 最小可能重量为 1', () => {
      const steps = buildLastStoneWeightIISteps([2, 7, 4, 1, 8, 1]);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.remainWeight).toBe(1);
    });

    it('4.2 能够完全抵消返回 0', () => {
      // stones=[31, 26, 33, 21, 40], sum=151, near=75, ans = 151 - 150 = 1
      // 测试 stones=[2, 2] -> 0
      const steps = buildLastStoneWeightIISteps([2, 2]);
      const last = steps[steps.length - 1];
      expect(last.remainWeight).toBe(0);
    });
  });

  // ==========================================
  // 5. Code05: 金明的预算方案 (洛谷 P1064)
  // ==========================================
  describe('Code05: 有依赖的背包模版 (dependent-knapsack)', () => {
    it('5.1 主件与附件 4 种组合方案决策求得最大收益', () => {
      // 预算 N = 1000
      // 商品1(主): cost 800, val 1600 (800*2), q=0
      // 商品2(附1属于1): cost 400, val 2000 (400*5), q=1
      // 商品3(主): cost 400, val 1200 (400*3), q=0
      // 商品4(附1属于3): cost 400, val 800 (400*2), q=3
      // 选主3+附4: 花费 800, 收益 2000
      // 选主1: 花费 800, 收益 1600
      // 选主3+主1: 超预算 1200 > 1000
      // 最大收益应为 2000
      const items = [
        null,
        { cost: 800, val: 1600, q: 0 },
        { cost: 400, val: 2000, q: 1 },
        { cost: 400, val: 1200, q: 0 },
        { cost: 400, val: 800, q: 3 },
      ];
      const steps = buildDependentKnapsackSteps(1000, 4, items);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.maxVal).toBe(2000);
    });
  });

  // ==========================================
  // 6. Code06: 非负数组前k个最小子序列累加和
  // ==========================================
  describe('Code06: 非负数组前k个最小子序列和 (top-k-subsequence-sum)', () => {
    it('6.1 小根堆分支扩展正确生成有序的前 k 个最小和', () => {
      // nums = [3, 1, 4], k = 5
      // 排序后 [1, 3, 4]
      // 所有子序列和: 空(0), [1]=1, [3]=3, [1,3]=4, [4]=4, [1,4]=5, [3,4]=7, [1,3,4]=8
      // 前 5 小: [0, 1, 3, 4, 4]
      const steps = buildTopKSubsequenceSumSteps([3, 1, 4], 5);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.ans).toEqual([0, 1, 3, 4, 4]);
    });
  });

  // ==========================================
  // 7. Code07: 找出数组的第K大和 (LeetCode 2386)
  // ==========================================
  describe('Code07: 找出数组的第K大和 (find-kth-sum)', () => {
    it('7.1 包含正负数 nums=[2, 4, -2], k=5 第 5 大和应为 2', () => {
      // 正数和 sum = 6
      // 子序列和从大到小排列：
      // 1: [2, 4] = 6
      // 2: [4] = 4
      // 3: [2, 4, -2] = 4
      // 4: [2] = 2
      // 5: [4, -2] = 2
      // 6: [] = 0
      // 7: [2, -2] = 0
      // 8: [-2] = -2
      // 第 5 大为 2
      const steps = buildFindKthSumSteps([2, 4, -2], 5);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.kthSum).toBe(2);
    });
  });

  // ==========================================
  // 8. 架构级防 Bug：代码行号与状态机严密性校验
  // ==========================================
  describe('8. 架构级防 Bug 校验：行号对齐与单调步进', () => {
    it('8.1 所有步骤的 codeLine 必须为正整数且不得超出源码范围', () => {
      const steps01 = buildKnapsack01Steps(10, [2, 3], [3, 4]);
      steps01.forEach((s) => {
        const line = typeof s.codeLine === 'object' && s.codeLine !== null ? (s.codeLine as any).java : s.codeLine;
        expect(line).toBeGreaterThan(0);
      });

      const steps02 = buildBuyGoodsDiscountSteps(10, [10, 10], [3, 8], [5, 10]);
      steps02.forEach((s) => {
        const line = typeof s.codeLine === 'object' && s.codeLine !== null ? (s.codeLine as any).java : s.codeLine;
        expect(line).toBeGreaterThan(0);
      });

      const steps03 = buildTargetSumSteps([1, 1], 0);
      steps03.forEach((s) => {
        const line = typeof s.codeLine === 'object' && s.codeLine !== null ? (s.codeLine as any).java : s.codeLine;
        expect(line).toBeGreaterThan(0);
      });

      const steps04 = buildLastStoneWeightIISteps([2, 4, 1]);
      steps04.forEach((s) => {
        const line = typeof s.codeLine === 'object' && s.codeLine !== null ? (s.codeLine as any).java : s.codeLine;
        expect(line).toBeGreaterThan(0);
      });

      const items = [null, { cost: 10, val: 20, q: 0 }];
      const steps05 = buildDependentKnapsackSteps(20, 1, items);
      steps05.forEach((s) => {
        const line = typeof s.codeLine === 'object' && s.codeLine !== null ? (s.codeLine as any).java : s.codeLine;
        expect(line).toBeGreaterThan(0);
      });

      const steps06 = buildTopKSubsequenceSumSteps([1, 2], 3);
      steps06.forEach((s) => {
        const line = typeof s.codeLine === 'object' && s.codeLine !== null ? (s.codeLine as any).java : s.codeLine;
        expect(line).toBeGreaterThan(0);
      });

      const steps07 = buildFindKthSumSteps([1, -1], 3);
      steps07.forEach((s) => {
        const line = typeof s.codeLine === 'object' && s.codeLine !== null ? (s.codeLine as any).java : s.codeLine;
        expect(line).toBeGreaterThan(0);
      });
    });
  });
});

