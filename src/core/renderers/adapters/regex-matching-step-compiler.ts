/**
 * 正则表达式匹配 (LeetCode 10 / 左程云 Class 074 Code04)
 * Step Compiler: 星号 '*' 任意次匹配转化为完全背包模型，斜率优化消除内层循环
 */

import type { HighlightTarget } from '../../code-panel';
import { snapshotGrid2D } from '../../strategies/grid-snapshot';

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
  codeLine?: HighlightTarget;
  metrics?: Record<string, any>;
}

export function parseRegexMatchingInputs(inputs: Record<string, any>): {
  s: string;
  p: string;
} {
  const s = String(inputs['input-s'] ?? 'aab');
  const p = String(inputs['input-pat'] ?? inputs['input-p'] ?? 'c*a*b');
  return { s, p };
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

  const lines = {
    entry: { java: 6, cpp: 7, python: 1, javascript: 2 },
    initDp: { java: 10, cpp: 9, python: 3, javascript: 4 },
    base: { java: 11, cpp: 10, python: 4, javascript: 5 },
    emptyStrStar: { java: 13, cpp: 12, python: 6, javascript: 7 },
    singleMatch: { java: 17, cpp: 17, python: 10, javascript: 12 },
    starSlopeOpt: { java: 20, cpp: 20, python: 12, javascript: 14 },
    returnAns: { java: 24, cpp: 24, python: 13, javascript: 18 },
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
      decision: '初始化 DP 表格',
      status: 'init',
      message: `🎯 初始化正则匹配表：进入 isMatch 函数，文本串 s="${s}" (长 ${n})，模式串 p="${p}" (长 ${m})。`,
      log: `init: s="${s}", p="${p}"`,
      codeLine: lines.entry,
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
      dp: snapshotGrid2D(dp),
      matched: true,
      decision: '空串基底 dp[n][m]=true',
      status: 'base',
      message: '✨ 基底：空串对空模式串自然匹配成功 dp[n][m] = true。',
      log: 'base: dp[n][m] = true',
      codeLine: lines.base,
    })
  );

  // s 为空，处理模式串末尾以 * 消解的情况
  for (let j = m - 1; j >= 0; j--) {
    const canCancel = j + 1 < m && p[j + 1] === '*' && dp[n][j + 2];
    if (canCancel) {
      dp[n][j] = true;
    }
    steps.push(
      makeStep({
        i: n,
        j,
        s,
        p,
        dp: snapshotGrid2D(dp),
        matched: dp[n][j],
        decision: canCancel ? `* 消解空串: '${p[j]}*' 取 0 次` : `'${p[j]}' 无法消解空串`,
        status: 'base',
        message: canCancel
          ? `✨ 基底：模式串 '${p[j]}*' 可匹配 0 次消去，dp[${n}][${j}] = true。`
          : `🛑 基底：模式串字符 '${p[j]}' 无法匹配消解空文本，dp[${n}][${j}] = false。`,
        log: `base: j=${j}, cancel=${canCancel}`,
        codeLine: lines.emptyStrStar,
      })
    );
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
          dp: snapshotGrid2D(dp),
          matched: dp[i][j],
          decision: dec,
          status: 'cell',
          message: `🔍 计算 dp[${i}][${j}] (s[${i}]='${s[i]}', p[${j}]='${p[j]}'): ${dec} → ${dp[i][j]}。`,
          log: `cell [${i}][${j}]: ${dec} => ${dp[i][j]}`,
          codeLine: j + 1 === m || p[j + 1] !== '*' ? lines.singleMatch : lines.starSlopeOpt,
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
      message: `🎉 正则匹配判定完成！dp[0][0] = ${finalMatch}，文本串 "${s}" ${
        finalMatch ? '完全匹配' : '无法匹配'
      } 模式串 "${p}"！`,
      log: `done: ans=${finalMatch}`,
      codeLine: lines.returnAns,
    })
  );

  return steps;
}
