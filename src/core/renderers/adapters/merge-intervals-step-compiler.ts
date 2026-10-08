import { StepBase } from '../../step-visualizer';
import type { HighlightTarget } from '../../step-visualizer';

export interface MergeStep extends StepBase {
  intervals: Array<[number, number]>;
  result: Array<[number, number]>;
  currentIndex: number;
  action: 'init' | 'sort' | 'merge' | 'append' | 'done';
  message: string;
  codeLine: HighlightTarget;
  line?: number;
  metrics?: Record<string, string>;
  log?: string;
}

export const MERGE_INTERVALS_CODE_LINES: Record<string, HighlightTarget> = {
  guard: { java: 2, cpp: 4, python: 3, javascript: 2 },
  sort: { java: 4, cpp: 5, python: 5, javascript: 3 },
  merge: { java: 11, cpp: 10, python: 10, javascript: 8 },
  append: { java: 13, cpp: 12, python: 12, javascript: 10 },
  done: { java: 16, cpp: 15, python: 13, javascript: 13 },
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
  return [
    [1, 3],
    [2, 6],
    [8, 10],
    [15, 18],
  ];
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

function withMetrics(steps: MergeStep[]): MergeStep[] {
  return steps.map((s) => {
    const isMerge = s.action === 'merge';
    const isAppend = s.action === 'append';

    let action = '🔍 初始化';
    if (isMerge) action = '🧩 发生重叠 (合并扩界)';
    else if (isAppend) action = '➕ 无重叠 (追加新区间)';
    else if (s.action === 'sort') action = '↕️ 排序 + 放入首区间';
    else if (s.action === 'done') action = '🏁 合并完成';

    const cur = s.currentIndex >= 0 && s.currentIndex < s.intervals.length ? s.intervals[s.currentIndex] : null;
    const last = s.result.length ? s.result[s.result.length - 1] : null;

    return {
      ...s,
      line: getLine(s.codeLine),
      log: s.message,
      metrics: {
        'cur-interval': cur ? `[${cur[0]}, ${cur[1]}]` : '—',
        'last-interval': last ? `[${last[0]}, ${last[1]}]` : '—',
        'merged-count': `${s.result.length} 个`,
        'merged-list': s.result.map((i) => `[${i[0]},${i[1]}]`).join(', ') || '—',
        action,
      },
    };
  });
}

export function buildMergeIntervalsSteps(rawIntervals: Array<[number, number]>): MergeStep[] {
  const steps: MergeStep[] = [];
  const n = rawIntervals.length;

  if (n === 0) {
    steps.push({
      intervals: [],
      result: [],
      currentIndex: -1,
      action: 'done',
      message: '输入为空，返回空数组',
      codeLine: MERGE_INTERVALS_CODE_LINES.guard,
    });
    return withMetrics(steps);
  }

  // 1. 按左边界升序排序
  const intervals = rawIntervals.map(([s, e]) => [s, e] as [number, number]).sort((a, b) => a[0] - b[0]);
  const result: Array<[number, number]> = [[intervals[0][0], intervals[0][1]]];

  steps.push({
    intervals: intervals.map(([s, e]) => [s, e]),
    result: result.map(([s, e]) => [s, e]),
    currentIndex: 0,
    action: 'sort',
    message: `第 1 步：按左边界升序排序：${intervals.map((i) => `[${i[0]},${i[1]}]`).join(', ')}，将首个区间 [${intervals[0][0]}, ${intervals[0][1]}] 放入结果集`,
    codeLine: MERGE_INTERVALS_CODE_LINES.sort,
  });

  for (let i = 1; i < n; i++) {
    const cur = intervals[i];
    const last = result[result.length - 1];

    if (cur[0] <= last[1]) {
      const oldEnd = last[1];
      last[1] = Math.max(last[1], cur[1]);

      steps.push({
        intervals: intervals.map(([s, e]) => [s, e]),
        result: result.map(([s, e]) => [s, e]),
        currentIndex: i,
        action: 'merge',
        message: `🧩 发生重叠！区间 [${i}]=[${cur[0]}, ${cur[1]}] 左端点 ${cur[0]} ≤ 末尾右界 ${oldEnd}，贪心扩展右界至 max(${oldEnd}, ${cur[1]}) = ${last[1]}`,
        codeLine: MERGE_INTERVALS_CODE_LINES.merge,
      });
    } else {
      result.push([cur[0], cur[1]]);

      steps.push({
        intervals: intervals.map(([s, e]) => [s, e]),
        result: result.map(([s, e]) => [s, e]),
        currentIndex: i,
        action: 'append',
        message: `➕ 不重叠！区间 [${i}]=[${cur[0]}, ${cur[1]}] 左端点 ${cur[0]} > 末尾右界 ${last[1]}，直接追加到结果集`,
        codeLine: MERGE_INTERVALS_CODE_LINES.append,
      });
    }
  }

  steps.push({
    intervals: intervals.map(([s, e]) => [s, e]),
    result: result.map(([s, e]) => [s, e]),
    currentIndex: n - 1,
    action: 'done',
    message: `🎉 合并完成！原始 ${n} 个区间最终合并为 ${result.length} 个不重叠区间：${result.map((i) => `[${i[0]},${i[1]}]`).join(', ')}`,
    codeLine: MERGE_INTERVALS_CODE_LINES.done,
  });

  return withMetrics(steps);
}
