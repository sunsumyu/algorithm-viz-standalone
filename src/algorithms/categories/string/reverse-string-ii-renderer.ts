/**
 * 反转字符串 II 可视化器 — 4-Card 标准现代架构
 * LeetCode 541：每 2k 步长反转前 k 个字符
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  REVERSE_STRING_II_PROBLEM_HTML,
  REVERSE_STRING_II_ANALYSIS_HTML,
  REVERSE_STRING_II_CODE_LANGUAGES,
} from './reverse-string-ii-problem-content';
import template from './reverse-string-ii.html?raw';

export interface ReverseStringIIStep {
  s: string[];
  i: number;
  k: number;
  chunkEnd: number;
  windowStart: number;
  windowEnd: number;
  left: number;
  right: number;
  swapping: boolean;
  phase: 'init' | 'select-chunk' | 'swap' | 'advance' | 'done';
  status: 'init' | 'select-chunk' | 'swap' | 'advance' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildReverseStringIISteps(inputStr: string, k: number): ReverseStringIIStep[] {
  const steps: ReverseStringIIStep[] = [];
  const s = inputStr.split('');
  const n = s.length;
  const safeK = Math.max(1, k);

  steps.push({
    s: [...s],
    i: 0,
    k: safeK,
    chunkEnd: Math.min(n - 1, 2 * safeK - 1),
    windowStart: 0,
    windowEnd: Math.min(n - 1, safeK - 1),
    left: -1,
    right: -1,
    swapping: false,
    phase: 'init',
    status: 'init',
    message: `初始化分段反转：字符串长度 n = ${n}，参数 k = ${safeK}，步长 2k = ${2 * safeK}。`,
    log: `开始 2k 分段反转 (n=${n}, k=${safeK})`,
    codeLine: 2,
  });

  for (let i = 0; i < n; i += 2 * safeK) {
    const chunkEnd = Math.min(n - 1, i + 2 * safeK - 1);
    let left = i;
    let right = Math.min(n - 1, i + safeK - 1);
    const windowStart = left;
    const windowEnd = right;

    steps.push({
      s: [...s],
      i,
      k: safeK,
      chunkEnd,
      windowStart,
      windowEnd,
      left,
      right,
      swapping: false,
      phase: 'select-chunk',
      status: 'select-chunk',
      message: `处理第 [${i}, ${chunkEnd}] 分段：待反转区间为 [${left}, ${right}] (right = min(${n - 1}, ${i + safeK - 1}))。`,
      log: `分段 i=${i}: 锁定待反转区间 [${left}, ${right}]`,
      codeLine: [3, 4, 5],
    });

    while (left < right) {
      const temp = s[left];
      s[left] = s[right];
      s[right] = temp;

      steps.push({
        s: [...s],
        i,
        k: safeK,
        chunkEnd,
        windowStart,
        windowEnd,
        left,
        right,
        swapping: true,
        phase: 'swap',
        status: 'swap',
        message: `交换字符：s[${left}] <-> s[${right}] ('${temp}' <-> '${s[left]}')。`,
        log: `交换 s[${left}] <-> s[${right}]`,
        codeLine: [7, 8, 9],
      });

      left++;
      right--;
    }
  }

  steps.push({
    s: [...s],
    i: n,
    k: safeK,
    chunkEnd: n - 1,
    windowStart: -1,
    windowEnd: -1,
    left: -1,
    right: -1,
    swapping: false,
    phase: 'done',
    status: 'done',
    message: `🎉 分段反转全部完成！最终字符串为 "${s.join('')}"。`,
    log: `✓ 处理完成: "${s.join('')}"`,
    codeLine: 14,
  });

  return steps;
}

export class ReverseStringIIVisualizer extends StepVisualizer<ReverseStringIIStep> {
  protected codeLanguages = REVERSE_STRING_II_CODE_LANGUAGES;
  protected codeLines = REVERSE_STRING_II_CODE_LANGUAGES['java'];
  protected codePanelTitle = '反转字符串 II 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private trackRowEl: HTMLElement | null = null;
  private metricIEl: HTMLElement | null = null;
  private metricWindowEl: HTMLElement | null = null;
  private metricKEl: HTMLElement | null = null;
  private metricPhaseEl: HTMLElement | null = null;
  private formulaBoundEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.trackRowEl = this.root.querySelector('#rs2-track-row');
    this.metricIEl = this.root.querySelector('#metric-i');
    this.metricWindowEl = this.root.querySelector('#metric-window');
    this.metricKEl = this.root.querySelector('#metric-k');
    this.metricPhaseEl = this.root.querySelector('#metric-phase');
    this.formulaBoundEl = this.root.querySelector('#formula-bound');
    this.liveTextEl = this.root.querySelector('#rs2-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>.bind(this.root)('.rs2-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sInput = this.root?.querySelector('#input-s') as HTMLInputElement | null;
        const kInput = this.root?.querySelector('#input-k') as HTMLInputElement | null;
        if (sInput && btn.dataset.s) sInput.value = btn.dataset.s;
        if (kInput && btn.dataset.k) kInput.value = btn.dataset.k;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: REVERSE_STRING_II_PROBLEM_HTML,
      analysisHtml: REVERSE_STRING_II_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): ReverseStringIIStep[] {
    const sInput = this.root?.querySelector('#input-s') as HTMLInputElement | null;
    const kInput = this.root?.querySelector('#input-k') as HTMLInputElement | null;
    const str = sInput?.value || 'abcdefg';
    const k = parseInt(kInput?.value || '2', 10);
    return buildReverseStringIISteps(str, isNaN(k) || k <= 0 ? 2 : k);
  }

  protected renderStep(step: ReverseStringIIStep): void {
    const { s, i, k, chunkEnd, windowStart, windowEnd, left, right, swapping, phase, message } = step;

    // 1. 渲染字符数组轨与分段窗口
    if (this.trackRowEl) {
      this.trackRowEl.innerHTML = s
        .map((ch, idx) => {
          const inChunk = idx >= i && idx <= chunkEnd && phase !== 'done';
          const inRevWindow = idx >= windowStart && idx <= windowEnd && phase !== 'done';
          const isLeft = idx === left && phase !== 'done';
          const isRight = idx === right && phase !== 'done';
          const isSwapping = swapping && (idx === left || idx === right);
          const isI = idx === i && phase !== 'done';

          let cellClass = 'rs2-cell-box';
          if (isSwapping) cellClass += ' is-swapping';
          else if (isLeft) cellClass += ' is-left';
          else if (isRight) cellClass += ' is-right';
          else if (inRevWindow) cellClass += ' in-rev-window';
          else if (inChunk) cellClass += ' in-chunk';

          let ptrTags = '';
          if (isI) {
            ptrTags += '<span class="rs2-ptr-badge i-ptr">i</span>';
          }
          if (isLeft && isRight) {
            ptrTags += '<span class="rs2-ptr-badge left">L</span><span class="rs2-ptr-badge right">R</span>';
          } else if (isLeft) {
            ptrTags += '<span class="rs2-ptr-badge left">left</span>';
          } else if (isRight) {
            ptrTags += '<span class="rs2-ptr-badge right">right</span>';
          }

          return `
            <div class="rs2-cell-wrapper">
              <div class="rs2-pointer-tags">${ptrTags}</div>
              <div class="${cellClass}">
                <span class="val">${ch}</span>
                <span class="idx">${idx}</span>
              </div>
            </div>
          `;
        })
        .join('');
    }

    // 2. 更新状态监视器
    if (this.metricIEl) this.metricIEl.textContent = phase === 'done' ? '—' : String(i);
    if (this.metricWindowEl) {
      this.metricWindowEl.textContent =
        windowStart >= 0 && windowEnd >= 0 && phase !== 'done' ? `[${windowStart}, ${windowEnd}]` : '—';
    }
    if (this.metricKEl) this.metricKEl.textContent = `${k} / ${2 * k}`;
    if (this.metricPhaseEl) {
      const phaseMap: Record<string, string> = {
        init: '初始化',
        'select-chunk': '分段锁定',
        swap: '交换中',
        advance: '步进',
        done: '处理完成',
      };
      this.metricPhaseEl.textContent = phaseMap[phase] || phase;
      this.metricPhaseEl.style.color = phase === 'done' ? '#10b981' : '#0f172a';
    }

    if (this.formulaBoundEl) {
      if (windowStart >= 0 && windowEnd >= 0 && phase !== 'done') {
        this.formulaBoundEl.textContent = `right = min(${s.length - 1}, ${i} + ${k} - 1) = ${windowEnd}`;
      } else {
        this.formulaBoundEl.textContent = 'right = min(n - 1, i + k - 1)';
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
        phase === 'done' ? '#f0fdf4' : swapping ? '#eff6ff' : '#f8fafc';
      logEntry.style.color =
        phase === 'done' ? '#15803d' : swapping ? '#1d4ed8' : '#334155';
      logEntry.style.border =
        '1px solid ' +
        (phase === 'done' ? '#bbf7d0' : swapping ? '#bfdbfe' : '#e2e8f0');
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
  id: 'reverse-string-ii',
  name: '反转字符串II（分段反转）',
  viewId: 'algo-reverse-string-ii-view',
  category: 'string',
  description: '每隔 2k 个字符反转前 k 个字符',
  icon: '🔁',
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '掌握分段处理 + 边界条件的双指针反转',
  template,
  Visualizer: ReverseStringIIVisualizer,
});
