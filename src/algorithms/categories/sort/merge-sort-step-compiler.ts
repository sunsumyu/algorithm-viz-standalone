export interface MSStep {
  array: number[];
  temp: (number | null)[];
  left: number;
  mid: number;
  right: number;
  p1: number;
  p2: number;
  t: number;
  comparisons: number;
  copies: number;
  phase: 'init' | 'divide' | 'compare' | 'take-left' | 'take-right' | 'copy-back' | 'done';
  status: 'init' | 'divide' | 'compare' | 'take-left' | 'take-right' | 'copy-back' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function mergeSortSteps(input: number[]): MSStep[] {
  const steps: MSStep[] = [];
  const array = [...input];
  const n = array.length;
  const temp: (number | null)[] = new Array(n).fill(null);
  let comparisons = 0;
  let copies = 0;

  steps.push({
    array: [...array],
    temp: [...temp],
    left: -1,
    mid: -1,
    right: -1,
    p1: -1,
    p2: -1,
    t: -1,
    comparisons: 0,
    copies: 0,
    phase: 'init',
    status: 'init',
    message: n === 0 ? '数组为空，无需排序。' : `初始化归并排序：数组长度 n = ${n}，准备进行分治递归。`,
    log: n === 0 ? '空数组' : `初始化: [${array.join(', ')}]`,
    codeLine: 2,
  });

  if (n <= 1) {
    steps.push({
      array: [...array],
      temp: [...temp],
      left: 0,
      mid: 0,
      right: 0,
      p1: -1,
      p2: -1,
      t: -1,
      comparisons: 0,
      copies: 0,
      phase: 'done',
      status: 'done',
      message: '✅ 排序完成！',
      log: '排序完成',
      codeLine: 6,
    });
    return steps;
  }

  const sort = (l: number, r: number) => {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);

    steps.push({
      array: [...array],
      temp: [...temp],
      left: l,
      mid: m,
      right: r,
      p1: -1,
      p2: -1,
      t: -1,
      comparisons,
      copies,
      phase: 'divide',
      status: 'divide',
      message: `分治拆解：划分区间 [${l}..${r}] 为左半段 [${l}..${m}] 和右半段 [${m + 1}..${r}]。`,
      log: `Divide: [${l}..${r}] -> [${l}..${m}] + [${m + 1}..${r}]`,
      codeLine: [3, 4, 5],
    });

    sort(l, m);
    sort(m + 1, r);
    merge(l, m, r);
  };

  const merge = (l: number, m: number, r: number) => {
    let p1 = l;
    let p2 = m + 1;
    let t = l;

    // 清空当前区间的 temp
    for (let k = l; k <= r; k++) temp[k] = null;

    while (p1 <= m && p2 <= r) {
      comparisons++;
      const pickLeft = array[p1] <= array[p2];

      steps.push({
        array: [...array],
        temp: [...temp],
        left: l,
        mid: m,
        right: r,
        p1,
        p2,
        t,
        comparisons,
        copies,
        phase: 'compare',
        status: 'compare',
        message: `比较双指针元素：arr[${p1}] (${array[p1]}) vs arr[${p2}] (${array[p2]})${
          pickLeft ? '，左侧较小' : '，右侧较小'
        }。`,
        log: `比较: arr[${p1}] (${array[p1]}) vs arr[${p2}] (${array[p2]})`,
        codeLine: 11,
      });

      if (pickLeft) {
        temp[t] = array[p1];
        steps.push({
          array: [...array],
          temp: [...temp],
          left: l,
          mid: m,
          right: r,
          p1,
          p2,
          t,
          comparisons,
          copies,
          phase: 'take-left',
          status: 'take-left',
          message: `选取左段元素：temp[${t}] = arr[${p1}] (${array[p1]})，p1 向右移动。`,
          log: `temp[${t}] = arr[${p1}] (${array[p1]})`,
          codeLine: 12,
        });
        p1++;
      } else {
        temp[t] = array[p2];
        steps.push({
          array: [...array],
          temp: [...temp],
          left: l,
          mid: m,
          right: r,
          p1,
          p2,
          t,
          comparisons,
          copies,
          phase: 'take-right',
          status: 'take-right',
          message: `选取右段元素：temp[${t}] = arr[${p2}] (${array[p2]})，p2 向右移动。`,
          log: `temp[${t}] = arr[${p2}] (${array[p2]})`,
          codeLine: 13,
        });
        p2++;
      }
      t++;
    }

    while (p1 <= m) {
      temp[t] = array[p1];
      steps.push({
        array: [...array],
        temp: [...temp],
        left: l,
        mid: m,
        right: r,
        p1,
        p2,
        t,
        comparisons,
        copies,
        phase: 'take-left',
        status: 'take-left',
        message: `左段剩余补齐：temp[${t}] = arr[${p1}] (${array[p1]})。`,
        log: `补齐左段: temp[${t}] = ${array[p1]}`,
        codeLine: 15,
      });
      p1++;
      t++;
    }

    while (p2 <= r) {
      temp[t] = array[p2];
      steps.push({
        array: [...array],
        temp: [...temp],
        left: l,
        mid: m,
        right: r,
        p1,
        p2,
        t,
        comparisons,
        copies,
        phase: 'take-right',
        status: 'take-right',
        message: `右段剩余补齐：temp[${t}] = arr[${p2}] (${array[p2]})。`,
        log: `补齐右段: temp[${t}] = ${array[p2]}`,
        codeLine: 16,
      });
      p2++;
      t++;
    }

    // 写回原数组
    for (let k = l; k <= r; k++) {
      array[k] = temp[k] as number;
      copies++;
    }

    steps.push({
      array: [...array],
      temp: [...temp],
      left: l,
      mid: m,
      right: r,
      p1: -1,
      p2: -1,
      t: -1,
      comparisons,
      copies,
      phase: 'copy-back',
      status: 'copy-back',
      message: `区间 [${l}..${r}] 归并完成并回填原数组！该区间已完全有序。`,
      log: `Merge 完成: [${l}..${r}] 写回原数组`,
      codeLine: 17,
    });
  };

  sort(0, n - 1);

  steps.push({
    array: [...array],
    temp: new Array(n).fill(null),
    left: 0,
    mid: Math.floor((n - 1) / 2),
    right: n - 1,
    p1: -1,
    p2: -1,
    t: -1,
    comparisons,
    copies,
    phase: 'done',
    status: 'done',
    message: `🎉 归并排序完成！共比较 ${comparisons} 次，回填 ${copies} 次。最终数组：[${array.join(', ')}]。`,
    log: `✓ 排序完成: [${array.join(', ')}]`,
    codeLine: 6,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withMetrics(steps: MSStep[]): MSStep[] {
  return steps.map((s) => {
    let action = 'merge(left, mid, right)';
    if (s.phase === 'divide') action = `mid = (${s.left} + ${s.right}) / 2 = ${s.mid}`;
    else if (s.phase === 'compare') {
      action = `arr[${s.p1}] (${s.array[s.p1]}) ${
        s.array[s.p1] <= s.array[s.p2] ? '<=' : '>'
      } arr[${s.p2}] (${s.array[s.p2]})`;
    } else if (s.phase === 'copy-back') action = `copyBack(temp[${s.left}..${s.right}] -> arr)`;
    else if (s.phase === 'done') action = '归并排序完成';

    return {
      ...s,
      metrics: {
        range: s.left >= 0 && s.right >= 0 ? `[${s.left}, ${s.mid}, ${s.right}]` : '—',
        p1: s.p1 >= 0 ? `${s.p1} (${s.array[s.p1]})` : '—',
        p2: s.p2 >= 0 ? `${s.p2} (${s.array[s.p2]})` : '—',
        'comp-copy': `${s.comparisons} / ${s.copies}`,
        action,
      },
    };
  });
}
