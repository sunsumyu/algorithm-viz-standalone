/**
 * Class 123: 树的直径 (Tree Diameter - 两遍 BFS/DFS) 步骤编译器
 * SP1437 / LeetCode 1245
 * 深模块核心编译器 (Deep Module)
 */

import { TREE_DIAMETER_CODES, TREE_DIAMETER_LINES } from '../../../algorithms/categories/tree/tree-117-123/tree-117-123-stage-codes';
import { Tree117Step, TreeNodeData } from '../../../algorithms/categories/tree/tree-117-123/tree-117-123-shared';

export interface TreeDiameterStep extends Tree117Step {
  nodes: TreeNodeData[];
  edges: [number, number][];
  activeNodeId: number;
  farthestX?: number;
  farthestY?: number;
  diameter?: number;
  diameterPath?: number[];
  distMap: Record<number, number>;
  bfsRound: 1 | 2;
}

export { TREE_DIAMETER_CODES, TREE_DIAMETER_LINES };

export function buildTreeDiameterSteps(
  rawEdges: [number, number][],
  startRoot: number = 1
): TreeDiameterStep[] {
  const steps: TreeDiameterStep[] = [];
  const lines = TREE_DIAMETER_LINES;

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

  const root = allNodeIds.includes(startRoot) ? startRoot : allNodeIds[0];

  // 计算节点层级用于静态拓扑展示
  const depth = new Map<number, number>();
  const parent = new Map<number, number>();
  function initDepth(u: number, p: number, d: number) {
    depth.set(u, d);
    parent.set(u, p);
    for (const v of adj.get(u)!) {
      if (v !== p) initDepth(v, u, d + 1);
    }
  }
  initDepth(root, 0, 0);

  const getSnapshot = (distMap: Record<number, number>): TreeNodeData[] => {
    return allNodeIds.map(id => ({
      id,
      depth: depth.get(id) ?? 0,
      parent: parent.get(id) ?? 0,
      val: distMap[id],
    }));
  };

  // Step 0: 入口
  steps.push({
    nodes: getSnapshot({}),
    edges: [...rawEdges],
    activeNodeId: root,
    distMap: {},
    bfsRound: 1,
    decision: `主函数入口：开始在包含 ${n} 个节点的树中求解树的直径（最长简单路径）`,
    message: `准备执行两遍 BFS：第一遍从任选点 #${root} 寻找最远点 x，第二遍从 x 寻找最远点 y`,
    log: `enter getDiameter(root=${root})`,
    codeLine: lines.entry,
    metrics: { '总节点数': n, '当前阶段': '初始就绪' },
  });

  // BFS 函数
  function runBfs(
    start: number,
    round: 1 | 2
  ): { farNode: number; maxDist: number; prevMap: Map<number, number>; dists: Record<number, number> } {
    const queue: number[] = [start];
    const dist = new Map<number, number>();
    const prev = new Map<number, number>();
    dist.set(start, 0);
    prev.set(start, 0);

    let farNode = start;
    let maxDist = 0;

    const curDistMap: Record<number, number> = { [start]: 0 };

    steps.push({
      nodes: getSnapshot(curDistMap),
      edges: [...rawEdges],
      activeNodeId: start,
      distMap: { ...curDistMap },
      bfsRound: round,
      decision: `第 ${round} 遍 BFS 开始：从节点 #${start} 出发，探索全树最远端点`,
      message: `初始化节点 #${start} 距离为 0 入队`,
      log: `start bfs round ${round} from ${start}`,
      codeLine: round === 1 ? lines.firstBfs : lines.secondBfs,
      metrics: { '起点': `#${start}`, '当前轮次': `第 ${round} 遍 BFS` },
      highlightNodes: [start],
    });

    while (queue.length > 0) {
      const u = queue.shift()!;
      const d = dist.get(u)!;

      if (d > maxDist) {
        maxDist = d;
        farNode = u;
      }

      for (const v of adj.get(u)!) {
        if (!dist.has(v)) {
          dist.set(v, d + 1);
          prev.set(v, u);
          curDistMap[v] = d + 1;
          queue.push(v);

          steps.push({
            nodes: getSnapshot(curDistMap),
            edges: [...rawEdges],
            activeNodeId: v,
            distMap: { ...curDistMap },
            bfsRound: round,
            decision: `广搜扩展节点 #${v}：从 #${u} 沿边到达，距离起点 #${start} 为 ${d + 1}`,
            message: `更新 dist[${v}] = ${d + 1}，当前发现的最大距离 = ${Math.max(maxDist, d + 1)}`,
            log: `bfs visit #${v}, dist=${d + 1}`,
            codeLine: round === 1 ? lines.firstBfs : lines.secondBfs,
            metrics: { '当前节点': `#${v}`, '距离起点': d + 1, '暂定最远点': `#${farNode}` },
            highlightNodes: [u, v],
          });
        }
      }
    }

    return { farNode, maxDist, prevMap: prev, dists: curDistMap };
  }

  // 第一遍 BFS
  const res1 = runBfs(root, 1);
  const x = res1.farNode;

  steps.push({
    nodes: getSnapshot(res1.dists),
    edges: [...rawEdges],
    activeNodeId: x,
    farthestX: x,
    distMap: res1.dists,
    bfsRound: 1,
    decision: `🎯 第一遍 BFS 结束：从 #${root} 出发的最远节点为 x = #${x}（距离 ${res1.maxDist}）`,
    message: `定理证明：树中任意节点出发的最远点，必定是树直径的一个端点！故 #${x} 必为直径端点之一`,
    log: `first bfs finished: x=${x}`,
    codeLine: lines.firstBfs,
    metrics: { '第一端点 x': `#${x}`, '最大距离': res1.maxDist },
    highlightNodes: [x],
    statusBadge: { text: `定位直径端点 x: #${x}`, type: 'warning' },
  });

  // 第二遍 BFS
  const res2 = runBfs(x, 2);
  const y = res2.farNode;
  const diameter = res2.maxDist;

  // 重构直径路径
  const path: number[] = [];
  let curr: number | undefined = y;
  while (curr !== 0 && curr !== undefined) {
    path.push(curr);
    curr = res2.prevMap.get(curr);
  }
  path.reverse();

  // 终态
  steps.push({
    nodes: getSnapshot(res2.dists),
    edges: [...rawEdges],
    activeNodeId: y,
    farthestX: x,
    farthestY: y,
    diameter,
    diameterPath: path,
    distMap: res2.dists,
    bfsRound: 2,
    decision: `🎉 第二遍 BFS 结束！从 #${x} 出发的最远节点为 y = #${y}，树的直径为 ${diameter}`,
    message: `直径路径：${path.map(n => `#${n}`).join(' -> ')}，两遍 BFS 完美以 O(N) 时间完成求解！`,
    log: `second bfs finished: y=${y}, diameter=${diameter}`,
    codeLine: lines.returnAns,
    metrics: { '端点 x': `#${x}`, '端点 y': `#${y}`, '直径长度': diameter, '复杂度': 'O(N)' },
    highlightNodes: path,
    statusBadge: { text: `树的直径 = ${diameter}`, type: 'success' },
  });

  return steps;
}
