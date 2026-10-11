export interface CSStep {
  array: number[];
  count: number[];
  output: (number | null)[];
  minVal: number;
  maxVal: number;
  k: number;
  srcIdx: number;
  countIdx: number;
  outIdx: number;
  curElem: number | null;
  phase: 'init' | 'find-minmax' | 'count-freq' | 'prefix-sum' | 'build-out' | 'done';
  status: 'init' | 'find-minmax' | 'count-freq' | 'prefix-sum' | 'build-out' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function countingSortSteps(input: number[]): CSStep[] {
  const steps: CSStep[] = [];
  const array = [...input];
  const n = array.length;

  if (n === 0) {
    steps.push({
      array: [],
      count: [],
      output: [],
      minVal: 0,
      maxVal: 0,
      k: 0,
      srcIdx: -1,
      countIdx: -1,
      outIdx: -1,
      curElem: null,
      phase: 'done',
      status: 'done',
      message: '数组为空，无需排序。',
      log: '空数组',
      codeLine: 2,
    });
    return steps;
  }

  const minVal = Math.min(...array);
  const maxVal = Math.max(...array);
  const k = maxVal - minVal + 1;
  const count = new Array(k).fill(0);
  const output: (number | null)[] = new Array(n).fill(null);

  steps.push({
    array: [...array],
    count: [...count],
    output: [...output],
    minVal,
    maxVal,
    k,
    srcIdx: -1,
    countIdx: -1,
    outIdx: -1,
    curElem: null,
    phase: 'find-minmax',
    status: 'find-minmax',
    message: `扫描极值：min = ${minVal}, max = ${maxVal}，值域跨度 k = ${k}。创建长度为 ${k} 的计数数组。`,
    log: `极值范围 [${minVal}..${maxVal}], k = ${k}`,
    codeLine: [3, 4, 5, 6, 7, 8, 9],
  });

  // 1. 统计频次
  for (let i = 0; i < n; i++) {
    const val = array[i];
    const cIdx = val - minVal;
    count[cIdx]++;

    steps.push({
      array: [...array],
      count: [...count],
      output: [...output],
      minVal,
      maxVal,
      k,
      srcIdx: i,
      countIdx: cIdx,
      outIdx: -1,
      curElem: val,
      phase: 'count-freq',
      status: 'count-freq',
      message: `频次统计：读取 arr[${i}] = ${val}，在 count[${val} - ${minVal}] (${cIdx}) 处计数累加至 ${count[cIdx]}。`,
      log: `统计 val=${val} -> count[${cIdx}]=${count[cIdx]}`,
      codeLine: 10,
    });
  }

  // 2. 前缀和累加
  for (let i = 1; i < k; i++) {
    count[i] += count[i - 1];

    steps.push({
      array: [...array],
      count: [...count],
      output: [...output],
      minVal,
      maxVal,
      k,
      srcIdx: -1,
      countIdx: i,
      outIdx: -1,
      curElem: null,
      phase: 'prefix-sum',
      status: 'prefix-sum',
      message: `前缀和累加：count[${i}] += count[${i - 1}] = ${count[i]} (表示 &le; ${i + minVal} 的元素总数)。`,
      log: `前缀和: count[${i}] = ${count[i]}`,
      codeLine: 11,
    });
  }

  // 3. 倒序稳定回填
  for (let i = n - 1; i >= 0; i--) {
    const val = array[i];
    const cIdx = val - minVal;
    count[cIdx]--;
    const outIdx = count[cIdx];
    output[outIdx] = val;

    steps.push({
      array: [...array],
      count: [...count],
      output: [...output],
      minVal,
      maxVal,
      k,
      srcIdx: i,
      countIdx: cIdx,
      outIdx,
      curElem: val,
      phase: 'build-out',
      status: 'build-out',
      message: `稳定回填：读取 arr[${i}] = ${val}，目标下标为 --count[${cIdx}] = ${outIdx}，写入 output[${outIdx}] = ${val}。`,
      log: `回填: arr[${i}]=${val} -> output[${outIdx}]`,
      codeLine: [13, 14, 15],
    });
  }

  steps.push({
    array: [...array],
    count: [...count],
    output: [...output],
    minVal,
    maxVal,
    k,
    srcIdx: -1,
    countIdx: -1,
    outIdx: -1,
    curElem: null,
    phase: 'done',
    status: 'done',
    message: `🎉 计数排序完成！输出结果：[${output.join(', ')}]。`,
    log: `✓ 排序完成: [${output.join(', ')}]`,
    codeLine: 16,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withMetrics(steps: CSStep[]): CSStep[] {
  return steps.map((s) => {
    let action = 'output[--count[x - min]] = x';
    if (s.phase === 'count-freq') action = `count[${s.curElem} - ${s.minVal}]++ (${s.count[s.countIdx]})`;
    else if (s.phase === 'prefix-sum') action = `count[${s.countIdx}] += count[${s.countIdx - 1}] = ${s.count[s.countIdx]}`;
    else if (s.phase === 'build-out') action = `output[--count[${s.curElem} - ${s.minVal}]] = ${s.curElem}`;
    else if (s.phase === 'done') action = '计数排序完成';

    return {
      ...s,
      metrics: {
        range: `[${s.minVal}, ${s.maxVal}]`,
        k: String(s.k),
        'cur-elem': s.curElem !== null ? `${s.curElem}` : '—',
        'out-idx': s.outIdx >= 0 ? `${s.outIdx}` : '—',
        action,
      },
    };
  });
}
