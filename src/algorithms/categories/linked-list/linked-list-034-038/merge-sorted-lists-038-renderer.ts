/**
 * Class 038: 有序链表合并 (Merge Two Sorted Lists)
 * 虚拟头节点 (Dummy) + 双指针贪心归并 / LeetCode 21
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { LINKED_LIST_034_038_PROBLEMS } from './linked-list-034-038-problem-content';
import { MERGE_SORTED_LISTS_038_CODES } from './linked-list-034-038-stage-codes';
import { renderMergeSortedBoard } from './linked-list-034-038-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';
import {
  MergeSortedLists038Step,
  buildMergeSortedLists038Steps,
} from './merge-sorted-lists-038-step-compiler';

export type { MergeSortedLists038Step };
export { buildMergeSortedLists038Steps };

export const mergeSortedLists038Visualizer = registerDeclarativeAlgorithm<MergeSortedLists038Step>({
  id: 'merge-sorted-lists-038',
  aliases: ['class038-code01', 'class007-code01', 'merge-two-sorted-lists', 'leetcode-21', 'merge-two-sorted-lists-21', '21', 'merge-sorted-lists'],
  name: '有序链表合并 (Class 038)',
  category: 'linked-list',
  difficulty: 'easy',
  hasDeductionTree: true,
  problemContent: LINKED_LIST_034_038_PROBLEMS.mergeSortedLists038,
  sourceCodes: MERGE_SORTED_LISTS_038_CODES,
  generateSteps: buildMergeSortedLists038Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderMergeSortedBoard(
          step.l1,
          step.l2,
          step.merged,
          step.curL1,
          step.curL2,
          step.phase
        )}
      </div>
    `;
  },
});
