/**
 * 删除字符串中的所有相邻重复项可视化器
 * LeetCode 1047 - 用栈消除相邻重复字符
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './remove-adjacent-duplicates.html?raw';

interface RDStep {
  s: string;
  stack: string[];
  i: number;
  removedCount: number;
  status: 'init' | 'push' | 'match' | 'pop' | 'advance' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

interface RDResult {
  steps: RDStep[];
  finalString: string;
}

/**
 * 纯 JavaScript 实现的删除相邻重复项算法
 * 生成每一步的可视化数据，并绑定代码行号
 */
function removeDuplicatesSteps(input: string): RDResult {
  const steps: RDStep[] = [];
  const stack: string[] = [];
  let removedCount = 0;

  const pushStep = (partial: Omit<RDStep, 'log'>) => {
    const log = `[步骤 ${steps.length + 1}] ${partial.message}`;
    steps.push({ log, ...partial });
  };

  pushStep({
    s: input,
    stack: [],
    i: -1,
    removedCount: 0,
    status: 'init',
    message: `开始处理字符串 "${input}"`,
    codeLine: 2,
  });

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    pushStep({
      s: input,
      stack: [...stack],
      i,
      removedCount,
      status: 'advance',
    message: `读取字符 '${ch}' (索引 ${i})`,
    codeLine: 5,
    });

    if (stack.length > 0 && stack[stack.length - 1] === ch) {
      // 匹配：出栈
      const popped = stack.pop()!;
      removedCount += 2;

      pushStep({
        s: input,
        stack: [...stack],
        i,
        removedCount,
        status: 'match',
        message: `字符 '${ch}' 与栈顶 '${popped}' 匹配，准备消除`,
        codeLine: [6, 7],
      });

      pushStep({
        s: input,
        stack: [...stack],
        i,
        removedCount,
        status: 'pop',
        message: `消除成功！'${popped}' 出栈，已消除 ${removedCount} 个字符`,
        codeLine: 8,
      });
    } else {
      // 不匹配：入栈
      stack.push(ch);

      pushStep({
        s: input,
        stack: [...stack],
        i,
        removedCount,
        status: 'push',
        message: `字符 '${ch}' 与栈顶不同，入栈`,
        codeLine: [9, 11],
      });
    }
  }

  const finalString = stack.join('');

  pushStep({
    s: input,
    stack: [...stack],
    i: input.length,
    removedCount,
    status: 'done',
    message: finalString
      ? `处理完成！结果: "${finalString}"`
      : `处理完成！所有字符均已消除，结果为空字符串`,
    codeLine: 16,
  });

  return { steps, finalString };
}

export class RemoveAdjacentDuplicatesVisualizer extends StepVisualizer<RDStep> {
  protected codeLines = [
    'public String removeDuplicates(String s) {',
    '    // 初始化栈',
    '    Deque<Character> stack = new ArrayDeque<>();',
    '    ',
    '    // 遍历每个字符',
    '    for (int i = 0; i < s.length(); i++) {',
    '        char ch = s.charAt(i);',
    '        // 栈顶与当前字符相同则出栈',
    '        if (!stack.isEmpty() && stack.peek() == ch) {',
    '            stack.pop();',
    '        } else {',
    '            // 否则入栈',
    '            stack.push(ch);',
    '        }',
    '    }',
    '    ',
    '    // 栈中剩余字符即为结果',
    '    StringBuilder sb = new StringBuilder();',
    '    while (!stack.isEmpty()) sb.append(stack.pop());',
    '    return sb.reverse().toString();',
    '}',
  ];
  protected codePanelTitle = '删除相邻重复项代码 (Java)';

  private inputField: HTMLInputElement | null = null;
  private stringDisplay: HTMLElement | null = null;
  private stackContainer: HTMLElement | null = null;
  private stateIndex: HTMLElement | null = null;
  private stateChar: HTMLElement | null = null;
  private stateStackSize: HTMLElement | null = null;
  private stateRemoved: HTMLElement | null = null;
  private resultBanner: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputField = this.root.querySelector('#rd-input');
    this.stringDisplay = this.root.querySelector('#rd-string-display');
    this.stackContainer = this.root.querySelector('#rd-stack-container');
    this.stateIndex = this.root.querySelector('#rd-state-index');
    this.stateChar = this.root.querySelector('#rd-state-char');
    this.stateStackSize = this.root.querySelector('#rd-state-stack-size');
    this.stateRemoved = this.root.querySelector('#rd-state-removed');
    this.resultBanner = this.root.querySelector('#rd-result-banner');
    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#rd-start')?.addEventListener('click', () => this.start());

    // Bind example buttons
    this.root.querySelectorAll('.btn-example').forEach((btn) => {
      btn.addEventListener('click', () => {
        const s = (btn as HTMLElement).dataset.s;
        if (s !== undefined && this.inputField) {
          this.inputField.value = s;
          this.start();
        }
      });
    });
  }

  protected buildSteps(): RDStep[] {
    const input = this.inputField?.value.trim() || 'abbaca';
    return removeDuplicatesSteps(input).steps;
  }

  protected renderStep(step: RDStep): void {
    this.renderString(step);
    this.renderStack(step);
    this.updateStatePanel(step);
    this.updateResultBanner(step);
  }

  private renderString(step: RDStep): void {
    if (!this.inputField || !this.stringDisplay) return;
    const input = this.inputField.value;
    this.stringDisplay.innerHTML = '';

    for (let idx = 0; idx < input.length; idx++) {
      const charBox = document.createElement('div');
      charBox.className = 'char-box';
      charBox.textContent = input[idx];

      // Add index label below
      const idxLabel = document.createElement('span');
      idxLabel.className = 'char-index';
      idxLabel.textContent = idx.toString();
      charBox.appendChild(idxLabel);

      if (step.status === 'done' && input.length > 0) {
        // All processed in done state
        charBox.classList.add('processed');
      } else if (idx === step.i) {
        if (step.status === 'match' || step.status === 'pop') {
          charBox.classList.add('match');
        } else {
          charBox.classList.add('current');
        }
      } else if (idx < step.i && step.i >= 0) {
        charBox.classList.add('processed');
      }

      // Pointer arrow on current index
      if (idx === step.i && step.status !== 'done') {
        charBox.classList.add('pointer');
      }

      this.stringDisplay.appendChild(charBox);
    }
  }

  private renderStack(step: RDStep): void {
    if (!this.stackContainer) return;
    this.stackContainer.innerHTML = '';

    if (step.stack.length === 0) {
      const emptyLabel = document.createElement('span');
      emptyLabel.className = 'stack-empty';
      emptyLabel.textContent = step.status === 'done' ? '栈为空（结果为空字符串）' : '栈为空';
      this.stackContainer.appendChild(emptyLabel);
      return;
    }

    step.stack.forEach((char, idx) => {
      const stackItem = document.createElement('div');
      stackItem.className = 'stack-item';

      // Highlight the top element (last in array) when comparing
      if (idx === step.stack.length - 1 && (step.status === 'match' || step.status === 'pop')) {
        stackItem.classList.add('comparing');
      }

      // Pop animation for the top element during pop status
      if (idx === step.stack.length - 1 && step.status === 'pop') {
        stackItem.classList.add('popping');
      }

      stackItem.textContent = char;
      this.stackContainer!.appendChild(stackItem);
    });
  }

  private updateStatePanel(step: RDStep): void {
    if (this.stateIndex) this.stateIndex.textContent = step.i >= 0 ? step.i.toString() : '-';
    if (this.stateChar) {
      const input = this.inputField?.value || '';
      this.stateChar.textContent = step.i >= 0 && step.i < input.length ? input[step.i] : '-';
    }
    if (this.stateStackSize) this.stateStackSize.textContent = step.stack.length.toString();
    if (this.stateRemoved) {
      this.stateRemoved.textContent = step.removedCount.toString();
      if (step.removedCount > 0) {
        this.stateRemoved.classList.add('highlight');
      } else {
        this.stateRemoved.classList.remove('highlight');
      }
    }
  }

  private updateResultBanner(step: RDStep): void {
    if (!this.resultBanner) return;

    if (step.status === 'done') {
      const finalStr = step.stack.join('');
      this.resultBanner.textContent = finalStr
        ? `最终结果: "${finalStr}"`
        : '最终结果: "" (空字符串)';
      this.resultBanner.className = 'result-banner success';
      this.resultBanner.style.display = 'flex';
    } else {
      this.resultBanner.style.display = 'none';
    }
  }
}

registerAlgorithm({
  id: 'remove-adjacent-duplicates',
  name: '删除字符串中的相邻重复项',
  viewId: 'algo-remove-duplicates-view',
  category: 'stack',
  description: '用栈消除字符串中的相邻重复字符',
  icon: '🧹',
  template,
  Visualizer: RemoveAdjacentDuplicatesVisualizer,
  difficulty: 1,
  levelOrder: 4,
  learningGoal: '掌握用栈处理相邻元素消除问题',
});

export {};
