export interface HSStep {
  array: number[];
  heapSize: number;
  rootIdx: number;
  leftChild: number;
  rightChild: number;
  largestIdx: number;
  comparisons: number;
  swaps: number;
  settledCount: number;
  swapping: boolean;
  phase: 'init' | 'build-heap' | 'heapify-compare' | 'heapify-swap' | 'extract-max' | 'done';
  status: 'init' | 'build-heap' | 'heapify-compare' | 'heapify-swap' | 'extract-max' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function heapSortSteps(input: number[]): HSStep[] {
  const steps: HSStep[] = [];
  const array = [...input];
  const n = array.length;
  let comparisons = 0;
  let swaps = 0;

  steps.push({
    array: [...array],
    heapSize: n,
    rootIdx: -1,
    leftChild: -1,
    rightChild: -1,
    largestIdx: -1,
    comparisons: 0,
    swaps: 0,
    settledCount: 0,
    swapping: false,
    phase: 'init',
    status: 'init',
    message: n === 0 ? '数组为空，无需排序。' : `初始化堆排序：数组长度 n = ${n}，准备自底向上构建大顶堆。`,
    log: n === 0 ? '空数组' : `初始化: [${array.join(', ')}]`,
    codeLine: 2,
  });

  if (n <= 1) {
    steps.push({
      array: [...array],
      heapSize: n,
      rootIdx: 0,
      leftChild: -1,
      rightChild: -1,
      largestIdx: 0,
      comparisons: 0,
      swaps: 0,
      settledCount: n,
      swapping: false,
      phase: 'done',
      status: 'done',
      message: '✅ 排序完成！',
      log: '排序完成',
      codeLine: 10,
    });
    return steps;
  }

  const heapify = (size: number, i: number, inBuild: boolean) => {
    let largest = i;
    const l = 2 * i + 1;
    const r = 2 * i + 2;

    if (l < size) {
      comparisons++;
      if (array[l] > array[largest]) largest = l;
    }
    if (r < size) {
      comparisons++;
      if (array[r] > array[largest]) largest = r;
    }

    steps.push({
      array: [...array],
      heapSize: size,
      rootIdx: i,
      leftChild: l < size ? l : -1,
      rightChild: r < size ? r : -1,
      largestIdx: largest,
      comparisons,
      swaps,
      settledCount: n - size,
      swapping: false,
      phase: 'heapify-compare',
      status: 'heapify-compare',
      message: `${inBuild ? '建堆' : '调整'}下沉：节点 arr[${i}] (${array[i]}) 与子节点 [${l < size ? array[l] : '—'}, ${
        r < size ? array[r] : '—'
      }] 比对，最大值候选为 arr[${largest}] (${array[largest]})。`,
      log: `heapify [${i}]: largest = [${largest}] (${array[largest]})`,
      codeLine: [14, 15, 16],
    });

    if (largest !== i) {
      const temp = array[i];
      array[i] = array[largest];
      array[largest] = temp;
      swaps++;

      steps.push({
        array: [...array],
        heapSize: size,
        rootIdx: i,
        leftChild: l < size ? l : -1,
        rightChild: r < size ? r : -1,
        largestIdx: largest,
        comparisons,
        swaps,
        settledCount: n - size,
        swapping: true,
        phase: 'heapify-swap',
        status: 'heapify-swap',
        message: `执行下沉交换：arr[${i}] 与 arr[${largest}] 交换 (${temp} ⇋ ${array[i]})，并继续向下递归。`,
        log: `下沉交换 [${i}] ⇋ [${largest}] (${temp} ⇋ ${array[i]})`,
        codeLine: [17, 18, 19],
      });

      heapify(size, largest, inBuild);
    }
  };

  // 1. 构建初始大顶堆
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    steps.push({
      array: [...array],
      heapSize: n,
      rootIdx: i,
      leftChild: 2 * i + 1,
      rightChild: 2 * i + 2 < n ? 2 * i + 2 : -1,
      largestIdx: i,
      comparisons,
      swaps,
      settledCount: 0,
      swapping: false,
      phase: 'build-heap',
      status: 'build-heap',
      message: `构建大顶堆：自底向上处理非叶节点下标 ${i} (值为 ${array[i]})。`,
      log: `建堆处理节点 [${i}]`,
      codeLine: [4, 5],
    });
    heapify(n, i, true);
  }

  // 2. 依次提取堆顶
  for (let i = n - 1; i > 0; i--) {
    const maxVal = array[0];
    const temp = array[0];
    array[0] = array[i];
    array[i] = temp;
    swaps++;

    steps.push({
      array: [...array],
      heapSize: i,
      rootIdx: 0,
      leftChild: -1,
      rightChild: -1,
      largestIdx: -1,
      comparisons,
      swaps,
      settledCount: n - i,
      swapping: true,
      phase: 'extract-max',
      status: 'extract-max',
      message: `提取堆顶最大值：将堆顶 ${maxVal} 与当前堆末尾 arr[${i}] (${temp}) 交换归位，堆容量减至 ${i}。`,
      log: `提取堆顶 ${maxVal} 归位至 [${i}]`,
      codeLine: [8, 9],
    });

    heapify(i, 0, false);
  }

  steps.push({
    array: [...array],
    heapSize: 0,
    rootIdx: -1,
    leftChild: -1,
    rightChild: -1,
    largestIdx: -1,
    comparisons,
    swaps,
    settledCount: n,
    swapping: false,
    phase: 'done',
    status: 'done',
    message: `🎉 堆排序完成！共比较 ${comparisons} 次，交换 ${swaps} 次。最终数组：[${array.join(', ')}]。`,
    log: `✓ 排序完成: [${array.join(', ')}]`,
    codeLine: 10,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withMetrics(steps: HSStep[]): HSStep[] {
  return steps.map((s) => {
    let action = 'buildMaxHeap(arr, n)';
    if (s.swapping) action = `swap(arr[${s.rootIdx}], arr[${s.largestIdx}]) 下沉`;
    else if (s.phase === 'heapify-compare') action = `heapify(arr, size=${s.heapSize}, root=${s.rootIdx})`;
    else if (s.phase === 'extract-max') action = `extractMax(arr[0] -> arr[${s.heapSize}])`;
    else if (s.phase === 'done') action = '堆排序完成';

    return {
      ...s,
      metrics: {
        'heap-size': String(s.heapSize),
        root: s.rootIdx >= 0 ? `${s.rootIdx} (${s.array[s.rootIdx]})` : '—',
        largest: s.largestIdx >= 0 ? `${s.largestIdx} (${s.array[s.largestIdx]})` : '—',
        'comp-swap': `${s.comparisons} / ${s.swaps}`,
        action,
      },
    };
  });
}
