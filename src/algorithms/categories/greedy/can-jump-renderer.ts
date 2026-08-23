/**
 * 跳跃游戏 I 可视化器（贪心算法）
 * LeetCode 55
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './can-jump.html?raw';

interface CanJumpStep {
  array: number[];
  currentIndex: number;
  maxReach: number;
  canJump: boolean;
  message: string;
  codeLine: number;
}

/**
 * 跳跃游戏 I 算法（贪心），生成可视化步骤
 */
function canJumpSteps(arr: number[]): CanJumpStep[] {
  const steps: CanJumpStep[] = [];

  if (arr.length === 0) return steps;

  let maxReach = 0;
  let canJump = true;

  // 初始状态
  steps.push({
    array: [...arr],
    currentIndex: 0,
    maxReach: 0,
    canJump: true,
    message: `初始化：当前索引=0，最大可达=0`,
    codeLine: 3
  });

  for (let i = 0; i < arr.length; i++) {
    // 如果当前索引超过了最大可达，无法继续
    if (i > maxReach) {
      canJump = false;
      steps.push({
        array: [...arr],
        currentIndex: i,
        maxReach: maxReach,
        canJump: false,
        message: `❌ 到达索引 ${i}，但最大可达只有 ${maxReach}，无法继续`,
        codeLine: 6
      });
      break;
    }

    // 更新最大可达
    const newMaxReach = Math.max(maxReach, i + arr[i]);

    steps.push({
      array: [...arr],
      currentIndex: i,
      maxReach: maxReach,
      canJump: true,
      message: `位置 ${i}：值=${arr[i]}，可跳到 ${i + arr[i]}`,
      codeLine: 8
    });

    maxReach = newMaxReach;

    steps.push({
      array: [...arr],
      currentIndex: i,
      maxReach: maxReach,
      canJump: true,
      message: `更新最大可达为 ${maxReach}`,
      codeLine: 9
    });

    // 如果已经可以到达终点
    if (maxReach >= arr.length - 1) {
      canJump = true;
      steps.push({
        array: [...arr],
        currentIndex: i,
        maxReach: maxReach,
        canJump: true,
        message: `✓ 最大可达 ${maxReach} >= 终点 ${arr.length - 1}，可以到达！`,
        codeLine: 12
      });
      break;
    }
  }

  // 完成
  steps.push({
    array: [...arr],
    currentIndex: arr.length - 1,
    maxReach: maxReach,
    canJump: canJump,
    message: `最终结果：最大可达=${maxReach}，能否到达终点=${canJump ? '是' : '否'}`,
    codeLine: 15
  });

  return steps;
}

export class CanJumpVisualizer extends StepVisualizer<CanJumpStep> {
  protected codeLines = [
    "public boolean canJump(int[] nums) {",
    "    int maxReach = 0;",
    "    ",
    "    for (int i = 0; i < nums.length; i++) {",
    "        if (i > maxReach) return false;",
    "        maxReach = Math.max(maxReach, i + nums[i]);",
    "        if (maxReach >= nums.length - 1) return true;",
    "    }",
    "    return true;",
    "}",
  ];
  protected codePanelTitle = '贪心算法 (Java)';

  private inputField: HTMLInputElement | null = null;
  private arrayDisplay: HTMLElement | null = null;
  private maxReachEl: HTMLElement | null = null;
  private currentIndexEl: HTMLElement | null = null;
  private statusEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.inputField = this.root.querySelector('#canjump-input');
    this.arrayDisplay = this.root.querySelector('#canjump-array-display');
    this.maxReachEl = this.root.querySelector('#max-reach');
    this.currentIndexEl = this.root.querySelector('#current-index');
    this.statusEl = this.root.querySelector('#jump-status');

    this.bindPlaybackControls({
      reset: 'canjump-reset',
      prev: 'canjump-prev',
      play: 'canjump-play',
      next: 'canjump-next',
      speed: 'canjump-speed',
      speedLabel: 'canjump-speed-label',
      message: 'canjump-status'
    });

    this.root.querySelector('#canjump-start')?.addEventListener('click', () => this.start());
  }

  protected buildSteps(): CanJumpStep[] {
    let arr = [2, 3, 1, 1, 4];

    if (this.inputField) {
      const input = this.inputField.value.trim();
      if (input) {
        const parsed = input.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
        if (parsed.length > 0) arr = parsed;
      }
    }

    return canJumpSteps(arr);
  }

  protected renderStep(step: CanJumpStep): void {
    if (!this.arrayDisplay || !this.maxReachEl || !this.currentIndexEl || !this.statusEl) return;

    // 更新信息面板
    this.maxReachEl.textContent = step.maxReach.toString();
    this.currentIndexEl.textContent = step.currentIndex.toString();
    this.statusEl.textContent = step.canJump ? '✅ 可以到达' : '❌ 无法到达';

    // 渲染数组
    this.arrayDisplay.innerHTML = '';

    step.array.forEach((value, index) => {
      const cell = document.createElement('div');
      cell.className = 'jump-cell';

      if (index === step.currentIndex) {
        cell.classList.add('current');
      } else if (index <= step.maxReach && index !== step.currentIndex) {
        cell.classList.add('reachable');
      } else if (index > step.maxReach && step.currentIndex < index) {
        cell.classList.add('blocked');
      }

      if (index === step.maxReach && index !== step.currentIndex) {
        cell.classList.add('max-reach');
      }

      const valueEl = document.createElement('span');
      valueEl.className = 'value';
      valueEl.textContent = value.toString();

      const indexEl = document.createElement('span');
      indexEl.className = 'index';
      indexEl.textContent = `[${index}]`;

      const rangeEl = document.createElement('span');
      rangeEl.className = 'range';
      rangeEl.textContent = `→${index + value}`;

      cell.appendChild(valueEl);
      cell.appendChild(indexEl);
      cell.appendChild(rangeEl);

      this.arrayDisplay!.appendChild(cell);
    });
  }
}

registerAlgorithm({
  id: 'can-jump',
  name: '跳跃游戏 I',
  viewId: 'algo-can-jump-view',
  category: 'greedy',
  description: 'LeetCode 55：贪心算法，判断是否可以跳到数组末尾',
  icon: '🦘',
  template,
  Visualizer: CanJumpVisualizer,
  difficulty: 1,
  levelOrder: 5,
  learningGoal: '理解跳跃可行性判断的贪心覆盖范围',
});
