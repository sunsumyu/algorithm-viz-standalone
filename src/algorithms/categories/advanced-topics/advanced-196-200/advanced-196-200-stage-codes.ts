/**
 * 左神算法通关课 196 ~ 200 线段树优化建图、主席树优化建图、CDQ分治优化建图、基环树与仙人掌图 多语言代码与 1-based 行号映射
 */

export interface CodeMapping {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

// ==========================================
// 1. Class 196: 线段树优化建图 (CF 786B Legacy)
// ==========================================
export const SEGMENT_TREE_GRAPH_CODES: Record<string, string[]> = {
  java: [
    'public void buildSegmentTreeGraph(int n, List<Query> queries) {', // 1
    '    buildInTree(1, 1, n);  // 构建入树 (父向子连 0 权边，负责区间流入)', // 2
    '    buildOutTree(1, 1, n); // 构建出树 (子向父连 0 权边，负责区间流出)', // 3
    '    connectLeaves(n);      // 将入树叶子与出树叶子与实体点连通', // 4
    '    for (Query q : queries) {', // 5
    '        if (q.type == 1) { addEdge(q.u, q.v, q.w); } // 点到点', // 6
    '        else if (q.type == 2) { addPointToRange(q.u, q.l, q.r, q.w); } // 点到区间', // 7
    '        else { addRangeToPoint(q.l, q.r, q.v, q.w); } // 区间到点', // 8
    '    }', // 9
    '    dijkstra(source); // 运行单源最短路', // 10
    '}', // 11
  ],
  cpp: [
    'void buildSegmentTreeGraph(int n, const vector<Query>& queries) {', // 1
    '    buildInTree(1, 1, n);', // 2
    '    buildOutTree(1, 1, n);', // 3
    '    connectLeaves(n);', // 4
    '    for (const auto& q : queries) {', // 5
    '        if (q.type == 1) addEdge(q.u, q.v, q.w);', // 6
    '        else if (q.type == 2) addPointToRange(q.u, q.l, q.r, q.w);', // 7
    '        else addRangeToPoint(q.l, q.r, q.v, q.w);', // 8
    '    }', // 9
    '    dijkstra(source);', // 10
    '}', // 11
  ],
  python: [
    'def build_segment_tree_graph(n: int, queries: list):', // 1
    '    build_in_tree(1, 1, n)  # 入树', // 2
    '    build_out_tree(1, 1, n) # 出树', // 3
    '    connect_leaves(n)', // 4
    '    for q in queries:', // 5
    '        if q.type == 1: add_edge(q.u, q.v, q.w)', // 6
    '        elif q.type == 2: add_point_to_range(q.u, q.l, q.r, q.w)', // 7
    '        else: add_range_to_point(q.l, q.r, q.v, q.w)', // 8
    '    dijkstra(source)', // 9
  ],
  javascript: [
    'function buildSegmentTreeGraph(n, queries) {', // 1
    '    buildInTree(1, 1, n);', // 2
    '    buildOutTree(1, 1, n);', // 3
    '    connectLeaves(n);', // 4
    '    for (const q of queries) {', // 5
    '        if (q.type === 1) addEdge(q.u, q.v, q.w);', // 6
    '        else if (q.type === 2) addPointToRange(q.u, q.l, q.r, q.w);', // 7
    '        else addRangeToPoint(q.l, q.r, q.v, q.w);', // 8
    '    }', // 9
    '    dijkstra(source);', // 10
    '}', // 11
  ],
};

export const SEGMENT_TREE_GRAPH_LINES: Record<string, CodeMapping> = {
  entry:         { java: 1, cpp: 1, python: 1, javascript: 1 },
  buildIn:       { java: 2, cpp: 2, python: 2, javascript: 2 },
  buildOut:      { java: 3, cpp: 3, python: 3, javascript: 3 },
  connectLeaves: { java: 4, cpp: 4, python: 4, javascript: 4 },
  queryPoint:    { java: 6, cpp: 6, python: 6, javascript: 6 },
  queryToRange:  { java: 7, cpp: 7, python: 7, javascript: 7 },
  queryFromRange:{ java: 8, cpp: 8, python: 8, javascript: 8 },
  dijkstra:      { java: 10, cpp: 10, python: 9, javascript: 10 },
};

// ==========================================
// 2. Class 197: 主席树/可持久化优化建图
// ==========================================
export const PERSISTENT_GRAPH_CODES: Record<string, string[]> = {
  java: [
    'public void buildPersistentGraph(int n, Point[] points) {', // 1
    '    int[] root = new int[n + 1];', // 2
    '    for (int i = 1; i <= n; i++) { // 按时间/序号建立历史前缀树', // 3
    '        root[i] = insert(root[i - 1], 1, maxVal, points[i].val, points[i].id); // 动态开点继承', // 4
    '        if (points[i].hasConstraint) {', // 5
    '            // 当前点连向历史版本中处于 [l, r] 权值区间内的点', // 6
    '            linkToHistoricalRange(points[i].id, root[i - 1], 1, maxVal, points[i].l, points[i].r);', // 7
    '        }', // 8
    '    }', // 9
    '    topologicalSort(); // 在新建立的 DAG 上运行拓扑排序或最长路', // 10
    '}', // 11
  ],
  cpp: [
    'void buildPersistentGraph(int n, const vector<Point>& points) {', // 1
    '    vector<int> root(n + 1, 0);', // 2
    '    for (int i = 1; i <= n; i++) {', // 3
    '        root[i] = insert(root[i - 1], 1, maxVal, points[i].val, points[i].id);', // 4
    '        if (points[i].hasConstraint) {', // 5
    '            linkToHistoricalRange(points[i].id, root[i - 1], 1, maxVal, points[i].l, points[i].r);', // 6
    '        }', // 7
    '    }', // 8
    '    topologicalSort();', // 9
    '}', // 10
  ],
  python: [
    'def build_persistent_graph(n: int, points: list):', // 1
    '    root = [0] * (n + 1)', // 2
    '    for i in range(1, n + 1):', // 3
    '        root[i] = insert(root[i - 1], 1, max_val, points[i].val, points[i].id)', // 4
    '        if points[i].has_constraint:', // 5
    '            link_to_historical_range(points[i].id, root[i - 1], 1, max_val, points[i].l, points[i].r)', // 6
    '    topological_sort()', // 7
  ],
  javascript: [
    'function buildPersistentGraph(n, points) {', // 1
    '    const root = new Array(n + 1).fill(0);', // 2
    '    for (let i = 1; i <= n; i++) {', // 3
    '        root[i] = insert(root[i - 1], 1, maxVal, points[i].val, points[i].id);', // 4
    '        if (points[i].hasConstraint) {', // 5
    '            linkToHistoricalRange(points[i].id, root[i - 1], 1, maxVal, points[i].l, points[i].r);', // 6
    '        }', // 7
    '    }', // 8
    '    topologicalSort();', // 9
    '}', // 10
  ],
};

export const PERSISTENT_GRAPH_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  initRoots:   { java: 2, cpp: 2, python: 2, javascript: 2 },
  insertPoint: { java: 4, cpp: 4, python: 4, javascript: 4 },
  linkHistory: { java: 7, cpp: 6, python: 6, javascript: 6 },
  topoSort:    { java: 10, cpp: 9, python: 7, javascript: 9 },
};

// ==========================================
// 3. Class 198: CDQ 分治优化建图
// ==========================================
export const CDQ_GRAPH_CODES: Record<string, string[]> = {
  java: [
    'public void cdqBuildGraph(int l, int r, Element[] arr) {', // 1
    '    if (l >= r) return;', // 2
    '    int mid = (l + r) / 2;', // 3
    '    cdqBuildGraph(l, mid, arr); // 递归分治左区间', // 4
    '    cdqBuildGraph(mid + 1, r, arr); // 递归分治右区间', // 5
    '    // 按第二维排序并构建前缀辅助点', // 6
    '    buildPrefixNodesAndConnect(l, mid, mid + 1, r, arr);', // 7
    '}', // 8
  ],
  cpp: [
    'void cdqBuildGraph(int l, int r, vector<Element>& arr) {', // 1
    '    if (l >= r) return;', // 2
    '    int mid = (l + r) / 2;', // 3
    '    cdqBuildGraph(l, mid, arr);', // 4
    '    cdqBuildGraph(mid + 1, r, arr);', // 5
    '    buildPrefixNodesAndConnect(l, mid, mid + 1, r, arr);', // 6
    '}', // 7
  ],
  python: [
    'def cdq_build_graph(l: int, r: int, arr: list):', // 1
    '    if l >= r: return', // 2
    '    mid = (l + r) // 2', // 3
    '    cdq_build_graph(l, mid, arr) # 左侧分治', // 4
    '    cdq_build_graph(mid + 1, r, arr) # 右侧分治', // 5
    '    build_prefix_nodes_and_connect(l, mid, mid + 1, r, arr)', // 6
  ],
  javascript: [
    'function cdqBuildGraph(l, r, arr) {', // 1
    '    if (l >= r) return;', // 2
    '    const mid = Math.floor((l + r) / 2);', // 3
    '    cdqBuildGraph(l, mid, arr);', // 4
    '    cdqBuildGraph(mid + 1, r, arr);', // 5
    '    buildPrefixNodesAndConnect(l, mid, mid + 1, r, arr);', // 6
    '}', // 7
  ],
};

export const CDQ_GRAPH_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  baseCase:    { java: 2, cpp: 2, python: 2, javascript: 2 },
  splitMid:    { java: 3, cpp: 3, python: 3, javascript: 3 },
  recurseLeft: { java: 4, cpp: 4, python: 4, javascript: 4 },
  recurseRight:{ java: 5, cpp: 5, python: 5, javascript: 5 },
  connectCross:{ java: 7, cpp: 6, python: 6, javascript: 6 },
};

// ==========================================
// 4. Class 199: 基环树与基环树 DP
// ==========================================
export const PSEUDOTREE_DP_CODES: Record<string, string[]> = {
  java: [
    'public long solvePseudotreeDP(int n, List<Integer>[] adj, int[] val) {', // 1
    '    findCycleByTopsort(n, adj); // 拓扑剥皮分离树枝与基环', // 2
    '    for (int root : cycleNodes) {', // 3
    '        treeDP(root, 0); // 求解每棵外挂子树内部最大权独立集', // 4
    '    }', // 5
    '    // 环上破环成链：断开边 (u, v)', // 6
    '    long ans1 = solveChain(u, v, false); // 强制不选 u', // 7
    '    long ans2 = solveChain(v, u, false); // 强制不选 v', // 8
    '    return Math.max(ans1, ans2); // 全局最优解', // 9
    '}', // 10
  ],
  cpp: [
    'long long solvePseudotreeDP(int n, const vector<vector<int>>& adj, const vector<int>& val) {', // 1
    '    findCycleByTopsort(n, adj);', // 2
    '    for (int root : cycleNodes) {', // 3
    '        treeDP(root, 0);', // 4
    '    }', // 5
    '    long long ans1 = solveChain(u, v, false);', // 6
    '    long long ans2 = solveChain(v, u, false);', // 7
    '    return max(ans1, ans2);', // 8
    '}', // 9
  ],
  python: [
    'def solve_pseudotree_dp(n: int, adj: list, val: list) -> int:', // 1
    '    find_cycle_by_topsort(n, adj) # 拓扑剥皮', // 2
    '    for root in cycle_nodes:', // 3
    '        tree_dp(root, 0) # 子树树形 DP', // 4
    '    ans1 = solve_chain(u, v, False) # 断边强制不选 u', // 5
    '    ans2 = solve_chain(v, u, False) # 断边强制不选 v', // 6
    '    return max(ans1, ans2)', // 7
  ],
  javascript: [
    'function solvePseudotreeDP(n, adj, val) {', // 1
    '    findCycleByTopsort(n, adj);', // 2
    '    for (const root of cycleNodes) {', // 3
    '        treeDP(root, 0);', // 4
    '    }', // 5
    '    const ans1 = solveChain(u, v, false);', // 6
    '    const ans2 = solveChain(v, u, false);', // 7
    '    return Math.max(ans1, ans2);', // 8
    '}', // 9
  ],
};

export const PSEUDOTREE_DP_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  findCycle:   { java: 2, cpp: 2, python: 2, javascript: 2 },
  treeDP:      { java: 4, cpp: 4, python: 4, javascript: 4 },
  solvePlanA:  { java: 7, cpp: 6, python: 5, javascript: 6 },
  solvePlanB:  { java: 8, cpp: 7, python: 6, javascript: 7 },
  returnMax:   { java: 9, cpp: 8, python: 7, javascript: 8 },
};

// ==========================================
// 5. Class 200: 仙人掌图与仙人掌 DP
// ==========================================
export const CACTUS_GRAPH_DP_CODES: Record<string, string[]> = {
  java: [
    'public void dfsCactus(int u, int p) {', // 1
    '    dfn[u] = low[u] = ++timer;', // 2
    '    for (int v : adj[u]) {', // 3
    '        if (v == p) continue;', // 4
    '        if (dfn[v] == 0) { // 树边向下 DFS', // 5
    '            dfsCactus(v, u);', // 6
    '            low[u] = Math.min(low[u], low[v]);', // 7
    '            if (low[v] > dfn[u]) { maxDiameter = Math.max(maxDiameter, f[u] + f[v] + 1); f[u] = Math.max(f[u], f[v] + 1); }', // 8
    '        } else { low[u] = Math.min(low[u], dfn[v]); }', // 9
    '        if (low[v] > dfn[u]) continue; // 割边不构成环', // 10
    '    }', // 11
    '    for (int v : adj[u]) {', // 12
    '        if (fa[v] != u && dfn[u] < dfn[v]) { // 发现返祖边构成环，单调队列计算环上直径', // 13
    '            solveCycleMonotonicQueue(u, v);', // 14
    '        }', // 15
    '    }', // 16
    '}', // 17
  ],
  cpp: [
    'void dfsCactus(int u, int p) {', // 1
    '    dfn[u] = low[u] = ++timer;', // 2
    '    for (int v : adj[u]) {', // 3
    '        if (v == p) continue;', // 4
    '        if (!dfn[v]) {', // 5
    '            dfsCactus(v, u);', // 6
    '            low[u] = min(low[u], low[v]);', // 7
    '            if (low[v] > dfn[u]) { maxDiameter = max(maxDiameter, f[u] + f[v] + 1); f[u] = max(f[u], f[v] + 1); }', // 8
    '        } else low[u] = min(low[u], dfn[v]);', // 9
    '    }', // 10
    '    for (int v : adj[u]) {', // 11
    '        if (fa[v] != u && dfn[u] < dfn[v]) {', // 12
    '            solveCycleMonotonicQueue(u, v);', // 13
    '        }', // 14
    '    }', // 15
    '}', // 16
  ],
  python: [
    'def dfs_cactus(u: int, p: int):', // 1
    '    nonlocal timer, max_diameter', // 2
    '    timer += 1; dfn[u] = low[u] = timer', // 3
    '    for v in adj[u]:', // 4
    '        if v == p: continue', // 5
    '        if dfn[v] == 0: # 树边', // 6
    '            dfs_cactus(v, u)', // 7
    '            low[u] = min(low[u], low[v])', // 8
    '            if low[v] > dfn[u]: update_tree_edge(u, v)', // 9
    '        else: low[u] = min(low[u], dfn[v])', // 10
    '    for v in adj[u]:', // 11
    '        if fa[v] != u and dfn[u] < dfn[v]: # 环闭合', // 12
    '            solve_cycle_monotonic_queue(u, v)', // 13
  ],
  javascript: [
    'function dfsCactus(u, p) {', // 1
    '    dfn[u] = low[u] = ++timer;', // 2
    '    for (const v of adj[u]) {', // 3
    '        if (v === p) continue;', // 4
    '        if (dfn[v] === 0) {', // 5
    '            dfsCactus(v, u);', // 6
    '            low[u] = Math.min(low[u], low[v]);', // 7
    '            if (low[v] > dfn[u]) updateTreeEdge(u, v);', // 8
    '        } else { low[u] = Math.min(low[u], dfn[v]); }', // 9
    '    }', // 10
    '    for (const v of adj[u]) {', // 11
    '        if (fa[v] !== u && dfn[u] < dfn[v]) {', // 12
    '            solveCycleMonotonicQueue(u, v);', // 13
    '        }', // 14
    '    }', // 15
    '}', // 16
  ],
};

export const CACTUS_GRAPH_DP_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  initDfn:     { java: 2, cpp: 2, python: 3, javascript: 2 },
  visitTree:   { java: 6, cpp: 6, python: 7, javascript: 6 },
  updateTree:  { java: 8, cpp: 8, python: 9, javascript: 8 },
  updateBack:  { java: 9, cpp: 9, python: 10, javascript: 9 },
  solveCycle:  { java: 14, cpp: 13, python: 13, javascript: 13 },
};
