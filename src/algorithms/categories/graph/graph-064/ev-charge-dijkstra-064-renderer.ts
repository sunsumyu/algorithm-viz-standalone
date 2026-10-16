/**
 * 左程云算法通关课 Class 064: 电动车游历城市最小费用 (Electric Vehicle Charging · LeetCode LCP 35)
 * 已与通用图论版深度融为单一事实来源 (src/algorithms/categories/graph/ev-charge-dijkstra-renderer.ts)
 * 遵循《双版本长处综合整合》规范，通过 aliases: ['ev-charge-dijkstra-064', 'class064-code05', 'leetcode-lcp-35'] 统合分发
 */

import { EVChargeDijkstraVisualizer } from '../ev-charge-dijkstra-renderer';
import {
  EVStep,
  buildEVCharge064Steps,
} from './ev-charge-dijkstra-064-step-compiler';

export type { EVStep };
export { buildEVCharge064Steps };

export const evChargeDijkstra064Visualizer = EVChargeDijkstraVisualizer;
