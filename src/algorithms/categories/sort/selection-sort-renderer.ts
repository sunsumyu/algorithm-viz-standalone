/**
 * 选择排序可视化器
 * 绿色系玻璃拟态风格 · 扫描/最小值/交换动画
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './selection-sort.html?raw';

type Phase = 'init' | 'scan' | 'found-min' | 'swap' | 'done';

interface SSStep {
  array: number[];
  sortedLen: number;          // 已排序区间长度（前 sortedLen 个已排好）
  round: number;              // 当前轮次（从 0 开始，-1 表示未开始）
  minIndex: number;           // 当前已发现的最小值下标
  scanIndex: number;          // 正在扫描的元素下标（-1 表示不在扫描中）
  comparisons: number;
  swaps: number;
  phase: Phase;
  message: string;
  log: string;
  codeLine: number | number[];
}

function parseArray(input: string): number[] {
  return input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
}

function selectionSortSteps(input: number[]): SSStep[] {
  const steps: SSStep[] = [];
  const array = [...input];
  const n = array.length;
  let comparisons = 0;
  let swaps = 0;

  steps.push({
    array: [...array], sortedLen: 0, round: -1, minIndex: -1, scanIndex: -1,
    comparisons, swaps,
    phase: 'init',
    message: n === 0 ? '数组为空，无需排序。' : `初始化：数组共 ${n} 个元素，开始选择排序。`,
    log: n === 0 ? 'empty array' : `init: n=${n}`,
    codeLine: 1,
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    // 开始新一轮
    steps.push({
      array: [...array], sortedLen: i, round: i, minIndex: i, scanIndex: -1,
      comparisons, swaps,
      phase: 'found-min',
      message: `第 ${i + 1} 轮：假定 arr[${i}]=${array[i]} 为当前最小值，从 i+1=${i + 1} 开始扫描未排序部分。`,
      log: `round ${i + 1}: minIdx=${i}, val=${array[i]}`,
      codeLine: 3,
    });

    for (let j = i + 1; j < n; j++) {
      comparisons++;

      // 扫描中
      steps.push({
        array: [...array], sortedLen: i, round: i, minIndex: minIdx, scanIndex: j,
        comparisons, swaps,
        phase: 'scan',
        message: `扫描 arr[${j}]=${array[j]}，与当前最小 arr[${minIdx}]=${array[minIdx]} 比较：${array[j] < array[minIdx] ? `arr[${j}] 更小，更新最小值` : `arr[${j}] 不小于当前最小，继续`}。`,
        log: `scan arr[${j}]=${array[j]} vs min arr[${minIdx}]=${array[minIdx]}`,
        codeLine: 5,
      });

      if (array[j] < array[minIdx]) {
        minIdx = j;
        steps.push({
          array: [...array], sortedLen: i, round: i, minIndex: minIdx, scanIndex: j,
          comparisons, swaps,
          phase: 'found-min',
          message: `发现更小的值 arr[${j}]=${array[j]}，更新最小值下标为 ${j}。`,
          log: `new min: arr[${j}]=${array[j]}`,
          codeLine: 6,
        });
      }
    }

    // 扫描完毕，执行交换
    if (minIdx !== i) {
      // 交换
      const tmp = array[i];
      array[i] = array[minIdx];
      array[minIdx] = tmp;
      swaps++;

      steps.push({
        array: [...array], sortedLen: i + 1, round: i, minIndex: minIdx, scanIndex: -1,
        comparisons, swaps,
        phase: 'swap',
        message: `交换 arr[${i}] 与 arr[${minIdx}]：最小值 ${array[i]} 放入已排序区末尾（位置 ${i}）。`,
        log: `swap arr[${i}] <-> arr[${minIdx}]`,
        codeLine: 8,
      });
    } else {
      steps.push({
        array: [...array], sortedLen: i + 1, round: i, minIndex: i, scanIndex: -1,
        comparisons, swaps,
        phase: 'swap',
        message: `最小值已在正确位置 ${i}，无需交换。已排序区扩展到 [0..${i}]。`,
        log: `no swap needed, min already at ${i}`,
        codeLine: 8,
      });
    }
  }

  steps.push({
    array: [...array], sortedLen: n, round: -1, minIndex: -1, scanIndex: -1,
    comparisons, swaps,
    phase: 'done',
    message: `排序完成！共 ${comparisons} 次比较、${swaps} 次交换。`,
    log: `done: ${comparisons} cmps, ${swaps} swaps`,
    codeLine: 11,
  });

  return steps;
}

export class SelectionSortVisualizer extends StepVisualizer<SSStep> {
  protected codeLines = [
    'public void selectionSort(int[] arr) {',
    '    int n = arr.length;',
    '    for (int i = 0; i < n - 1; i++) {',
    '        int minIdx = i;                // 记录最小值下标',
    '        for (int j = i + 1; j < n; j++) {',
    '            if (arr[j] < arr[minIdx]) {',
    '                minIdx = j;            // 更新最小值下标',
    '            }',
    '        }',
    '        // 交换 arr[i] 与 arr[minIdx]',
    '        int tmp = arr[i];',
    '        arr[i] = arr[minIdx];',
    '        arr[minIdx] = tmp;',
    '    }',
    '}',
  ];
  protected codePanelTitle = 'Java 选择排序源码';

  private arrayInput: HTMLInputElement | null = null;
  private statSorted: HTMLElement | null = null;
  private statRound: HTMLElement | null = null;
  private statMin: HTMLElement | null = null;
  private statCmp: HTMLElement | null = null;
  private statSwap: HTMLElement | null = null;
  private barsEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private clearLogBtn: HTMLButtonElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.arrayInput = this.root.querySelector('#is-array');
    this.statSorted = this.root.querySelector('#is-stat-sorted');
    this.statRound = this.root.querySelector('#is-stat-round');
    this.statMin = this.root.querySelector('#is-stat-min');
    this.statCmp = this.root.querySelector('#is-stat-cmp');
    this.statSwap = this.root.querySelector('#is-stat-swap');
    this.barsEl = this.root.querySelector('#is-bars');
    this.resultEl = this.root.querySelector('#is-result');
    this.logEl = this.root.querySelector('#is-log');
    this.clearLogBtn = this.root.querySelector('#is-log-clear');

    this.bindPlaybackControls({
      reset: 'step-reset', prev: 'step-prev', play: 'step-play', next: 'step-next',
      speed: 'is-speed', speedLabel: 'is-speed-label',
      counter: 'step-counter', message: 'step-message',
    });

    this.root.querySelector('#is-start')?.addEventListener('click', () => this.start());
    this.root.querySelectorAll<HTMLButtonElement>('.is-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.arrayInput) this.arrayInput.value = btn.dataset.arr || '';
        this.start();
      });
    });
    this.clearLogBtn?.addEventListener('click', () => { if (this.logEl) this.logEl.innerHTML = ''; });
    this.arrayInput?.addEventListener('change', () => this.start());
  }

  protected buildSteps(): SSStep[] {
    return selectionSortSteps(parseArray(this.arrayInput?.value || '5,2,9,1,5,6'));
  }

  protected renderStep(step: SSStep): void {
    this.renderStats(step);
    this.renderBars(step);
    this.renderResultBanner(step);
    this.renderLogPanel(step);
  }

  private renderStats(step: SSStep): void {
    if (this.statSorted) this.statSorted.textContent = String(step.sortedLen);
    if (this.statRound) this.statRound.textContent = step.round < 0 ? '-' : String(step.round + 1);
    if (this.statMin) {
      if (step.minIndex >= 0 && step.minIndex < step.array.length) {
        this.statMin.textContent = String(step.array[step.minIndex]);
      } else {
        this.statMin.textContent = '-';
      }
    }
    if (this.statCmp) this.statCmp.textContent = String(step.comparisons);
    if (this.statSwap) this.statSwap.textContent = String(step.swaps);
  }

  private renderBars(step: SSStep): void {
    const barsEl = this.barsEl;
    if (!barsEl) return;
    const maxVal = Math.max(1, ...step.array);

    // FLIP: First — capture old positions
    const oldPositions = new Map<number, DOMRect>();
    barsEl.querySelectorAll<HTMLElement>('.is-bar-wrap').forEach((el) => {
      const idx = Number(el.dataset.idx);
      if (Number.isFinite(idx)) oldPositions.set(idx, el.getBoundingClientRect());
    });

    barsEl.innerHTML = '';
    step.array.forEach((value, idx) => {
      const wrap = document.createElement('div');
      wrap.className = 'is-bar-wrap';
      wrap.dataset.idx = String(idx);

      const bar = document.createElement('div');
      bar.className = 'is-bar';
      const h = 30 + (value / maxVal) * 170;
      bar.style.height = `${h}px`;
      bar.textContent = String(value);

      // 状态着色
      if (step.phase === 'done') {
        bar.classList.add('is-done');
      } else if (step.phase === 'init') {
        // all neutral
      } else {
        // 已排序部分
        if (idx < step.sortedLen) {
          bar.classList.add('is-sorted');
        }

        // swap phase: 高亮交换的两个位置
        if (step.phase === 'swap') {
          // 在 swap 阶段，数组已经交换完毕，但我们要标记被交换的两个位置
          // round 是交换前 i 的位置，minIndex 是交换前最小值的下标
          if (idx === step.round || idx === step.minIndex) {
            bar.classList.add('is-swapping');
          }
        }

        // scanning element
        if (step.phase === 'scan' && idx === step.scanIndex) {
          bar.classList.add('is-scanning');
        }

        // current minimum
        if ((step.phase === 'found-min' || step.phase === 'scan') && idx === step.minIndex) {
          // 如果同时在扫描且 minIndex 就是当前扫描的（刚更新），则不叠加
          if (!(step.phase === 'scan' && idx === step.scanIndex)) {
            bar.classList.add('is-min-found');
          }
        }
        if (step.phase === 'swap' && idx === step.minIndex && step.minIndex !== step.round) {
          bar.classList.add('is-min-found');
        }
      }

      wrap.appendChild(bar);
      const idxLabel = document.createElement('span');
      idxLabel.className = 'is-idx';
      idxLabel.textContent = String(idx);
      wrap.appendChild(idxLabel);

      // min marker
      if (step.phase === 'found-min' && idx === step.minIndex) {
        const m = document.createElement('span');
        m.className = 'is-marker is-marker--min';
        m.textContent = 'min';
        wrap.appendChild(m);
      }

      // scan marker
      if (step.phase === 'scan' && idx === step.scanIndex) {
        const m = document.createElement('span');
        m.className = 'is-marker is-marker--scan';
        m.textContent = 'scan';
        wrap.appendChild(m);
      }

      barsEl.appendChild(wrap);
    });

    // FLIP: Last + Invert + Play
    requestAnimationFrame(() => {
      barsEl.querySelectorAll<HTMLElement>('.is-bar-wrap').forEach((el) => {
        const idx = Number(el.dataset.idx);
        if (!Number.isFinite(idx)) return;
        const newRect = el.getBoundingClientRect();
        const oldRect = oldPositions.get(idx);
        if (oldRect) {
          const dx = oldRect.left - newRect.left;
          if (Math.abs(dx) > 0.5) {
            el.style.transition = 'none';
            el.style.transform = `translateX(${dx}px)`;
            requestAnimationFrame(() => {
              el.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1)';
              el.style.transform = '';
            });
          }
        }
      });
    });
  }

  private renderResultBanner(step: SSStep): void {
    if (!this.resultEl) return;
    this.resultEl.classList.remove('is-result--done');
    const emoji = this.resultEl.querySelector('.is-emoji') as HTMLElement | null;
    if (step.phase === 'done') {
      this.resultEl.classList.add('is-result--done');
      if (emoji) emoji.textContent = '🎉';
    } else if (step.phase === 'scan') {
      if (emoji) emoji.textContent = '🔍';
    } else if (step.phase === 'found-min') {
      if (emoji) emoji.textContent = '🎯';
    } else if (step.phase === 'swap') {
      if (emoji) emoji.textContent = '🔄';
    } else {
      if (emoji) emoji.textContent = '🎯';
    }
  }

  private renderLogPanel(step: SSStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'is-log-line' + (i === this.currentIndex ? ' is-log-active' : '');
      const num = document.createElement('span');
      num.className = 'is-log-num';
      num.textContent = `${String(i + 1).padStart(2, '0')}.`;
      const text = document.createElement('span');
      text.textContent = s.log;
      row.appendChild(num);
      row.appendChild(text);
      this.logEl!.appendChild(row);
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'selection-sort',
  name: '选择排序',
  viewId: 'algo-selection-sort-view',
  category: 'sort',
  description: '逐步演示选择排序：扫描找最小值、标记、交换到已排序区末尾',
  icon: '🎯',
  template,
  Visualizer: SelectionSortVisualizer,
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '理解选择排序的选最小-交换过程',
});
