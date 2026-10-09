/**
 * Kruskal 最小生成树步进编译器 (MstKruskalStepCompiler)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：边权升序排序、并查集回路检验、加边法贪心合并与生成树权值累加推演
 */

import { StepBase } from '../../../core/step-visualizer';
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

export const MST_NODES = [0, 1, 2, 3, 4];
export const MST_EDGES = [
  { u: 0, v: 1, w: 2 },
  { u: 0, v: 3, w: 6 },
  { u: 1, v: 2, w: 3 },
  { u: 1, v: 3, w: 8 },
  { u: 1, v: 4, w: 5 },
  { u: 2, v: 4, w: 7 },
  { u: 3, v: 4, w: 9 },
];

export const MST_NODE_POSITIONS: { x: number; y: number }[] = [
  { x: 70, y: 130 },
  { x: 210, y: 55 },
  { x: 370, y: 55 },
  { x: 210, y: 205 },
  { x: 370, y: 205 },
];

// 向后兼容旧符号引用
export const PRIM_NODES = MST_NODES;
export const PRIM_EDGES = MST_EDGES;
export const PRIM_NODE_POSITIONS = MST_NODE_POSITIONS;

export function buildKruskalSteps(): KruskalStep[] {
  const steps: KruskalStep[] = [];
  const n = MST_NODES.length;
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
  const sortedEdges = [...MST_EDGES].sort((a, b) => a.w - b.w);
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
      nodes: MST_NODES,
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
  makeStep(lines.sortEdges, 'init', `📊 [边权升序排序] Arrays.sort(edges)；将全图 ${MST_EDGES.length} 条边按权值从小到大排序。`, 'sort edges by weight');
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
