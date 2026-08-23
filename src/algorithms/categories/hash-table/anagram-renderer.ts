/**
 * 有效的字母异位词可视化器（哈希计数）
 * LeetCode 242
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './anagram.html?raw';

interface AnagramStep {
  s: string;
  t: string;
  counts: number[];        // 长度26
  currentChar: string;     // 当前处理的字符
  currentSource: 's' | 't' | '';
  currentCharIndex: number;
  phase: 'init' | 'count-s' | 'count-t' | 'check' | 'done';
  result: boolean | null;
  message: string;
  log: string;
  codeLine: number | number[];
}

function charIndex(ch: string): number {
  return ch.charCodeAt(0) - 97;
}

function buildAnagramSteps(s: string, t: string): AnagramStep[] {
  const steps: AnagramStep[] = [];
  const counts = new Array(26).fill(0);

  steps.push({
    s, t, counts: [...counts], currentChar: '', currentSource: '', currentCharIndex: -1, phase: 'init', result: null,
    message: `创建长度 26 的计数数组（全 0）。先统计 s 各字母频次，再用 t 抵消。`,
    log: '初始化计数数组。',
    codeLine: [1, 2],
  });

  // 统计 s
  for (let i = 0; i < s.length; i++) {
    const idx = charIndex(s[i]);
    counts[idx]++;
    steps.push({
      s, t, counts: [...counts], currentChar: s[i], currentSource: 's', currentCharIndex: i, phase: 'count-s', result: null,
      message: `s[${i}]='${s[i]}'，count['${s[i]}']++ → ${counts[idx]}。`,
      log: `s 计数 ${s[i]} -> ${counts[idx]}。`,
      codeLine: [3, 4],
    });
  }

  // 用 t 抵消
  for (let i = 0; i < t.length; i++) {
    const idx = charIndex(t[i]);
    counts[idx]--;
    steps.push({
      s, t, counts: [...counts], currentChar: t[i], currentSource: 't', currentCharIndex: i, phase: 'count-t', result: null,
      message: `t[${i}]='${t[i]}'，count['${t[i]}']-- → ${counts[idx]}。`,
      log: `t 抵消 ${t[i]} -> ${counts[idx]}。`,
      codeLine: [5, 6],
    });
  }

  // 检查
  const allZero = counts.every((c) => c === 0);
  steps.push({
    s, t, counts: [...counts], currentChar: '', currentSource: '', currentCharIndex: -1, phase: 'check', result: allZero,
    message: allZero ? `所有计数都为 0，s 与 t 是字母异位词。` : `存在非零计数，不是字母异位词。`,
    log: allZero ? '全为0，是异位词。' : '存在非零，不是异位词。',
    codeLine: [7, 8],
  });

  steps.push({
    s, t, counts: [...counts], currentChar: '', currentSource: '', currentCharIndex: -1, phase: 'done', result: allZero,
    message: `结束，返回 ${allZero}。`,
    log: `返回 ${allZero}。`,
    codeLine: 9,
  });
  return steps;
}

export class AnagramVisualizer extends StepVisualizer<AnagramStep> {
  protected codeLines = [
    'public boolean isAnagram(String s, String t) {',
    '    if (s.length() != t.length()) return false;',
    '    int[] count = new int[26];',
    '    for (char ch : s.toCharArray()) count[ch - \'a\']++;',
    '    for (char ch : t.toCharArray()) {',
    '        count[ch - \'a\']--;',
    '    }',
    '    for (int c : count)',
    '        if (c != 0) return false;',
    '    return true;',
    '}',
  ];
  protected codePanelTitle = 'Java 字母异位词代码';

  private sInput: HTMLInputElement | null = null;
  private tInput: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private areaEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private curEl: HTMLElement | null = null;
  private phaseEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sInput = this.root.querySelector('#an-s-input');
    this.tInput = this.root.querySelector('#an-t-input');
    this.btnStart = this.root.querySelector('#an-start');
    this.exampleButtons = this.root.querySelectorAll('.an-example-btn');
    this.areaEl = this.root.querySelector('#an-area');
    this.logEl = this.root.querySelector('#an-log');
    this.curEl = this.root.querySelector('#an-cur');
    this.phaseEl = this.root.querySelector('#an-phase');
    this.resultEl = this.root.querySelector('#an-result');
    this.bindPlaybackControls({ message: 'step-message' });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => {
        if (this.sInput) this.sInput.value = btn.dataset.s || '';
        if (this.tInput) this.tInput.value = btn.dataset.t || '';
        this.start();
      };
    });
  }

  protected buildSteps(): AnagramStep[] {
    let s = (this.sInput?.value || 'anagram').toLowerCase().replace(/[^a-z]/g, '').slice(0, 12);
    let t = (this.tInput?.value || 'nagaram').toLowerCase().replace(/[^a-z]/g, '').slice(0, 12);
    if (s.length === 0) s = 'anagram';
    if (t.length === 0) t = 'nagaram';
    if (this.sInput) this.sInput.value = s;
    if (this.tInput) this.tInput.value = t;
    return buildAnagramSteps(s, t);
  }

  protected renderStep(step: AnagramStep): void {
    if (this.curEl) this.curEl.textContent = step.currentChar || '-';
    if (this.phaseEl) this.phaseEl.textContent = this.phaseText(step.phase);
    if (this.resultEl) this.resultEl.textContent = step.result === null ? '-' : (step.result ? '是异位词' : '非异位词');

    if (this.areaEl) {
      this.areaEl.innerHTML = '';
      // s 字符串
      this.areaEl.appendChild(this.makeStringBlock('字符串 s', step.s, step.currentSource === 's' ? step.currentCharIndex : -1));
      // t 字符串
      this.areaEl.appendChild(this.makeStringBlock('字符串 t', step.t, step.currentSource === 't' ? step.currentCharIndex : -1));
      // 计数表（只显示出现过或当前涉及的字母）
      const letters = new Set<string>();
      [...step.s, ...step.t].forEach((ch) => letters.add(ch));
      const sorted = [...letters].sort();
      const tableWrap = document.createElement('div');
      const title = document.createElement('div');
      title.className = 'an-block-title';
      title.textContent = '计数表 count';
      tableWrap.appendChild(title);
      const table = document.createElement('div');
      table.className = 'an-count-table';
      sorted.forEach((ch) => {
        const idx = charIndex(ch);
        const cell = document.createElement('div');
        cell.className = 'an-count-cell';
        if (ch === step.currentChar) cell.classList.add('changed');
        cell.innerHTML = `<div class="ch">${ch}</div><div class="cnt">${step.counts[idx]}</div>`;
        table.appendChild(cell);
      });
      tableWrap.appendChild(table);
      this.areaEl.appendChild(tableWrap);
    }
    this.renderLogLine(step);
  }

  private makeStringBlock(title: string, str: string, currentIndex: number): HTMLElement {
    const wrap = document.createElement('div');
    const t = document.createElement('div');
    t.className = 'an-block-title';
    t.textContent = title;
    wrap.appendChild(t);
    const row = document.createElement('div');
    row.className = 'an-strings';
    if (str.length === 0) {
      row.innerHTML = '<span style="color:#6c7086">（空）</span>';
    } else {
      [...str].forEach((ch, i) => {
        const c = document.createElement('div');
        c.className = 'an-char';
        if (i === currentIndex) c.classList.add('current');
        c.textContent = ch;
        row.appendChild(c);
      });
    }
    wrap.appendChild(row);
    return wrap;
  }

  private phaseText(p: AnagramStep['phase']): string {
    return { init: '初始化', 'count-s': '统计 s', 'count-t': '抵消 t', check: '检查', done: '完成' }[p];
  }

  private renderLogLine(step: AnagramStep): void {
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
  id: 'anagram',
  name: '有效的字母异位词（哈希计数）',
  viewId: 'algo-anagram-view',
  category: 'hash-table',
  description: '长度26数组统计频次判断异位词',
  icon: '🔤',
  template,
  Visualizer: AnagramVisualizer,
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '用字符频次统计判断字母异位词',
});
