/**
 * Class 054: 单调队列与滑动窗口最大值 (Sliding Window Maximum)
 * 双端队列淘汰尾部与弹出过期队头 / LeetCode 239
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ARRAY_049_055_PROBLEMS } from './array-049-055-problem-content';
import { MONOTONIC_QUEUE_054_CODES, MONOTONIC_QUEUE_054_LINES } from './array-049-055-stage-codes';
import { Array049Step, renderMonotonicQueueBoard } from './array-049-055-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface MonotonicQueue054Step extends Array049Step {
  nums: number[];
  k: number;
  curIdx: number;
  queueIndices: number[];
  maxVals: number[];
}

export function buildMonotonicQueue054Steps(): MonotonicQueue054Step[] {
  const steps: MonotonicQueue054Step[] = [];
  const lines = MONOTONIC_QUEUE_054_LINES;

  const nums = [1, 3, -1, -3, 5, 3, 6, 7];
  const k = 3;

  // Step 0: 入口
  steps.push({
    nums,
    k,
    curIdx: -1,
    queueIndices: [],
    maxVals: [],
    decision: `主函数入口：开始为数组 [${nums.join(', ')}] 计算长度为 K=3 的滑动窗口最大值。`,
    message: '创建双端队列 Deque，保持队头到队尾对应数值单调递减；队头永远是当前窗口最大值！',
    log: 'enter maxSlidingWindow: k=3',
    codeLine: lines.entry,
    metrics: { '窗口大小 K': 3, '已产出最大值': 0 },
  });

  // Step 1: 扫描 i=0(1), i=1(3) -> 1 被 3 淘汰出队！
  steps.push({
    nums,
    k,
    curIdx: 1,
    queueIndices: [1],
    maxVals: [],
    decision: '遍历 i=1 (val=3)：3 大于前面进入的 nums[0]=1，下标 0 永远不可能成为最大值，从队尾淘汰！',
    message: '淘汰较小元素，单调队列只保留有可能在未来窗口胜出的候选下标。',
    log: 'pollLast 0, addLast 1 (val 3)',
    codeLine: lines.popBack,
    statusBadge: { text: '淘汰小值', type: 'warning' },
    metrics: { '队头最大': 3, '队大小': 1 },
  });

  // Step 2: 扫描 i=2(-1) -> 第一个完整窗口形成 [1, 3, -1]
  steps.push({
    nums,
    k,
    curIdx: 2,
    queueIndices: [1, 2],
    maxVals: [3],
    decision: '遍历 i=2 (val=-1)：首个大小为 3 的完整窗口 [1, 3, -1] 形成！',
    message: '此时队头下标为 1 (val=3)，记录当前窗口最大值为 3。',
    log: 'window [0..2] formed -> max is 3',
    codeLine: lines.recordMax,
    statusBadge: { text: '首个窗口最大值: 3', type: 'success' },
    metrics: { '当前最大值': 3, '窗口数': 1 },
  });

  // Step 3: 扫描 i=4(val=5) -> 霸气淘汰所有旧元素！
  steps.push({
    nums,
    k,
    curIdx: 4,
    queueIndices: [4],
    maxVals: [3, 3, 5],
    decision: '遍历 i=4 (val=5)：5 大于队列中所有历史元素，全数从尾部淘汰！',
    message: '当前窗口 [3, -1, 5] 的最大值直接由新进来的 5 占据队头，记录最大值 5。',
    log: 'window [2..4] formed -> max is 5',
    codeLine: lines.recordMax,
    statusBadge: { text: '新霸主 5 登顶', type: 'success' },
    metrics: { '当前最大值': 5, '窗口数': 3 },
  });

  // Step 4: 遍历终结，产出所有窗口最大值
  steps.push({
    nums,
    k,
    curIdx: 7,
    queueIndices: [7],
    maxVals: [3, 3, 5, 5, 6, 7],
    decision: '遍历完毕：所有 6 个滑动窗口的最大值序列计算完成：[3, 3, 5, 5, 6, 7]。',
    message: '单调队列每个元素最多进队 1 次、出队 1 次，整体时间复杂度为严格的 O(N)！',
    log: 'maxSlidingWindow complete -> return [3,3,5,5,6,7]',
    codeLine: lines.entry,
    statusBadge: { text: '计算完成', type: 'success' },
    metrics: { '最终结果数': 6, '复杂度': 'O(N)' },
  });

  return steps;
}

export const monotonicQueue054Visualizer = registerDeclarativeAlgorithm<MonotonicQueue054Step>({
  id: 'monotonic-queue-basic-054',
  name: '单调队列与滑动窗口最大值 (Class 054)',
  category: 'monotonic-stack',
  difficulty: 'medium',
  problemContent: ARRAY_049_055_PROBLEMS.monotonicQueueBasic054,
  sourceCodes: MONOTONIC_QUEUE_054_CODES,
  generateSteps: buildMonotonicQueue054Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderMonotonicQueueBoard(
          step.nums,
          step.k,
          step.curIdx,
          step.queueIndices,
          step.maxVals
        )}
        ${renderFormulaCard(
          '单调队列双端维序准则',
          '\\text{pollLast while } nums[q.last] \\le nums[i], \\quad \\text{pollFirst if } q.first \\le i - k',
          '队尾维系严格单调性（淘汰劣解），队头维系窗口有效性（过期移出）。两端操作均摊常数级，将单调极值检索从 $O(K)$ 降低到均摊 $O(1)$。'
        )}
      </div>
    `;
  },
});
