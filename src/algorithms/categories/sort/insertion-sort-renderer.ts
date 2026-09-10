/**
 * 插入排序可视化器 — 4-Card 标准现代架构
 * 提取 key、向前逆序扫描、元素后移腾位、精准就位插入
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  INSERTION_SORT_PROBLEM_HTML,
  INSERTION_SORT_ANALYSIS_HTML,
  INSERTION_SORT_CODE_LANGUAGES,
} from './insertion-sort-problem-content';
import { parseArray } from './bubble-sort-renderer';
import template from './insertion-sort.html?raw';

export interface ISStep {
  array: number[];
  i: number;
  key: number;
  j: number;
  shifts: number;
  sortedCount: number;
  phase: 'init' | 'pick-key' | 'compare' | 'shift' | 'insert' | 'done';
  status: 'init' | 'pick-key' | 'compare' | 'shift' | 'insert' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function insertionSortSteps(input: number[]): ISStep[] {
  const steps: ISStep[] = [];
  const array = [...input];
  const n = array.length;
  let shifts = 0;

  steps.push({
    array: [...array],
    i: -1,
    key: -1,
    j: -1,
    shifts: 0,
    sortedCount: 1,
    phase: 'init',
    status: 'init',
    message: n === 0 ? '数组为空，无需排序。' : `初始化：数组长度 n = ${n}，首元素 arr[0] 默认构成初始有序区。`,
    log: n === 0 ? '空数组' : `初始化: [${array.join(', ')}]`,
    codeLine: 2,
  });

  if (n <= 1) {
    steps.push({
      array: [...array],
      i: 0,
      key: array[0] ?? 0,
      j: -1,
      shifts: 0,
      sortedCount: n,
      phase: 'done',
      status: 'done',
      message: '✅ 排序完成！',
      log: '排序完成',
      codeLine: 12,
    });
    return steps;
  }

  for (let i = 1; i < n; i++) {
    const key = array[i];
    let j = i - 1;

    steps.push({
      array: [...array],
      i,
      key,
      j,
      shifts,
      sortedCount: i,
      phase: 'pick-key',
      status: 'pick-key',
      message: `提取待插入元素：key = arr[${i}] (${key})，准备在已排序区间 [0..${i - 1}] 中向前扫描找寻插入位置。`,
      log: `提取 key = arr[${i}] (${key})`,
      codeLine: [3, 4, 5],
    });

    while (j >= 0 && array[j] > key) {
      steps.push({
        array: [...array],
        i,
        key,
        j,
        shifts,
        sortedCount: i,
        phase: 'compare',
        status: 'compare',
        message: `比较：arr[${j}] (${array[j]}) > key (${key})，需要向后移动腾位。`,
        log: `比较: arr[${j}] (${array[j]}) > key (${key}) -> 右移`,
        codeLine: 7,
      });

      array[j + 1] = array[j];
      shifts++;

      steps.push({
        array: [...array],
        i,
        key,
        j,
        shifts,
        sortedCount: i,
        phase: 'shift',
        status: 'shift',
        message: `元素右移：将 arr[${j}] (${array[j]}) 移动到 arr[${j + 1}]。`,
        log: `右移 arr[${j}] -> [${j + 1}]`,
        codeLine: 8,
      });

      j--;
    }

    if (j >= 0) {
      steps.push({
        array: [...array],
        i,
        key,
        j,
        shifts,
        sortedCount: i,
        phase: 'compare',
        status: 'compare',
        message: `比较：arr[${j}] (${array[j]}) &le; key (${key})，找到插入边界！目标插入位置为下标 ${j + 1}。`,
        log: `找到插入位置: 下标 ${j + 1}`,
        codeLine: 7,
      });
    }

    array[j + 1] = key;

    steps.push({
      array: [...array],
      i,
      key,
      j: j + 1,
      shifts,
      sortedCount: i + 1,
      phase: 'insert',
      status: 'insert',
      message: `就位插入：将 key (${key}) 放入 arr[${j + 1}]。当前有序前缀扩展至 [0..${i}]。`,
      log: `插入 key (${key}) 到 [${j + 1}]，有序区 [0..${i}]`,
      codeLine: 11,
    });
  }

  steps.push({
    array: [...array],
    i: n - 1,
    key: array[n - 1],
    j: -1,
    shifts,
    sortedCount: n,
    phase: 'done',
    status: 'done',
    message: `🎉 插入排序完成！共执行 ${shifts} 次元素搬移。最终数组：[${array.join(', ')}]。`,
    log: `✓ 排序完成: [${array.join(', ')}]`,
    codeLine: 12,
  });

  return steps;
}

export class InsertionSortVisualizer extends StepVisualizer<ISStep> {
  protected codeLanguages = INSERTION_SORT_CODE_LANGUAGES;
  protected codeLines = INSERTION_SORT_CODE_LANGUAGES['java'];
  protected codePanelTitle = '插入排序 代码调试';

  private barsContainerEl: HTMLElement | null = null;
  private metricIEl: HTMLElement | null = null;
  private metricKeyEl: HTMLElement | null = null;
  private metricJEl: HTMLElement | null = null;
  private metricShiftsEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.barsContainerEl = this.root.querySelector('#is-bars-container');
    this.metricIEl = this.root.querySelector('#metric-i');
    this.metricKeyEl = this.root.querySelector('#metric-key');
    this.metricJEl = this.root.querySelector('#metric-j');
    this.metricShiftsEl = this.root.querySelector('#metric-shifts');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#is-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.is-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const arrInput = this.root?.querySelector('#input-array') as HTMLInputElement | null;
        if (arrInput && btn.dataset.arr) arrInput.value = btn.dataset.arr;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: INSERTION_SORT_PROBLEM_HTML,
      analysisHtml: INSERTION_SORT_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): ISStep[] {
    const arrInput = this.root?.querySelector('#input-array') as HTMLInputElement | null;
    const raw = arrInput?.value || '12, 11, 13, 5, 6';
    const arr = parseArray(raw);
    return insertionSortSteps(arr);
  }

  protected renderStep(step: ISStep): void {
    const { array, i, key, j, shifts, sortedCount, phase, message } = step;

    // 1. 渲染柱状图
    if (this.barsContainerEl) {
      const maxVal = Math.max(...array, key, 1);
      this.barsContainerEl.innerHTML = array
        .map((val, idx) => {
          const isKey = idx === i && phase === 'pick-key';
          const isComparingJ = idx === j && phase === 'compare';
          const isShifting = idx === j + 1 && phase === 'shift';
          const isSorted = idx < sortedCount || phase === 'done';

          let pillarClass = 'is-bar-pillar';
          if (isKey) pillarClass += ' is-key';
          else if (isShifting) pillarClass += ' is-shifting';
          else if (isComparingJ) pillarClass += ' is-comparing-j';
          else if (isSorted) pillarClass += ' is-sorted';

          const heightPct = Math.max(18, Math.round((val / maxVal) * 100));

          return `
            <div class="is-bar-wrapper">
              <div class="${pillarClass}" style="height: ${heightPct}%;">
                <span>${val}</span>
              </div>
              <span class="is-bar-idx">${idx}</span>
            </div>
          `;
        })
        .join('');
    }

    // 2. 更新状态监视器
    if (this.metricIEl) this.metricIEl.textContent = i >= 0 ? String(i) : '—';
    if (this.metricKeyEl) this.metricKeyEl.textContent = key >= 0 ? String(key) : '—';
    if (this.metricJEl) this.metricJEl.textContent = j >= 0 ? String(j) : '—';
    if (this.metricShiftsEl) this.metricShiftsEl.textContent = String(shifts);

    if (this.formulaActionEl) {
      if (phase === 'pick-key') {
        this.formulaActionEl.textContent = `key = arr[${i}] (${key})`;
      } else if (phase === 'compare') {
        this.formulaActionEl.textContent = `arr[${j}] (${array[j]}) ${
          array[j] > key ? '>' : '<='
        } key (${key})`;
      } else if (phase === 'shift') {
        this.formulaActionEl.textContent = `arr[${j + 1}] = arr[${j}] (${array[j + 1]})`;
      } else if (phase === 'insert') {
        this.formulaActionEl.textContent = `arr[${j}] = key (${key}) 插入`;
      } else if (phase === 'done') {
        this.formulaActionEl.textContent = '排序完成';
      } else {
        this.formulaActionEl.textContent = 'insert(key, arr[0..i-1])';
      }
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 3. 更新日志流
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let bg =
          st.phase === 'done' ? '#f0fdf4' : st.phase === 'shift' ? '#fff1f2' : '#eff6ff';
        let color =
          st.phase === 'done' ? '#15803d' : st.phase === 'shift' ? '#e11d48' : '#1d4ed8';
        let border =
          st.phase === 'done' ? '#bbf7d0' : st.phase === 'shift' ? '#fecdd3' : '#bfdbfe';
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

    const badgeSorted = this.root?.querySelector('#badge-sorted-count');
    if (badgeSorted) badgeSorted.textContent = `有序区长度: ${phase === 'done' ? array.length : i + 1}`;
  }
}

registerAlgorithm({
  id: 'insertion-sort',
  name: '插入排序',
  viewId: 'algo-insertion-sort-view',
  category: 'sort',
  description: '逐步演示插入排序：元素后移、插入到有序区合适位置',
  icon: '🃏',
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '理解插入排序的摸牌原理和后移腾位过程',
  template,
  Visualizer: InsertionSortVisualizer,
});
