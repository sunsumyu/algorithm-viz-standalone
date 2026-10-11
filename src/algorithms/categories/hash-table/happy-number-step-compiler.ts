/**
 * 快乐数 — 步进推演编译器
 * LeetCode 202：HashSet 判环
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface HappyNumberStep {
  n: number;
  nextN: number;
  formula: string;
  seen: number[];
  cycleNode: number | null;
  status: 'init' | 'compute' | 'check' | 'happy' | 'cycle';
  isHappy: boolean;
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function getNextSquareSum(n: number): { sum: number; formula: string } {
  let sum = 0;
  let temp = n;
  const parts: string[] = [];

  while (temp > 0) {
    const d = temp % 10;
    sum += d * d;
    parts.unshift(`${d}²`);
    temp = Math.floor(temp / 10);
  }

  const formula = parts.join(' + ') + ` = ${sum}`;
  return { sum, formula };
}

export function buildHappyNumberSteps(initialN: number): HappyNumberStep[] {
  const steps: HappyNumberStep[] = [];
  const seen = new Set<number>();
  let cur = initialN;

  const lines = {
    init: { java: 2, cpp: 4, python: 3, javascript: 2 },
    compute: { java: [4, 5], cpp: [6, 7], python: [5, 6], javascript: [13, 14] },
    happy: { java: 7, cpp: 9, python: 7, javascript: 16 },
    cycle: { java: 7, cpp: 9, python: 7, javascript: 16 },
  };

  steps.push({
    n: cur,
    nextN: cur,
    formula: '',
    seen: [],
    cycleNode: null,
    status: 'init',
    isHappy: false,
    message: `初始数字 n = ${cur}，初始化空哈希集合 HashSet seen。`,
    log: `开始计算 n = ${cur}`,
    codeLine: lines.init,
  });

  while (cur !== 1 && !seen.has(cur)) {
    const { sum, formula } = getNextSquareSum(cur);
    seen.add(cur);

    steps.push({
      n: cur,
      nextN: sum,
      formula,
      seen: Array.from(seen),
      cycleNode: null,
      status: 'compute',
      isHappy: false,
      message: `将 ${cur} 加入 seen 集合。计算各位平方和: ${formula}。`,
      log: `${cur} -> ${formula}`,
      codeLine: lines.compute,
    });

    cur = sum;
  }

  if (cur === 1) {
    steps.push({
      n: 1,
      nextN: 1,
      formula: '1² = 1',
      seen: Array.from(seen),
      cycleNode: null,
      status: 'happy',
      isHappy: true,
      message: `🎉 平方和收敛到 1！数字 ${initialN} 是快乐数，返回 true。`,
      log: `✓ 收敛到 1，是快乐数！`,
      codeLine: lines.happy,
    });
  } else {
    steps.push({
      n: cur,
      nextN: cur,
      formula: `已存在于 HashSet 中`,
      seen: Array.from(seen),
      cycleNode: cur,
      status: 'cycle',
      isHappy: false,
      message: `⚠️ 检测到死循环！数字 ${cur} 之前已经在 seen 集合中出现过，陷入死循环，不是快乐数，返回 false。`,
      log: `✗ 检测到循环节点 ${cur}，返回 false`,
      codeLine: lines.cycle,
    });
  }

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withHappyNumberMetrics(steps: HappyNumberStep[]): HappyNumberStep[] {
  return steps.map((s) => {
    let res: string;
    if (s.status === 'happy') {
      res = '✓ 快乐数';
    } else if (s.status === 'cycle') {
      res = '✗ 死循环';
    } else {
      res = '计算中...';
    }
    return {
      ...s,
      metrics: {
        n: String(s.n),
        next: String(s.nextN),
        'set-size': `${s.seen.length} 个`,
        res,
      },
    };
  });
}
