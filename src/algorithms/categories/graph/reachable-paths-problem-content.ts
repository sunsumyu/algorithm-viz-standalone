/**
 * 力扣 797. 所有可能的路径 (All Paths From Source to Target) / 有向图可达路径
 * 题目解析、算法精讲与四语言源码
 */

export const REACHABLE_PATHS_PROBLEM_HTML = `
<div style="line-height: 1.7; font-size: 13.5px; color: #cbd5e1;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
    <span style="font-weight: 800; font-size: 16px; color: #f8fafc;">797. 所有可能的路径 / 有向图可达路径</span>
    <span style="background: #854d0e; color: #fde047; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">中等 / Medium</span>
  </div>

  <p>给你一个有 <code>n</code> 个节点的 <strong>有向无环图 (DAG)</strong> ，请你找出所有从节点 <code>0</code> 到节点 <code>n-1</code> 的路径并输出（ <strong>不要求按特定顺序</strong> ）。</p>
  <p>二维数组的第 <code>i</code> 个节点的数据 <code>graph[i]</code> 是一个从节点 <code>i</code> 可以访问的所有节点的列表（即从节点 <code>i</code> 到节点 <code>graph[i][j]</code> 存在一条有向边）。</p>

  <h4 style="color: #38bdf8; margin-top: 16px; margin-bottom: 8px;">示例 1：</h4>
  <pre style="background: #1e293b; padding: 10px; border-radius: 8px; font-size: 12px; color: #e2e8f0;"><strong>输入:</strong> graph = [[1,2],[3],[3],[]]
<strong>输出:</strong> [[0,1,3],[0,2,3]]
<strong>解释:</strong> 有两条路径: 0 -> 1 -> 3 和 0 -> 2 -> 3</pre>
</div>
`;

export const REACHABLE_PATHS_ANALYSIS_HTML = `
<div style="line-height: 1.7; font-size: 13.5px; color: #cbd5e1;">
  <h3 style="color: #38bdf8; margin-top: 0;">💡 核心思路：回溯深度优先搜索 (DFS + Backtracking)</h3>
  <p>求解所有路径需遍历整棵解空间树，回溯搜索是经典范式：</p>

  <h4 style="color: #67e8f9; margin-top: 12px;">算法流程：</h4>
  <ol style="padding-left: 20px;">
    <li><strong>递归起点：</strong>从源节点 <code>0</code> 开始，将当前节点加入当前路径 <code>path.push(0)</code>。</li>
    <li><strong>递归基：</strong>当访问到目标节点 <code>n - 1</code> 时，说明找到一条有效完整路径，将其拷贝加入结果集 <code>res.push([...path])</code>。</li>
    <li><strong>单层遍历与回溯：</strong>
      <ul>
        <li>遍历当前节点的所有邻居 <code>next</code>。</li>
        <li>递归深入 <code>dfs(graph, next, path, res)</code>。</li>
        <li><strong>回溯弹出：</strong>在递归返回后，将 <code>next</code> 从 <code>path</code> 中弹出 <code>path.pop()</code>，恢复现场以尝试其他分支。</li>
      </ul>
    </li>
  </ol>

  <h4 style="color: #67e8f9; margin-top: 12px;">复杂度分析</h4>
  <ul style="padding-left: 20px;">
    <li><strong>时间复杂度：</strong><code>O(2^V × V)</code>，最坏情况下 DAG 存在 <code>2^(V-1) - 1</code> 条路径。</li>
    <li><strong>空间复杂度：</strong><code>O(V)</code>，递归栈和路径数组占用的空间。</li>
  </ul>
</div>
`;

export const REACHABLE_PATHS_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'class Solution {',
    '    public List<List<Integer>> allPathsSourceTarget(int[][] graph) {',
    '        List<List<Integer>> res = new ArrayList<>();',
    '        List<Integer> path = new ArrayList<>();',
    '        path.add(0);',
    '        dfs(graph, 0, path, res);',
    '        return res;',
    '    }',
    '    private void dfs(int[][] graph, int node, List<Integer> path, List<List<Integer>> res) {',
    '        if (node == graph.length - 1) {',
    '            res.add(new ArrayList<>(path));',
    '            return;',
    '        }',
    '        for (int next : graph[node]) {',
    '            path.add(next);',
    '            dfs(graph, next, path, res);',
    '            path.remove(path.size() - 1);',
    '        }',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<vector<int>> allPathsSourceTarget(vector<vector<int>>& graph) {',
    '        vector<vector<int>> res;',
    '        vector<int> path = {0};',
    '        dfs(graph, 0, path, res);',
    '        return res;',
    '    }',
    'private:',
    '    void dfs(const vector<vector<int>>& graph, int node, vector<int>& path, vector<vector<int>>& res) {',
    '        if (node == (int)graph.size() - 1) {',
    '            res.push_back(path);',
    '            return;',
    '        }',
    '        for (int next : graph[node]) {',
    '            path.push_back(next);',
    '            dfs(graph, next, path, res);',
    '            path.pop_back();',
    '        }',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def allPathsSourceTarget(self, graph: List[List[int]]) -> List[List[int]]:',
    '        res = []',
    '        target = len(graph) - 1',
    '        def dfs(node, path):',
    '            if node == target:',
    '                res.append(list(path))',
    '                return',
    '            for next_node in graph[node]:',
    '                path.append(next_node)',
    '                dfs(next_node, path)',
    '                path.pop()',
    '        dfs(0, [0])',
    '        return res',
  ],
  javascript: [
    'var allPathsSourceTarget = function(graph) {',
    '    const res = [];',
    '    const target = graph.length - 1;',
    '    const dfs = (node, path) => {',
    '        if (node === target) {',
    '            res.push([...path]);',
    '            return;',
    '        }',
    '        for (const next of graph[node]) {',
    '            path.push(next);',
    '            dfs(next, path);',
    '            path.pop();',
    '        }',
    '    };',
    '    dfs(0, [0]);',
    '    return res;',
    '};',
  ],
};
