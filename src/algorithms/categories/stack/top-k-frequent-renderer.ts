/**
 * 前 K 个高频元素可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * LeetCode 347：哈希统计频次 + 维护大小为 k 的小顶堆 (Min-Heap)，堆顶淘汰低频元素
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TOP_K_FREQUENT_PROBLEM_HTML,
  TOP_K_FREQUENT_ANALYSIS_HTML,
  TOP_K_FREQUENT_CODE_LANGUAGES,
} from './top-k-frequent-problem-content';
import {
  HeapItem,
  TKFStep,
  buildTopKFrequentSteps,
} from './top-k-frequent-step-compiler';
import { renderTopKFrequentCanvas } from './top-k-frequent-canvas-adapter';

export type { HeapItem, TKFStep };
export { buildTopKFrequentSteps, renderTopKFrequentCanvas };

const { template, Visualizer } = createDeclarativeVisualizer<TKFStep>({
  id: 'top-k-frequent',
  name: '前 K 个高频元素',
  category: 'stack',
  icon: '🏆',
  badge: {
    mode: '哈希计数+小顶堆',
    complexity: 'O(N log K) · O(N)',
  },
  card1Title: '📊 频次统计与小顶堆沙盘',
  card2Title: '🧭 堆维护状态与 Top-K 结果监视器',
  card2Desc: '当前考察项、堆顶最小频次元素与最终输出',
  legend: [
    { label: '小顶堆元素', color: '#10b981' },
    { label: '堆顶最小频次', color: '#ef4444' },
    { label: '哈希统计项', color: '#f59e0b' },
  ],
  inputs: [
    {
      id: 'input-nums',
      label: '输入数组',
      type: 'text',
      defaultValue: '1, 1, 1, 2, 2, 3',
      width: '150px',
      placeholder: '以逗号分隔',
    },
    {
      id: 'input-k',
      label: '前 K 个',
      type: 'number',
      defaultValue: 2,
      width: '45px',
    },
  ],
  presets: [
    { label: '经典示例', values: { 'input-nums': '1, 1, 1, 2, 2, 3', 'input-k': 2 } },
    { label: '单元素多频', values: { 'input-nums': '1', 'input-k': 1 } },
    { label: '复杂多频次', values: { 'input-nums': '4, 1, -1, 2, -1, 2, 3, 2, 3, 3, 3', 'input-k': 2 } },
  ],
  metrics: [
    { id: 'heap-size', label: '小顶堆容量', color: '#10b981' },
    { id: 'unique-count', label: '不同元素数', color: '#f59e0b' },
    { id: 'top-freq-val', label: '堆顶最小频次', color: '#ef4444' },
  ],
  codeLanguages: TOP_K_FREQUENT_CODE_LANGUAGES,
  problemHtml: TOP_K_FREQUENT_PROBLEM_HTML,
  analysisHtml: TOP_K_FREQUENT_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const raw = inputs['input-nums'] || '1, 1, 1, 2, 2, 3';
    const nums = raw.split(/[,，\s]+/).map((s: string) => parseInt(s.trim(), 10)).filter((n: number) => !isNaN(n));
    const k = parseInt(inputs['input-k'] || '2', 10);
    return buildTopKFrequentSteps(nums, k);
  },
  renderCanvas: (container, step) => {
    renderTopKFrequentCanvas(container, step);
  },
});

registerAlgorithm({
  id: 'top-k-frequent',
  aliases: ['347', 'leetcode-347', 'top-k-frequent-elements'],
  name: '前 K 个高频元素',
  viewId: 'algo-top-k-frequent-view',
  category: 'stack',
  hasDeductionTree: true,
  description: '哈希统计频次 + 维护大小为 k 的小顶堆，堆顶淘汰低频元素，最终堆内保留前 K 高频',
  icon: '🏆',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '掌握利用小顶堆维护 Top-K 最优状态的经典算法模式，理解为什么求前 K 大需要用小顶堆',
});
