/**
 * 左程云算法通关课 Class 064: 飞行路线与分层图最短路 (Flight Routes · 洛谷 P4568)
 * 已与通用图论版深度融为单一事实来源 (src/algorithms/categories/graph/layered-dijkstra-renderer.ts)
 * 遵循《双版本长处综合整合》规范，通过 aliases: ['layered-dijkstra-064', 'class064-code04', 'luogu-p4568'] 统合分发
 */

import { LayeredDijkstraVisualizer } from '../layered-dijkstra-renderer';
import {
  LayeredStep,
  buildLayeredDijkstra064Steps,
} from './layered-dijkstra-064-step-compiler';

export type { LayeredStep };
export { buildLayeredDijkstra064Steps };

export const layeredDijkstra064Visualizer = LayeredDijkstraVisualizer;
