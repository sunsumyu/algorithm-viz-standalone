/**
 * 单调递增的数字可视化器（贪心算法）
 * LeetCode 738
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './monotone-digits.html?raw';

interface MonotoneStep {
  originalDigits: number[];
  currentDigits: number[];
  checkPos: number;
  violationPos: number;
  decreasePos: number;
  nineStart: number;
  phase: 'scan' | 'violation' | 'decrease' | 'set-nine' | 'done';
  message: string;
  codeLine: number;
}

/**
 * 单调递增数字算法，生成可视化步骤
 */
function monotoneDigitsSteps(n: number): MonotoneStep[] {
  const steps: MonotoneStep[] = [];

  if (n < 10) {
    steps.push({
      originalDigits: [n],
      currentDigits: [n],
      checkPos: 0,
      violationPos: -1,
      decreasePos: -1,
      nineStart: -1,
      phase: 'done',
      message: `单位数 ${n} 已经是单调递增`,
      codeLine: 1
    });
    return steps;
  }

  const originalDigits = String(n).split('').map(Number);
  const digits = [...originalDigits];

  // 初始状态
  steps.push({
    originalDigits,
    currentDigits: [...digits],
    checkPos: 0,
    violationPos: -1,
    decreasePos: -1,
    nineStart: -1,
    phase: 'scan',
    message: `开始检查数字 ${n}`,
    codeLine: 2
  });

  // 从右向左扫描，找到违反单调递增的位置
  let marker = digits.length;

  for (let i = digits.length - 1; i > 0; i--) {
    steps.push({
      originalDigits,
      currentDigits: [...digits],
      checkPos: i,
      violationPos: -1,
      decreasePos: -1,
      nineStart: -1,
      phase: 'scan',
      message: `检查位置 ${i-1} 和 ${i}：digits[${i-1}]=${digits[i-1]}, digits[${i}]=${digits[i]}`,
      codeLine: 5
    });

    if (digits[i - 1] > digits[i]) {
      steps.push({
        originalDigits,
        currentDigits: [...digits],
        checkPos: i,
        violationPos: i - 1,
        decreasePos: -1,
        nineStart: -1,
        phase: 'violation',
        message: `发现违反：digits[${i-1}]=${digits[i-1]} > digits[${i}]=${digits[i]}，需要处理`,
        codeLine: 6
      });

      digits[i - 1]--;
      marker = i;

      steps.push({
        originalDigits,
        currentDigits: [...digits],
        checkPos: i,
        violationPos: -1,
        decreasePos: i - 1,
        nineStart: -1,
        phase: 'decrease',
        message: `将 digits[${i-1}] 减 1，变为 ${digits[i- 1]}，标记位置 ${i} 后面置9`,
        codeLine: 7
      });
    }
  }

  // 将标记位置后的所有数字设为9
  if (marker < digits.length) {
    for (let i = marker; i < digits.length; i++) {
      digits[i] = 9;
      steps.push({
        originalDigits,
        currentDigits: [...digits],
        checkPos: -1,
        violationPos: -1,
        decreasePos: -1,
        nineStart: i,
        phase: 'set-nine',
        message: `将位置 ${i} 的数字置为 9`,
        codeLine: 8
      });
    }
  }

  const result = parseInt(digits.join(''), 10);

  steps.push({
    originalDigits,
    currentDigits: [...digits],
    checkPos: -1,
    violationPos: -1,
    decreasePos: -1,
    nineStart: -1,
    phase: 'done',
    message: `完成！最大单调递增数字为 ${result}`,
    codeLine: 10
  });

  return steps;
}

export class MonotoneDigitsVisualizer extends StepVisualizer<MonotoneStep> {
  protected codeLines = [
    "public int monotoneIncreasingDigits(int n) {",
    "    if (n < 10) return n;",
    "    ",
    "    char[] digits = String.valueOf(n).toCharArray();",
    "    int marker = digits.length;",
    "    ",
    "    for (int i = digits.length - 1; i > 0; i--) {",
    "        if (digits[i - 1] > digits[i]) {",
    "            digits[i - 1]--;",
    "            marker = i;",
    "        }",
    "    }",
    "    ",
    "    for (int i = marker; i < digits.length; i++) {",
    "        digits[i] = '9';",
    "    }",
    "    ",
    "    return Integer.parseInt(new String(digits));",
    "}"
  ];
  protected codePanelTitle = '贪心算法 (Java)';

  private inputField: HTMLInputElement | null = null;
  private originalDisplay: HTMLElement | null = null;
  private currentDisplay: HTMLElement | null = null;
  private resultNumber: HTMLElement | null = null;
  private checkPosEl: HTMLElement | null = null;
  private scanStatusEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.inputField = this.root.querySelector('#monotone-input');
    this.originalDisplay = this.root.querySelector('#original-digits');
    this.currentDisplay = this.root.querySelector('#current-digits');
    this.resultNumber = this.root.querySelector('#result-number');
    this.checkPosEl = this.root.querySelector('#check-pos');
    this.scanStatusEl = this.root.querySelector('#scan-status');

    this.bindPlaybackControls({
      reset: 'monotone-reset',
      prev: 'monotone-prev',
      play: 'monotone-play',
      next: 'monotone-next',
      speed: 'monotone-speed',
      speedLabel: 'monotone-speed-label',
      message: 'monotone-status'
    });

    this.root.querySelector('#monotone-start')?.addEventListener('click', () => this.start());
  }

  protected buildSteps(): MonotoneStep[] {
    let n = 332;

    if (this.inputField) {
      const input = this.inputField.value.trim();
      if (input) {
        const parsed = parseInt(input, 10);
        if (!isNaN(parsed) && parsed >= 0) n = parsed;
      }
    }

    return monotoneDigitsSteps(n);
  }

  protected renderStep(step: MonotoneStep): void {
    if (!this.originalDisplay || !this.currentDisplay || !this.resultNumber ||
        !this.checkPosEl || !this.scanStatusEl) return;

    // 更新信息面板
    this.checkPosEl.textContent = step.checkPos >= 0 ? step.checkPos.toString() : '-';
    const phaseText: Record<string, string> = {
      'scan': '扫描中',
      'violation': '发现冲突',
      'decrease': '减位处理',
      'set-nine': '置9',
      'done': '完成'
    };
    this.scanStatusEl.textContent = phaseText[step.phase] || step.phase;

    // 渲染原始数字
    this.renderDigitRow(this.originalDisplay, step.originalDigits, step, true);

    // 渲染当前数字
    this.renderDigitRow(this.currentDisplay, step.currentDigits, step, false);

    // 更新结果
    if (step.phase === 'done') {
      this.resultNumber.textContent = step.currentDigits.join('');
    } else {
      this.resultNumber.textContent = '-';
    }
  }

  private renderDigitRow(container: HTMLElement, digits: number[], step: MonotoneStep, isOriginal: boolean): void {
    // 清空但保留标签
    const label = container.querySelector('.digit-label');
    container.innerHTML = '';
    if (label) container.appendChild(label);
    else {
      const newLabel = document.createElement('span');
      newLabel.className = 'digit-label';
      newLabel.textContent = isOriginal ? '原始:' : '当前:';
      container.appendChild(newLabel);
    }

    digits.forEach((digit, index) => {
      const cell = document.createElement('div');
      cell.className = 'digit-cell';

      if (!isOriginal) {
        if (step.violationPos === index) {
          cell.classList.add('violation');
        } else if (step.decreasePos === index) {
          cell.classList.add('decreased');
        } else if (step.nineStart === index) {
          cell.classList.add('to-nine');
        } else if (step.phase === 'done') {
          cell.classList.add('final');
        }
      }

      if (step.checkPos === index && !isOriginal) {
        cell.classList.add('current');
      }

      const valueEl = document.createElement('span');
      valueEl.className = 'value';
      valueEl.textContent = digit.toString();

      const indexEl = document.createElement('span');
      indexEl.className = 'index';
      indexEl.textContent = `[${index}]`;

      cell.appendChild(valueEl);
      cell.appendChild(indexEl);
      container.appendChild(cell);
    });
  }
}

registerAlgorithm({
  id: 'monotone-digits',
  name: '单调递增的数字',
  viewId: 'algo-monotone-digits-view',
  category: 'greedy',
  description: 'LeetCode 738：贪心算法，找到小于等于 n 的最大单调递增数字',
  icon: '🔢',
  template,
  Visualizer: MonotoneDigitsVisualizer,
  difficulty: 3,
  levelOrder: 17,
  learningGoal: '掌握构造单调递增数字的贪心方法',
});
