/**
 * 左神算法通关课 185 ~ 190 欧拉序/DFN序求LCA、边分治、欧拉路径/回路、强连通分量缩点、边双连通分量与点双连通分量 多语言代码与 1-based 行号映射
 */

export interface CodeMapping {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

// ==========================================
// 1. Class 185: 欧拉序与 DFN 序求 LCA
// ==========================================
export const EULER_DFN_LCA_CODES: Record<string, string[]> = {
  java: [
    'public int getLcaByEuler(int u, int v) { // 欧拉序 + ST 表 O(1) 求解 LCA', // 1
    '    int l = firstPos[u], r = firstPos[v];', // 2
    '    if (l > r) { int t = l; l = r; r = t; }', // 3
    '    int k = logTable[r - l + 1];', // 4
    '    int node1 = stTable[l][k], node2 = stTable[r - (1 << k) + 1][k];', // 5
    '    return depth[node1] < depth[node2] ? node1 : node2; // 取区间深度最小者', // 6
    '}', // 7
  ],
  cpp: [
    'int getLcaByEuler(int u, int v) {', // 1
    '    int l = firstPos[u], r = firstPos[v];', // 2
    '    if (l > r) swap(l, r);', // 3
    '    int k = logTable[r - l + 1];', // 4
    '    int node1 = stTable[l][k], node2 = stTable[r - (1 << k) + 1][k];', // 5
    '    return depth[node1] < depth[node2] ? node1 : node2;', // 6
    '}', // 7
  ],
  python: [
    'def get_lca_by_euler(self, u: int, v: int) -> int:', // 1
    '    l, r = self.first_pos[u], self.first_pos[v]', // 2
    '    if l > r: l, r = r, l', // 3
    '    k = self.log_table[r - l + 1]', // 4
    '    n1, n2 = self.st_table[l][k], self.st_table[r - (1 << k) + 1][k]', // 5
    '    return n1 if self.depth[n1] < self.depth[n2] else n2', // 6
  ],
  javascript: [
    'function getLcaByEuler(u, v) {', // 1
    '    let l = firstPos[u], r = firstPos[v];', // 2
    '    if (l > r) { const t = l; l = r; r = t; }', // 3
    '    const k = logTable[r - l + 1];', // 4
    '    const n1 = stTable[l][k], n2 = stTable[r - (1 << k) + 1][k];', // 5
    '    return depth[n1] < depth[n2] ? n1 : n2;', // 6
    '}', // 7
  ],
};

export const EULER_DFN_LCA_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  firstPos:  { java: 2, cpp: 2, python: 2, javascript: 2 },
  queryRMQ:  { java: 5, cpp: 5, python: 5, javascript: 5 },
  returnAns: { java: 6, cpp: 6, python: 6, javascript: 6 },
};

// ==========================================
// 2. Class 186: 树上边分治与边分树
// ==========================================
export const EDGE_DECOMPOSITION_CODES: Record<string, string[]> = {
  java: [
    'public void solveEdge(int eid) { // 边分治：割断重心边将树严格二分', // 1
    '    if (eid == 0) return;', // 2
    '    visEdge[eid] = true; // 割断当前中心边', // 3
    '    int u = edges[eid].u, v = edges[eid].v; // 两个连通块代表元', // 4
    '    calcPathsAcrossEdge(u, v, edges[eid].w); // 统计跨越该边的路径', // 5
    '    int nextE1 = findCentroidEdge(u), nextE2 = findCentroidEdge(v);', // 6
    '    solveEdge(nextE1); solveEdge(nextE2); // 递归进入严格二叉子树', // 7
    '}', // 8
  ],
  cpp: [
    'void solveEdge(int eid) {', // 1
    '    if (!eid) return;', // 2
    '    visEdge[eid] = true;', // 3
    '    int u = edges[eid].u, v = edges[eid].v;', // 4
    '    calcPathsAcrossEdge(u, v, edges[eid].w);', // 5
    '    int nextE1 = findCentroidEdge(u), nextE2 = findCentroidEdge(v);', // 6
    '    solveEdge(nextE1); solveEdge(nextE2);', // 7
    '}', // 8
  ],
  python: [
    'def solve_edge(self, eid: int):', // 1
    '    if eid == 0: return', // 2
    '    self.vis_edge[eid] = True # 标记割断重心边', // 3
    '    u, v, w = self.edges[eid].u, self.edges[eid].v, self.edges[eid].w', // 4
    '    self.calc_paths_across_edge(u, v, w)', // 5
    '    e1 = self.find_centroid_edge(u); e2 = self.find_centroid_edge(v)', // 6
    '    self.solve_edge(e1); self.solve_edge(e2) # 严格二叉分治', // 7
  ],
  javascript: [
    'function solveEdge(eid) {', // 1
    '    if (eid === 0) return;', // 2
    '    visEdge[eid] = true;', // 3
    '    const { u, v, w } = edges[eid];', // 4
    '    calcPathsAcrossEdge(u, v, w);', // 5
    '    const nextE1 = findCentroidEdge(u), nextE2 = findCentroidEdge(v);', // 6
    '    solveEdge(nextE1); solveEdge(nextE2);', // 7
    '}', // 8
  ],
};

export const EDGE_DECOMPOSITION_LINES: Record<string, CodeMapping> = {
  entry:        { java: 1, cpp: 1, python: 1, javascript: 1 },
  cutEdge:      { java: 3, cpp: 3, python: 3, javascript: 3 },
  calcCross:    { java: 5, cpp: 5, python: 5, javascript: 5 },
  recurseSub:   { java: 7, cpp: 7, python: 7, javascript: 7 },
};

// ==========================================
// 3. Class 187: 欧拉路径与欧拉回路
// ==========================================
export const EULERIAN_PATH_CODES: Record<string, string[]> = {
  java: [
    'public void dfsHierholzer(int u) { // Hierholzer 圈套圈求欧拉路径', // 1
    '    for (int i = head[u]; i != -1; i = head[u]) {', // 2
    '        head[u] = nextEdge[i]; // 当前弧优化瞬时删边', // 3
    '        int v = toNode[i];', // 4
    '        dfsHierholzer(v); // 递归遍历出边', // 5
    '    }', // 6
    '    pathStack.push(u); // 归途入栈逆序输出', // 7
    '}', // 8
  ],
  cpp: [
    'void dfsHierholzer(int u) {', // 1
    '    for (int& i = head[u]; i != -1; ) {', // 2
    '        int cur = i; i = nextEdge[cur];', // 3
    '        int v = toNode[cur];', // 4
    '        dfsHierholzer(v);', // 5
    '    }', // 6
    '    pathStack.push(u);', // 7
    '}', // 8
  ],
  python: [
    'def dfs_hierholzer(self, u: int):', // 1
    '    while self.head[u]:', // 2
    '        v = self.head[u].pop() # 弹出出边防二次扫描', // 3
    '        self.dfs_hierholzer(v)', // 4
    '    self.path_stack.append(u) # 递归归途压栈', // 5
  ],
  javascript: [
    'function dfsHierholzer(u) {', // 1
    '    while (head[u].length > 0) {', // 2
    '        const v = head[u].pop();', // 3
    '        dfsHierholzer(v);', // 4
    '    }', // 5
    '    pathStack.push(u);', // 6
    '}', // 7
  ],
};

export const EULERIAN_PATH_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  loopEdge:  { java: 2, cpp: 2, python: 2, javascript: 2 },
  curArcDel: { java: 3, cpp: 3, python: 3, javascript: 3 },
  recurseDFS:{ java: 5, cpp: 5, python: 4, javascript: 4 },
  pushStack: { java: 7, cpp: 7, python: 5, javascript: 6 },
};

// ==========================================
// 4. Class 188: 强连通分量与 Tarjan 缩点
// ==========================================
export const TARJAN_SCC_CODES: Record<string, string[]> = {
  java: [
    'public void tarjan(int u) { // Tarjan 求解强连通分量', // 1
    '    dfn[u] = low[u] = ++timer;', // 2
    '    stack.push(u); inStack[u] = true;', // 3
    '    for (int v : adj[u]) {', // 4
    '        if (dfn[v] == 0) { tarjan(v); low[u] = Math.min(low[u], low[v]); }', // 5
    '        else if (inStack[v]) { low[u] = Math.min(low[u], dfn[v]); } // 返祖边', // 6
    '    }', // 7
    '    if (dfn[u] == low[u]) { // 发现极大强连通分量根', // 8
    '        sccCount++; int v;', // 9
    '        do { v = stack.pop(); inStack[v] = false; sccId[v] = sccCount; } while (u != v);', // 10
    '    }', // 11
    '}', // 12
  ],
  cpp: [
    'void tarjan(int u) {', // 1
    '    dfn[u] = low[u] = ++timer;', // 2
    '    st.push(u); inStack[u] = true;', // 3
    '    for (int v : adj[u]) {', // 4
    '        if (!dfn[v]) { tarjan(v); low[u] = min(low[u], low[v]); }', // 5
    '        else if (inStack[v]) low[u] = min(low[u], dfn[v]);', // 6
    '    }', // 7
    '    if (dfn[u] == low[u]) {', // 8
    '        sccCount++; int v;', // 9
    '        do { v = st.top(); st.pop(); inStack[v] = false; sccId[v] = sccCount; } while (u != v);', // 10
    '    }', // 11
    '}', // 12
  ],
  python: [
    'def tarjan(self, u: int):', // 1
    '    self.timer += 1; self.dfn[u] = self.low[u] = self.timer', // 2
    '    self.stack.append(u); self.in_stack[u] = True', // 3
    '    for v in self.adj[u]:', // 4
    '        if self.dfn[v] == 0: self.tarjan(v); self.low[u] = min(self.low[u], self.low[v])', // 5
    '        elif self.in_stack[v]: self.low[u] = min(self.low[u], self.dfn[v])', // 6
    '    if self.dfn[u] == self.low[u]: # 发现 SCC 根', // 7
    '        self.scc_count += 1', // 8
    '        while True: v = self.stack.pop(); self.in_stack[v] = False; self.scc_id[v] = self.scc_count; if u == v: break', // 9
  ],
  javascript: [
    'function tarjan(u) {', // 1
    '    dfn[u] = low[u] = ++timer;', // 2
    '    stack.push(u); inStack[u] = true;', // 3
    '    for (const v of adj[u]) {', // 4
    '        if (dfn[v] === 0) { tarjan(v); low[u] = Math.min(low[u], low[v]); }', // 5
    '        else if (inStack[v]) { low[u] = Math.min(low[u], dfn[v]); }', // 6
    '    }', // 7
    '    if (dfn[u] === low[u]) {', // 8
    '        sccCount++; let v;', // 9
    '        do { v = stack.pop(); inStack[v] = false; sccId[v] = sccCount; } while (u !== v);', // 10
    '    }', // 11
    '}', // 12
  ],
};

export const TARJAN_SCC_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  initDFN:   { java: 2, cpp: 2, python: 2, javascript: 2 },
  exploreDFS:{ java: 5, cpp: 5, python: 5, javascript: 5 },
  backEdge:  { java: 6, cpp: 6, python: 6, javascript: 6 },
  popSCC:    { java: 10, cpp: 10, python: 9, javascript: 10 },
};

// ==========================================
// 5. Class 189: 割边与边双连通分量 e-BCC
// ==========================================
export const EDGE_BCC_CODES: Record<string, string[]> = {
  java: [
    'public void tarjanBridge(int u, int inEdge) { // 割边 (桥) 判定', // 1
    '    dfn[u] = low[u] = ++timer;', // 2
    '    for (int e : head[u]) {', // 3
    '        int v = to[e];', // 4
    '        if (dfn[v] == 0) {', // 5
    '            tarjanBridge(v, e); low[u] = Math.min(low[u], low[v]);', // 6
    '            if (low[v] > dfn[u]) isBridge[e] = isBridge[e ^ 1] = true; // 发现割边', // 7
    '        } else if (e != (inEdge ^ 1)) {', // 8
    '            low[u] = Math.min(low[u], dfn[v]); // 忽略反向父边', // 9
    '        }', // 10
    '    }', // 11
    '}', // 12
  ],
  cpp: [
    'void tarjanBridge(int u, int inEdge) {', // 1
    '    dfn[u] = low[u] = ++timer;', // 2
    '    for (int e : head[u]) {', // 3
    '        int v = to[e];', // 4
    '        if (!dfn[v]) {', // 5
    '            tarjanBridge(v, e); low[u] = min(low[u], low[v]);', // 6
    '            if (low[v] > dfn[u]) isBridge[e] = isBridge[e ^ 1] = true;', // 7
    '        } else if (e != (inEdge ^ 1)) {', // 8
    '            low[u] = min(low[u], dfn[v]);', // 9
    '        }', // 10
    '    }', // 11
    '}', // 12
  ],
  python: [
    'def tarjan_bridge(self, u: int, in_edge: int):', // 1
    '    self.timer += 1; self.dfn[u] = self.low[u] = self.timer', // 2
    '    for e in self.head[u]:', // 3
    '        v = self.to[e]', // 4
    '        if self.dfn[v] == 0:', // 5
    '            self.tarjan_bridge(v, e); self.low[u] = min(self.low[u], self.low[v])', // 6
    '            if self.low[v] > self.dfn[u]: self.is_bridge[e] = self.is_bridge[e ^ 1] = True # 桥', // 7
    '        elif e != (in_edge ^ 1): self.low[u] = min(self.low[u], self.dfn[v])', // 8
  ],
  javascript: [
    'function tarjanBridge(u, inEdge) {', // 1
    '    dfn[u] = low[u] = ++timer;', // 2
    '    for (const e of head[u]) {', // 3
    '        const v = to[e];', // 4
    '        if (dfn[v] === 0) {', // 5
    '            tarjanBridge(v, e); low[u] = Math.min(low[u], low[v]);', // 6
    '            if (low[v] > dfn[u]) isBridge[e] = isBridge[e ^ 1] = true;', // 7
    '        } else if (e !== (inEdge ^ 1)) {', // 8
    '            low[u] = Math.min(low[u], dfn[v]);', // 9
    '        }', // 10
    '    }', // 11
    '}', // 12
  ],
};

export const EDGE_BCC_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  initDFN:   { java: 2, cpp: 2, python: 2, javascript: 2 },
  exploreDFS:{ java: 6, cpp: 6, python: 6, javascript: 6 },
  bridgeHit: { java: 7, cpp: 7, python: 7, javascript: 7 },
  backEdge:  { java: 9, cpp: 9, python: 8, javascript: 9 },
};

// ==========================================
// 6. Class 190: 割点与点双连通分量 v-BCC
// ==========================================
export const VERTEX_BCC_CODES: Record<string, string[]> = {
  java: [
    'public void tarjanCutVertex(int u, int root) { // 割点与点双连通分量', // 1
    '    dfn[u] = low[u] = ++timer; int child = 0;', // 2
    '    stack.push(u);', // 3
    '    for (int v : adj[u]) {', // 4
    '        if (dfn[v] == 0) {', // 5
    '            child++; tarjanCutVertex(v, root); low[u] = Math.min(low[u], low[v]);', // 6
    '            if (low[v] >= dfn[u]) { // 发现割点 u', // 7
    '                if (u != root || child > 1) isCut[u] = true;', // 8
    '                popVBCC(u, v); // 弹出点双分量', // 9
    '            }', // 10
    '        } else { low[u] = Math.min(low[u], dfn[v]); }', // 11
    '    }', // 12
    '}', // 13
  ],
  cpp: [
    'void tarjanCutVertex(int u, int root) {', // 1
    '    dfn[u] = low[u] = ++timer; int child = 0;', // 2
    '    st.push(u);', // 3
    '    for (int v : adj[u]) {', // 4
    '        if (!dfn[v]) {', // 5
    '            child++; tarjanCutVertex(v, root); low[u] = min(low[u], low[v]);', // 6
    '            if (low[v] >= dfn[u]) {', // 7
    '                if (u != root || child > 1) isCut[u] = true;', // 8
    '                popVBCC(u, v);', // 9
    '            }', // 10
    '        } else low[u] = min(low[u], dfn[v]);', // 11
    '    }', // 12
    '}', // 13
  ],
  python: [
    'def tarjan_cut_vertex(self, u: int, root: int):', // 1
    '    self.timer += 1; self.dfn[u] = self.low[u] = self.timer; child = 0', // 2
    '    self.stack.append(u)', // 3
    '    for v in self.adj[u]:', // 4
    '        if self.dfn[v] == 0:', // 5
    '            child += 1; self.tarjan_cut_vertex(v, root); self.low[u] = min(self.low[u], self.low[v])', // 6
    '            if self.low[v] >= self.dfn[u]:', // 7
    '                if u != root or child > 1: self.is_cut[u] = True', // 8
    '                self.pop_vbcc(u, v) # 弹出点双', // 9
    '        else: self.low[u] = min(self.low[u], self.dfn[v])', // 10
  ],
  javascript: [
    'function tarjanCutVertex(u, root) {', // 1
    '    dfn[u] = low[u] = ++timer; let child = 0;', // 2
    '    stack.push(u);', // 3
    '    for (const v of adj[u]) {', // 4
    '        if (dfn[v] === 0) {', // 5
    '            child++; tarjanCutVertex(v, root); low[u] = Math.min(low[u], low[v]);', // 6
    '            if (low[v] >= dfn[u]) {', // 7
    '                if (u !== root || child > 1) isCut[u] = true;', // 8
    '                popVBCC(u, v);', // 9
    '            }', // 10
    '        } else { low[u] = Math.min(low[u], dfn[v]); }', // 11
    '    }', // 12
    '}', // 13
  ],
};

export const VERTEX_BCC_LINES: Record<string, CodeMapping> = {
  entry:     { java: 1, cpp: 1, python: 1, javascript: 1 },
  initDFN:   { java: 2, cpp: 2, python: 2, javascript: 2 },
  exploreDFS:{ java: 6, cpp: 6, python: 6, javascript: 6 },
  cutHit:    { java: 8, cpp: 8, python: 8, javascript: 8 },
  popVBCC:   { java: 9, cpp: 9, python: 9, javascript: 9 },
};
