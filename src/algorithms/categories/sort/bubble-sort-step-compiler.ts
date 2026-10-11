export interface BSStep {
  array: number[];
  pass: number;
  j: number;
  jNext: number;
  comparisons: number;
  swaps: number;
  sortedTail: number;
  phase: 'init' | 'compare' | 'swap' | 'pass-done' | 'done';
  status: 'init' | 'compare' | 'swap' | 'pass-done' | 'done';
  swapping: boolean;
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function bubbleSortSteps(input: number[]): BSStep[] {
  const steps: BSStep[] = [];
  const array = [...input];
  const n = array.length;
  let comparisons = 0;
  let swaps = 0;
  let swapped: boolean;

  steps.push({
    array: [...array],
    pass: -1,
    j: -1,
    jNext: -1,
    comparisons: 0,
    swaps: 0,
    sortedTail: 0,
    phase: 'init',
    status: 'init',
    swapping: false,
    message: n === 0 ? '数组为空，无需排序。' : `初始化：数组长度 n = ${n}，共需最多 ${n - 1} 轮冒泡。`,
    log: n === 0 ? '空数组' : `初始化: [${array.join(', ')}]`,
    codeLine: 2,
  });

  if (n <= 1) {
    steps.push({
      array: [...array],
      pass: 0,
      j: -1,
      jNext: -1,
      comparisons: 0,
      swaps: 0,
      sortedTail: n,
      phase: 'done',
      status: 'done',
      swapping: false,
      message: '✅ 排序完成！',
      log: '排序完成',
      codeLine: 12,
    });
    return steps;
  }

  for (let i = 0; i < n - 1; i++) {
    swapped = false;

    for (let j = 0; j < n - 1 - i; j++) {
      comparisons++;
      const cmp = array[j] > array[j + 1];

      steps.push({
        array: [...array],
        pass: i + 1,
        j,
        jNext: j + 1,
        comparisons,
        swaps,
        sortedTail: i,
        phase: 'compare',
        status: 'compare',
        swapping: false,
        message: `第 ${i + 1} 轮：比较 arr[${j}] (${array[j]}) 与 arr[${j + 1}] (${array[j + 1]})${
          cmp ? '，需要交换' : '，无需交换'
        }。`,
        log: `比较 [${j}] (${array[j]}) vs [${j + 1}] (${array[j + 1]})`,
        codeLine: 6,
      });

      if (cmp) {
        const temp = array[j];
        array[j] = array[j + 1];
        array[j + 1] = temp;
        swaps++;
        swapped = true;

        steps.push({
          array: [...array],
          pass: i + 1,
          j,
          jNext: j + 1,
          comparisons,
          swaps,
          sortedTail: i,
          phase: 'swap',
          status: 'swap',
          swapping: true,
          message: `交换 arr[${j}] 与 arr[${j + 1}]：${temp} ⇋ ${array[j]}。`,
          log: `交换 [${j}] ⇋ [${j + 1}] (${temp} ⇋ ${array[j]})`,
          codeLine: [7, 8, 9, 10],
        });
      }
    }

    const settledVal = array[n - 1 - i];
    steps.push({
      array: [...array],
      pass: i + 1,
      j: -1,
      jNext: -1,
      comparisons,
      swaps,
      sortedTail: i + 1,
      phase: 'pass-done',
      status: 'pass-done',
      swapping: false,
      message: `第 ${i + 1} 轮结束：当前最大值 ${settledVal} 已冒泡沉底至下标 ${n - 1 - i}。`,
      log: `第 ${i + 1} 轮结束，末尾 ${settledVal} 就位`,
      codeLine: 12,
    });

    if (!swapped) {
      steps.push({
        array: [...array],
        pass: i + 1,
        j: -1,
        jNext: -1,
        comparisons,
        swaps,
        sortedTail: n,
        phase: 'done',
        status: 'done',
        swapping: false,
        message: '⚡ 早停触发：本轮未发生任何交换，数组已完全有序！',
        log: '早停退出: 数组已有序',
        codeLine: 12,
      });
      return steps;
    }
  }

  steps.push({
    array: [...array],
    pass: n - 1,
    j: -1,
    jNext: -1,
    comparisons,
    swaps,
    sortedTail: n,
    phase: 'done',
    status: 'done',
    swapping: false,
    message: `🎉 冒泡排序完成！共比较 ${comparisons} 次，交换 ${swaps} 次。最终数组：[${array.join(', ')}]。`,
    log: `✓ 排序完成: [${array.join(', ')}]`,
    codeLine: 14,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withMetrics(steps: BSStep[]): BSStep[] {
  return steps.map((s) => {
    let action = 'compare(arr[j], arr[j+1])';
    if (s.swapping) action = `swap(arr[${s.j}], arr[${s.jNext}]) 交换`;
    else if (s.phase === 'pass-done') action = `第 ${s.pass} 轮结束，末尾就位`;
    else if (s.phase === 'done') action = '排序完成';

    return {
      ...s,
      metrics: {
        pass: s.pass >= 0 ? String(s.pass) : '—',
        'j-pair': s.j >= 0 && s.jNext >= 0 ? `[${s.j}, ${s.jNext}]` : '—',
        'comp-swap': `${s.comparisons} / ${s.swaps}`,
        'sorted-count': `${s.sortedTail} / ${s.array.length}`,
        action,
      },
    };
  });
}
