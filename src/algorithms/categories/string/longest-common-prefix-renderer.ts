/**
 * 最长公共前缀可视化器（逐列扫描）
 * LeetCode 14
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './longest-common-prefix.html?raw';

interface LCPStep {
  strs: string[];
  idx: number;           // 当前列索引
  prefix: string;        // 已确认的公共前缀
  done: boolean;         // 是否结束
  diffAt: number | null; // 差异出现在哪个字符串索引
  message: string;
  log: string;
  codeLine: number | number[];
}

function buildLCPSteps(strs: string[]): LCPStep[] {
  const steps: LCPStep[] = [];
  if (strs.length === 0) {
    steps.push({
      strs: [], idx: 0, prefix: '', done: true, diffAt: null,
      message: '空数组，返回空字符串。',
      log: '空数组。',
      codeLine: 1,
    });
    return steps;
  }
  const first = strs[0];
  let prefix = '';

  steps.push({
    strs, idx: 0, prefix: '', done: false, diffAt: null,
    message: `以 "${first}" 为基准，逐列扫描。`,
    log: '开始扫描。',
    codeLine: [1, 2],
  });

  for (let i = 0; i < first.length; i++) {
    const c = first[i];
    let allMatch = true;
    let diffAt: number | null = null;
    for (let j = 1; j < strs.length; j++) {
      if (i >= strs[j].length || strs[j][i] !== c) {
        allMatch = false;
        diffAt = j;
        break;
      }
    }
    if (!allMatch) {
      steps.push({
        strs, idx: i, prefix, done: true, diffAt,
        message: `列 ${i}：基准 "${c}"，str[${diffAt}][${i}]="${i < strs[diffAt!].length ? strs[diffAt!][i] : '空'}" 不同，停止。`,
        log: `差异于 "${diffAt}"，公共前缀="${prefix}"`,
        codeLine: [3, 4],
      });
      break;
    }
    prefix += c;
    steps.push({
      strs, idx: i, prefix, done: false, diffAt: null,
      message: `列 ${i}：所有字符串 "${c}" 匹配，前缀扩展为 "${prefix}"。`,
      log: `匹配 "${c}"，前缀="${prefix}"`,
      codeLine: 5,
    });
  }

  if (!steps.some((s) => s.done)) {
    steps.push({
      strs, idx: first.length, prefix: first, done: true, diffAt: null,
      message: `基准字符串遍历完，公共前缀为 "${first}"。`,
      log: `完成，公共前缀="${first}"`,
      codeLine: 6,
    });
  }
  return steps;
}

export class LongestCommonPrefixVisualizer extends StepVisualizer<LCPStep> {
  protected codeLines = [
    'public String longestCommonPrefix(String[] strs) {',
    '    if (strs.length == 0) return "";',
    '    String first = strs[0];',
    '    for (int i = 0; i < first.length(); i++) {',
    '        char c = first.charAt(i);',
    '        for (int j = 1; j < strs.length; j++) {',
    '            if (i >= strs[j].length()',
    '                || strs[j].charAt(i) != c)',
    '                return first.substring(0, i);',
    '        }',
    '    }',
    '    return first;',
    '}',
  ];
  protected codePanelTitle = '最长公共前缀代码 (Java)';

  private stringsEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private idxEl: HTMLElement | null = null;
  private lenEl: HTMLElement | null = null;
  private resEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.stringsEl = this.root.querySelector('#lcp-strings');
    this.logEl = this.root.querySelector('#lcp-log');
    this.idxEl = this.root.querySelector('#lcp-idx');
    this.lenEl = this.root.querySelector('#lcp-len');
    this.resEl = this.root.querySelector('#lcp-res');
    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#lcp-start')?.addEventListener('click', () => this.start());
    this.root.querySelectorAll('.lcp-example').forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = this.root?.querySelector('#lcp-input') as HTMLInputElement | null;
        if (input) input.value = (btn as HTMLButtonElement).dataset.val || '';
        this.start();
      });
    });
  }

  protected buildSteps(): LCPStep[] {
    const input = this.root?.querySelector('#lcp-input') as HTMLInputElement | null;
    const strs = (input?.value || 'flower,flow,flight').split(/[,，\s]+/).map((s) => s.trim()).filter((s) => s.length > 0);
    if (strs.length === 0) strs.push('flower', 'flow', 'flight');
    return buildLCPSteps(strs);
  }

  protected renderStep(step: LCPStep): void {
    if (this.idxEl) this.idxEl.textContent = String(step.idx);
    if (this.lenEl) this.lenEl.textContent = String(step.prefix.length);
    if (this.resEl) this.resEl.textContent = step.done ? `"${step.prefix}"` : '-';
    this.renderStrings(step);
    this.renderLogLine(step);
  }

  private renderStrings(step: LCPStep): void {
    if (!this.stringsEl) return;
    this.stringsEl.innerHTML = '';
    const maxLen = Math.max(...step.strs.map((s) => s.length), 0);
    step.strs.forEach((str, rowIdx) => {
      const row = document.createElement('div');
      row.className = 'lcp-str-row';
      row.innerHTML = `<span style="color:#6c7086;width:20px">${rowIdx}</span>`;
      for (let i = 0; i < maxLen; i++) {
        const char = document.createElement('span');
        char.className = 'lcp-char';
        char.textContent = str[i] || '';
        if (i < step.prefix.length) char.classList.add('common');
        else if (i === step.idx && step.diffAt === rowIdx && step.done) char.classList.add('diff');
        row.appendChild(char);
      }
      this.stringsEl?.appendChild(row);
    });
  }

  private renderLogLine(step: LCPStep): void {
    const logEl = this.logEl;
    if (!logEl) return;
    logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      if (i === this.currentIndex) line.className = 'active';
      line.textContent = `${String(i + 1).padStart(2, '0')}. ${s.log}`;
      logEl.appendChild(line);
    });
    logEl.scrollTop = logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'longest-common-prefix',
  name: '最长公共前缀（逐列扫描）',
  viewId: 'algo-longest-common-prefix-view',
  category: 'string',
  description: '以第一个字符串为基准，逐列比对找公共前缀',
  icon: '📖',
  template,
  Visualizer: LongestCommonPrefixVisualizer,
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '理解逐字符纵向比较求公共前缀的思路',
});