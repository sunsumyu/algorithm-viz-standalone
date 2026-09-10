import { describe, it, expect } from 'vitest';
import {
  buildKnapsackRecursionSteps,
  buildKnapsackMemoSteps,
  buildKnapsack2DSteps,
  renderKnapsackRecursionCard1,
  renderKnapsackRecursionCard2,
  renderKnapsackMemoCard1,
  renderKnapsackMemoCard2,
  renderKnapsack2DCard1,
  renderKnapsack2DCard2,
} from './knapsack-stage-evolution';
import {
  buildBuyingHayRecursionSteps,
  buildBuyingHayMemoSteps,
  buildBuyingHay2DSteps,
  buildCoinsFromPilesRecursionSteps,
  buildCoinsFromPilesMemoSteps,
  buildCoinsFromPiles2DSteps,
  renderSpecialRecursionCard1,
  renderSpecialMemoCard1,
  renderSpecialMemoCard2,
  renderSpecial2DCard1,
  renderSpecial2DCard2,
} from './knapsack-special-stage-evolution';
import {
  buildBoundedNaiveRecursionSteps,
  buildBoundedNaiveMemoSteps,
  buildBoundedNaive2DSteps,
  buildBinarySplitRecursionSteps,
  buildBinarySplitMemoSteps,
  buildBinarySplit2DSteps,
  buildCoinsChangeRecursionSteps,
  buildCoinsChangeMemoSteps,
  buildCoinsChange2DSteps,
} from './bounded-knapsack-stage-evolution';
import {
  buildStringDpRecursionSteps,
  buildStringDpMemoSteps,
  buildStringDp2DSteps,
  renderStringDpRecursionCard1,
  renderStringDpRecursionCard2,
  renderStringDpMemoCard1,
  renderStringDpMemoCard2,
  renderStringDp2DCard1,
  renderStringDp2DCard2,
} from './string-dp-stage-evolution';
import { KnapsackItem } from '../knapsack-execution-engine';

function createMockContainer(): HTMLElement {
  return {
    innerHTML: '',
    querySelector: () => null,
  } as unknown as HTMLElement;
}

describe('Knapsack 4-Stage Evolution Engine & Renderers', () => {
  const sampleItems: KnapsackItem[] = [
    { cost: 2, val: 3, id: 1, name: '物品#1' },
    { cost: 3, val: 4, id: 2, name: '物品#2' },
    { cost: 4, val: 5, id: 3, name: '物品#3' },
  ];

  describe('Stage 1: 递归暴力搜索 (buildKnapsackRecursionSteps)', () => {
    it('should generate valid recursion steps for 01 knapsack', () => {
      const steps = buildKnapsackRecursionSteps('01', 5, sampleItems);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].curIndex).toBe(0);
      expect(steps[0].totalSteps).toBe(steps.length);
      expect(steps.some((s) => s.type === 'call')).toBe(true);
      expect(steps.some((s) => s.type === 'return' || s.type === 'base')).toBe(true);

      const div1 = createMockContainer();
      const div2 = createMockContainer();
      renderKnapsackRecursionCard1(div1, steps[0]);
      renderKnapsackRecursionCard2(div2, steps[0]);
      expect(div1.innerHTML).toContain('运行时调用栈');
      expect(div2.innerHTML).toContain('暴力递归探索开销统计');
    });

    it('should generate valid recursion steps for unbounded knapsack', () => {
      const steps = buildKnapsackRecursionSteps('unbounded', 5, sampleItems);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps.some((s) => s.type === 'call')).toBe(true);
    });
  });

  describe('Stage 2: 记忆化搜索 (buildKnapsackMemoSteps)', () => {
    it('should track memo cache hits and misses', () => {
      const steps = buildKnapsackMemoSteps('01', 5, sampleItems);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps.some((s) => s.memoHit === false)).toBe(true); // Has misses
      expect(steps[0].memoGrid).toBeDefined();

      const div1 = createMockContainer();
      const div2 = createMockContainer();
      renderKnapsackMemoCard1(div1, steps[0]);
      renderKnapsackMemoCard2(div2, steps[0]);
      expect(div1.innerHTML).toContain('Cache MISS');
      expect(div2.innerHTML).toContain('缓存命中');
    });
  });

  describe('Stage 3: 二维动态规划递推 (buildKnapsack2DSteps)', () => {
    it('should generate row-by-row and col-by-col 2D DP steps', () => {
      const capacity = 5;
      const steps = buildKnapsack2DSteps('01', capacity, sampleItems);
      // Line-by-line execution produces discrete steps for initDp, loops, inherit, checkFit, update, returnAns
      expect(steps.length).toBeGreaterThan(3 * (capacity + 1));
      expect(steps.some((s) => s.action === 'inherit')).toBe(true);
      expect(steps.some((s) => s.action === 'update')).toBe(true);

      const lastStep = steps[steps.length - 1];
      expect(lastStep.curI).toBe(3);
      expect(lastStep.curJ).toBe(5);
      expect(lastStep.dpTable[3][5]).toBeGreaterThan(0);

      const div1 = createMockContainer();
      const div2 = createMockContainer();
      renderKnapsack2DCard1(div1, lastStep);
      renderKnapsack2DCard2(div2, lastStep);
      expect(div1.innerHTML).toContain('dp[3][5]');
      expect(div2.innerHTML).toContain('状态转移方程式解析');
    });

    it('should correctly model unbounded knapsack 2D dependencies from same row', () => {
      const capacity = 4;
      const steps = buildKnapsack2DSteps('unbounded', capacity, sampleItems);
      // Find a step where an item was picked
      const pickedStep = steps.find((s) => s.chosenBranch === 'pick');
      expect(pickedStep).toBeDefined();
      if (pickedStep?.depPick) {
        // Unbounded knapsack depPick r should equal curI
        expect(pickedStep.depPick.r).toBe(pickedStep.curI);
      }
    });
  });

  // ==========================================
  // Special Knapsack Evolution (Buying Hay & Coins from Piles)
  // ==========================================
  describe('Special Knapsack Evolution (Buying Hay & Coins From Piles)', () => {
    const hayH = 10;
    const hayCost = [3, 5];
    const hayVal = [4, 6];

    it('should generate valid Buying Hay recursion, memo, and 2D steps', () => {
      const recSteps = buildBuyingHayRecursionSteps(hayH, hayCost, hayVal);
      expect(recSteps.length).toBeGreaterThan(0);
      expect(recSteps[0].h).toBe(hayH);

      const memoSteps = buildBuyingHayMemoSteps(hayH, hayCost, hayVal);
      expect(memoSteps.length).toBeGreaterThan(0);

      const dp2dSteps = buildBuyingHay2DSteps(hayH, hayCost, hayVal);
      expect(dp2dSteps.length).toBeGreaterThan(0);

      // Card rendering
      const c1 = createMockContainer();
      const c2 = createMockContainer();
      renderSpecialRecursionCard1(c1, 'Buying Hay', recSteps[0].callStack, '<div>info</div>');
      expect(c1.innerHTML).toContain('运行时调用栈');

      renderSpecialMemoCard1(c2, 'f(0, 10)', false, '决策', '说明', 2, 5);
      expect(c2.innerHTML).toContain('CACHE MISS');

      renderSpecialMemoCard2(c2, 'Memo Grid', [[0, 1], [2, 3]], 0, 1, true);
      expect(c2.innerHTML).toContain('Memo Grid');

      renderSpecial2DCard1(c1, 'dp[1][5]', '12', [{ label: 'dp[0][5]', val: 10 }], '选', '更新');
      expect(c1.innerHTML).toContain('dp[1][5]');

      renderSpecial2DCard2(c2, 'DP Table', [[0, 0], [0, 12]], 1, 1, [{ r: 0, c: 1 }]);
      expect(c2.innerHTML).toContain('DP Table');
    });

    it('should generate valid Coins From Piles recursion, memo, and 2D steps', () => {
      const piles = [[1, 10], [2, 5]];
      const k = 2;

      const recSteps = buildCoinsFromPilesRecursionSteps(piles, k);
      expect(recSteps.length).toBeGreaterThan(0);

      const memoSteps = buildCoinsFromPilesMemoSteps(piles, k);
      expect(memoSteps.length).toBeGreaterThan(0);

      const dp2dSteps = buildCoinsFromPiles2DSteps(piles, k);
      expect(dp2dSteps.length).toBeGreaterThan(0);
      const last = dp2dSteps[dp2dSteps.length - 1];
      expect(last.action).toBe('returnAns');
    });
  });

  // ==========================================
  // Bounded Knapsack Evolution (Naive, Binary Split & Coins Change)
  // ==========================================
  describe('Bounded Knapsack Evolution (Naive, Binary Split & Coins Change)', () => {
    it('should generate bounded naive steps correctly', () => {
      const t = 10;
      const vList = [2, 3];
      const wList = [3, 4];
      const cList = [2, 1];

      const rec = buildBoundedNaiveRecursionSteps(t, vList, wList, cList);
      expect(rec.length).toBeGreaterThan(0);

      const memo = buildBoundedNaiveMemoSteps(t, vList, wList, cList);
      expect(memo.length).toBeGreaterThan(0);

      const dp2d = buildBoundedNaive2DSteps(t, vList, wList, cList);
      expect(dp2d.length).toBeGreaterThan(0);
    });

    it('should generate binary split steps correctly', () => {
      const t = 8;
      const vList = [2, 3];
      const wList = [2, 4];
      const cList = [3, 2];

      const rec = buildBinarySplitRecursionSteps(t, vList, wList, cList);
      expect(rec.length).toBeGreaterThan(0);

      const memo = buildBinarySplitMemoSteps(t, vList, wList, cList);
      expect(memo.length).toBeGreaterThan(0);

      const dp2d = buildBinarySplit2DSteps(t, vList, wList, cList);
      expect(dp2d.length).toBeGreaterThan(0);
    });

    it('should generate coins change kinds steps correctly', () => {
      const target = 5;
      const valList = [1, 2];
      const cntList = [3, 2];

      const rec = buildCoinsChangeRecursionSteps(target, valList, cntList);
      expect(rec.length).toBeGreaterThan(0);

      const memo = buildCoinsChangeMemoSteps(target, valList, cntList);
      expect(memo.length).toBeGreaterThan(0);

      const dp2d = buildCoinsChange2DSteps(target, valList, cntList);
      expect(dp2d.length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // String DP Evolution (Regex & Wildcard)
  // ==========================================
  describe('String DP Evolution (Regex & Wildcard Matching)', () => {
    it('should generate Regex matching recursion, memo, and 2D steps', () => {
      const s = 'ab';
      const p = 'a*b';

      const rec = buildStringDpRecursionSteps('regex', s, p);
      expect(rec.length).toBeGreaterThan(0);

      const memo = buildStringDpMemoSteps('regex', s, p);
      expect(memo.length).toBeGreaterThan(0);

      const dp2d = buildStringDp2DSteps('regex', s, p);
      expect(dp2d.length).toBeGreaterThan(0);

      const c1 = createMockContainer();
      const c2 = createMockContainer();
      renderStringDpRecursionCard1(c1, rec[0]);
      expect(c1.innerHTML).toContain('运行时调用栈');

      renderStringDpRecursionCard2(c2, rec[0]);
      expect(c2.innerHTML).toContain('重叠子问题调用监控');

      renderStringDpMemoCard1(c1, memo[0]);
      expect(c1.innerHTML).toContain('CACHE MISS');

      renderStringDpMemoCard2(c2, memo[0]);
      expect(c2.innerHTML).toContain('备忘录缓存矩阵');

      renderStringDp2DCard1(c1, dp2d[0]);
      expect(c1.innerHTML).toContain('当前递推单元格');

      renderStringDp2DCard2(c2, dp2d[0]);
      expect(c2.innerHTML).toContain('二维动态规划表');
    });

    it('should generate Wildcard matching recursion, memo, and 2D steps', () => {
      const s = 'ab';
      const p = '?b';

      const rec = buildStringDpRecursionSteps('wildcard', s, p);
      expect(rec.length).toBeGreaterThan(0);

      const memo = buildStringDpMemoSteps('wildcard', s, p);
      expect(memo.length).toBeGreaterThan(0);

      const dp2d = buildStringDp2DSteps('wildcard', s, p);
      expect(dp2d.length).toBeGreaterThan(0);
    });
  });
});

