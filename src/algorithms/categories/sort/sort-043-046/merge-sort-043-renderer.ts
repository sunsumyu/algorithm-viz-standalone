/**
 * Class 043: 归并排序 (Merge Sort)
 * 分治二分划分 + 双指针有序外排 / 洛谷 P1177
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { SORT_043_046_PROBLEMS } from './sort-043-046-problem-content';
import { MERGE_SORT_043_CODES } from './sort-043-046-stage-codes';
import { renderMergeSortBoard } from './sort-043-046-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';
import {
  MergeSort043Step,
  buildMergeSort043Steps,
} from './merge-sort-043-step-compiler';

export type { MergeSort043Step };
export { buildMergeSort043Steps };

export const mergeSort043Visualizer = registerDeclarativeAlgorithm<MergeSort043Step>({
  id: 'merge-sort-043',
  aliases: ['class043-code01', 'class010-code01', 'class009-code01', 'merge-sort-043', 'merge-sort'],
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
