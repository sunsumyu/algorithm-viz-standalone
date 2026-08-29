/**
 * 二分查找可视化器 — 4-Card 标准现代架构
 * 左闭右闭区间折半、中点动态定位、边界收缩与目标命中
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  BINARY_SEARCH_PROBLEM_HTML,
  BINARY_SEARCH_ANALYSIS_HTML,
  BINARY_SEARCH_CODE_LANGUAGES,
} from './binary-search-problem-content';
import { parseArray } from '../sort/bubble-sort-renderer';
import template from './binary-search.html?raw';

export interface BSStep {
  array: number[];
  left: number;
  right: number;
  mid: number;
  target: number;
  phase: 'init' | 'check-mid' | 'narrow-left' | 'narrow-right' | 'found' | 'not-found';
  status: 'init' | 'check-mid' | 'narrow-left' | 'narrow-right' | 'found' | 'not-found';
  comparisons: number;
  foundIndex: number;
  message: string;
  log: string;
  codeLine: number | number[];
}

export function binarySearchSteps(raw: number[], target: number): BSStep[] {
  const steps: BSStep[] = [];
  const array = [...raw].sort((a, b) => a - b);
  const n = array.length;
  let left = 0;
  let right = n - 1;
  let comparisons = 0;

  steps.push({
    array: [...array],
    left: 0,
    right: n - 1,
    mid: -1,
    target,
    phase: 'init',
    status: 'init',
    comparisons: 0,
    foundIndex: -1,
    message: n === 0 ? '数组为空，无法查找。' : `初始化二分查找：L = 0, R = ${n - 1}，目标 target = ${target}。`,
    log: n === 0 ? '空数组' : `初始化: L=0, R=${n - 1}, target=${target}`,
    codeLine: 3,
  });

  if (n === 0) {
    steps.push({
      array: [],
      left: -1,
      right: -1,
      mid: -1,
      target,
      phase: 'not-found',
      status: 'not-found',
      comparisons: 0,
      foundIndex: -1,
      message: '❌ 数组为空，未找到目标值，返回 -1。',
      log: '未找到 target -> 返回 -1',
      codeLine: 2,
    });
    return steps;
  }

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    const midVal = array[mid];
    comparisons++;

    steps.push({
      array: [...array],
      left,
      right,
      mid,
      target,
      phase: 'check-mid',
      status: 'check-mid',
      comparisons,
      foundIndex: -1,
      message: `计算中点：mid = ${left} + (${right} - ${left}) / 2 = ${mid}，nums[${mid}] = ${midVal}。与 target (${target}) 比较。`,
      log: `计算 mid=${mid} (nums[${mid}]=${midVal})`,
      codeLine: [4, 5, 6],
    });

    if (midVal === target) {
      steps.push({
        array: [...array],
        left,
        right,
        mid,
        target,
        phase: 'found',
        status: 'found',
        comparisons,
        foundIndex: mid,
        message: `🎯 命中目标！nums[${mid}] == ${target}，搜索成功，返回下标 ${mid}。`,
        log: `✓ 命中 target: nums[${mid}] == ${target}`,
        codeLine: 7,
      });
      return steps;
    } else if (midVal > target) {
      right = mid - 1;
      steps.push({
        array: [...array],
        left,
        right,
        mid,
        target,
        phase: 'narrow-right',
        status: 'narrow-right',
        comparisons,
        foundIndex: -1,
        message: `nums[${mid}] (${midVal}) > target (${target})，说明目标在左侧半区。收缩右界：right = mid - 1 = ${right}。`,
        log: `nums[${mid}] > target -> right=${right}`,
        codeLine: [8, 9],
      });
    } else {
      left = mid + 1;
      steps.push({
        array: [...array],
        left,
        right,
        mid,
        target,
        phase: 'narrow-left',
        status: 'narrow-left',
        comparisons,
        foundIndex: -1,
        message: `nums[${mid}] (${midVal}) < target (${target})，说明目标在右侧半区。收缩左界：left = mid + 1 = ${left}。`,
        log: `nums[${mid}] < target -> left=${left}`,
        codeLine: [10, 11],
      });
    }
  }

  steps.push({
    array: [...array],
    left,
    right,
    mid: -1,
    target,
    phase: 'not-found',
    status: 'not-found',
    comparisons,
    foundIndex: -1,
    message: `❌ 搜索结束：left (${left}) > right (${right})，区间为空，target (${target}) 不存在于数组中，返回 -1。`,
    log: `未找到 target -> 返回 -1`,
    codeLine: 14,
  });

  return steps;
}

export class BinarySearchVisualizer extends StepVisualizer<BSStep> {
  protected codeLanguages = BINARY_SEARCH_CODE_LANGUAGES;
  protected codeLines = BINARY_SEARCH_CODE_LANGUAGES['java'];
  protected codePanelTitle = '二分查找 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private trackRowEl: HTMLElement | null = null;
  private metricRangeEl: HTMLElement | null = null;
  private metricMidEl: HTMLElement | null = null;
  private metricTargetEl: HTMLElement | null = null;
  private metricResEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.trackRowEl = this.root.querySelector('#bns-track-row');
    this.metricRangeEl = this.root.querySelector('#metric-range');
    this.metricMidEl = this.root.querySelector('#metric-mid');
    this.metricTargetEl = this.root.querySelector('#metric-target');
    this.metricResEl = this.root.querySelector('#metric-res');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#bns-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>('.bns-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const arrInput = this.root?.querySelector('#input-array') as HTMLInputElement | null;
        const targetInput = this.root?.querySelector('#input-target') as HTMLInputElement | null;
        if (arrInput && btn.dataset.arr) arrInput.value = btn.dataset.arr;
        if (targetInput && btn.dataset.t) targetInput.value = btn.dataset.t;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: BINARY_SEARCH_PROBLEM_HTML,
      analysisHtml: BINARY_SEARCH_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): BSStep[] {
    const arrInput = this.root?.querySelector('#input-array') as HTMLInputElement | null;
    const targetInput = this.root?.querySelector('#input-target') as HTMLInputElement | null;
    const raw = arrInput?.value || '-1, 0, 3, 5, 9, 12';
    const t = parseInt(targetInput?.value || '9', 10);
    const arr = parseArray(raw);
    return binarySearchSteps(arr, isNaN(t) ? 9 : t);
  }

  protected renderStep(step: BSStep): void {
    const { array, left, right, mid, target, phase, foundIndex, message } = step;

    // 1. 渲染二分数组与指针
    if (this.trackRowEl) {
      this.trackRowEl.innerHTML = array
        .map((val, idx) => {
          const isL = idx === left;
          const isR = idx === right;
          const isM = idx === mid;
          const isFound = idx === foundIndex;
          const inRange = idx >= left && idx <= right;

          let tagText = '';
          if (isL && isR) tagText = isM ? 'L,R,M' : 'L,R';
          else if (isL) tagText = isM ? 'L,M' : 'L';
          else if (isR) tagText = isM ? 'R,M' : 'R';
          else if (isM) tagText = 'M';

          let cellClass = 'bns-cell-box';
          if (isFound) cellClass += ' is-found';
          else if (isM) cellClass += ' is-mid';
          else if (inRange) cellClass += ' in-range';
          else cellClass += ' is-dimmed';

          return `
            <div class="bns-cell-wrapper">
              <span class="bns-ptr-tag" style="color:${isFound ? '#10b981' : isM ? '#a855f7' : '#2563eb'};">${tagText}</span>
              <div class="${cellClass}">
                <span class="val">${val}</span>
                <span class="idx">[${idx}]</span>
              </div>
            </div>
          `;
        })
        .join('');
    }

    // 2. 更新状态监视器
    if (this.metricRangeEl) {
      this.metricRangeEl.textContent = left <= right ? `[${left}, ${right}]` : '区间为空';
    }
    if (this.metricMidEl) {
      this.metricMidEl.textContent = mid >= 0 ? `${mid} (${array[mid]})` : '—';
    }
    if (this.metricTargetEl) this.metricTargetEl.textContent = `${target}`;
    if (this.metricResEl) {
      if (phase === 'found') {
        this.metricResEl.textContent = `命中 [${foundIndex}]`;
        this.metricResEl.style.color = '#10b981';
      } else if (phase === 'not-found') {
        this.metricResEl.textContent = '未找到 (-1)';
        this.metricResEl.style.color = '#ef4444';
      } else {
        this.metricResEl.textContent = '搜索中...';
        this.metricResEl.style.color = '#2563eb';
      }
    }

    if (this.formulaActionEl) {
      if (phase === 'check-mid') {
        this.formulaActionEl.textContent = `mid = ${left} + (${right} - ${left}) / 2 = ${mid}`;
      } else if (phase === 'narrow-right') {
        this.formulaActionEl.textContent = `nums[${mid}] (${array[mid]}) > ${target} -> right = ${right}`;
      } else if (phase === 'narrow-left') {
        this.formulaActionEl.textContent = `nums[${mid}] (${array[mid]}) < ${target} -> left = ${left}`;
      } else if (phase === 'found') {
        this.formulaActionEl.textContent = `nums[${mid}] == ${target} 命中返回 ${mid}`;
      } else if (phase === 'not-found') {
        this.formulaActionEl.textContent = 'left > right -> 搜索结束返回 -1';
      } else {
        this.formulaActionEl.textContent = 'mid = left + (right - left) / 2';
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
        phase === 'found' ? '#f0fdf4' : phase === 'not-found' ? '#fff1f2' : '#eff6ff';
      logEntry.style.color =
        phase === 'found' ? '#15803d' : phase === 'not-found' ? '#e11d48' : '#1d4ed8';
      logEntry.style.border =
        '1px solid ' +
        (phase === 'found' ? '#bbf7d0' : phase === 'not-found' ? '#fecdd3' : '#bfdbfe');
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
  id: 'binary-search',
  name: '二分查找',
  viewId: 'algo-binary-search-view',
  category: 'search',
  description: '在有序数组中以 O(log n) 时间定位目标',
  icon: '🔍',
  template,
  Visualizer: BinarySearchVisualizer,
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握二分搜索的标准写法与边界处理',
});
