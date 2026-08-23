/**
 * 堆排序可视化器
 * 柱状图 + 树形结构双视图 · 红色系玻璃拟态
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './heap-sort.html?raw';

type Phase =
  | 'init'
  | 'build-heap'
  | 'heapify'
  | 'compare-children'
  | 'swap-parent-child'
  | 'heap-complete'
  | 'extract-max'
  | 'reduce-heap'
  | 'done';

interface HSStep {
  array: number[];
  heapSize: number;
  sortedCount: number;
  heapifyCount: number;
  comparisons: number;
  swaps: number;
  phase: Phase;
  /** current node being heapified */
  currentIdx: number;
  /** left child index, -1 if none */
  leftChild: number;
  /** right child index, -1 if none */
  rightChild: number;
  /** largest among parent, left, right (-1 = parent is largest) */
  largestIdx: number;
  /** indices involved in a swap */
  swapA: number;
  swapB: number;
  /** which nodes are in the sorted region (indices >= n - sortedCount) */
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

function heapSortSteps(input: number[]): HSStep[] {
  const steps: HSStep[] = [];
  const array = [...input];
  const n = array.length;
  let heapifyCount = 0;
  let comparisons = 0;
  let swaps = 0;

  const push = (partial: Omit<HSStep, 'array' | 'heapSize' | 'sortedCount' | 'heapifyCount' | 'comparisons' | 'swaps'> & {
    array?: number[];
    heapSize?: number;
    sortedCount?: number;
    heapifyCount?: number;
    comparisons?: number;
    swaps?: number;
  }) => {
    steps.push({
      array: partial.array ?? [...array],
      heapSize: partial.heapSize ?? n,
      sortedCount: partial.sortedCount ?? 0,
      heapifyCount: partial.heapifyCount ?? heapifyCount,
      comparisons: partial.comparisons ?? comparisons,
      swaps: partial.swaps ?? swaps,
      phase: partial.phase,
      currentIdx: partial.currentIdx ?? -1,
      leftChild: partial.leftChild ?? -1,
      rightChild: partial.rightChild ?? -1,
      largestIdx: partial.largestIdx ?? -1,
      swapA: partial.swapA ?? -1,
      swapB: partial.swapB ?? -1,
      message: partial.message,
      log: partial.log,
      codeLine: partial.codeLine,
    });
  };

  // --- Initial ---
  push({
    phase: 'init', currentIdx: -1, leftChild: -1, rightChild: -1,
    largestIdx: -1, swapA: -1, swapB: -1,
    message: n === 0 ? '数组为空，无需排序。' : `初始化：数组长度 ${n}，将构建最大堆。`,
    log: `init: n=${n}`,
    codeLine: 1,
  });

  if (n <= 1) {
    push({
      phase: 'done', currentIdx: -1, leftChild: -1, rightChild: -1,
      largestIdx: -1, swapA: -1, swapB: -1, sortedCount: n,
      message: n === 0 ? '数组为空。' : '数组只有一个元素，已有序。',
      log: 'done (trivial)', codeLine: 18,
    });
    return steps;
  }

  // --- Inline heapify helper ---
  const doHeapify = (heapSize: number, rootIdx: number) => {
    heapifyCount++;
    let i = rootIdx;

    push({
      phase: 'heapify', currentIdx: i, leftChild: -1, rightChild: -1,
      largestIdx: -1, swapA: -1, swapB: -1,
      heapSize,
      message: `堆化 heapify(arr, ${heapSize}, ${i})：从节点 i=${i}（值 ${array[i]}）开始下沉。`,
      log: `heapify(root=${i}, val=${array[i]})`,
      codeLine: 8,
    });

    while (true) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let largest = i;

      if (left < heapSize) {
        comparisons++;
        push({
          phase: 'compare-children', currentIdx: i, leftChild: left,
          rightChild: right < heapSize ? right : -1,
          largestIdx: -1, swapA: -1, swapB: -1,
          heapSize,
          message: `比较 arr[${i}]=${array[i]} 与左子 arr[${left}]=${array[left]}${right < heapSize ? `，右子 arr[${right}]=${array[right]}` : '（无右子）'}。`,
          log: `cmp arr[${i}]=${array[i]} vs left=${array[left]}${right < heapSize ? `, right=${array[right]}` : ''}`,
          codeLine: [9, 10],
        });

        if (array[left] > array[largest]) {
          largest = left;
        }
      }

      if (right < heapSize) {
        comparisons++;
        if (array[right] > array[largest]) {
          largest = right;
          push({
            phase: 'compare-children', currentIdx: i, leftChild: left,
            rightChild: right, largestIdx: right,
            swapA: -1, swapB: -1,
            heapSize,
            message: `右子 arr[${right}]=${array[right]} 更大，largest=${right}。`,
            log: `right child arr[${right}]=${array[right]} is largest`,
            codeLine: [11, 12],
          });
        }
      }

      if (largest !== i) {
        // swap
        push({
          phase: 'swap-parent-child', currentIdx: i, leftChild: left < heapSize ? left : -1,
          rightChild: right < heapSize ? right : -1,
          largestIdx: largest,
          swapA: i, swapB: largest,
          heapSize,
          message: `交换 arr[${i}]=${array[i]} 与 arr[${largest}]=${array[largest]}（较大子节点下沉）。`,
          log: `swap arr[${i}]=${array[i]} <-> arr[${largest}]=${array[largest]}`,
          codeLine: 14,
        });

        [array[i], array[largest]] = [array[largest], array[i]];
        swaps++;

        i = largest;
        heapifyCount++;

        push({
          phase: 'heapify', currentIdx: i, leftChild: -1, rightChild: -1,
          largestIdx: -1, swapA: -1, swapB: -1,
          heapSize,
          message: `继续堆化节点 i=${i}（值 ${array[i]}）。`,
          log: `continue heapify(root=${i}, val=${array[i]})`,
          codeLine: 8,
        });
      } else {
        push({
          phase: 'heapify', currentIdx: i, leftChild: left < heapSize ? left : -1,
          rightChild: right < heapSize ? right : -1,
          largestIdx: i,
          swapA: -1, swapB: -1,
          heapSize,
          message: `节点 i=${i}（值 ${array[i]}）已满足最大堆性质，下沉结束。`,
          log: `heapify done at ${i}, no swap needed`,
          codeLine: 16,
        });
        break;
      }
    }
  };

  // --- Build heap: from last non-leaf to root ---
  const lastNonLeaf = Math.floor(n / 2) - 1;
  for (let i = lastNonLeaf; i >= 0; i--) {
    push({
      phase: 'build-heap', currentIdx: i, leftChild: -1, rightChild: -1,
      largestIdx: -1, swapA: -1, swapB: -1,
      message: `建堆阶段：对节点 i=${i}（值 ${array[i]}）执行堆化。`,
      log: `build-heap: heapify at i=${i}`,
      codeLine: 4,
    });
    doHeapify(n, i);
  }

  push({
    phase: 'heap-complete', currentIdx: -1, leftChild: -1, rightChild: -1,
    largestIdx: -1, swapA: -1, swapB: -1,
    message: `最大堆构建完成！堆顶 arr[0]=${array[0]} 是当前最大值。`,
    log: `max-heap built, top=${array[0]}`,
    codeLine: 5,
  });

  // --- Extract max ---
  for (let i = n - 1; i > 0; i--) {
    push({
      phase: 'extract-max', currentIdx: 0, leftChild: -1, rightChild: -1,
      largestIdx: 0, swapA: 0, swapB: i,
      sortedCount: n - 1 - i,
      message: `提取最大值：交换堆顶 arr[0]=${array[0]} 与 arr[${i}]=${array[i]}。`,
      log: `extract-max: swap arr[0]=${array[0]} <-> arr[${i}]=${array[i]}`,
      codeLine: 6,
    });

    [array[0], array[i]] = [array[i], array[0]];
    swaps++;

    push({
      phase: 'reduce-heap', currentIdx: -1, leftChild: -1, rightChild: -1,
      largestIdx: -1, swapA: -1, swapB: -1,
      heapSize: i, sortedCount: n - i,
      message: `堆大小减 1：heapSize=${i}，已排序区域 ${n - i} 个元素。`,
      log: `heap-size -> ${i}, sorted=${n - i}`,
      codeLine: 7,
    });

    if (i > 1) {
      doHeapify(i, 0);
    }
  }

  push({
    phase: 'done', currentIdx: -1, leftChild: -1, rightChild: -1,
    largestIdx: -1, swapA: -1, swapB: -1,
    sortedCount: n, heapSize: 0,
    message: `排序完成！共 ${heapifyCount} 次堆化，${comparisons} 次比较，${swaps} 次交换。`,
    log: `done: ${heapifyCount} heapify, ${comparisons} cmps, ${swaps} swaps`,
    codeLine: 18,
  });

  return steps;
}

export class HeapSortVisualizer extends StepVisualizer<HSStep> {
  protected codeLines = [
    'public void heapSort(int[] arr) {',
    '    int n = arr.length;',
    '    // 1. 建最大堆：从最后一个非叶节点开始',
    '    for (int i = n / 2 - 1; i >= 0; i--)',
    '        heapify(arr, n, i);            // O(n)',
    '    // 2. 逐个提取最大值',
    '    for (int i = n - 1; i > 0; i--) {',
    '        swap(arr, 0, i);               // 堆顶 -> 末尾',
    '        heapify(arr, i, 0);            // O(log n)',
    '    }',                                // line 9 (index 9)
    '}',                                    // line 10 (index 10) - closing of heapSort
    '',                                     // 11
    'void heapify(int[] arr, int heapSize, int i) {',
    '    while (true) {',
    '        int left = 2 * i + 1;',
    '        int right = 2 * i + 2;',
    '        int largest = i;',
    '        if (left < heapSize && arr[left] > arr[largest])',
    '            largest = left;',
    '        if (right < heapSize && arr[right] > arr[largest])',
    '            largest = right;',
    '        if (largest != i) {',
    '            swap(arr, i, largest);',
    '            i = largest;               // 继续下沉',
    '        } else',
    '            break;                     // 堆化完成',
    '    }',
    '}',
  ];
  protected codePanelTitle = 'Java 堆排序源码';

  private arrayInput: HTMLInputElement | null = null;
  private statSize: HTMLElement | null = null;
  private statSorted: HTMLElement | null = null;
  private statHeapify: HTMLElement | null = null;
  private statCmp: HTMLElement | null = null;
  private statSwap: HTMLElement | null = null;
  private barsEl: HTMLElement | null = null;
  private treeEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private clearLogBtn: HTMLButtonElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.arrayInput = this.root.querySelector('#hs-array');
    this.statSize = this.root.querySelector('#hs-stat-size');
    this.statSorted = this.root.querySelector('#hs-stat-sorted');
    this.statHeapify = this.root.querySelector('#hs-stat-heapify');
    this.statCmp = this.root.querySelector('#hs-stat-cmp');
    this.statSwap = this.root.querySelector('#hs-stat-swap');
    this.barsEl = this.root.querySelector('#hs-bars');
    this.treeEl = this.root.querySelector('#hs-tree');
    this.resultEl = this.root.querySelector('#hs-result');
    this.logEl = this.root.querySelector('#hs-log');
    this.clearLogBtn = this.root.querySelector('#hs-log-clear');

    this.bindPlaybackControls({
      reset: 'step-reset', prev: 'step-prev', play: 'step-play', next: 'step-next',
      speed: 'hs-speed', speedLabel: 'hs-speed-label',
      counter: 'step-counter', message: 'step-message',
    });

    this.root.querySelector('#hs-start')?.addEventListener('click', () => this.start());
    this.root.querySelectorAll<HTMLButtonElement>('.hs-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.arrayInput) this.arrayInput.value = btn.dataset.arr || '';
        this.start();
      });
    });
    this.clearLogBtn?.addEventListener('click', () => { if (this.logEl) this.logEl.innerHTML = ''; });
    this.arrayInput?.addEventListener('change', () => this.start());
  }

  protected buildSteps(): HSStep[] {
    return heapSortSteps(parseArray(this.arrayInput?.value || '4,10,3,5,1,8,7,2'));
  }

  protected renderStep(step: HSStep): void {
    this.renderStats(step);
    this.renderBars(step);
    this.renderTree(step);
    this.renderResultBanner(step);
    this.renderLogPanel(step);
  }

  private renderStats(step: HSStep): void {
    if (this.statSize) this.statSize.textContent = step.phase === 'init' ? String(step.array.length) : String(step.heapSize);
    if (this.statSorted) this.statSorted.textContent = String(step.sortedCount);
    if (this.statHeapify) this.statHeapify.textContent = String(step.heapifyCount);
    if (this.statCmp) this.statCmp.textContent = String(step.comparisons);
    if (this.statSwap) this.statSwap.textContent = String(step.swaps);
  }

  private renderBars(step: HSStep): void {
    const barsEl = this.barsEl;
    if (!barsEl) return;
    const maxVal = Math.max(1, ...step.array);
    const sortedStart = step.array.length - step.sortedCount;

    barsEl.innerHTML = '';
    step.array.forEach((value, idx) => {
      const wrap = document.createElement('div');
      wrap.className = 'hsBar-wrap';

      const bar = document.createElement('div');
      bar.className = 'hsBar';
      const h = 24 + (value / maxVal) * 140;
      bar.style.height = `${h}px`;
      bar.textContent = String(value);

      if (step.phase === 'done') {
        bar.classList.add('hsBar--done');
      } else if (idx >= sortedStart && step.sortedCount > 0) {
        bar.classList.add('hsBar--sorted');
      } else if (step.phase === 'swap-parent-child' && (idx === step.swapA || idx === step.swapB)) {
        bar.classList.add('hsBar--swap');
      } else if (step.phase === 'extract-max' && (idx === step.swapA || idx === step.swapB)) {
        bar.classList.add('hsBar--swap');
      } else if (step.phase === 'compare-children' && (idx === step.currentIdx || idx === step.leftChild || idx === step.rightChild)) {
        bar.classList.add('hsBar--compare');
      } else if (step.phase === 'heapify' && idx === step.currentIdx) {
        bar.classList.add('hsBar--compare');
      } else if (idx < step.heapSize) {
        bar.classList.add('hsBar--heap');
      }

      wrap.appendChild(bar);
      const idxLabel = document.createElement('span');
      idxLabel.className = 'hsBar-idx';
      idxLabel.textContent = String(idx);
      wrap.appendChild(idxLabel);

      barsEl.appendChild(wrap);
    });
  }

  private renderTree(step: HSStep): void {
    const treeEl = this.treeEl;
    if (!treeEl) return;

    const arr = step.array;
    const n = step.array.length;
    const heapSize = step.phase === 'init' ? n : step.heapSize;
    const sortedStart = n - step.sortedCount;

    if (heapSize <= 0 || step.phase === 'done' || step.phase === 'init') {
      // For init, show a flat row of nodes
      this.renderTreeFull(arr, step);
      return;
    }

    // Only render the heap portion as a tree
    const nodeCount = heapSize;
    const depth = Math.ceil(Math.log2(nodeCount + 1));
    const nodeRadius = 18;
    const levelHeight = 50;
    const svgWidth = Math.max(300, Math.pow(2, depth - 1) * 50);
    const svgHeight = depth * levelHeight + 30;

    const positions: { x: number; y: number }[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const level = Math.floor(Math.log2(i + 1));
      const posInLevel = i - (Math.pow(2, level) - 1);
      const nodesInLevel = Math.pow(2, level);
      const spacing = svgWidth / (nodesInLevel + 1);
      positions.push({
        x: spacing * (posInLevel + 1),
        y: level * levelHeight + 25,
      });
    }

    let svg = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;

    // edges
    for (let i = 0; i < nodeCount; i++) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < nodeCount) {
        const isHighlight = (step.phase === 'compare-children' || step.phase === 'swap-parent-child')
          && i === step.currentIdx && (left === step.largestIdx);
        svg += `<line class="hs-tree-edge${isHighlight ? ' hsEdge--highlight' : ''}" x1="${positions[i].x}" y1="${positions[i].y}" x2="${positions[left].x}" y2="${positions[left].y}"/>`;
      }
      if (right < nodeCount) {
        const isHighlight = (step.phase === 'compare-children' || step.phase === 'swap-parent-child')
          && i === step.currentIdx && (right === step.largestIdx);
        svg += `<line class="hs-tree-edge${isHighlight ? ' hsEdge--highlight' : ''}" x1="${positions[i].x}" y1="${positions[i].y}" x2="${positions[right].x}" y2="${positions[right].y}"/>`;
      }
    }

    // nodes
    for (let i = 0; i < nodeCount; i++) {
      const { x, y } = positions[i];
      let fill = 'rgba(239, 68, 68, 0.3)';
      let stroke = '#ef4444';
      let textColor = '#fecaca';

      if (step.phase === 'swap-parent-child' && (i === step.swapA || i === step.swapB)) {
        fill = 'rgba(168, 85, 247, 0.5)';
        stroke = '#a855f7';
        textColor = '#fff';
      } else if (step.phase === 'compare-children' && (i === step.currentIdx || i === step.leftChild || i === step.rightChild)) {
        fill = 'rgba(251, 191, 36, 0.4)';
        stroke = '#fbbf24';
        textColor = '#fff';
      } else if (step.phase === 'heapify' && i === step.currentIdx) {
        fill = 'rgba(251, 191, 36, 0.4)';
        stroke = '#fbbf24';
        textColor = '#fff';
      } else if (i === 0 && (step.phase === 'heap-complete' || step.phase === 'extract-max' || step.phase === 'build-heap')) {
        fill = 'rgba(251, 191, 36, 0.6)';
        stroke = '#fbbf24';
        textColor = '#fff';
      }

      svg += `<circle class="hs-tree-node" cx="${x}" cy="${y}" r="${nodeRadius}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
      svg += `<text x="${x}" y="${y + 4}" text-anchor="middle" fill="${textColor}" font-size="12" font-weight="800" font-family="JetBrains Mono, Consolas, monospace">${arr[i]}</text>`;
      // index label below
      svg += `<text x="${x}" y="${y + nodeRadius + 12}" text-anchor="middle" fill="#64748b" font-size="9" font-family="JetBrains Mono, Consolas, monospace">${i}</text>`;
    }

    svg += '</svg>';
    treeEl.innerHTML = svg;
  }

  private renderTreeFull(arr: number[], step: HSStep): void {
    const treeEl = this.treeEl;
    if (!treeEl) return;
    const n = arr.length;

    if (n === 0) {
      treeEl.innerHTML = '<span style="color:#64748b;font-size:13px;">空数组</span>';
      return;
    }

    const depth = Math.ceil(Math.log2(n + 1));
    const nodeRadius = 18;
    const levelHeight = 50;
    const svgWidth = Math.max(300, Math.pow(2, depth - 1) * 50);
    const svgHeight = depth * levelHeight + 30;

    const positions: { x: number; y: number }[] = [];
    for (let i = 0; i < n; i++) {
      const level = Math.floor(Math.log2(i + 1));
      const posInLevel = i - (Math.pow(2, level) - 1);
      const nodesInLevel = Math.pow(2, level);
      const spacing = svgWidth / (nodesInLevel + 1);
      positions.push({
        x: spacing * (posInLevel + 1),
        y: level * levelHeight + 25,
      });
    }

    let svg = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;

    // edges
    for (let i = 0; i < n; i++) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n) {
        svg += `<line class="hs-tree-edge" x1="${positions[i].x}" y1="${positions[i].y}" x2="${positions[left].x}" y2="${positions[left].y}"/>`;
      }
      if (right < n) {
        svg += `<line class="hs-tree-edge" x1="${positions[i].x}" y1="${positions[i].y}" x2="${positions[right].x}" y2="${positions[right].y}"/>`;
      }
    }

    // nodes
    const sortedStart = n - step.sortedCount;
    for (let i = 0; i < n; i++) {
      const { x, y } = positions[i];
      let fill = 'rgba(239, 68, 68, 0.3)';
      let stroke = '#ef4444';
      let textColor = '#fecaca';

      if (step.phase === 'done') {
        fill = 'rgba(52, 211, 153, 0.3)';
        stroke = '#34d399';
        textColor = '#d1fae5';
      } else if (i >= sortedStart && step.sortedCount > 0) {
        fill = 'rgba(6, 182, 212, 0.3)';
        stroke = '#06b6d4';
        textColor = '#a5f3fc';
      }

      svg += `<circle class="hs-tree-node" cx="${x}" cy="${y}" r="${nodeRadius}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
      svg += `<text x="${x}" y="${y + 4}" text-anchor="middle" fill="${textColor}" font-size="12" font-weight="800" font-family="JetBrains Mono, Consolas, monospace">${arr[i]}</text>`;
      svg += `<text x="${x}" y="${y + nodeRadius + 12}" text-anchor="middle" fill="#64748b" font-size="9" font-family="JetBrains Mono, Consolas, monospace">${i}</text>`;
    }

    svg += '</svg>';
    treeEl.innerHTML = svg;
  }

  private renderResultBanner(step: HSStep): void {
    if (!this.resultEl) return;
    this.resultEl.classList.remove('hsResult--done');
    const emoji = this.resultEl.querySelector('.hs-emoji') as HTMLElement | null;
    if (step.phase === 'done') {
      this.resultEl.classList.add('hsResult--done');
      if (emoji) emoji.textContent = '🎉';
    } else if (step.phase === 'build-heap') {
      if (emoji) emoji.textContent = '🔨';
    } else if (step.phase === 'heapify') {
      if (emoji) emoji.textContent = '⬇️';
    } else if (step.phase === 'compare-children') {
      if (emoji) emoji.textContent = '⚖️';
    } else if (step.phase === 'swap-parent-child') {
      if (emoji) emoji.textContent = '🔄';
    } else if (step.phase === 'heap-complete') {
      if (emoji) emoji.textContent = '✅';
    } else if (step.phase === 'extract-max') {
      if (emoji) emoji.textContent = '📤';
    } else if (step.phase === 'reduce-heap') {
      if (emoji) emoji.textContent = '📏';
    } else {
      if (emoji) emoji.textContent = '🌲';
    }
  }

  private renderLogPanel(step: HSStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'hs-log-line' + (i === this.currentIndex ? ' hs-log-active' : '');
      const num = document.createElement('span');
      num.className = 'hs-log-num';
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
  id: 'heap-sort',
  name: '堆排序',
  viewId: 'algo-heap-sort-view',
  category: 'sort',
  description: '利用最大堆性质反复提取最大值，柱状图 + 树形结构双视图',
  icon: '🌲',
  template,
  Visualizer: HeapSortVisualizer,
  difficulty: 3,
  levelOrder: 6,
  learningGoal: '理解堆排序的建堆与排序过程，掌握堆化的下沉机制',
});
