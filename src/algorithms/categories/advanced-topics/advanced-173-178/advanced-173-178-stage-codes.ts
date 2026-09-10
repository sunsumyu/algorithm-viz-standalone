/**
 * 左神算法通关课 173 ~ 178 网络流最大流、最小费用最大流、二分图匹配、KM 算法、弦图与圆方树 多语言代码与 1-based 行号映射
 */

export interface CodeMapping {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

// ==========================================
// 1. Class 173: 网络流最大流 (Dinic)
// ==========================================
export const DINIC_MAX_FLOW_CODES: Record<string, string[]> = {
  java: [
    'public long dinic(int s, int t) { // 层次图多路增广 + 当前弧优化', // 1
    '    long maxFlow = 0;', // 2
    '    while (bfs(s, t)) { // BFS 建立层次图分层', // 3
    '        System.arraycopy(head, 0, cur, 0, n + 1); // 当前弧指针复位', // 4
    '        long pushed; while ((pushed = dfs(s, t, INF)) > 0) maxFlow += pushed; // 多路增广', // 5
    '    }', // 6
    '    return maxFlow;', // 7
    '}', // 8
    'private long dfs(int u, int t, long flow) {', // 9
    '    if (u == t) return flow;', // 10
    '    for (int e = cur[u]; e != 0; e = nxt[e]) {', // 11
    '        cur[u] = e; int v = to[e];', // 12
    '        if (dep[v] == dep[u] + 1 && cap[e] > 0) {', // 13
    '            long tr = dfs(v, t, Math.min(flow, cap[e]));', // 14
    '            if (tr > 0) { cap[e] -= tr; cap[e ^ 1] += tr; return tr; } // 反向边增退流', // 15
    '        }', // 16
    '    }', // 17
    '    return 0;', // 18
    '}', // 19
  ],
  cpp: [
    'long long dinic(int s, int t) {', // 1
    '    long long maxFlow = 0;', // 2
    '    while (bfs(s, t)) {', // 3
    '        cur = head;', // 4
    '        while (long long pushed = dfs(s, t, INF)) maxFlow += pushed;', // 5
    '    }', // 6
    '    return maxFlow;', // 7
    '}', // 8
    'long long dfs(int u, int t, long long flow) {', // 9
    '    if (u == t) return flow;', // 10
    '    for (int& e = cur[u]; e != -1; e = edges[e].nxt) {', // 11
    '        int v = edges[e].to;', // 12
    '        if (dep[v] == dep[u] + 1 && edges[e].cap > 0) {', // 13
    '            long long tr = dfs(v, t, min(flow, edges[e].cap));', // 14
    '            if (tr > 0) { edges[e].cap -= tr; edges[e ^ 1].cap += tr; return tr; }', // 15
    '        }', // 16
    '    }', // 17
    '    return 0;', // 18
    '}', // 19
  ],
  python: [
    'def dinic(self, s: int, t: int) -> int:', // 1
    '    max_flow = 0', // 2
    '    while self.bfs(s, t):', // 3
    '        self.cur = list(self.head)', // 4
    '        while True:', // 5
    '            pushed = self.dfs(s, t, float("inf"))', // 6
    '            if pushed == 0: break', // 7
    '            max_flow += pushed', // 8
    '    return max_flow', // 9
  ],
  javascript: [
    'function dinic(s, t) {', // 1
    '    let maxFlow = 0;', // 2
    '    while (bfs(s, t)) {', // 3
    '        cur = [...head];', // 4
    '        let pushed = 0;', // 5
    '        while ((pushed = dfs(s, t, Infinity)) > 0) maxFlow += pushed;', // 6
    '    }', // 7
    '    return maxFlow;', // 8
    '}', // 9
  ],
};

export const DINIC_MAX_FLOW_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  bfsLayer:  { java: 3, cpp: 3, python: 3, javascript: 3 },
  dfsAugment:{ java: 5, cpp: 5, python: 6, javascript: 6 },
  backEdge:  { java: 15, cpp: 15, python: 8, javascript: 6 },
  returnAns: { java: 7, cpp: 7, python: 9, javascript: 8 },
};

// ==========================================
// 2. Class 174: 最小费用最大流 (MCMF)
// ==========================================
export const MCMF_COST_FLOW_CODES: Record<string, string[]> = {
  java: [
    'public long[] mcmf(int s, int t) { // SPFA 寻找单位费用最短路', // 1
    '    long maxFlow = 0, minCost = 0;', // 2
    '    while (spfa(s, t)) { // 找到增广路', // 3
    '        long flow = INF;', // 4
    '        for (int u = t; u != s; u = preU[u]) flow = Math.min(flow, edges[preE[u]].cap); // 瓶颈流量', // 5
    '        for (int u = t; u != s; u = preU[u]) {', // 6
    '            edges[preE[u]].cap -= flow; edges[preE[u] ^ 1].cap += flow; // 正反边更新', // 7
    '        }', // 8
    '        maxFlow += flow; minCost += flow * dis[t]; // 累加费用', // 9
    '    }', // 10
    '    return new long[]{maxFlow, minCost};', // 11
    '}', // 12
  ],
  cpp: [
    'pair<long long, long long> mcmf(int s, int t) {', // 1
    '    long long maxFlow = 0, minCost = 0;', // 2
    '    while (spfa(s, t)) {', // 3
    '        long long flow = INF;', // 4
    '        for (int u = t; u != s; u = preU[u]) flow = min(flow, edges[preE[u]].cap);', // 5
    '        for (int u = t; u != s; u = preU[u]) {', // 6
    '            edges[preE[u]].cap -= flow; edges[preE[u] ^ 1].cap += flow;', // 7
    '        }', // 8
    '        maxFlow += flow; minCost += flow * dis[t];', // 9
    '    }', // 10
    '    return {maxFlow, minCost};', // 11
    '}', // 12
  ],
  python: [
    'def mcmf(self, s: int, t: int) -> tuple[int, int]:', // 1
    '    max_flow, min_cost = 0, 0', // 2
    '    while self.spfa(s, t):', // 3
    '        flow = float("inf"); u = t', // 4
    '        while u != s: flow = min(flow, self.edges[self.pre_e[u]].cap); u = self.pre_u[u]', // 5
    '        u = t', // 6
    '        while u != s: self.edges[self.pre_e[u]].cap -= flow; self.edges[self.pre_e[u]^1].cap += flow; u = self.pre_u[u]', // 7
    '        max_flow += flow; min_cost += flow * self.dis[t]', // 8
    '    return max_flow, min_cost', // 9
  ],
  javascript: [
    'function mcmf(s, t) {', // 1
    '    let maxFlow = 0, minCost = 0;', // 2
    '    while (spfa(s, t)) {', // 3
    '        let flow = Infinity;', // 4
    '        for (let u = t; u !== s; u = preU[u]) flow = Math.min(flow, edges[preE[u]].cap);', // 5
    '        for (let u = t; u !== s; u = preU[u]) {', // 6
    '            edges[preE[u]].cap -= flow; edges[preE[u] ^ 1].cap += flow;', // 7
    '        }', // 8
    '        maxFlow += flow; minCost += flow * dis[t];', // 9
    '    }', // 10
    '    return { maxFlow, minCost };', // 11
    '}', // 12
  ],
};

export const MCMF_COST_FLOW_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  spfaShort: { java: 3, cpp: 3, python: 3, javascript: 3 },
  bottleNeck:{ java: 5, cpp: 5, python: 5, javascript: 5 },
  pushFlow:  { java: 7, cpp: 7, python: 7, javascript: 7 },
  returnAns: { java: 11, cpp: 11, python: 9, javascript: 11 },
};

// ==========================================
// 3. Class 175: 二分图最大匹配 (Hungarian)
// ==========================================
export const HUNGARIAN_MATCHING_CODES: Record<string, string[]> = {
  java: [
    'public int hungarian() { // 匈牙利算法交替轨 DFS', // 1
    '    int matches = 0;', // 2
    '    Arrays.fill(match, -1);', // 3
    '    for (int u = 0; u < nLeft; u++) { // 遍历左部点', // 4
    '        Arrays.fill(vis, false); // 右部点访问标记清空', // 5
    '        if (dfs(u)) matches++; // 找到增广路', // 6
    '    }', // 7
    '    return matches;', // 8
    '}', // 9
    'private boolean dfs(int u) {', // 10
    '    for (int v : adj[u]) {', // 11
    '        if (!vis[v]) {', // 12
    '            vis[v] = true;', // 13
    '            if (match[v] == -1 || dfs(match[v])) { match[v] = u; return true; } // 伴侣腾挪', // 14
    '        }', // 15
    '    }', // 16
    '    return false;', // 17
    '}', // 18
  ],
  cpp: [
    'int hungarian() {', // 1
    '    int matches = 0;', // 2
    '    fill(match.begin(), match.end(), -1);', // 3
    '    for (int u = 0; u < nLeft; u++) {', // 4
    '        fill(vis.begin(), vis.end(), false);', // 5
    '        if (dfs(u)) matches++;', // 6
    '    }', // 7
    '    return matches;', // 8
    '}', // 9
    'bool dfs(int u) {', // 10
    '    for (int v : adj[u]) {', // 11
    '        if (!vis[v]) {', // 12
    '            vis[v] = true;', // 13
    '            if (match[v] == -1 || dfs(match[v])) { match[v] = u; return true; }', // 14
    '        }', // 15
    '    }', // 16
    '    return false;', // 17
    '}', // 18
  ],
  python: [
    'def hungarian(self) -> int:', // 1
    '    matches = 0; self.match = [-1] * self.n_right', // 2
    '    for u in range(self.n_left):', // 3
    '        self.vis = [False] * self.n_right', // 4
    '        if self.dfs(u): matches += 1 # 增广链协商', // 5
    '    return matches', // 6
    'def dfs(self, u: int) -> bool:', // 7
    '    for v in self.adj[u]:', // 8
    '        if not self.vis[v]:', // 9
    '            self.vis[v] = True', // 10
    '            if self.match[v] == -1 or self.dfs(self.match[v]):', // 11
    '                self.match[v] = u; return True', // 12
    '    return False', // 13
  ],
  javascript: [
    'function hungarian() {', // 1
    '    let matches = 0; match.fill(-1);', // 2
    '    for (let u = 0; u < nLeft; u++) {', // 3
    '        vis.fill(false);', // 4
    '        if (dfs(u)) matches++;', // 5
    '    }', // 6
    '    return matches;', // 7
    '}', // 8
    'function dfs(u) {', // 9
    '    for (const v of adj[u]) {', // 10
    '        if (!vis[v]) {', // 11
    '            vis[v] = true;', // 12
    '            if (match[v] === -1 || dfs(match[v])) { match[v] = u; return true; }', // 13
    '        }', // 14
    '    }', // 15
    '    return false;', // 16
    '}', // 17
  ],
};

export const HUNGARIAN_MATCHING_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  leftLoop:  { java: 4, cpp: 4, python: 3, javascript: 3 },
  visitRight:{ java: 12, cpp: 12, python: 9, javascript: 11 },
  reassign:  { java: 14, cpp: 14, python: 12, javascript: 13 },
  returnAns: { java: 8, cpp: 8, python: 6, javascript: 7 },
};

// ==========================================
// 4. Class 176: 二分图最大权完美匹配 (KM)
// ==========================================
export const KM_MATCHING_CODES: Record<string, string[]> = {
  java: [
    'public long km() { // Kuhn-Munkres 顶标维护', // 1
    '    for (int i = 0; i < n; i++) { // 顶标初始化 Lx[i] = max W(i, j)', // 2
    '        lx[i] = -INF; for (int j = 0; j < n; j++) lx[i] = Math.max(lx[i], w[i][j]);', // 3
    '    }', // 4
    '    for (int i = 0; i < n; i++) { // 为每个左部点寻增广轨', // 5
    '        while (true) {', // 6
    '            Arrays.fill(visX, false); Arrays.fill(visY, false); Arrays.fill(slack, INF);', // 7
    '            if (dfs(i)) break; // 成功在相等子图中增广', // 8
    '            long delta = getMinSlack(); // 松弛量微调顶标', // 9
    '            for (int j = 0; j < n; j++) { if (visX[j]) lx[j] -= delta; if (visY[j]) ly[j] += delta; }', // 10
    '        }', // 11
    '    }', // 12
    '    long sum = 0; for (int i = 0; i < n; i++) sum += w[match[i]][i]; return sum;', // 13
    '}', // 14
  ],
  cpp: [
    'long long km() {', // 1
    '    for (int i = 0; i < n; i++) {', // 2
    '        lx[i] = -INF; for (int j = 0; j < n; j++) lx[i] = max(lx[i], w[i][j]);', // 3
    '    }', // 4
    '    for (int i = 0; i < n; i++) {', // 5
    '        while (true) {', // 6
    '            fill(visX.begin(), visX.end(), false); fill(visY.begin(), visY.end(), false);', // 7
    '            if (dfs(i)) break;', // 8
    '            long long delta = getMinSlack();', // 9
    '            for (int j = 0; j < n; j++) { if (visX[j]) lx[j] -= delta; if (visY[j]) ly[j] += delta; }', // 10
    '        }', // 11
    '    }', // 12
    '    long long sum = 0; for (int i = 0; i < n; i++) sum += w[match[i]][i]; return sum;', // 13
    '}', // 14
  ],
  python: [
    'def km(self) -> int:', // 1
    '    for i in range(self.n): self.lx[i] = max(self.w[i]) # 顶标初始化', // 2
    '    for i in range(self.n):', // 3
    '        while True:', // 4
    '            self.vis_x = [False] * self.n; self.vis_y = [False] * self.n; self.slack = [float("inf")] * self.n', // 5
    '            if self.dfs(i): break # 相等子图增广成功', // 6
    '            delta = min(self.slack) # 计算最小松弛量', // 7
    '            for j in range(self.n):', // 8
    '                if self.vis_x[j]: self.lx[j] -= delta', // 9
    '                if self.vis_y[j]: self.ly[j] += delta', // 10
    '    return sum(self.w[self.match[i]][i] for i in range(self.n))', // 11
  ],
  javascript: [
    'function km() {', // 1
    '    for (let i = 0; i < n; i++) lx[i] = Math.max(...w[i]);', // 2
    '    for (let i = 0; i < n; i++) {', // 3
    '        while (true) {', // 4
    '            visX.fill(false); visY.fill(false); slack.fill(Infinity);', // 5
    '            if (dfs(i)) break;', // 6
    '            const delta = Math.min(...slack);', // 7
    '            for (let j = 0; j < n; j++) { if (visX[j]) lx[j] -= delta; if (visY[j]) ly[j] += delta; }', // 8
    '        }', // 9
    '    }', // 10
    '    let sum = 0; for (let i = 0; i < n; i++) sum += w[match[i]][i]; return sum;', // 11
    '}', // 12
  ],
};

export const KM_MATCHING_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  initLabel: { java: 3, cpp: 3, python: 2, javascript: 2 },
  augLoop:   { java: 8, cpp: 8, python: 6, javascript: 6 },
  adjustDelta:{ java: 10, cpp: 10, python: 9, javascript: 8 },
  returnAns: { java: 13, cpp: 13, python: 11, javascript: 11 },
};

// ==========================================
// 5. Class 177: 弦图与最大势算法 (MCS)
// ==========================================
export const CHORDAL_GRAPH_MCS_CODES: Record<string, string[]> = {
  java: [
    'public int[] mcs() { // Maximum Cardinality Search 构造 PEO', // 1
    '    int[] peo = new int[n], deg = new int[n];', // 2
    '    boolean[] vis = new boolean[n];', // 3
    '    for (int i = n - 1; i >= 0; i--) { // 倒序生成消除序列', // 4
    '        int u = -1; for (int j = 0; j < n; j++) if (!vis[j] && (u == -1 || deg[j] > deg[u])) u = j;', // 5
    '        vis[u] = true; peo[i] = u; // 贪心选取相邻已选点最多的顶点', // 6
    '        for (int v : adj[u]) if (!vis[v]) deg[v]++; // 提升邻居势能', // 7
    '    }', // 8
    '    return peo; // 返回完美消除序列', // 9
    '}', // 10
  ],
  cpp: [
    'vector<int> mcs() {', // 1
    '    vector<int> peo(n), deg(n, 0); vector<bool> vis(n, false);', // 2
    '    for (int i = n - 1; i >= 0; i--) {', // 3
    '        int u = -1; for (int j = 0; j < n; j++) if (!vis[j] && (u == -1 || deg[j] > deg[u])) u = j;', // 4
    '        vis[u] = true; peo[i] = u;', // 5
    '        for (int v : adj[u]) if (!vis[v]) deg[v]++;', // 6
    '    }', // 7
    '    return peo;', // 8
    '}', // 9
  ],
  python: [
    'def mcs(self) -> list[int]:', // 1
    '    peo = [0] * self.n; deg = [0] * self.n; vis = [False] * self.n', // 2
    '    for i in range(self.n - 1, -1, -1):', // 3
    '        u = -1', // 4
    '        for j in range(self.n):', // 5
    '            if not vis[j] and (u == -1 or deg[j] > deg[u]): u = j', // 6
    '        vis[u] = True; peo[i] = u # 选取势能最大点', // 7
    '        for v in self.adj[u]:', // 8
    '            if not vis[v]: deg[v] += 1', // 9
    '    return peo', // 10
  ],
  javascript: [
    'function mcs() {', // 1
    '    const peo = new Array(n), deg = new Array(n).fill(0), vis = new Array(n).fill(false);', // 2
    '    for (let i = n - 1; i >= 0; i--) {', // 3
    '        let u = -1; for (let j = 0; j < n; j++) if (!vis[j] && (u === -1 || deg[j] > deg[u])) u = j;', // 4
    '        vis[u] = true; peo[i] = u;', // 5
    '        for (const v of adj[u]) if (!vis[v]) deg[v]++;', // 6
    '    }', // 7
    '    return peo;', // 8
    '}', // 9
  ],
};

export const CHORDAL_GRAPH_MCS_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  reverseLoop:{ java: 4, cpp: 3, python: 3, javascript: 3 },
  pickMaxDeg:{ java: 5, cpp: 4, python: 6, javascript: 4 },
  updateNeighbors:{ java: 7, cpp: 6, python: 9, javascript: 6 },
  returnAns: { java: 9, cpp: 8, python: 10, javascript: 8 },
};

// ==========================================
// 6. Class 178: 圆方树 (Block-Cut Tree)
// ==========================================
export const BLOCK_CUT_TREE_CODES: Record<string, string[]> = {
  java: [
    'public void tarjan(int u) { // Tarjan 找极大点双连通分量 (BCC)', // 1
    '    dfn[u] = low[u] = ++dfnClock; stk.push(u);', // 2
    '    for (int v : adj[u]) {', // 3
    '        if (dfn[v] == 0) {', // 4
    '            tarjan(v); low[u] = Math.min(low[u], low[v]);', // 5
    '            if (low[v] >= dfn[u]) { // 发现以 u 为顶点的点双分量', // 6
    '                int square = ++nodeCnt; // 新建方点', // 7
    '                addBCTEdge(u, square); // 圆点连方点', // 8
    '                int x; do { x = stk.pop(); addBCTEdge(x, square); } while (x != v);', // 9
    '            }', // 10
    '        } else low[u] = Math.min(low[u], dfn[v]);', // 11
    '    }', // 12
    '}', // 13
  ],
  cpp: [
    'void tarjan(int u) {', // 1
    '    dfn[u] = low[u] = ++dfnClock; stk.push(u);', // 2
    '    for (int v : adj[u]) {', // 3
    '        if (!dfn[v]) {', // 4
    '            tarjan(v); low[u] = min(low[u], low[v]);', // 5
    '            if (low[v] >= dfn[u]) {', // 6
    '                int square = ++nodeCnt;', // 7
    '                addBCTEdge(u, square);', // 8
    '                int x; do { x = stk.top(); stk.pop(); addBCTEdge(x, square); } while (x != v);', // 9
    '            }', // 10
    '        } else low[u] = min(low[u], dfn[v]);', // 11
    '    }', // 12
    '}', // 13
  ],
  python: [
    'def tarjan(self, u: int):', // 1
    '    self.dfn_clock += 1; self.dfn[u] = self.low[u] = self.dfn_clock; self.stk.append(u)', // 2
    '    for v in self.adj[u]:', // 3
    '        if self.dfn[v] == 0:', // 4
    '            self.tarjan(v); self.low[u] = min(self.low[u], self.low[v])', // 5
    '            if self.low[v] >= self.dfn[u]: # 构成点双', // 6
    '                self.node_cnt += 1; square = self.node_cnt', // 7
    '                self.add_bct_edge(u, square)', // 8
    '                while True:', // 9
    '                    x = self.stk.pop(); self.add_bct_edge(x, square)', // 10
    '                    if x == v: break', // 11
    '        else: self.low[u] = min(self.low[u], self.dfn[v])', // 12
  ],
  javascript: [
    'function tarjan(u) {', // 1
    '    dfn[u] = low[u] = ++dfnClock; stk.push(u);', // 2
    '    for (const v of adj[u]) {', // 3
    '        if (dfn[v] === 0) {', // 4
    '            tarjan(v); low[u] = Math.min(low[u], low[v]);', // 5
    '            if (low[v] >= dfn[u]) {', // 6
    '                const square = ++nodeCnt;', // 7
    '                addBCTEdge(u, square);', // 8
    '                let x; do { x = stk.pop(); addBCTEdge(x, square); } while (x !== v);', // 9
    '            }', // 10
    '        } else low[u] = Math.min(low[u], dfn[v]);', // 11
    '    }', // 12
    '}', // 13
  ],
};

export const BLOCK_CUT_TREE_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  treeEdge:  { java: 5, cpp: 5, python: 5, javascript: 5 },
  bccFound:  { java: 6, cpp: 6, python: 6, javascript: 6 },
  addSquare: { java: 8, cpp: 8, python: 8, javascript: 8 },
  returnAns: { java: 13, cpp: 13, python: 12, javascript: 13 },
};
