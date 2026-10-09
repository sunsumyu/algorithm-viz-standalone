/**
 * 冗余连接 (LC 684) 步进编译器 (RedundantEdgeStepCompiler)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：并查集状态演进、无向图回路检测、解释器级逐行高亮四语言步进编译
 */

import { StepBase } from '../../../core/step-visualizer';
import { HighlightTarget } from '../../../core/code-panel';

export interface RedundantStep extends StepBase {
  nodes: number[];
  edges: [number, number][];
  currentEdge: [number, number] | null;
  rootU: number | null;
  rootV: number | null;
  treeEdges: [number, number][];
  redundantEdge: [number, number] | null;
  parent: number[];
  action: 'init' | 'check' | 'union' | 'found-redundant' | 'done';
  statusText: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export const RE_NODES = [1, 2, 3, 4, 5];
export const RE_EDGES: [number, number][] = [
  [1, 2],
  [2, 3],
  [3, 4],
  [1, 4],
  [1, 5],
];

export const RE_NODE_POSITIONS: { x: number; y: number }[] = [
  { x: 120, y: 70 },
  { x: 280, y: 70 },
  { x: 280, y: 200 },
  { x: 120, y: 200 },
  { x: 380, y: 135 },
];

export function buildRedundantSteps(): RedundantStep[] {
  const steps: RedundantStep[] = [];
  const n = RE_NODES.length;
  const parent = Array.from({ length: n + 1 }, (_, i) => i);

  // 精准 8 处四语言映射行号字典 (cpp / java / python / javascript 数组 1-based 索引)
  const lines = {
    entry: { cpp: 3, java: 2, python: 2, javascript: 1 },
    initParent: { cpp: 5, java: 4, python: 3, javascript: 2 },
    forEdge: { cpp: 6, java: 5, python: 7, javascript: 4 },
    unpackEdge: { cpp: 7, java: 6, python: 7, javascript: 4 },
    findRoots: { cpp: 7, java: 7, python: 8, javascript: 5 },
    checkRoots: { cpp: 8, java: 8, python: 9, javascript: 6 },
    unionRoots: { cpp: 9, java: 9, python: 10, javascript: 7 },
    returnEmpty: { cpp: 11, java: 11, python: 11, javascript: 9 },
  };

  const find = (i: number): number => {
    let root = i;
    while (root !== parent[root]) {
      root = parent[root];
    }
    return root;
  };

  const treeEdges: [number, number][] = [];
  let foundRedundant: [number, number] | null = null;

  function makeStep(
    codeLine: HighlightTarget,
    action: 'init' | 'check' | 'union' | 'found-redundant' | 'done',
    statusText: string,
    log: string,
    currentEdge: [number, number] | null = null,
    rootU: number | null = null,
    rootV: number | null = null
  ): void {
    const pStr = parent.slice(1).map((p, i) => `${i + 1}:${p}`).join(', ');

    steps.push({
      nodes: RE_NODES,
      edges: RE_EDGES,
      currentEdge,
      rootU,
      rootV,
      treeEdges: [...treeEdges],
      redundantEdge: foundRedundant,
      parent: [...parent],
      action,
      statusText,
      log,
      codeLine,
      metrics: {
        'metric-re-cur-edge': currentEdge ? `[${currentEdge[0]}, ${currentEdge[1]}]` : '—',
        'metric-re-redundant': foundRedundant ? `[${foundRedundant[0]}, ${foundRedundant[1]}]` : '未发现',
        'metric-re-tree-edges': `${treeEdges.length}`,
        'metric-re-parent': `[${pStr}]`,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, 'init', '🚀 [算法启动] findRedundantConnection(edges)：启动并查集冗余连接判环。', 'findRedundantConnection 入口');
  makeStep(lines.initParent, 'init', `📊 [初始化并查集] parent[i] = i；节点 1~${n} 各自独立为一个集合。`, 'init parent[]');

  // 2. 逐边遍历
  for (const edge of RE_EDGES) {
    const [u, v] = edge;

    makeStep(lines.forEdge, 'check', `🔁 [遍历边] 考察边 [${u}, ${v}]。`, `for edge [${u}, ${v}]`, edge);
    makeStep(lines.unpackEdge, 'check', `  ↳ [解构边两端] u = ${u}, v = ${v}。`, `u=${u}, v=${v}`, edge);

    const rU = find(u);
    const rV = find(v);
    makeStep(lines.findRoots, 'check', `  🔍 [查找根节点] find(${u}) = ${rU}, find(${v}) = ${rV}。`, `rootU=${rU}, rootV=${rV}`, edge, rU, rV);

    const isCycle = rU === rV;
    makeStep(lines.checkRoots, isCycle ? 'found-redundant' : 'check', `  🔎 [判环核验] if (rootU == rootV) -> (${rU} == ${rV}) -> (${isCycle})。`, `check rootU == rootV`, edge, rU, rV);

    if (isCycle) {
      foundRedundant = edge;
      makeStep(lines.checkRoots, 'found-redundant', `⚠️ [捕获冗余边] return edge！边 [${u}, ${v}] 两端已在同一连通集合中 (根为 ${rU})，加入该边导致环路形成，此边即为冗余边！`, `found redundant [${u}, ${v}]`, edge, rU, rV);
      break;
    } else {
      parent[rU] = rV;
      treeEdges.push(edge);
      makeStep(lines.unionRoots, 'union', `  🔗 [合并集合] parent[${rU}] = ${rV}；边 [${u}, ${v}] 为树边，将两连通块合并！`, `union: parent[${rU}] = ${rV}`, edge, rU, rV);
    }
  }

  makeStep(lines.checkRoots, 'done', `🎉 [冗余连接定位完毕] 检测出最终成环冗余边: [${foundRedundant?.[0]}, ${foundRedundant?.[1]}]，移除后恢复为树结构！`, 'done', foundRedundant);

  return steps;
}
