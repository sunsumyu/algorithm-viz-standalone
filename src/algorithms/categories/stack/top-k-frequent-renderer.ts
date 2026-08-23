/**
 * 前K个高频元素（桶排序）可视化器
 * LeetCode 347 · 统计频率后桶排序取前 k 个
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './top-k-frequent.html?raw';

interface TKFStep {
  nums: number[];
  k: number;
  i: number;
  freqMap: Map<number, number>;
  freqEntries: [number, number][];
  buckets: number[][];
  result: number[];
  phase: 'count' | 'bucket' | 'collect';
  status: 'init' | 'count' | 'build-bucket' | 'collect' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

/**
 * 桶排序法求前 k 个高频元素
 * 生成每一步的可视化数据
 */
function topKFrequentSteps(nums: number[], k: number): TKFStep[] {
  const steps: TKFStep[] = [];
  const freq = new Map<number, number>();
  const buckets: number[][] = [];
  const result: number[] = [];

  const pushStep = (partial: Omit<TKFStep, 'nums' | 'k' | 'freqMap' | 'freqEntries' | 'buckets' | 'result'>) => {
    steps.push({
      nums: [...nums],
      k,
      freqMap: new Map(freq),
      freqEntries: Array.from(freq.entries()),
      buckets: buckets.map(b => b ? [...b] : []),
      result: [...result],
      ...partial,
    });
  };

  // Initial step
  pushStep({
    i: -1,
    phase: 'count',
    status: 'init',
    message: `开始统计数组 [${nums.join(', ')}] 中各元素的频率，k = ${k}`,
    log: '初始化：准备频率统计',
    codeLine: 1,
  });

  // Phase 1: Count frequencies
  for (let i = 0; i < nums.length; i++) {
    const n = nums[i];
    const prevCount = freq.get(n) || 0;
    const newCount = prevCount + 1;
    freq.set(n, newCount);

    pushStep({
      i,
      phase: 'count',
      status: 'count',
      message: `遍历 nums[${i}] = ${n}，频率 ${prevCount} → ${newCount}`,
      log: `nums[${i}] = ${n}, freq[${n}] = ${newCount}`,
      codeLine: [4, 5],
    });
  }

  // Phase 2: Build buckets
  pushStep({
    i: nums.length,
    phase: 'bucket',
    status: 'build-bucket',
    message: '频率统计完成，开始构建桶数组（下标 = 频率）',
    log: '构建桶数组',
    codeLine: 8,
  });

  const freqEntries = Array.from(freq.entries());
  for (let j = 0; j < freqEntries.length; j++) {
    const [val, count] = freqEntries[j];
    if (!buckets[count]) buckets[count] = [];
    buckets[count].push(val);

    pushStep({
      i: nums.length,
      phase: 'bucket',
      status: 'build-bucket',
      message: `元素 ${val} 频率为 ${count}，放入桶[${count}]`,
      log: `buckets[${count}].push(${val})`,
      codeLine: [10, 11],
    });
  }

  // Phase 3: Collect from buckets
  pushStep({
    i: buckets.length - 1,
    phase: 'collect',
    status: 'collect',
    message: `桶构建完成，开始从高频率向低频率收集 ${k} 个元素`,
    log: '开始收集结果',
    codeLine: 14,
  });

  for (let f = buckets.length - 1; f >= 0 && result.length < k; f--) {
    if (buckets[f]) {
      for (const v of buckets[f]) {
        if (result.length >= k) break;
        result.push(v);

        pushStep({
          i: f,
          phase: 'collect',
          status: 'collect',
          message: `从桶[${f}] 取出元素 ${v}，已收集 [${result.join(', ')}] (${result.length}/${k})`,
          log: `result.push(${v}), 进度 ${result.length}/${k}`,
          codeLine: [16, 17],
        });
      }
    } else {
      pushStep({
        i: f,
        phase: 'collect',
        status: 'collect',
        message: `桶[${f}] 为空，跳过`,
        log: `buckets[${f}] 为空`,
        codeLine: 15,
      });
    }
  }

  // Done
  pushStep({
    i: -1,
    phase: 'collect',
    status: 'done',
    message: `完成！前 ${k} 个高频元素为 [${result.join(', ')}]`,
    log: `最终结果: [${result.join(', ')}]`,
    codeLine: 21,
  });

  return steps;
}

export class TopKFrequentVisualizer extends StepVisualizer<TKFStep> {
  protected codeLines = [
    'public int[] topKFrequent(int[] nums, int k) {',
    '    Map<Integer, Integer> freq = new HashMap<>();',
    '    for (int n : nums) {',
    '        freq.put(n, freq.getOrDefault(n, 0) + 1);',
    '    }',
    '    @SuppressWarnings("unchecked")',
    '    List<Integer>[] buckets = new List[nums.length + 1];',
    '    for (Map.Entry<Integer, Integer> e : freq.entrySet()) {',
    '        int val = e.getKey(), count = e.getValue();',
    '        if (buckets[count] == null) buckets[count] = new ArrayList<>();',
    '        buckets[count].add(val);',
    '    }',
    '    int[] result = new int[k];',
    '    int idx = 0;',
    '    for (int f = buckets.length - 1; f >= 0 && idx < k; f--) {',
    '        if (buckets[f] != null) {',
    '            for (int v : buckets[f]) {',
    '                result[idx++] = v;',
    '                if (idx == k) return result;',
    '            }',
    '        }',
    '    }',
    '    return result;',
    '}',
  ];
  protected codePanelTitle = '桶排序代码 (Java)';

  private inputArr: HTMLInputElement | null = null;
  private inputK: HTMLInputElement | null = null;
  private arrayDisplay: HTMLElement | null = null;
  private freqMapContainer: HTMLElement | null = null;
  private bucketContainer: HTMLElement | null = null;
  private resultDisplay: HTMLElement | null = null;
  private phaseLabel: HTMLElement | null = null;
  private logPanel: HTMLElement | null = null;

  private stateIndex: HTMLElement | null = null;
  private stateElement: HTMLElement | null = null;
  private stateFreq: HTMLElement | null = null;
  private stateK: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputArr = this.root.querySelector('#tkf-input-arr');
    this.inputK = this.root.querySelector('#tkf-input-k');
    this.arrayDisplay = this.root.querySelector('#tkf-array-display');
    this.freqMapContainer = this.root.querySelector('#tkf-freq-map');
    this.bucketContainer = this.root.querySelector('#tkf-bucket-container');
    this.resultDisplay = this.root.querySelector('#tkf-result-display');
    this.phaseLabel = this.root.querySelector('#tkf-phase-label');
    this.logPanel = this.root.querySelector('#tkf-log-panel');

    this.stateIndex = this.root.querySelector('#tkf-state-index');
    this.stateElement = this.root.querySelector('#tkf-state-element');
    this.stateFreq = this.root.querySelector('#tkf-state-freq');
    this.stateK = this.root.querySelector('#tkf-state-k');

    this.bindPlaybackControls({ message: 'step-message' });

    // Start button
    this.root.querySelector('#tkf-start')?.addEventListener('click', () => this.start());

    // Example buttons
    this.bindExamples({
      ex1: () => this.loadExample('1,1,1,2,2,3', '2'),
      ex2: () => this.loadExample('1', '1'),
      ex3: () => this.loadExample('4,1,-1,2,-1,2,3', '2'),
    });
  }

  private loadExample(arr: string, k: string): void {
    if (this.inputArr) this.inputArr.value = arr;
    if (this.inputK) this.inputK.value = k;
    this.start();
  }

  protected buildSteps(): TKFStep[] {
    const arrStr = this.inputArr?.value.trim() || '1,1,1,2,2,3';
    const k = parseInt(this.inputK?.value.trim() || '2', 10);
    const nums = arrStr.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    return topKFrequentSteps(nums, k);
  }

  protected renderStep(step: TKFStep): void {
    this.renderArray(step);
    this.renderPhase(step);
    this.renderFreqMap(step);
    this.renderBuckets(step);
    this.renderResult(step);
    this.renderState(step);
    this.updateLogPanel(step);
  }

  private renderArray(step: TKFStep): void {
    if (!this.arrayDisplay) return;
    this.arrayDisplay.innerHTML = '';

    for (let i = 0; i < step.nums.length; i++) {
      const cell = document.createElement('div');
      cell.className = 'array-cell';
      cell.textContent = step.nums[i].toString();

      if (step.phase === 'count' && step.status === 'count') {
        if (i === step.i) {
          cell.classList.add('current');
          // Add pointer
          const pointer = document.createElement('div');
          pointer.className = 'pointer-arrow';
          cell.appendChild(pointer);
        } else if (i < step.i) {
          cell.classList.add('processed');
        }
      } else if (step.phase === 'count' && step.status === 'init') {
        // No highlighting yet
      } else {
        // After count phase, all processed
        cell.classList.add('processed');
      }

      this.arrayDisplay.appendChild(cell);
    }
  }

  private renderPhase(step: TKFStep): void {
    if (!this.phaseLabel) return;
    const phaseNames: Record<string, string> = {
      'init': '准备就绪',
      'count': '阶段 1：频率统计',
      'build-bucket': '阶段 2：构建桶',
      'collect': '阶段 3：收集结果',
      'done': '完成',
    };
    this.phaseLabel.textContent = phaseNames[step.status] || '准备就绪';
  }

  private renderFreqMap(step: TKFStep): void {
    if (!this.freqMapContainer) return;

    if (step.phase === 'count' && step.status === 'init') {
      this.freqMapContainer.style.display = 'none';
      return;
    }

    this.freqMapContainer.style.display = 'flex';
    this.freqMapContainer.innerHTML = '';

    const entries = step.freqEntries;
    const currentNum = step.phase === 'count' && step.status === 'count' ? step.nums[step.i] : null;

    for (const [key, val] of entries) {
      const entry = document.createElement('div');
      entry.className = 'freq-entry';
      if (key === currentNum) {
        entry.classList.add('updated');
      }

      entry.innerHTML = `
        <span class="freq-key">${key}</span>
        <span class="freq-arrow">→</span>
        <span class="freq-val">${val}</span>
      `;
      this.freqMapContainer.appendChild(entry);
    }
  }

  private renderBuckets(step: TKFStep): void {
    if (!this.bucketContainer) return;

    if (step.phase === 'count') {
      this.bucketContainer.style.display = 'none';
      return;
    }

    this.bucketContainer.style.display = 'flex';
    this.bucketContainer.innerHTML = '';

    const buckets = step.buckets;
    const currentFreq = step.phase === 'collect' ? step.i : -1;
    const collectedSet = new Set(step.result);

    for (let f = 1; f < buckets.length; f++) {
      const bucket = buckets[f];
      if (!bucket || bucket.length === 0) continue;

      const item = document.createElement('div');
      item.className = 'bucket-item';

      // Bar height based on frequency
      const bar = document.createElement('div');
      bar.className = 'bucket-bar';
      bar.style.height = `${f * 20}px`;

      // Label
      const label = document.createElement('div');
      label.className = 'bucket-label';
      label.textContent = `freq=${f}`;

      // Chips
      const chips = document.createElement('div');
      chips.className = 'bucket-chips';
      for (const val of bucket) {
        const chip = document.createElement('div');
        chip.className = 'bucket-chip';
        chip.textContent = val.toString();
        if (collectedSet.has(val)) {
          chip.classList.add('collected');
        }
        if (step.phase === 'collect' && f === currentFreq && collectedSet.has(val)) {
          chip.classList.add('collected');
        }
        chips.appendChild(chip);
      }

      item.appendChild(bar);
      item.appendChild(chips);
      item.appendChild(label);
      this.bucketContainer.appendChild(item);
    }
  }

  private renderResult(step: TKFStep): void {
    if (!this.resultDisplay) return;

    if (step.status !== 'collect' && step.status !== 'done') {
      this.resultDisplay.style.display = 'none';
      return;
    }

    this.resultDisplay.style.display = 'flex';
    this.resultDisplay.innerHTML = '';

    if (step.result.length === 0) {
      const placeholder = document.createElement('span');
      placeholder.style.color = '#64748b';
      placeholder.style.fontStyle = 'italic';
      placeholder.textContent = '收集中...';
      this.resultDisplay.appendChild(placeholder);
      return;
    }

    for (const val of step.result) {
      const chip = document.createElement('div');
      chip.className = 'result-chip';
      chip.textContent = val.toString();
      this.resultDisplay.appendChild(chip);
    }
  }

  private renderState(step: TKFStep): void {
    if (this.stateIndex) {
      this.stateIndex.textContent = step.i >= 0 ? step.i.toString() : '-';
    }
    if (this.stateElement) {
      if (step.phase === 'count' && step.status === 'count' && step.i >= 0) {
        this.stateElement.textContent = step.nums[step.i].toString();
        this.stateElement.className = 'state-value highlight';
      } else {
        this.stateElement.textContent = '-';
        this.stateElement.className = 'state-value';
      }
    }
    if (this.stateFreq) {
      if (step.phase === 'count' && step.status === 'count' && step.i >= 0) {
        const num = step.nums[step.i];
        const freq = step.freqMap.get(num) || 0;
        this.stateFreq.textContent = freq.toString();
        this.stateFreq.className = 'state-value purple';
      } else {
        this.stateFreq.textContent = '-';
        this.stateFreq.className = 'state-value';
      }
    }
    if (this.stateK) {
      this.stateK.textContent = step.k.toString();
    }
  }

  private updateLogPanel(step: TKFStep): void {
    if (!this.logPanel) return;
    this.logPanel.style.display = 'block';
    this.logPanel.innerHTML = '';

    // Show last 5 log entries
    const currentStepIndex = this.currentIndex;
    const startIdx = Math.max(0, currentStepIndex - 4);
    const endIdx = currentStepIndex + 1;

    for (let idx = startIdx; idx < endIdx; idx++) {
      const logStep = this.steps[idx];
      if (!logStep) continue;
      const entry = document.createElement('div');
      entry.className = 'log-entry';
      entry.innerHTML = `<span class="log-step">[${idx + 1}]</span><span class="log-text">${logStep.log}</span>`;
      this.logPanel.appendChild(entry);
    }

    this.logPanel.scrollTop = this.logPanel.scrollHeight;
  }
}

registerAlgorithm({
  id: 'top-k-frequent',
  name: '前K个高频元素（桶排序）',
  viewId: 'algo-top-k-frequent-view',
  category: 'stack',
  description: '用桶排序求数组中出现最频繁的 k 个元素',
  icon: '🏆',
  template,
  Visualizer: TopKFrequentVisualizer,
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '掌握频率统计 + 桶排序的高效方法',
});

export {};
