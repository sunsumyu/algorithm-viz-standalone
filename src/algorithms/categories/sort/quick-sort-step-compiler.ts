export interface QSStep {
  array: number[];
  left: number;
  right: number;
  pivotIdx: number;
  pivotVal: number;
  i: number;
  j: number;
  comparisons: number;
  swaps: number;
  settledIndices: number[];
  swapping: boolean;
  phase: 'init' | 'pick-pivot' | 'scan-j' | 'scan-i' | 'swap-ij' | 'pivot-settled' | 'done';
  status: 'init' | 'pick-pivot' | 'scan-j' | 'scan-i' | 'swap-ij' | 'pivot-settled' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function quickSortSteps(input: number[]): QSStep[] {
  const steps: QSStep[] = [];
  const array = [...input];
  const n = array.length;
  const settledIndices: number[] = [];
  let comparisons = 0;
  let swaps = 0;

  steps.push({
    array: [...array],
    left: -1,
    right: -1,
    pivotIdx: -1,
    pivotVal: -1,
    i: -1,
    j: -1,
    comparisons: 0,
    swaps: 0,
    settledIndices: [],
    swapping: false,
    phase: 'init',
    status: 'init',
    message: n === 0 ? '数组为空，无需排序。' : `初始化快速排序：数组长度 n = ${n}，采用双指针向内夹逼 Partition。`,
    log: n === 0 ? '空数组' : `初始化: [${array.join(', ')}]`,
    codeLine: 2,
  });

  if (n <= 1) {
    steps.push({
      array: [...array],
      left: 0,
      right: 0,
      pivotIdx: 0,
      pivotVal: array[0] ?? 0,
      i: 0,
      j: 0,
      comparisons: 0,
      swaps: 0,
      settledIndices: n === 1 ? [0] : [],
      swapping: false,
      phase: 'done',
      status: 'done',
      message: '✅ 排序完成！',
      log: '排序完成',
      codeLine: 5,
    });
    return steps;
  }

  const sort = (l: number, r: number) => {
    if (l >= r) {
      if (l === r && !settledIndices.includes(l)) settledIndices.push(l);
      return;
    }

    const pivotVal = array[l];
    let i = l;
    let j = r;

    steps.push({
      array: [...array],
      left: l,
      right: r,
      pivotIdx: l,
      pivotVal,
      i,
      j,
      comparisons,
      swaps,
      settledIndices: [...settledIndices],
      swapping: false,
      phase: 'pick-pivot',
      status: 'pick-pivot',
      message: `区间 [${l}..${r}] 划分：选定基准值 pivot = arr[${l}] (${pivotVal})，指针 i=${i}, j=${j}。`,
      log: `区间 [${l}..${r}]: pivot = ${pivotVal}`,
      codeLine: [9, 10],
    });

    while (i < j) {
      while (i < j && array[j] >= pivotVal) {
        comparisons++;
        steps.push({
          array: [...array],
          left: l,
          right: r,
          pivotIdx: l,
          pivotVal,
          i,
          j,
          comparisons,
          swaps,
          settledIndices: [...settledIndices],
          swapping: false,
          phase: 'scan-j',
          status: 'scan-j',
          message: `右指针 j 向左扫描：arr[${j}] (${array[j]}) &ge; pivot (${pivotVal})，右指针左移。`,
          log: `j 左移: arr[${j}] (${array[j]}) >= pivot`,
          codeLine: 12,
        });
        j--;
      }

      while (i < j && array[i] <= pivotVal) {
        comparisons++;
        steps.push({
          array: [...array],
          left: l,
          right: r,
          pivotIdx: l,
          pivotVal,
          i,
          j,
          comparisons,
          swaps,
          settledIndices: [...settledIndices],
          swapping: false,
          phase: 'scan-i',
          status: 'scan-i',
          message: `左指针 i 向右扫描：arr[${i}] (${array[i]}) &le; pivot (${pivotVal})，左指针右移。`,
          log: `i 右移: arr[${i}] (${array[i]}) <= pivot`,
          codeLine: 13,
        });
        i++;
      }

      if (i < j) {
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
        swaps++;

        steps.push({
          array: [...array],
          left: l,
          right: r,
          pivotIdx: l,
          pivotVal,
          i,
          j,
          comparisons,
          swaps,
          settledIndices: [...settledIndices],
          swapping: true,
          phase: 'swap-ij',
          status: 'swap-ij',
          message: `双向交换：交换 arr[${i}] 与 arr[${j}] (${temp} ⇋ ${array[i]})。`,
          log: `交换 [${i}] ⇋ [${j}] (${temp} ⇋ ${array[i]})`,
          codeLine: [14, 15, 16],
        });
      }
    }

    // 将基准值归位到相遇点 i
    array[l] = array[i];
    array[i] = pivotVal;
    if (l !== i) swaps++;
    settledIndices.push(i);

    steps.push({
      array: [...array],
      left: l,
      right: r,
      pivotIdx: i,
      pivotVal,
      i,
      j: i,
      comparisons,
      swaps,
      settledIndices: [...settledIndices],
      swapping: true,
      phase: 'pivot-settled',
      status: 'pivot-settled',
      message: `基准归位：将 pivot (${pivotVal}) 放入相遇点下标 ${i}。左侧全部 &le; ${pivotVal}，右侧全部 &ge; ${pivotVal}。`,
      log: `Pivot ${pivotVal} 就位于下标 ${i}`,
      codeLine: [18, 19],
    });

    sort(l, i - 1);
    sort(i + 1, r);
  };

  sort(0, n - 1);

  steps.push({
    array: [...array],
    left: 0,
    right: n - 1,
    pivotIdx: -1,
    pivotVal: -1,
    i: -1,
    j: -1,
    comparisons,
    swaps,
    settledIndices: Array.from({ length: n }, (_, idx) => idx),
    swapping: false,
    phase: 'done',
    status: 'done',
    message: `🎉 快速排序完成！共比较 ${comparisons} 次，交换 ${swaps} 次。最终数组：[${array.join(', ')}]。`,
    log: `✓ 排序完成: [${array.join(', ')}]`,
    codeLine: 5,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withMetrics(steps: QSStep[]): QSStep[] {
  return steps.map((s) => {
    let action = 'partition(arr, left, right)';
    if (s.swapping) action = `swap(arr[${s.i}], arr[${s.j}]) 交换`;
    else if (s.phase === 'scan-j') action = `arr[${s.j}] (${s.array[s.j]}) >= pivot (${s.pivotVal}) (j--)`;
    else if (s.phase === 'scan-i') action = `arr[${s.i}] (${s.array[s.i]}) <= pivot (${s.pivotVal}) (i++)`;
    else if (s.phase === 'pivot-settled') action = `pivot (${s.pivotVal}) 归位于下标 ${s.i}`;
    else if (s.phase === 'done') action = '快速排序完成';

    return {
      ...s,
      metrics: {
        range: s.left >= 0 && s.right >= 0 ? `[${s.left}, ${s.right}]` : '—',
        pivot: s.pivotVal >= 0 && s.phase !== 'done' ? `${s.pivotVal}` : '—',
        ij: s.i >= 0 && s.j >= 0 ? `[${s.i}, ${s.j}]` : '—',
        'comp-swap': `${s.comparisons} / ${s.swaps}`,
        action,
      },
    };
  });
}
