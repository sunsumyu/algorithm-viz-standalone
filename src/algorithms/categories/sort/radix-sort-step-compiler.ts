export interface RadixStep {
  array: number[];
  count: number[];
  output: (number | null)[];
  exp: number;
  maxVal: number;
  srcIdx: number;
  digit: number | null;
  outIdx: number;
  curElem: number | null;
  phase: 'init' | 'new-exp' | 'count-digit' | 'prefix-sum' | 'build-out' | 'write-back' | 'done';
  status: 'init' | 'new-exp' | 'count-digit' | 'prefix-sum' | 'build-out' | 'write-back' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function radixSortSteps(input: number[]): RadixStep[] {
  const steps: RadixStep[] = [];
  const array = [...input];
  const n = array.length;

  if (n === 0) {
    steps.push({
      array: [],
      count: new Array(10).fill(0),
      output: [],
      exp: 1,
      maxVal: 0,
      srcIdx: -1,
      digit: null,
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

  const maxVal = Math.max(...array);

  steps.push({
    array: [...array],
    count: new Array(10).fill(0),
    output: new Array(n).fill(null),
    exp: 1,
    maxVal,
    srcIdx: -1,
    digit: null,
    outIdx: -1,
    curElem: null,
    phase: 'init',
    status: 'init',
    message: `初始化基数排序：数组长度 n = ${n}，最大值 max = ${maxVal}，准备从个位 (exp = 1) 开始排序。`,
    log: `初始化: max = ${maxVal}`,
    codeLine: 2,
  });

  if (n <= 1) {
    steps.push({
      array: [...array],
      count: new Array(10).fill(0),
      output: [...array],
      exp: 1,
      maxVal,
      srcIdx: -1,
      digit: null,
      outIdx: -1,
      curElem: null,
      phase: 'done',
      status: 'done',
      message: '✅ 排序完成！',
      log: '排序完成',
      codeLine: 5,
    });
    return steps;
  }

  for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
    const count = new Array(10).fill(0);
    const output: (number | null)[] = new Array(n).fill(null);
    const expName = exp === 1 ? '个位' : exp === 10 ? '十位' : exp === 100 ? '百位' : `${exp}位`;

    steps.push({
      array: [...array],
      count: [...count],
      output: [...output],
      exp,
      maxVal,
      srcIdx: -1,
      digit: null,
      outIdx: -1,
      curElem: null,
      phase: 'new-exp',
      status: 'new-exp',
      message: `进入新权位排序：exp = ${exp} (${expName})。初始化 0..9 计数桶。`,
      log: `权位 exp = ${exp} (${expName})`,
      codeLine: 6,
    });

    // 1. 统计当前位频次
    for (let i = 0; i < n; i++) {
      const val = array[i];
      const d = Math.floor(val / exp) % 10;
      count[d]++;

      steps.push({
        array: [...array],
        count: [...count],
        output: [...output],
        exp,
        maxVal,
        srcIdx: i,
        digit: d,
        outIdx: -1,
        curElem: val,
        phase: 'count-digit',
        status: 'count-digit',
        message: `数位提取：arr[${i}] = ${val}，其 ${expName} 数字为 ${d}，在 count[${d}] 处计数累加至 ${count[d]}。`,
        log: `arr[${i}]=${val} -> ${expName}数位 '${d}' (count[${d}]=${count[d]})`,
        codeLine: 13,
      });
    }

    // 2. 前缀和累加
    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];

      steps.push({
        array: [...array],
        count: [...count],
        output: [...output],
        exp,
        maxVal,
        srcIdx: -1,
        digit: i,
        outIdx: -1,
        curElem: null,
        phase: 'prefix-sum',
        status: 'prefix-sum',
        message: `前缀累加：count[${i}] += count[${i - 1}] = ${count[i]} (表示 ${expName} &le; ${i} 的元素总数)。`,
        log: `前缀和 count[${i}] = ${count[i]}`,
        codeLine: 14,
      });
    }

    // 3. 倒序稳定回填
    for (let i = n - 1; i >= 0; i--) {
      const val = array[i];
      const d = Math.floor(val / exp) % 10;
      count[d]--;
      const outIdx = count[d];
      output[outIdx] = val;

      steps.push({
        array: [...array],
        count: [...count],
        output: [...output],
        exp,
        maxVal,
        srcIdx: i,
        digit: d,
        outIdx,
        curElem: val,
        phase: 'build-out',
        status: 'build-out',
        message: `稳定回填：arr[${i}] = ${val} (${expName}数位 ${d})，目标下标为 --count[${d}] = ${outIdx}，写入 output[${outIdx}]。`,
        log: `回填: ${val} -> output[${outIdx}]`,
        codeLine: [15, 16, 17],
      });
    }

    // 4. 写回原数组
    for (let i = 0; i < n; i++) {
      array[i] = output[i] as number;
    }

    steps.push({
      array: [...array],
      count: [...count],
      output: [...output],
      exp,
      maxVal,
      srcIdx: -1,
      digit: null,
      outIdx: -1,
      curElem: null,
      phase: 'write-back',
      status: 'write-back',
      message: `${expName} (exp = ${exp}) 计数排序完毕，写回原数组。当前数组已按低 ${expName} 有序。`,
      log: `${expName} 排序完成并写回原数组`,
      codeLine: 19,
    });
  }

  steps.push({
    array: [...array],
    count: new Array(10).fill(0),
    output: [...array],
    exp: 0,
    maxVal,
    srcIdx: -1,
    digit: null,
    outIdx: -1,
    curElem: null,
    phase: 'done',
    status: 'done',
    message: `🎉 基数排序完成！最终排序结果：[${array.join(', ')}]。`,
    log: `✓ 排序完成: [${array.join(', ')}]`,
    codeLine: 8,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withMetrics(steps: RadixStep[]): RadixStep[] {
  return steps.map((s) => {
    const expName =
      s.exp === 1 ? '1 (个位)' : s.exp === 10 ? '10 (十位)' : s.exp === 100 ? '100 (百位)' : s.exp > 0 ? `${s.exp}` : '—';

    let action = 'digit = (x / exp) % 10';
    if (s.phase === 'count-digit' && s.digit !== null) action = `count[(${s.curElem} / ${s.exp}) % 10] = count[${s.digit}]++ (${s.count[s.digit]})`;
    else if (s.phase === 'prefix-sum' && s.digit !== null) action = `count[${s.digit}] += count[${s.digit - 1}] = ${s.count[s.digit]}`;
    else if (s.phase === 'build-out') action = `output[--count[${s.digit}]] = output[${s.outIdx}] = ${s.curElem}`;
    else if (s.phase === 'write-back') action = '写回原数组 (当前权位就绪)';
    else if (s.phase === 'done') action = '基数排序完成';

    return {
      ...s,
      metrics: {
        exp: expName,
        'max-val': String(s.maxVal),
        'cur-elem': s.curElem !== null ? `${s.curElem} (d='${s.digit}')` : '—',
        'out-idx': s.outIdx >= 0 ? `${s.outIdx}` : '—',
        action,
      },
    };
  });
}
