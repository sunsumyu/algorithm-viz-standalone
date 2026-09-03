/**
 * 正则表达式匹配 (LeetCode 10) - 声明式 4-Card 沙盘渲染器
 * 核心：星号 '*' 匹配任意次转化为【完全背包】模型，斜率优化消除内层循环
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  REGEX_MATCHING_PROBLEM_HTML,
  REGEX_MATCHING_ANALYSIS_HTML,
  REGEX_MATCHING_CODE_LANGUAGES,
} from './knapsack-074-problem-content';

export interface RegexMatchingStep {
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
  codeLine: number;
  metrics?: Record<string, any>;
}

export function buildRegexMatchingSteps(
  str: string,
  pat: string
): RegexMatchingStep[] {
  const steps: RegexMatchingStep[] = [];
  const s = str;
  const p = pat;
  const n = s.length;
  const m = p.length;
  const dp: boolean[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(false)
  );

  function makeStep(data: Omit<RegexMatchingStep, 'metrics'>): RegexMatchingStep {
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

  // 1. 初始化
  steps.push(
    makeStep({
      i: -1,
      j: -1,
      s,
      p,
      dp: dp.map((row) => [...row]),
      matched: false,
      decision: '初始化 DP 表格',
      status: 'init',
      message: `🎯 初始化正则匹配表：文本串 s="${s}" (长 ${n})，模式串 p="${p}" (长 ${m})。`,
      log: `init: s="${s}", p="${p}"`,
      codeLine: 8,
    })
  );

  // 空串对空串匹配
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
      codeLine: 9,
    })
  );

  // s 为空，处理模式串末尾以 * 消解的情况
  for (let j = m - 1; j >= 0; j--) {
    if (j + 1 < m && p[j + 1] === '*' && dp[n][j + 2]) {
      dp[n][j] = true;
      steps.push(
        makeStep({
          i: n,
          j,
          s,
          p,
          dp: dp.map((row) => [...row]),
          matched: true,
          decision: `* 消解空串: '${p[j]}*' 取 0 次`,
          status: 'base',
          message: `✨ 基底：模式串 '${p[j]}*' 可匹配 0 次消去，dp[${n}][${j}] = true。`,
          log: `base: dp[${n}][${j}] = true via '*' cancel`,
          codeLine: 11,
        })
      );
    }
  }

  // 严格位置依赖转移
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      let dec = '';
      if (j + 1 === m || p[j + 1] !== '*') {
        // 普通单字符匹配
        const curMatch = s[i] === p[j] || p[j] === '.';
        dp[i][j] = curMatch && dp[i + 1][j + 1];
        dec = curMatch
          ? `单字符匹配 '${s[i]}' ↔ '${p[j]}'`
          : `单字符失配 '${s[i]}' ≠ '${p[j]}'`;
      } else {
        // 完全背包斜率优化
        const matchZero = dp[i][j + 2];
        const matchMore = (s[i] === p[j] || p[j] === '.') && dp[i + 1][j];
        dp[i][j] = matchZero || matchMore;
        dec = matchZero
          ? `* 匹配 0 次成功`
          : matchMore
          ? `* 完全背包叠加匹配 '${s[i]}'`
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
          codeLine: j + 1 === m || p[j + 1] !== '*' ? 15 : 18,
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
      message: `🎉 正则匹配判定完成！dp[0][0] = ${finalMatch}，文本串 "${s}" ${
        finalMatch ? '完全匹配' : '无法匹配'
      } 模式串 "${p}"！`,
      log: `done: ans=${finalMatch}`,
      codeLine: 23,
    })
  );

  return steps;
}

export const RegexMatchingVisualizer = createDeclarativeVisualizer<RegexMatchingStep>({
  id: 'regex-matching',
  name: '正则表达式匹配 (LeetCode 10)',
  category: 'dynamic-programming',
  badge: {
    mode: '完全背包 · 斜率优化',
    complexity: 'O(N · M) · O(N · M)',
  },
  card1Title: '🔤 字符串与模式串字符指示器',
  card2Title: '📐 二维状态矩阵 dp[i][j] (自底向上填表)',
  card2Desc: '展示星号 * 如何通过完全背包斜率优化消解内层重复循环',
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
      defaultValue: 'aab',
      width: '100px',
    },
    {
      id: 'input-p',
      label: '模式串 p (含 . *)',
      type: 'text',
      defaultValue: 'c*a*b',
      width: '100px',
    },
  ],
  presets: [
    {
      label: '经典星号前导案例 (s="aab", p="c*a*b", Ans=true)',
      values: {
        'input-s': 'aab',
        'input-p': 'c*a*b',
      },
    },
    {
      label: '点通配与星号案例 (s="ab", p=".*", Ans=true)',
      values: {
        'input-s': 'ab',
        'input-p': '.*',
      },
    },
    {
      label: '失配案例 (s="mississippi", p="mis*is*p*.", Ans=false)',
      values: {
        'input-s': 'mississippi',
        'input-p': 'mis*is*p*.',
      },
    },
  ],
  metrics: [
    { id: 'metric-pos-i', label: '文本指针 i', color: '#f59e0b' },
    { id: 'metric-pos-j', label: '模式指针 j', color: '#38bdf8' },
    { id: 'metric-decision', label: '当前转移决策', color: '#8b5cf6' },
    { id: 'metric-result', label: '最终匹配状态', color: '#10b981' },
  ],
  codeLanguages: REGEX_MATCHING_CODE_LANGUAGES,
  problemHtml: REGEX_MATCHING_PROBLEM_HTML,
  analysisHtml: REGEX_MATCHING_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const s = inputs['input-s'] || 'aab';
    const p = inputs['input-p'] || 'c*a*b';
    return buildRegexMatchingSteps(s, p);
  },
  renderCanvas: (container, step) => {
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
      <div style="display:flex; flex-direction:column; gap:16px; width:100%; height:100%; justify-content:center; align-items:center; background:#0b0f19; padding:12px; border-radius:8px; box-sizing:border-box;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:12px; color:#94a3b8; font-weight:700;">文本串 s:</span>
          ${sBadges || '<span style="color:#64748b;">(空串)</span>'}
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:12px; color:#94a3b8; font-weight:700;">模式串 p:</span>
          ${pBadges || '<span style="color:#64748b;">(空串)</span>'}
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
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
      <div style="width:100%; padding:4px 8px; box-sizing:border-box;">
        <div style="font-size:11px; color:#94a3b8; margin-bottom:4px; font-weight:700;">DP 匹配状态网格 (T=true, F=false)</div>
        <div style="display:flex; flex-direction:column; max-height:110px; overflow:auto; background:#0b1329; padding:4px; border-radius:4px;">
          ${rowsHtml}
        </div>
      </div>
    `;
  },
});

registerAlgorithm(
  {
    id: 'regex-matching',
    name: '正则表达式匹配 (LeetCode 10)',
    category: 'dynamic-programming',
    difficulty: 'hard',
    description: 'LeetCode 10：支持 . 和 * 的正则匹配，* 号转化为完全背包斜率优化',
    tags: ['动态规划', '完全背包', '斜率优化', '字符串匹配', '左程云074'],
  },
  RegexMatchingVisualizer
);
