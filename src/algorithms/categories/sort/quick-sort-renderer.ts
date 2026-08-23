/**
 * 快速排序可视化器
 * 玻璃感面板 + 柱状图 + pivot 高亮 + i/j 指针 + 递归子数组范围 + 分区动画
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './quick-sort.html?raw';

type Phase =
  | 'init'
  | 'select-pivot'
  | 'partition'
  | 'compare'
  | 'swap'
  | 'pivot-placed'
  | 'recurse-left'
  | 'recurse-right'
  | 'done';

/** 递归范围快照（用于底部范围条和卡片着色） */
interface RangeInfo {
  lo: number;
  hi: number;
  depth: number;
  status: 'active' | 'sorted';
}

interface QStep {
  array: number[];
  lo: number;               // 当前子数组下界
  hi: number;               // 当前子数组上界
  pivotIdx: number;         // pivot 在 array 中的位置
  i: number;                // partition 指针 i
  j: number;                // partition 指针 j
  depth: number;
  comparisons: number;
  swaps: number;
  phase: Phase;
  message: string;
  log: string;
  codeLine: number | number[];
  sortedIndices: number[];  // 已归位的索引
  ranges: RangeInfo[];      // 活跃递归范围 + 已排序范围
}

function parseArray(input: string): number[] {
  return input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
}

function quickSortSteps(input: number[]): QStep[] {
  const steps: QStep[] = [];
  const array = [...input];
  const n = array.length;
  let comparisons = 0;
  let swaps = 0;
  const sortedIndices = new Set<number>();

  function pushStep(
    phase: Phase, lo: number, hi: number, pivotIdx: number,
    i: number, j: number, depth: number, ranges: RangeInfo[],
    message: string, log: string, codeLine: number | number[],
  ): void {
    steps.push({
      array: [...array],
      lo, hi, pivotIdx, i, j, depth,
      comparisons, swaps, phase, message, log, codeLine,
      sortedIndices: Array.from(sortedIndices).sort((a, b) => a - b),
      ranges: [...ranges],
    });
  }

  function partition(lo: number, hi: number, depth: number, ranges: RangeInfo[]): number {
    const pivot = array[hi];

    // select-pivot
    pushStep(
      'select-pivot', lo, hi, hi, lo - 1, -1, depth, ranges,
      `选择 pivot=arr[${hi}]=${pivot}，准备对子数组 [${lo}..${hi}] 进行分区。`,
      `select pivot arr[${hi}]=${pivot}, range [${lo},${hi}]`,
      [5, 6],
    );

    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      // compare
      comparisons++;
      pushStep(
        'compare', lo, hi, hi, i, j, depth, ranges,
        `比较 arr[${j}]=${array[j]} 与 pivot=${pivot}：` +
          (array[j] <= pivot ? `arr[${j}] ≤ pivot ⇒ 将交换到左侧` : `arr[${j}] > pivot ⇒ 保持在右侧`),
        `cmp arr[${j}]=${array[j]} vs pivot=${pivot}`,
        [7, 8],
      );

      if (array[j] <= pivot) {
        i++;
        if (i !== j) {
          // swap
          [array[i], array[j]] = [array[j], array[i]];
          swaps++;
          pushStep(
            'swap', lo, hi, hi, i, j, depth, ranges,
            `交换 arr[${i}] 和 arr[${j}]（将较小元素移到左侧分区）`,
            `swap arr[${i}] <-> arr[${j}]`,
            10,
          );
        } else {
          // i was already at j (no actual swap needed)
          pushStep(
            'compare', lo, hi, hi, i, j, depth, ranges,
            `arr[${j}] ≤ pivot，i 自增至 ${i}（无需交换，元素已在正确侧）`,
            `i++ = ${i}, no swap needed`,
            [8, 9],
          );
        }
      }
    }

    // pivot-placed: swap pivot to its final position
    const pivotFinal = i + 1;
    if (pivotFinal !== hi) {
      [array[pivotFinal], array[hi]] = [array[hi], array[pivotFinal]];
      swaps++;
    }
    sortedIndices.add(pivotFinal); // pivot is now in final position

    pushStep(
      'pivot-placed', lo, hi, pivotFinal, i, hi, depth, ranges,
      `pivot=${pivot} 归位到 arr[${pivotFinal}]。左侧 [${lo}..${pivotFinal - 1}] 均 ≤ pivot，右侧 [${pivotFinal + 1}..${hi}] 均 > pivot。`,
      `pivot ${pivot} placed at index ${pivotFinal}`,
      11,
    );

    return pivotFinal;
  }

  // Build initial ranges: full array is active
  const activeRanges: RangeInfo[] = (n > 0) ? [{ lo: 0, hi: n - 1, depth: 0, status: 'active' }] : [];

  function quickSort(lo: number, hi: number, depth: number, ranges: RangeInfo[]): void {
    if (lo >= hi) {
      if (lo === hi) {
        sortedIndices.add(lo);
        // Single-element: mark range as sorted
        const newRanges = ranges.map(r =>
          (r.lo === lo && r.hi === hi && r.status === 'active')
            ? { ...r, status: 'sorted' as const }
            : r
        );
        pushStep(
          'partition', lo, hi, -1, -1, -1, depth, newRanges,
          `子数组 [${lo}] 只有一个元素，自然有序。`,
          `base case: [${lo}] is trivially sorted`,
          1,
        );
      }
      return;
    }

    // Recurse into this subarray — mark it active
    let curRanges = ranges.map(r =>
      (r.lo === lo && r.hi === hi) ? { ...r, status: 'active' as const } : r
    );

    pushStep(
      'partition', lo, hi, -1, lo - 1, -1, depth, curRanges,
      `开始对子数组 [${lo}..${hi}] 进行快速排序（深度 ${depth}）。`,
      `quickSort([${lo}, ${hi}], depth=${depth})`,
      2,
    );

    const p = partition(lo, hi, depth, curRanges);

    // After partition: the pivot at p is sorted
    // Update ranges: the sorted pivot is a single-element sorted range
    curRanges = curRanges.map(r => {
      if (r.lo === lo && r.hi === hi && r.status === 'active') {
        return { ...r, status: 'sorted' as const };
      }
      return r;
    });
    // Add sorted pivot
    curRanges.push({ lo: p, hi: p, depth, status: 'sorted' });

    // recurse-left
    if (p - 1 >= lo) {
      const leftRange: RangeInfo = { lo, hi: p - 1, depth: depth + 1, status: 'active' };
      curRanges.push(leftRange);
      pushStep(
        'recurse-left', lo, p - 1, -1, -1, -1, depth, curRanges,
        `递归左子数组 [${lo}..${p - 1}]（深度 ${depth + 1}）。`,
        `recurse left: [${lo}, ${p - 1}]`,
        3,
      );
      quickSort(lo, p - 1, depth + 1, curRanges);
      // After returning, mark left range as sorted
      curRanges = curRanges.map(r =>
        (r.lo === lo && r.hi === p - 1 && r.depth === depth + 1 && r.status === 'active')
          ? { ...r, status: 'sorted' as const }
          : r
      );
    } else if (p - 1 === lo) {
      sortedIndices.add(lo);
      curRanges.push({ lo, hi: lo, depth: depth + 1, status: 'sorted' });
    }

    // recurse-right
    if (p + 1 <= hi) {
      const rightRange: RangeInfo = { lo: p + 1, hi, depth: depth + 1, status: 'active' };
      curRanges.push(rightRange);
      pushStep(
        'recurse-right', p + 1, hi, -1, -1, -1, depth, curRanges,
        `递归右子数组 [${p + 1}..${hi}]（深度 ${depth + 1}）。`,
        `recurse right: [${p + 1}, ${hi}]`,
        4,
      );
      quickSort(p + 1, hi, depth + 1, curRanges);
      // After returning, mark right range as sorted
      curRanges = curRanges.map(r =>
        (r.lo === p + 1 && r.hi === hi && r.depth === depth + 1 && r.status === 'active')
          ? { ...r, status: 'sorted' as const }
          : r
      );
    } else if (p + 1 === hi) {
      sortedIndices.add(hi);
      curRanges.push({ lo: hi, hi, depth: depth + 1, status: 'sorted' });
    }
  }

  // Initial step
  pushStep(
    'init', 0, n - 1, -1, -1, -1, 0, activeRanges,
    n === 0 ? '数组为空，无需排序。' : `初始化：准备对完整数组 [0..${n - 1}] 进行快速排序。`,
    n === 0 ? 'empty array' : `init quickSort [0, ${n - 1}]`,
    2,
  );

  if (n > 0) {
    quickSort(0, n - 1, 0, activeRanges);
  }

  // done
  pushStep(
    'done', 0, n - 1, -1, -1, -1, 0,
    (n > 0) ? [{ lo: 0, hi: n - 1, depth: 0, status: 'sorted' }] : [],
    n > 0 ? `🎉 排序完成！共 ${comparisons} 次比较、${swaps} 次交换。` : '数组为空。',
    n > 0 ? `done: ${comparisons} cmps, ${swaps} swaps` : 'empty',
    1,
  );

  return steps;
}

export class QuickSortVisualizer extends StepVisualizer<QStep> {
  protected codeLines = [
    'public void quickSort(int[] arr, int lo, int hi) {',
    '    if (lo >= hi) return;                        // 递归终止',
    '    int p = partition(arr, lo, hi);              // 分区',
    '    quickSort(arr, lo, p - 1);                   // 递归左',
    '    quickSort(arr, p + 1, hi);                   // 递归右',
    '}',
    '',
    'private int partition(int[] arr, int lo, int hi) {',
    '    int pivot = arr[hi];                         // 选最后一个为基准',
    '    int i = lo - 1;                              // 较小元素边界',
    '    for (int j = lo; j < hi; j++) {',
    '        if (arr[j] <= pivot) {',
    '            i++;',
    '            swap(arr, i, j);                     // 交换到左侧',
    '        }',
    '    }',
    '    swap(arr, i + 1, hi);                        // pivot 归位',
    '    return i + 1;',
    '}',
  ];
  protected codePanelTitle = 'Java 快速排序源码';

  private arrayInput: HTMLInputElement | null = null;
  private statDepth: HTMLElement | null = null;
  private statCmp: HTMLElement | null = null;
  private statSwap: HTMLElement | null = null;
  private statPivot: HTMLElement | null = null;
  private barsEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.arrayInput = this.root.querySelector('#qs-array');
    this.statDepth = this.root.querySelector('#qs-stat-depth');
    this.statCmp = this.root.querySelector('#qs-stat-cmp');
    this.statSwap = this.root.querySelector('#qs-stat-swap');
    this.statPivot = this.root.querySelector('#qs-stat-pivot');
    this.barsEl = this.root.querySelector('#qs-bars');
    this.resultEl = this.root.querySelector('#qs-result');
    this.logEl = this.root.querySelector('#qs-log');

    this.bindPlaybackControls({
      reset: 'step-reset', prev: 'step-prev', play: 'step-play', next: 'step-next',
      speed: 'qs-speed', speedLabel: 'qs-speed-label',
      counter: 'step-counter', message: 'step-message',
    });

    this.root.querySelector('#qs-start')?.addEventListener('click', () => this.start());
    this.root.querySelectorAll<HTMLButtonElement>('.qs-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.arrayInput) this.arrayInput.value = btn.dataset.arr || '';
        this.start();
      });
    });
    this.root.querySelector('#qs-log-clear')?.addEventListener('click', () => {
      if (this.logEl) this.logEl.innerHTML = '';
    });
    this.arrayInput?.addEventListener('change', () => this.start());
  }

  protected buildSteps(): QStep[] {
    return quickSortSteps(parseArray(this.arrayInput?.value || '8,3,5,1,7,2,9,4'));
  }

  protected renderStep(step: QStep): void {
    this.renderStats(step);
    this.renderBars(step);
    this.renderResultBanner(step);
    this.renderLogPanel(step);
  }

  private renderStats(step: QStep): void {
    if (this.statDepth) this.statDepth.textContent = String(step.depth);
    if (this.statCmp) this.statCmp.textContent = String(step.comparisons);
    if (this.statSwap) this.statSwap.textContent = String(step.swaps);
    if (this.statPivot) {
      if (step.pivotIdx >= 0 && step.pivotIdx < step.array.length) {
        this.statPivot.textContent = `arr[${step.pivotIdx}]=${step.array[step.pivotIdx]}`;
      } else if (step.phase === 'done') {
        this.statPivot.textContent = '完成';
      } else {
        this.statPivot.textContent = '-';
      }
    }
  }

  private renderBars(step: QStep): void {
    const barsEl = this.barsEl;
    if (!barsEl) return;
    const maxVal = Math.max(1, ...step.array);
    const n = step.array.length;

    // FLIP: capture old positions
    const oldPositions = new Map<number, DOMRect>();
    barsEl.querySelectorAll<HTMLElement>('.qs-bar-wrap').forEach((el) => {
      const idx = Number(el.dataset.idx);
      if (Number.isFinite(idx)) oldPositions.set(idx, el.getBoundingClientRect());
    });

    // Determine whether each index is inside the current active recursion range
    const inActiveRange = (idx: number): boolean => {
      // During init, the full range is active
      if (step.phase === 'init') return idx >= step.lo && idx <= step.hi;
      // During partition phases, the lo..hi range is active
      if (['select-pivot', 'compare', 'swap', 'pivot-placed', 'partition'].includes(step.phase)) {
        if (idx >= step.lo && idx <= step.hi) return true;
      }
      // During recurse-left/right, the target range is active
      if (step.phase === 'recurse-left' || step.phase === 'recurse-right') {
        if (idx >= step.lo && idx <= step.hi) return true;
      }
      // Check if in any active range
      for (const r of step.ranges) {
        if (r.status === 'active' && idx >= r.lo && idx <= r.hi) return true;
      }
      return false;
    };

    barsEl.innerHTML = '';
    step.array.forEach((value, idx) => {
      const wrap = document.createElement('div');
      wrap.className = 'qs-bar-wrap';
      wrap.dataset.idx = String(idx);

      const bar = document.createElement('div');
      bar.className = 'qs-bar';
      const h = 30 + (value / maxVal) * 170;
      bar.style.height = `${h}px`;
      bar.textContent = String(value);

      // Dim elements outside the active range
      if (step.phase !== 'done' && !inActiveRange(idx)) {
        bar.classList.add('qs-outside');
      }

      // State coloring
      if (step.phase === 'done') {
        bar.classList.add('qs-done');
      } else {
        // Pivot highlight
        if (step.pivotIdx === idx &&
            ['select-pivot', 'compare', 'swap'].includes(step.phase)) {
          bar.classList.add('qs-pivot');
        }
        // i pointer highlight
        if (step.i === idx && ['compare', 'swap', 'pivot-placed'].includes(step.phase)) {
          // i is the boundary — it gets subtle highlight from pointer, not bar class
        }
        // j pointer / compare highlight
        if (step.j === idx && step.phase === 'compare') {
          bar.classList.add('qs-compare');
        }
        // swap highlight (both swapped elements)
        if (step.phase === 'swap') {
          if (idx === step.i || idx === step.j) {
            bar.classList.add('qs-swap');
          }
        }
        // Sorted (pivot in final position, or all done)
        if (step.sortedIndices.includes(idx)) {
          bar.classList.add('qs-sorted');
        }
        // In active recursion range
        if (inActiveRange(idx) && !bar.classList.contains('qs-sorted') &&
            !bar.classList.contains('qs-pivot') && !bar.classList.contains('qs-compare') &&
            !bar.classList.contains('qs-swap')) {
          bar.classList.add('qs-in-range');
        }
      }

      wrap.appendChild(bar);
      const idxLabel = document.createElement('span');
      idxLabel.className = 'qs-idx';
      idxLabel.textContent = String(idx);
      wrap.appendChild(idxLabel);

      // Pointer markers
      if (step.pivotIdx === idx &&
          ['select-pivot', 'compare', 'swap'].includes(step.phase)) {
        const m = document.createElement('span');
        m.className = 'qs-pointer ptr-pivot';
        m.textContent = 'pivot';
        wrap.appendChild(m);
      }
      if (step.i === idx && step.phase === 'compare') {
        const m = document.createElement('span');
        m.className = 'qs-pointer ptr-i';
        m.textContent = 'i';
        wrap.appendChild(m);
      }
      if (step.j === idx && step.phase === 'compare') {
        const m = document.createElement('span');
        m.className = 'qs-pointer ptr-j';
        m.textContent = 'j';
        wrap.appendChild(m);
      }

      barsEl.appendChild(wrap);
    });

    // Render range bars at the bottom of the canvas
    this.renderRangeBars(barsEl, step, n);

    // FLIP animation
    requestAnimationFrame(() => {
      barsEl.querySelectorAll<HTMLElement>('.qs-bar-wrap').forEach((el) => {
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

  private renderRangeBars(barsEl: HTMLElement, step: QStep, n: number): void {
    // Remove old range bars
    barsEl.querySelectorAll('.qs-range-bar').forEach((el) => el.remove());

    if (step.phase === 'done') {
      // Show one big green bar
      const bar = document.createElement('div');
      bar.className = 'qs-range-bar range-done';
      const totalWidth = n * 54 - 6; // 48px bar + 6px gap
      bar.style.left = '0px';
      bar.style.width = `${Math.max(totalWidth, 0)}px`;
      const label = document.createElement('span');
      label.className = 'qs-range-label';
      label.textContent = '已排序';
      bar.appendChild(label);
      barsEl.appendChild(bar);
      return;
    }

    // Render all ranges from step.ranges
    step.ranges.forEach((r) => {
      const startPx = r.lo * 54;
      const width = (r.hi - r.lo + 1) * 54 - 6;
      if (width <= 0 && r.lo === r.hi) {
        // Single element: show minimal width
        const bar = document.createElement('div');
        bar.className = `qs-range-bar ${r.status === 'sorted' ? 'range-done' : 'range-active'}`;
        bar.style.left = `${startPx}px`;
        bar.style.width = '48px';
        barsEl.appendChild(bar);
        return;
      }
      const bar = document.createElement('div');
      bar.className = `qs-range-bar ${r.status === 'sorted' ? 'range-done' : 'range-active'}`;
      bar.style.left = `${startPx}px`;
      bar.style.width = `${Math.max(width, 0)}px`;
      if (r.status === 'active' && r.hi - r.lo > 0) {
        const label = document.createElement('span');
        label.className = 'qs-range-label';
        label.textContent = `[${r.lo}..${r.hi}] d${r.depth}`;
        bar.appendChild(label);
      }
      barsEl.appendChild(bar);
    });
  }

  private renderResultBanner(step: QStep): void {
    if (!this.resultEl) return;
    this.resultEl.classList.remove('qs-result--done');
    const emoji = this.resultEl.querySelector('.qs-emoji') as HTMLElement | null;
    if (step.phase === 'done') {
      this.resultEl.classList.add('qs-result--done');
      if (emoji) emoji.textContent = '🎉';
    } else if (step.phase === 'select-pivot') {
      if (emoji) emoji.textContent = '🎯';
    } else if (step.phase === 'compare') {
      if (emoji) emoji.textContent = '🔍';
    } else if (step.phase === 'swap') {
      if (emoji) emoji.textContent = '🔄';
    } else if (step.phase === 'pivot-placed') {
      if (emoji) emoji.textContent = '📍';
    } else if (step.phase === 'recurse-left') {
      if (emoji) emoji.textContent = '⬅️';
    } else if (step.phase === 'recurse-right') {
      if (emoji) emoji.textContent = '➡️';
    } else if (step.phase === 'partition') {
      if (emoji) emoji.textContent = '🧩';
    } else {
      if (emoji) emoji.textContent = '⚡';
    }
  }

  private renderLogPanel(step: QStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'qs-log-line' + (i === this.currentIndex ? ' qs-log-active' : '');
      const num = document.createElement('span');
      num.className = 'qs-log-num';
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
  id: 'quick-sort',
  name: '快速排序',
  viewId: 'algo-quick-sort-view',
  category: 'sort',
  description: '逐步演示快速排序：选择 pivot、分区、递归左右子数组',
  icon: '⚡',
  template,
  Visualizer: QuickSortVisualizer,
  difficulty: 2,
  levelOrder: 4,
  learningGoal: '理解快速排序的分治递归和分区过程',
});
