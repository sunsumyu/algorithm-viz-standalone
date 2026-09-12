/**
 * 最长公共前缀可视化器 — 声明式 4-Card 标准架构
 * LeetCode 14：纵向逐列扫描
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  LONGEST_COMMON_PREFIX_PROBLEM_HTML,
  LONGEST_COMMON_PREFIX_ANALYSIS_HTML,
  LONGEST_COMMON_PREFIX_CODE_LANGUAGES,
} from './longest-common-prefix-problem-content';

export interface LCPStep {
  strs: string[];
  col: number;
  row: number;
  char: string | null;
  matchedLen: number;
  prefix: string;
  isMismatch: boolean;
  phase: 'init' | 'scan-col' | 'compare-cell' | 'mismatch' | 'done';
  status: 'init' | 'scan-col' | 'compare-cell' | 'mismatch' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function parseStringList(input: string): string[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return arr.length > 0 ? arr : ['flower', 'flow', 'flight'];
}

export function buildLCPSteps(strs: string[]): LCPStep[] {
  const steps: LCPStep[] = [];

  if (!strs || strs.length === 0) {
    steps.push({
      strs: [],
      col: -1,
      row: -1,
      char: null,
      matchedLen: 0,
      prefix: '',
      isMismatch: false,
      phase: 'done',
      status: 'done',
      message: '字符串数组为空，返回空字符串 ""。',
      log: '空数组 -> ""',
      codeLine: 2,
    });
    return steps;
  }

  const baseStr = strs[0];

  steps.push({
    strs,
    col: -1,
    row: -1,
    char: null,
    matchedLen: 0,
    prefix: '',
    isMismatch: false,
    phase: 'init',
    status: 'init',
    message: `初始化纵向扫描：以基准字符串 strs[0] = "${baseStr}" 为基准，逐列比对 ${strs.length} 个字符串。`,
    log: `初始化矩阵扫描 (基准: "${baseStr}")`,
    codeLine: 2,
  });

  for (let col = 0; col < baseStr.length; col++) {
    const c = baseStr[col];

    steps.push({
      strs,
      col,
      row: 0,
      char: c,
      matchedLen: col,
      prefix: baseStr.substring(0, col),
      isMismatch: false,
      phase: 'scan-col',
      status: 'scan-col',
      message: `开始第 ${col} 列扫描：基准字符 strs[0][${col}] = '${c}'。`,
      log: `第 ${col} 列: 基准字符 '${c}'`,
      codeLine: [3, 4],
    });

    for (let row = 1; row < strs.length; row++) {
      const curStr = strs[row];

      if (col === curStr.length || curStr[col] !== c) {
        const mismatchReason =
          col === curStr.length
            ? `已到达 strs[${row}] ("${curStr}") 的末尾`
            : `字符不匹配 (strs[${row}][${col}] = '${curStr[col]}' != '${c}')`;

        steps.push({
          strs,
          col,
          row,
          char: c,
          matchedLen: col,
          prefix: baseStr.substring(0, col),
          isMismatch: true,
          phase: 'mismatch',
          status: 'mismatch',
          message: `⚠️ 在 strs[${row}] 第 ${col} 列发现失配：${mismatchReason}。最长公共前缀在此终止。`,
          log: `✗ 失配终止于 [${row}][${col}]: 前缀 "${baseStr.substring(0, col)}"`,
          codeLine: [5, 6],
        });

        const finalPrefix = baseStr.substring(0, col);
        steps.push({
          strs,
          col,
          row,
          char: c,
          matchedLen: col,
          prefix: finalPrefix,
          isMismatch: false,
          phase: 'done',
          status: 'done',
          message: `🎉 扫描结束！最长公共前缀为 "${finalPrefix}"。`,
          log: `✓ 最长公共前缀: "${finalPrefix}"`,
          codeLine: 6,
        });
        return steps;
      }

      steps.push({
        strs,
        col,
        row,
        char: c,
        matchedLen: col,
        prefix: baseStr.substring(0, col),
        isMismatch: false,
        phase: 'compare-cell',
        status: 'compare-cell',
        message: `比对 strs[${row}][${col}] = '${curStr[col]}' == '${c}'：字符一致。`,
        log: `匹配: strs[${row}][${col}] == '${c}'`,
        codeLine: [4, 5],
      });
    }
  }

  // 完整匹配基准串
  steps.push({
    strs,
    col: baseStr.length,
    row: strs.length - 1,
    char: null,
    matchedLen: baseStr.length,
    prefix: baseStr,
    isMismatch: false,
    phase: 'done',
    status: 'done',
    message: `🎉 所有列均全部匹配成功！基准字符串 "${baseStr}" 本身即为最长公共前缀。`,
    log: `✓ 全匹配: "${baseStr}"`,
    codeLine: 11,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: LCPStep[]): LCPStep[] {
  return steps.map((s) => {
    const action =
      s.row >= 0 && s.col >= 0 && s.phase !== 'done'
        ? `strs[${s.row}][${s.col}] == strs[0][${s.col}] ('${s.char}')`
        : 'strs[row][col] == strs[0][col]';

    return {
      ...s,
      metrics: {
        col: s.col >= 0 && s.phase !== 'done' ? String(s.col) : '—',
        row: s.row >= 0 && s.phase !== 'done' ? String(s.row) : '—',
        char: s.char ? `'${s.char}'` : '—',
        prefix: s.prefix ? `"${s.prefix}"` : '""',
        action,
      },
    };
  });
}

/** 主视觉：多字符串矩阵纵向逐列扫描 */
export function renderLongestCommonPrefixCanvas(container: HTMLElement, step: LCPStep): void {
  const { strs, col, row, matchedLen, isMismatch, phase } = step;

  const rowsHtml = strs
    .map((str, rIdx) => {
      const cellsHtml = str
        .split('')
        .map((ch, cIdx) => {
          const inCurCol = cIdx === col && phase !== 'done';
          const isActiveCell = rIdx === row && cIdx === col;
          const isMatchedPrefix = cIdx < matchedLen;
          const isCellMismatch = isMismatch && rIdx === row && cIdx === col;

          let style =
            'width: 28px; height: 30px; border-radius: 6px; background: #ffffff; border: 1.5px solid #cbd5e1; display: inline-flex; align-items: center; justify-content: center; font-family: \'JetBrains Mono\', monospace; font-size: 12.5px; font-weight: 700; color: #334155; transition: all 0.15s;';
          if (isCellMismatch) {
            style += ' background: #fef2f2; border-color: #ef4444; color: #b91c1c;';
          } else if (isMatchedPrefix) {
            style += ' background: #ecfdf5; border-color: #10b981; color: #047857;';
          } else if (isActiveCell) {
            style += ' background: #dbeafe; border-color: #2563eb; color: #1e40af; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.25);';
          } else if (inCurCol) {
            style += ' background: #eff6ff; border-color: #93c5fd; color: #1d4ed8;';
          }

          return `<div style="${style}"><span>${ch}</span></div>`;
        })
        .join('');

      return `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 10.5px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #64748b; min-width: 60px;">strs[${rIdx}]:</span>
          <div style="display: flex; gap: 4px;">${cellsHtml}</div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; padding: 10px 12px; box-sizing: border-box; overflow: auto;">
      <div style="display: flex; flex-direction: column; gap: 6px; width: 100%; max-width: 440px;">
        ${rowsHtml}
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'longest-common-prefix',
  name: '最长公共前缀（逐列扫描）',
  category: 'string',
  description: '以第一个字符串为基准，逐列比对找公共前缀',
  icon: '📖',
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '理解逐字符纵向比较求公共前缀的思路',
  inputs: [
    {
      id: 'strs',
      label: '字符串列表',
      type: 'text',
      defaultValue: 'flower, flow, flight',
      placeholder: '逗号分隔',
    },
  ],
  presets: [
    { label: '示例 1: (["flower","flow","flight"] -> "fl")', values: { strs: 'flower, flow, flight' } },
    { label: '示例 2: (无前缀 -> "")', values: { strs: 'dog, racecar, car' } },
    { label: '长前缀: (-> "inters")', values: { strs: 'interspecies, interstellar, interstate' } },
    { label: '全相同: (-> "prefix")', values: { strs: 'prefix, prefix, prefix' } },
  ],
  metrics: [
    { id: 'col', label: '当前列 col', color: '#2563eb' },
    { id: 'row', label: '当前行 row', color: '#9333ea' },
    { id: 'char', label: '基准字符 char', color: '#f59e0b' },
    { id: 'prefix', label: '当前前缀结果', color: '#10b981' },
    { id: 'action', label: '列比对', color: '#2563eb' },
  ],
  legend: [
    { label: '当前列 col', color: '#2563eb' },
    { label: '公共前缀', color: '#10b981' },
    { label: '失配列', color: '#ef4444' },
  ],
  codeLanguages: LONGEST_COMMON_PREFIX_CODE_LANGUAGES,
  problemHtml: LONGEST_COMMON_PREFIX_PROBLEM_HTML,
  analysisHtml: LONGEST_COMMON_PREFIX_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(buildLCPSteps(parseStringList(String(inputs.strs ?? 'flower, flow, flight')))),
  renderCanvas: (container, step) =>
    renderLongestCommonPrefixCanvas(container, step as LCPStep),
});
