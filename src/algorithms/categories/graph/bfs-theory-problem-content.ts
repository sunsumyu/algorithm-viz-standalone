/**
 * 广度优先搜索理论基础 (BFS Theory) — 讲义与四语言代码
 */

export const BFS_THEORY_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    '// === BFS 广度优先搜索核心模板 (Java) ===',
    'public void bfs(List<List<Integer>> graph) {',
    '    boolean[] visited = new boolean[graph.size()];',
    '    Queue<Integer> queue = new ArrayDeque<>();',
    '    visited[0] = true; queue.offer(0);',
    '    int level = 0;',
    '    while (!queue.isEmpty()) {',
    '        int size = queue.size();',
    '        for (int i = 0; i < size; i++) {',
    '            int u = queue.poll();',
    '            for (int v : graph.get(u)) {',
    '                if (!visited[v]) {',
    '                    visited[v] = true;',
    '                    queue.offer(v);',
    '                }',
    '            }',
    '        }',
    '        level++;',
    '    }',
    '}',
  ],
  cpp: [
    '// === BFS 广度优先搜索核心模板 (C++) ===',
    'void bfs(const vector<vector<int>>& graph) {',
    '    vector<bool> visited(graph.size(), false);',
    '    queue<int> q;',
    '    visited[0] = true; q.push(0);',
    '    int level = 0;',
    '    while (!q.empty()) {',
    '        int size = q.size();',
    '        for (int i = 0; i < size; i++) {',
    '            int u = q.front(); q.pop();',
    '            for (int v : graph[u]) {',
    '                if (!visited[v]) {',
    '                    visited[v] = true;',
    '                    q.push(v);',
    '                }',
    '            }',
    '        }',
    '        level++;',
    '    }',
    '}',
  ],
  python: [
    '# === BFS 广度优先搜索核心模板 (Python) ===',
    'def bfs(graph: list[list[int]]) -> None:',
    '    visited = [False] * len(graph)',
    '    queue = deque()',
    '    visited[0] = True; queue.append(0)',
    '    level = 0',
    '    while queue:',
    '        size = len(queue)',
    '        for _ in range(size):',
    '            u = queue.popleft()',
    '            for v in graph[u]:',
    '                if not visited[v]:',
    '                    visited[v] = True',
    '                    queue.append(v)',
    '                ',
    '            ',
    '        ',
    '        level += 1',
    '    ',
    '',
  ],
  javascript: [
    '// === BFS 广度优先搜索核心模板 (JavaScript) ===',
    'function bfs(graph) {',
    '  const visited = new Array(graph.length).fill(false);',
    '  const queue = [];',
    '  visited[0] = true; queue.push(0);',
    '  let level = 0; ',
    '  while (queue.length > 0) {',
    '    const size = queue.length;',
    '    for (let i = 0; i < size; i++) {',
    '      const u = queue.shift();',
    '      for (const v of graph[u]) {',
    '        if (!visited[v]) {',
    '          visited[v] = true;',
    '          queue.push(v);',
    '        }',
    '      }',
    '    }',
    '    level++;',
    '  }',
    '}',
  ],
};

export const BFS_THEORY_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.7; color: #cbd5e1; display: flex; flex-direction: column; gap: 12px;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 7px; border-radius: 4px; background: rgba(6, 182, 212, 0.15); color: #22d3ee; font-weight: 700; font-size: 11px; border: 1px solid rgba(6, 182, 212, 0.3);">图论基石</span>
      <span style="padding: 2px 7px; border-radius: 4px; background: rgba(16, 185, 129, 0.15); color: #34d399; font-weight: 700; font-size: 11px; border: 1px solid rgba(16, 185, 129, 0.3);">队列与分层波纹</span>
      <span style="font-size: 13px; font-weight: 700; color: #f8fafc;">广度优先搜索理论基础 (Breadth-First Search)</span>
    </div>
    <p style="margin: 0;">
      广度优先搜索 (BFS) 是一种沿着图或树的<b>广度（层级）方向</b>层层向外扩展的经典算法。其核心特征在于<b>“水波纹扩散”</b>：
      以起始源点为中心，由近及远、逐层向外扩张，先遍历所有距离为 1 的顶点，再遍历距离为 2 的顶点，以此类推。
    </p>

    <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(6, 182, 212, 0.3); border-left: 4px solid #06b6d4; padding: 10px 14px; border-radius: 6px;">
      <div style="font-weight: 700; color: #22d3ee; margin-bottom: 6px;">⚡ BFS 三大核心定律</div>
      <div style="font-size: 12px; color: #cbd5e1; display: flex; flex-direction: column; gap: 4px;">
        <div>1. <b>FIFO 队列驱动</b>：先进先出保证先发现的顶点先出队扩展其邻域，严格保持层序递增。</div>
        <div>2. <b>入队即染标记 (Early Visited)</b>：节点一旦发现入队立即标记为已访问，杜绝同一节点被重复推入队列导致指数爆炸。</div>
        <div>3. <b>无权图最短路径性 (Shortest Path Invariant)</b>：边权为 1 的无权图中，首次被 BFS 访问到的路径必然是源点到该顶点的<b>全局最短路径</b>！</div>
        <div>4. <b>时空复杂度</b>：时间复杂度 <b>O(V + E)</b>；空间复杂度由图的最大宽度决定，最坏为 <b>O(V)</b>。</div>
      </div>
    </div>
  </div>
`;

export const BFS_THEORY_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.7; color: #cbd5e1; display: flex; flex-direction: column; gap: 12px;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 7px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-weight: 700; font-size: 11px; border: 1px solid rgba(56, 189, 248, 0.3);">算法进阶</span>
      <span style="font-size: 13px; font-weight: 700; color: #f8fafc;">BFS 经典变体与工程范式</span>
    </div>

    <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(56, 189, 248, 0.25); border-left: 4px solid #38bdf8; border-radius: 6px; padding: 10px 14px;">
      <div style="font-weight: 700; color: #38bdf8; margin-bottom: 4px;">🌊 高频实战题型矩阵</div>
      <div style="font-size: 12px; color: #cbd5e1; display: flex; flex-direction: column; gap: 4px;">
        <div>• <b>多源 BFS (Multi-Source BFS)</b>：多起点同时入队扩散，如地图最高点、腐烂橘子 (LeetCode 994)</div>
        <div>• <b>0-1 BFS 双端队列</b>：边权为 0 (前插) 或 1 (后插)，以 O(V+E) 代替 Dijkstra 堆优化 (LeetCode 2290)</div>
        <div>• <b>双向 BFS (Bidirectional BFS)</b>：起点与终点双向相向搜索，将搜索空间从 $b^d$ 剪枝压缩至 $2 \\cdot b^{d/2}$ (单词接龙 LeetCode 127)</div>
        <div>• <b>拓扑排序 (Kahn 算法)</b>：基于入度为 0 的节点入队进行依赖消解</div>
      </div>
    </div>
  </div>
`;
