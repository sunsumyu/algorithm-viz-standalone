/**
 * 正则表达式匹配 (LeetCode 10 / 左程云 Class 074 Code04)
 * Canvas Adapter: 文本串/模式串双指示器与完全背包斜率优化网格
 */

import {
  REGEX_MATCHING_CODE_LANGUAGES,
  REGEX_MATCHING_STAGE1_CODE_LANGUAGES,
  REGEX_MATCHING_STAGE2_CODE_LANGUAGES,
  REGEX_MATCHING_STAGE3_CODE_LANGUAGES,
} from '../../../algorithms/categories/dynamic-programming/knapsack-074/knapsack-074-problem-content';
import {
  buildStringDpRecursionSteps,
  buildStringDpMemoSteps,
  buildStringDp2DSteps,
  renderStringDpRecursionCard1,
  renderStringDpRecursionCard2,
  renderStringDpMemoCard1,
  renderStringDpMemoCard2,
  renderStringDp2DCard1,
  renderStringDp2DCard2,
} from '../string-dp-stage-evolution';
import {
  buildRegexMatchingSteps,
  parseRegexMatchingInputs,
  type RegexMatchingStep,
} from './regex-matching-step-compiler';

export function renderRegexStringMatcher(container: HTMLElement, step: RegexMatchingStep): void {
  const sBadges = step.s
    .split('')
    .map((ch, idx) => {
      const isCur = step.i === idx;
      const bg = isCur ? '#f59e0b' : '#1e293b';
      const col = isCur ? '#0f172a' : '#cbd5e1';
      return `<span style="background:${bg}; color:${col}; padding:4px 8px; border-radius:4px; font-weight:800; font-family:monospace; margin:0 2px;">${ch} [${idx}]</span>`;
    })
    .join('');

  const pBadges = step.p
    .split('')
    .map((ch, idx) => {
      const isCur = step.j === idx;
      const bg = isCur ? '#38bdf8' : '#1e293b';
      const col = isCur ? '#0f172a' : '#cbd5e1';
      return `<span style="background:${bg}; color:${col}; padding:4px 8px; border-radius:4px; font-weight:800; font-family:monospace; margin:0 2px;">${ch} [${idx}]</span>`;
    })
    .join('');

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:16px; width:100%; height:100%; justify-content:center; align-items:center; background:#f8fafc; padding:12px; border-radius:8px; box-sizing:border-box;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:12px; color:#64748b; font-weight:700;">文本串 s:</span>
        ${sBadges || '<span style="color:#64748b;">(空串)</span>'}
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:12px; color:#64748b; font-weight:700;">模式串 p:</span>
        ${pBadges || '<span style="color:#64748b;">(空串)</span>'}
      </div>
    </div>
  `;
}

export function renderRegexDpMatrix(container: HTMLElement, step: RegexMatchingStep): void {
  const rowsHtml = step.dp
    .map((row, rIdx) => {
      const cells = row
        .map((val, cIdx) => {
          const isCur = step.i === rIdx && step.j === cIdx;
          const bg = isCur ? '#f59e0b' : val ? '#065f46' : '#1e293b';
          const col = isCur ? '#0f172a' : val ? '#34d399' : '#64748b';
          return `
            <div style="width:24px; height:20px; display:flex; justify-content:center; align-items:center; background:${bg}; color:${col}; font-size:9px; font-weight:700; border-radius:2px; margin:1px;">
              ${val ? 'T' : 'F'}
            </div>
          `;
        })
        .join('');
      return `<div style="display:flex; align-items:center;"><span style="font-size:8px; color:#64748b; width:16px;">i=${rIdx}</span>${cells}</div>`;
    })
    .join('');

  container.innerHTML = `
    <div style="width:100%; height:100%; display:flex; flex-direction:column; padding:2px 4px; box-sizing:border-box; flex:1; min-height:0; overflow:hidden;">
      <div style="font-size:11px; color:#64748b; margin-bottom:4px; font-weight:700; flex-shrink:0;">DP 匹配状态网格 (T=true, F=false)</div>
      <div style="display:flex; flex-direction:column; flex:1; min-height:0; overflow:auto; background:#f1f5f9; padding:4px; border-radius:4px; border:1px solid #e2e8f0;">
        ${rowsHtml}
      </div>
    </div>
  `;
}

export function createRegexMatchingStages() {
  return [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力递归',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(2^(N+M))',
      theme: 'bg-blue',
      badge: {
        mode: '正则表达式 · 递归暴力搜索',
        complexity: 'O(2^(N+M)) · O(N+M) 栈深',
      },
      card1Title: '🌿 递归分支展开与运行时调用栈',
      card2Title: '📊 递归调用开销与重叠子问题监控',
      codeLanguages: REGEX_MATCHING_STAGE1_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { s, p } = parseRegexMatchingInputs(inputs);
        return buildStringDpRecursionSteps('regex', s, p);
      },
      renderCanvas: (container: HTMLElement, step: any) => renderStringDpRecursionCard1(container, step),
      renderCustomMetrics: (container: HTMLElement, step: any) => renderStringDpRecursionCard2(container, step),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 记忆化搜索',
      shortName: '记忆化',
      num: 2,
      timeBadge: 'O(N·M)',
      theme: 'bg-blue',
      badge: {
        mode: '正则表达式 · 记忆化搜索',
        complexity: 'O(N · M) · O(N · M) 备忘录',
      },
      card1Title: '💾 备忘录探查追踪 (Cache Hit/Miss)',
      card2Title: '🎯 2D 备忘录缓存热力矩阵 memo[i][j]',
      codeLanguages: REGEX_MATCHING_STAGE2_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { s, p } = parseRegexMatchingInputs(inputs);
        return buildStringDpMemoSteps('regex', s, p);
      },
      renderCanvas: (container: HTMLElement, step: any) => renderStringDpMemoCard1(container, step),
      renderCustomMetrics: (container: HTMLElement, step: any) => renderStringDpMemoCard2(container, step),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 二维动态规划',
      shortName: '二维DP',
      num: 3,
      timeBadge: 'O(N·M)',
      theme: 'bg-emerald',
      badge: {
        mode: '正则表达式 · 严格二维填表',
        complexity: 'O(N · M) · O(N · M)',
      },
      card1Title: '🔗 单元格字符对齐与前驱依赖分析',
      card2Title: '📐 二维动态规划状态表 dp[i][j]',
      codeLanguages: REGEX_MATCHING_STAGE3_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { s, p } = parseRegexMatchingInputs(inputs);
        return buildStringDp2DSteps('regex', s, p);
      },
      renderCanvas: (container: HTMLElement, step: any) => renderStringDp2DCard1(container, step),
      renderCustomMetrics: (container: HTMLElement, step: any) => renderStringDp2DCard2(container, step),
    },
    {
      id: 'stage-4',
      name: '阶段 4: 完全背包·斜率优化',
      shortName: '斜率优化',
      num: 4,
      timeBadge: 'O(N·M) 最优',
      theme: 'bg-amber',
      badge: {
        mode: '完全背包 · 斜率优化',
        complexity: 'O(N · M) · O(N · M)',
      },
      card1Title: '🔤 字符串与模式串字符指示器',
      card2Title: '📐 二维状态矩阵 dp[i][j] (自底向上填表)',
      codeLanguages: REGEX_MATCHING_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { s, p } = parseRegexMatchingInputs(inputs);
        return buildRegexMatchingSteps(s, p);
      },
      renderCanvas: (container: HTMLElement, step: RegexMatchingStep) => renderRegexStringMatcher(container, step),
      renderCustomMetrics: (container: HTMLElement, step: RegexMatchingStep) => renderRegexDpMatrix(container, step),
    },
  ];
}
