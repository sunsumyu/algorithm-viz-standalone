/**
 * 通配符匹配 (LeetCode 44 / 左程云 Class 074 Code05)
 * Step Compiler: 通配符 '*' 匹配任意序列，斜率优化 dp[i][j] = dp[i+1][j] || dp[i][j+1]
 */

import type { HighlightTarget } from '../../code-panel';
import { snapshotGrid2D } from '../../strategies/grid-snapshot';

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

export function parseWildcardMatchingInputs(inputs: Record<string, any>): {
  s: string;
  p: string;
} {
  const s = String(inputs['input-s'] ?? 'cb');
  const p = String(inputs['input-pat'] ?? inputs['input-p'] ?? '?a');
  return { s, p };
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
      dp: snapshotGrid2D(dp),
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
      dp: snapshotGrid2D(dp),
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
        dp: snapshotGrid2D(dp),
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
          dp: snapshotGrid2D(dp),
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
      dp: snapshotGrid2D(dp),
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
