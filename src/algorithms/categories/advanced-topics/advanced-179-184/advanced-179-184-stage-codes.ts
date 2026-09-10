/**
 * 左神算法通关课 179 ~ 184 点分治、点分树、线段树分治、可撤销并查集、CDQ 分治与整体二分 多语言代码与 1-based 行号映射
 */

export interface CodeMapping {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

// ==========================================
// 1. Class 179: 点分治 (Centroid Decomposition)
// ==========================================
export const CENTROID_DECOMPOSITION_CODES: Record<string, string[]> = {
  java: [
    'public void solve(int u) { // 树上点分治核心分治过程', // 1
    '    vis[u] = true; calcPaths(u); // 统计经过当前重心 u 的路径', // 2
    '    for (int v : adj[u]) {', // 3
    '        if (!vis[v]) {', // 4
    '            rt = 0; totalSize = sz[v]; // 重新在子连通块找重心', // 5
    '            getCentroid(v, u); solve(rt); // 递归分治', // 6
    '        }', // 7
    '    }', // 8
    '}', // 9
    'private void getCentroid(int u, int p) { // 树形 DP 求解子树重心', // 10
    '    sz[u] = 1; maxSub[u] = 0;', // 11
    '    for (int v : adj[u]) {', // 12
    '        if (v != p && !vis[v]) {', // 13
    '            getCentroid(v, u); sz[u] += sz[v];', // 14
    '            maxSub[u] = Math.max(maxSub[u], sz[v]);', // 15
    '        }', // 16
    '    }', // 17
    '    maxSub[u] = Math.max(maxSub[u], totalSize - sz[u]);', // 18
    '    if (rt == 0 || maxSub[u] < maxSub[rt]) rt = u;', // 19
    '}', // 20
  ],
  cpp: [
    'void solve(int u) {', // 1
    '    vis[u] = true; calcPaths(u);', // 2
    '    for (int v : adj[u]) {', // 3
    '        if (!vis[v]) {', // 4
    '            rt = 0; totalSize = sz[v];', // 5
    '            getCentroid(v, u); solve(rt);', // 6
    '        }', // 7
    '    }', // 8
    '}', // 9
    'void getCentroid(int u, int p) {', // 10
    '    sz[u] = 1; maxSub[u] = 0;', // 11
    '    for (int v : adj[u]) {', // 12
    '        if (v != p && !vis[v]) {', // 13
    '            getCentroid(v, u); sz[u] += sz[v];', // 14
    '            maxSub[u] = max(maxSub[u], sz[v]);', // 15
    '        }', // 16
    '    }', // 17
    '    maxSub[u] = max(maxSub[u], totalSize - sz[u]);', // 18
    '    if (!rt || maxSub[u] < maxSub[rt]) rt = u;', // 19
    '}', // 20
  ],
  python: [
    'def solve(self, u: int):', // 1
    '    self.vis[u] = True; self.calc_paths(u) # 统计跨重心路径', // 2
    '    for v in self.adj[u]:', // 3
    '        if not self.vis[v]:', // 4
    '            self.rt = 0; self.total_size = self.sz[v]', // 5
    '            self.get_centroid(v, u); self.solve(self.rt)', // 6
    'def get_centroid(self, u: int, p: int):', // 7
    '    self.sz[u] = 1; self.max_sub[u] = 0', // 8
    '    for v in self.adj[u]:', // 9
    '        if v != p and not self.vis[v]:', // 10
    '            self.get_centroid(v, u); self.sz[u] += self.sz[v]', // 11
    '            self.max_sub[u] = max(self.max_sub[u], self.sz[v])', // 12
    '    self.max_sub[u] = max(self.max_sub[u], self.total_size - self.sz[u])', // 13
    '    if self.rt == 0 or self.max_sub[u] < self.max_sub[self.rt]: self.rt = u', // 14
  ],
  javascript: [
    'function solve(u) {', // 1
    '    vis[u] = true; calcPaths(u);', // 2
    '    for (const v of adj[u]) {', // 3
    '        if (!vis[v]) {', // 4
    '            rt = 0; totalSize = sz[v];', // 5
    '            getCentroid(v, u); solve(rt);', // 6
    '        }', // 7
    '    }', // 8
    '}', // 9
    'function getCentroid(u, p) {', // 10
    '    sz[u] = 1; maxSub[u] = 0;', // 11
    '    for (const v of adj[u]) {', // 12
    '        if (v !== p && !vis[v]) {', // 13
    '            getCentroid(v, u); sz[u] += sz[v];', // 14
    '            maxSub[u] = Math.max(maxSub[u], sz[v]);', // 15
    '        }', // 16
    '    }', // 17
    '    maxSub[u] = Math.max(maxSub[u], totalSize - sz[u]);', // 18
    '    if (rt === 0 || maxSub[u] < maxSub[rt]) rt = u;', // 19
    '}', // 20
  ],
};

export const CENTROID_DECOMPOSITION_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  calcPaths: { java: 2, cpp: 2, python: 2, javascript: 2 },
  findCentroid:{ java: 6, cpp: 6, python: 6, javascript: 6 },
  treeDP:    { java: 19, cpp: 19, python: 14, javascript: 19 },
  returnAns: { java: 9, cpp: 9, python: 6, javascript: 9 },
};

// ==========================================
// 2. Class 180: 动态点分治 / 点分树 (Dynamic Centroid Tree)
// ==========================================
export const DYNAMIC_CENTROID_TREE_CODES: Record<string, string[]> = {
  java: [
    'public void update(int u, int val) { // 点分树向上容斥修改', // 1
    '    for (int cur = u; cur != 0; cur = faCT[cur]) { // 树高 O(log N) 级上跳', // 2
    '        int d = getDist(u, cur);', // 3
    '        tree1[cur].add(d, val); // 自身子树距离点权和', // 4
    '        if (faCT[cur] != 0) tree2[cur].add(getDist(u, faCT[cur]), val); // 父亲容斥抵消', // 5
    '    }', // 6
    '}', // 7
    'public long query(int u, int k) {', // 8
    '    long ans = tree1[u].query(k);', // 9
    '    for (int cur = u; faCT[cur] != 0; cur = faCT[cur]) {', // 10
    '        int p = faCT[cur], d = getDist(u, p);', // 11
    '        if (k >= d) ans += tree1[p].query(k - d) - tree2[cur].query(k - d); // 容斥求和', // 12
    '    }', // 13
    '    return ans;', // 14
    '}', // 15
  ],
  cpp: [
    'void update(int u, int val) {', // 1
    '    for (int cur = u; cur; cur = faCT[cur]) {', // 2
    '        int d = getDist(u, cur);', // 3
    '        tree1[cur].add(d, val);', // 4
    '        if (faCT[cur]) tree2[cur].add(getDist(u, faCT[cur]), val);', // 5
    '    }', // 6
    '}', // 7
    'long long query(int u, int k) {', // 8
    '    long long ans = tree1[u].query(k);', // 9
    '    for (int cur = u; faCT[cur]; cur = faCT[cur]) {', // 10
    '        int p = faCT[cur], d = getDist(u, p);', // 11
    '        if (k >= d) ans += tree1[p].query(k - d) - tree2[cur].query(k - d);', // 12
    '    }', // 13
    '    return ans;', // 14
    '}', // 15
  ],
  python: [
    'def update(self, u: int, val: int):', // 1
    '    cur = u', // 2
    '    while cur != 0:', // 3
    '        d = self.get_dist(u, cur); self.tree1[cur].add(d, val)', // 4
    '        if self.fa_ct[cur] != 0: self.tree2[cur].add(self.get_dist(u, self.fa_ct[cur]), val)', // 5
    '        cur = self.fa_ct[cur]', // 6
    'def query(self, u: int, k: int) -> int:', // 7
    '    ans = self.tree1[u].query(k); cur = u', // 8
    '    while self.fa_ct[cur] != 0:', // 9
    '        p = self.fa_ct[cur]; d = self.get_dist(u, p)', // 10
    '        if k >= d: ans += self.tree1[p].query(k - d) - self.tree2[cur].query(k - d)', // 11
    '        cur = p', // 12
    '    return ans', // 13
  ],
  javascript: [
    'function update(u, val) {', // 1
    '    for (let cur = u; cur !== 0; cur = faCT[cur]) {', // 2
    '        const d = getDist(u, cur);', // 3
    '        tree1[cur].add(d, val);', // 4
    '        if (faCT[cur] !== 0) tree2[cur].add(getDist(u, faCT[cur]), val);', // 5
    '    }', // 6
    '}', // 7
    'function query(u, k) {', // 8
    '    let ans = tree1[u].query(k);', // 9
    '    for (let cur = u; faCT[cur] !== 0; cur = faCT[cur]) {', // 10
    '        const p = faCT[cur], d = getDist(u, p);', // 11
    '        if (k >= d) ans += tree1[p].query(k - d) - tree2[cur].query(k - d);', // 12
    '    }', // 13
    '    return ans;', // 14
    '}', // 15
  ],
};

export const DYNAMIC_CENTROID_TREE_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  jumpFa:    { java: 2, cpp: 2, python: 3, javascript: 2 },
  addTrees:  { java: 4, cpp: 4, python: 4, javascript: 4 },
  queryInclusion:{ java: 12, cpp: 12, python: 11, javascript: 12 },
  returnAns: { java: 14, cpp: 14, python: 13, javascript: 14 },
};

// ==========================================
// 3. Class 181: 线段树分治 (Segment Tree Divide)
// ==========================================
export const SEGMENT_TREE_DIVIDE_CODES: Record<string, string[]> = {
  java: [
    'public void dfs(int p, int l, int r) { // 时间轴线段树前序遍历', // 1
    '    int historySnapshot = dsu.historySize(); // 记录回滚快照点', // 2
    '    for (Edge e : treeEdges[p]) { // 应用覆盖在当前时间区间的操作', // 3
    '        dsu.union(e.u, e.v);', // 4
    '    }', // 5
    '    if (l == r) { ans[l] = dsu.checkBipartite(); } // 叶子节点记录时刻答案', // 6
    '    else { int mid = (l + r) >> 1; dfs(p << 1, l, mid); dfs(p << 1 | 1, mid + 1, r); }', // 7
    '    dsu.rollback(historySnapshot); // 回滚历史状态恢复拓扑', // 8
    '}', // 9
  ],
  cpp: [
    'void dfs(int p, int l, int r) {', // 1
    '    int historySnapshot = dsu.historySize();', // 2
    '    for (const auto& e : treeEdges[p]) {', // 3
    '        dsu.unionNodes(e.u, e.v);', // 4
    '    }', // 5
    '    if (l == r) { ans[l] = dsu.checkBipartite(); }', // 6
    '    else { int mid = (l + r) >> 1; dfs(p << 1, l, mid); dfs(p << 1 | 1, mid + 1, r); }', // 7
    '    dsu.rollback(historySnapshot);', // 8
    '}', // 9
  ],
  python: [
    'def dfs(self, p: int, l: int, r: int):', // 1
    '    snapshot = self.dsu.history_size() # 快照点', // 2
    '    for u, v in self.tree_edges[p]: self.dsu.union(u, v)', // 3
    '    if l == r:', // 4
    '        self.ans[l] = self.dsu.check_bipartite() # 时刻判定', // 5
    '    else:', // 6
    '        mid = (l + r) // 2; self.dfs(p * 2, l, mid); self.dfs(p * 2 + 1, mid + 1, r)', // 7
    '    self.dsu.rollback(snapshot) # 回溯精准撤销', // 8
  ],
  javascript: [
    'function dfs(p, l, r) {', // 1
    '    const snapshot = dsu.historySize();', // 2
    '    for (const e of treeEdges[p]) dsu.union(e.u, e.v);', // 3
    '    if (l === r) { ans[l] = dsu.checkBipartite(); }', // 4
    '    else { const mid = (l + r) >> 1; dfs(p << 1, l, mid); dfs(p << 1 | 1, mid + 1, r); }', // 5
    '    dsu.rollback(snapshot);', // 6
    '}', // 7
  ],
};

export const SEGMENT_TREE_DIVIDE_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  snapshot:  { java: 2, cpp: 2, python: 2, javascript: 2 },
  applyOps:  { java: 4, cpp: 4, python: 3, javascript: 3 },
  leafAns:   { java: 6, cpp: 6, python: 5, javascript: 4 },
  rollback:  { java: 8, cpp: 8, python: 8, javascript: 6 },
};

// ==========================================
// 4. Class 182: 可撤销并查集 (Rollback DSU)
// ==========================================
export const ROLLBACK_DSU_CODES: Record<string, string[]> = {
  java: [
    'public void union(int u, int v) { // 按秩合并维持树高 O(log N)', // 1
    '    int fu = find(u), fv = find(v);', // 2
    '    if (fu == fv) { history.push(new Record(0, 0, 0)); return; }', // 3
    '    if (rank[fu] > rank[fv]) { int t = fu; fu = fv; fv = t; } // fu 秩小接在 fv 下', // 4
    '    history.push(new Record(fu, fv, rank[fu] == rank[fv] ? 1 : 0));', // 5
    '    parent[fu] = fv; if (rank[fu] == rank[fv]) rank[fv]++;', // 6
    '}', // 7
    'public void rollback(int targetSize) { // 栈顶回退历史状态', // 8
    '    while (history.size() > targetSize) {', // 9
    '        Record r = history.pop(); if (r.u == 0) continue;', // 10
    '        parent[r.u] = r.u; rank[r.v] -= r.addRank; // 撤销指针与秩增加', // 11
    '    }', // 12
    '}', // 13
  ],
  cpp: [
    'void unionNodes(int u, int v) {', // 1
    '    int fu = find(u), fv = find(v);', // 2
    '    if (fu == fv) { history.push({0, 0, 0}); return; }', // 3
    '    if (rank[fu] > rank[fv]) swap(fu, fv);', // 4
    '    history.push({fu, fv, rank[fu] == rank[fv] ? 1 : 0});', // 5
    '    parent[fu] = fv; if (rank[fu] == rank[fv]) rank[fv]++;', // 6
    '}', // 7
    'void rollback(int targetSize) {', // 8
    '    while (history.size() > targetSize) {', // 9
    '        auto r = history.top(); history.pop(); if (!r.u) continue;', // 10
    '        parent[r.u] = r.u; rank[r.v] -= r.addRank;', // 11
    '    }', // 12
    '}', // 13
  ],
  python: [
    'def union(self, u: int, v: int):', // 1
    '    fu, fv = self.find(u), self.find(v)', // 2
    '    if fu == fv: self.history.append((0, 0, 0)); return', // 3
    '    if self.rank[fu] > self.rank[fv]: fu, fv = fv, fu', // 4
    '    add = 1 if self.rank[fu] == self.rank[fv] else 0', // 5
    '    self.history.append((fu, fv, add)); self.parent[fu] = fv; self.rank[fv] += add', // 6
    'def rollback(self, target_size: int):', // 7
    '    while len(self.history) > target_size:', // 8
    '        fu, fv, add = self.history.pop()', // 9
    '        if fu != 0: self.parent[fu] = fu; self.rank[fv] -= add # 零开销回滚', // 10
  ],
  javascript: [
    'function union(u, v) {', // 1
    '    let fu = find(u), fv = find(v);', // 2
    '    if (fu === fv) { history.push({ u: 0, v: 0, add: 0 }); return; }', // 3
    '    if (rank[fu] > rank[fv]) { const t = fu; fu = fv; fv = t; }', // 4
    '    const add = rank[fu] === rank[fv] ? 1 : 0;', // 5
    '    history.push({ u: fu, v: fv, add }); parent[fu] = fv; rank[fv] += add;', // 6
    '}', // 7
    'function rollback(targetSize) {', // 8
    '    while (history.length > targetSize) {', // 9
    '        const { u, v, add } = history.pop(); if (u === 0) continue;', // 10
    '        parent[u] = u; rank[v] -= add;', // 11
    '    }', // 12
    '}', // 13
  ],
};

export const ROLLBACK_DSU_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  unionRank: { java: 6, cpp: 6, python: 6, javascript: 6 },
  historyPush:{ java: 5, cpp: 5, python: 6, javascript: 6 },
  rollbackPop:{ java: 11, cpp: 11, python: 10, javascript: 11 },
  returnAns: { java: 13, cpp: 13, python: 10, javascript: 13 },
};

// ==========================================
// 5. Class 183: CDQ 分治 (CDQ Divide & Conquer)
// ==========================================
export const CDQ_DIVIDE_CODES: Record<string, string[]> = {
  java: [
    'public void cdq(int l, int r) { // 三维偏序分治：左区计算对右区贡献', // 1
    '    if (l >= r) return;', // 2
    '    int mid = (l + r) >> 1; cdq(l, mid); cdq(mid + 1, r); // 递归分治两半', // 3
    '    int i = l, j = mid + 1, k = l; // 归并双指针按维度 b 排序', // 4
    '    while (i <= mid && j <= r) {', // 5
    '        if (pts[i].b <= pts[j].b) { bit.add(pts[i].c, pts[i].cnt); tmp[k++] = pts[i++]; } // 维护维度 c', // 6
    '        else { pts[j].ans += bit.query(pts[j].c); tmp[k++] = pts[j++]; } // 统计偏序偏序', // 7
    '    }', // 8
    '    while (j <= r) { pts[j].ans += bit.query(pts[j].c); tmp[k++] = pts[j++]; }', // 9
    '    for (int p = l; p < i; p++) bit.add(pts[p].c, -pts[p].cnt); // 清空树状数组', // 10
    '    while (i <= mid) tmp[k++] = pts[i++]; System.arraycopy(tmp, l, pts, l, r - l + 1);', // 11
    '}', // 12
  ],
  cpp: [
    'void cdq(int l, int r) {', // 1
    '    if (l >= r) return;', // 2
    '    int mid = (l + r) >> 1; cdq(l, mid); cdq(mid + 1, r);', // 3
    '    int i = l, j = mid + 1, k = l;', // 4
    '    while (i <= mid && j <= r) {', // 5
    '        if (pts[i].b <= pts[j].b) { bit.add(pts[i].c, pts[i].cnt); tmp[k++] = pts[i++]; }', // 6
    '        else { pts[j].ans += bit.query(pts[j].c); tmp[k++] = pts[j++]; }', // 7
    '    }', // 8
    '    while (j <= r) { pts[j].ans += bit.query(pts[j].c); tmp[k++] = pts[j++]; }', // 9
    '    for (int p = l; p < i; p++) bit.add(pts[p].c, -pts[p].cnt);', // 10
    '    while (i <= mid) tmp[k++] = pts[i++]; copy(tmp.begin() + l, tmp.begin() + r + 1, pts.begin() + l);', // 11
    '}', // 12
  ],
  python: [
    'def cdq(self, l: int, r: int):', // 1
    '    if l >= r: return', // 2
    '    mid = (l + r) // 2; self.cdq(l, mid); self.cdq(mid + 1, r)', // 3
    '    i, j, k = l, mid + 1, l', // 4
    '    while i <= mid and j <= r:', // 5
    '        if self.pts[i].b <= self.pts[j].b: self.bit.add(self.pts[i].c, self.pts[i].cnt); self.tmp[k] = self.pts[i]; i += 1; k += 1', // 6
    '        else: self.pts[j].ans += self.bit.query(self.pts[j].c); self.tmp[k] = self.pts[j]; j += 1; k += 1', // 7
    '    while j <= r: self.pts[j].ans += self.bit.query(self.pts[j].c); self.tmp[k] = self.pts[j]; j += 1; k += 1', // 8
    '    for p in range(l, i): self.bit.add(self.pts[p].c, -self.pts[p].cnt) # 清空树状数组', // 9
  ],
  javascript: [
    'function cdq(l, r) {', // 1
    '    if (l >= r) return;', // 2
    '    const mid = (l + r) >> 1; cdq(l, mid); cdq(mid + 1, r);', // 3
    '    let i = l, j = mid + 1, k = l;', // 4
    '    while (i <= mid && j <= r) {', // 5
    '        if (pts[i].b <= pts[j].b) { bit.add(pts[i].c, pts[i].cnt); tmp[k++] = pts[i++]; }', // 6
    '        else { pts[j].ans += bit.query(pts[j].c); tmp[k++] = pts[j++]; }', // 7
    '    }', // 8
    '    while (j <= r) { pts[j].ans += bit.query(pts[j].c); tmp[k++] = pts[j++]; }', // 9
    '    for (let p = l; p < i; p++) bit.add(pts[p].c, -pts[p].cnt);', // 10
    '}', // 11
  ],
};

export const CDQ_DIVIDE_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  recurseSub:{ java: 3, cpp: 3, python: 3, javascript: 3 },
  mergeOrder:{ java: 6, cpp: 6, python: 6, javascript: 6 },
  queryBIT:  { java: 7, cpp: 7, python: 7, javascript: 7 },
  cleanBIT:  { java: 10, cpp: 10, python: 9, javascript: 10 },
};

// ==========================================
// 6. Class 184: 整体二分 (Parallel Binary Search)
// ==========================================
export const PARALLEL_BINARY_SEARCH_CODES: Record<string, string[]> = {
  java: [
    'public void solve(int l, int r, List<Query> qList) { // 答案值域范围 [l, r]', // 1
    '    if (qList.isEmpty()) return;', // 2
    '    if (l == r) { for (Query q : qList) ans[q.id] = l; return; } // 确定答案', // 3
    '    int mid = (l + r) >> 1;', // 4
    '    for (int i = l; i <= mid; i++) applyOperation(i, 1); // 施加中点前操作', // 5
    '    List<Query> leftList = new ArrayList<>(), rightList = new ArrayList<>();', // 6
    '    for (Query q : qList) {', // 7
    '        long satisfied = checkQuery(q);', // 8
    '        if (satisfied >= q.target) leftList.add(q); // 提前达标归入左部', // 9
    '        else { q.target -= satisfied; rightList.add(q); } // 未达标扣除贡献进右部', // 10
    '    }', // 11
    '    for (int i = l; i <= mid; i++) applyOperation(i, -1); // 撤销操作', // 12
    '    solve(l, mid, leftList); solve(mid + 1, r, rightList); // 分流递归', // 13
    '}', // 14
  ],
  cpp: [
    'void solve(int l, int r, vector<Query>& qList) {', // 1
    '    if (qList.empty()) return;', // 2
    '    if (l == r) { for (auto& q : qList) ans[q.id] = l; return; }', // 3
    '    int mid = (l + r) >> 1;', // 4
    '    for (int i = l; i <= mid; i++) applyOperation(i, 1);', // 5
    '    vector<Query> leftList, rightList;', // 6
    '    for (auto& q : qList) {', // 7
    '        long long satisfied = checkQuery(q);', // 8
    '        if (satisfied >= q.target) leftList.push_back(q);', // 9
    '        else { q.target -= satisfied; rightList.push_back(q); }', // 10
    '    }', // 11
    '    for (int i = l; i <= mid; i++) applyOperation(i, -1);', // 12
    '    solve(l, mid, leftList); solve(mid + 1, r, rightList);', // 13
    '}', // 14
  ],
  python: [
    'def solve(self, l: int, r: int, q_list: list):', // 1
    '    if not q_list: return', // 2
    '    if l == r: # 答案确定', // 3
    '        for q in q_list: self.ans[q.id] = l; return', // 4
    '    mid = (l + r) // 2', // 5
    '    for i in range(l, mid + 1): self.apply_operation(i, 1) # 批量修改', // 6
    '    left_list, right_list = [], []', // 7
    '    for q in q_list:', // 8
    '        satisfied = self.check_query(q)', // 9
    '        if satisfied >= q.target: left_list.append(q) # 归入左半区', // 10
    '        else: q.target -= satisfied; right_list.append(q) # 归入右半区', // 11
    '    for i in range(l, mid + 1): self.apply_operation(i, -1) # 撤销', // 12
    '    self.solve(l, mid, left_list); self.solve(mid + 1, r, right_list)', // 13
  ],
  javascript: [
    'function solve(l, r, qList) {', // 1
    '    if (qList.length === 0) return;', // 2
    '    if (l === r) { for (const q of qList) ans[q.id] = l; return; }', // 3
    '    const mid = (l + r) >> 1;', // 4
    '    for (let i = l; i <= mid; i++) applyOperation(i, 1);', // 5
    '    const leftList = [], rightList = [];', // 6
    '    for (const q of qList) {', // 7
    '        const satisfied = checkQuery(q);', // 8
    '        if (satisfied >= q.target) leftList.push(q);', // 9
    '        else { q.target -= satisfied; rightList.push(q); }', // 10
    '    }', // 11
    '    for (let i = l; i <= mid; i++) applyOperation(i, -1);', // 12
    '    solve(l, mid, leftList); solve(mid + 1, r, rightList);', // 13
    '}', // 14
  ],
};

export const PARALLEL_BINARY_SEARCH_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  answerHit: { java: 3, cpp: 3, python: 4, javascript: 3 },
  applyOps:  { java: 5, cpp: 5, python: 6, javascript: 5 },
  splitQueries:{ java: 9, cpp: 9, python: 10, javascript: 9 },
  rollbackAndRecurse:{ java: 12, cpp: 12, python: 12, javascript: 12 },
};
