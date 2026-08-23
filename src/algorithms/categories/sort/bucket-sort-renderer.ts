/**
 * 桶排序可视化器
 * 玫瑰/粉色系玻璃拟态风格
 * 三区域可视化：上方原数组柱状图 → 中间桶分配/排序 → 下方结果收集
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './bucket-sort.html?raw';

type Phase =
  | 'init'
  | 'find-range'
  | 'create-buckets'
  | 'distribute'
  | 'sort-bucket'
  | 'collect'
  | 'done';

interface BSStep {
  array: number[];
  min: number;
  max: number;
  bucketCount: number;
  buckets: number[][];           // 各桶当前内容
  bucketRanges: [number, number][]; // 各桶的范围 [lo, hi)
  distributingIdx: number;       // 正在分配的元素索引 (-1 = 不在分配)
  distributeBucket: number;      // 该元素落入哪个桶 (-1)
  activeBucket: number;          // 当前高亮/处理的桶 (-1)
  sortedBuckets: number[];       // 已完成排序的桶索引列表
  sortingBucketIdx: number;      // 正在排序的桶号
  insertI: number;               // 桶内插入排序 i (-1 = 未开始)
  insertJ: number;               // 桶内插入排序 j
  insertKey: number | null;      // 桶内 key
  insertCompareIdx: number;      // 桶内比较的元素位置
  collectUpTo: number;           // 已收集到第几个桶 (exclusive)
  result: number[];              // 已收集的结果
  comparisons: number;
  moves: number;
  phase: Phase;
  message: string;
  log: string;
  codeLine: number | number[];
}

function parseArray(input: string): number[] {
  return input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
}

function bucketSortSteps(input: number[], bucketCount: number): BSStep[] {
  const steps: BSStep[] = [];
  const array = [...input];
  const n = array.length;
  if (bucketCount < 1) bucketCount = 1;
  let comparisons = 0;
  let moves = 0;

  const snap = (overrides: Partial<BSStep>): BSStep => ({
    array: [...array],
    min: -Infinity,
    max: Infinity,
    bucketCount,
    buckets: [],
    bucketRanges: [],
    distributingIdx: -1,
    distributeBucket: -1,
    activeBucket: -1,
    sortedBuckets: [],
    sortingBucketIdx: -1,
    insertI: -1,
    insertJ: -1,
    insertKey: null,
    insertCompareIdx: -1,
    collectUpTo: 0,
    result: [],
    comparisons,
    moves,
    phase: 'init' as Phase,
    message: '',
    log: '',
    codeLine: 0,
    ...overrides,
  });

  // ---- init ----
  steps.push(snap({
    phase: 'init',
    message: n === 0
      ? '数组为空，无需排序。'
      : `初始化：共 ${n} 个元素，计划使用 ${bucketCount} 个桶。`,
    log: n === 0 ? 'empty array' : `init: ${n} elements, ${bucketCount} buckets`,
    codeLine: 1,
  }));

  if (n === 0) {
    steps.push(snap({ phase: 'done', message: '数组为空，排序完成。', log: 'done (empty)', codeLine: 20 }));
    return steps;
  }

  // ---- find-range ----
  let minVal = array[0];
  let maxVal = array[0];
  for (let i = 1; i < n; i++) {
    if (array[i] < minVal) minVal = array[i];
    if (array[i] > maxVal) maxVal = array[i];
  }
  const range = maxVal - minVal;
  steps.push(snap({
    phase: 'find-range',
    min: minVal,
    max: maxVal,
    message: `找到范围：最小值 ${minVal}，最大值 ${maxVal}，极差 ${range}。`,
    log: `find range: min=${minVal}, max=${maxVal}, range=${range}`,
    codeLine: 3,
  }));

  // ---- create-buckets ----
  const buckets: number[][] = Array.from({ length: bucketCount }, () => []);
  const bucketRanges: [number, number][] = [];
  const bucketSize = range === 0 ? 1 : range / bucketCount;
  for (let b = 0; b < bucketCount; b++) {
    const lo = minVal + b * bucketSize;
    const hi = b === bucketCount - 1 ? maxVal + 1 : minVal + (b + 1) * bucketSize;
    bucketRanges.push([lo, hi]);
  }
  steps.push(snap({
    phase: 'create-buckets',
    min: minVal, max: maxVal,
    buckets: buckets.map(b => [...b]),
    bucketRanges,
    message: `创建 ${bucketCount} 个空桶，每桶范围 ≈ ${(range === 0 ? 0 : bucketSize).toFixed(1)}。`,
    log: `create ${bucketCount} buckets, size≈${bucketSize.toFixed(1)}`,
    codeLine: 5,
  }));

  // ---- distribute ----
  for (let i = 0; i < n; i++) {
    let bi: number;
    if (range === 0) {
      bi = 0;
    } else {
      bi = Math.floor((array[i] - minVal) / bucketSize);
      if (bi >= bucketCount) bi = bucketCount - 1;
    }
    buckets[bi].push(array[i]);
    moves++;
    steps.push(snap({
      phase: 'distribute',
      min: minVal, max: maxVal,
      buckets: buckets.map(b => [...b]),
      bucketRanges,
      distributingIdx: i,
      distributeBucket: bi,
      message: `将 arr[${i}]=${array[i]} 分配到桶 ${bi}（范围 [${bucketRanges[bi][0].toFixed(1)}, ${bucketRanges[bi][1].toFixed(1)})）。`,
      log: `distribute arr[${i}]=${array[i]} → bucket ${bi}`,
      codeLine: 7,
    }));
  }

  // ---- sort-bucket (insertion sort within each bucket) ----
  for (let b = 0; b < bucketCount; b++) {
    const bucket = buckets[b];
    const bLen = bucket.length;
    if (bLen <= 1) {
      // 桶内 0/1 个元素无需排序
      steps.push(snap({
        phase: 'sort-bucket',
        min: minVal, max: maxVal,
        buckets: buckets.map(bk => [...bk]),
        bucketRanges,
        activeBucket: b,
        sortingBucketIdx: b,
        sortedBuckets: [...steps.length > 0 ? (steps[steps.length - 1].sortedBuckets) : [], b],
        message: `桶 ${b} 只有 ${bLen} 个元素，无需排序。`,
        log: `bucket ${b}: skip (${bLen} elem)`,
        codeLine: 10,
      }));
      continue;
    }

    // 开始排序此桶
    steps.push(snap({
      phase: 'sort-bucket',
      min: minVal, max: maxVal,
      buckets: buckets.map(bk => [...bk]),
      bucketRanges,
      activeBucket: b,
      sortingBucketIdx: b,
      sortedBuckets: steps.length > 0 ? [...steps[steps.length - 1].sortedBuckets] : [],
      insertI: -1,
      message: `开始对桶 ${b} 内部进行插入排序（${bLen} 个元素）。`,
      log: `sort bucket ${b} (${bLen} elements)`,
      codeLine: 10,
    }));

    // Insertion sort on buckets[b]
    for (let i = 1; i < bLen; i++) {
      const key = bucket[i];
      let j = i - 1;

      // pick key
      steps.push(snap({
        phase: 'sort-bucket',
        min: minVal, max: maxVal,
        buckets: buckets.map(bk => [...bk]),
        bucketRanges,
        activeBucket: b,
        sortingBucketIdx: b,
        sortedBuckets: steps.length > 0 ? [...steps[steps.length - 1].sortedBuckets] : [],
        insertI: i,
        insertJ: j,
        insertKey: key,
        insertCompareIdx: -1,
        message: `桶 ${b}：取出 key=${key}（桶内位置 ${i}），准备在桶内已排序区插入。`,
        log: `bucket ${b}: pick key=${key} @ pos ${i}`,
        codeLine: 11,
      }));

      while (j >= 0) {
        comparisons++;
        steps.push(snap({
          phase: 'sort-bucket',
          min: minVal, max: maxVal,
          buckets: buckets.map(bk => [...bk]),
          bucketRanges,
          activeBucket: b,
          sortingBucketIdx: b,
          sortedBuckets: steps.length > 0 ? [...steps[steps.length - 1].sortedBuckets] : [],
          insertI: i,
          insertJ: j,
          insertKey: key,
          insertCompareIdx: j,
          message: `桶 ${b} 内比较：bucket[${j}]=${bucket[j]} vs key=${key} → ${bucket[j] > key ? '需要后移' : '找到插入点'}。`,
          log: `bucket ${b}: cmp bucket[${j}]=${bucket[j]} vs key=${key}`,
          codeLine: 12,
        }));

        if (bucket[j] <= key) break;

        bucket[j + 1] = bucket[j];
        moves++;
        steps.push(snap({
          phase: 'sort-bucket',
          min: minVal, max: maxVal,
          buckets: buckets.map(bk => [...bk]),
          bucketRanges,
          activeBucket: b,
          sortingBucketIdx: b,
          sortedBuckets: steps.length > 0 ? [...steps[steps.length - 1].sortedBuckets] : [],
          insertI: i,
          insertJ: j,
          insertKey: key,
          insertCompareIdx: -1,
          message: `桶 ${b} 内移位：将 ${bucket[j]} 后移到位置 ${j + 1}。`,
          log: `bucket ${b}: shift → pos ${j + 1}`,
          codeLine: 13,
        }));

        j--;
      }

      const insertPos = j + 1;
      if (insertPos !== i) {
        bucket[insertPos] = key;
        moves++;
      }
      steps.push(snap({
        phase: 'sort-bucket',
        min: minVal, max: maxVal,
        buckets: buckets.map(bk => [...bk]),
        bucketRanges,
        activeBucket: b,
        sortingBucketIdx: b,
        sortedBuckets: steps.length > 0 ? [...steps[steps.length - 1].sortedBuckets] : [],
        insertI: i,
        insertJ: j,
        insertKey: key,
        insertCompareIdx: -1,
        message: `桶 ${b}：key=${key} 落入位置 ${insertPos}。`,
        log: `bucket ${b}: insert key=${key} @ pos ${insertPos}`,
        codeLine: 15,
      }));
    }

    // bucket done
    const prevSorted = steps.length > 0 ? [...steps[steps.length - 1].sortedBuckets] : [];
    if (!prevSorted.includes(b)) prevSorted.push(b);
    steps.push(snap({
      phase: 'sort-bucket',
      min: minVal, max: maxVal,
      buckets: buckets.map(bk => [...bk]),
      bucketRanges,
      activeBucket: b,
      sortingBucketIdx: b,
      sortedBuckets: prevSorted,
      insertI: -1,
      insertKey: null,
      insertCompareIdx: -1,
      message: `桶 ${b} 排序完成：[${bucket.join(', ')}]。`,
      log: `bucket ${b} sorted: [${bucket.join(', ')}]`,
      codeLine: 17,
    }));
  }

  // ---- collect ----
  const result: number[] = [];
  for (let b = 0; b < bucketCount; b++) {
    for (const val of buckets[b]) {
      result.push(val);
    }
    steps.push(snap({
      phase: 'collect',
      min: minVal, max: maxVal,
      buckets: buckets.map(bk => [...bk]),
      bucketRanges,
      activeBucket: b,
      sortedBuckets: Array.from({ length: bucketCount }, (_, i) => i),
      collectUpTo: b + 1,
      result: [...result],
      message: `收集桶 ${b}（${buckets[b].length} 个元素）→ 当前结果 [${result.join(', ')}]。`,
      log: `collect bucket ${b}: result=[${result.join(', ')}]`,
      codeLine: 18,
    }));
  }

  // ---- done ----
  steps.push(snap({
    phase: 'done',
    min: minVal, max: maxVal,
    buckets: buckets.map(bk => [...bk]),
    bucketRanges,
    sortedBuckets: Array.from({ length: bucketCount }, (_, i) => i),
    collectUpTo: bucketCount,
    result: [...result],
    message: `排序完成！共 ${comparisons} 次比较、${moves} 次移动。`,
    log: `done: ${comparisons} cmps, ${moves} moves`,
    codeLine: 20,
  }));

  return steps;
}

export class BucketSortVisualizer extends StepVisualizer<BSStep> {
  protected codeLines = [
    'public void bucketSort(int[] arr, int bucketCount) {',
    '    // 1. 找最大最小值',
    '    int min = arr[0], max = arr[0];',
    '    for (int x : arr) { min = Math.min(min, x); max = Math.max(max, x); }',
    '    // 2. 计算桶范围',
    '    double range = (max - min); double bucketSize = range / bucketCount;',
    '    List<List<Integer>> buckets = new ArrayList<>();',
    '    for (int i = 0; i < arr.length; i++) {  // 3. 分配元素到桶',
    '        int bi = (int)((arr[i] - min) / bucketSize);',
    '        if (bi >= bucketCount) bi = bucketCount - 1;',
    '        buckets.get(bi).add(arr[i]); }',
    '    for (List<Integer> bucket : buckets) {  // 4. 桶内插入排序',
    '        for (int i = 1; i < bucket.size(); i++) {',
    '            int key = bucket.get(i); int j = i - 1;',
    '            while (j >= 0 && bucket.get(j) > key) {',
    '                bucket.set(j + 1, bucket.get(j)); j--; }',
    '            bucket.set(j + 1, key); } }',
    '    int idx = 0;',
    '    for (List<Integer> bucket : buckets)   // 5. 收集结果',
    '        for (int val : bucket) arr[idx++] = val;',
    '}',
  ];
  protected codePanelTitle = 'Java 桶排序源码';

  private arrayInput: HTMLInputElement | null = null;
  private bucketCountInput: HTMLInputElement | null = null;
  private statBuckets: HTMLElement | null = null;
  private statCur: HTMLElement | null = null;
  private statDist: HTMLElement | null = null;
  private statSorted: HTMLElement | null = null;
  private barsEl: HTMLElement | null = null;
  private bucketsEl: HTMLElement | null = null;
  private resultItemsEl: HTMLElement | null = null;
  private resultBanner: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private clearLogBtn: HTMLButtonElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.arrayInput = this.root.querySelector('#bs-array');
    this.bucketCountInput = this.root.querySelector('#bs-bucket-count');
    this.statBuckets = this.root.querySelector('#bs-stat-buckets');
    this.statCur = this.root.querySelector('#bs-stat-cur');
    this.statDist = this.root.querySelector('#bs-stat-dist');
    this.statSorted = this.root.querySelector('#bs-stat-sorted');
    this.barsEl = this.root.querySelector('#bs-bars');
    this.bucketsEl = this.root.querySelector('#bs-buckets');
    this.resultItemsEl = this.root.querySelector('#bs-result-items');
    this.resultBanner = this.root.querySelector('#bs-result-banner');
    this.logEl = this.root.querySelector('#bs-log');
    this.clearLogBtn = this.root.querySelector('#bs-log-clear');

    this.bindPlaybackControls({
      reset: 'step-reset', prev: 'step-prev', play: 'step-play', next: 'step-next',
      speed: 'bs-speed', speedLabel: 'bs-speed-label',
      counter: 'step-counter', message: 'step-message',
    });

    this.root.querySelector('#bs-start')?.addEventListener('click', () => this.start());
    this.root.querySelectorAll<HTMLButtonElement>('.bs-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.arrayInput) this.arrayInput.value = btn.dataset.arr || '';
        if (this.bucketCountInput) this.bucketCountInput.value = btn.dataset.buckets || '5';
        this.start();
      });
    });
    this.clearLogBtn?.addEventListener('click', () => { if (this.logEl) this.logEl.innerHTML = ''; });
    this.arrayInput?.addEventListener('change', () => this.start());
    this.bucketCountInput?.addEventListener('change', () => this.start());
  }

  protected buildSteps(): BSStep[] {
    const arr = parseArray(this.arrayInput?.value || '42,32,33,52,37,47,51,77,23,63');
    let bc = parseInt(this.bucketCountInput?.value || '5', 10);
    if (!Number.isFinite(bc) || bc < 1) bc = 5;
    if (bc > arr.length) bc = arr.length;
    return bucketSortSteps(arr, bc);
  }

  protected renderStep(step: BSStep): void {
    this.renderStats(step);
    this.renderBars(step);
    this.renderBuckets(step);
    this.renderResult(step);
    this.renderBanner(step);
    this.renderLogPanel(step);
  }

  private renderStats(step: BSStep): void {
    if (this.statBuckets) this.statBuckets.textContent = String(step.bucketCount);
    if (this.statCur) this.statCur.textContent = step.activeBucket < 0 ? '-' : String(step.activeBucket);
    // 已分配数量 = 所有桶中元素总数
    let distCount = 0;
    for (const b of step.buckets) distCount += b.length;
    if (this.statDist) this.statDist.textContent = String(distCount);
    if (this.statSorted) this.statSorted.textContent = String(step.sortedBuckets.length);
  }

  private renderBars(step: BSStep): void {
    if (!this.barsEl) return;
    const maxVal = Math.max(1, ...step.array);
    this.barsEl.innerHTML = '';

    step.array.forEach((value, idx) => {
      const wrap = document.createElement('div');
      wrap.className = 'bs-bar-wrap';

      const bar = document.createElement('div');
      bar.className = 'bs-bar';
      const h = 22 + (value / maxVal) * 60;
      bar.style.height = `${h}px`;
      bar.textContent = String(value);

      // 着色
      if (step.phase === 'find-range') {
        if (value === step.min && value === step.max) {
          bar.classList.add('bs-bar-min');
        } else if (value === step.min) {
          bar.classList.add('bs-bar-min');
        } else if (value === step.max) {
          bar.classList.add('bs-bar-max');
        }
      } else if (step.phase === 'distribute') {
        if (idx === step.distributingIdx) {
          bar.classList.add('bs-bar-active');
        } else if (idx < step.distributingIdx) {
          bar.classList.add('bs-bar-distributed');
        }
      } else if (step.phase === 'done') {
        bar.classList.add('bs-bar-done');
      }

      wrap.appendChild(bar);

      const idxLabel = document.createElement('span');
      idxLabel.className = 'bs-idx';
      idxLabel.textContent = String(idx);
      wrap.appendChild(idxLabel);

      // min/max markers
      if (step.phase === 'find-range') {
        if (value === step.min && value !== step.max) {
          const m = document.createElement('span');
          m.className = 'bs-bar-marker bs-marker-min';
          m.textContent = 'MIN';
          wrap.appendChild(m);
        } else if (value === step.max && value !== step.min) {
          const m = document.createElement('span');
          m.className = 'bs-bar-marker bs-marker-max';
          m.textContent = 'MAX';
          wrap.appendChild(m);
        } else if (value === step.min && value === step.max) {
          const m = document.createElement('span');
          m.className = 'bs-bar-marker bs-marker-min';
          m.textContent = 'MIN=MAX';
          wrap.appendChild(m);
        }
      }

      this.barsEl!.appendChild(wrap);
    });
  }

  private renderBuckets(step: BSStep): void {
    if (!this.bucketsEl) return;
    this.bucketsEl.innerHTML = '';

    if (step.phase === 'init' || step.phase === 'find-range') {
      // 桶区域提示文字
      const hint = document.createElement('div');
      hint.style.cssText = 'color:#64748b;font-size:12px;text-align:center;padding:16px;width:100%;';
      hint.textContent = step.phase === 'init' ? '等待确定范围...' : '即将创建桶...';
      this.bucketsEl.appendChild(hint);
      return;
    }

    for (let b = 0; b < step.bucketCount; b++) {
      const bucketEl = document.createElement('div');
      bucketEl.className = 'bs-bucket';

      // 状态
      if (step.phase === 'sort-bucket' && b === step.activeBucket) {
        if (step.sortedBuckets.includes(b) && step.insertI < 0) {
          bucketEl.classList.add('bs-bucket-sorted');
        } else {
          bucketEl.classList.add('bs-bucket-sorting');
        }
      } else if (step.phase === 'distribute' && b === step.distributeBucket) {
        bucketEl.classList.add('bs-bucket-active');
      } else if (step.phase === 'collect' && b === step.activeBucket) {
        bucketEl.classList.add('bs-bucket-sorted');
      } else if (step.phase === 'done' || (step.phase === 'collect' && b < step.collectUpTo)) {
        bucketEl.classList.add('bs-bucket-sorted');
      } else if (step.sortedBuckets.includes(b)) {
        bucketEl.classList.add('bs-bucket-sorted');
      }

      // header
      const header = document.createElement('div');
      header.className = 'bs-bucket-header';
      if (step.bucketRanges[b]) {
        const [lo, hi] = step.bucketRanges[b];
        header.textContent = `B${b} [${lo.toFixed(0)}-${hi.toFixed(0)})`;
      } else {
        header.textContent = `B${b}`;
      }
      bucketEl.appendChild(header);

      // items
      const itemsEl = document.createElement('div');
      itemsEl.className = 'bs-bucket-items';
      const bucketData = step.buckets[b] || [];
      bucketData.forEach((val, vi) => {
        const itemEl = document.createElement('span');
        itemEl.className = 'bs-bucket-item';

        // 桶内排序高亮
        if (step.phase === 'sort-bucket' && b === step.activeBucket) {
          if (step.insertCompareIdx >= 0 && vi === step.insertCompareIdx) {
            itemEl.classList.add('bs-item-compare');
          } else if (step.insertKey !== null && vi === step.insertI) {
            itemEl.classList.add('bs-item-active');
          } else if (step.insertI >= 0 && vi < step.insertI) {
            itemEl.classList.add('bs-item-sorted');
          } else if (step.insertI < 0 && step.sortedBuckets.includes(b)) {
            itemEl.classList.add('bs-item-sorted');
          }
        } else if (step.sortedBuckets.includes(b) || step.phase === 'done') {
          itemEl.classList.add('bs-item-sorted');
        }

        itemEl.textContent = String(val);
        itemsEl.appendChild(itemEl);
      });
      bucketEl.appendChild(itemsEl);
      this.bucketsEl!.appendChild(bucketEl);
    }
  }

  private renderResult(step: BSStep): void {
    if (!this.resultItemsEl) return;
    this.resultItemsEl.innerHTML = '';

    if (step.phase === 'collect' || step.phase === 'done') {
      step.result.forEach((val) => {
        const item = document.createElement('span');
        item.className = 'bs-result-item';
        item.textContent = String(val);
        this.resultItemsEl!.appendChild(item);
      });
    }
  }

  private renderBanner(step: BSStep): void {
    if (!this.resultBanner) return;
    this.resultBanner.classList.remove('bs-done');
    const emoji = this.resultBanner.querySelector('.bs-emoji') as HTMLElement | null;
    if (step.phase === 'done') {
      this.resultBanner.classList.add('bs-done');
      if (emoji) emoji.textContent = '🎉';
    } else if (step.phase === 'find-range') {
      if (emoji) emoji.textContent = '🔍';
    } else if (step.phase === 'create-buckets') {
      if (emoji) emoji.textContent = '🪣';
    } else if (step.phase === 'distribute') {
      if (emoji) emoji.textContent = '📥';
    } else if (step.phase === 'sort-bucket') {
      if (emoji) emoji.textContent = '🔀';
    } else if (step.phase === 'collect') {
      if (emoji) emoji.textContent = '📤';
    } else {
      if (emoji) emoji.textContent = '🪣';
    }
  }

  private renderLogPanel(step: BSStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'bs-log-line' + (i === this.currentIndex ? ' bs-log-active' : '');
      const num = document.createElement('span');
      num.className = 'bs-log-num';
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
  id: 'bucket-sort',
  name: '桶排序',
  viewId: 'algo-bucket-sort-view',
  category: 'sort',
  description: '将元素分配到多个桶中，桶内排序后合并得到有序序列',
  icon: '🪣',
  template,
  Visualizer: BucketSortVisualizer,
  difficulty: 3,
  levelOrder: 10,
  learningGoal: '理解桶排序的分治思想：分桶 → 桶内排序 → 合并',
});
