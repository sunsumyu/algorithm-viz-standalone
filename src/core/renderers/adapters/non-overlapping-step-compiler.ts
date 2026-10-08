import { StepBase } from '../../step-visualizer';
import type { HighlightTarget } from '../../step-visualizer';

export interface NonOverlappingStep extends StepBase {
  intervals: Array<[number, number]>;
  currentIndex: number;
  removedCount: number;
  removedIndices: number[];
  keptIndices: number[];
  currentEnd: number;
  action: 'init' | 'sort' | 'keep' | 'remove' | 'done';
  message: string;
  codeLine: HighlightTarget;
  line?: number;
  metrics?: Record<string, string>;
  log?: string;
}

export const NON_OVERLAPPING_CODE_LINES: Record<string, HighlightTarget> = {
  guard: { java: 2, cpp: 4, python: 3, javascript: 2 },
  sort: { java: 4, cpp: 5, python: 5, javascript: 3 },
  keep: { java: 7, cpp: 10, python: 8, javascript: 6 },
  remove: { java: 8, cpp: 11, python: 9, javascript: 7 },
  done: { java: 13, cpp: 15, python: 11, javascript: 11 },
};

export function parseIntervals(raw: string): Array<[number, number]> {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((arr: [number, number]) => [arr[0], arr[1]] as [number, number]);
    }
  } catch {
    // fallback
  }
  return [[1, 2], [2, 3], [3, 4], [1, 3]];
}

function getLine(target: HighlightTarget): number {
  if (typeof target === 'number') return target;
  if (typeof target === 'object' && target !== null && 'java' in target) {
    const j = (target as any).java;
    if (typeof j === 'number') return j;
    if (j && typeof j.primary === 'number') return j.primary;
  }
  return 1;
}

function withMetrics(steps: NonOverlappingStep[]): NonOverlappingStep[] {
  return steps.map((s) => {
    const isRemove = s.action === 'remove';
    const isKeep = s.action === 'keep';

    let action = '🔍 初始化';
    if (isRemove) action = '🗑️ 发生重叠 (移除右界大者)';
    else if (isKeep) action = '✓ 无重叠 (保留)';
    else if (s.action === 'sort') action = '↕️ 排序 + 默认保留首区间';
    else if (s.action === 'done') action = '🏁 扫描完成';

    const cur = s.currentIndex >= 0 && s.currentIndex < s.intervals.length ? s.intervals[s.currentIndex] : null;

    return {
      ...s,
      line: getLine(s.codeLine),
      log: s.message,
      metrics: {
        'cur-interval': cur ? `[${cur[0]}, ${cur[1]}]` : '—',
        'cur-end': `x = ${s.currentEnd}`,
        'removed-count': `${s.removedCount} 个`,
        'kept-count': `${s.intervals.length - s.removedCount} 个`,
        action,
      },
    };
  });
}

export function buildNonOverlappingSteps(rawIntervals: Array<[number, number]>): NonOverlappingStep[] {
  const steps: NonOverlappingStep[] = [];
  const n = rawIntervals.length;

  if (n === 0) {
    steps.push({
      intervals: [],
      currentIndex: -1,
      removedCount: 0,
      removedIndices: [],
      keptIndices: [],
      currentEnd: 0,
      action: 'done',
      message: '输入为空，需移除区间数为 0',
      codeLine: NON_OVERLAPPING_CODE_LINES.guard,
    });
    return withMetrics(steps);
  }

  // 1. 按左边界升序排序
  const intervals = rawIntervals.map(([s, e]) => [s, e] as [number, number]).sort((a, b) => a[0] - b[0]);
  let count = 0;
  const removedIndices: number[] = [];
  const keptIndices: number[] = [0];

  steps.push({
    intervals: intervals.map(([s, e]) => [s, e]),
    currentIndex: 0,
    removedCount: 0,
    removedIndices: [],
    keptIndices: [0],
    currentEnd: intervals[0][1],
    action: 'sort',
    message: `第 1 步：按左边界升序排序：${intervals.map((i) => `[${i[0]},${i[1]}]`).join(', ')}，默认保留首个区间`,
    codeLine: NON_OVERLAPPING_CODE_LINES.sort,
  });

  for (let i = 1; i < n; i++) {
    const cur = intervals[i];
    const prevEnd = intervals[i - 1][1];

    if (cur[0] < prevEnd) {
      count++;
      removedIndices.push(i);
      intervals[i][1] = Math.min(prevEnd, cur[1]);

      steps.push({
        intervals: intervals.map(([s, e]) => [s, e]),
        currentIndex: i,
        removedCount: count,
        removedIndices: [...removedIndices],
        keptIndices: [...keptIndices],
        currentEnd: intervals[i][1],
        action: 'remove',
        message: `🗑️ 发生重叠！区间 [${i}]=[${cur[0]}, ${cur[1]}] 左端点 ${cur[0]} < 前界 ${prevEnd}，贪心移除右界较大者，累计移除 ${count} 个`,
        codeLine: NON_OVERLAPPING_CODE_LINES.remove,
      });
    } else {
      keptIndices.push(i);

      steps.push({
        intervals: intervals.map(([s, e]) => [s, e]),
        currentIndex: i,
        removedCount: count,
        removedIndices: [...removedIndices],
        keptIndices: [...keptIndices],
        currentEnd: cur[1],
        action: 'keep',
        message: `✓ 互不重叠！区间 [${i}]=[${cur[0]}, ${cur[1]}] 左端点 ${cur[0]} ≥ ${prevEnd}，安全保留`,
        codeLine: NON_OVERLAPPING_CODE_LINES.keep,
      });
    }
  }

  steps.push({
    intervals: intervals.map(([s, e]) => [s, e]),
    currentIndex: n - 1,
    removedCount: count,
    removedIndices: [...removedIndices],
    keptIndices: [...keptIndices],
    currentEnd: intervals[n - 1][1],
    action: 'done',
    message: `🎉 扫描完成！最少需要移除 ${count} 个区间，剩余 ${n - count} 个区间互不重叠`,
    codeLine: NON_OVERLAPPING_CODE_LINES.done,
  });

  return withMetrics(steps);
}
