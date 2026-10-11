/**
 * 深度优先搜索理论基础 (DFS Theory) — 讲义与四语言代码
 */

export const DFS_THEORY_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    '// === DFS 深度优先搜索核心模板 (Java) ===',
    'public void dfs(List<List<Integer>> graph) {',
    '    boolean[] visited = new boolean[graph.size()];',
    '    Deque<Integer> stack = new ArrayDeque<>();',
    '    dfsUtil(0, graph, visited, stack);',
    '}',
    'private void dfsUtil(int u, List<List<Integer>> graph,',
    '        boolean[] visited, Deque<Integer> stack) {',
    '    visited[u] = true;',
    '    stack.push(u);',
    '    for (int v : graph.get(u)) {',
    '        if (!visited[v]) {',
    '            dfsUtil(v, graph, visited, stack);',
    '        }',
    '    }',
    '    stack.pop(); // 回溯',
    '}',
  ],
  cpp: [
    '// === DFS 深度优先搜索核心模板 (C++) ===',
    'void dfs(const vector<vector<int>>& graph) {',
    '    vector<bool> visited(graph.size(), false);',
    '    vector<int> stack;',
    '    dfsUtil(0, graph, visited, stack);',
    '}',
    'void dfsUtil(int u, const vector<vector<int>>& graph,',
    '             vector<bool>& visited, vector<int>& stack) {',
    '    visited[u] = true;',
    '    stack.push_back(u);',
    '    for (int v : graph[u]) {',
    '        if (!visited[v]) {',
    '            dfsUtil(v, graph, visited, stack);',
    '        }',
    '    }',
    '    stack.pop_back(); // 回溯',
    '}',
  ],
  python: [
    '# === DFS 深度优先搜索核心模板 (Python) ===',
    'def dfs(graph: list[list[int]]) -> None:',
    '    visited = [False] * len(graph)',
    '    stack = []',
    '    dfs_util(0, graph, visited, stack)',
    '',
    'def dfs_util(u: int, graph: list[list[int]],',
    '             visited: list[bool], stack: list[int]) -> None:',
    '    visited[u] = True',
    '    stack.append(u)',
    '    for v in graph[u]:',
    '        if not visited[v]:',
    '            dfs_util(v, graph, visited, stack)',
    '    ',
    '    ',
    '    stack.pop() # 回溯',
    '',
  ],
  javascript: [
    '// === DFS 深度优先搜索核心模板 (JavaScript) ===',
    'function dfs(graph) {',
    '  const visited = new Array(graph.length).fill(false);',
    '  const stack = [];',
    '  dfsUtil(0, graph, visited, stack);',
    '}',
    'function dfsUtil(u, graph, visited, stack) {',
    '  // 递归入口',
    '  visited[u] = true;',
    '  stack.push(u);',
    '  for (const v of graph[u]) {',
    '    if (!visited[v]) {',
    '      dfsUtil(v, graph, visited, stack);',
    '    }',
    '  }',
    '  stack.pop(); // 回溯',
    '}',
  ],
};

export const DFS_THEORY_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.7; color: #cbd5e1; display: flex; flex-direction: column; gap: 12px;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 7px; border-radius: 4px; background: rgba(139, 92, 246, 0.15); color: #a78bfa; font-weight: 700; font-size: 11px; border: 1px solid rgba(139, 92, 246, 0.3);">图论基石</span>
      <span style="padding: 2px 7px; border-radius: 4px; background: rgba(16, 185, 129, 0.15); color: #34d399; font-weight: 700; font-size: 11px; border: 1px solid rgba(16, 185, 129, 0.3);">递归与回溯</span>
      <span style="font-size: 13px; font-weight: 700; color: #f8fafc;">深度优先搜索理论基础 (Depth-First Search)</span>
    </div>
    <p style="margin: 0;">
      深度优先搜索 (DFS) 是一种沿着图或树的深度方向遍历的经典算法。其核心在于<b>“不撞南墙不回头”</b>：
      尽可能深地深入未知分支，遇到无路可走或已访问节点时逐层<b>回溯 (Backtrack)</b>，再探索平行分支。
    </p>

    <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(139, 92, 246, 0.3); border-left: 4px solid #8b5cf6; padding: 10px 14px; border-radius: 6px;">
      <div style="font-weight: 700; color: #a78bfa; margin-bottom: 6px;">⚡ DFS 三大核心机制</div>
      <div style="font-size: 12px; color: #cbd5e1; display: flex; flex-direction: column; gap: 4px;">
        <div>1. <b>递归深入 (Dive)</b>：每次访问未探索邻居时立即入栈深入，状态空间树向纵深扩展。</div>
        <div>2. <b>状态标记 (Visited)</b>：维护布尔标记数组，阻断环路死循环并确保每个顶点仅被常数次处理。</div>
        <div>3. <b>回溯弹栈 (Backtrack)</b>：当前顶点的所有邻接边均遍历穷尽后，恢复上下文并向父级调用者退回。</div>
        <div>4. <b>时空复杂度</b>：邻接表表示下遍历全图时间复杂度为 <b>O(V + E)</b>；空间复杂度由递归调用栈的最大深度决定，最坏为 <b>O(V)</b>。</div>
      </div>
    </div>
  </div>
`;

export const DFS_THEORY_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.7; color: #cbd5e1; display: flex; flex-direction: column; gap: 12px;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 7px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-weight: 700; font-size: 11px; border: 1px solid rgba(56, 189, 248, 0.3);">算法范式</span>
      <span style="font-size: 13px; font-weight: 700; color: #f8fafc;">DFS 典型题型与应用矩阵</span>
    </div>

    <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(56, 189, 248, 0.25); border-left: 4px solid #38bdf8; border-radius: 6px; padding: 10px 14px;">
      <div style="font-weight: 700; color: #38bdf8; margin-bottom: 4px;">🧭 经典实战场景</div>
      <div style="font-size: 12px; color: #cbd5e1; display: flex; flex-direction: column; gap: 4px;">
        <div>• <b>连通块染色 (Flood Fill)</b>：网格岛屿搜索 (LeetCode 200 / 695)</div>
        <div>• <b>全路径枚举与回溯</b>：所有可能路径 (LeetCode 797)、全排列、组合问题</div>
        <div>• <b>拓扑排序与判环</b>：三色标记法 (0 未访问, 1 访问中, 2 已完成) 检测有向图环</div>
        <div>• <b>强连通分量 (SCC)</b>：Tarjan / Kosaraju 算法中的 DFS 时间戳与返祖边</div>
      </div>
    </div>
  </div>
`;
