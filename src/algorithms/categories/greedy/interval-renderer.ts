/**
 * 无重叠区间可视化器（贪心算法）
 * LeetCode 435：找到最少的区间数量使得剩余区间不重叠
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './interval.html?raw';

interface IntervalStep {
  intervals: [number, number][];
  currentIndex: number;
  selected: number[];
  removed: number[];
  currentEnd: number;
  message: string;
  codeLine: number;
}

/**
 * 无重叠区间算法（贪心），生成可视化步骤
 */
function intervalSteps(intervals: [number, number][]): IntervalStep[] {
  const steps: IntervalStep[] = [];

  if (intervals.length === 0) {
    steps.push({
      intervals: [],
      currentIndex: -1,
      selected: [],
      removed: [],
      currentEnd: -Infinity,
      message: '输入为空，返回 0',
      codeLine: 1
    });
    return steps;
  }

  // 按终点排序（贪心策略：优先选择终点小的区间）
  const sorted = [...intervals].sort((a, b) => a[1] - b[1]);
  let end = -Infinity;
  const selected: number[] = [];
  const removed: number[] = [];

  // 初始状态
  steps.push({
    intervals: sorted,
    currentIndex: -1,
    selected: [],
    removed: [],
    currentEnd: end,
    message: '按区间终点升序排序，准备贪心选择',
    codeLine: 4
  });

  for (let i = 0; i < sorted.length; i++) {
    const interval = sorted[i];

    steps.push({
      intervals: sorted,
      currentIndex: i,
      selected: [...selected],
      removed: [...removed],
      currentEnd: end,
      message: `考虑区间 ${i}: [${interval[0]}, ${interval[1]}]，当前终点 = ${end === -Infinity ? '-' : end}`,
      codeLine: 8
    });

    if (interval[0] >= end) {
      // 不重叠，选择该区间
      selected.push(i);
      end = interval[1];

      steps.push({
        intervals: sorted,
        currentIndex: i,
        selected: [...selected],
        removed: [...removed],
        currentEnd: end,
        message: `区间起点 ${interval[0]} >= 当前终点 ${end === interval[1] ? interval[1] : end}，不重叠，选择该区间`,
        codeLine: 9
      });
    } else {
      // 重叠，移除该区间
      removed.push(i);

      steps.push({
        intervals: sorted,
        currentIndex: i,
        selected: [...selected],
        removed: [...removed],
        currentEnd: end,
        message: `区间起点 ${interval[0]} < 当前终点 ${end}，重叠，移除该区间`,
        codeLine: 13
      });
    }
  }

  // 完成
  steps.push({
    intervals: sorted,
    currentIndex: sorted.length,
    selected: [...selected],
    removed: [...removed],
    currentEnd: end,
    message: `完成！移除 ${removed.length} 个重叠区间`,
    codeLine: 16
  });

  return steps;
}

export class IntervalVisualizer extends StepVisualizer<IntervalStep> {
  protected codeLines = [
    "public int eraseOverlapIntervals(int[][] intervals) {",
    "    if (intervals.length == 0) return 0;",
    "    ",
    "    // 按终点排序",
    "    Arrays.sort(intervals, (a, b) -> a[1] - b[1]);",
    "    int count = 0;",
    "    int end = Integer.MIN_VALUE;",
    "    ",
    "    for (int i = 0; i < intervals.length; i++) {",
    "        if (intervals[i][0] >= end) {",
    "            end = intervals[i][1];",
    "        } else {",
    "            count++;",
    "        }",
    "    }",
    "    return count;",
    "}",
  ];
  protected codePanelTitle = '贪心算法 (Java)';

  private inputField: HTMLInputElement | null = null;
  private displayEl: HTMLElement | null = null;
  private selectedCountEl: HTMLElement | null = null;
  private removedCountEl: HTMLElement | null = null;
  private currentEndEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.inputField = this.root.querySelector('#interval-input');
    this.displayEl = this.root.querySelector('#interval-display');
    this.selectedCountEl = this.root.querySelector('#selected-count');
    this.removedCountEl = this.root.querySelector('#removed-count');
    this.currentEndEl = this.root.querySelector('#current-end');

    this.bindPlaybackControls({
      reset: 'interval-reset',
      prev: 'interval-prev',
      play: 'interval-play',
      next: 'interval-next',
      speed: 'interval-speed',
      speedLabel: 'interval-speed-label',
      message: 'interval-status'
    });

    this.root.querySelector('#interval-start')?.addEventListener('click', () => this.start());
  }

  protected buildSteps(): IntervalStep[] {
    let intervals: [number, number][] = [[1, 2], [2, 3], [3, 4], [1, 3]];

    if (this.inputField) {
      const input = this.inputField.value.trim();
      if (input) {
        try {
          const parsed = JSON.parse(input);
          if (Array.isArray(parsed) && parsed.length > 0) {
            intervals = parsed.map(arr => [arr[0], arr[1]] as [number, number]);
          }
        } catch {
          // 尝试逗号分隔解析
          const nums = input.split(',').map(n => parseInt(n.trim(), 10));
          if (nums.length > 0 && nums.length % 2 === 0) {
            intervals = [];
            for (let i = 0; i < nums.length; i += 2) {
              intervals.push([nums[i], nums[i + 1]]);
            }
          }
        }
      }
    }

    return intervalSteps(intervals);
  }

  protected renderStep(step: IntervalStep): void {
    if (!this.displayEl || !this.selectedCountEl || !this.removedCountEl || !this.currentEndEl) return;

    // 更新统计
    this.selectedCountEl.textContent = step.selected.length.toString();
    this.removedCountEl.textContent = step.removed.length.toString();
    this.currentEndEl.textContent = step.currentEnd === -Infinity ? '-' : step.currentEnd.toString();

    // 渲染区间
    this.displayEl.innerHTML = '';

    step.intervals.forEach((interval, index) => {
      const item = document.createElement('div');
      item.className = 'interval-item';

      if (index === step.currentIndex) item.classList.add('current');
      if (step.selected.includes(index)) item.classList.add('selected');
      if (step.removed.includes(index)) item.classList.add('removed');

      item.innerHTML = `
        <span class="interval-label">#${index}</span>
        <span class="interval-range">[${interval[0]}, ${interval[1]}]</span>
        ${step.selected.includes(index) ? '<span class="tag selected-tag">保留</span>' : ''}
        ${step.removed.includes(index) ? '<span class="tag removed-tag">移除</span>' : ''}
      `;

      this.displayEl!.appendChild(item);
    });
  }
}

registerAlgorithm({
  id: 'interval',
  name: '无重叠区间',
  viewId: 'algo-interval-view',
  category: 'greedy',
  description: 'LeetCode 435：贪心算法，找到最少的区间数量使得剩余区间不重叠',
  icon: '📐',
  template,
  Visualizer: IntervalVisualizer,
  difficulty: 2,
  levelOrder: 999,
  learningGoal: '理解区间排序后贪心求不重叠数量的思路',
});