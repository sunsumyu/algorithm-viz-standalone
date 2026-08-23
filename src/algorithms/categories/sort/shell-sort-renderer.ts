/**
 * 希尔排序可视化器
 * 按 gap 分组的插入排序，gap 序列：n/2, n/4, ..., 1
 * 玻璃拟态风格 + 靛蓝色系配色，同组同色显示
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './shell-sort.html?raw';

type Phase = 'init' | 'set-gap' | 'compare' | 'shift' | 'insert' | 'reduce-gap' | 'done';

interface SSStep {
  array: number[];
  gap: number;                // 当前 gap 值
  round: number;              // 当前轮数（第几次 gap）
  i: number;                  // 外层循环索引（从 gap 开始）
  j: number;                  // 内层循环索引（用于比较和移位）
  key: number | null;         // 当前要插入的 key
  keyIndex: number;           // key 原始位置
  insertIndex: number;        // key 最终插入位置
  compareIndex: number;       // 比较的另一个元素位置（j - gap），-1 表示不在比较态
  shiftedIndex: number;       // 被移位的元素位置，-1 表示无
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

function shellSortSteps(input: number[]): SSStep[] {
  const steps: SSStep[] = [];
  const array = [...input];
  const n = array.length;
  let comparisons = 0;
  let moves = 0;
  let round = 0;

  // 计算初始 gap
  let gap = Math.floor(n / 2);

  steps.push({
    array: [...array], gap, round: 0, i: -1, j: -1, key: null, keyIndex: -1,
    insertIndex: -1, compareIndex: -1, shiftedIndex: -1, comparisons, moves,
    phase: 'init',
    message: n === 0 ? '数组为空，无需排序。' : `初始化：gap = floor(${n}/2) = ${gap}，开始希尔排序。`,
    log: n === 0 ? 'empty array' : `init: gap = ${gap}`,
    codeLine: 1,
  });

  if (n === 0) {
    steps.push({
      array, gap: 0, round: 0, i: -1, j: -1, key: null, keyIndex: -1,
      insertIndex: -1, compareIndex: -1, shiftedIndex: -1, comparisons, moves,
      phase: 'done',
      message: `✅ 排序完成！共 ${comparisons} 次比较、${moves} 次移动。`,
      log: `done: ${comparisons} cmps, ${moves} moves`,
      codeLine: 16,
    });
    return steps;
  }

  while (gap >= 1) {
    round++;

    steps.push({
      array: [...array], gap, round, i: -1, j: -1, key: null, keyIndex: -1,
      insertIndex: -1, compareIndex: -1, shiftedIndex: -1, comparisons, moves,
      phase: 'set-gap',
      message: `第 ${round} 轮：gap = ${gap}，将数组分为 ${gap} 组，每组独立进行插入排序。`,
      log: `round ${round}: gap = ${gap}`,
      codeLine: 3,
    });

    for (let i = gap; i < n; i++) {
      const key = array[i];
      let j = i;

      steps.push({
        array: [...array], gap, round, i, j, key, keyIndex: i,
        insertIndex: -1, compareIndex: -1, shiftedIndex: -1, comparisons, moves,
        phase: 'set-gap',
        message: `gap=${gap}，取出 key=arr[${i}]=${key}，在组内从位置 ${i} 向前比较。`,
        log: `pick key = arr[${i}] = ${key}, gap=${gap}`,
        codeLine: 5,
      });

      while (j >= gap) {
        comparisons++;
        const compareIdx = j - gap;
        steps.push({
          array: [...array], gap, round, i, j, key, keyIndex: i,
          insertIndex: -1, compareIndex: compareIdx, shiftedIndex: -1, comparisons, moves,
          phase: 'compare',
          message: `比较 arr[${j}]=${array[j]} 与 arr[${compareIdx}]=${array[compareIdx]}：${array[compareIdx] > key ? `arr[${compareIdx}] > key ⇒ 需要后移` : `arr[${compareIdx}] ≤ key ⇒ 找到插入点`}。`,
          log: `cmp arr[${compareIdx}]=${array[compareIdx]} vs key=${key}`,
          codeLine: 7,
        });

        if (array[compareIdx] <= key) {
          break;
        }

        // 移位
        array[j] = array[compareIdx];
        moves++;
        steps.push({
          array: [...array], gap, round, i, j, key, keyIndex: i,
          insertIndex: -1, compareIndex: -1, shiftedIndex: j, comparisons, moves,
          phase: 'shift',
          message: `将 arr[${compareIdx}]=${array[compareIdx]} 后移 gap=${gap} 位到位置 ${j}（给 key 腾位）。`,
          log: `shift arr[${compareIdx}] -> pos ${j}`,
          codeLine: 8,
        });

        j = compareIdx;
      }

      const insertPos = j;
      if (insertPos !== i) {
        array[insertPos] = key;
        moves++;
        steps.push({
          array: [...array], gap, round, i, j: insertPos, key, keyIndex: -1,
          insertIndex: insertPos, compareIndex: -1, shiftedIndex: -1, comparisons, moves,
          phase: 'insert',
          message: `将 key=${key} 插入到位置 ${insertPos}。`,
          log: `insert key=${key} @ ${insertPos}`,
          codeLine: 10,
        });
      } else {
        steps.push({
          array: [...array], gap, round, i, j: insertPos, key, keyIndex: -1,
          insertIndex: insertPos, compareIndex: -1, shiftedIndex: -1, comparisons, moves,
          phase: 'insert',
          message: `key=${key} 已在合适位置 ${insertPos}，无需移动。`,
          log: `key already at ${insertPos}, no shift`,
          codeLine: 10,
        });
      }
    }

    // gap 减半
    const newGap = Math.floor(gap / 2);
    if (newGap >= 1) {
      steps.push({
        array: [...array], gap: newGap, round, i: -1, j: -1, key: null, keyIndex: -1,
        insertIndex: -1, compareIndex: -1, shiftedIndex: -1, comparisons, moves,
        phase: 'reduce-gap',
        message: `本轮 gap=${gap} 的插入排序完成，gap 减半：${gap} → ${newGap}。`,
        log: `reduce gap: ${gap} -> ${newGap}`,
        codeLine: 13,
      });
    }

    gap = newGap;
  }

  steps.push({
    array, gap: 0, round, i: -1, j: -1, key: null, keyIndex: -1,
    insertIndex: -1, compareIndex: -1, shiftedIndex: -1, comparisons, moves,
    phase: 'done',
    message: `✅ 排序完成！共 ${comparisons} 次比较、${moves} 次移动。`,
    log: `done: ${comparisons} cmps, ${moves} moves`,
    codeLine: 16,
  });

  return steps;
}

export class ShellSortVisualizer extends StepVisualizer<SSStep> {
  protected codeLines = [
    'public void shellSort(int[] arr) {',
    '    int gap = arr.length / 2;     // 初始间隔',
    '    while (gap >= 1) {',
    '        for (int i = gap; i < arr.length; i++) {',
    '            int key = arr[i];       // 当前要插入的元素',
    '            int j = i;',
    '            while (j >= gap && arr[j - gap] > key) {',
    '                arr[j] = arr[j - gap]; // 元素后移 gap 位',
    '                j -= gap;',
    '            }',
    '            arr[j] = key;            // key 落入空位',
    '        }',
    '        gap /= 2;                    // 间隔减半',
    '    }',
    '}',
  ];
  protected codePanelTitle = 'Java 希尔排序源码';

  private arrayInput: HTMLInputElement | null = null;
  private statGap: HTMLElement | null = null;
  private statRound: HTMLElement | null = null;
  private statCmp: HTMLElement | null = null;
  private statMv: HTMLElement | null = null;
  private barsEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private clearLogBtn: HTMLButtonElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.arrayInput = this.root.querySelector('#ss-array');
    this.statGap = this.root.querySelector('#ss-stat-gap');
    this.statRound = this.root.querySelector('#ss-stat-round');
    this.statCmp = this.root.querySelector('#ss-stat-cmp');
    this.statMv = this.root.querySelector('#ss-stat-mv');
    this.barsEl = this.root.querySelector('#ss-bars');
    this.resultEl = this.root.querySelector('#ss-result');
    this.logEl = this.root.querySelector('#ss-log');
    this.clearLogBtn = this.root.querySelector('#ss-log-clear');

    this.bindPlaybackControls({
      reset: 'step-reset', prev: 'step-prev', play: 'step-play', next: 'step-next',
      speed: 'ss-speed', speedLabel: 'ss-speed-label',
      counter: 'step-counter', message: 'step-message',
    });

    this.root.querySelector('#ss-start')?.addEventListener('click', () => this.start());
    this.root.querySelectorAll<HTMLButtonElement>('.ss-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.arrayInput) this.arrayInput.value = btn.dataset.arr || '';
        this.start();
      });
    });
    this.clearLogBtn?.addEventListener('click', () => { if (this.logEl) this.logEl.innerHTML = ''; });
    this.arrayInput?.addEventListener('change', () => this.start());
  }

  protected buildSteps(): SSStep[] {
    return shellSortSteps(parseArray(this.arrayInput?.value || '5,2,9,1,5,6,4,8'));
  }

  protected renderStep(step: SSStep): void {
    this.renderStats(step);
    this.renderBars(step);
    this.renderResultBanner(step);
    this.renderLogPanel(step);
  }

  private renderStats(step: SSStep): void {
    if (this.statGap) this.statGap.textContent = step.gap > 0 ? String(step.gap) : '-';
    if (this.statRound) this.statRound.textContent = String(step.round);
    if (this.statCmp) this.statCmp.textContent = String(step.comparisons);
    if (this.statMv) this.statMv.textContent = String(step.moves);
  }

  private renderBars(step: SSStep): void {
    const barsEl = this.barsEl;
    if (!barsEl) return;
    const maxVal = Math.max(1, ...step.array);
    const total = step.array.length;
    const gap = step.gap;

    // FLIP: First
    const oldPositions = new Map<number, DOMRect>();
    barsEl.querySelectorAll<HTMLElement>('.ss-bar-wrap').forEach((el) => {
      const idx = Number(el.dataset.idx);
      if (Number.isFinite(idx)) oldPositions.set(idx, el.getBoundingClientRect());
    });

    barsEl.innerHTML = '';
    step.array.forEach((value, idx) => {
      const wrap = document.createElement('div');
      wrap.className = 'ss-bar-wrap';
      wrap.dataset.idx = String(idx);

      const bar = document.createElement('div');
      bar.className = 'ss-bar';
      const h = 30 + (value / maxVal) * 170;
      bar.style.height = `${h}px`;
      bar.textContent = String(value);

      // 状态着色
      if (step.phase === 'done') {
        bar.classList.add('ss-done');
      } else if (gap > 0) {
        // 按 gap 分组着色
        const groupIdx = idx % gap;
        bar.classList.add(`ss-group-${groupIdx % 5}`);

        // key 高亮
        if (step.phase === 'set-gap' && idx === step.keyIndex) {
          bar.classList.add('ss-key');
        }
        // compare target
        if (step.phase === 'compare' && (idx === step.j || idx === step.compareIndex)) {
          if (idx === step.j) {
            bar.classList.add('ss-key');
          } else {
            bar.classList.add('ss-compare');
          }
        }
        // shift target
        if (step.phase === 'shift' && idx === step.shiftedIndex) {
          bar.classList.add('ss-shift');
        }
        // insert: drop animation
        if (step.phase === 'insert' && idx === step.insertIndex) {
          bar.classList.add('ss-drop');
        }
      }

      wrap.appendChild(bar);
      const idxLabel = document.createElement('span');
      idxLabel.className = 'ss-idx';
      idxLabel.textContent = String(idx);
      wrap.appendChild(idxLabel);

      // key marker
      if (step.phase === 'set-gap' && idx === step.keyIndex) {
        const m = document.createElement('span');
        m.className = 'ss-key-marker';
        m.textContent = '↑ key';
        wrap.appendChild(m);
      }

      barsEl.appendChild(wrap);
    });

    // FLIP: Last + Invert + Play
    requestAnimationFrame(() => {
      barsEl.querySelectorAll<HTMLElement>('.ss-bar-wrap').forEach((el) => {
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
    this.resultEl.classList.remove('ss-result--done');
    const emoji = this.resultEl.querySelector('.ss-emoji') as HTMLElement | null;
    if (step.phase === 'done') {
      this.resultEl.classList.add('ss-result--done');
      if (emoji) emoji.textContent = '🎉';
    } else if (step.phase === 'compare') {
      if (emoji) emoji.textContent = '⚖️';
    } else if (step.phase === 'shift') {
      if (emoji) emoji.textContent = '↔️';
    } else if (step.phase === 'insert') {
      if (emoji) emoji.textContent = '🎯';
    } else if (step.phase === 'reduce-gap') {
      if (emoji) emoji.textContent = '📐';
    } else if (step.phase === 'set-gap') {
      if (emoji) emoji.textContent = '✋';
    } else {
      if (emoji) emoji.textContent = '📏';
    }
  }

  private renderLogPanel(step: SSStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'ss-log-line' + (i === this.currentIndex ? ' ss-log-active' : '');
      const num = document.createElement('span');
      num.className = 'ss-log-num';
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
  id: 'shell-sort',
  name: '希尔排序',
  viewId: 'algo-shell-sort-view',
  category: 'sort',
  description: '按间隔分组进行插入排序，逐步缩小间隔至完成排序',
  icon: '📏',
  template,
  Visualizer: ShellSortVisualizer,
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '理解希尔排序的分组插入排序思想',
});
