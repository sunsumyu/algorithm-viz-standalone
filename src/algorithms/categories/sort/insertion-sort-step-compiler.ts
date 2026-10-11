export interface ISStep {
  array: number[];
  i: number;
  key: number;
  j: number;
  shifts: number;
  sortedCount: number;
  phase: 'init' | 'pick-key' | 'compare' | 'shift' | 'insert' | 'done';
  status: 'init' | 'pick-key' | 'compare' | 'shift' | 'insert' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function insertionSortSteps(input: number[]): ISStep[] {
  const steps: ISStep[] = [];
  const array = [...input];
  const n = array.length;
  let shifts = 0;

  steps.push({
    array: [...array],
    i: -1,
    key: -1,
    j: -1,
    shifts: 0,
    sortedCount: 1,
    phase: 'init',
    status: 'init',
    message: n === 0 ? '数组为空，无需排序。' : `初始化：数组长度 n = ${n}，首元素 arr[0] 默认构成初始有序区。`,
    log: n === 0 ? '空数组' : `初始化: [${array.join(', ')}]`,
    codeLine: 2,
  });

  if (n <= 1) {
    steps.push({
      array: [...array],
      i: 0,
      key: array[0] ?? 0,
      j: -1,
      shifts: 0,
      sortedCount: n,
      phase: 'done',
      status: 'done',
      message: '✅ 排序完成！',
      log: '排序完成',
      codeLine: 12,
    });
    return steps;
  }

  for (let i = 1; i < n; i++) {
    const key = array[i];
    let j = i - 1;

    steps.push({
      array: [...array],
      i,
      key,
      j,
      shifts,
      sortedCount: i,
      phase: 'pick-key',
      status: 'pick-key',
      message: `提取待插入元素：key = arr[${i}] (${key})，准备在已排序区间 [0..${i - 1}] 中向前扫描找寻插入位置。`,
      log: `提取 key = arr[${i}] (${key})`,
      codeLine: [3, 4, 5],
    });

    while (j >= 0 && array[j] > key) {
      steps.push({
        array: [...array],
        i,
        key,
        j,
        shifts,
        sortedCount: i,
        phase: 'compare',
        status: 'compare',
        message: `比较：arr[${j}] (${array[j]}) > key (${key})，需要向后移动腾位。`,
        log: `比较: arr[${j}] (${array[j]}) > key (${key}) -> 右移`,
        codeLine: 7,
      });

      array[j + 1] = array[j];
      shifts++;

      steps.push({
        array: [...array],
        i,
        key,
        j,
        shifts,
        sortedCount: i,
        phase: 'shift',
        status: 'shift',
        message: `元素右移：将 arr[${j}] (${array[j]}) 移动到 arr[${j + 1}]。`,
        log: `右移 arr[${j}] -> [${j + 1}]`,
        codeLine: 8,
      });

      j--;
    }

    if (j >= 0) {
      steps.push({
        array: [...array],
        i,
        key,
        j,
        shifts,
        sortedCount: i,
        phase: 'compare',
        status: 'compare',
        message: `比较：arr[${j}] (${array[j]}) &le; key (${key})，找到插入边界！目标插入位置为下标 ${j + 1}。`,
        log: `找到插入位置: 下标 ${j + 1}`,
        codeLine: 7,
      });
    }

    array[j + 1] = key;

    steps.push({
      array: [...array],
      i,
      key,
      j: j + 1,
      shifts,
      sortedCount: i + 1,
      phase: 'insert',
      status: 'insert',
      message: `就位插入：将 key (${key}) 放入 arr[${j + 1}]。当前有序前缀扩展至 [0..${i}]。`,
      log: `插入 key (${key}) 到 [${j + 1}]，有序区 [0..${i}]`,
      codeLine: 11,
    });
  }

  steps.push({
    array: [...array],
    i: n - 1,
    key: array[n - 1],
    j: -1,
    shifts,
    sortedCount: n,
    phase: 'done',
    status: 'done',
    message: `🎉 插入排序完成！共执行 ${shifts} 次元素搬移。最终数组：[${array.join(', ')}]。`,
    log: `✓ 排序完成: [${array.join(', ')}]`,
    codeLine: 12,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withMetrics(steps: ISStep[]): ISStep[] {
  return steps.map((s) => {
    let action = 'insert(key, arr[0..i-1])';
    if (s.phase === 'pick-key') action = `key = arr[${s.i}] (${s.key})`;
    else if (s.phase === 'compare') {
      action = `arr[${s.j}] (${s.array[s.j]}) ${
        s.array[s.j] > s.key ? '>' : '<='
      } key (${s.key})`;
    } else if (s.phase === 'shift') action = `arr[${s.j + 1}] = arr[${s.j}] (${s.array[s.j + 1]})`;
    else if (s.phase === 'insert') action = `arr[${s.j}] = key (${s.key}) 插入`;
    else if (s.phase === 'done') action = '排序完成';

    return {
      ...s,
      metrics: {
        i: s.i >= 0 ? String(s.i) : '—',
        key: s.key >= 0 ? String(s.key) : '—',
        j: s.j >= 0 ? String(s.j) : '—',
        shifts: String(s.shifts),
        action,
      },
    };
  });
}
