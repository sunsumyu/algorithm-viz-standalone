/**
 * 归并排序可视化器
 * 展示分治递归拆分 → 指针合并的完整过程：
 * - split：青色高亮当前区间，中间点分割
 * - recurse：递归进入左/右子区间
 * - merge-start：初始化临时数组 L / R
 * - merge-compare：双指针逐个比较（金色闪烁）
 * - merge-pick：较小元素归入结果（青色）
 * - merge-copy：剩余元素直接复制
 * - done：整体完成
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './merge-sort.html?raw';

type Phase =
  | 'init'
  | 'split'
  | 'recurse-left'
  | 'recurse-right'
  | 'merge-start'
  | 'merge-compare'
  | 'merge-pick'
  | 'merge-copy'
  | 'done';

interface MSTreeNode {
  left: number;
  right: number;
  status: 'pending' | 'active' | 'merged';
  sorted?: number[];
  children: [MSTreeNode, MSTreeNode] | null;
}

interface MSStep {
  array: number[];
  phase: Phase;
  /** 当前正在处理的子数组范围 [lo, hi]（闭区间）；-1 表示无 */
  lo: number;
  hi: number;
  /** 当前分割点（-1 表示非分割阶段） */
  mid: number;
  /** 递归深度（0 为根） */
  depth: number;
  /** 临时左子数组（仅 merge 阶段） */
  tempLeft: number[];
  /** 临时右子数组 */
  tempRight: number[];
  /** 左指针 i（指向 tempLeft 中下一个待比较元素，-1 表示未启用） */
  ptrI: number;
  /** 右指针 j */
  ptrJ: number;
  /** 结果写入位置（array 中的下标） */
  ptrK: number;
  /** 当前正在比较的两个值（-1 表示不在比较态） */
  cmpL: number;
  cmpR: number;
  /** 本次 pick 选中的值（-1 表示未 pick） */
  picked: number;
  /** 本次 copy 的值（-1 表示未 copy） */
  copied: number;
  /** 累计比较次数 */
  comparisons: number;
  /** 累计移动次数 */
  moves: number;
  /** 当前正在高亮的 bar 下标（-1 表示无） */
  highlightIdx: number;
  /** 状态信息 */
  message: string;
  /** 日志文本 */
  log: string;
  /** 代码高亮行 */
  codeLine: number | number[];
  /** 分治树快照（深拷贝根） */
  tree: MSTreeNode | null;
  /** 当前树中"活跃"节点的 range（用于在树面板中高亮） */
  treeNode: { left: number; right: number } | null;
}

function parseArray(input: string): number[] {
  return input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
}

function cloneTree(root: MSTreeNode): MSTreeNode {
  const node: MSTreeNode = {
    left: root.left,
    right: root.right,
    status: root.status,
    sorted: root.sorted ? [...root.sorted] : undefined,
    children: null,
  };
  if (root.children) {
    node.children = [cloneTree(root.children[0]), cloneTree(root.children[1])];
  }
  return node;
}

/**
 * 生成归并排序的完整步骤序列。
 * `array` 在递归过程中就地修改，每一步都拍快照保存当前状态。
 */
function mergeSortSteps(input: number[]): MSStep[] {
  const steps: MSStep[] = [];
  const array = [...input];
  const n = array.length;
  let comparisons = 0;
  let moves = 0;

  // 根节点
  const root: MSTreeNode = { left: 0, right: n - 1, status: 'pending', children: null };

  function pushStep(
    phase: Phase,
    lo: number,
    hi: number,
    mid: number,
    depth: number,
    tempLeft: number[],
    tempRight: number[],
    ptrI: number,
    ptrJ: number,
    ptrK: number,
    cmpL: number,
    cmpR: number,
    picked: number,
    copied: number,
    highlightIdx: number,
    message: string,
    log: string,
    codeLine: number | number[],
    treeNode: { left: number; right: number } | null,
  ): void {
    steps.push({
      array: [...array],
      phase,
      lo,
      hi,
      mid,
      depth,
      tempLeft: [...tempLeft],
      tempRight: [...tempRight],
      ptrI,
      ptrJ,
      ptrK,
      cmpL,
      cmpR,
      picked,
      copied,
      comparisons,
      moves,
      highlightIdx,
      message,
      log,
      codeLine,
      tree: cloneTree(root),
      treeNode,
    });
  }

  function findTreeNode(node: MSTreeNode, lo: number, hi: number): MSTreeNode | null {
    if (node.left === lo && node.right === hi) return node;
    if (!node.children) return null;
    return findTreeNode(node.children[0], lo, hi) || findTreeNode(node.children[1], lo, hi);
  }

  function merge(arr: number[], lo: number, mid: number, hi: number, depth: number): void {
    const L = arr.slice(lo, mid + 1);
    const R = arr.slice(mid + 1, hi + 1);

    // 更新树节点为 active
    const treeRange = findTreeNode(root, lo, hi);
    if (treeRange) treeRange.status = 'active';

    pushStep(
      'merge-start',
      lo,
      hi,
      mid,
      depth,
      L,
      R,
      0,
      0,
      lo,
      -1,
      -1,
      -1,
      -1,
      -1,
      `准备合并 [${lo}..${hi}]：L=[${L.join(',')}] R=[${R.join(',')}]，两指针从 0 开始比较。`,
      `merge-start [${lo}..${mid}] + [${mid + 1}..${hi}]`,
      14,
      treeNodeOf(lo, hi),
    );

    let i = 0;
    let j = 0;
    let k = lo;

    while (i < L.length && j < R.length) {
      comparisons++;
      pushStep(
        'merge-compare',
        lo,
        hi,
        mid,
        depth,
        L,
        R,
        i,
        j,
        k,
        L[i],
        R[j],
        -1,
        -1,
        -1,
        `比较 L[${i}]=${L[i]} 与 R[${j}]=${R[j]}：${L[i] <= R[j] ? 'L ≤ R，取 L 侧' : 'L > R，取 R 侧'}。`,
        `cmp L[${i}]=${L[i]} vs R[${j}]=${R[j]}`,
        19,
        treeNodeOf(lo, hi),
      );

      if (L[i] <= R[j]) {
        const picked = L[i];
        arr[k] = picked;
        moves++;
        i++;
        k++;
        pushStep(
          'merge-pick',
          lo,
          hi,
          mid,
          depth,
          L,
          R,
          i,
          j,
          k,
          picked,
          -1,
          picked,
          -1,
          k - 1,
          `将 L[${i - 1}]=${picked} 放入 arr[${k - 1}]（左指针 i=${i}）。`,
          `pick L=${picked} → arr[${k - 1}]`,
          21,
          treeNodeOf(lo, hi),
        );
      } else {
        const picked = R[j];
        arr[k] = picked;
        moves++;
        j++;
        k++;
        pushStep(
          'merge-pick',
          lo,
          hi,
          mid,
          depth,
          L,
          R,
          i,
          j,
          k,
          -1,
          picked,
          picked,
          -1,
          k - 1,
          `将 R[${j - 1}]=${picked} 放入 arr[${k - 1}]（右指针 j=${j}）。`,
          `pick R=${picked} → arr[${k - 1}]`,
          24,
          treeNodeOf(lo, hi),
        );
      }
    }

    // 复制剩余
    while (i < L.length) {
      const copied = L[i];
      arr[k] = copied;
      moves++;
      pushStep(
        'merge-copy',
        lo,
        hi,
        mid,
        depth,
        L,
        R,
        i + 1,
        j,
        k + 1,
        -1,
        -1,
        -1,
        copied,
        k,
        `L 中还有 ${L.length - i} 个元素，直接将 L[${i}]=${copied} 复制到 arr[${k}]。`,
        `copy L[${i}]=${copied} → arr[${k}]`,
        29,
        treeNodeOf(lo, hi),
      );
      i++;
      k++;
    }

    while (j < R.length) {
      const copied = R[j];
      arr[k] = copied;
      moves++;
      pushStep(
        'merge-copy',
        lo,
        hi,
        mid,
        depth,
        L,
        R,
        i,
        j + 1,
        k + 1,
        -1,
        -1,
        -1,
        copied,
        k,
        `R 中还有 ${R.length - j} 个元素，直接将 R[${j}]=${copied} 复制到 arr[${k}]。`,
        `copy R[${j}]=${copied} → arr[${k}]`,
        32,
        treeNodeOf(lo, hi),
      );
      j++;
      k++;
    }

    // 合并完成：更新树节点为 merged
    if (treeRange) {
      treeRange.status = 'merged';
      treeRange.sorted = arr.slice(lo, hi + 1);
    }
  }

  function treeNodeOf(lo: number, hi: number): { left: number; right: number } {
    return { left: lo, right: hi };
  }

  function mergeSortRec(
    arr: number[],
    lo: number,
    hi: number,
    depth: number,
    isRightBranch: boolean = false,
  ): void {
    // 创建/标记树节点
    const treeRange = findTreeNode(root, lo, hi);
    if (treeRange) treeRange.status = 'active';

    if (lo >= hi) {
      // 叶子：单元素视为已排序
      if (treeRange) {
        treeRange.status = 'merged';
        treeRange.sorted = [arr[lo]];
      }
      pushStep(
        isRightBranch ? 'recurse-right' : 'recurse-left',
        lo,
        hi,
        -1,
        depth,
        [],
        [],
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        lo,
        `到达叶子 arr[${lo}]=${arr[lo]}，单元素天然有序。`,
        `base case arr[${lo}]=${arr[lo]}`,
        5,
        treeNodeOf(lo, hi),
      );
      return;
    }

    const mid = Math.floor((lo + hi) / 2);

    // 分裂：创建子节点
    const leftChild: MSTreeNode = { left: lo, right: mid, status: 'pending', children: null };
    const rightChild: MSTreeNode = { left: mid + 1, right: hi, status: 'pending', children: null };
    if (treeRange) treeRange.children = [leftChild, rightChild];

    pushStep(
      'split',
      lo,
      hi,
      mid,
      depth,
      [],
      [],
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      `分割 [${lo}..${hi}]（mid=${mid}）→ 左 [${lo}..${mid}] + 右 [${mid + 1}..${hi}]。`,
      `split [${lo}..${hi}] → [${lo}..${mid}] + [${mid + 1}..${hi}]`,
      4,
      treeNodeOf(lo, hi),
    );

    // 递归左半
    pushStep(
      'recurse-left',
      lo,
      mid,
      mid,
      depth + 1,
      [],
      [],
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      `递归进入左半部分 [${lo}..${mid}]，深度=${depth + 1}。`,
      `recurse LEFT [${lo}..${mid}]`,
      7,
      treeNodeOf(lo, mid),
    );
    mergeSortRec(arr, lo, mid, depth + 1, false);

    // 递归右半
    pushStep(
      'recurse-right',
      mid + 1,
      hi,
      mid,
      depth + 1,
      [],
      [],
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      `递归进入右半部分 [${mid + 1}..${hi}]，深度=${depth + 1}。`,
      `recurse RIGHT [${mid + 1}..${hi}]`,
      8,
      treeNodeOf(mid + 1, hi),
    );
    mergeSortRec(arr, mid + 1, hi, depth + 1, true);

    // 合并
    merge(arr, lo, mid, hi, depth);
  }

  // 初始步骤
  pushStep(
    'init',
    0,
    n - 1,
    -1,
    0,
    [],
    [],
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    n === 0
      ? '数组为空，无需排序。'
      : `初始化：待排序数组 [${array.join(', ')}]，共 ${n} 个元素。将从 [0..${n - 1}] 开始递归拆分。`,
    'init',
    1,
    { left: 0, right: n - 1 },
  );

  if (n > 1) {
    root.status = 'active';
    mergeSortRec(array, 0, n - 1, 0, false);
  }

  // 完成步骤
  pushStep(
    'done',
    -1,
    -1,
    -1,
    0,
    [],
    [],
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    `排序完成！共 ${comparisons} 次比较、${moves} 次移动，结果：[${array.join(', ')}]。`,
    `done: ${comparisons} cmps, ${moves} moves`,
    37,
    null,
  );

  return steps;
}

export class MergeSortVisualizer extends StepVisualizer<MSStep> {
  protected codeLines = [
    'public void mergeSort(int[] arr, int lo, int hi) {',
    '    if (lo >= hi) return;                  // 单元素，天然有序',
    '    int mid = lo + (hi - lo) / 2;',
    '    mergeSort(arr, lo, mid);               // 递归排左半',
    '    mergeSort(arr, mid + 1, hi);           // 递归排右半',
    '    merge(arr, lo, mid, hi);               // 合并两段有序序列',
    '}',
    '',
    'private void merge(int[] arr, int lo, int mid, int hi) {',
    '    int[] L = Arrays.copyOfRange(arr, lo, mid + 1);',
    '    int[] R = Arrays.copyOfRange(arr, mid + 1, hi + 1);',
    '    int i = 0, j = 0, k = lo;',
    '    while (i < L.length && j < R.length) {',
    '        if (L[i] <= R[j]) {                // 取较小者（<= 保证稳定）',
    '            arr[k++] = L[i++];',
    '        } else {',
    '            arr[k++] = R[j++];',
    '        }',
    '    }',
    '    while (i < L.length) arr[k++] = L[i++];  // 复制剩余',
    '    while (j < R.length) arr[k++] = R[j++];',
    '}',
  ];
  protected codePanelTitle = 'Java 归并排序源码';

  private arrayInput: HTMLInputElement | null = null;
  private statDepth: HTMLElement | null = null;
  private statRange: HTMLElement | null = null;
  private statCmp: HTMLElement | null = null;
  private statMv: HTMLElement | null = null;
  private statPhase: HTMLElement | null = null;
  private barsEl: HTMLElement | null = null;
  private mergeAreaEl: HTMLElement | null = null;
  private treeEl: HTMLElement | null = null;
  private stepTagEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private clearLogBtn: HTMLButtonElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.arrayInput = this.root.querySelector('#ms-array');
    this.statDepth = this.root.querySelector('#ms-stat-depth');
    this.statRange = this.root.querySelector('#ms-stat-range');
    this.statCmp = this.root.querySelector('#ms-stat-cmp');
    this.statMv = this.root.querySelector('#ms-stat-mv');
    this.statPhase = this.root.querySelector('#ms-stat-phase');
    this.barsEl = this.root.querySelector('#ms-bars');
    this.mergeAreaEl = this.root.querySelector('#ms-merge-area');
    this.treeEl = this.root.querySelector('#ms-tree');
    this.stepTagEl = this.root.querySelector('#ms-step-tag');
    this.resultEl = this.root.querySelector('#ms-result');
    this.logEl = this.root.querySelector('#ms-log');
    this.clearLogBtn = this.root.querySelector('#ms-log-clear');

    this.bindPlaybackControls({
      reset: 'step-reset',
      prev: 'step-prev',
      play: 'step-play',
      next: 'step-next',
      speed: 'ms-speed',
      speedLabel: 'ms-speed-label',
      counter: 'step-counter',
      message: 'step-message',
    });

    this.root.querySelector('#ms-start')?.addEventListener('click', () => this.start());
    this.root.querySelectorAll<HTMLButtonElement>('.ms-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.arrayInput) this.arrayInput.value = btn.dataset.arr || '';
        this.start();
      });
    });
    this.clearLogBtn?.addEventListener('click', () => {
      if (this.logEl) this.logEl.innerHTML = '';
    });
    this.arrayInput?.addEventListener('change', () => this.start());
  }

  protected buildSteps(): MSStep[] {
    return mergeSortSteps(parseArray(this.arrayInput?.value || '38,27,43,3,9,82,10'));
  }

  protected renderStep(step: MSStep): void {
    this.renderStats(step);
    this.renderBars(step);
    this.renderMergeArea(step);
    this.renderTree(step);
    this.renderResultBanner(step);
    this.renderLogPanel(step);
    this.renderStepTag(step);
  }

  private renderStats(step: MSStep): void {
    if (this.statDepth) this.statDepth.textContent = String(step.depth);
    if (this.statRange) {
      this.statRange.textContent = step.lo < 0 || step.hi < 0 ? '-' : `[${step.lo}..${step.hi}]`;
    }
    if (this.statCmp) this.statCmp.textContent = String(step.comparisons);
    if (this.statMv) this.statMv.textContent = String(step.moves);
    if (this.statPhase) {
      const phaseMap: Record<Phase, string> = {
        init: '就绪',
        split: '拆分中',
        'recurse-left': '向左',
        'recurse-right': '向右',
        'merge-start': '开始合并',
        'merge-compare': '比较',
        'merge-pick': '选取',
        'merge-copy': '复制',
        done: '完成',
      };
      this.statPhase.textContent = phaseMap[step.phase] || '-';
    }
  }

  private renderBars(step: MSStep): void {
    const barsEl = this.barsEl;
    if (!barsEl) return;
    const maxVal = Math.max(1, ...step.array);

    barsEl.innerHTML = '';
    step.array.forEach((value, idx) => {
      const wrap = document.createElement('div');
      wrap.className = 'ms-bar-wrap';
      wrap.dataset.idx = String(idx);

      const bar = document.createElement('div');
      bar.className = 'ms-bar';
      const h = 28 + (value / maxVal) * 130;
      bar.style.height = `${h}px`;
      bar.textContent = String(value);

      // 着色逻辑
      if (step.phase === 'done') {
        bar.classList.add('ms-done');
      } else if (step.phase === 'init') {
        // 初始态：全部为青色半透明
        bar.classList.add('ms-in-range');
      } else {
        const inRange = idx >= step.lo && idx <= step.hi;
        if (inRange) {
          if (step.phase === 'split') {
            // 高亮分裂点附近的元素
            if (idx === step.mid) {
              bar.classList.add('ms-split');
            } else {
              bar.classList.add('ms-in-range');
            }
          } else if (
            step.phase === 'merge-compare' ||
            step.phase === 'merge-pick' ||
            step.phase === 'merge-start'
          ) {
            bar.classList.add('ms-in-range');
            if (step.phase === 'merge-compare' || step.phase === 'merge-pick') {
              // 当前比较/写入的位置
              if (idx === step.ptrK - (step.phase === 'merge-pick' ? 1 : 0)) {
                bar.classList.add('ms-merge-picked');
              }
            }
            // 在 split 阶段高亮中间点
            if (idx === step.mid) {
              bar.classList.add('ms-split');
            }
          } else if (
            step.phase === 'merge-copy' &&
            idx === step.ptrK - 1
          ) {
            bar.classList.add('ms-merge-picked');
          } else {
            bar.classList.add('ms-in-range');
          }
        } else {
          // 当前区间外：已完成排序的（在更深层已经 merge 完成的区间显示绿色）
          bar.classList.add('ms-sorted');
        }
      }

      wrap.appendChild(bar);
      const idxLabel = document.createElement('span');
      idxLabel.className = 'ms-idx';
      idxLabel.textContent = String(idx);
      wrap.appendChild(idxLabel);

      barsEl.appendChild(wrap);
    });

    // 当前区间下划线指示
    if (step.lo >= 0 && step.hi >= 0 && step.phase !== 'init' && step.phase !== 'done') {
      const marker = document.createElement('div');
      marker.className = 'ms-range-marker ms-range-current';
      const barCount = step.array.length;
      const totalWidth = barCount * 50 - 6; // 44px + 6px gap
      const leftPx = (step.lo / barCount) * totalWidth;
      const rightPx = ((step.hi + 1) / barCount) * totalWidth;
      marker.style.width = `${rightPx - leftPx - 6}px`;
      marker.style.left = `${leftPx}px`;
      barsEl.appendChild(marker);
    }
  }

  private renderMergeArea(step: MSStep): void {
    const el = this.mergeAreaEl;
    if (!el) return;
    el.innerHTML = '';

    const inMerge =
      step.phase === 'merge-start' ||
      step.phase === 'merge-compare' ||
      step.phase === 'merge-pick' ||
      step.phase === 'merge-copy';

    if (!inMerge) return;

    // 左子数组
    const leftGroup = this.makeMergeGroup('L (左)', 'ms-label-left');
    step.tempLeft.forEach((v, i) => {
      const item = this.makeMergeItem(v, 'ms-item-left');
      if (i === step.ptrI && step.phase !== 'merge-copy') {
        item.classList.add('ms-item-ptr');
      }
      if (step.phase === 'merge-copy' && i < step.ptrI) {
        item.classList.add('ms-item-exhausted');
      }
      leftGroup.appendChild(item);
    });

    // 箭头
    const arrow1 = document.createElement('div');
    arrow1.className = 'ms-merge-arrow';
    arrow1.textContent = '→';

    // 右子数组
    const rightGroup = this.makeMergeGroup('R (右)', 'ms-label-right');
    step.tempRight.forEach((v, i) => {
      const item = this.makeMergeItem(v, 'ms-item-right');
      if (i === step.ptrJ && step.phase !== 'merge-copy') {
        item.classList.add('ms-item-ptr');
      }
      if (step.phase === 'merge-copy' && i < step.ptrJ) {
        item.classList.add('ms-item-exhausted');
      }
      rightGroup.appendChild(item);
    });

    // 箭头
    const arrow2 = document.createElement('div');
    arrow2.className = 'ms-merge-arrow';
    arrow2.textContent = '→';

    // 结果部分（取 arr[lo..ptrK-1]）
    const resultGroup = this.makeMergeGroup('结果', 'ms-label-result');
    if (step.ptrK > step.lo) {
      for (let k = step.lo; k < step.ptrK && k < step.array.length; k++) {
        const item = this.makeMergeItem(step.array[k], 'ms-item-result');
        resultGroup.appendChild(item);
      }
    } else {
      const placeholder = document.createElement('span');
      placeholder.style.color = '#475569';
      placeholder.style.fontSize = '12px';
      placeholder.textContent = '(空)';
      resultGroup.appendChild(placeholder);
    }

    el.appendChild(leftGroup);
    el.appendChild(arrow1);
    el.appendChild(rightGroup);
    el.appendChild(arrow2);
    el.appendChild(resultGroup);
  }

  private makeMergeGroup(label: string, labelClass: string): HTMLElement {
    const group = document.createElement('div');
    group.className = 'ms-merge-group';
    const lbl = document.createElement('span');
    lbl.className = `ms-merge-group-label ${labelClass}`;
    lbl.textContent = label;
    group.appendChild(lbl);
    return group;
  }

  private makeMergeItem(value: number, cls: string): HTMLElement {
    const item = document.createElement('div');
    item.className = `ms-merge-item ${cls}`;
    item.textContent = String(value);
    return item;
  }

  private renderTree(step: MSStep): void {
    const el = this.treeEl;
    if (!el) return;
    el.innerHTML = '';

    if (!step.tree) return;

    // 渲染树层级（按深度分组）
    const rows = this.buildTreeRows(step.tree, step.treeNode);
    rows.forEach((row, depth) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'ms-tree-row';
      // 深度指示
      const depthLabel = document.createElement('span');
      depthLabel.style.cssText =
        'font-size:10px;color:#475569;font-family:"JetBrains Mono",monospace;min-width:40px;';
      depthLabel.textContent = `L${depth}`;
      rowEl.appendChild(depthLabel);
      row.forEach((node) => {
        const nodeEl = document.createElement('span');
        let cls = 'ms-tree-node';
        if (node.active) cls += ' ms-node-active';
        else if (node.merged) cls += ' ms-node-merged';
        else cls += ' ms-node-pending';
        nodeEl.className = cls;
        nodeEl.textContent = `[${node.left}..${node.right}]${node.sorted ? '=' + node.sorted.join('') : ''}`;
        rowEl.appendChild(nodeEl);
      });
      el.appendChild(rowEl);
    });
  }

  /**
   * 将树按层分组，返回每层节点信息。
   */
  private buildTreeRows(
    node: MSTreeNode,
    activeRange: { left: number; right: number } | null,
  ): { left: number; right: number; active: boolean; merged: boolean; sorted: number[] | undefined }[][] {
    const rows: { left: number; right: number; active: boolean; merged: boolean; sorted: number[] | undefined }[][] = [];
    const queue: { node: MSTreeNode; depth: number }[] = [{ node, depth: 0 }];
    while (queue.length > 0) {
      const { node: cur, depth } = queue.shift()!;
      if (!rows[depth]) rows[depth] = [];
      const isActive =
        activeRange !== null &&
        cur.left === activeRange.left &&
        cur.right === activeRange.right &&
        cur.status === 'active';
      rows[depth].push({
        left: cur.left,
        right: cur.right,
        active: isActive,
        merged: cur.status === 'merged',
        sorted: cur.sorted,
      });
      if (cur.children) {
        queue.push({ node: cur.children[0], depth: depth + 1 });
        queue.push({ node: cur.children[1], depth: depth + 1 });
      }
    }
    return rows;
  }

  private renderResultBanner(step: MSStep): void {
    if (!this.resultEl) return;
    this.resultEl.classList.remove('ms-result--done');
    const emoji = this.resultEl.querySelector('.ms-emoji') as HTMLElement | null;
    if (step.phase === 'done') {
      this.resultEl.classList.add('ms-result--done');
      if (emoji) emoji.textContent = '🎉';
    } else if (step.phase === 'split') {
      if (emoji) emoji.textContent = '✂️';
    } else if (step.phase === 'recurse-left' || step.phase === 'recurse-right') {
      if (emoji) emoji.textContent = '🔀';
    } else if (step.phase === 'merge-start') {
      if (emoji) emoji.textContent = '🫱';
    } else if (step.phase === 'merge-compare') {
      if (emoji) emoji.textContent = '⚖️';
    } else if (step.phase === 'merge-pick') {
      if (emoji) emoji.textContent = '🎯';
    } else if (step.phase === 'merge-copy') {
      if (emoji) emoji.textContent = '📋';
    } else {
      if (emoji) emoji.textContent = '🌿';
    }
  }

  private renderLogPanel(step: MSStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'ms-log-line' + (i === this.currentIndex ? ' ms-log-active' : '');
      const num = document.createElement('span');
      num.className = 'ms-log-num';
      num.textContent = `${String(i + 1).padStart(2, '0')}.`;
      const text = document.createElement('span');
      text.textContent = s.log;
      row.appendChild(num);
      row.appendChild(text);
      this.logEl!.appendChild(row);
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  private renderStepTag(step: MSStep): void {
    if (!this.stepTagEl) return;
    const tagMap: Record<Phase, string> = {
      init: '初始化',
      split: '分割',
      'recurse-left': '递归左',
      'recurse-right': '递归右',
      'merge-start': '合并开始',
      'merge-compare': '比较',
      'merge-pick': '选取',
      'merge-copy': '复制',
      done: '完成',
    };
    this.stepTagEl.textContent = tagMap[step.phase] || '-';
  }
}

registerAlgorithm({
  id: 'merge-sort',
  name: '归并排序',
  viewId: 'algo-merge-sort-view',
  category: 'sort',
  description: '递归拆分 + 指针合并，演示分治思想的完整过程',
  icon: '🌿',
  template,
  Visualizer: MergeSortVisualizer,
  difficulty: 2,
  levelOrder: 5,
  learningGoal: '理解归并排序的分治递归结构与双指针合并过程',
});
