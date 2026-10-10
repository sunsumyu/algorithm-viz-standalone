/**
 * 有向图强连通性检测 (Kosaraju 双 DFS) 步进编译器
 * 纯逻辑与状态步进推演，零 DOM 依赖与零视觉内联
 * 核心考点：Kosaraju 两次 DFS 遍历、反向图构造与全源强连通性判定
 */

import { StepBase } from '../../../core/step-visualizer';

/** 代码面板高亮行号锚点（1-based，与源码逐行对应） */
const lines: Record<string, number | number[]> = {
  init: [1, 2, 3, 4],
  forwarddfs: [16, 17, 18],
  done: 6,
  reversebuild: [7, 8, 9, 10, 11],
  reversedfs: [16, 17, 18],
  done2: 14,
};

export interface SCCStep extends StepBase {
  nodes: number[];
  edges: [number, number][];
  isReversed: boolean;
  stage: string;
  currentNode: number | null;
  visited: Set<number>;
  isStronglyConnected: boolean | null;
  action: 'init' | 'forward-dfs' | 'reverse-build' | 'reverse-dfs' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export const SCC_NODES = [0, 1, 2, 3];
export const SCC_ORIGINAL_EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
];

export const SCC_POSITIONS = [
  { x: 100, y: 70 },
  { x: 300, y: 70 },
  { x: 300, y: 190 },
  { x: 100, y: 190 },
];

export function buildSCCSteps(): SCCStep[] {
  const steps: SCCStep[] = [];
  const nodes = [...SCC_NODES];
  const originalEdges = [...SCC_ORIGINAL_EDGES];

  const adjList: number[][] = Array.from({ length: 4 }, () => []);
  for (const [u, v] of originalEdges) {
    adjList[u].push(v);
  }

  const revEdges: [number, number][] = originalEdges.map(([u, v]) => [v, u]);
  const revAdjList: number[][] = Array.from({ length: 4 }, () => []);
  for (const [u, v] of revEdges) {
    revAdjList[u].push(v);
  }

  steps.push({
    nodes,
    edges: originalEdges,
    isReversed: false,
    stage: '准备开始',
    currentNode: null,
    visited: new Set(),
    isStronglyConnected: null,
    action: 'init',
    statusText: `初始化：包含 ${nodes.length} 个节点和 ${originalEdges.length} 条有向边。Kosaraju 算法第一阶段：从节点 0 出发做正向 DFS 遍历。`,
    log: `初始化: ${nodes.length} 节点有向图`,
    codeLine: lines.init,
  });

  // 1. 正向 DFS
  const visitedForward = new Set<number>();
  const dfsForward = (u: number) => {
    visitedForward.add(u);
    steps.push({
      nodes,
      edges: originalEdges,
      isReversed: false,
      stage: '正向 DFS 遍历',
      currentNode: u,
      visited: new Set(visitedForward),
      isStronglyConnected: null,
      action: 'forward-dfs',
      statusText: `正向 DFS 访问节点 ${u}，已访问节点: [${Array.from(visitedForward).join(', ')}]。`,
      log: `正向访问: 节点 ${u}`,
      codeLine: lines.forwarddfs,
    });

    for (const v of adjList[u]) {
      if (!visitedForward.has(v)) {
        dfsForward(v);
      }
    }
  };

  dfsForward(0);

  const forwardAllReached = visitedForward.size === nodes.length;

  if (!forwardAllReached) {
    steps.push({
      nodes,
      edges: originalEdges,
      isReversed: false,
      stage: '正向遍历未全达',
      currentNode: null,
      visited: new Set(visitedForward),
      isStronglyConnected: false,
      action: 'done',
      statusText: `❌ 正向 DFS 从节点 0 出发未能访问所有节点（仅访问了 ${visitedForward.size}/${nodes.length}），该图不是强连通图。`,
      log: `判定失败: 正向未全达 -> 不是强连通`,
      codeLine: lines.done,
    });
    return steps;
  }

  // 2. 构建反向图
  steps.push({
    nodes,
    edges: revEdges,
    isReversed: true,
    stage: '构建反向图 (Reverse Graph)',
    currentNode: null,
    visited: new Set(),
    isStronglyConnected: null,
    action: 'reverse-build',
    statusText: `正向 DFS 全可达！现在反转所有边的方向 (u->v 变为 v->u)，第二阶段：从节点 0 出发做反向 DFS 遍历。`,
    log: `构建反向图: 反转所有边的方向`,
    codeLine: lines.reversebuild,
  });

  // 3. 反向 DFS
  const visitedReverse = new Set<number>();
  const dfsReverse = (u: number) => {
    visitedReverse.add(u);
    steps.push({
      nodes,
      edges: revEdges,
      isReversed: true,
      stage: '反向 DFS 遍历',
      currentNode: u,
      visited: new Set(visitedReverse),
      isStronglyConnected: null,
      action: 'reverse-dfs',
      statusText: `反向 DFS 访问节点 ${u}，已访问节点: [${Array.from(visitedReverse).join(', ')}]。`,
      log: `反向访问: 节点 ${u}`,
      codeLine: lines.reversedfs,
    });

    for (const v of revAdjList[u]) {
      if (!visitedReverse.has(v)) {
        dfsReverse(v);
      }
    }
  };

  dfsReverse(0);

  const reverseAllReached = visitedReverse.size === nodes.length;

  steps.push({
    nodes,
    edges: originalEdges,
    isReversed: false,
    stage: '判定完成',
    currentNode: null,
    visited: new Set(nodes),
    isStronglyConnected: reverseAllReached,
    action: 'done',
    statusText: reverseAllReached
      ? `🎉 检测完成！正向 DFS 与反向 DFS 均能完全遍历所有节点，该有向图是【强连通图】(返回 true)！`
      : `❌ 检测完成！反向 DFS 未能遍历所有节点，该有向图不是强连通图 (返回 false)。`,
    log: `✓ 判定完成: 强连通性 = ${reverseAllReached}`,
    codeLine: lines.done2,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withMetrics(steps: SCCStep[]): SCCStep[] {
  return steps.map((s) => ({
    ...s,
    metrics: {
      stage: s.stage,
      'cur-node': s.currentNode !== null ? String(s.currentNode) : '—',
      visited: `${s.visited.size} / ${s.nodes.length}`,
      'is-scc':
        s.isStronglyConnected === true
          ? '是 (True)'
          : s.isStronglyConnected === false
          ? '否 (False)'
          : '检测中...',
    },
  }));
}
