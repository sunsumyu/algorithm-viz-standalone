/**
 * 用队列实现栈（队列翻转）可视化器
 * LeetCode 225 - 每次 push 后翻转保持栈序
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './implement-stack-using-queue.html?raw';

interface MSStep {
  queue: number[];
  results: number[];
  opIndex: number;
  op: string;
  opValue: number | null;
  rotateIndex: number;
  status: 'init' | 'push' | 'rotate' | 'rotate-done' | 'pop' | 'top' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

interface MSResult {
  steps: MSStep[];
  results: number[];
}

interface ParsedOp {
  type: 'push' | 'pop' | 'top' | 'empty';
  value: number | null;
}

/**
 * 解析用户输入的操作序列
 * 例如: "push 1,push 2,pop,top,push 3,pop"
 */
function parseOperations(input: string): ParsedOp[] {
  return input
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => {
      const [type, val] = s.split(/\s+/);
      const t = type.toLowerCase();
      if (t === 'push') return { type: 'push' as const, value: parseInt(val, 10) };
      if (t === 'pop') return { type: 'pop' as const, value: null };
      if (t === 'top') return { type: 'top' as const, value: null };
      if (t === 'empty') return { type: 'empty' as const, value: null };
      return { type: 'top' as const, value: null };
    });
}

/**
 * 纯 JavaScript 实现的队列翻转算法
 * 生成每一步的可视化数据，并绑定代码行号
 */
function myStackSteps(opsInput: string): MSResult {
  const steps: MSStep[] = [];
  const ops = parseOperations(opsInput);
  const queue: number[] = [];
  const results: number[] = [];

  const pushStep = (partial: Omit<MSStep, 'log'>) => {
    const log = `[步骤 ${steps.length + 1}] ${partial.message}`;
    steps.push({ log, ...partial });
  };

  pushStep({
    queue: [],
    results: [],
    opIndex: -1,
    op: 'init',
    opValue: null,
    rotateIndex: -1,
    status: 'init',
    message: `准备执行 ${ops.length} 个操作`,
    codeLine: 1,
  });

  for (let i = 0; i < ops.length; i++) {
    const { type, value } = ops[i];

    if (type === 'push') {
      // 初始 push：元素进入队尾
      queue.push(value!);
      pushStep({
        queue: [...queue],
        results: [...results],
        opIndex: i,
        op: 'push',
        opValue: value,
        rotateIndex: -1,
        status: 'push',
        message: `push(${value})：入队到队尾，当前队列长度 ${queue.length}`,
        codeLine: 5,
      });

      if (queue.length > 1) {
        const rotateCount = queue.length - 1;
        for (let j = 0; j < rotateCount; j++) {
          queue.push(queue.shift()!);
          pushStep({
            queue: [...queue],
            results: [...results],
            opIndex: i,
            op: 'push',
            opValue: value,
            rotateIndex: j,
            status: 'rotate',
            message: `翻转 ${j + 1}/${rotateCount}：队首出队并到队尾`,
            codeLine: [8, 9, 10],
          });
        }
        pushStep({
          queue: [...queue],
          results: [...results],
          opIndex: i,
          op: 'push',
          opValue: value,
          rotateIndex: rotateCount,
          status: 'rotate-done',
          message: `翻转完成，${value} 已位于队首（栈顶）`,
          codeLine: 11,
        });
      }
    } else if (type === 'pop') {
      if (queue.length === 0) {
        pushStep({
          queue: [...queue],
          results: [...results],
          opIndex: i,
          op: 'pop',
          opValue: null,
          rotateIndex: -1,
          status: 'pop',
          message: 'pop：队列为空，无法弹出',
          codeLine: 13,
        });
      } else {
        const topVal = queue[0];
        pushStep({
          queue: [...queue],
          results: [...results],
          opIndex: i,
          op: 'pop',
          opValue: topVal,
          rotateIndex: -1,
          status: 'pop',
          message: `pop：移除队首（栈顶）元素 ${topVal}`,
          codeLine: [13, 14],
        });
        queue.shift();
        results.push(topVal);
        pushStep({
          queue: [...queue],
          results: [...results],
          opIndex: i,
          op: 'pop',
          opValue: topVal,
          rotateIndex: -1,
          status: 'pop',
          message: `pop 完成：${topVal} 已弹出`,
          codeLine: 14,
        });
      }
    } else if (type === 'top') {
      if (queue.length === 0) {
        pushStep({
          queue: [...queue],
          results: [...results],
          opIndex: i,
          op: 'top',
          opValue: null,
          rotateIndex: -1,
          status: 'top',
          message: 'top：队列为空，无栈顶元素',
          codeLine: 16,
        });
      } else {
        const topVal = queue[0];
        results.push(topVal);
        pushStep({
          queue: [...queue],
          results: [...results],
          opIndex: i,
          op: 'top',
          opValue: topVal,
          rotateIndex: -1,
          status: 'top',
          message: `top：队首（栈顶）元素为 ${topVal}`,
          codeLine: [16, 17],
        });
      }
    } else if (type === 'empty') {
      const isEmpty = queue.length === 0;
      pushStep({
        queue: [...queue],
        results: [...results],
        opIndex: i,
        op: 'empty',
        opValue: null,
        rotateIndex: -1,
        status: 'top',
        message: `empty：队列${isEmpty ? '为空' : '不为空'}，返回 ${isEmpty}`,
        codeLine: 19,
      });
    }
  }

  const resultsStr = results.length > 0 ? results.join(', ') : '无';
  pushStep({
    queue: [...queue],
    results: [...results],
    opIndex: ops.length,
    op: 'done',
    opValue: null,
    rotateIndex: -1,
    status: 'done',
    message: `执行完成！输出序列：[${resultsStr}]`,
    codeLine: 21,
  });

  return { steps, results };
}

export class MyStackVisualizer extends StepVisualizer<MSStep> {
  protected codeLines = [
    'class MyStack {',
    '    private Deque<Integer> q = new ArrayDeque<>();',
    '',
    '    public void push(int x) {',
    '        q.offer(x);',
    '        // 翻转：将新元素旋转到队首',
    '        for (int i = 0; i < q.size() - 1; i++) {',
    '            q.offer(q.poll());',
    '        }',
    '    }',
    '',
    '    public int pop() {',
    '        return q.poll();',
    '    }',
    '',
    '    public int top() {',
    '        return q.peek();',
    '    }',
    '',
    '    public boolean empty() {',
    '        return q.isEmpty();',
    '    }',
    '}',
  ];
  protected codePanelTitle = '用队列实现栈代码 (Java)';

  private inputField: HTMLInputElement | null = null;
  private queueDisplay: HTMLElement | null = null;
  private stateQueueSize: HTMLElement | null = null;
  private stateOpIndex: HTMLElement | null = null;
  private stateTop: HTMLElement | null = null;
  private stateOp: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputField = this.root.querySelector('#ms-ops-input');
    this.queueDisplay = this.root.querySelector('#ms-queue-display');
    this.stateQueueSize = this.root.querySelector('#ms-state-queue-size');
    this.stateOpIndex = this.root.querySelector('#ms-state-op-index');
    this.stateTop = this.root.querySelector('#ms-state-top');
    this.stateOp = this.root.querySelector('#ms-state-op');

    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#ms-start')?.addEventListener('click', () => this.start());

    // Bind example buttons
    this.root.querySelectorAll<HTMLButtonElement>('.btn-example').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ops = btn.dataset.ops;
        if (ops !== undefined && this.inputField) {
          this.inputField.value = ops;
          this.start();
        }
      });
    });
  }

  protected buildSteps(): MSStep[] {
    const input = this.inputField?.value.trim() || 'push 1,push 2,pop,top,push 3,pop';
    return myStackSteps(input).steps;
  }

  protected renderStep(step: MSStep): void {
    this.renderQueue(step);
    this.updateStatePanel(step);
  }

  private renderQueue(step: MSStep): void {
    if (!this.queueDisplay) return;
    this.queueDisplay.innerHTML = '';

    if (step.queue.length === 0) {
      const emptyLabel = document.createElement('span');
      emptyLabel.className = 'queue-empty';
      emptyLabel.textContent = step.status === 'done' ? '执行完成' : '队列为空';
      this.queueDisplay.appendChild(emptyLabel);
      return;
    }

    step.queue.forEach((val, idx) => {
      const item = document.createElement('div');
      item.className = 'queue-item';
      item.textContent = val.toString();

      // Mark front element as stack top (with pulsing highlight)
      if (idx === 0 && (step.status === 'top' || step.status === 'rotate-done' || step.status === 'done')) {
        item.classList.add('top-element');
      }

      // Rotate animation: the element just moved from front to back
      if (step.status === 'rotate' && idx === step.queue.length - 1) {
        item.classList.add('rotating');
      }

      // Pop animation on the front element
      if (step.status === 'pop' && idx === 0 && step.opValue !== null) {
        item.classList.add('popping');
      }

      this.queueDisplay!.appendChild(item);
    });

    // Show rotation arrow indicator when rotating
    if (step.status === 'rotate' && step.queue.length > 1) {
      const arrow = document.createElement('div');
      arrow.className = 'rotation-arrow';
      arrow.textContent = '↻';
      arrow.style.position = 'absolute';
      arrow.style.bottom = '-1.2rem';
      arrow.style.left = '50%';
      arrow.style.transform = 'translateX(-50%)';
      this.queueDisplay!.appendChild(arrow);
    }
  }

  private updateStatePanel(step: MSStep): void {
    if (this.stateQueueSize) this.stateQueueSize.textContent = step.queue.length.toString();
    if (this.stateOpIndex) {
      this.stateOpIndex.textContent = step.opIndex >= 0 ? (step.opIndex + 1).toString() : '-';
    }
    if (this.stateTop) {
      if (step.queue.length > 0) {
        this.stateTop.textContent = step.queue[0].toString();
        this.stateTop.classList.add('highlight');
      } else {
        this.stateTop.textContent = '-';
        this.stateTop.classList.remove('highlight');
      }
    }
    if (this.stateOp) {
      const opNameMap: Record<string, string> = {
        init: '初始化',
        push: `push(${step.opValue ?? ''})`,
        pop: 'pop',
        top: 'top',
        empty: 'empty',
        done: '完成',
      };
      const opName = step.status === 'rotate' || step.status === 'rotate-done'
        ? `push(${step.opValue ?? ''})·翻转`
        : (opNameMap[step.op] || '-');
      this.stateOp.textContent = opName;
      if (step.status !== 'init' && step.status !== 'done') {
        this.stateOp.classList.add('highlight');
      } else {
        this.stateOp.classList.remove('highlight');
      }
    }
  }
}

registerAlgorithm({
  id: 'my-stack',
  name: '用队列实现栈（队列翻转）',
  viewId: 'algo-my-stack-view',
  category: 'stack',
  description: '用队列模拟栈的 LIFO 行为',
  icon: '🔃',
  template,
  Visualizer: MyStackVisualizer,
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '掌握入队翻转保持栈序的思路',
});

export {};
