/**
 * K次取反后最大化的数组和可视化器（贪心算法）
 * LeetCode 1005: 在操作 K 次后，使数组和最大
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './maximize-sum-k.html?raw';

interface MaxSumKStep {
  array: number[];
  currentIndex: number;
  flipCount: number;
  remainingK: number;
  currentSum: number;
  message: string;
  codeLine: number;
}

/**
 * K次取反后最大化的数组和（贪心算法），生成可视化步骤
 */
function maxSumKSteps(arr: number[], k: number): MaxSumKStep[] {
  const steps: MaxSumKStep[] = [];

  if (arr.length === 0) {
    steps.push({
      array: [],
      currentIndex: -1,
      flipCount: 0,
      remainingK: k,
      currentSum: 0,
      message: '数组为空，返回 0',
      codeLine: 1
    });
    return steps;
  }

  let result = [...arr];
  let remainingK = k;
  let currentSum = arr.reduce((a, b) => a + b, 0);

  // 初始状态
  steps.push({
    array: [...result],
    currentIndex: -1,
    flipCount: 0,
    remainingK: remainingK,
    currentSum: currentSum,
    message: `初始化：数字 ${arr.join(', ')}，剩余 K=$${remainingK}`,
    codeLine: 4
  });

  // 创建带索引的对象数组
  const indexed = arr.map((value, index) => ({ value, index }));

  while (remainingK > 0 && indexed.length > 0) {
    // 对数组排序，先负数升序，非负数降序
    const sorted = [...indexed].sort((a, b) => {
      // 先按符号排序：负数在前
      const aNeg = a.value < 0;
      const bNeg = b.value < 0;
      if (aNeg !== bNeg) return aNeg ? -1 : 1;
      // 同号时，绝对值小的在前面
      return Math.abs(a.value) - Math.abs(b.value);
    });

    // 找到绝对值最小的元素（可能是负数或正数）
    const min = sorted[0];

    steps.push({
      array: [...result],
      currentIndex: min.index,
      flipCount: 0,
      remainingK: remainingK,
      currentSum: currentSum,
      message: `按符号和绝对值排序后，最小数是 ${min.value} 在位置 ${min.index}`,
      codeLine: 8
    });

    if (min.value < 0) {
      // 翻转负数
      result[min.index] = -min.value;
      currentSum -= 2 * min.value;

      steps.push({
        array: [...result],
        currentIndex: min.index,
        flipCount: remainingK,
        remainingK: remainingK - 1,
        currentSum: currentSum,
        message: `位置 ${min.index} 是负数 ${min.value}，翻转为 ${-min.value}，剩余 K=${remainingK - 1}，和的变化=${-2 * min.value}`,
        codeLine: 12
      });
    } else {
      // 翻转最小的正数
      result[min.index] = -min.value;
      currentSum -= 2 * min.value;

      steps.push({
        array: [...result],
        currentIndex: min.index,
        flipCount: remainingK,
        remainingK: remainingK - 1,
        currentSum: currentSum,
        message: `位置 ${min.index} 是最小正数 ${min.value}，翻转为 ${-min.value}，减少的值=${2 * min.value}`,
        codeLine: 15
      });
    }

    remainingK--;

    steps.push({
      array: [...result],
      currentIndex: sorted.length - 1,
      flipCount: remainingK + 1,
      remainingK: remainingK,
      currentSum: currentSum,
      message: `完成第 ${k - remainingK} 次翻转，数组=${result.join(', ')}，剩余 K=${remainingK}`,
      codeLine: 20
    });
  }

  // 完成
  steps.push({
    array: result,
    currentIndex: result.length - 1,
    flipCount: k,
    remainingK: 0,
    currentSum: currentSum,
    message: `完成！最大数组和=${currentSum}`,
    codeLine: 23
  });

  return steps;
}

export class MaxSumKVisualizer extends StepVisualizer<MaxSumKStep> {
  protected codeLines = [
    "public int largestSumAfterKNegations(int[] nums, int k) {",
    "    int[] result = nums.clone();",
    "    int remainingK = k;",
    "    ",
    "    while (remainingK > 0 && result.length > 0) {",
    "        // 按符号和绝对值排序",
    "        Arrays.sort(result, (a, b) -> {",
    "            boolean aNeg = a < 0, bNeg = b < 0;",
    "            if (aNeg != bNeg) return aNeg ? -1 : 1;",
    "            return Integer.compare(Math.abs(a), Math.abs(b));",
    "        });",
    "        ",
    "        if (result[0] < 0) {",
    "            result[0] = -result[0];",
    "            remainingK--;",
    "        } else {",
    "            result[0] = -result[0];",
    "            remainingK--;",
    "        }",
    "    }",
    "    ",
    "    int sum = 0;",
    "    for (int val : result) sum += val;",
    "    return sum;",
    "}"
  ];
  protected codePanelTitle = '贪心算法 (Java)';

  private inputField: HTMLInputElement | null = null;
  private kField: HTMLInputElement | null = null;
  private arrayDisplay: HTMLElement | null = null;
  private flipCountEl: HTMLElement | null = null;
  private remainingKEl: HTMLElement | null = null;
  private currentSumEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.inputField = this.root.querySelector('#max-sum-k-input');
    this.kField = this.root.querySelector('#max-sum-k-k');
    this.arrayDisplay = this.root.querySelector('#max-sum-k-array-display');
    this.flipCountEl = this.root.querySelector('#flip-count');
    this.remainingKEl = this.root.querySelector('#remaining-k');
    this.currentSumEl = this.root.querySelector('#current-sum');

    this.bindPlaybackControls({
      reset: 'max-sum-k-reset',
      prev: 'max-sum-k-prev',
      play: 'max-sum-k-play',
      next: 'max-sum-k-next',
      speed: 'max-sum-k-speed',
      speedLabel: 'max-sum-k-speed-label',
      message: 'max-sum-k-status'
    });

    this.root.querySelector('#max-sum-k-start')?.addEventListener('click', () => this.start());
    this.root.querySelector('#max-sum-k-set-k')?.addEventListener('click', () => this.start());
  }

  protected buildSteps(): MaxSumKStep[] {
    let arr = [4, 2, 3, 0, -1, -5, 3, -4, 5];
    let k = 4;

    if (this.inputField) {
      const input = this.inputField.value.trim();
      if (input) {
        const parsed = input.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
        if (parsed.length > 0) arr = parsed;
      }
    }

    if (this.kField) {
      const kVal = parseInt(this.kField.value.trim(), 10);
      if (!isNaN(kVal)) k = kVal;
    }

    return maxSumKSteps(arr, k);
  }

  protected renderStep(step: MaxSumKStep): void {
    if (!this.arrayDisplay || !this.flipCountEl || !this.remainingKEl || !this.currentSumEl) return;

    // 更新信息面板
    this.flipCountEl.textContent = step.flipCount.toString();
    this.remainingKEl.textContent = step.remainingK.toString();
    this.currentSumEl.textContent = step.currentSum.toString();

    // 渲染数组
    this.arrayDisplay.innerHTML = '';

    step.array.forEach((value, index) => {
      const cell = document.createElement('div');
      cell.className = 'max-sum-cell';

      if (index === step.currentIndex) {
        cell.classList.add('current');
      } else if (index > step.currentIndex) {
        cell.classList.add('flipped');
      }

      cell.innerHTML = `
        <span class="value">${value}</span>
        <span class="index">[${index}]</span>
      `;

      this.arrayDisplay!.appendChild(cell);
    });
  }
}

registerAlgorithm({
  id: 'maximize-sum-k',
  name: 'K次取反后最大化的数组和',
  viewId: 'algo-maximize-sum-k-view',
  category: 'greedy',
  description: 'LeetCode 1005：贪心算法，K次操作后使数组和最大化',
  icon: '🔄',
  template,
  Visualizer: MaxSumKVisualizer,
  difficulty: 1,
  levelOrder: 7,
  learningGoal: '理解 K 次取反后最大化的贪心选择',
});