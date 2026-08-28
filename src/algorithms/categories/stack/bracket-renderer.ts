/**
 * 括号匹配可视化器
 * 支持代码联动高亮演示
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './bracket.html?raw';

export interface BracketStep {
  step: number;
  description: string;
  stack: string[];
  currentChar: string;
  currentIndex: number;
  isValid: boolean;
  action: 'push' | 'pop' | 'check' | 'complete';
  /** 同时作为基类 StepBase.message */
  message: string;
  codeLine: number;
}

export interface BracketResult {
  steps: BracketStep[];
  isValid: boolean;
  reason: string;
}

/**
 * 纯 JavaScript 实现的括号匹配算法
 * 生成每一步的可视化数据，并绑定代码行号
 */
export function bracketMatchingSteps(input: string): BracketResult {
  const steps: BracketStep[] = [];
  const stack: string[] = [];
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  const openBrackets = new Set(['(', '[', '{']);

  let isValid = true;
  let reason = '';

  const pushStep = (partial: Omit<BracketStep, 'step' | 'message'>) => {
    steps.push({ step: steps.length + 1, message: partial.description, ...partial });
  };

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (openBrackets.has(char)) {
      // 开括号：入栈
      stack.push(char);
      pushStep({
        description: `遇到开括号 '${char}'，入栈`,
        stack: [...stack],
        currentChar: char,
        currentIndex: i + 1,
        isValid: true,
        action: 'push',
        codeLine: 11, // stack.push(c)
      });
    } else if (pairs[char]) {
      // 闭括号：检查匹配
      if (stack.length === 0) {
        isValid = false;
        reason = `位置 ${i + 1}: 栈为空，无法匹配 '${char}'`;
        pushStep({
          description: reason,
          stack: [...stack],
          currentChar: char,
          currentIndex: i + 1,
          isValid: false,
          action: 'check',
          codeLine: 14, // if (stack.length === 0) return false
        });
        break;
      }

      const top = stack.pop()!;
      if (top !== pairs[char]) {
        isValid = false;
        reason = `位置 ${i + 1}: '${top}' 与 '${char}' 不匹配`;
        pushStep({
          description: reason,
          stack: [...stack],
          currentChar: char,
          currentIndex: i + 1,
          isValid: false,
          action: 'pop',
          codeLine: 17, // const top = stack.pop()
        });
        break;
      }

      pushStep({
        description: `闭括号 '${char}' 与栈顶 '${top}' 匹配，出栈`,
        stack: [...stack],
        currentChar: char,
        currentIndex: i + 1,
        isValid: true,
        action: 'pop',
        codeLine: 17, // const top = stack.pop()
      });
    }
  }

  // 最终检查
  if (isValid && stack.length > 0) {
    isValid = false;
    reason = `栈中还有 ${stack.length} 个未匹配的开括号`;
  }

  pushStep({
    description: isValid ? '✓ 括号匹配有效' : `✗ ${reason || '括号匹配无效'}`,
    stack: [...stack],
    currentChar: '',
    currentIndex: input.length,
    isValid,
    action: 'complete',
    codeLine: 25, // return stack.length === 0
  });

  return { steps, isValid, reason };
}

export class BracketVisualizer extends StepVisualizer<BracketStep> {
  protected codeLines = [
    'public boolean isValid(String s) {',
    '    // 初始化栈',
    '    Deque<Character> stack = new ArrayDeque<>();',
    '    ',
    '    // 遍历每个字符',
    '    for (int i = 0; i < s.length(); i++) {',
    '        char c = s.charAt(i);',
    '        ',
    '        // 开括号入栈',
    '        if (c == \'(\' || c == \'[\' || c == \'{\') {',
    '            stack.push(c);',
    '        } else {',
    '            // 栈空则无效',
    '            if (stack.isEmpty()) return false;',
    '            ',
    '            // 检查匹配',
    '            char top = stack.pop();',
    '            if (c == \')\' && top != \'(\') return false;',
    '            if (c == \']\' && top != \'[\') return false;',
    '            if (c == \'}\' && top != \'{\') return false;',
    '        }',
    '    }',
    '    ',
    '    // 栈必须为空',
    '    return stack.isEmpty();',
    '}',
  ];
  protected codePanelTitle = '括号匹配代码 (Java)';

  private inputField: HTMLInputElement | null = null;
  private stringDisplay: HTMLElement | null = null;
  private stackContainer: HTMLElement | null = null;
  private stateChar: HTMLElement | null = null;
  private stateIndex: HTMLElement | null = null;
  private stateTop: HTMLElement | null = null;
  private stateValid: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputField = this.root.querySelector('#bracket-input');
    this.stringDisplay = this.root.querySelector('#string-display');
    this.stackContainer = this.root.querySelector('#stack-container');
    this.stateChar = this.root.querySelector('#state-char');
    this.stateIndex = this.root.querySelector('#state-index');
    this.stateTop = this.root.querySelector('#state-top');
    this.stateValid = this.root.querySelector('#state-valid');
    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#bracket-start')?.addEventListener('click', () => this.start());
  }

  protected buildSteps(): BracketStep[] {
    const input = this.inputField?.value.trim() || '()[]{}';
    return bracketMatchingSteps(input).steps;
  }

  protected renderStep(step: BracketStep): void {
    this.renderString(step);
    this.renderStack(step);
    this.updateStatePanel(step);
  }

  private renderString(step: BracketStep): void {
    if (!this.inputField || !this.stringDisplay) return;
    const input = this.inputField.value;
    this.stringDisplay.innerHTML = '';

    for (let i = 0; i < input.length; i++) {
      const charBox = document.createElement('div');
      charBox.className = 'char-box';
      charBox.textContent = input[i];

      if (i === step.currentIndex - 1) {
        charBox.classList.add('current');
      } else if (i < step.currentIndex - 1) {
        charBox.classList.add('processed');
      }

      this.stringDisplay.appendChild(charBox);
    }
  }

  private renderStack(step: BracketStep): void {
    if (!this.stackContainer) return;
    this.stackContainer.innerHTML = '';

    step.stack.forEach((char) => {
      const stackItem = document.createElement('div');
      stackItem.className = 'stack-item';
      stackItem.textContent = char;
      this.stackContainer!.appendChild(stackItem);
    });
  }

  private updateStatePanel(step: BracketStep): void {
    if (this.stateChar) this.stateChar.textContent = step.currentChar || '-';
    if (this.stateIndex) this.stateIndex.textContent = step.currentIndex.toString();
    if (this.stateTop) {
      const top = step.stack.length > 0 ? step.stack[step.stack.length - 1] : 'Empty';
      this.stateTop.textContent = top;
    }
    if (this.stateValid) {
      this.stateValid.textContent = step.isValid ? 'True' : 'False';
      this.stateValid.className = 'state-value ' + (step.isValid ? 'highlight' : 'text-red-500');
    }
  }
}

registerAlgorithm({
  id: 'bracket',
  name: '括号匹配',
  viewId: 'algo-bracket-view',
  category: 'stack',
  description: '使用栈验证括号字符串的有效性',
  icon: '📚',
  template,
  Visualizer: BracketVisualizer,
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握用栈匹配括号对的基础模型',
});
