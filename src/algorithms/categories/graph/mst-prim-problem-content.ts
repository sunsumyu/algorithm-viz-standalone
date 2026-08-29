/**
 * Prim 最小生成树算法 (Prim's Algorithm)
 * 领域知识与题解精讲配置声明
 */

export const MST_PRIM_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">Graph Theory</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">Prim 最小生成树算法 (Prim's MST)</h2>
    </div>
    <p style="margin: 0;">在连通带权无向图中，找到一棵包含所有顶点的树，使得树的所有边的 <strong>权值之和最小</strong>。Prim 算法采用 <strong>加点法（以点为中心贪心生长）</strong>，维护已在生成树中的点集 <code style="color: #38bdf8; font-family: monospace;">inMST</code>，每次选取离当前生成树最近的一个新顶点加入。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">核心思想:</div>
      <div>1. <code style="color: #38bdf8;">minDist[v]</code>：表示未在生成树中的顶点 <code style="color: #38bdf8;">v</code> 到 <strong>当前生成树整体</strong> 的最短距离（区别于 Dijkstra 是到源点的距离）；</div>
      <div>2. 贪心选择当前 <code style="color: #fbbf24;">minDist</code> 最小的节点加入 <code style="color: #34d399;">inMST</code>，并用其相连的边更新其他未加入节点的 <code style="color: #38bdf8;">minDist</code>。</div>
    </div>
  </div>
`;

export const MST_PRIM_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 切割性质（Cut Property）与加点贪心
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① Prim 三步迭代</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>选点：</strong> 遍历未加入 MST 的顶点，找到 <code style="color: #fbbf24; font-family: monospace;">minDist[u]</code> 最小的节点 <code style="color: #fbbf24; font-family: monospace;">u</code>；<br/>
        2. <strong>并入：</strong> 标记 <code style="color: #34d399; font-family: monospace;">inMST[u] = true; totalWeight += minDist[u];</code>；<br/>
        3. <strong>更新切边：</strong> 遍历 <code style="color: #38bdf8; font-family: monospace;">u</code> 的所有邻接点 <code style="color: #38bdf8; font-family: monospace;">v</code>，若 <code style="color: #34d399; font-family: monospace;">!inMST[v] && weight(u, v) < minDist[v]</code>，则更新 <code style="color: #34d399; font-family: monospace;">minDist[v] = weight(u, v); parent[v] = u;</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度与适用场景</div>
        <p style="margin: 0; color: #94a3b8;">
        • 时间复杂度：朴素数组版 <code style="color: #34d399; font-family: monospace;">O(V²)</code>，堆优化版 <code style="color: #34d399; font-family: monospace;">O(E log V)</code>。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(V)</code>。<br/>
        • 适用场景：非常适合 <strong>稠密图（Dense Graph）</strong>。
        </p>
      </div>
    </div>
  </div>
`;

export const MST_PRIM_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public class Solution {',
    '    public int primMST(int n, List<int[]>[] adj) {',
    '        int[] minDist = new int[n];',
    '        Arrays.fill(minDist, Integer.MAX_VALUE);',
    '        minDist[0] = 0;',
    '        boolean[] inMST = new boolean[n];',
    '        int totalWeight = 0;',
    '        for (int i = 0; i < n; i++) {',
    '            int u = -1;',
    '            for (int j = 0; j < n; j++) {',
    '                if (!inMST[j] && (u == -1 || minDist[j] < minDist[u])) u = j;',
    '            }',
    '            inMST[u] = true;',
    '            totalWeight += minDist[u];',
    '            for (int[] edge : adj[u]) {',
    '                int v = edge[0], w = edge[1];',
    '                if (!inMST[v] && w < minDist[v]) {',
    '                    minDist[v] = w;',
    '                }',
    '            }',
    '        }',
    '        return totalWeight;',
    '    }',
    '}',
  ],
  cpp: [
    'int primMST(int n, vector<vector<pair<int, int>>>& adj) {',
    '    vector<int> minDist(n, INT_MAX);',
    '    vector<bool> inMST(n, false);',
    '    minDist[0] = 0;',
    '    int totalWeight = 0;',
    '    for (int i = 0; i < n; i++) {',
    '        int u = -1;',
    '        for (int j = 0; j < n; j++) {',
    '            if (!inMST[j] && (u == -1 || minDist[j] < minDist[u])) u = j;',
    '        }',
    '        inMST[u] = true;',
    '        totalWeight += minDist[u];',
    '        for (auto& [v, w] : adj[u]) {',
    '            if (!inMST[v] && w < minDist[v]) {',
    '                minDist[v] = w;',
    '            }',
    '        }',
    '    }',
    '    return totalWeight;',
    '}',
  ],
  python: [
    'def prim_mst(n: int, adj: list[list[tuple[int, int]]]) -> int:',
    '    min_dist = [float("inf")] * n',
    '    in_mst = [False] * n',
    '    min_dist[0] = 0',
    '    total_weight = 0',
    '    for _ in range(n):',
    '        u = -1',
    '        for j in range(n):',
    '            if not in_mst[j] and (u == -1 or min_dist[j] < min_dist[u]):',
    '                u = j',
    '        in_mst[u] = True',
    '        total_weight += min_dist[u]',
    '        for v, w in adj[u]:',
    '            if not in_mst[v] and w < min_dist[v]:',
    '                min_dist[v] = w',
    '    return total_weight',
  ],
  javascript: [
    'function primMST(n, adj) {',
    '    const minDist = new Array(n).fill(Infinity);',
    '    const inMST = new Array(n).fill(false);',
    '    minDist[0] = 0;',
    '    let totalWeight = 0;',
    '    for (let i = 0; i < n; i++) {',
    '        let u = -1;',
    '        for (let j = 0; j < n; j++) {',
    '            if (!inMST[j] && (u === -1 || minDist[j] < minDist[u])) u = j;',
    '        }',
    '        inMST[u] = true;',
    '        totalWeight += minDist[u];',
    '        for (const [v, w] of adj[u]) {',
    '            if (!inMST[v] && w < minDist[v]) {',
    '                minDist[v] = w;',
    '            }',
    '        }',
    '    }',
    '    return totalWeight;',
    '}',
  ],
};
