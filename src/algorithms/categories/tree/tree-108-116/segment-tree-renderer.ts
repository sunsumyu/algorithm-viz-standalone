/**
 * Class 110: 经典线段树与懒惰标记 (Segment Tree with Lazy Tag)
 * 洛谷 P3372 【模板】线段树 1
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TREE_108_116_PROBLEMS } from './tree-108-116-problem-content';
import {
  SegTreeNode,
  SegmentTreeStep,
  SEGMENT_TREE_CODES,
  SEGMENT_TREE_LINES,
  buildSegmentTreeSteps,
} from '../../../../core/renderers/adapters/segment-tree-step-compiler';
import { renderSegmentTreeCanvas } from '../../../../core/renderers/adapters/segment-tree-canvas-adapter';

// 向后兼容导出
export {
  type SegTreeNode,
  type SegmentTreeStep,
  SEGMENT_TREE_CODES,
  SEGMENT_TREE_LINES,
  buildSegmentTreeSteps,
};

export const segmentTreeVisualizer = registerDeclarativeAlgorithm<SegmentTreeStep>({
  id: 'segment-tree-110',
  name: '经典线段树与懒标记 (Class 110)',
  aliases: ['class110-code01', 'segment-tree', 'segment-tree-110', 'segment-tree-lazy'],
  category: 'tree',
  icon: '🌲',
  difficulty: 2,
  levelOrder: 110,
  learningGoal: '掌握线段树完全二叉树结构、分治区间修改、以及懒惰标记 (Lazy Tag) 延迟下传的核心提速思想',
  problemHtml: TREE_108_116_PROBLEMS.segmentTree.html,
  analysisHtml: TREE_108_116_PROBLEMS.segmentTree.html,
  inputs: [
    {
      id: 'nums',
      label: '基础序列 (逗号分隔)',
      type: 'text',
      defaultValue: '1,2,3,4,5,6,7,8',
      placeholder: '请输入序列',
    },
    {
      id: 'ql',
      label: '修改左端点 ql (1-based)',
      type: 'number',
      defaultValue: 2,
      min: 1,
      max: 8,
    },
    {
      id: 'qr',
      label: '修改右端点 qr (1-based)',
      type: 'number',
      defaultValue: 5,
      min: 1,
      max: 8,
    },
    {
      id: 'val',
      label: '增加数值 val',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 50,
    },
  ],
  codeLanguages: SEGMENT_TREE_CODES,
  generateSteps: (input) => {
    const nums = String(input.nums || '1,2,3,4,5,6,7,8').split(',').map(Number).filter(n => !isNaN(n));
    const ql = Math.max(1, Number(input.ql) || 2);
    const qr = Math.max(ql, Math.min(nums.length, Number(input.qr) || 5));
    const val = Number(input.val) || 3;
    return buildSegmentTreeSteps(nums, ql, qr, val);
  },
  renderCanvas: (container, step) => {
    renderSegmentTreeCanvas(container, step);
  },
});
