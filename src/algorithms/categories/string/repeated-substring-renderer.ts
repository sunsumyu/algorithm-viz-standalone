/**
 * 重复的子字符串可视化器
 * LeetCode 459
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './repeated-substring.html?raw';

export interface RPSStep {
  s: string;
  patternLen: number;
  patternCount: number;
  attemptIndex: number;
  status: 'init' | 'try-length' | 'check-match' | 'match' | 'mismatch' | 'found' | 'not-found';
  message: string;
  log: string;
  codeLine: number | number[];
  patternStr?: string;
  chunkStart?: number;
  chunkOk?: boolean;
}

export function buildRPSSteps(input: string): RPSStep[] {
  const steps: RPSStep[] = [];
  const n = input.length;

  steps.push({
    s: input,
    patternLen: 0,
    patternCount: 0,
    attemptIndex: 0,
    status: 'init',
    message: `字符串 s="${input}"，长度 n=${n}。开始枚举候选子串长度。`,
    log: `初始化，n=${n}。`,
    codeLine: [1, 2],
  });

  let attemptIndex = 0;

  for (let len = 1; len <= n / 2; len++) {
    attemptIndex++;

    steps.push({
      s: input,
      patternLen: len,
      patternCount: 0,
      attemptIndex,
      status: 'try-length',
      message: `尝试候选长度 len=${len}。`,
      log: `尝试 len=${len}。`,
      codeLine: 3,
    });

    if (n % len !== 0) {
      steps.push({
        s: input,
        patternLen: len,
        patternCount: 0,
        attemptIndex,
        status: 'try-length',
        message: `n=${n} 不能被 len=${len} 整除，跳过此候选长度。`,
        log: `n % len !== 0，跳过 len=${len}。`,
        codeLine: 4,
      });
      continue;
    }

    const patternCount = n / len;
    const pattern = input.substring(0, len);

    steps.push({
      s: input,
      patternLen: len,
      patternCount,
      attemptIndex,
      status: 'try-length',
      message: `n=${n} 可被 len=${len} 整除，提取模式串 pattern="${pattern}"。`,
      log: `提取 pattern="${pattern}"。`,
      codeLine: [5, 6],
      patternStr: pattern,
    });

    let ok = true;
    for (let i = len; i < n; i += len) {
      const chunk = input.substring(i, i + len);
      const matches = chunk === pattern;
      const chunkIdx = (i / len) - 1; // 0-based chunk index after pattern

      steps.push({
        s: input,
        patternLen: len,
        patternCount,
        attemptIndex,
        status: 'check-match',
        message: `比较分块[${i}..${i + len - 1}]="${chunk}" 与模式串 "${pattern}" → ${matches ? '匹配' : '不匹配'}。`,
        log: `  分块[${i}..${i + len - 1}]="${chunk}" ${matches ? '==' : '!='} "${pattern}"。`,
        codeLine: [8, 9, 10],
        patternStr: pattern,
        chunkStart: i,
        chunkOk: matches,
      });

      if (!matches) {
        steps.push({
          s: input,
          patternLen: len,
          patternCount,
          attemptIndex,
          status: 'mismatch',
          message: `分块不匹配，候选长度 len=${len} 失败，尝试下一个长度。`,
          log: `  len=${len} 不成立。`,
          codeLine: [10, 11],
          patternStr: pattern,
          chunkStart: i,
          chunkOk: false,
        });
        ok = false;
        break;
      }

      steps.push({
        s: input,
        patternLen: len,
        patternCount,
        attemptIndex,
        status: 'match',
        message: `分块[${i}..${i + len - 1}] 匹配成功。`,
        log: `  分块 ${chunkIdx + 1} 匹配。`,
        codeLine: [8, 9],
        patternStr: pattern,
        chunkStart: i,
        chunkOk: true,
      });
    }

    if (ok) {
      steps.push({
        s: input,
        patternLen: len,
        patternCount,
        attemptIndex,
        status: 'found',
        message: `所有分块均匹配！字符串可由 "${pattern}" 重复 ${patternCount} 次构成。`,
        log: `✓ 找到！pattern="${pattern}"，重复 ${patternCount} 次。`,
        codeLine: 12,
        patternStr: pattern,
      });
      return steps;
    }
  }

  steps.push({
    s: input,
    patternLen: 0,
    patternCount: 0,
    attemptIndex,
    status: 'not-found',
    message: `所有候选长度均不成立，字符串 "${input}" 不能由重复子串构成。`,
    log: `✗ 未找到重复子串。`,
    codeLine: 14,
  });

  return steps;
}

const CHUNK_COLORS = ['match-0', 'match-1', 'match-2', 'match-3'];

export class RepeatedSubstringVisualizer extends StepVisualizer<RPSStep> {
  protected codeLines = [
    'public boolean repeatedSubstringPattern(String s) {',
    '    int n = s.length();',
    '    for (int len = 1; len <= n / 2; len++) {',
    '        if (n % len != 0) continue;',
    '        String pattern = s.substring(0, len);',
    '        boolean ok = true;',
    '        for (int i = len; i < n; i += len) {',
    '            if (!s.substring(i, i + len).equals(pattern)) {',
    '                ok = false; break;',
    '            }',
    '        }',
    '        if (ok) return true;',
    '    }',
    '    return false;',
    '}',
  ];
  protected codePanelTitle = '重复的子字符串代码 (Java)';

  private inputEl: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private trackEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private patLenEl: HTMLElement | null = null;
  private patCountEl: HTMLElement | null = null;
  private attemptEl: HTMLElement | null = null;
  private foundEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#rps-input');
    this.btnStart = this.root.querySelector('#rps-start');
    this.exampleButtons = this.root.querySelectorAll('.rps-example-btn');
    this.trackEl = this.root.querySelector('#rps-track');
    this.logEl = this.root.querySelector('#rps-log');
    this.patLenEl = this.root.querySelector('#rps-pat-len');
    this.patCountEl = this.root.querySelector('#rps-pat-count');
    this.attemptEl = this.root.querySelector('#rps-attempt');
    this.foundEl = this.root.querySelector('#rps-found');
    this.resultEl = this.root.querySelector('#rps-result');
    this.bindPlaybackControls({ message: 'step-message' });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => {
        const s = btn.dataset.s || 'abab';
        if (this.inputEl) this.inputEl.value = s;
        this.start();
      };
    });
  }

  protected buildSteps(): RPSStep[] {
    let s = this.inputEl?.value || 'abab';
    if (s.length === 0) s = 'abab';
    if (this.inputEl) this.inputEl.value = s;
    return buildRPSSteps(s);
  }

  protected renderStep(step: RPSStep): void {
    if (this.patLenEl) this.patLenEl.textContent = step.patternLen > 0 ? String(step.patternLen) : '-';
    if (this.patCountEl) this.patCountEl.textContent = step.patternCount > 0 ? String(step.patternCount) : '-';
    if (this.attemptEl) this.attemptEl.textContent = step.attemptIndex > 0 ? String(step.attemptIndex) : '-';
    if (this.foundEl) {
      if (step.status === 'found') this.foundEl.textContent = '✓ 是';
      else if (step.status === 'not-found') this.foundEl.textContent = '✗ 否';
      else this.foundEl.textContent = '...';
    }

    if (this.resultEl) {
      this.resultEl.className = 'rps-result';
      this.resultEl.textContent = '';
      if (step.status === 'found') {
        this.resultEl.classList.add('found');
        this.resultEl.textContent = `✓ 字符串可由 "${step.patternStr}" 重复 ${step.patternCount} 次构成`;
      } else if (step.status === 'not-found') {
        this.resultEl.classList.add('not-found');
        this.resultEl.textContent = `✗ 字符串不能由重复子串构成`;
      }
    }

    if (this.trackEl) {
      this.trackEl.innerHTML = '';
      const chars = [...step.s];

      // Row 1: Original string
      const row1 = document.createElement('div');
      row1.className = 'rps-row';
      const label1 = document.createElement('span');
      label1.className = 'rps-row-label';
      label1.textContent = '原字符串';
      row1.appendChild(label1);
      const cells1 = document.createElement('div');
      cells1.className = 'rps-cells';
      chars.forEach((ch, idx) => {
        const cell = document.createElement('div');
        cell.className = 'rps-cell';
        cell.innerHTML = `<span class="idx">${idx}</span><span class="val">${ch}</span>`;
        cells1.appendChild(cell);
      });
      row1.appendChild(cells1);
      this.trackEl.appendChild(row1);

      // Row 2: Pattern / chunk visualization (only when we have a pattern)
      if (step.patternLen > 0 && step.patternStr) {
        const row2 = document.createElement('div');
        row2.className = 'rps-row';
        const label2 = document.createElement('span');
        label2.className = 'rps-row-label';
        const isSkip = step.status === 'try-length' && step.patternCount === 0;
        label2.textContent = isSkip ? '跳过' : `len=${step.patternLen}`;
        row2.appendChild(label2);
        const cells2 = document.createElement('div');
        cells2.className = 'rps-cells';

        const len = step.patternLen;
        const n = step.s.length;
        const currentChunkStart = step.chunkStart;

        for (let i = 0; i < n; i += len) {
          const chunkEnd = Math.min(i + len, n);
          for (let j = i; j < chunkEnd; j++) {
            const cell = document.createElement('div');
            cell.className = 'rps-cell';

            if (isSkip) {
              cell.classList.add('skipped');
            } else if (i === 0) {
              // Pattern section
              cell.classList.add('pattern');
            } else if (currentChunkStart != null && i === currentChunkStart) {
              // Current chunk being compared
              cell.classList.add(step.chunkOk ? 'match-ok' : 'match-bad');
            } else {
              // Other chunks - use alternating colors
              const chunkIdx = i / len;
              const colorIdx = (chunkIdx - 1) % CHUNK_COLORS.length;
              cell.classList.add(CHUNK_COLORS[colorIdx]);
            }

            cell.innerHTML = `<span class="idx">${j}</span><span class="val">${chars[j]}</span>`;
            cells2.appendChild(cell);
          }
        }
        row2.appendChild(cells2);
        this.trackEl.appendChild(row2);
      }

      // Row 3: Show all repetitions when found
      if (step.status === 'found' && step.patternStr) {
        const row3 = document.createElement('div');
        row3.className = 'rps-row';
        const label3 = document.createElement('span');
        label3.className = 'rps-row-label';
        label3.textContent = '重复';
        row3.appendChild(label3);
        const cells3 = document.createElement('div');
        cells3.className = 'rps-cells';

        const len = step.patternLen;
        const n = step.s.length;

        for (let i = 0; i < n; i += len) {
          const chunkEnd = Math.min(i + len, n);
          for (let j = i; j < chunkEnd; j++) {
            const cell = document.createElement('div');
            cell.className = 'rps-cell';
            const chunkIdx = i / len;
            const colorIdx = chunkIdx % CHUNK_COLORS.length;
            cell.classList.add(CHUNK_COLORS[colorIdx]);
            cell.innerHTML = `<span class="idx">${j}</span><span class="val">${chars[j]}</span>`;
            cells3.appendChild(cell);
          }
        }
        row3.appendChild(cells3);
        this.trackEl.appendChild(row3);
      }
    }

    this.renderLogLine(step);
  }

  private renderLogLine(step: RPSStep): void {
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
  id: 'repeated-substring',
  name: '重复的子字符串',
  viewId: 'algo-repeated-substring-view',
  category: 'string',
  description: '判断字符串是否可由重复子串构成',
  icon: '🔁',
  template,
  Visualizer: RepeatedSubstringVisualizer,
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '掌握枚举因子长度 + 分块匹配的方法',
});

export {};
