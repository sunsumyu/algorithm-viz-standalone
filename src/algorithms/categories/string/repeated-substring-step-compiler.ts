/**
 * 重复的子字符串 — 步进推演编译器
 * LeetCode 459：KMP 前缀表周期性整除推导
 */

import { HighlightTarget } from '../../../core/code-panel';
import { computeNextArray } from './implement-str-str-step-compiler';

export const REPEATED_SUBSTRING_CODE_LINES: Record<string, Record<string, number | number[]>> = {
  short: { java: 2, cpp: 4, python: 5, javascript: 2 },
  init: { java: [3, 4], cpp: [5, 6], python: [4, 6], javascript: [2, 3] },
  computeNext: { java: 7, cpp: 8, python: 14, javascript: 9 },
  checkPeriod: { java: 9, cpp: 9, python: 15, javascript: 10 },
  found: { java: 10, cpp: 10, python: 16, javascript: 11 },
  notFound: { java: 10, cpp: 10, python: 16, javascript: 11 },
};

const lines = REPEATED_SUBSTRING_CODE_LINES;

export interface RPSStep {
  s: string;
  next: number[];
  n: number;
  maxLPS: number;
  patternLen: number;
  patternStr: string;
  isRepeated: boolean;
  tiles: string[];
  phase: 'init' | 'compute-next' | 'check-period' | 'found' | 'not-found';
  status: 'init' | 'compute-next' | 'check-period' | 'found' | 'not-found';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function buildRPSSteps(s: string): RPSStep[] {
  const steps: RPSStep[] = [];
  const n = s.length;

  if (n <= 1) {
    steps.push({
      s,
      next: n === 1 ? [0] : [],
      n,
      maxLPS: 0,
      patternLen: n,
      patternStr: s,
      isRepeated: false,
      tiles: [s],
      phase: 'not-found',
      status: 'not-found',
      message: `字符串长度为 ${n} &le; 1，无法由子串重复构成，直接返回 false。`,
      log: `长度不足 2 -> false`,
      codeLine: lines.short,
    });
    return steps;
  }

  const next = computeNextArray(s);
  const maxLPS = next[n - 1];
  const patternLen = n - maxLPS;
  const patternStr = s.substring(0, patternLen);
  const isDivisible = maxLPS > 0 && n % patternLen === 0;

  steps.push({
    s,
    next,
    n,
    maxLPS: 0,
    patternLen: 0,
    patternStr: '',
    isRepeated: false,
    tiles: [],
    phase: 'init',
    status: 'init',
    message: `初始化分析：字符串 "${s}" (长度 n = ${n})。构建 KMP 前缀表 next。`,
    log: `初始化字符串 "${s}" (n=${n})`,
    codeLine: lines.init,
  });

  steps.push({
    s,
    next,
    n,
    maxLPS,
    patternLen: 0,
    patternStr: '',
    isRepeated: false,
    tiles: [],
    phase: 'compute-next',
    status: 'compute-next',
    message: `计算得到前缀表 next = [${next.join(', ')}]。末尾项 next[${n - 1}] = ${maxLPS}，表示最长相等前后缀长度为 ${maxLPS}。`,
    log: `next[${n - 1}] = ${maxLPS} (最长相等前后缀)`,
    codeLine: lines.computeNext,
  });

  steps.push({
    s,
    next,
    n,
    maxLPS,
    patternLen,
    patternStr,
    isRepeated: false,
    tiles: [],
    phase: 'check-period',
    status: 'check-period',
    message: `计算潜在最小重复子串周期：patternLen = n - next[n - 1] = ${n} - ${maxLPS} = ${patternLen}。候选子串为 "${patternStr}"。`,
    log: `计算周期: patternLen = ${n} - ${maxLPS} = ${patternLen} ("${patternStr}")`,
    codeLine: lines.checkPeriod,
  });

  const repeatCount = Math.floor(n / patternLen);
  const tiles: string[] = [];
  for (let k = 0; k < repeatCount; k++) {
    tiles.push(patternStr);
  }

  if (isDivisible) {
    steps.push({
      s,
      next,
      n,
      maxLPS,
      patternLen,
      patternStr,
      isRepeated: true,
      tiles,
      phase: 'found',
      status: 'found',
      message: `🎉 判定成功！maxLPS(${maxLPS}) > 0 且 ${n} % ${patternLen} == 0 (整除)。字符串可由子串 "${patternStr}" 重复 ${repeatCount} 次构成，返回 true。`,
      log: `✓ 成功: "${patternStr}" 重复 ${repeatCount} 次 -> true`,
      codeLine: lines.found,
    });
  } else {
    steps.push({
      s,
      next,
      n,
      maxLPS,
      patternLen,
      patternStr,
      isRepeated: false,
      tiles: [],
      phase: 'not-found',
      status: 'not-found',
      message: `⚠️ 判定失败！maxLPS = ${maxLPS}，${n} % ${patternLen} = ${n % patternLen} != 0 (不能整除)。无法由重复子串构成，返回 false。`,
      log: `✗ 不能整除 (${n} % ${patternLen} != 0) -> false`,
      codeLine: lines.notFound,
    });
  }

  return steps;
}

export function withMetrics(steps: RPSStep[]): RPSStep[] {
  return steps.map((s) => {
    const action =
      s.patternLen > 0
        ? `${s.n} % (${s.n} - ${s.maxLPS}) = ${s.n % s.patternLen} ${
            s.isRepeated ? '== 0 (整除)' : '!= 0 (不整除)'
          }`
        : 'n % (n - next[n-1]) == 0';

    return {
      ...s,
      metrics: {
        n: String(s.n),
        lps: s.phase !== 'init' ? String(s.maxLPS) : '—',
        period: s.patternLen > 0 ? `${s.patternLen} ("${s.patternStr}")` : '—',
        res:
          s.phase === 'found'
            ? '✓ true'
            : s.phase === 'not-found'
            ? '✗ false'
            : '分析中...',
        action,
      },
    };
  });
}
