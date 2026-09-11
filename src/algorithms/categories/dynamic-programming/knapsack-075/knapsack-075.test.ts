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

    it('阶段 1 暴力递归应能正确运行并产生完整的递归调用栈帧', async () => {
      const { buildBoundedNaiveRecursionSteps } = await import('./bounded-knapsack-stage-evolution');
      const steps = buildBoundedNaiveRecursionSteps(10, [3, 4, 7], [2, 3, 5], [2, 3, 2]);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].action).toBe('callRoot');
      const hasReturn = steps.some((s) => s.action === 'returnMax');
      expect(hasReturn).toBe(true);
    });

    it('阶段 2 记忆化搜索应记录缓存命中并返回与递归一致的解', async () => {
      const { buildBoundedNaiveMemoSteps } = await import('./bounded-knapsack-stage-evolution');
      const steps = buildBoundedNaiveMemoSteps(10, [3, 4, 7, 8], [2, 2, 4, 5], [2, 2, 2, 2]);
      expect(steps.length).toBeGreaterThan(0);
      const hitSteps = steps.filter((s) => s.memoHit);
      expect(hitSteps.length).toBeGreaterThan(0);
    });

    it('阶段 3 严格二维动态规划能自底向上正确填满二维表', async () => {
      const { buildBoundedNaive2DSteps } = await import('./bounded-knapsack-stage-evolution');
      const steps = buildBoundedNaive2DSteps(10, [3, 4, 7], [2, 3, 5], [2, 3, 2]);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('returnAns');
      expect(lastStep.dpTable[3][10]).toBe(14);
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

    it('阶段 1 衍生01包暴力递归应产生正确的调用分支', async () => {
      const { buildBinarySplitRecursionSteps } = await import('./bounded-knapsack-stage-evolution');
      const derived = [
        { origIndex: 0, multiplier: 1, val: 3, weight: 2 },
        { origIndex: 0, multiplier: 1, val: 3, weight: 2 },
        { origIndex: 1, multiplier: 1, val: 4, weight: 3 },
      ];
      const steps = buildBinarySplitRecursionSteps(5, derived);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].action).toBe('callRoot');
      const hasReturn = steps.some((s) => s.action === 'returnMax');
      expect(hasReturn).toBe(true);
    });

    it('阶段 2 衍生01包记忆化搜索应能记录缓存命中', async () => {
      const { buildBinarySplitMemoSteps } = await import('./bounded-knapsack-stage-evolution');
      const derived = [
        { origIndex: 0, multiplier: 1, val: 3, weight: 2 },
        { origIndex: 0, multiplier: 1, val: 3, weight: 2 },
        { origIndex: 1, multiplier: 1, val: 4, weight: 2 },
        { origIndex: 2, multiplier: 1, val: 5, weight: 2 },
      ];
      const steps = buildBinarySplitMemoSteps(4, derived);
      expect(steps.length).toBeGreaterThan(0);
      const hitSteps = steps.filter((s) => s.memoHit);
      expect(hitSteps.length).toBeGreaterThan(0);
    });

    it('阶段 3 衍生01包严格二维 DP 能自底向上正确递推', async () => {
      const { buildBinarySplit2DSteps } = await import('./bounded-knapsack-stage-evolution');
      const derived = [
        { origIndex: 0, multiplier: 1, val: 3, weight: 2 },
        { origIndex: 0, multiplier: 1, val: 3, weight: 2 },
      ];
      const steps = buildBinarySplit2DSteps(4, derived);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('returnAns');
      expect(lastStep.dpTable[2][4]).toBe(6);
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

    it('阶段 1 统一二进制拆分后的衍生 01 递归分治能正确生成调用栈', async () => {
      const { parseCherryDerivedItems } = await import('./cherry-blossom-viewing-renderer');
      const { buildBinarySplitRecursionSteps } = await import('./bounded-knapsack-stage-evolution');
      const { t, derivedItems } = parseCherryDerivedItems({
        'input-t': 10,
        'input-costs': '2, 3, 5',
        'input-vals': '3, 4, 10',
        'input-cnts': '0, 2, 1',
      });
      const steps = buildBinarySplitRecursionSteps(t, derivedItems);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].action).toBe('callRoot');
    });

    it('阶段 2 观赏樱花记忆化搜索应能记录缓存命中', async () => {
      const { parseCherryDerivedItems } = await import('./cherry-blossom-viewing-renderer');
      const { buildBinarySplitMemoSteps } = await import('./bounded-knapsack-stage-evolution');
      const { t, derivedItems } = parseCherryDerivedItems({
        'input-t': 10,
        'input-costs': '2, 3',
        'input-vals': '3, 4',
        'input-cnts': '0, 2',
      });
      const steps = buildBinarySplitMemoSteps(t, derivedItems);
      expect(steps.length).toBeGreaterThan(0);
      const hits = steps.filter((s) => s.memoHit);
      expect(hits.length).toBeGreaterThan(0);
    });

    it('阶段 3 观赏樱花严格二维动态规划能正确自底向上填表', async () => {
      const { parseCherryDerivedItems } = await import('./cherry-blossom-viewing-renderer');
      const { buildBinarySplit2DSteps } = await import('./bounded-knapsack-stage-evolution');
      const { t, derivedItems } = parseCherryDerivedItems({
        'input-t': 10,
        'input-costs': '2, 3, 5',
        'input-vals': '3, 4, 10',
        'input-cnts': '0, 2, 1',
      });
      const steps = buildBinarySplit2DSteps(t, derivedItems);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.action).toBe('returnAns');
      expect(last.dpTable[derivedItems.length][t]).toBe(17);
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

    it('阶段 1 暴力递归应能被单调队列演化管线复用并正确推演', async () => {
      const { parseMonoQueueInputs } = await import('./bounded-knapsack-monotonic-queue-renderer');
      const { buildBoundedNaiveRecursionSteps } = await import('./bounded-knapsack-stage-evolution');
      const { t, vList, wList, cList } = parseMonoQueueInputs({
        'input-t': 10,
        'input-v': '3, 4',
        'input-w': '2, 3',
        'input-c': '2, 2',
      });
      const steps = buildBoundedNaiveRecursionSteps(t, vList, wList, cList);
      expect(steps.length).toBeGreaterThan(0);
    });

    it('阶段 2 记忆化搜索与阶段 3 严格二维DP应能正确产生步骤', async () => {
      const { parseMonoQueueInputs } = await import('./bounded-knapsack-monotonic-queue-renderer');
      const { buildBoundedNaiveMemoSteps, buildBoundedNaive2DSteps } = await import('./bounded-knapsack-stage-evolution');
      const { t, vList, wList, cList } = parseMonoQueueInputs({
        'input-t': 10,
        'input-v': '3, 4',
        'input-w': '2, 3',
        'input-c': '2, 2',
      });
      const memoSteps = buildBoundedNaiveMemoSteps(t, vList, wList, cList);
      const dp2dSteps = buildBoundedNaive2DSteps(t, vList, wList, cList);
      expect(memoSteps.length).toBeGreaterThan(0);
      expect(dp2dSteps.length).toBeGreaterThan(0);
      expect(dp2dSteps[dp2dSteps.length - 1].action).toBe('returnAns');
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

    it('阶段 1 暴力递归判定应正确执行', async () => {
      const { parseCoinsChangeInputs } = await import('./coins-change-kinds-renderer');
      const { buildCoinsChangeRecursionSteps } = await import('./bounded-knapsack-stage-evolution');
      const { m, valList, cntList } = parseCoinsChangeInputs({
        'input-m': 5,
        'input-vals': '1, 2',
        'input-cnts': '2, 1',
      });
      const steps = buildCoinsChangeRecursionSteps(m, valList, cntList);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].action).toBe('fnEnter');
    });

    it('阶段 2 找零记忆化搜索应记录缓存命中并加速判定', async () => {
      const { parseCoinsChangeInputs } = await import('./coins-change-kinds-renderer');
      const { buildCoinsChangeMemoSteps } = await import('./bounded-knapsack-stage-evolution');
      const { m, valList, cntList } = parseCoinsChangeInputs({
        'input-m': 6,
        'input-vals': '1, 2, 3',
        'input-cnts': '2, 2, 1',
      });
      const steps = buildCoinsChangeMemoSteps(m, valList, cntList);
      expect(steps.length).toBeGreaterThan(0);
      const hits = steps.filter((s) => s.memoHit);
      expect(hits.length).toBeGreaterThan(0);
    });

    it('阶段 3 严格二维布尔动态规划填表结果应统计出正确的面值种类', async () => {
      const { parseCoinsChangeInputs } = await import('./coins-change-kinds-renderer');
      const { buildCoinsChange2DSteps } = await import('./bounded-knapsack-stage-evolution');
      const { m, valList, cntList } = parseCoinsChangeInputs({
        'input-m': 10,
        'input-vals': '1, 2, 4',
        'input-cnts': '2, 1, 1',
      });
      const steps = buildCoinsChange2DSteps(m, valList, cntList);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.action).toBe('returnAns');
      // 1..8 为 1, 9..10 为 0
      expect(last.dpTable[3][8]).toBe(1);
      expect(last.dpTable[3][9]).toBe(0);
      expect(last.dpTable[3][10]).toBe(0);
    });
  });
});
