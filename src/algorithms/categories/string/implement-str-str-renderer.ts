/**
 * 实现 strStr() (KMP 算法) 可视化器 — 声明式 4-Card 标准架构
 * LeetCode 28：KMP 前缀表模式匹配
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  STR_STR_PROBLEM_HTML,
  STR_STR_ANALYSIS_HTML,
  STR_STR_CODE_LANGUAGES,
} from './implement-str-str-problem-content';

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
  codeLine: number | number[];
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
      codeLine: 2,
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
    codeLine: [3, 4, 5],
  });

  let j = 0;
  for (let i = 0; i < haystack.length; i++) {
    // 字符失配回退
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
        codeLine: [7, 8],
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
        codeLine: 10,
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
          codeLine: [11, 12],
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
        codeLine: 10,
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
    codeLine: 15,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: SSStep[]): SSStep[] {
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

/** 主视觉：主串 / 模式串对齐滑动双轨 + KMP next 前缀表 */
export function renderStrStrCanvas(container: HTMLElement, step: SSStep): void {
  const { haystack, needle, next, i, j, phase } = step;

  const baseCell =
    'width: 28px; height: 32px; border-radius: 6px; background: #f1f5f9; border: 1.5px solid #cbd5e1; font-family: \'JetBrains Mono\', monospace; font-size: 12px; font-weight: 700; color: #334155; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; position: relative; transition: all 0.15s;';
  const styleForCell = (border: string, bg: string, color: string): string =>
    `${baseCell} border-color: ${border}; background: ${bg}; color: ${color};`;

  const isDone = phase === 'found' || phase === 'not-found';

  const haystackCells = haystack
    .split('')
    .map((ch, idx) => {
      const isI = idx === i && !isDone;
      const isMatchedPart = phase === 'found' && idx >= step.matchedIndex && idx < step.matchedIndex + needle.length;

      let style = baseCell;
      if (isMatchedPart) style = styleForCell('#10b981', '#ecfdf5', '#047857');
      else if (isI) style = styleForCell('#2563eb', '#eff6ff', '#1d4ed8');

      return `
        <div style="${style}">
          <span>${ch}</span>
          <span style="font-size: 8px; color: #94a3b8; position: absolute; bottom: 1px;">${idx}</span>
        </div>
      `;
    })
    .join('');

  // 模式串左边偏移 (i - j) 个空占位
  const offset = Math.max(0, i - j);
  let offsetHtml = '';
  for (let k = 0; k < offset; k++) {
    offsetHtml += '<div style="width: 28px; height: 32px; flex-shrink: 0;"></div>';
  }

  const needleCells = needle
    .split('')
    .map((ch, idx) => {
      const isJ = idx === j && !isDone;
      const isMatch = (phase === 'match' && idx <= j) || phase === 'found';
      const isMismatch = phase === 'fallback' && idx === j;

      let style = baseCell;
      if (isMatch) style = styleForCell('#10b981', '#ecfdf5', '#047857');
      else if (isMismatch) style = styleForCell('#ef4444', '#fef2f2', '#b91c1c');
      else if (isJ) style = styleForCell('#9333ea', '#faf5ff', '#7e22ce');

      return `
        <div style="${style}">
          <span>${ch}</span>
          <span style="font-size: 8px; color: #94a3b8; position: absolute; bottom: 1px;">${idx}</span>
        </div>
      `;
    })
    .join('');

  const nextCells = next
    .map(
      (val, idx) => `
        <div style="min-width: 34px; padding: 2px 4px; border-radius: 6px; background: #ffffff; border: 1px solid ${
          idx === j && !isDone ? '#9333ea' : '#e2e8f0'
        }; display: flex; flex-direction: column; align-items: center; gap: 1px;">
          <span style="font-size: 9px; color: #64748b;">[${idx}] ${needle[idx]}</span>
          <span style="font-size: 13px; font-weight: 800; color: #2563eb;">${val}</span>
        </div>
      `
    )
    .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; gap: 6px; width: 100%; height: 100%; padding: 8px 10px; box-sizing: border-box; overflow-y: auto;">
      <div style="display: flex; flex-direction: column; gap: 4px; width: 100%; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 10px; font-weight: 700; color: #64748b; min-width: 62px; text-transform: uppercase;">haystack:</span>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">${haystackCells}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 10px; font-weight: 700; color: #64748b; min-width: 62px; text-transform: uppercase;">needle:</span>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">${offsetHtml}${needleCells}</div>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px; width: 100%;">
        <span style="font-size: 11px; font-weight: 700; color: #64748b;">模式串前缀表 next[0..m-1]</span>
        <div style="display: flex; gap: 4px; flex-wrap: wrap; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 4px 8px;">${nextCells}</div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'str-str',
  name: '实现strStr()（KMP算法）',
  category: 'string',
  description: '用 KMP 算法在 haystack 中查找 needle 的首次位置',
  icon: '🔍',
  difficulty: 2,
  levelOrder: 6,
  learningGoal: '掌握 KMP 算法的 next 数组与状态转移',
  inputs: [
    {
      id: 'haystack',
      label: '主串 haystack',
      type: 'text',
      defaultValue: 'sadbutsad',
      placeholder: '主串',
    },
    {
      id: 'needle',
      label: '模式串 needle',
      type: 'text',
      defaultValue: 'sad',
      placeholder: '模式串',
    },
  ],
  presets: [
    { label: '示例 1: ("sadbutsad", "sad")', values: { haystack: 'sadbutsad', needle: 'sad' } },
    { label: '不匹配: ("leetcode", "leeto")', values: { haystack: 'leetcode', needle: 'leeto' } },
    { label: '经典回退: ("aabaabaafa", "aabaaf")', values: { haystack: 'aabaabaafa', needle: 'aabaaf' } },
    { label: '多重复: ("mississippi", "issip")', values: { haystack: 'mississippi', needle: 'issip' } },
  ],
  metrics: [
    { id: 'i', label: '主串指针 i', color: '#2563eb' },
    { id: 'j', label: '模式串指针 j', color: '#9333ea' },
    { id: 'match-state', label: '匹配状态', color: '#0f172a' },
    { id: 'res', label: '最终匹配下标', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '主串 i', color: '#2563eb' },
    { label: '模式串 j', color: '#9333ea' },
    { label: '匹配', color: '#10b981' },
  ],
  codeLanguages: STR_STR_CODE_LANGUAGES,
  problemHtml: STR_STR_PROBLEM_HTML,
  analysisHtml: STR_STR_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(
      buildSSSteps(
        String(inputs.haystack ?? 'sadbutsad'),
        String(inputs.needle ?? 'sad')
      )
    ),
  renderCanvas: (container, step) => renderStrStrCanvas(container, step as SSStep),
});
