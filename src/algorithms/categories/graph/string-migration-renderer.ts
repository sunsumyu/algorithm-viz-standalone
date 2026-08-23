/**
 * 字符串迁移 - Cyclic Shift Check
 * 判断 str2 是否是 str1 的循环移位
 * 使用拼接+子串检查法
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './string-migration.html?raw';

interface SCStep {
  str1: string;
  str2: string;
  concat: string;
  windowStart: number;
  windowEnd: number;
  shift: number;
  matched: boolean;
  matchPos: number | null;
  phase: 'init' | 'length-check' | 'concat' | 'slide' | 'found' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

function buildSteps(str1: string, str2: string): SCStep[] {
  const steps: SCStep[] = [];
  const n = str1.length;
  const concat = str1 + str1;

  steps.push({
    str1, str2, concat, windowStart: 0, windowEnd: 0, shift: 0,
    matched: false, matchPos: null, phase: 'init',
    message: `初始化：str1="${str1}" (长度${n})，str2="${str2}" (长度${str2.length})。`,
    log: `初始化: str1="${str1}", str2="${str2}"`,
    codeLine: 0,
  });

  if (n !== str2.length) {
    steps.push({
      str1, str2, concat, windowStart: 0, windowEnd: 0, shift: 0,
      matched: false, matchPos: null, phase: 'length-check',
      message: `长度不等 (${n} vs ${str2.length})，str2 不可能是 str1 的循环移位。`,
      log: `长度不等 → 不可能`,
      codeLine: 1,
    });

    steps.push({
      str1, str2, concat, windowStart: 0, windowEnd: 0, shift: 0,
      matched: false, matchPos: null, phase: 'done',
      message: `结论：str2 不是 str1 的循环移位（长度不同）。`,
      log: `结果: false`,
      codeLine: 8,
    });
    return steps;
  }

  steps.push({
    str1, str2, concat, windowStart: 0, windowEnd: n, shift: 0,
    matched: false, matchPos: null, phase: 'concat',
    message: `拼接 str1+str1 = "${concat}"。在拼接串中滑动长度为 ${n} 的窗口寻找 str2。`,
    log: `拼接: "${concat}"`,
    codeLine: 2,
  });

  // Slide window
  for (let i = 0; i <= n; i++) {
    const windowStr = concat.substring(i, i + n);
    const isMatch = windowStr === str2;

    steps.push({
      str1, str2, concat, windowStart: i, windowEnd: i + n, shift: i,
      matched: isMatch, matchPos: isMatch ? i : null,
      phase: isMatch ? 'found' : 'slide',
      message: `窗口位置 [${i}, ${i + n}): "${windowStr}" ${isMatch ? '=== str2，匹配成功！' : `≠ "${str2}"`}。移位量=${i}。`,
      log: `shift=${i}: "${windowStr}" ${isMatch ? '✓' : '✗'}`,
      codeLine: isMatch ? [4, 5] : [3, 4],
    });

    if (isMatch) {
      steps.push({
        str1, str2, concat, windowStart: i, windowEnd: i + n, shift: i,
        matched: true, matchPos: i, phase: 'done',
        message: `找到匹配！str2 是 str1 左移 ${i} 位的循环移位。拼接串位置 [${i}, ${i + n})。`,
        log: `结果: true, 移位=${i}`,
        codeLine: 6,
      });
      return steps;
    }
  }

  steps.push({
    str1, str2, concat, windowStart: n, windowEnd: 2 * n, shift: n,
    matched: false, matchPos: null, phase: 'done',
    message: `滑动窗口遍历完毕，未找到匹配。str2 不是 str1 的循环移位。`,
    log: `结果: false`,
    codeLine: 7,
  });

  return steps;
}

export class StringMigrationVisualizer extends StepVisualizer<SCStep> {
  protected codeLines = [
    'public boolean isCyclicShift(String str1, String str2) {',
    '    if (str1.length() != str2.length()) return false;',
    '    String concat = str1 + str1;',
    '    int n = str1.length();',
    '    for (int i = 0; i <= n; i++) {',
    '        String window = concat.substring(i, i + n);',
    '        if (window.equals(str2)) return true;',
    '    }',
    '    return false;',
    '}',
  ];
  protected codePanelTitle = '循环移位检测代码 (Java)';

  private str1Input: HTMLInputElement | null = null;
  private str2Input: HTMLInputElement | null = null;
  private displayEl: HTMLElement | null = null;
  private concatEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private shiftEl: HTMLElement | null = null;
  private windowEl: HTMLElement | null = null;
  private matchPosEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.str1Input = this.root.querySelector('#sm-str1-input');
    this.str2Input = this.root.querySelector('#sm-str2-input');
    this.displayEl = this.root.querySelector('#sm-display');
    this.concatEl = this.root.querySelector('#sm-concat');
    this.logEl = this.root.querySelector('#sm-log');
    this.shiftEl = this.root.querySelector('#sm-shift');
    this.windowEl = this.root.querySelector('#sm-window');
    this.matchPosEl = this.root.querySelector('#sm-match-pos');
    this.resultEl = this.root.querySelector('#sm-result');

    const startBtn = this.root.querySelector('#sm-start') as HTMLButtonElement | null;
    if (startBtn) startBtn.onclick = () => this.start();

    this.root.querySelectorAll('.sm-example').forEach((btn) => {
      (btn as HTMLButtonElement).onclick = () => {
        if (this.str1Input) this.str1Input.value = (btn as HTMLElement).dataset.s1 || '';
        if (this.str2Input) this.str2Input.value = (btn as HTMLElement).dataset.s2 || '';
        this.start();
      };
    });

    this.bindPlaybackControls({ speed: 'sm-speed', speedLabel: 'sm-speed-label', message: 'step-message' });
  }

  protected buildSteps(): SCStep[] {
    const s1 = this.str1Input?.value || 'abcde';
    const s2 = this.str2Input?.value || 'cdeab';
    return buildSteps(s1, s2);
  }

  protected renderStep(step: SCStep): void {
    if (this.shiftEl) this.shiftEl.textContent = String(step.shift);
    if (this.windowEl) this.windowEl.textContent = step.phase === 'init' || step.phase === 'length-check' ? '-' : `[${step.windowStart},${step.windowEnd})`;
    if (this.matchPosEl) this.matchPosEl.textContent = step.matchPos !== null ? String(step.matchPos) : '-';
    if (this.resultEl) {
      if (step.phase === 'done') this.resultEl.textContent = step.matched ? 'YES' : 'NO';
      else this.resultEl.textContent = '...';
    }

    this.renderDisplay(step);
    this.renderConcat(step);
    this.renderLogLine(step);
  }

  private renderDisplay(step: SCStep): void {
    if (!this.displayEl) return;
    this.displayEl.innerHTML = '';

    // str1 row
    const row1 = document.createElement('div');
    row1.className = 'sm-string-row';
    const label1 = document.createElement('div');
    label1.className = 'sm-string-label';
    label1.textContent = 'str1';
    row1?.appendChild(label1);

    for (let i = 0; i < step.str1.length; i++) {
      const box = document.createElement('div');
      box.className = 'sm-char-box';
      box.style.background = 'rgba(139,92,246,0.2)';
      box.style.borderColor = 'rgba(139,92,246,0.4)';
      box.style.color = '#c4b5fd';
      box.textContent = step.str1[i];
      row1?.appendChild(box);
    }
    this.displayEl?.appendChild(row1);

    // shift info
    const shiftInfo = document.createElement('div');
    shiftInfo.className = 'sm-shift-info';
    shiftInfo.textContent = step.phase === 'init' ? '准备检测' : step.phase === 'length-check' ? '长度不匹配' : `左移 ${step.shift} 位`;
    this.displayEl?.appendChild(shiftInfo);

    // str2 row
    const row2 = document.createElement('div');
    row2.className = 'sm-string-row';
    const label2 = document.createElement('div');
    label2.className = 'sm-string-label';
    label2.textContent = 'str2';
    row2?.appendChild(label2);

    for (let i = 0; i < step.str2.length; i++) {
      const box = document.createElement('div');
      box.className = 'sm-char-box';
      if (step.matched && step.phase === 'found' || step.phase === 'done' && step.matched) {
        box.classList.add('matched');
      } else {
        box.style.background = 'rgba(244,63,94,0.15)';
        box.style.borderColor = 'rgba(244,63,94,0.3)';
        box.style.color = '#fda4af';
      }
      box.textContent = step.str2[i];
      row2?.appendChild(box);
    }
    this.displayEl?.appendChild(row2);
  }

  private renderConcat(step: SCStep): void {
    if (!this.concatEl) return;
    this.concatEl.innerHTML = '';

    const chars = step.concat.split('');
    chars.forEach((ch, i) => {
      const box = document.createElement('div');
      box.className = 'sm-concat-char';
      if (i >= step.windowStart && i < step.windowEnd && (step.phase === 'slide' || step.phase === 'found')) {
        box.classList.add('window');
      }
      if (step.matched && (step.phase === 'found' || step.phase === 'done') && i >= step.windowStart && i < step.windowEnd) {
        box.classList.add('matched');
      }
      box.textContent = ch;
      this.concatEl?.appendChild(box);
    });
  }

  private renderLogLine(step: SCStep): void {
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
  id: 'string-migration',
  name: '字符串迁移',
  viewId: 'algo-string-migration-view',
  category: 'graph',
  description: '判断字符串能否通过循环移位变换为目标串',
  icon: '🔄',
  template,
  Visualizer: StringMigrationVisualizer,
  difficulty: 2,
  levelOrder: 12,
  learningGoal: '掌握拼接+滑动窗口检测循环移位',
});

export {};
