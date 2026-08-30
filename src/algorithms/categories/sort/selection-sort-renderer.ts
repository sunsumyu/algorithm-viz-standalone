/**
 * 选择排序可视化器 — 4-Card 标准现代架构
 * 极值扫描、最小值锁定、原地单次交换、前缀有序扩展
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  SELECTION_SORT_PROBLEM_HTML,
  SELECTION_SORT_ANALYSIS_HTML,
  SELECTION_SORT_CODE_LANGUAGES,
} from './selection-sort-problem-content';
import { parseArray } from './bubble-sort-renderer';
import template from './selection-sort.html?raw';

export interface SSStep {
  array: number[];
  i: number;
  minIdx: number;
  j: number;
  comparisons: number;
  swaps: number;
  sortedCount: number;
  phase: 'init' | 'scan' | 'compare' | 'update-min' | 'swap' | 'pass-done' | 'done';
  status: 'init' | 'scan' | 'compare' | 'update-min' | 'swap' | 'pass-done' | 'done';
  swapping: boolean;
  message: string;
  log: string;
  codeLine: number | number[];
}

export function selectionSortSteps(inputArr: number[]): SSStep[] {
  const steps: SSStep[] = [];
  const array = [...inputArr];
  const n = array.length;
  let comparisons = 0;
  let swaps = 0;

  steps.push({
    array: [...array],
    i: 0,
    minIdx: 0,
    j: -1,
    comparisons: 0,
    swaps: 0,
    sortedCount: 0,
    phase: 'init',
    status: 'init',
    swapping: false,
    message: `准备开始选择排序，待排序数组长度为 ${n}。`,
    log: `初始化数组: [${array.join(', ')}]`,
    codeLine: 2,
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    steps.push({
      array: [...array],
      i,
      minIdx,
      j: -1,
      comparisons,
      swaps,
      sortedCount: i,
      phase: 'scan',
      status: 'scan',
      swapping: false,
      message: `第 ${i + 1} 轮：假设当前区间 [${i}..${n - 1}] 的最小值为下标 ${i} 处的元素 (${array[i]})。`,
      log: `第 ${i + 1} 轮: 设初始最小值 minIdx = ${i} (${array[i]})`,
      codeLine: 4,
    });

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      const isSmaller = array[j] < array[minIdx];

      steps.push({
        array: [...array],
        i,
        minIdx,
        j,
        comparisons,
        swaps,
        sortedCount: i,
        phase: 'compare',
        status: 'compare',
        swapping: false,
        message: `比较 arr[${j}] (${array[j]}) 与当前已知最小值 arr[${minIdx}] (${array[minIdx]})${
          isSmaller ? '，发现更小值！' : '，未打破最小值。'
        }`,
        log: `比较 [${j}] (${array[j]}) vs 最小 [${minIdx}] (${array[minIdx]})`,
        codeLine: 6,
      });

      if (isSmaller) {
        minIdx = j;

        steps.push({
          array: [...array],
          i,
          minIdx,
          j,
          comparisons,
          swaps,
          sortedCount: i,
          phase: 'update-min',
          status: 'update-min',
          swapping: false,
          message: `更新最小值索引：minIdx = ${minIdx} (值 ${array[minIdx]})。`,
          log: `更新 minIdx = ${minIdx} (${array[minIdx]})`,
          codeLine: 7,
        });
      }
    }

    if (minIdx !== i) {
      const temp = array[i];
      array[i] = array[minIdx];
      array[minIdx] = temp;
      swaps++;

      steps.push({
        array: [...array],
        i,
        minIdx,
        j: -1,
        comparisons,
        swaps,
        sortedCount: i,
        phase: 'swap',
        status: 'swap',
        swapping: true,
        message: `将本轮找到的最小值 ${array[i]} 与 arr[${i}] (${temp}) 进行交换，归位到已排序区末尾。`,
        log: `交换 [${i}] ⇋ [${minIdx}] (${temp} ⇋ ${array[i]})`,
        codeLine: [9, 10, 11],
      });
    }

    steps.push({
      array: [...array],
      i,
      minIdx: i,
      j: -1,
      comparisons,
      swaps,
      sortedCount: i + 1,
      phase: 'pass-done',
      status: 'pass-done',
      swapping: false,
      message: `第 ${i + 1} 轮结束：下标 ${i} (值 ${array[i]}) 已就位，左侧已排序区扩充至 [0..${i}]。`,
      log: `第 ${i + 1} 轮结束，[0..${i}] 已有序`,
      codeLine: 13,
    });
  }

  steps.push({
    array: [...array],
    i: n - 1,
    minIdx: n - 1,
    j: -1,
    comparisons,
    swaps,
    sortedCount: n,
    phase: 'done',
    status: 'done',
    swapping: false,
    message: `🎉 选择排序完成！共比较 ${comparisons} 次，仅执行 ${swaps} 次交换。最终数组：[${array.join(', ')}]。`,
    log: `✓ 排序完成: [${array.join(', ')}]`,
    codeLine: 14,
  });

  return steps;
}

export class SelectionSortVisualizer extends StepVisualizer<SSStep> {
  protected codeLanguages = SELECTION_SORT_CODE_LANGUAGES;
  protected codeLines = SELECTION_SORT_CODE_LANGUAGES['java'];
  protected codePanelTitle = '选择排序 代码调试';

  private barsContainerEl: HTMLElement | null = null;
  private metricIEl: HTMLElement | null = null;
  private metricMinIdxEl: HTMLElement | null = null;
  private metricJEl: HTMLElement | null = null;
  private metricCompSwapEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.barsContainerEl = this.root.querySelector('#ss-bars-container');
    this.metricIEl = this.root.querySelector('#metric-i');
    this.metricMinIdxEl = this.root.querySelector('#metric-min-idx');
    this.metricJEl = this.root.querySelector('#metric-j');
    this.metricCompSwapEl = this.root.querySelector('#metric-comp-swap');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#ss-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.ss-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const arrInput = this.root?.querySelector('#input-array') as HTMLInputElement | null;
        if (arrInput && btn.dataset.arr) arrInput.value = btn.dataset.arr;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: SELECTION_SORT_PROBLEM_HTML,
      analysisHtml: SELECTION_SORT_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): SSStep[] {
    const arrInput = this.root?.querySelector('#input-array') as HTMLInputElement | null;
    const raw = arrInput?.value || '29, 10, 14, 37, 13';
    const arr = parseArray(raw);
    return selectionSortSteps(arr);
  }

  protected renderStep(step: SSStep): void {
    const { array, i, minIdx, j, comparisons, swaps, sortedCount, phase, swapping, message } = step;

    // 1. 渲染柱状图
    if (this.barsContainerEl) {
      const maxVal = Math.max(...array, 1);
      this.barsContainerEl.innerHTML = array
        .map((val, idx) => {
          const isTargetI = idx === i && phase !== 'done';
          const isCurrentMin = idx === minIdx && phase !== 'done';
          const isScanningJ = idx === j && !swapping && phase === 'compare';
          const isSwapping = (idx === i || idx === minIdx) && swapping;
          const isSorted = idx < sortedCount || phase === 'done';

          let pillarClass = 'ss-bar-pillar';
          if (isSwapping) pillarClass += ' is-swapping';
          else if (isCurrentMin) pillarClass += ' is-current-min';
          else if (isScanningJ) pillarClass += ' is-scanning-j';
          else if (isSorted) pillarClass += ' is-sorted';
          else if (isTargetI) pillarClass += ' is-target-i';

          const heightPct = Math.max(18, Math.round((val / maxVal) * 100));

          return `
            <div class="ss-bar-wrapper">
              <div class="${pillarClass}" style="height: ${heightPct}%;">
                <span>${val}</span>
              </div>
              <span class="ss-bar-idx">${idx}</span>
            </div>
          `;
        })
        .join('');
    }

    // 2. 更新状态监视器
    if (this.metricIEl) this.metricIEl.textContent = i >= 0 ? String(i) : '—';
    if (this.metricMinIdxEl) {
      this.metricMinIdxEl.textContent = minIdx >= 0 ? `${minIdx} (${array[minIdx]})` : '—';
    }
    if (this.metricJEl) this.metricJEl.textContent = j >= 0 ? String(j) : '—';
    if (this.metricCompSwapEl) {
      this.metricCompSwapEl.textContent = `${comparisons} / ${swaps}`;
    }

    if (this.formulaActionEl) {
      if (swapping) {
        this.formulaActionEl.textContent = `swap(arr[${i}], arr[${minIdx}]) 归位`;
      } else if (phase === 'compare') {
        this.formulaActionEl.textContent = `arr[${j}] (${array[j]}) ${
          array[j] < array[minIdx] ? '<' : '>='
        } arr[${minIdx}] (${array[minIdx]})`;
      } else if (phase === 'update-min') {
        this.formulaActionEl.textContent = `minIdx = ${minIdx} (${array[minIdx]})`;
      } else if (phase === 'pass-done') {
        this.formulaActionEl.textContent = `第 ${i + 1} 轮就位完毕`;
      } else if (phase === 'done') {
        this.formulaActionEl.textContent = '排序完成';
      } else {
        this.formulaActionEl.textContent = 'findMin(arr[i..n-1])';
      }
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 3. 更新日志流
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let bg = st.phase === 'done' ? '#f0fdf4' : st.swapping ? '#fff1f2' : '#eff6ff';
        let color = st.phase === 'done' ? '#15803d' : st.swapping ? '#e11d48' : '#1d4ed8';
        let border = st.phase === 'done' ? '#bbf7d0' : st.swapping ? '#fecdd3' : '#bfdbfe';
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

    // 4. 同步 UI 计数
    const stepCurEl = this.root?.querySelector('#step-cur');
    const stepTotalEl = this.root?.querySelector('#step-total');
    if (stepCurEl) stepCurEl.textContent = String(this.currentStepIndex + 1);
    if (stepTotalEl) stepTotalEl.textContent = String(this.steps.length);

    const badgeSorted = this.root?.querySelector('#badge-sorted-count');
    if (badgeSorted) badgeSorted.textContent = `已就位: ${i + (phase === 'pass-done' || phase === 'done' ? 1 : 0)}`;
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
    if (this.terminalInstance) this.terminalInstance.highlightLine(0);
  }
}

registerAlgorithm({
  id: 'selection-sort',
  name: '选择排序',
  viewId: 'algo-selection-sort-view',
  category: 'sort',
  description: '逐步演示选择排序：未排序区间选出最小值并交换',
  icon: '🎯',
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握选择排序的最小值选取和交换机制',
  template,
  Visualizer: SelectionSortVisualizer,
});
