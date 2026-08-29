/**
 * 力扣 1971. 寻找图中是否存在有效路径 (Find if Path Exists in Graph)
 * 题目解析、算法精讲与四语言源码
 */

export const FIND_ROUTE_PROBLEM_HTML = `
<div style="line-height: 1.7; font-size: 13.5px; color: #cbd5e1;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
    <span style="font-weight: 800; font-size: 16px; color: #f8fafc;">1971. 寻找图中是否存在有效路径</span>
    <span style="background: #065f46; color: #6ee7b7; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">简单 / Easy</span>
  </div>

  <p>有一个具有 <code>n</code> 个顶点的 <strong>无向图</strong> ，顶点编号为从 <code>0</code> 到 <code>n - 1</code>（包含 <code>0</code> 和 <code>n - 1</code>）。图中的边用一个二维整数数组 <code>edges</code> 表示，其中每个 <code>edges[i] = [u_i, v_i]</code> 表示顶点 <code>u_i</code> 和顶点 <code>v_i</code> 之间有一条双向边。</p>
  <p>给你一个整数 <code>n</code> 和边数组 <code>edges</code> ，以及两个顶点 <code>source</code> 和 <code>destination</code> ，如果从 <code>source</code> 到 <code>destination</code> 存在 <strong>有效路径</strong> ，则返回 <code>true</code> ，否则返回 <code>false</code> 。</p>

  <h4 style="color: #38bdf8; margin-top: 16px; margin-bottom: 8px;">示例 1：</h4>
  <pre style="background: #1e293b; padding: 10px; border-radius: 8px; font-size: 12px; color: #e2e8f0;"><strong>输入:</strong> n = 6, edges = [[0,1],[0,2],[3,5],[5,4],[4,3]], source = 0, destination = 5
<strong>输出:</strong> false
<strong>解释:</strong> 0 和 5 分属不同的连通分量，不存在路径。</pre>
</div>
`;

export const FIND_ROUTE_ANALYSIS_HTML = `
<div style="line-height: 1.7; font-size: 13.5px; color: #cbd5e1;">
  <h3 style="color: #38bdf8; margin-top: 0;">💡 核心思路：BFS / DFS 连通性遍历与路径回溯</h3>
  <p>判断两点之间是否存在路径是图论中最基础的连通性问题：</p>

  <h4 style="color: #67e8f9; margin-top: 12px;">算法流程：</h4>
  <ol style="padding-left: 20px;">
    <li><strong>构建邻接表：</strong>将边列表 <code>edges</code> 转换为双向邻接表 <code>adjList</code>。</li>
    <li><strong>广度优先遍历 (BFS)：</strong>
      <ul>
        <li>维护队列 <code>queue</code> 与访问标记集 <code>visited</code>。</li>
        <li>从 <code>source</code> 出发入队，层层向外扩展未访问过的相邻节点。</li>
        <li>使用 <code>parentMap</code> 记录前驱节点，以便在找到目标时重构完整路径。</li>
        <li>一旦访问到 <code>destination</code>，立即返回 <code>true</code> 并输出重构路径。</li>
      </ul>
    </li>
    <li><strong>若队列为空仍未到达：</strong>说明 <code>source</code> 与 <code>destination</code> 不属于同一连通分量，返回 <code>false</code>。</li>
  </ol>

  <h4 style="color: #67e8f9; margin-top: 12px;">复杂度分析</h4>
  <ul style="padding-left: 20px;">
    <li><strong>时间复杂度：</strong><code>O(V + E)</code>，每个节点与每条边最多被访问一次。</li>
    <li><strong>空间复杂度：</strong><code>O(V + E)</code>，邻接表与队列占用的内存空间。</li>
  </ul>
</div>
`;

export const FIND_ROUTE_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'class Solution {',
    '    public boolean validPath(int n, int[][] edges, int source, int destination) {',
    '        if (source == destination) return true;',
    '        List<Integer>[] adj = new ArrayList[n];',
    '        for (int i = 0; i < n; i++) adj[i] = new ArrayList<>();',
    '        for (int[] e : edges) {',
    '            adj[e[0]].add(e[1]);',
    '            adj[e[1]].add(e[0]);',
    '        }',
    '        boolean[] visited = new boolean[n];',
    '        Queue<Integer> queue = new LinkedList<>();',
    '        queue.offer(source);',
    '        visited[source] = true;',
    '        while (!queue.isEmpty()) {',
    '            int u = queue.poll();',
    '            if (u == destination) return true;',
    '            for (int v : adj[u]) {',
    '                if (!visited[v]) {',
    '                    visited[v] = true;',
    '                    queue.offer(v);',
    '                }',
    '            }',
    '        }',
    '        return false;',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    bool validPath(int n, vector<vector<int>>& edges, int source, int destination) {',
    '        if (source == destination) return true;',
    '        vector<vector<int>> adj(n);',
    '        for (const auto& e : edges) {',
    '            adj[e[0]].push_back(e[1]);',
    '            adj[e[1]].push_back(e[0]);',
    '        }',
    '        vector<bool> visited(n, false);',
    '        queue<int> q;',
    '        q.push(source);',
    '        visited[source] = true;',
    '        while (!q.empty()) {',
    '            int u = q.front(); q.pop();',
    '            if (u == destination) return true;',
    '            for (int v : adj[u]) {',
    '                if (!visited[v]) {',
    '                    visited[v] = true;',
    '                    q.push(v);',
    '                }',
    '            }',
    '        }',
    '        return false;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def validPath(self, n: int, edges: List[List[int]], source: int, destination: int) -> bool:',
    '        if source == destination:',
    '            return True',
    '        adj = collections.defaultdict(list)',
    '        for u, v in edges:',
    '            adj[u].append(v)',
    '            adj[v].append(u)',
    '        visited = {source}',
    '        queue = collections.deque([source])',
    '        while queue:',
    '            u = queue.popleft()',
    '            if u == destination:',
    '                return True',
    '            for v in adj[u]:',
    '                if v not in visited:',
    '                    visited.add(v)',
    '                    queue.append(v)',
    '        return False',
  ],
  javascript: [
    'var validPath = function(n, edges, source, destination) {',
    '    if (source === destination) return true;',
    '    const adj = Array.from({length: n}, () => []);',
    '    for (const [u, v] of edges) {',
    '        adj[u].push(v);',
    '        adj[v].push(u);',
    '    }',
    '    const visited = new Array(n).fill(false);',
    '    const queue = [source];',
    '    visited[source] = true;',
    '    while (queue.length > 0) {',
    '        const u = queue.shift();',
    '        if (u === destination) return true;',
    '        for (const v of adj[u]) {',
    '            if (!visited[v]) {',
    '                visited[v] = true;',
    '                queue.push(v);',
    '            }',
    '        }',
    '    }',
    '    return false;',
    '};',
  ],
};
