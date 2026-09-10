/**
 * 通配符匹配 (LeetCode 44) - 声明式 4-Card 沙盘渲染器
 * 核心：通配符 '*' 可匹配任意序列，斜率优化 dp[i][j] = dp[i+1][j] || dp[i][j+1]
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  WILDCARD_MATCHING_PROBLEM_HTML,
  WILDCARD_MATCHING_ANALYSIS_HTML,
  WILDCARD_MATCHING_CODE_LANGUAGES,
  WILDCARD_MATCHING_STAGE1_CODE_LANGUAGES,
  WILDCARD_MATCHING_STAGE2_CODE_LANGUAGES,
  WILDCARD_MATCHING_STAGE3_CODE_LANGUAGES,
} from './knapsack-074-problem-content';
import { HighlightTarget } from '../../../../core/code-panel';
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
} from '../../../../core/renderers/string-dp-stage-evolution';

export interface WildcardMatchingStep {
  i: number;
  j: number;
  s: string;
  p: string;
  dp: boolean[][];
  matched: boolean;
  decision: string;
  status: 'init' | 'base' | 'cell' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, any>;
}

export function buildWildcardMatchingSteps(
  str: string,
  pat: string
): WildcardMatchingStep[] {
  const steps: WildcardMatchingStep[] = [];
  const s = str;
  const p = pat;
  const n = s.length;
  const m = p.length;
  const dp: boolean[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(false)
  );

  function makeStep(data: Omit<WildcardMatchingStep, 'metrics'>): WildcardMatchingStep {
    const iChar = data.i >= 0 && data.i < n ? `'${s[data.i]}'` : data.i === n ? 'EOF' : '—';
    const jChar = data.j >= 0 && data.j < m ? `'${p[data.j]}'` : data.j === m ? 'EOF' : '—';
    return {
      ...data,
      metrics: {
        'metric-pos-i': `i=${data.i} (${iChar})`,
        'metric-pos-j': `j=${data.j} (${jChar})`,
        'metric-decision': data.decision || '—',
        'metric-result': data.matched ? 'MATCHED (true)' : 'NOT MATCHED (false)',
      },
    };
  }

  const lines = {
    entry: { java: 6, cpp: 7, python: 1, javascript: 2 },
    initDp: { java: 10, cpp: 9, python: 3, javascript: 4 },
    base: { java: 11, cpp: 10, python: 4, javascript: 5 },
    emptyStrStar: { java: 12, cpp: 11, python: 6, javascript: 6 },
    singleMatch: { java: 17, cpp: 15, python: 14, javascript: 10 },
    starSlopeOpt: { java: 19, cpp: 17, python: 16, javascript: 12 },
    returnAns: { java: 23, cpp: 21, python: 17, javascript: 16 },
  };

  // 1. 初始化
  steps.push(
    makeStep({
      i: -1,
      j: -1,
      s,
      p,
      dp: dp.map((row) => [...row]),
      matched: false,
      decision: '初始化通配符 DP 表',
      status: 'init',
      message: `🃏 初始化通配符匹配：进入 isMatch 函数，文本串 s="${s}" (长 ${n})，模式串 p="${p}" (长 ${m})。`,
      log: `init: s="${s}", p="${p}"`,
      codeLine: lines.entry,
    })
  );

  // 空串基底
  dp[n][m] = true;
  steps.push(
    makeStep({
      i: n,
      j: m,
      s,
      p,
      dp: dp.map((row) => [...row]),
      matched: true,
      decision: '空串基底 dp[n][m]=true',
      status: 'base',
      message: '✨ 基底：空串对空模式串自然匹配成功 dp[n][m] = true。',
      log: 'base: dp[n][m] = true',
      codeLine: lines.base,
    })
  );

  // 末尾连星号
  for (let j = m - 1; j >= 0 && p[j] === '*'; j--) {
    dp[n][j] = true;
    steps.push(
      makeStep({
        i: n,
        j,
        s,
        p,
        dp: dp.map((row) => [...row]),
        matched: true,
        decision: `尾部连续 '*' 匹配空串`,
        status: 'base',
        message: `✨ 基底：模式串末尾 '*' 可匹配空串，dp[${n}][${j}] = true。`,
        log: `base: dp[${n}][${j}] = true via '*' match empty`,
        codeLine: lines.emptyStrStar,
      })
    );
  }

  // 转移
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      let dec = '';
      if (p[j] !== '*') {
        const curMatch = s[i] === p[j] || p[j] === '?';
        dp[i][j] = curMatch && dp[i + 1][j + 1];
        dec = curMatch
          ? `字符匹配 '${s[i]}' ↔ '${p[j]}'`
          : `字符失配 '${s[i]}' ≠ '${p[j]}'`;
      } else {
        // 斜率优化：dp[i+1][j] (匹配>=1字符) || dp[i][j+1] (匹配0字符)
        const matchMore = dp[i + 1][j];
        const matchZero = dp[i][j + 1];
        dp[i][j] = matchMore || matchZero;
        dec = matchZero
          ? `* 匹配 0 字符成功`
          : matchMore
          ? `* 匹配至少 1 字符 ('${s[i]}') 成功`
          : `* 匹配失败`;
      }

      steps.push(
        makeStep({
          i,
          j,
          s,
          p,
          dp: dp.map((row) => [...row]),
          matched: dp[i][j],
          decision: dec,
          status: 'cell',
          message: `🔍 计算 dp[${i}][${j}] (s[${i}]='${s[i]}', p[${j}]='${p[j]}'): ${dec} → ${dp[i][j]}。`,
          log: `cell [${i}][${j}]: ${dec} => ${dp[i][j]}`,
          codeLine: p[j] !== '*' ? lines.singleMatch : lines.starSlopeOpt,
        })
      );
    }
  }

  const finalMatch = dp[0][0];
  steps.push(
    makeStep({
      i: 0,
      j: 0,
      s,
      p,
      dp: dp.map((row) => [...row]),
      matched: finalMatch,
      decision: finalMatch ? '完全匹配成功' : '匹配失败',
      status: 'done',
      message: `🎉 通配符匹配完毕！dp[0][0] = ${finalMatch}，文本串 "${s}" ${
        finalMatch ? '完全匹配' : '无法匹配'
      } 模式串 "${p}"！`,
      log: `done: ans=${finalMatch}`,
      codeLine: lines.returnAns,
    })
  );

  return steps;
}

function renderWildcardStringMatcher(container: HTMLElement, step: WildcardMatchingStep) {
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

function renderWildcardDpMatrix(container: HTMLElement, step: WildcardMatchingStep) {
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
      <div style="font-size:11px; color:#64748b; margin-bottom:4px; font-weight:700; flex-shrink:0;">通配符 DP 状态表 (T=true, F=false)</div>
      <div style="display:flex; flex-direction:column; flex:1; min-height:0; overflow:auto; background:#f1f5f9; padding:4px; border-radius:4px; border:1px solid #e2e8f0;">
        ${rowsHtml}
      </div>
    </div>
  `;
}

const { template, Visualizer } = createDeclarativeVisualizer<any>({
  id: 'wildcard-matching',
  name: '通配符匹配 (LeetCode 44)',
  category: 'dynamic-programming',
  badge: {
    mode: '完全背包 · 斜率优化',
    complexity: 'O(N · M) · O(N · M)',
  },
  defaultStage: 'stage-4',
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力递归',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(2^(N+M))',
      theme: 'bg-blue',
      badge: {
        mode: '通配符匹配 · 递归暴力搜索',
        complexity: 'O(2^(N+M)) · O(N+M) 栈深',
      },
      card1Title: '🌿 递归分支展开与运行时调用栈',
      card2Title: '📊 递归调用开销与重叠子问题监控',
      codeLanguages: WILDCARD_MATCHING_STAGE1_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const s = String(inputs['input-s'] ?? 'adceb');
        const p = String(inputs['input-pat'] ?? inputs['input-p'] ?? '*a*b');
        return buildStringDpRecursionSteps('wildcard', s, p);
      },
      renderCanvas: (container, step) => renderStringDpRecursionCard1(container, step),
      renderCustomMetrics: (container, step) => renderStringDpRecursionCard2(container, step),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 记忆化搜索',
      shortName: '记忆化',
      num: 2,
      timeBadge: 'O(N·M)',
      theme: 'bg-blue',
      badge: {
        mode: '通配符匹配 · 记忆化搜索',
        complexity: 'O(N · M) · O(N · M) 备忘录',
      },
      card1Title: '💾 备忘录探查追踪 (Cache Hit/Miss)',
      card2Title: '🎯 2D 备忘录缓存热力矩阵 memo[i][j]',
      codeLanguages: WILDCARD_MATCHING_STAGE2_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const s = String(inputs['input-s'] ?? 'adceb');
        const p = String(inputs['input-pat'] ?? inputs['input-p'] ?? '*a*b');
        return buildStringDpMemoSteps('wildcard', s, p);
      },
      renderCanvas: (container, step) => renderStringDpMemoCard1(container, step),
      renderCustomMetrics: (container, step) => renderStringDpMemoCard2(container, step),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 二维动态规划',
      shortName: '二维DP',
      num: 3,
      timeBadge: 'O(N·M)',
      theme: 'bg-emerald',
      badge: {
        mode: '通配符匹配 · 严格二维填表',
        complexity: 'O(N · M) · O(N · M)',
      },
      card1Title: '🔗 单元格字符对齐与前驱依赖分析',
      card2Title: '📐 二维动态规划状态表 dp[i][j]',
      codeLanguages: WILDCARD_MATCHING_STAGE3_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const s = String(inputs['input-s'] ?? 'adceb');
        const p = String(inputs['input-pat'] ?? inputs['input-p'] ?? '*a*b');
        return buildStringDp2DSteps('wildcard', s, p);
      },
      renderCanvas: (container, step) => renderStringDp2DCard1(container, step),
      renderCustomMetrics: (container, step) => renderStringDp2DCard2(container, step),
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
      card1Title: '🃏 文本串与通配模式 (? *) 指示器',
      card2Title: '📐 二维状态矩阵 dp[i][j] (自底向上填表)',
      codeLanguages: WILDCARD_MATCHING_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const s = String(inputs['input-s'] ?? 'adceb');
        const p = String(inputs['input-pat'] ?? inputs['input-p'] ?? '*a*b');
        return buildWildcardMatchingSteps(s, p);
      },
      renderCanvas: (container, step) => renderWildcardStringMatcher(container, step),
      renderCustomMetrics: (container, step) => renderWildcardDpMatrix(container, step),
    },
  ],
  card1Title: '🃏 文本串与通配模式 (? *) 指示器',
  card2Title: '📐 二维状态矩阵 dp[i][j] (自底向上填表)',
  card2Desc: '展示星号 * 匹配空串或至少一个字符的二分支优雅斜率压缩',
  legend: [
    { label: '匹配失败 (false)', color: '#334155' },
    { label: '匹配成功 (true)', color: '#10b981' },
    { label: '当前计算单元格', color: '#f59e0b' },
  ],
  inputs: [
    {
      id: 'input-s',
      label: '文本串 s',
      type: 'text',
      defaultValue: 'adceb',
      width: '100px',
    },
    {
      id: 'input-p',
      label: '模式串 p (含 ? *)',
      type: 'text',
      defaultValue: '*a*b',
      width: '100px',
    },
  ],
  presets: [
    {
      label: '经典通配案例 (s="adceb", p="*a*b", Ans=true)',
      values: {
        'input-s': 'adceb',
        'input-p': '*a*b',
      },
    },
    {
      label: '问号通配案例 (s="cb", p="?a", Ans=false)',
      values: {
        'input-s': 'cb',
        'input-p': '?a',
      },
    },
    {
      label: '纯星号案例 (s="abcde", p="*", Ans=true)',
      values: {
        'input-s': 'abcde',
        'input-p': '*',
      },
    },
  ],
  metrics: [
    { id: 'metric-pos-i', label: '文本指针 i', color: '#f59e0b' },
    { id: 'metric-pos-j', label: '模式指针 j', color: '#38bdf8' },
    { id: 'metric-decision', label: '当前转移决策', color: '#8b5cf6' },
    { id: 'metric-result', label: '最终匹配状态', color: '#10b981' },
  ],
  codeLanguages: WILDCARD_MATCHING_CODE_LANGUAGES,
  problemHtml: WILDCARD_MATCHING_PROBLEM_HTML,
  analysisHtml: WILDCARD_MATCHING_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const s = inputs['input-s'] || 'adceb';
    const p = inputs['input-p'] || '*a*b';
    return buildWildcardMatchingSteps(s, p);
  },
  renderCanvas: (container, step) => renderWildcardStringMatcher(container, step),
  renderCustomMetrics: (container, step) => renderWildcardDpMatrix(container, step),
});

export const WildcardMatchingVisualizer = Visualizer;

registerAlgorithm({
  id: 'wildcard-matching',
  name: '通配符匹配 (LeetCode 44)',
  viewId: 'algo-wildcard-matching-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 074 Code05：LeetCode 44 通配符，通配星号 * 匹配任意字符串转化为经典完全背包斜率优化 dp[i][j] = dp[i+1][j] || dp[i][j+1]',
  icon: '🃏',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 88,
  learningGoal: '掌握通配符星号任意串匹配向二分支完全背包斜率优化的推导与边界处理',
});

