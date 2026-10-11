/**
 * 每日温度可视化器（单调栈）— 声明式 4-Card 标准架构
 * LeetCode 739：单调递增栈（栈头到栈底），遇到更高温度持续出栈并计算跨度 i - st.top()
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import {
  DAILY_TEMPERATURES_PROBLEM_HTML,
  DAILY_TEMPERATURES_ANALYSIS_HTML,
  DAILY_TEMPERATURES_CODE_LANGUAGES,
} from './daily-temperatures-problem-content';
import {
  buildDailyTemperaturesSteps,
  withMetrics,
  type DailyTempStep,
} from './daily-temperatures-step-compiler';
import { renderDailyTemperaturesCanvas } from './daily-temperatures-canvas-adapter';

export {
  buildDailyTemperaturesSteps,
  withMetrics,
  renderDailyTemperaturesCanvas,
  type DailyTempStep,
};

registerDeclarativeAlgorithm({
  id: 'daily-temperatures',
  name: '每日温度',
  category: 'monotonic-stack',
  description: '单调递增栈（栈头到栈底），遇到更高温度持续出栈计算右侧首个更大元素的跨度',
  icon: '🌡️',
  difficulty: 2,
  levelOrder: 1,
  learningGoal: '掌握单调栈核心原理，理解栈内维护下标以及遇大元素循环出栈结算天数差的经典模式',
  inputs: [
    {
      id: 'temperatures',
      label: '每日温度',
      type: 'text',
      defaultValue: '73,74,75,71,69,72,76,73',
      placeholder: '逗号分隔温度值',
    },
  ],
  presets: [
    { label: '示例 1 (8天)', values: { temperatures: '73,74,75,71,69,72,76,73' } },
    { label: '单调递增', values: { temperatures: '30,40,50,60' } },
    { label: '波谷反弹', values: { temperatures: '89,62,70,58,47,76,100' } },
  ],
  metrics: [
    { id: 'cur-day', label: '当前考察日', color: '#ea580c' },
    { id: 'stack-top', label: '栈顶日', color: '#d97706' },
    { id: 'resolved', label: '已结算天数', color: '#10b981' },
    { id: 'result', label: '等待数组', color: '#059669' },
    { id: 'action', label: '操作决策', color: '#2563eb' },
  ],
  legend: [
    { label: '📍 当前考察日', color: '#ea580c' },
    { label: '🥞 栈内待破纪录', color: '#fbbf24' },
    { label: '✓ 已结算等待天数', color: '#10b981' },
  ],
  codeLanguages: DAILY_TEMPERATURES_CODE_LANGUAGES,
  problemHtml: DAILY_TEMPERATURES_PROBLEM_HTML,
  analysisHtml: DAILY_TEMPERATURES_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const rawTemps = parseNumberList(inputs.temperatures, '73,74,75,71,69,72,76,73');
    return withMetrics(buildDailyTemperaturesSteps(rawTemps.length ? rawTemps : [73, 74, 75, 71, 69, 72, 76, 73]));
  },
  renderCanvas: (container, step) => renderDailyTemperaturesCanvas(container, step as DailyTempStep),
});
