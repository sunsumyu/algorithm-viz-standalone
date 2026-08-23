/**
 * 栈与队列理论基础可视化器
 * 演示栈 (LIFO) 和队列 (FIFO) 的核心操作：push/pop、enqueue/dequeue、peek
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './stack-queue-theory.html?raw';

interface SQStep {
  mode: 'stack' | 'queue';
  data: number[];
  action: 'push' | 'pop' | 'enqueue' | 'dequeue' | 'peek';
  value: number | null;
  status: 'init' | 'push' | 'pop' | 'enqueue' | 'dequeue' | 'peek' | 'empty';
  message: string;
  log: string;
  codeLine: number | number[];
}

function buildStackSteps(): SQStep[] {
  const steps: SQStep[] = [];
  const data: number[] = [];

  // Step 0: init
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'push',
    value: null,
    status: 'init',
    message: '初始化空栈。栈为空，准备执行 push 操作。',
    log: '初始化空栈 []。',
    codeLine: 0,
  });

  // push 1
  data.push(1);
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'push',
    value: 1,
    status: 'push',
    message: 'push(1): 将 1 压入栈顶。栈: [1]',
    log: 'push(1) → 栈: [1]',
    codeLine: 1,
  });

  // push 2
  data.push(2);
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'push',
    value: 2,
    status: 'push',
    message: 'push(2): 将 2 压入栈顶。栈: [1, 2]',
    log: 'push(2) → 栈: [1, 2]',
    codeLine: 1,
  });

  // push 3
  data.push(3);
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'push',
    value: 3,
    status: 'push',
    message: 'push(3): 将 3 压入栈顶。栈: [1, 2, 3]',
    log: 'push(3) → 栈: [1, 2, 3]',
    codeLine: 1,
  });

  // peek (top)
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'peek',
    value: 3,
    status: 'peek',
    message: 'top(): 查看栈顶元素为 3，不移除。栈不变: [1, 2, 3]',
    log: 'top() → 返回 3，栈不变',
    codeLine: 3,
  });

  // pop
  const popped1 = data.pop();
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'pop',
    value: popped1!,
    status: 'pop',
    message: `pop(): 弹出栈顶元素 ${popped1}。栈: [1, 2]`,
    log: `pop() → 返回 ${popped1}，栈: [1, 2]`,
    codeLine: 2,
  });

  // pop
  const popped2 = data.pop();
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'pop',
    value: popped2!,
    status: 'pop',
    message: `pop(): 弹出栈顶元素 ${popped2}。栈: [1]`,
    log: `pop() → 返回 ${popped2}，栈: [1]`,
    codeLine: 2,
  });

  return steps;
}

function buildQueueSteps(): SQStep[] {
  const steps: SQStep[] = [];
  const data: number[] = [];

  // Step 0: init
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'enqueue',
    value: null,
    status: 'init',
    message: '初始化空队列。队列为空，准备执行 enqueue 操作。',
    log: '初始化空队列 []。',
    codeLine: 6,
  });

  // enqueue 1
  data.push(1);
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'enqueue',
    value: 1,
    status: 'enqueue',
    message: 'enqueue(1): 将 1 加入队尾。队列: [1]',
    log: 'enqueue(1) → 队列: [1]',
    codeLine: 7,
  });

  // enqueue 2
  data.push(2);
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'enqueue',
    value: 2,
    status: 'enqueue',
    message: 'enqueue(2): 将 2 加入队尾。队列: [1, 2]',
    log: 'enqueue(2) → 队列: [1, 2]',
    codeLine: 7,
  });

  // enqueue 3
  data.push(3);
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'enqueue',
    value: 3,
    status: 'enqueue',
    message: 'enqueue(3): 将 3 加入队尾。队列: [1, 2, 3]',
    log: 'enqueue(3) → 队列: [1, 2, 3]',
    codeLine: 7,
  });

  // peek (front)
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'peek',
    value: 1,
    status: 'peek',
    message: 'front(): 查看队头元素为 1，不移除。队列不变: [1, 2, 3]',
    log: 'front() → 返回 1，队列不变',
    codeLine: 9,
  });

  // dequeue
  const shifted1 = data.shift();
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'dequeue',
    value: shifted1!,
    status: 'dequeue',
    message: `dequeue(): 从队头移除元素 ${shifted1}。队列: [2, 3]`,
    log: `dequeue() → 返回 ${shifted1}，队列: [2, 3]`,
    codeLine: 8,
  });

  // dequeue
  const shifted2 = data.shift();
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'dequeue',
    value: shifted2!,
    status: 'dequeue',
    message: `dequeue(): 从队头移除元素 ${shifted2}。队列: [3]`,
    log: `dequeue() → 返回 ${shifted2}，队列: [3]`,
    codeLine: 8,
  });

  return steps;
}

export class StackQueueTheoryVisualizer extends StepVisualizer<SQStep> {
  protected codeLines = [
    '// Stack (LIFO) - Deque<Integer>',
    'Deque<Integer> stack = new ArrayDeque<>();',
    'stack.push(x);       // O(1)',
    'stack.pop();         // O(1)',
    'stack.peek();        // O(1)',
    'stack.isEmpty();     // O(1)',
    '',
    '// Queue (FIFO) - Deque<Integer>',
    'Deque<Integer> queue = new ArrayDeque<>();',
    'queue.offer(x);      // O(1)',
    'queue.poll();        // O(1)',
    'queue.peek();        // O(1)',
    'queue.isEmpty();     // O(1)',
  ];
  protected codePanelTitle = '栈与队列操作代码 (Java)';

  private mode: 'stack' | 'queue' = 'stack';
  private modeButtons: NodeListOf<HTMLButtonElement> | null = null;
  private trackEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.modeButtons = this.root.querySelectorAll('.sqt-mode-btn');
    this.trackEl = this.root.querySelector('#sqt-track');
    this.logEl = this.root.querySelector('#sqt-log');
    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#sqt-start-demo')?.addEventListener('click', () => this.start());
    this.modeButtons?.forEach((btn) => {
      btn.addEventListener('click', () => {
        const newMode = btn.dataset.mode as 'stack' | 'queue';
        if (newMode && newMode !== this.mode) {
          this.mode = newMode;
          this.modeButtons?.forEach((b) => b.classList.toggle('active', b.dataset.mode === this.mode));
          this.start();
        }
      });
    });
  }

  protected buildSteps(): SQStep[] {
    if (this.mode === 'stack') {
      return buildStackSteps();
    } else {
      return buildQueueSteps();
    }
  }

  protected renderStep(step: SQStep): void {
    if (!this.trackEl) return;
    this.trackEl.innerHTML = '';

    if (step.data.length === 0 && step.status === 'init') {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'sqt-empty-msg';
      emptyMsg.textContent = step.mode === 'stack' ? '栈为空 (empty)' : '队列为空 (empty)';
      this.trackEl.appendChild(emptyMsg);
    } else if (step.mode === 'stack') {
      this.renderStackTrack(step);
    } else {
      this.renderQueueTrack(step);
    }

    this.renderLogLine(step);
  }

  private renderStackTrack(step: SQStep): void {
    if (!this.trackEl) return;
    const container = document.createElement('div');
    container.className = 'sqt-track-stack';

    step.data.forEach((val, idx) => {
      const item = document.createElement('div');
      item.className = 'sqt-t-item';
      if (idx === step.data.length - 1) {
        item.classList.add('sqt-t-top');
        if (step.status === 'push' && step.value === val) {
          item.classList.add('sqt-t-entering');
        }
      }
      item.textContent = String(val);
      container.appendChild(item);
    });

    this.trackEl.appendChild(container);

    // Direction labels
    const labels = document.createElement('div');
    labels.className = 'sqt-direction-labels';
    labels.innerHTML = '<span class="sqt-dir-label">↑ top (栈顶)</span><span class="sqt-dir-label">↓ bottom (栈底)</span>';
    this.trackEl.appendChild(labels);
  }

  private renderQueueTrack(step: SQStep): void {
    if (!this.trackEl) return;
    const container = document.createElement('div');
    container.className = 'sqt-track-queue';

    step.data.forEach((val, idx) => {
      const item = document.createElement('div');
      item.className = 'sqt-t-item';
      if (idx === 0) {
        item.classList.add('sqt-t-front');
      }
      if (step.status === 'enqueue' && step.value === val && idx === step.data.length - 1) {
        item.classList.add('sqt-t-entering');
      }
      item.textContent = String(val);
      container.appendChild(item);
    });

    this.trackEl.appendChild(container);

    // Direction labels
    const labels = document.createElement('div');
    labels.className = 'sqt-direction-labels';
    labels.innerHTML = '<span class="sqt-dir-label">← front (队头)</span><span class="sqt-dir-label">rear → (队尾)</span>';
    this.trackEl.appendChild(labels);
  }

  private renderLogLine(step: SQStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      if (i === this.currentIndex) line.className = 'active';
      let prefix = '';
      switch (s.status) {
        case 'init': prefix = '⚡'; break;
        case 'push': prefix = '📥'; break;
        case 'pop': prefix = '📤'; break;
        case 'enqueue': prefix = '➡️'; break;
        case 'dequeue': prefix = '⬅️'; break;
        case 'peek': prefix = '👁️'; break;
        case 'empty': prefix = '∅'; break;
      }
      line.textContent = `${String(i + 1).padStart(2, '0')}. ${prefix} ${s.log}`;
      this.logEl?.appendChild(line);
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'stack-queue-theory',
  name: '栈与队列理论基础',
  viewId: 'algo-stack-queue-theory-view',
  category: 'stack',
  description: '栈（LIFO）和队列（FIFO）的核心概念与应用',
  icon: '📖',
  template,
  Visualizer: StackQueueTheoryVisualizer,
  difficulty: 1,
  levelOrder: 0,
  learningGoal: '理解栈和队列的原理、操作和应用场景',
});

export {};
