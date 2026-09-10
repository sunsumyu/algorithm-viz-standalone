/**
 * Class 043: 归并排序 (Merge Sort)
 * 分治二分划分 + 双指针有序外排 / 洛谷 P1177
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { SORT_043_046_PROBLEMS } from './sort-043-046-problem-content';
import { MERGE_SORT_043_CODES, MERGE_SORT_043_LINES } from './sort-043-046-stage-codes';
import { Sort043Step, renderMergeSortBoard } from './sort-043-046-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface MergeSort043Step extends Sort043Step {
  arr: number[];
  l: number;
  r: number;
  mid: number;
  help: number[];
  p1: number | null;
  p2: number | null;
  stage: string;
}

export function buildMergeSort043Steps(): MergeSort043Step[] {
  const steps: MergeSort043Step[] = [];
  const lines = MERGE_SORT_043_LINES;

  const rawArr = [5, 2, 4, 1];

  // Step 0: 入口帧
  steps.push({
    arr: rawArr,
    l: 0,
    r: 3,
    mid: 1,
    help: [],
    p1: null,
    p2: null,
    stage: '归并排序入口划分',
    decision: `主函数入口：开始对数组 [5, 2, 4, 1] 执行归并排序`,
    message: `计算中点 mid = 1，将区间 [0, 3] 拆分为左半区 [0, 1] 与右半区 [2, 3]`,
    log: `enter mergeSort: l=0, r=3, mid=1`,
    codeLine: lines.entry,
    metrics: { '区间范围': '[0, 3]', '中点': 1 },
  });

  // Step 1: 左半区递归完成
  steps.push({
    arr: [2, 5, 4, 1],
    l: 0,
    r: 3,
    mid: 1,
    help: [],
    p1: 0,
    p2: null,
    stage: '左半区递归排序完成',
    decision: `左半区 [0, 1] 递归完毕，数组局部变为 [2, 5]`,
    message: `准备递归处理右半区 [2, 3]`,
    log: `left half sorted: [2, 5]`,
    codeLine: lines.recurseLeft,
    statusBadge: { text: '左半区有序', type: 'info' },
    metrics: { '左半区': '[2, 5]' },
  });

  // Step 2: 右半区递归完成，准备调用 merge
  steps.push({
    arr: [2, 5, 1, 4],
    l: 0,
    r: 3,
    mid: 1,
    help: [],
    p1: 0,
    p2: 2,
    stage: '双指针 merge 初始化',
    decision: `右半区 [2, 3] 递归完毕，数组局部变为 [1, 4]；准备合并 [2, 5] 与 [1, 4]`,
    message: `双指针初始化：p1 指向左区首位 0(2)，p2 指向右区首位 2(1)`,
    log: `call merge: p1=0 (val=2), p2=2 (val=1)`,
    codeLine: lines.callMerge,
    statusBadge: { text: '双指针就绪', type: 'warning' },
    metrics: { 'p1值': 2, 'p2值': 1 },
  });

  // Step 3: 双指针推进归并
  steps.push({
    arr: [2, 5, 1, 4],
    l: 0,
    r: 3,
    mid: 1,
    help: [1, 2, 4, 5],
    p1: null,
    p2: null,
    stage: '双指针归并填入 help 数组',
    decision: `比对 p1 与 p2：依序填入较小值 1, 2, 4, 5，全部元素收敛至 help 数组`,
    message: `help 数组现在已完全升序：[1, 2, 4, 5]`,
    log: `help filled: [1, 2, 4, 5]`,
    codeLine: lines.callMerge,
    statusBadge: { text: 'help 排序完成', type: 'info' },
    metrics: { 'help长度': 4 },
  });

  // Step 4: 回写原数组，全局排序完成
  steps.push({
    arr: [1, 2, 4, 5],
    l: 0,
    r: 3,
    mid: 1,
    help: [1, 2, 4, 5],
    p1: null,
    p2: null,
    stage: '回写原数组，归并大功告成',
    decision: `将 help 数组有序内容写回原数组 [0, 3]：原数组变为 [1, 2, 4, 5]`,
    message: `归并排序全局完成，时间复杂度严格维持 O(N log N)！`,
    log: `mergeSort finished: [1, 2, 4, 5]`,
    codeLine: lines.callMerge,
    statusBadge: { text: '排序完成', type: 'success' },
    metrics: { '最终结果': '[1, 2, 4, 5]', '时间复杂度': 'O(N log N)' },
  });

  return steps;
}

export const mergeSort043Visualizer = registerDeclarativeAlgorithm<MergeSort043Step>({
  id: 'merge-sort-043',
  name: '归并排序原理 (Class 043)',
  category: 'sort',
  difficulty: 'easy',
  problemContent: SORT_043_046_PROBLEMS.mergeSort043,
  sourceCodes: MERGE_SORT_043_CODES,
  generateSteps: buildMergeSort043Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderMergeSortBoard(
          step.arr,
          step.l,
          step.r,
          step.mid,
          step.help,
          step.p1,
          step.p2,
          step.stage
        )}
        ${renderFormulaCard(
          '归并排序 Master 复杂度定理',
          'T(N) = 2T(N/2) + O(N) = O(N \\log N), \\quad S(N) = O(N)',
          '每次将问题分为规模减半的 2 个子问题，跨区间双指针归并耗时 $O(N)$，具有出色的稳定性与理论时间保障。'
        )}
      </div>
    `;
  },
});
