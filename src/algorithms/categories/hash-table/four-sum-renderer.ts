/**
 * 四数之和可视化器（排序 + 双指针）
 * LeetCode 18
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './four-sum.html?raw';

interface FourSumStep {
  array: number[];
  i: number;
  j: number;
  left: number;
  right: number;
  sum: number | null;
  target: number;
  results: number[][];
  status: 'sort' | 'fix-i' | 'fix-j' | 'check' | 'shrink-l' | 'shrink-r' | 'found' | 'skip-i' | 'skip-j' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

function buildFourSumSteps(input: number[], target: number): FourSumStep[] {
  const steps: FourSumStep[] = [];
  const nums = [...input].sort((a, b) => a - b);
  const results: number[][] = [];

  steps.push({
    array: nums, i: -1, j: -1, left: -1, right: -1, sum: null, target, results: [], status: 'sort',
    message: `先排序：${nums.join(', ')}。然后固定 i、j，用 left、right 双指针。目标和 = ${target}。`,
    log: '排序完成。',
    codeLine: 2,
  });

  for (let i = 0; i < nums.length - 3; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) {
      steps.push({
        array: nums, i, j: -1, left: -1, right: -1, sum: null, target, results: results.map((r) => [...r]), status: 'skip-i',
        message: `nums[i]=${nums[i]} 与上一个相同，跳过去重。`,
        log: `跳过重复 i=${i}。`,
        codeLine: 4,
      });
      continue;
    }

    steps.push({
      array: nums, i, j: -1, left: -1, right: -1, sum: null, target, results: results.map((r) => [...r]), status: 'fix-i',
      message: `固定 i=${i}（值 ${nums[i]}），继续固定 j。`,
      log: `固定 i=${i}。`,
      codeLine: 5,
    });

    for (let j = i + 1; j < nums.length - 2; j++) {
      if (j > i + 1 && nums[j] === nums[j - 1]) {
        steps.push({
          array: nums, i, j, left: -1, right: -1, sum: null, target, results: results.map((r) => [...r]), status: 'skip-j',
          message: `nums[j]=${nums[j]} 与上一个相同，跳过去重。`,
          log: `跳过重复 j=${j}。`,
          codeLine: 7,
        });
        continue;
      }

      let left = j + 1;
      let right = nums.length - 1;
      steps.push({
        array: nums, i, j, left, right, sum: null, target, results: results.map((r) => [...r]), status: 'fix-j',
        message: `固定 j=${j}（值 ${nums[j]}），left=${left}，right=${right}。`,
        log: `固定 j=${j}。`,
        codeLine: [8, 9],
      });

      while (left < right) {
        const sum = nums[i] + nums[j] + nums[left] + nums[right];
        steps.push({
          array: nums, i, j, left, right, sum, target, results: results.map((r) => [...r]), status: 'check',
          message: `四数和 = ${nums[i]} + ${nums[j]} + ${nums[left]} + ${nums[right]} = ${sum}。目标 = ${target}。`,
          log: `sum=${sum}。`,
          codeLine: [10, 11],
        });

        if (sum < target) {
          left++;
          steps.push({
            array: nums, i, j, left, right, sum, target, results: results.map((r) => [...r]), status: 'shrink-l',
            message: `sum < target，和太小，left 右移 → ${left}。`,
            log: `left -> ${left}。`,
            codeLine: 12,
          });
        } else if (sum > target) {
          right--;
          steps.push({
            array: nums, i, j, left, right, sum, target, results: results.map((r) => [...r]), status: 'shrink-r',
            message: `sum > target，和太大，right 左移 → ${right}。`,
            log: `right -> ${right}。`,
            codeLine: 14,
          });
        } else {
          results.push([nums[i], nums[j], nums[left], nums[right]]);
          steps.push({
            array: nums, i, j, left, right, sum, target, results: results.map((r) => [...r]), status: 'found',
            message: `命中！四元组 [${nums[i]}, ${nums[j]}, ${nums[left]}, ${nums[right]}] 加入结果。`,
            log: `找到 [${nums[i]},${nums[j]},${nums[left]},${nums[right]}]。`,
            codeLine: 16,
          });
          // 去重
          while (left < right && nums[left] === nums[left + 1]) left++;
          while (left < right && nums[right] === nums[right - 1]) right--;
          left++;
          right--;
          steps.push({
            array: nums, i, j, left, right, sum, target, results: results.map((r) => [...r]), status: 'found',
            message: `去重并移动指针：left -> ${left}，right -> ${right}。`,
            log: `去重后 left=${left}, right=${right}。`,
            codeLine: [17, 18, 19, 20],
          });
        }
      }
    }
  }

  steps.push({
    array: nums, i: nums.length, j: -1, left: -1, right: -1, sum: null, target, results: results.map((r) => [...r]), status: 'done',
    message: `结束，共找到 ${results.length} 组四元组。`,
    log: `返回 ${results.length} 组。`,
    codeLine: 23,
  });
  return steps;
}

export class FourSumVisualizer extends StepVisualizer<FourSumStep> {
  protected codeLines = [
    'public List<List<Integer>> fourSum(int[] nums, int target) {',
    '    Arrays.sort(nums);',
    '    List<List<Integer>> result = new ArrayList<>();',
    '    for (int i = 0; i < nums.length - 3; i++) {',
    '        if (i > 0 && nums[i] == nums[i - 1]) continue;',
    '        for (int j = i + 1; j < nums.length - 2; j++) {',
    '            if (j > i + 1 && nums[j] == nums[j - 1]) continue;',
    '            int left = j + 1, right = nums.length - 1;',
    '            while (left < right) {',
    '                int sum = nums[i] + nums[j] + nums[left] + nums[right];',
    '                if (sum < target) {',
    '                    left++;',
    '                } else if (sum > target) {',
    '                    right--;',
    '                } else {',
    '                    result.add(Arrays.asList(nums[i], nums[j], nums[left], nums[right]));',
    '                    while (left < right && nums[left] == nums[left + 1]) left++;',
    '                    while (left < right && nums[right] == nums[right - 1]) right--;',
    '                    left++; right--;',
    '                }',
    '            }',
    '        }',
    '    }',
    '    return result;',
    '}',
  ];
  protected codePanelTitle = 'Java 四数之和代码';

  private inputEl: HTMLInputElement | null = null;
  private targetEl: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private trackEl: HTMLElement | null = null;
  private resultsEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private iEl: HTMLElement | null = null;
  private jEl: HTMLElement | null = null;
  private lrEl: HTMLElement | null = null;
  private sumEl: HTMLElement | null = null;
  private countEl: HTMLElement | null = null;
  private currentTarget = 0;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#fs-input');
    this.targetEl = this.root.querySelector('#fs-target');
    this.btnStart = this.root.querySelector('#fs-start');
    this.exampleButtons = this.root.querySelectorAll('.fs-example-btn');
    this.trackEl = this.root.querySelector('#fs-track');
    this.resultsEl = this.root.querySelector('#fs-results-list');
    this.logEl = this.root.querySelector('#fs-log');
    this.iEl = this.root.querySelector('#fs-i');
    this.jEl = this.root.querySelector('#fs-j');
    this.lrEl = this.root.querySelector('#fs-lr');
    this.sumEl = this.root.querySelector('#fs-sum');
    this.countEl = this.root.querySelector('#fs-count');
    this.bindPlaybackControls({ message: 'step-message' });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => {
        if (this.inputEl) this.inputEl.value = btn.dataset.val || '';
        if (this.targetEl) this.targetEl.value = btn.dataset.target || '0';
        this.start();
      };
    });
  }

  protected buildSteps(): FourSumStep[] {
    const nums = (this.inputEl?.value || '1,0,-1,0,-2,2')
      .split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n));
    if (nums.length < 4) nums.push(1, 0, -1, 0, -2, 2);
    const target = parseInt(this.targetEl?.value || '0', 10);
    this.currentTarget = Number.isFinite(target) ? target : 0;
    return buildFourSumSteps(nums, this.currentTarget);
  }

  protected renderStep(step: FourSumStep): void {
    if (this.iEl) this.iEl.textContent = step.i < step.array.length && step.i >= 0 ? String(step.i) : '-';
    if (this.jEl) this.jEl.textContent = step.j >= 0 ? String(step.j) : '-';
    if (this.lrEl) this.lrEl.textContent = step.left >= 0 ? `${step.left}/${step.right}` : '-';
    if (this.sumEl) this.sumEl.textContent = step.sum === null ? '-' : String(step.sum);
    if (this.countEl) this.countEl.textContent = String(step.results.length);

    if (this.trackEl) {
      this.trackEl.innerHTML = '';
      const quad = step.status === 'found' && step.results.length > 0 ? step.results[step.results.length - 1] : null;
      step.array.forEach((value, index) => {
        const cell = document.createElement('div');
        cell.className = 'fs-cell';
        let ptr = '';
        if (index === step.i) { cell.classList.add('i'); ptr = '<span class="fs-ptr" style="color:#f9a8d4">i</span>'; }
        if (index === step.j) { cell.classList.add('j'); ptr = '<span class="fs-ptr" style="color:#c4b5fd">j</span>'; }
        if (index === step.left) { cell.classList.add('left'); ptr = '<span class="fs-ptr" style="color:#6ee7b7">L</span>'; }
        if (index === step.right) { cell.classList.add('right'); ptr = '<span class="fs-ptr" style="color:#fde68a">R</span>'; }
        if (quad && quad.includes(value)) cell.classList.add('quad');
        cell.innerHTML = `${ptr}<span class="idx">${index}</span><span class="val">${value}</span>`;
        this.trackEl?.appendChild(cell);
      });
    }
    if (this.resultsEl) {
      this.resultsEl.innerHTML = '';
      if (step.results.length === 0) {
        this.resultsEl.innerHTML = '<span style="color:#6c7086">（暂无）</span>';
      } else {
        step.results.forEach((r) => {
          const chip = document.createElement('span');
          chip.className = 'fs-result-chip';
          chip.textContent = `[${r.join(', ')}]`;
          this.resultsEl?.appendChild(chip);
        });
      }
    }
    this.renderLogLine(step);
  }

  private renderLogLine(step: FourSumStep): void {
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
  id: 'four-sum',
  name: '四数之和（排序+双指针）',
  viewId: 'algo-four-sum-view',
  category: 'hash-table',
  description: '排序后固定 i/j 再双指针求和为 target 的四元组',
  icon: '🎯',
  template,
  Visualizer: FourSumVisualizer,
  difficulty: 3,
  levelOrder: 3,
  learningGoal: '掌握嵌套双指针 + 多层去重的四数求和技巧',
});
