/**
 * Class 055: 双单调队列与绝对差限制的最长连续子数组 (Longest Subarray with Limit)
 * 最大队列 + 最小队列协同维护窗口极差 / LeetCode 1438
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ARRAY_049_055_PROBLEMS } from './array-049-055-problem-content';
import { VALID_SUBARRAY_LIMIT_055_CODES, VALID_SUBARRAY_LIMIT_055_LINES } from './array-049-055-stage-codes';
import { Array049Step, renderValidSubarrayBoard } from './array-049-055-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface ValidSubarray055Step extends Array049Step {
  nums: number[];
  left: number;
  right: number;
  maxVal: number;
  minVal: number;
  limit: number;
  ansLen: number;
}

export function buildValidSubarray055Steps(): ValidSubarray055Step[] {
  const steps: ValidSubarray055Step[] = [];
  const lines = VALID_SUBARRAY_LIMIT_055_LINES;

  const nums = [8, 2, 4, 7];
  const limit = 4;

  // Step 0: 入口
  steps.push({
    nums,
    left: 0,
    right: 0,
    maxVal: 8,
    minVal: 8,
    limit,
    ansLen: 1,
    decision: '主函数入口：在 [8, 2, 4, 7] 中寻找极差 max - min <= 4 的最长连续子数组。',
    message: '同时维护 maxQ（单调递减）和 minQ（单调递增），使得窗口极差在 O(1) 内立即可得！',
    log: 'enter longestSubarray: limit=4',
    codeLine: lines.entry,
    metrics: { '限制 limit': 4, '当前窗口': '[0..0]' },
  });

  // Step 1: right=1 (val=2) -> 极差 8 - 2 = 6 > 4 超限！收缩 left
  steps.push({
    nums,
    left: 1,
    right: 1,
    maxVal: 2,
    minVal: 2,
    limit,
    ansLen: 1,
    decision: 'right 扩展到 1 (val=2)：当前窗口 max(8) - min(2) = 6 > 4 超标！left 递增收缩弹出 8！',
    message: '超限时不断从队头移出下标与 left 相等的元素，直至极差回归 limit 范围。',
    log: 'diff 8-2=6 > limit 4 -> shrink left to 1',
    codeLine: lines.shrinkLeft,
    statusBadge: { text: '极差超限收缩', type: 'warning' },
    metrics: { '极差': 0, '当前长度': 1 },
  });

  // Step 2: right=2 (val=4) -> 极差 4 - 2 = 2 <= 4 合法！
  steps.push({
    nums,
    left: 1,
    right: 2,
    maxVal: 4,
    minVal: 2,
    limit,
    ansLen: 2,
    decision: 'right 扩展到 2 (val=4)：当前窗口 [2, 4] 极差 4 - 2 = 2 <= 4 合法！',
    message: '窗口长度 2 - 1 + 1 = 2，更新最大达标长度 ans = 2。',
    log: 'diff 4-2=2 <= 4 -> valid, update ans=2',
    codeLine: lines.updateLen,
    statusBadge: { text: '合法窗口: [2, 4]', type: 'success' },
    metrics: { '极差': 2, '当前最大长度': 2 },
  });

  // Step 3: right=3 (val=7) -> 极差 7 - 2 = 5 > 4 超限！left 收缩到 2
  // 此时窗口为 [4, 7]，极差 7 - 4 = 3 <= 4 合法！
  steps.push({
    nums,
    left: 2,
    right: 3,
    maxVal: 7,
    minVal: 4,
    limit,
    ansLen: 2,
    decision: 'right 扩展到 3 (val=7)：极差 7 - 2 = 5 超限，left 收缩至 2，新窗口 [4, 7] 极差 3 <= 4 合法！',
    message: '最终全局最长达标长度确认仍为 2。',
    log: 'right=3, shrink left to 2 -> diff 7-4=3 <= 4, ans=2',
    codeLine: lines.returnAns,
    statusBadge: { text: '结算完成', type: 'success' },
    metrics: { '最长达标子数组长度': 2, '复杂度': 'O(N)' },
  });

  return steps;
}

export const validSubarrayLimit055Visualizer = registerDeclarativeAlgorithm<ValidSubarray055Step>({
  id: 'valid-subarray-limit-055',
  name: '双单调队列与绝对差限制 (Class 055)',
  category: 'array',
  difficulty: 'medium',
  problemContent: ARRAY_049_055_PROBLEMS.validSubarrayLimit055,
  sourceCodes: VALID_SUBARRAY_LIMIT_055_CODES,
  generateSteps: buildValidSubarray055Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderValidSubarrayBoard(
          step.nums,
          step.left,
          step.right,
          step.maxVal,
          step.minVal,
          step.limit,
          step.ansLen
        )}
        ${renderFormulaCard(
          '双单调队列动态极差维持准则',
          '\\Delta = \\text{nums}[\\text{maxQ.first}] - \\text{nums}[\\text{minQ.first}] \\le \\text{limit}',
          '通过同时运行一个递减队列维护最大值和一个递增队列维护最小值，滑动窗口内部的绝对极差无需遍历任何中间元素即可在 $O(1)$ 判定，使整体算法复杂度严格收敛于 $O(N)$。'
        )}
      </div>
    `;
  },
});
