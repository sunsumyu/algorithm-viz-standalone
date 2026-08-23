/**
 * 基数排序可视化器 (LSD)
 * 从最低位开始，按位分配到 0-9 号桶再收集
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './radix-sort.html?raw';

type Phase = 'init' | 'set-digit' | 'distribute' | 'collect' | 'next-digit' | 'done';

interface RSStep {
  array: number[];
  maxVal: number;
  totalDigits: number;
  currentDigit: number;       // 当前处理到第几位 (0=个位, 1=十位, 2=百位...)
  digitName: string;          // '个位' | '十位' | '百位' | '千位'...
  buckets: number[][];        // 10 个桶
  activeBucket: number;       // 当前分配到的桶 (-1 表示不在分配)
  collectingBucket: number;   // 当前收集中的桶 (-1 表示不在收集)
  collectedSoFar: number[];   // 已收集的元素
  currentElement: number;     // 当前处理的元素值
  currentElementIdx: number;  // 当前处理的元素下标
  highlightIndices: number[]; // 需要高亮原数组的元素下标
  distributions: number;
  collections: number;
  round: number;              // 当前轮次（第几位）
  phase: Phase;
  message: string;
  log: string;
  codeLine: number | number[];
}

const DIGIT_NAMES = ['个位', '十位', '百位', '千位', '万位', '十万位', '百万位', '千万位', '亿位'];

function parseArray(input: string): number[] {
  return input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n >= 0);
}

function getDigit(n: number, d: number): number {
  return Math.floor(n / Math.pow(10, d)) % 10;
}

function digitCount(n: number): number {
  if (n === 0) return 1;
  return Math.floor(Math.log10(n)) + 1;
}

function radixSortSteps(input: number[]): RSStep[] {
  const steps: RSStep[] = [];
  const array = [...input];
  const n = array.length;

  if (n === 0) {
    steps.push({
      array: [], maxVal: 0, totalDigits: 0, currentDigit: -1, digitName: '-',
      buckets: Array.from({ length: 10 }, () => []), activeBucket: -1,
      collectingBucket: -1, collectedSoFar: [], currentElement: 0, currentElementIdx: -1,
      highlightIndices: [], distributions: 0, collections: 0, round: 0,
      phase: 'init', message: '数组为空，无需排序。', log: 'empty array', codeLine: 1,
    });
    steps.push({
      array: [], maxVal: 0, totalDigits: 0, currentDigit: -1, digitName: '-',
      buckets: Array.from({ length: 10 }, () => []), activeBucket: -1,
      collectingBucket: -1, collectedSoFar: [], currentElement: 0, currentElementIdx: -1,
      highlightIndices: [], distributions: 0, collections: 0, round: 0,
      phase: 'done', message: '数组为空，无需排序。', log: 'done: empty', codeLine: 18,
    });
    return steps;
  }

  const maxVal = Math.max(...array);
  const totalDigits = digitCount(maxVal);
  let distributions = 0;
  let collections = 0;

  // init
  steps.push({
    array: [...array], maxVal, totalDigits, currentDigit: -1, digitName: '-',
    buckets: Array.from({ length: 10 }, () => []), activeBucket: -1,
    collectingBucket: -1, collectedSoFar: [], currentElement: 0, currentElementIdx: -1,
    highlightIndices: [], distributions: 0, collections: 0, round: 0,
    phase: 'init',
    message: `初始化：数组共 ${n} 个元素，最大值 ${maxVal}，共 ${totalDigits} 位。从最低位（个位）开始 LSD 基数排序。`,
    log: `init: max=${maxVal}, digits=${totalDigits}`,
    codeLine: 2,
  });

  const buckets = Array.from({ length: 10 }, (): number[] => []);

  for (let d = 0; d < totalDigits; d++) {
    const dName = DIGIT_NAMES[d] || `${d + 1}位`;

    // set-digit
    steps.push({
      array: [...array], maxVal, totalDigits, currentDigit: d, digitName: dName,
      buckets: buckets.map((b) => [...b]), activeBucket: -1,
      collectingBucket: -1, collectedSoFar: [], currentElement: 0, currentElementIdx: -1,
      highlightIndices: Array.from({ length: n }, (_, i) => i), distributions, collections, round: d + 1,
      phase: 'set-digit',
      message: `处理${dName}（第 ${d + 1}/${totalDigits} 位），将对每个元素的${dName}数字分配到 0-9 号桶。`,
      log: `set digit: ${dName} (pos ${d})`,
      codeLine: 4,
    });

    // distribute each element into buckets
    const bucketsCopy = buckets.map((b) => [...b]);
    for (let i = 0; i < n; i++) {
      const digit = getDigit(array[i], d);
      bucketsCopy[digit].push(array[i]);
      distributions++;

      // find all indices whose current digit equals this element's digit (for highlighting)
      const highlight: number[] = [];
      for (let k = 0; k < n; k++) {
        if (getDigit(array[k], d) === digit) highlight.push(k);
      }

      steps.push({
        array: [...array], maxVal, totalDigits, currentDigit: d, digitName: dName,
        buckets: bucketsCopy.map((b) => [...b]), activeBucket: digit,
        collectingBucket: -1, collectedSoFar: [], currentElement: array[i], currentElementIdx: i,
        highlightIndices: highlight, distributions, collections, round: d + 1,
        phase: 'distribute',
        message: `分配 arr[${i}]=${array[i]}：${dName}数字为 ${digit}，放入 ${digit} 号桶。`,
        log: `dist arr[${i}]=${array[i]} → bucket[${digit}]`,
        codeLine: 7,
      });
    }

    // save distributed buckets
    for (let b = 0; b < 10; b++) buckets[b] = [...bucketsCopy[b]];

    // collect from buckets
    const collected: number[] = [];
    for (let b = 0; b < 10; b++) {
      if (buckets[b].length > 0) {
        for (const val of buckets[b]) {
          collected.push(val);
          collections++;
        }
        steps.push({
          array: [...array], maxVal, totalDigits, currentDigit: d, digitName: dName,
          buckets: buckets.map((bk, bi) => bi < b ? [] : [...bk]), activeBucket: -1,
          collectingBucket: b, collectedSoFar: [...collected],
          currentElement: collected[collected.length - 1], currentElementIdx: -1,
          highlightIndices: [], distributions, collections, round: d + 1,
          phase: 'collect',
          message: `收集 ${b} 号桶：${buckets[b].join(', ')}${b < 9 ? '，继续收集下一个非空桶' : ''}。`,
          log: `collect bucket[${b}] = [${buckets[b].join(', ')}]`,
          codeLine: 11,
        });
      }
      buckets[b] = [];
    }

    // update array with collected order
    for (let i = 0; i < n; i++) array[i] = collected[i];

    // next-digit or done
    if (d < totalDigits - 1) {
      steps.push({
        array: [...array], maxVal, totalDigits, currentDigit: d, digitName: dName,
        buckets: Array.from({ length: 10 }, () => []), activeBucket: -1,
        collectingBucket: -1, collectedSoFar: [], currentElement: 0, currentElementIdx: -1,
        highlightIndices: Array.from({ length: n }, (_, i) => i), distributions, collections, round: d + 1,
        phase: 'next-digit',
        message: `${dName}处理完毕，数组已按${dName}排序。准备处理下一位（${DIGIT_NAMES[d + 1] || `${d + 2}位`}）。`,
        log: `next digit: ${dName} done`,
        codeLine: 14,
      });
    }
  }

  steps.push({
    array: [...array], maxVal, totalDigits, currentDigit: totalDigits - 1,
    digitName: DIGIT_NAMES[totalDigits - 1] || `${totalDigits}位`,
    buckets: Array.from({ length: 10 }, () => []), activeBucket: -1,
    collectingBucket: -1, collectedSoFar: [], currentElement: 0, currentElementIdx: -1,
    highlightIndices: [], distributions, collections, round: totalDigits,
    phase: 'done',
    message: `排序完成！共处理 ${totalDigits} 位，分配 ${distributions} 次，收集 ${collections} 次。`,
    log: `done: ${distributions} dists, ${collections} collects`,
    codeLine: 18,
  });

  return steps;
}

export class RadixSortVisualizer extends StepVisualizer<RSStep> {
  protected codeLines = [
    'public void radixSort(int[] arr) {',
    '    int max = findMax(arr);          // 找最大值，确定位数',
    '    int digits = digitCount(max);',
    '    for (int d = 0; d < digits; d++) {  // 从最低位到最高位',
    '        List<Integer>[] buckets = new List[10];  // 0-9 号桶',
    '        for (int i = 0; i < 10; i++) buckets[i] = new ArrayList<>();',
    '        for (int num : arr) {',
    '            int digit = (num / pow(10, d)) % 10;',
    '            buckets[digit].add(num);   // 按当前位分配到桶',
    '        }',
    '        int idx = 0;',
    '        for (int b = 0; b < 10; b++) {',
    '            for (int num : buckets[b]) {',
    '                arr[idx++] = num;      // 从桶中收集回数组',
    '            }',
    '        }',
    '    }',
    '}',
  ];
  protected codePanelTitle = 'Java 基数排序源码';

  private arrayInput: HTMLInputElement | null = null;
  private statDigit: HTMLElement | null = null;
  private statTotal: HTMLElement | null = null;
  private statDist: HTMLElement | null = null;
  private statCollect: HTMLElement | null = null;
  private statRound: HTMLElement | null = null;
  private arrayTop: HTMLElement | null = null;
  private bucketsEl: HTMLElement | null = null;
  private arrayBottom: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private clearLogBtn: HTMLButtonElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.arrayInput = this.root.querySelector('#rs-array');
    this.statDigit = this.root.querySelector('#rs-stat-digit');
    this.statTotal = this.root.querySelector('#rs-stat-total');
    this.statDist = this.root.querySelector('#rs-stat-dist');
    this.statCollect = this.root.querySelector('#rs-stat-collect');
    this.statRound = this.root.querySelector('#rs-stat-round');
    this.arrayTop = this.root.querySelector('#rs-array-top');
    this.bucketsEl = this.root.querySelector('#rs-buckets');
    this.arrayBottom = this.root.querySelector('#rs-array-bottom');
    this.resultEl = this.root.querySelector('#rs-result');
    this.logEl = this.root.querySelector('#rs-log');
    this.clearLogBtn = this.root.querySelector('#rs-log-clear');

    this.bindPlaybackControls({
      reset: 'step-reset', prev: 'step-prev', play: 'step-play', next: 'step-next',
      speed: 'rs-speed', speedLabel: 'rs-speed-label',
      counter: 'step-counter', message: 'step-message',
    });

    this.root.querySelector('#rs-start')?.addEventListener('click', () => this.start());
    this.root.querySelectorAll<HTMLButtonElement>('.rs-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.arrayInput) this.arrayInput.value = btn.dataset.arr || '';
        this.start();
      });
    });
    this.clearLogBtn?.addEventListener('click', () => { if (this.logEl) this.logEl.innerHTML = ''; });
    this.arrayInput?.addEventListener('change', () => this.start());
  }

  protected buildSteps(): RSStep[] {
    return radixSortSteps(parseArray(this.arrayInput?.value || '170,45,75,90,802,24,2,66'));
  }

  protected renderStep(step: RSStep): void {
    this.renderStats(step);
    this.renderArrayBars(step);
    this.renderBuckets(step);
    this.renderResultBanner(step);
    this.renderLogPanel(step);
  }

  private renderStats(step: RSStep): void {
    if (this.statDigit) this.statDigit.textContent = step.digitName;
    if (this.statTotal) this.statTotal.textContent = step.totalDigits > 0 ? String(step.totalDigits) : '-';
    if (this.statDist) this.statDist.textContent = String(step.distributions);
    if (this.statCollect) this.statCollect.textContent = String(step.collections);
    if (this.statRound) this.statRound.textContent = step.phase === 'init' ? '0' : String(step.round);
  }

  private renderArrayBars(step: RSStep): void {
    // Top array: original array with highlights during distribute phase
    const topEl = this.arrayTop;
    const bottomEl = this.arrayBottom;
    if (!topEl) return;

    const maxVal = Math.max(1, step.maxVal, ...step.array);
    const set = new Set(step.highlightIndices);

    topEl.innerHTML = '';
    step.array.forEach((value, idx) => {
      const wrap = document.createElement('div');
      wrap.className = 'rs-bar-wrap';

      const bar = document.createElement('div');
      bar.className = 'rs-bar';
      const h = 24 + (value / maxVal) * 100;
      bar.style.height = `${h}px`;
      bar.textContent = String(value);

      if (step.phase === 'done') {
        bar.classList.add('rs-done');
      } else if (step.phase === 'distribute' && set.has(idx)) {
        bar.classList.add('rs-highlight');
      }

      wrap.appendChild(bar);
      const idxLabel = document.createElement('span');
      idxLabel.className = 'rs-idx';
      idxLabel.textContent = String(idx);
      wrap.appendChild(idxLabel);
      topEl.appendChild(wrap);
    });

    // Bottom array: show collected order during collect phase, otherwise show final
    if (!bottomEl) return;
    bottomEl.innerHTML = '';

    if (step.phase === 'collect' && step.collectedSoFar.length > 0) {
      const collMaxVal = Math.max(1, ...step.collectedSoFar);
      step.collectedSoFar.forEach((value) => {
        const wrap = document.createElement('div');
        wrap.className = 'rs-bar-wrap';
        const bar = document.createElement('div');
        bar.className = 'rs-bar rs-highlight';
        const h = 24 + (value / collMaxVal) * 100;
        bar.style.height = `${h}px`;
        bar.textContent = String(value);
        wrap.appendChild(bar);
        bottomEl.appendChild(wrap);
      });
    }
  }

  private renderBuckets(step: RSStep): void {
    if (!this.bucketsEl) return;
    this.bucketsEl.innerHTML = '';

    for (let b = 0; b < 10; b++) {
      const bucketDiv = document.createElement('div');
      bucketDiv.className = 'rs-bucket';
      if (b === step.activeBucket) {
        bucketDiv.style.borderColor = 'rgba(251, 191, 36, .8)';
        bucketDiv.style.background = 'rgba(245, 158, 11, .15)';
        bucketDiv.style.boxShadow = '0 0 12px rgba(251, 191, 36, .3)';
      }
      if (b === step.collectingBucket) {
        bucketDiv.style.borderColor = 'rgba(52, 211, 153, .8)';
        bucketDiv.style.background = 'rgba(52, 211, 153, .1)';
        bucketDiv.style.boxShadow = '0 0 12px rgba(52, 211, 153, .3)';
      }

      const label = document.createElement('div');
      label.className = 'rs-bucket-label';
      label.textContent = String(b);
      bucketDiv.appendChild(label);

      const items = document.createElement('div');
      items.className = 'rs-bucket-items';
      const itemsToShow = step.buckets[b];
      itemsToShow.forEach((val) => {
        const item = document.createElement('div');
        item.className = 'rs-bucket-item';
        item.textContent = String(val);
        items.appendChild(item);
      });
      bucketDiv.appendChild(items);
      this.bucketsEl.appendChild(bucketDiv);
    }
  }

  private renderResultBanner(step: RSStep): void {
    if (!this.resultEl) return;
    this.resultEl.classList.remove('rs-result--done');
    const emoji = this.resultEl.querySelector('.rs-emoji') as HTMLElement | null;
    if (step.phase === 'done') {
      this.resultEl.classList.add('rs-result--done');
      if (emoji) emoji.textContent = '🎉';
    } else if (step.phase === 'distribute') {
      if (emoji) emoji.textContent = '📦';
    } else if (step.phase === 'collect') {
      if (emoji) emoji.textContent = '🧺';
    } else if (step.phase === 'set-digit') {
      if (emoji) emoji.textContent = '🔢';
    } else if (step.phase === 'next-digit') {
      if (emoji) emoji.textContent = '➡️';
    } else {
      if (emoji) emoji.textContent = '🔟';
    }
  }

  private renderLogPanel(step: RSStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'rs-log-line' + (i === this.currentIndex ? ' rs-log-active' : '');
      const num = document.createElement('span');
      num.className = 'rs-log-num';
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
  id: 'radix-sort',
  name: '基数排序',
  viewId: 'algo-radix-sort-view',
  category: 'sort',
  description: '按位（个/十/百...）分配到 0-9 号桶再收集，从最低位开始',
  icon: '🔟',
  template,
  Visualizer: RadixSortVisualizer,
  difficulty: 2,
  levelOrder: 9,
  learningGoal: '理解 LSD 基数排序的按位分配与收集过程',
});
