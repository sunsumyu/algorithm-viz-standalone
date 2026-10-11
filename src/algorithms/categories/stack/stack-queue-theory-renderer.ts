/**
 * 栈与队列理论基础可视化器 — 4-Card 标准现代架构
 * 演示栈 (LIFO) 和队列 (FIFO) 的核心受控访问操作
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  STACK_QUEUE_THEORY_PROBLEM_HTML,
  STACK_QUEUE_THEORY_ANALYSIS_HTML,
  STACK_QUEUE_THEORY_CODE_LANGUAGES,
} from './stack-queue-theory-problem-content';
import {
  SQStep,
  buildStackSteps,
  buildQueueSteps,
  withMetrics,
} from './stack-queue-theory-step-compiler';
import { renderStackQueueTheoryCanvas } from './stack-queue-theory-canvas-adapter';

export type { SQStep };
export {
  buildStackSteps,
  buildQueueSteps,
  withMetrics,
  renderStackQueueTheoryCanvas,
};

registerDeclarativeAlgorithm<SQStep>({
  id: 'stack-queue-theory',
  name: '栈与队列理论基础',
  category: 'stack',
  description: '栈 (LIFO) 与队列 (FIFO) 的核心受控访问语义、操作复杂度及 C++/Java 底层实现机制',
  icon: '🥞',
  difficulty: 1,
  levelOrder: 0,
  learningGoal: '透彻理解栈 (后入先出) 与队列 (先入先出) 的核心区别与容器适配器本质',
  modes: [
    { id: 'stack', label: '🥞 栈 (Stack - LIFO)' },
    { id: 'queue', label: '🔄 队列 (Queue - FIFO)' },
  ],
  inputs: [],
  presets: [
    { label: '栈演示 (push 1/2/3 → peek → pop×2)', values: {} },
  ],
  metrics: [
    { id: 'cur-mode', label: '当前模式', color: '#2563eb' },
    { id: 'top-or-front', label: '栈顶 / 队头', color: '#059669' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
    { id: 'size', label: '当前容量', color: '#0f172a' },
  ],
  legend: [
    { label: '栈顶 / 队头', color: '#2563eb' },
    { label: '普通元素', color: '#94a3b8' },
  ],
  codeLanguages: STACK_QUEUE_THEORY_CODE_LANGUAGES,
  problemHtml: STACK_QUEUE_THEORY_PROBLEM_HTML,
  analysisHtml: STACK_QUEUE_THEORY_ANALYSIS_HTML,
  generateSteps: (_inputs, mode) =>
    withMetrics(mode === 'queue' ? buildQueueSteps() : buildStackSteps()),
  renderCanvas: (container, step) => renderStackQueueTheoryCanvas(container, step as SQStep),
});
