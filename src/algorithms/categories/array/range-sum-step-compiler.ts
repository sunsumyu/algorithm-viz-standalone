/**
 * 区间和（前缀和）— 步进推演编译器
 * KamaCoder 58：一维前缀和预处理与 O(1) 差分查询
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface RSumStep {
  arr: number[];
  prefix: number[];
  queries: [number, number][];
  qIndex: number;
  phase: 'build' | 'query';
  i: number;
  L: number;
  R: number;
  sum: number;
  results: number[];
  status: 'init' | 'build-prefix' | 'query-start' | 'compute' | 'query-done' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
}

export function parseRangeArray(input: string): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr : [1, 2, 3, 4, 5];
}

export function parseQueries(input: string): [number, number][] {
  const parts = input
    .split(/[|；;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const res: [number, number][] = [];
  for (const p of parts) {
    const [lStr, rStr] = p.split(/[,，\s]+/);
    const l = parseInt(lStr, 10);
    const r = parseInt(rStr, 10);
    if (Number.isFinite(l) && Number.isFinite(r)) {
      res.push([Math.min(l, r), Math.max(l, r)]);
    }
  }
  return res.length > 0 ? res : [[0, 2], [1, 3], [2, 4]];
}

export function buildRangeSumSteps(arr: number[], queries: [number, number][]): RSumStep[] {
  const steps: RSumStep[] = [];
  const n = arr.length;
  const prefix: number[] = new Array(n + 1).fill(0);
  const results: number[] = [];

  const lines = {
    init: { java: [3, 4], cpp: 5, python: [3, 4], javascript: 3 },
    buildPrefix: { java: [5, 6], cpp: [6, 7], python: [5, 6], javascript: [4, 5] },
    query: { java: [10, 11], cpp: [11, 12], python: [8, 9], javascript: [8, 9] },
    done: { java: 13, cpp: 14, python: 10, javascript: 11 },
  };

  // 1. 初始化
  steps.push({
    arr: [...arr],
    prefix: [0],
    queries,
    qIndex: -1,
    phase: 'build',
    i: -1,
    L: -1,
    R: -1,
    sum: 0,
    results: [],
    status: 'init',
    message: `初始化前缀和数组 prefix，设置 prefix[0] = 0 作为虚拟前置元素。`,
    log: `初始化: prefix[0] = 0`,
    codeLine: lines.init,
  });

  // 2. 构建前缀和数组
  for (let i = 0; i < n; i++) {
    prefix[i + 1] = prefix[i] + arr[i];
    steps.push({
      arr: [...arr],
      prefix: prefix.slice(0, i + 2),
      queries,
      qIndex: -1,
      phase: 'build',
      i,
      L: -1,
      R: -1,
      sum: prefix[i + 1],
      results: [],
      status: 'build-prefix',
      message: `计算前缀和 prefix[${i + 1}] = prefix[${i}] (${prefix[i]}) + arr[${i}] (${arr[i]}) = ${prefix[i + 1]}。`,
      log: `构建前缀和: prefix[${i + 1}] = ${prefix[i + 1]}`,
      codeLine: lines.buildPrefix,
    });
  }

  // 3. 执行区间查询
  for (let q = 0; q < queries.length; q++) {
    const [L, R] = queries[q];
    const validL = Math.max(0, Math.min(n - 1, L));
    const validR = Math.max(validL, Math.min(n - 1, R));
    const ans = prefix[validR + 1] - prefix[validL];
    results.push(ans);

    steps.push({
      arr: [...arr],
      prefix: [...prefix],
      queries,
      qIndex: q,
      phase: 'query',
      i: -1,
      L: validL,
      R: validR,
      sum: ans,
      results: [...results],
      status: 'compute',
      message: `区间查询 [${validL}, ${validR}]：sum = prefix[${validR + 1}] (${prefix[validR + 1]}) - prefix[${validL}] (${prefix[validL]}) = ${ans}。`,
      log: `查询 [${validL}, ${validR}]: prefix[${validR + 1}] - prefix[${validL}] = ${ans}`,
      codeLine: lines.query,
    });
  }

  steps.push({
    arr: [...arr],
    prefix: [...prefix],
    queries,
    qIndex: queries.length,
    phase: 'query',
    i: -1,
    L: -1,
    R: -1,
    sum: 0,
    results: [...results],
    status: 'done',
    message: `🎉 所有区间查询计算完毕！最终查询结果序列: [${results.join(', ')}]。`,
    log: `✓ 查询完成: [${results.join(', ')}]`,
    codeLine: lines.done,
  });

  return steps;
}
