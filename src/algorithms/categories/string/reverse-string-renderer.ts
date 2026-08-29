/**
 * 反转字符串可视化器 — 4-Card 标准现代架构
 * LeetCode 344：首尾双指针对撞交换
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  REVERSE_STRING_PROBLEM_HTML,
  REVERSE_STRING_ANALYSIS_HTML,
  REVERSE_STRING_CODE_LANGUAGES,
} from './reverse-string-problem-content';
import template from './reverse-string.html?raw';

export interface ReverseStringStep {
  s: string[];
  left: number;
  right: number;
  swapping: boolean;
  swapCount: number;
  status: 'init' | 'inspect' | 'swap' | 'move' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildReverseStringSteps(inputStr: string): ReverseStringStep[] {
  const steps: ReverseStringStep[] = [];
  const s = inputStr.split('');
  let left = 0;
  let right = s.length - 1;
  let swapCount = 0;

  steps.push({
    s: [...s],
    left,
    right,
    swapping: false,
    swapCount: 0,
    status: 'init',
    message: `初始化双指针：left = 0 指向首字符 '${s[0] || ''}'，right = ${right} 指向尾字符 '${s[right] || ''}'。`,
    log: `初始化双指针: left=0, right=${right}`,
    codeLine: 2,
  });

  while (left < right) {
    steps.push({
      s: [...s],
      left,
      right,
      swapping: false,
      swapCount,
      status: 'inspect',
      message: `检查指针：left(${left}) < right(${right})，准备交换 s[${left}] ('${s[left]}') 和 s[${right}] ('${s[right]}')。`,
      log: `比对指针: left(${left}) < right(${right})`,
      codeLine: 3,
    });

    // 交换
    const temp = s[left];
    s[left] = s[right];
    s[right] = temp;
    swapCount++;

    steps.push({
      s: [...s],
      left,
      right,
      swapping: true,
      swapCount,
      status: 'swap',
      message: `交换完成：s[${left}] 变为 '${s[left]}'，s[${right}] 变为 '${s[right]}'。`,
      log: `交换 s[${left}] <-> s[${right}] ('${temp}' <-> '${s[left]}')`,
      codeLine: [4, 5, 6],
    });

    left++;
    right--;

    steps.push({
      s: [...s],
      left,
      right,
      swapping: false,
      swapCount,
      status: 'move',
      message: `双指针向中间靠拢：left 移动至 ${left}，right 移动至 ${right}。`,
      log: `指针步进: left=${left}, right=${right}`,
      codeLine: [7, 8],
    });
  }

  steps.push({
    s: [...s],
    left,
    right,
    swapping: false,
    swapCount,
    status: 'done',
    message: `🎉 反转完成！left(${left}) >= right(${right})，字符串成功原地反转为 "${s.join('')}"。`,
    log: `✓ 反转结束: "${s.join('')}" (共交换 ${swapCount} 次)`,
    codeLine: 10,
  });

  return steps;
}

export class ReverseStringVisualizer extends StepVisualizer<ReverseStringStep> {
  protected codeLanguages = REVERSE_STRING_CODE_LANGUAGES;
  protected codeLines = REVERSE_STRING_CODE_LANGUAGES['java'];
  protected codePanelTitle = '反转字符串 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private trackRowEl: HTMLElement | null = null;
  private metricLeftEl: HTMLElement | null = null;
  private metricRightEl: HTMLElement | null = null;
  private metricSwapsEl: HTMLElement | null = null;
  private metricStatusEl: HTMLElement | null = null;
  private formulaSwapEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.trackRowEl = this.root.querySelector('#rs-track-row');
    this.metricLeftEl = this.root.querySelector('#metric-left');
    this.metricRightEl = this.root.querySelector('#metric-right');
    this.metricSwapsEl = this.root.querySelector('#metric-swaps');
    this.metricStatusEl = this.root.querySelector('#metric-status');
    this.formulaSwapEl = this.root.querySelector('#formula-swap');
    this.liveTextEl = this.root.querySelector('#rs-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>.bind(this.root)('.rs-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sInput = this.root?.querySelector('#input-s') as HTMLInputElement | null;
        if (sInput && btn.dataset.s) sInput.value = btn.dataset.s;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: REVERSE_STRING_PROBLEM_HTML,
      analysisHtml: REVERSE_STRING_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): ReverseStringStep[] {
    const sInput = this.root?.querySelector('#input-s') as HTMLInputElement | null;
    const str = sInput?.value || 'hello';
    return buildReverseStringSteps(str);
  }

  protected renderStep(step: ReverseStringStep): void {
    const { s, left, right, swapping, swapCount, status, message } = step;

    // 1. 渲染字符数组轨与指针标记
    if (this.trackRowEl) {
      this.trackRowEl.innerHTML = s
        .map((ch, idx) => {
          const isLeft = idx === left && status !== 'done';
          const isRight = idx === right && status !== 'done';
          const isSwapping = swapping && (idx === left || idx === right);

          let cellClass = 'rs-cell-box';
          if (isSwapping) cellClass += ' is-swapping';
          else if (isLeft) cellClass += ' is-left';
          else if (isRight) cellClass += ' is-right';

          let ptrTags = '';
          if (isLeft && isRight) {
            ptrTags = '<span class="rs-ptr-badge left">L</span><span class="rs-ptr-badge right">R</span>';
          } else if (isLeft) {
            ptrTags = '<span class="rs-ptr-badge left">left</span>';
          } else if (isRight) {
            ptrTags = '<span class="rs-ptr-badge right">right</span>';
          }

          return `
            <div class="rs-cell-wrapper">
              <div class="rs-pointer-tags">${ptrTags}</div>
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
    if (this.metricLeftEl) this.metricLeftEl.textContent = status === 'done' ? '—' : String(left);
    if (this.metricRightEl) this.metricRightEl.textContent = status === 'done' ? '—' : String(right);
    if (this.metricSwapsEl) this.metricSwapsEl.textContent = `${swapCount} 次`;
    if (this.metricStatusEl) {
      const statusMap: Record<string, string> = {
        init: '初始化',
        inspect: '对撞检查',
        swap: '交换中...',
        move: '指针移动',
        done: '反转完成',
      };
      this.metricStatusEl.textContent = statusMap[status] || status;
      this.metricStatusEl.style.color = status === 'done' ? '#10b981' : swapping ? '#3b82f6' : '#0f172a';
    }

    if (this.formulaSwapEl) {
      if (swapping) {
        this.formulaSwapEl.textContent = `swap(s[${left}], s[${right}]) 交换 '${s[right]}' 和 '${s[left]}'`;
      } else {
        this.formulaSwapEl.textContent = 'swap(s[left], s[right])';
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
        status === 'done' ? '#f0fdf4' : swapping ? '#eff6ff' : '#f8fafc';
      logEntry.style.color =
        status === 'done' ? '#15803d' : swapping ? '#1d4ed8' : '#334155';
      logEntry.style.border =
        '1px solid ' +
        (status === 'done' ? '#bbf7d0' : swapping ? '#bfdbfe' : '#e2e8f0');
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
  id: 'reverse-string',
  name: '反转字符串（双指针）',
  viewId: 'algo-reverse-string-view',
  category: 'string',
  description: '首尾双指针原地反转字符数组',
  icon: '↔️',
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握原地反转字符串的双指针法',
  template,
  Visualizer: ReverseStringVisualizer,
});
