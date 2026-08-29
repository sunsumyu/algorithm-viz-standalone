/**
 * 冗余连接 (Redundant Connection · LeetCode 684)
 * 领域知识与题解精讲配置声明
 */

export const REDUNDANT_EDGE_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 684</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">冗余连接 (无向图并查集判环)</h2>
    </div>
    <p style="margin: 0;">树可以看作是一个连通且 <strong>无环</strong> 的无向图。给定往一棵包含 <code style="color: #38bdf8; font-family: monospace;">n</code> 个节点的树中添加一条边后的图。添加的边的两个顶点介于 <code style="color: #38bdf8; font-family: monospace;">1</code> 到 <code style="color: #38bdf8; font-family: monospace;">n</code> 之间。请找出一条可以删去的边，使得结果图是一个包含 <code style="color: #38bdf8; font-family: monospace;">n</code> 个节点的树。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">并查集判环逻辑:</div>
      <div>遍历边 <code style="color: #38bdf8;">[u, v]</code>，若 <code style="color: #f87171;">find(u) == find(v)</code>，说明两点在加边前已连通，该边就是导致环形成的冗余边！</div>
    </div>
  </div>
`;

export const REDUNDANT_EDGE_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 路径压缩并查集动态连通性
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 判定过程</div>
        <p style="margin: 0; color: #94a3b8;">
        1. 初始化并查集，每个节点各自为一个独立集合：<code style="color: #38bdf8; font-family: monospace;">parent[i] = i</code>；<br/>
        2. 按顺序遍历每条边 <code style="color: #fbbf24; font-family: monospace;">[u, v]</code>；<br/>
        3. 查找根节点：<code style="color: #34d399; font-family: monospace;">rootU = find(u), rootV = find(v)</code>；<br/>
        4. 若 <code style="color: #f87171; font-family: monospace;">rootU == rootV</code>，立即返回当前边 <code style="color: #f87171; font-family: monospace;">[u, v]</code>；否则合并集合 <code style="color: #34d399; font-family: monospace;">parent[rootU] = rootV</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度分析</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #34d399; font-family: monospace;">O(N · α(N))</code>，近乎线性。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(N)</code>。
        </p>
      </div>
    </div>
  </div>
`;

export const REDUNDANT_EDGE_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public int[] findRedundantConnection(int[][] edges) {',
    '        int n = edges.length;',
    '        int[] parent = new int[n + 1];',
    '        for (int i = 1; i <= n; i++) parent[i] = i;',
    '        for (int[] edge : edges) {',
    '            int u = edge[0], v = edge[1];',
    '            int rootU = find(parent, u), rootV = find(parent, v);',
    '            if (rootU == rootV) return edge; // 发现冗余边',
    '            parent[rootU] = rootV;',
    '        }',
    '        return new int[0];',
    '    }',
    '    private int find(int[] parent, int i) {',
    '        if (parent[i] == i) return i;',
    '        return parent[i] = find(parent, parent[i]);',
    '    }',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    vector<int> findRedundantConnection(vector<vector<int>>& edges) {',
    '        int n = edges.size();',
    '        vector<int> parent(n + 1);',
    '        for (int i = 1; i <= n; i++) parent[i] = i;',
    '        for (auto& edge : edges) {',
    '            int rootU = find(parent, edge[0]), rootV = find(parent, edge[1]);',
    '            if (rootU == rootV) return edge;',
    '            parent[rootU] = rootV;',
    '        }',
    '        return {};',
    '    }',
    '    int find(vector<int>& parent, int i) {',
    '        return parent[i] == i ? i : parent[i] = find(parent, parent[i]);',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def findRedundantConnection(self, edges: list[list[int]]) -> list[int]:',
    '        parent = list(range(len(edges) + 1))',
    '        def find(i):',
    '            if parent[i] != i: parent[i] = find(parent[i])',
    '            return parent[i]',
    '        for u, v in edges:',
    '            root_u, root_v = find(u), find(v)',
    '            if root_u == root_v: return [u, v]',
    '            parent[root_u] = root_v',
    '        return []',
  ],
  javascript: [
    'var findRedundantConnection = function(edges) {',
    '    const parent = Array.from({ length: edges.length + 1 }, (_, i) => i);',
    '    const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));',
    '    for (const [u, v] of edges) {',
    '        const rootU = find(u), rootV = find(v);',
    '        if (rootU === rootV) return [u, v];',
    '        parent[rootU] = rootV;',
    '    }',
    '    return [];',
    '};',
  ],
};
