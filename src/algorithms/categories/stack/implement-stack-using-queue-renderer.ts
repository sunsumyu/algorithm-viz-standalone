/**
 * 用队列实现栈可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * LeetCode 225：单队列循环旋转法，push 后将前面 size - 1 个元素出队再入队重新排到队尾，保持队头始终为栈顶
 * 严格遵循 Zero-Subbox 规范，100% 扁平画板，杜绝多层白色卡片嵌套
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  IMPLEMENT_STACK_USING_QUEUE_PROBLEM_HTML,
  IMPLEMENT_STACK_USING_QUEUE_ANALYSIS_HTML,
  IMPLEMENT_STACK_USING_QUEUE_CODE_LANGUAGES,
} from './implement-stack-using-queue-problem-content';
import {
  type MSStep,
  buildImplementStackUsingQueueSteps,
} from './implement-stack-using-queue-step-compiler';
import { renderImplementStackUsingQueueCanvas } from './implement-stack-using-queue-canvas-adapter';

export {
  type MSStep,
  buildImplementStackUsingQueueSteps,
  renderImplementStackUsingQueueCanvas,
};

const { template, Visualizer } = createDeclarativeVisualizer<MSStep>({
  id: 'implement-stack-using-queue',
  name: '用队列实现栈',
  category: 'stack',
  icon: '🥞',
  badge: {
    mode: '单队列自环旋转',
    complexity: 'O(n) · O(n)',
  },
  card1Title: '🥞 队列内部循环旋转与栈顶对齐沙盘',
  card2Title: '📦 栈状态与出栈输出监控',
  card2Desc: '当前操作指令、单队列容量与出栈/栈顶记录序列',
  legend: [
    { label: '🥇 队头 (即栈顶 Top)', color: '#0d9488' },
    { label: '🔄 旋转中元素', color: '#fbbf24' },
    { label: '🚶 队内其它元素', color: '#94a3b8' },
  ],
  inputs: [
    {
      id: 'input-ops',
      label: '操作序列',
      type: 'text',
      defaultValue: 'push 1, push 2, top, pop, empty',
      width: '180px',
      placeholder: 'push 1, push 2, top...',
    },
  ],
  presets: [
    {
      label: '经典示例',
      values: { 'input-ops': 'push 1, push 2, top, pop, empty' },
    },
    {
      label: '三次压栈与连续出栈',
      values: { 'input-ops': 'push 10, push 20, push 30, pop, top, pop' },
    },
  ],
  metrics: [
    { id: 'stack-size', label: '栈内元素总数', color: '#0d9488' },
    { id: 'top-val', label: '当前栈顶 Top', color: '#0f766e' },
    { id: 'rotate-progress', label: '旋转进度', color: '#b45309' },
  ],
  codeLanguages: IMPLEMENT_STACK_USING_QUEUE_CODE_LANGUAGES,
  problemHtml: IMPLEMENT_STACK_USING_QUEUE_PROBLEM_HTML,
  analysisHtml: IMPLEMENT_STACK_USING_QUEUE_ANALYSIS_HTML,
  buildSteps: (inputs) => buildImplementStackUsingQueueSteps(inputs['input-ops']),
  renderCanvas: (container, step) => {
    renderImplementStackUsingQueueCanvas(container, step);
  },
});

registerAlgorithm({
  id: 'implement-stack-using-queue',
  name: '用队列实现栈',
  viewId: 'algo-implement-stack-using-queue-view',
  category: 'stack',
  description: '单队列循环旋转法：push 入队后将前面 size - 1 个元素出队再入队，保持队头为栈顶',
  icon: '🥞',
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 5,
  learningGoal: '掌握单队列通过自环旋转实现 LIFO 栈的精简思想，实现真正的 O(1) Pop 与 Top 查询',
});
