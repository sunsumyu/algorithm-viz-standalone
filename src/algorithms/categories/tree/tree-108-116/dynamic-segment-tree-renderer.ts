/**
 * Class 111: 动态开点线段树 (Dynamic Segment Tree)
 * LeetCode 715 / 洛谷 P2781
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TREE_108_116_PROBLEMS } from './tree-108-116-problem-content';
import {
  DynamicSegTreeStep,
  DynamicNode,
  buildDynamicSegTreeSteps,
  DYNAMIC_SEGMENT_TREE_CODES,
} from '../../../../core/renderers/adapters/dynamic-segment-tree-step-compiler';
import { renderDynamicSegmentTreeCanvas } from '../../../../core/renderers/adapters/dynamic-segment-tree-canvas-adapter';

export type { DynamicSegTreeStep };
export { DynamicNode, buildDynamicSegTreeSteps };

export const dynamicSegmentTreeVisualizer = registerDeclarativeAlgorithm<DynamicSegTreeStep>({
  id: 'dynamic-segment-tree-111',
  name: '动态开点线段树 (Class 111)',
  aliases: ['class111-code01', 'dynamic-segment-tree', 'dynamic-segment-tree-111'],
  category: 'tree',
  icon: '🌱',
  difficulty: 3,
  levelOrder: 111,
  learningGoal: '理解动态开点在处理 10^9 等超大坐标轴时按需分配节点的空间优化思想',
  problemHtml: TREE_108_116_PROBLEMS.dynamicSegmentTree.html,
  analysisHtml: TREE_108_116_PROBLEMS.dynamicSegmentTree.html,
  inputs: [
    {
      id: 'domain',
      label: '值域上限 (模拟超大坐标)',
      type: 'number',
      defaultValue: 1000,
      min: 100,
      max: 100000,
    },
    {
      id: 'ql',
      label: '修改左端点 ql',
      type: 'number',
      defaultValue: 120,
      min: 1,
      max: 10000,
    },
    {
      id: 'qr',
      label: '修改右端点 qr',
      type: 'number',
      defaultValue: 350,
      min: 1,
      max: 10000,
    },
    {
      id: 'val',
      label: '增加数值 val',
      type: 'number',
      defaultValue: 5,
      min: 1,
      max: 99,
    },
  ],
  codeLanguages: DYNAMIC_SEGMENT_TREE_CODES,
  generateSteps: (input) => {
    const domain = Number(input.domain) || 1000;
    const ql = Math.max(1, Number(input.ql) || 120);
    const qr = Math.max(ql, Math.min(domain, Number(input.qr) || 350));
    const val = Number(input.val) || 5;
    return buildDynamicSegTreeSteps(ql, qr, val, domain);
  },
  renderCanvas: (container, step) => {
    renderDynamicSegmentTreeCanvas(container, step);
  },
});
