/**
 * 冗余连接 II (Redundant Connection II · LeetCode 685)
 * 领域知识与题解精讲配置声明
 */

export const REDUNDANT_EDGE_II_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 685</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(239,68,68,0.2); color: #f87171; font-weight: 700; border: 1px solid rgba(239,68,68,0.3);">Hard</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">冗余连接 II (有向树双父节点与有向环判定)</h2>
    </div>
    <p style="margin: 0;">在该问题中，一棵有向树指的是一个有向图，有且仅有一个根节点（入度为 0），其余所有节点入度均为 1。往有向树中添加一条有向边后，可能产生两种冲突：<strong>1. 某个节点入度为 2（双父节点冲突）</strong>；<strong>2. 图中出现有向环</strong>。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">3 种冲突情况分析:</div>
      <div>• <strong>情况 1 (仅入度为2):</strong> 尝试删除指向该节点的第二条边，若剩余图是合法有向树则删之，否则删第一条边；</div>
      <div>• <strong>情况 2 (仅有向环):</strong> 无入度为 2 的节点，直接用并查集找到构成环的有向边；</div>
      <div>• <strong>情况 3 (入度为2且在环中):</strong> 必须删除位于环上的那条入边。</div>
    </div>
  </div>
`;

export const REDUNDANT_EDGE_II_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 入度度数判定 + 并查集环路回溯
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 分类讨论核心解法</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>找入度为 2：</strong> 记录指向该节点的两条边 <code style="color: #38bdf8; font-family: monospace;">edge1, edge2</code>；<br/>
        2. <strong>若存在入度为 2：</strong><br/>
        &nbsp;&nbsp;• 优先尝试“假设删除 edge2”，用并查集检查剩余边是否包含环；<br/>
        &nbsp;&nbsp;• 若无环，则 <code style="color: #34d399; font-family: monospace;">edge2</code> 为冗余边；若仍有环，则说明冲突边是 <code style="color: #34d399; font-family: monospace;">edge1</code>；<br/>
        3. <strong>若所有节点入度均为 1：</strong> 退化为 LC 684，直接用并查集找第一条导致成环的边。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #34d399; font-family: monospace;">O(N · α(N))</code>。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(N)</code>。
        </p>
      </div>
    </div>
  </div>
`;

export const REDUNDANT_EDGE_II_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public int[] findRedundantDirectedConnection(int[][] edges) {',
    '        int n = edges.length;',
    '        int[] inDegree = new int[n + 1];',
    '        int conflict = -1, cycle = -1;',
    '        int[] parent = new int[n + 1];',
    '        for (int i = 1; i <= n; i++) parent[i] = i;',
    '        for (int i = 0; i < n; i++) {',
    '            int u = edges[i][0], v = edges[i][1];',
    '            if (inDegree[v] > 0) conflict = i;',
    '            else inDegree[v]++;',
    '        }',
    '        for (int i = 0; i < n; i++) {',
    '            if (i == conflict) continue;',
    '            int u = edges[i][0], v = edges[i][1];',
    '            int rootU = find(parent, u), rootV = find(parent, v);',
    '            if (rootU == rootV) cycle = i;',
    '            else parent[rootU] = rootV;',
    '        }',
    '        if (conflict < 0) return edges[cycle];',
    '        if (cycle >= 0) return findFirstParentEdge(edges, edges[conflict][1]);',
    '        return edges[conflict];',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<int> findRedundantDirectedConnection(vector<vector<int>>& edges) {',
    '        int n = edges.size(), conflict = -1, cycle = -1;',
    '        vector<int> inDegree(n + 1, 0), parent(n + 1);',
    '        for (int i = 1; i <= n; i++) parent[i] = i;',
    '        for (int i = 0; i < n; i++) {',
    '            if (inDegree[edges[i][1]]++ > 0) conflict = i;',
    '        }',
    '        for (int i = 0; i < n; i++) {',
    '            if (i == conflict) continue;',
    '            int rootU = find(parent, edges[i][0]), rootV = find(parent, edges[i][1]);',
    '            if (rootU == rootV) cycle = i;',
    '            else parent[rootU] = rootV;',
    '        }',
    '        if (conflict < 0) return edges[cycle];',
    '        if (cycle >= 0) return findFirstParentEdge(edges, edges[conflict][1]);',
    '        return edges[conflict];',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def findRedundantDirectedConnection(self, edges: list[list[int]]) -> list[int]:',
    '        n = len(edges)',
    '        in_degree = [0] * (n + 1)',
    '        conflict, cycle = -1, -1',
    '        for i, (u, v) in enumerate(edges):',
    '            if in_degree[v] > 0: conflict = i',
    '            in_degree[v] += 1',
    '        parent = list(range(n + 1))',
    '        for i, (u, v) in enumerate(edges):',
    '            if i == conflict: continue',
    '            ru, rv = self.find(parent, u), self.find(parent, v)',
    '            if ru == rv: cycle = i',
    '            else: parent[ru] = rv',
    '        if conflict < 0: return edges[cycle]',
    '        if cycle >= 0: return self.get_first_parent_edge(edges, edges[conflict][1])',
    '        return edges[conflict]',
  ],
  javascript: [
    'var findRedundantDirectedConnection = function(edges) {',
    '    const n = edges.length;',
    '    const inDegree = new Array(n + 1).fill(0);',
    '    let conflict = -1, cycle = -1;',
    '    for (let i = 0; i < n; i++) {',
    '        if (inDegree[edges[i][1]]++ > 0) conflict = i;',
    '    }',
    '    const parent = Array.from({ length: n + 1 }, (_, i) => i);',
    '    for (let i = 0; i < n; i++) {',
    '        if (i === conflict) continue;',
    '        const rootU = find(parent, edges[i][0]), rootV = find(parent, edges[i][1]);',
    '        if (rootU === rootV) cycle = i;',
    '        else parent[rootU] = rootV;',
    '    }',
    '    if (conflict < 0) return edges[cycle];',
    '    if (cycle >= 0) return findFirstParentEdge(edges, edges[conflict][1]);',
    '    return edges[conflict];',
    '};',
  ],
};
