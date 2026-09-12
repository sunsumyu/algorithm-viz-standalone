/**
 * 用最少数量的箭引爆气球可视化器（贪心算法）— 4-Card 标准现代架构
 * LeetCode 452：左端点升序排序 + 重叠气球右边界收紧 + 不重叠时增加弓箭
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  MIN_ARROWS_PROBLEM_HTML,
  MIN_ARROWS_ANALYSIS_HTML,
  MIN_ARROWS_CODE_LANGUAGES,
} from './min-arrows-problem-content';

export interface MAStep {
  balloons: Array<[number, number]>;
  currentIndex: number;
  arrowCount: number;
  arrowPositions: number[];
  overlapEnd: number;
  action: 'init' | 'sort' | 'new_arrow' | 'overlap' | 'done';
  message: string;
  codeLine: number;
  metrics?: Record<string, string>;
  log?: string;
}

export function buildMinArrowsSteps(rawBalloons: Array<[number, number]>): MAStep[] {
  const steps: MAStep[] = [];
  const n = rawBalloons.length;

  if (n === 0) {
    steps.push({
      balloons: [],
      currentIndex: -1,
      arrowCount: 0,
      arrowPositions: [],
      overlapEnd: 0,
      action: 'done',
      message: '输入为空，所需弓箭数为 0',
      codeLine: 2,
    });
    return steps;
  }

  // 1. 按左边界升序排序
  const points = rawBalloons.map(([s, e]) => [s, e] as [number, number]).sort((a, b) => a[0] - b[0]);
  let count = 1;
  const arrowPositions: number[] = [points[0][1]];

  steps.push({
    balloons: points.map(([s, e]) => [s, e]),
    currentIndex: 0,
    arrowCount: 1,
    arrowPositions: [...arrowPositions],
    overlapEnd: points[0][1],
    action: 'sort',
    message: `第 1 步：按左边界升序排序：${points.map((p) => `[${p[0]},${p[1]}]`).join(', ')}，第 1 支箭预定在 x=${points[0][1]}`,
    codeLine: 4,
  });

  for (let i = 1; i < n; i++) {
    const cur = points[i];
    const prevEnd = points[i - 1][1];

    if (cur[0] > prevEnd) {
      count++;
      arrowPositions.push(cur[1]);

      steps.push({
        balloons: points.map(([s, e]) => [s, e]),
        currentIndex: i,
        arrowCount: count,
        arrowPositions: [...arrowPositions],
        overlapEnd: cur[1],
        action: 'new_arrow',
        message: `🏹 气球 [${i}]=[${cur[0]}, ${cur[1]}] 左端点 ${cur[0]} > 前组右端点 ${prevEnd}，无重叠，增加第 ${count} 支箭 (x=${cur[1]})`,
        codeLine: 8,
      });
    } else {
      points[i][1] = Math.min(prevEnd, cur[1]);
      arrowPositions[arrowPositions.length - 1] = points[i][1];

      steps.push({
        balloons: points.map(([s, e]) => [s, e]),
        currentIndex: i,
        arrowCount: count,
        arrowPositions: [...arrowPositions],
        overlapEnd: points[i][1],
        action: 'overlap',
        message: `🎯 气球 [${i}] 与前组重叠 (左界 ${cur[0]} &le; ${prevEnd})！同用一支箭，收紧重叠右界至 x=${points[i][1]}`,
        codeLine: 11,
      });
    }
  }

  steps.push({
    balloons: points.map(([s, e]) => [s, e]),
    currentIndex: n - 1,
    arrowCount: count,
    arrowPositions: [...arrowPositions],
    overlapEnd: points[n - 1][1],
    action: 'done',
    message: `🎉 扫描完成！引爆全部 ${n} 个气球最少需要 ${count} 支箭 (射箭坐标: ${arrowPositions.join(', ')})`,
    codeLine: 14,
  });

  return steps;
}


/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: MAStep[]): MAStep[] {
  return steps.map((s) => {
    const curB = s.currentIndex >= 0 && s.currentIndex < s.balloons.length ? s.balloons[s.currentIndex] : null;
    const isNewArrow = s.action === 'new_arrow';
    const isOverlap = s.action === 'overlap';

    let action = '🔍 初始化排序';
    if (isNewArrow) action = '🏹 无交集 (新增 1 箭)';
    else if (isOverlap) action = '🎯 存在重叠 (同用 1 箭)';
    else if (s.action === 'sort') action = '🔀 左端点升序排序';
    else if (s.action === 'done') action = '🎉 完成';

    return {
      ...s,
      log: s.message,
      metrics: {
        'cur-balloon': curB ? `[${curB[0]}, ${curB[1]}]` : '—',
        'overlap-end': `x = ${s.overlapEnd}`,
        arrows: `${s.arrowCount} 支`,
        'arrow-pos': `[${s.arrowPositions.join(', ')}]`,
        action,
      },
    };
  });
}

/** 主视觉：气球坐标轴与垂直射箭沙盘 (SVG) */
export function renderMinArrowsCanvas(container: HTMLElement, step: MAStep): void {
  const balloons = step.balloons;
  const n = balloons.length;

  if (n === 0) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const minX = Math.min(...balloons.map((b) => b[0]));
  const maxX = Math.max(...balloons.map((b) => b[1]));
  const xRange = maxX - minX || 1;

  const svgWidth = 420;
  const svgHeight = 160;
  const padX = 35;
  const rowHeight = Math.min(22, (svgHeight - 40) / n);

  const balloonSvgs = balloons
    .map(([s, e], idx) => {
      const x1 = padX + ((s - minX) / xRange) * (svgWidth - padX * 2);
      const x2 = padX + ((e - minX) / xRange) * (svgWidth - padX * 2);
      const width = Math.max(12, x2 - x1);
      const y = 20 + idx * rowHeight;

      const isCurrent = idx === step.currentIndex && step.action !== 'done';
      const fill = isCurrent ? '#f472b6' : '#fbcfe8';
      const stroke = isCurrent ? '#db2777' : '#ec4899';

      return `
        <g>
          <rect x="${x1}" y="${y}" width="${width}" height="${rowHeight - 6}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1.5" />
          <text x="${x1 + width / 2}" y="${y + rowHeight / 2 - 1}" fill="#831843" font-size="9" font-family="JetBrains Mono" font-weight="700" text-anchor="middle" dominant-baseline="middle">
            [${s}, ${e}]
          </text>
        </g>
      `;
    })
    .join('');

  const arrowsSvg = step.arrowPositions
    .map((arrowX, aIdx) => {
      const x = padX + ((arrowX - minX) / xRange) * (svgWidth - padX * 2);
      return `
        <g>
          <line x1="${x}" y1="8" x2="${x}" y2="${svgHeight - 12}" stroke="#10b981" stroke-width="2" stroke-dasharray="4 2" />
          <circle cx="${x}" cy="${svgHeight - 8}" r="4" fill="#10b981" />
          <text x="${x}" y="12" fill="#059669" font-size="9" font-family="JetBrains Mono" font-weight="800" text-anchor="middle">
            🏹#${aIdx + 1}
          </text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 10px; box-sizing: border-box;">
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: 100%; overflow: visible;" preserveAspectRatio="xMidYMid meet">
        <line x1="${padX}" y1="${svgHeight - 15}" x2="${svgWidth - padX}" y2="${svgHeight - 15}" stroke="#cbd5e1" stroke-width="1.5" />
        <text x="${padX}" y="${svgHeight - 2}" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono">x=${minX}</text>
        <text x="${svgWidth - padX}" y="${svgHeight - 2}" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono" text-anchor="end">x=${maxX}</text>
        ${balloonSvgs}
        ${arrowsSvg}
      </svg>
    </div>
  `;
}

function parseBalloons(raw: string): Array<[number, number]> {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((arr: [number, number]) => [arr[0], arr[1]] as [number, number]);
    }
  } catch {
    // fall through to default
  }
  return [[10, 16], [2, 8], [1, 6], [7, 12]];
}

registerDeclarativeAlgorithm({
  id: 'min-arrows',
  name: '用最少数量的箭引爆气球',
  category: 'greedy',
  description: '按左端点升序排序，贪心收紧重叠区间最小右边界，计算最少所需弓箭数',
  icon: '🎯',
  difficulty: 2,
  levelOrder: 8,
  learningGoal: '掌握区间重叠问题的贪心收缩右边界模型，奠定区间调度类问题的求解范式',
  inputs: [
    {
      id: 'points',
      label: '气球区间 [start, end]',
      type: 'text',
      defaultValue: '[[10,16],[2,8],[1,6],[7,12]]',
      placeholder: '[[s,e],...]',
    },
  ],
  presets: [
    { label: '示例 1', values: { points: '[[10,16],[2,8],[1,6],[7,12]]' } },
    { label: '全不重叠', values: { points: '[[1,2],[3,4],[5,6],[7,8]]' } },
    { label: '端点相接', values: { points: '[[1,2],[2,3],[3,4],[4,5]]' } },
  ],
  metrics: [
    { id: 'cur-balloon', label: '当前气球区间', color: '#db2777' },
    { id: 'overlap-end', label: '当前组右边界', color: '#059669' },
    { id: 'arrows', label: '所需最少箭数', color: '#db2777' },
    { id: 'arrow-pos', label: '射箭位置', color: '#059669' },
    { id: 'action', label: '重叠判定', color: '#2563eb' },
  ],
  legend: [
    { label: '📍 当前气球', color: '#db2777' },
    { label: '🏹 射箭线', color: '#10b981' },
    { label: '气球区间', color: '#ec4899' },
  ],
  codeLanguages: MIN_ARROWS_CODE_LANGUAGES,
  problemHtml: MIN_ARROWS_PROBLEM_HTML,
  analysisHtml: MIN_ARROWS_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(buildMinArrowsSteps(parseBalloons(String(inputs.points ?? '[[10,16],[2,8],[1,6],[7,12]]')))),
  renderCanvas: (container, step) => renderMinArrowsCanvas(container, step as MAStep),
});
