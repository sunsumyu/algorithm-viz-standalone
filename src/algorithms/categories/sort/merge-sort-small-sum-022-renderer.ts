/**
 * Class 022: 归并排序与小和问题 (MergeSort Small Sum)
 * 左程云算法通关课入门篇 Class 022
 * 分治合并单调性加速：利用归并合并阶段的左右有序性，在 O(N log N) 内求出全局小和
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  SmallSumStep,
  MERGE_SORT_SMALL_SUM_CODES,
  generateSmallSumSteps,
} from './merge-sort-small-sum-022-step-compiler';
import { renderSmallSumCanvas } from './merge-sort-small-sum-022-canvas-adapter';

export type { SmallSumStep };
export {
  MERGE_SORT_SMALL_SUM_CODES,
  generateSmallSumSteps,
  renderSmallSumCanvas,
};

export const mergeSortSmallSum022Visualizer = registerDeclarativeAlgorithm<SmallSumStep>({
  id: 'merge-sort-small-sum-022',
  name: 'Class 022: 归并排序与小和问题 (Small Sum)',
  category: 'sort',
  icon: '➕',
  difficulty: 2,
  levelOrder: 22,
  aliases: ['class022-code01', 'merge-sort-small-sum-022', 'small-sum-022'],
  learningGoal: '深刻理解归并排序 Merge 阶段跨组单调性在统计小和与逆序对中的降维加速威力',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 022)</h3>
      <p>在数组中，每一个数左边比当前数小的数累加起来，叫做这个数组的小和：</p>
      <ul>
        <li><strong>暴力解法</strong>：对每个数向左扫描累加，时间复杂度 $O(N^2)$。</li>
        <li><strong>逆向思维</strong>：一只数左边比它小，等价于这只数右边有多少个数比它大！</li>
        <li><strong>归并加速</strong>：在左右两部分已有序的归并阶段，只要 <code>arr[p1] &lt; arr[p2]</code>，就可以瞬间推断出右组剩下 <code>r - p2 + 1</code> 个数全部比 <code>arr[p1]</code> 大，将复杂度压缩至 $O(N \\log N)$。</li>
      </ul>
    </div>
  `,
  codeLanguages: MERGE_SORT_SMALL_SUM_CODES,
  inputs: [
    {
      id: 'nums',
      label: '输入数组 (以逗号分隔)',
      type: 'text',
      defaultValue: '1, 3, 4, 2, 5',
    },
  ],
  generateSteps: (input) => {
    const raw = String(input.nums || '1, 3, 4, 2, 5');
    const nums = raw.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    return generateSmallSumSteps(nums.length > 0 ? nums : [1, 3, 4, 2, 5]);
  },
  renderCanvas: (container, step) => {
    renderSmallSumCanvas(container, step);
  },
});
