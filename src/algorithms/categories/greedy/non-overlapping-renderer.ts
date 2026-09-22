/**
 * 无重叠区间可视化器（贪心算法）— 声明式 4-Card 标准架构
 * LeetCode 435：按左端点升序排序，重叠时贪心移除右端点更大的区间，求最少移除数
 */

import { registerAlgorithm } from '../../../core/registry';
import { UniversalStageVisualizer } from '../dynamic-programming/unique-paths-renderer';
import type { HighlightTarget } from '../../../core/step-visualizer';
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
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export const NON_OVERLAPPING_CODE_LINES: Record<string, HighlightTarget> = {
  guard: { java: 2, cpp: 4, python: 3, javascript: 2 },
  sort: { java: 4, cpp: 5, python: 5, javascript: 3 },
  keep: { java: 7, cpp: 10, python: 8, javascript: 6 },
  remove: { java: 8, cpp: 11, python: 9, javascript: 7 },
  done: { java: 13, cpp: 15, python: 11, javascript: 11 },
};

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
      codeLine: NON_OVERLAPPING_CODE_LINES.guard,
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
    codeLine: NON_OVERLAPPING_CODE_LINES.sort,
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
        codeLine: NON_OVERLAPPING_CODE_LINES.remove,
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
        codeLine: NON_OVERLAPPING_CODE_LINES.keep,
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
    codeLine: NON_OVERLAPPING_CODE_LINES.done,
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

registerAlgorithm({
  id: 'non-overlapping',
  name: '无重叠区间',
  viewId: 'non-overlapping',
  category: 'greedy',
  icon: '✂️',
  difficulty: 2,
  levelOrder: 9,
  learningGoal: '掌握区间调度与重叠淘汰的贪心思想，建立与射气球问题的双向映射',
  description: '求使剩余区间互不重叠所需移除的最小区间数量，重叠时贪心淘汰右端点更大者',
  template: `<div id="non-overlapping" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerNonOverlapping(): void {
  // 保持向前兼容导出
}
