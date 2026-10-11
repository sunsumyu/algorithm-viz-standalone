/**
 * 两个数组的交集 — 步进推演编译器
 * LeetCode 349：哈希集合 HashSet
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface IntersectionStep {
  nums1: number[];
  nums2: number[];
  phase: 'build-set1' | 'scan-nums2' | 'done';
  idx1: number;
  idx2: number;
  currentVal: number | null;
  set1: number[];
  resultSet: number[];
  isHit: boolean;
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function parseNumArray(input: string, defaultArr: number[]): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr : defaultArr;
}

export function buildIntersectionSteps(nums1: number[], nums2: number[]): IntersectionStep[] {
  const steps: IntersectionStep[] = [];
  const set1 = new Set<number>();
  const resultSet = new Set<number>();

  const lines = {
    buildSet1: { java: [7, 8], cpp: 4, python: 3, javascript: 2 },
    scanMiss: { java: [10, 11], cpp: [6, 7], python: [5, 6], javascript: [4, 5] },
    scanHit: { java: [11, 12], cpp: [7, 8], python: [6, 7], javascript: [5, 6] },
    done: { java: 15, cpp: 11, python: 8, javascript: 9 },
  };

  // 1. 将 nums1 存入 set1
  for (let i = 0; i < nums1.length; i++) {
    const val = nums1[i];
    set1.add(val);

    steps.push({
      nums1,
      nums2,
      phase: 'build-set1',
      idx1: i,
      idx2: -1,
      currentVal: val,
      set1: Array.from(set1),
      resultSet: [],
      isHit: false,
      message: `遍历 nums1[${i}] = ${val}，将其存入集合 set1。set1 当前大小为 ${set1.size}。`,
      log: `set1.add(${val}) -> [${Array.from(set1).join(', ')}]`,
      codeLine: lines.buildSet1,
    });
  }

  // 2. 遍历 nums2 查询 set1
  for (let j = 0; j < nums2.length; j++) {
    const val = nums2[j];
    const hit = set1.has(val);
    if (hit) {
      resultSet.add(val);
    }

    steps.push({
      nums1,
      nums2,
      phase: 'scan-nums2',
      idx1: -1,
      idx2: j,
      currentVal: val,
      set1: Array.from(set1),
      resultSet: Array.from(resultSet),
      isHit: hit,
      message: hit
        ? `🎉 检查 nums2[${j}] = ${val}：在 set1 中存在！将其存入交集结果集 resultSet (现为 [${Array.from(resultSet).join(', ')}])。`
        : `检查 nums2[${j}] = ${val}：不在 set1 中，跳过。`,
      log: hit ? `✓ 命中交集: ${val}` : `比对 nums2[${j}]=${val} (未命中)`,
      codeLine: hit ? lines.scanHit : lines.scanMiss,
    });
  }

  steps.push({
    nums1,
    nums2,
    phase: 'done',
    idx1: -1,
    idx2: -1,
    currentVal: null,
    set1: Array.from(set1),
    resultSet: Array.from(resultSet),
    isHit: false,
    message: `🎉 交集求解完成！最终交集为 [${Array.from(resultSet).join(', ')}]。`,
    log: `求解完成: 交集共 ${resultSet.size} 个元素`,
    codeLine: lines.done,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withIntersectionMetrics(steps: IntersectionStep[]): IntersectionStep[] {
  return steps.map((s) => {
    let hit: string;
    if (s.phase === 'scan-nums2') {
      hit = s.isHit ? '✓ 命中' : '✗ 未命中';
    } else {
      hit = '—';
    }
    return {
      ...s,
      metrics: {
        phase:
          s.phase === 'build-set1' ? '构建 set1' : s.phase === 'scan-nums2' ? '遍历 nums2 匹配' : '完成',
        'cur-val': s.currentVal !== null ? String(s.currentVal) : '—',
        hit,
        'res-count': `${s.resultSet.length} 个`,
      },
    };
  });
}
