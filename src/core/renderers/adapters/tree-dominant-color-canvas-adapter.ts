/**
 * 树上众数求和 (Tree Dominant Color - CF600E) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范：
 * Card 1 输出 100% 纯净 SVG 树形拓扑、轻重边高亮与节点颜色沙盘
 * Card 2 承载 sz[]、cnt[]、ans[] 多数组状态监视器与 DSU 启发式合并原理
 */

import type { TreeDominantStep } from '../../../algorithms/categories/graph/tree-dominant-color-step-compiler';

export function renderTreeDominantColorCanvas(container: HTMLElement, step: TreeDominantStep): void {
  const nodeCoords: Record<number, { x: number; y: number }> = {
    1: { x: 155, y: 40 },
    2: { x: 95, y: 105 },
    3: { x: 215, y: 105 },
    4: { x: 55, y: 170 },
    5: { x: 135, y: 170 },
  };

  const treeEdges = [
    [1, 2],
    [1, 3],
    [2, 4],
    [2, 5],
  ];

  const colorPalettes: Record<number, string> = {
    1: '#38bdf8', // 蓝色
    2: '#ec4899', // 粉色
    3: '#10b981', // 绿色
  };

  const svgEdges = treeEdges
    .map(([u, v]) => {
      const p1 = nodeCoords[u];
      const p2 = nodeCoords[v];
      if (!p1 || !p2) return '';
      const isHeavy = step.heavySon[u] === v;
      const color = isHeavy ? '#facc15' : '#475569';
      const width = isHeavy ? 3.5 : 1.5;

      return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${isHeavy ? '' : 'stroke-dasharray="4,2"'} />`;
    })
    .join('');

  const nodes = [1, 2, 3, 4, 5];
  const svgNodes = nodes
    .map((u) => {
      const p = nodeCoords[u];
      if (!p) return '';
      const isCur = step.curNode === u;
      const c = step.nodeColors[u] || 1;
      const colBg = colorPalettes[c] || '#64748b';
      const ansVal = step.ans[u] || 0;

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="17" fill="${colBg}" stroke="${isCur ? '#facc15' : '#ffffff'}" stroke-width="${isCur ? 3.5 : 1.5}" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          <text x="${p.x}" y="${p.y + 28}" fill="#94a3b8" font-size="8" font-weight="700" text-anchor="middle">色${c} ans:${ansVal}</text>
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

export function renderTreeDominantColorCustomMetrics(container: HTMLElement, step: TreeDominantStep): void {
  const indices = [1, 2, 3, 4, 5];

  const renderRow = (name: string, arr: any[] | Record<number, number>, activeName: string, color: string) => {
    const cells = indices
      .map((idx) => {
        const val = (arr as any)[idx] ?? 0;
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

  const szRow = renderRow('sz[] (子树大小)', step.szArray, 'sz', '#38bdf8');
  const cntRow = renderRow('cnt[] (颜色频次)', step.colorCount, 'cnt', '#10b981');
  const ansRow = renderRow('ans[] (众数和)', step.ans, 'ans', '#f59e0b');

  const lineStr = Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        ${szRow}
        ${cntRow}
        ${ansRow}
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #64748b; font-size: 10.5px;">执行语句:</span>
        <strong style="color: #38bdf8; font-family: monospace; font-size: 11px;">行 ${lineStr}: ${step.log}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #475569; font-size: 10.5px;">👑 DSU 启发式合并法则:</span>
        <strong style="color: #0369a1; font-size: 10.5px;">重儿子信息保留 (keep=true) · 轻儿子子树统计后清空 (keep=false)</strong>
      </div>
    </div>
  `;
}

export class TreeDominantColorCanvasAdapter {
  public mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  public updateStep(container: HTMLElement, step: TreeDominantStep): void {
    renderTreeDominantColorCanvas(container, step);
  }

  public renderCustomMetrics(container: HTMLElement, step: TreeDominantStep): void {
    renderTreeDominantColorCustomMetrics(container, step);
  }

  public dispose(): void {}
}
