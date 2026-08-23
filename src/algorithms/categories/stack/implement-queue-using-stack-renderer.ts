/**
 * 用栈实现队列（双栈转移）可视化器
 * LeetCode 232 · 两个 LIFO 栈组合出 FIFO 队列
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './implement-queue-using-stack.html?raw';

interface MQStep {
  inStack: number[];
  outStack: number[];
  results: number[];
  opIndex: number;
  op: string;
  opValue: number | null;
  transfer: boolean;
  status: 'init' | 'push' | 'pop-check' | 'transfer' | 'pop-result' | 'peek' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

/**
 * 解析操作序列字符串，生成可视化步骤
 */
function myQueueSteps(opsInput: string): MQStep[] {
  const steps: MQStep[] = [];
  const inStack: number[] = [];
  const outStack: number[] = [];
  const results: number[] = [];

  // 解析操作
  const ops = opsInput.split(',').map(s => s.trim()).filter(Boolean);

  // 初始步骤
  steps.push({
    inStack: [],
    outStack: [],
    results: [],
    opIndex: 0,
    op: '-',
    opValue: null,
    transfer: false,
    status: 'init',
    message: '初始化：inStack 和 outStack 均为空',
    log: '初始化队列',
    codeLine: [0, 1],
  });

  for (let i = 0; i < ops.length; i++) {
    const opStr = ops[i];
    const spaceIdx = opStr.indexOf(' ');
    const opName = spaceIdx >= 0 ? opStr.substring(0, spaceIdx) : opStr;
    const opVal = spaceIdx >= 0 ? parseInt(opStr.substring(spaceIdx + 1), 10) : null;

    if (opName === 'push' && opVal !== null && !isNaN(opVal)) {
      // push 操作：直接入 inStack
      inStack.push(opVal);
      steps.push({
        inStack: [...inStack],
        outStack: [...outStack],
        results: [...results],
        opIndex: i + 1,
        op: `push(${opVal})`,
        opValue: opVal,
        transfer: false,
        status: 'push',
        message: `push(${opVal})：将 ${opVal} 压入 inStack`,
        log: `push ${opVal} → inStack`,
        codeLine: 3,
      });
    } else if (opName === 'pop') {
      // pop 操作
      if (outStack.length === 0) {
        // 需要转移
        steps.push({
          inStack: [...inStack],
          outStack: [...outStack],
          results: [...results],
          opIndex: i + 1,
          op: 'pop',
          opValue: null,
          transfer: false,
          status: 'pop-check',
          message: `pop()：outStack 为空，需要转移 inStack 的元素`,
          log: 'pop → outStack 为空',
          codeLine: 6,
        });

        // 逐个转移
        while (inStack.length > 0) {
          const val = inStack.pop()!;
          outStack.push(val);
          steps.push({
            inStack: [...inStack],
            outStack: [...outStack],
            results: [...results],
            opIndex: i + 1,
            op: 'pop',
            opValue: val,
            transfer: true,
            status: 'transfer',
            message: `转移：inStack 弹出 ${val}，压入 outStack`,
            log: `transfer ${val}: inStack → outStack`,
            codeLine: [8, 9],
          });
        }
      }

      // 弹出 outStack 栈顶
      const result = outStack.pop()!;
      results.push(result);
      steps.push({
        inStack: [...inStack],
        outStack: [...outStack],
        results: [...results],
        opIndex: i + 1,
        op: 'pop',
        opValue: result,
        transfer: false,
        status: 'pop-result',
        message: `pop()：从 outStack 弹出 ${result}（队列头部）`,
        log: `pop → ${result}`,
        codeLine: [11, 12],
      });
    } else if (opName === 'peek') {
      // peek 操作
      if (outStack.length === 0) {
        steps.push({
          inStack: [...inStack],
          outStack: [...outStack],
          results: [...results],
          opIndex: i + 1,
          op: 'peek',
          opValue: null,
          transfer: false,
          status: 'pop-check',
          message: `peek()：outStack 为空，需要转移`,
          log: 'peek → outStack 为空',
          codeLine: 15,
        });

        while (inStack.length > 0) {
          const val = inStack.pop()!;
          outStack.push(val);
          steps.push({
            inStack: [...inStack],
            outStack: [...outStack],
            results: [...results],
            opIndex: i + 1,
            op: 'peek',
            opValue: val,
            transfer: true,
            status: 'transfer',
            message: `转移：inStack 弹出 ${val}，压入 outStack`,
            log: `transfer ${val}: inStack → outStack`,
            codeLine: [17, 18],
          });
        }
      }

      const peekVal = outStack[outStack.length - 1];
      steps.push({
        inStack: [...inStack],
        outStack: [...outStack],
        results: [...results],
        opIndex: i + 1,
        op: 'peek',
        opValue: peekVal,
        transfer: false,
        status: 'peek',
        message: `peek()：队列头部元素为 ${peekVal}`,
        log: `peek → ${peekVal}`,
        codeLine: 20,
      });
    } else if (opName === 'empty') {
      const isEmpty = inStack.length === 0 && outStack.length === 0;
      steps.push({
        inStack: [...inStack],
        outStack: [...outStack],
        results: [...results],
        opIndex: i + 1,
        op: 'empty',
        opValue: null,
        transfer: false,
        status: 'done',
        message: `empty()：队列${isEmpty ? '为空' : '不为空'}`,
        log: `empty → ${isEmpty}`,
        codeLine: 22,
      });
    }
  }

  // 最终步骤
  steps.push({
    inStack: [...inStack],
    outStack: [...outStack],
    results: [...results],
    opIndex: ops.length,
    op: '-',
    opValue: null,
    transfer: false,
    status: 'done',
    message: `操作完成！pop 结果序列：[${results.join(', ')}]`,
    log: `完成: [${results.join(', ')}]`,
    codeLine: 23,
  });

  return steps;
}

export class MyQueueVisualizer extends StepVisualizer<MQStep> {
  protected codeLines = [
    'class MyQueue {',
    '    private Deque<Integer> inStack = new ArrayDeque<>();  // push 端',
    '    private Deque<Integer> outStack = new ArrayDeque<>(); // pop/peek 端',
    '',
    '    public void push(int x) {',
    '        inStack.push(x);',
    '    }',
    '',
    '    public int pop() {',
    '        if (outStack.isEmpty()) {',
    '            while (!inStack.isEmpty()) {',
    '                outStack.push(inStack.pop());',
    '            }',
    '        }',
    '        return outStack.pop();',
    '    }',
    '',
    '    public int peek() {',
    '        if (outStack.isEmpty()) {',
    '            while (!inStack.isEmpty()) {',
    '                outStack.push(inStack.pop());',
    '            }',
    '        }',
    '        return outStack.peek();',
    '    }',
    '',
    '    public boolean empty() {',
    '        return inStack.isEmpty() && outStack.isEmpty();',
    '    }',
    '}',
  ];
  protected codePanelTitle = 'MyQueue 代码 (Java)';

  private opsInput: HTMLInputElement | null = null;
  private inStackEl: HTMLElement | null = null;
  private outStackEl: HTMLElement | null = null;
  private transferArrow: HTMLElement | null = null;
  private resultBanner: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private stateIn: HTMLElement | null = null;
  private stateOut: HTMLElement | null = null;
  private stateOpIndex: HTMLElement | null = null;
  private stateOp: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.opsInput = this.root.querySelector('#mq-ops-input');
    this.inStackEl = this.root.querySelector('#mq-in-stack');
    this.outStackEl = this.root.querySelector('#mq-out-stack');
    this.transferArrow = this.root.querySelector('#mq-transfer-arrow');
    this.resultBanner = this.root.querySelector('#mq-result-banner');
    this.logEl = this.root.querySelector('#mq-log');
    this.stateIn = this.root.querySelector('#mq-state-in');
    this.stateOut = this.root.querySelector('#mq-state-out');
    this.stateOpIndex = this.root.querySelector('#mq-state-op-index');
    this.stateOp = this.root.querySelector('#mq-state-op');

    this.bindPlaybackControls({ message: 'step-message' });

    // Start button
    this.root.querySelector('#mq-start')?.addEventListener('click', () => this.start());

    // Example buttons
    this.root.querySelectorAll<HTMLButtonElement>('[data-ops]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.opsInput) {
          this.opsInput.value = btn.dataset.ops || '';
          this.start();
        }
      });
    });
  }

  protected buildSteps(): MQStep[] {
    const input = this.opsInput?.value.trim() || 'push 1,push 2,pop,push 3,pop,pop';
    return myQueueSteps(input);
  }

  protected renderStep(step: MQStep): void {
    this.renderStacks(step);
    this.renderTransferArrow(step);
    this.renderResultBanner(step);
    this.renderLogLine(step);
    this.updateStatePanel(step);
  }

  private renderStacks(step: MQStep): void {
    // Render inStack
    if (this.inStackEl) {
      this.inStackEl.innerHTML = '';
      if (step.inStack.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'stack-empty';
        empty.textContent = '(empty)';
        this.inStackEl.appendChild(empty);
      } else {
        step.inStack.forEach((val, idx) => {
          const item = document.createElement('div');
          item.className = 'stack-item in-item';
          item.textContent = String(val);

          // Animate the top element on push
          if (step.status === 'push' && idx === step.inStack.length - 1) {
            item.classList.add('pushing');
          }

          this.inStackEl!.appendChild(item);
        });
      }
    }

    // Render outStack
    if (this.outStackEl) {
      this.outStackEl.innerHTML = '';
      if (step.outStack.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'stack-empty';
        empty.textContent = '(empty)';
        this.outStackEl.appendChild(empty);
      } else {
        step.outStack.forEach((val, idx) => {
          const item = document.createElement('div');
          item.className = 'stack-item out-item';
          item.textContent = String(val);

          // Animate transfer items
          if (step.transfer && idx === step.outStack.length - 1) {
            item.classList.add('transferring');
          }

          // Animate pop: the top item that was just popped is already removed,
          // so no special animation needed here (it's gone from the array)

          this.outStackEl!.appendChild(item);
        });
      }
    }
  }

  private renderTransferArrow(step: MQStep): void {
    if (!this.transferArrow) return;
    if (step.transfer) {
      this.transferArrow.classList.add('active');
    } else {
      this.transferArrow.classList.remove('active');
    }
  }

  private renderResultBanner(step: MQStep): void {
    if (!this.resultBanner) return;
    if (step.status === 'done' && step.results.length > 0) {
      this.resultBanner.style.display = 'flex';
      this.resultBanner.className = 'result-banner success';
      this.resultBanner.textContent = `Pop 结果序列：[${step.results.join(', ')}]`;
    } else if (step.status === 'pop-result') {
      this.resultBanner.style.display = 'flex';
      this.resultBanner.className = 'result-banner';
      this.resultBanner.textContent = `最近 pop → ${step.opValue}`;
    } else if (step.status === 'peek') {
      this.resultBanner.style.display = 'flex';
      this.resultBanner.className = 'result-banner';
      this.resultBanner.textContent = `peek → ${step.opValue}`;
    } else {
      this.resultBanner.style.display = 'none';
    }
  }

  private renderLogLine(step: MQStep): void {
    if (!this.logEl) return;
    // Show all log entries up to current step
    const allSteps = this.steps;
    const currentIdx = allSteps.indexOf(step);
    const entries = allSteps.slice(0, currentIdx + 1);
    this.logEl.innerHTML = entries
      .map((s, i) => `<div class="log-entry"><span class="log-op">[${i}]</span> ${s.log}</div>`)
      .join('');
    // Auto-scroll to bottom
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  private updateStatePanel(step: MQStep): void {
    if (this.stateIn) this.stateIn.textContent = String(step.inStack.length);
    if (this.stateOut) this.stateOut.textContent = String(step.outStack.length);
    if (this.stateOpIndex) this.stateOpIndex.textContent = String(step.opIndex);
    if (this.stateOp) {
      this.stateOp.textContent = step.op;
      this.stateOp.className = 'state-value' + (step.op !== '-' ? ' highlight' : '');
    }
  }
}

registerAlgorithm({
  id: 'my-queue',
  name: '用栈实现队列（双栈转移）',
  viewId: 'algo-my-queue-view',
  category: 'stack',
  description: '用两个栈模拟队列的 FIFO 行为',
  icon: '🔄',
  template,
  Visualizer: MyQueueVisualizer,
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握用双栈实现队列的转移技巧',
});

export {};
