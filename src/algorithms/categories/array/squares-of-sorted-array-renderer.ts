/**
 * 有序数组的平方可视化器（双指针）
 * LeetCode 977
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './squares-of-sorted-array.html?raw';

export interface SSQStep {
  arr: number[];
  result: number[];
  left: number;
  right: number;
  writeIdx: number;
  status: 'init' | 'compare' | 'write-left' | 'write-right' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildSortedSquaresSteps(arr: number[]): SSQStep[] {
  const steps: SSQStep[] = [];
  const n = arr.length;
  const result: number[] = new Array(n).fill(null);
  let left = 0;
  let right = n - 1;

  steps.push({
    arr: [...arr], result: [...result], left, right, writeIdx: n - 1, status: 'init',
    message: `初始化 left=0, right=${n - 1}，结果数组从右端 (i=${n - 1}) 开始填充。`,
    log: '初始化首尾双指针。',
    codeLine: [1, 2, 3, 4],
  });

  for (let i = n - 1; i >= 0; i--) {
    const lsq = arr[left] * arr[left];
    const rsq = arr[right] * arr[right];

    steps.push({
      arr: [...arr], result: [...result], left, right, writeIdx: i, status: 'compare',
      message: `比较 nums[left=${left}]² = ${lsq} 与 nums[right=${right}]² = ${rsq}，将较大者填入 result[i=${i}]。`,
      log: `比较 left²=${lsq} 与 right²=${rsq}。`,
      codeLine: [5, 6, 7],
    });

    if (lsq > rsq) {
      result[i] = lsq;
      steps.push({
        arr: [...arr], result: [...result], left, right, writeIdx: i, status: 'write-left',
        message: `${lsq} > ${rsq}，取左侧平方 result[${i}] = ${lsq}，left++ → ${left + 1}。`,
        log: `result[${i}] = ${lsq}（来自 left=${left}），left -> ${left + 1}。`,
        codeLine: [8, 9, 10],
      });
      left++;
    } else {
      result[i] = rsq;
      steps.push({
        arr: [...arr], result: [...result], left, right, writeIdx: i, status: 'write-right',
        message: `${lsq} <= ${rsq}，取右侧平方 result[${i}] = ${rsq}，right-- → ${right - 1}。`,
        log: `result[${i}] = ${rsq}（来自 right=${right}），right -> ${right - 1}。`,
        codeLine: [11, 12, 13],
      });
      right--;
    }
  }

  steps.push({
    arr: [...arr], result: [...result], left, right, writeIdx: -1, status: 'done',
    message: `填充完成，结果数组为 [${result.join(', ')}]。`,
    log: `返回 result = [${result.join(', ')}]。`,
    codeLine: 15,
  });
  return steps;
}

export class SortedSquaresVisualizer extends StepVisualizer<SSQStep> {
  protected codeLines = [
    'public int[] sortedSquares(int[] nums) {',
    '    int n = nums.length;',
    '    int[] result = new int[n];',
    '    int left = 0, right = n - 1;',
    '    for (int i = n - 1; i >= 0; i--) {',
    '        int lsq = nums[left] * nums[left];',
    '        int rsq = nums[right] * nums[right];',
    '        if (lsq > rsq) {',
    '            result[i] = lsq;',
    '            left++;',
    '        } else {',
    '            result[i] = rsq;',
    '            right--;',
    '        }',
    '    }',
    '    return result;',
    '}',
  ];
  protected codePanelTitle = '有序数组的平方 Java 实现';

  private arrayInput: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private inputTrackEl: HTMLElement | null = null;
  private resultTrackEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private leftEl: HTMLElement | null = null;
  private rightEl: HTMLElement | null = null;
  private writeEl: HTMLElement | null = null;
  private squareEl: HTMLElement | null = null;
  private currentArray: number[] = [-4, -1, 0, 3, 10];
  /** 持久化 input track 的 cell */
  private inputCells: HTMLElement[] = [];
  /** 持久化 result track 的 cell */
  private resultCells: HTMLElement[] = [];
  /** 上一帧每个 result 位置是否已填值，用于检测 flying-in */
  private prevResultFilled: boolean[] = [];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.arrayInput = this.root.querySelector('#ssq-array-input');
    this.btnStart = this.root.querySelector('#ssq-start');
    this.exampleButtons = this.root.querySelectorAll('.ssq-example-btn');
    this.inputTrackEl = this.root.querySelector('#ssq-input-track');
    this.resultTrackEl = this.root.querySelector('#ssq-result-track');
    this.logEl = this.root.querySelector('#ssq-log');
    this.leftEl = this.root.querySelector('#ssq-left');
    this.rightEl = this.root.querySelector('#ssq-right');
    this.writeEl = this.root.querySelector('#ssq-write');
    this.squareEl = this.root.querySelector('#ssq-square');
    this.bindPlaybackControls({ message: 'step-message' });

    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => {
        if (this.arrayInput) this.arrayInput.value = btn.dataset.arr || '';
        this.start();
      };
    });
  }

  protected buildSteps(): SSQStep[] {
    const arr = this.parseArray(this.arrayInput?.value || '-4,-1,0,3,10');
    this.currentArray = [...arr];
    return buildSortedSquaresSteps(this.currentArray);
  }

  private parseArray(input: string): number[] {
    return input.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n));
  }

  protected renderStep(step: SSQStep): void {
    if (this.leftEl) this.leftEl.textContent = String(step.left);
    if (this.rightEl) this.rightEl.textContent = String(step.right);
    if (this.writeEl) this.writeEl.textContent = step.writeIdx >= 0 ? String(step.writeIdx) : '-';
    const sq = this.computeCurrentSquare(step);
    if (this.squareEl) this.squareEl.textContent = sq === null ? '-' : String(sq);

    this.renderInputTrack(step);
    this.renderResultTrack(step);
    this.renderLogLine(step);
  }

  private computeCurrentSquare(step: SSQStep): number | null {
    if (step.status === 'compare') {
      const lsq = step.arr[step.left] * step.arr[step.left];
      const rsq = step.arr[step.right] * step.arr[step.right];
      return Math.max(lsq, rsq);
    }
    if (step.status === 'write-left') {
      return step.arr[step.left] * step.arr[step.left];
    }
    if (step.status === 'write-right') {
      return step.arr[step.right] * step.arr[step.right];
    }
    return null;
  }

  private renderInputTrack(step: SSQStep): void {
    if (!this.inputTrackEl) return;
    this.ensureInputCells(step.arr.length);
    const largerSide = this.largerSide(step);
    // write 步骤中源端的 input cell 标记 flying-out
    const flyingOutIdx =
      (step.status === 'write-left' || step.status === 'write-right')
        ? (step.status === 'write-left' ? step.left : step.right)
        : -1;
    step.arr.forEach((value, index) => {
      const cell = this.inputCells[index];
      if (!cell) return;
      const isLeft = index === step.left && step.status !== 'done';
      const isRight = index === step.right && step.status !== 'done';
      const isCompare =
        (step.status === 'compare' || step.status === 'write-left' || step.status === 'write-right') && largerSide === index;
      const isFlyingOut = index === flyingOutIdx;

      cell.classList.toggle('both-ptr', isLeft && isRight);
      cell.classList.toggle('left-ptr', isLeft && !isRight);
      cell.classList.toggle('right-ptr', !isLeft && isRight);
      cell.classList.toggle('compare', isCompare);

      if (isFlyingOut) {
        this.restartAnimation(cell, 'flying-out');
      } else {
        cell.classList.remove('flying-out');
      }

      let pointers = '';
      if (isLeft) pointers += '<span class="ssq-ptr left">L</span>';
      if (isRight) pointers += '<span class="ssq-ptr right">R</span>';
      cell.innerHTML = `${pointers}<span class="idx">${index}</span><span class="val">${value}</span>`;
    });
  }

  private largerSide(step: SSQStep): number | null {
    if (step.status !== 'compare' && step.status !== 'write-left' && step.status !== 'write-right') return null;
    const lsq = step.arr[step.left] * step.arr[step.left];
    const rsq = step.arr[step.right] * step.arr[step.right];
    return lsq > rsq ? step.left : step.right;
  }

  private renderResultTrack(step: SSQStep): void {
    if (!this.resultTrackEl) return;
    const n = step.result.length;
    this.ensureResultCells(n);
    const isWriteStep = step.status === 'write-left' || step.status === 'write-right';
    for (let i = 0; i < n; i++) {
      const cell = this.resultCells[i];
      if (!cell) continue;
      const value = step.result[i];
      const isEmpty = value === null || value === undefined;
      const isWritingPtr =
        (isWriteStep && i === step.writeIdx) ||
        (i === step.writeIdx && step.status === 'init');
      // flying-in：本帧从空变为有值（写入瞬间）
      const wasFilled = this.prevResultFilled[i];
      const isFlyingIn = isWriteStep && i === step.writeIdx && !isEmpty && !wasFilled;

      // 重置所有状态 class 后按需加回
      cell.classList.remove('empty', 'writing', 'filled', 'done');
      if (isEmpty) cell.classList.add('empty');
      if (step.status === 'done') cell.classList.add('done');
      else if (!isEmpty && !isWriteStep) cell.classList.add('filled');

      if (isFlyingIn) {
        this.restartAnimation(cell, 'flying-in');
      } else {
        cell.classList.remove('flying-in');
      }

      // writing（指针写入位置）单独保留，用于既有视觉
      if (isWritingPtr && (isWriteStep || step.status === 'init')) cell.classList.add('writing');

      let pointers = '';
      if (isWritingPtr) pointers = '<span class="ssq-ptr write">i</span>';
      const displayVal = isEmpty ? '·' : String(value);
      cell.innerHTML = `${pointers}<span class="idx">${i}</span><span class="val">${displayVal}</span>`;
    }
    // 记录本帧已填状态
    this.prevResultFilled = step.result.map((v) => v !== null && v !== undefined);
  }

  /** 按需创建/回收 input cell */
  private ensureInputCells(n: number): void {
    if (!this.inputTrackEl) return;
    while (this.inputCells.length < n) {
      const cell = document.createElement('div');
      cell.className = 'ssq-cell';
      this.inputCells.push(cell);
      this.inputTrackEl.appendChild(cell);
    }
    while (this.inputCells.length > n) {
      const cell = this.inputCells.pop();
      if (cell && cell.parentElement === this.inputTrackEl) this.inputTrackEl.removeChild(cell);
    }
  }

  /** 按需创建/回收 result cell */
  private ensureResultCells(n: number): void {
    if (!this.resultTrackEl) return;
    while (this.resultCells.length < n) {
      const cell = document.createElement('div');
      cell.className = 'ssq-cell';
      this.resultCells.push(cell);
      this.resultTrackEl.appendChild(cell);
      this.prevResultFilled.push(false);
    }
    while (this.resultCells.length > n) {
      const cell = this.resultCells.pop();
      if (cell && cell.parentElement === this.resultTrackEl) this.resultTrackEl.removeChild(cell);
      this.prevResultFilled.pop();
    }
  }

  /** 重启 CSS 动画 class */
  private restartAnimation(el: HTMLElement, cls: string): void {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  private renderLogLine(step: SSQStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      if (i === this.currentIndex) line.className = 'active';
      line.textContent = `${String(i + 1).padStart(2, '0')}. ${s.log}`;
      this.logEl?.appendChild(line);
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'sorted-squares',
  name: '有序数组的平方（双指针）',
  viewId: 'algo-sorted-squares-view',
  category: 'array',
  description: '首尾双指针从大到小填入结果数组',
  icon: '²',
  template,
  Visualizer: SortedSquaresVisualizer,
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '掌握利用有序性用双指针避免排序',
});

export {};
