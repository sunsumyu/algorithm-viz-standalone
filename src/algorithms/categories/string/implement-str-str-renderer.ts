/**
 * 实现 strStr() (KMP 算法) 可视化器 — 4-Card 标准现代架构
 * LeetCode 28：KMP 前缀表模式匹配
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  STR_STR_PROBLEM_HTML,
  STR_STR_ANALYSIS_HTML,
  STR_STR_CODE_LANGUAGES,
} from './implement-str-str-problem-content';
import template from './implement-str-str.html?raw';

export interface SSStep {
  haystack: string;
  needle: string;
  next: number[];
  i: number;
  j: number;
  phase: 'init' | 'match' | 'mismatch' | 'fallback' | 'found' | 'not-found';
  status: 'init' | 'match' | 'mismatch' | 'fallback' | 'found' | 'not-found';
  matchedIndex: number;
  message: string;
  log: string;
  codeLine: number | number[];
}

export function computeNextArray(pattern: string): number[] {
  const next = new Array(pattern.length).fill(0);
  let j = 0;
  next[0] = 0;

  for (let i = 1; i < pattern.length; i++) {
    while (j > 0 && pattern[i] !== pattern[j]) {
      j = next[j - 1];
    }
    if (pattern[i] === pattern[j]) {
      j++;
    }
    next[i] = j;
  }
  return next;
}

export function buildSSSteps(haystack: string, needle: string): SSStep[] {
  const steps: SSStep[] = [];

  if (needle.length === 0) {
    steps.push({
      haystack,
      needle,
      next: [],
      i: 0,
      j: 0,
      phase: 'found',
      status: 'found',
      matchedIndex: 0,
      message: 'needle 为空字符串，根据定义直接返回 0。',
      log: 'needle 为空 -> 返回 0',
      codeLine: 2,
    });
    return steps;
  }

  const next = computeNextArray(needle);

  steps.push({
    haystack,
    needle,
    next,
    i: 0,
    j: 0,
    phase: 'init',
    status: 'init',
    matchedIndex: -1,
    message: `计算模式串 needle 的 next 前缀表: [${next.join(', ')}]。准备开始在主串中匹配。`,
    log: `构建 next 表: [${next.join(', ')}]`,
    codeLine: [3, 4, 5],
  });

  let j = 0;
  for (let i = 0; i < haystack.length; i++) {
    // 字符失配回退
    while (j > 0 && haystack[i] !== needle[j]) {
      const prevJ = j;
      j = next[j - 1];

      steps.push({
        haystack,
        needle,
        next,
        i,
        j,
        phase: 'fallback',
        status: 'fallback',
        matchedIndex: -1,
        message: `⚠️ 字符失配：haystack[${i}] ('${haystack[i]}') != needle[${prevJ}] ('${needle[prevJ]}')。模式串指针通过 next 表回退到 j = next[${prevJ - 1}] = ${j}。`,
        log: `失配回退: j 从 ${prevJ} -> ${j}`,
        codeLine: [7, 8],
      });
    }

    if (haystack[i] === needle[j]) {
      j++;

      steps.push({
        haystack,
        needle,
        next,
        i,
        j: j - 1,
        phase: 'match',
        status: 'match',
        matchedIndex: -1,
        message: `字符匹配：haystack[${i}] ('${haystack[i]}') == needle[${j - 1}] ('${needle[j - 1]}')。模式串匹配长度增至 ${j}。`,
        log: `匹配: haystack[${i}] == needle[${j - 1}] (j=${j})`,
        codeLine: 10,
      });

      if (j === needle.length) {
        const foundIdx = i - needle.length + 1;
        steps.push({
          haystack,
          needle,
          next,
          i,
          j: j - 1,
          phase: 'found',
          status: 'found',
          matchedIndex: foundIdx,
          message: `🎉 模式串完全匹配！在主串下标 ${foundIdx} 处成功找到匹配项，返回 ${foundIdx}。`,
          log: `✓ 成功匹配: 起始下标 ${foundIdx}`,
          codeLine: [11, 12],
        });
        return steps;
      }
    } else {
      steps.push({
        haystack,
        needle,
        next,
        i,
        j: 0,
        phase: 'mismatch',
        status: 'mismatch',
        matchedIndex: -1,
        message: `字符不匹配：haystack[${i}] ('${haystack[i]}') != needle[0] ('${needle[0]}')，模式串仍从 0 开始。`,
        log: `首字符失配: i=${i}`,
        codeLine: 10,
      });
    }
  }

  steps.push({
    haystack,
    needle,
    next,
    i: haystack.length,
    j,
    phase: 'not-found',
    status: 'not-found',
    matchedIndex: -1,
    message: `主串遍历结束，未找到模式串 "${needle}" 的匹配项，返回 -1。`,
    log: `✗ 未找到匹配项: 返回 -1`,
    codeLine: 15,
  });

  return steps;
}

export class ImplementStrStrVisualizer extends StepVisualizer<SSStep> {
  protected codeLanguages = STR_STR_CODE_LANGUAGES;
  protected codeLines = STR_STR_CODE_LANGUAGES['java'];
  protected codePanelTitle = '实现 strStr() 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private haystackCellsEl: HTMLElement | null = null;
  private needleCellsEl: HTMLElement | null = null;
  private nextTableEl: HTMLElement | null = null;
  private metricIEl: HTMLElement | null = null;
  private metricJEl: HTMLElement | null = null;
  private metricMatchStateEl: HTMLElement | null = null;
  private metricResEl: HTMLElement | null = null;
  private formulaKmpEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.haystackCellsEl = this.root.querySelector('#kmp-haystack-cells');
    this.needleCellsEl = this.root.querySelector('#kmp-needle-cells');
    this.nextTableEl = this.root.querySelector('#kmp-next-table');
    this.metricIEl = this.root.querySelector('#metric-i');
    this.metricJEl = this.root.querySelector('#metric-j');
    this.metricMatchStateEl = this.root.querySelector('#metric-match-state');
    this.metricResEl = this.root.querySelector('#metric-res');
    this.formulaKmpEl = this.root.querySelector('#formula-kmp');
    this.liveTextEl = this.root.querySelector('#kmp-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 绑定播放控制
    this.bindPlaybackControls();

    // 运行与重置
    this.root.querySelector('#btn-generate')?.addEventListener('click', () => this.start());
    this.root.querySelector('#btn-reset')?.addEventListener('click', () => this.reset());

    // 进度条 Scrubber
    const slider = this.root.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(val) && val >= 0 && val < this.steps.length) {
          this.goToStep(val);
        }
      });
    }

    // 步进控制
    this.root.querySelector('#btn-step-prev')?.addEventListener('click', () => this.prevStep());
    this.root.querySelector('#btn-step-next')?.addEventListener('click', () => this.nextStep());
    this.root.querySelector('#btn-play-pause')?.addEventListener('click', () => this.togglePlay());

    // 速度选择
    const speedSelect = this.root.querySelector('#select-speed') as HTMLSelectElement | null;
    if (speedSelect) {
      speedSelect.addEventListener('change', () => {
        this.playbackSpeed = parseInt(speedSelect.value, 10) || 600;
      });
    }

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.kmp-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const hInput = this.root?.querySelector('#input-haystack') as HTMLInputElement | null;
        const nInput = this.root?.querySelector('#input-needle') as HTMLInputElement | null;
        if (hInput && btn.dataset.h) hInput.value = btn.dataset.h;
        if (nInput && btn.dataset.n) nInput.value = btn.dataset.n;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: STR_STR_PROBLEM_HTML,
      analysisHtml: STR_STR_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): SSStep[] {
    const hInput = this.root?.querySelector('#input-haystack') as HTMLInputElement | null;
    const nInput = this.root?.querySelector('#input-needle') as HTMLInputElement | null;
    const h = hInput?.value || 'sadbutsad';
    const n = nInput?.value || 'sad';
    return buildSSSteps(h, n);
  }

  protected renderStep(step: SSStep): void {
    const { haystack, needle, next, i, j, phase, matchedIndex, message } = step;

    // 1. 渲染主串
    if (this.haystackCellsEl) {
      this.haystackCellsEl.innerHTML = haystack
        .split('')
        .map((ch, idx) => {
          const isI = idx === i && phase !== 'found' && phase !== 'not-found';
          const isMatchedPart = phase === 'found' && idx >= matchedIndex && idx < matchedIndex + needle.length;

          let cellClass = 'kmp-cell-box';
          if (isMatchedPart) cellClass += ' is-match';
          else if (isI) cellClass += ' is-i-ptr';

          return `
            <div class="${cellClass}">
              <span class="val">${ch}</span>
              <span class="idx">${idx}</span>
            </div>
          `;
        })
        .join('');
    }

    // 2. 渲染模式串（对齐显示）
    if (this.needleCellsEl) {
      // 模式串左边偏移 (i - j) 个空占位
      const offset = Math.max(0, i - j);
      let offsetHtml = '';
      for (let k = 0; k < offset; k++) {
        offsetHtml += '<div style="width: 32px; height: 38px; flex-shrink: 0;"></div>';
      }

      const needleCells = needle
        .split('')
        .map((ch, idx) => {
          const isJ = idx === j && phase !== 'found' && phase !== 'not-found';
          const isMatch = (phase === 'match' && idx <= j) || phase === 'found';
          const isMismatch = phase === 'fallback' && idx === j;

          let cellClass = 'kmp-cell-box';
          if (isMatch) cellClass += ' is-match';
          else if (isMismatch) cellClass += ' is-mismatch';
          else if (isJ) cellClass += ' is-j-ptr';

          return `
            <div class="${cellClass}">
              <span class="val">${ch}</span>
              <span class="idx">${idx}</span>
            </div>
          `;
        })
        .join('');

      this.needleCellsEl.innerHTML = offsetHtml + needleCells;
    }

    // 3. 渲染 Next 表
    if (this.nextTableEl) {
      this.nextTableEl.innerHTML = next
        .map(
          (val, idx) => `
        <div class="kmp-next-cell ${idx === j ? 'is-j-ptr' : ''}">
          <span style="font-size: 9px; color: #64748b;">[${idx}] ${needle[idx]}</span>
          <span style="font-size: 13px; font-weight: 800; color: #2563eb;">${val}</span>
        </div>
      `
        )
        .join('');
    }

    // 4. 更新状态监视器
    if (this.metricIEl) this.metricIEl.textContent = phase === 'found' || phase === 'not-found' ? '—' : String(i);
    if (this.metricJEl) this.metricJEl.textContent = phase === 'found' || phase === 'not-found' ? '—' : String(j);
    if (this.metricMatchStateEl) {
      const stateMap: Record<string, string> = {
        init: '初始化',
        match: '✓ 匹配中',
        mismatch: '✗ 失配',
        fallback: '⏪ 模式串回退',
        found: '🎉 匹配成功',
        'not-found': '未找到',
      };
      this.metricMatchStateEl.textContent = stateMap[phase] || phase;
      this.metricMatchStateEl.style.color =
        phase === 'found' || phase === 'match'
          ? '#10b981'
          : phase === 'fallback' || phase === 'mismatch'
          ? '#ef4444'
          : '#3b82f6';
    }

    if (this.metricResEl) {
      if (phase === 'found') {
        this.metricResEl.textContent = `下标 ${matchedIndex}`;
        this.metricResEl.style.color = '#10b981';
      } else if (phase === 'not-found') {
        this.metricResEl.textContent = '-1 (无匹配)';
        this.metricResEl.style.color = '#ef4444';
      } else {
        this.metricResEl.textContent = '匹配中...';
        this.metricResEl.style.color = '#0f172a';
      }
    }

    if (this.formulaKmpEl) {
      if (phase === 'fallback') {
        this.formulaKmpEl.textContent = `j 回退: j = next[${j}] = ${next[j] || 0}`;
      } else {
        this.formulaKmpEl.textContent = 'j = next[j - 1] (失配回退)';
      }
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 5. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background =
        phase === 'found' ? '#f0fdf4' : phase === 'fallback' ? '#fef2f2' : '#eff6ff';
      logEntry.style.color =
        phase === 'found' ? '#15803d' : phase === 'fallback' ? '#b91c1c' : '#1d4ed8';
      logEntry.style.border =
        '1px solid ' +
        (phase === 'found' ? '#bbf7d0' : phase === 'fallback' ? '#fecaca' : '#bfdbfe');
      logEntry.innerHTML = `<span style="color:#94a3b8;">[Step ${stepIndex + 1}]</span> ${step.log}`;

      this.logContainer.appendChild(logEntry);
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.logContainer.children.length} 条记录`;
      }
    }

    // 6. 同步代码高亮
    if (this.terminalInstance) {
      const line = Array.isArray(step.codeLine) ? step.codeLine[0] : step.codeLine;
      this.terminalInstance.highlightLine(line);
    }

    // 7. 更新底部播放控制条
    const slider = this.root?.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.max = String(this.steps.length - 1);
      slider.value = String(this.currentStepIndex);
    }
    const indicator = this.root?.querySelector('#step-indicator');
    if (indicator) {
      indicator.textContent = `步骤 ${this.currentStepIndex + 1} / ${this.steps.length}`;
    }
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
    if (this.terminalInstance) this.terminalInstance.highlightLine(0);
  }
}

registerAlgorithm({
  id: 'str-str',
  name: '实现strStr()（KMP算法）',
  viewId: 'algo-str-str-view',
  category: 'string',
  description: '用 KMP 算法在 haystack 中查找 needle 的首次位置',
  icon: '🔍',
  difficulty: 2,
  levelOrder: 6,
  learningGoal: '掌握 KMP 算法的 next 数组与状态转移',
  template,
  Visualizer: ImplementStrStrVisualizer,
});
