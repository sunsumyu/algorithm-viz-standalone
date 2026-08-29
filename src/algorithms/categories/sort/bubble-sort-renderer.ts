/**
 * 冒泡排序可视化器 — 4-Card 标准现代架构
 * 相邻比较、元素交换、末尾冒泡到位、早停优化
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  BUBBLE_SORT_PROBLEM_HTML,
  BUBBLE_SORT_ANALYSIS_HTML,
  BUBBLE_SORT_CODE_LANGUAGES,
} from './bubble-sort-problem-content';
import template from './bubble-sort.html?raw';

export interface BSStep {
  array: number[];
  pass: number;
  j: number;
  jNext: number;
  comparisons: number;
  swaps: number;
  sortedTail: number;
  phase: 'init' | 'compare' | 'swap' | 'pass-done' | 'done';
  status: 'init' | 'compare' | 'swap' | 'pass-done' | 'done';
  swapping: boolean;
  message: string;
  log: string;
  codeLine: number | number[];
}

export function parseArray(input: string): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr : [5, 2, 9, 1, 5, 6];
}

export function bubbleSortSteps(input: number[]): BSStep[] {
  const steps: BSStep[] = [];
  const array = [...input];
  const n = array.length;
  let comparisons = 0;
  let swaps = 0;
  let swapped: boolean;

  steps.push({
    array: [...array],
    pass: -1,
    j: -1,
    jNext: -1,
    comparisons: 0,
    swaps: 0,
    sortedTail: 0,
    phase: 'init',
    status: 'init',
    swapping: false,
    message: n === 0 ? '数组为空，无需排序。' : `初始化：数组长度 n = ${n}，共需最多 ${n - 1} 轮冒泡。`,
    log: n === 0 ? '空数组' : `初始化: [${array.join(', ')}]`,
    codeLine: 2,
  });

  if (n <= 1) {
    steps.push({
      array: [...array],
      pass: 0,
      j: -1,
      jNext: -1,
      comparisons: 0,
      swaps: 0,
      sortedTail: n,
      phase: 'done',
      status: 'done',
      swapping: false,
      message: '✅ 排序完成！',
      log: '排序完成',
      codeLine: 12,
    });
    return steps;
  }

  for (let i = 0; i < n - 1; i++) {
    swapped = false;

    for (let j = 0; j < n - 1 - i; j++) {
      comparisons++;
      const cmp = array[j] > array[j + 1];

      steps.push({
        array: [...array],
        pass: i + 1,
        j,
        jNext: j + 1,
        comparisons,
        swaps,
        sortedTail: i,
        phase: 'compare',
        status: 'compare',
        swapping: false,
        message: `第 ${i + 1} 轮：比较 arr[${j}] (${array[j]}) 与 arr[${j + 1}] (${array[j + 1]})${
          cmp ? '，需要交换' : '，无需交换'
        }。`,
        log: `比较 [${j}] (${array[j]}) vs [${j + 1}] (${array[j + 1]})`,
        codeLine: 6,
      });

      if (cmp) {
        const temp = array[j];
        array[j] = array[j + 1];
        array[j + 1] = temp;
        swaps++;
        swapped = true;

        steps.push({
          array: [...array],
          pass: i + 1,
          j,
          jNext: j + 1,
          comparisons,
          swaps,
          sortedTail: i,
          phase: 'swap',
          status: 'swap',
          swapping: true,
          message: `交换 arr[${j}] 与 arr[${j + 1}]：${temp} ⇋ ${array[j]}。`,
          log: `交换 [${j}] ⇋ [${j + 1}] (${temp} ⇋ ${array[j]})`,
          codeLine: [7, 8, 9, 10],
        });
      }
    }

    const settledVal = array[n - 1 - i];
    steps.push({
      array: [...array],
      pass: i + 1,
      j: -1,
      jNext: -1,
      comparisons,
      swaps,
      sortedTail: i + 1,
      phase: 'pass-done',
      status: 'pass-done',
      swapping: false,
      message: `第 ${i + 1} 轮结束：当前最大值 ${settledVal} 已冒泡沉底至下标 ${n - 1 - i}。`,
      log: `第 ${i + 1} 轮结束，末尾 ${settledVal} 就位`,
      codeLine: 12,
    });

    if (!swapped) {
      steps.push({
        array: [...array],
        pass: i + 1,
        j: -1,
        jNext: -1,
        comparisons,
        swaps,
        sortedTail: n,
        phase: 'done',
        status: 'done',
        swapping: false,
        message: '⚡ 早停触发：本轮未发生任何交换，数组已完全有序！',
        log: '早停退出: 数组已有序',
        codeLine: 12,
      });
      return steps;
    }
  }

  steps.push({
    array: [...array],
    pass: n - 1,
    j: -1,
    jNext: -1,
    comparisons,
    swaps,
    sortedTail: n,
    phase: 'done',
    status: 'done',
    swapping: false,
    message: `🎉 冒泡排序完成！共比较 ${comparisons} 次，交换 ${swaps} 次。最终数组：[${array.join(', ')}]。`,
    log: `✓ 排序完成: [${array.join(', ')}]`,
    codeLine: 14,
  });

  return steps;
}

export class BubbleSortVisualizer extends StepVisualizer<BSStep> {
  protected codeLanguages = BUBBLE_SORT_CODE_LANGUAGES;
  protected codeLines = BUBBLE_SORT_CODE_LANGUAGES['java'];
  protected codePanelTitle = '冒泡排序 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private barsContainerEl: HTMLElement | null = null;
  private metricPassEl: HTMLElement | null = null;
  private metricJEl: HTMLElement | null = null;
  private metricCompSwapEl: HTMLElement | null = null;
  private metricSortedCountEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.barsContainerEl = this.root.querySelector('#bs-bars-container');
    this.metricPassEl = this.root.querySelector('#metric-pass');
    this.metricJEl = this.root.querySelector('#metric-j');
    this.metricCompSwapEl = this.root.querySelector('#metric-comp-swap');
    this.metricSortedCountEl = this.root.querySelector('#metric-sorted-count');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#bs-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>.bind(this.root)('.bs-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const arrInput = this.root?.querySelector('#input-array') as HTMLInputElement | null;
        if (arrInput && btn.dataset.arr) arrInput.value = btn.dataset.arr;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: BUBBLE_SORT_PROBLEM_HTML,
      analysisHtml: BUBBLE_SORT_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): BSStep[] {
    const arrInput = this.root?.querySelector('#input-array') as HTMLInputElement | null;
    const raw = arrInput?.value || '5, 2, 9, 1, 5, 6';
    const arr = parseArray(raw);
    return bubbleSortSteps(arr);
  }

  protected renderStep(step: BSStep): void {
    const { array, pass, j, jNext, comparisons, swaps, sortedTail, phase, swapping, message } = step;

    // 1. 渲染柱状图
    if (this.barsContainerEl) {
      const maxVal = Math.max(...array, 1);
      this.barsContainerEl.innerHTML = array
        .map((val, idx) => {
          const isComparing = (idx === j || idx === jNext) && !swapping && phase === 'compare';
          const isSwapping = (idx === j || idx === jNext) && swapping;
          const isSorted = idx >= array.length - sortedTail || phase === 'done';

          let pillarClass = 'bs-bar-pillar';
          if (isSwapping) pillarClass += ' is-swapping';
          else if (isComparing) pillarClass += ' is-comparing';
          else if (isSorted) pillarClass += ' is-sorted';

          const heightPct = Math.max(18, Math.round((val / maxVal) * 100));

          return `
            <div class="bs-bar-wrapper">
              <div class="${pillarClass}" style="height: ${heightPct}%;">
                <span>${val}</span>
              </div>
              <span class="bs-bar-idx">${idx}</span>
            </div>
          `;
        })
        .join('');
    }

    // 2. 更新状态监视器
    if (this.metricPassEl) this.metricPassEl.textContent = pass >= 0 ? String(pass) : '—';
    if (this.metricJEl) {
      this.metricJEl.textContent = j >= 0 && jNext >= 0 ? `[${j}, ${jNext}]` : '—';
    }
    if (this.metricCompSwapEl) {
      this.metricCompSwapEl.textContent = `${comparisons} / ${swaps}`;
    }
    if (this.metricSortedCountEl) {
      this.metricSortedCountEl.textContent = `${sortedTail} / ${array.length}`;
    }

    if (this.formulaActionEl) {
      if (swapping) {
        this.formulaActionEl.textContent = `swap(arr[${j}], arr[${jNext}]) 交换`;
      } else if (phase === 'compare') {
        this.formulaActionEl.textContent = `arr[${j}] (${array[j]}) ${
          array[j] > array[jNext] ? '>' : '<='
        } arr[${jNext}] (${array[jNext]})`;
      } else if (phase === 'pass-done') {
        this.formulaActionEl.textContent = `第 ${pass} 轮结束，末尾就位`;
      } else if (phase === 'done') {
        this.formulaActionEl.textContent = '排序完成';
      } else {
        this.formulaActionEl.textContent = 'compare(arr[j], arr[j+1])';
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
        phase === 'done' ? '#f0fdf4' : swapping ? '#fff1f2' : '#eff6ff';
      logEntry.style.color =
        phase === 'done' ? '#15803d' : swapping ? '#e11d48' : '#1d4ed8';
      logEntry.style.border =
        '1px solid ' +
        (phase === 'done' ? '#bbf7d0' : swapping ? '#fecdd3' : '#bfdbfe');
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
  id: 'bubble-sort',
  name: '冒泡排序',
  viewId: 'algo-bubble-sort-view',
  category: 'sort',
  description: '逐步演示冒泡排序：相邻元素比较、交换、冒泡到位',
  icon: '🌪️',
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '理解冒泡排序的相邻比较和元素冒泡过程',
  template,
  Visualizer: BubbleSortVisualizer,
});
