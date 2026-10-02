/**
 * 左程云算法通关课 Class 037: 路径总和 II 收集所有路径 (Path Sum II / LeetCode 113)
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth):
 * 本题已与库内经典实现 path-sum-renderer.ts 深度整合，
 * 综合了自定义树与 targetSum 输入、典型用例预设、DFS 回溯入栈/出栈/现场恢复、左神名师讲义及四语言代码精准联动。
 * 统一主 ID 为 'path-sum'，并通过 aliases: ['tree-037-path-sum-ii'] 全向兼容。
 */

import '../path-sum-renderer';
import { buildPathSumStage2BacktrackSteps, pathSumVisualizer } from '../path-sum-renderer';
import { buildTreeFromArr } from '../tree-template';

export { pathSumVisualizer as pathSumII037Visualizer };

export function buildPathSumII037Steps() {
  return buildPathSumStage2BacktrackSteps(buildTreeFromArr([5, 4, 8, 11, null, 9, 2]), 22);
}
