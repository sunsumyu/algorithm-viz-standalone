export interface SSStep {
  array: number[];
  i: number;
  minIdx: number;
  j: number;
  comparisons: number;
  swaps: number;
  sortedCount: number;
  phase: 'init' | 'scan' | 'compare' | 'update-min' | 'swap' | 'pass-done' | 'done';
  status: 'init' | 'scan' | 'compare' | 'update-min' | 'swap' | 'pass-done' | 'done';
  swapping: boolean;
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function selectionSortSteps(inputArr: number[]): SSStep[] {
  const steps: SSStep[] = [];
  const array = [...inputArr];
  const n = array.length;
  let comparisons = 0;
  let swaps = 0;

  steps.push({
    array: [...array],
    i: 0,
    minIdx: 0,
    j: -1,
    comparisons: 0,
    swaps: 0,
    sortedCount: 0,
    phase: 'init',
    status: 'init',
    swapping: false,
    message: `准备开始选择排序，待排序数组长度为 ${n}。`,
    log: `初始化数组: [${array.join(', ')}]`,
    codeLine: 2,
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    steps.push({
      array: [...array],
      i,
      minIdx,
      j: -1,
      comparisons,
      swaps,
      sortedCount: i,
      phase: 'scan',
      status: 'scan',
      swapping: false,
      message: `第 ${i + 1} 轮：假设当前区间 [${i}..${n - 1}] 的最小值为下标 ${i} 处的元素 (${array[i]})。`,
      log: `第 ${i + 1} 轮: 设初始最小值 minIdx = ${i} (${array[i]})`,
      codeLine: 4,
    });

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      const isSmaller = array[j] < array[minIdx];

      steps.push({
        array: [...array],
        i,
        minIdx,
        j,
        comparisons,
        swaps,
        sortedCount: i,
        phase: 'compare',
        status: 'compare',
        swapping: false,
        message: `比较 arr[${j}] (${array[j]}) 与当前已知最小值 arr[${minIdx}] (${array[minIdx]})${
          isSmaller ? '，发现更小值！' : '，未打破最小值。'
        }`,
        log: `比较 [${j}] (${array[j]}) vs 最小 [${minIdx}] (${array[minIdx]})`,
        codeLine: 6,
      });

      if (isSmaller) {
        minIdx = j;

        steps.push({
          array: [...array],
          i,
          minIdx,
          j,
          comparisons,
          swaps,
          sortedCount: i,
          phase: 'update-min',
          status: 'update-min',
          swapping: false,
          message: `更新最小值索引：minIdx = ${minIdx} (值 ${array[minIdx]})。`,
          log: `更新 minIdx = ${minIdx} (${array[minIdx]})`,
          codeLine: 7,
        });
      }
    }

    if (minIdx !== i) {
      const temp = array[i];
      array[i] = array[minIdx];
      array[minIdx] = temp;
      swaps++;

      steps.push({
        array: [...array],
        i,
        minIdx,
        j: -1,
        comparisons,
        swaps,
        sortedCount: i,
        phase: 'swap',
        status: 'swap',
        swapping: true,
        message: `将本轮找到的最小值 ${array[i]} 与 arr[${i}] (${temp}) 进行交换，归位到已排序区末尾。`,
        log: `交换 [${i}] ⇋ [${minIdx}] (${temp} ⇋ ${array[i]})`,
        codeLine: [9, 10, 11],
      });
    }

    steps.push({
      array: [...array],
      i,
      minIdx: i,
      j: -1,
      comparisons,
      swaps,
      sortedCount: i + 1,
      phase: 'pass-done',
      status: 'pass-done',
      swapping: false,
      message: `第 ${i + 1} 轮结束：下标 ${i} (值 ${array[i]}) 已就位，左侧已排序区扩充至 [0..${i}]。`,
      log: `第 ${i + 1} 轮结束，[0..${i}] 已有序`,
      codeLine: 13,
    });
  }

  steps.push({
    array: [...array],
    i: n - 1,
    minIdx: n - 1,
    j: -1,
    comparisons,
    swaps,
    sortedCount: n,
    phase: 'done',
    status: 'done',
    swapping: false,
    message: `🎉 选择排序完成！共比较 ${comparisons} 次，仅执行 ${swaps} 次交换。最终数组：[${array.join(', ')}]。`,
    log: `✓ 排序完成: [${array.join(', ')}]`,
    codeLine: 14,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withMetrics(steps: SSStep[]): SSStep[] {
  return steps.map((s) => {
    let action = 'findMin(arr[i..n-1])';
    if (s.swapping) action = `swap(arr[${s.i}], arr[${s.minIdx}]) 归位`;
    else if (s.phase === 'compare') {
      action = `arr[${s.j}] (${s.array[s.j]}) ${
        s.array[s.j] < s.array[s.minIdx] ? '<' : '>='
      } arr[${s.minIdx}] (${s.array[s.minIdx]})`;
    } else if (s.phase === 'update-min') action = `minIdx = ${s.minIdx} (${s.array[s.minIdx]})`;
    else if (s.phase === 'pass-done') action = `第 ${s.i + 1} 轮就位完毕`;
    else if (s.phase === 'done') action = '排序完成';

    return {
      ...s,
      metrics: {
        i: s.i >= 0 ? String(s.i) : '—',
        'min-idx': s.minIdx >= 0 ? `${s.minIdx} (${s.array[s.minIdx]})` : '—',
        j: s.j >= 0 ? String(s.j) : '—',
        'comp-swap': `${s.comparisons} / ${s.swaps}`,
        action,
      },
    };
  });
}
