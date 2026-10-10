/**
 * 三元环与四元环定向计数 (3-Cycle & 4-Cycle Counting · 洛谷 P1989) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范：
 * Card 1 输出 100% 纯净 SVG 拓扑图、DAG 定向路径高亮与环闭合沙盘
 * Card 2 承载 deg, vis, cnt 多数组实时监控器与三元环/四元环统计指标
 */

import type { CycleStep } from '../../../algorithms/categories/graph/cycle-counting-step-compiler';

export function renderCycleCountingCanvas(container: HTMLElement, step: CycleStep): void {
  const isK4 = step.total3Cycles > 2 || step.trianglesFound.length >= 3;
  const nodeCoords: Record<number, { x: number; y: number }> = {
    1: { x: 155, y: 40 },
    2: { x: 80, y: 110 },
    3: { x: 230, y: 110 },
    4: { x: 155, y: 180 },
  };

  const allEdges = isK4
    ? [
        [1, 2],
        [1, 3],
        [1, 4],
        [2, 3],
        [2, 4],
        [3, 4],
      ]
    : [
        [1, 2],
        [1, 3],
        [2, 3],
        [2, 4],
        [3, 4],
      ];

  const svgEdges = allEdges
    .map(([u, v]) => {
      const p1 = nodeCoords[u];
      const p2 = nodeCoords[v];
      if (!p1 || !p2) return '';
      const inCurPath =
        (step.curU === u && step.curV === v) ||
        (step.curV === u && step.curW === v) ||
        (step.curU === v && step.curV === u) ||
        (step.curV === v && step.curW === u);
      const color = inCurPath ? '#f59e0b' : '#475569';
      const width = inCurPath ? 3 : 1.5;

      return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />`;
    })
    .join('');

  const nodes = [1, 2, 3, 4];
  const svgNodes = nodes
    .map((u) => {
      const p = nodeCoords[u];
      if (!p) return '';
      const isU = step.curU === u;
      const isV = step.curV === u;
      const isW = step.curW === u;

      const bg = isU ? '#f59e0b' : isV ? '#065f46' : isW ? '#581c87' : '#1e3a8a';
      const border = isU ? '#facc15' : isV ? '#10b981' : isW ? '#a855f7' : '#38bdf8';

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="17" fill="${bg}" stroke="${border}" stroke-width="${isU || isV || isW ? 3 : 1.5}" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          <text x="${p.x}" y="${p.y + 28}" fill="#94a3b8" font-size="8" font-weight="700" text-anchor="middle">deg:${step.degArray[u] || 0}</text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <svg style="width: 100%; height: 100%; min-height: 200px;" viewBox="0 0 310 200">
      ${svgEdges}
      ${svgNodes}
    </svg>
  `;
}

export function renderCycleCountingCustomMetrics(container: HTMLElement, step: CycleStep): void {
  const indices = [1, 2, 3, 4];
  const renderRow = (name: string, arr: any[] | Record<number, any>, activeName: string, color: string) => {
    const cells = indices
      .map((idx) => {
        const val = arr[idx] ?? 0;
        const isActive = step.activeArray === activeName && step.activeSlot === idx;
        const bg = isActive ? '#fef08a' : '#1e293b';
        const textCol = isActive ? '#854d0e' : '#e2e8f0';
        const border = isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1';

        return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 32px; height: 30px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
          <span style="font-size: 7.5px; color: #64748b; line-height: 1;">[${idx}]</span>
          <span style="line-height: 1.1;">${val}</span>
        </div>`;
      })
      .join('');

    return `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 95px; color: ${color};">${name}:</span>
        <div style="display: flex; gap: 4px;">${cells}</div>
      </div>
    `;
  };

  const degRow = renderRow('deg[] (节点度数)', step.degArray, 'deg', '#38bdf8');
  const visRow = renderRow('vis[] (出邻打标)', step.visMap, 'vis', '#f59e0b');
  const cntRow = renderRow('cnt[] (中继计数)', step.cntArray, 'cnt', '#10b981');

  const trianglesText =
    step.trianglesFound.length > 0
      ? step.trianglesFound.map(([a, b, c]) => `(${a},${b},${c})`).join(' , ')
      : '尚未发现';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        ${degRow}
        ${visRow}
        ${cntRow}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
          <span style="color: #f59e0b; font-size: 10px; font-weight: 700;">已发现三元环:</span>
          <strong style="color: #facc15; font-family: monospace; font-size: 10.5px;">[ ${trianglesText} ]</strong>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #64748b; font-size: 10.5px;">执行语句:</span>
        <strong style="color: #38bdf8; font-family: monospace; font-size: 11px;">行 ${Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine}: ${step.log}</strong>
      </div>
    </div>
  `;
}
