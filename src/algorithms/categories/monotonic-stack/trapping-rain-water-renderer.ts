/**
 * 接雨水可视化器（双指针）
 * LeetCode 42
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './trapping-rain-water.html?raw';

interface TRWStep {
  heights: number[];
  left: number;
  right: number;
  leftMax: number;
  rightMax: number;
  water: number[];        // 每列已累积的雨水
  sum: number;            // 累计雨水
  action: 'init' | 'move' | 'add' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

function buildTRWSteps(heights: number[]): TRWStep[] {
  const steps: TRWStep[] = [];
  const n = heights.length;
  const water = new Array(n).fill(0);
  let left = 0, right = n - 1;
  let leftMax = 0, rightMax = 0;
  let sum = 0;

  steps.push({
    heights, left, right, leftMax, rightMax, water: [...water], sum,
    action: 'init',
    message: `初始化左右双指针 L=0、R=${n - 1}，leftMax=0、rightMax=0，累计雨水 0。每次处理较矮的一侧。`,
    log: '初始化双指针。',
    codeLine: [1, 2, 3, 4],
  });

  while (left < right) {
    if (heights[left] < heights[right]) {
      // 处理左侧
      if (heights[left] >= leftMax) {
        leftMax = heights[left];
        steps.push({
          heights, left, right, leftMax, rightMax, water: [...water], sum,
          action: 'move',
          message: `左侧较矮。height[${left}]=${heights[left]} ≥ leftMax=${leftMax - heights[left] || leftMax}，更新 leftMax = ${leftMax}。`,
          log: `L 更新 leftMax=${leftMax}。`,
          codeLine: 5,
        });
      } else {
        const add = leftMax - heights[left];
        water[left] = add;
        sum += add;
        steps.push({
          heights, left, right, leftMax, rightMax, water: [...water], sum,
          action: 'add',
          message: `左侧较矮。height[${left}]=${heights[left]} < leftMax=${leftMax}，可接水 ${leftMax} - ${heights[left]} = ${add}。累计 ${sum}。`,
          log: `L 接水 ${add}，累计 ${sum}。`,
          codeLine: 6,
        });
      }
      left++;
      steps.push({
        heights, left, right, leftMax, rightMax, water: [...water], sum,
        action: 'move',
        message: `左指针右移 → L=${left}。`,
        log: `L++ → ${left}。`,
        codeLine: 7,
      });
    } else {
      // 处理右侧
      if (heights[right] >= rightMax) {
        rightMax = heights[right];
        steps.push({
          heights, left, right, leftMax, rightMax, water: [...water], sum,
          action: 'move',
          message: `右侧较矮。height[${right}]=${heights[right]} ≥ rightMax，更新 rightMax = ${rightMax}。`,
          log: `R 更新 rightMax=${rightMax}。`,
          codeLine: 8,
        });
      } else {
        const add = rightMax - heights[right];
        water[right] = add;
        sum += add;
        steps.push({
          heights, left, right, leftMax, rightMax, water: [...water], sum,
          action: 'add',
          message: `右侧较矮。height[${right}]=${heights[right]} < rightMax=${rightMax}，可接水 ${rightMax} - ${heights[right]} = ${add}。累计 ${sum}。`,
          log: `R 接水 ${add}，累计 ${sum}。`,
          codeLine: 9,
        });
      }
      right--;
      steps.push({
        heights, left, right, leftMax, rightMax, water: [...water], sum,
        action: 'move',
        message: `右指针左移 → R=${right}。`,
        log: `R-- → ${right}。`,
        codeLine: 10,
      });
    }
  }

  steps.push({
    heights, left, right, leftMax, rightMax, water: [...water], sum,
    action: 'done',
    message: `L 与 R 相遇，遍历结束。总共可接雨水 ${sum} 单位。`,
    log: `完成，总雨水 = ${sum}。`,
    codeLine: 11,
  });
  return steps;
}

export class TrappingRainWaterVisualizer extends StepVisualizer<TRWStep> {
  protected codeLines = [
    'public int trap(int[] height) {',
    '    int left = 0, right = height.length - 1;',
    '    int leftMax = 0, rightMax = 0;',
    '    int sum = 0;',
    '    while (left < right) {',
    '        if (height[left] < height[right]) {',
    '            if (height[left] >= leftMax) leftMax = height[left];',
    '            else sum += leftMax - height[left];',
    '            left++;',
    '        } else {',
    '            if (height[right] >= rightMax) rightMax = height[right];',
    '            else sum += rightMax - height[right];',
    '            right--;',
    '        }',
    '    }',
    '    return sum;',
    '}',
  ];
  protected codePanelTitle = '接雨水代码 (Java)';

  private inputEl: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private colsEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private lEl: HTMLElement | null = null;
  private rEl: HTMLElement | null = null;
  private maxEl: HTMLElement | null = null;
  private sumEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#trw-input');
    this.btnStart = this.root.querySelector('#trw-start');
    this.exampleButtons = this.root.querySelectorAll('.trw-example');
    this.colsEl = this.root.querySelector('#trw-cols');
    this.logEl = this.root.querySelector('#trw-log');
    this.lEl = this.root.querySelector('#trw-l');
    this.rEl = this.root.querySelector('#trw-r');
    this.maxEl = this.root.querySelector('#trw-max');
    this.sumEl = this.root.querySelector('#trw-sum');
    this.bindPlaybackControls({ message: 'step-message' });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => { if (this.inputEl) this.inputEl.value = btn.dataset.val || ''; this.start(); };
    });
  }

  protected buildSteps(): TRWStep[] {
    const heights = (this.inputEl?.value || '0,1,0,2,1,0,1,3,2,1,2,1')
      .split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n));
    if (heights.length === 0) heights.push(0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1);
    return buildTRWSteps(heights);
  }

  protected renderStep(step: TRWStep): void {
    if (this.lEl) this.lEl.textContent = String(step.left);
    if (this.rEl) this.rEl.textContent = step.right >= 0 ? String(step.right) : '-';
    if (this.maxEl) this.maxEl.textContent = `${step.leftMax} / ${step.rightMax}`;
    if (this.sumEl) this.sumEl.textContent = String(step.sum);

    if (this.colsEl) {
      this.colsEl.innerHTML = '';
      const maxH = Math.max(...step.heights, 1);
      const unit = 200 / maxH;
      step.heights.forEach((h, idx) => {
        const col = document.createElement('div');
        col.className = 'trw-col';

        const ptr = document.createElement('div');
        ptr.className = 'trw-ptr';
        if (idx === step.left) { ptr.classList.add('l'); ptr.textContent = 'L'; }
        else if (idx === step.right) { ptr.classList.add('r'); ptr.textContent = 'R'; }
        col.appendChild(ptr);

        const wrap = document.createElement('div');
        wrap.className = 'trw-bar-wrap';
        // 水（在柱子上方）
        const water = document.createElement('div');
        water.className = 'trw-water';
        water.style.height = `${(step.water[idx] || 0) * unit}px`;
        // 柱子
        const bar = document.createElement('div');
        bar.className = 'trw-bar';
        bar.style.height = `${h * unit}px`;
        if (idx === step.left) bar.classList.add('left-pointer');
        if (idx === step.right) bar.classList.add('right-pointer');
        wrap.appendChild(water);
        wrap.appendChild(bar);
        col.appendChild(wrap);

        const idxLabel = document.createElement('div');
        idxLabel.className = 'trw-idx';
        idxLabel.textContent = `${idx}`;
        col.appendChild(idxLabel);

        this.colsEl?.appendChild(col);
      });
    }
    this.renderLogLine(step);
  }

  private renderLogLine(step: TRWStep): void {
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
  id: 'trapping-rain-water',
  name: '接雨水（双指针）',
  viewId: 'algo-trapping-rain-water-view',
  category: 'monotonic-stack',
  description: '左右双指针维护两侧最大值，逐列累加雨水',
  icon: '💧',
  template,
  Visualizer: TrappingRainWaterVisualizer,
  difficulty: 3,
  levelOrder: 2,
  learningGoal: '运用单调栈求解接雨水问题',
});
