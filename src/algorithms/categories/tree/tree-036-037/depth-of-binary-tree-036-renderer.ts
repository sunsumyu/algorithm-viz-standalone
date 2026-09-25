/**
 * 左程云算法通关课 Class 036: 二叉树最大与最小深度 (Depth of Binary Tree / LeetCode 104 & 111)
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth):
 * 本题已与库内经典实现 tree-depth-renderer.ts 深度整合，
 * 综合了动态树结构输入、典型用例预设、节点深度拓扑染色、左神名师讲义及四语言代码精准联动。
 * 统一主 ID 为 'tree-depth'，并通过 aliases: ['tree-036-depth-of-binary-tree'] 全向兼容。
 */

import '../tree-depth-renderer';
import { buildTDSteps, treeDepthVisualizer } from '../tree-depth-renderer';
import { buildTreeFromArr } from '../tree-template';

export { treeDepthVisualizer as depthOfBinaryTree036Visualizer };

export function buildDepth036Steps() {
  const steps = buildTDSteps(buildTreeFromArr([1, 2, 3, null, 4]));
  if (steps.length > 0) {
    const last = steps[steps.length - 1];
    last.metrics = {
      ...(last.metrics || {}),
      '最终最大深度': 3,
      '最终最小深度': 2,
    };
  }
  return steps;
}
