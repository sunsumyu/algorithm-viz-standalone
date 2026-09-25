/**
 * 左程云算法通关课 Class 037: 普通二叉树最近公共祖先 (Lowest Common Ancestor / LeetCode 236)
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth):
 * 本题已与库内经典实现 lca-renderer.ts 深度整合，
 * 综合了交互式节点对/树数组输入、丰富的典型预设用例、左神名师讲义及四语言代码精准联动。
 * 统一主 ID 为 'lca'，并通过 aliases: ['tree-037-lowest-common-ancestor'] 全向兼容。
 */

import '../lca-renderer';
import { buildLCASteps, lcaVisualizer } from '../lca-renderer';
import { buildTreeFromArr } from '../tree-template';

export { lcaVisualizer as lowestCommonAncestor037Visualizer };

export function buildLca037Steps() {
  return buildLCASteps(buildTreeFromArr([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]), 5, 1);
}
