/**
 * 两数之和 — 步进推演编译器
 * LeetCode 1：哈希表一次遍历
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface TwoSumStep {
  array: number[];
  currentIndex: number;
  currentVal: number;
  complement: number;
  mapEntries: [number, number][]; // [key, value]
  matchedIndices: [number, number] | null;
  status: 'init' | 'check' | 'found' | 'insert' | 'not-found';
  result?: [number, number];
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function buildTwoSumSteps(nums: number[], target: number): TwoSumStep[] {
  const steps: TwoSumStep[] = [];
  const map = new Map<number, number>();

  const lines = {
    init: { java: 2, cpp: 4, python: 3, javascript: 2 },
    check: { java: [3, 4], cpp: [5, 6], python: [4, 5], javascript: [3, 4] },
    found: { java: [5, 6], cpp: [7, 8], python: [6, 7], javascript: [5, 6] },
    insert: { java: 8, cpp: 10, python: 8, javascript: 8 },
    notFound: { java: 10, cpp: 12, python: 9, javascript: 10 },
  };

  steps.push({
    array: [...nums],
    currentIndex: -1,
    currentVal: 0,
    complement: 0,
    mapEntries: [],
    matchedIndices: null,
    status: 'init',
    message: `初始化哈希表 Map，准备单次遍历寻找两数之和等于 target = ${target}。`,
    log: `初始化 HashMap，target = ${target}`,
    codeLine: lines.init,
  });

  for (let i = 0; i < nums.length; i++) {
    const cur = nums[i];
    const complement = target - cur;

    steps.push({
      array: [...nums],
      currentIndex: i,
      currentVal: cur,
      complement,
      mapEntries: Array.from(map.entries()),
      matchedIndices: null,
      status: 'check',
      message: `遍历到 i=${i} (nums[${i}]=${cur})，需要补数 complement = ${target} - ${cur} = ${complement}。查询哈希表中是否存在键 ${complement}。`,
      log: `i=${i}: nums[${i}]=${cur}, 查找补数 ${complement}`,
      codeLine: lines.check,
    });

    if (map.has(complement)) {
      const prevIdx = map.get(complement)!;
      steps.push({
        array: [...nums],
        currentIndex: i,
        currentVal: cur,
        complement,
        mapEntries: Array.from(map.entries()),
        matchedIndices: [prevIdx, i],
        status: 'found',
        result: [prevIdx, i],
        message: `🎉 在哈希表中找到补数 ${complement} (位于下标 ${prevIdx})！成功配对：nums[${prevIdx}] (${complement}) + nums[${i}] (${cur}) = ${target}。返回下标 [${prevIdx}, ${i}]。`,
        log: `✓ 命中！找到配对 [${prevIdx}, ${i}]`,
        codeLine: lines.found,
      });
      return steps;
    }

    map.set(cur, i);
    steps.push({
      array: [...nums],
      currentIndex: i,
      currentVal: cur,
      complement,
      mapEntries: Array.from(map.entries()),
      matchedIndices: null,
      status: 'insert',
      message: `哈希表中未找到 ${complement}，将当前键值对 (${cur} -> ${i}) 存入哈希表，继续向后扫描。`,
      log: `存入 HashMap: { ${cur} => ${i} }`,
      codeLine: lines.insert,
    });
  }

  steps.push({
    array: [...nums],
    currentIndex: nums.length,
    currentVal: 0,
    complement: 0,
    mapEntries: Array.from(map.entries()),
    matchedIndices: null,
    status: 'not-found',
    message: `遍历结束，未找到和为 ${target} 的两数对。`,
    log: `未找到有效解`,
    codeLine: lines.notFound,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withTwoSumMetrics(steps: TwoSumStep[], target: number): TwoSumStep[] {
  return steps.map((s) => {
    let action = '初始化 HashMap';
    if (s.status === 'check') action = `complement = ${target} - ${s.currentVal} = ${s.complement}`;
    else if (s.status === 'found') action = `命中: ${s.complement} + ${s.currentVal} = ${target}`;
    else if (s.status === 'insert') action = `map.put(${s.currentVal}, ${s.currentIndex})`;
    else if (s.status === 'not-found') action = '遍历结束，无解';

    return {
      ...s,
      metrics: {
        i: s.currentIndex >= 0 ? String(s.currentIndex) : '—',
        'cur-val': s.currentIndex >= 0 ? String(s.currentVal) : '—',
        comp: s.currentIndex >= 0 ? String(s.complement) : '—',
        status:
          s.status === 'found' ? '✓ 命中配对！' : s.status === 'check' ? '查找中...' : s.status === 'insert' ? '存入 Map' : '等待',
        action,
      },
    };
  });
}
