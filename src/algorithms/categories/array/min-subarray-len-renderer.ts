/**
 * 长度最小的子数组可视化器（滑动窗口）
 * LeetCode 209
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './min-subarray-len.html?raw';

interface SWStep {
  array: number[];
  left: number;
  right: number;
  sum: number;
  minLen: number;
  status: 'expand' | 'shrink' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export class MinSubarrayLenVisualizer extends StepVisualizer<SWStep> {
  protected codeLines = [
    'public int minSubArrayLen(int target, int[] nums) {',
    '    int left = 0, sum = 0, minLen = Integer.MAX_VALUE;',
    '    for (int right = 0; right < nums.length; right++) {',
    '        sum += nums[right];',
    '        while (sum >= target) {',
    '            minLen = Math.min(minLen, right - left + 1);',
    '            sum -= nums[left];',
    '            left++;',
    '        }',
    '    }',
    '    return minLen == Integer.MAX_VALUE ? 0 : minLen;',
    '}',
  ];
  protected codePanelTitle = '滑动窗口 Java 实现';

  private arrayInput: HTMLInputElement | null = null;
  private targetInput: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private trackEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private leftPtrEl: HTMLElement | null = null;
  private rightPtrEl: HTMLElement | null = null;
  private sumEl: HTMLElement | null = null;
  private minLenEl: HTMLElement | null = null;

  /** 持久化的 cell DOM，按 index 复用，避免每步销毁重建 */
  private cellGrid: HTMLElement[] = [];
  /** 窗口框覆盖层：绝对定位在 track 上方，整体平移滑动 */
  private windowBoxEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.arrayInput = this.root.querySelector('#sw-array-input');
    this.targetInput = this.root.querySelector('#sw-target-input');
    this.btnStart = this.root.querySelector('#sw-start');
    this.exampleButtons = this.root.querySelectorAll('.sw-example-btn');
    this.trackEl = this.root.querySelector('#sw-track');
    this.logEl = this.root.querySelector('#sw-log');
    this.leftPtrEl = this.root.querySelector('#sw-left-ptr');
    this.rightPtrEl = this.root.querySelector('#sw-right-ptr');
    this.sumEl = this.root.querySelector('#sw-sum');
    this.minLenEl = this.root.querySelector('#sw-minlen');
    this.bindPlaybackControls({ message: 'step-message' });

    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => {
        if (this.arrayInput) this.arrayInput.value = btn.dataset.arr || '';
        if (this.targetInput) this.targetInput.value = btn.dataset.tgt || '';
        this.start();
      };
    });
  }

  protected buildSteps(): SWStep[] {
    const nums = this.parseArray(this.arrayInput?.value || '2,3,1,2,4,3');
    const target = parseInt(this.targetInput?.value || '7', 10) || 7;
    const steps: SWStep[] = [];
    let left = 0, sum = 0, minLen = Infinity;

    steps.push({
      array: nums, left: 0, right: 0, sum: 0, minLen, status: 'expand',
      message: `初始化 left=0, sum=0, minLen=∞，target=${target}。右指针开始扩展窗口。`,
      log: '初始化滑动窗口变量。',
      codeLine: 1,
    });

    for (let right = 0; right < nums.length; right++) {
      sum += nums[right];
      steps.push({
        array: nums, left, right, sum, minLen, status: 'expand',
        message: `right=${right}：加入 nums[${right}]=${nums[right]}，窗口和 sum=${sum}。`,
        log: `扩展 right=${right}，sum -> ${sum}。`,
        codeLine: [3, 4],
      });

      while (sum >= target) {
        const len = right - left + 1;
        minLen = Math.min(minLen, len);
        steps.push({
          array: nums, left, right, sum, minLen, status: 'shrink',
          message: `sum=${sum} ≥ ${target}，记录窗口长度 ${len}，minLen 更新为 ${minLen}。准备收缩左边界。`,
          log: `命中！长度 ${len}，minLen -> ${minLen}。`,
          codeLine: [5, 6],
        });
        sum -= nums[left];
        left++;
        steps.push({
          array: nums, left, right, sum, minLen, status: 'shrink',
          message: `收缩左边界：移除 nums[${left - 1}]=${nums[left - 1]}，left -> ${left}，sum=${sum}。`,
          log: `收缩 left -> ${left}，sum -> ${sum}。`,
          codeLine: [7, 8],
        });
      }
    }

    steps.push({
      array: nums, left, right: nums.length, sum, minLen, status: 'done',
      message: minLen === Infinity ? `无满足条件的子数组，返回 0。` : `遍历结束，最小长度 = ${minLen}。`,
      log: `返回 ${minLen === Infinity ? 0 : minLen}。`,
      codeLine: 10,
    });
    return steps;
  }

  private parseArray(input: string): number[] {
    return input.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n));
  }

  protected renderStep(step: SWStep): void {
    if (this.leftPtrEl) this.leftPtrEl.textContent = String(step.left);
    if (this.rightPtrEl) this.rightPtrEl.textContent = String(step.right);
    if (this.sumEl) this.sumEl.textContent = String(step.sum);
    if (this.minLenEl) this.minLenEl.textContent = step.minLen === Infinity ? '∞' : String(step.minLen);

    if (this.trackEl) {
      this.ensureCells(step.array.length);
      step.array.forEach((value, index) => {
        const cell = this.cellGrid[index];
        if (!cell) return;
        const inWindow = index >= step.left && index <= step.right && step.right < step.array.length;
        // 切换 class（复用 DOM，transition 生效）
        cell.classList.toggle('inwindow', inWindow);
        // 指针标签（L/R）跟随 cell，仅窗口内显示
        const showLeft = index === step.left && inWindow;
        const showRight = index === step.right && inWindow;
        let pointers = '';
        if (showLeft) pointers += '<span class="sw-ptr left">L</span>';
        if (showRight) pointers += '<span class="sw-ptr right">R</span>';
        cell.innerHTML = `${pointers}<span class="idx">${index}</span><span class="val">${value}</span>`;
      });
      // 窗口框整体平滑滑动
      this.updateWindowBox(step);
    }
    this.renderLogLine(step);
  }

  /** 按需创建/回收 cell，长度匹配时复用 */
  private ensureCells(n: number): void {
    if (!this.trackEl) return;
    while (this.cellGrid.length < n) {
      const cell = document.createElement('div');
      cell.className = 'sw-cell';
      this.cellGrid.push(cell);
      this.trackEl.appendChild(cell);
    }
    while (this.cellGrid.length > n) {
      const cell = this.cellGrid.pop();
      if (cell && cell.parentElement === this.trackEl) this.trackEl.removeChild(cell);
    }
    // 确保窗口框覆盖层存在且位于 track 内（cells 之上）
    if (!this.windowBoxEl) {
      this.windowBoxEl = document.createElement('div');
      this.windowBoxEl.className = 'sw-window-box';
      this.trackEl.appendChild(this.windowBoxEl);
    }
  }

  /** 根据 left/right 计算窗口框位置，靠读取具体 cell 的 offsetLeft/offsetWidth/offsetTop/offsetHeight */
  private updateWindowBox(step: SWStep): void {
    if (!this.windowBoxEl) return;
    const valid = step.right >= step.left && step.right < step.array.length;
    if (!valid) {
      // right 越界（done 步）或空窗口：隐藏
      this.windowBoxEl.style.opacity = '0';
      return;
    }
    const leftCell = this.cellGrid[step.left];
    const rightCell = this.cellGrid[step.right];
    if (!leftCell || !rightCell) {
      this.windowBoxEl.style.opacity = '0';
      return;
    }
    const x = leftCell.offsetLeft;
    const w = rightCell.offsetLeft + rightCell.offsetWidth - leftCell.offsetLeft;
    // 垂直方向与 cell 对齐（cell 居中于 track，不能写死 top）
    const y = leftCell.offsetTop;
    const h = leftCell.offsetHeight;
    this.windowBoxEl.style.transform = `translate(${x}px, ${y}px)`;
    this.windowBoxEl.style.width = `${w}px`;
    this.windowBoxEl.style.height = `${h}px`;
    this.windowBoxEl.style.opacity = '1';
  }

  private renderLogLine(step: SWStep): void {
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
  id: 'min-subarray-len',
  name: '长度最小的子数组（滑动窗口）',
  viewId: 'algo-min-subarray-len-view',
  category: 'array',
  description: '滑动窗口求和≥target的最短子数组',
  icon: '🪟',
  template,
  Visualizer: MinSubarrayLenVisualizer,
  difficulty: 2,
  levelOrder: 2,
  learningGoal: '理解滑动窗口如何高效维护子数组和',
});
