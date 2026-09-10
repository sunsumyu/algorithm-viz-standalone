/**
 * 左神算法通关课 Class 084 ~ 088 进阶动态规划专题（第二弹）自动化测试套件
 */

import { describe, it, expect } from 'vitest';
import { buildCounting084Steps } from './counting-dp-inclusion-exclusion-084-renderer';
import { buildGameDp085Steps } from './game-probability-dp-085-renderer';
import { buildSosDp086Steps } from './sos-profile-dp-086-renderer';
import { buildCircularInterval087Steps } from './circular-interval-dp-087-renderer';
import { buildTreeKnapsack088Steps } from './tree-knapsack-dp-088-renderer';
import {
  COUNTING_DP_084_CODES,
  GAME_PROBABILITY_085_CODES,
  SOS_DP_086_CODES,
  CIRCULAR_INTERVAL_087_CODES,
  TREE_KNAPSACK_088_CODES,
} from './dp-084-088-stage-codes';

function verify1BasedCodeLines(steps: any[], codes: Record<string, string[]>) {
  expect(steps.length).toBeGreaterThan(0);
  for (const step of steps) {
    if (step.codeLine) {
      for (const lang of ['java', 'cpp', 'python', 'javascript']) {
        const line = step.codeLine[lang];
        expect(line, `Missing line mapping for ${lang}`).toBeDefined();
        expect(line, `Line must be >= 1 for ${lang}`).toBeGreaterThanOrEqual(1);
        expect(
          line,
          `Line ${line} exceeds code length ${codes[lang].length} for ${lang}`
        ).toBeLessThanOrEqual(codes[lang].length);
      }
    }
  }
}

describe('左神进阶动态规划专题（第二弹）(Class 084 ~ 088) 综合测试套件', () => {
  // 1. Class 084: 计数 DP 与错排
  describe('Class 084: 计数 DP 与错排问题 (Derangement)', () => {
    it('递推计算出 N=4 的错排方案数为 9', () => {
      const steps = buildCounting084Steps();
      const last = steps[steps.length - 1];
      expect(last.curAns).toBe(9);
      verify1BasedCodeLines(steps, COUNTING_DP_084_CODES);
    });
  });

  // 2. Class 085: 博弈概率 DP
  describe('Class 085: 博弈概率 DP 与倒推状态 (Game Probability DP)', () => {
    it('极大极小博弈，求出区间相对净胜分为 -2 (后手必胜)', () => {
      const steps = buildGameDp085Steps();
      const last = steps[steps.length - 1];
      expect(last.bestDiff).toBe(-2);
      verify1BasedCodeLines(steps, GAME_PROBABILITY_085_CODES);
    });
  });

  // 3. Class 086: 高阶状压 DP 与 SOS DP
  describe('Class 086: 高阶状压 DP 与 SOS DP (Sum Over Subsets)', () => {
    it('逐维高维前缀和，精准求出所有 2^N 掩码的子集和 [1, 3, 5, 15]', () => {
      const steps = buildSosDp086Steps();
      const last = steps[steps.length - 1];
      expect(last.dp).toEqual([1, 3, 5, 15]);
      verify1BasedCodeLines(steps, SOS_DP_086_CODES);
    });
  });

  // 4. Class 087: 环形区间 DP 与破环成链
  describe('Class 087: 环形区间 DP 与破环成链 (Circular Interval DP)', () => {
    it('倍长数组枚举断点，求出项链最大释放能量 710', () => {
      const steps = buildCircularInterval087Steps();
      const last = steps[steps.length - 1];
      expect(last.maxEnergy).toBe(710);
      verify1BasedCodeLines(steps, CIRCULAR_INTERVAL_087_CODES);
    });
  });

  // 5. Class 088: 树上背包 DP 与泛化物品
  describe('Class 088: 树上背包 DP 与泛化物品 (Tree Knapsack DP)', () => {
    it('树形选课依赖背包，求出修 2 门课的最大学分 5', () => {
      const steps = buildTreeKnapsack088Steps();
      const last = steps[steps.length - 1];
      expect(Math.max(...last.dpRow)).toBe(5);
      verify1BasedCodeLines(steps, TREE_KNAPSACK_088_CODES);
    });
  });
});
