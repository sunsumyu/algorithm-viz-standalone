/**
 * 解码方法 II (Decode Ways II · LeetCode 639)
 * Step Compiler: 字符分类讨论与空间压缩一维动态规划状态推演
 */

import { type Dp066StepBase } from '../../../algorithms/categories/dynamic-programming/dp-066/dp-066-shared';
import { DECODE_WAYS_II_066_LINES } from '../../../algorithms/categories/dynamic-programming/dp-066/dp-066-stage-codes';

export interface DecodeWaysIIStep extends Dp066StepBase {
  s: string;
  currentI?: number;
  singleCount?: string;
  doubleCount?: string;
  cur?: string;
  next1?: string;
  next2?: string;
  dpSnapshot?: string[];
  charHighlighted?: number[];
}

export const DECODE_WAYS_II_PRESETS: Record<string, string> = {
  single_star: '*',
  star_star: '**',
  two_star: '2*',
  complex_sample: '*1*2*',
};

export function buildDecodeWaysII066Steps(presetKey: string = 'two_star'): DecodeWaysIIStep[] {
  const s = DECODE_WAYS_II_PRESETS[presetKey] || '2*';
  const n = s.length;
  const MOD = 1000000007n;

  const steps: DecodeWaysIIStep[] = [];
  const lines = DECODE_WAYS_II_066_LINES;

  // Step 0: 入口纯净帧
  steps.push({
    s,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    message: `🚀 初始化解码方法 II：待解码字符串 "${s}"，长度为 ${n}，含有通配符 '*'。`,
    explanation: '左神点拨：从右往左逆向滚动推导，避免大量无用分支。空间压缩至 next1 (即 dp[i+1]) 与 next2 (即 dp[i+2])。',
    metrics: { '字符串长度': n, '当前阶段': '初始化', 'MOD': '1e9+7' },
  });

  // Step 1: 变量初始化
  let next2 = 0n;
  let next1 = 1n;
  let cur = 0n;

  const dpArray: string[] = new Array(n + 1).fill('-');
  dpArray[n] = '1';

  steps.push({
    s,
    cur: cur.toString(),
    next1: next1.toString(),
    next2: next2.toString(),
    dpSnapshot: [...dpArray],
    line: lines.initVars.javascript,
    codeLine: lines.initVars,
    message: `📊 建立滚动指针：虚拟终点 dp[${n}] = 1 (next1=1), 越界位 next2=0。`,
    explanation: 'next1 记录后续 1 位的解码方案数，next2 记录后续 2 位的解码方案数。',
    metrics: { 'next1 (dp[i+1])': 1, 'next2 (dp[i+2])': 0, '当前位置': '准备遍历' },
  });

  // 逆向遍历字符串
  for (let i = n - 1; i >= 0; i--) {
    const c = s[i];

    // 单字符方案数
    let singleWays = 0n;
    if (c === '*') {
      singleWays = 9n * next1;
    } else if (c !== '0') {
      singleWays = next1;
    } else {
      singleWays = 0n;
    }
    cur = singleWays;

    steps.push({
      s,
      currentI: i,
      charHighlighted: [i],
      singleCount: singleWays.toString(),
      cur: cur.toString(),
      next1: next1.toString(),
      next2: next2.toString(),
      dpSnapshot: [...dpArray],
      line: lines.singleChar.javascript,
      codeLine: lines.singleChar,
      message: `🔍 扫描字符 s[${i}] = '${c}'：单字符决策阶段，独立解码方案数为 ${singleWays} 种。`,
      explanation: c === '*' ? `'*' 可作为 1~9 任一数字解码，产生 9 × next1 = ${singleWays} 种组合。` : c !== '0' ? `'${c}' 可独立解码为对应字母，产生 1 × next1 = ${singleWays} 种组合。` : `'0' 无法独立解码，当前单字符方案数为 0。`,
      highlightedIndices: [i],
      metrics: { '当前字符': `'${c}' (i=${i})`, '单字符方案数': singleWays.toString() },
    });

    // 双字符组合方案数
    let doubleWays = 0n;
    if (i + 1 < n) {
      const nxt = s[i + 1];
      if (c === '*') {
        if (nxt === '*') {
          doubleWays = 15n * next2; // 11~19 (9种) + 21~26 (6种)
        } else if (nxt <= '6') {
          doubleWays = 2n * next2;  // 1x, 2x
        } else {
          doubleWays = next2;       // 1x
        }
      } else if (c === '1') {
        doubleWays = (nxt === '*') ? 9n * next2 : next2;
      } else if (c === '2') {
        if (nxt === '*') {
          doubleWays = 6n * next2;
        } else if (nxt <= '6') {
          doubleWays = next2;
        }
      }

      cur += doubleWays;

      steps.push({
        s,
        currentI: i,
        charHighlighted: [i, i + 1],
        singleCount: singleWays.toString(),
        doubleCount: doubleWays.toString(),
        cur: cur.toString(),
        next1: next1.toString(),
        next2: next2.toString(),
        dpSnapshot: [...dpArray],
        line: lines.doubleChar.javascript,
        codeLine: lines.doubleChar,
        message: `🧩 双字符结合：考察 "${c}${nxt}" 组合，可额外产生 ${doubleWays} 种解码方案！`,
        explanation: `组合情况：前缀 '${c}' 与后续 '${nxt}' 合并成 10~26 范围内的合法字母代码。`,
        highlightedIndices: [i, i + 1],
        metrics: {
          '双字符组合': `"${c}${nxt}"`,
          '双字符方案': doubleWays.toString(),
          '本位未取模总数': cur.toString(),
        },
      });
    }

    cur %= MOD;
    dpArray[i] = cur.toString();

    // 滚动更新
    steps.push({
      s,
      currentI: i,
      charHighlighted: [i],
      singleCount: singleWays.toString(),
      doubleCount: doubleWays.toString(),
      cur: cur.toString(),
      next1: next1.toString(),
      next2: next2.toString(),
      dpSnapshot: [...dpArray],
      line: lines.shiftRolling.javascript,
      codeLine: lines.shiftRolling,
      message: `🔄 本位结算：dp[${i}] = ${cur} (模 1e9+7)。滚动更新 next2 ← ${next1}, next1 ← ${cur}。`,
      explanation: '为前一位的计算准备好双步跨度和单步跨度的状态。',
      highlightedIndices: [i],
      metrics: {
        '本位方案数': cur.toString(),
        '新 next1': cur.toString(),
        '新 next2': next1.toString(),
      },
    });

    next2 = next1;
    next1 = cur;
  }

  // 终点帧：返回 next1
  steps.push({
    s,
    currentI: 0,
    cur: next1.toString(),
    next1: next1.toString(),
    next2: next2.toString(),
    dpSnapshot: [...dpArray],
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    message: `🎉 字符串 "${s}" 解码方案计算圆满完成！总有效解码方式共 ${next1} 种 (模 1000000007)！`,
    explanation: '空间压缩一维 DP 计算完成，时间复杂度 O(N)，额外空间复杂度 O(1)。',
    highlightedIndices: [0],
    metrics: { '最终解码方案总数': next1.toString(), '字符串': `"${s}"`, '状态': '求解完毕' },
  });

  return steps;
}
