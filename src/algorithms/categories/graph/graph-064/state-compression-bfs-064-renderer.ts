/**
 * 左程云算法通关课 Class 064: 访问所有节点的最短路径 (Shortest Path Visiting All Nodes · LeetCode 847)
 * 已与通用图论版深度融为单一事实来源 (src/algorithms/categories/graph/state-compression-bfs-renderer.ts)
 * 遵循《双版本长处综合整合》规范，通过 aliases: ['state-compression-bfs-064', 'class064-code06', 'leetcode-847'] 统合分发
 */

import { StateCompressionBfsVisualizer } from '../state-compression-bfs-renderer';
import {
  StateCompStep,
  buildStateComp064Steps,
} from './state-compression-bfs-064-step-compiler';

export type { StateCompStep };
export { buildStateComp064Steps };

export const stateCompressionBfs064Visualizer = StateCompressionBfsVisualizer;
