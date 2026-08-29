/**
 * 长度最小的子数组可视化器 — 4-Card 标准现代架构
 * LeetCode 209：滑动窗口双指针
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  MIN_SUBARRAY_LEN_PROBLEM_HTML,
  MIN_SUBARRAY_LEN_ANALYSIS_HTML,
  MIN_SUBARRAY_LEN_CODE_LANGUAGES,
} from './min-subarray-len-problem-content';
import template from './min-subarray-len.html?raw';

export interface SWStep {
  array: number[];
  left: number;
  right: number;
  sum: number;
  minLen: number;
  target: number;
  status: 'expand' | 'shrink' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function parsePositiveArray(input: string): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  return arr.length > 0 ? arr : [2, 3, 1, 2, 4, 3];
}

export function buildMinSubarrayLenSteps(nums: number[], target: number): SWStep[] {
  const steps: SWStep[] = [];
  let left = 0;
  let sum = 0;
  let minLen = Infinity;

  steps.push({
    array: [...nums],
    left: 0,
    right: 0,
    sum: 0,
    minLen,
    target,
    status: 'expand',
    message: `初始化 left=0, right=0, sum=0, minLen=∞，目标 target=${target}。准备向右扩展窗口。`,
    log: `初始化滑动窗口：target=${target}`,
    codeLine: 2,
  });

  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];
    steps.push({
      array: [...nums],
      left,
      right,
      sum,
      minLen,
      target,
      status: 'expand',
      message: `右边界扩展 right=${right}：加入 nums[${right}]=${nums[right]}，当前窗口和 sum=${sum}。`,
      log: `扩展 right=${right}，nums[${right}]=${nums[right]}，sum -> ${sum}`,
      codeLine: [4, 5],
    });

    while (sum >= target) {
      const currentLen = right - left + 1;
      minLen = Math.min(minLen, currentLen);
      steps.push({
        array: [...nums],
        left,
        right,
        sum,
        minLen,
        target,
        status: 'shrink',
        message: `sum=${sum} ≥ target(${target})，发现满足条件的窗口 [${left}..${right}]，长度 ${currentLen}，更新 minLen=${minLen}。准备收缩左边界。`,
        log: `达标！窗口长度 ${currentLen}，minLen 更新为 ${minLen}`,
        codeLine: [6, 7],
      });

      sum -= nums[left];
      left++;
      steps.push({
        array: [...nums],
        left,
        right,
        sum,
        minLen,
        target,
        status: 'shrink',
        message: `收缩左边界：移出 nums[${left - 1}]=${nums[left - 1]}，left 右移至 ${left}，当前窗口和 sum=${sum}。`,
        log: `收缩 left -> ${left}，移出 nums[${left - 1}]=${nums[left - 1]}，sum -> ${sum}`,
        codeLine: [8, 9],
      });
    }
  }

  steps.push({
    array: [...nums],
    left,
    right: nums.length,
    sum,
    minLen,
    target,
    status: 'done',
    message:
      minLen === Infinity
        ? `🎉 遍历完成！未找到满足 sum ≥ ${target} 的子数组，返回 0。`
        : `🎉 遍历完成！满足条件的最短连续子数组长度为 minLen = ${minLen}。`,
    log: `算法结束：返回 ${minLen === Infinity ? 0 : minLen}`,
    codeLine: 12,
  });

  return steps;
}

export class MinSubarrayLenVisualizer extends StepVisualizer<SWStep> {
  protected codeLanguages = MIN_SUBARRAY_LEN_CODE_LANGUAGES;
  protected codeLines = MIN_SUBARRAY_LEN_CODE_LANGUAGES['java'];
  protected codePanelTitle = '长度最小的子数组 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private trackRowEl: HTMLElement | null = null;
  private metricLeftEl: HTMLElement | null = null;
  private metricRightEl: HTMLElement | null = null;
  private metricSumEl: HTMLElement | null = null;
  private metricMinLenEl: HTMLElement | null = null;
  private gaugeLabelEl: HTMLElement | null = null;
  private gaugeFillEl: HTMLElement | null = null;
  private gaugeStatusEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.trackRowEl = this.root.querySelector('#sw-track-row');
    this.metricLeftEl = this.root.querySelector('#metric-left');
    this.metricRightEl = this.root.querySelector('#metric-right');
    this.metricSumEl = this.root.querySelector('#metric-sum');
    this.metricMinLenEl = this.root.querySelector('#metric-min-len');
    this.gaugeLabelEl = this.root.querySelector('#gauge-label');
    this.gaugeFillEl = this.root.querySelector('#gauge-fill');
    this.gaugeStatusEl = this.root.querySelector('#gauge-status');
    this.liveTextEl = this.root.querySelector('#sw-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>('.sw-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const numsInput = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
        const targetInput = this.root?.querySelector('#input-target') as HTMLInputElement | null;
        if (numsInput && btn.dataset.nums) numsInput.value = btn.dataset.nums;
        if (targetInput && btn.dataset.target) targetInput.value = btn.dataset.target;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: MIN_SUBARRAY_LEN_PROBLEM_HTML,
      analysisHtml: MIN_SUBARRAY_LEN_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): SWStep[] {
    const numsInput = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
    const targetInput = this.root?.querySelector('#input-target') as HTMLInputElement | null;
    const arr = parsePositiveArray(numsInput?.value || '2, 3, 1, 2, 4, 3');
    const target = parseInt(targetInput?.value || '7', 10);
    return buildMinSubarrayLenSteps(arr, isNaN(target) ? 7 : target);
  }

  protected renderStep(step: SWStep): void {
    const { array, left, right, sum, minLen, target, status, message } = step;

    // 1. 渲染沙盘 Cell 数组
    if (this.trackRowEl) {
      this.trackRowEl.innerHTML = array
        .map((num, idx) => {
          const isLeft = left === idx && status !== 'done';
          const isRight = right === idx && status !== 'done';
          const inWindow = idx >= left && idx <= right && status !== 'done';
          const isMatch = inWindow && sum >= target;

          let boxClasses = 'sw-cell-box';
          if (inWindow) boxClasses += isMatch ? ' window-match' : ' in-window';

          const badges: string[] = [];
          if (isLeft && isRight) {
            badges.push('<span class="sw-ptr-badge left">L</span>');
            badges.push('<span class="sw-ptr-badge right">R</span>');
          } else {
            if (isLeft) badges.push('<span class="sw-ptr-badge left">left</span>');
            if (isRight) badges.push('<span class="sw-ptr-badge right">right</span>');
          }

          return `
            <div class="sw-cell-wrapper">
              <div class="sw-pointer-tags">
                ${badges.join('')}
              </div>
              <div class="${boxClasses}">
                <span class="val">${num}</span>
                <span class="idx">[${idx}]</span>
              </div>
            </div>
          `;
        })
        .join('');
    }

    // 2. 更新状态监视器
    if (this.metricLeftEl) this.metricLeftEl.textContent = status === 'done' ? '结束' : String(left);
    if (this.metricRightEl) this.metricRightEl.textContent = status === 'done' ? '结束' : String(right);
    if (this.metricSumEl) this.metricSumEl.textContent = `${sum} / ${target}`;
    if (this.metricMinLenEl) {
      this.metricMinLenEl.textContent = minLen === Infinity ? '∞' : String(minLen);
    }

    // 进度刻度条
    if (this.gaugeLabelEl) this.gaugeLabelEl.textContent = `sum: ${sum} / target: ${target}`;
    if (this.gaugeFillEl) {
      const percentage = Math.min(100, Math.round((sum / target) * 100));
      this.gaugeFillEl.style.width = `${percentage}%`;
      this.gaugeFillEl.style.background = sum >= target ? '#10b981' : '#3b82f6';
    }
    if (this.gaugeStatusEl) {
      this.gaugeStatusEl.textContent = sum >= target ? '✓ 满足条件' : '未达标';
      this.gaugeStatusEl.style.color = sum >= target ? '#10b981' : '#3b82f6';
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 3. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background = status === 'done' ? '#f0fdf4' : sum >= target ? '#eff6ff' : '#f8fafc';
      logEntry.style.color = status === 'done' ? '#15803d' : sum >= target ? '#1d4ed8' : '#334155';
      logEntry.style.border = '1px solid ' + (status === 'done' ? '#bbf7d0' : sum >= target ? '#bfdbfe' : '#e2e8f0');
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
  id: 'min-subarray-len',
  name: '长度最小的子数组（滑动窗口）',
  viewId: 'algo-min-subarray-len-view',
  category: 'array',
  description: '滑动窗口求和≥target的最短子数组',
  icon: '🪟',
  difficulty: 2,
  levelOrder: 2,
  learningGoal: '理解滑动窗口如何高效维护子数组和',
  template,
  Visualizer: MinSubarrayLenVisualizer,
});
