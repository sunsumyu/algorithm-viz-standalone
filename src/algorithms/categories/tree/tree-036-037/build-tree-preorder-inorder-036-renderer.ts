/**
 * 左程云算法通关课 Class 036: 从前序与中序序列构造二叉树 (Build Tree from Preorder & Inorder / LeetCode 105)
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth):
 * 本题已与库内经典实现 build-tree-renderer.ts 深度整合，
 * 综合了前序/中序输入序列交互、典型用例预设、拓扑生长动态快照、左神名师讲义及四语言代码精准联动。
 * 统一主 ID 为 'build-tree'，并通过 aliases: ['tree-036-build-tree-preorder-inorder'] 全向兼容。
 */

import '../build-tree-renderer';
import { buildTreeSteps, buildTreeVisualizer } from '../build-tree-renderer';

export { buildTreeVisualizer as buildTreePreorderInorder036Visualizer };

export function buildBuildTree036Steps() {
  return buildTreeSteps([3, 9, 20, 15, 7], [9, 3, 15, 20, 7]);
}
