/**
 * 左程云算法通关课 Class 066: 环绕字符串中唯一的子字符串 (LeetCode 467)
 * 字符结尾最长连续长度一维动态规划与数学归约
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_066_PROBLEMS } from './dp-066-problem-content';
import {
  UNIQUE_SUBSTRINGS_WRAPAROUND_066_CODES,
  UNIQUE_SUBSTRINGS_WRAPAROUND_066_LINES,
} from './dp-066-stage-codes';
import { Dp066StepBase, renderAlphabetSlotGrid } from './dp-066-shared';

export interface UniqueSubstringsWraparoundStep extends Dp066StepBase {
  s: string;
  currentI?: number;
  curChar?: string;
  preChar?: string;
  isConsecutive?: boolean;
  curLen: number;
  dp: number[];
  totalAns: number;
}

const PRESETS_DATA: Record<string, string> = {
  preset_zab: 'zab',
  preset_cac: 'cac',
  preset_zaba: 'zaba',
  preset_a: 'a',
};

export function buildUniqueSubstringsWraparound066Steps(presetKey: string = 'preset_zab'): UniqueSubstringsWraparoundStep[] {
  const s = PRESETS_DATA[presetKey] || 'zab';
  const n = s.length;
  const steps: UniqueSubstringsWraparoundStep[] = [];
  const lines = UNIQUE_SUBSTRINGS_WRAPAROUND_066_LINES;

  const dp: number[] = new Array(26).fill(0);

  // Step 0: 入口纯净帧
  steps.push({
    s,
    curLen: 0,
    dp: [...dp],
    totalAns: 0,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    message: `🚀 初始化算法：目标字符串 "${s}" (长度 ${n})，在无限环绕串 "...zabcdefghijklmnopqrstuvwxyz..." 中寻找唯一有效子串。`,
    explanation: '左神点拨：以字符 c 结尾的最长连续合法长度如果为 L，则以 c 结尾的所有合法子串数量正好为 L。维护 26 个字母结尾的最长长度即可自动去重！',
    metrics: { '字符串长度': n, '当前阶段': '初始化', 'DP表大小': 26 },
  });

  // Step 1: 首字符初始化
  const firstIdx = s.charCodeAt(0) - 97;
  dp[firstIdx] = 1;
  let cur = 1;

  steps.push({
    s,
    currentI: 0,
    curChar: s[0],
    curLen: 1,
    dp: [...dp],
    totalAns: 1,
    line: lines.initDp.javascript,
    codeLine: lines.initDp,
    message: `🔤 处理首字符 s[0] = '${s[0]}'：自身构成长度为 1 的合法子串，初始化 dp['${s[0]}'-'a'] = 1。`,
    explanation: `当前仅包含单个字符 "${s[0]}"。`,
    highlightedIndices: [0],
    metrics: { '首字符': s[0], '连续长度 cur': 1, '累计唯一子串': 1 },
  });

  // 遍历后续字符
  for (let i = 1; i < n; i++) {
    const pre = s[i - 1];
    const c = s[i];
    const preCode = s.charCodeAt(i - 1);
    const curCode = s.charCodeAt(i);

    const isConsecutive = (preCode === 122 && curCode === 97) || preCode + 1 === curCode;

    steps.push({
      s,
      currentI: i,
      curChar: c,
      preChar: pre,
      isConsecutive,
      curLen: cur,
      dp: [...dp],
      totalAns: dp.reduce((a, b) => a + b, 0),
      line: lines.scanString.javascript,
      codeLine: lines.scanString,
      message: `🔍 考察字符对 "${pre} → ${c}" (下标 #${i})：检查两者在环绕字母表中是否严格相邻。`,
      explanation: isConsecutive ? `'${pre}' 与 '${c}' 在环绕字典中连续（或 'z' 环绕接 'a'），连续长度可扩展！` : `'${pre}' 与 '${c}' 不连续，连续递增链断裂，长度重置为 1。`,
      highlightedIndices: [i - 1, i],
      metrics: { '考察字符': `${pre} → ${c}`, '是否连续': isConsecutive ? '是' : '否' },
    });

    if (isConsecutive) {
      cur++;
    } else {
      cur = 1;
    }

    const idx = curCode - 97;
    const oldMax = dp[idx];
    dp[idx] = Math.max(dp[idx], cur);
    const currentSum = dp.reduce((a, b) => a + b, 0);

    steps.push({
      s,
      currentI: i,
      curChar: c,
      preChar: pre,
      isConsecutive,
      curLen: cur,
      dp: [...dp],
      totalAns: currentSum,
      line: lines.updateMaxLen.javascript,
      codeLine: lines.updateMaxLen,
      message: `📊 更新字母 '${c}' 槽位：当前以 '${c}' 结尾的连续串长为 ${cur}，更新 dp['${c}'-'a'] = max(${oldMax}, ${cur}) = ${dp[idx]}。`,
      explanation: `以 '${c}' 结尾的最长连续子串被扩展或保留，代表新增了更多不重复的合法子串。`,
      highlightedIndices: [i],
      metrics: { '字符槽位': `'${c}'`, '该字符最大长度': dp[idx], '累计唯一子串': currentSum },
    });
  }

  // 终点帧：累加求和
  const finalAns = dp.reduce((a, b) => a + b, 0);
  steps.push({
    s,
    currentI: n - 1,
    curChar: s[n - 1],
    curLen: cur,
    dp: [...dp],
    totalAns: finalAns,
    line: lines.sumAns.javascript,
    codeLine: lines.sumAns,
    message: `🎉 26 槽位求和统计完成！字符串 "${s}" 在环绕母串中的唯一非空子串总数为 ${finalAns}！`,
    explanation: '每个字母结尾的最长合法长度汇总即为全部不重复子串总数。时间复杂度 O(N)，额外空间复杂度 O(1) (大小为 26 的定长数组)。',
    metrics: { '最终唯一子串总数': finalAns, '字符串': `"${s}"`, '状态': '求解完毕' },
  });

  return steps;
}

registerDeclarativeAlgorithm({
  id: 'unique-substrings-wraparound-066',
  name: '环绕字符串中唯一的子字符串 (26槽位DP)',
  category: 'dynamic-programming',
  difficulty: '中等',
  description: '左程云 Class 066 Code07：字符结尾最长连续长度一维动态规划与数学归约，26定长数组去重求和 (LeetCode 467)',
  aliases: ['class066-code07', 'unique-substrings-467', 'leetcode-467', 'unique-substrings-class066'],
  problemHtml: DP_066_PROBLEMS['unique-substrings-wraparound-066'].problemHtml,
  analysisHtml: DP_066_PROBLEMS['unique-substrings-wraparound-066'].complexityHtml,
  codeLanguages: UNIQUE_SUBSTRINGS_WRAPAROUND_066_CODES,
  inputs: [
    {
      id: 'preset',
      label: '用例选择',
      type: 'select',
      defaultValue: 'preset_zab',
      options: [
        { label: '环绕跨越用例 "zab" (6个)', value: 'preset_zab' },
        { label: '交替重复用例 "cac" (2个)', value: 'preset_cac' },
        { label: '混合跨越 "zaba" (6个)', value: 'preset_zaba' },
        { label: '单字符边界 "a" (1个)', value: 'preset_a' },
      ],
    },
  ],
  presets: [
    { label: '环绕跨越用例 "zab" (6个)', values: { preset: 'preset_zab' } },
    { label: '交替重复用例 "cac" (2个)', values: { preset: 'preset_cac' } },
    { label: '混合跨越 "zaba" (6个)', values: { preset: 'preset_zaba' } },
    { label: '单字符边界 "a" (1个)', values: { preset: 'preset_a' } },
  ],
  generateSteps: (inputs: Record<string, any>) => buildUniqueSubstringsWraparound066Steps(inputs?.preset),
  renderCanvas: (container: HTMLElement, step: UniqueSubstringsWraparoundStep) => {
    const { s, currentI, curChar = '', curLen, dp, totalAns } = step;

    const charBadges = s.split('').map((ch, idx) => {
      const isCur = idx === currentI;
      return `
        <div style="
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          width:36px; height:46px; border-radius:6px;
          background:${isCur ? '#eff6ff' : '#f8fafc'};
          border:1.5px solid ${isCur ? '#3b82f6' : '#cbd5e1'};
          font-family:monospace; font-weight:700;
        ">
          <span style="font-size:16px; color:${isCur ? '#1d4ed8' : '#334155'};">${ch}</span>
          <span style="font-size:10px; color:#94a3b8;">#${idx}</span>
        </div>
      `;
    }).join('');

    const alphabetGridHtml = renderAlphabetSlotGrid({
      dp,
      curChar,
      curLen,
      totalAns,
    });

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:10px; width:100%;">
        <div style="display:flex; flex-direction:column; gap:6px; padding:10px; background:#ffffff; border-radius:8px; border:1px solid #e2e8f0;">
          <div style="font-weight:700; font-size:13px; color:#1e293b;">🔡 待匹配母串 "${s}" 扫描序列：</div>
          <div style="display:flex; gap:6px; overflow-x:auto;">${charBadges}</div>
        </div>
        ${alphabetGridHtml}
      </div>
    `;
  },
});
