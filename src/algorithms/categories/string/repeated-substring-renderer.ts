/**
 * 重复的子字符串可视化器 — 声明式 4-Card 标准架构
 * LeetCode 459：KMP 前缀表周期性整除推导
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  REPEATED_SUBSTRING_PROBLEM_HTML,
  REPEATED_SUBSTRING_ANALYSIS_HTML,
  REPEATED_SUBSTRING_CODE_LANGUAGES,
} from './repeated-substring-problem-content';
import { computeNextArray } from './implement-str-str-renderer';

export interface RPSStep {
  s: string;
  next: number[];
  n: number;
  maxLPS: number;
  patternLen: number;
  patternStr: string;
  isRepeated: boolean;
  tiles: string[];
  phase: 'init' | 'compute-next' | 'check-period' | 'found' | 'not-found';
  status: 'init' | 'compute-next' | 'check-period' | 'found' | 'not-found';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function buildRPSSteps(s: string): RPSStep[] {
  const steps: RPSStep[] = [];
  const n = s.length;

  if (n <= 1) {
    steps.push({
      s,
      next: n === 1 ? [0] : [],
      n,
      maxLPS: 0,
      patternLen: n,
      patternStr: s,
      isRepeated: false,
      tiles: [s],
      phase: 'not-found',
      status: 'not-found',
      message: `字符串长度为 ${n} &le; 1，无法由子串重复构成，直接返回 false。`,
      log: `长度不足 2 -> false`,
      codeLine: 2,
    });
    return steps;
  }

  const next = computeNextArray(s);
  const maxLPS = next[n - 1];
  const patternLen = n - maxLPS;
  const patternStr = s.substring(0, patternLen);
  const isDivisible = maxLPS > 0 && n % patternLen === 0;

  steps.push({
    s,
    next,
    n,
    maxLPS: 0,
    patternLen: 0,
    patternStr: '',
    isRepeated: false,
    tiles: [],
    phase: 'init',
    status: 'init',
    message: `初始化分析：字符串 "${s}" (长度 n = ${n})。构建 KMP 前缀表 next。`,
    log: `初始化字符串 "${s}" (n=${n})`,
    codeLine: [3, 4],
  });

  steps.push({
    s,
    next,
    n,
    maxLPS,
    patternLen: 0,
    patternStr: '',
    isRepeated: false,
    tiles: [],
    phase: 'compute-next',
    status: 'compute-next',
    message: `计算得到前缀表 next = [${next.join(', ')}]。末尾项 next[${n - 1}] = ${maxLPS}，表示最长相等前后缀长度为 ${maxLPS}。`,
    log: `next[${n - 1}] = ${maxLPS} (最长相等前后缀)`,
    codeLine: 6,
  });

  steps.push({
    s,
    next,
    n,
    maxLPS,
    patternLen,
    patternStr,
    isRepeated: false,
    tiles: [],
    phase: 'check-period',
    status: 'check-period',
    message: `计算潜在最小重复子串周期：patternLen = n - next[n - 1] = ${n} - ${maxLPS} = ${patternLen}。候选子串为 "${patternStr}"。`,
    log: `计算周期: patternLen = ${n} - ${maxLPS} = ${patternLen} ("${patternStr}")`,
    codeLine: 8,
  });

  // 构造周期平铺
  const repeatCount = Math.floor(n / patternLen);
  const tiles: string[] = [];
  for (let k = 0; k < repeatCount; k++) {
    tiles.push(patternStr);
  }

  if (isDivisible) {
    steps.push({
      s,
      next,
      n,
      maxLPS,
      patternLen,
      patternStr,
      isRepeated: true,
      tiles,
      phase: 'found',
      status: 'found',
      message: `🎉 判定成功！maxLPS(${maxLPS}) > 0 且 ${n} % ${patternLen} == 0 (整除)。字符串可由子串 "${patternStr}" 重复 ${repeatCount} 次构成，返回 true。`,
      log: `✓ 成功: "${patternStr}" 重复 ${repeatCount} 次 -> true`,
      codeLine: 9,
    });
  } else {
    steps.push({
      s,
      next,
      n,
      maxLPS,
      patternLen,
      patternStr,
      isRepeated: false,
      tiles: [],
      phase: 'not-found',
      status: 'not-found',
      message: `⚠️ 判定失败！maxLPS = ${maxLPS}，${n} % ${patternLen} = ${n % patternLen} != 0 (不能整除)。无法由重复子串构成，返回 false。`,
      log: `✗ 不能整除 (${n} % ${patternLen} != 0) -> false`,
      codeLine: 9,
    });
  }

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: RPSStep[]): RPSStep[] {
  return steps.map((s) => {
    const action =
      s.patternLen > 0
        ? `${s.n} % (${s.n} - ${s.maxLPS}) = ${s.n % s.patternLen} ${
            s.isRepeated ? '== 0 (整除)' : '!= 0 (不整除)'
          }`
        : 'n % (n - next[n-1]) == 0';

    return {
      ...s,
      metrics: {
        n: String(s.n),
        lps: s.phase !== 'init' ? String(s.maxLPS) : '—',
        period: s.patternLen > 0 ? `${s.patternLen} ("${s.patternStr}")` : '—',
        res:
          s.phase === 'found'
            ? '✓ true'
            : s.phase === 'not-found'
            ? '✗ false'
            : '分析中...',
        action,
      },
    };
  });
}

/** 主视觉：字符 + next 前缀表网格与周期拆解平铺 */
export function renderRepeatedSubstringCanvas(container: HTMLElement, step: RPSStep): void {
  const { s, next, n, patternLen, tiles, phase } = step;

  const trackCells = s
    .split('')
    .map((ch, idx) => {
      const inPattern =
        patternLen > 0 && idx < patternLen && (phase === 'check-period' || phase === 'found');
      const isLastNode = idx === n - 1;

      let style =
        'width: 38px; height: 44px; border-radius: 8px; background: #ffffff; border: 2px solid #cbd5e1; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);';
      if (inPattern) style += ' border-color: #2563eb; background: #eff6ff;';
      if (isLastNode) style += ' border-color: #9333ea; background: #faf5ff; box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.2);';

      const nextVal = next[idx] !== undefined ? next[idx] : '-';

      return `
        <div style="${style}">
          <span style="font-size: 15px; font-weight: 800; color: #0f172a; font-family: 'JetBrains Mono', monospace;">${ch}</span>
          <span style="font-size: 9px; font-weight: 700; color: #94a3b8; position: absolute; bottom: 2px;">next:${nextVal}</span>
        </div>
      `;
    })
    .join('');

  const tileHtml =
    tiles.length === 0
      ? '<span style="color:#94a3b8; font-size:11px; font-style:italic;">(等待周期整除分析...)</span>'
      : tiles
          .map(
            (t, tIdx) => `
        <div style="padding: 3px 8px; border-radius: 6px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700;">
          <span>[${tIdx + 1}] "${t}"</span>
        </div>
      `
          )
          .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; width: 100%; height: 100%; padding: 10px 12px; box-sizing: border-box; overflow: auto;">
      <div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap; justify-content: center;">${trackCells}</div>
      <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: center;">${tileHtml}</div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'repeated-substring',
  name: '重复的子字符串',
  category: 'string',
  description: '判断字符串是否可由重复子串构成',
  icon: '🔁',
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '掌握用 KMP 前缀表判断重复子串的数学原理',
  inputs: [
    {
      id: 's',
      label: '输入字符串',
      type: 'text',
      defaultValue: 'abab',
      placeholder: '字符串',
    },
  ],
  presets: [
    { label: '示例 1: ("abab" -> true)', values: { s: 'abab' } },
    { label: '示例 2: ("aba" -> false)', values: { s: 'aba' } },
    { label: '示例 3: ("abcabcabcabc" -> true)', values: { s: 'abcabcabcabc' } },
    { label: '纯单字符: ("aaaa" -> true)', values: { s: 'aaaa' } },
  ],
  metrics: [
    { id: 'n', label: '总长度 n', color: '#0f172a' },
    { id: 'lps', label: '最长相等前后缀', color: '#9333ea' },
    { id: 'period', label: '周期元长度 len', color: '#2563eb' },
    { id: 'res', label: '判定结果', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '最小周期子串', color: '#2563eb' },
    { label: 'next[n-1] 尾项', color: '#9333ea' },
  ],
  codeLanguages: REPEATED_SUBSTRING_CODE_LANGUAGES,
  problemHtml: REPEATED_SUBSTRING_PROBLEM_HTML,
  analysisHtml: REPEATED_SUBSTRING_ANALYSIS_HTML,
  generateSteps: (inputs) => withMetrics(buildRPSSteps(String(inputs.s ?? 'abab'))),
  renderCanvas: (container, step) =>
    renderRepeatedSubstringCanvas(container, step as RPSStep),
});
