/**
 * Prim 最小生成树可视化器 — 4-Card 标准现代架构
 * 加点法贪心扩充、minDist 切边维护与生成树高亮 (左程云 class058)
 * 深度架构重构：严格解释器级全流程逐行高亮执行（源点初始化、V轮外层加点循环、未入树最小点u挑选、纳入inMST标记、权值累加、出边扫描、更优切边更新均发射独立Step）、四语言行号映射
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import {
  MST_PRIM_PROBLEM_HTML,
  MST_PRIM_ANALYSIS_HTML,
  MST_PRIM_CODE_LANGUAGES,
} from './mst-prim-problem-content';
import { HighlightTarget } from '../../../core/code-panel';

export interface PrimStep extends StepBase {
  nodes: number[];
  edges: { u: number; v: number; w: number }[];
  minDist: number[];
  inMST: boolean[];
  mstEdges: { u: number; v: number; w: number }[];
  currentNode: number | null;
  activeEdge: { u: number; v: number; w: number } | null;
  totalWeight: number;
  action: 'init' | 'select' | 'update-edge' | 'skip' | 'done';
  statusText: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export const PRIM_NODES = [0, 1, 2, 3, 4];
export const PRIM_EDGES = [
  { u: 0, v: 1, w: 2 },
  { u: 0, v: 3, w: 6 },
  { u: 1, v: 2, w: 3 },
  { u: 1, v: 3, w: 8 },
  { u: 1, v: 4, w: 5 },
  { u: 2, v: 4, w: 7 },
  { u: 3, v: 4, w: 9 },
];

export const PRIM_NODE_POSITIONS: { x: number; y: number }[] = [
  { x: 70, y: 130 },
  { x: 210, y: 55 },
  { x: 370, y: 55 },
  { x: 210, y: 205 },
  { x: 370, y: 205 },
];

const INF = Infinity;

export function buildPrimSteps(): PrimStep[] {
  const steps: PrimStep[] = [];
  const n = PRIM_NODES.length;
  const minDist = new Array(n).fill(INF);
  const parent = new Array(n).fill(-1);
  const inMST = new Array(n).fill(false);
  const mstEdges: { u: number; v: number; w: number }[] = [];

  // 精准 14 处四语言映射行号字典 (cpp / java / python / javascript 数组 1-based 索引)
  const lines = {
    entry: { cpp: 1, java: 2, python: 1, javascript: 1 },
    initMinDist: { cpp: 2, java: 4, python: 2, javascript: 2 },
    setSrc: { cpp: 4, java: 5, python: 4, javascript: 4 },
    initInMST: { cpp: 3, java: 6, python: 3, javascript: 3 },
    initWeight: { cpp: 5, java: 7, python: 5, javascript: 5 },
    forStep: { cpp: 6, java: 8, python: 6, javascript: 6 },
    initU: { cpp: 7, java: 9, python: 7, javascript: 7 },
    findMinU: { cpp: 8, java: 10, python: 8, javascript: 8 },
    setInMST: { cpp: 11, java: 13, python: 11, javascript: 11 },
    addWeight: { cpp: 12, java: 14, python: 12, javascript: 12 },
    forAdj: { cpp: 13, java: 15, python: 13, javascript: 13 },
    checkUpdate: { cpp: 14, java: 17, python: 14, javascript: 14 },
    updateMinDist: { cpp: 15, java: 18, python: 15, javascript: 15 },
    returnAns: { cpp: 20, java: 22, python: 16, javascript: 19 },
  };

  // Build adjacency list for undirected graph
  const adj: { v: number; w: number }[][] = Array.from({ length: n }, () => []);
  for (const e of PRIM_EDGES) {
    adj[e.u].push({ v: e.v, w: e.w });
    adj[e.v].push({ v: e.u, w: e.w });
  }

  let totalWeight = 0;

  function makeStep(
    codeLine: HighlightTarget,
    action: 'init' | 'select' | 'update-edge' | 'skip' | 'done',
    statusText: string,
    log: string,
    currentNode: number | null = null,
    activeEdge: { u: number; v: number; w: number } | null = null
  ): void {
    const dStr = minDist.map((d, i) => `${i}:${d === INF ? '∞' : d}`).join(', ');
    const mstCnt = inMST.filter(Boolean).length;

    steps.push({
      nodes: PRIM_NODES,
      edges: PRIM_EDGES,
      minDist: [...minDist],
      inMST: [...inMST],
      mstEdges: [...mstEdges],
      currentNode,
      activeEdge,
      totalWeight,
      action,
      statusText,
      log,
      codeLine,
      metrics: {
        'metric-prim-nodes': `${mstCnt} / ${n}`,
        'metric-prim-weight': `${totalWeight}`,
        'metric-prim-edge': activeEdge ? `(${activeEdge.u}➔${activeEdge.v}, w=${activeEdge.w})` : '—',
        'metric-prim-dist': `[${dStr}]`,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, 'init', '🚀 [算法启动] primMST(n=5, adj)：启动 Prim 最小生成树加点法。', 'primMST 入口');
  makeStep(lines.initMinDist, 'init', '📊 [初始化切边距离] Arrays.fill(minDist, INF)；除根节点外初始切边距离全为正无穷。', 'init minDist[]');

  minDist[0] = 0;
  makeStep(lines.setSrc, 'init', '🌱 [设置生长根节点] minDist[0] = 0；从节点 0 开始贪心生长最小生成树。', 'minDist[0] = 0');
  makeStep(lines.initInMST, 'init', '🏷️ [初始化并入标记] boolean[] inMST = new boolean[5]；记录已纳入生成树的点集。', 'init inMST[]');
  makeStep(lines.initWeight, 'init', '🌱 [初始化权重累加器] int totalWeight = 0。', 'totalWeight = 0');

  // 2. V 轮贪心加点
  for (let i = 0; i < n; i++) {
    makeStep(lines.forStep, 'select', `🔁 [加点主循环] for (i = ${i}; i < ${n}; i++)：开始挑选第 ${i + 1} 个加入生成树的顶点。`, `--- 第 ${i + 1} 次加点 ---`);

    makeStep(lines.initU, 'select', '🔍 [重置选点指针] int u = -1；准备在未并入顶点中搜寻 minDist 最小者。', 'u = -1');

    let u = -1;
    for (let j = 0; j < n; j++) {
      if (!inMST[j] && (u === -1 || minDist[j] < minDist[u])) {
        u = j;
      }
    }

    makeStep(lines.findMinU, 'select', `💡 [贪心确定最近点] 确定未并入顶点 u = ${u}，当前切边权值 minDist[${u}] = ${minDist[u]} 为全局最小！`, `选点: u = ${u}`);

    inMST[u] = true;
    makeStep(lines.setInMST, 'select', `🏷️ [纳入生成树集合] inMST[${u}] = true；顶点 ${u} 正式并入 MST 点集！`, `inMST[${u}] = true`, u);

    totalWeight += minDist[u];
    if (parent[u] !== -1) {
      const edge = { u: parent[u], v: u, w: minDist[u] };
      mstEdges.push(edge);
      makeStep(lines.addWeight, 'select', `⚡ [固化生成树边] 边 (${parent[u]} ➔ ${u}, w=${minDist[u]}) 固化并入 MST，累计权值增加至 ${totalWeight}！`, `MST add edge (${parent[u]}->${u})`, u, edge);
    } else {
      makeStep(lines.addWeight, 'select', `⚡ [固化根节点] 顶点 0 为初始根，无前驱连接边，累计权值: ${totalWeight}。`, 'root node 0', u);
    }

    // 用 u 更新其余未并入节点的 minDist
    for (const neighbor of adj[u]) {
      const v = neighbor.v;
      const w = neighbor.w;
      const curEdge = { u, v, w };

      makeStep(lines.forAdj, 'skip', `  ↳ [考察出边] 遍历与 ${u} 相连的边 (${u} ➔ ${v}, 权重 w=${w})。`, `edge (${u}->${v}, w=${w})`, u, curEdge);

      const canUpdate = !inMST[v] && w < minDist[v];
      makeStep(lines.checkUpdate, canUpdate ? 'update-edge' : 'skip', `  🔎 [更新切边条件] if (!inMST[${v}] && ${w} < minDist[${v}](${minDist[v] === INF ? '∞' : minDist[v]})) -> (${canUpdate})。`, `check cut edge (${u}->${v})`, u, curEdge);

      if (canUpdate) {
        const oldDist = minDist[v];
        minDist[v] = w;
        parent[v] = u;
        makeStep(lines.updateMinDist, 'update-edge', `  ⚡ [更新切边权值] 发现更优连接边！minDist[${v}] 从 ${oldDist === INF ? '∞' : oldDist} 缩短为 ${w}，前驱 parent[${v}] 设为 ${u}。`, `minDist[${v}]=${w}`, u, curEdge);
      } else {
        makeStep(lines.checkUpdate, 'skip', `  ⏭️ [跳过边] 顶点 ${v} ${inMST[v] ? '已在生成树中' : `已有更优或相等切边 (minDist=${minDist[v]})`}，无需更新。`, `skip edge (${u}->${v})`, u, curEdge);
      }
    }
  }

  makeStep(lines.returnAns, 'done', `🎉 [Prim 算法达成] return totalWeight！全图所有 ${n} 个顶点全部并入生成树，总边数 ${mstEdges.length}，最小生成树总权值: ${totalWeight}！`, 'return totalWeight');

  return steps;
}


/** 主视觉：无向图 SVG（MST 高亮 + minDist 切边着色） */
export function renderMstPrimCanvas(container: HTMLElement, step: PrimStep): void {
  const { minDist, inMST, mstEdges, currentNode, activeEdge, totalWeight, action } = step;

  let svgHtml = `<svg viewBox="0 0 500 250" style="width:100%; height:100%; max-height:240px;">`;

  for (const e of PRIM_EDGES) {
    const p1 = PRIM_NODE_POSITIONS[e.u];
    const p2 = PRIM_NODE_POSITIONS[e.v];
    const isMst = mstEdges.some((me) => (me.u === e.u && me.v === e.v) || (me.u === e.v && me.v === e.u));
    const isActive = activeEdge && ((activeEdge.u === e.u && activeEdge.v === e.v) || (activeEdge.u === e.v && activeEdge.v === e.u));
    const isCut = (inMST[e.u] && !inMST[e.v]) || (!inMST[e.u] && inMST[e.v]);

    let strokeColor = '#cbd5e1';
    let strokeWidth = 1.8;
    let strokeDash = 'none';

    if (isMst) {
      strokeColor = '#10b981';
      strokeWidth = 3.5;
    } else if (isActive && action === 'update-edge') {
      strokeColor = '#3b82f6';
      strokeWidth = 3;
    } else if (isActive) {
      strokeColor = '#60a5fa';
      strokeWidth = 2.5;
    } else if (isCut) {
      strokeColor = '#f59e0b';
      strokeWidth = 2;
      strokeDash = '4,4';
    }

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2 - 8;

    svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" />`;
    svgHtml += `<rect x="${midX - 10}" y="${midY - 8}" width="20" height="15" rx="3" fill="#ffffff" stroke="${strokeColor}" stroke-width="1" />`;
    svgHtml += `<text x="${midX}" y="${midY + 3}" fill="#0f172a" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${e.w}</text>`;
  }

  PRIM_NODES.forEach((node) => {
    const p = PRIM_NODE_POSITIONS[node];
    const isIn = inMST[node];
    const isCur = currentNode === node;
    const dVal = minDist[node];

    let fill = '#ffffff';
    let stroke = '#cbd5e1';
    if (isCur) {
      fill = '#fef08a';
      stroke = '#eab308';
    } else if (isIn) {
      fill = '#dcfce7';
      stroke = '#10b981';
    } else if (dVal !== INF) {
      fill = '#eff6ff';
      stroke = '#3b82f6';
    }

    svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />`;
    svgHtml += `<text x="${p.x}" y="${p.y + 4}" fill="#0f172a" font-size="12" font-weight="800" text-anchor="middle">${node}</text>`;
    svgHtml += `<text x="${p.x}" y="${p.y + 32}" fill="${dVal === INF ? '#94a3b8' : isIn ? '#15803d' : '#2563eb'}" font-size="11" font-family="monospace" font-weight="800" text-anchor="middle">${dVal === INF ? '∞' : dVal}</text>`;
  });

  svgHtml += `</svg>`;

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 8px; box-sizing: border-box;">
      ${svgHtml}
      <div style="font-family: monospace; font-size: 10px; color: #64748b;">节点下方标注 minDist 切边距离（∞ 表示不可达）· 总权值: <strong style="color: #10b981;">${totalWeight}</strong></div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'mst-prim',
  name: 'Prim 最小生成树',
  category: 'graph',
  icon: '🌲',
  difficulty: 3,
  levelOrder: 30,
  description: '左程云算法通关课 Class 058：加点法全局贪心生长最小生成树，维护切边最小距离数组 minDist',
  learningGoal: '掌握加点法贪心生长思想、切割性质（Cut Property）与 minDist 切边维护机制',
  inputs: [],
  presets: [
    { label: '默认图 (5 节点)', values: {} },
  ],
  metrics: [
    { id: 'metric-prim-nodes', label: '已入树节点', color: '#10b981' },
    { id: 'metric-prim-weight', label: '生成树总权值', color: '#10b981' },
    { id: 'metric-prim-edge', label: '当前切边', color: '#3b82f6' },
    { id: 'metric-prim-dist', label: 'minDist 数组', color: '#eab308' },
  ],
  legend: [
    { label: '已在生成树', color: '#10b981' },
    { label: '当前考察', color: '#eab308' },
    { label: '切边候选', color: '#f59e0b' },
    { label: '更优更新', color: '#3b82f6' },
  ],
  codeLanguages: MST_PRIM_CODE_LANGUAGES,
  problemHtml: MST_PRIM_PROBLEM_HTML,
  analysisHtml: MST_PRIM_ANALYSIS_HTML,
  generateSteps: (inputs) => buildPrimSteps(),
  renderCanvas: (container, step) => renderMstPrimCanvas(container, step as PrimStep),
});
