/**
 * 摆动序列可视化器（贪心算法）
 * LeetCode 376
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './wiggle-subsequence.html?raw';

interface WiggleStep {
  array: number[];
  currentIndex: number;
  length: number;
  trend: string;
  prevDiff: number;
  message: string;
  codeLine: number;
}

/**
 * 摆动序列算法（贪心），生成可视化步骤
 */
function wiggleSubsequenceSteps(arr: number[]): WiggleStep[] {
  const steps: WiggleStep[] = [];

  if (arr.length === 0) return steps;
  if (arr.length === 1) {
    steps.push({
      array: [...arr],
      currentIndex: 0,
      length: 1,
      trend: '-',
      prevDiff: 0,
      message: '只有一个元素，摆动序列长度为1',
      codeLine: 3
    });
    return steps;
  }

  let length = 1; // 至少包含第一个元素
  let prevDiff = 0;

  // 初始状态
  steps.push({
    array: [...arr],
    currentIndex: 0,
    length: 1,
    trend: '-',
    prevDiff: 0,
    message: `初始化：摆动序列长度=1，包含第一个元素 ${arr[0]}`,
    codeLine: 4
  });

  for (let i = 1; i < arr.length; i++) {
    const diff = arr[i] - arr[i - 1];

    // 检查是否可以加入摆动序列
    if ((diff > 0 && prevDiff <= 0) || (diff < 0 && prevDiff >= 0)) {
      length++;
      prevDiff = diff;

      steps.push({
        array: [...arr],
        currentIndex: i,
        length: length,
        trend: diff > 0 ? '↑' : '↓',
        prevDiff: diff,
        message: `✓ 位置 ${i}：${arr[i]} - ${arr[i - 1]} = ${diff}，加入摆动序列，长度=${length}`,
        codeLine: 7
      });
    } else {
      steps.push({
        array: [...arr],
        currentIndex: i,
        length: length,
        trend: prevDiff > 0 ? '↑' : '↓',
        prevDiff: prevDiff,
        message: `✗ 位置 ${i}：跳过 ${arr[i]}，因为与前一个差值同号`,
        codeLine: 10
      });
    }
  }

  // 完成
  steps.push({
    array: [...arr],
    currentIndex: arr.length - 1,
    length: length,
    trend: prevDiff > 0 ? '↑' : '↓',
    prevDiff: prevDiff,
    message: `完成！最长摆动子序列长度为 ${length}`,
    codeLine: 13
  });

  return steps;
}

export class WiggleSubsequenceVisualizer extends StepVisualizer<WiggleStep> {
  protected codeLines = [
    "public int wiggleMaxLength(int[] nums) {",
    "    if (nums.length == 1) return 1;",
    "    ",
    "    int up = 1, down = 1;",
    "    for (int i = 1; i < nums.length; i++) {",
    "        if (nums[i] > nums[i - 1]) {",
    "            up = down + 1;",
    "        } else if (nums[i] < nums[i - 1]) {",
    "            down = up + 1;",
    "        }",
    "    }",
    "    return Math.max(up, down);",
    "}"
  ];
  protected codePanelTitle = '贪心算法 (Java)';

  private inputField: HTMLInputElement | null = null;
  private arrayDisplay: HTMLElement | null = null;
  private lengthEl: HTMLElement | null = null;
  private trendEl: HTMLElement | null = null;
  private prevDiffEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.inputField = this.root.querySelector('#wiggle-input');
    this.arrayDisplay = this.root.querySelector('#wiggle-array-display');
    this.lengthEl = this.root.querySelector('#wiggle-length');
    this.trendEl = this.root.querySelector('#wiggle-trend');
    this.prevDiffEl = this.root.querySelector('#wiggle-prevdiff');

    this.bindPlaybackControls({
      reset: 'wiggle-reset',
      prev: 'wiggle-prev',
      play: 'wiggle-play',
      next: 'wiggle-next',
      speed: 'wiggle-speed',
      speedLabel: 'wiggle-speed-label',
      message: 'wiggle-status'
    });

    this.root.querySelector('#wiggle-start')?.addEventListener('click', () => this.start());
  }

  protected buildSteps(): WiggleStep[] {
    let arr = [1, 7, 4, 9, 2, 5];

    if (this.inputField) {
      const input = this.inputField.value.trim();
      if (input) {
        const parsed = input.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
        if (parsed.length > 0) arr = parsed;
      }
    }

    return wiggleSubsequenceSteps(arr);
  }

  protected renderStep(step: WiggleStep): void {
    if (!this.arrayDisplay || !this.lengthEl || !this.trendEl || !this.prevDiffEl) return;

    // 更新信息面板
    this.lengthEl.textContent = step.length.toString();
    this.trendEl.textContent = step.trend;
    this.prevDiffEl.textContent = step.prevDiff.toString();

    // 渲染数组
    this.arrayDisplay.innerHTML = '';

    step.array.forEach((value, index) => {
      const cell = document.createElement('div');
      cell.className = 'wiggle-cell';

      if (index === step.currentIndex) {
        cell.classList.add('current');
      } else if (index < step.currentIndex) {
        cell.classList.add('in-subseq');
      }

      if (index < step.currentIndex) {
        if (step.prevDiff > 0) {
          cell.classList.add('up');
        } else if (step.prevDiff < 0) {
          cell.classList.add('down');
        }
      }

      const valueEl = document.createElement('span');
      valueEl.className = 'value';
      valueEl.textContent = value.toString();

      const indexEl = document.createElement('span');
      indexEl.className = 'index';
      indexEl.textContent = `[${index}]`;

      const trendEl = document.createElement('span');
      trendEl.className = 'trend';
      if (index < step.currentIndex) {
        trendEl.textContent = step.prevDiff > 0 ? '↑' : '↓';
        trendEl.classList.add(step.prevDiff > 0 ? 'up' : 'down');
      } else {
        trendEl.textContent = index === step.currentIndex ? step.trend : '-';
      }

      cell.appendChild(valueEl);
      cell.appendChild(indexEl);
      cell.appendChild(trendEl);

      this.arrayDisplay!.appendChild(cell);
    });
  }
}

registerAlgorithm({
  id: 'wiggle-subsequence',
  name: '摆动序列',
  viewId: 'algo-wiggle-subsequence-view',
  category: 'greedy',
  description: 'LeetCode 376：贪心算法，找到最长摆动子序列的长度',
  icon: '🌊',
  template,
  Visualizer: WiggleSubsequenceVisualizer,
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '掌握摆动序列的贪心策略',
});
