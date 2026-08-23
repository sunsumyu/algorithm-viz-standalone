/**
 * 翻转字符串里的单词可视化器（双指针）
 * LeetCode 151
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './reverse-words.html?raw';

interface RWStep {
  raw: string;
  cleanedChars: string[];   // 移除多余空格后的字符数组
  words: string[];          // 提取的单词
  reversedWords: string[];  // 倒序后的单词
  result: string;
  phase: 'init' | 'clean' | 'extract' | 'reverse' | 'done';
  currentCharIndex: number; // clean 阶段当前字符
  currentWordIndex: number; // extract/reverse 阶段当前单词
  message: string;
  log: string;
  codeLine: number | number[];
}

function buildRWSteps(input: string): RWStep[] {
  const steps: RWStep[] = [];

  steps.push({
    raw: input, cleanedChars: [...input], words: [], reversedWords: [], result: '', phase: 'init',
    currentCharIndex: -1, currentWordIndex: -1,
    message: `原始字符串："${input}"。将依次：移除多余空格 → 整体反转 → 逐词反转（这里采用提取单词再倒序拼接的等价做法）。`,
    log: '原始字符串。',
    codeLine: 1,
  });

  // 提取单词（去除多余空格）
  const words: string[] = [];
  const cleaned: string[] = [];
  let i = 0;
  while (i < input.length) {
    if (input[i] === ' ') {
      steps.push({
        raw: input, cleanedChars: [...cleaned, ' '], words: [...words], reversedWords: [], result: '', phase: 'clean',
        currentCharIndex: i, currentWordIndex: -1,
        message: `位置 ${i} 是空格，跳过（去除多余空格）。`,
        log: `跳过空格。`,
        codeLine: [2, 3],
      });
      i++;
      continue;
    }
    let j = i;
    let word = '';
    while (j < input.length && input[j] !== ' ') {
      word += input[j];
      cleaned.push(input[j]);
      j++;
    }
    words.push(word);
    steps.push({
      raw: input, cleanedChars: [...cleaned], words: [...words], reversedWords: [], result: '', phase: 'extract',
      currentCharIndex: i, currentWordIndex: words.length - 1,
      message: `提取单词 "${word}"（第 ${words.length} 个单词）。`,
      log: `提取 "${word}"。`,
      codeLine: [4, 5],
    });
    i = j;
  }

  // 倒序拼接
  const reversed: string[] = [];
  for (let k = words.length - 1; k >= 0; k--) {
    reversed.push(words[k]);
    steps.push({
      raw: input, cleanedChars: [...cleaned], words: [...words], reversedWords: [...reversed], result: reversed.join(' '), phase: 'reverse',
      currentCharIndex: -1, currentWordIndex: k,
      message: `倒序取第 ${words.length - k} 个单词 "${words[k]}"，拼接到结果。`,
      log: `加入 "${words[k]}"。`,
      codeLine: [6, 7],
    });
  }

  steps.push({
    raw: input, cleanedChars: [...cleaned], words: [...words], reversedWords: [...reversed], result: reversed.join(' '), phase: 'done',
    currentCharIndex: -1, currentWordIndex: -1,
    message: `完成，结果："${reversed.join(' ')}"。`,
    log: `返回 "${reversed.join(' ')}"。`,
    codeLine: 8,
  });
  return steps;
}

export class ReverseWordsVisualizer extends StepVisualizer<RWStep> {
  protected codeLines = [
    'public String reverseWords(String s) {',
    '    // 1. 移除多余空格 + 2. 提取单词',
    '    List<String> words = new ArrayList<>();',
    '    int i = 0;',
    '    while (i < s.length()) {',
    '        // 跳过空格，收集单词 (charAt)',
    '    }',
    '    // 3. 倒序拼接',
    '    Collections.reverse(words);',
    '    return String.join(" ", words);',
    '}',
  ];
  protected codePanelTitle = '翻转单词代码 (Java)';

  private inputEl: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private areaEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private phaseEl: HTMLElement | null = null;
  private wordCountEl: HTMLElement | null = null;
  private curWordEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#rw-input');
    this.btnStart = this.root.querySelector('#rw-start');
    this.exampleButtons = this.root.querySelectorAll('.rw-example-btn');
    this.areaEl = this.root.querySelector('#rw-area');
    this.logEl = this.root.querySelector('#rw-log');
    this.phaseEl = this.root.querySelector('#rw-phase');
    this.wordCountEl = this.root.querySelector('#rw-wordcount');
    this.curWordEl = this.root.querySelector('#rw-curword');
    this.bindPlaybackControls({ message: 'step-message' });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => { if (this.inputEl) this.inputEl.value = btn.dataset.val || ''; this.start(); };
    });
  }

  protected buildSteps(): RWStep[] {
    let s = this.inputEl?.value || '  the sky is blue  ';
    if (s.length === 0) s = '  the sky is blue  ';
    if (this.inputEl) this.inputEl.value = s;
    return buildRWSteps(s);
  }

  protected renderStep(step: RWStep): void {
    if (this.phaseEl) this.phaseEl.textContent = this.phaseText(step.phase);
    if (this.wordCountEl) this.wordCountEl.textContent = String(step.words.length);
    if (this.curWordEl) this.curWordEl.textContent = step.currentWordIndex >= 0 ? step.words[step.currentWordIndex] : '-';

    if (this.areaEl) {
      this.areaEl.innerHTML = '';
      // 原始字符串
      this.areaEl.appendChild(this.makeCharBlock('原始字符串', [...step.raw], -1));
      // 清理后的字符 / 单词
      if (step.phase === 'clean' || step.phase === 'extract' || step.phase === 'reverse' || step.phase === 'done') {
        this.areaEl.appendChild(this.makeCharBlock('移除多余空格后', step.cleanedChars, step.currentCharIndex));
      }
      // 单词列表
      if (step.words.length > 0) {
        const wrap = document.createElement('div');
        const title = document.createElement('div');
        title.className = 'rw-block-title';
        title.textContent = '提取的单词（按原顺序）';
        wrap.appendChild(title);
        const row = document.createElement('div');
        row.className = 'rw-words';
        step.words.forEach((w, idx) => {
          const wordEl = document.createElement('div');
          wordEl.className = 'rw-word';
          if (idx === step.currentWordIndex) wordEl.classList.add('current');
          wordEl.textContent = w;
          row.appendChild(wordEl);
        });
        wrap.appendChild(row);
        this.areaEl.appendChild(wrap);
      }
      // 结果
      if (step.reversedWords.length > 0) {
        const wrap = document.createElement('div');
        const title = document.createElement('div');
        title.className = 'rw-block-title';
        title.textContent = '倒序拼接结果';
        wrap.appendChild(title);
        const result = document.createElement('div');
        result.className = 'rw-result';
        result.textContent = `"${step.result}"`;
        wrap.appendChild(result);
        this.areaEl.appendChild(wrap);
      }
    }
    this.renderLogLine(step);
  }

  private makeCharBlock(title: string, chars: string[], currentIndex: number): HTMLElement {
    const wrap = document.createElement('div');
    const t = document.createElement('div');
    t.className = 'rw-block-title';
    t.textContent = title;
    wrap.appendChild(t);
    const row = document.createElement('div');
    row.className = 'rw-chars';
    if (chars.length === 0) {
      row.innerHTML = '<span style="color:#6c7086">（空）</span>';
    } else {
      chars.forEach((ch, i) => {
        const c = document.createElement('div');
        c.className = 'rw-char';
        if (ch === ' ') { c.classList.add('space'); c.textContent = '·'; }
        else c.textContent = ch;
        if (i === currentIndex) c.classList.add('current');
        row.appendChild(c);
      });
    }
    wrap.appendChild(row);
    return wrap;
  }

  private phaseText(p: RWStep['phase']): string {
    return { init: '初始化', clean: '移除空格', extract: '提取单词', reverse: '倒序拼接', done: '完成' }[p];
  }

  private renderLogLine(step: RWStep): void {
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
  id: 'reverse-words',
  name: '翻转字符串里的单词（双指针）',
  viewId: 'algo-reverse-words-view',
  category: 'string',
  description: '移除多余空格并倒序拼接单词',
  icon: '🔃',
  template,
  Visualizer: ReverseWordsVisualizer,
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '学会分割-反转-重组的字符串处理模式',
});
