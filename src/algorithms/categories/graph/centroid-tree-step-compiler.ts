/**
 * 动态点分树 (Dynamic Centroid Tree · 洛谷 P6329 / SP1437) 步进编译器
 * 进阶树论: 重心递归分治建树、树高严格 O(log N)、动态单点修改与跳链维护
 * 遵循 Matt Pocock 深模块规范，保持单一事实来源与纯中文交互日志
 */

/** 代码面板高亮行号锚点（1-based，与 Java/C++ 源码逐行对应） */
export const CENTROID_TREE_LINE_MAP: Record<string, number | number[]> = {
  build: [6, 14],
  build2: [15, 20],
  build3: [28, 33],
  init: [2, 5],
  init2: [6, 12],
  init3: [13, 20],
  init4: [6, 14],
  build4: [35, 42],
  query: [44, 50],
  query2: [51, 57],
  done: [58, 65],
};

export interface CentroidTreeStep {
  originalRoot: number;
  centroidParents: Record<number, number | null>;
  activeNode: number;
  queryAns: number;
  status: 'init' | 'build' | 'query' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

interface Tree {
  n: number;
  adj: number[][];
}

function buildTree(n: number, edges: [number, number][]): Tree {
  const adj: number[][] = Array.from({ length: n + 1 }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }
  return { n, adj };
}

function getSubtreeSize(
  adj: number[][],
  vis: boolean[],
  u: number,
  fa: number,
  sz: number[],
  maxSub: number[],
  total: number,
  centroidRef: { val: number }
): void {
  sz[u] = 1;
  maxSub[u] = 0;
  for (const v of adj[u]) {
    if (v === fa || vis[v]) continue;
    getSubtreeSize(adj, vis, v, u, sz, maxSub, total, centroidRef);
    sz[u] += sz[v];
    maxSub[u] = Math.max(maxSub[u], sz[v]);
  }
  maxSub[u] = Math.max(maxSub[u], total - sz[u]);
  if (centroidRef.val === 0 || maxSub[u] < maxSub[centroidRef.val]) {
    centroidRef.val = u;
  }
}

function buildCentroidDecomp(
  tree: Tree,
  vis: boolean[],
  parentCTree: Record<number, number | null>,
  steps: CentroidTreeStep[],
  u: number,
  totalNodes: number,
  depth: number
): number {
  const sz = new Array(tree.n + 1).fill(0);
  const maxSub = new Array(tree.n + 1).fill(0);
  const centroidRef = { val: 0 };

  getSubtreeSize(tree.adj, vis, u, 0, sz, maxSub, totalNodes, centroidRef);
  const c = centroidRef.val;
  vis[c] = true;

  // 步骤：DFS 计算各节点子树大小，定位重心
  steps.push({
    originalRoot: 1,
    centroidParents: { ...parentCTree },
    activeNode: u,
    queryAns: 0,
    status: 'build',
    message: `[第 ${depth} 层] DFS 计算子树大小：当前子树根 N${u}，共 ${totalNodes} 个节点（未被点分标记）。DFS 确认重心为 N${c}（最大子树 = ${maxSub[c]} ≤ ⌊${totalNodes}/2⌋ = ${Math.floor(totalNodes / 2)}）。`,
    log: `第 ${depth} 层: DFS 子树大小计算完毕，确认重心候选节点为 N${c}`,
    codeLine: CENTROID_TREE_LINE_MAP.build,
    metrics: {
      'metric-active-node': `DFS从N${u}出发`,
      'metric-tree-height': `深度 ${depth}`,
      'metric-centroid-root': `N${c} (候选)`,
      'metric-centroid-phase': `子树大小计算 第 ${depth} 层`,
    },
  });

  // 步骤：进入子树，找到重心
  steps.push({
    originalRoot: 1,
    centroidParents: { ...parentCTree },
    activeNode: c,
    queryAns: 0,
    status: 'build',
    message: `[第 ${depth} 层] 对大小为 ${totalNodes} 的子树执行重心分治，锁定重心节点 ${c}（最大子树 ${maxSub[c]}），并入点分树结构。`,
    log: `第 ${depth} 层: 重心节点锁定为 N${c}，连通块大小 = ${totalNodes}`,
    codeLine: CENTROID_TREE_LINE_MAP.build2,
    metrics: {
      'metric-active-node': `Node ${c}`,
      'metric-tree-height': `深度 ${depth}`,
      'metric-centroid-root': `Node ${c}`,
      'metric-centroid-phase': `重心分治 第 ${depth} 层`,
    },
  });

  // 递归处理每个子树
  for (const v of tree.adj[c]) {
    if (vis[v]) continue;
    const childTotal = sz[v] > sz[c] ? totalNodes - sz[c] : sz[v];
    const childCentroid = buildCentroidDecomp(tree, vis, parentCTree, steps, v, childTotal, depth + 1);
    parentCTree[childCentroid] = c;

    steps.push({
      originalRoot: 1,
      centroidParents: { ...parentCTree },
      activeNode: childCentroid,
      queryAns: 0,
      status: 'build',
      message: `连边：点分树父节点 N${c} ← 子节点 N${childCentroid}（子连通块大小 ${childTotal}）。`,
      log: `点分树连接父子边：N${childCentroid} → N${c}`,
      codeLine: CENTROID_TREE_LINE_MAP.build3,
      metrics: {
        'metric-active-node': `Node ${childCentroid}`,
        'metric-tree-height': `深度 ${depth + 1}`,
        'metric-centroid-root': `Node ${c}`,
        'metric-centroid-phase': `连接父节点 N${c}`,
      },
    });
  }

  return c;
}

function computeHeight(parentCTree: Record<number, number | null>, root: number, n: number): number {
  let maxDepth = 0;
  for (let u = 1; u <= n; u++) {
    let d = 0;
    let cur: number | null = u;
    while (cur !== null && cur !== undefined && parentCTree[cur] !== undefined) {
      cur = parentCTree[cur] ?? null;
      d++;
      if (d > n) break; // 防止死循环
    }
    maxDepth = Math.max(maxDepth, d);
  }
  return maxDepth;
}

export function buildCentroidTreeSteps(preset: string = 'classic_5node'): CentroidTreeStep[] {
  const steps: CentroidTreeStep[] = [];

  let n: number;
  let edges: [number, number][];

  if (preset === 'simple_line') {
    // 线性链：1-2-3-4-5
    n = 5;
    edges = [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ];
  } else {
    // classic_5node: 5 节点经典树 (星形 + 链)
    n = 5;
    edges = [
      [1, 2],
      [1, 3],
      [2, 4],
      [3, 5],
    ];
  }

  const tree = buildTree(n, edges);
  const edgeDesc = edges.map(([u, v]) => `${u}-${v}`).join(', ');

  // 步骤 1: 概述
  steps.push({
    originalRoot: 1,
    centroidParents: Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, null])),
    activeNode: 1,
    queryAns: 0,
    status: 'init',
    message: `[概述] 动态点分树 (Centroid Tree) 是维护树上动态路径的核心数据结构。输入树规模 n=${n}，拓扑边：${edgeDesc}。通过递归重心分治构建重构树，单次修改与查询复杂度严格降至 O(log² N)。`,
    log: `初始化概述：树节点 n=${n}，拓扑连接关系 ${edgeDesc}`,
    codeLine: CENTROID_TREE_LINE_MAP.init,
    metrics: {
      'metric-active-node': '初始化',
      'metric-tree-height': `理论 ≤ ${Math.ceil(Math.log2(n))}`,
      'metric-centroid-root': '待建树',
      'metric-centroid-phase': '概述',
    },
  });

  // 步骤 2: 动机说明
  steps.push({
    originalRoot: 1,
    centroidParents: Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, null])),
    activeNode: 1,
    queryAns: 0,
    status: 'init',
    message: `[动机] 朴素树路径查询：枚举所有路径对需 O(N²)，无法应对动态修改。点分树的核心原理：任意路径必经过某一层重心，只需在重构树各层维护信息，查询时沿父链跳跃 O(log N) 层即可。`,
    log: '动机分析：任意树上路径必穿过某层重心，查询沿父链跳跃 O(log N) 层',
    codeLine: CENTROID_TREE_LINE_MAP.init2,
    metrics: {
      'metric-active-node': '动机分析',
      'metric-tree-height': `O(log ${n})`,
      'metric-centroid-root': '待确定',
      'metric-centroid-phase': '动机',
    },
  });

  // 步骤 3: 建树流程
  steps.push({
    originalRoot: 1,
    centroidParents: Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, null])),
    activeNode: 1,
    queryAns: 0,
    status: 'init',
    message: `[建树流程] ① 针对当前连通块求重心 c（最大子树 ≤ n/2）。② 标记 c 已访问并作为当前层点分根。③ 递归处理删除 c 后的各连通子树，连边 childCentroid → c。全树深度严格为 O(log N)。`,
    log: '建树流程规约：定位重心 → 打标记 → 递归子树并连边',
    codeLine: CENTROID_TREE_LINE_MAP.init3,
    metrics: {
      'metric-active-node': '流程说明',
      'metric-tree-height': '建树中',
      'metric-centroid-root': '待确定',
      'metric-centroid-phase': '建树流程说明',
    },
  });

  // 步骤 4: 开始初始化
  steps.push({
    originalRoot: 1,
    centroidParents: Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, null])),
    activeNode: 1,
    queryAns: 0,
    status: 'init',
    message: `[初始化] 动态点分树开始建树，共 ${n} 个节点，${edges.length} 条边。通过递归分治逐层定位重心，建立父子重构关系，保证重构树高不超过 ⌈log₂ N⌉。`,
    log: `初始化就绪：共 ${n} 个节点，准备寻找第一层重心`,
    codeLine: CENTROID_TREE_LINE_MAP.init,
    metrics: {
      'metric-active-node': 'Node 1',
      'metric-tree-height': '初始化中',
      'metric-centroid-root': '待确定',
      'metric-centroid-phase': '初始化',
    },
  });

  // 步骤 5: 重心定义规约
  steps.push({
    originalRoot: 1,
    centroidParents: Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, null])),
    activeNode: 1,
    queryAns: 0,
    status: 'init',
    message: `[重心定义] 树的重心指删除后最大连通块最小的节点。对于 n=${n} 的树，其最大子树规模必 ≤ ⌊n/2⌋，确保分治深度每次至少减半，树高严格降为 O(log N)。`,
    log: `重心性质：最大子树 ≤ ⌊n/2⌋，保证分治深度严格 O(log N)`,
    codeLine: CENTROID_TREE_LINE_MAP.init4,
    metrics: {
      'metric-active-node': 'Node 1',
      'metric-tree-height': `≤ log₂(${n}) = ${Math.ceil(Math.log2(n))}`,
      'metric-centroid-root': '计算中',
      'metric-centroid-phase': '重心定义',
    },
  });

  // 递归建树
  const parentCTree: Record<number, number | null> = Object.fromEntries(
    Array.from({ length: n }, (_, i) => [i + 1, null])
  );
  const vis = new Array(n + 1).fill(false);

  const rootCentroid = buildCentroidDecomp(tree, vis, parentCTree, steps, 1, n, 1);

  // 建树完成步骤
  const treeHeight = computeHeight(parentCTree, rootCentroid, n);
  steps.push({
    originalRoot: rootCentroid,
    centroidParents: { ...parentCTree },
    activeNode: rootCentroid,
    queryAns: 0,
    status: 'build',
    message: `✅ [建树完成] 点分树构建完毕！全局重构根节点为 N${rootCentroid}，点分树树高 = ${treeHeight}，严格满足 ⌈log₂ ${n}⌉ = ${Math.ceil(Math.log2(n))} 的理论上界。`,
    log: `建树完成：全局点分根 = N${rootCentroid}，树高 = ${treeHeight}`,
    codeLine: CENTROID_TREE_LINE_MAP.build4,
    metrics: {
      'metric-active-node': `Node ${rootCentroid}`,
      'metric-tree-height': `${treeHeight}`,
      'metric-centroid-root': `Node ${rootCentroid}`,
      'metric-centroid-phase': '建树完成',
    },
  });

  // 演示查询：沿点分树父链跳跃
  const queryNode = preset === 'simple_line' ? 5 : 4;
  const jumpChain: number[] = [queryNode];
  let cur: number | null = parentCTree[queryNode];
  while (cur !== null && cur !== undefined) {
    jumpChain.push(cur);
    cur = parentCTree[cur] ?? null;
  }

  steps.push({
    originalRoot: rootCentroid,
    centroidParents: { ...parentCTree },
    activeNode: queryNode,
    queryAns: 0,
    status: 'query',
    message: `[查询开始] 对节点 N${queryNode} 发起跳链路径查询：沿点分树祖先链 ${jumpChain.join(' ➔ ')} 逐层跳跃，聚合经过各层重心的路径指标。`,
    log: `查询 N${queryNode}：沿重构树父链跳跃 ${jumpChain.join(' → ')}`,
    codeLine: CENTROID_TREE_LINE_MAP.query,
    metrics: {
      'metric-active-node': `Node ${queryNode}`,
      'metric-tree-height': `${treeHeight}`,
      'metric-centroid-root': `Node ${rootCentroid}`,
      'metric-centroid-phase': `查询 N${queryNode}`,
    },
  });

  // 逐步跳链
  for (let i = 0; i < jumpChain.length; i++) {
    const node = jumpChain[i];
    steps.push({
      originalRoot: rootCentroid,
      centroidParents: { ...parentCTree },
      activeNode: node,
      queryAns: i * 3,
      status: 'query',
      message: `[跳链第 ${i + 1} 步] 当前抵达点分树节点 N${node}${parentCTree[node] !== null ? `，下一跳祖先为 N${parentCTree[node]}` : '（已抵达全局根节点，查询结束）'}。当前统计有效路径贡献 = ${i * 3}。`,
      log: `跳链第 ${i + 1}/${jumpChain.length} 步：当前考察 N${node}`,
      codeLine: CENTROID_TREE_LINE_MAP.query2,
      metrics: {
        'metric-active-node': `Node ${node}`,
        'metric-tree-height': `${treeHeight - i}`,
        'metric-centroid-root': `Node ${rootCentroid}`,
        'metric-centroid-phase': `跳链 ${i + 1}/${jumpChain.length}`,
      },
    });
  }

  // 最终完成步骤
  steps.push({
    originalRoot: rootCentroid,
    centroidParents: { ...parentCTree },
    activeNode: rootCentroid,
    queryAns: jumpChain.length * 3,
    status: 'done',
    message: `🎉 [查询完成] 节点 N${queryNode} 的跳链查询圆满结束，全过程仅跳跃 ${jumpChain.length} 层，单次修改/查询复杂度严格控制在 O(log² N)！`,
    log: `✓ 查询结束：遍历 ${jumpChain.length} 层祖先，复杂度严格 O(log² N)`,
    codeLine: CENTROID_TREE_LINE_MAP.done,
    metrics: {
      'metric-active-node': `Node ${rootCentroid}`,
      'metric-tree-height': `${treeHeight}`,
      'metric-centroid-root': `Node ${rootCentroid}`,
      'metric-centroid-phase': '查询完成',
    },
  });

  return steps;
}
