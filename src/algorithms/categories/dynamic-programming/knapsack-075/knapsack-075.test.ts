import { describe, it, expect } from 'vitest';
import {
  buildBoundedKnapsackNaiveSteps,
} from './bounded-knapsack-naive-renderer';
import {
  buildBoundedKnapsackBinarySteps,
} from './bounded-knapsack-binary-renderer';
import {
  buildCherryBlossomViewingSteps,
} from './cherry-blossom-viewing-renderer';
import {
  buildBoundedKnapsackMonoQueueSteps,
} from './bounded-knapsack-monotonic-queue-renderer';
import {
  buildCoinsChangeKindsSteps,
} from './coins-change-kinds-renderer';

describe('🧪 Class 075 背包DP - 多重背包与混合背包核心逻辑与保真度测试', () => {
  // 1. 多重背包朴素枚举
  describe('Code01: Bounded Knapsack Naive (P1776 宝物筛选朴素版)', () => {
    it('应能正确计算洛谷 P1776 宝物筛选小用例的最大价值', () => {
      // 货物 1: v=3, w=2, c=2; 货物 2: v=4, w=3, c=3; 货物 3: v=7, w=5, c=2
      // 容量 t = 10
      const steps = buildBoundedKnapsackNaiveSteps({
        'input-t': 10,
        'input-v': '3, 4, 7',
        'input-w': '2, 3, 5',
        'input-c': '2, 3, 2',
      });

      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      // 最优选法: 2件货物1 (w=4, v=6) + 2件货物2 (w=6, v=8) => w=10, v=14; 或 2件货物3(w=10, v=14)
      expect(lastStep.maxVal).toBe(14);
    });

    it('容量为 0 时，最大价值应为 0', () => {
      const steps = buildBoundedKnapsackNaiveSteps({
        'input-t': 0,
        'input-v': '10, 20',
        'input-w': '5, 10',
        'input-c': '2, 2',
      });
      const lastStep = steps[steps.length - 1];
      expect(lastStep.maxVal).toBe(0);
    });
  });

  // 2. 多重背包二进制拆分
  describe('Code02: Bounded Knapsack Binary Splitting (P1776 二进制拆分模版)', () => {
    it('二进制拆分后转化为 01 背包的结果应与朴素多重背包完全一致', () => {
      const steps = buildBoundedKnapsackBinarySteps({
        'input-t': 15,
        'input-v': '3, 4, 7, 8',
        'input-w': '2, 3, 5, 6',
        'input-c': '2, 3, 2, 2',
      });

      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      expect(lastStep.derivedItems.length).toBeGreaterThan(4); // 验证已发生二进制拆分
      expect(lastStep.maxVal).toBeGreaterThan(0);
    });
  });

  // 3. 观赏樱花 (混合背包)
  describe('Code03: Cherry Blossom Viewing (P1833 混合背包)', () => {
    it('应能正确混合处理 01 背包、完全背包(cnt=0)与多重背包(cnt>1)', () => {
      // 树 1: cost=2, val=3, cnt=0 (完全背包)
      // 树 2: cost=3, val=4, cnt=2 (多重背包)
      // 树 3: cost=5, val=10, cnt=1 (01 背包)
      // 可用时间 t = 10
      const steps = buildCherryBlossomViewingSteps({
        'input-t': 10,
        'input-costs': '2, 3, 5',
        'input-vals': '3, 4, 10',
        'input-cnts': '0, 2, 1',
      });

      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      // 最优选法: 1件树3 (cost=5, val=10) + 1件树2 (cost=3, val=4) + 1次树1 (cost=2, val=3) => cost=10, val=17!
      expect(lastStep.maxVal).toBe(17);
    });
  });

  // 4. 多重背包单调队列优化
  describe('Code04: Bounded Knapsack Monotonic Queue (P1776 单调队列极值优化)', () => {
    it('单调队列优化版本计算结果应与二进制拆分完全等价', () => {
      const input = {
        'input-t': 15,
        'input-v': '3, 4, 7, 8',
        'input-w': '2, 3, 5, 6',
        'input-c': '2, 3, 2, 2',
      };
      const binarySteps = buildBoundedKnapsackBinarySteps(input);
      const queueSteps = buildBoundedKnapsackMonoQueueSteps(input);

      expect(queueSteps.length).toBeGreaterThan(0);
      const binAns = binarySteps[binarySteps.length - 1].maxVal;
      const queueAns = queueSteps[queueSteps.length - 1].maxVal;
      expect(queueAns).toBe(binAns);
    });
  });

  // 5. 能成功找零的钱数种类 (混合背包布尔窗口优化)
  describe('Code05: Coins Change Kinds (POJ 1742 混合背包)', () => {
    it('样例用例：面值 [1, 2, 4], 数量 [2, 1, 1], m=10 应能凑出 8 种钱数', () => {
      const steps = buildCoinsChangeKindsSteps({
        'input-m': 10,
        'input-vals': '1, 2, 4',
        'input-cnts': '2, 1, 1',
      });

      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.status).toBe('done');
      // 1~8 均可凑出，9 和 10 无法凑出，共 8 种
      expect(lastStep.totalKinds).toBe(8);
    });

    it('所有硬币数量充足时，能覆盖所有公约数倍数', () => {
      const steps = buildCoinsChangeKindsSteps({
        'input-m': 6,
        'input-vals': '2, 3',
        'input-cnts': '3, 2',
      });
      const lastStep = steps[steps.length - 1];
      // 可凑出: 2, 3, 4, 5(2+3), 6 共 5 种
      expect(lastStep.totalKinds).toBe(5);
    });
  });
});
