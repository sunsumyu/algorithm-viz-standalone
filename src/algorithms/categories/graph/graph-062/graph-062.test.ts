/**
 * 左程云算法通关课 Class 062: 宽度优先遍历及其扩展 综合自动化测试套件
 * 严格验证全 6 题：算法正确性、四语言 1-Based 行号合法性与步进密度无虚假实现
 */

import { describe, it, expect } from 'vitest';
import { buildAsFarFromLand062Steps } from './as-far-from-land-062-renderer';
import { buildStickers062Steps } from './stickers-to-spell-word-062-renderer';
import { buildMinimumObstacles062Steps } from './minimum-obstacles-062-renderer';
import { buildMinimumCostValidPath062Steps } from './minimum-cost-valid-path-062-renderer';
import { buildTrappingWaterII062Steps } from './trapping-rain-water-ii-062-renderer';
import { buildWordLadderII062Steps } from './word-ladder-ii-062-renderer';

import {
  AS_FAR_FROM_LAND_062_CODES,
  STICKERS_TO_SPELL_WORD_062_CODES,
  MINIMUM_OBSTACLES_062_CODES,
  MINIMUM_COST_VALID_PATH_062_CODES,
  TRAPPING_RAIN_WATER_II_062_CODES,
  WORD_LADDER_II_062_CODES,
} from './graph-062-stage-codes';

function verify1BasedCodeLines(
  steps: any[],
  codes: Record<string, string[]>,
  algoName: string
) {
  expect(steps.length, `${algoName} 步骤不可为空`).toBeGreaterThanOrEqual(4);

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (step.codeLine) {
      for (const lang of ['java', 'cpp', 'python', 'javascript']) {
        const line = typeof step.codeLine === 'object' && step.codeLine !== null && lang in step.codeLine
          ? step.codeLine[lang]
          : step.codeLine;

        expect(line, `${algoName} (step #${i}) 缺少 ${lang} 行号映射`).toBeDefined();
        const lineNum = typeof line === 'number' ? line : Number(line);
        expect(lineNum, `${algoName} (step #${i}) ${lang} 行号必须 >= 1`).toBeGreaterThanOrEqual(1);
        expect(
          lineNum,
          `${algoName} (step #${i}) ${lang} 行号 ${lineNum} 超过源码总行数 ${codes[lang].length}`
        ).toBeLessThanOrEqual(codes[lang].length);
      }
    }
  }
}

describe('左程云算法通关课 Class 062 宽度优先遍历及其扩展 自动化测试套件', () => {
  // 1. 地图分析 (LeetCode 1162 · 多源 BFS)
  describe('Code01: 地图分析 (As Far from Land as Possible · LeetCode 1162)', () => {
    it('四角陆地经典用例求出最大距离为 2，四语言行号映射 100% 合法', () => {
      const steps = buildAsFarFromLand062Steps('classic_3x3');
      const last = steps[steps.length - 1];
      expect(last.currentWave).toBe(2);
      verify1BasedCodeLines(steps, AS_FAR_FROM_LAND_062_CODES, 'AsFarFromLand062');
    });

    it('单角陆地扩散求出最大距离为 4', () => {
      const steps = buildAsFarFromLand062Steps('corner_land');
      const last = steps[steps.length - 1];
      expect(last.currentWave).toBe(4);
    });

    it('全海洋特判正确返回 -1', () => {
      const steps = buildAsFarFromLand062Steps('all_sea');
      const last = steps[steps.length - 1];
      expect(last.currentWave).toBe(-1);
    });
  });

  // 2. 贴纸拼词 (LeetCode 691 · BFS + 贪心剪枝)
  describe('Code02: 贴纸拼词 (Stickers to Spell Word · LeetCode 691)', () => {
    it('经典 thehat 用例求出最少贴纸张数为 3，行号 100% 合法', () => {
      const steps = buildStickers062Steps('classic_thehat');
      const last = steps[steps.length - 1];
      expect(last.ans).toBe(3);
      verify1BasedCodeLines(steps, STICKERS_TO_SPELL_WORD_062_CODES, 'Stickers062');
    });

    it('缺字母不可行用例正确返回 -1', () => {
      const steps = buildStickers062Steps('impossible');
      const last = steps[steps.length - 1];
      expect(last.ans).toBe(-1);
    });
  });

  // 3. 0-1 BFS 移除障碍物 (LeetCode 2290)
  describe('Code03: 到达角落移除障碍物的最小数目 (LeetCode 2290)', () => {
    it('经典绕行全通网格求出最少移除 0 障碍，行号 100% 合法', () => {
      const steps = buildMinimumObstacles062Steps('classic_3x3');
      const last = steps[steps.length - 1];
      expect(last.minObstacles).toBe(0);
      verify1BasedCodeLines(steps, MINIMUM_OBSTACLES_062_CODES, 'MinimumObstacles062');
    });

    it('纵向直立障碍墙必破 1 障碍', () => {
      const steps = buildMinimumObstacles062Steps('straight_wall');
      const last = steps[steps.length - 1];
      expect(last.minObstacles).toBe(1);
    });
  });

  // 4. 有效路径最小代价 (LeetCode 1368)
  describe('Code04: 使网格图至少有一条有效路径的最小代价 (LeetCode 1368)', () => {
    it('经典 3x3 箭头网格求出最小修改代价为 1，行号 100% 合法', () => {
      const steps = buildMinimumCostValidPath062Steps('classic_3x3');
      const last = steps[steps.length - 1];
      expect(last.minCost).toBe(1);
      verify1BasedCodeLines(steps, MINIMUM_COST_VALID_PATH_062_CODES, 'MinimumCostValidPath062');
    });

    it('天然直通网格求出修改代价为 0', () => {
      const steps = buildMinimumCostValidPath062Steps('zero_cost');
      const last = steps[steps.length - 1];
      expect(last.minCost).toBe(0);
    });
  });

  // 5. 二维接雨水 II (LeetCode 407 · 双版本长处整合)
  describe('Code05: 二维接雨水 II (Trapping Rain Water II · LeetCode 407)', () => {
    it('3x6 经典地形求出总接雨水量为 4，行号 100% 合法', () => {
      const steps = buildTrappingWaterII062Steps('classic_3x6');
      const last = steps[steps.length - 1];
      expect(last.totalWater).toBe(4);
      verify1BasedCodeLines(steps, TRAPPING_RAIN_WATER_II_062_CODES, 'TrappingWaterII062');
    });

    it('3x3 中心凹陷地形求出总接雨水量为 2', () => {
      const steps = buildTrappingWaterII062Steps('simple_3x3');
      const last = steps[steps.length - 1];
      expect(last.totalWater).toBe(2);
    });
  });

  // 6. 单词接龙 II (LeetCode 126 · BFS DAG + DFS 回溯)
  describe('Code06: 单词接龙 II (Word Ladder II · LeetCode 126)', () => {
    it('hit -> cog 经典用例成功捕获 2 条最短转换序列，行号 100% 合法', () => {
      const steps = buildWordLadderII062Steps('classic_hit_cog');
      const last = steps[steps.length - 1];
      expect(last.foundPaths.length).toBe(2);
      expect(last.foundPaths[0].length).toBe(5);
      expect(last.foundPaths[1].length).toBe(5);
      verify1BasedCodeLines(steps, WORD_LADDER_II_062_CODES, 'WordLadderII062');
    });

    it('缺少终点词不可达用例正确返回 0 条路径', () => {
      const steps = buildWordLadderII062Steps('impossible');
      const last = steps[steps.length - 1];
      expect(last.foundPaths.length).toBe(0);
    });
  });
});
