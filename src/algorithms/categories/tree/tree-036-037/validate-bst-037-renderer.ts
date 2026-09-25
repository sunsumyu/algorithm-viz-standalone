/**
 * 左程云算法通关课 Class 037: 验证二叉搜索树 (Validate BST / LeetCode 98)
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth):
 * 本题已与库内经典实现 valid-bst-renderer.ts 深度整合，
 * 综合了自定义树结构输入、典型用例预设、中序严格单调校验看板、左神名师讲义及四语言代码精准联动。
 * 统一主 ID 为 'valid-bst'，并通过 aliases: ['tree-037-validate-bst'] 全向兼容。
 */

import '../valid-bst-renderer';
import { buildVBSteps, validBstVisualizer } from '../valid-bst-renderer';
import { buildTreeFromArr } from '../tree-template';

export { validBstVisualizer as validateBst037Visualizer };

export function buildValidateBst037Steps() {
  return buildVBSteps(buildTreeFromArr([2, 1, 3]));
}
