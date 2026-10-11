/**
 * 混合图欧拉回路与网络流定向 (Mixed Eulerian Circuit) — 领域视觉适配器
 * Card 1: 100% 纯 SVG 混合图初始定向与边反转沙盘 (Zero Outer Div)
 * Card 2: 入出度差额 D[u] 与满流监视器
 */

import type { MixedEulerStep } from '../../../algorithms/categories/graph/mixed-eulerian-circuit-step-compiler';

export function renderMixedEulerianCircuitCanvas(container: HTMLElement, step: MixedEulerStep): void {
  const nodePositions: Record<number, { x: number; y: number }> = {
    1: { x: 75, y: 55 },
    2: { x: 235, y: 55 },
    3: { x: 235, y: 175 },
    4: { x: 75, y: 175 },
  };

  const svgEdges = step.directedEdges
    .map((e) => {
      const p1 = nodePositions[e.u];
      const p2 = nodePositions[e.v];
      if (!p1 || !p2) return '';

      const color = e.isFlipped ? '#10b981' : '#38bdf8';
      const strokeWidth = e.isFlipped ? 3 : 1.5;

      return `
        <g>
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${strokeWidth}" marker-end="url(#arrow-${e.isFlipped ? 'flipped' : 'default'})" />
        </g>
      `;
    })
    .join('');

  const nodes = [1, 2, 3, 4];
  const svgNodes = nodes
    .map((u) => {
      const pos = nodePositions[u];
      if (!pos) return '';
      const inDeg = step.degIn[u] || 0;
      const outDeg = step.degOut[u] || 0;
      const isBalanced = inDeg === outDeg;

      return `
        <g>
          <circle cx="${pos.x}" cy="${pos.y}" r="18" fill="${isBalanced ? '#065f46' : '#1e3a8a'}" stroke="${isBalanced ? '#10b981' : '#38bdf8'}" stroke-width="2.5" />
          <text x="${pos.x}" y="${pos.y + 4}" fill="#ffffff" font-size="12" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          <text x="${pos.x}" y="${pos.y + 30}" fill="${isBalanced ? '#34d399' : '#facc15'}" font-size="9.5" font-weight="700" text-anchor="middle">in:${inDeg} out:${outDeg}</text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <svg style="width: 100%; height: 240px; display: block;" viewBox="0 0 310 220" preserveAspectRatio="xMidYMid meet">
      <defs>
        <marker id="arrow-default" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
        </marker>
        <marker id="arrow-flipped" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
        </marker>
      </defs>
      ${svgEdges}
      ${svgNodes}
    </svg>
  `;
}

export function renderMixedEulerianCircuitCustomMetrics(container: HTMLElement, step: MixedEulerStep): void {
  const { isEulerian, status, flowVal, maxFlowTarget, flippedCount = 0 } = step;

  const statusBadge =
    status === 'done'
      ? isEulerian
        ? '<span style="background: #ecfdf5; color: #065f46; border: 1px solid #6ee7b7; padding: 2px 8px; border-radius: 999px; font-weight: 800;">✓ 存在欧拉回路</span>'
        : '<span style="background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; padding: 2px 8px; border-radius: 999px; font-weight: 800;">❌ 无欧拉回路</span>'
      : '<span style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 2px 8px; border-radius: 999px; font-weight: 700;">求解中...</span>';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; box-sizing: border-box;">
      <!-- 定理核心公式卡片 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 700; color: #1e3a8a; display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #2563eb;"></span>
            混合图欧拉回路充要条件
          </span>
          ${statusBadge}
        </div>
        <div style="font-size: 11px; font-family: monospace; font-weight: 700; color: #2563eb; background: #eff6ff; border: 1px dashed #bfdbfe; border-radius: 6px; padding: 6px 8px;">
          maxFlow == ∑ max(0, (in[u] - out[u]) / 2)
        </div>
      </div>

      <!-- 反转边与满流摘要 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <span style="font-size: 10px; color: #64748b;">Dinic 当前推流</span>
          <span style="font-size: 12px; font-family: monospace; font-weight: 800; color: #0284c7;">${flowVal} / ${maxFlowTarget}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 2px; text-align: right;">
          <span style="font-size: 10px; color: #64748b;">已反向边数</span>
          <span style="font-size: 12px; font-family: monospace; font-weight: 800; color: #10b981;">${flippedCount} 条</span>
        </div>
      </div>
    </div>
  `;
}

export class MixedEulerianCircuitCanvasAdapter {
  mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  updateStep(container: HTMLElement, step: unknown): void {
    const mixedStep = step as MixedEulerStep;
    if (!mixedStep) return;
    renderMixedEulerianCircuitCanvas(container, mixedStep);
  }

  dispose(container: HTMLElement): void {
    container.innerHTML = '';
  }
}
