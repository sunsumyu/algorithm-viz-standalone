/**
 * Class 052 Code03: 每日温度 (Daily Temperatures / LeetCode 739)
 * 已与通用单调栈版深度融为单一事实来源 (src/algorithms/categories/monotonic-stack/daily-temperatures-renderer.ts)
 * 遵循《双版本长处综合整合》规范，通过 aliases: ['daily-temperatures-052', 'class052-code03', 'leetcode-739'] 统合分发
 */

import { DailyTemperaturesVisualizer } from '../daily-temperatures-renderer';
import {
  buildDailyTemperatures052Steps,
  type DailyTemp052Step,
} from './daily-temperatures-052-step-compiler';
import { renderDailyTemperatures052Canvas } from './daily-temperatures-052-canvas-adapter';

export {
  buildDailyTemperatures052Steps,
  type DailyTemp052Step,
  renderDailyTemperatures052Canvas,
};

export const dailyTemperatures052Visualizer = DailyTemperaturesVisualizer;
