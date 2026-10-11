/**
 * 图论理论基础 (Graph Theory) — 步进编译器
 * 纯状态机推演：邻接矩阵、邻接表、动态加边/删边与 1-based 代码行同步
 */

export interface GTStep {
  nodes: number[];
  edges: [number, number][];
  adjMatrix: number[][];
  adjList: number[][];
  view: 'graph' | 'matrix' | 'list';
  highlightEdge: [number, number] | null;
  highlightAction: 'add' | 'remove' | null;
  vCount: number;
  eCount: number;
  graphType: string;
  message: string;
  log: string;
  codeLine: number | number[];
  metrics: Record<string, string | number>;
}

export const GRAPH_THEORY_NODE_POSITIONS: Record<number, { x: number; y: number }> = {
  0: { x: 300, y: 50 },
  1: { x: 470, y: 130 },
  2: { x: 420, y: 250 },
  3: { x: 180, y: 250 },
  4: { x: 130, y: 130 },
};

export const GRAPH_THEORY_CODE_LINES = {
  init: 2,
  matrixView: 4,
  listView: 6,
  addEdge: [9, 10, 11],
  removeEdge: [14, 15, 16],
  summary: 19,
};

function buildAdjMatrix(nodes: number[], edges: [number, number][]): number[][] {
  const n = nodes.length;
  const mat = Array.from({ length: n }, () => Array(n).fill(0));
  for (const [u, v] of edges) {
    mat[u][v] = 1;
    mat[v][u] = 1;
  }
  return mat;
}

function buildAdjList(nodes: number[], edges: [number, number][]): number[][] {
  const list = nodes.map(() => [] as number[]);
  for (const [u, v] of edges) {
    list[u].push(v);
    list[v].push(u);
  }
  return list;
}

export function buildGraphTheorySteps(): GTStep[] {
  const steps: GTStep[] = [];
  const nodes = [0, 1, 2, 3, 4];
  const edges: [number, number][] = [
    [0, 1],
    [0, 4],
    [1, 2],
    [1, 3],
    [2, 3],
    [3, 4],
  ];

  const adjMatrix = buildAdjMatrix(nodes, edges);
  const adjList = buildAdjList(nodes, edges);

  steps.push({
    nodes: [...nodes],
    edges: [...edges],
    adjMatrix: adjMatrix.map((r) => [...r]),
    adjList: adjList.map((r) => [...r]),
    view: 'graph',
    highlightEdge: null,
    highlightAction: null,
    vCount: nodes.length,
    eCount: edges.length,
    graphType: '无向无权图',
    message: '图拓扑初始化：包含 5 个顶点、6 条边的基础无向无权图。',
    log: '初始化图: V=5, E=6',
    codeLine: GRAPH_THEORY_CODE_LINES.init,
    metrics: {
      'metric-gt-type': '基础无向图',
      'metric-gt-v': '5 顶点',
      'metric-gt-e': '6 条边',
    },
  });

  steps.push({
    nodes: [...nodes],
    edges: [...edges],
    adjMatrix: adjMatrix.map((r) => [...r]),
    adjList: adjList.map((r) => [...r]),
    view: 'matrix',
    highlightEdge: null,
    highlightAction: null,
    vCount: nodes.length,
    eCount: edges.length,
    graphType: '邻接矩阵视图',
    message: '邻接矩阵表示：matrix[i][j]=1 表示两点相邻。空间复杂度 O(V²)，边查询 O(1)，适合稠密图。',
    log: '切换至邻接矩阵视图 (5x5 矩阵)',
    codeLine: GRAPH_THEORY_CODE_LINES.matrixView,
    metrics: {
      'metric-gt-type': '邻接矩阵 5×5',
      'metric-gt-v': '5 顶点',
      'metric-gt-e': '6 条边 (对称)',
    },
  });

  steps.push({
    nodes: [...nodes],
    edges: [...edges],
    adjMatrix: adjMatrix.map((r) => [...r]),
    adjList: adjList.map((r) => [...r]),
    view: 'list',
    highlightEdge: null,
    highlightAction: null,
    vCount: nodes.length,
    eCount: edges.length,
    graphType: '邻接表视图',
    message: '邻接表表示：每个顶点维护出边邻居数组。空间复杂度 O(V+E)，适合稀疏图。',
    log: '切换至邻接表视图 (空间 O(V+E))',
    codeLine: GRAPH_THEORY_CODE_LINES.listView,
    metrics: {
      'metric-gt-type': '邻接表 (5 链表)',
      'metric-gt-v': '5 顶点',
      'metric-gt-e': '6 条边',
    },
  });

  // 动态加边 (2, 4)
  const edges2: [number, number][] = [...edges, [2, 4]];
  const adjMatrix2 = buildAdjMatrix(nodes, edges2);
  const adjList2 = buildAdjList(nodes, edges2);
  steps.push({
    nodes: [...nodes],
    edges: edges2.map((e) => [...e] as [number, number]),
    adjMatrix: adjMatrix2.map((r) => [...r]),
    adjList: adjList2.map((r) => [...r]),
    view: 'graph',
    highlightEdge: [2, 4],
    highlightAction: 'add',
    vCount: nodes.length,
    eCount: edges2.length,
    graphType: '动态加边 (2, 4)',
    message: '动态添加边 (2, 4)：邻接矩阵置 matrix[2][4]=matrix[4][2]=1；邻接表双向加入邻居。',
    log: '添加边 (2, 4) -> 边数增至 E=7',
    codeLine: GRAPH_THEORY_CODE_LINES.addEdge,
    metrics: {
      'metric-gt-type': '加边 +(2, 4)',
      'metric-gt-v': '5 顶点',
      'metric-gt-e': '7 条边 (+1)',
    },
  });

  // 动态删边 (1, 3)
  const edges3 = edges2.filter(([u, v]) => !(u === 1 && v === 3));
  const adjMatrix3 = buildAdjMatrix(nodes, edges3);
  const adjList3 = buildAdjList(nodes, edges3);
  steps.push({
    nodes: [...nodes],
    edges: edges3.map((e) => [...e] as [number, number]),
    adjMatrix: adjMatrix3.map((r) => [...r]),
    adjList: adjList3.map((r) => [...r]),
    view: 'graph',
    highlightEdge: [1, 3],
    highlightAction: 'remove',
    vCount: nodes.length,
    eCount: edges3.length,
    graphType: '动态删边 (1, 3)',
    message: '动态删除边 (1, 3)：邻接矩阵置 matrix[1][3]=matrix[3][1]=0；邻接表中剔除对应邻居。',
    log: '删除边 (1, 3) -> 边数变为 E=6',
    codeLine: GRAPH_THEORY_CODE_LINES.removeEdge,
    metrics: {
      'metric-gt-type': '删边 -(1, 3)',
      'metric-gt-v': '5 顶点',
      'metric-gt-e': '6 条边 (-1)',
    },
  });

  steps.push({
    nodes: [...nodes],
    edges: edges3.map((e) => [...e] as [number, number]),
    adjMatrix: adjMatrix3.map((r) => [...r]),
    adjList: adjList3.map((r) => [...r]),
    view: 'graph',
    highlightEdge: null,
    highlightAction: null,
    vCount: nodes.length,
    eCount: edges3.length,
    graphType: '图论基础总结',
    message: '图表示法总结：矩阵边查询 O(1)，空间 O(V²)；邻接表空间 O(V+E)，遍历度数 O(deg)。根据图稠密度合理选型。',
    log: '图论表示法演示总结完成',
    codeLine: GRAPH_THEORY_CODE_LINES.summary,
    metrics: {
      'metric-gt-type': '全景总结就绪',
      'metric-gt-v': '5 顶点',
      'metric-gt-e': '6 条边',
    },
  });

  return steps;
}
