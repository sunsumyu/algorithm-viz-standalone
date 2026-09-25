/**
 * 左程云算法通关课 Class 036: 二叉树层序遍历 (Level Order Traversal / LeetCode 102)
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth):
 * 本题已与库内经典实现 binary-tree-level-renderer.ts 深度整合，
 * 综合了输入参数交互、典型用例预设、左神名师讲义及四语言代码精准联动。
 * 统一主 ID 为 'binary-tree-level'，并通过 aliases: ['tree-036-level-order'] 全向兼容。
 */

import '../binary-tree-level-renderer';
import { buildBTLSteps, binaryTreeLevelVisualizer } from '../binary-tree-level-renderer';
import { buildTreeFromArr } from '../tree-template';

export { binaryTreeLevelVisualizer as levelOrder036Visualizer };

export function buildLevelOrder036Steps() {
  return buildBTLSteps(buildTreeFromArr([3, 9, 20, null, null, 15, 7]));
}
