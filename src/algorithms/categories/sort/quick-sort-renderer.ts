/**
 * 快速排序可视化器 — 4-Card 标准现代架构
 * 递归分治、双指针 Partition、基准值精准归位
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  QUICK_SORT_PROBLEM_HTML,
  QUICK_SORT_ANALYSIS_HTML,
  QUICK_SORT_CODE_LANGUAGES,
} from './quick-sort-problem-content';
import { parseArray } from './bubble-sort-renderer';
import template from './quick-sort.html?raw';

export interface QSStep {
  array: number[];
  left: number;
  right: number;
  pivotIdx: number;
  pivotVal: number;
  i: number;
  j: number;
  comparisons: number;
  swaps: number;
  settledIndices: number[];
  swapping: boolean;
  phase: 'init' | 'pick-pivot' | 'scan-j' | 'scan-i' | 'swap-ij' | 'pivot-settled' | 'done';
  status: 'init' | 'pick-pivot' | 'scan-j' | 'scan-i' | 'swap-ij' | 'pivot-settled' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function quickSortSteps(input: number[]): QSStep[] {
  const steps: QSStep[] = [];
  const array = [...input];
  const n = array.length;
  const settledIndices: number[] = [];
  let comparisons = 0;
  let swaps = 0;

  steps.push({
    array: [...array],
    left: -1,
    right: -1,
    pivotIdx: -1,
    pivotVal: -1,
    i: -1,
    j: -1,
    comparisons: 0,
    swaps: 0,
    settledIndices: [],
    swapping: false,
    phase: 'init',
    status: 'init',
    message: n === 0 ? '数组为空，无需排序。' : `初始化快速排序：数组长度 n = ${n}，采用双指针向内夹逼 Partition。`,
    log: n === 0 ? '空数组' : `初始化: [${array.join(', ')}]`,
    codeLine: 2,
  });

  if (n <= 1) {
    steps.push({
      array: [...array],
      left: 0,
      right: 0,
      pivotIdx: 0,
      pivotVal: array[0] ?? 0,
      i: 0,
      j: 0,
      comparisons: 0,
      swaps: 0,
      settledIndices: n === 1 ? [0] : [],
      swapping: false,
      phase: 'done',
      status: 'done',
      message: '✅ 排序完成！',
      log: '排序完成',
      codeLine: 5,
    });
    return steps;
  }

  const sort = (l: number, r: number) => {
    if (l >= r) {
      if (l === r && !settledIndices.includes(l)) settledIndices.push(l);
      return;
    }

    const pivotVal = array[l];
    let i = l;
    let j = r;

    steps.push({
      array: [...array],
      left: l,
      right: r,
      pivotIdx: l,
      pivotVal,
      i,
      j,
      comparisons,
      swaps,
      settledIndices: [...settledIndices],
      swapping: false,
      phase: 'pick-pivot',
      status: 'pick-pivot',
      message: `区间 [${l}..${r}] 划分：选定基准值 pivot = arr[${l}] (${pivotVal})，指针 i=${i}, j=${j}。`,
      log: `区间 [${l}..${r}]: pivot = ${pivotVal}`,
      codeLine: [9, 10],
    });

    while (i < j) {
      while (i < j && array[j] >= pivotVal) {
        comparisons++;
        steps.push({
          array: [...array],
          left: l,
          right: r,
          pivotIdx: l,
          pivotVal,
          i,
          j,
          comparisons,
          swaps,
          settledIndices: [...settledIndices],
          swapping: false,
          phase: 'scan-j',
          status: 'scan-j',
          message: `右指针 j 向左扫描：arr[${j}] (${array[j]}) &ge; pivot (${pivotVal})，右指针左移。`,
          log: `j 左移: arr[${j}] (${array[j]}) >= pivot`,
          codeLine: 12,
        });
        j--;
      }

      while (i < j && array[i] <= pivotVal) {
        comparisons++;
        steps.push({
          array: [...array],
          left: l,
          right: r,
          pivotIdx: l,
          pivotVal,
          i,
          j,
          comparisons,
          swaps,
          settledIndices: [...settledIndices],
          swapping: false,
          phase: 'scan-i',
          status: 'scan-i',
          message: `左指针 i 向右扫描：arr[${i}] (${array[i]}) &le; pivot (${pivotVal})，左指针右移。`,
          log: `i 右移: arr[${i}] (${array[i]}) <= pivot`,
          codeLine: 13,
        });
        i++;
      }

      if (i < j) {
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
        swaps++;

        steps.push({
          array: [...array],
          left: l,
          right: r,
          pivotIdx: l,
          pivotVal,
          i,
          j,
          comparisons,
          swaps,
          settledIndices: [...settledIndices],
          swapping: true,
          phase: 'swap-ij',
          status: 'swap-ij',
          message: `双向交换：交换 arr[${i}] 与 arr[${j}] (${temp} ⇋ ${array[i]})。`,
          log: `交换 [${i}] ⇋ [${j}] (${temp} ⇋ ${array[i]})`,
          codeLine: [14, 15, 16],
        });
      }
    }

    // 将基准值归位到相遇点 i
    array[l] = array[i];
    array[i] = pivotVal;
    if (l !== i) swaps++;
    settledIndices.push(i);

    steps.push({
      array: [...array],
      left: l,
      right: r,
      pivotIdx: i,
      pivotVal,
      i,
      j: i,
      comparisons,
      swaps,
      settledIndices: [...settledIndices],
      swapping: true,
      phase: 'pivot-settled',
      status: 'pivot-settled',
      message: `基准归位：将 pivot (${pivotVal}) 放入相遇点下标 ${i}。左侧全部 &le; ${pivotVal}，右侧全部 &ge; ${pivotVal}。`,
      log: `Pivot ${pivotVal} 就位于下标 ${i}`,
      codeLine: [18, 19],
    });

    sort(l, i - 1);
    sort(i + 1, r);
  };

  sort(0, n - 1);

  steps.push({
    array: [...array],
    left: 0,
    right: n - 1,
    pivotIdx: -1,
    pivotVal: -1,
    i: -1,
    j: -1,
    comparisons,
    swaps,
    settledIndices: Array.from({ length: n }, (_, idx) => idx),
    swapping: false,
    phase: 'done',
    status: 'done',
    message: `🎉 快速排序完成！共比较 ${comparisons} 次，交换 ${swaps} 次。最终数组：[${array.join(', ')}]。`,
    log: `✓ 排序完成: [${array.join(', ')}]`,
    codeLine: 5,
  });

  return steps;
}

export class QuickSortVisualizer extends StepVisualizer<QSStep> {
  protected codeLanguages = QUICK_SORT_CODE_LANGUAGES;
  protected codeLines = QUICK_SORT_CODE_LANGUAGES['java'];
  protected codePanelTitle = '快速排序 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private barsContainerEl: HTMLElement | null = null;
  private metricRangeEl: HTMLElement | null = null;
  private metricPivotEl: HTMLElement | null = null;
  private metricIJEl: HTMLElement | null = null;
  private metricCompSwapEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.barsContainerEl = this.root.querySelector('#qs-bars-container');
    this.metricRangeEl = this.root.querySelector('#metric-range');
    this.metricPivotEl = this.root.querySelector('#metric-pivot');
    this.metricIJEl = this.root.querySelector('#metric-ij');
    this.metricCompSwapEl = this.root.querySelector('#metric-comp-swap');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#qs-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>('.qs-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const arrInput = this.root?.querySelector('#input-array') as HTMLInputElement | null;
        if (arrInput && btn.dataset.arr) arrInput.value = btn.dataset.arr;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: QUICK_SORT_PROBLEM_HTML,
      analysisHtml: QUICK_SORT_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): QSStep[] {
    const arrInput = this.root?.querySelector('#input-array') as HTMLInputElement | null;
    const raw = arrInput?.value || '6, 1, 2, 7, 9, 3, 4, 5, 10, 8';
    const arr = parseArray(raw);
    return quickSortSteps(arr);
  }

  protected renderStep(step: QSStep): void {
    const { array, left, right, pivotIdx, pivotVal, i, j, comparisons, swaps, settledIndices, swapping, phase, message } = step;

    // 1. 渲染柱状图
    if (this.barsContainerEl) {
      const maxVal = Math.max(...array, 1);
      this.barsContainerEl.innerHTML = array
        .map((val, idx) => {
          const isPivot = idx === pivotIdx && phase !== 'done';
          const isIPtr = idx === i && phase !== 'done';
          const isJPtr = idx === j && phase !== 'done';
          const isSwapping = (idx === i || idx === j || (phase === 'pivot-settled' && (idx === left || idx === i))) && swapping;
          const isSettled = settledIndices.includes(idx) || phase === 'done';

          let pillarClass = 'qs-bar-pillar';
          if (isSwapping) pillarClass += ' is-swapping';
          else if (isPivot) pillarClass += ' is-pivot';
          else if (isIPtr) pillarClass += ' is-i-ptr';
          else if (isJPtr) pillarClass += ' is-j-ptr';
          else if (isSettled) pillarClass += ' is-settled';

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
    if (this.metricRangeEl) {
      this.metricRangeEl.textContent = left >= 0 && right >= 0 ? `[${left}, ${right}]` : '—';
    }
    if (this.metricPivotEl) {
      this.metricPivotEl.textContent = pivotVal >= 0 && phase !== 'done' ? `${pivotVal}` : '—';
    }
    if (this.metricIJEl) {
      this.metricIJEl.textContent = i >= 0 && j >= 0 ? `[${i}, ${j}]` : '—';
    }
    if (this.metricCompSwapEl) {
      this.metricCompSwapEl.textContent = `${comparisons} / ${swaps}`;
    }

    if (this.formulaActionEl) {
      if (swapping) {
        this.formulaActionEl.textContent = `swap(arr[${i}], arr[${j}]) 交换`;
      } else if (phase === 'scan-j') {
        this.formulaActionEl.textContent = `arr[${j}] (${array[j]}) >= pivot (${pivotVal}) (j--)`;
      } else if (phase === 'scan-i') {
        this.formulaActionEl.textContent = `arr[${i}] (${array[i]}) <= pivot (${pivotVal}) (i++)`;
      } else if (phase === 'pivot-settled') {
        this.formulaActionEl.textContent = `pivot (${pivotVal}) 归位于下标 ${i}`;
      } else if (phase === 'done') {
        this.formulaActionEl.textContent = '快速排序完成';
      } else {
        this.formulaActionEl.textContent = 'partition(arr, left, right)';
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
    const stepCurEl = this.root?.querySelector('#step-cur');
    const stepTotalEl = this.root?.querySelector('#step-total');
    if (stepCurEl) stepCurEl.textContent = String(this.currentStepIndex + 1);
    if (stepTotalEl) stepTotalEl.textContent = String(this.steps.length);

    const badgeRange = this.root?.querySelector('#badge-range');
    if (badgeRange) {
      badgeRange.textContent = left >= 0 && right >= 0 ? `区间: [${left}..${right}]` : '未开始';
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
  id: 'quick-sort',
  name: '快速排序',
  viewId: 'algo-quick-sort-view',
  category: 'sort',
  description: '逐步演示快速排序：基准值选择、双向扫描划分、递归分治',
  icon: '⚡',
  difficulty: 2,
  levelOrder: 6,
  learningGoal: '理解快速排序的基准划分、双指针碰撞和递归过程',
  template,
  Visualizer: QuickSortVisualizer,
});
