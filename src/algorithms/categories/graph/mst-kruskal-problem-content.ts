/**
 * Kruskal 最小生成树算法 (Kruskal's Algorithm)
 * 领域知识与题解精讲配置声明
 */

export const MST_KRUSKAL_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">Graph Theory</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">Kruskal 最小生成树算法 (Kruskal's MST)</h2>
    </div>
    <p style="margin: 0;">Kruskal 算法采用 <strong>加边法（以边为中心全局贪心）</strong>。首先将图中所有边按权值升序排列，依次检查每条边两端的顶点是否属于同一连通分量：使用 <strong>并查集 (Union-Find)</strong> 进行环路检测，若不连通则选入生成树并合并集合，直到选满 <code style="color: #38bdf8; font-family: monospace;">V - 1</code> 条边。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">核心步骤:</div>
      <div>1. 边排序：所有边按权值从小到大排序 <code style="color: #38bdf8;">edges.sort((a,b) => a.w - b.w)</code>；</div>
      <div>2. 并查集判环：<code style="color: #fbbf24;">find(u) !== find(v)</code> 则 <code style="color: #34d399;">union(u, v)</code> 并加入 MST。</div>
    </div>
  </div>
`;

export const MST_KRUSKAL_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 贪心边排序与并查集森林合并
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 算法运行细节</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>排序：</strong> 对 <code style="color: #60a5fa; font-family: monospace;">E</code> 条边排序，耗时 <code style="color: #34d399; font-family: monospace;">O(E log E)</code>；<br/>
        2. <strong>遍历边集：</strong> 依次提取最小边 <code style="color: #fbbf24; font-family: monospace;">(u, v, w)</code>；<br/>
        3. <strong>连通性检查：</strong><br/>
        &nbsp;&nbsp;• 若 <code style="color: #34d399; font-family: monospace;">find(u) != find(v)</code>：无环，将边加入 MST，执行 <code style="color: #34d399; font-family: monospace;">union(u, v)</code>，累加权值；<br/>
        &nbsp;&nbsp;• 若 <code style="color: #f87171; font-family: monospace;">find(u) == find(v)</code>：加入会构成回路，舍弃此边。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度与适用场景</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：<code style="color: #34d399; font-family: monospace;">O(E log E)</code>，瓶颈在于边排序。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(V)</code>（并查集 parent 数组）。<br/>
        • 适用场景：非常适合 <strong>稀疏图（Sparse Graph）</strong>。
        </p>
      </div>
    </div>
  </div>
`;

export const MST_KRUSKAL_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public int kruskalMST(int n, int[][] edges) {',
    '        Arrays.sort(edges, (a, b) -> a[2] - b[2]); // 边权升序',
    '        UnionFind uf = new UnionFind(n);',
    '        int totalWeight = 0, count = 0;',
    '        for (int[] edge : edges) {',
    '            int u = edge[0], v = edge[1], w = edge[2];',
    '            if (uf.find(u) != uf.find(v)) {',
    '                uf.union(u, v);',
    '                totalWeight += w;',
    '                if (++count == n - 1) break;',
    '            }',
    '        }',
    '        return totalWeight;',
    '    }',
    '}',
  ],
  cpp: [
    'int kruskalMST(int n, vector<vector<int>>& edges) {',
    '    sort(edges.begin(), edges.end(), [](const auto& a, const auto& b) {',
    '        return a[2] < b[2];',
    '    });',
    '    UnionFind uf(n);',
    '    int totalWeight = 0, count = 0;',
    '    for (const auto& edge : edges) {',
    '        int u = edge[0], v = edge[1], w = edge[2];',
    '        if (uf.find(u) != uf.find(v)) {',
    '            uf.union(u, v);',
    '            totalWeight += w;',
    '            if (++count == n - 1) break;',
    '        }',
    '    }',
    '    return totalWeight;',
    '}',
  ],
  python: [
    'def kruskal_mst(n: int, edges: list[tuple[int, int, int]]) -> int:',
    '    edges.sort(key=lambda x: x[2])',
    '    uf = UnionFind(n)',
    '    total_weight = 0',
    '    count = 0',
    '    for u, v, w in edges:',
    '        if uf.find(u) != uf.find(v):',
    '            uf.union(u, v)',
    '            total_weight += w',
    '            count += 1',
    '            if count == n - 1: break',
    '    return total_weight',
  ],
  javascript: [
    'function kruskalMST(n, edges) {',
    '    edges.sort((a, b) => a[2] - b[2]);',
    '    const uf = new UnionFind(n);',
    '    let totalWeight = 0, count = 0;',
    '    for (const [u, v, w] of edges) {',
    '        if (uf.find(u) !== uf.find(v)) {',
    '            uf.union(u, v);',
    '            totalWeight += w;',
    '            if (++count === n - 1) break;',
    '        }',
    '    }',
    '    return totalWeight;',
    '}',
  ],
};
