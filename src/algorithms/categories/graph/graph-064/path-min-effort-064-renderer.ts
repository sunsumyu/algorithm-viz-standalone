/**
 * 左程云算法通关课 Class 064: 最小体力消耗路径 (Path With Minimum Effort · LeetCode 1631)
 * 已与通用图论版深度融为单一事实来源 (src/algorithms/categories/graph/path-min-effort-renderer.ts)
 * 遵循《双版本长处综合整合》规范，通过 aliases: ['path-min-effort-064', 'class064-code02', 'leetcode-1631'] 统合分发
 */

import { PathMinEffortVisualizer } from '../path-min-effort-renderer';
import {
  PathMinEffortStep,
  buildPathMinEffort064Steps,
} from './path-min-effort-064-step-compiler';

export type { PathMinEffortStep };
export { buildPathMinEffort064Steps };

export const pathMinEffort064Visualizer = PathMinEffortVisualizer;
