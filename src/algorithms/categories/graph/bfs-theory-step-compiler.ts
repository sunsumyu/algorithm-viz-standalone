/**
 * 广度优先搜索理论基础 (BFS Theory) — 步进编译器
 * 纯状态机推演：队列先进先出、分层波纹扩张、标记判重与 1-based 代码行同步
 */

export interface BFSStep {
  nodes: number[];
  edges: [number, number][];
  adjList: number[][];
  visited: Set<number>;
  currentNode: number | null;
  currentEdge: [number, number] | null;
  queue: number[];
  traversalOrder: number[];
  levelMarkers: number[];
  level: number;
  action: 'init' | 'enqueue' | 'dequeue' | 'explore' | 'skip' | 'next-level' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics: Record<string, string | number>;
}

export const BFS_NODE_POSITIONS: Record<number, { x: number; y: number }> = {
  0: { x: 300, y: 45 },
  1: { x: 170, y: 135 },
  2: { x: 430, y: 135 },
  3: { x: 100, y: 235 },
  4: { x: 240, y: 235 },
  5: { x: 430, y: 235 },
};

export const BFS_THEORY_CODE_LINES = {
  init: 3,
  enqueueStart: 5,
  dequeue: 10,
  explore: 12,
  enqueue: [13, 14],
  skip: 12,
  nextLevel: 18,
  done: 20,
};

export function buildBFSSteps(): BFSStep[] {
  const steps: BFSStep[] = [];
  const nodes = [0, 1, 2, 3, 4, 5];
  const edges: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
  ];
  const adjList: number[][] = [
    [1, 2],     // 0 -> 1, 2
    [0, 3, 4],  // 1 -> 0, 3, 4
    [0, 5],     // 2 -> 0, 5
    [1],        // 3 -> 1
    [1],        // 4 -> 1
    [2],        // 5 -> 2
  ];

  const visited = new Set<number>();
  const queue: number[] = [];
  const traversalOrder: number[] = [];
  const levelMarkers: number[] = [];

  steps.push({
    nodes: [...nodes],
    edges: [...edges],
    adjList: adjList.map((r) => [...r]),
    visited: new Set(visited),
    currentNode: null,
    currentEdge: null,
    queue: [...queue],
    traversalOrder: [...traversalOrder],
    levelMarkers: [...levelMarkers],
    level: 0,
    action: 'init',
    message: '初始化图拓扑：6 个顶点、5 条边。准备从根源起点 0 开始 BFS 层序扩展。',
    log: '初始化图拓扑，起点 = 0',
    codeLine: BFS_THEORY_CODE_LINES.init,
    metrics: {
      'metric-bfs-action': '图拓扑初始化',
      'metric-bfs-level': '第 0 层',
      'metric-bfs-queue': '0 个待办',
    },
  });

  // 起点入队
  visited.add(0);
  queue.push(0);
  levelMarkers.push(0);
  steps.push({
    nodes: [...nodes],
    edges: [...edges],
    adjList: adjList.map((r) => [...r]),
    visited: new Set(visited),
    currentNode: 0,
    currentEdge: null,
    queue: [...queue],
    traversalOrder: [...traversalOrder],
    levelMarkers: [...levelMarkers],
    level: 0,
    action: 'enqueue',
    message: '将源点 0 标记为已访问并入队（第 0 层）。当前队列: [0]',
    log: '源点 0 入队 (第 0 层)',
    codeLine: BFS_THEORY_CODE_LINES.enqueueStart,
    metrics: {
      'metric-bfs-action': '起点 0 入队',
      'metric-bfs-level': '第 0 层',
      'metric-bfs-queue': `${queue.length} 个待办`,
    },
  });

  let currentLevel = 0;
  let levelSize = 1;

  while (queue.length > 0) {
    const u = queue.shift()!;
    traversalOrder.push(u);

    steps.push({
      nodes: [...nodes],
      edges: [...edges],
      adjList: adjList.map((r) => [...r]),
      visited: new Set(visited),
      currentNode: u,
      currentEdge: null,
      queue: [...queue],
      traversalOrder: [...traversalOrder],
      levelMarkers: [...levelMarkers],
      level: currentLevel,
      action: 'dequeue',
      message: `出队顶点 ${u}（第 ${currentLevel} 层），成为当前扩展中心，准备扫描所有邻接边。`,
      log: `出队顶点 ${u} (第 ${currentLevel} 层)`,
      codeLine: BFS_THEORY_CODE_LINES.dequeue,
      metrics: {
        'metric-bfs-action': `出队 Node ${u}`,
        'metric-bfs-level': `第 ${currentLevel} 层`,
        'metric-bfs-queue': `${queue.length} 个待办`,
      },
    });

    levelSize--;

    for (const v of adjList[u]) {
      if (!visited.has(v)) {
        visited.add(v);
        queue.push(v);
        steps.push({
          nodes: [...nodes],
          edges: [...edges],
          adjList: adjList.map((r) => [...r]),
          visited: new Set(visited),
          currentNode: u,
          currentEdge: [u, v],
          queue: [...queue],
          traversalOrder: [...traversalOrder],
          levelMarkers: [...levelMarkers],
          level: currentLevel,
          action: 'enqueue',
          message: `发现未访问邻居 ${v}，标记 visited[${v}] = true 并推入队列尾部。当前队列: [${queue.join(', ')}]`,
          log: `发现邻居 ${v}，染色入队`,
          codeLine: BFS_THEORY_CODE_LINES.enqueue,
          metrics: {
            'metric-bfs-action': `入队 Node ${v}`,
            'metric-bfs-level': `第 ${currentLevel} 层`,
            'metric-bfs-queue': `${queue.length} 个待办`,
          },
        });
      } else {
        steps.push({
          nodes: [...nodes],
          edges: [...edges],
          adjList: adjList.map((r) => [...r]),
          visited: new Set(visited),
          currentNode: u,
          currentEdge: [u, v],
          queue: [...queue],
          traversalOrder: [...traversalOrder],
          levelMarkers: [...levelMarkers],
          level: currentLevel,
          action: 'skip',
          message: `邻居 ${v} 已在 visited 集合中，跳过避免重复入队。`,
          log: `跳过已访问邻居 ${v}`,
          codeLine: BFS_THEORY_CODE_LINES.skip,
          metrics: {
            'metric-bfs-action': `跳过已访 ${v}`,
            'metric-bfs-level': `第 ${currentLevel} 层`,
            'metric-bfs-queue': `${queue.length} 个待办`,
          },
        });
      }
    }

    if (levelSize === 0 && queue.length > 0) {
      currentLevel++;
      levelSize = queue.length;
      levelMarkers.push(traversalOrder.length);
      steps.push({
        nodes: [...nodes],
        edges: [...edges],
        adjList: adjList.map((r) => [...r]),
        visited: new Set(visited),
        currentNode: queue[0],
        currentEdge: null,
        queue: [...queue],
        traversalOrder: [...traversalOrder],
        levelMarkers: [...levelMarkers],
        level: currentLevel,
        action: 'next-level',
        message: `第 ${currentLevel - 1} 层处理完毕，推进至第 ${currentLevel} 层。队列中包含 ${queue.length} 个待扩展节点。`,
        log: `推进至第 ${currentLevel} 层 (待处理 ${queue.length} 个)`,
        codeLine: BFS_THEORY_CODE_LINES.nextLevel,
        metrics: {
          'metric-bfs-action': `推进到 L${currentLevel}`,
          'metric-bfs-level': `第 ${currentLevel} 层`,
          'metric-bfs-queue': `${queue.length} 个待办`,
        },
      });
    }
  }

  steps.push({
    nodes: [...nodes],
    edges: [...edges],
    adjList: adjList.map((r) => [...r]),
    visited: new Set(visited),
    currentNode: null,
    currentEdge: null,
    queue: [],
    traversalOrder: [...traversalOrder],
    levelMarkers: [...levelMarkers],
    level: currentLevel,
    action: 'done',
    message: `BFS 层序全图遍历完成！访问序列: [${traversalOrder.join(', ')}]，覆盖全部 ${visited.size} 个顶点。无权图中已获得全局最短路径。`,
    log: `BFS 遍历圆满完成，序列: [${traversalOrder.join(', ')}]`,
    codeLine: BFS_THEORY_CODE_LINES.done,
    metrics: {
      'metric-bfs-action': '全图遍历完成',
      'metric-bfs-level': `共 ${currentLevel + 1} 层`,
      'metric-bfs-queue': '0 个待办',
    },
  });

  return steps;
}
