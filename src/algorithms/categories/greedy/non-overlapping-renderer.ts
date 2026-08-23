/**
 * 无重叠区间可视化器（贪心算法）
 * LeetCode 435: 找到最少的区间数量使得剩余区间不重叠
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './non-overlapping.html?raw';

interface NonOverlappingStep {
  intervals: [number, number][];
  currentIndex: number;
  kept: number[];
  removed: number[];
  currentEnd: number;
  message: string;
  codeLine: number;
}

/**
 * 无重叠区间算法（贪心），生成可视化步骤
 */
function nonOverlappingSteps(intervals: [number, number][]): NonOverlappingStep[] {
  const steps: NonOverlappingStep[] = [];

  if (intervals.length === 0) {
    steps.push({
      intervals: [],
      currentIndex: -1,
      kept: [],
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
  const kept: number[] = [];
  const removed: number[] = [];

  // 初始状态
  steps.push({
    intervals: sorted,
    currentIndex: -1,
    kept: [],
    removed: [],
    currentEnd: end,
    message: `按区间终点升序排序: ${sorted.map(i => `[${i[0]},${i[1]}]`).join(', ')}`,
    codeLine: 4
  });

  for (let i = 0; i < sorted.length; i++) {
    const interval = sorted[i];

    steps.push({
      intervals: sorted,
      currentIndex: i,
      kept: [...kept],
      removed: [...removed],
      currentEnd: end,
      message: `考虑区间 ${i}: [${interval[0]}, ${interval[1]}]，当前终点 = ${end === -Infinity ? '无' : end}`,
      codeLine: 8
    });

    if (interval[0] >= end) {
      // 不重叠，保留该区间
      kept.push(i);
      end = interval[1];

      steps.push({
        intervals: sorted,
        currentIndex: i,
        kept: [...kept],
        removed: [...removed],
        currentEnd: end,
        message: `区间起点 ${interval[0]} >= 当前终点 ${end === interval[1] ? end : end}，不重叠，保留该区间`,
        codeLine: 10
      });
    } else {
      // 重叠，移除该区间
      removed.push(i);

      steps.push({
        intervals: sorted,
        currentIndex: i,
        kept: [...kept],
        removed: [...removed],
        currentEnd: end,
        message: `区间起点 ${interval[0]} < 当前终点 ${end}，重叠，移除该区间`,
        codeLine: 14
      });
    }
  }

  // 完成
  steps.push({
    intervals: sorted,
    currentIndex: sorted.length,
    kept: [...kept],
    removed: [...removed],
    currentEnd: end,
    message: `完成！移除 ${removed.length} 个重叠区间`,
    codeLine: 17
  });

  return steps;
}

export class NonOverlappingVisualizer extends StepVisualizer<NonOverlappingStep> {
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
    "}"
  ];
  protected codePanelTitle = '贪心算法 (Java)';

  private inputField: HTMLInputElement | null = null;
  private displayEl: HTMLElement | null = null;
  private keptCountEl: HTMLElement | null = null;
  private removedCountEl: HTMLElement | null = null;
  private currentEndEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.inputField = this.root.querySelector('#non-overlap-input');
    this.displayEl = this.root.querySelector('#non-overlap-display');
    this.keptCountEl = this.root.querySelector('#kept-count');
    this.removedCountEl = this.root.querySelector('#removed-count');
    this.currentEndEl = this.root.querySelector('#current-end');

    this.bindPlaybackControls({
      reset: 'non-overlap-reset',
      prev: 'non-overlap-prev',
      play: 'non-overlap-play',
      next: 'non-overlap-next',
      speed: 'non-overlap-speed',
      speedLabel: 'non-overlap-speed-label',
      message: 'non-overlap-status'
    });

    this.root.querySelector('#non-overlap-start')?.addEventListener('click', () => this.start());
  }

  protected buildSteps(): NonOverlappingStep[] {
    let intervals: [number, number][] = [[1, 2], [2, 3], [3, 4], [1, 3]];

    if (this.inputField) {
      const input = this.inputField.value.trim();
      if (input) {
        try {
          const parsed = JSON.parse(input);
          if (Array.isArray(parsed) && parsed.length > 0) {
            intervals = parsed.map((arr: number[]) => [arr[0], arr[1]] as [number, number]);
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

    return nonOverlappingSteps(intervals);
  }

  protected renderStep(step: NonOverlappingStep): void {
    if (!this.displayEl || !this.keptCountEl || !this.removedCountEl || !this.currentEndEl) return;

    // 更新统计
    this.keptCountEl.textContent = step.kept.length.toString();
    this.removedCountEl.textContent = step.removed.length.toString();
    this.currentEndEl.textContent = step.currentEnd === -Infinity ? '-' : step.currentEnd.toString();

    // 渲染区间
    this.displayEl.innerHTML = '';

    step.intervals.forEach((interval, index) => {
      const row = document.createElement('div');
      row.className = 'interval-row';

      if (index === step.currentIndex) {
        row.classList.add('current');
      } else if (step.kept.includes(index)) {
        row.classList.add('kept');
      } else if (step.removed.includes(index)) {
        row.classList.add('removed');
      }

      const isKept = step.kept.includes(index);
      const isRemoved = step.removed.includes(index);

      row.innerHTML = `
        <span class="interval-index">#${index}</span>
        <span class="interval-range">[${interval[0]}, ${interval[1]}]</span>
        ${isKept ? '<span class="interval-tag tag-kept">保留</span>' : ''}
        ${isRemoved ? '<span class="interval-tag tag-removed">移除</span>' : ''}
      `;

      this.displayEl!.appendChild(row);
    });
  }
}

registerAlgorithm({
  id: 'non-overlapping',
  name: '无重叠区间',
  viewId: 'algo-non-overlapping-view',
  category: 'greedy',
  description: 'LeetCode 435：贪心算法，找到最少的区间数量使得剩余区间不重叠',
  icon: '📐',
  template,
  Visualizer: NonOverlappingVisualizer,
  difficulty: 2,
  levelOrder: 14,
  learningGoal: '理解区间排序加贪心求不重叠数量',
});