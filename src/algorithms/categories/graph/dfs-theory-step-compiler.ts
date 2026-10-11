/**
 * 深度优先搜索理论基础 (DFS Theory) — 步进编译器
 * 纯状态机推演：图遍历状态、递归调用栈、回溯路径与 1-based 代码行同步
 */

export interface DFSStep {
  nodes: number[];
  edges: [number, number][];
  adjList: number[][];
  visited: Set<number>;
  currentNode: number | null;
  currentEdge: [number, number] | null;
  stack: number[];
  traversalOrder: number[];
  depth: number;
  action: 'init' | 'visit' | 'explore' | 'skip' | 'backtrack' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export const DFS_NODE_POSITIONS: Record<number, { x: number; y: number }> = {
  0: { x: 300, y: 45 },
  1: { x: 170, y: 135 },
  2: { x: 430, y: 135 },
  3: { x: 100, y: 235 },
  4: { x: 240, y: 235 },
  5: { x: 430, y: 235 },
};

export const DFS_THEORY_CODE_LINES = {
  init: 3,
  visit: [9, 10],
  explore: [12, 13],
  skip: 12,
  backtrack: 16,
  done: 6,
};

export function buildDFSSteps(): DFSStep[] {
  const steps: DFSStep[] = [];
  const nodes = [0, 1, 2, 3, 4, 5];
  const edges: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
  ];
  const adjList: number[][] = [
    [1, 2],
    [0, 3, 4],
    [0, 5],
    [1],
    [1],
    [2],
  ];

  const visited = new Set<number>();
  const stack: number[] = [];
  const traversalOrder: number[] = [];

  steps.push({
    nodes: [...nodes],
    edges: [...edges],
    adjList: adjList.map((r) => [...r]),
    visited: new Set(visited),
    currentNode: null,
    currentEdge: null,
    stack: [...stack],
    traversalOrder: [...traversalOrder],
    depth: 0,
    action: 'init',
    message: '初始化图拓扑：6 个顶点、5 条双向边。准备从根源节点 0 启动 DFS 深度递归。',
    log: '初始化图拓扑，起点 = 0',
    codeLine: DFS_THEORY_CODE_LINES.init,
  });

  const dfs = (u: number, parent: number): void => {
    visited.add(u);
    stack.push(u);
    traversalOrder.push(u);

    steps.push({
      nodes: [...nodes],
      edges: [...edges],
      adjList: adjList.map((r) => [...r]),
      visited: new Set(visited),
      currentNode: u,
      currentEdge: null,
      stack: [...stack],
      traversalOrder: [...traversalOrder],
      depth: stack.length,
      action: 'visit',
      message: `访问顶点 ${u}：标记 visited[${u}] = true，压入递归栈，当前栈深度 ${stack.length}。`,
      log: `DFS(${u}): 标记并压栈 [${stack.join(' -> ')}]`,
      codeLine: DFS_THEORY_CODE_LINES.visit,
    });

    for (const v of adjList[u]) {
      if (v === parent) continue;
      if (!visited.has(v)) {
        steps.push({
          nodes: [...nodes],
          edges: [...edges],
          adjList: adjList.map((r) => [...r]),
          visited: new Set(visited),
          currentNode: u,
          currentEdge: [u, v],
          stack: [...stack],
          traversalOrder: [...traversalOrder],
          depth: stack.length,
          action: 'explore',
          message: `发现未探索邻居 ${v}，沿着边 (${u} -> ${v}) 递归深入 DFS(${v})。`,
          log: `DFS(${u}) -> DFS(${v}): 沿边推进`,
          codeLine: DFS_THEORY_CODE_LINES.explore,
        });
        dfs(v, u);
      } else {
        steps.push({
          nodes: [...nodes],
          edges: [...edges],
          adjList: adjList.map((r) => [...r]),
          visited: new Set(visited),
          currentNode: u,
          currentEdge: [u, v],
          stack: [...stack],
          traversalOrder: [...traversalOrder],
          depth: stack.length,
          action: 'skip',
          message: `邻居 ${v} 已在 visited 集合中，跳过避免重复搜索。`,
          log: `DFS(${u}): 跳过已访问邻居 ${v}`,
          codeLine: DFS_THEORY_CODE_LINES.skip,
        });
      }
    }

    stack.pop();
    steps.push({
      nodes: [...nodes],
      edges: [...edges],
      adjList: adjList.map((r) => [...r]),
      visited: new Set(visited),
      currentNode: stack.length > 0 ? stack[stack.length - 1] : null,
      currentEdge: null,
      stack: [...stack],
      traversalOrder: [...traversalOrder],
      depth: stack.length,
      action: 'backtrack',
      message: `顶点 ${u} 所有邻接边探索完毕，弹栈回溯到 ${stack.length > 0 ? `上层顶点 ${stack[stack.length - 1]}` : '起点（栈空）'}。`,
      log: `DFS(${u}) 结束: 弹栈回溯`,
      codeLine: DFS_THEORY_CODE_LINES.backtrack,
    });
  };

  dfs(0, -1);

  steps.push({
    nodes: [...nodes],
    edges: [...edges],
    adjList: adjList.map((r) => [...r]),
    visited: new Set(visited),
    currentNode: null,
    currentEdge: null,
    stack: [],
    traversalOrder: [...traversalOrder],
    depth: 0,
    action: 'done',
    message: `DFS 全图遍历完成！访问序列: [${traversalOrder.join(', ')}]，所有 ${visited.size} 个顶点均被成功覆盖。`,
    log: `DFS 遍历完成，访问序列: [${traversalOrder.join(', ')}]`,
    codeLine: DFS_THEORY_CODE_LINES.done,
  });

  return steps;
}
