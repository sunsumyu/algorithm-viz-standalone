/**
 * 有向图强连通性检测 (Kosaraju 双 DFS) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范：
 * Card 1 输出 100% 纯净 SVG 有向图拓扑沙盘（支持正向/反向边方向动态变换）
 * Card 2 承载 Kosaraju 双向 DFS 阶段指标监视器与强连通定理分析舱
 */

import type { SCCStep } from '../../../algorithms/categories/graph/strongly-connected-step-compiler';
import { SCC_POSITIONS } from '../../../algorithms/categories/graph/strongly-connected-step-compiler';

export function renderStronglyConnectedCanvas(container: HTMLElement, step: SCCStep): void {
  const { nodes, edges, isReversed, currentNode, visited, isStronglyConnected, action } = step;

  let svgEdges = '';
  for (const [u, v] of edges) {
    const p1 = SCC_POSITIONS[u];
    const p2 = SCC_POSITIONS[v];
    if (!p1 || !p2) continue;

    const isCurrentEdge =
      (currentNode === u && visited.has(v)) || (currentNode === v && visited.has(u));

    const stroke = isCurrentEdge ? '#2563eb' : isReversed ? '#a855f7' : '#64748b';
    const strokeWidth = isCurrentEdge ? 3 : 2;
    const marker = isCurrentEdge
      ? 'url(#scc-arrow-blue)'
      : isReversed
      ? 'url(#scc-arrow-purple)'
      : 'url(#scc-arrow-gray)';

    svgEdges += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${stroke}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;
  }

  let svgNodes = '';
  for (const u of nodes) {
    const pos = SCC_POSITIONS[u];
    if (!pos) continue;

    const isCurrent = currentNode === u;
    const isVisited = visited.has(u);

    let fill = '#1e293b';
    let stroke = '#64748b';
    let textColor = '#f8fafc';

    if (action === 'done' && isStronglyConnected) {
      fill = '#065f46';
      stroke = '#22c55e';
      textColor = '#a7f3d0';
    } else if (isCurrent) {
      fill = '#1e3a8a';
      stroke = '#38bdf8';
      textColor = '#e0f2fe';
    } else if (isVisited) {
      fill = '#064e3b';
      stroke = '#10b981';
      textColor = '#6ee7b7';
    }

    svgNodes += `
      <g>
        <circle cx="${pos.x}" cy="${pos.y}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
        <text x="${pos.x}" y="${pos.y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="${textColor}" font-family="monospace">${u}</text>
      </g>
    `;
  }

  const directionTag = isReversed ? '【反向图 G^R】边向逆转' : '【原有向图 G】正常方向';
  const directionColor = isReversed ? '#c084fc' : '#38bdf8';

  container.innerHTML = `
    <svg viewBox="0 0 420 250" style="width: 100%; height: 100%; min-height: 200px;">
      <defs>
        <marker id="scc-arrow-gray" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#64748b" />
        </marker>
        <marker id="scc-arrow-blue" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#38bdf8" />
        </marker>
        <marker id="scc-arrow-purple" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#c084fc" />
        </marker>
      </defs>
      <text x="210" y="28" fill="${directionColor}" font-size="11" font-weight="700" text-anchor="middle">${directionTag}</text>
      ${svgEdges}
      ${svgNodes}
    </svg>
  `;
}

export function renderStronglyConnectedCustomMetrics(container: HTMLElement, step: SCCStep): void {
  const { stage, currentNode, visited, nodes, isStronglyConnected, isReversed, action } = step;

  const resultStr =
    isStronglyConnected === true
      ? '是 (强连通图)'
      : isStronglyConnected === false
      ? '否 (非强连通)'
      : '检测推演中...';

  const resultColor =
    isStronglyConnected === true
      ? '#10b981'
      : isStronglyConnected === false
      ? '#ef4444'
      : '#38bdf8';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; padding: 4px 6px; box-sizing: border-box;">
      <!-- 指标卡片 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 6px; text-align: center;">
          <div style="font-size: 9.5px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 11px; font-weight: 700; color: #a855f7;">${stage}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 6px; text-align: center;">
          <div style="font-size: 9.5px; color: #64748b;">当前访问节点</div>
          <div style="font-size: 13px; font-weight: 700; color: #60a5fa;">${currentNode !== null ? currentNode : '—'}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 6px; text-align: center;">
          <div style="font-size: 9.5px; color: #64748b;">已访问计数</div>
          <div style="font-size: 13px; font-weight: 700; color: #34d399;">${visited.size} / ${nodes.length}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 6px; text-align: center;">
          <div style="font-size: 9.5px; color: #64748b;">强连通判定</div>
          <div style="font-size: 11px; font-weight: 700; color: ${resultColor};">${resultStr}</div>
        </div>
      </div>

      <!-- Kosaraju 算法理论分析舱 -->
      <div style="background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 8px 10px; display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 10.5px; font-weight: 800; color: #38bdf8;">🔗 Kosaraju 双向 DFS 判定定理</span>
          <span style="font-size: 9.5px; color: ${isReversed ? '#c084fc' : '#94a3b8'};">
            ${isReversed ? '反向图逆流验证中' : '正向图可达性验证中'}
          </span>
        </div>
        <div style="font-size: 10px; color: #cbd5e1; line-height: 1.5;">
          定理依据：从基准节点 0 出发，若正向 DFS 可达全图所有节点（说明 0 能到达所有节点），且反向图 DFS 亦可达全图所有节点（说明所有节点能到达 0），则任意点对双向互通，全图必为强连通图！
        </div>
      </div>
    </div>
  `;
}
