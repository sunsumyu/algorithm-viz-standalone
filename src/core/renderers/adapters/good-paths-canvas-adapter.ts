/**
 * 好路径的数目 (Number of Good Paths - LeetCode 2421) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范：
 * Card 1 输出 100% 纯净 SVG 树形点权拓扑、离线排序加边与连通网络沙盘
 * Card 2 承载 parent, count, vals 多数组实时监控器与好路径乘法组合收集舱
 */

import type { GoodPathsStep } from '../../../algorithms/categories/graph/good-paths-step-compiler';

export function renderGoodPathsCanvas(container: HTMLElement, step: GoodPathsStep): void {
  const isStar = step.valsArray.length === 5;
  const n = isStar ? 5 : 4;

  const nodeCoords: Record<number, { x: number; y: number }> = isStar
    ? {
        0: { x: 75, y: 55 },
        1: { x: 45, y: 125 },
        2: { x: 155, y: 85 },
        3: { x: 235, y: 45 },
        4: { x: 255, y: 125 },
      }
    : {
        0: { x: 75, y: 85 },
        1: { x: 75, y: 35 },
        2: { x: 175, y: 85 },
        3: { x: 255, y: 85 },
      };

  const allEdges = isStar
    ? [
        [0, 1],
        [0, 2],
        [2, 3],
        [2, 4],
      ]
    : [
        [0, 1],
        [0, 2],
        [2, 3],
      ];

  const isActivated = (u: number, v: number) =>
    step.activeEdges.some(([a, b]) => (a === u && b === v) || (a === v && b === u));

  let svgEdges = '';
  for (const [u, v] of allEdges) {
    const p1 = nodeCoords[u];
    const p2 = nodeCoords[v];
    if (!p1 || !p2) continue;

    const act = isActivated(u, v);
    const isCur =
      step.curEdge &&
      ((step.curEdge[0] === u && step.curEdge[1] === v) ||
        (step.curEdge[0] === v && step.curEdge[1] === u));

    const color = isCur ? '#facc15' : act ? '#10b981' : '#475569';
    const width = isCur ? 3.5 : act ? 2.5 : 1.5;

    svgEdges += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${act ? '' : 'stroke-dasharray="3,2"'} />`;
  }

  let svgNodes = '';
  for (let i = 0; i < n; i++) {
    const p = nodeCoords[i];
    if (!p) continue;
    const vVal = step.valsArray[i];
    const root = step.parentArray[i];
    const isRoot = root === i;

    svgNodes += `
      <g>
        <circle cx="${p.x}" cy="${p.y}" r="15" fill="${isRoot ? '#0369a1' : '#1e3a8a'}" stroke="${isRoot ? '#38bdf8' : '#64748b'}" stroke-width="${isRoot ? 2.5 : 1.5}" />
        <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${i}</text>
        <text x="${p.x}" y="${p.y + 24}" fill="#f59e0b" font-size="8" font-weight="700" text-anchor="middle">v:${vVal}</text>
      </g>
    `;
  }

  container.innerHTML = `
    <svg style="width: 100%; height: 100%; min-height: 200px;" viewBox="0 0 310 180">
      ${svgEdges}
      ${svgNodes}
    </svg>
  `;
}

export function renderGoodPathsCustomMetrics(container: HTMLElement, step: GoodPathsStep): void {
  const n = step.parentArray.length;
  const indices = Array.from({ length: n }, (_, i) => i);

  const renderRow = (name: string, arr: number[], activeName: string, color: string) => {
    const cells = indices
      .map((u) => {
        const val = arr[u] ?? 0;
        const isActive = step.activeArray === activeName && step.activeSlot === u;
        const bg = isActive ? '#78350f' : '#1e293b';
        const textCol = isActive ? '#fde047' : '#e2e8f0';
        const border = isActive ? '2px solid #eab308' : '1px solid #475569';

        return `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 34px; height: 32px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 11px; font-weight: 700;">
            <span style="font-size: 8px; color: #94a3b8; line-height: 1;">N[${u}]</span>
            <span style="line-height: 1.1;">${val}</span>
          </div>
        `;
      })
      .join('');

    return `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 140px; color: ${color};">${name}:</span>
        <div style="display: flex; gap: 4px;">${cells}</div>
      </div>
    `;
  };

  const parentRow = renderRow('parent[] (代表元)', step.parentArray, 'parent', '#38bdf8');
  const countRow = renderRow('count[] (同大权频次)', step.countArray, 'count', '#10b981');
  const valsRow = renderRow('vals[] (节点点权)', step.valsArray, 'vals', '#f59e0b');

  const totalEdgesCount = n === 5 ? 4 : 3;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #cbd5e1; padding: 4px 8px; box-sizing: border-box;">
      <div style="display: flex; flex-direction: column; gap: 6px; background: #0f172a; padding: 10px; border-radius: 6px; border: 1px solid #334155;">
        ${parentRow}
        ${countRow}
        ${valsRow}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 6px;">
          <span style="color: #94a3b8; font-size: 10px;">已激活连接边:</span>
          <strong style="color: #f59e0b; font-family: monospace; font-size: 11px;">${step.activeEdges.length} / ${totalEdgesCount} 条</strong>
        </div>
      </div>

      <!-- 好路径实时收集舱 -->
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 8px 12px; display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 800; color: #f8fafc;">🛤️ 好路径实时收集舱</span>
          <span style="font-size: 11px; color: #94a3b8;">累计总数: <b style="color: #10b981; font-size: 12px;">${step.totalGoodPaths} 条</b></span>
        </div>
        <div style="font-size: 10.5px; color: #94a3b8; background: #0f172a; border-radius: 4px; padding: 4px 8px; border: 1px solid #334155;">
          ${
            step.newPathsCount
              ? `<span style="color: #34d399; font-weight: 700;">✨ 触发同值端点配对！本次产生 +${step.newPathsCount} 条新好路径！</span>`
              : `<span>单点基数好路径: <b style="color: #e2e8f0;">${n} 条</b>。随着边两端最大点权升序加边，逐步联通更多同权端点。</span>`
          }
        </div>
      </div>
    </div>
  `;
}
