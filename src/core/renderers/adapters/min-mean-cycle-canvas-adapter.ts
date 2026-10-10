/**
 * 最小均值回路与分数规划 (Minimum Mean Weight Cycle · 洛谷 P2868) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范：
 * Card 1 输出 100% 纯净 SVG 拓扑沙盘 (有向残量边权与 SPFA 负权回路高亮)
 * Card 2 承载 0-1 分数规划判据、二分区间 [L, R] 与负环判定监控
 */

import type { MinMeanStep } from '../../../algorithms/categories/graph/min-mean-cycle-step-compiler';

export function renderMinMeanCycleCanvas(container: HTMLElement, step: MinMeanStep): void {
  const nodePositions: Record<number, { x: number; y: number }> = {
    1: { x: 75, y: 55 },
    2: { x: 235, y: 55 },
    3: { x: 75, y: 175 },
    4: { x: 235, y: 175 },
  };

  const svgEdges = step.reweightedEdges
    .map((e) => {
      const p1 = nodePositions[e.u];
      const p2 = nodePositions[e.v];
      if (!p1 || !p2) return '';

      const isCycleEdge = step.activeCycleNodes.includes(e.u) && step.activeCycleNodes.includes(e.v);
      const isNegEdge = e.newW < 0;
      const color = isCycleEdge ? '#ef4444' : isNegEdge ? '#facc15' : '#38bdf8';
      const strokeWidth = isCycleEdge ? 3 : 1.5;

      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2 - 6;

      return `
        <g>
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${strokeWidth}" marker-end="url(#arrow-${isCycleEdge ? 'neg' : 'default'})" />
          <rect x="${midX - 25}" y="${midY - 8}" width="50" height="14" rx="3" fill="#0f172a" fill-opacity="0.85" />
          <text x="${midX}" y="${midY + 3}" fill="${color}" font-size="8.5" font-weight="700" font-family="monospace" text-anchor="middle">w':${e.newW}</text>
        </g>
      `;
    })
    .join('');

  const nodes = [1, 2, 3, 4];
  const svgNodes = nodes
    .map((u) => {
      const pos = nodePositions[u];
      if (!pos) return '';
      const inCycle = step.activeCycleNodes.includes(u);
      const bg = inCycle ? '#7f1d1d' : '#1e3a8a';
      const border = inCycle ? '#ef4444' : '#38bdf8';

      return `
        <g>
          <circle cx="${pos.x}" cy="${pos.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${inCycle ? '2.5' : '1.5'}" />
          <text x="${pos.x}" y="${pos.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <svg style="width: 100%; height: 100%; min-height: 200px;" viewBox="0 0 310 210">
      <defs>
        <marker id="arrow-default" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
        </marker>
        <marker id="arrow-neg" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
        </marker>
      </defs>
      ${svgEdges}
      ${svgNodes}
    </svg>
  `;
}

export function renderMinMeanCycleCustomMetrics(container: HTMLElement, step: MinMeanStep): void {
  const lineStr = typeof step.codeLine === 'object' && step.codeLine !== null && 'java' in step.codeLine
    ? (step.codeLine as any).java
    : Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine;

  const cycleStatusStr = step.hasNegCycle ? '⚠ 存在负权回路 (缩小上界)' : '✓ 无负权回路 (提升下界)';
  const cycleColor = step.hasNegCycle ? '#ef4444' : '#10b981';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; color: #1e293b;">二分逼近区间:</span>
          <span style="background: #1e293b; border: 1px solid #334155; color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 11px; font-weight: 700;">[${step.boundL.toFixed(3)}, ${step.boundR.toFixed(3)}]</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; color: #1e293b;">当前猜测平均边权 λ:</span>
          <span style="background: #1e293b; border: 1px solid #334155; color: #f59e0b; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 11px; font-weight: 700;">λ = ${step.lambda.toFixed(3)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
          <span style="font-weight: 700; color: #1e293b;">SPFA 负环判定:</span>
          <span style="color: ${cycleColor}; font-weight: 700;">${cycleStatusStr}</span>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #1e40af; font-weight: 700;">👑 0-1 分数规划判据:</span>
        <strong style="font-family: monospace; color: #2563eb;">存在负环 ⟺ 真实最优 λ* &lt; λ</strong>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #64748b; font-size: 10.5px;">当前执行语句:</span>
        <strong style="color: #0284c7; font-family: monospace; font-size: 11px;">行 ${lineStr}: ${step.log}</strong>
      </div>
    </div>
  `;
}

export class MinMeanCycleCanvasAdapter {
  public mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  public updateStep(container: HTMLElement, step: MinMeanStep): void {
    renderMinMeanCycleCanvas(container, step);
  }

  public renderCustomMetrics(container: HTMLElement, step: MinMeanStep): void {
    renderMinMeanCycleCustomMetrics(container, step);
  }

  public dispose(): void {}
}
