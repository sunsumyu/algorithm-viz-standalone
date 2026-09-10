/**
 * Class 052: 单调栈原理与左右较小值求解 (Monotonic Stack)
 * 底到顶单调递增栈与 O(N) 严格最近极值 / 牛客网 单调栈结构
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ARRAY_049_055_PROBLEMS } from './array-049-055-problem-content';
import { MONOTONIC_STACK_052_CODES, MONOTONIC_STACK_052_LINES } from './array-049-055-stage-codes';
import { Array049Step, renderMonotonicStackBoard } from './array-049-055-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface MonotonicStack052Step extends Array049Step {
  arr: number[];
  stack: number[];
  settled: { idx: number; val: number; left: number; right: number }[];
  curI: number;
}

export function buildMonotonicStack052Steps(): MonotonicStack052Step[] {
  const steps: MonotonicStack052Step[] = [];
  const lines = MONOTONIC_STACK_052_LINES;

  const arr = [3, 4, 1, 5, 2];

  // Step 0: 入口
  steps.push({
    arr,
    stack: [],
    settled: [],
    curI: 0,
    decision: '主函数入口：开始为数组 [3, 4, 1, 5, 2] 求解每个位置左右最近的较小值。',
    message: '创建底到顶单调递增栈，存储数组下标，利用新元素的破坏性迫使老元素出栈结算。',
    log: 'enter getNearLess: arr=[3, 4, 1, 5, 2]',
    codeLine: lines.entry,
    metrics: { '栈状态': '空', '已结算': 0 },
  });

  // Step 1: push arr[0]=3
  steps.push({
    arr,
    stack: [0],
    settled: [],
    curI: 0,
    decision: '遍历 i=0 (val=3)：栈为空，直接压入下标 0。',
    message: '单调栈内部保持严格单调递增性质。',
    log: 'push idx 0 (val 3)',
    codeLine: lines.pushCurrent,
    statusBadge: { text: '压栈: 3', type: 'info' },
    metrics: { '当前元素': 3, '栈顶': 3 },
  });

  // Step 2: push arr[1]=4
  steps.push({
    arr,
    stack: [0, 1],
    settled: [],
    curI: 1,
    decision: '遍历 i=1 (val=4)：4 大于栈顶 3，满足单调递增，直接压入下标 1。',
    message: '当前栈内包含：idx:0(3) ➔ idx:1(4)。',
    log: 'push idx 1 (val 4)',
    codeLine: lines.pushCurrent,
    statusBadge: { text: '压栈: 4', type: 'info' },
    metrics: { '当前元素': 4, '栈大小': 2 },
  });

  // Step 3: 扫描 arr[2]=1 ➔ 1 严格小于 4 和 3！开始连续弹出结算！
  // 结算 4: 左边是 3(idx 0), 右边是 1(idx 2)
  steps.push({
    arr,
    stack: [0],
    settled: [{ idx: 1, val: 4, left: 0, right: 2 }],
    curI: 2,
    decision: '遍历 i=2 (val=1)：1 小于栈顶 4，弹出下标 1 结算！',
    message: '弹出元素 4 的左侧较小值为栈下层元素 idx 0(3)，右侧较小值即为当前迫使其出栈的 idx 2(1)！',
    log: 'pop idx 1 (val 4): left=idx 0, right=idx 2',
    codeLine: lines.whilePop,
    statusBadge: { text: '结算: 4', type: 'warning' },
    metrics: { '已结算值': 4, '左小': 3, '右小': 1 },
  });

  // Step 4: 1 继续小于栈顶 3 ➔ 结算 3！
  // 结算 3: 栈空了，左边无 (-1)，右边是 1(idx 2)
  steps.push({
    arr,
    stack: [2],
    settled: [
      { idx: 1, val: 4, left: 0, right: 2 },
      { idx: 0, val: 3, left: -1, right: 2 },
    ],
    curI: 2,
    decision: '1 继续小于栈顶 3，弹出下标 0 结算！栈变空，左侧无较小值 (-1)，右侧较小值为 idx 2(1)。',
    message: '结算完毕后将当前下标 2 (val=1) 压栈。',
    log: 'pop idx 0 (val 3): left=-1, right=idx 2; push idx 2',
    codeLine: lines.pushCurrent,
    statusBadge: { text: '结算: 3 并压栈 1', type: 'warning' },
    metrics: { '已结算值': 3, '左小': -1, '右小': 1 },
  });

  // Step 5: 最终结算完毕
  steps.push({
    arr,
    stack: [2, 4],
    settled: [
      { idx: 1, val: 4, left: 0, right: 2 },
      { idx: 0, val: 3, left: -1, right: 2 },
      { idx: 3, val: 5, left: 2, right: 4 },
      { idx: 4, val: 2, left: 2, right: -1 },
      { idx: 2, val: 1, left: -1, right: -1 },
    ],
    curI: 5,
    decision: '全部扫描完成，清空栈中剩余元素，左右最近较小值数组全部生成。',
    message: '每个元素仅进栈出栈各 1 次，总体复杂度为严格的 O(N)。',
    log: 'monotonic stack process complete: all near-less found',
    codeLine: lines.entry,
    statusBadge: { text: '全量结算完成', type: 'success' },
    metrics: { '总结算数': 5, '复杂度': 'O(N)' },
  });

  return steps;
}

export const monotonicStack052Visualizer = registerDeclarativeAlgorithm<MonotonicStack052Step>({
  id: 'monotonic-stack-basic-052',
  name: '单调栈原理与左右较小值 (Class 052)',
  category: 'monotonic-stack',
  difficulty: 'medium',
  problemContent: ARRAY_049_055_PROBLEMS.monotonicStackBasic052,
  sourceCodes: MONOTONIC_STACK_052_CODES,
  generateSteps: buildMonotonicStack052Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderMonotonicStackBoard(
          step.arr,
          step.stack,
          step.settled,
          step.curI
        )}
        ${renderFormulaCard(
          '单调递增栈出栈结算判定定理',
          '\\text{LeftNearLess}(cur) = \\text{stack.under}(cur), \\quad \\text{RightNearLess}(cur) = i \\quad (\\text{当 } arr[i] \\le arr[cur])',
          '元素因为遇到右侧更小值而被动弹出，其右侧较小值必为破坏单调性的当前元素 $i$；其左侧较小值由于栈内单调性，必定压在其正下方。每个元素进出栈各一次，$O(N)$ 解决。'
        )}
      </div>
    `;
  },
});
