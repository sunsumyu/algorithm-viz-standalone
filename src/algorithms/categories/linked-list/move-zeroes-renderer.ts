/**
 * 移动零可视化器（双指针）
 * LeetCode 283
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './move-zeroes.html?raw';

interface MZStep {
  nums: number[];
  i: number;     // 慢指针
  j: number;     // 快指针
  done: boolean;
  message: string;
  log: string;
  codeLine: number | number[];
}

function buildMZSteps(nums: number[]): MZStep[] {
  const steps: MZStep[] = [];
  let i = 0;
  let j = 0;
  let done = false;

  steps.push({
    nums, i: 0, j: 0, done: false,
    message: `初始化：慢指针 i=0，快指针 j=0。遍历数组，将非零元素移到前面。`,
    log: '初始化双指针。',
    codeLine: [1, 2],
  });

  while (!done && j < nums.length) {
    if (nums[j] !== 0) {
      if (i !== j) {
        steps.push({
          nums: [...nums], i, j, done,
          message: `nums[${j}]=${nums[j]}≠0，与 nums[${i}]=${nums[i]} 交换。`,
          log: `swap(${i}, ${j})`,
          codeLine: 3,
        });
        const temp = nums[i];
        nums[i] = nums[j];
        nums[j] = temp;
      } else {
        steps.push({
          nums: [...nums], i, j, done,
          message: `nums[${j}]=${nums[j]}≠0，i=j，无需交换。`,
          log: `nums[${j}]≠0，跳过`,
          codeLine: 3,
        });
      }
      i++;
    }
    j++;
    if (j >= nums.length) done = true;
    steps.push({
      nums, i, j, done,
      message: `j→${j}/${nums.length}，i→${i}。`,
      log: `j=${j}`,
      codeLine: 4,
    });
  }

  steps.push({
    nums, i, j, done: true,
    message: `完成，所有非零元素已移至前方。结果：[${nums.join(', ')}]。`,
    log: `完成`,
    codeLine: 5,
  });
  return steps;
}

export class MoveZeroesVisualizer extends StepVisualizer<MZStep> {
  protected codeLines = [
    'void moveZeroes(int[] nums) {',
    '    int i = 0; // 指向下一个非零位置',
    '    for (int j = 0; j < nums.length; j++) {',
    '        if (nums[j] != 0) {',
    '            int temp = nums[i];',
    '            nums[i] = nums[j];',
    '            nums[j] = temp;',
    '            i++;',
    '        }',
    '    }',
    '}',
  ];
  protected codePanelTitle = '移动零 Java 代码';

  private canvasEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private iEl: HTMLElement | null = null;
  private jEl: HTMLElement | null = null;
  private stateEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.canvasEl = this.root.querySelector('#mz-canvas');
    this.logEl = this.root.querySelector('#mz-log');
    this.iEl = this.root.querySelector('#mz-i');
    this.jEl = this.root.querySelector('#mz-j');
    this.stateEl = this.root.querySelector('#mz-state');
    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#mz-start')?.addEventListener('click', () => this.start());
    this.root.querySelectorAll('.mz-example').forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = this.root?.querySelector('#mz-input') as HTMLInputElement | null;
        if (input) input.value = (btn as HTMLButtonElement).dataset.val || '';
        this.start();
      });
    });
  }

  protected buildSteps(): MZStep[] {
    const input = this.root?.querySelector('#mz-input') as HTMLInputElement | null;
    const nums = (input?.value || '0,1,0,3,12').split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n));
    if (nums.length === 0) nums.push(0, 1, 0, 3, 12);
    return buildMZSteps(nums);
  }

  protected renderStep(step: MZStep): void {
    if (this.iEl) this.iEl.textContent = String(step.i);
    if (this.jEl) this.jEl.textContent = String(step.j);
    if (this.stateEl) this.stateEl.textContent = step.done ? '✓ 完成' : '进行中';
    this.renderCanvas(step);
    this.renderLogLine(step);
  }

  private renderCanvas(step: MZStep): void {
    if (!this.canvasEl) return;
    const container = this.canvasEl as HTMLDivElement;
    container.innerHTML = '';
    const colW = 32;
    const gap = 8;
    const totalW = step.nums.length * (colW + gap);
    const startX = (container.offsetWidth - totalW) / 2;
    const barH = 60;

    step.nums.forEach((val, idx) => {
      const col = document.createElement('div');
      col.className = 'mz-col';
      const bar = document.createElement('div');
      bar.className = `mz-bar ${val === 0 ? 'zero' : 'num'}`;
      bar.style.height = `${barH}px`;
      col.appendChild(bar);
      const label = document.createElement('div');
      label.className = 'mz-idx';
      label.textContent = String(idx);
      col.appendChild(label);
      container.appendChild(col);
    });

    // 指针标记
    const pI = document.createElement('div');
    pI.style.cssText = 'position:absolute;top:-12px;left:' + (startX + step.i * (colW + gap) + colW/2) + 'px;color:#a6e3a1;font-size:0.7rem;white-space:nowrap';
    pI.textContent = 'i=' + step.i;
    container.appendChild(pI);

    const pJ = document.createElement('div');
    pJ.style.cssText = 'position:absolute;top:-12px;left:' + (startX + step.j * (colW + gap) + colW/2) + 'px;color:#f38ba8;font-size:0.7rem;white-space:nowrap';
    pJ.textContent = 'j=' + step.j;
    container.appendChild(pJ);
  }

  private renderLogLine(step: MZStep): void {
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
  id: 'move-zeroes',
  name: '移动零（双指针）',
  viewId: 'algo-move-zeroes-view',
  category: 'linked-list',
  description: '快慢指针将非零元素前移，O(n) 时间 O(1) 额外空间',
  icon: '🎯',
  template,
  Visualizer: MoveZeroesVisualizer,
  difficulty: 1,
  levelOrder: 7,
  learningGoal: '运用双指针将零移到数组末尾',
});