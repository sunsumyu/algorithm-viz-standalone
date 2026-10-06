/**
 * Class 108: 树状数组核心原理 (Fenwick Tree / BIT)
 * 洛谷 P3374 【模板】树状数组 1
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TREE_108_116_PROBLEMS } from './tree-108-116-problem-content';
import {
  FenwickStep,
  lowbit,
  buildFenwickTreeSteps,
  FENWICK_TREE_CODES,
} from '../../../../core/renderers/adapters/fenwick-tree-step-compiler';
import { renderFenwickTreeCanvas } from '../../../../core/renderers/adapters/fenwick-tree-canvas-adapter';

export type { FenwickStep };
export { lowbit, buildFenwickTreeSteps };

export const fenwickTreeVisualizer = registerDeclarativeAlgorithm<FenwickStep>({
  id: 'fenwick-tree-108',
  name: '树状数组核心原理 (Class 108)',
  aliases: ['class108-code01', 'fenwick-tree', 'fenwick-tree-108', 'binary-indexed-tree', 'bit'],
  category: 'tree',
  icon: '🌳',
  difficulty: 2,
  levelOrder: 108,
  learningGoal: '深刻理解 lowbit(x) = x & (-x) 的二进制位权设计，掌握树状数组单点累加与前缀和剥离跳转机制',
  problemHtml: TREE_108_116_PROBLEMS.fenwickTree.html,
  analysisHtml: TREE_108_116_PROBLEMS.fenwickTree.html,
  inputs: [
    {
      id: 'nums',
      label: '原始数据数组 (逗号分隔)',
      type: 'text',
      defaultValue: '1,3,5,7,9,11',
      placeholder: '请输入正整数序列',
    },
    {
      id: 'op',
      label: '操作类型 (add 或 query)',
      type: 'text',
      defaultValue: 'add',
      placeholder: 'add 或 query',
    },
    {
      id: 'targetIdx',
      label: '目标下标 (1-based)',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 12,
    },
    {
      id: 'val',
      label: '增加数值 (仅 add 时有效)',
      type: 'number',
      defaultValue: 6,
      min: 1,
      max: 99,
    },
  ],
  codeLanguages: FENWICK_TREE_CODES,
  generateSteps: (input) => {
    const nums = String(input.nums || '1,3,5,7,9,11').split(',').map(Number).filter(n => !isNaN(n));
    const op = String(input.op || 'add').trim().toLowerCase() === 'query' ? 'query' : 'add';
    const targetIdx = Math.max(1, Math.min(nums.length, Number(input.targetIdx) || 1));
    const val = Number(input.val) || 5;
    return buildFenwickTreeSteps(nums, op, targetIdx, val);
  },
  renderCanvas: (container, step) => {
    renderFenwickTreeCanvas(container, step);
  },
});
