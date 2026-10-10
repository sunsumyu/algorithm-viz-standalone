/**
 * 平面图最小割转对偶图最短路 (Planar Graph Min-Cut to Dual Graph Shortest Path · 洛谷 P4001 狼抓兔子) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范：
 * Card 1 输出 100% 纯净 SVG 平面网格图、割边高亮与对偶图穿透最短路径沙盘
 * Card 2 承载对偶面距离表 dist[F]、Dijkstra 堆顶与平面图对偶定理监控
 */

import type { PlanarStep } from '../../../algorithms/categories/graph/planar-graph-dual-step-compiler';

export function renderPlanarGraphDualCanvas(container: HTMLElement, step: PlanarStep): void {
  const isDone = step.status === 'reach' || step.status === 'done';

  container.innerHTML = `
    <svg style="width: 100%; height: 100%; min-height: 200px;" viewBox="0 0 310 200">
      <!-- 原图网格边 (灰底/红割) -->
      <line x1="60" y1="150" x2="155" y2="150" stroke="${isDone ? '#ef4444' : '#475569'}" stroke-width="${isDone ? 3 : 1.5}" />
      <line x1="155" y1="150" x2="250" y2="150" stroke="#475569" stroke-width="1.5" />
      <line x1="60" y1="50" x2="155" y2="50" stroke="#475569" stroke-width="1.5" />
      <line x1="155" y1="50" x2="250" y2="50" stroke="${isDone ? '#ef4444' : '#475569'}" stroke-width="${isDone ? 3 : 1.5}" />
      <line x1="60" y1="50" x2="60" y2="150" stroke="#475569" stroke-width="1.5" />
      <line x1="155" y1="50" x2="155" y2="150" stroke="${isDone ? '#ef4444' : '#475569'}" stroke-width="${isDone ? 3 : 1.5}" />
      <line x1="250" y1="50" x2="250" y2="150" stroke="#475569" stroke-width="1.5" />

      <!-- 对偶图最短路 (绿线穿透) -->
      ${
        isDone
          ? `
        <line x1="40" y1="180" x2="105" y2="100" stroke="#10b981" stroke-width="2.5" stroke-dasharray="4,4" />
        <line x1="105" y1="100" x2="205" y2="100" stroke="#10b981" stroke-width="2.5" stroke-dasharray="4,4" />
        <line x1="205" y1="100" x2="270" y2="20" stroke="#10b981" stroke-width="2.5" stroke-dasharray="4,4" />
      `
          : ''
      }

      <!-- 原图节点 -->
      <g><circle cx="60" cy="150" r="11" fill="#0284c7" /><text x="60" y="154" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">S</text></g>
      <g><circle cx="155" cy="150" r="11" fill="#0284c7" /><text x="155" y="154" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">1</text></g>
      <g><circle cx="250" cy="150" r="11" fill="#0284c7" /><text x="250" y="154" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">2</text></g>
      <g><circle cx="60" cy="50" r="11" fill="#0284c7" /><text x="60" y="54" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">3</text></g>
      <g><circle cx="155" cy="50" r="11" fill="#0284c7" /><text x="155" y="54" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">4</text></g>
      <g><circle cx="250" cy="50" r="11" fill="#0284c7" /><text x="250" y="54" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">T</text></g>

      <!-- 对偶点 -->
      <g><circle cx="40" cy="180" r="12" fill="#f59e0b" /><text x="40" y="184" fill="#ffffff" font-size="9.5" font-weight="800" text-anchor="middle">S*</text></g>
      <g><circle cx="105" cy="100" r="10" fill="#f59e0b" /><text x="105" y="104" fill="#ffffff" font-size="8.5" font-weight="800" text-anchor="middle">F1</text></g>
      <g><circle cx="205" cy="100" r="10" fill="#f59e0b" /><text x="205" y="104" fill="#ffffff" font-size="8.5" font-weight="800" text-anchor="middle">F3</text></g>
      <g><circle cx="270" cy="20" r="12" fill="#f59e0b" /><text x="270" y="24" fill="#ffffff" font-size="9.5" font-weight="800" text-anchor="middle">T*</text></g>
    </svg>
  `;
}

export function renderPlanarGraphDualCustomMetrics(container: HTMLElement, step: PlanarStep): void {
  const lineStr = Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine;

  const distItems = Object.entries(step.distMap)
    .map(
      ([f, d]) =>
        `<span style="background: #1e293b; color: #38bdf8; border: 1px solid #334155; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10px; font-weight: 700;">${f}: <strong style="color: #facc15;">${d === Infinity ? '∞' : d}</strong></span>`
    )
    .join(' ');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; color: #1e293b;">对偶面距离表 dist[F]:</span>
          <div style="display: flex; flex-wrap: wrap; gap: 4px; justify-content: flex-end;">${distItems}</div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
          <span style="font-weight: 700; color: #1e293b;">当前提取对偶点:</span>
          <span style="background: #78350f; color: #fde68a; border: 1px solid #d97706; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-size: 11px; font-weight: 700;">${step.curDualNode} (最短路: ${step.minCutVal})</span>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #1e40af; font-weight: 700;">👑 平面图最小割对偶定理:</span>
        <strong style="font-family: monospace; color: #2563eb;">MinCut(S, T) = ShortestPath(S*, T*) = ${step.minCutVal}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #64748b; font-size: 10.5px;">当前执行语句:</span>
        <strong style="color: #0284c7; font-family: monospace; font-size: 11px;">行 ${lineStr}: ${step.log}</strong>
      </div>
    </div>
  `;
}

export class PlanarGraphDualCanvasAdapter {
  public mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  public updateStep(container: HTMLElement, step: PlanarStep): void {
    renderPlanarGraphDualCanvas(container, step);
  }

  public renderCustomMetrics(container: HTMLElement, step: PlanarStep): void {
    renderPlanarGraphDualCustomMetrics(container, step);
  }

  public dispose(): void {}
}
