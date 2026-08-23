/**
 * 两个数组的交集可视化器（哈希集合）
 * LeetCode 349/350
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './intersection-of-two-arrays.html?raw';

interface IAStep {
  arr1: number[];
  arr2: number[];
  phase: 'build-set' | 'scan';
  i: number;
  currentSet: number[];
  result: number[];
  status: 'init' | 'add-set' | 'check' | 'found' | 'skip' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

function buildIntersectionSteps(nums1: number[], nums2: number[]): IAStep[] {
  const steps: IAStep[] = [];
  const set = new Set<number>();
  const result: number[] = [];

  // Init step
  steps.push({
    arr1: nums1,
    arr2: nums2,
    phase: 'build-set',
    i: 0,
    currentSet: [],
    result: [],
    status: 'init',
    message: `开始阶段一：将 nums1 = [${nums1.join(', ')}] 的元素逐个加入哈希集合。`,
    log: '初始化空集合，准备构建哈希集合。',
    codeLine: [1, 2],
  });

  // Phase 1: Build set from nums1
  for (let i = 0; i < nums1.length; i++) {
    const alreadyExists = set.has(nums1[i]);
    set.add(nums1[i]);
    steps.push({
      arr1: nums1,
      arr2: nums2,
      phase: 'build-set',
      i,
      currentSet: [...set],
      result: [],
      status: 'add-set',
      message: `i=${i}，将 nums1[${i}]=${nums1[i]} 加入集合${!alreadyExists ? '' : '（重复值，Set 自动去重）'}。集合：{${[...set].join(', ')}}`,
      log: `Set.add(${nums1[i]})，集合大小=${set.size}`,
      codeLine: 2,
    });
  }

  // Transition to scan phase
  steps.push({
    arr1: nums1,
    arr2: nums2,
    phase: 'scan',
    i: 0,
    currentSet: [...set],
    result: [],
    status: 'check',
    message: `阶段二：集合构建完毕 {${[...set].join(', ')}}，开始扫描 nums2 = [${nums2.join(', ')}]。`,
    log: '切换到阶段二：扫描 nums2，查找集合中的交集元素。',
    codeLine: [3, 4],
  });

  // Phase 2: Scan nums2 for intersection
  for (let i = 0; i < nums2.length; i++) {
    if (set.has(nums2[i]) && !result.includes(nums2[i])) {
      result.push(nums2[i]);
      steps.push({
        arr1: nums1,
        arr2: nums2,
        phase: 'scan',
        i,
        currentSet: [...set],
        result: [...result],
        status: 'found',
        message: `i=${i}，nums2[${i}]=${nums2[i]} 在集合中且结果未包含，加入交集结果！result = [${result.join(', ')}]`,
        log: `✓ 找到交集元素 ${nums2[i]}`,
        codeLine: [5, 6],
      });
    } else if (set.has(nums2[i])) {
      steps.push({
        arr1: nums1,
        arr2: nums2,
        phase: 'scan',
        i,
        currentSet: [...set],
        result: [...result],
        status: 'skip',
        message: `i=${i}，nums2[${i}]=${nums2[i]} 在集合中但已在结果里，跳过。`,
        log: `~ ${nums2[i]} 已存在结果中，跳过重复`,
        codeLine: 5,
      });
    } else {
      steps.push({
        arr1: nums1,
        arr2: nums2,
        phase: 'scan',
        i,
        currentSet: [...set],
        result: [...result],
        status: 'skip',
        message: `i=${i}，nums2[${i}]=${nums2[i]} 不在集合中，跳过。`,
        log: `✗ ${nums2[i]} 不在集合中`,
        codeLine: 5,
      });
    }
  }

  // Done
  steps.push({
    arr1: nums1,
    arr2: nums2,
    phase: 'scan',
    i: nums2.length,
    currentSet: [...set],
    result: [...result],
    status: 'done',
    message: result.length > 0
      ? `扫描完成！交集结果：[${result.join(', ')}]`
      : '扫描完成！两个数组没有交集。',
    log: result.length > 0
      ? `返回 [${result.join(', ')}]`
      : '无交集元素',
    codeLine: 8,
  });

  return steps;
}

export class IntersectionArraysVisualizer extends StepVisualizer<IAStep> {
  protected codeLines = [
    'public int[] intersection(int[] nums1, int[] nums2) {',
    '    HashSet<Integer> set = new HashSet<>();',
    '    for (int num : nums1) set.add(num);',
    '    ArrayList<Integer> result = new ArrayList<>();',
    '    for (int num : nums2) {',
    '        if (set.contains(num) && !result.contains(num)) {',
    '            result.add(num);',
    '        }',
    '    }',
    '    return result.stream().mapToInt(i -> i).toArray();',
    '}',
  ];
  protected codePanelTitle = 'Java 两个数组的交集代码';

  private arr1Input: HTMLInputElement | null = null;
  private arr2Input: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private arr1Track: HTMLElement | null = null;
  private arr2Track: HTMLElement | null = null;
  private setEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private iEl: HTMLElement | null = null;
  private curEl: HTMLElement | null = null;
  private setSizeEl: HTMLElement | null = null;
  private resultCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.arr1Input = this.root.querySelector('#ia-arr1-input');
    this.arr2Input = this.root.querySelector('#ia-arr2-input');
    this.btnStart = this.root.querySelector('#ia-start');
    this.exampleButtons = this.root.querySelectorAll('.ia-example-btn');
    this.arr1Track = this.root.querySelector('#ia-arr1-track');
    this.arr2Track = this.root.querySelector('#ia-arr2-track');
    this.setEl = this.root.querySelector('#ia-set-items');
    this.logEl = this.root.querySelector('#ia-log');
    this.resultEl = this.root.querySelector('#ia-result');
    this.iEl = this.root.querySelector('#ia-i');
    this.curEl = this.root.querySelector('#ia-cur');
    this.setSizeEl = this.root.querySelector('#ia-set-size');
    this.resultCountEl = this.root.querySelector('#ia-result-count');
    this.bindPlaybackControls({ message: 'step-message' });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => {
        if (this.arr1Input) this.arr1Input.value = btn.dataset.arr1 || '';
        if (this.arr2Input) this.arr2Input.value = btn.dataset.arr2 || '';
        this.start();
      };
    });
  }

  protected buildSteps(): IAStep[] {
    const nums1 = (this.arr1Input?.value || '1,2,2,1')
      .split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n));
    if (nums1.length === 0) nums1.push(1, 2, 2, 1);
    const nums2 = (this.arr2Input?.value || '2,2')
      .split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n));
    if (nums2.length === 0) nums2.push(2, 2);
    return buildIntersectionSteps(nums1, nums2);
  }

  protected renderStep(step: IAStep): void {
    // Stats
    if (this.iEl) this.iEl.textContent = String(step.i);
    if (this.curEl) {
      if (step.phase === 'build-set' && step.i < step.arr1.length) {
        this.curEl.textContent = String(step.arr1[step.i]);
      } else if (step.phase === 'scan' && step.i < step.arr2.length) {
        this.curEl.textContent = String(step.arr2[step.i]);
      } else {
        this.curEl.textContent = '-';
      }
    }
    if (this.setSizeEl) this.setSizeEl.textContent = String(step.currentSet.length);
    if (this.resultCountEl) this.resultCountEl.textContent = String(step.result.length);

    // Render arr1 track
    if (this.arr1Track) {
      this.arr1Track.innerHTML = '';
      step.arr1.forEach((value, index) => {
        const cell = document.createElement('div');
        cell.className = 'ia-cell';
        if (step.phase === 'build-set' && index === step.i && step.i < step.arr1.length) {
          cell.classList.add('current');
        }
        if (step.currentSet.includes(value)) {
          cell.classList.add('in-set');
        }
        cell.innerHTML = `<span class="idx">${index}</span><span class="val">${value}</span>`;
        this.arr1Track?.appendChild(cell);
      });
    }

    // Render arr2 track
    if (this.arr2Track) {
      this.arr2Track.innerHTML = '';
      step.arr2.forEach((value, index) => {
        const cell = document.createElement('div');
        cell.className = 'ia-cell';
        if (step.phase === 'scan' && index === step.i && step.i < step.arr2.length) {
          if (step.status === 'found') {
            cell.classList.add('match');
          } else if (step.status === 'skip') {
            cell.classList.add('scanned');
          } else {
            cell.classList.add('current');
          }
        }
        if (step.phase === 'scan' && index < step.i && step.status !== 'init' && step.status !== 'check') {
          if (step.result.includes(value)) {
            cell.classList.add('already-result');
          }
        }
        cell.innerHTML = `<span class="idx">${index}</span><span class="val">${value}</span>`;
        this.arr2Track?.appendChild(cell);
      });
    }

    // Render hash set items
    if (this.setEl) {
      this.setEl.innerHTML = '';
      if (step.currentSet.length === 0) {
        this.setEl.innerHTML = '<span style="color:#6c7086">（空）</span>';
      } else {
        const currentValue = step.phase === 'build-set' && step.i < step.arr1.length ? step.arr1[step.i] : null;
        step.currentSet.forEach((value) => {
          const item = document.createElement('span');
          item.className = 'ia-set-item';
          if (step.phase === 'build-set' && step.status === 'add-set' && value === currentValue) {
            item.classList.add('just-added');
          }
          item.textContent = String(value);
          this.setEl?.appendChild(item);
        });
      }
    }

    // Render result chips
    if (this.resultEl) {
      this.resultEl.innerHTML = '';
      const emoji = document.createElement('span');
      emoji.className = 'ia-emoji';
      emoji.innerHTML = '&#128256;';
      this.resultEl.appendChild(emoji);
      if (step.result.length === 0) {
        const empty = document.createElement('span');
        empty.className = 'ia-empty-text';
        empty.textContent = step.status === 'done' ? '两个数组没有交集' : '结果将在此显示';
        this.resultEl.appendChild(empty);
      } else {
        step.result.forEach((value) => {
          const chip = document.createElement('span');
          chip.className = 'ia-result-chip';
          chip.textContent = String(value);
          this.resultEl?.appendChild(chip);
        });
      }
    }

    this.renderLogLine(step);
  }

  private renderLogLine(step: IAStep): void {
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
  id: 'intersection-arrays',
  name: '两个数组的交集（哈希集合）',
  viewId: 'algo-intersection-arrays-view',
  category: 'hash-table',
  description: '用哈希集合求两个数组的交集元素',
  icon: '\u{1F500}',
  template,
  Visualizer: IntersectionArraysVisualizer,
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握用 Set 去重后高效求交集的思路',
});

export {};
