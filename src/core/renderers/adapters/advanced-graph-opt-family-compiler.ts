import {
  SEGMENT_TREE_GRAPH_LINES,
  CDQ_GRAPH_LINES,
} from '../../../algorithms/categories/advanced-topics/advanced-196-200/advanced-196-200-stage-codes';
import { Advanced196Step } from '../../../algorithms/categories/advanced-topics/advanced-196-200/advanced-196-200-shared';

// ==========================================
// Class 196: 线段树优化建图
// ==========================================
export interface SegmentTreeGraphStep extends Advanced196Step {
  inTreeNodes: { id: string; range: string; active: boolean }[];
  outTreeNodes: { id: string; range: string; active: boolean }[];
  leaves: { id: number; dist: number; active: boolean }[];
  activeEdge: { from: string; to: string; weight: number; desc: string } | null;
  edgeCountStats: { bruteForce: number; optimized: number };
}

export function buildSegmentTreeGraphSteps(): SegmentTreeGraphStep[] {
  const steps: SegmentTreeGraphStep[] = [];
  const lines = SEGMENT_TREE_GRAPH_LINES;

  const initialLeaves = [
    { id: 1, dist: 0, active: false },
    { id: 2, dist: 999999, active: false },
    { id: 3, dist: 999999, active: false },
    { id: 4, dist: 999999, active: false },
  ];

  const initialInTree = [
    { id: 'in_1_4', range: 'In[1..4]', active: false },
    { id: 'in_1_2', range: 'In[1..2]', active: false },
    { id: 'in_3_4', range: 'In[3..4]', active: false },
  ];

  const initialOutTree = [
    { id: 'out_1_4', range: 'Out[1..4]', active: false },
    { id: 'out_1_2', range: 'Out[1..2]', active: false },
    { id: 'out_3_4', range: 'Out[3..4]', active: false },
  ];

  // Step 0: 入口帧
  steps.push({
    inTreeNodes: initialInTree,
    outTreeNodes: initialOutTree,
    leaves: initialLeaves,
    activeEdge: null,
    edgeCountStats: { bruteForce: 0, optimized: 0 },
    decision: `主函数入口：初始化线段树优化建图结构 (N=4 个叶子实体节点)`,
    message: `准备构建出树 (Out-Tree) 和入树 (In-Tree)，以 log N 的边数替代暴力全连接`,
    log: `enter buildSegmentTreeGraph: n=4`,
    codeLine: lines.entry,
    metrics: { '原点数量': 4, '架构': '出入双线段树' },
  });

  // Step 1: 构建入树
  steps.push({
    inTreeNodes: initialInTree.map(n => ({ ...n, active: true })),
    outTreeNodes: initialOutTree,
    leaves: initialLeaves,
    activeEdge: { from: 'In[1..4]', to: 'In[1..2], In[3..4]', weight: 0, desc: '父节点向子节点连 0 权边' },
    edgeCountStats: { bruteForce: 0, optimized: 2 },
    decision: `构建入树 (In-Tree)：自顶向下连边，信息到达任意区间节点将自动无消耗流向其子树`,
    message: `入树用于处理“向区间连边”的操作 (Point/Range -> Range)`,
    log: `build in-tree completed: internal edges added with weight 0`,
    codeLine: lines.buildIn,
    statusBadge: { text: '入树就绪', type: 'info' },
    metrics: { '入树节点': 3, '内部边权': 0 },
  });

  // Step 2: 构建出树
  steps.push({
    inTreeNodes: initialInTree,
    outTreeNodes: initialOutTree.map(n => ({ ...n, active: true })),
    leaves: initialLeaves,
    activeEdge: { from: 'Out[1..2], Out[3..4]', to: 'Out[1..4]', weight: 0, desc: '子节点向父节点连 0 权边' },
    edgeCountStats: { bruteForce: 0, optimized: 4 },
    decision: `构建出树 (Out-Tree)：自底向上连边，区间任何一个点的出发信号都能汇总至对应的线段树区间节点`,
    message: `出树用于处理“从区间出发连边”的操作 (Range -> Point/Range)`,
    log: `build out-tree completed: internal edges added with weight 0`,
    codeLine: lines.buildOut,
    statusBadge: { text: '出树就绪', type: 'info' },
    metrics: { '出树节点': 3, '内部边权': 0 },
  });

  // Step 3: 叶子节点桥接
  steps.push({
    inTreeNodes: initialInTree,
    outTreeNodes: initialOutTree,
    leaves: initialLeaves.map(l => ({ ...l, active: true })),
    activeEdge: { from: 'In[Leaf_i]', to: 'Out[Leaf_i]', weight: 0, desc: '入树叶子连向实体原点，实体原点连向出树叶子' },
    edgeCountStats: { bruteForce: 0, optimized: 8 },
    decision: `桥接双树与实体原点：将入树叶子连接到实体节点，实体节点连接到出树叶子`,
    message: `所有实体原点现在拥有了双向通行能力：从出树升空、从入树降落`,
    log: `connected leaves with in/out trees: total base graph ready`,
    codeLine: lines.connectLeaves,
    statusBadge: { text: '骨架图联通', type: 'success' },
    metrics: { '双树桥接边': 4, '实体点': 4 },
  });

  // Step 4: 执行操作 2 (点 1 向区间 [3, 4] 连边，权值 5)
  steps.push({
    inTreeNodes: [
      { id: 'in_1_4', range: 'In[1..4]', active: false },
      { id: 'in_1_2', range: 'In[1..2]', active: false },
      { id: 'in_3_4', range: 'In[3..4]', active: true },
    ],
    outTreeNodes: initialOutTree,
    leaves: [
      { id: 1, dist: 0, active: true },
      { id: 2, dist: 999999, active: false },
      { id: 3, dist: 999999, active: false },
      { id: 4, dist: 999999, active: false },
    ],
    activeEdge: { from: 'Leaf_1', to: 'In[3..4]', weight: 5, desc: '点向区间连边：拆分为向线段树节点 In[3..4] 连边' },
    edgeCountStats: { bruteForce: 2, optimized: 9 },
    decision: `处理点到区间边：原点 1 连向区间 [3, 4]，权值 w=5`,
    message: `线段树区间定位直接匹配到节点 In[3..4]，仅添加 1 条边即可覆盖 {3, 4} 两个点！`,
    log: `query type 2: add edge from 1 to In[3..4], weight=5`,
    codeLine: lines.queryToRange,
    statusBadge: { text: '点向区间连边', type: 'warning' },
    metrics: { '节省边数': '50%', '目标区间': '[3, 4]' },
  });

  // Step 5: 执行操作 3 (区间 [1, 2] 向点 4 连边，权值 2)
  steps.push({
    inTreeNodes: initialInTree,
    outTreeNodes: [
      { id: 'out_1_4', range: 'Out[1..4]', active: false },
      { id: 'out_1_2', range: 'Out[1..2]', active: true },
      { id: 'out_3_4', range: 'Out[3..4]', active: false },
    ],
    leaves: [
      { id: 1, dist: 0, active: false },
      { id: 2, dist: 999999, active: false },
      { id: 3, dist: 999999, active: false },
      { id: 4, dist: 999999, active: true },
    ],
    activeEdge: { from: 'Out[1..2]', to: 'Leaf_4', weight: 2, desc: '区间向点连边：出树节点 Out[1..2] 连向点 4' },
    edgeCountStats: { bruteForce: 4, optimized: 10 },
    decision: `处理区间到点边：区间 [1, 2] 连向原点 4，权值 w=2`,
    message: `出树节点 Out[1..2] 发射 1 条边直达点 4，自动代表了从点 1 和点 2 同时向点 4 连边！`,
    log: `query type 3: add edge from Out[1..2] to 4, weight=2`,
    codeLine: lines.queryFromRange,
    statusBadge: { text: '区间向点连边', type: 'warning' },
    metrics: { '累计优化边': 10, '暴力所需边': 14 },
  });

  // Step 6: 运行 Dijkstra 单源最短路
  steps.push({
    inTreeNodes: initialInTree,
    outTreeNodes: initialOutTree,
    leaves: [
      { id: 1, dist: 0, active: true },
      { id: 2, dist: 999999, active: false },
      { id: 3, dist: 5, active: true },
      { id: 4, dist: 2, active: true },
    ],
    activeEdge: null,
    edgeCountStats: { bruteForce: 4, optimized: 10 },
    decision: `运行 Dijkstra 最短路算法：源点为 1，松弛全图各点距离`,
    message: `最终最短路：dist[1]=0, dist[4]=2 (经由 Out[1..2] 到 4), dist[3]=5 (经由 In[3..4] 到 3), dist[2]=∞`,
    log: `dijkstra completed: dist = [0, inf, 5, 2]`,
    codeLine: lines.dijkstra,
    statusBadge: { text: '求解成功', type: 'success' },
    metrics: { '最短距离-3': 5, '最短距离-4': 2 },
  });

  return steps;
}

// ==========================================
// Class 198: CDQ 分治优化建图
// ==========================================
export interface CDQGraphStep extends Advanced196Step {
  l: number;
  r: number;
  mid: number;
  leftElements: { id: number; a: number; b: number }[];
  rightElements: { id: number; a: number; b: number }[];
  prefixNodes: string[];
  activeConnections: { from: number; to: string }[];
  stats: { totalEdges: number; bruteForceEdges: number };
}

export function buildCDQGraphSteps(): CDQGraphStep[] {
  const steps: CDQGraphStep[] = [];
  const lines = CDQ_GRAPH_LINES;

  const allElements = [
    { id: 1, a: 1, b: 2 },
    { id: 2, a: 2, b: 5 },
    { id: 3, a: 3, b: 3 },
    { id: 4, a: 4, b: 6 },
  ];

  // Step 0: 入口帧
  steps.push({
    l: 1,
    r: 4,
    mid: 2,
    leftElements: [allElements[0], allElements[1]],
    rightElements: [allElements[2], allElements[3]],
    prefixNodes: [],
    activeConnections: [],
    stats: { totalEdges: 0, bruteForceEdges: 0 },
    decision: `主函数入口：开始对 4 个元素执行 CDQ 分治优化建图 (偏序连边条件: a_i <= a_j 且 b_i <= b_j)`,
    message: `第 1 维 a 已全局有序，分治天然保证了左半区任意点的 a 严格不超过右半区`,
    log: `enter cdqBuildGraph: l=1, r=4`,
    codeLine: lines.entry,
    metrics: { '区间长度': 4, '偏序维度': 2 },
  });

  // Step 1: 划分中点
  steps.push({
    l: 1,
    r: 4,
    mid: 2,
    leftElements: [allElements[0], allElements[1]],
    rightElements: [allElements[2], allElements[3]],
    prefixNodes: [],
    activeConnections: [],
    stats: { totalEdges: 0, bruteForceEdges: 0 },
    decision: `划分中点 mid=2：左半区 [1..2]，右半区 [3..4]`,
    message: `递归处理左区间与右区间的内部边后，开始着重建立跨区有向边 (从左向右)`,
    log: `split interval [1..4] at mid=2`,
    codeLine: lines.splitMid,
    statusBadge: { text: '区间切分', type: 'info' },
    metrics: { '左区规模': 2, '右区规模': 2 },
  });

  // Step 2: 递归子区间
  steps.push({
    l: 1,
    r: 4,
    mid: 2,
    leftElements: [allElements[0], allElements[1]],
    rightElements: [allElements[2], allElements[3]],
    prefixNodes: [],
    activeConnections: [{ from: 1, to: 'P2' }],
    stats: { totalEdges: 1, bruteForceEdges: 1 },
    decision: `左右子区间递归建边完成：左半区内部 P1 连向 P2 (a: 1<=2, b: 2<=5)`,
    message: `准备进行跨区间合并处理：对两半区按第 2 维 b 坐标排序`,
    log: `recursive steps completed for [1..2] and [3..4]`,
    codeLine: lines.recurseRight,
    statusBadge: { text: '子区间完成', type: 'info' },
    metrics: { '内部已建边': 1, '当前处理': '跨区合并' },
  });

  // Step 3: 右半区构建前缀虚点链
  const prefixNodes = ['Pref_1(P3, b=3)', 'Pref_2(P4, b=6)'];
  steps.push({
    l: 1,
    r: 4,
    mid: 2,
    leftElements: [allElements[0], allElements[1]],
    rightElements: [allElements[2], allElements[3]],
    prefixNodes,
    activeConnections: [{ from: 1, to: 'P2' }],
    stats: { totalEdges: 3, bruteForceEdges: 1 },
    decision: `右半区按 b 值排序并建立前缀虚点链：Pref_1 连向 Pref_2，且 Pref 虚点连向对应的右区实体点`,
    message: `前缀链的作用是将点对区间的 $O(K)$ 连边优化为向链首/链尾的 $O(1)$ 连边`,
    log: `prefix nodes built for right half: 2 aux nodes connected`,
    codeLine: lines.connectCross,
    statusBadge: { text: '前缀虚点链就绪', type: 'warning' },
    metrics: { '虚点数': 2, '链式传递边': 2 },
  });

  // Step 4: 跨区间双指针连边
  steps.push({
    l: 1,
    r: 4,
    mid: 2,
    leftElements: [allElements[0], allElements[1]],
    rightElements: [allElements[2], allElements[3]],
    prefixNodes,
    activeConnections: [
      { from: 1, to: 'Pref_1' },
      { from: 2, to: 'Pref_2' },
    ],
    stats: { totalEdges: 5, bruteForceEdges: 5 },
    decision: `双指针跨区间连边：P1(b=2) 连向 Pref_1，P2(b=5) 连向 Pref_2`,
    message: `P1 通过 Pref_1 自动连通了 P3 和 P4！仅用 2 条跨区边代替了暴力 3 条边，随着数据规模增大优势指数级倍增`,
    log: `cdq cross edges built: P1 -> Pref_1, P2 -> Pref_2`,
    codeLine: lines.connectCross,
    statusBadge: { text: '跨区优化建边完成', type: 'success' },
    metrics: { '优化建边总数': 5, '暴力若建边': 6 },
  });

  return steps;
}
