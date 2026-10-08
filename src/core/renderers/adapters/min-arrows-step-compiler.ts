import { StepBase } from '../../step-visualizer';
import type { HighlightTarget } from '../../step-visualizer';

export interface MAStep extends StepBase {
  balloons: Array<[number, number]>;
  currentIndex: number;
  arrowCount: number;
  arrowPositions: number[];
  overlapEnd: number;
  action: 'init' | 'sort' | 'new_arrow' | 'overlap' | 'done';
  message: string;
  decision?: string;
  codeLine: HighlightTarget;
  line?: number;
  metrics?: Record<string, string>;
  log?: string;
}

export const MIN_ARROWS_CODE_LINES: Record<string, HighlightTarget> = {
  guard: { java: 2, cpp: 4, python: 3, javascript: 2 },
  sort: { java: 4, cpp: 5, python: 5, javascript: 3 },
  newArrow: { java: 8, cpp: 11, python: 9, javascript: 7 },
  overlap: { java: 11, cpp: 13, python: 11, javascript: 9 },
  done: { java: 14, cpp: 16, python: 12, javascript: 12 },
};

export function parseBalloons(raw: string): Array<[number, number]> {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((arr: [number, number]) => [arr[0], arr[1]] as [number, number]);
    }
  } catch {
    // fall through to default
  }
  return [[10, 16], [2, 8], [1, 6], [7, 12]];
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

function withMetrics(steps: MAStep[]): MAStep[] {
  return steps.map((s) => {
    const curB = s.currentIndex >= 0 && s.currentIndex < s.balloons.length ? s.balloons[s.currentIndex] : null;
    const isNewArrow = s.action === 'new_arrow';
    const isOverlap = s.action === 'overlap';

    let action = '🔍 初始化排序';
    if (isNewArrow) action = '🏹 无交集 (新增 1 箭)';
    else if (isOverlap) action = '🎯 存在重叠 (同用 1 箭)';
    else if (s.action === 'sort') action = '🔀 左端点升序排序';
    else if (s.action === 'done') action = '🎉 完成';

    return {
      ...s,
      decision: s.decision ?? action,
      log: s.log ?? s.message,
      line: s.line ?? getLine(s.codeLine),
      metrics: {
        'cur-balloon': curB ? `[${curB[0]}, ${curB[1]}]` : '—',
        'overlap-end': `x = ${s.overlapEnd}`,
        arrows: `${s.arrowCount} 支`,
        'arrow-pos': `[${s.arrowPositions.join(', ')}]`,
        action,
      },
    };
  });
}

export function buildMinArrowsSteps(rawBalloons: Array<[number, number]>): MAStep[] {
  const steps: MAStep[] = [];
  const n = rawBalloons.length;
  const lines = MIN_ARROWS_CODE_LINES;

  if (n === 0) {
    steps.push({
      balloons: [],
      currentIndex: -1,
      arrowCount: 0,
      arrowPositions: [],
      overlapEnd: 0,
      action: 'done',
      message: '输入为空，所需弓箭数为 0',
      decision: '空输入',
      codeLine: lines.guard,
      line: getLine(lines.guard),
    });
    return withMetrics(steps);
  }

  // 1. 按左边界升序排序
  const points = rawBalloons.map(([s, e]) => [s, e] as [number, number]).sort((a, b) => a[0] - b[0]);
  let count = 1;
  const arrowPositions: number[] = [points[0][1]];

  steps.push({
    balloons: points.map(([s, e]) => [s, e]),
    currentIndex: 0,
    arrowCount: 1,
    arrowPositions: [...arrowPositions],
    overlapEnd: points[0][1],
    action: 'sort',
    message: `第 1 步：按左边界升序排序：${points.map((p) => `[${p[0]},${p[1]}]`).join(', ')}，第 1 支箭预定在 x=${points[0][1]}`,
    decision: '按左端点升序排序',
    codeLine: lines.sort,
    line: getLine(lines.sort),
  });

  for (let i = 1; i < n; i++) {
    const cur = points[i];
    const prevEnd = points[i - 1][1];

    if (cur[0] > prevEnd) {
      count++;
      arrowPositions.push(cur[1]);

      steps.push({
        balloons: points.map(([s, e]) => [s, e]),
        currentIndex: i,
        arrowCount: count,
        arrowPositions: [...arrowPositions],
        overlapEnd: cur[1],
        action: 'new_arrow',
        message: `🏹 气球 [${i}]=[${cur[0]}, ${cur[1]}] 左端点 ${cur[0]} > 前组右端点 ${prevEnd}，无重叠，增加第 ${count} 支箭 (x=${cur[1]})`,
        decision: `无重叠新增第 ${count} 支箭`,
        codeLine: lines.newArrow,
        line: getLine(lines.newArrow),
      });
    } else {
      points[i][1] = Math.min(prevEnd, cur[1]);
      arrowPositions[arrowPositions.length - 1] = points[i][1];

      steps.push({
        balloons: points.map(([s, e]) => [s, e]),
        currentIndex: i,
        arrowCount: count,
        arrowPositions: [...arrowPositions],
        overlapEnd: points[i][1],
        action: 'overlap',
        message: `🎯 气球 [${i}] 与前组重叠 (左界 ${cur[0]} <= ${prevEnd})！同用一支箭，收紧重叠右界至 x=${points[i][1]}`,
        decision: `重叠共用并收紧右界至 ${points[i][1]}`,
        codeLine: lines.overlap,
        line: getLine(lines.overlap),
      });
    }
  }

  steps.push({
    balloons: points.map(([s, e]) => [s, e]),
    currentIndex: n - 1,
    arrowCount: count,
    arrowPositions: [...arrowPositions],
    overlapEnd: points[n - 1][1],
    action: 'done',
    message: `🎉 扫描完成！引爆全部 ${n} 个气球最少需要 ${count} 支箭 (射箭坐标: ${arrowPositions.join(', ')})`,
    decision: '引爆全部气球完成',
    codeLine: lines.done,
    line: getLine(lines.done),
  });

  return withMetrics(steps);
}
