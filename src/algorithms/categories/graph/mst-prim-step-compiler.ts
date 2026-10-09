/**
 * Prim 最小生成树步进编译器 (MstPrimStepCompiler)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：加点法贪心扩充、minDist 切边维护、前驱指针更新与生成树权值累加推演
 */

import { StepBase } from '../../../core/step-visualizer';
import { HighlightTarget } from '../../../core/code-panel';
import {
  MST_NODES,
  MST_EDGES,
  MST_NODE_POSITIONS,
} from './mst-kruskal-step-compiler';

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

const INF = Infinity;

export function buildPrimSteps(): PrimStep[] {
  const steps: PrimStep[] = [];
  const n = MST_NODES.length;
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

  // 构建无向图邻接表
  const adj: { v: number; w: number }[][] = Array.from({ length: n }, () => []);
  for (const e of MST_EDGES) {
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
      nodes: MST_NODES,
      edges: MST_EDGES,
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
