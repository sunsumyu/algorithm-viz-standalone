/**
 * 最小体力消耗路径 (Path With Minimum Effort) 画布适配器
 * 核心原语：二维网格探险家模式 (BinaryGridCanvasAdapter + GridVisualAdapter 探险家体系)、Dijkstra 搜索推演树
 * 严格遵循深模块规范 (Deep Module, LOC < 120) 与表现层契约
 */

import { BinaryGridCanvasAdapter } from './binary-grid-canvas-adapter';
import { RecursionTreeAdapter } from '../recursion-tree-adapter';
import type { EffortStep } from '../../../algorithms/categories/graph/path-min-effort-step-compiler';

export class PathMinEffortCanvasAdapter {
  static render(container: HTMLElement, step: EffortStep): void {
    const { grid, dist, visited, curR, curC, pathNodes, status } = step;
    const rows = grid.length;
    const cols = grid[0].length;
    const isDone = status === 'done';
    const isExploring = status === 'explore' || (status === 'start' && curR === 0 && curC === 0);
    const isHopping = isExploring;
    const pathSet = new Set(pathNodes.map(([r, c]) => `${r},${c}`));

    // 空间流动连线与探测箭头 (Flow Arrows)
    const flowArrows: Array<{ from: [number, number]; to: [number, number]; color?: string; dashed?: boolean; animated?: boolean }> = [];
    if (pathNodes && pathNodes.length > 1) {
      for (let i = 0; i < pathNodes.length - 1; i++) {
        flowArrows.push({ from: pathNodes[i], to: pathNodes[i + 1], color: isDone ? '#10b981' : '#0284c7', dashed: true, animated: true });
      }
    }
    if (status === 'relax' && step.activeSlot && (curR !== step.activeSlot[0] || curC !== step.activeSlot[1])) {
      flowArrows.push({ from: [curR, curC], to: step.activeSlot, color: '#f59e0b', dashed: true, animated: true });
    }

    const riverBarrierText = isDone
      ? `🏆 全程耗时: 第 ${step.minEffortSoFar} 秒水流全线漫平 · 达成最优体力连通 ✨`
      : step.minEffortSoFar === 0
        ? '🌊 水流推演: 0s 起点已漫平 · 正在探寻落差最小漫延口 ⏱️'
        : `🌊 水流推演: 第 ${step.minEffortSoFar} 秒水流已漫平平台 (落差瓶颈: ${step.minEffortSoFar}) 🏊`;

    BinaryGridCanvasAdapter.renderGridCanvas(container, {
      rows,
      cols,
      variant: 'adventurer',
      showCoords: true,
      targetPos: [rows - 1, cols - 1],
      riverBarrierText,
      flowArrows,
      adventurer: {
        r: curR,
        c: curC,
        state: isDone ? 'cheering' : (isHopping ? 'jumping' : 'walking'),
        isFinish: isDone,
        isHopping,
      },
      getCell: (r, c) => {
        const isCur = r === curR && c === curC;
        const isPath = pathSet.has(`${r},${c}`);
        const isTarget = r === rows - 1 && c === cols - 1;
        const isStart = r === 0 && c === 0;
        const h = grid[r][c];
        const d = dist[r][c];
        const isVis = visited[r][c];
        const isProbing = Boolean(step.activeSlot && step.activeSlot[0] === r && step.activeSlot[1] === c && !isCur);

        let bg = '#ffffff';
        let border = '1.5px solid #cbd5e1';
        let color = '#1e293b';

        if (isDone && isPath) {
          bg = '#ecfdf5';
          border = '2px solid #10b981';
          color = '#065f46';
        } else if (isCur) {
          bg = '#fef3c7';
          border = '2px solid #f59e0b';
          color = '#92400e';
        } else if (isProbing) {
          bg = '#eff6ff';
          border = '2px dashed #3b82f6';
          color = '#1d4ed8';
        } else if (isVis) {
          bg = '#f8fafc';
          border = '1.5px solid #94a3b8';
          color = '#475569';
        } else {
          bg = h >= 8 ? '#f1f5f9' : h >= 4 ? '#f8fafc' : '#ffffff';
          border = h >= 8 ? '1.5px solid #94a3b8' : '1.5px solid #cbd5e1';
        }

        // 动态水位/体力流灌注淹没层 (Water Flooding Layer)
        // 判定平台是否已完全漫平 (Is Leveled Flat):
        const isReached = d !== Infinity;
        const isLevelFlat = isReached && (isVis || isCur || (isDone && isPath) || step.minEffortSoFar >= d);
        const fillPercent = isLevelFlat ? 100 : (isReached ? 68 : 0);
        const waterGrad = isDone && isPath
          ? 'linear-gradient(180deg, rgba(52,211,153,0.32) 0%, rgba(16,185,129,0.48) 100%)'
          : isCur
            ? 'linear-gradient(180deg, rgba(251,191,36,0.35) 0%, rgba(245,158,11,0.5) 100%)'
            : isLevelFlat
              ? 'linear-gradient(180deg, rgba(56,189,248,0.28) 0%, rgba(2,132,199,0.42) 100%)'
              : 'linear-gradient(180deg, rgba(56,189,248,0.2) 0%, rgba(2,132,199,0.32) 100%)';
        const waveStroke = isDone && isPath ? '#a7f3d0' : isCur ? '#fde68a' : '#bae6fd';
        const borderTopColor = isDone && isPath ? '#10b981' : isCur ? '#f59e0b' : '#38bdf8';
        const waterFloodHtml = isReached
          ? `<div style="position: absolute; bottom: 0; left: 0; right: 0; height: ${fillPercent}%; background: ${waterGrad}; border-top: 1.5px solid ${borderTopColor}; transition: height 0.35s ease; border-radius: 0 0 10px 10px; pointer-events: none; overflow: hidden; z-index: 2;"><svg class="dp-river-waves-1" style="position: absolute; top: -3px; left: 0; width: 200%; height: 6px; opacity: 0.9;" preserveAspectRatio="none"><path d="M 0 3 Q 15 0, 30 3 T 60 3 T 90 3 T 120 3 T 150 3 T 180 3" fill="none" stroke="${waveStroke}" stroke-width="1.3" /></svg></div>`
          : '';

        const timeBadge = d === 0
          ? '⏱️ 0s 起点已漫平'
          : isLevelFlat
            ? `⏱️ 第 ${d} 秒已流平`
            : `⏱️ 需第 ${d} 秒流平`;

        let effLabel = isReached
          ? `<div style="font-size: 8.5px; font-weight: 700; color: #1e293b; background: rgba(255, 255, 255, 0.92); padding: 1.5px 5px; border-radius: 4px; border: 1px solid rgba(148, 163, 184, 0.35); box-shadow: 0 1px 3px rgba(0,0,0,0.08); position: absolute; bottom: 3px; left: 50%; transform: translateX(-50%); white-space: nowrap; pointer-events: none; z-index: 5;">${timeBadge} (落差: ${d})</div>`
          : '';
        if (isProbing) {
          effLabel = `<div style="font-size: 8.5px; font-weight: 700; color: #1d4ed8; background: rgba(239, 246, 255, 0.95); padding: 1.5px 5px; border-radius: 4px; border: 1px solid #93c5fd; box-shadow: 0 1px 3px rgba(0,0,0,0.08); position: absolute; bottom: 3px; left: 50%; transform: translateX(-50%); white-space: nowrap; pointer-events: none; z-index: 5;">🔍 探测水流 (落差: ${d === Infinity ? '?' : d})</div>`;
        }

        const boxShadow = isCur
          ? '0 0 0 3px rgba(245, 158, 11, 0.35)'
          : isProbing
            ? '0 0 0 3px rgba(59, 130, 246, 0.35)'
            : (isPath && isDone)
              ? '0 0 0 2px rgba(16, 185, 129, 0.3)'
              : 'none';
        const transform = isCur ? 'scale(1.06)' : isProbing ? 'scale(1.04)' : 'none';
        const zIndex = isCur ? 20 : isProbing ? 15 : isPath ? 10 : 1;

        return {
          text: `${h}m`,
          extraHtml: `${waterFloodHtml}${effLabel}`,
          bg,
          border,
          color,
          boxShadow,
          transform,
          zIndex,
          title: `${isStart ? '起点 ' : ''}${isTarget ? '终点 ' : ''}${isCur ? '探索 ' : ''}${isProbing ? '探测 ' : ''}${isPath && isDone ? '最优 ' : ''}(${r},${c}) 高度: ${h}m · 落差: ${d === Infinity ? '∞' : d}`,
        };
      },
    });
  }

  static renderCustomMetrics(container: HTMLElement, step: EffortStep): void {
    if (!container || !step.treeRoot) return;
    container.style.height = '100%';
    container.style.minHeight = '180px';
    container.style.overflow = 'hidden';
    RecursionTreeAdapter.renderRecursionTree(container, step.treeRoot, step.activeNodeId);
  }
}

export function renderPathMinEffortCanvas(container: HTMLElement, step: EffortStep): void {
  PathMinEffortCanvasAdapter.render(container, step);
}

export function renderPathMinEffortCustomMetrics(container: HTMLElement, step: EffortStep): void {
  PathMinEffortCanvasAdapter.renderCustomMetrics(container, step);
}
