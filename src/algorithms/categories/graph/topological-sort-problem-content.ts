/**
 * 拓扑排序 (Topological Sort · Kahn's Algorithm / LC 210)
 * 领域知识与题解精讲配置声明
 */

export const TOPOLOGICAL_SORT_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">DAG Theory</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">有向无环图拓扑排序 (Kahn's BFS Algorithm)</h2>
    </div>
    <p style="margin: 0;">给定一个有向无环图（DAG），将所有顶点排成一个线性序列，使得对于图中的任意一条有向边 <code style="color: #38bdf8; font-family: monospace;">(u, v)</code>，<code style="color: #38bdf8; font-family: monospace;">u</code> 在序列中都出现在 <code style="color: #fbbf24; font-family: monospace;">v</code> 的前面。常用于 <strong>课程表依赖求解、构建工具依赖编译与任务编排</strong>。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">Kahn 算法核心流程:</div>
      <div>1. 统计所有节点的入度 <code style="color: #38bdf8;">inDegree[v]</code>；</div>
      <div>2. 将所有入度为 0 的节点推入队列；</div>
      <div>3. 弹出队首加入拓扑序列，并将其所有出边的终点入度减 1；若减为 0 则加入队列。</div>
    </div>
  </div>
`;

export const TOPOLOGICAL_SORT_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 入度剥离与环路检测
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① Kahn 算法四步法</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>建图与度统计：</strong> 构造邻接表 <code style="color: #60a5fa; font-family: monospace;">adj</code>，并统计每个节点的入度 <code style="color: #60a5fa; font-family: monospace;">inDegree[i]</code>；<br/>
        2. <strong>初始化队列：</strong> 遍历所有节点，若 <code style="color: #34d399; font-family: monospace;">inDegree[i] == 0</code> 则入队；<br/>
        3. <strong>出队并更新邻居：</strong> 弹出队首 <code style="color: #fbbf24; font-family: monospace;">u</code> 记入结果序列，对于每条边 <code style="color: #38bdf8; font-family: monospace;">u -> v</code>，执行 <code style="color: #34d399; font-family: monospace;">--inDegree[v]</code>；若 <code style="color: #34d399; font-family: monospace;">inDegree[v] == 0</code> 则 <code style="color: #34d399; font-family: monospace;">queue.offer(v)</code>；<br/>
        4. <strong>环检测：</strong> 若最终拓扑序列长度小于顶点总数 <code style="color: #f87171; font-family: monospace;">N</code>，说明图中存在环（Cycle）。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #34d399; font-family: monospace;">O(V + E)</code>，每个顶点入队出队一次，每条边遍历一次。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(V + E)</code>（邻接表与入度数组）。
        </p>
      </div>
    </div>
  </div>
`;

export const TOPOLOGICAL_SORT_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public int[] findOrder(int numCourses, int[][] prerequisites) {',
    '        int[] inDegree = new int[numCourses];',
    '        List<Integer>[] adj = new ArrayList[numCourses];',
    '        for (int i = 0; i < numCourses; i++) adj[i] = new ArrayList<>();',
    '        for (int[] p : prerequisites) {',
    '            adj[p[1]].add(p[0]);',
    '            inDegree[p[0]]++;',
    '        }',
    '        Queue<Integer> queue = new LinkedList<>();',
    '        for (int i = 0; i < numCourses; i++) if (inDegree[i] == 0) queue.offer(i);',
    '        int[] order = new int[numCourses];',
    '        int idx = 0;',
    '        while (!queue.isEmpty()) {',
    '            int cur = queue.poll();',
    '            order[idx++] = cur;',
    '            for (int next : adj[cur]) {',
    '                if (--inDegree[next] == 0) queue.offer(next);',
    '            }',
    '        }',
    '        return idx == numCourses ? order : new int[0];',
    '    }',
    '}',
  ],
  cpp: [
    'vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {',
    '    vector<int> inDegree(numCourses, 0);',
    '    vector<vector<int>> adj(numCourses);',
    '    for (auto& p : prerequisites) {',
    '        adj[p[1]].push_back(p[0]);',
    '        inDegree[p[0]]++;',
    '    }',
    '    queue<int> q;',
    '    for (int i = 0; i < numCourses; i++) if (inDegree[i] == 0) q.push(i);',
    '    vector<int> order;',
    '    while (!q.empty()) {',
    '        int cur = q.front(); q.pop();',
    '        order.push_back(cur);',
    '        for (int next : adj[cur]) {',
    '            if (--inDegree[next] == 0) q.push(next);',
    '        }',
    '    }',
    '    return order.size() == numCourses ? order : vector<int>();',
    '}',
  ],
  python: [
    'class Solution:',
    '    def findOrder(self, numCourses: int, prerequisites: list[list[int]]) -> list[int]:',
    '        in_degree = [0] * numCourses',
    '        adj = collections.defaultdict(list)',
    '        for cur, pre in prerequisites:',
    '            adj[pre].append(cur)',
    '            in_degree[cur] += 1',
    '        queue = collections.deque([i for i in range(numCourses) if in_degree[i] == 0])',
    '        order = []',
    '        while queue:',
    '            u = queue.popleft()',
    '            order.append(u)',
    '            for v in adj[u]:',
    '                in_degree[v] -= 1',
    '                if in_degree[v] == 0: queue.append(v)',
    '        return order if len(order) == numCourses else []',
  ],
  javascript: [
    'var findOrder = function(numCourses, prerequisites) {',
    '    const inDegree = new Array(numCourses).fill(0);',
    '    const adj = Array.from({ length: numCourses }, () => []);',
    '    for (const [cur, pre] of prerequisites) {',
    '        adj[pre].push(cur);',
    '        inDegree[cur]++;',
    '    }',
    '    const queue = [];',
    '    for (let i = 0; i < numCourses; i++) if (inDegree[i] === 0) queue.push(i);',
    '    const order = [];',
    '    while (queue.length > 0) {',
    '        const u = queue.shift();',
    '        order.push(u);',
    '        for (const v of adj[u]) {',
    '            if (--inDegree[v] === 0) queue.push(v);',
    '        }',
    '    }',
    '    return order.length === numCourses ? order : [];',
    '};',
  ],
};
