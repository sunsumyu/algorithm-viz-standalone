/**
 * Class 045: 快速排序与荷兰国旗三路划分 (QuickSort & Dutch National Flag)
 * 小于区/等于区/大于区三向切分 + 随机基准 / LeetCode 75 & 912
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { SORT_043_046_PROBLEMS } from './sort-043-046-problem-content';
import { QUICK_SORT_DUTCH_FLAG_045_CODES, QUICK_SORT_DUTCH_FLAG_045_LINES } from './sort-043-046-stage-codes';
import { Sort043Step, renderDutchFlagBoard } from './sort-043-046-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface QuickSortDutchFlag045Step extends Sort043Step {
  arr: number[];
  less: number;
  more: number;
  curIdx: number;
  pivot: number;
  phase: string;
}

export function buildQuickSortDutchFlag045Steps(): QuickSortDutchFlag045Step[] {
  const steps: QuickSortDutchFlag045Step[] = [];
  const lines = QUICK_SORT_DUTCH_FLAG_045_LINES;

  const rawArr = [3, 5, 2, 3, 6, 3];
  const pivot = 3;

  // Step 0: 入口帧
  steps.push({
    arr: rawArr,
    less: -1,
    more: 6,
    curIdx: 0,
    pivot,
    phase: '荷兰国旗三向切分初始化',
    decision: `主函数入口：开始对数组 [3, 5, 2, 3, 6, 3] 进行荷兰国旗划分，基准值 pivot = 3`,
    message: `初始化边界：小于区右界 less = -1，大于区左界 more = 6，当前指针 i = 0`,
    log: `enter partition: pivot=3, less=-1, more=6`,
    codeLine: lines.pickRandom,
    metrics: { '基准值': 3, '数组规模': 6 },
  });

  // Step 1: 遇到 3 (等于 pivot)
  steps.push({
    arr: rawArr,
    less: -1,
    more: 6,
    curIdx: 1,
    pivot,
    phase: 'arr[0]=3 等于基准值',
    decision: `arr[0] == 3：等于基准值，当前元素自动纳入等于区，仅将指针 i++ 移动到 1`,
    message: `等于区无需换位，指针平移`,
    log: `arr[0]==3, i advanced to 1`,
    codeLine: lines.dutchPartition,
    statusBadge: { text: '等于区扩容', type: 'info' },
    metrics: { '当前i': 1, '等于区': '[0, 0]' },
  });

  // Step 2: 遇到 5 (大于 pivot)
  steps.push({
    arr: [3, 3, 2, 3, 6, 5],
    less: -1,
    more: 5,
    curIdx: 1,
    pivot,
    phase: 'arr[1]=5 大于基准值',
    decision: `arr[1] > 3：大于基准值，执行 swap(--more, i) 将 5 与末尾 3 交换，大于区左移至 5`,
    message: `注意换上来的新元素仍停留在 i=1 位置，下一步需要重新判定`,
    log: `arr[1]>3, swapped with末尾, more=5, i remains 1`,
    codeLine: lines.dutchPartition,
    statusBadge: { text: '大于区扩充', type: 'warning' },
    metrics: { '大于区左界': 5, '换上新值': 3 },
  });

  // Step 3: 遇到 2 (小于 pivot)
  steps.push({
    arr: [2, 3, 3, 3, 6, 5],
    less: 0,
    more: 4,
    curIdx: 4,
    pivot,
    phase: '元素遍历完毕，三色分区清晰锁定',
    decision: `扫描持续推进：小于区纳入 [2]，等于区收纳 [3, 3, 3]，大于区为 [6, 5]`,
    message: `三路划分完成！等于区锁定在下标范围 [1, 3] 内的所有 3 一次性归位！`,
    log: `dutch flag partition finished: equal area = [1, 3]`,
    codeLine: lines.recurseLess,
    statusBadge: { text: '三路划分完成', type: 'success' },
    metrics: { '小于区': '[0, 0]', '等于区': '[1, 3]', '大于区': '[4, 5]' },
  });

  return steps;
}

export const quickSortDutchFlag045Visualizer = registerDeclarativeAlgorithm<QuickSortDutchFlag045Step>({
  id: 'quick-sort-dutch-flag-045',
  name: '快速排序与荷兰国旗三路划分 (Class 045)',
  category: 'sort',
  difficulty: 'medium',
  problemContent: SORT_043_046_PROBLEMS.quickSortDutchFlag045,
  sourceCodes: QUICK_SORT_DUTCH_FLAG_045_CODES,
  generateSteps: buildQuickSortDutchFlag045Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderDutchFlagBoard(
          step.arr,
          step.less,
          step.more,
          step.curIdx,
          step.pivot,
          step.phase
        )}
        ${renderFormulaCard(
          '荷兰国旗三路划分核心优势',
          '\\text{Array} = \\big[ < \\text{pivot} \\big] \\cup \\big[ == \\text{pivot} \\big] \\cup \\big[ > \\text{pivot} \\big]',
          '相比传统单双指针切分，荷兰国旗能将所有重复等于基准值的元素一次性全部排好，面对大量重复数值时时间复杂度从 $O(N^2)$ 骤降为 $O(N)$。'
        )}
      </div>
    `;
  },
});
