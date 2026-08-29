/**
 * 强连通性检测 (Strongly Connected Component / Kosaraju / Tarjan)
 * 题目解析、算法精讲与四语言源码
 */

export const STRONGLY_CONNECTED_PROBLEM_HTML = `
<div style="line-height: 1.7; font-size: 13.5px; color: #cbd5e1;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
    <span style="font-weight: 800; font-size: 16px; color: #f8fafc;">有向图强连通性检测 (Strongly Connected)</span>
    <span style="background: #854d0e; color: #fde047; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">中等 / Medium</span>
  </div>

  <p>给定一个包含 <code>V</code> 个顶点和 <code>E</code> 条边的 <strong>有向图</strong>。</p>
  <p>如果对于图中的 <strong>任意两个顶点 <code>u</code> 和 <code>v</code></strong>，都存在一条从 <code>u</code> 到 <code>v</code> 的有向路径，并且也存在一条从 <code>v</code> 到 <code>u</code> 的有向路径，则称该有向图是 <strong>强连通的 (Strongly Connected)</strong>。</p>
  <p>判断给定的有向图是否为强连通图。</p>

  <h4 style="color: #38bdf8; margin-top: 16px; margin-bottom: 8px;">示例 1：</h4>
  <pre style="background: #1e293b; padding: 10px; border-radius: 8px; font-size: 12px; color: #e2e8f0;"><strong>输入:</strong> V = 4, edges = [[0,1],[1,2],[2,3],[3,0]]
<strong>输出:</strong> true
<strong>解释:</strong> 所有 4 个节点形成一个完整的强连通环路，任意两点双向互通。</pre>
</div>
`;

export const STRONGLY_CONNECTED_ANALYSIS_HTML = `
<div style="line-height: 1.7; font-size: 13.5px; color: #cbd5e1;">
  <h3 style="color: #38bdf8; margin-top: 0;">💡 核心思路：Kosaraju / 全源可达性判定</h3>
  <p>判断整个有向图是否强连通有两种标准思路：</p>

  <h4 style="color: #67e8f9; margin-top: 12px;">算法流程 (Kosaraju 双 DFS 思想)：</h4>
  <ol style="padding-left: 20px;">
    <li><strong>正向遍历：</strong>从顶点 <code>0</code> 出发做一次 DFS/BFS 遍历。如果存在任何未被访问到的顶点，则图不是强连通的（节点 0 无法到达某些点）。</li>
    <li><strong>反向遍历（构建反向图）：</strong>将所有边的方向反转 <code>(u -> v 变为 v -> u)</code>，再次从顶点 <code>0</code> 出发做 DFS/BFS 遍历。如果仍有未访问到的顶点，则说明某些点无法到达节点 0。</li>
    <li><strong>结论判定：</strong>若两次遍历均能访问到图中的所有顶点，则原图<strong>必为强连通图</strong>！</li>
  </ol>

  <h4 style="color: #67e8f9; margin-top: 12px;">复杂度分析</h4>
  <ul style="padding-left: 20px;">
    <li><strong>时间复杂度：</strong><code>O(V + E)</code>（Kosaraju 线性时间）。</li>
    <li><strong>空间复杂度：</strong><code>O(V + E)</code>，反向图及访问标记数组。</li>
  </ul>
</div>
`;

export const STRONGLY_CONNECTED_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'class Solution {',
    '    public boolean isStronglyConnected(int V, List<List<Integer>> adj) {',
    '        // 1. 正向 DFS 从节点 0 出发',
    '        boolean[] visited = new boolean[V];',
    '        dfs(0, adj, visited);',
    '        for (boolean b : visited) if (!b) return false;',
    '        // 2. 构建反向图',
    '        List<List<Integer>> revAdj = new ArrayList<>();',
    '        for (int i = 0; i < V; i++) revAdj.add(new ArrayList<>());',
    '        for (int u = 0; u < V; u++) {',
    '            for (int v : adj.get(u)) revAdj.get(v).add(u);',
    '        }',
    '        // 3. 反向 DFS 从节点 0 出发',
    '        Arrays.fill(visited, false);',
    '        dfs(0, revAdj, visited);',
    '        for (boolean b : visited) if (!b) return false;',
    '        return true;',
    '    }',
    '    private void dfs(int u, List<List<Integer>> adj, boolean[] visited) {',
    '        visited[u] = true;',
    '        for (int v : adj.get(u)) {',
    '            if (!visited[v]) dfs(v, adj, visited);',
    '        }',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    bool isStronglyConnected(int V, vector<vector<int>>& adj) {',
    '        vector<bool> visited(V, false);',
    '        dfs(0, adj, visited);',
    '        for (bool b : visited) if (!b) return false;',
    '        vector<vector<int>> revAdj(V);',
    '        for (int u = 0; u < V; ++u)',
    '            for (int v : adj[u]) revAdj[v].push_back(u);',
    '        fill(visited.begin(), visited.end(), false);',
    '        dfs(0, revAdj, visited);',
    '        for (bool b : visited) if (!b) return false;',
    '        return true;',
    '    }',
    'private:',
    '    void dfs(int u, const vector<vector<int>>& adj, vector<bool>& visited) {',
    '        visited[u] = true;',
    '        for (int v : adj[u])',
    '            if (!visited[v]) dfs(v, adj, visited);',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def isStronglyConnected(self, V: int, adj: List[List[int]]) -> bool:',
    '        def dfs(u, graph, visited):',
    '            visited.add(u)',
    '            for v in graph[u]:',
    '                if v not in visited:',
    '                    dfs(v, graph, visited)',
    '        # 正向遍历',
    '        vis = set()',
    '        dfs(0, adj, vis)',
    '        if len(vis) != V:',
    '            return False',
    '        # 反向遍历',
    '        rev_adj = collections.defaultdict(list)',
    '        for u in range(V):',
    '            for v in adj[u]:',
    '                rev_adj[v].append(u)',
    '        vis_rev = set()',
    '        dfs(0, rev_adj, vis_rev)',
    '        return len(vis_rev) == V',
  ],
  javascript: [
    'var isStronglyConnected = function(V, adj) {',
    '    const dfs = (u, graph, visited) => {',
    '        visited[u] = true;',
    '        for (const v of graph[u]) {',
    '            if (!visited[v]) dfs(v, graph, visited);',
    '        }',
    '    };',
    '    let visited = new Array(V).fill(false);',
    '    dfs(0, adj, visited);',
    '    if (visited.some(v => !v)) return false;',
    '    const revAdj = Array.from({length: V}, () => []);',
    '    for (let u = 0; u < V; u++) {',
    '        for (const v of adj[u]) revAdj[v].push(u);',
    '    }',
    '    visited = new Array(V).fill(false);',
    '    dfs(0, revAdj, visited);',
    '    return !visited.some(v => !v);',
    '};',
  ],
};
