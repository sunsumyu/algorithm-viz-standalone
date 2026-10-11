/**
 * 四数相加 II — 步进推演编译器
 * LeetCode 454：分组哈希 (2+2 拆分)
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface FourSumIIStep {
  a: number[];
  b: number[];
  c: number[];
  d: number[];
  phase: 'group1-init' | 'group1-add' | 'group2-init' | 'group2-search' | 'done';
  status: 'group1-init' | 'group1-add' | 'group2-init' | 'group2-search' | 'done';
  idxA: number;
  idxB: number;
  idxC: number;
  idxD: number;
  sumAB?: number;
  sumCD?: number;
  target?: number;
  increment: number;
  count: number;
  mapEntries: [number, number][];
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function buildFourSumIISteps(
  nums1: number[],
  nums2: number[],
  nums3: number[],
  nums4: number[]
): FourSumIIStep[] {
  const steps: FourSumIIStep[] = [];
  const map = new Map<number, number>();
  let count = 0;

  const lines = {
    group1Init: { java: 2, cpp: 4, python: 3, javascript: 2 },
    group1Add: { java: [4, 5, 6], cpp: [5, 6, 7], python: [4, 5, 6], javascript: [3, 4, 5] },
    group2Init: { java: 9, cpp: 10, python: 7, javascript: 8 },
    group2Search: { java: [10, 11], cpp: [12, 13, 14], python: [9, 10], javascript: [10, 11] },
    done: { java: 14, cpp: 18, python: 11, javascript: 14 },
  };

  // 1. Group 1 初始化
  steps.push({
    a: nums1,
    b: nums2,
    c: nums3,
    d: nums4,
    phase: 'group1-init',
    status: 'group1-init',
    idxA: -1,
    idxB: -1,
    idxC: -1,
    idxD: -1,
    increment: 0,
    count: 0,
    mapEntries: [],
    message: '初始化哈希表 Map，进入 Phase 1：统计 nums1 与 nums2 所有两数之和出现的频次。',
    log: 'Phase 1: 统计 A+B 频次',
    codeLine: lines.group1Init,
  });

  // Group 1: A + B
  for (let i = 0; i < nums1.length; i++) {
    for (let j = 0; j < nums2.length; j++) {
      const sumAB = nums1[i] + nums2[j];
      const prevFreq = map.get(sumAB) || 0;
      map.set(sumAB, prevFreq + 1);

      steps.push({
        a: nums1,
        b: nums2,
        c: nums3,
        d: nums4,
        phase: 'group1-add',
        status: 'group1-add',
        idxA: i,
        idxB: j,
        idxC: -1,
        idxD: -1,
        sumAB,
        increment: 0,
        count: 0,
        mapEntries: Array.from(map.entries()),
        message: `枚举 nums1[${i}] (${nums1[i]}) + nums2[${j}] (${nums2[j]}) = ${sumAB}。将和 ${sumAB} 存入 Map，频次更新为 ${map.get(sumAB)}。`,
        log: `A[${i}]+B[${j}] = ${sumAB} -> Map[${sumAB}] = ${map.get(sumAB)}`,
        codeLine: lines.group1Add,
      });
    }
  }

  // 2. Group 2 初始化
  steps.push({
    a: nums1,
    b: nums2,
    c: nums3,
    d: nums4,
    phase: 'group2-init',
    status: 'group2-init',
    idxA: -1,
    idxB: -1,
    idxC: -1,
    idxD: -1,
    increment: 0,
    count: 0,
    mapEntries: Array.from(map.entries()),
    message: '进入 Phase 2：遍历 nums3 与 nums4，寻找 0 - (c + d) 是否在 Map 中存在。',
    log: 'Phase 2: 查找 0 - (C+D)',
    codeLine: lines.group2Init,
  });

  // Group 2: C + D
  for (let k = 0; k < nums3.length; k++) {
    for (let l = 0; l < nums4.length; l++) {
      const sumCD = nums3[k] + nums4[l];
      const target = 0 - sumCD;
      const matched = map.get(target) || 0;
      count += matched;

      steps.push({
        a: nums1,
        b: nums2,
        c: nums3,
        d: nums4,
        phase: 'group2-search',
        status: 'group2-search',
        idxA: -1,
        idxB: -1,
        idxC: k,
        idxD: l,
        sumCD,
        target,
        increment: matched,
        count,
        mapEntries: Array.from(map.entries()),
        message:
          matched > 0
            ? `🎉 nums3[${k}] (${nums3[k]}) + nums4[${l}] (${nums4[l]}) = ${sumCD}，目标 target = 0 - (${sumCD}) = ${target}。在 Map 中找到匹配频次 ${matched} 次，累计 count += ${matched} (现为 ${count})。`
            : `nums3[${k}] (${nums3[k]}) + nums4[${l}] (${nums4[l]}) = ${sumCD}，目标 target = ${target} 未在 Map 中找到，继续扫描。`,
        log: `C[${k}]+D[${l}] = ${sumCD}, 找 ${target} -> 命中 +${matched} (总计: ${count})`,
        codeLine: lines.group2Search,
      });
    }
  }

  steps.push({
    a: nums1,
    b: nums2,
    c: nums3,
    d: nums4,
    phase: 'done',
    status: 'done',
    idxA: -1,
    idxB: -1,
    idxC: -1,
    idxD: -1,
    increment: 0,
    count,
    mapEntries: Array.from(map.entries()),
    message: `🎉 搜索完成！共找到 ${count} 个满足条件的四元组。`,
    log: `求解完成: 共 ${count} 个合法四元组`,
    codeLine: lines.done,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withFourSumIIMetrics(steps: FourSumIIStep[]): FourSumIIStep[] {
  return steps.map((s) => {
    return {
      ...s,
      metrics: {
        phase: s.phase.startsWith('group1') ? 'Group 1 (A+B)' : 'Group 2 (C+D)',
        target: s.target !== undefined ? String(s.target) : '—',
        inc: `+${s.increment}`,
        count: String(s.count),
      },
    };
  });
}
