/**
 * 栈与队列理论基础可视化器 — 4-Card 标准现代架构
 * 演示栈 (LIFO) 和队列 (FIFO) 的核心受控访问操作
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';
import {
  STACK_QUEUE_THEORY_PROBLEM_HTML,
  STACK_QUEUE_THEORY_ANALYSIS_HTML,
  STACK_QUEUE_THEORY_CODE_LANGUAGES,
} from './stack-queue-theory-problem-content';

export interface SQStep {
  mode: 'stack' | 'queue';
  data: number[];
  action: 'init' | 'push' | 'pop' | 'enqueue' | 'dequeue' | 'peek' | 'done';
  value: number | null;
  message: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
  log?: string;
}

export function buildStackSteps(): SQStep[] {
  const steps: SQStep[] = [];
  const data: number[] = [];

  const stackLines = {
    init:     { java: 2, cpp: 2, python: 2, javascript: 2 },
    push1:    { java: 3, cpp: 3, python: 3, javascript: 3 },
    pushNext: { java: 4, cpp: 4, python: 4, javascript: 4 },
    peek:     { java: 5, cpp: 5, python: 5, javascript: 5 },
    pop:      { java: 6, cpp: 6, python: 6, javascript: 6 },
    done:     { java: 6, cpp: 6, python: 6, javascript: 6 },
  };

  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'init',
    value: null,
    message: '初始化空栈：栈为空，仅允许在栈顶一端进行 push 和 pop',
    codeLine: stackLines.init,
  });

  // push 1
  data.push(1);
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'push',
    value: 1,
    message: 'push(1)：将元素 1 压入栈顶。栈内容: [1]',
    codeLine: stackLines.push1,
  });

  // push 2
  data.push(2);
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'push',
    value: 2,
    message: 'push(2)：将元素 2 压入栈顶。栈内容: [1, 2]',
    codeLine: stackLines.pushNext,
  });

  // push 3
  data.push(3);
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'push',
    value: 3,
    message: 'push(3)：将元素 3 压入栈顶。栈内容: [1, 2, 3]',
    codeLine: stackLines.pushNext,
  });

  // peek
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'peek',
    value: 3,
    message: 'peek()：查看栈顶元素为 3（不改变栈状态）',
    codeLine: stackLines.peek,
  });

  // pop 3
  data.pop();
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'pop',
    value: 3,
    message: 'pop()：弹出栈顶元素 3。后进先出 (LIFO)，栈剩余: [1, 2]',
    codeLine: stackLines.pop,
  });

  // pop 2
  data.pop();
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'pop',
    value: 2,
    message: 'pop()：弹出栈顶元素 2。栈剩余: [1]',
    codeLine: stackLines.pop,
  });

  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'done',
    value: null,
    message: '🎉 栈操作演示完成！完美展示 LIFO (后入先出) 行为',
    codeLine: stackLines.done,
  });

  return steps;
}

export function buildQueueSteps(): SQStep[] {
  const steps: SQStep[] = [];
  const data: number[] = [];

  const queueLines = {
    init:        { java: 9,  cpp: 9,  python: 10, javascript: 9 },
    enqueue1:    { java: 10, cpp: 10, python: 11, javascript: 10 },
    enqueueNext: { java: 11, cpp: 11, python: 12, javascript: 11 },
    peek:        { java: 12, cpp: 12, python: 13, javascript: 12 },
    dequeue:     { java: 13, cpp: 13, python: 14, javascript: 13 },
    done:        { java: 13, cpp: 13, python: 14, javascript: 13 },
  };

  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'init',
    value: null,
    message: '初始化空队列：队列为空，在一端（队尾）入队，另一端（队头）出队',
    codeLine: queueLines.init,
  });

  // offer 10
  data.push(10);
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'enqueue',
    value: 10,
    message: 'offer(10)：元素 10 进入队尾。队列: [10]',
    codeLine: queueLines.enqueue1,
  });

  // offer 20
  data.push(20);
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'enqueue',
    value: 20,
    message: 'offer(20)：元素 20 进入队尾。队列: [10, 20]',
    codeLine: queueLines.enqueueNext,
  });

  // offer 30
  data.push(30);
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'enqueue',
    value: 30,
    message: 'offer(30)：元素 30 进入队尾。队列: [10, 20, 30]',
    codeLine: queueLines.enqueueNext,
  });

  // peek
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'peek',
    value: 10,
    message: 'peek()：查看队头元素为 10（最早进入的元素）',
    codeLine: queueLines.peek,
  });

  // poll 10
  data.shift();
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'dequeue',
    value: 10,
    message: 'poll()：队头元素 10 出队。先进先出 (FIFO)，队列剩余: [20, 30]',
    codeLine: queueLines.dequeue,
  });

  // poll 20
  data.shift();
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'dequeue',
    value: 20,
    message: 'poll()：队头元素 20 出队。队列剩余: [30]',
    codeLine: queueLines.dequeue,
  });

  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'done',
    value: null,
    message: '🎉 队列操作演示完成！完美展示 FIFO (先入先出) 行为',
    codeLine: queueLines.done,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */


/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: SQStep[]): SQStep[] {
  return steps.map((s) => {
    const isStack = s.mode === 'stack';
    const topOrFront = s.data.length > 0 ? (isStack ? s.data[s.data.length - 1] : s.data[0]) : null;

    return {
      ...s,
      log: s.message,
      metrics: {
        'cur-mode': isStack ? '栈 (Stack - LIFO)' : '队列 (Queue - FIFO)',
        'top-or-front': topOrFront !== null ? String(topOrFront) : '（空）',
        action: s.action.toUpperCase(),
        size: String(s.data.length),
      },
    };
  });
}

/** 主视觉：栈 / 队列容器沙盘 */
export function renderStackQueueTheoryCanvas(container: HTMLElement, step: SQStep): void {
  const isStack = step.mode === 'stack';
  const data = step.data;

  const itemsHtml = data
    .map((num, idx) => {
      const isTopOrFront = isStack ? idx === data.length - 1 : idx === 0;
      const isRear = !isStack && idx === data.length - 1;

      let badge = '';
      if (isStack && isTopOrFront) badge = '🥇栈顶Top';
      else if (!isStack && isTopOrFront) badge = '🥇队头Front';
      else if (!isStack && isRear) badge = '队尾Rear';
      else badge = `[${idx}]`;

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <span style="font-size: 8.5px; color: ${isTopOrFront ? '#2563eb' : '#94a3b8'}; font-weight: 700;">
            ${badge}
          </span>
          <div style="min-width: 42px; height: 42px; padding: 0 8px; border-radius: 8px; background: ${isTopOrFront ? '#eff6ff' : '#ffffff'}; border: 2px solid ${isTopOrFront ? '#2563eb' : '#e2e8f0'}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: ${isTopOrFront ? '#1d4ed8' : '#0f172a'}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            ${num}
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 14px; box-sizing: border-box;">
      <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #475569; width: 100%;">
        <span>${isStack ? '🥞 栈容器 (栈底 &rarr; 栈顶Top)' : '🔄 队列容器 (队头Front &rarr; 队尾Rear)'}:</span>
        <span style="color: #059669;">容量: ${data.length} · 操作 O(1)</span>
      </div>
      <div style="display: flex; gap: 8px; overflow-x: auto; padding: 4px 0; min-height: 56px; align-items: center; max-width: 100%;">
        ${data.length > 0 ? itemsHtml : `<span style="font-size: 10.5px; color: #94a3b8;">${isStack ? '空栈 (Empty Stack)' : '空队列 (Empty Queue)'}</span>`}
      </div>
    </div>
  `;
}

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
  generateSteps: (inputs, mode) =>
    withMetrics(mode === 'queue' ? buildQueueSteps() : buildStackSteps()),
  renderCanvas: (container, step) => renderStackQueueTheoryCanvas(container, step as SQStep),
});
