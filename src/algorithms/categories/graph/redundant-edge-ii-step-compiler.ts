/**
 * 冗余连接 II (LC 685) 步进编译器 (RedundantEdgeIIStepCompiler)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：有向树双父节点冲突统计、并查集有向环检验、三向分支决策推演
 */

import { StepBase } from '../../../core/step-visualizer';
import { HighlightTarget } from '../../../core/code-panel';

export interface RedundantIIStep extends StepBase {
  nodes: number[];
  edges: [number, number][];
  inDegree: number[];
  conflictIndex: number;
  cycleIndex: number;
  currentEdgeIndex: number;
  currentEdge: [number, number] | null;
  resultEdge: [number, number] | null;
  parent: number[];
  action: 'init' | 'check-indegree' | 'check-cycle' | 'union' | 'found-conflict' | 'done';
  statusText: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export const RE2_NODES = [1, 2, 3];
export const RE2_EDGES: [number, number][] = [
  [1, 2],
  [1, 3],
  [2, 3],
];

export const RE2_NODE_POSITIONS: { x: number; y: number }[] = [
  { x: 120, y: 70 },
  { x: 300, y: 70 },
  { x: 210, y: 190 },
];

export function buildRedundantIISteps(): RedundantIIStep[] {
  const steps: RedundantIIStep[] = [];
  const n = RE2_NODES.length;
  const edges = RE2_EDGES;
  const inDegree = new Array(n + 1).fill(0);
  let conflict = -1;
  let cycle = -1;

  // 精准 14 处四语言映射行号字典 (cpp / java / python / javascript 数组 1-based 索引)
  const lines = {
    entry: { cpp: 3, java: 2, python: 2, javascript: 1 },
    initVars: { cpp: 4, java: 3, python: 3, javascript: 2 },
    initParent: { cpp: 6, java: 7, python: 9, javascript: 8 },
    forInDegree: { cpp: 7, java: 8, python: 6, javascript: 5 },
    checkInDegree: { cpp: 8, java: 9, python: 7, javascript: 6 },
    recordInDegree: { cpp: 8, java: 10, python: 8, javascript: 6 },
    forCycle: { cpp: 10, java: 13, python: 10, javascript: 9 },
    skipConflict: { cpp: 11, java: 14, python: 11, javascript: 10 },
    findRoots: { cpp: 12, java: 16, python: 12, javascript: 11 },
    checkRoots: { cpp: 13, java: 17, python: 13, javascript: 12 },
    unionRoots: { cpp: 14, java: 18, python: 14, javascript: 13 },
    checkConflictLessZero: { cpp: 16, java: 20, python: 15, javascript: 15 },
    checkCycleGreaterEqualZero: { cpp: 17, java: 21, python: 16, javascript: 16 },
    returnConflict: { cpp: 18, java: 22, python: 17, javascript: 17 },
  };

  const parent = Array.from({ length: n + 1 }, (_, i) => i);

  const find = (i: number): number => {
    let root = i;
    while (root !== parent[root]) {
      root = parent[root];
    }
    return root;
  };

  function makeStep(
    codeLine: HighlightTarget,
    action: 'init' | 'check-indegree' | 'check-cycle' | 'union' | 'found-conflict' | 'done',
    statusText: string,
    log: string,
    currentEdgeIndex: number = -1,
    currentEdge: [number, number] | null = null,
    resultEdge: [number, number] | null = null
  ): void {
    const degStr = inDegree.slice(1).map((d, i) => `${i + 1}:${d}`).join(', ');
    const pStr = parent.slice(1).map((p, i) => `${i + 1}:${p}`).join(', ');

    steps.push({
      nodes: RE2_NODES,
      edges,
      inDegree: [...inDegree],
      conflictIndex: conflict,
      cycleIndex: cycle,
      currentEdgeIndex,
      currentEdge,
      resultEdge,
      parent: [...parent],
      action,
      statusText,
      log,
      codeLine,
      metrics: {
        'metric-re2-conflict': conflict >= 0 ? `edges[${conflict}]=[${edges[conflict][0]}, ${edges[conflict][1]}]` : '无',
        'metric-re2-cycle': cycle >= 0 ? `edges[${cycle}]=[${edges[cycle][0]}, ${edges[cycle][1]}]` : '无',
        'metric-re2-indegree': `[${degStr}]`,
        'metric-re2-uf': `[${pStr}]`,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, 'init', '🚀 [算法启动] findRedundantDirectedConnection(edges)：启动有向图冗余连接双父节点与有向环判定。', 'findRedundantDirectedConnection 入口');
  makeStep(lines.initVars, 'init', `📊 [初始化统计数据] inDegree = [0,0,0,0], conflict = -1, cycle = -1。`, 'init variables');

  // 2. 第一轮：统计入度检测双父节点冲突
  for (let i = 0; i < n; i++) {
    const [u, v] = edges[i];
    makeStep(lines.forInDegree, 'check-indegree', `🔁 [入度遍历] 考察边 edges[${i}] = [${u}, ➔ ${v}]。`, `edges[${i}] = [${u}, ${v}]`, i, edges[i]);

    if (inDegree[v] > 0) {
      conflict = i;
      makeStep(lines.checkInDegree, 'found-conflict', `⚠️ [捕获入度为2冲突] 顶点 ${v} 已有入边 (inDegree[${v}]=${inDegree[v]})，边 edges[${i}]=[${u}, ${v}] 为第二条入边！记录 conflict = ${i}。`, `conflict = ${i} ([${u}, ${v}])`, i, edges[i]);
    } else {
      inDegree[v]++;
      makeStep(lines.recordInDegree, 'check-indegree', `  ↳ [累加入度] inDegree[${v}] 自增为 ${inDegree[v]}。`, `inDegree[${v}]++`, i, edges[i]);
    }
  }

  // 3. 第二轮：并查集判环 (若有 conflict 则假设跳过 conflict 边)
  makeStep(lines.initParent, 'init', `🏷️ [初始化并查集] parent[i] = i；重置并查集准备进行环路检测。`, 'init parent[]');

  for (let i = 0; i < n; i++) {
    makeStep(lines.forCycle, 'check-cycle', `🔁 [环路检测遍历] 考察边 edges[${i}] = [${edges[i][0]}, ${edges[i][1]}]。`, `for cycle edges[${i}]`, i, edges[i]);

    if (i === conflict) {
      makeStep(lines.skipConflict, 'check-cycle', `⏭️ [假设跳过冲突边] i === conflict (${conflict})，跳过边 edges[${i}]=[${edges[i][0]}, ${edges[i][1]}]，检验其余边是否仍有环。`, `skip conflict edge ${i}`, i, edges[i]);
      continue;
    }

    const [u, v] = edges[i];
    const rU = find(u);
    const rV = find(v);
    makeStep(lines.findRoots, 'check-cycle', `  🔍 [查找并查集根] find(${u}) = ${rU}, find(${v}) = ${rV}。`, `find(${u})=${rU}, find(${v})=${rV}`, i, edges[i]);

    if (rU === rV) {
      cycle = i;
      makeStep(lines.checkRoots, 'check-cycle', `⚠️ [捕获有向环] rootU == rootV (${rU} == ${rV})！边 edges[${i}]=[${u}, ${v}] 导致形成环路，记录 cycle = ${i}。`, `cycle = ${i} ([${u}, ${v}])`, i, edges[i]);
    } else {
      parent[rU] = rV;
      makeStep(lines.unionRoots, 'union', `  🔗 [合并连通块] parent[${rU}] = ${rV}；将连通分支合并。`, `union: parent[${rU}]=${rV}`, i, edges[i]);
    }
  }

  // 4. 终局决策三大分支
  makeStep(lines.checkConflictLessZero, 'check-cycle', `🔎 [终局判定-分支1] if (conflict < 0) -> (${conflict} < 0) -> (${conflict < 0})；若无入度为2冲突，直接返回成环边。`, 'check conflict < 0');
  if (conflict < 0) {
    const res = edges[cycle];
    makeStep(lines.checkConflictLessZero, 'done', `🎉 [无双父节点冲突] return edges[cycle]！无入度2冲突，成环边 edges[${cycle}]=[${res[0]}, ${res[1]}] 即为冗余连接！`, 'return edges[cycle]', cycle, res, res);
    return steps;
  }

  makeStep(lines.checkCycleGreaterEqualZero, 'check-cycle', `🔎 [终局判定-分支2] if (cycle >= 0) -> (${cycle} >= 0) -> (${cycle >= 0})；若跳过 conflict 边后仍有环，说明导致环的必须是第一条入边！`, 'check cycle >= 0');
  if (cycle >= 0) {
    // 寻找指向 conflict 目标节点的首条边
    const targetV = edges[conflict][1];
    let firstParentEdge: [number, number] | null = null;
    for (let i = 0; i < n; i++) {
      if (edges[i][1] === targetV && i !== conflict) {
        firstParentEdge = edges[i];
        break;
      }
    }
    makeStep(lines.checkCycleGreaterEqualZero, 'done', `🎉 [双父且成环冲突] return firstParentEdge！跳过 conflict 边后仍检测到环 (cycle=${cycle})，故必须删除更早指向节点 ${targetV} 的第一条入边: [${firstParentEdge?.[0]}, ${firstParentEdge?.[1]}]！`, 'return firstParentEdge', conflict, firstParentEdge, firstParentEdge);
    return steps;
  }

  // 分支3：跳过 conflict 边后无环，说明 conflict 边就是冗余边
  const res = edges[conflict];
  makeStep(lines.returnConflict, 'done', `🎉 [双父且跳过无环] return edges[conflict]！跳过该边后整图成为无环合法有向树，边 edges[${conflict}]=[${res[0]}, ${res[1]}] 即为冗余连接！`, 'return edges[conflict]', conflict, res, res);

  return steps;
}
