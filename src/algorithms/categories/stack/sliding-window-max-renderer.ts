/**
 * 滑动窗口最大值可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * LeetCode 239：单调队列（队头到队尾单调递减），队头恒为当前窗口最大值，O(1) 读取
 * 遵循 Zero-Subbox 规范，扁平纯净沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  SLIDING_WINDOW_MAX_PROBLEM_HTML,
  SLIDING_WINDOW_MAX_ANALYSIS_HTML,
  SLIDING_WINDOW_MAX_CODE_LANGUAGES,
} from './sliding-window-max-problem-content';
import {
  type SWMStep,
  buildSlidingWindowMaxSteps,
} from './sliding-window-max-step-compiler';
import { renderSlidingWindowMaxCanvas } from './sliding-window-max-canvas-adapter';

export type { SWMStep };
export { buildSlidingWindowMaxSteps, renderSlidingWindowMaxCanvas };

const { template, Visualizer } = createDeclarativeVisualizer<SWMStep>({
  id: 'sliding-window-max',
  name: '滑动窗口最大值',
  category: 'stack',
  icon: '🪟',
  badge: {
    mode: '单调队列·O(n)',
    complexity: 'O(n) · O(k)',
  },
  card1Title: '🪟 数组窗口与单调队列沙盘',
  card2Title: '🧭 窗口指标与最大值序列监视器',
  card2Desc: '当前窗口范围、单调队列递减序列与输出列表',
  legend: [
    { label: '窗口最大值', color: '#10b981' },
    { label: '窗口内元素', color: '#ef4444' },
    { label: '单调队列元素', color: '#f59e0b' },
  ],
  inputs: [
    {
      id: 'input-nums',
      label: '数组 nums',
      type: 'text',
      defaultValue: '1, 3, -1, -3, 5, 3, 6, 7',
      width: '170px',
      placeholder: '以逗号分隔',
    },
    {
      id: 'input-k',
      label: '窗口 k',
      type: 'number',
      defaultValue: 3,
      width: '45px',
    },
  ],
  presets: [
    { label: '经典示例', values: { 'input-nums': '1, 3, -1, -3, 5, 3, 6, 7', 'input-k': 3 } },
    { label: '单调递减', values: { 'input-nums': '9, 8, 7, 6, 5, 4, 3, 2, 1', 'input-k': 3 } },
    { label: '单调递增', values: { 'input-nums': '1, 2, 3, 4, 5, 6, 7, 8', 'input-k': 4 } },
  ],
  metrics: [
    { id: 'window-max', label: '当前窗口最大值', color: '#10b981' },
    { id: 'window-range', label: '窗口范围 [L..R]', color: '#ef4444' },
    { id: 'deque-size', label: '单调队列大小', color: '#f59e0b' },
  ],
  codeLanguages: SLIDING_WINDOW_MAX_CODE_LANGUAGES,
  problemHtml: SLIDING_WINDOW_MAX_PROBLEM_HTML,
  analysisHtml: SLIDING_WINDOW_MAX_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const raw = inputs['input-nums'] || '1, 3, -1, -3, 5, 3, 6, 7';
    const nums = raw.split(/[,，\s]+/).map((s: string) => parseInt(s.trim(), 10)).filter((n: number) => !isNaN(n));
    const k = parseInt(inputs['input-k'] || '3', 10);
    return buildSlidingWindowMaxSteps(nums, k);
  },
  renderCanvas: (container, step) => {
    renderSlidingWindowMaxCanvas(container, step);
  },
});

registerAlgorithm({
  id: 'sliding-window-max',
  name: '滑动窗口最大值',
  viewId: 'algo-sliding-window-max-view',
  category: 'stack',
  description: '单调队列经典应用：维护队头到队尾单调递减，O(1) 获取当前滑动窗口内的最大元素',
  icon: '🪟',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 6,
  learningGoal: '掌握单调队列在滑动窗口最值问题中的精妙设计，理解 push 淘汰较小元素与 pop 仅移出匹配队头的核心准则',
});
