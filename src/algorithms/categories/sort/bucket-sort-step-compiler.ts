export interface BucketStep {
  array: (number | null)[];
  buckets: number[][];
  minVal: number;
  maxVal: number;
  bucketCount: number;
  activeBucket: number;
  activeElem: number | null;
  gatherCount: number;
  phase: 'init' | 'find-minmax' | 'scatter' | 'sort-buckets' | 'gather' | 'done';
  status: 'init' | 'find-minmax' | 'scatter' | 'sort-buckets' | 'gather' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function bucketSortSteps(input: number[], bucketCount = 5): BucketStep[] {
  const steps: BucketStep[] = [];
  const array = [...input];
  const n = array.length;

  if (n === 0) {
    steps.push({
      array: [],
      buckets: Array.from({ length: bucketCount }, () => []),
      minVal: 0,
      maxVal: 0,
      bucketCount,
      activeBucket: -1,
      activeElem: null,
      gatherCount: 0,
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
  const buckets: number[][] = Array.from({ length: bucketCount }, () => []);

  steps.push({
    array: [...array],
    buckets: buckets.map((b) => [...b]),
    minVal,
    maxVal,
    bucketCount,
    activeBucket: -1,
    activeElem: null,
    gatherCount: 0,
    phase: 'find-minmax',
    status: 'find-minmax',
    message: `极值统计：min = ${minVal}, max = ${maxVal}。初始化 ${bucketCount} 个空桶容器。`,
    log: `极值 [${minVal}..${maxVal}], 创建 ${bucketCount} 个桶`,
    codeLine: [3, 4, 5, 6, 7],
  });

  if (minVal === maxVal) {
    steps.push({
      array: [...array],
      buckets: buckets.map((b) => [...b]),
      minVal,
      maxVal,
      bucketCount,
      activeBucket: -1,
      activeElem: null,
      gatherCount: n,
      phase: 'done',
      status: 'done',
      message: `所有元素完全相同 (${minVal})，无需额外分桶排序。`,
      log: '元素完全相同 -> 完成',
      codeLine: 5,
    });
    return steps;
  }

  // 1. Scatter 分桶
  for (let i = 0; i < n; i++) {
    const val = array[i];
    const bIdx = Math.floor(((val - minVal) * (bucketCount - 1)) / (maxVal - minVal));
    buckets[bIdx].push(val);

    steps.push({
      array: [...array],
      buckets: buckets.map((b) => [...b]),
      minVal,
      maxVal,
      bucketCount,
      activeBucket: bIdx,
      activeElem: val,
      gatherCount: 0,
      phase: 'scatter',
      status: 'scatter',
      message: `分桶映射：元素 arr[${i}] = ${val} 根据线性映射分配至桶 [${bIdx}]。`,
      log: `映射 val=${val} -> 桶 [${bIdx}]`,
      codeLine: [9, 10, 11, 12],
    });
  }

  // 2. Sort 桶内排序
  for (let b = 0; b < bucketCount; b++) {
    buckets[b].sort((x, y) => x - y);
  }

  steps.push({
    array: new Array(n).fill(null),
    buckets: buckets.map((b) => [...b]),
    minVal,
    maxVal,
    bucketCount,
    activeBucket: -1,
    activeElem: null,
    gatherCount: 0,
    phase: 'sort-buckets',
    status: 'sort-buckets',
    message: `桶内排序：已完成各个非空桶内部的单独排序。准备开始顺序归拢回填。`,
    log: `各桶内部排序完毕`,
    codeLine: 16,
  });

  // 3. Gather 归拢回填
  const outArr: (number | null)[] = new Array(n).fill(null);
  let writeIdx = 0;

  for (let b = 0; b < bucketCount; b++) {
    for (let k = 0; k < buckets[b].length; k++) {
      const val = buckets[b][k];
      outArr[writeIdx] = val;
      writeIdx++;

      steps.push({
        array: [...outArr],
        buckets: buckets.map((bkt) => [...bkt]),
        minVal,
        maxVal,
        bucketCount,
        activeBucket: b,
        activeElem: val,
        gatherCount: writeIdx,
        phase: 'gather',
        status: 'gather',
        message: `归拢回填：从桶 [${b}] 取出已排序项 ${val}，写入主数组下标 ${writeIdx - 1}。`,
        log: `归拢: 桶 [${b}] (${val}) -> arr[${writeIdx - 1}]`,
        codeLine: [14, 15, 16, 17, 18],
      });
    }
  }

  steps.push({
    array: [...outArr],
    buckets: buckets.map((b) => [...b]),
    minVal,
    maxVal,
    bucketCount,
    activeBucket: -1,
    activeElem: null,
    gatherCount: n,
    phase: 'done',
    status: 'done',
    message: `🎉 桶排序完成！最终输出数组：[${outArr.join(', ')}]。`,
    log: `✓ 排序完成: [${outArr.join(', ')}]`,
    codeLine: 19,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withMetrics(steps: BucketStep[]): BucketStep[] {
  return steps.map((s) => {
    let action = 'bIdx = (val - min) * (k - 1) / (max - min)';
    if (s.phase === 'scatter') {
      action = `bIdx = (${s.activeElem} - ${s.minVal}) * ${s.bucketCount - 1} / ${s.maxVal - s.minVal} = ${s.activeBucket}`;
    } else if (s.phase === 'sort-buckets') action = 'sort(bucket[0..k-1]) 桶内排序';
    else if (s.phase === 'gather') action = `arr[${s.gatherCount - 1}] = ${s.activeElem} (来自桶 [${s.activeBucket}])`;
    else if (s.phase === 'done') action = '桶排序完成';

    return {
      ...s,
      metrics: {
        range: `[${s.minVal}, ${s.maxVal}]`,
        'bucket-count': String(s.bucketCount),
        'cur-elem': s.activeElem !== null ? `${s.activeElem}` : '—',
        'gather-count': `${s.gatherCount} / ${s.array.length}`,
        action,
      },
    };
  });
}
