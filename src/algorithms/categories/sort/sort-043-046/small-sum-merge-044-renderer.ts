/**
 * Class 044: 小和问题与翻转对 (Small Sum Problem)
 * 借助归并局部有序性实现 O(N log N) 批量跨区累加
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { SORT_043_046_PROBLEMS } from './sort-043-046-problem-content';
import { SMALL_SUM_MERGE_044_CODES, SMALL_SUM_MERGE_044_LINES } from './sort-043-046-stage-codes';
import { Sort043Step, renderSmallSumBoard } from './sort-043-046-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface SmallSum044Step extends Sort043Step {
  arr: number[];
  p1Val: number | null;
  p2Val: number | null;
  batchContribution: number;
  totalSmallSum: number;
  desc: string;
}

export function buildSmallSum044Steps(): SmallSum044Step[] {
  const steps: SmallSum044Step[] = [];
  const lines = SMALL_SUM_MERGE_044_LINES;

  const rawArr = [1, 3, 4, 2, 5];

  // Step 0: 入口帧
  steps.push({
    arr: rawArr,
    p1Val: null,
    p2Val: null,
    batchContribution: 0,
    totalSmallSum: 0,
    desc: '准备求解数组 [1, 3, 4, 2, 5] 的小和。暴力为 O(N^2)，左神归并优化为 O(N log N)',
    decision: `主函数入口：开始调用小和求解分治流程`,
    message: `将问题逆转为：“每当左区数小于右区数时，右半区剩余所有数都比它大，批量产生贡献”`,
    log: `enter smallSum: arr=[1, 3, 4, 2, 5]`,
    codeLine: lines.entry,
    metrics: { '数组长度': 5, '暴力耗时': 'O(N^2)', '归并耗时': 'O(N log N)' },
  });

  // Step 1: 左半区内部累加
  steps.push({
    arr: rawArr,
    p1Val: 1,
    p2Val: 3,
    batchContribution: 4,
    totalSmallSum: 4,
    desc: '处理左半区 [1, 3, 4]：元素 1 产生贡献 1*2=2，元素 3 产生贡献 3*1=3，左区内部小和累计为 4',
    decision: `子区间递归返回：左半区内部产生了 4 的小和贡献`,
    message: `右半区 [2, 5] 内部 2 比 5 小，产生 2*1=2 贡献`,
    log: `left/right internal small sums accumulated: 4 + 2 = 6`,
    codeLine: lines.splitSums,
    statusBadge: { text: '子区间小和完成', type: 'info' },
    metrics: { '子区间累计': 6 },
  });

  // Step 2: 跨区间合并阶段 - 元素 1 比右区 2 小
  steps.push({
    arr: [1, 3, 4, 2, 5],
    p1Val: 1,
    p2Val: 2,
    batchContribution: 2,
    totalSmallSum: 8,
    desc: '跨区间 merge：左区 p1(1) < 右区 p2(2)！右区从 2 到 5 共有 2 个数比 1 大，贡献 = 2 * 1 = 2！',
    decision: `公式计算：(r - p2 + 1) * arr[p1] = (4 - 3 + 1) * 1 = 2`,
    message: `无需逐一比对，1 条算式瞬间囊括了对右半区 [2, 5] 的全部小和贡献！`,
    log: `batch small sum: 1 contributes 2 * 1 = 2`,
    codeLine: lines.accumulateSum,
    statusBadge: { text: '批量累加 2', type: 'warning' },
    metrics: { '本次贡献': 2, '累计小和': 8 },
  });

  // Step 3: 跨区间合并阶段 - 元素 3 比右区 5 小
  steps.push({
    arr: [1, 3, 4, 2, 5],
    p1Val: 3,
    p2Val: 5,
    batchContribution: 3,
    totalSmallSum: 11,
    desc: '左区 p1(3) < 右区 p2(5)！右区剩余 1 个数比 3 大，贡献 = 1 * 3 = 3',
    decision: `元素 3 产生贡献：(4 - 4 + 1) * 3 = 3，累计小和上升至 11`,
    message: `随后左区 4 也小于 5，产生 1 * 4 = 4 贡献`,
    log: `batch small sum: 3 contributes 3`,
    codeLine: lines.accumulateSum,
    statusBadge: { text: '批量累加 3', type: 'warning' },
    metrics: { '本次贡献': 3, '累计小和': 11 },
  });

  // Step 4: 全局小和汇总结算
  steps.push({
    arr: [1, 2, 3, 4, 5],
    p1Val: null,
    p2Val: null,
    batchContribution: 0,
    totalSmallSum: 16,
    desc: '加上 4 对 5 产生的 4 贡献，最终该数组的小和精确等于 16！',
    decision: `所有区间合并完毕，返回全局小和总值 16`,
    message: `小和问题通过归并排序完美降维，展示了算法思维逆转的无穷魅力！`,
    log: `smallSum finished: total = 16`,
    codeLine: lines.returnSum,
    statusBadge: { text: '小和计算达成', type: 'success' },
    metrics: { '最终小和': 16, '复杂度': 'O(N log N)' },
  });

  return steps;
}

export const smallSumMerge044Visualizer = registerDeclarativeAlgorithm<SmallSum044Step>({
  id: 'small-sum-merge-044',
  name: '小和问题与翻转对 (Class 044)',
  category: 'sort',
  difficulty: 'medium',
  problemContent: SORT_043_046_PROBLEMS.smallSumMerge044,
  sourceCodes: SMALL_SUM_MERGE_044_CODES,
  generateSteps: buildSmallSum044Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderSmallSumBoard(
          step.arr,
          step.p1Val,
          step.p2Val,
          step.batchContribution,
          step.totalSmallSum,
          step.desc
        )}
        ${renderFormulaCard(
          '归并小和跨区间批量贡献公式',
          '\\text{Cost} = \\sum_{\\text{merge}} \\Big[ \\text{arr}[p_1] < \\text{arr}[p_2] \\; ? \\; (r - p_2 + 1) \\times \\text{arr}[p_1] : 0 \\Big]',
          '利用右半区整体有序的单调性，一次乘法算出 $arr[p_1]$ 对右侧所有更大元素的总贡献，将复杂度从二次方降为线性对数。'
        )}
      </div>
    `;
  },
});
