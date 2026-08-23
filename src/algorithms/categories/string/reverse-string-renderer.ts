/**
 * 反转字符串可视化器（双指针）
 * LeetCode 344
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './reverse-string.html?raw';

interface RSStep {
  chars: string[];
  left: number;
  right: number;
  swapCount: number;
  status: 'init' | 'swap' | 'advance' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

function buildRSSteps(input: string): RSStep[] {
  const steps: RSStep[] = [];
  const chars = [...input];
  let left = 0, right = chars.length - 1, swapCount = 0;

  steps.push({
    chars: [...chars], left, right, swapCount, status: 'init',
    message: `left=0，right=${right}，从两端向中间逼近交换。`,
    log: '初始化双指针。',
    codeLine: [1, 2],
  });

  while (left < right) {
    steps.push({
      chars: [...chars], left, right, swapCount, status: 'swap',
      message: `交换 s[left]='${chars[left]}' 与 s[right]='${chars[right]}'。`,
      log: `交换 '${chars[left]}' <-> '${chars[right]}'。`,
      codeLine: [3, 4],
    });
    [chars[left], chars[right]] = [chars[right], chars[left]];
    swapCount++;
    steps.push({
      chars: [...chars], left, right, swapCount, status: 'advance',
      message: `交换完成，left++ → ${left + 1}，right-- → ${right - 1}。`,
      log: `left -> ${left + 1}, right -> ${right - 1}。`,
      codeLine: [5, 6],
    });
    left++;
    right--;
  }

  steps.push({
    chars: [...chars], left, right, swapCount, status: 'done',
    message: `left >= right，反转完成，结果：${chars.join('')}。`,
    log: `完成，共交换 ${swapCount} 次。`,
    codeLine: 7,
  });
  return steps;
}

export class ReverseStringVisualizer extends StepVisualizer<RSStep> {
  protected codeLines = [
    'public void reverseString(char[] s) {',
    '    int left = 0, right = s.length - 1;',
    '    while (left < right) {',
    '        char tmp = s[left];',
    '        s[left] = s[right];',
    '        s[right] = tmp;',
    '        left++;',
    '        right--;',
    '    }',
    '}',
  ];
  protected codePanelTitle = '反转字符串代码 (Java)';

  private inputEl: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private trackEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private leftEl: HTMLElement | null = null;
  private rightEl: HTMLElement | null = null;
  private swapEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#rs-input');
    this.btnStart = this.root.querySelector('#rs-start');
    this.exampleButtons = this.root.querySelectorAll('.rs-example-btn');
    this.trackEl = this.root.querySelector('#rs-track');
    this.logEl = this.root.querySelector('#rs-log');
    this.leftEl = this.root.querySelector('#rs-left');
    this.rightEl = this.root.querySelector('#rs-right');
    this.swapEl = this.root.querySelector('#rs-swap');
    this.bindPlaybackControls({ message: 'step-message' });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => { if (this.inputEl) this.inputEl.value = btn.dataset.val || 'hello'; this.start(); };
    });
  }

  protected buildSteps(): RSStep[] {
    let s = this.inputEl?.value || 'hello';
    if (s.length === 0) s = 'hello';
    if (this.inputEl) this.inputEl.value = s;
    return buildRSSteps(s);
  }

  protected renderStep(step: RSStep): void {
    if (this.leftEl) this.leftEl.textContent = String(step.left);
    if (this.rightEl) this.rightEl.textContent = String(step.right);
    if (this.swapEl) this.swapEl.textContent = String(step.swapCount);

    if (this.trackEl) {
      this.trackEl.innerHTML = '';
      step.chars.forEach((ch, idx) => {
        const cell = document.createElement('div');
        cell.className = 'rs-cell';
        let ptr = '';
        if (idx === step.left) { cell.classList.add('left'); ptr = '<span class="rs-ptr left">L</span>'; }
        if (idx === step.right) { cell.classList.add('right'); ptr = '<span class="rs-ptr right">R</span>'; }
        if (step.status === 'advance' && (idx === step.left || idx === step.right)) cell.classList.add('swapped');
        cell.innerHTML = `${ptr}<span class="idx">${idx}</span><span class="val">${ch}</span>`;
        this.trackEl?.appendChild(cell);
      });
    }
    this.renderLogLine(step);
  }

  private renderLogLine(step: RSStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      if (i === this.currentIndex) line.className = 'active';
      line.textContent = `${String(i + 1).padStart(2, '0')}. ${s.log}`;
      this.logEl?.appendChild(line);
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'reverse-string',
  name: '反转字符串（双指针）',
  viewId: 'algo-reverse-string-view',
  category: 'string',
  description: '首尾双指针原地反转字符数组',
  icon: '↔️',
  template,
  Visualizer: ReverseStringVisualizer,
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握原地反转字符串的双指针法',
});
