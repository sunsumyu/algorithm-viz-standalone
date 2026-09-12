/**
 * Kruskal 最小生成树可视化器 — 4-Card 标准现代架构
 * 边权升序排序、并查集回路检测与加边法贪心合并 (左程云 class058)
 * 深度架构重构：严格解释器级全流程逐行高亮执行（边权排序、并查集初始化、按序遍历边、解构边元、并查集回路检验、合并操作、权值累加、达到V-1条边提前早停均发射独立Step）、四语言行号映射
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import {
  MST_KRUSKAL_PROBLEM_HTML,
  MST_KRUSKAL_ANALYSIS_HTML,
  MST_KRUSKAL_CODE_LANGUAGES,
} from './mst-kruskal-problem-content';
import { PRIM_NODES, PRIM_EDGES, PRIM_NODE_POSITIONS } from './mst-prim-renderer';
import { HighlightTarget } from '../../../core/code-panel';

export interface KruskalStep extends StepBase {
  nodes: number[];
  allEdges: { u: number; v: number; w: number }[];
  currentEdge: { u: number; v: number; w: number } | null;
  currentEdgeIndex: number;
  rootU: number | null;
  rootV: number | null;
  mstEdges: { u: number; v: number; w: number }[];
  rejectedEdges: { u: number; v: number; w: number }[];
  totalWeight: number;
  parent: number[];
  action: 'init' | 'check' | 'accept' | 'reject' | 'done';
  statusText: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildKruskalSteps(): KruskalStep[] {
  const steps: KruskalStep[] = [];
  const n = PRIM_NODES.length;
  const parent = Array.from({ length: n }, (_, i) => i);

  // 精准 11 处四语言映射行号字典 (cpp / java / python / javascript 数组 1-based 索引)
  const lines = {
    entry: { cpp: 1, java: 2, python: 1, javascript: 1 },
    sortEdges: { cpp: 2, java: 3, python: 2, javascript: 2 },
    initUF: { cpp: 5, java: 4, python: 3, javascript: 3 },
    initVars: { cpp: 6, java: 5, python: 4, javascript: 4 },
    forEdge: { cpp: 7, java: 6, python: 6, javascript: 5 },
    unpackEdge: { cpp: 8, java: 7, python: 6, javascript: 5 },
    checkUnion: { cpp: 9, java: 8, python: 7, javascript: 6 },
    doUnion: { cpp: 10, java: 9, python: 8, javascript: 7 },
    addWeight: { cpp: 11, java: 10, python: 9, javascript: 8 },
    checkBreak: { cpp: 12, java: 11, python: 11, javascript: 9 },
    returnAns: { cpp: 15, java: 14, python: 12, javascript: 12 },
  };

  const find = (i: number): number => {
    let root = i;
    while (root !== parent[root]) {
      root = parent[root];
    }
    return root;
  };

  const union = (i: number, j: number): void => {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) {
      parent[rootI] = rootJ;
    }
  };

  // 升序排序边
  const sortedEdges = [...PRIM_EDGES].sort((a, b) => a.w - b.w);
  const mstEdges: { u: number; v: number; w: number }[] = [];
  const rejectedEdges: { u: number; v: number; w: number }[] = [];
  let totalWeight = 0;

  function makeStep(
    codeLine: HighlightTarget,
    action: 'init' | 'check' | 'accept' | 'reject' | 'done',
    statusText: string,
    log: string,
    currentEdge: { u: number; v: number; w: number } | null = null,
    currentEdgeIndex: number = -1,
    rootU: number | null = null,
    rootV: number | null = null
  ): void {
    steps.push({
      nodes: PRIM_NODES,
      allEdges: sortedEdges,
      currentEdge,
      currentEdgeIndex,
      rootU,
      rootV,
      mstEdges: [...mstEdges],
      rejectedEdges: [...rejectedEdges],
      totalWeight,
      parent: [...parent],
      action,
      statusText,
      log,
      codeLine,
      metrics: {
        'metric-kruskal-edges': `${mstEdges.length} / ${n - 1}`,
        'metric-kruskal-weight': `${totalWeight}`,
        'metric-kruskal-edge': currentEdge ? `(${currentEdge.u}➔${currentEdge.v}, w=${currentEdge.w})` : '—',
        'metric-kruskal-uf': `[${parent.join(', ')}]`,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, 'init', '🚀 [算法启动] kruskalMST(n=5, edges)：启动 Kruskal 最小生成树算法。', 'kruskalMST 入口');
  makeStep(lines.sortEdges, 'init', `📊 [边权升序排序] Arrays.sort(edges)；将全图 ${PRIM_EDGES.length} 条边按权值从小到大排序。`, 'sort edges by weight');
  makeStep(lines.initUF, 'init', `🏷️ [初始化并查集] UnionFind uf = new UnionFind(${n})；每个节点初始为独立连通块。`, 'init UnionFind');
  makeStep(lines.initVars, 'init', '🌱 [初始化统计变量] int totalWeight = 0, count = 0。', 'totalWeight = 0, count = 0');

  // 2. 依次遍历贪心加边
  for (let idx = 0; idx < sortedEdges.length; idx++) {
    const edge = sortedEdges[idx];
    const { u, v, w } = edge;

    makeStep(lines.forEdge, 'check', `🔎 [遍历候选边] 考察第 ${idx + 1} 条边 (${u} ➔ ${v}, 权重 w=${w})。`, `for edge (${u}->${v}, w=${w})`, edge, idx);
    makeStep(lines.unpackEdge, 'check', `  ↳ [解构边元] u=${u}, v=${v}, w=${w}。`, `u=${u}, v=${v}, w=${w}`, edge, idx);

    const rU = find(u);
    const rV = find(v);
    const isCycle = rU === rV;

    makeStep(lines.checkUnion, isCycle ? 'reject' : 'check', `  🔎 [并查集判环] find(${u})=${rU}, find(${v})=${rV} -> (${rU} ${isCycle ? '==' : '!='} ${rV})。`, `check find(${u}) vs find(${v})`, edge, idx, rU, rV);

    if (!isCycle) {
      union(u, v);
      makeStep(lines.doUnion, 'accept', `  🔗 [合并连通分量] uf.union(${u}, ${v})；将节点 ${u} 与节点 ${v} 所在集合合并！`, `union(${u}, ${v})`, edge, idx, rU, rV);

      mstEdges.push(edge);
      totalWeight += w;
      makeStep(lines.addWeight, 'accept', `  ⚡ [加入生成树] 边 (${u} ➔ ${v}) 成功纳入 MST！累计权值 totalWeight = ${totalWeight}。`, `add edge to MST (total=${totalWeight})`, edge, idx, rU, rV);

      const reachedMST = mstEdges.length === n - 1;
      makeStep(lines.checkBreak, 'accept', `  🔎 [检查边数满足] if (++count == ${n - 1}) -> 当前已选 ${mstEdges.length} 条边 (${reachedMST ? '已满 V-1，提前终止！' : '未满，继续选边'})。`, `check count == n - 1`, edge, idx, rU, rV);

      if (reachedMST) {
        break;
      }
    } else {
      rejectedEdges.push(edge);
      makeStep(lines.checkUnion, 'reject', `  ❌ [形成回路舍弃] 节点 ${u} 与 ${v} 已在同一集合 (根均为 ${rU})，加入将构成回路，必须舍弃！`, `reject cycle edge (${u}->${v})`, edge, idx, rU, rV);
    }
  }

  makeStep(lines.returnAns, 'done', `🎉 [Kruskal 算法达成] return totalWeight！成功选满 ${mstEdges.length} 条边，构建出全局最小生成树，总权值: ${totalWeight}！`, 'return totalWeight');

  return steps;
}


/** 主视觉：无向图 SVG（MST 高亮 + 并查集父数组标注） */
export function renderMstKruskalCanvas(container: HTMLElement, step: KruskalStep): void {
  const { mstEdges, rejectedEdges, currentEdge, currentEdgeIndex, allEdges, totalWeight, parent, action } = step;

  let svgHtml = `<svg viewBox="0 0 500 250" style="width:100%; height:100%; max-height:240px;">`;

  for (const e of PRIM_EDGES) {
    const p1 = PRIM_NODE_POSITIONS[e.u];
    const p2 = PRIM_NODE_POSITIONS[e.v];
    const isMst = mstEdges.some((me) => (me.u === e.u && me.v === e.v) || (me.u === e.v && me.v === e.u));
    const isRejected = rejectedEdges.some((re) => (re.u === e.u && re.v === e.v) || (re.u === e.v && re.v === e.u));
    const isCurrent = currentEdge && ((currentEdge.u === e.u && currentEdge.v === e.v) || (currentEdge.u === e.v && currentEdge.v === e.u));

    let strokeColor = '#cbd5e1';
    let strokeWidth = 1.8;
    let strokeDash = 'none';

    if (isMst) {
      strokeColor = '#10b981';
      strokeWidth = 3.5;
    } else if (isCurrent && action === 'accept') {
      strokeColor = '#10b981';
      strokeWidth = 4;
    } else if (isCurrent && action === 'reject') {
      strokeColor = '#ef4444';
      strokeWidth = 3;
      strokeDash = '4,4';
    } else if (isCurrent) {
      strokeColor = '#3b82f6';
      strokeWidth = 3.5;
    } else if (isRejected) {
      strokeColor = '#fca5a5';
      strokeWidth = 1.5;
      strokeDash = '3,3';
    }

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2 - 8;

    svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" />`;
    svgHtml += `<rect x="${midX - 10}" y="${midY - 8}" width="20" height="15" rx="3" fill="#ffffff" stroke="${strokeColor}" stroke-width="1" />`;
    svgHtml += `<text x="${midX}" y="${midY + 3}" fill="#0f172a" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${e.w}</text>`;
  }

  PRIM_NODES.forEach((node) => {
    const p = PRIM_NODE_POSITIONS[node];
    const isCurrentNode = currentEdge && (currentEdge.u === node || currentEdge.v === node);

    let fill = '#ffffff';
    let stroke = '#cbd5e1';
    if (isCurrentNode && action === 'accept') {
      fill = '#dcfce7';
      stroke = '#10b981';
    } else if (isCurrentNode) {
      fill = '#dbeafe';
      stroke = '#3b82f6';
    }

    svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />`;
    svgHtml += `<text x="${p.x}" y="${p.y + 4}" fill="#0f172a" font-size="12" font-weight="800" text-anchor="middle">${node}</text>`;
    svgHtml += `<text x="${p.x}" y="${p.y + 32}" fill="#64748b" font-size="10.5" font-family="monospace" text-anchor="middle">p:${parent[node]}</text>`;
  });

  svgHtml += `</svg>`;

  // 边清单状态
  const edgeListHtml = allEdges
    .map((e, idx) => {
      const isMst = mstEdges.some((me) => (me.u === e.u && me.v === e.v) || (me.u === e.v && me.v === e.u));
      const isRejected = rejectedEdges.some((re) => (re.u === e.u && re.v === e.v) || (re.u === e.v && re.v === e.u));
      const isCur = currentEdgeIndex === idx;

      let statusBadge = '<span style="color: #94a3b8;">待处理</span>';
      if (isMst) statusBadge = '<span style="color: #059669; font-weight: 700;">已加入 MST</span>';
      else if (isRejected) statusBadge = '<span style="color: #ef4444; font-weight: 700;">环路舍弃</span>';
      else if (isCur) statusBadge = '<span style="color: #2563eb; font-weight: 700;">考察中</span>';

      return `<div style="display: flex; align-items: center; gap: 10px; padding: 3px 10px; border-radius: 6px; font-family: monospace; font-size: 10.5px; background: ${isCur ? 'rgba(59,130,246,0.08)' : 'transparent'};">
        <span style="font-weight: 700; color: #1e293b; min-width: 52px;">(${e.u}, ${e.v})</span>
        <span style="font-weight: 800; color: #2563eb; min-width: 24px;">${e.w}</span>
        <span style="flex: 1; text-align: right;">${statusBadge}</span>
      </div>`;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; gap: 12px; align-items: center; padding: 8px; box-sizing: border-box;">
      <div style="flex: 1.4; display: flex; align-items: center; justify-content: center;">
        ${svgHtml}
      </div>
      <div style="flex: 1; max-height: 100%; overflow-y: auto; border: 1px solid rgba(148,163,255,0.22); border-radius: 10px; padding: 6px; background: rgba(10,10,30,0.02);">
        <div style="font-size: 10px; font-weight: 700; color: #64748b; margin-bottom: 4px; text-align: center;">边权升序清单（并查集判环）</div>
        ${edgeListHtml}
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'mst-kruskal',
  name: 'Kruskal 最小生成树',
  category: 'graph',
  icon: '🌲',
  difficulty: 3,
  levelOrder: 29,
  description: '左程云算法通关课 Class 058：加边法全局贪心求解最小生成树，边权升序排列配合并查集判环',
  learningGoal: '掌握加边法全局贪心思想、并查集回路检测与连通分量合并机制',
  inputs: [],
  presets: [
    { label: '默认图 (5 节点)', values: {} },
  ],
  metrics: [
    { id: 'metric-kruskal-edges', label: '已加入 MST 边数', color: '#10b981' },
    { id: 'metric-kruskal-weight', label: '生成树总权值', color: '#10b981' },
    { id: 'metric-kruskal-edge', label: '当前考察边', color: '#3b82f6' },
    { id: 'metric-kruskal-uf', label: '并查集 parent', color: '#a855f7' },
  ],
  legend: [
    { label: '已加入 MST', color: '#10b981' },
    { label: '当前考察边', color: '#3b82f6' },
    { label: '环路舍弃', color: '#ef4444' },
  ],
  codeLanguages: MST_KRUSKAL_CODE_LANGUAGES,
  problemHtml: MST_KRUSKAL_PROBLEM_HTML,
  analysisHtml: MST_KRUSKAL_ANALYSIS_HTML,
  generateSteps: (inputs) => buildKruskalSteps(),
  renderCanvas: (container, step) => renderMstKruskalCanvas(container, step as KruskalStep),
});
