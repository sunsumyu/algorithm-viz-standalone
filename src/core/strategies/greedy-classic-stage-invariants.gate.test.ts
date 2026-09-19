/**
 * 经典贪心算法顶层黄金规约门禁矩阵 (Greedy Classic Stage Invariants Gatekeeper)
 *
 * 覆盖全量 26 个贪心算法与理论架构组件:
 *  1. LeetCode 455: 分发饼干 (Assign Cookies)
 *  2. LeetCode 122: 买卖股票的最佳时机 II (Best Time to Buy and Sell Stock II)
 *  3. LeetCode 55: 跳跃游戏 (Jump Game / Can Jump)
 *  4. LeetCode 135: 分发糖果 (Candy)
 *  5. LeetCode 134: 加油站 (Gas Station)
 *  6. LeetCode 45: 跳跃游戏 II (Jump Game II)
 *  7. LeetCode 860: 柠檬水找零 (Lemonade Change)
 *  8. LeetCode 53: 最大子数组和 (Maximum Subarray / Kadane)
 *  9. LeetCode 1005: K 次取反后最大化的数组和 (Maximize Sum Of Array After K Negations)
 * 10. LeetCode 56: 合并区间 (Merge Intervals)
 * 11. LeetCode 452: 用最少数量的箭引爆气球 (Minimum Number of Arrows to Burst Balloons)
 * 12. LeetCode 738: 单调递增的数字 (Monotone Increasing Digits)
 * 13. LeetCode 435: 无重叠区间 (Non-overlapping Intervals)
 * 14. LeetCode 763: 划分字母区间 (Partition Labels)
 * 15. LeetCode 406: 根据身高重建队列 (Queue Reconstruction by Height)
 * 16. LeetCode 621: 任务调度器 (Task Scheduler)
 * 17. LeetCode 968: 监控二叉树 (Binary Tree Cameras)
 * 18. LeetCode 376: 摆动序列 (Wiggle Subsequence)
 * 19. 理论卡片: 贪心算法理论基础 (greedy-theory)
 * 20. 总结卡片: 贪心周总结 1 (greedy-week-summary)
 * 21. 总结卡片: 贪心周总结 2 (greedy-week-summary-2)
 * 22. 总结卡片: 贪心周总结 3 (greedy-week-summary-3)
 * 23. 总结卡片: 贪心周总结 4 (greedy-week-summary-4)
 * 24. 终极卡片: 贪心最终总结 (greedy-final-summary)
 * 25. 专题卡片: 队列与 Vector 剖析 (queue-vector-explained)
 * 26. 辅助区间组件: 无重叠区间 (interval)
 *
 * 核心黄金规约:
 *  1. Step 0 入口语义守恒与初始状态完备契约
 *  2. 贪心局部决策最优性与状态演进严格单调性
 *  3. 多语种代码高亮物理行号 [1, totalLines] 强类型边界不变量
 *  4. 算法清单 Manifest 注册有效性与视图挂载契约
 */

import { describe, it, expect } from 'vitest';
import { getManifest } from '../registry';

// 18 Core LeetCode Greedy Renderers & Problem Contents
import {
  assignCookiesSteps,
  ASSIGN_COOKIES_CODE_LINES,
} from '../../algorithms/categories/greedy/assign-cookies-renderer';
import { ASSIGN_COOKIES_CODE_LANGUAGES } from '../../algorithms/categories/greedy/assign-cookies-problem-content';

import {
  buildStockSteps,
  BEST_TIME_STOCK_CODE_LINES,
} from '../../algorithms/categories/greedy/best-time-stock-renderer';
import { BEST_TIME_STOCK_CODE_LANGUAGES } from '../../algorithms/categories/greedy/best-time-stock-problem-content';

import { canJumpSteps } from '../../algorithms/categories/greedy/can-jump-renderer';
import { CAN_JUMP_CODE_LANGUAGES } from '../../algorithms/categories/greedy/can-jump-problem-content';

import {
  buildCandySteps,
  CANDY_CODE_LINES,
} from '../../algorithms/categories/greedy/candy-renderer';
import { CANDY_CODE_LANGUAGES } from '../../algorithms/categories/greedy/candy-problem-content';

import { buildGasStationSteps } from '../../algorithms/categories/greedy/gas-station-renderer';
import { GAS_STATION_CODE_LANGUAGES } from '../../algorithms/categories/greedy/gas-station-problem-content';

import {
  buildJumpGameSteps,
  JUMP_GAME_CODE_LINES,
} from '../../algorithms/categories/greedy/jump-game-renderer';
import { JUMP_GAME_CODE_LANGUAGES } from '../../algorithms/categories/greedy/jump-game-problem-content';

import { buildLemonadeSteps } from '../../algorithms/categories/greedy/lemonade-renderer';
import { LEMONADE_CODE_LANGUAGES } from '../../algorithms/categories/greedy/lemonade-problem-content';

import {
  buildMaxSubarraySteps,
  MAX_SUBARRAY_CODE_LINES,
} from '../../algorithms/categories/greedy/max-subarray-renderer';
import { MAX_SUBARRAY_CODE_LANGUAGES } from '../../algorithms/categories/greedy/max-subarray-problem-content';

import {
  buildMaxSumKSteps,
  MAXIMIZE_SUM_K_CODE_LINES,
} from '../../algorithms/categories/greedy/maximize-sum-k-renderer';
import { MAXIMIZE_SUM_K_CODE_LANGUAGES } from '../../algorithms/categories/greedy/maximize-sum-k-problem-content';

import {
  buildMergeIntervalsSteps,
  MERGE_INTERVALS_CODE_LINES,
} from '../../algorithms/categories/greedy/merge-intervals-renderer';
import { MERGE_INTERVALS_CODE_LANGUAGES } from '../../algorithms/categories/greedy/merge-intervals-problem-content';

import {
  buildMinArrowsSteps,
  MIN_ARROWS_CODE_LINES,
} from '../../algorithms/categories/greedy/min-arrows-renderer';
import { MIN_ARROWS_CODE_LANGUAGES } from '../../algorithms/categories/greedy/min-arrows-problem-content';

import {
  buildMonotoneDigitsSteps,
  MONOTONE_DIGITS_CODE_LINES,
} from '../../algorithms/categories/greedy/monotone-digits-renderer';
import { MONOTONE_DIGITS_CODE_LANGUAGES } from '../../algorithms/categories/greedy/monotone-digits-problem-content';

import {
  buildNonOverlappingSteps,
  NON_OVERLAPPING_CODE_LINES,
} from '../../algorithms/categories/greedy/non-overlapping-renderer';
import { NON_OVERLAPPING_CODE_LANGUAGES } from '../../algorithms/categories/greedy/non-overlapping-problem-content';

import {
  buildPartitionLabelsSteps,
  PARTITION_LABELS_CODE_LINES,
} from '../../algorithms/categories/greedy/partition-labels-renderer';
import { PARTITION_LABELS_CODE_LANGUAGES } from '../../algorithms/categories/greedy/partition-labels-problem-content';

import {
  buildReconstructQueueSteps,
  RECONSTRUCT_QUEUE_CODE_LINES,
} from '../../algorithms/categories/greedy/reconstruct-queue-renderer';
import { RECONSTRUCT_QUEUE_CODE_LANGUAGES } from '../../algorithms/categories/greedy/reconstruct-queue-problem-content';

import {
  buildTaskSchedulerSteps,
  TASK_SCHEDULER_CODES,
} from '../../algorithms/categories/greedy/task-scheduler-renderer';

import {
  buildTreeCameraSteps,
  parseTreeFromArray,
  TREE_CAMERAS_CODE_LINES,
} from '../../algorithms/categories/greedy/tree-cameras-renderer';
import { TREE_CAMERAS_CODE_LANGUAGES } from '../../algorithms/categories/greedy/tree-cameras-problem-content';

import { wiggleSubsequenceSteps } from '../../algorithms/categories/greedy/wiggle-subsequence-renderer';
import { WIGGLE_SUBSEQUENCE_CODE_LANGUAGES } from '../../algorithms/categories/greedy/wiggle-subsequence-problem-content';

// 7 Summary/Explanation Cards & Interval Renderer (side-effect imports to trigger registry)
import '../../algorithms/categories/greedy/greedy-theory-renderer';
import '../../algorithms/categories/greedy/greedy-week-summary-renderer';
import '../../algorithms/categories/greedy/greedy-week-summary-2-renderer';
import '../../algorithms/categories/greedy/greedy-week-summary-3-renderer';
import '../../algorithms/categories/greedy/greedy-week-summary-4-renderer';
import '../../algorithms/categories/greedy/greedy-final-summary-renderer';
import '../../algorithms/categories/greedy/queue-vector-explained-renderer';
import '../../algorithms/categories/greedy/interval-renderer';

function assertCodeLineWithinBounds(
  codeLine: any,
  codes: Record<string, string[] | string>,
  stepDesc: string
) {
  if (!codeLine) return;

  for (const [lang, rawCode] of Object.entries(codes)) {
    const lines = Array.isArray(rawCode)
      ? rawCode
      : typeof rawCode === 'string'
      ? rawCode.split('\n')
      : [];
    const lineCount = lines.length;
    if (lineCount === 0) continue;

    if (typeof codeLine === 'number') {
      expect(
        codeLine,
        `${stepDesc}: scalar codeLine ${codeLine} exceeds ${lang} line count ${lineCount}`
      ).toBeLessThanOrEqual(lineCount);
      expect(
        codeLine,
        `${stepDesc}: scalar codeLine ${codeLine} must be >= 1 for ${lang}`
      ).toBeGreaterThanOrEqual(1);
    } else if (Array.isArray(codeLine)) {
      for (const line of codeLine) {
        expect(
          line,
          `${stepDesc}: array codeLine ${line} exceeds ${lang} line count ${lineCount}`
        ).toBeLessThanOrEqual(lineCount);
        expect(
          line,
          `${stepDesc}: array codeLine ${line} must be >= 1 for ${lang}`
        ).toBeGreaterThanOrEqual(1);
      }
    } else if (typeof codeLine === 'object' && codeLine !== null) {
      const target = codeLine[lang];
      if (target != null) {
        if (typeof target === 'number') {
          expect(
            target,
            `${stepDesc}: dict codeLine[${lang}]=${target} exceeds line count ${lineCount}`
          ).toBeLessThanOrEqual(lineCount);
          expect(
            target,
            `${stepDesc}: dict codeLine[${lang}]=${target} must be >= 1 for ${lang}`
          ).toBeGreaterThanOrEqual(1);
        } else if (Array.isArray(target)) {
          for (const l of target) {
            expect(
              l,
              `${stepDesc}: dict codeLine[${lang}] array item ${l} exceeds line count ${lineCount}`
            ).toBeLessThanOrEqual(lineCount);
            expect(
              l,
              `${stepDesc}: dict codeLine[${lang}] array item ${l} must be >= 1`
            ).toBeGreaterThanOrEqual(1);
          }
        }
      }
    }
  }
}

describe('Greedy Classic Stage Invariants Gatekeeper (经典贪心全量门禁矩阵)', () => {
  describe('1. 分发饼干 (Assign Cookies - LeetCode 455)', () => {
    it('验证 Step 0 入口守恒与全语种行号映射合规', () => {
      const steps = assignCookiesSteps([1, 2, 3], [1, 1]);
      expect(steps.length).toBeGreaterThanOrEqual(2);
      expect(steps[0].phase).toBe('init');
      expect(steps[0].childIndex).toBe(0);
      expect(steps[0].cookieIndex).toBe(0);
      expect(steps[0].satisfiedCount).toBe(0);

      const last = steps[steps.length - 1];
      expect(last.phase).toBe('done');
      expect(last.satisfiedCount).toBe(1);

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(
          s.codeLine,
          ASSIGN_COOKIES_CODE_LANGUAGES,
          `AssignCookies Step ${idx}`
        );
      });
    });

    it('验证 Manifest 注册元数据完备', () => {
      const manifest = getManifest('assign-cookies');
      expect(manifest).toBeDefined();
      expect(manifest?.category).toBe('greedy');
    });
  });

  describe('2. 买卖股票的最佳时机 II (Best Time Stock II - LeetCode 122)', () => {
    it('验证正收益贪心累加不变量与代码行号', () => {
      const steps = buildStockSteps([7, 1, 5, 3, 6, 4]);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].phase).toBe('init');
      expect(steps[0].totalProfit).toBe(0);

      const last = steps[steps.length - 1];
      expect(last.phase).toBe('done');
      expect(last.totalProfit).toBe(7); // (5-1) + (6-3) = 7

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(
          s.codeLine,
          BEST_TIME_STOCK_CODE_LANGUAGES,
          `BestTimeStock Step ${idx}`
        );
      });
    });

    it('验证边界情况价格天数少于 2 时平稳处理', () => {
      const steps = buildStockSteps([5]);
      expect(steps.length).toBe(1);
      expect(steps[0].phase).toBe('done');
      expect(steps[0].totalProfit).toBe(0);
    });

    it('验证 Manifest 注册元数据完备', () => {
      const manifest = getManifest('best-time-stock');
      expect(manifest).toBeDefined();
      expect(manifest?.category).toBe('greedy');
    });
  });

  describe('3. 跳跃游戏 (Can Jump - LeetCode 55)', () => {
    it('验证覆盖范围贪心推进不变量与代码行号', () => {
      const steps = canJumpSteps([2, 3, 1, 1, 4]);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].maxReach).toBe(0);

      const last = steps[steps.length - 1];
      expect(last.canJump).toBe(true);

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(
          s.codeLine,
          CAN_JUMP_CODE_LANGUAGES,
          `CanJump Step ${idx}`
        );
      });
    });

    it('验证 Manifest 注册元数据完备', () => {
      const manifest = getManifest('can-jump');
      expect(manifest).toBeDefined();
      expect(manifest?.category).toBe('greedy');
    });
  });

  describe('4. 分发糖果 (Candy - LeetCode 135)', () => {
    it('验证左右双向贪心不变量与代码行号', () => {
      const steps = buildCandySteps([1, 0, 2]);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].direction).toBe('init');
      expect(steps[0].candies.every((c) => c === 1)).toBe(true);

      const last = steps[steps.length - 1];
      expect(last.direction).toBe('done');
      const totalCandies = last.candies.reduce((a, b) => a + b, 0);
      expect(totalCandies).toBe(5);

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(
          s.codeLine,
          CANDY_CODE_LANGUAGES,
          `Candy Step ${idx}`
        );
      });
    });

    it('验证 Manifest 注册元数据完备', () => {
      const manifest = getManifest('candy');
      expect(manifest).toBeDefined();
      expect(manifest?.category).toBe('greedy');
    });
  });

  describe('5. 加油站 (Gas Station - LeetCode 134)', () => {
    it('验证总剩余油量与起点贪心更新不变量与代码行号', () => {
      const steps = buildGasStationSteps([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('success');
      expect(last.startStation).toBe(3);

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(
          s.codeLine,
          GAS_STATION_CODE_LANGUAGES,
          `GasStation Step ${idx}`
        );
      });
    });

    it('验证 Manifest 注册元数据完备', () => {
      const manifest = getManifest('gas-station');
      expect(manifest).toBeDefined();
      expect(manifest?.category).toBe('greedy');
    });
  });

  describe('6. 跳跃游戏 II (Jump Game II - LeetCode 45)', () => {
    it('验证最远边界与步数递增不变量与代码行号', () => {
      const steps = buildJumpGameSteps([2, 3, 1, 1, 4]);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].jumpCount).toBe(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.jumpCount).toBe(2);

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(
          s.codeLine,
          JUMP_GAME_CODE_LANGUAGES,
          `JumpGame Step ${idx}`
        );
      });
    });

    it('验证 Manifest 注册元数据完备', () => {
      const manifest = getManifest('jump-game');
      expect(manifest).toBeDefined();
      expect(manifest?.category).toBe('greedy');
    });
  });

  describe('7. 柠檬水找零 (Lemonade Change - LeetCode 860)', () => {
    it('验证 5/10/20 找零贪心策略与代码行号', () => {
      const steps = buildLemonadeSteps([5, 5, 5, 10, 20]);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.success).toBe(true);

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(
          s.codeLine,
          LEMONADE_CODE_LANGUAGES,
          `Lemonade Step ${idx}`
        );
      });
    });

    it('验证 Manifest 注册元数据完备', () => {
      const manifest = getManifest('lemonade');
      expect(manifest).toBeDefined();
      expect(manifest?.category).toBe('greedy');
    });
  });

  describe('8. 最大子数组和 (Maximum Subarray - LeetCode 53)', () => {
    it('验证连续子数组和负数清零贪心不变量与代码行号', () => {
      const steps = buildMaxSubarraySteps([-2, 1, -3, 4, -1, 2, 1, -5, 4]);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].phase).toBe('init');

      const last = steps[steps.length - 1];
      expect(last.phase).toBe('done');
      expect(last.maxSum).toBe(6);

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(
          s.codeLine,
          MAX_SUBARRAY_CODE_LANGUAGES,
          `MaxSubarray Step ${idx}`
        );
      });
    });

    it('验证 Manifest 注册元数据完备', () => {
      const manifest = getManifest('max-subarray');
      expect(manifest).toBeDefined();
      expect(manifest?.category).toBe('greedy');
    });
  });

  describe('9. K 次取反后最大化的数组和 (Maximize Sum K - LeetCode 1005)', () => {
    it('验证优先翻转负数与奇数次最小绝对值翻转不变量与代码行号', () => {
      const steps = buildMaxSumKSteps([4, 2, 3], 1);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.currentSum).toBe(5);

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(
          s.codeLine,
          MAXIMIZE_SUM_K_CODE_LANGUAGES,
          `MaximizeSumK Step ${idx}`
        );
      });
    });

    it('验证 Manifest 注册元数据完备', () => {
      const manifest = getManifest('maximize-sum-k');
      expect(manifest).toBeDefined();
      expect(manifest?.category).toBe('greedy');
    });
  });

  describe('10. 合并区间 (Merge Intervals - LeetCode 56)', () => {
    it('验证区间排序与右界贪心合并扩展不变量与代码行号', () => {
      const steps = buildMergeIntervalsSteps([
        [1, 3],
        [2, 6],
        [8, 10],
        [15, 18],
      ]);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.result).toEqual([
        [1, 6],
        [8, 10],
        [15, 18],
      ]);

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(
          s.codeLine,
          MERGE_INTERVALS_CODE_LANGUAGES,
          `MergeIntervals Step ${idx}`
        );
      });
    });

    it('验证 Manifest 注册元数据完备', () => {
      const manifest = getManifest('merge-intervals');
      expect(manifest).toBeDefined();
      expect(manifest?.category).toBe('greedy');
    });
  });

  describe('11. 用最少数量的箭引爆气球 (Min Arrows - LeetCode 452)', () => {
    it('验证重叠右界收紧与弓箭数不变量与代码行号', () => {
      const steps = buildMinArrowsSteps([
        [10, 16],
        [2, 8],
        [1, 6],
        [7, 12],
      ]);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.arrowCount).toBe(2);

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(
          s.codeLine,
          MIN_ARROWS_CODE_LANGUAGES,
          `MinArrows Step ${idx}`
        );
      });
    });

    it('验证 Manifest 注册元数据完备', () => {
      const manifest = getManifest('min-arrows');
      expect(manifest).toBeDefined();
      expect(manifest?.category).toBe('greedy');
    });
  });

  describe('12. 单调递增的数字 (Monotone Digits - LeetCode 738)', () => {
    it('验证逆序借位减1与低位填9不变量与代码行号', () => {
      const steps = buildMonotoneDigitsSteps(332);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(parseInt(last.digits.join(''), 10)).toBe(299);

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(
          s.codeLine,
          MONOTONE_DIGITS_CODE_LANGUAGES,
          `MonotoneDigits Step ${idx}`
        );
      });
    });

    it('验证 Manifest 注册元数据完备', () => {
      const manifest = getManifest('monotone-digits');
      expect(manifest).toBeDefined();
      expect(manifest?.category).toBe('greedy');
    });
  });

  describe('13. 无重叠区间 (Non-overlapping Intervals - LeetCode 435)', () => {
    it('验证保留右界最小区间贪心移除不变量与代码行号', () => {
      const steps = buildNonOverlappingSteps([
        [1, 2],
        [2, 3],
        [3, 4],
        [1, 3],
      ]);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.removedCount).toBe(1);

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(
          s.codeLine,
          NON_OVERLAPPING_CODE_LANGUAGES,
          `NonOverlapping Step ${idx}`
        );
      });
    });

    it('验证 Manifest 注册元数据完备', () => {
      const manifest = getManifest('non-overlapping');
      expect(manifest).toBeDefined();
      expect(manifest?.category).toBe('greedy');
    });
  });

  describe('14. 划分字母区间 (Partition Labels - LeetCode 763)', () => {
    it('验证最远边界到达时贪心切割不变量与代码行号', () => {
      const steps = buildPartitionLabelsSteps('ababcbacadefegdehijhklij');
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.partitions).toEqual([9, 7, 8]);

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(
          s.codeLine,
          PARTITION_LABELS_CODE_LANGUAGES,
          `PartitionLabels Step ${idx}`
        );
      });
    });

    it('验证 Manifest 注册元数据完备', () => {
      const manifest = getManifest('partition-labels');
      expect(manifest).toBeDefined();
      expect(manifest?.category).toBe('greedy');
    });
  });

  describe('15. 根据身高重建队列 (Queue Reconstruction - LeetCode 406)', () => {
    it('验证身高降序与 k 索引精准插入不变量与代码行号', () => {
      const people: Array<[number, number]> = [
        [7, 0],
        [4, 4],
        [7, 1],
        [5, 0],
        [6, 1],
        [5, 2],
      ];
      const steps = buildReconstructQueueSteps(people);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.queue).toEqual([
        [5, 0],
        [7, 0],
        [5, 2],
        [6, 1],
        [4, 4],
        [7, 1],
      ]);

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(
          s.codeLine,
          RECONSTRUCT_QUEUE_CODE_LANGUAGES,
          `ReconstructQueue Step ${idx}`
        );
      });
    });

    it('验证 Manifest 注册元数据完备', () => {
      const manifest = getManifest('reconstruct-queue');
      expect(manifest).toBeDefined();
      expect(manifest?.category).toBe('greedy');
    });
  });

  describe('16. 任务调度器 (Task Scheduler - LeetCode 621)', () => {
    it('验证桶贪心容量推演与代码行号', () => {
      const steps = buildTaskSchedulerSteps('AAABBB', 2);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.totalTime).toBe(8);

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(
          s.codeLine,
          TASK_SCHEDULER_CODES,
          `TaskScheduler Step ${idx}`
        );
      });
    });

    it('验证 Manifest 注册元数据完备', () => {
      const manifest = getManifest('task-scheduler');
      expect(manifest).toBeDefined();
      expect(manifest?.category).toBe('greedy');
    });
  });

  describe('17. 监控二叉树 (Binary Tree Cameras - LeetCode 968)', () => {
    it('验证自底向上后序状态机不变量与代码行号', () => {
      const root = parseTreeFromArray([0, 0, null, 0, 0]);
      const steps = buildTreeCameraSteps(root);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.cameraCount).toBe(1);

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(
          s.codeLine,
          TREE_CAMERAS_CODE_LANGUAGES,
          `TreeCameras Step ${idx}`
        );
      });
    });

    it('验证 Manifest 注册元数据完备', () => {
      const manifest = getManifest('tree-cameras');
      expect(manifest).toBeDefined();
      expect(manifest?.category).toBe('greedy');
    });
  });

  describe('18. 摆动序列 (Wiggle Subsequence - LeetCode 376)', () => {
    it('验证峰谷贪心捕捉最长序列不变量与代码行号', () => {
      const steps = wiggleSubsequenceSteps([1, 17, 5, 10, 13, 15, 10, 5, 16, 8]);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.length).toBe(7);

      steps.forEach((s, idx) => {
        assertCodeLineWithinBounds(
          s.codeLine,
          WIGGLE_SUBSEQUENCE_CODE_LANGUAGES,
          `WiggleSubsequence Step ${idx}`
        );
      });
    });

    it('验证 Manifest 注册元数据完备', () => {
      const manifest = getManifest('wiggle-subsequence');
      expect(manifest).toBeDefined();
      expect(manifest?.category).toBe('greedy');
    });
  });

  describe('19-26. 贪心理论与周总结卡片 Manifest 注册与视图挂载契约', () => {
    const summaryCards = [
      { id: 'greedy-theory', nameKeyword: '理论基础' },
      { id: 'greedy-week-summary', nameKeyword: '总结' },
      { id: 'greedy-week-summary-2', nameKeyword: '总结' },
      { id: 'greedy-week-summary-3', nameKeyword: '总结' },
      { id: 'greedy-week-summary-4', nameKeyword: '总结' },
      { id: 'greedy-final-summary', nameKeyword: '总结' },
      { id: 'queue-vector-explained', nameKeyword: '重建队列' },
      { id: 'interval', nameKeyword: '无重叠区间' },
    ];

    for (const card of summaryCards) {
      it(`验证卡片 [${card.id}] (含关键字 "${card.nameKeyword}") 注册状态与元数据`, () => {
        const manifest = getManifest(card.id);
        expect(manifest, `Card ${card.id} must be registered`).toBeDefined();
        expect(manifest?.category).toBe('greedy');
        expect(manifest?.name).toContain(card.nameKeyword);
      });
    }
  });
});
