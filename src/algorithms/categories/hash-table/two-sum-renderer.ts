/**
 * 两数之和可视化器（哈希表）
 * LeetCode 1
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './two-sum.html?raw';

interface TwoSumStep {
  array: number[];
  i: number;
  map: Array<[number, number]>; // [value, index]
  complement: number | null;
  hitIndex: number; // 命中的下标，-1 未命中
  result: number[] | null;
  status: 'check' | 'store' | 'found' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

function buildTwoSumSteps(nums: number[], target: number): TwoSumStep[] {
  const steps: TwoSumStep[] = [];
  const map = new Map<number, number>();

  steps.push({
    array: nums, i: 0, map: [], complement: null, hitIndex: -1, result: null, status: 'check',
    message: `开始遍历，target=${target}。对每个元素查 complement = target - nums[i] 是否在表中。`,
    log: '初始化空哈希表。',
    codeLine: [1, 2],
  });

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    steps.push({
      array: nums, i, map: [...map], complement, hitIndex: -1, result: null, status: 'check',
      message: `i=${i}，nums[i]=${nums[i]}，需要的 complement = ${target} - ${nums[i]} = ${complement}。`,
      log: `查 complement=${complement}。`,
      codeLine: [3, 4, 5],
    });

    if (map.has(complement)) {
      const hitIndex = map.get(complement)!;
      const result = [hitIndex, i];
      steps.push({
        array: nums, i, map: [...map], complement, hitIndex, result, status: 'found',
        message: `命中！map 中已有 ${complement}（下标 ${hitIndex}），返回 [${hitIndex}, ${i}]。`,
        log: `找到结果 [${hitIndex}, ${i}]。`,
        codeLine: 6,
      });
      return steps;
    }

    map.set(nums[i], i);
    steps.push({
      array: nums, i, map: [...map], complement, hitIndex: -1, result: null, status: 'store',
      message: `未命中，把 nums[i]=${nums[i]} 存入 map（下标 ${i}），继续。`,
      log: `存入 map[${nums[i]}] = ${i}。`,
      codeLine: 7,
    });
  }

  steps.push({
    array: nums, i: nums.length, map: [...map], complement: null, hitIndex: -1, result: null, status: 'done',
    message: `遍历结束，未找到和为 ${target} 的两个数。`,
    log: '无解。',
    codeLine: 8,
  });
  return steps;
}

export class TwoSumVisualizer extends StepVisualizer<TwoSumStep> {
  protected codeLines = [
    'public int[] twoSum(int[] nums, int target) {',
    '    HashMap<Integer, Integer> map = new HashMap<>();',
    '    for (int i = 0; i < nums.length; i++) {',
    '        int complement = target - nums[i];',
    '        if (map.containsKey(complement)) {',
    '            return new int[]{map.get(complement), i};',
    '        }',
    '        map.put(nums[i], i);',
    '    }',
    '    return new int[]{};',
    '}',
  ];
  protected codePanelTitle = 'Java 两数之和代码';

  private arrayInput: HTMLInputElement | null = null;
  private targetInput: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private trackEl: HTMLElement | null = null;
  private mapEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private iEl: HTMLElement | null = null;
  private curEl: HTMLElement | null = null;
  private compEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.arrayInput = this.root.querySelector('#ts-array-input');
    this.targetInput = this.root.querySelector('#ts-target-input');
    this.btnStart = this.root.querySelector('#ts-start');
    this.exampleButtons = this.root.querySelectorAll('.ts-example-btn');
    this.trackEl = this.root.querySelector('#ts-track');
    this.mapEl = this.root.querySelector('#ts-map-items');
    this.logEl = this.root.querySelector('#ts-log');
    this.iEl = this.root.querySelector('#ts-i');
    this.curEl = this.root.querySelector('#ts-cur');
    this.compEl = this.root.querySelector('#ts-comp');
    this.resultEl = this.root.querySelector('#ts-result');
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

  protected buildSteps(): TwoSumStep[] {
    const nums = (this.arrayInput?.value || '2,7,11,15')
      .split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n));
    if (nums.length === 0) nums.push(2, 7, 11, 15);
    const target = parseInt(this.targetInput?.value || '9', 10) || 9;
    return buildTwoSumSteps(nums, target);
  }

  protected renderStep(step: TwoSumStep): void {
    if (this.iEl) this.iEl.textContent = String(step.i);
    if (this.curEl) this.curEl.textContent = step.i < step.array.length ? String(step.array[step.i]) : '-';
    if (this.compEl) this.compEl.textContent = step.complement === null ? '-' : String(step.complement);
    if (this.resultEl) this.resultEl.textContent = step.result ? `[${step.result.join(', ')}]` : '-';

    if (this.trackEl) {
      this.trackEl.innerHTML = '';
      step.array.forEach((value, index) => {
        const cell = document.createElement('div');
        cell.className = 'ts-cell';
        if (index === step.i && step.i < step.array.length) cell.classList.add('current');
        if (step.result && step.result.includes(index)) cell.classList.add('pair');
        cell.innerHTML = `<span class="idx">${index}</span><span class="val">${value}</span>`;
        this.trackEl?.appendChild(cell);
      });
    }
    if (this.mapEl) {
      this.mapEl.innerHTML = '';
      if (step.map.length === 0) {
        this.mapEl.innerHTML = '<span style="color:#6c7086">（空）</span>';
      } else {
        step.map.forEach(([value, index]) => {
          const item = document.createElement('span');
          item.className = 'ts-map-item';
          if (index === step.hitIndex) item.classList.add('hit');
          item.textContent = `${value}:${index}`;
          this.mapEl?.appendChild(item);
        });
      }
    }
    this.renderLogLine(step);
  }

  private renderLogLine(step: TwoSumStep): void {
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
  id: 'two-sum',
  name: '两数之和（哈希表）',
  viewId: 'algo-two-sum-view',
  category: 'hash-table',
  description: '哈希表一次遍历求两数之和',
  icon: '🔗',
  template,
  Visualizer: TwoSumVisualizer,
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '理解哈希表如何替代暴力枚举降低时间复杂度',
});
