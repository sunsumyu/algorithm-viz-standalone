/**
 * 滑动窗口最大值可视化器
 * LeetCode 239 - 用单调队列求每个滑动窗口的最大值
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './sliding-window-max.html?raw';

interface SWMStep {
  nums: number[];
  k: number;
  i: number;
  deque: number[];
  windowLeft: number;
  windowRight: number;
  result: number[];
  status: 'init' | 'remove-out-of-window' | 'remove-smaller' | 'add-current' | 'record-max' | 'advance' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

interface SWMResult {
  steps: SWMStep[];
  finalResult: number[];
}

/**
 * 解析逗号分隔的数组字符串
 */
function parseArray(str: string): number[] {
  return str
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map(Number)
    .filter((n) => !isNaN(n));
}

/**
 * 生成滑动窗口最大值的每一步可视化数据
 */
function slidingWindowMaxSteps(nums: number[], k: number): SWMResult {
  const steps: SWMStep[] = [];

  if (nums.length === 0 || k <= 0 || k > nums.length) {
    steps.push({
      nums,
      k,
      i: -1,
      deque: [],
      windowLeft: 0,
      windowRight: -1,
      result: [],
      status: 'done',
      message: '输入无效或数组为空',
      log: '[步骤 1] 输入无效',
      codeLine: 0,
    });
    return { steps, finalResult: [] };
  }

  const deque: number[] = [];
  const result: number[] = [];

  const pushStep = (partial: Omit<SWMStep, 'nums' | 'k' | 'log'>) => {
    const log = `[步骤 ${steps.length + 1}] ${partial.message}`;
    steps.push({ nums, k, log, ...partial });
  };

  pushStep({
    i: -1,
    deque: [],
    windowLeft: 0,
    windowRight: -1,
    result: [],
    status: 'init',
    message: `初始化: nums=[${nums}], k=${k}`,
    codeLine: [1, 2, 3],
  });

  for (let i = 0; i < nums.length; i++) {
    const wLeft = i - k + 1;

    // Step: advance to element
    pushStep({
      i,
      deque: [...deque],
      windowLeft: Math.max(0, wLeft),
      windowRight: i,
      result: [...result],
      status: 'advance',
      message: `处理元素 nums[${i}] = ${nums[i]}`,
      codeLine: 4,
    });

    // Step: remove out-of-window elements from front
    while (deque.length > 0 && deque[0] < i - k + 1) {
      const removed = deque.shift()!;
      pushStep({
        i,
        deque: [...deque],
        windowLeft: Math.max(0, wLeft),
        windowRight: i,
        result: [...result],
        status: 'remove-out-of-window',
        message: `队列前端索引 ${removed} 已超出窗口范围 [${Math.max(0, wLeft)}, ${i}]，移除`,
        codeLine: 5,
      });
    }

    // Step: remove smaller elements from back
    while (deque.length > 0 && nums[deque[deque.length - 1]] < nums[i]) {
      const removed = deque.pop()!;
      pushStep({
        i,
        deque: [...deque],
        windowLeft: Math.max(0, wLeft),
        windowRight: i,
        result: [...result],
        status: 'remove-smaller',
        message: `队列尾部索引 ${removed} 对应值 ${nums[removed]} < ${nums[i]}，移除以保持单调递减`,
        codeLine: 6,
      });
    }

    // Step: add current index to deque
    deque.push(i);
    pushStep({
      i,
      deque: [...deque],
      windowLeft: Math.max(0, wLeft),
      windowRight: i,
      result: [...result],
      status: 'add-current',
      message: `将索引 ${i} 加入队列尾部`,
      codeLine: 7,
    });

    // Step: record max if window is complete
    if (i >= k - 1) {
      const maxVal = nums[deque[0]];
      result.push(maxVal);
      pushStep({
        i,
        deque: [...deque],
        windowLeft: Math.max(0, wLeft),
        windowRight: i,
        result: [...result],
        status: 'record-max',
        message: `窗口 [${wLeft}, ${i}] 完整，最大值 = nums[${deque[0]}] = ${maxVal}，记录到结果`,
        codeLine: 8,
      });
    }
  }

  pushStep({
    i: nums.length,
    deque: [...deque],
    windowLeft: nums.length - k,
    windowRight: nums.length - 1,
    result: [...result],
    status: 'done',
    message: `完成！结果: [${result.join(', ')}]`,
    codeLine: 10,
  });

  return { steps, finalResult: result };
}

export class SlidingWindowMaxVisualizer extends StepVisualizer<SWMStep> {
  protected codeLines = [
    'public int[] maxSlidingWindow(int[] nums, int k) {',
    '    // 单调队列（存索引），递减排列',
    '    Deque<Integer> deque = new ArrayDeque<>();',
    '    int[] result = new int[nums.length - k + 1];',
    '    for (int i = 0; i < nums.length; i++) {',
    '        while (!deque.isEmpty() && deque.peekFirst() < i - k + 1) deque.pollFirst();',
    '        while (!deque.isEmpty() && nums[deque.peekLast()] < nums[i]) deque.pollLast();',
    '        deque.offerLast(i);',
    '        if (i >= k - 1) result[i - k + 1] = nums[deque.peekFirst()];',
    '    }',
    '    return result;',
    '}',
  ];
  protected codePanelTitle = '滑动窗口最大值代码 (Java)';

  private arrInput: HTMLInputElement | null = null;
  private kInput: HTMLInputElement | null = null;
  private arrayDisplay: HTMLElement | null = null;
  private dequeContainer: HTMLElement | null = null;
  private resultDisplay: HTMLElement | null = null;
  private resultBanner: HTMLElement | null = null;
  private stateI: HTMLElement | null = null;
  private stateWL: HTMLElement | null = null;
  private stateWR: HTMLElement | null = null;
  private stateDQSize: HTMLElement | null = null;
  private stateMax: HTMLElement | null = null;
  private stateResCount: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.arrInput = this.root.querySelector('#swm-arr-input');
    this.kInput = this.root.querySelector('#swm-k-input');
    this.arrayDisplay = this.root.querySelector('#swm-array-display');
    this.dequeContainer = this.root.querySelector('#swm-deque-container');
    this.resultDisplay = this.root.querySelector('#swm-result-display');
    this.resultBanner = this.root.querySelector('#swm-result-banner');
    this.stateI = this.root.querySelector('#swm-state-i');
    this.stateWL = this.root.querySelector('#swm-state-wl');
    this.stateWR = this.root.querySelector('#swm-state-wr');
    this.stateDQSize = this.root.querySelector('#swm-state-dq-size');
    this.stateMax = this.root.querySelector('#swm-state-max');
    this.stateResCount = this.root.querySelector('#swm-state-res-count');

    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#swm-start')?.addEventListener('click', () => this.start());

    // Bind example buttons
    this.root.querySelectorAll('.swm-example').forEach((btn) => {
      btn.addEventListener('click', () => {
        const arr = (btn as HTMLElement).dataset.arr;
        const k = (btn as HTMLElement).dataset.k;
        if (arr !== undefined && this.arrInput) this.arrInput.value = arr;
        if (k !== undefined && this.kInput) this.kInput.value = k;
        this.start();
      });
    });
  }

  protected buildSteps(): SWMStep[] {
    const nums = parseArray(this.arrInput?.value || '1,3,-1,-3,5,3,6,7');
    const k = parseInt(this.kInput?.value || '3', 10);
    return slidingWindowMaxSteps(nums, k).steps;
  }

  protected renderStep(step: SWMStep): void {
    this.renderArray(step);
    this.renderDeque(step);
    this.renderResult(step);
    this.updateStatePanel(step);
    this.updateResultBanner(step);
  }

  private renderArray(step: SWMStep): void {
    if (!this.arrayDisplay) return;
    this.arrayDisplay.innerHTML = '';

    const wLeft = step.windowLeft;
    const wRight = step.windowRight;
    const frontIdx = step.deque.length > 0 ? step.deque[0] : -1;

    for (let idx = 0; idx < step.nums.length; idx++) {
      const cell = document.createElement('div');
      cell.className = 'arr-cell';
      cell.textContent = String(step.nums[idx]);

      // Index label
      const idxLabel = document.createElement('span');
      idxLabel.className = 'arr-index';
      idxLabel.textContent = String(idx);
      cell.appendChild(idxLabel);

      if (step.status === 'init') {
        // No window yet
      } else if (step.status === 'done') {
        cell.classList.add('processed');
      } else if (idx === step.i && step.status === 'advance') {
        cell.classList.add('current');
      } else if (idx >= wLeft && idx <= wRight) {
        cell.classList.add('in-window');
        // Highlight the max element in gold
        if (idx === frontIdx) {
          cell.classList.remove('in-window');
          cell.classList.add('is-max');
        }
      } else if (step.i >= 0 && idx < step.i) {
        cell.classList.add('processed');
      }

      // Status-specific animations
      if (step.status === 'remove-out-of-window' && idx === step.i) {
        cell.classList.add('current');
      }

      this.arrayDisplay.appendChild(cell);
    }
  }

  private renderDeque(step: SWMStep): void {
    if (!this.dequeContainer) return;
    this.dequeContainer.innerHTML = '';

    if (step.deque.length === 0) {
      const emptyLabel = document.createElement('span');
      emptyLabel.className = 'deque-empty';
      emptyLabel.textContent = step.status === 'init' ? '队列为空' : '队列为空';
      this.dequeContainer.appendChild(emptyLabel);
      return;
    }

    step.deque.forEach((dequeIdx, pos) => {
      const item = document.createElement('div');
      item.className = 'deque-item';

      // First element is the front (max)
      if (pos === 0) {
        item.classList.add('is-front');
      }

      // Show index as primary text, value as secondary
      const idxSpan = document.createElement('span');
      idxSpan.textContent = String(dequeIdx);
      item.appendChild(idxSpan);

      const valSpan = document.createElement('span');
      valSpan.className = 'deque-val';
      valSpan.textContent = `=${step.nums[dequeIdx]}`;
      item.appendChild(valSpan);

      this.dequeContainer!.appendChild(item);
    });
  }

  private renderResult(step: SWMStep): void {
    if (!this.resultDisplay) return;
    this.resultDisplay.innerHTML = '';

    if (step.result.length === 0) {
      const emptyLabel = document.createElement('span');
      emptyLabel.className = 'result-empty';
      emptyLabel.textContent = '尚未记录结果';
      this.resultDisplay.appendChild(emptyLabel);
      return;
    }

    step.result.forEach((val, idx) => {
      const cell = document.createElement('div');
      cell.className = 'result-cell';
      cell.textContent = String(val);

      // Highlight the latest added element
      if (idx === step.result.length - 1 && step.status === 'record-max') {
        cell.classList.add('latest');
      }

      this.resultDisplay!.appendChild(cell);
    });
  }

  private updateStatePanel(step: SWMStep): void {
    if (this.stateI) {
      this.stateI.textContent = step.i >= 0 && step.i < step.nums.length ? String(step.i) : '-';
    }
    if (this.stateWL) {
      this.stateWL.textContent =
        step.status === 'init' || step.status === 'done' ? '-' : String(step.windowLeft);
    }
    if (this.stateWR) {
      this.stateWR.textContent =
        step.status === 'init' || step.status === 'done' ? '-' : String(step.windowRight);
    }
    if (this.stateDQSize) {
      this.stateDQSize.textContent = String(step.deque.length);
    }
    if (this.stateMax) {
      if (step.deque.length > 0 && step.status !== 'init') {
        this.stateMax.textContent = String(step.nums[step.deque[0]]);
      } else {
        this.stateMax.textContent = '-';
      }
    }
    if (this.stateResCount) {
      this.stateResCount.textContent = String(step.result.length);
    }
  }

  private updateResultBanner(step: SWMStep): void {
    if (!this.resultBanner) return;

    if (step.status === 'done') {
      this.resultBanner.textContent = `最终结果: [${step.result.join(', ')}]`;
      this.resultBanner.className = 'result-banner success';
      this.resultBanner.style.display = 'flex';
    } else {
      this.resultBanner.style.display = 'none';
    }
  }
}

registerAlgorithm({
  id: 'sliding-window-max',
  name: '滑动窗口最大值（单调队列）',
  viewId: 'algo-sliding-window-max-view',
  category: 'stack',
  description: '用单调队列求每个滑动窗口的最大值',
  icon: '📊',
  template,
  Visualizer: SlidingWindowMaxVisualizer,
  difficulty: 2,
  levelOrder: 6,
  learningGoal: '掌握用单调队列维护滑动窗口最大值',
});

export {};
