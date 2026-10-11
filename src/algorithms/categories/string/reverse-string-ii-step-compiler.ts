/**
 * 反转字符串 II — 步进推演编译器
 * LeetCode 541：每 2k 步长反转前 k 个字符
 */

import { HighlightTarget } from '../../../core/code-panel';

export const REVERSE_STRING_II_CODE_LINES: Record<string, Record<string, number | number[]>> = {
  init: { java: 2, cpp: 4, python: 3, javascript: 2 },
  select: { java: [3, 4, 5], cpp: 5, python: 4, javascript: [3, 4, 5] },
  swap: { java: [7, 8, 9], cpp: [8, 9], python: 5, javascript: [7, 8, 9] },
  done: { java: 14, cpp: 13, python: 6, javascript: 14 },
};

const lines = REVERSE_STRING_II_CODE_LINES;

export interface ReverseStringIIStep {
  s: string[];
  i: number;
  k: number;
  chunkEnd: number;
  windowStart: number;
  windowEnd: number;
  left: number;
  right: number;
  swapping: boolean;
  phase: 'init' | 'select-chunk' | 'swap' | 'advance' | 'done';
  status: 'init' | 'select-chunk' | 'swap' | 'advance' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function buildReverseStringIISteps(inputStr: string, k: number): ReverseStringIIStep[] {
  const steps: ReverseStringIIStep[] = [];
  const s = inputStr.split('');
  const n = s.length;
  const safeK = Math.max(1, k);

  steps.push({
    s: [...s],
    i: 0,
    k: safeK,
    chunkEnd: Math.min(n - 1, 2 * safeK - 1),
    windowStart: 0,
    windowEnd: Math.min(n - 1, safeK - 1),
    left: -1,
    right: -1,
    swapping: false,
    phase: 'init',
    status: 'init',
    message: `初始化分段反转：字符串长度 n = ${n}，参数 k = ${safeK}，步长 2k = ${2 * safeK}。`,
    log: `开始 2k 分段反转 (n=${n}, k=${safeK})`,
    codeLine: lines.init,
  });

  for (let i = 0; i < n; i += 2 * safeK) {
    const chunkEnd = Math.min(n - 1, i + 2 * safeK - 1);
    let left = i;
    let right = Math.min(n - 1, i + safeK - 1);
    const windowStart = left;
    const windowEnd = right;

    steps.push({
      s: [...s],
      i,
      k: safeK,
      chunkEnd,
      windowStart,
      windowEnd,
      left,
      right,
      swapping: false,
      phase: 'select-chunk',
      status: 'select-chunk',
      message: `处理第 [${i}, ${chunkEnd}] 分段：待反转区间为 [${left}, ${right}] (right = min(${n - 1}, ${i + safeK - 1}))。`,
      log: `分段 i=${i}: 锁定待反转区间 [${left}, ${right}]`,
      codeLine: lines.select,
    });

    while (left < right) {
      const temp = s[left];
      s[left] = s[right];
      s[right] = temp;

      steps.push({
        s: [...s],
        i,
        k: safeK,
        chunkEnd,
        windowStart,
        windowEnd,
        left,
        right,
        swapping: true,
        phase: 'swap',
        status: 'swap',
        message: `交换字符：s[${left}] <-> s[${right}] ('${temp}' <-> '${s[left]}')。`,
        log: `交换 s[${left}] <-> s[${right}]`,
        codeLine: lines.swap,
      });

      left++;
      right--;
    }
  }

  steps.push({
    s: [...s],
    i: n,
    k: safeK,
    chunkEnd: n - 1,
    windowStart: -1,
    windowEnd: -1,
    left: -1,
    right: -1,
    swapping: false,
    phase: 'done',
    status: 'done',
    message: `🎉 分段反转全部完成！最终字符串为 "${s.join('')}"。`,
    log: `✓ 处理完成: "${s.join('')}"`,
    codeLine: lines.done,
  });

  return steps;
}

export function withMetrics(steps: ReverseStringIIStep[]): ReverseStringIIStep[] {
  const phaseMap: Record<string, string> = {
    init: '初始化',
    'select-chunk': '分段锁定',
    swap: '交换中',
    advance: '步进',
    done: '处理完成',
  };
  return steps.map((step) => {
    let action = 'right = min(n - 1, i + k - 1)';
    if (step.windowStart >= 0 && step.windowEnd >= 0 && step.phase !== 'done') {
      action = `right = min(${step.s.length - 1}, ${step.i} + ${step.k} - 1) = ${step.windowEnd}`;
    } else if (step.phase === 'done') {
      action = '分段反转完成';
    }

    return {
      ...step,
      metrics: {
        i: step.phase === 'done' ? '—' : String(step.i),
        window:
          step.windowStart >= 0 && step.windowEnd >= 0 && step.phase !== 'done'
            ? `[${step.windowStart}, ${step.windowEnd}]`
            : '—',
        k: `${step.k} / ${2 * step.k}`,
        phase: phaseMap[step.phase] || step.phase,
        action,
      },
    };
  });
}
