/**
 * 无重叠区间可视化器（贪心算法）— 声明式 4-Card 标准架构
 * LeetCode 435：按左端点升序排序，重叠时贪心移除右端点更大的区间，求最少移除数
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  NON_OVERLAPPING_PROBLEM_HTML,
  NON_OVERLAPPING_ANALYSIS_HTML,
  NON_OVERLAPPING_CODE_LANGUAGES,
} from './non-overlapping-problem-content';

export interface NonOverlappingStep {
  intervals: Array<[number, number]>;
  currentIndex: number;
  removedCount: number;
  removedIndices: number[];
  keptIndices: number[];
  currentEnd: number;
  action: 'init' | 'sort' | 'keep' | 'remove' | 'done';
  message: string;
  codeLine: number;
  metrics?: Record<string, string>;
}

export function buildNonOverlappingSteps(rawIntervals: Array<[number, number]>): NonOverlappingStep[] {
  const steps: NonOverlappingStep[] = [];
  const n = rawIntervals.length;

  if (n === 0) {
    steps.push({
      intervals: [],
      currentIndex: -1,
      removedCount: 0,
      removedIndices: [],
      keptIndices: [],
      currentEnd: 0,
      action: 'done',
      message: '输入为空，需移除区间数为 0',
      codeLine: 2,
    });
    return steps;
  }

  // 1. 按左边界升序排序
  const intervals = rawIntervals.map(([s, e]) => [s, e] as [number, number]).sort((a, b) => a[0] - b[0]);
  let count = 0;
  const removedIndices: number[] = [];
  const keptIndices: number[] = [0];

  steps.push({
    intervals: intervals.map(([s, e]) => [s, e]),
    currentIndex: 0,
    removedCount: 0,
    removedIndices: [],
    keptIndices: [0],
    currentEnd: intervals[0][1],
    action: 'sort',
    message: `第 1 步：按左边界升序排序：${intervals.map((i) => `[${i[0]},${i[1]}]`).join(', ')}，默认保留首个区间`,
    codeLine: 4,
  });

  for (let i = 1; i < n; i++) {
    const cur = intervals[i];
    const prevEnd = intervals[i - 1][1];

    if (cur[0] < prevEnd) {
      count++;
      removedIndices.push(i);
      intervals[i][1] = Math.min(prevEnd, cur[1]);

      steps.push({
        intervals: intervals.map(([s, e]) => [s, e]),
        currentIndex: i,
        removedCount: count,
        removedIndices: [...removedIndices],
        keptIndices: [...keptIndices],
        currentEnd: intervals[i][1],
        action: 'remove',
        message: `🗑️ 发生重叠！区间 [${i}]=[${cur[0]}, ${cur[1]}] 左端点 ${cur[0]} < 前界 ${prevEnd}，贪心移除右界较大者，累计移除 ${count} 个`,
        codeLine: 8,
      });
    } else {
      keptIndices.push(i);

      steps.push({
        intervals: intervals.map(([s, e]) => [s, e]),
        currentIndex: i,
        removedCount: count,
        removedIndices: [...removedIndices],
        keptIndices: [...keptIndices],
        currentEnd: cur[1],
        action: 'keep',
        message: `✓ 互不重叠！区间 [${i}]=[${cur[0]}, ${cur[1]}] 左端点 ${cur[0]} &ge; ${prevEnd}，安全保留`,
        codeLine: 7,
      });
    }
  }

  steps.push({
    intervals: intervals.map(([s, e]) => [s, e]),
    currentIndex: n - 1,
    removedCount: count,
    removedIndices: [...removedIndices],
    keptIndices: [...keptIndices],
    currentEnd: intervals[n - 1][1],
    action: 'done',
    message: `🎉 扫描完成！最少需要移除 ${count} 个区间，剩余 ${n - count} 个区间互不重叠`,
    codeLine: 12,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: NonOverlappingStep[]): NonOverlappingStep[] {
  return steps.map((s) => {
    const isRemove = s.action === 'remove';
    const isKeep = s.action === 'keep';

    let action = '🔍 初始化';
    if (isRemove) action = '🗑️ 发生重叠 (移除右界大者)';
    else if (isKeep) action = '✓ 无重叠 (保留)';
    else if (s.action === 'sort') action = '↕️ 排序 + 默认保留首区间';
    else if (s.action === 'done') action = '🏁 扫描完成';

    const cur = s.currentIndex >= 0 && s.currentIndex < s.intervals.length ? s.intervals[s.currentIndex] : null;

    return {
      ...s,
      log: s.message,
      metrics: {
        'cur-interval': cur ? `[${cur[0]}, ${cur[1]}]` : '—',
        'cur-end': `x = ${s.currentEnd}`,
        'removed-count': `${s.removedCount} 个`,
        'kept-count': `${s.intervals.length - s.removedCount} 个`,
        action,
      },
    };
  });
}

export function renderNonOverlappingCanvas(container: HTMLElement, step: NonOverlappingStep): void {
  const intervals = step.intervals;
  const n = intervals.length;

  if (n === 0) {
    container.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const minX = Math.min(...intervals.map((b) => b[0]));
  const maxX = Math.max(...intervals.map((b) => b[1]));
  const xRange = maxX - minX || 1;

  const svgWidth = 420;
  const svgHeight = 160;
  const padX = 35;
  const rowHeight = Math.min(24, (svgHeight - 40) / n);

  const intervalSvgs = intervals
    .map(([s, e], idx) => {
      const x1 = padX + ((s - minX) / xRange) * (svgWidth - padX * 2);
      const x2 = padX + ((e - minX) / xRange) * (svgWidth - padX * 2);
      const width = Math.max(12, x2 - x1);
      const y = 20 + idx * rowHeight;

      const isCurrent = idx === step.currentIndex && step.action !== 'done';
      const isRemoved = step.removedIndices.includes(idx);
      const isKept = step.keptIndices.includes(idx);

      let fill = '#f1f5f9';
      let stroke = '#cbd5e1';
      let textColor = '#64748b';
      let dash = '';

      if (isCurrent) {
        fill = '#dbeafe';
        stroke = '#2563eb';
        textColor = '#1d4ed8';
      } else if (isRemoved) {
        fill = '#fee2e2';
        stroke = '#ef4444';
        textColor = '#dc2626';
        dash = 'stroke-dasharray="3 2"';
      } else if (isKept) {
        fill = '#ecfdf5';
        stroke = '#10b981';
        textColor = '#059669';
      }

      return `
        <g>
          <rect x="${x1}" y="${y}" width="${width}" height="${rowHeight - 6}" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="1.5" ${dash} />
          <text x="${x1 + width / 2}" y="${y + rowHeight / 2 - 1}" fill="${textColor}" font-size="9.5" font-family="JetBrains Mono" font-weight="700" text-anchor="middle" dominant-baseline="middle">
            ${isRemoved ? '❌ ' : isKept ? '✓ ' : ''}[${s}, ${e}]
          </text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 8px; box-sizing: border-box;">
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: 100%; overflow: visible;" preserveAspectRatio="xMidYMid meet">
        <!-- 底部坐标标尺 -->
        <line x1="${padX}" y1="${svgHeight - 15}" x2="${svgWidth - padX}" y2="${svgHeight - 15}" stroke="#cbd5e1" stroke-width="1.5" />
        <text x="${padX}" y="${svgHeight - 2}" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono">x=${minX}</text>
        <text x="${svgWidth - padX}" y="${svgHeight - 2}" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono" text-anchor="end">x=${maxX}</text>

        <!-- 区间块 -->
        ${intervalSvgs}
      </svg>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'non-overlapping',
  name: '无重叠区间',
  category: 'greedy',
  description: '求使剩余区间互不重叠所需移除的最小区间数量，重叠时贪心淘汰右端点更大者',
  icon: '✂️',
  difficulty: 2,
  levelOrder: 9,
  learningGoal: '掌握区间调度与重叠淘汰的贪心思想，建立与射气球问题的双向映射',
  inputs: [
    {
      id: 'intervals',
      label: '区间集合',
      type: 'text',
      defaultValue: '[[1,2],[2,3],[3,4],[1,3]]',
      placeholder: '[[1,2],[2,3],[3,4],[1,3]]',
    },
  ],
  presets: [
    { label: '示例 1 (移除 1)', values: { intervals: '[[1,2],[2,3],[3,4],[1,3]]' } },
    { label: '全重叠 (移除 2)', values: { intervals: '[[1,2],[1,2],[1,2]]' } },
    { label: '无重叠 (移除 0)', values: { intervals: '[[1,2],[2,3]]' } },
  ],
  metrics: [
    { id: 'cur-interval', label: '当前考察区间', color: '#2563eb' },
    { id: 'cur-end', label: '活跃保留右界', color: '#059669' },
    { id: 'removed-count', label: '最少移除区间数', color: '#ef4444' },
    { id: 'kept-count', label: '最终保留区间数', color: '#10b981' },
    { id: 'action', label: '判定决策', color: '#2563eb' },
  ],
  legend: [
    { label: '✓ 保留区间', color: '#10b981' },
    { label: '🗑️ 移除区间', color: '#ef4444' },
    { label: '📍 当前考察区间', color: '#3b82f6' },
  ],
  codeLanguages: NON_OVERLAPPING_CODE_LANGUAGES,
  problemHtml: NON_OVERLAPPING_PROBLEM_HTML,
  analysisHtml: NON_OVERLAPPING_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    let intervals: Array<[number, number]> = [];
    try {
      const parsed = JSON.parse(String(inputs.intervals ?? '[[1,2],[2,3],[3,4],[1,3]]'));
      if (Array.isArray(parsed) && parsed.every((p) => Array.isArray(p) && p.length >= 2)) {
        intervals = parsed.map((p) => [Number(p[0]), Number(p[1])]);
      }
    } catch {
      intervals = [
        [1, 2],
        [2, 3],
        [3, 4],
        [1, 3],
      ];
    }
    return withMetrics(
      buildNonOverlappingSteps(
        intervals.length
          ? intervals
          : [
              [1, 2],
              [2, 3],
              [3, 4],
              [1, 3],
            ]
      )
    );
  },
  renderCanvas: (container, step) => renderNonOverlappingCanvas(container, step as NonOverlappingStep),
});
