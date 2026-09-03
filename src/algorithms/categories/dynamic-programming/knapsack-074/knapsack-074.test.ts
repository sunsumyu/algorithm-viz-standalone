import { describe, it, expect } from 'vitest';
import { buildPartitionedKnapsackSteps } from './partitioned-knapsack-renderer';
import { buildCoinsFromPilesSteps } from './coins-from-piles-renderer';
import { buildUnboundedKnapsackSteps } from './unbounded-knapsack-renderer';
import { buildRegexMatchingSteps } from './regex-matching-renderer';
import { buildWildcardMatchingSteps } from './wildcard-matching-renderer';
import { buildBuyingHayMinCostSteps } from './buying-hay-min-cost-renderer';

describe('左程云算法讲解074 (背包DP-分组背包、完全背包) 完整算法与步骤生成测试套件', () => {
  // ==========================================
  // 1. Code01: 分组背包模版 (洛谷 P1757 通天之分组背包)
  // ==========================================
  describe('Code01: 分组背包模版 (partitioned-knapsack-standard)', () => {
    it('1.1 经典分组背包用例：组内互斥选择最大收益', () => {
      // 容量 m = 45, 物品数 n = 3
      // 物品1: cost=10, val=10, group=1
      // 物品2: cost=10, val=20, group=1 (同组更高价值)
      // 物品3: cost=20, val=20, group=2
      // 组1选物品2(cost 10, val 20)，组2选物品3(cost 20, val 20)，总容量 30 <= 45，最大价值应为 40
      const items = [
        { cost: 10, val: 10, group: 1 },
        { cost: 10, val: 20, group: 1 },
        { cost: 20, val: 20, group: 2 },
      ];
      const steps = buildPartitionedKnapsackSteps(45, items);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.maxVal).toBe(40);
    });

    it('1.2 边界情况：容量为 0 返回 0', () => {
      const steps = buildPartitionedKnapsackSteps(0, [{ cost: 10, val: 10, group: 1 }]);
      const last = steps[steps.length - 1];
      expect(last.maxVal).toBe(0);
    });
  });

  // ==========================================
  // 2. Code02: 从栈中取出K个硬币的最大面值和 (LeetCode 2218)
  // ==========================================
  describe('Code02: 从栈中取出K个硬币的最大面值和 (coins-from-piles)', () => {
    it('2.1 LeetCode 2218 官方示例 piles=[[1,100,3],[7,8,9]], k=2 最大面值为 101', () => {
      const piles = [
        [1, 100, 3],
        [7, 8, 9],
      ];
      const steps = buildCoinsFromPilesSteps(piles, 2);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.maxVal).toBe(101);
    });
  });

  // ==========================================
  // 3. Code03: 完全背包模版 (洛谷 P1616 疯狂的采药)
  // ==========================================
  describe('Code03: 完全背包模版 (unbounded-knapsack-standard)', () => {
    it('3.1 物品可无限次选取，正序空间压缩求最大价值', () => {
      // 时间 T = 70, 物品2件: cost=[71, 23], val=[100, 10]
      // 物品2可选 3 次：23 * 3 = 69 <= 70，价值 10 * 3 = 30
      const steps = buildUnboundedKnapsackSteps(70, [71, 23], [100, 10]);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.maxVal).toBe(30);
    });

    it('3.2 边界处理：单件物品完全填满', () => {
      const steps = buildUnboundedKnapsackSteps(10, [2], [5]);
      const last = steps[steps.length - 1];
      expect(last.maxVal).toBe(25); // 5 * 5 = 25
    });
  });

  // ==========================================
  // 4. Code04: 正则表达式匹配 (LeetCode 10)
  // ==========================================
  describe('Code04: 正则表达式匹配 (regex-matching)', () => {
    it('4.1 s="aab", p="c*a*b" 应能成功匹配 (true)', () => {
      const steps = buildRegexMatchingSteps('aab', 'c*a*b');
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.matched).toBe(true);
    });

    it('4.2 s="mississippi", p="mis*is*p*." 匹配失败 (false)', () => {
      const steps = buildRegexMatchingSteps('mississippi', 'mis*is*p*.');
      const last = steps[steps.length - 1];
      expect(last.matched).toBe(false);
    });
  });

  // ==========================================
  // 5. Code05: 通配符匹配 (LeetCode 44)
  // ==========================================
  describe('Code05: 通配符匹配 (wildcard-matching)', () => {
    it('5.1 s="adceb", p="*a*b" 应成功匹配 (true)', () => {
      const steps = buildWildcardMatchingSteps('adceb', '*a*b');
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.matched).toBe(true);
    });

    it('5.2 s="cb", p="?a" 匹配失败 (false)', () => {
      const steps = buildWildcardMatchingSteps('cb', '?a');
      const last = steps[steps.length - 1];
      expect(last.matched).toBe(false);
    });
  });

  // ==========================================
  // 6. Code06: 购买足量干草的最小花费 (洛谷 P2918)
  // ==========================================
  describe('Code06: 购买足量干草的最小花费 (buying-hay-min-cost)', () => {
    it('6.1 洛谷 P2918 经典用例：H=60, 2个供应商 [cost=5, val=10], [cost=100, val=100]', () => {
      // 供应商1: 5元买10磅。买6次花30元买60磅。
      // 供应商2: 100元买100磅。
      // 最小花费应为 30
      const steps = buildBuyingHayMinCostSteps(60, [5, 100], [10, 100]);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.status).toBe('done');
      expect(last.minCost).toBe(30);
    });

    it('6.2 超出 H 磅更便宜的情形：H=8, 供应商 [cost=10, val=5], [cost=12, val=10]', () => {
      // 供应商1: 买2次花20元买10磅 (10>=8)
      // 供应商2: 买1次花12元买10磅 (10>=8) -> 12 更便宜！
      const steps = buildBuyingHayMinCostSteps(8, [10, 12], [5, 10]);
      const last = steps[steps.length - 1];
      expect(last.minCost).toBe(12);
    });
  });

  // ==========================================
  // 7. 架构级防 Bug 校验：行号对齐与步骤单调性
  // ==========================================
  describe('7. 架构级防 Bug 校验：代码行号合法性', () => {
    it('7.1 所有 6 个算法每个步骤的 codeLine 必须为合法正整数', () => {
      const getLine = (cl: any): number => (typeof cl === 'number' ? cl : cl?.java ?? cl?.cpp ?? 0);

      const s1 = buildPartitionedKnapsackSteps(10, [{ cost: 2, val: 3, group: 1 }]);
      s1.forEach((s) => expect(getLine(s.codeLine)).toBeGreaterThan(0));

      const s2 = buildCoinsFromPilesSteps([[1, 2]], 1);
      s2.forEach((s) => expect(getLine(s.codeLine)).toBeGreaterThan(0));

      const s3 = buildUnboundedKnapsackSteps(10, [2], [3]);
      s3.forEach((s) => expect(getLine(s.codeLine)).toBeGreaterThan(0));

      const s4 = buildRegexMatchingSteps('a', 'a');
      s4.forEach((s) => expect(getLine(s.codeLine)).toBeGreaterThan(0));

      const s5 = buildWildcardMatchingSteps('a', 'a');
      s5.forEach((s) => expect(getLine(s.codeLine)).toBeGreaterThan(0));

      const s6 = buildBuyingHayMinCostSteps(10, [2], [3]);
      s6.forEach((s) => expect(getLine(s.codeLine)).toBeGreaterThan(0));
    });
  });
});
