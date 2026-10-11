export interface ShellStep {
  array: number[];
  gap: number;
  i: number;
  key: number;
  j: number;
  comparisons: number;
  shifts: number;
  phase: 'init' | 'new-gap' | 'pick-key' | 'compare' | 'shift' | 'insert' | 'done';
  status: 'init' | 'new-gap' | 'pick-key' | 'compare' | 'shift' | 'insert' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function shellSortSteps(input: number[]): ShellStep[] {
  const steps: ShellStep[] = [];
  const array = [...input];
  const n = array.length;
  let comparisons = 0;
  let shifts = 0;

  steps.push({
    array: [...array],
    gap: Math.floor(n / 2),
    i: -1,
    key: -1,
    j: -1,
    comparisons: 0,
    shifts: 0,
    phase: 'init',
    status: 'init',
    message: n === 0 ? '数组为空，无需排序。' : `初始化希尔排序：数组长度 n = ${n}，初始增量 gap = ${Math.floor(n / 2)}。`,
    log: n === 0 ? '空数组' : `初始化: [${array.join(', ')}]`,
    codeLine: 2,
  });

  if (n <= 1) {
    steps.push({
      array: [...array],
      gap: 0,
      i: 0,
      key: array[0] ?? 0,
      j: -1,
      comparisons: 0,
      shifts: 0,
      phase: 'done',
      status: 'done',
      message: '✅ 排序完成！',
      log: '排序完成',
      codeLine: 13,
    });
    return steps;
  }

  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    steps.push({
      array: [...array],
      gap,
      i: gap,
      key: -1,
      j: -1,
      comparisons,
      shifts,
      phase: 'new-gap',
      status: 'new-gap',
      message: `进入新一轮增量：gap = ${gap}，对间隔为 ${gap} 的所有子序列执行分组插入排序。`,
      log: `新增量 gap = ${gap}`,
      codeLine: 4,
    });

    for (let i = gap; i < n; i++) {
      const key = array[i];
      let j = i;

      steps.push({
        array: [...array],
        gap,
        i,
        key,
        j,
        comparisons,
        shifts,
        phase: 'pick-key',
        status: 'pick-key',
        message: `提取待插入元素：key = arr[${i}] (${key})，步长 gap = ${gap}。`,
        log: `gap=${gap}: 提取 key = arr[${i}] (${key})`,
        codeLine: [5, 6, 7],
      });

      while (j >= gap) {
        comparisons++;
        const cmp = array[j - gap] > key;

        steps.push({
          array: [...array],
          gap,
          i,
          key,
          j,
          comparisons,
          shifts,
          phase: 'compare',
          status: 'compare',
          message: `跨步比较：arr[${j - gap}] (${array[j - gap]}) vs key (${key})${
            cmp ? '，需要后移 gap 位' : '，无需移动'
          }。`,
          log: `比较 arr[${j - gap}] (${array[j - gap]}) vs key (${key})`,
          codeLine: 8,
        });

        if (!cmp) break;

        array[j] = array[j - gap];
        shifts++;

        steps.push({
          array: [...array],
          gap,
          i,
          key,
          j,
          comparisons,
          shifts,
          phase: 'shift',
          status: 'shift',
          message: `跨步后移：将 arr[${j - gap}] (${array[j]}) 移动到 arr[${j}]。`,
          log: `跨步后移 arr[${j - gap}] -> [${j}]`,
          codeLine: 9,
        });

        j -= gap;
      }

      array[j] = key;

      steps.push({
        array: [...array],
        gap,
        i,
        key,
        j,
        comparisons,
        shifts,
        phase: 'insert',
        status: 'insert',
        message: `插入就位：将 key (${key}) 插入到 arr[${j}]。`,
        log: `插入 key (${key}) 到 [${j}]`,
        codeLine: 12,
      });
    }
  }

  steps.push({
    array: [...array],
    gap: 0,
    i: n - 1,
    key: array[n - 1],
    j: -1,
    comparisons,
    shifts,
    phase: 'done',
    status: 'done',
    message: `🎉 希尔排序完成！共比较 ${comparisons} 次，跨步移动 ${shifts} 次。最终数组：[${array.join(', ')}]。`,
    log: `✓ 排序完成: [${array.join(', ')}]`,
    codeLine: 13,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withMetrics(steps: ShellStep[]): ShellStep[] {
  return steps.map((s) => ({
    ...s,
    metrics: {
      gap: s.gap > 0 ? String(s.gap) : '—',
      i: s.i >= 0 ? String(s.i) : '—',
      key: s.key >= 0 ? String(s.key) : '—',
      'comp-shift': `${s.comparisons} / ${s.shifts}`,
      action: s.gap > 0 ? `当前增量 gap = ${s.gap}` : 'gap = gap / 2',
    },
  }));
}
