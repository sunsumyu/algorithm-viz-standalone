/**
 * 逆波兰表达式求值可视化器
 * 用栈求解后缀表达式，支持代码联动高亮演示
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './eval-rpn.html?raw';

export interface RPNStep {
  tokens: string[];
  stack: number[];
  i: number;
  token: string;
  status: 'init' | 'push-number' | 'pop-op1' | 'pop-op2' | 'compute' | 'push-result' | 'done';
  operator: string | null;
  op1: number | null;
  op2: number | null;
  result: number | null;
  message: string;
  log: string;
  codeLine: number | number[];
}

/**
 * 生成逆波兰表达式求值的每一步可视化数据
 */
export function evalRPNSteps(tokens: string[]): RPNStep[] {
  const steps: RPNStep[] = [];
  const stack: number[] = [];

  const pushStep = (partial: RPNStep) => {
    steps.push(partial);
  };

  // Initial step
  pushStep({
    tokens,
    stack: [],
    i: -1,
    token: '',
    status: 'init',
    operator: null,
    op1: null,
    op2: null,
    result: null,
    log: '',
    codeLine: 1,
    message: `表达式: [${tokens.join(', ')}]，准备求值`,
  });

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const num = Number(token);

    if (!isNaN(num)) {
      // It's a number: push onto stack
      stack.push(num);
      pushStep({
        tokens,
        stack: [...stack],
        i,
        token,
        status: 'push-number',
        operator: null,
        op1: null,
        op2: null,
        result: null,
        log: `数字 ${num} 入栈`,
        codeLine: 4,
        message: `Token "${token}" 是数字，入栈 → 栈: [${stack.join(', ')}]`,
      });
    } else {
      // It's an operator: pop two operands
      const b = stack.pop()!;
      const a = stack.pop()!;

      // Step: pop op2 (b)
      pushStep({
        tokens,
        stack: [...stack, b],
        i,
        token,
        status: 'pop-op2',
        operator: token,
        op1: null,
        op2: b,
        result: null,
        log: `弹出操作数 b = ${b}`,
        codeLine: 6,
        message: `遇到运算符 "${token}"，弹出第二个操作数 b = ${b}`,
      });

      // Step: pop op1 (a)
      pushStep({
        tokens,
        stack: [...stack],
        i,
        token,
        status: 'pop-op1',
        operator: token,
        op1: a,
        op2: b,
        result: null,
        log: `弹出操作数 a = ${a}`,
        codeLine: 7,
        message: `弹出第一个操作数 a = ${a}`,
      });

      // Compute
      let r = 0;
      const opSymbol =
        token === '+' ? '+' : token === '-' ? '-' : token === '*' ? '×' : '÷';
      if (token === '+') r = a + b;
      else if (token === '-') r = a - b;
      else if (token === '*') r = a * b;
      else if (token === '/') r = Math.trunc(a / b);

      pushStep({
        tokens,
        stack: [...stack],
        i,
        token,
        status: 'compute',
        operator: token,
        op1: a,
        op2: b,
        result: r,
        log: `计算: ${a} ${opSymbol} ${b} = ${r}`,
        codeLine: [9, 10, 11, 12],
        message: `计算: ${a} ${opSymbol} ${b} = ${r}`,
      });

      // Push result
      stack.push(r);
      pushStep({
        tokens,
        stack: [...stack],
        i,
        token,
        status: 'push-result',
        operator: token,
        op1: a,
        op2: b,
        result: r,
        log: `结果 ${r} 入栈`,
        codeLine: 13,
        message: `结果 ${r} 入栈 → 栈: [${stack.join(', ')}]`,
      });
    }
  }

  // Done
  pushStep({
    tokens,
    stack: [stack[0]],
    i: tokens.length,
    token: '',
    status: 'done',
    operator: null,
    op1: null,
    op2: null,
    result: stack[0],
    log: `最终结果: ${stack[0]}`,
    codeLine: 16,
    message: `求值完成，最终结果 = ${stack[0]}`,
  });

  return steps;
}

export class EvalRPNVisualizer extends StepVisualizer<RPNStep> {
  protected codeLines = [
    'public int evalRPN(String[] tokens) {',
    '    // 初始化栈',
    '    Deque<Integer> stack = new ArrayDeque<>();',
    '    for (String token : tokens) {',
    '        if (isNumeric(token)) {',
    '            stack.push(Integer.parseInt(token));',
    '        } else {',
    '            int b = stack.pop();',
    '            int a = stack.pop();',
    '            int r = 0;',
    "            if (token.equals(\"+\")) r = a + b;",
    "            else if (token.equals(\"-\")) r = a - b;",
    "            else if (token.equals(\"*\")) r = a * b;",
    "            else if (token.equals(\"/\")) r = a / b;",
    '            stack.push(r);',
    '        }',
    '    }',
    '    return stack.peek();',
    '}',
  ];
  protected codePanelTitle = '逆波兰表达式求值代码 (Java)';

  private inputField: HTMLInputElement | null = null;
  private tokensDisplay: HTMLElement | null = null;
  private stackContainer: HTMLElement | null = null;
  private computationDisplay: HTMLElement | null = null;
  private stateIndex: HTMLElement | null = null;
  private stateToken: HTMLElement | null = null;
  private stateStackSize: HTMLElement | null = null;
  private stateValue: HTMLElement | null = null;
  private resultBanner: HTMLElement | null = null;
  private logArea: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputField = this.root.querySelector('#rpn-input');
    this.tokensDisplay = this.root.querySelector('#rpn-tokens-display');
    this.stackContainer = this.root.querySelector('#rpn-stack-container');
    this.computationDisplay = this.root.querySelector('#rpn-computation');
    this.stateIndex = this.root.querySelector('#rpn-state-index');
    this.stateToken = this.root.querySelector('#rpn-state-token');
    this.stateStackSize = this.root.querySelector('#rpn-state-stack-size');
    this.stateValue = this.root.querySelector('#rpn-state-value');
    this.resultBanner = this.root.querySelector('#rpn-result');
    this.logArea = this.root.querySelector('#rpn-log');
    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#rpn-start')?.addEventListener('click', () => this.start());
  }

  protected setupEvents(): void {
    this.bindPlaybackControls();
    if (!this.root) return;

    // Bind example buttons
    this.root.querySelectorAll<HTMLButtonElement>('.btn-example').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tokens = btn.dataset.tokens;
        if (tokens && this.inputField) {
          this.inputField.value = tokens;
          this.start();
        }
      });
    });
  }

  protected buildSteps(): RPNStep[] {
    const input = this.inputField?.value.trim() || '2,1,+,3,*';
    const tokens = input
      .split(/[,\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    return evalRPNSteps(tokens);
  }

  protected renderStep(step: RPNStep): void {
    this.renderTokens(step);
    this.renderStack(step);
    this.renderComputation(step);
    this.updateStatePanel(step);
    this.renderLogLine(step);
    this.renderResult(step);
  }

  private renderTokens(step: RPNStep): void {
    if (!this.tokensDisplay) return;
    this.tokensDisplay.innerHTML = '';

    step.tokens.forEach((token, idx) => {
      const box = document.createElement('div');
      box.className = 'token-box';

      const isOperator = isNaN(Number(token));
      box.classList.add(isOperator ? 'token-operator' : 'token-number');
      box.textContent = token;

      if (idx === step.i) {
        box.classList.add(isOperator ? 'current-operator' : 'current');
      } else if (idx < step.i) {
        box.classList.add('processed');
      }

      this.tokensDisplay!.appendChild(box);
    });

    // Pointer below current token
    if (step.i >= 0 && step.i < step.tokens.length) {
      const pointer = document.createElement('div');
      pointer.className = 'token-pointer';
      pointer.textContent = '↑ i=' + step.i;
      this.tokensDisplay!.appendChild(pointer);

      // Position pointer under the current token
      const boxes = this.tokensDisplay!.querySelectorAll('.token-box');
      if (boxes[step.i]) {
        const containerRect = this.tokensDisplay!.getBoundingClientRect();
        const boxRect = boxes[step.i].getBoundingClientRect();
        pointer.style.left = boxRect.left - containerRect.left + boxRect.width / 2 - 15 + 'px';
      }
    }
  }

  private renderStack(step: RPNStep): void {
    if (!this.stackContainer) return;
    this.stackContainer.innerHTML = '';

    // For pop steps, we need to show the stack as it is at that point
    // The step.stack reflects the state AFTER the operation
    // For pop-op2: stack still has b at top (b was popped)
    // For pop-op1: stack has both popped
    // For push-result: stack has result at top

    const displayStack = [...step.stack];

    // For pop operations, show the items being popped visually
    if (step.status === 'pop-op2' && step.op2 !== null) {
      // The stack in pop-op2 step has b still "on top" (before full pop)
      // Actually step.stack for pop-op2 is [...remaining, b]
      displayStack.push(step.op2);
    }

    displayStack.forEach((val, idx) => {
      const item = document.createElement('div');
      item.className = 'stack-item';
      item.textContent = val.toString();

      // Highlight top item during pop operations
      if (step.status === 'pop-op2' && idx === displayStack.length - 1) {
        item.classList.add('popping');
      }

      // Highlight result push
      if (step.status === 'push-result' && idx === displayStack.length - 1) {
        item.classList.add('result-push');
      }

      this.stackContainer!.appendChild(item);
    });
  }

  private renderComputation(step: RPNStep): void {
    if (!this.computationDisplay) return;

    if (step.status === 'compute' && step.op1 !== null && step.op2 !== null && step.result !== null) {
      const opSymbol =
        step.operator === '+' ? '+'
          : step.operator === '-' ? '-'
            : step.operator === '*' ? '×'
              : '÷';

      this.computationDisplay.innerHTML = '';
      this.computationDisplay.classList.add('visible');

      const op1El = document.createElement('span');
      op1El.className = 'comp-num';
      op1El.textContent = step.op1.toString();

      const opEl = document.createElement('span');
      opEl.className = 'comp-op';
      opEl.textContent = opSymbol;

      const op2El = document.createElement('span');
      op2El.className = 'comp-num';
      op2El.textContent = step.op2.toString();

      const eqEl = document.createElement('span');
      eqEl.className = 'comp-eq';
      eqEl.textContent = '=';

      const resEl = document.createElement('span');
      resEl.className = 'comp-result';
      resEl.textContent = step.result.toString();

      this.computationDisplay.appendChild(op1El);
      this.computationDisplay.appendChild(opEl);
      this.computationDisplay.appendChild(op2El);
      this.computationDisplay.appendChild(eqEl);
      this.computationDisplay.appendChild(resEl);
    } else if (step.status === 'push-result') {
      // Keep computation visible during push
      // (already shown from compute step)
    } else {
      this.computationDisplay.classList.remove('visible');
      this.computationDisplay.innerHTML = '';
    }
  }

  private updateStatePanel(step: RPNStep): void {
    if (this.stateIndex) {
      this.stateIndex.textContent = step.i >= 0 ? step.i.toString() : '-';
    }
    if (this.stateToken) {
      this.stateToken.textContent = step.token || '-';
      this.stateToken.className = 'state-value' +
        (step.token && !isNaN(Number(step.token)) ? ' highlight' : '') +
        (step.token && isNaN(Number(step.token)) && step.token !== '' ? ' operator-color' : '');
    }
    if (this.stateStackSize) {
      this.stateStackSize.textContent = step.stack.length.toString();
    }
    if (this.stateValue) {
      if (step.result !== null) {
        this.stateValue.textContent = step.result.toString();
        this.stateValue.className = 'state-value highlight';
      } else if (step.stack.length > 0) {
        this.stateValue.textContent = step.stack[step.stack.length - 1].toString();
        this.stateValue.className = 'state-value';
      } else {
        this.stateValue.textContent = '-';
        this.stateValue.className = 'state-value';
      }
    }
  }

  private renderLogLine(step: RPNStep): void {
    if (!this.logArea) return;
    this.logArea.innerHTML = '';

    // Show all logs from start up to current step
    for (let s = 0; s <= this.currentIndex; s++) {
      const logStep = this.steps[s];
      if (!logStep.log) continue;
      const entry = document.createElement('div');
      entry.className = 'log-entry';
      if (logStep.status === 'push-number' || logStep.status === 'push-result') {
        entry.classList.add('log-push');
      } else if (logStep.status === 'pop-op1' || logStep.status === 'pop-op2') {
        entry.classList.add('log-pop');
      } else if (logStep.status === 'compute') {
        entry.classList.add('log-compute');
      }
      entry.textContent = logStep.log;
      this.logArea.appendChild(entry);
    }

    // Auto-scroll to bottom
    this.logArea.scrollTop = this.logArea.scrollHeight;
  }

  private renderResult(step: RPNStep): void {
    if (!this.resultBanner) return;
    if (step.status === 'done') {
      this.resultBanner.className = 'result-banner success';
      this.resultBanner.textContent = `最终结果: ${step.result}`;
    } else {
      this.resultBanner.className = 'result-banner';
      this.resultBanner.textContent = '等待求值';
    }
  }
}

registerAlgorithm({
  id: 'eval-rpn',
  name: '逆波兰表达式求值',
  viewId: 'algo-eval-rpn-view',
  category: 'stack',
  description: '用栈求解后缀（逆波兰）表达式',
  icon: '🧮',
  template,
  Visualizer: EvalRPNVisualizer,
  difficulty: 2,
  levelOrder: 5,
  learningGoal: '掌握用栈处理后缀表达式的思路',
});

export {};
