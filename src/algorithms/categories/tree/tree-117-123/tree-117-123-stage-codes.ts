/**
 * 左神算法通关课 117 ~ 123 倍增与树上高阶问题多语言源码与行号映射字典
 */

export interface CodeMapping {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

// ==========================================
// 1. Class 117: ST 表 (Sparse Table) RMQ
// ==========================================
export const SPARSE_TABLE_CODES: Record<string, string[]> = {
  java: [
    'public int queryRMQ(int l, int r) {', // 1
    '    // 计算 k = log2(r - l + 1)', // 2
    '    int k = log2[r - l + 1];', // 3
    '    // 两个重叠区间求最值：[l, l + 2^k - 1] 与 [r - 2^k + 1, r]', // 4
    '    return Math.max(st[l][k], st[r - (1 << k) + 1][k]);', // 5
    '}', // 6
  ],
  cpp: [
    'int queryRMQ(int l, int r) {', // 1
    '    int k = log2_table[r - l + 1];', // 2
    '    return max(st[l][k], st[r - (1 << k) + 1][k]);', // 3
    '}', // 4
  ],
  python: [
    'def query_rmq(l: int, r: int) -> int:', // 1
    '    k = int(math.log2(r - l + 1))', // 2
    '    return max(st[l][k], st[r - (1 << k) + 1][k])', // 3
  ],
  javascript: [
    'function queryRMQ(l, r) {', // 1
    '    const k = Math.floor(Math.log2(r - l + 1));', // 2
    '    return Math.max(st[l][k], st[r - (1 << k) + 1][k]);', // 3
    '}', // 4
  ],
};

export const SPARSE_TABLE_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  calcK:     { java: 3, cpp: 2, python: 2, javascript: 2 },
  queryAns:  { java: 5, cpp: 3, python: 3, javascript: 3 },
};

// ==========================================
// 2. Class 118: 树上倍增 LCA (Lowest Common Ancestor)
// ==========================================
export const TREE_LCA_CODES: Record<string, string[]> = {
  java: [
    'public int lca(int u, int v) {', // 1
    '    if (depth[u] < depth[v]) { int t = u; u = v; v = t; }', // 2
    '    // 1. 先将 u 提升至与 v 相同的深度', // 3
    '    for (int k = maxK; k >= 0; k--) {', // 4
    '        if (depth[u] - (1 << k) >= depth[v]) u = up[u][k];', // 5
    '    }', // 6
    '    if (u == v) return u; // v 就是祖先', // 7
    '    // 2. 同时倍增向上跳跃逼近 LCA 的下一层', // 8
    '    for (int k = maxK; k >= 0; k--) {', // 9
    '        if (up[u][k] != up[v][k]) { u = up[u][k]; v = up[v][k]; }', // 10
    '    }', // 11
    '    return up[u][0]; // 最终的直接父节点即为 LCA', // 12
    '}', // 13
  ],
  cpp: [
    'int lca(int u, int v) {', // 1
    '    if (depth[u] < depth[v]) swap(u, v);', // 2
    '    for (int k = maxK; k >= 0; k--) {', // 3
    '        if (depth[u] - (1 << k) >= depth[v]) u = up[u][k];', // 4
    '    }', // 5
    '    if (u == v) return u;', // 6
    '    for (int k = maxK; k >= 0; k--) {', // 7
    '        if (up[u][k] != up[v][k]) { u = up[u][k]; v = up[v][k]; }', // 8
    '    }', // 9
    '    return up[u][0];', // 10
    '}', // 11
  ],
  python: [
    'def lca(u: int, v: int) -> int:', // 1
    '    if depth[u] < depth[v]: u, v = v, u', // 2
    '    for k in range(max_k, -1, -1):', // 3
    '        if depth[u] - (1 << k) >= depth[v]:', // 4
    '            u = up[u][k]', // 5
    '    if u == v: return u', // 6
    '    for k in range(max_k, -1, -1):', // 7
    '        if up[u][k] != up[v][k]:', // 8
    '            u, v = up[u][k], up[v][k]', // 9
    '    return up[u][0]', // 10
  ],
  javascript: [
    'function lca(u, v) {', // 1
    '    if (depth[u] < depth[v]) { const t = u; u = v; v = t; }', // 2
    '    for (let k = maxK; k >= 0; k--) {', // 3
    '        if (depth[u] - (1 << k) >= depth[v]) u = up[u][k];', // 4
    '    }', // 5
    '    if (u === v) return u;', // 6
    '    for (let k = maxK; k >= 0; k--) {', // 7
    '        if (up[u][k] !== up[v][k]) { u = up[u][k]; v = up[v][k]; }', // 8
    '    }', // 9
    '    return up[u][0];', // 10
    '}', // 11
  ],
};

export const TREE_LCA_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  alignDepth:{ java: 5, cpp: 4, python: 5, javascript: 4 },
  checkSame: { java: 7, cpp: 6, python: 6, javascript: 6 },
  jumpSimul: { java: 10, cpp: 8, python: 9, javascript: 8 },
  returnAns: { java: 12, cpp: 10, python: 10, javascript: 10 },
};

// ==========================================
// 3. Class 120: 树的重心 (Tree Centroid)
// ==========================================
export const TREE_CENTROID_CODES: Record<string, string[]> = {
  java: [
    'public void findCentroid(int u, int p) {', // 1
    '    size[u] = 1; int maxSub = 0;', // 2
    '    for (int v : adj.get(u)) {', // 3
    '        if (v == p) continue;', // 4
    '        findCentroid(v, u);', // 5
    '        size[u] += size[v];', // 6
    '        maxSub = Math.max(maxSub, size[v]); // 子树最大分支', // 7
    '    }', // 8
    '    maxSub = Math.max(maxSub, n - size[u]); // 上方连通块', // 9
    '    if (maxSub < bestMaxPart) { bestMaxPart = maxSub; centroid = u; }', // 10
    '}', // 11
  ],
  cpp: [
    'void findCentroid(int u, int p) {', // 1
    '    size[u] = 1; int maxSub = 0;', // 2
    '    for (int v : adj[u]) {', // 3
    '        if (v == p) continue;', // 4
    '        findCentroid(v, u);', // 5
    '        size[u] += size[v];', // 6
    '        maxSub = max(maxSub, size[v]);', // 7
    '    }', // 8
    '    maxSub = max(maxSub, n - size[u]);', // 9
    '    if (maxSub < bestMaxPart) { bestMaxPart = maxSub; centroid = u; }', // 10
    '}', // 11
  ],
  python: [
    'def find_centroid(u: int, p: int):', // 1
    '    size[u] = 1; max_sub = 0', // 2
    '    for v in adj[u]:', // 3
    '        if v == p: continue', // 4
    '        find_centroid(v, u)', // 5
    '        size[u] += size[v]', // 6
    '        max_sub = max(max_sub, size[v])', // 7
    '    max_sub = max(max_sub, n - size[u])', // 8
    '    if max_sub < best_max_part: best_max_part = max_sub; centroid = u', // 9
  ],
  javascript: [
    'function findCentroid(u, p) {', // 1
    '    size[u] = 1; let maxSub = 0;', // 2
    '    for (const v of adj[u]) {', // 3
    '        if (v === p) continue;', // 4
    '        findCentroid(v, u);', // 5
    '        size[u] += size[v];', // 6
    '        maxSub = Math.max(maxSub, size[v]);', // 7
    '    }', // 8
    '    maxSub = Math.max(maxSub, n - size[u]);', // 9
    '    if (maxSub < bestMaxPart) { bestMaxPart = maxSub; centroid = u; }', // 10
    '}', // 11
  ],
};

export const TREE_CENTROID_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  dfsChild:  { java: 5, cpp: 5, python: 5, javascript: 5 },
  calcSize:  { java: 6, cpp: 6, python: 6, javascript: 6 },
  calcUpPart:{ java: 9, cpp: 9, python: 8, javascript: 9 },
  updateAns: { java: 10, cpp: 10, python: 9, javascript: 10 },
};

// ==========================================
// 4. Class 121: 树链剖分 / 重链剖分 (HLD)
// ==========================================
export const HLD_CODES: Record<string, string[]> = {
  java: [
    'public void dfs1(int u, int p, int d) {', // 1
    '    depth[u] = d; parent[u] = p; size[u] = 1;', // 2
    '    for (int v : adj.get(u)) {', // 3
    '        if (v == p) continue;', // 4
    '        dfs1(v, u, d + 1); size[u] += size[v];', // 5
    '        if (heavyChild[u] == 0 || size[v] > size[heavyChild[u]]) heavyChild[u] = v;', // 6
    '    }', // 7
    '}', // 8
  ],
  cpp: [
    'void dfs1(int u, int p, int d) {', // 1
    '    depth[u] = d; parent[u] = p; size[u] = 1;', // 2
    '    for (int v : adj[u]) {', // 3
    '        if (v == p) continue;', // 4
    '        dfs1(v, u, d + 1); size[u] += size[v];', // 5
    '        if (!heavyChild[u] || size[v] > size[heavyChild[u]]) heavyChild[u] = v;', // 6
    '    }', // 7
    '}', // 8
  ],
  python: [
    'def dfs1(u: int, p: int, d: int):', // 1
    '    depth[u], parent[u], size[u] = d, p, 1', // 2
    '    for v in adj[u]:', // 3
    '        if v == p: continue', // 4
    '        dfs1(v, u, d + 1); size[u] += size[v]', // 5
    '        if not heavy_child[u] or size[v] > size[heavy_child[u]]:', // 6
    '            heavy_child[u] = v', // 7
  ],
  javascript: [
    'function dfs1(u, p, d) {', // 1
    '    depth[u] = d; parent[u] = p; size[u] = 1;', // 2
    '    for (const v of adj[u]) {', // 3
    '        if (v === p) continue;', // 4
    '        dfs1(v, u, d + 1); size[u] += size[v];', // 5
    '        if (!heavyChild[u] || size[v] > size[heavyChild[u]]) heavyChild[u] = v;', // 6
    '    }', // 7
    '}', // 8
  ],
};

export const HLD_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  initNode:  { java: 2, cpp: 2, python: 2, javascript: 2 },
  dfsChild:  { java: 5, cpp: 5, python: 5, javascript: 5 },
  markHeavy: { java: 6, cpp: 6, python: 6, javascript: 6 },
};

// ==========================================
// 5. Class 122: 树上差分 (Tree Difference)
// ==========================================
export const TREE_DIFFERENCE_CODES: Record<string, string[]> = {
  java: [
    'public void addPath(int u, int v) {', // 1
    '    int anc = lca(u, v); int fa = parent[anc];', // 2
    '    diff[u]++; diff[v]++; diff[anc]--;', // 3
    '    if (fa > 0) diff[fa]--; // 点差分规则', // 4
    '}', // 5
  ],
  cpp: [
    'void addPath(int u, int v) {', // 1
    '    int anc = lca(u, v); int fa = parent[anc];', // 2
    '    diff[u]++; diff[v]++; diff[anc]--;', // 3
    '    if (fa > 0) diff[fa]--;', // 4
    '}', // 5
  ],
  python: [
    'def add_path(u: int, v: int):', // 1
    '    anc = lca(u, v); fa = parent[anc]', // 2
    '    diff[u] += 1; diff[v] += 1; diff[anc] -= 1', // 3
    '    if fa > 0: diff[fa] -= 1', // 4
  ],
  javascript: [
    'function addPath(u, v) {', // 1
    '    const anc = lca(u, v); const fa = parent[anc];', // 2
    '    diff[u]++; diff[v]++; diff[anc]--;', // 3
    '    if (fa > 0) diff[fa]--;', // 4
    '}', // 5
  ],
};

export const TREE_DIFFERENCE_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  calcLca:   { java: 2, cpp: 2, python: 2, javascript: 2 },
  markDiff:  { java: 3, cpp: 3, python: 3, javascript: 3 },
  markFather:{ java: 4, cpp: 4, python: 4, javascript: 4 },
};

// ==========================================
// 6. Class 123: 树的直径 (Tree Diameter)
// ==========================================
export const TREE_DIAMETER_CODES: Record<string, string[]> = {
  java: [
    'public int getDiameter(int root) {', // 1
    '    int[] first = bfsFar(root); // 任意点出发找到最远点 x', // 2
    '    int[] second = bfsFar(first[0]); // 从 x 出发找到最远点 y', // 3
    '    return second[1]; // x 到 y 的距离即为树的直径', // 4
    '}', // 5
  ],
  cpp: [
    'int getDiameter(int root) {', // 1
    '    auto first = bfsFar(root);', // 2
    '    auto second = bfsFar(first.first);', // 3
    '    return second.second;', // 4
    '}', // 5
  ],
  python: [
    'def get_diameter(root: int) -> int:', // 1
    '    x, _ = bfs_far(root)', // 2
    '    y, max_dist = bfs_far(x)', // 3
    '    return max_dist', // 4
  ],
  javascript: [
    'function getDiameter(root) {', // 1
    '    const first = bfsFar(root);', // 2
    '    const second = bfsFar(first.node);', // 3
    '    return second.dist;', // 4
    '}', // 5
  ],
};

export const TREE_DIAMETER_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  firstBfs:  { java: 2, cpp: 2, python: 2, javascript: 2 },
  secondBfs: { java: 3, cpp: 3, python: 3, javascript: 3 },
  returnAns: { java: 4, cpp: 4, python: 4, javascript: 4 },
};
