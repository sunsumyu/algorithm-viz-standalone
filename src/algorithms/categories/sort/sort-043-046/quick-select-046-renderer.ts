/**
 * Class 046: 快速选择算法 (QuickSelect)
 * 寻找第 K 大/小元素 + 单侧剪枝 O(N) 期望时间 / LeetCode 215
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { SORT_043_046_PROBLEMS } from './sort-043-046-problem-content';
import { QUICK_SELECT_046_CODES, QUICK_SELECT_046_LINES } from './sort-043-046-stage-codes';
import { Sort043Step, renderQuickSelectBoard } from './sort-043-046-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface QuickSelect046Step extends Sort043Step {
  arr: number[];
  targetK: number;
  equalRange: [number, number];
  hit: boolean;
  desc: string;
}

export function buildQuickSelect046Steps(): QuickSelect046Step[] {
  const steps: QuickSelect046Step[] = [];
  const lines = QUICK_SELECT_046_LINES;

  const rawArr = [3, 2, 1, 5, 6, 4];
  const targetK = 2; // 寻找第 3 小元素 (0-indexed 索引为 2)

  // Step 0: 入口帧
  steps.push({
    arr: rawArr,
    targetK,
    equalRange: [0, 0],
    hit: false,
    desc: '寻找数组中第 3 小的元素 (索引 index = 2)。全排序需 O(N log N)，QuickSelect 剪枝仅需期望 O(N)',
    decision: `主函数入口：开始调用快速选择算法`,
    message: `以随机基准划分数组，观察目标索引 2 是否落在等于区`,
    log: `enter quickSelect: target index=2`,
    codeLine: lines.entry,
    metrics: { '目标索引': 2, '期望复杂度': 'O(N)' },
  });

  // Step 1: 第一次划分，基准值为 4
  steps.push({
    arr: [3, 2, 1, 4, 6, 5],
    targetK,
    equalRange: [3, 3],
    hit: false,
    desc: '基准选择 4：三路划分得到等于区 [3, 3] (元素 4)。目标索引 index=2 < 3，目标必然在左半区！',
    decision: `目标索引 2 < 3：单侧剪枝！彻底抛弃右侧大于区 [4, 5]，仅递归左侧 [0, 2]`,
    message: `问题规模由 6 瞬间腰斩为 3，无需像快排一样两边同时处理`,
    log: `target < equal_l: discarded right half, recurse left [0, 2]`,
    codeLine: lines.recurseLeftOnly,
    statusBadge: { text: '右侧直接剪枝抛弃', type: 'warning' },
    metrics: { '剩余搜索规模': 3, '裁剪比例': '50%' },
  });

  // Step 2: 第二次划分在 [0, 2]，基准值为 3，直接命中！
  steps.push({
    arr: [1, 2, 3, 4, 6, 5],
    targetK,
    equalRange: [2, 2],
    hit: true,
    desc: '在左区 [0, 2] 划分，基准值为 3：等于区锁定在 [2, 2]！目标索引 index=2 恰好命中等于区！',
    decision: `命中判定：index(2) >= 2 且 index(2) <= 2，目标直接命中，答案即为 arr[2] = 3！`,
    message: `无需继续递归，直接 O(1) 返回答案！`,
    log: `index hit equal range [2, 2]: target value = 3`,
    codeLine: lines.hitEqual,
    statusBadge: { text: '命中目标元素 3', type: 'success' },
    metrics: { '目标结果': 3, '总比较次数': '远小于全排序' },
  });

  return steps;
}

export const quickSelect046Visualizer = registerDeclarativeAlgorithm<QuickSelect046Step>({
  id: 'quick-select-046',
  name: '快速选择算法 (Class 046)',
  category: 'sort',
  difficulty: 'medium',
  problemContent: SORT_043_046_PROBLEMS.quickSelect046,
  sourceCodes: QUICK_SELECT_046_CODES,
  generateSteps: buildQuickSelect046Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderQuickSelectBoard(
          step.arr,
          step.targetK,
          step.equalRange,
          step.hit,
          step.desc
        )}
        ${renderFormulaCard(
          '快速选择算法单侧剪枝期望复杂度',
          'T(N) = N + \\dfrac{N}{2} + \\dfrac{N}{4} + \\dots = O(2N) = O(N)',
          '每次划分后丢弃不含目标的那一半区间，几何级数求和收敛于常数 2，使得无需排序即可在线性时间内精准锁定第 K 大或第 K 小元素。'
        )}
      </div>
    `;
  },
});
