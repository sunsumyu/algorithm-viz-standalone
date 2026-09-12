/**
 * 摆动序列可视化器（贪心算法）— 4-Card 标准现代架构
 * LeetCode 376：贪心删除单调坡与平坡中间节点，统计波峰波谷数量
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  WIGGLE_SUBSEQUENCE_PROBLEM_HTML,
  WIGGLE_SUBSEQUENCE_ANALYSIS_HTML,
  WIGGLE_SUBSEQUENCE_CODE_LANGUAGES,
} from './wiggle-subsequence-problem-content';

export interface WiggleStep {
  array: number[];
  currentIndex: number;
  length: number;
  trend: '↑' | '↓' | '-';
  curDiff: number;
  prevDiff: number;
  wiggleIndices: number[];
  skippedIndices: number[];
  message: string;
  action: 'init' | 'peak_or_valley' | 'flat_or_mono' | 'done';
  codeLine: number;
  metrics?: Record<string, string>;
  log?: string;
}

export function wiggleSubsequenceSteps(nums: number[]): WiggleStep[] {
  const steps: WiggleStep[] = [];
  const n = nums.length;

  if (n <= 1) {
    steps.push({
      array: [...nums],
      currentIndex: 0,
      length: n,
      trend: '-',
      curDiff: 0,
      prevDiff: 0,
      wiggleIndices: n === 1 ? [0] : [],
      skippedIndices: [],
      message: n === 0 ? '空数组，摆动长度为 0' : `单元素数组 [${nums[0]}]，摆动长度为 1`,
      action: 'done',
      codeLine: 2,
    });
    return steps;
  }

  let count = 1;
  let prevDiff = 0;
  const wiggleIndices: number[] = [0];
  const skippedIndices: number[] = [];

  steps.push({
    array: [...nums],
    currentIndex: 0,
    length: count,
    trend: '-',
    curDiff: 0,
    prevDiff: 0,
    wiggleIndices: [...wiggleIndices],
    skippedIndices: [...skippedIndices],
    message: `初始化：默认选中首元素 nums[0]=${nums[0]}，当前摆动序列长度 = 1`,
    action: 'init',
    codeLine: 4,
  });

  for (let i = 0; i < n - 1; i++) {
    const curDiff = nums[i + 1] - nums[i];
    let trend: '↑' | '↓' | '-' = '-';
    if (curDiff > 0) trend = '↑';
    else if (curDiff < 0) trend = '↓';

    const isPeakOrValley = (prevDiff <= 0 && curDiff > 0) || (prevDiff >= 0 && curDiff < 0);

    if (isPeakOrValley) {
      count++;
      wiggleIndices.push(i + 1);

      steps.push({
        array: [...nums],
        currentIndex: i + 1,
        length: count,
        trend,
        curDiff,
        prevDiff,
        wiggleIndices: [...wiggleIndices],
        skippedIndices: [...skippedIndices],
        message: `检查差值：prevDiff=${prevDiff}，curDiff=${curDiff} (${trend}) → 出现摆动转折峰谷！保留节点 nums[${i + 1}]=${nums[i + 1]}，长度更新为 ${count}`,
        action: 'peak_or_valley',
        codeLine: 7,
      });

      prevDiff = curDiff;
    } else {
      skippedIndices.push(i + 1);

      steps.push({
        array: [...nums],
        currentIndex: i + 1,
        length: count,
        trend,
        curDiff,
        prevDiff,
        wiggleIndices: [...wiggleIndices],
        skippedIndices: [...skippedIndices],
        message: `检查差值：prevDiff=${prevDiff}，curDiff=${curDiff} (${trend}) → 单调斜坡/平坡连续延伸，贪心过滤中间节点 nums[${i + 1}]=${nums[i + 1]}`,
        action: 'flat_or_mono',
        codeLine: 6,
      });
    }
  }

  steps.push({
    array: [...nums],
    currentIndex: n - 1,
    length: count,
    trend: '-',
    curDiff: 0,
    prevDiff,
    wiggleIndices: [...wiggleIndices],
    skippedIndices: [...skippedIndices],
    message: `遍历完成！最长摆动子序列长度为 ${count}，选中节点集合: [${wiggleIndices.map((idx) => nums[idx]).join(', ')}]`,
    action: 'done',
    codeLine: 12,
  });

  return steps;
}


/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: WiggleStep[]): WiggleStep[] {
  return steps.map((s) => {
    const isPeak = s.action === 'peak_or_valley';
    const isFlat = s.action === 'flat_or_mono';

    let action = '🏁 初始起点';
    if (isPeak) action = '⛰️ 构成波峰/波谷 (保留)';
    else if (isFlat) action = '🚫 单调坡/平坡 (删除)';
    else if (s.action === 'done') action = '🎉 完成';

    const diffText = s.curDiff > 0 ? `+${s.curDiff} (↑ 上升)` : s.curDiff < 0 ? `${s.curDiff} (↓ 下降)` : '0 (平坡)';

    return {
      ...s,
      log: s.message,
      metrics: {
        'cur-diff': diffText,
        'prev-diff': String(s.prevDiff),
        'wiggle-len': String(s.length),
        sequence: `[${s.wiggleIndices.map((i) => s.array[i]).join(', ')}]`,
        action,
      },
    };
  });
}

/** 主视觉：波形折线图沙盘 (SVG) */
export function renderWiggleSubsequenceCanvas(container: HTMLElement, step: WiggleStep): void {
  const arr = step.array;
  const n = arr.length;

  if (n === 0) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const minVal = Math.min(...arr);
  const maxVal = Math.max(...arr);
  const valRange = maxVal - minVal || 1;

  const svgWidth = 420;
  const svgHeight = 160;
  const padX = 30;
  const padY = 25;

  const points = arr.map((val, idx) => {
    const x = padX + (idx / Math.max(1, n - 1)) * (svgWidth - padX * 2);
    const y = svgHeight - padY - ((val - minVal) / valRange) * (svgHeight - padY * 2);
    return { x, y, val, idx };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const nodesSvg = points
    .map((p) => {
      const isWiggle = step.wiggleIndices.includes(p.idx);
      const isSkipped = step.skippedIndices.includes(p.idx);
      const isCurrent = p.idx === step.currentIndex && step.action !== 'done';

      let stroke = '#cbd5e1';
      let fill = '#ffffff';
      let r = 5;

      if (isCurrent) {
        stroke = '#2563eb';
        fill = '#3b82f6';
        r = 8;
      } else if (isWiggle) {
        stroke = '#059669';
        fill = '#10b981';
        r = 6.5;
      } else if (isSkipped) {
        stroke = '#94a3b8';
        fill = '#e2e8f0';
        r = 4;
      }

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
          <text x="${p.x}" y="${p.y - 10}" fill="${isWiggle ? '#059669' : '#64748b'}" font-size="10.5" font-family="JetBrains Mono" font-weight="${isWiggle ? '800' : '600'}" text-anchor="middle">
            ${p.val}
          </text>
          <text x="${p.x}" y="${svgHeight - 6}" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono" text-anchor="middle">
            [${p.idx}]
          </text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 10px; box-sizing: border-box;">
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: 100%; overflow: visible;" preserveAspectRatio="xMidYMid meet">
        <line x1="${padX}" y1="${svgHeight - padY}" x2="${svgWidth - padX}" y2="${svgHeight - padY}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3 3" />
        <line x1="${padX}" y1="${padY}" x2="${svgWidth - padX}" y2="${padY}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3 3" />
        <path d="${linePath}" fill="none" stroke="#93c5fd" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
        ${nodesSvg}
      </svg>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'wiggle-subsequence',
  name: '摆动序列',
  category: 'greedy',
  description: '求最长摆动子序列，贪心过滤单调坡度与平坡，只统计波峰波谷',
  icon: '〰️',
  difficulty: 2,
  levelOrder: 2,
  learningGoal: '掌握贪心算法在波形折线分析中的局部最优（保留峰谷）到全局最长的转化',
  inputs: [
    {
      id: 'nums',
      label: '整数序列',
      type: 'text',
      defaultValue: '1,7,4,9,2,5',
      placeholder: '逗号分隔数字',
    },
  ],
  presets: [
    { label: '示例 1', values: { nums: '1,7,4,9,2,5' } },
    { label: '示例 2', values: { nums: '1,17,5,10,13,15,10,5,16,8' } },
    { label: '含平坡测试', values: { nums: '1,2,2,2,3,4' } },
  ],
  metrics: [
    { id: 'cur-diff', label: '当前差值 curDiff', color: '#2563eb' },
    { id: 'prev-diff', label: '上一摆动差值 preDiff', color: '#64748b' },
    { id: 'wiggle-len', label: '当前摆动长度', color: '#0f172a' },
    { id: 'sequence', label: '摆动子序列', color: '#059669' },
    { id: 'action', label: '摆动判定', color: '#2563eb' },
  ],
  legend: [
    { label: '📍 当前考察', color: '#3b82f6' },
    { label: '✓ 保留峰谷', color: '#10b981' },
    { label: '✗ 删除节点', color: '#94a3b8' },
  ],
  codeLanguages: WIGGLE_SUBSEQUENCE_CODE_LANGUAGES,
  problemHtml: WIGGLE_SUBSEQUENCE_PROBLEM_HTML,
  analysisHtml: WIGGLE_SUBSEQUENCE_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const nums = String(inputs.nums ?? '1,7,4,9,2,5')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    return withMetrics(wiggleSubsequenceSteps(nums.length ? nums : [1, 7, 4, 9, 2, 5]));
  },
  renderCanvas: (container, step) => renderWiggleSubsequenceCanvas(container, step as WiggleStep),
});
