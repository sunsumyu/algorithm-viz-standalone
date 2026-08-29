/**
 * 重复的子字符串可视化器 — 4-Card 标准现代架构
 * LeetCode 459：KMP 前缀表周期性整除推导
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  REPEATED_SUBSTRING_PROBLEM_HTML,
  REPEATED_SUBSTRING_ANALYSIS_HTML,
  REPEATED_SUBSTRING_CODE_LANGUAGES,
} from './repeated-substring-problem-content';
import { computeNextArray } from './implement-str-str-renderer';
import template from './repeated-substring.html?raw';

export interface RPSStep {
  s: string;
  next: number[];
  n: number;
  maxLPS: number;
  patternLen: number;
  patternStr: string;
  isRepeated: boolean;
  tiles: string[];
  phase: 'init' | 'compute-next' | 'check-period' | 'found' | 'not-found';
  status: 'init' | 'compute-next' | 'check-period' | 'found' | 'not-found';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildRPSSteps(s: string): RPSStep[] {
  const steps: RPSStep[] = [];
  const n = s.length;

  if (n <= 1) {
    steps.push({
      s,
      next: n === 1 ? [0] : [],
      n,
      maxLPS: 0,
      patternLen: n,
      patternStr: s,
      isRepeated: false,
      tiles: [s],
      phase: 'not-found',
      status: 'not-found',
      message: `字符串长度为 ${n} &le; 1，无法由子串重复构成，直接返回 false。`,
      log: `长度不足 2 -> false`,
      codeLine: 2,
    });
    return steps;
  }

  const next = computeNextArray(s);
  const maxLPS = next[n - 1];
  const patternLen = n - maxLPS;
  const patternStr = s.substring(0, patternLen);
  const isDivisible = maxLPS > 0 && n % patternLen === 0;

  steps.push({
    s,
    next,
    n,
    maxLPS: 0,
    patternLen: 0,
    patternStr: '',
    isRepeated: false,
    tiles: [],
    phase: 'init',
    status: 'init',
    message: `初始化分析：字符串 "${s}" (长度 n = ${n})。构建 KMP 前缀表 next。`,
    log: `初始化字符串 "${s}" (n=${n})`,
    codeLine: [3, 4],
  });

  steps.push({
    s,
    next,
    n,
    maxLPS,
    patternLen: 0,
    patternStr: '',
    isRepeated: false,
    tiles: [],
    phase: 'compute-next',
    status: 'compute-next',
    message: `计算得到前缀表 next = [${next.join(', ')}]。末尾项 next[${n - 1}] = ${maxLPS}，表示最长相等前后缀长度为 ${maxLPS}。`,
    log: `next[${n - 1}] = ${maxLPS} (最长相等前后缀)`,
    codeLine: 6,
  });

  steps.push({
    s,
    next,
    n,
    maxLPS,
    patternLen,
    patternStr,
    isRepeated: false,
    tiles: [],
    phase: 'check-period',
    status: 'check-period',
    message: `计算潜在最小重复子串周期：patternLen = n - next[n - 1] = ${n} - ${maxLPS} = ${patternLen}。候选子串为 "${patternStr}"。`,
    log: `计算周期: patternLen = ${n} - ${maxLPS} = ${patternLen} ("${patternStr}")`,
    codeLine: 8,
  });

  // 构造周期平铺
  const repeatCount = Math.floor(n / patternLen);
  const tiles: string[] = [];
  for (let k = 0; k < repeatCount; k++) {
    tiles.push(patternStr);
  }

  if (isDivisible) {
    steps.push({
      s,
      next,
      n,
      maxLPS,
      patternLen,
      patternStr,
      isRepeated: true,
      tiles,
      phase: 'found',
      status: 'found',
      message: `🎉 判定成功！maxLPS(${maxLPS}) > 0 且 ${n} % ${patternLen} == 0 (整除)。字符串可由子串 "${patternStr}" 重复 ${repeatCount} 次构成，返回 true。`,
      log: `✓ 成功: "${patternStr}" 重复 ${repeatCount} 次 -> true`,
      codeLine: 9,
    });
  } else {
    steps.push({
      s,
      next,
      n,
      maxLPS,
      patternLen,
      patternStr,
      isRepeated: false,
      tiles: [],
      phase: 'not-found',
      status: 'not-found',
      message: `⚠️ 判定失败！maxLPS = ${maxLPS}，${n} % ${patternLen} = ${n % patternLen} != 0 (不能整除)。无法由重复子串构成，返回 false。`,
      log: `✗ 不能整除 (${n} % ${patternLen} != 0) -> false`,
      codeLine: 9,
    });
  }

  return steps;
}

export class RepeatedSubstringVisualizer extends StepVisualizer<RPSStep> {
  protected codeLanguages = REPEATED_SUBSTRING_CODE_LANGUAGES;
  protected codeLines = REPEATED_SUBSTRING_CODE_LANGUAGES['java'];
  protected codePanelTitle = '重复的子字符串 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private trackRowEl: HTMLElement | null = null;
  private tileRowEl: HTMLElement | null = null;
  private metricNEl: HTMLElement | null = null;
  private metricLpsEl: HTMLElement | null = null;
  private metricPeriodEl: HTMLElement | null = null;
  private metricResEl: HTMLElement | null = null;
  private formulaDivEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.trackRowEl = this.root.querySelector('#rps-track-row');
    this.tileRowEl = this.root.querySelector('#rps-tile-row');
    this.metricNEl = this.root.querySelector('#metric-n');
    this.metricLpsEl = this.root.querySelector('#metric-lps');
    this.metricPeriodEl = this.root.querySelector('#metric-period');
    this.metricResEl = this.root.querySelector('#metric-res');
    this.formulaDivEl = this.root.querySelector('#formula-div');
    this.liveTextEl = this.root.querySelector('#rps-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>.bind(this.root)('.rps-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sInput = this.root?.querySelector('#input-s') as HTMLInputElement | null;
        if (sInput && btn.dataset.s) sInput.value = btn.dataset.s;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: REPEATED_SUBSTRING_PROBLEM_HTML,
      analysisHtml: REPEATED_SUBSTRING_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): RPSStep[] {
    const sInput = this.root?.querySelector('#input-s') as HTMLInputElement | null;
    const str = sInput?.value || 'abab';
    return buildRPSSteps(str);
  }

  protected renderStep(step: RPSStep): void {
    const { s, next, n, maxLPS, patternLen, patternStr, isRepeated, tiles, phase, message } = step;

    // 1. 渲染字符与 Next 表网格
    if (this.trackRowEl) {
      this.trackRowEl.innerHTML = s
        .split('')
        .map((ch, idx) => {
          const inPattern = patternLen > 0 && idx < patternLen && (phase === 'check-period' || phase === 'found');
          const isLastNode = idx === n - 1;

          let cellClass = 'rps-cell-box';
          if (inPattern) cellClass += ' in-pattern';
          if (isLastNode) cellClass += ' is-last-node';

          const nextVal = next[idx] !== undefined ? next[idx] : '-';

          return `
            <div class="${cellClass}">
              <span class="val">${ch}</span>
              <span class="next-val">next:${nextVal}</span>
            </div>
          `;
        })
        .join('');
    }

    // 2. 渲染周期拆解平铺
    if (this.tileRowEl) {
      if (tiles.length === 0) {
        this.tileRowEl.innerHTML =
          '<span style="color:#94a3b8; font-size:11px; font-style:italic;">(等待周期整除分析...)</span>';
      } else {
        this.tileRowEl.innerHTML = tiles
          .map(
            (t, tIdx) => `
          <div class="rps-tile-unit">
            <span>[${tIdx + 1}] "${t}"</span>
          </div>
        `
          )
          .join('');
      }
    }

    // 3. 更新状态监视器
    if (this.metricNEl) this.metricNEl.textContent = String(n);
    if (this.metricLpsEl) this.metricLpsEl.textContent = phase !== 'init' ? String(maxLPS) : '—';
    if (this.metricPeriodEl) {
      this.metricPeriodEl.textContent = patternLen > 0 ? `${patternLen} ("${patternStr}")` : '—';
    }
    if (this.metricResEl) {
      if (phase === 'found') {
        this.metricResEl.textContent = '✓ true';
        this.metricResEl.style.color = '#10b981';
      } else if (phase === 'not-found') {
        this.metricResEl.textContent = '✗ false';
        this.metricResEl.style.color = '#ef4444';
      } else {
        this.metricResEl.textContent = '分析中...';
        this.metricResEl.style.color = '#3b82f6';
      }
    }

    if (this.formulaDivEl) {
      if (patternLen > 0) {
        this.formulaDivEl.textContent = `${n} % (${n} - ${maxLPS}) = ${n} % ${patternLen} = ${n % patternLen} ${
          isRepeated ? '== 0 (整除)' : '!= 0 (不整除)'
        }`;
      } else {
        this.formulaDivEl.textContent = 'n % (n - next[n-1]) == 0';
      }
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 4. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background =
        phase === 'found' ? '#f0fdf4' : phase === 'not-found' ? '#fef2f2' : '#eff6ff';
      logEntry.style.color =
        phase === 'found' ? '#15803d' : phase === 'not-found' ? '#b91c1c' : '#1d4ed8';
      logEntry.style.border =
        '1px solid ' +
        (phase === 'found' ? '#bbf7d0' : phase === 'not-found' ? '#fecaca' : '#bfdbfe');
      logEntry.innerHTML = `<span style="color:#94a3b8;">[Step ${stepIndex + 1}]</span> ${step.log}`;

      this.logContainer.appendChild(logEntry);
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.logContainer.children.length} 条记录`;
      }
    }

    // 5. 同步代码高亮
    if (this.terminalInstance) {
      const line = Array.isArray(step.codeLine) ? step.codeLine[0] : step.codeLine;
      this.terminalInstance.highlightLine(line);
    }

    // 6. 更新底部播放控制条
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
  id: 'repeated-substring',
  name: '重复的子字符串',
  viewId: 'algo-repeated-substring-view',
  category: 'string',
  description: '判断字符串是否可由重复子串构成',
  icon: '🔁',
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '掌握用 KMP 前缀表判断重复子串的数学原理',
  template,
  Visualizer: RepeatedSubstringVisualizer,
});
