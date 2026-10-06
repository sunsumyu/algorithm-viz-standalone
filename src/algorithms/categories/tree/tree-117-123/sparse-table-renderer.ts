/**
 * Class 117: ST 表 (Sparse Table) RMQ
 * 洛谷 P3865 【模板】ST 表
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TREE_117_123_PROBLEMS } from './tree-117-123-problem-content';
import {
  SparseTableStep,
  SPARSE_TABLE_CODES,
  SPARSE_TABLE_LINES,
  buildSparseTableSteps,
} from '../../../../core/renderers/adapters/sparse-table-step-compiler';
import { renderSparseTableCanvas } from '../../../../core/renderers/adapters/sparse-table-canvas-adapter';

// 向后兼容导出
export {
  type SparseTableStep,
  SPARSE_TABLE_CODES,
  SPARSE_TABLE_LINES,
  buildSparseTableSteps,
};

export const sparseTableVisualizer = registerDeclarativeAlgorithm<SparseTableStep>({
  id: 'sparse-table-117',
  name: 'ST 表 (Sparse Table) RMQ (Class 117)',
  aliases: ['class117-code01', 'sparse-table', 'sparse-table-117', 'st-table', 'rmq'],
  category: 'tree',
  icon: '📊',
  difficulty: 2,
  levelOrder: 117,
  learningGoal: '掌握 ST 表倍增状态设计与可重复贡献性质（Idempotent），理解 O(1) 常数时间静态区间最值查询原理',
  problemHtml: TREE_117_123_PROBLEMS.sparseTable.html,
  analysisHtml: TREE_117_123_PROBLEMS.sparseTable.html,
  inputs: [
    {
      id: 'nums',
      label: '输入序列 (逗号分隔)',
      type: 'text',
      defaultValue: '3,2,4,5,6,8,1,2,9,7',
      placeholder: '请输入正整数序列',
    },
    {
      id: 'ql',
      label: '查询左端点 ql (0-based)',
      type: 'number',
      defaultValue: 2,
      min: 0,
      max: 20,
    },
    {
      id: 'qr',
      label: '查询右端点 qr (0-based)',
      type: 'number',
      defaultValue: 7,
      min: 0,
      max: 20,
    },
  ],
  codeLanguages: SPARSE_TABLE_CODES,
  generateSteps: (input) => {
    const nums = String(input.nums || '3,2,4,5,6,8,1,2,9,7').split(',').map(Number).filter(n => !isNaN(n));
    const ql = Math.max(0, Math.min(nums.length - 1, Number(input.ql) || 0));
    const qr = Math.max(ql, Math.min(nums.length - 1, Number(input.qr) || (nums.length - 1)));
    return buildSparseTableSteps(nums, ql, qr);
  },
  renderCanvas: (container, step) => {
    renderSparseTableCanvas(container, step);
  },
});
