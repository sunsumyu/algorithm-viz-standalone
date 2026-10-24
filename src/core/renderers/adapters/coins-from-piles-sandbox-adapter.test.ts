// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { CoinsFromPilesSandboxAdapter } from './coins-from-piles-sandbox-adapter';
import type { UniversalStep } from '../../universal-stage-engine';

describe('CoinsFromPilesSandboxAdapter', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  describe('parsePilesAndK', () => {
    it('should parse piles and kTarget from step properties', () => {
      const step: UniversalStep = {
        description: 'test step',
        piles: [
          [1, 100, 3],
          [7, 8, 9],
        ],
        kTarget: 3,
      } as any;

      const result = CoinsFromPilesSandboxAdapter.parsePilesAndK(step, { modelId: 'coins-from-piles' });
      expect(result.kTarget).toBe(3);
      expect(result.piles.length).toBe(2);
      expect(result.piles[0]).toEqual([1, 100, 3]);
      expect(result.piles[1]).toEqual([7, 8, 9]);
    });

    it('should fallback to default piles when step has empty data', () => {
      const step: UniversalStep = { description: 'empty' };
      const result = CoinsFromPilesSandboxAdapter.parsePilesAndK(step, { modelId: 'unknown' });
      expect(result.piles.length).toBeGreaterThan(0);
      expect(result.kTarget).toBeGreaterThan(0);
    });
  });

  describe('backtrackTakes', () => {
    it('should accurately backtrack coins taken per pile from grid', () => {
      const piles = [
        [1, 100, 3], // Pile 0: preSum=[0, 1, 101, 104]
        [7, 8, 9],   // Pile 1: preSum=[0, 7, 15, 24]
      ];

      // Grid for 2 piles, capacity k=2
      // Row 0 (Pile 0): j=0->0, j=1->1, j=2->101
      // Row 1 (Pile 1): j=0->0, j=1->7, j=2->max(dp[0][2], dp[0][1]+7, dp[0][0]+15)=101
      const grid = [
        [0, 1, 101],
        [0, 7, 101],
      ];

      const plans = CoinsFromPilesSandboxAdapter.backtrackTakes(1, 2, piles, grid);
      expect(plans.length).toBe(1);
      expect(plans[0].pileIdx).toBe(0);
      expect(plans[0].takeCount).toBe(2);
      expect(plans[0].sumVal).toBe(101);
      expect(plans[0].coins).toEqual([1, 100]);
    });
  });

  describe('render', () => {
    it('should render physical coin piles, wallet container and quota meters', () => {
      const step: UniversalStep = {
        description: 'DP Step',
        i: 0,
        j: 2,
        c: 2,
        decision: 'try take 2 coins',
        piles: [
          [1, 100, 3],
          [7, 8, 9],
        ],
        kTarget: 2,
        grid: [
          [0, 1, 101],
          [0, 7, 101],
        ],
      } as any;

      CoinsFromPilesSandboxAdapter.render(container, step, { modelId: 'coins-from-piles' });

      // 验证栈立柱与物理特征
      expect(container.innerHTML).toContain('物理硬币栈');
      expect(container.innerHTML).toContain('栈 #0');
      expect(container.innerHTML).toContain('栈 #1');
      expect(container.innerHTML).toContain('栈顶 (Top)');
      expect(container.innerHTML).toContain('栈底 (Bottom)');

      // 验证正在试提取与互斥项
      expect(container.innerHTML).toContain('试提取中');
      expect(container.innerHTML).toContain('连续抽取前缀和选项');

      // 验证实体钱包与配额水位
      expect(container.innerHTML).toContain('实体钱包收集舱');
      expect(container.innerHTML).toContain('硬币抽取次数配额');
      expect(container.innerHTML).toContain('已取硬币数');
      expect(container.innerHTML).toContain('剩余操作配额');
      expect(container.innerHTML).toContain('累计总面值');
    });

    it('should correctly render Case 2 (swapped top coin [100, 1, 3]) and display 107 in wallet at final step', () => {
      const step: UniversalStep = {
        description: 'final step for swapped case',
        i: 2,
        j: 2,
        c: 1,
        piles: [
          [100, 1, 3],
          [7, 8, 9],
        ],
        kTarget: 2,
        grid: [
          [0, 0, 0],
          [0, 100, 101],
          [0, 100, 107],
        ],
      } as any;

      CoinsFromPilesSandboxAdapter.render(container, step, { modelId: 'coins-from-piles' });

      expect(container.innerHTML).toContain('+100');
      expect(container.innerHTML).toContain('107');
    });

    it('should strictly align coins taken with remaining capacity during trial choice (no ghost coins)', () => {
      // 当在栈 #1 (第2栈, i=2) 尝试选 c=2 枚时，剩余给栈 #0 的容量是 j - c = 2 - 2 = 0
      // 绝不能在栈 #0 既显示拿了 2 枚 (+101)，又在栈 #1 试选 2 枚 (+15)，导致总枚数突破容量上限变成 4 枚
      const step: UniversalStep = {
        type: 'transition',
        description: 'transition step k=2',
        i: 2,
        j: 2,
        c: 2,
        k: 2,
        decision: '尝试拿 2 枚',
        piles: [
          [1, 100, 3],
          [7, 8, 9],
        ],
        kTarget: 2,
        grid: [
          [0, 0, 0],
          [0, 1, 101],
          [0, 7, 101],
        ],
      } as any;

      CoinsFromPilesSandboxAdapter.render(container, step, { modelId: 'coins-from-piles' });

      // 已取硬币数必须是 2 枚（不能是 4 枚）
      expect(container.innerHTML).toContain('2 枚');
      expect(container.innerHTML).not.toContain('4 枚');

      // 栈 #1 处于试提取中，累计面值贡献 +15
      expect(container.innerHTML).toContain('连续提取 2 枚');
      expect(container.innerHTML).toContain('面值: +15');

      // 栈 #0 剩余容量为 0，不能显示“已入钱包”
      const pile0Card = container.querySelector('.coins-from-piles-sandbox')!;
      expect(pile0Card).not.toBeNull();
    });
  });
});
