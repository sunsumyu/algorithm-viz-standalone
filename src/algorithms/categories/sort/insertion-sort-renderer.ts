/**
 * 插入排序可视化器
 * 重做：玻璃感 stat 面板 + key 元素"飞起漂浮"动画 + 比较/移位颜色闪烁 + 落入 drop 动画 + 完整执行日志
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './insertion-sort.html?raw';

type Phase = 'init' | 'pick' | 'compare' | 'shift' | 'insert' | 'done';

interface ISStep {
  array: number[];
  sortedLen: number;        // 已排序区间长度（>=0 表示前 sortedLen 个已排序）
  i: number;                // 外层 i（-1 = 未开始）
  j: number;                // 内层 j（-1 = 未进入循环）
  key: number | null;       // 当前要插入的 key
  keyIndex: number;         // key 在 array 中的"原始"位置（用于定位动画 ghost）
  insertIndex: number;      // key 最终插入的位置（-1 = 还没插入）
  compareValue: number;     // 本次比较的 arr[j]（-1 表示不在比较态）
  shifted: number | number[]; // 本次移位的目标下标（-1 表示无）
  comparisons: number;
  moves: number;
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

function insertionSortSteps(input: number[]): ISStep[] {
  const steps: ISStep[] = [];
  const array = [...input];
  const n = array.length;
  let comparisons = 0;
  let moves = 0;

  steps.push({
    array, sortedLen: Math.min(1, n), i: -1, j: -1, key: null, keyIndex: -1,
    insertIndex: -1, compareValue: -1, shifted: -1, comparisons, moves,
    phase: 'init',
    message: n === 0 ? '数组为空，无需排序。' : `初始化：arr[0] 视为已排序区间（长度 1），从 i=1 开始向外扩展。`,
    log: n === 0 ? 'empty array' : `init sorted prefix = [0], start from i=1`,
    codeLine: 1,
  });

  for (let i = 1; i < n; i++) {
    const key = array[i];
    let j = i - 1;

    steps.push({
      array: [...array], sortedLen: i, i, j, key, keyIndex: i,
      insertIndex: -1, compareValue: -1, shifted: -1, comparisons, moves,
      phase: 'pick',
      message: `本轮 i=${i}：取出 key=arr[${i}]=${key}，准备插入到左侧已排序区间 [0..${i - 1}]。`,
      log: `pick key = arr[${i}] = ${key}`,
      codeLine: 3,
    });

    while (j >= 0) {
      comparisons++;
      steps.push({
        array: [...array], sortedLen: i, i, j, key, keyIndex: i,
        insertIndex: -1, compareValue: array[j], shifted: -1, comparisons, moves,
        phase: 'compare',
        message: `比较 arr[${j}]=${array[j]} 与 key=${key}：${array[j] > key ? `arr[${j}] > key ⇒ 需要后移` : `arr[${j}] ≤ key ⇒ 找到插入点`}。`,
        log: `cmp arr[${j}]=${array[j]} vs key=${key}`,
        codeLine: 5,
      });

      if (array[j] <= key) {
        // 找到插入点
        break;
      }

      // 移位
      array[j + 1] = array[j];
      moves++;
      steps.push({
        array: [...array], sortedLen: i, i, j, key, keyIndex: i,
        insertIndex: -1, compareValue: -1, shifted: j + 1, comparisons, moves,
        phase: 'shift',
        message: `将 arr[${j}]=${array[j]} 后移到位置 ${j + 1}（给 key 腾位）。`,
        log: `shift arr[${j}] -> pos ${j + 1}`,
        codeLine: 6,
      });

      j--;
    }

    const insertPos = j + 1;
    if (insertPos !== i) {
      array[insertPos] = key;
      moves++;
      steps.push({
        array: [...array], sortedLen: i + 1, i, j, key, keyIndex: -1,
        insertIndex: insertPos, compareValue: -1, shifted: -1, comparisons, moves,
        phase: 'insert',
        message: `将 key=${key} 插入到位置 ${insertPos}。本轮比较 ${comparisons} 次（累计），移动若干次。`,
        log: `insert key=${key} @ ${insertPos}`,
        codeLine: 8,
      });
    } else {
      steps.push({
        array: [...array], sortedLen: i + 1, i, j, key, keyIndex: -1,
        insertIndex: insertPos, compareValue: -1, shifted: -1, comparisons, moves,
        phase: 'insert',
        message: `key=${key} 已在合适位置 ${insertPos}，无需移动。`,
        log: `key already at ${insertPos}, no shift`,
        codeLine: 8,
      });
    }
  }

  steps.push({
    array, sortedLen: n, i: -1, j: -1, key: null, keyIndex: -1,
    insertIndex: -1, compareValue: -1, shifted: -1, comparisons, moves,
    phase: 'done',
    message: `✅ 排序完成！共 ${comparisons} 次比较、${moves} 次移动。`,
    log: `done: ${comparisons} cmps, ${moves} moves`,
    codeLine: 10,
  });

  return steps;
}

export class InsertionSortVisualizer extends StepVisualizer<ISStep> {
  protected codeLines = [
    'public void insertionSort(int[] arr) {',
    '    for (int i = 1; i < arr.length; i++) {',
    '        int key = arr[i];         // 本轮要插入的 key',
    '        int j = i - 1;',
    '        while (j >= 0 && arr[j] > key) {',
    '            arr[j + 1] = arr[j];    // 元素后移，腾出空位',
    '            j--;',
    '        }',
    '        arr[j + 1] = key;            // key 落入空位',
    '    }',
    '}',
  ];
  protected codePanelTitle = 'Java 插入排序源码';

  private arrayInput: HTMLInputElement | null = null;
  private statSorted: HTMLElement | null = null;
  private statI: HTMLElement | null = null;
  private statKey: HTMLElement | null = null;
  private statCmp: HTMLElement | null = null;
  private statMv: HTMLElement | null = null;
  private barsEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private clearLogBtn: HTMLButtonElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.arrayInput = this.root.querySelector('#is-array');
    this.statSorted = this.root.querySelector('#is-stat-sorted');
    this.statI = this.root.querySelector('#is-stat-i');
    this.statKey = this.root.querySelector('#is-stat-key');
    this.statCmp = this.root.querySelector('#is-stat-cmp');
    this.statMv = this.root.querySelector('#is-stat-mv');
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

  protected buildSteps(): ISStep[] {
    return insertionSortSteps(parseArray(this.arrayInput?.value || '5,2,9,1,5,6'));
  }

  protected renderStep(step: ISStep): void {
    this.renderStats(step);
    this.renderBars(step);
    this.renderResultBanner(step);
    this.renderLogPanel(step);
  }

  private renderStats(step: ISStep): void {
    if (this.statSorted) this.statSorted.textContent = step.phase === 'init' ? '1' : String(step.sortedLen);
    if (this.statI) this.statI.textContent = step.i < 0 ? '-' : String(step.i);
    if (this.statKey) this.statKey.textContent = step.key == null ? '-' : String(step.key);
    if (this.statCmp) this.statCmp.textContent = String(step.comparisons);
    if (this.statMv) this.statMv.textContent = String(step.moves);
  }

  private renderBars(step: ISStep): void {
    const barsEl = this.barsEl;
    if (!barsEl) return;
    const maxVal = Math.max(1, ...step.array);
    const total = step.array.length;

    // FLIP: First
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
        if (idx < step.sortedLen) bar.classList.add('is-sorted');
      } else {
        // 排好序前缀：除掉正在被移位的元素外都已 sorted
        const isInSortedPrefix = idx < step.sortedLen;
        const isShiftedThisStep = typeof step.shifted === 'number'
          ? step.shifted === idx
          : Array.isArray(step.shifted) && step.shifted.includes(idx);
        if (isInSortedPrefix && !isShiftedThisStep) {
          if (step.phase === 'shift' && idx === step.i) {
            // i 位置在 shift 阶段是空位，不显示 sorted
          } else {
            bar.classList.add('is-sorted');
          }
        }
        // key
        if (step.phase === 'pick' && idx === step.keyIndex) {
          bar.classList.add('is-key');
        }
        // compare target
        if (step.phase === 'compare' && idx === step.j) {
          bar.classList.add('is-compare');
        }
        // shift target
        if (step.phase === 'shift' && idx === step.j + 1) {
          bar.classList.add('is-shift');
        }
        // insert: drop animation on the inserted bar
        if (step.phase === 'insert' && idx === step.insertIndex) {
          bar.classList.add('is-drop');
        }
      }

      wrap.appendChild(bar);
      const idxLabel = document.createElement('span');
      idxLabel.className = 'is-idx';
      idxLabel.textContent = String(idx);
      wrap.appendChild(idxLabel);

      // key marker (漂浮标签)
      if (step.phase === 'pick' && idx === step.keyIndex) {
        const m = document.createElement('span');
        m.className = 'is-key-marker';
        m.textContent = '↑ key';
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

  private renderResultBanner(step: ISStep): void {
    if (!this.resultEl) return;
    this.resultEl.classList.remove('is-result--done');
    const emoji = this.resultEl.querySelector('.is-emoji') as HTMLElement | null;
    if (step.phase === 'done') {
      this.resultEl.classList.add('is-result--done');
      if (emoji) emoji.textContent = '🎉';
    } else if (step.phase === 'pick') {
      if (emoji) emoji.textContent = '✋';
    } else if (step.phase === 'compare') {
      if (emoji) emoji.textContent = '⚖️';
    } else if (step.phase === 'shift') {
      if (emoji) emoji.textContent = '↔️';
    } else if (step.phase === 'insert') {
      if (emoji) emoji.textContent = '🎯';
    } else {
      if (emoji) emoji.textContent = '📊';
    }
  }

  private renderLogPanel(step: ISStep): void {
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
  id: 'insertion-sort',
  name: '插入排序',
  viewId: 'algo-insertion-sort-view',
  category: 'sort',
  description: '逐步演示插入排序：key 元素飞起漂浮、比较、移位、落入',
  icon: '📊',
  template,
  Visualizer: InsertionSortVisualizer,
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '理解插入排序的原地排序过程',
});
