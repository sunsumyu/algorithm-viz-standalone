/**
 * Class 049: 一维前缀和与哈希表 (Subarray Sum Equals K)
 * 前缀和差值映射与 O(N) 频次匹配 / LeetCode 560
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ARRAY_049_055_PROBLEMS } from './array-049-055-problem-content';
import { PREFIX_SUM_BASIC_049_CODES, PREFIX_SUM_BASIC_049_LINES } from './array-049-055-stage-codes';
import { Array049Step, renderPrefixSumBasicBoard } from './array-049-055-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface PrefixSum049Step extends Array049Step {
  arr: number[];
  curIdx: number;
  preSum: number;
  targetK: number;
  mapEntries: [number, number][];
  count: number;
}

export function buildPrefixSum049Steps(): PrefixSum049Step[] {
  const steps: PrefixSum049Step[] = [];
  const lines = PREFIX_SUM_BASIC_049_LINES;

  const arr = [1, 2, 3, -2, 2];
  const targetK = 3;

  // Step 0: 入口帧
  steps.push({
    arr,
    curIdx: -1,
    preSum: 0,
    targetK,
    mapEntries: [[0, 1]],
    count: 0,
    decision: `主函数入口：开始在数组 [1, 2, 3, -2, 2] 中寻找和为 K=3 的连续子数组个数`,
    message: `哈希表初始化 put(0, 1)，代表前缀和为 0 默认出现 1 次（处理从头开始的子数组）`,
    log: `enter subarraySum: k=3, map={0:1}`,
    codeLine: lines.entry,
    metrics: { '目标和': 3, '已匹配': 0 },
  });

  // Step 1: 扫描 1 (idx=0)
  steps.push({
    arr,
    curIdx: 0,
    preSum: 1,
    targetK,
    mapEntries: [[0, 1], [1, 1]],
    count: 0,
    decision: `处理 arr[0]=1：preSum 累加为 1；查询 preSum - K = 1 - 3 = -2，哈希表无记录`,
    message: `将 preSum=1 存入哈希表`,
    log: `idx 0: preSum=1, targetDiff=-2 not found`,
    codeLine: lines.addSum,
    statusBadge: { text: '前缀和=1', type: 'info' },
    metrics: { '当前前缀和': 1, '匹配': 0 },
  });

  // Step 2: 扫描 2 (idx=1) -> 命中 3 - 3 = 0！
  steps.push({
    arr,
    curIdx: 1,
    preSum: 3,
    targetK,
    mapEntries: [[0, 1], [1, 1], [3, 1]],
    count: 1,
    decision: `处理 arr[1]=2：preSum 累加为 3；查询 preSum - K = 3 - 3 = 0，哈希表中记录 1 次！`,
    message: `找到第 1 个达标子数组 [1, 2] (和为 3)，count 累加为 1！`,
    log: `idx 1: preSum=3, found diff 0! count=1`,
    codeLine: lines.queryDiff,
    statusBadge: { text: '命中子数组 [1, 2]', type: 'success' },
    metrics: { '当前前缀和': 3, '达标数': 1 },
  });

  // Step 3: 扫描 3 (idx=2) -> 命中 6 - 3 = 3！
  steps.push({
    arr,
    curIdx: 2,
    preSum: 6,
    targetK,
    mapEntries: [[0, 1], [1, 1], [3, 1], [6, 1]],
    count: 2,
    decision: `处理 arr[2]=3：preSum 累加为 6；查询 preSum - K = 6 - 3 = 3，哈希表中记录 1 次！`,
    message: `找到第 2 个达标子数组 [3] (和为 3)，count 累加为 2！`,
    log: `idx 2: preSum=6, found diff 3! count=2`,
    codeLine: lines.queryDiff,
    statusBadge: { text: '命中子数组 [3]', type: 'success' },
    metrics: { '当前前缀和': 6, '达标数': 2 },
  });

  // Step 4: 循环终结并返回答案
  steps.push({
    arr,
    curIdx: 4,
    preSum: 6,
    targetK,
    mapEntries: [[0, 1], [1, 1], [3, 1], [4, 1], [6, 2]],
    count: 3,
    decision: `遍历终结：后续 [-2, 2] 再次产生和为 3 的子数组 [3, -2, 2]，全局累计共 3 个达标子数组！`,
    message: `算法圆满结束，前缀和 + 哈希表以严格 O(N) 线性时间完成检索`,
    log: `subarraySum completed: return 3`,
    codeLine: lines.returnCount,
    statusBadge: { text: '检索完成', type: 'success' },
    metrics: { '最终答案': 3, '复杂度': 'O(N)' },
  });

  return steps;
}

export const prefixSumBasic049Visualizer = registerDeclarativeAlgorithm<PrefixSum049Step>({
  id: 'prefix-sum-basic-049',
  name: '一维前缀和与哈希表结合 (Class 049)',
  category: 'array',
  difficulty: 'medium',
  problemContent: ARRAY_049_055_PROBLEMS.prefixSumBasic049,
  sourceCodes: PREFIX_SUM_BASIC_049_CODES,
  generateSteps: buildPrefixSum049Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderPrefixSumBasicBoard(
          step.arr,
          step.curIdx,
          step.preSum,
          step.targetK,
          step.mapEntries,
          step.count
        )}
        ${renderFormulaCard(
          '前缀和子数组等价转换方程',
          '\\text{Sum}(j \\dots i) = \\text{preSum}[i] - \\text{preSum}[j - 1] = K \\iff \\text{preSum}[j - 1] = \\text{preSum}[i] - K',
          '通过将区间和转化为两前缀和之差，在遍历中将查找区间和规约为在哈希表中检索单点数值的频次，达成极致的 $O(N)$ 复杂度。'
        )}
      </div>
    `;
  },
});
