/**
 * 左程云算法通关课 Class 066: 解码方法 II (Decode Ways II · LeetCode 639)
 * 字符分类讨论与空间压缩一维动态规划
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_066_PROBLEMS } from './dp-066-problem-content';
import {
  DECODE_WAYS_II_066_CODES,
  DECODE_WAYS_II_066_LINES,
} from './dp-066-stage-codes';
import { Dp066StepBase, renderLinearDpArray } from './dp-066-shared';

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

const PRESETS_DATA: Record<string, string> = {
  single_star: '*',
  star_star: '**',
  two_star: '2*',
  complex_sample: '*1*2*',
};

export function buildDecodeWaysII066Steps(presetKey: string = 'two_star'): DecodeWaysIIStep[] {
  const s = PRESETS_DATA[presetKey] || '2*';
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

registerDeclarativeAlgorithm({
  id: 'decode-ways-ii-066',
  name: '解码方法 II (带通配符DP)',
  category: 'dynamic-programming',
  difficulty: '困难',
  description: '左程云 Class 066 Code04：带通配符 * 的字符分类讨论与空间压缩一维动态规划 (LeetCode 639)',
  aliases: ['class066-code04', 'decode-ways-639', 'leetcode-639', 'decode-ways-ii-class066'],
  problemHtml: DP_066_PROBLEMS['decode-ways-ii-066'].problemHtml,
  analysisHtml: DP_066_PROBLEMS['decode-ways-ii-066'].complexityHtml,
  codeLanguages: DECODE_WAYS_II_066_CODES,
  inputs: [
    {
      id: 'preset',
      label: '用例选择',
      type: 'select',
      defaultValue: 'two_star',
      options: [
        { label: '双字符通配符 "2*" (15种)', value: 'two_star' },
        { label: '单通配符 "*" (9种)', value: 'single_star' },
        { label: '连续通配符 "**" (96种)', value: 'star_star' },
        { label: '复杂多通配符 "*1*2*"', value: 'complex_sample' },
      ],
    },
  ],
  presets: [
    { label: '双字符通配符 "2*" (15种)', values: { preset: 'two_star' } },
    { label: '单通配符 "*" (9种)', values: { preset: 'single_star' } },
    { label: '连续通配符 "**" (96种)', values: { preset: 'star_star' } },
    { label: '复杂多通配符 "*1*2*"', values: { preset: 'complex_sample' } },
  ],
  generateSteps: (inputs: Record<string, any>) => buildDecodeWaysII066Steps(inputs?.preset),
  renderCanvas: (container: HTMLElement, step: DecodeWaysIIStep) => {
    const { s, currentI, singleCount, doubleCount, cur, next1, next2, dpSnapshot = [] } = step;

    const charBadges = s.split('').map((ch, idx) => {
      const isCur = idx === currentI;
      const isNext = currentI !== undefined && idx === currentI + 1;
      let bg = '#f8fafc';
      let border = '#cbd5e1';
      let color = '#334155';
      if (isCur) {
        bg = '#eff6ff';
        border = '#3b82f6';
        color = '#1d4ed8';
      } else if (isNext) {
        bg = '#fdf4ff';
        border = '#d946ef';
        color = '#a21caf';
      }
      return `
        <div style="
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          width:36px; height:46px; border-radius:6px;
          background:${bg}; border:1.5px solid ${border};
          font-family:monospace; font-weight:700;
        ">
          <span style="font-size:16px; color:${color};">${ch}</span>
          <span style="font-size:10px; color:#94a3b8;">#${idx}</span>
        </div>
      `;
    }).join('');

    const linearDpHtml = renderLinearDpArray({
      dp: dpSnapshot,
      activeIdx: currentI,
      title: '一维 DP 数组 dp[i] (从下标 i 开始到末尾的解码总数)',
      summaryText: currentI !== undefined ? `正在推导下标 i = ${currentI}` : '已完成推导',
    });

    const rollingVarsHtml = `
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin-top:8px;">
        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:8px; font-size:12px;">
          <div style="font-weight:700; color:#15803d;">当前本位 cur (dp[i])</div>
          <div style="font-size:14px; font-weight:700; color:#166534; font-family:monospace; margin-top:2px;">${cur ?? '-'}</div>
        </div>
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:8px; font-size:12px;">
          <div style="font-weight:700; color:#1d4ed8;">单步后继 next1 (dp[i+1])</div>
          <div style="font-size:14px; font-weight:700; color:#1e40af; font-family:monospace; margin-top:2px;">${next1 ?? '-'}</div>
        </div>
        <div style="background:#fdf4ff; border:1px solid #f5d0fe; border-radius:6px; padding:8px; font-size:12px;">
          <div style="font-weight:700; color:#a21caf;">双步后继 next2 (dp[i+2])</div>
          <div style="font-size:14px; font-weight:700; color:#86198f; font-family:monospace; margin-top:2px;">${next2 ?? '-'}</div>
        </div>
      </div>
    `;

    const branchDetailHtml = currentI !== undefined ? `
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:8px; font-size:12px; margin-top:8px; display:flex; justify-content:space-between;">
        <span>🔤 单字符方案贡献: <strong style="color:#2563eb;">${singleCount ?? '-'}</strong></span>
        <span>🔗 双字符结合方案贡献: <strong style="color:#9333ea;">${doubleCount ?? '0'}</strong></span>
      </div>
    ` : '';

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:10px; width:100%;">
        <div style="display:flex; flex-direction:column; gap:6px; padding:10px; background:#ffffff; border-radius:8px; border:1px solid #e2e8f0;">
          <div style="font-weight:700; font-size:13px; color:#1e293b;">🔡 待解码字符串 "${s}" 字符序列：</div>
          <div style="display:flex; gap:6px; overflow-x:auto;">${charBadges}</div>
        </div>
        ${linearDpHtml}
        ${rollingVarsHtml}
        ${branchDetailHtml}
      </div>
    `;
  },
});
