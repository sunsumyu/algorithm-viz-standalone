/**
 * 左程云算法通关课 Class 064: 网络延迟时间 (Network Delay Time · LeetCode 743)
 * 已与通用图论版深度融为单一事实来源 (src/algorithms/categories/graph/network-delay-time-renderer.ts)
 * 遵循《双版本长处综合整合》规范，通过 aliases: ['network-delay-time-064', 'class064-code01'] 统合分发
 */

import { NetworkDelayTimeVisualizer } from '../network-delay-time-renderer';
import {
  NetworkDelayStep,
  buildNetworkDelay064Steps,
} from './network-delay-time-064-step-compiler';

export type { NetworkDelayStep };
export { buildNetworkDelay064Steps };

export const networkDelayTime064Visualizer = NetworkDelayTimeVisualizer;

