/**
 * 最长公共前缀可视化器 — 4-Card 标准现代架构
 * LeetCode 14：纵向逐列扫描
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  LONGEST_COMMON_PREFIX_PROBLEM_HTML,
  LONGEST_COMMON_PREFIX_ANALYSIS_HTML,
  LONGEST_COMMON_PREFIX_CODE_LANGUAGES,
} from './longest-common-prefix-problem-content';
import template from './longest-common-prefix.html?raw';

export interface LCPStep {
  strs: string[];
  col: number;
  row: number;
  char: string | null;
  matchedLen: number;
  prefix: string;
  isMismatch: boolean;
  phase: 'init' | 'scan-col' | 'compare-cell' | 'mismatch' | 'done';
  status: 'init' | 'scan-col' | 'compare-cell' | 'mismatch' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function parseStringList(input: string): string[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return arr.length > 0 ? arr : ['flower', 'flow', 'flight'];
}

export function buildLCPSteps(strs: string[]): LCPStep[] {
  const steps: LCPStep[] = [];

  if (!strs || strs.length === 0) {
    steps.push({
      strs: [],
      col: -1,
      row: -1,
      char: null,
      matchedLen: 0,
      prefix: '',
      isMismatch: false,
      phase: 'done',
      status: 'done',
      message: '字符串数组为空，返回空字符串 ""。',
      log: '空数组 -> ""',
      codeLine: 2,
    });
    return steps;
  }

  const baseStr = strs[0];

  steps.push({
    strs,
    col: -1,
    row: -1,
    char: null,
    matchedLen: 0,
    prefix: '',
    isMismatch: false,
    phase: 'init',
    status: 'init',
    message: `初始化纵向扫描：以基准字符串 strs[0] = "${baseStr}" 为基准，逐列比对 ${strs.length} 个字符串。`,
    log: `初始化矩阵扫描 (基准: "${baseStr}")`,
    codeLine: 2,
  });

  for (let col = 0; col < baseStr.length; col++) {
    const c = baseStr[col];

    steps.push({
      strs,
      col,
      row: 0,
      char: c,
      matchedLen: col,
      prefix: baseStr.substring(0, col),
      isMismatch: false,
      phase: 'scan-col',
      status: 'scan-col',
      message: `开始第 ${col} 列扫描：基准字符 strs[0][${col}] = '${c}'。`,
      log: `第 ${col} 列: 基准字符 '${c}'`,
      codeLine: [3, 4],
    });

    for (let row = 1; row < strs.length; row++) {
      const curStr = strs[row];

      if (col === curStr.length || curStr[col] !== c) {
        const mismatchReason =
          col === curStr.length
            ? `已到达 strs[${row}] ("${curStr}") 的末尾`
            : `字符不匹配 (strs[${row}][${col}] = '${curStr[col]}' != '${c}')`;

        steps.push({
          strs,
          col,
          row,
          char: c,
          matchedLen: col,
          prefix: baseStr.substring(0, col),
          isMismatch: true,
          phase: 'mismatch',
          status: 'mismatch',
          message: `⚠️ 在 strs[${row}] 第 ${col} 列发现失配：${mismatchReason}。最长公共前缀在此终止。`,
          log: `✗ 失配终止于 [${row}][${col}]: 前缀 "${baseStr.substring(0, col)}"`,
          codeLine: [5, 6],
        });

        const finalPrefix = baseStr.substring(0, col);
        steps.push({
          strs,
          col,
          row,
          char: c,
          matchedLen: col,
          prefix: finalPrefix,
          isMismatch: false,
          phase: 'done',
          status: 'done',
          message: `🎉 扫描结束！最长公共前缀为 "${finalPrefix}"。`,
          log: `✓ 最长公共前缀: "${finalPrefix}"`,
          codeLine: 6,
        });
        return steps;
      }

      steps.push({
        strs,
        col,
        row,
        char: c,
        matchedLen: col,
        prefix: baseStr.substring(0, col),
        isMismatch: false,
        phase: 'compare-cell',
        status: 'compare-cell',
        message: `比对 strs[${row}][${col}] = '${curStr[col]}' == '${c}'：字符一致。`,
        log: `匹配: strs[${row}][${col}] == '${c}'`,
        codeLine: [4, 5],
      });
    }
  }

  // 完整匹配基准串
  steps.push({
    strs,
    col: baseStr.length,
    row: strs.length - 1,
    char: null,
    matchedLen: baseStr.length,
    prefix: baseStr,
    isMismatch: false,
    phase: 'done',
    status: 'done',
    message: `🎉 所有列均全部匹配成功！基准字符串 "${baseStr}" 本身即为最长公共前缀。`,
    log: `✓ 全匹配: "${baseStr}"`,
    codeLine: 11,
  });

  return steps;
}

export class LongestCommonPrefixVisualizer extends StepVisualizer<LCPStep> {
  protected codeLanguages = LONGEST_COMMON_PREFIX_CODE_LANGUAGES;
  protected codeLines = LONGEST_COMMON_PREFIX_CODE_LANGUAGES['java'];
  protected codePanelTitle = '最长公共前缀 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private matrixWrapEl: HTMLElement | null = null;
  private metricColEl: HTMLElement | null = null;
  private metricRowEl: HTMLElement | null = null;
  private metricCharEl: HTMLElement | null = null;
  private metricPrefixEl: HTMLElement | null = null;
  private formulaColEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.matrixWrapEl = this.root.querySelector('#lcp-matrix-wrap');
    this.metricColEl = this.root.querySelector('#metric-col');
    this.metricRowEl = this.root.querySelector('#metric-row');
    this.metricCharEl = this.root.querySelector('#metric-char');
    this.metricPrefixEl = this.root.querySelector('#metric-prefix');
    this.formulaColEl = this.root.querySelector('#formula-col');
    this.liveTextEl = this.root.querySelector('#lcp-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>('.lcp-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const strsInput = this.root?.querySelector('#input-strs') as HTMLInputElement | null;
        if (strsInput && btn.dataset.strs) strsInput.value = btn.dataset.strs;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: LONGEST_COMMON_PREFIX_PROBLEM_HTML,
      analysisHtml: LONGEST_COMMON_PREFIX_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): LCPStep[] {
    const strsInput = this.root?.querySelector('#input-strs') as HTMLInputElement | null;
    const raw = strsInput?.value || 'flower, flow, flight';
    const strs = parseStringList(raw);
    return buildLCPSteps(strs);
  }

  protected renderStep(step: LCPStep): void {
    const { strs, col, row, char, matchedLen, prefix, isMismatch, phase, message } = step;

    // 1. 渲染多字符串矩阵
    if (this.matrixWrapEl) {
      this.matrixWrapEl.innerHTML = strs
        .map((str, rIdx) => {
          const cellsHtml = str
            .split('')
            .map((ch, cIdx) => {
              const inCurCol = cIdx === col && phase !== 'done';
              const isActiveCell = rIdx === row && cIdx === col;
              const isMatchedPrefix = cIdx < matchedLen;
              const isCellMismatch = isMismatch && rIdx === row && cIdx === col;

              let cellClass = 'lcp-cell-box';
              if (isCellMismatch) cellClass += ' is-mismatch';
              else if (isMatchedPrefix) cellClass += ' is-matched-prefix';
              else if (isActiveCell) cellClass += ' is-active-cell';
              else if (inCurCol) cellClass += ' in-current-col';

              return `
                <div class="${cellClass}">
                  <span>${ch}</span>
                </div>
              `;
            })
            .join('');

          return `
            <div class="lcp-matrix-row">
              <span class="lcp-str-label">strs[${rIdx}]:</span>
              <div style="display: flex; gap: 4px;">${cellsHtml}</div>
            </div>
          `;
        })
        .join('');
    }

    // 2. 更新状态监视器
    if (this.metricColEl) this.metricColEl.textContent = col >= 0 && phase !== 'done' ? String(col) : '—';
    if (this.metricRowEl) this.metricRowEl.textContent = row >= 0 && phase !== 'done' ? String(row) : '—';
    if (this.metricCharEl) this.metricCharEl.textContent = char ? `'${char}'` : '—';
    if (this.metricPrefixEl) this.metricPrefixEl.textContent = prefix ? `"${prefix}"` : '""';

    if (this.formulaColEl) {
      if (row >= 0 && col >= 0 && phase !== 'done') {
        this.formulaColEl.textContent = `strs[${row}][${col}] == strs[0][${col}] ('${char}')`;
      } else {
        this.formulaColEl.textContent = 'strs[row][col] == strs[0][col]';
      }
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 3. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background =
        phase === 'done' ? '#f0fdf4' : isMismatch ? '#fef2f2' : '#eff6ff';
      logEntry.style.color =
        phase === 'done' ? '#15803d' : isMismatch ? '#b91c1c' : '#1d4ed8';
      logEntry.style.border =
        '1px solid ' +
        (phase === 'done' ? '#bbf7d0' : isMismatch ? '#fecaca' : '#bfdbfe');
      logEntry.innerHTML = `<span style="color:#94a3b8;">[Step ${stepIndex + 1}]</span> ${step.log}`;

      this.logContainer.appendChild(logEntry);
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.logContainer.children.length} 条记录`;
      }
    }

    // 4. 同步代码高亮
    if (this.terminalInstance) {
      const line = Array.isArray(step.codeLine) ? step.codeLine[0] : step.codeLine;
      this.terminalInstance.highlightLine(line);
    }

    // 5. 更新底部播放控制条
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
  id: 'longest-common-prefix',
  name: '最长公共前缀（逐列扫描）',
  viewId: 'algo-longest-common-prefix-view',
  category: 'string',
  description: '以第一个字符串为基准，逐列比对找公共前缀',
  icon: '📖',
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '理解逐字符纵向比较求公共前缀的思路',
  template,
  Visualizer: LongestCommonPrefixVisualizer,
});