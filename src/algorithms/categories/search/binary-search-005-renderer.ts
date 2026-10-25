/**
 * Class 005: 二分搜索与局部最小值检测 (Binary Search & Local Minimum)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  type BinarySearch005Step,
  BINARY_SEARCH_005_CODES,
  BINARY_SEARCH_005_CODE_LINES,
  buildBinarySearch005Steps,
} from './binary-search-005-step-compiler';
import { renderBinarySearch005Canvas } from './binary-search-005-canvas-adapter';

export {
  type BinarySearch005Step,
  BINARY_SEARCH_005_CODES,
  BINARY_SEARCH_005_CODE_LINES,
  buildBinarySearch005Steps,
  renderBinarySearch005Canvas,
};

export const binarySearch005Visualizer = registerDeclarativeAlgorithm<BinarySearch005Step>({
  id: 'binary-search-005',
  hasDeductionTree: true,
  name: '二分搜索与局部最小值检测 (Class 005)',
  category: 'search',
  icon: '🔍',
  difficulty: 1,
  levelOrder: 5,
  learningGoal: '掌握二分查找在精确命中、求 >= 目标最左/最右以及无序数组局部极值检测中的精妙折半应用',
  problemHtml: `
    <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">二分思想三板斧</h3>
      <ol>
        <li><strong>有序数组精准二分：</strong>根据 <code>arr[mid]</code> 与 <code>target</code> 比对，单次折半缩小一半区间。</li>
        <li><strong>边界二分 (>= target 最左)：</strong>满足条件时暂存答案并向左压缩，不满足时向右推进。</li>
        <li><strong>极值二分 (局部最小值)：</strong>数组相邻元素不相等，首尾呈下降/上升趋势时，根据中点局部导数趋势必然可以在单侧锁定谷底极小点。</li>
      </ol>
    </div>
  `,
  inputs: [
    {
      id: 'nums',
      label: '输入序列 (逗号分隔)',
      type: 'text',
      defaultValue: '1, 2, 4, 4, 4, 5, 8, 9',
      placeholder: '请输入正整数列表',
    },
    {
      id: 'mode',
      label: '二分模式',
      type: 'select',
      defaultValue: 'findLeft',
      options: [
        { label: '寻找等于目标某数 (find)', value: 'find' },
        { label: '寻找 >= 目标的最左位置 (findLeft)', value: 'findLeft' },
        { label: '无序相邻不等局部极小值 (localMin)', value: 'localMin' },
      ],
    },
    {
      id: 'target',
      label: '目标值 (target)',
      type: 'number',
      defaultValue: 4,
    },
  ],
  codeLanguages: BINARY_SEARCH_005_CODES,
  generateSteps: (inputs) => {
    const raw = String(inputs.nums || '1, 2, 4, 4, 4, 5, 8, 9');
    const nums = raw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    const mode = (inputs.mode || 'findLeft') as 'find' | 'findLeft' | 'localMin';
    const target = parseInt(String(inputs.target || 4), 10);
    return buildBinarySearch005Steps(nums.length > 0 ? nums : [1, 2, 4, 4, 4, 5, 8, 9], mode, target);
  },
  renderCanvas: (container, step) => {
    renderBinarySearch005Canvas(container, step);
  },
});
