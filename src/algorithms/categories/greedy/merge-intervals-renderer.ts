/**
 * 合并区间可视化器（贪心算法）— 声明式 4-Card 标准架构
 * LeetCode 56：左端点升序排序 + 重叠时贪心扩展右边界 + 不重叠追加新区间
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  MERGE_INTERVALS_PROBLEM_HTML,
  MERGE_INTERVALS_ANALYSIS_HTML,
  MERGE_INTERVALS_CODE_LANGUAGES,
} from './merge-intervals-problem-content';

export interface MergeStep {
  intervals: Array<[number, number]>;
  result: Array<[number, number]>;
  currentIndex: number;
  action: 'init' | 'sort' | 'merge' | 'append' | 'done';
  message: string;
  codeLine: number;
  metrics?: Record<string, string>;
}

export function buildMergeIntervalsSteps(rawIntervals: Array<[number, number]>): MergeStep[] {
  const steps: MergeStep[] = [];
  const n = rawIntervals.length;

  if (n === 0) {
    steps.push({
      intervals: [],
      result: [],
      currentIndex: -1,
      action: 'done',
      message: '输入为空，返回空数组',
      codeLine: 2,
    });
    return steps;
  }

  // 1. 按左边界升序排序
  const intervals = rawIntervals.map(([s, e]) => [s, e] as [number, number]).sort((a, b) => a[0] - b[0]);
  const result: Array<[number, number]> = [[intervals[0][0], intervals[0][1]]];

  steps.push({
    intervals: intervals.map(([s, e]) => [s, e]),
    result: result.map(([s, e]) => [s, e]),
    currentIndex: 0,
    action: 'sort',
    message: `第 1 步：按左边界升序排序：${intervals.map((i) => `[${i[0]},${i[1]}]`).join(', ')}，将首个区间 [${intervals[0][0]}, ${intervals[0][1]}] 放入结果集`,
    codeLine: 5,
  });

  for (let i = 1; i < n; i++) {
    const cur = intervals[i];
    const last = result[result.length - 1];

    if (cur[0] <= last[1]) {
      const oldEnd = last[1];
      last[1] = Math.max(last[1], cur[1]);

      steps.push({
        intervals: intervals.map(([s, e]) => [s, e]),
        result: result.map(([s, e]) => [s, e]),
        currentIndex: i,
        action: 'merge',
        message: `🧩 发生重叠！区间 [${i}]=[${cur[0]}, ${cur[1]}] 左端点 ${cur[0]} &le; 末尾右界 ${oldEnd}，贪心扩展右界至 max(${oldEnd}, ${cur[1]}) = ${last[1]}`,
        codeLine: 9,
      });
    } else {
      result.push([cur[0], cur[1]]);

      steps.push({
        intervals: intervals.map(([s, e]) => [s, e]),
        result: result.map(([s, e]) => [s, e]),
        currentIndex: i,
        action: 'append',
        message: `➕ 不重叠！区间 [${i}]=[${cur[0]}, ${cur[1]}] 左端点 ${cur[0]} > 末尾右界 ${last[1]}，直接追加到结果集`,
        codeLine: 11,
      });
    }
  }

  steps.push({
    intervals: intervals.map(([s, e]) => [s, e]),
    result: result.map(([s, e]) => [s, e]),
    currentIndex: n - 1,
    action: 'done',
    message: `🎉 合并完成！原始 ${n} 个区间最终合并为 ${result.length} 个不重叠区间：${result.map((i) => `[${i[0]},${i[1]}]`).join(', ')}`,
    codeLine: 14,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: MergeStep[]): MergeStep[] {
  return steps.map((s) => {
    const isMerge = s.action === 'merge';
    const isAppend = s.action === 'append';

    let action = '🔍 初始化';
    if (isMerge) action = '🧩 发生重叠 (合并扩界)';
    else if (isAppend) action = '➕ 无重叠 (追加新区间)';
    else if (s.action === 'sort') action = '↕️ 排序 + 放入首区间';
    else if (s.action === 'done') action = '🏁 合并完成';

    const cur = s.currentIndex >= 0 && s.currentIndex < s.intervals.length ? s.intervals[s.currentIndex] : null;
    const last = s.result.length ? s.result[s.result.length - 1] : null;

    return {
      ...s,
      log: s.message,
      metrics: {
        'cur-interval': cur ? `[${cur[0]}, ${cur[1]}]` : '—',
        'last-interval': last ? `[${last[0]}, ${last[1]}]` : '—',
        'merged-count': `${s.result.length} 个`,
        'merged-list': s.result.map((i) => `[${i[0]},${i[1]}]`).join(', ') || '—',
        action,
      },
    };
  });
}

export function renderMergeIntervalsCanvas(container: HTMLElement, step: MergeStep): void {
  const intervals = step.intervals;
  const result = step.result;
  const n = intervals.length;

  if (n === 0) {
    container.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const allNums = [...intervals.flat(), ...(result.length ? result.flat() : [])];
  const minX = Math.min(...allNums);
  const maxX = Math.max(...allNums);
  const xRange = maxX - minX || 1;

  const svgWidth = 420;
  const svgHeight = 160;
  const padX = 35;

  // 上轨道：原始区间
  const origHeight = Math.min(18, 55 / n);
  const origSvgs = intervals
    .map(([s, e], idx) => {
      const x1 = padX + ((s - minX) / xRange) * (svgWidth - padX * 2);
      const x2 = padX + ((e - minX) / xRange) * (svgWidth - padX * 2);
      const width = Math.max(10, x2 - x1);
      const y = 20 + idx * origHeight;

      const isCurrent = idx === step.currentIndex && step.action !== 'done';
      const fill = isCurrent ? '#dbeafe' : '#f1f5f9';
      const stroke = isCurrent ? '#2563eb' : '#cbd5e1';
      const textColor = isCurrent ? '#1d4ed8' : '#64748b';

      return `
        <g>
          <rect x="${x1}" y="${y}" width="${width}" height="${origHeight - 4}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="1.5" />
          <text x="${x1 + width / 2}" y="${y + origHeight / 2 - 1}" fill="${textColor}" font-size="8.5" font-family="JetBrains Mono" font-weight="700" text-anchor="middle" dominant-baseline="middle">
            [${s}, ${e}]
          </text>
        </g>
      `;
    })
    .join('');

  // 下轨道：合并后结果
  const resSvgs = result
    .map(([s, e], idx) => {
      const x1 = padX + ((s - minX) / xRange) * (svgWidth - padX * 2);
      const x2 = padX + ((e - minX) / xRange) * (svgWidth - padX * 2);
      const width = Math.max(12, x2 - x1);
      const y = 100;

      const isLast = idx === result.length - 1;
      const fill = isLast ? '#d1fae5' : '#ecfdf5';
      const stroke = isLast ? '#059669' : '#10b981';

      return `
        <g>
          <rect x="${x1}" y="${y}" width="${width}" height="24" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="2" />
          <text x="${x1 + width / 2}" y="${y + 12}" fill="#065f46" font-size="10" font-family="JetBrains Mono" font-weight="800" text-anchor="middle" dominant-baseline="middle">
            [${s}, ${e}]
          </text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 8px; box-sizing: border-box;">
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: 100%; overflow: visible;" preserveAspectRatio="xMidYMid meet">
        <!-- 上下分界提示 -->
        <text x="${padX}" y="12" fill="#64748b" font-size="8.5" font-weight="700">原始输入区间 (待扫描)</text>
        <text x="${padX}" y="92" fill="#059669" font-size="8.5" font-weight="800">已合并区间集合 (merged)</text>

        <!-- 坐标轴 -->
        <line x1="${padX}" y1="${svgHeight - 12}" x2="${svgWidth - padX}" y2="${svgHeight - 12}" stroke="#cbd5e1" stroke-width="1.5" />
        <text x="${padX}" y="${svgHeight - 2}" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono">x=${minX}</text>
        <text x="${svgWidth - padX}" y="${svgHeight - 2}" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono" text-anchor="end">x=${maxX}</text>

        <!-- 区间条 -->
        ${origSvgs}
        ${resSvgs}
      </svg>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'merge-intervals',
  name: '合并区间',
  category: 'greedy',
  description: '按左端点升序排序，遍历合并所有重叠区间，动态扩展当前重叠最大右端点',
  icon: '🧩',
  difficulty: 2,
  levelOrder: 11,
  learningGoal: '掌握区间合并标准贪心流程，学会维护合并结果集末尾区间的动态扩界技巧',
  inputs: [
    {
      id: 'intervals',
      label: '区间集合',
      type: 'text',
      defaultValue: '[[1,3],[2,6],[8,10],[15,18]]',
      placeholder: '[[1,3],[2,6],[8,10],[15,18]]',
    },
  ],
  presets: [
    { label: '示例 1 (3 个)', values: { intervals: '[[1,3],[2,6],[8,10],[15,18]]' } },
    { label: '邻接合并 (1 个)', values: { intervals: '[[1,4],[4,5]]' } },
    { label: '完全包含 (1 个)', values: { intervals: '[[1,4],[2,3]]' } },
  ],
  metrics: [
    { id: 'cur-interval', label: '当前考察区间', color: '#2563eb' },
    { id: 'last-interval', label: '结果集末尾区间', color: '#059669' },
    { id: 'merged-count', label: '合并后区间数', color: '#10b981' },
    { id: 'merged-list', label: '合并结果集合', color: '#334155' },
    { id: 'action', label: '操作决策', color: '#2563eb' },
  ],
  legend: [
    { label: '📍 原始区间', color: '#3b82f6' },
    { label: '✓ 合并后结果', color: '#10b981' },
  ],
  codeLanguages: MERGE_INTERVALS_CODE_LANGUAGES,
  problemHtml: MERGE_INTERVALS_PROBLEM_HTML,
  analysisHtml: MERGE_INTERVALS_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    let intervals: Array<[number, number]> = [];
    try {
      const parsed = JSON.parse(String(inputs.intervals ?? '[[1,3],[2,6],[8,10],[15,18]]'));
      if (Array.isArray(parsed) && parsed.every((p) => Array.isArray(p) && p.length >= 2)) {
        intervals = parsed.map((p) => [Number(p[0]), Number(p[1])]);
      }
    } catch {
      intervals = [
        [1, 3],
        [2, 6],
        [8, 10],
        [15, 18],
      ];
    }
    return withMetrics(
      buildMergeIntervalsSteps(
        intervals.length
          ? intervals
          : [
              [1, 3],
              [2, 6],
              [8, 10],
              [15, 18],
            ]
      )
    );
  },
  renderCanvas: (container, step) => renderMergeIntervalsCanvas(container, step as MergeStep),
});
