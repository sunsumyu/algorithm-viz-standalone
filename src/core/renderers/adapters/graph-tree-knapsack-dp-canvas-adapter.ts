/**
 * 树上有依赖背包 (Tree-Dependent Knapsack DP · 洛谷 P2014 选课) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范：
 * Card 1 输出 100% 纯净 SVG 拓扑沙盘 (课程先修树拓扑与已选课程状态)
 * Card 2 承载树上泛化物品合并 DP 向量转移与上下界监控
 */

import type { TreeKnapStep } from '../../../algorithms/categories/graph/tree-knapsack-dp-step-compiler';

export function renderGraphTreeKnapCanvas(container: HTMLElement, step: TreeKnapStep): void {
  const nodeCoords: Record<number, { x: number; y: number; name: string; val: number }> = {
    0: { x: 155, y: 30, name: 'S0(超级根)', val: 0 },
    1: { x: 95, y: 90, name: 'C1(高数, v:2)', val: 2 },
    4: { x: 215, y: 90, name: 'C4(数据结构, v:4)', val: 4 },
    2: { x: 65, y: 160, name: 'C2(线代, v:5)', val: 5 },
    3: { x: 125, y: 160, name: 'C3(微积分, v:3)', val: 3 },
    5: { x: 215, y: 160, name: 'C5(算法导论, v:6)', val: 6 },
  };

  const treeEdges = [
    { u: 0, v: 1 },
    { u: 0, v: 4 },
    { u: 1, v: 2 },
    { u: 1, v: 3 },
    { u: 4, v: 5 },
  ];

  const svgEdges = treeEdges
    .map((e) => {
      const p1 = nodeCoords[e.u];
      const p2 = nodeCoords[e.v];
      if (!p1 || !p2) return '';
      const isChosen = step.chosenCourses.includes(e.v) && (e.u === 0 || step.chosenCourses.includes(e.u));
      const color = isChosen ? '#10b981' : '#475569';
      const strokeWidth = isChosen ? 3 : 1.5;

      return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${strokeWidth}" />`;
    })
    .join('');

  const nodes = [0, 1, 2, 3, 4, 5];
  const svgNodes = nodes
    .map((u) => {
      const p = nodeCoords[u];
      if (!p) return '';
      const isChosen = step.chosenCourses.includes(u);
      const isCur = step.curNode === u;
      const bg = u === 0 ? '#f59e0b' : isChosen ? '#065f46' : '#1e3a8a';
      const border = isCur ? '#facc15' : isChosen ? '#10b981' : '#38bdf8';

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="${u === 0 ? 12 : 14}" fill="${bg}" stroke="${border}" stroke-width="${isCur || isChosen ? 2.5 : 1.5}" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${u === 0 ? 'S0' : `C${u}`}</text>
          <text x="${p.x}" y="${p.y + 24}" fill="${isChosen ? '#34d399' : '#94a3b8'}" font-size="8.5" font-weight="700" text-anchor="middle">${p.name}</text>
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

export function renderGraphTreeKnapCustomMetrics(container: HTMLElement, step: TreeKnapStep): void {
  const dpEntries = Object.entries(step.dpSnapshot)
    .map(([nodeId, arr]) => `<span style="background: #1e293b; border: 1px solid #334155; color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10px;">dp[${nodeId === '0' ? 'S0' : `C${nodeId}`}] = [${arr.join(', ')}]</span>`)
    .join(' ');

  const lineStr = Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 4px;">
          <span style="font-weight: 700; color: #1e293b;">树上 DP 状态向量:</span>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">${dpEntries}</div>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #1e40af; font-weight: 700;">👑 泛化物品合并转移:</span>
        <strong style="font-family: monospace; color: #2563eb;">dp[u][j] = max(dp[u][j], dp[u][j-k] + dp[v][k])</strong>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #64748b; font-size: 10.5px;">执行语句:</span>
        <strong style="color: #0284c7; font-family: monospace; font-size: 11px;">行 ${lineStr}: ${step.log}</strong>
      </div>
    </div>
  `;
}

export class GraphTreeKnapsackDPCanvasAdapter {
  public mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  public updateStep(container: HTMLElement, step: TreeKnapStep): void {
    renderGraphTreeKnapCanvas(container, step);
  }

  public renderCustomMetrics(container: HTMLElement, step: TreeKnapStep): void {
    renderGraphTreeKnapCustomMetrics(container, step);
  }

  public dispose(): void {}
}
