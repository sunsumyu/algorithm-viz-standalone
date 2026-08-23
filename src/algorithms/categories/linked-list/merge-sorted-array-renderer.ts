/**
 * 合并两个有序数组可视化器（双指针）
 * LeetCode 88
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './merge-sorted-array.html?raw';

interface MSAStep {
  arr1: number[];
  arr2: number[];
  m: number;
  n: number;
  i: number;       // arr1 当前位置（从 m-1 往前）
  j: number;       // arr2 当前位置（从 n-1 往前）
  k: number;       // result 写入位置（从 m+n-1 往后）
  compare: 'init' | 'fill' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

function buildMSASteps(nums1: number[], nums2: number[]): MSAStep[] {
  const steps: MSAStep[] = [];
  const m = nums1.length;
  const n = nums2.length;
  const result = new Array(m + n).fill(0);
  let i = m - 1;
  let j = n - 1;
  let k = m + n - 1;

  // 初始化
  steps.push({
    arr1: [...nums1], arr2: [...nums2], m, n, i: m, j: n, k: m + n,
    compare: 'init',
    message: `输入 A=[${nums1}]（长度 ${m}），B=[${nums2}]（长度 ${n}）。` +
              `在 result[${m}..${m+n-1}] 中从右向左填充，i=${m}, j=${n}, k=${m+n}。`,
    log: '初始化：i=m, j=n, k=m+n。',
    codeLine: [1, 2],
  });

  while (i >= 0 || j >= 0) {
    const aVal = i >= 0 ? nums1[i] : -Infinity;
    const bVal = j >= 0 ? nums2[j] : -Infinity;

    if (aVal > bVal) {
      result[k] = nums1[i];
      i--;
      steps.push({
        arr1: [...nums1], arr2: [...nums2], m, n, i, j, k,
        compare: 'fill',
        message: `A[${i}] = ${nums1[i]} > B[${j}] = ${j >= 0 ? nums2[j] : '∞'}，取 A[${i}] → result[${k}] = ${nums1[i]}。`,
        log: `取 A[${i}]=${nums1[i]}，result[${k}] = ${nums1[i]}`,
        codeLine: [3, 4],
      });
      k--;
    } else {
      result[k] = nums2[j];
      j--;
      steps.push({
        arr1: [...nums1], arr2: [...nums2], m, n, i, j, k,
        compare: 'fill',
        message: `A[${i}] = ${i >= 0 ? nums1[i] : '∞'} ≤ B[${j}] = ${nums2[j]}，取 B[${j}] → result[${k}] = ${nums2[j]}。`,
        log: `取 B[${j}]=${nums2[j]}，result[${k}] = ${nums2[j]}`,
        codeLine: [3, 4],
      });
      k--;
    }
  }

  steps.push({
    arr1: [...nums1], arr2: [...nums2], m, n, i: -1, j: -1, k: -1,
    compare: 'done',
    message: `遍历结束。合并结果：[${result.join(', ')}]。`,
    log: `完成，result = [${result.join(', ')}]。`,
    codeLine: 5,
  });
  return steps;
}

export class MergeSortedArrayVisualizer extends StepVisualizer<MSAStep> {
  protected codeLines = [
    'void merge(int[] A, int m, int[] B, int n) {',
    '    int i = m - 1, j = n - 1, k = m + n - 1;',
    '    while (i >= 0 && j >= 0) {',
    '        if (A[i] > B[j]) A[k--] = A[i--];',
    '        else            A[k--] = B[j--];',
    '    }',
    '    // 剩余元素直接复制',
    '}',
  ];
  protected codePanelTitle = '合并有序数组 Java 代码';

  private canvasEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private compEl: HTMLElement | null = null;
  private lenEl: HTMLElement | null = null;
  private stateEl: HTMLElement | null = null;
  private exampleMap: Record<string, [number[], number[]]> = {
    '1': [[1, 2, 3], [2, 5, 6]],
    '2': [[], [1]],
    '3': [[1], []],
  };

  protected initDOMElements(): void {
    if (!this.root) return;
    this.canvasEl = this.root.querySelector('#msa-canvas');
    this.logEl = this.root.querySelector('#msa-log');
    this.compEl = this.root.querySelector('#msa-comp');
    this.lenEl = this.root.querySelector('#msa-len');
    this.stateEl = this.root.querySelector('#msa-state');
    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#msa-start')?.addEventListener('click', () => this.start());
    this.root.querySelectorAll('.msa-example').forEach((btn) => {
      btn.addEventListener('click', () => {
        const d = (btn as HTMLButtonElement).dataset.id;
        if (!d || !this.exampleMap[d]) return;
        const [a, b] = this.exampleMap[d];
        this.steps = buildMSASteps(a, b);
        this.currentIndex = 0;
        this.render();
        this.updateButtons();
      });
    });
  }

  protected buildSteps(): MSAStep[] {
    return this.steps;
  }

  protected renderStep(step: MSAStep): void {
    if (this.compEl) this.compEl.textContent = step.compare === 'done' ? '✓ 完成' : '—';
    if (this.lenEl) this.lenEl.textContent = String(step.arr1.length + step.arr2.length);
    if (this.stateEl) this.stateEl.textContent = step.compare === 'done' ? '已完成' : '进行中';
    this.renderCanvas(step);
    this.renderLogLine(step);
  }

  private renderCanvas(step: MSAStep): void {
    if (!this.canvasEl) return;
    const container = this.canvasEl as HTMLDivElement;
    container.innerHTML = '';
    const totalLen = step.arr1.length + step.arr2.length;
    const barW = 36;
    const gap = 6;
    const startX = (container.offsetWidth - (totalLen * (barW + gap))) / 2;
    const maxH = 200;
    const unit = maxH / Math.max(totalLen, 1);

    const allVals = [...step.arr1, ...step.arr2];
    const result = [...allVals].sort((a, b) => a - b);

    allVals.forEach((val, idx) => {
      const col = document.createElement('div');
      col.className = 'msa-bar-col';
      const bar = document.createElement('div');
      bar.className = 'msa-bar';
      bar.style.height = `${Math.min(unit * val * 3, maxH)}px`;
      bar.style.background = idx < step.arr1.length ? '#45475a' : '#94e2d5';
      col.appendChild(bar);
      const label = document.createElement('div');
      label.className = 'msa-idx';
      label.textContent = String(idx);
      col.appendChild(label);
      container.appendChild(col);
    });

    // 写入结果列
    const resCols = document.createElement('div');
    resCols.style.cssText = 'display:flex;gap:6px;justify-content:center;flex:1';
    result.forEach((val, idx) => {
      const col = document.createElement('div');
      col.className = 'msa-bar-col';
      const bar = document.createElement('div');
      bar.className = 'msa-bar msa-bar.result';
      bar.style.height = `${Math.min(unit * val * 3, maxH)}px`;
      col.appendChild(bar);
      const label = document.createElement('div');
      label.className = 'msa-idx';
      label.textContent = String(idx);
      col.appendChild(label);
      resCols.appendChild(col);
    });
    container.appendChild(resCols);
  }

  private renderLogLine(step: MSAStep): void {
    const logEl = this.logEl;
    if (!logEl) return;
    logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      if (i === this.currentIndex) line.className = 'active';
      line.textContent = `${String(i + 1).padStart(2, '0')}. ${s.log}`;
      logEl.appendChild(line);
    });
    logEl.scrollTop = logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'merge-sorted-array',
  name: '合并两个有序数组（双指针）',
  viewId: 'algo-merge-sorted-array-view',
  category: 'linked-list',
  description: '双指针从后向前填充，O(m+n) 时间 O(1) 额外空间',
  icon: '🔀',
  template,
  Visualizer: MergeSortedArrayVisualizer,
  difficulty: 1,
  levelOrder: 6,
  learningGoal: '学会从后向前的双指针合并排序数组',
});