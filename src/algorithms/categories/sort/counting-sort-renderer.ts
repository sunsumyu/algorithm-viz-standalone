/**
 * 计数排序可视化器
 * 三区域布局：原数组 + 计数数组 + 输出数组
 * 玻璃拟态翠绿色系
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './counting-sort.html?raw';

type Phase = 'init' | 'find-max' | 'count-init' | 'counting' | 'prefix-sum' | 'place' | 'copy-back' | 'done';

interface CSStep {
  array: number[];
  count: number[];
  output: number[];
  max: number;
  phase: Phase;
  currentI: number;            // 当前遍历下标 (-1 = 不在遍历态)
  activeCountIdx: number;      // 高亮的 count 下标 (-1 = 无)
  scanMaxIdx: number;          // find-max 扫描下标
  currentMax: number;          // find-max 过程中当前最大值
  placedCount: number;         // 已放入输出数组的元素个数
  prefixIdx: number;           // prefix-sum 当前下标
  comparisons: number;
  message: string;
  log: string;
  codeLine: number | number[];
}

function parseArray(input: string): number[] {
  return input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n >= 0);
}

function countingSortSteps(input: number[]): CSStep[] {
  const steps: CSStep[] = [];
  const n = input.length;
  if (n === 0) {
    steps.push({
      array: [], count: [], output: [], max: 0, phase: 'init',
      currentI: -1, activeCountIdx: -1, scanMaxIdx: -1, currentMax: 0,
      placedCount: 0, prefixIdx: -1, comparisons: 0,
      message: '数组为空，无需排序。',
      log: 'empty array',
      codeLine: 1,
    });
    steps.push({
      array: [], count: [], output: [], max: 0, phase: 'done',
      currentI: -1, activeCountIdx: -1, scanMaxIdx: -1, currentMax: 0,
      placedCount: 0, prefixIdx: -1, comparisons: 0,
      message: '数组为空，排序完成。',
      log: 'done (empty)',
      codeLine: 22,
    });
    return steps;
  }

  const array = [...input];
  let comparisons = 0;

  // --- init ---
  steps.push({
    array: [...array], count: [], output: new Array(n).fill(-1), max: 0,
    phase: 'init', currentI: -1, activeCountIdx: -1, scanMaxIdx: -1, currentMax: 0,
    placedCount: 0, prefixIdx: -1, comparisons: 0,
    message: `初始化：原始数组 [${array.join(', ')}]，共 ${n} 个元素。`,
    log: `init: array = [${array.join(', ')}]`,
    codeLine: 2,
  });

  // --- find-max (show every element scanned) ---
  let maxVal = array[0];
  steps.push({
    array: [...array], count: [], output: new Array(n).fill(-1), max: 0,
    phase: 'find-max', currentI: -1, activeCountIdx: -1, scanMaxIdx: 0, currentMax: array[0],
    placedCount: 0, prefixIdx: -1, comparisons: 0,
    message: `开始找最大值：arr[0] = ${array[0]} 作为初始 max。`,
    log: `find-max: init max = arr[0] = ${array[0]}`,
    codeLine: 4,
  });

  for (let i = 1; i < n; i++) {
    comparisons++;
    if (array[i] > maxVal) {
      maxVal = array[i];
    }
    steps.push({
      array: [...array], count: [], output: new Array(n).fill(-1), max: maxVal,
      phase: 'find-max', currentI: -1, activeCountIdx: -1, scanMaxIdx: i, currentMax: maxVal,
      placedCount: 0, prefixIdx: -1, comparisons,
      message: `扫描 arr[${i}] = ${array[i]}，当前最大值 max = ${maxVal}。`,
      log: `find-max: arr[${i}]=${array[i]}, max=${maxVal}`,
      codeLine: [5, 7],
    });
  }

  steps.push({
    array: [...array], count: [], output: new Array(n).fill(-1), max: maxVal,
    phase: 'find-max', currentI: -1, activeCountIdx: -1, scanMaxIdx: -1, currentMax: maxVal,
    placedCount: 0, prefixIdx: -1, comparisons,
    message: `找到最大值 max = ${maxVal}，计数数组大小 = ${maxVal + 1}。`,
    log: `find-max done: max = ${maxVal}`,
    codeLine: 8,
  });

  // --- count-init ---
  const count = new Array(maxVal + 1).fill(0);
  steps.push({
    array: [...array], count: [...count], output: new Array(n).fill(-1), max: maxVal,
    phase: 'count-init', currentI: -1, activeCountIdx: -1, scanMaxIdx: -1, currentMax: maxVal,
    placedCount: 0, prefixIdx: -1, comparisons,
    message: `创建计数数组 count[0..${maxVal}]，全部初始化为 0。`,
    log: `count-init: count[0..${maxVal}] = [${count.join(',')}]`,
    codeLine: 10,
  });

  // --- counting ---
  for (let i = 0; i < n; i++) {
    count[array[i]]++;
    steps.push({
      array: [...array], count: [...count], output: new Array(n).fill(-1), max: maxVal,
      phase: 'counting', currentI: i, activeCountIdx: array[i], scanMaxIdx: -1, currentMax: maxVal,
      placedCount: 0, prefixIdx: -1, comparisons,
      message: `遍历 arr[${i}] = ${array[i]}：count[${array[i]}]++ → count[${array[i]}] = ${count[array[i]]}。`,
      log: `count: arr[${i}]=${array[i]}, count[${array[i]}]++ → ${count[array[i]]}`,
      codeLine: [12, 13],
    });
  }

  steps.push({
    array: [...array], count: [...count], output: new Array(n).fill(-1), max: maxVal,
    phase: 'counting', currentI: -1, activeCountIdx: -1, scanMaxIdx: -1, currentMax: maxVal,
    placedCount: 0, prefixIdx: -1, comparisons,
    message: `统计完成：计数数组 count = [${count.join(', ')}]。`,
    log: `counting done: count = [${count.join(',')}]`,
    codeLine: 14,
  });

  // --- prefix-sum ---
  steps.push({
    array: [...array], count: [...count], output: new Array(n).fill(-1), max: maxVal,
    phase: 'prefix-sum', currentI: -1, activeCountIdx: 0, scanMaxIdx: -1, currentMax: maxVal,
    placedCount: 0, prefixIdx: 0, comparisons,
    message: `开始计算前缀和：count[0] = ${count[0]}（保持不变）。`,
    log: `prefix-sum: count[0] = ${count[0]}`,
    codeLine: 16,
  });

  for (let i = 1; i <= maxVal; i++) {
    count[i] += count[i - 1];
    steps.push({
      array: [...array], count: [...count], output: new Array(n).fill(-1), max: maxVal,
      phase: 'prefix-sum', currentI: -1, activeCountIdx: i, scanMaxIdx: -1, currentMax: maxVal,
      placedCount: 0, prefixIdx: i, comparisons,
      message: `count[${i}] += count[${i - 1}]：count[${i}] = ${count[i]}（表示 ≤ ${i} 的元素共 ${count[i]} 个）。`,
      log: `prefix-sum: count[${i}] += count[${i - 1}] → ${count[i]}`,
      codeLine: [17, 18],
    });
  }

  steps.push({
    array: [...array], count: [...count], output: new Array(n).fill(-1), max: maxVal,
    phase: 'prefix-sum', currentI: -1, activeCountIdx: -1, scanMaxIdx: -1, currentMax: maxVal,
    placedCount: 0, prefixIdx: -1, comparisons,
    message: `前缀和完成：count = [${count.join(', ')}]。`,
    log: `prefix-sum done: count = [${count.join(',')}]`,
    codeLine: 19,
  });

  // --- place ---
  const output = new Array(n).fill(-1);
  let placed = 0;

  for (let i = n - 1; i >= 0; i--) {
    const val = array[i];
    const pos = count[val] - 1;
    output[pos] = val;
    count[val]--;
    placed++;

    steps.push({
      array: [...array], count: [...count], output: [...output], max: maxVal,
      phase: 'place', currentI: i, activeCountIdx: val, scanMaxIdx: -1, currentMax: maxVal,
      placedCount: placed, prefixIdx: -1, comparisons,
      message: `反向遍历 arr[${i}] = ${val}：放入 output[${pos}]，count[${val}]-- → ${count[val]}。`,
      log: `place: arr[${i}]=${val} → output[${pos}], count[${val}]=${count[val]}`,
      codeLine: [21, 22, 23],
    });
  }

  steps.push({
    array: [...array], count: [...count], output: [...output], max: maxVal,
    phase: 'place', currentI: -1, activeCountIdx: -1, scanMaxIdx: -1, currentMax: maxVal,
    placedCount: placed, prefixIdx: -1, comparisons,
    message: `所有 ${n} 个元素已放入输出数组。`,
    log: `place done: output = [${output.join(',')}]`,
    codeLine: 24,
  });

  // --- copy-back ---
  const sorted = [...output];
  steps.push({
    array: [...sorted], count: [...count], output: [...output], max: maxVal,
    phase: 'copy-back', currentI: -1, activeCountIdx: -1, scanMaxIdx: -1, currentMax: maxVal,
    placedCount: placed, prefixIdx: -1, comparisons,
    message: `将输出数组拷贝回原数组：arr = [${sorted.join(', ')}]。`,
    log: `copy-back: arr = [${sorted.join(',')}]`,
    codeLine: [26, 27],
  });

  // --- done ---
  steps.push({
    array: [...sorted], count: [...count], output: [...output], max: maxVal,
    phase: 'done', currentI: -1, activeCountIdx: -1, scanMaxIdx: -1, currentMax: maxVal,
    placedCount: placed, prefixIdx: -1, comparisons,
    message: `排序完成！结果：[${sorted.join(', ')}]，共 ${comparisons} 次扫描。`,
    log: `done: [${sorted.join(', ')}]`,
    codeLine: 29,
  });

  return steps;
}

const PHASE_LABELS: Record<Phase, string> = {
  'init': '初始化',
  'find-max': '找最大值',
  'count-init': '建计数数组',
  'counting': '统计频次',
  'prefix-sum': '前缀和',
  'place': '放置元素',
  'copy-back': '拷贝回去',
  'done': '完成',
};

export class CountingSortVisualizer extends StepVisualizer<CSStep> {
  protected codeLines = [
    'public void countingSort(int[] arr) {',
    '    int n = arr.length;',
    '',
    '    // 1. 找最大值',
    '    int max = arr[0];',
    '    for (int i = 1; i < n; i++) {',
    '        if (arr[i] > max) max = arr[i];',
    '    }',
    '',
    '    // 2. 创建计数数组',
    '    int[] count = new int[max + 1];',
    '',
    '    // 3. 统计每个值出现次数',
    '    for (int i = 0; i < n; i++) count[arr[i]]++;',
    '',
    '    // 4. 前缀和：count[i] 表示 ≤ i 的元素个数',
    '    for (int i = 1; i <= max; i++) {',
    '        count[i] += count[i - 1];',
    '    }',
    '',
    '    // 5. 反向遍历，放入输出数组',
    '    int[] output = new int[n];',
    '    for (int i = n - 1; i >= 0; i--) {',
    '        output[count[arr[i]] - 1] = arr[i];',
    '        count[arr[i]]--;',
    '    }',
    '',
    '    // 6. 拷贝回原数组',
    '    for (int i = 0; i < n; i++) arr[i] = output[i];',
    '}',
  ];
  protected codePanelTitle = 'Java 计数排序源码';

  private arrayInput: HTMLInputElement | null = null;
  private statMax: HTMLElement | null = null;
  private statCount: HTMLElement | null = null;
  private statPlaced: HTMLElement | null = null;
  private statSize: HTMLElement | null = null;
  private statPhase: HTMLElement | null = null;
  private barsOrig: HTMLElement | null = null;
  private barsCount: HTMLElement | null = null;
  private barsOutput: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private clearLogBtn: HTMLButtonElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.arrayInput = this.root.querySelector('#cs-array');
    this.statMax = this.root.querySelector('#cs-stat-max');
    this.statCount = this.root.querySelector('#cs-stat-count');
    this.statPlaced = this.root.querySelector('#cs-stat-placed');
    this.statSize = this.root.querySelector('#cs-stat-size');
    this.statPhase = this.root.querySelector('#cs-stat-phase');
    this.barsOrig = this.root.querySelector('#cs-bars-orig');
    this.barsCount = this.root.querySelector('#cs-bars-count');
    this.barsOutput = this.root.querySelector('#cs-bars-output');
    this.resultEl = this.root.querySelector('#cs-result');
    this.logEl = this.root.querySelector('#cs-log');
    this.clearLogBtn = this.root.querySelector('#cs-log-clear');

    this.bindPlaybackControls({
      reset: 'step-reset', prev: 'step-prev', play: 'step-play', next: 'step-next',
      speed: 'cs-speed', speedLabel: 'cs-speed-label',
      counter: 'step-counter', message: 'step-message',
    });

    this.root.querySelector('#cs-start')?.addEventListener('click', () => this.start());
    this.root.querySelectorAll<HTMLButtonElement>('.cs-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.arrayInput) this.arrayInput.value = btn.dataset.arr || '';
        this.start();
      });
    });
    this.clearLogBtn?.addEventListener('click', () => { if (this.logEl) this.logEl.innerHTML = ''; });
    this.arrayInput?.addEventListener('change', () => this.start());
  }

  protected buildSteps(): CSStep[] {
    return countingSortSteps(parseArray(this.arrayInput?.value || '4,2,2,8,3,3,1'));
  }

  protected renderStep(step: CSStep): void {
    this.renderStats(step);
    this.renderOrigBars(step);
    this.renderCountBars(step);
    this.renderOutputBars(step);
    this.renderResultBanner(step);
    this.renderLogPanel(step);
  }

  private renderStats(step: CSStep): void {
    if (this.statMax) this.statMax.textContent = step.max > 0 || step.phase !== 'init' ? String(step.max) : '-';
    if (this.statCount) {
      if (step.activeCountIdx >= 0 && step.count.length > 0) {
        this.statCount.textContent = String(step.count[step.activeCountIdx]);
      } else {
        this.statCount.textContent = '-';
      }
    }
    if (this.statPlaced) this.statPlaced.textContent = String(step.placedCount);
    if (this.statSize) this.statSize.textContent = step.count.length > 0 ? String(step.count.length) : '-';
    if (this.statPhase) this.statPhase.textContent = PHASE_LABELS[step.phase] || '-';
  }

  private renderOrigBars(step: CSStep): void {
    const el = this.barsOrig;
    if (!el) return;
    const maxVal = Math.max(1, ...step.array, 1);
    el.innerHTML = '';

    step.array.forEach((value, idx) => {
      const wrap = document.createElement('div');
      wrap.className = 'cs-bar-wrap';
      const bar = document.createElement('div');
      bar.className = 'cs-bar';
      const h = 20 + (value / maxVal) * 60;
      bar.style.height = `${h}px`;
      bar.textContent = String(value);

      // Highlight logic
      if (step.phase === 'done' || step.phase === 'copy-back') {
        bar.classList.add('cs-bar--done');
      } else if (step.phase === 'find-max') {
        if (idx === step.scanMaxIdx) {
          bar.classList.add('cs-bar--max');
        }
      } else if (step.phase === 'counting') {
        if (idx === step.currentI) {
          bar.classList.add('cs-bar--active');
        } else if (idx < step.currentI) {
          bar.classList.add('cs-bar--placed');
        }
      } else if (step.phase === 'place') {
        if (idx === step.currentI) {
          bar.classList.add('cs-bar--active');
        } else if (idx > step.currentI) {
          bar.classList.add('cs-bar--placed');
        }
      }

      wrap.appendChild(bar);
      const idxLabel = document.createElement('span');
      idxLabel.className = 'cs-idx';
      idxLabel.textContent = String(idx);
      wrap.appendChild(idxLabel);

      // Active marker
      if (step.phase === 'counting' && idx === step.currentI) {
        const m = document.createElement('span');
        m.className = 'cs-active-marker';
        m.textContent = '↑ i';
        wrap.appendChild(m);
      }
      if (step.phase === 'place' && idx === step.currentI) {
        const m = document.createElement('span');
        m.className = 'cs-active-marker';
        m.textContent = '↑ i';
        wrap.appendChild(m);
      }

      el.appendChild(wrap);
    });
  }

  private renderCountBars(step: CSStep): void {
    const el = this.barsCount;
    if (!el || step.count.length === 0) {
      if (el) el.innerHTML = '';
      return;
    }
    el.innerHTML = '';
    const maxCount = Math.max(1, ...step.count, 1);

    step.count.forEach((val, idx) => {
      const cell = document.createElement('div');
      cell.className = 'cs-count-cell';
      const bar = document.createElement('div');
      bar.className = 'cs-count-bar';
      const h = 20 + (val / maxCount) * 60;
      bar.style.height = `${h}px`;
      bar.textContent = String(val);

      // Highlight
      if (step.phase === 'prefix-sum') {
        if (idx === step.activeCountIdx) {
          bar.classList.add('cs-count--prefix-active');
        } else if (idx < step.prefixIdx) {
          bar.classList.add('cs-count--prefix');
        }
      } else if (step.phase === 'counting') {
        if (idx === step.activeCountIdx) {
          bar.classList.add('cs-count--active');
        }
      } else if (step.phase === 'place') {
        if (idx === step.activeCountIdx) {
          bar.classList.add('cs-count--active');
        }
      } else if (step.phase === 'done') {
        bar.classList.add('cs-count--done');
      }

      cell.appendChild(bar);
      const idxLabel = document.createElement('span');
      idxLabel.className = 'cs-idx';
      idxLabel.textContent = String(idx);
      cell.appendChild(idxLabel);

      el.appendChild(cell);
    });
  }

  private renderOutputBars(step: CSStep): void {
    const el = this.barsOutput;
    if (!el) return;
    el.innerHTML = '';

    const maxVal = Math.max(1, ...step.array, 1);
    const isPlacing = step.phase === 'place';
    const isDone = step.phase === 'done' || step.phase === 'copy-back';

    // Determine which output positions are filled
    step.output.forEach((value, idx) => {
      const wrap = document.createElement('div');
      wrap.className = 'cs-bar-wrap';

      if (value >= 0) {
        const bar = document.createElement('div');
        bar.className = 'cs-bar';
        const h = 20 + (value / maxVal) * 60;
        bar.style.height = `${h}px`;
        bar.textContent = String(value);

        if (isDone) {
          bar.classList.add('cs-bar--done');
        } else if (isPlacing) {
          bar.classList.add('cs-bar--output-placed');
        } else {
          bar.classList.add('cs-bar--placed');
        }

        wrap.appendChild(bar);
      } else {
        // Empty slot
        const bar = document.createElement('div');
        bar.className = 'cs-bar';
        bar.style.height = '20px';
        bar.style.opacity = '0.3';
        bar.textContent = '-';
        wrap.appendChild(bar);
      }

      const idxLabel = document.createElement('span');
      idxLabel.className = 'cs-idx';
      idxLabel.textContent = String(idx);
      wrap.appendChild(idxLabel);

      el.appendChild(wrap);
    });
  }

  private renderResultBanner(step: CSStep): void {
    if (!this.resultEl) return;
    this.resultEl.classList.remove('cs-result--done');
    const emoji = this.resultEl.querySelector('.cs-emoji') as HTMLElement | null;
    if (step.phase === 'done') {
      this.resultEl.classList.add('cs-result--done');
      if (emoji) emoji.textContent = '🎉';
    } else if (step.phase === 'find-max') {
      if (emoji) emoji.textContent = '🔍';
    } else if (step.phase === 'counting') {
      if (emoji) emoji.textContent = '📊';
    } else if (step.phase === 'prefix-sum') {
      if (emoji) emoji.textContent = '🧮';
    } else if (step.phase === 'place') {
      if (emoji) emoji.textContent = '🎯';
    } else if (step.phase === 'copy-back') {
      if (emoji) emoji.textContent = '📋';
    } else {
      if (emoji) emoji.textContent = '🔢';
    }
  }

  private renderLogPanel(step: CSStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'cs-log-line' + (i === this.currentIndex ? ' cs-log-active' : '');
      const num = document.createElement('span');
      num.className = 'cs-log-num';
      num.textContent = `${String(i + 1).padStart(2, '0')}.`;
      const text = document.createElement('span');
      text.textContent = s.log;
      row.appendChild(num);
      row.appendChild(text);
      this.logEl!.appendChild(row);
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'counting-sort',
  name: '计数排序',
  viewId: 'algo-counting-sort-view',
  category: 'sort',
  description: '非比较排序：统计频次 → 前缀和定位 → 反向放入输出数组',
  icon: '🔢',
  template,
  Visualizer: CountingSortVisualizer,
  difficulty: 2,
  levelOrder: 8,
  learningGoal: '理解计数排序的非比较排序原理和前缀和定位方法',
});
