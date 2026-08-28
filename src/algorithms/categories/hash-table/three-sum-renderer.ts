/**
 * 三数之和可视化器（排序 + 双指针）
 * LeetCode 15
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './three-sum.html?raw';

export interface ThreeSumStep {
  array: number[];
  i: number;
  left: number;
  right: number;
  sum: number | null;
  results: number[][];
  status: 'sort' | 'fix-i' | 'check' | 'shrink-l' | 'shrink-r' | 'found' | 'skip-i' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildThreeSumSteps(input: number[]): ThreeSumStep[] {
  const steps: ThreeSumStep[] = [];
  const nums = [...input].sort((a, b) => a - b);
  const results: number[][] = [];

  steps.push({
    array: nums, i: -1, left: -1, right: -1, sum: null, results: [], status: 'sort',
    message: `先排序：${nums.join(', ')}。然后固定 i，用 left、right 双指针。`,
    log: '排序完成。',
    codeLine: 2,
  });

  for (let i = 0; i < nums.length - 2; i++) {
    if (nums[i] > 0) break;
    if (i > 0 && nums[i] === nums[i - 1]) {
      steps.push({
        array: nums, i, left: -1, right: -1, sum: null, results: results.map((r) => [...r]), status: 'skip-i',
        message: `nums[i]=${nums[i]} 与上一个相同，跳过去重。`,
        log: `跳过重复 i=${i}。`,
        codeLine: 4,
      });
      continue;
    }

    let left = i + 1;
    let right = nums.length - 1;
    steps.push({
      array: nums, i, left, right, sum: null, results: results.map((r) => [...r]), status: 'fix-i',
      message: `固定 i=${i}（值 ${nums[i]}），left=${left}，right=${right}，目标和 = ${-nums[i]}。`,
      log: `固定 i=${i}。`,
      codeLine: [5, 6],
    });

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      steps.push({
        array: nums, i, left, right, sum, results: results.map((r) => [...r]), status: 'check',
        message: `三数和 = ${nums[i]} + ${nums[left]} + ${nums[right]} = ${sum}。`,
        log: `sum=${sum}。`,
        codeLine: [7, 8],
      });

      if (sum < 0) {
        left++;
        steps.push({
          array: nums, i, left, right, sum, results: results.map((r) => [...r]), status: 'shrink-l',
          message: `sum < 0，和太小，left 右移 → ${left}。`,
          log: `left -> ${left}。`,
          codeLine: 9,
        });
      } else if (sum > 0) {
        right--;
        steps.push({
          array: nums, i, left, right, sum, results: results.map((r) => [...r]), status: 'shrink-r',
          message: `sum > 0，和太大，right 左移 → ${right}。`,
          log: `right -> ${right}。`,
          codeLine: 11,
        });
      } else {
        results.push([nums[i], nums[left], nums[right]]);
        steps.push({
          array: nums, i, left, right, sum, results: results.map((r) => [...r]), status: 'found',
          message: `命中！三元组 [${nums[i]}, ${nums[left]}, ${nums[right]}] 加入结果。`,
          log: `找到 [${nums[i]},${nums[left]},${nums[right]}]。`,
          codeLine: 12,
        });
        // 去重
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
        steps.push({
          array: nums, i, left, right, sum, results: results.map((r) => [...r]), status: 'found',
          message: `去重并移动指针：left -> ${left}，right -> ${right}。`,
          log: `去重后 left=${left}, right=${right}。`,
          codeLine: [13, 14, 15, 16],
        });
      }
    }
  }

  steps.push({
    array: nums, i: nums.length, left: -1, right: -1, sum: null, results: results.map((r) => [...r]), status: 'done',
    message: `结束，共找到 ${results.length} 组三元组。`,
    log: `返回 ${results.length} 组。`,
    codeLine: 19,
  });
  return steps;
}

export class ThreeSumVisualizer extends StepVisualizer<ThreeSumStep> {
  protected codeLines = [
    'public List<List<Integer>> threeSum(int[] nums) {',
    '    Arrays.sort(nums);',
    '    List<List<Integer>> result = new ArrayList<>();',
    '    for (int i = 0; i < nums.length - 2; i++) {',
    '        if (i > 0 && nums[i] == nums[i - 1]) continue;',
    '        int left = i + 1, right = nums.length - 1;',
    '        while (left < right) {',
    '            int sum = nums[i] + nums[left] + nums[right];',
    '            if (sum < 0) {',
    '                left++;',
    '            } else if (sum > 0) {',
    '                right--;',
    '            } else {',
    '                result.add(Arrays.asList(nums[i], nums[left], nums[right]));',
    '                while (left < right && nums[left] == nums[left + 1]) left++;',
    '                while (left < right && nums[right] == nums[right - 1]) right--;',
    '                left++; right--;',
    '            }',
    '        }',
    '    }',
    '    return result;',
    '}',
  ];
  protected codePanelTitle = 'Java 三数之和代码';

  private inputEl: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private trackEl: HTMLElement | null = null;
  private resultsEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private iEl: HTMLElement | null = null;
  private lrEl: HTMLElement | null = null;
  private sumEl: HTMLElement | null = null;
  private countEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#th-input');
    this.btnStart = this.root.querySelector('#th-start');
    this.exampleButtons = this.root.querySelectorAll('.th-example-btn');
    this.trackEl = this.root.querySelector('#th-track');
    this.resultsEl = this.root.querySelector('#th-results-list');
    this.logEl = this.root.querySelector('#th-log');
    this.iEl = this.root.querySelector('#th-i');
    this.lrEl = this.root.querySelector('#th-lr');
    this.sumEl = this.root.querySelector('#th-sum');
    this.countEl = this.root.querySelector('#th-count');
    this.bindPlaybackControls({ message: 'step-message' });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => { if (this.inputEl) this.inputEl.value = btn.dataset.val || ''; this.start(); };
    });
  }

  protected buildSteps(): ThreeSumStep[] {
    const nums = (this.inputEl?.value || '-1,0,1,2,-1,-4')
      .split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n));
    if (nums.length < 3) nums.push(-1, 0, 1, 2, -1, -4);
    return buildThreeSumSteps(nums);
  }

  protected renderStep(step: ThreeSumStep): void {
    if (this.iEl) this.iEl.textContent = step.i < step.array.length ? String(step.i) : '-';
    if (this.lrEl) this.lrEl.textContent = step.left >= 0 ? `${step.left}/${step.right}` : '-';
    if (this.sumEl) this.sumEl.textContent = step.sum === null ? '-' : String(step.sum);
    if (this.countEl) this.countEl.textContent = String(step.results.length);

    if (this.trackEl) {
      this.trackEl.innerHTML = '';
      // 判断当前是否命中三元组（用最后一条 found 状态的结果）
      const triplet = step.status === 'found' && step.results.length > 0 ? step.results[step.results.length - 1] : null;
      step.array.forEach((value, index) => {
        const cell = document.createElement('div');
        cell.className = 'th-cell';
        let ptr = '';
        if (index === step.i) { cell.classList.add('i'); ptr = '<span class="th-ptr" style="color:#f5c2e7">i</span>'; }
        if (index === step.left) { cell.classList.add('left'); ptr = '<span class="th-ptr" style="color:#a6e3a1">L</span>'; }
        if (index === step.right) { cell.classList.add('right'); ptr = '<span class="th-ptr" style="color:#f9e2af">R</span>'; }
        if (triplet && triplet.includes(value)) cell.classList.add('triplet');
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
          chip.className = 'th-result-chip';
          chip.textContent = `[${r.join(', ')}]`;
          this.resultsEl?.appendChild(chip);
        });
      }
    }
    this.renderLogLine(step);
  }

  private renderLogLine(step: ThreeSumStep): void {
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
  id: 'three-sum',
  name: '三数之和（排序+双指针）',
  viewId: 'algo-three-sum-view',
  category: 'hash-table',
  description: '排序后双指针求和为0的三元组',
  icon: '🎯',
  template,
  Visualizer: ThreeSumVisualizer,
  difficulty: 3,
  levelOrder: 2,
  learningGoal: '掌握排序 + 双指针 + 去重的三数求和技巧',
});
