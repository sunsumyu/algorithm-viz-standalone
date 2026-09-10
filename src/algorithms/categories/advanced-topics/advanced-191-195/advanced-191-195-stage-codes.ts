/**
 * 左神算法通关课 191 ~ 195 边双缩点添边、虚点优化建图、前缀优化建图、2-SAT基础与2-SAT进阶 多语言代码与 1-based 行号映射
 */

export interface CodeMapping {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

// ==========================================
// 1. Class 191: 边双缩点与加边构造
// ==========================================
export const EBCC_CONSTRUCTION_CODES: Record<string, string[]> = {
  java: [
    'public int minEdgesTo2EdgeConnected(int n, List<Edge> edges) {', // 1
    '    tarjanEBCC(); // Tarjan 缩点求所有边双分量', // 2
    '    int[] degree = new int[bccCount + 1];', // 3
    '    for (Edge e : bridges) { // 遍历所有割边', // 4
    '        degree[bccId[e.u]]++; degree[bccId[e.v]]++;', // 5
    '    }', // 6
    '    int leafCount = 0;', // 7
    '    for (int i = 1; i <= bccCount; i++) {', // 8
    '        if (degree[i] == 1) leafCount++; // 统计缩点树叶子节点', // 9
    '    }', // 10
    '    return (leafCount + 1) / 2; // 答案为 ceil(leaf / 2)', // 11
    '}', // 12
  ],
  cpp: [
    'int minEdgesTo2EdgeConnected(int n, const vector<Edge>& edges) {', // 1
    '    tarjanEBCC();', // 2
    '    vector<int> degree(bccCount + 1, 0);', // 3
    '    for (const auto& e : bridges) {', // 4
    '        degree[bccId[e.u]]++; degree[bccId[e.v]]++;', // 5
    '    }', // 6
    '    int leafCount = 0;', // 7
    '    for (int i = 1; i <= bccCount; i++) {', // 8
    '        if (degree[i] == 1) leafCount++;', // 9
    '    }', // 10
    '    return (leafCount + 1) / 2;', // 11
    '}', // 12
  ],
  python: [
    'def min_edges_to_2edge_connected(self) -> int:', // 1
    '    self.tarjan_ebcc() # Tarjan 缩点', // 2
    '    degree = [0] * (self.bcc_count + 1)', // 3
    '    for u, v in self.bridges: # 遍历割边', // 4
    '        degree[self.bcc_id[u]] += 1; degree[self.bcc_id[v]] += 1', // 5
    '    leaf_count = sum(1 for i in range(1, self.bcc_count + 1) if degree[i] == 1)', // 6
    '    return (leaf_count + 1) // 2 # ceil(leaf / 2)', // 7
  ],
  javascript: [
    'function minEdgesTo2EdgeConnected(n, edges) {', // 1
    '    tarjanEBCC();', // 2
    '    const degree = new Array(bccCount + 1).fill(0);', // 3
    '    for (const e of bridges) {', // 4
    '        degree[bccId[e.u]]++; degree[bccId[e.v]]++;', // 5
    '    }', // 6
    '    let leafCount = 0;', // 7
    '    for (let i = 1; i <= bccCount; i++) {', // 8
    '        if (degree[i] === 1) leafCount++;', // 9
    '    }', // 10
    '    return Math.floor((leafCount + 1) / 2);', // 11
    '}', // 12
  ],
};

export const EBCC_CONSTRUCTION_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  tarjanEBCC:  { java: 2, cpp: 2, python: 2, javascript: 2 },
  countDegree: { java: 5, cpp: 5, python: 5, javascript: 5 },
  calcLeaves:  { java: 9, cpp: 9, python: 6, javascript: 9 },
  returnAns:   { java: 11, cpp: 11, python: 7, javascript: 11 },
};

// ==========================================
// 2. Class 192: 虚点优化建图与虚拟源汇
// ==========================================
export const VIRTUAL_NODES_CODES: Record<string, string[]> = {
  java: [
    'public void addSetToSetEdges(List<Integer> setA, List<Integer> setB, int w) {', // 1
    '    int vMid = ++totalNodes; // 新建虚拟中转点', // 2
    '    for (int u : setA) {', // 3
    '        adj[u].add(new Edge(vMid, 0)); // A 中所有点向虚点连 0 权边', // 4
    '    }', // 5
    '    for (int v : setB) {', // 6
    '        adj[vMid].add(new Edge(v, w)); // 虚点向 B 中所有点连 w 权边', // 7
    '    }', // 8
    '    // 边数由 |A|*|B| 锐减为 |A|+|B|', // 9
    '}', // 10
  ],
  cpp: [
    'void addSetToSetEdges(const vector<int>& setA, const vector<int>& setB, int w) {', // 1
    '    int vMid = ++totalNodes;', // 2
    '    for (int u : setA) adj[u].push_back({vMid, 0});', // 3
    '    for (int v : setB) adj[vMid].push_back({v, w});', // 4
    '}', // 5
  ],
  python: [
    'def add_set_to_set_edges(self, set_a: list, set_b: list, w: int):', // 1
    '    self.total_nodes += 1; v_mid = self.total_nodes # 虚拟节点', // 2
    '    for u in set_a: self.adj[u].append((v_mid, 0)) # A -> vMid', // 3
    '    for v in set_b: self.adj[v_mid].append((v, w)) # vMid -> B', // 4
  ],
  javascript: [
    'function addSetToSetEdges(setA, setB, w) {', // 1
    '    const vMid = ++totalNodes;', // 2
    '    for (const u of setA) adj[u].push({ to: vMid, w: 0 });', // 3
    '    for (const v of setB) adj[vMid].push({ to: v, w });', // 4
    '}', // 5
  ],
};

export const VIRTUAL_NODES_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  createVMid:  { java: 2, cpp: 2, python: 2, javascript: 2 },
  connectA:    { java: 4, cpp: 3, python: 3, javascript: 3 },
  connectB:    { java: 7, cpp: 4, python: 4, javascript: 4 },
};

// ==========================================
// 3. Class 193: 前缀与后缀优化建图
// ==========================================
export const PREFIX_SUFFIX_GRAPH_CODES: Record<string, string[]> = {
  java: [
    'public void buildPrefixChain(int n) { // 前缀优化互斥约束', // 1
    '    for (int i = 1; i <= n; i++) {', // 2
    '        prefixNode[i] = ++totalNodes; // 为前缀 [1..i] 建立虚点', // 3
    '        adj[originalNode[i]].add(prefixNode[i]); // 自身入选推导前缀入选', // 4
    '        if (i > 1) adj[prefixNode[i - 1]].add(prefixNode[i]); // 前缀传递边', // 5
    '    }', // 6
    '}', // 7
  ],
  cpp: [
    'void buildPrefixChain(int n) {', // 1
    '    for (int i = 1; i <= n; i++) {', // 2
    '        prefixNode[i] = ++totalNodes;', // 3
    '        adj[originalNode[i]].push_back(prefixNode[i]);', // 4
    '        if (i > 1) adj[prefixNode[i - 1]].push_back(prefixNode[i]);', // 5
    '    }', // 6
    '}', // 7
  ],
  python: [
    'def build_prefix_chain(self, n: int):', // 1
    '    for i in range(1, n + 1):', // 2
    '        self.total_nodes += 1; self.prefix_node[i] = self.total_nodes', // 3
    '        self.adj[self.original_node[i]].append(self.prefix_node[i])', // 4
    '        if i > 1: self.adj[self.prefix_node[i - 1]].append(self.prefix_node[i]) # 传递', // 5
  ],
  javascript: [
    'function buildPrefixChain(n) {', // 1
    '    for (let i = 1; i <= n; i++) {', // 2
    '        prefixNode[i] = ++totalNodes;', // 3
    '        adj[originalNode[i]].push(prefixNode[i]);', // 4
    '        if (i > 1) adj[prefixNode[i - 1]].push(prefixNode[i]);', // 5
    '    }', // 6
    '}', // 7
  ],
};

export const PREFIX_SUFFIX_GRAPH_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  createPrefix:{ java: 3, cpp: 3, python: 3, javascript: 3 },
  linkOrigin:  { java: 4, cpp: 4, python: 4, javascript: 4 },
  chainPass:   { java: 5, cpp: 5, python: 5, javascript: 5 },
};

// ==========================================
// 4. Class 194: 2-SAT 算法基础
// ==========================================
export const TWO_SAT_ALGORITHM_CODES: Record<string, string[]> = {
  java: [
    'public boolean solve2SAT(int n) { // 2-SAT 对称蕴含图求解', // 1
    '    for (Clause c : clauses) { // A or B 等价于 ~A -> B 且 ~B -> A', // 2
    '        adj[c.u ^ 1].add(c.v); adj[c.v ^ 1].add(c.u);', // 3
    '    }', // 4
    '    tarjanSCC(); // 求强连通分量', // 5
    '    for (int i = 0; i < n; i++) {', // 6
    '        if (sccId[2 * i] == sccId[2 * i + 1]) return false; // 同一变量真假矛盾', // 7
    '        assignment[i] = sccId[2 * i] < sccId[2 * i + 1]; // 拓扑序较大者为真', // 8
    '    }', // 9
    '    return true;', // 10
    '}', // 11
  ],
  cpp: [
    'bool solve2SAT(int n) {', // 1
    '    for (const auto& c : clauses) {', // 2
    '        adj[c.u ^ 1].push_back(c.v); adj[c.v ^ 1].push_back(c.u);', // 3
    '    }', // 4
    '    tarjanSCC();', // 5
    '    for (int i = 0; i < n; i++) {', // 6
    '        if (sccId[2 * i] == sccId[2 * i + 1]) return false;', // 7
    '        assignment[i] = sccId[2 * i] < sccId[2 * i + 1];', // 8
    '    }', // 9
    '    return true;', // 10
    '}', // 11
  ],
  python: [
    'def solve_2sat(self, n: int) -> bool:', // 1
    '    for u, v in self.clauses: # 对称蕴含边', // 2
    '        self.adj[u ^ 1].append(v); self.adj[v ^ 1].append(u)', // 3
    '    self.tarjan_scc()', // 4
    '    for i in range(n):', // 5
    '        if self.scc_id[2 * i] == self.scc_id[2 * i + 1]: return False # 矛盾', // 6
    '        self.assignment[i] = self.scc_id[2 * i] < self.scc_id[2 * i + 1]', // 7
    '    return True', // 8
  ],
  javascript: [
    'function solve2SAT(n) {', // 1
    '    for (const c of clauses) {', // 2
    '        adj[c.u ^ 1].push(c.v); adj[c.v ^ 1].push(c.u);', // 3
    '    }', // 4
    '    tarjanSCC();', // 5
    '    for (let i = 0; i < n; i++) {', // 6
    '        if (sccId[2 * i] === sccId[2 * i + 1]) return false;', // 7
    '        assignment[i] = sccId[2 * i] < sccId[2 * i + 1];', // 8
    '    }', // 9
    '    return true;', // 10
    '}', // 11
  ],
};

export const TWO_SAT_ALGORITHM_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  addClauses:  { java: 3, cpp: 3, python: 3, javascript: 3 },
  tarjanRun:   { java: 5, cpp: 5, python: 4, javascript: 5 },
  conflictCheck:{ java: 7, cpp: 7, python: 6, javascript: 7 },
  assignTrue:  { java: 8, cpp: 8, python: 7, javascript: 8 },
};

// ==========================================
// 5. Class 195: 2-SAT 进阶应用与方案构造
// ==========================================
export const TWO_SAT_ADVANCED_CODES: Record<string, string[]> = {
  java: [
    'public void atMostOneConstraint(List<Integer> vars) { // 一组至多选一个前缀优化', // 1
    '    int k = vars.size();', // 2
    '    int[] pre = new int[k];', // 3
    '    for (int i = 0; i < k; i++) pre[i] = ++totalVars; // 建立前缀虚变量', // 4
    '    for (int i = 0; i < k; i++) {', // 5
    '        addImplication(vars.get(i), pre[i]); // x_i -> pre_i', // 6
    '        if (i > 0) {', // 7
    '            addImplication(pre[i - 1], pre[i]); // pre_{i-1} -> pre_i', // 8
    '            addImplication(vars.get(i), pre[i - 1] ^ 1); // x_i -> ~pre_{i-1} (互斥)', // 9
    '        }', // 10
    '    }', // 11
    '}', // 12
  ],
  cpp: [
    'void atMostOneConstraint(const vector<int>& vars) {', // 1
    '    int k = vars.size(); vector<int> pre(k);', // 2
    '    for (int i = 0; i < k; i++) pre[i] = ++totalVars;', // 3
    '    for (int i = 0; i < k; i++) {', // 4
    '        addImplication(vars[i], pre[i]);', // 5
    '        if (i > 0) {', // 6
    '            addImplication(pre[i - 1], pre[i]);', // 7
    '            addImplication(vars[i], pre[i - 1] ^ 1);', // 8
    '        }', // 9
    '    }', // 10
    '}', // 11
  ],
  python: [
    'def at_most_one_constraint(self, vars: list):', // 1
    '    k = len(vars); pre = [0] * k', // 2
    '    for i in range(k): self.total_vars += 1; pre[i] = self.total_vars', // 3
    '    for i in range(k):', // 4
    '        self.add_implication(vars[i], pre[i]) # x_i -> pre_i', // 5
    '        if i > 0:', // 6
    '            self.add_implication(pre[i - 1], pre[i]) # 传递', // 7
    '            self.add_implication(vars[i], pre[i - 1] ^ 1) # 互斥', // 8
  ],
  javascript: [
    'function atMostOneConstraint(vars) {', // 1
    '    const k = vars.length;', // 2
    '    const pre = new Array(k);', // 3
    '    for (let i = 0; i < k; i++) pre[i] = ++totalVars;', // 4
    '    for (let i = 0; i < k; i++) {', // 5
    '        addImplication(vars[i], pre[i]);', // 6
    '        if (i > 0) {', // 7
    '            addImplication(pre[i - 1], pre[i]);', // 8
    '            addImplication(vars[i], pre[i - 1] ^ 1);', // 9
    '        }', // 10
    '    }', // 11
    '}', // 12
  ],
};

export const TWO_SAT_ADVANCED_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  initPre:     { java: 4, cpp: 3, python: 3, javascript: 4 },
  implyPre:    { java: 6, cpp: 5, python: 5, javascript: 6 },
  chainPre:    { java: 8, cpp: 7, python: 7, javascript: 8 },
  mutexImply:  { java: 9, cpp: 8, python: 8, javascript: 9 },
};
