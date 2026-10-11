/**
 * 实现 strStr() (KMP 算法) — 步进推演编译器
 * LeetCode 28：KMP 前缀表模式匹配
 */

import { HighlightTarget } from '../../../core/code-panel';

export const STR_STR_CODE_LINES: Record<string, Record<string, number | number[]>> = {
  empty: { java: 2, cpp: 4, python: 2, javascript: 2 },
  init: { java: [3, 4, 5], cpp: [5, 6, 7], python: [4, 5], javascript: [3, 4] },
  fallback: { java: [7, 8], cpp: [9, 10, 11], python: [14, 15], javascript: 12 },
  match: { java: 10, cpp: 12, python: [16, 17], javascript: 13 },
  found: { java: [11, 12], cpp: 13, python: [18, 19], javascript: 14 },
  mismatch: { java: 10, cpp: 12, python: [16, 17], javascript: 13 },
  notFound: { java: 15, cpp: 15, python: 20, javascript: 16 },
};

const lines = STR_STR_CODE_LINES;

export interface SSStep {
  haystack: string;
  needle: string;
  next: number[];
  i: number;
  j: number;
  phase: 'init' | 'match' | 'mismatch' | 'fallback' | 'found' | 'not-found';
  status: 'init' | 'match' | 'mismatch' | 'fallback' | 'found' | 'not-found';
  matchedIndex: number;
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function computeNextArray(pattern: string): number[] {
  const next = new Array(pattern.length).fill(0);
  let j = 0;
  next[0] = 0;

  for (let i = 1; i < pattern.length; i++) {
    while (j > 0 && pattern[i] !== pattern[j]) {
      j = next[j - 1];
    }
    if (pattern[i] === pattern[j]) {
      j++;
    }
    next[i] = j;
  }
  return next;
}

export function buildSSSteps(haystack: string, needle: string): SSStep[] {
  const steps: SSStep[] = [];

  if (needle.length === 0) {
    steps.push({
      haystack,
      needle,
      next: [],
      i: 0,
      j: 0,
      phase: 'found',
      status: 'found',
      matchedIndex: 0,
      message: 'needle 为空字符串，根据定义直接返回 0。',
      log: 'needle 为空 -> 返回 0',
      codeLine: lines.empty,
    });
    return steps;
  }

  const next = computeNextArray(needle);

  steps.push({
    haystack,
    needle,
    next,
    i: 0,
    j: 0,
    phase: 'init',
    status: 'init',
    matchedIndex: -1,
    message: `计算模式串 needle 的 next 前缀表: [${next.join(', ')}]。准备开始在主串中匹配。`,
    log: `构建 next 表: [${next.join(', ')}]`,
    codeLine: lines.init,
  });

  let j = 0;
  for (let i = 0; i < haystack.length; i++) {
    while (j > 0 && haystack[i] !== needle[j]) {
      const prevJ = j;
      j = next[j - 1];

      steps.push({
        haystack,
        needle,
        next,
        i,
        j,
        phase: 'fallback',
        status: 'fallback',
        matchedIndex: -1,
        message: `⚠️ 字符失配：haystack[${i}] ('${haystack[i]}') != needle[${prevJ}] ('${needle[prevJ]}')。模式串指针通过 next 表回退到 j = next[${prevJ - 1}] = ${j}。`,
        log: `失配回退: j 从 ${prevJ} -> ${j}`,
        codeLine: lines.fallback,
      });
    }

    if (haystack[i] === needle[j]) {
      j++;

      steps.push({
        haystack,
        needle,
        next,
        i,
        j: j - 1,
        phase: 'match',
        status: 'match',
        matchedIndex: -1,
        message: `字符匹配：haystack[${i}] ('${haystack[i]}') == needle[${j - 1}] ('${needle[j - 1]}')。模式串匹配长度增至 ${j}。`,
        log: `匹配: haystack[${i}] == needle[${j - 1}] (j=${j})`,
        codeLine: lines.match,
      });

      if (j === needle.length) {
        const foundIdx = i - needle.length + 1;
        steps.push({
          haystack,
          needle,
          next,
          i,
          j: j - 1,
          phase: 'found',
          status: 'found',
          matchedIndex: foundIdx,
          message: `🎉 模式串完全匹配！在主串下标 ${foundIdx} 处成功找到匹配项，返回 ${foundIdx}。`,
          log: `✓ 成功匹配: 起始下标 ${foundIdx}`,
          codeLine: lines.found,
        });
        return steps;
      }
    } else {
      steps.push({
        haystack,
        needle,
        next,
        i,
        j: 0,
        phase: 'mismatch',
        status: 'mismatch',
        matchedIndex: -1,
        message: `字符不匹配：haystack[${i}] ('${haystack[i]}') != needle[0] ('${needle[0]}')，模式串仍从 0 开始。`,
        log: `首字符失配: i=${i}`,
        codeLine: lines.mismatch,
      });
    }
  }

  steps.push({
    haystack,
    needle,
    next,
    i: haystack.length,
    j,
    phase: 'not-found',
    status: 'not-found',
    matchedIndex: -1,
    message: `主串遍历结束，未找到模式串 "${needle}" 的匹配项，返回 -1。`,
    log: `✗ 未找到匹配项: 返回 -1`,
    codeLine: lines.notFound,
  });

  return steps;
}

export function withMetrics(steps: SSStep[]): SSStep[] {
  const stateMap: Record<string, string> = {
    init: '初始化',
    match: '✓ 匹配中',
    mismatch: '✗ 失配',
    fallback: '⏪ 模式串回退',
    found: '🎉 匹配成功',
    'not-found': '未找到',
  };
  return steps.map((s) => {
    let action = 'j = next[j - 1] (失配回退)';
    if (s.phase === 'fallback') action = `j 回退: j = next[${s.j}] = ${s.next[s.j] || 0}`;
    else if (s.phase === 'found') action = '匹配成功';
    else if (s.phase === 'not-found') action = '未找到匹配项';

    const isDone = s.phase === 'found' || s.phase === 'not-found';
    return {
      ...s,
      metrics: {
        i: isDone ? '—' : String(s.i),
        j: isDone ? '—' : String(s.j),
        'match-state': stateMap[s.phase] || s.phase,
        res:
          s.phase === 'found'
            ? `下标 ${s.matchedIndex}`
            : s.phase === 'not-found'
            ? '-1 (无匹配)'
            : '匹配中...',
        action,
      },
    };
  });
}
