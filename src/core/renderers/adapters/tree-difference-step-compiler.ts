/**
 * Class 122: 树上差分 (Tree Difference - 点差分) 步骤编译器
 * 洛谷 P3128 [USACO15DEC] Max Flow P
 * 深模块核心编译器 (Deep Module)
 */

import { TREE_DIFFERENCE_CODES, TREE_DIFFERENCE_LINES } from '../../../algorithms/categories/tree/tree-117-123/tree-117-123-stage-codes';
import { Tree117Step, TreeNodeData } from '../../../algorithms/categories/tree/tree-117-123/tree-117-123-shared';

export interface TreeDiffStep extends Tree117Step {
  nodes: TreeNodeData[];
  edges: [number, number][];
  activeNodeId: number;
  diffMap: Record<number, number>;
  ansMap: Record<number, number>;
  curPath?: [number, number];
  curLca?: number;
  stage: 'diff' | 'prefix-sum' | 'done';
}

export { TREE_DIFFERENCE_CODES, TREE_DIFFERENCE_LINES };

export function buildTreeDiffSteps(
  rawEdges: [number, number][],
  pathList: [number, number][]
): TreeDiffStep[] {
  const steps: TreeDiffStep[] = [];
  const lines = TREE_DIFFERENCE_LINES;

  const nodeSet = new Set<number>();
  rawEdges.forEach(([a, b]) => { nodeSet.add(a); nodeSet.add(b); });
  const allNodeIds = Array.from(nodeSet).sort((a, b) => a - b);
  const n = allNodeIds.length;
  const adj = new Map<number, number[]>();
  allNodeIds.forEach(id => adj.set(id, []));
  rawEdges.forEach(([a, b]) => {
    adj.get(a)!.push(b);
    adj.get(b)!.push(a);
  });

  const root = 1;
  const depth = new Map<number, number>();
  const parent = new Map<number, number>();
  const maxK = Math.floor(Math.log2(n)) + 2;
  const up = new Map<number, number[]>();
  allNodeIds.forEach(id => up.set(id, new Array(maxK).fill(0)));

  function dfs(cur: number, p: number, d: number) {
    depth.set(cur, d);
    parent.set(cur, p);
    up.get(cur)![0] = p;
    for (let k = 1; k < maxK; k++) {
      const mid = up.get(cur)![k - 1];
      up.get(cur)![k] = mid > 0 ? up.get(mid)![k - 1] : 0;
    }
    for (const nxt of adj.get(cur)!) {
      if (nxt !== p) dfs(nxt, cur, d + 1);
    }
  }

  dfs(root, 0, 0);

  function getLca(u: number, v: number): number {
    if (depth.get(u)! < depth.get(v)!) {
      const t = u; u = v; v = t;
    }
    for (let k = maxK - 1; k >= 0; k--) {
      if (depth.get(u)! - (1 << k) >= depth.get(v)!) {
        u = up.get(u)![k];
      }
    }
    if (u === v) return u;
    for (let k = maxK - 1; k >= 0; k--) {
      if (up.get(u)![k] !== up.get(v)![k]) {
        u = up.get(u)![k];
        v = up.get(v)![k];
      }
    }
    return up.get(u)![0];
  }

  const diff: Record<number, number> = {};
  const ans: Record<number, number> = {};
  allNodeIds.forEach(id => {
    diff[id] = 0;
    ans[id] = 0;
  });

  const getSnapshot = (): TreeNodeData[] => {
    return allNodeIds.map(id => ({
      id,
      depth: depth.get(id) ?? 0,
      parent: parent.get(id) ?? 0,
      val: diff[id],
    }));
  };

  // Step 0: 入口
  steps.push({
    nodes: getSnapshot(),
    edges: [...rawEdges],
    activeNodeId: root,
    diffMap: { ...diff },
    ansMap: { ...ans },
    stage: 'diff',
    decision: `主函数入口：开始对树执行点差分，共需对 ${pathList.length} 条路径点权进行 +1 覆盖`,
    message: '点差分规则：diff[u]++, diff[v]++, diff[lca]--, diff[parent[lca]]--',
    log: `enter tree difference with ${pathList.length} paths`,
    codeLine: lines.entry,
    metrics: { '路径总数': pathList.length, '树节点总数': n },
  });

  // 处理每条路径
  for (const [u, v] of pathList) {
    const lca = getLca(u, v);
    const fa = parent.get(lca) || 0;

    steps.push({
      nodes: getSnapshot(),
      edges: [...rawEdges],
      activeNodeId: lca,
      diffMap: { ...diff },
      ansMap: { ...ans },
      curPath: [u, v],
      curLca: lca,
      stage: 'diff',
      decision: `处理路径 (${u} -> ${v})：通过倍增计算两点 LCA 为 #${lca}，其父节点为 #${fa || 'None'}`,
      message: `两点深度分别为 depth[${u}]=${depth.get(u)}, depth[${v}]=${depth.get(v)}, LCA深度=${depth.get(lca)}`,
      log: `calcLca(u=${u}, v=${v}) = ${lca}`,
      codeLine: lines.calcLca,
      metrics: { '当前路径': `${u} -> ${v}`, '最近公共祖先': `#${lca}` },
      highlightNodes: [u, v, lca],
    });

    diff[u] = (diff[u] || 0) + 1;
    diff[v] = (diff[v] || 0) + 1;
    diff[lca] = (diff[lca] || 0) - 1;

    steps.push({
      nodes: getSnapshot(),
      edges: [...rawEdges],
      activeNodeId: lca,
      diffMap: { ...diff },
      ansMap: { ...ans },
      curPath: [u, v],
      curLca: lca,
      stage: 'diff',
      decision: `应用点差分核心标记：diff[${u}]++, diff[${v}]++, diff[${lca}]--`,
      message: `标记后 diff[${u}]=${diff[u]}, diff[${v}]=${diff[v]}, diff[${lca}]=${diff[lca]}`,
      log: `markDiff(u=${u}, v=${v}, lca=${lca})`,
      codeLine: lines.markDiff,
      metrics: { 'diff变化': `u(+1), v(+1), lca(-1)` },
      highlightNodes: [u, v, lca],
    });

    if (fa > 0) {
      diff[fa] = (diff[fa] || 0) - 1;

      steps.push({
        nodes: getSnapshot(),
        edges: [...rawEdges],
        activeNodeId: fa,
        diffMap: { ...diff },
        ansMap: { ...ans },
        curPath: [u, v],
        curLca: lca,
        stage: 'diff',
        decision: `处理 LCA 父节点：由于 fa=${fa} > 0，执行 diff[fa]-- 防止差分影响传递至上层链`,
        message: `标记后 diff[${fa}]=${diff[fa]}`,
        log: `markFather(fa=${fa})`,
        codeLine: lines.markFather,
        metrics: { '父节点差分': `diff[${fa}]=${diff[fa]}` },
        highlightNodes: [fa],
      });
    }
  }

  // 阶段 2: 自底向上子树前缀和
  function rollUp(u: number, p: number) {
    let sum = diff[u];
    for (const v of adj.get(u)!) {
      if (v === p) continue;
      rollUp(v, u);
      sum += ans[v];
    }
    ans[u] = sum;
  }
  rollUp(root, 0);

  // 终态
  const maxCover = Math.max(...Object.values(ans));
  steps.push({
    nodes: allNodeIds.map(id => ({
      id,
      depth: depth.get(id) ?? 0,
      parent: parent.get(id) ?? 0,
      val: ans[id],
    })),
    edges: [...rawEdges],
    activeNodeId: root,
    diffMap: { ...diff },
    ansMap: { ...ans },
    stage: 'done',
    decision: `✅ 树上差分与子树求和完毕！全部路径覆盖统计完成，最大覆盖点权值为 ${maxCover}`,
    message: `利用 LCA 点差分，将 M 次 O(N) 的暴力修改优化至 O(M log N + N) 极速完成`,
    log: `tree difference completed, max cover = ${maxCover}`,
    codeLine: lines.markDiff,
    metrics: { '最大点覆盖': maxCover, '复杂度': 'O(M log N + N)' },
    highlightNodes: [root],
    statusBadge: { text: `统计完毕: 最大覆盖 ${maxCover}`, type: 'success' },
  });

  return steps;
}
