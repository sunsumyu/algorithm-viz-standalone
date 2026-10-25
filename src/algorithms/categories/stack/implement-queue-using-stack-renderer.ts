/**
 * 用栈实现队列可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * LeetCode 232：输入栈 inStack 处理 push，输出栈 outStack 处理 pop/peek，outStack 为空时一次性倾倒转移
 * 严格遵循 Zero-Subbox 规范，100% 扁平画板，杜绝多层白色卡片嵌套
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  IMPLEMENT_QUEUE_USING_STACK_PROBLEM_HTML,
  IMPLEMENT_QUEUE_USING_STACK_ANALYSIS_HTML,
  IMPLEMENT_QUEUE_USING_STACK_CODE_LANGUAGES,
} from './implement-queue-using-stack-problem-content';
import {
  type MQStep,
  buildImplementQueueUsingStackSteps,
} from './implement-queue-using-stack-step-compiler';
import { renderImplementQueueUsingStackCanvas } from './implement-queue-using-stack-canvas-adapter';

export {
  type MQStep,
  buildImplementQueueUsingStackSteps,
  renderImplementQueueUsingStackCanvas,
};

const { template, Visualizer } = createDeclarativeVisualizer<MQStep>({
  id: 'implement-queue-using-stack',
  name: '用栈实现队列',
  category: 'stack',
  icon: '🔄',
  badge: {
    mode: '双栈架构·均摊 O(1)',
    complexity: '均摊 O(1) · O(n)',
  },
  card1Title: '🔄 双栈交互与队列逻辑流沙盘',
  card2Title: '📦 队列状态与指标监控',
  card2Desc: '当前操作指令、双栈元素容量与出队输出记录',
  legend: [
    { label: '📥 输入栈 inStack', color: '#2563eb' },
    { label: '📤 输出栈 outStack', color: '#10b981' },
    { label: '🔀 倾倒倒置流', color: '#f59e0b' },
  ],
  inputs: [
    {
      id: 'input-ops',
      label: '操作序列',
      type: 'text',
      defaultValue: 'push 1, push 2, peek, pop, empty',
      width: '180px',
      placeholder: 'push 1, push 2, peek...',
    },
  ],
  presets: [
    {
      label: '经典示例',
      values: { 'input-ops': 'push 1, push 2, peek, pop, empty' },
    },
    {
      label: '交替出入队',
      values: { 'input-ops': 'push 1, push 2, push 3, pop, push 4, pop, pop, pop' },
    },
    {
      label: '连续窥探',
      values: { 'input-ops': 'push 10, push 20, push 30, peek, pop, peek' },
    },
  ],
  metrics: [
    { id: 'queue-size', label: '队列总元素数', color: '#2563eb' },
    { id: 'in-size', label: 'inStack 大小', color: '#3b82f6' },
    { id: 'out-size', label: 'outStack 大小', color: '#10b981' },
  ],
  codeLanguages: IMPLEMENT_QUEUE_USING_STACK_CODE_LANGUAGES,
  problemHtml: IMPLEMENT_QUEUE_USING_STACK_PROBLEM_HTML,
  analysisHtml: IMPLEMENT_QUEUE_USING_STACK_ANALYSIS_HTML,
  buildSteps: (inputs) => buildImplementQueueUsingStackSteps(inputs['input-ops']),
  renderCanvas: (container, step) => {
    renderImplementQueueUsingStackCanvas(container, step);
  },
});

registerAlgorithm({
  id: 'implement-queue-using-stack',
  aliases: ['queue-using-stacks', 'implement-queue-using-stack-232', 'leetcode-232', '232'],
  name: '用栈实现队列',
  viewId: 'algo-implement-queue-using-stack-view',
  category: 'stack',
  hasDeductionTree: true,
  description: '双栈架构：输入栈 inStack 处理 push，输出栈 outStack 为空时一次性倾倒反转实现 FIFO',
  icon: '🔄',
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 4,
  learningGoal: '掌握双栈组合出 FIFO 队列的精妙架构，理解均摊时间复杂度 O(1) 的倒栈触发准则',
});
