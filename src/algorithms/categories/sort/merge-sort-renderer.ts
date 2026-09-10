/**
 * 归并排序可视化器 — 4-Card 标准现代架构
 * 递归分治、双指针归并、临时缓冲区与写回
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  MERGE_SORT_PROBLEM_HTML,
  MERGE_SORT_ANALYSIS_HTML,
  MERGE_SORT_CODE_LANGUAGES,
} from './merge-sort-problem-content';
import { parseArray } from './bubble-sort-renderer';
import template from './merge-sort.html?raw';

export interface MSStep {
  array: number[];
  temp: (number | null)[];
  left: number;
  mid: number;
  right: number;
  p1: number;
  p2: number;
  t: number;
  comparisons: number;
  copies: number;
  phase: 'init' | 'divide' | 'compare' | 'take-left' | 'take-right' | 'copy-back' | 'done';
  status: 'init' | 'divide' | 'compare' | 'take-left' | 'take-right' | 'copy-back' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function mergeSortSteps(input: number[]): MSStep[] {
  const steps: MSStep[] = [];
  const array = [...input];
  const n = array.length;
  const temp: (number | null)[] = new Array(n).fill(null);
  let comparisons = 0;
  let copies = 0;

  steps.push({
    array: [...array],
    temp: [...temp],
    left: -1,
    mid: -1,
    right: -1,
    p1: -1,
    p2: -1,
    t: -1,
    comparisons: 0,
    copies: 0,
    phase: 'init',
    status: 'init',
    message: n === 0 ? '数组为空，无需排序。' : `初始化归并排序：数组长度 n = ${n}，准备进行分治递归。`,
    log: n === 0 ? '空数组' : `初始化: [${array.join(', ')}]`,
    codeLine: 2,
  });

  if (n <= 1) {
    steps.push({
      array: [...array],
      temp: [...temp],
      left: 0,
      mid: 0,
      right: 0,
      p1: -1,
      p2: -1,
      t: -1,
      comparisons: 0,
      copies: 0,
      phase: 'done',
      status: 'done',
      message: '✅ 排序完成！',
      log: '排序完成',
      codeLine: 6,
    });
    return steps;
  }

  const sort = (l: number, r: number) => {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);

    steps.push({
      array: [...array],
      temp: [...temp],
      left: l,
      mid: m,
      right: r,
      p1: -1,
      p2: -1,
      t: -1,
      comparisons,
      copies,
      phase: 'divide',
      status: 'divide',
      message: `分治拆解：划分区间 [${l}..${r}] 为左半段 [${l}..${m}] 和右半段 [${m + 1}..${r}]。`,
      log: `Divide: [${l}..${r}] -> [${l}..${m}] + [${m + 1}..${r}]`,
      codeLine: [3, 4, 5],
    });

    sort(l, m);
    sort(m + 1, r);
    merge(l, m, r);
  };

  const merge = (l: number, m: number, r: number) => {
    let p1 = l;
    let p2 = m + 1;
    let t = l;

    // 清空当前区间的 temp
    for (let k = l; k <= r; k++) temp[k] = null;

    while (p1 <= m && p2 <= r) {
      comparisons++;
      const pickLeft = array[p1] <= array[p2];

      steps.push({
        array: [...array],
        temp: [...temp],
        left: l,
        mid: m,
        right: r,
        p1,
        p2,
        t,
        comparisons,
        copies,
        phase: 'compare',
        status: 'compare',
        message: `比较双指针元素：arr[${p1}] (${array[p1]}) vs arr[${p2}] (${array[p2]})${
          pickLeft ? '，左侧较小' : '，右侧较小'
        }。`,
        log: `比较: arr[${p1}] (${array[p1]}) vs arr[${p2}] (${array[p2]})`,
        codeLine: 11,
      });

      if (pickLeft) {
        temp[t] = array[p1];
        steps.push({
          array: [...array],
          temp: [...temp],
          left: l,
          mid: m,
          right: r,
          p1,
          p2,
          t,
          comparisons,
          copies,
          phase: 'take-left',
          status: 'take-left',
          message: `选取左段元素：temp[${t}] = arr[${p1}] (${array[p1]})，p1 向右移动。`,
          log: `temp[${t}] = arr[${p1}] (${array[p1]})`,
          codeLine: 12,
        });
        p1++;
      } else {
        temp[t] = array[p2];
        steps.push({
          array: [...array],
          temp: [...temp],
          left: l,
          mid: m,
          right: r,
          p1,
          p2,
          t,
          comparisons,
          copies,
          phase: 'take-right',
          status: 'take-right',
          message: `选取右段元素：temp[${t}] = arr[${p2}] (${array[p2]})，p2 向右移动。`,
          log: `temp[${t}] = arr[${p2}] (${array[p2]})`,
          codeLine: 13,
        });
        p2++;
      }
      t++;
    }

    while (p1 <= m) {
      temp[t] = array[p1];
      steps.push({
        array: [...array],
        temp: [...temp],
        left: l,
        mid: m,
        right: r,
        p1,
        p2,
        t,
        comparisons,
        copies,
        phase: 'take-left',
        status: 'take-left',
        message: `左段剩余补齐：temp[${t}] = arr[${p1}] (${array[p1]})。`,
        log: `补齐左段: temp[${t}] = ${array[p1]}`,
        codeLine: 15,
      });
      p1++;
      t++;
    }

    while (p2 <= r) {
      temp[t] = array[p2];
      steps.push({
        array: [...array],
        temp: [...temp],
        left: l,
        mid: m,
        right: r,
        p1,
        p2,
        t,
        comparisons,
        copies,
        phase: 'take-right',
        status: 'take-right',
        message: `右段剩余补齐：temp[${t}] = arr[${p2}] (${array[p2]})。`,
        log: `补齐右段: temp[${t}] = ${array[p2]}`,
        codeLine: 16,
      });
      p2++;
      t++;
    }

    // 写回原数组
    for (let k = l; k <= r; k++) {
      array[k] = temp[k] as number;
      copies++;
    }

    steps.push({
      array: [...array],
      temp: [...temp],
      left: l,
      mid: m,
      right: r,
      p1: -1,
      p2: -1,
      t: -1,
      comparisons,
      copies,
      phase: 'copy-back',
      status: 'copy-back',
      message: `区间 [${l}..${r}] 归并完成并回填原数组！该区间已完全有序。`,
      log: `Merge 完成: [${l}..${r}] 写回原数组`,
      codeLine: 17,
    });
  };

  sort(0, n - 1);

  steps.push({
    array: [...array],
    temp: new Array(n).fill(null),
    left: 0,
    mid: Math.floor((n - 1) / 2),
    right: n - 1,
    p1: -1,
    p2: -1,
    t: -1,
    comparisons,
    copies,
    phase: 'done',
    status: 'done',
    message: `🎉 归并排序完成！共比较 ${comparisons} 次，回填 ${copies} 次。最终数组：[${array.join(', ')}]。`,
    log: `✓ 排序完成: [${array.join(', ')}]`,
    codeLine: 6,
  });

  return steps;
}

export class MergeSortVisualizer extends StepVisualizer<MSStep> {
  protected codeLanguages = MERGE_SORT_CODE_LANGUAGES;
  protected codeLines = MERGE_SORT_CODE_LANGUAGES['java'];
  protected codePanelTitle = '归并排序 代码调试';

  private mainTrackEl: HTMLElement | null = null;
  private tempTrackEl: HTMLElement | null = null;
  private metricRangeEl: HTMLElement | null = null;
  private metricP1El: HTMLElement | null = null;
  private metricP2El: HTMLElement | null = null;
  private metricCompCopyEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.mainTrackEl = this.root.querySelector('#ms-main-track');
    this.tempTrackEl = this.root.querySelector('#ms-temp-track');
    this.metricRangeEl = this.root.querySelector('#metric-range');
    this.metricP1El = this.root.querySelector('#metric-p1');
    this.metricP2El = this.root.querySelector('#metric-p2');
    this.metricCompCopyEl = this.root.querySelector('#metric-comp-copy');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#ms-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.ms-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const arrInput = this.root?.querySelector('#input-array') as HTMLInputElement | null;
        if (arrInput && btn.dataset.arr) arrInput.value = btn.dataset.arr;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: MERGE_SORT_PROBLEM_HTML,
      analysisHtml: MERGE_SORT_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): MSStep[] {
    const arrInput = this.root?.querySelector('#input-array') as HTMLInputElement | null;
    const raw = arrInput?.value || '38, 27, 43, 3, 9, 82, 10';
    const arr = parseArray(raw);
    return mergeSortSteps(arr);
  }

  protected renderStep(step: MSStep): void {
    const { array, temp, left, mid, right, p1, p2, comparisons, copies, phase, message } = step;

    // 1. 渲染主数组
    if (this.mainTrackEl) {
      this.mainTrackEl.innerHTML = array
        .map((val, idx) => {
          const inLeftSeg = left >= 0 && mid >= 0 && idx >= left && idx <= mid;
          const inRightSeg = mid >= 0 && right >= 0 && idx > mid && idx <= right;
          const isP1 = idx === p1;
          const isP2 = idx === p2;
          const isCopiedBack = phase === 'copy-back' && idx >= left && idx <= right;

          let cellClass = 'ms-cell-box';
          if (isCopiedBack) cellClass += ' is-copied-back';
          else if (isP1) cellClass += ' in-left-seg is-p1';
          else if (isP2) cellClass += ' in-right-seg is-p2';
          else if (inLeftSeg) cellClass += ' in-left-seg';
          else if (inRightSeg) cellClass += ' in-right-seg';

          return `
            <div class="${cellClass}">
              <span class="val">${val}</span>
              <span class="idx">${idx}</span>
            </div>
          `;
        })
        .join('');
    }

    // 2. 渲染 Temp 辅助缓冲区
    if (this.tempTrackEl) {
      this.tempTrackEl.innerHTML = temp
        .map((val, idx) => {
          const isFilled = val !== null;
          let cellClass = 'ms-cell-box';
          if (isFilled) cellClass += ' is-buffer-filled';

          return `
            <div class="${cellClass}">
              <span class="val">${val !== null ? val : '—'}</span>
              <span class="idx">${idx}</span>
            </div>
          `;
        })
        .join('');
    }

    // 3. 更新状态监视器
    if (this.metricRangeEl) {
      this.metricRangeEl.textContent =
        left >= 0 && right >= 0 ? `[${left}, ${mid}, ${right}]` : '—';
    }
    if (this.metricP1El) this.metricP1El.textContent = p1 >= 0 ? `${p1} (${array[p1]})` : '—';
    if (this.metricP2El) this.metricP2El.textContent = p2 >= 0 ? `${p2} (${array[p2]})` : '—';
    if (this.metricCompCopyEl) {
      this.metricCompCopyEl.textContent = `${comparisons} / ${copies}`;
    }

    if (this.formulaActionEl) {
      if (phase === 'divide') {
        this.formulaActionEl.textContent = `mid = (${left} + ${right}) / 2 = ${mid}`;
      } else if (phase === 'compare') {
        this.formulaActionEl.textContent = `arr[${p1}] (${array[p1]}) ${
          array[p1] <= array[p2] ? '<=' : '>'
        } arr[${p2}] (${array[p2]})`;
      } else if (phase === 'copy-back') {
        this.formulaActionEl.textContent = `copyBack(temp[${left}..${right}] -> arr)`;
      } else if (phase === 'done') {
        this.formulaActionEl.textContent = '归并排序完成';
      } else {
        this.formulaActionEl.textContent = 'merge(left, mid, right)';
      }
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 4. 更新日志流
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let bg =
          st.phase === 'done' ? '#f0fdf4' : st.phase === 'copy-back' ? '#faf5ff' : '#eff6ff';
        let color =
          st.phase === 'done' ? '#15803d' : st.phase === 'copy-back' ? '#7e22ce' : '#1d4ed8';
        let border =
          st.phase === 'done' ? '#bbf7d0' : st.phase === 'copy-back' ? '#e9d5ff' : '#bfdbfe';
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

    const badgeRange = this.root?.querySelector('#badge-range');
    if (badgeRange) {
      badgeRange.textContent = left >= 0 && right >= 0 ? `区间: [${left}..${right}]` : '未开始';
    }
  }
}

registerAlgorithm({
  id: 'merge-sort',
  name: '归并排序',
  viewId: 'algo-merge-sort-view',
  category: 'sort',
  description: '逐步演示归并排序：递归分治、双指针合并',
  icon: '🧩',
  difficulty: 2,
  levelOrder: 5,
  learningGoal: '掌握分治思想和双指针有序归并的过程',
  template,
  Visualizer: MergeSortVisualizer,
});
