/**
 * 堆排序可视化器 — 4-Card 标准现代架构
 * 大顶堆构建、堆顶元素提取、Sift-Down 下沉调整
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  HEAP_SORT_PROBLEM_HTML,
  HEAP_SORT_ANALYSIS_HTML,
  HEAP_SORT_CODE_LANGUAGES,
} from './heap-sort-problem-content';
import { parseArray } from './bubble-sort-renderer';
import template from './heap-sort.html?raw';

export interface HSStep {
  array: number[];
  heapSize: number;
  rootIdx: number;
  leftChild: number;
  rightChild: number;
  largestIdx: number;
  comparisons: number;
  swaps: number;
  settledCount: number;
  swapping: boolean;
  phase: 'init' | 'build-heap' | 'heapify-compare' | 'heapify-swap' | 'extract-max' | 'done';
  status: 'init' | 'build-heap' | 'heapify-compare' | 'heapify-swap' | 'extract-max' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function heapSortSteps(input: number[]): HSStep[] {
  const steps: HSStep[] = [];
  const array = [...input];
  const n = array.length;
  let comparisons = 0;
  let swaps = 0;

  steps.push({
    array: [...array],
    heapSize: n,
    rootIdx: -1,
    leftChild: -1,
    rightChild: -1,
    largestIdx: -1,
    comparisons: 0,
    swaps: 0,
    settledCount: 0,
    swapping: false,
    phase: 'init',
    status: 'init',
    message: n === 0 ? '数组为空，无需排序。' : `初始化堆排序：数组长度 n = ${n}，准备自底向上构建大顶堆。`,
    log: n === 0 ? '空数组' : `初始化: [${array.join(', ')}]`,
    codeLine: 2,
  });

  if (n <= 1) {
    steps.push({
      array: [...array],
      heapSize: n,
      rootIdx: 0,
      leftChild: -1,
      rightChild: -1,
      largestIdx: 0,
      comparisons: 0,
      swaps: 0,
      settledCount: n,
      swapping: false,
      phase: 'done',
      status: 'done',
      message: '✅ 排序完成！',
      log: '排序完成',
      codeLine: 10,
    });
    return steps;
  }

  const heapify = (size: number, i: number, inBuild: boolean) => {
    let largest = i;
    const l = 2 * i + 1;
    const r = 2 * i + 2;

    if (l < size) {
      comparisons++;
      if (array[l] > array[largest]) largest = l;
    }
    if (r < size) {
      comparisons++;
      if (array[r] > array[largest]) largest = r;
    }

    steps.push({
      array: [...array],
      heapSize: size,
      rootIdx: i,
      leftChild: l < size ? l : -1,
      rightChild: r < size ? r : -1,
      largestIdx: largest,
      comparisons,
      swaps,
      settledCount: n - size,
      swapping: false,
      phase: 'heapify-compare',
      status: 'heapify-compare',
      message: `${inBuild ? '建堆' : '调整'}下沉：节点 arr[${i}] (${array[i]}) 与子节点 [${l < size ? array[l] : '—'}, ${
        r < size ? array[r] : '—'
      }] 比对，最大值候选为 arr[${largest}] (${array[largest]})。`,
      log: `heapify [${i}]: largest = [${largest}] (${array[largest]})`,
      codeLine: [14, 15, 16],
    });

    if (largest !== i) {
      const temp = array[i];
      array[i] = array[largest];
      array[largest] = temp;
      swaps++;

      steps.push({
        array: [...array],
        heapSize: size,
        rootIdx: i,
        leftChild: l < size ? l : -1,
        rightChild: r < size ? r : -1,
        largestIdx: largest,
        comparisons,
        swaps,
        settledCount: n - size,
        swapping: true,
        phase: 'heapify-swap',
        status: 'heapify-swap',
        message: `执行下沉交换：arr[${i}] 与 arr[${largest}] 交换 (${temp} ⇋ ${array[i]})，并继续向下递归。`,
        log: `下沉交换 [${i}] ⇋ [${largest}] (${temp} ⇋ ${array[i]})`,
        codeLine: [17, 18, 19],
      });

      heapify(size, largest, inBuild);
    }
  };

  // 1. 构建初始大顶堆
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    steps.push({
      array: [...array],
      heapSize: n,
      rootIdx: i,
      leftChild: 2 * i + 1,
      rightChild: 2 * i + 2 < n ? 2 * i + 2 : -1,
      largestIdx: i,
      comparisons,
      swaps,
      settledCount: 0,
      swapping: false,
      phase: 'build-heap',
      status: 'build-heap',
      message: `构建大顶堆：自底向上处理非叶节点下标 ${i} (值为 ${array[i]})。`,
      log: `建堆处理节点 [${i}]`,
      codeLine: [4, 5],
    });
    heapify(n, i, true);
  }

  // 2. 依次提取堆顶
  for (let i = n - 1; i > 0; i--) {
    const maxVal = array[0];
    const temp = array[0];
    array[0] = array[i];
    array[i] = temp;
    swaps++;

    steps.push({
      array: [...array],
      heapSize: i,
      rootIdx: 0,
      leftChild: -1,
      rightChild: -1,
      largestIdx: -1,
      comparisons,
      swaps,
      settledCount: n - i,
      swapping: true,
      phase: 'extract-max',
      status: 'extract-max',
      message: `提取堆顶最大值：将堆顶 ${maxVal} 与当前堆末尾 arr[${i}] (${temp}) 交换归位，堆容量减至 ${i}。`,
      log: `提取堆顶 ${maxVal} 归位至 [${i}]`,
      codeLine: [8, 9],
    });

    heapify(i, 0, false);
  }

  steps.push({
    array: [...array],
    heapSize: 0,
    rootIdx: -1,
    leftChild: -1,
    rightChild: -1,
    largestIdx: -1,
    comparisons,
    swaps,
    settledCount: n,
    swapping: false,
    phase: 'done',
    status: 'done',
    message: `🎉 堆排序完成！共比较 ${comparisons} 次，交换 ${swaps} 次。最终数组：[${array.join(', ')}]。`,
    log: `✓ 排序完成: [${array.join(', ')}]`,
    codeLine: 10,
  });

  return steps;
}

export class HeapSortVisualizer extends StepVisualizer<HSStep> {
  protected codeLanguages = HEAP_SORT_CODE_LANGUAGES;
  protected codeLines = HEAP_SORT_CODE_LANGUAGES['java'];
  protected codePanelTitle = '堆排序 代码调试';

  private barsContainerEl: HTMLElement | null = null;
  private metricHeapSizeEl: HTMLElement | null = null;
  private metricRootEl: HTMLElement | null = null;
  private metricLargestEl: HTMLElement | null = null;
  private metricCompSwapEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.barsContainerEl = this.root.querySelector('#hs-bars-container');
    this.metricHeapSizeEl = this.root.querySelector('#metric-heap-size');
    this.metricRootEl = this.root.querySelector('#metric-root');
    this.metricLargestEl = this.root.querySelector('#metric-largest');
    this.metricCompSwapEl = this.root.querySelector('#metric-comp-swap');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#hs-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.hs-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const arrInput = this.root?.querySelector('#input-array') as HTMLInputElement | null;
        if (arrInput && btn.dataset.arr) arrInput.value = btn.dataset.arr;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: HEAP_SORT_PROBLEM_HTML,
      analysisHtml: HEAP_SORT_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): HSStep[] {
    const arrInput = this.root?.querySelector('#input-array') as HTMLInputElement | null;
    const raw = arrInput?.value || '4, 10, 3, 5, 1';
    const arr = parseArray(raw);
    return heapSortSteps(arr);
  }

  protected renderStep(step: HSStep): void {
    const { array, heapSize, rootIdx, leftChild, rightChild, largestIdx, comparisons, swaps, settledCount, swapping, phase, message } = step;

    // 1. 渲染柱状图
    if (this.barsContainerEl) {
      const maxVal = Math.max(...array, 1);
      this.barsContainerEl.innerHTML = array
        .map((val, idx) => {
          const isRoot = idx === rootIdx && phase !== 'done';
          const isChild = (idx === leftChild || idx === rightChild) && phase !== 'done';
          const isSwapping = (idx === rootIdx || idx === largestIdx || (phase === 'extract-max' && (idx === 0 || idx === heapSize))) && swapping;
          const isSettled = idx >= array.length - settledCount || phase === 'done';

          let pillarClass = 'hs-bar-pillar';
          if (isSwapping) pillarClass += ' is-swapping';
          else if (isRoot) pillarClass += ' is-root';
          else if (isChild) pillarClass += ' is-child';
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
    if (this.metricHeapSizeEl) this.metricHeapSizeEl.textContent = `${heapSize}`;
    if (this.metricRootEl) this.metricRootEl.textContent = rootIdx >= 0 ? `${rootIdx} (${array[rootIdx]})` : '—';
    if (this.metricLargestEl) {
      this.metricLargestEl.textContent = largestIdx >= 0 ? `${largestIdx} (${array[largestIdx]})` : '—';
    }
    if (this.metricCompSwapEl) {
      this.metricCompSwapEl.textContent = `${comparisons} / ${swaps}`;
    }

    if (this.formulaActionEl) {
      if (swapping) {
        this.formulaActionEl.textContent = `swap(arr[${rootIdx}], arr[${largestIdx}]) 下沉`;
      } else if (phase === 'heapify-compare') {
        this.formulaActionEl.textContent = `heapify(arr, size=${heapSize}, root=${rootIdx})`;
      } else if (phase === 'extract-max') {
        this.formulaActionEl.textContent = `extractMax(arr[0] -> arr[${heapSize}])`;
      } else if (phase === 'done') {
        this.formulaActionEl.textContent = '堆排序完成';
      } else {
        this.formulaActionEl.textContent = 'buildMaxHeap(arr, n)';
      }
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 3. 更新日志流
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let bg =
          st.phase === 'done' ? '#f0fdf4' : st.swapping ? '#fff1f2' : '#eff6ff';
        let color =
          st.phase === 'done' ? '#15803d' : st.swapping ? '#e11d48' : '#1d4ed8';
        let border =
          st.phase === 'done' ? '#bbf7d0' : st.swapping ? '#fecdd3' : '#bfdbfe';
        return `<div style="padding: 4px 8px; border-radius: 6px; background: ${bg}; color: ${color}; border: 1px solid ${border}; margin-bottom: 4px;">
          <span style="color:#94a3b8;">[Step ${idx + 1}]</span> ${st.log}
        </div>`;
      });
      this.logContainer.innerHTML = logs.join('');
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.currentIndex + 1} 条记录`;
      }
    }

    const badgeHeapSize = this.root?.querySelector('#badge-heap-size');
    if (badgeHeapSize) badgeHeapSize.textContent = `堆容量: ${heapSize}`;
  }
}

registerAlgorithm({
  id: 'heap-sort',
  name: '堆排序',
  viewId: 'algo-heap-sort-view',
  category: 'sort',
  description: '逐步演示堆排序：构建大顶堆、交换堆顶并下沉调整',
  icon: '🌲',
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '掌握大顶堆的构建过程与堆顶元素的下沉调整',
  template,
  Visualizer: HeapSortVisualizer,
});
