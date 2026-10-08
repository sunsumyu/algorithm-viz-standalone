import { StepBase } from '../../step-visualizer';
import type { HighlightTarget } from '../../step-visualizer';

export interface CandyStep extends StepBase {
  ratings: number[];
  candies: number[];
  currentIndex: number;
  direction: 'left-to-right' | 'right-to-left' | 'init' | 'done';
  action: 'init' | 'inc_right' | 'keep_right' | 'inc_left' | 'keep_left' | 'done';
  message: string;
  decision?: string;
  codeLine: HighlightTarget;
  line?: number;
  metrics?: Record<string, string>;
  log?: string;
}

export const CANDY_CODE_LINES: Record<string, HighlightTarget> = {
  guard: { java: 2, cpp: 4, python: 3, javascript: 2 },
  init: { java: 3, cpp: 4, python: 3, javascript: 2 },
  keepRight: { java: 6, cpp: 6, python: 6, javascript: 4 },
  incRight: { java: 7, cpp: 7, python: 7, javascript: 5 },
  keepLeft: { java: 12, cpp: 11, python: 10, javascript: 9 },
  incLeft: { java: 13, cpp: 12, python: 11, javascript: 10 },
  done: { java: 17, cpp: 17, python: 12, javascript: 13 },
};

function getLine(target: HighlightTarget): number {
  if (typeof target === 'number') return target;
  if (typeof target === 'object' && target !== null && 'java' in target) {
    const j = (target as any).java;
    if (typeof j === 'number') return j;
    if (j && typeof j.primary === 'number') return j.primary;
  }
  return 1;
}

function withMetrics(steps: CandyStep[]): CandyStep[] {
  return steps.map((s) => {
    const total = s.candies.reduce((acc, v) => acc + v, 0);
    const idx = s.currentIndex;
    const isIncR = s.action === 'inc_right';
    const isIncL = s.action === 'inc_left';

    let action = '⏩ 评分不高于相邻 (保持)';
    if (isIncR) action = '📈 右孩子评分高 (+1 奖励)';
    else if (isIncL) action = '📉 左孩子评分高 (取 max 奖励)';
    else if (s.action === 'done') action = '✓ 完成';

    const phaseText =
      s.direction === 'left-to-right' ? '➡️ 从左到右 (右 > 左 递增)'
      : s.direction === 'right-to-left' ? '⬅️ 从右到左 (左 > 右 取 max)'
      : s.direction === 'done' ? '✓ 完成' : '初始化';

    return {
      ...s,
      decision: s.decision ?? action,
      log: s.log ?? s.message,
      line: s.line ?? getLine(s.codeLine),
      metrics: {
        phase: phaseText,
        'cur-child': idx >= 0 ? `[${idx}] (评分: ${s.ratings[idx]}, ${s.candies[idx]} 颗)` : '—',
        total: `${total} 颗`,
        candies: `[${s.candies.join(', ')}]`,
        action,
      },
    };
  });
}

export function buildCandySteps(rawRatings: number[]): CandyStep[] {
  const steps: CandyStep[] = [];
  const n = rawRatings.length;
  const lines = CANDY_CODE_LINES;

  if (n === 0) {
    steps.push({
      ratings: [],
      candies: [],
      currentIndex: -1,
      direction: 'done',
      action: 'done',
      message: '输入为空，最少糖果数为 0',
      decision: '空输入',
      codeLine: lines.guard,
      line: getLine(lines.guard),
    });
    return withMetrics(steps);
  }

  const candies = new Array(n).fill(1);

  steps.push({
    ratings: [...rawRatings],
    candies: [...candies],
    currentIndex: -1,
    direction: 'init',
    action: 'init',
    message: `第 1 步：初始化全部 ${n} 个孩子糖果数为 1 (每人至少 1 颗)`,
    decision: '每人至少 1 颗初始化',
    codeLine: lines.init,
    line: getLine(lines.init),
  });

  // 1. 从左向右遍历（右孩子评分 > 左孩子评分）
  for (let i = 1; i < n; i++) {
    const prev = rawRatings[i - 1];
    const cur = rawRatings[i];

    if (cur > prev) {
      candies[i] = candies[i - 1] + 1;
      steps.push({
        ratings: [...rawRatings],
        candies: [...candies],
        currentIndex: i,
        direction: 'left-to-right',
        action: 'inc_right',
        message: `📈 [左 → 右] 孩子 [${i}] 评分 ${cur} > 左边 [${i - 1}] 评分 ${prev}，糖果递增为 ${candies[i]} (= ${candies[i - 1]} + 1)`,
        decision: `右孩子评分高增加至 ${candies[i]}`,
        codeLine: lines.incRight,
        line: getLine(lines.incRight),
      });
    } else {
      steps.push({
        ratings: [...rawRatings],
        candies: [...candies],
        currentIndex: i,
        direction: 'left-to-right',
        action: 'keep_right',
        message: `⏩ [左 → 右] 孩子 [${i}] 评分 ${cur} <= 左边 ${prev}，保持糖果数 ${candies[i]}`,
        decision: '保持糖果数',
        codeLine: lines.keepRight,
        line: getLine(lines.keepRight),
      });
    }
  }

  // 2. 从右向左遍历（左孩子评分 > 右孩子评分，取 max）
  for (let i = n - 2; i >= 0; i--) {
    const cur = rawRatings[i];
    const next = rawRatings[i + 1];

    if (cur > next) {
      const oldVal = candies[i];
      candies[i] = Math.max(candies[i], candies[i + 1] + 1);

      steps.push({
        ratings: [...rawRatings],
        candies: [...candies],
        currentIndex: i,
        direction: 'right-to-left',
        action: candies[i] > oldVal ? 'inc_left' : 'keep_left',
        message: `📉 [右 → 左] 孩子 [${i}] 评分 ${cur} > 右边 [${i + 1}] 评分 ${next}，糖果取 max(${oldVal}, ${candies[i + 1] + 1}) = ${candies[i]}`,
        decision: `左孩子评分高取 max 更新为 ${candies[i]}`,
        codeLine: lines.incLeft,
        line: getLine(lines.incLeft),
      });
    } else {
      steps.push({
        ratings: [...rawRatings],
        candies: [...candies],
        currentIndex: i,
        direction: 'right-to-left',
        action: 'keep_left',
        message: `⏩ [右 → 左] 孩子 [${i}] 评分 ${cur} <= 右边 ${next}，保持糖果数 ${candies[i]}`,
        decision: '保持糖果数',
        codeLine: lines.keepLeft,
        line: getLine(lines.keepLeft),
      });
    }
  }

  const total = candies.reduce((acc, v) => acc + v, 0);

  steps.push({
    ratings: [...rawRatings],
    candies: [...candies],
    currentIndex: -1,
    direction: 'done',
    action: 'done',
    message: `🎉 分发完成！双向贪心满足所有相邻约束，所需最少糖果总数为 ${total} 颗：[${candies.join(', ')}]`,
    decision: '分发完成',
    codeLine: lines.done,
    line: getLine(lines.done),
  });

  return withMetrics(steps);
}
