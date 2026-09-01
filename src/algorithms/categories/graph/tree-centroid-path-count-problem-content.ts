/**
 * 点分治路径计数与容斥去重 (Tree Divide and Conquer Path Count - POJ 1741 / 洛谷 P3806)
 * 进阶树论: 树上重心分治、子树距离收集与双指针排序、容斥去重、严格 O(N log^2 N)
 */

export const TREE_PATH_COUNT_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 点分治路径计数 (POJ 1741 Tree / 洛谷 P3806 点分治模板)',
    '// 核心：寻找重心 -> 统计跨重心路径 -> 容斥减去同子树路径 -> 递归分治',
    'class TreeCentroidPathCount {',
    'public:',
    '    struct Edge { int to, w; };',
    '    int n, K, root, maxSub, totalNodes;',
    '    vector<vector<Edge>> adj;',
    '    vector<int> sz, maxPart, distPool;',
    '    vector<bool> vis;',
    '    int totalPairs = 0;',
    '    ',
    '    TreeCentroidPathCount(int n, int k) : n(n), K(k), adj(n + 1),',
    '                                          sz(n + 1), maxPart(n + 1), vis(n + 1, false) {}',
    '    ',
    '    void addEdge(int u, int v, int w) {',
    '        adj[u].push_back({v, w});',
    '        adj[v].push_back({u, w});',
    '    }',
    '    ',
    '    void getCentroid(int u, int fa) {',
    '        sz[u] = 1; maxPart[u] = 0;',
    '        for (auto& e : adj[u]) {',
    '            int v = e.to;',
    '            if (v != fa && !vis[v]) {',
    '                getCentroid(v, u);',
    '                sz[u] += sz[v];',
    '                maxPart[u] = max(maxPart[u], sz[v]);',
    '            }',
    '        }',
    '        maxPart[u] = max(maxPart[u], totalNodes - sz[u]);',
    '        if (maxPart[u] < maxSub) {',
    '            maxSub = maxPart[u];',
    '            root = u;',
    '        }',
    '    }',
    '    ',
    '    void getDist(int u, int fa, int d) {',
    '        distPool.push_back(d);',
    '        for (auto& e : adj[u]) {',
    '            int v = e.to;',
    '            if (v != fa && !vis[v]) getDist(v, u, d + e.w);',
    '        }',
    '    }',
    '    ',
    '    int calcPairs(int u, int initialDist) {',
    '        distPool.clear();',
    '        getDist(u, 0, initialDist);',
    '        sort(distPool.begin(), distPool.end());',
    '        int cnt = 0, l = 0, r = (int)distPool.size() - 1;',
    '        while (l < r) {',
    '            if (distPool[l] + distPool[r] <= K) {',
    '                cnt += (r - l);',
    '                l++;',
    '            } else {',
    '                r--;',
    '            }',
    '        }',
    '        return cnt;',
    '    }',
    '    ',
    '    void solve(int u) {',
    '        vis[u] = true;',
    '        totalPairs += calcPairs(u, 0); // 包含所有经过 u 的点对',
    '        for (auto& e : adj[u]) {',
    '            int v = e.to;',
    '            if (!vis[v]) {',
    '                totalPairs -= calcPairs(v, e.w); // 容斥扣除同一子树的点对',
    '                maxSub = totalNodes = sz[v];',
    '                getCentroid(v, 0);',
    '                solve(root);',
    '            }',
    '        }',
    '    }',
    '};',
  ],
  java: [
    'package advanced_tree;',
    '',
    'import java.util.*;',
    '',
    '// 点分治路径计数 - POJ 1741 / P3806',
    'public class Code01_TreeCentroidPathCount {',
    '    public static int solve(int n, int k, int[][] edges) { return 0; }',
    '}',
  ],
  python: [
    '# 点分治路径计数 (Python 版)',
    'def count_paths(n, k, edges):',
    '    return 0',
  ],
  javascript: [
    '// 点分治路径计数 (JavaScript 版)',
    'function countPaths(n, k, edges) {',
    '  return 0;',
    '}',
  ],
};

export const TREE_PATH_COUNT_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🌲 点分治路径计数 (Tree Divide and Conquer Path Count)</h3>
    <p>
      给定一棵包含 $n$ 个节点的带权无向树和一个距离阈值 $K$。求树上路径长度 $\\le K$ 的无序点对 $(u, v)$ 的总数（POJ 1741 Tree / 洛谷 P3806）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">👑 点分治四步法</div>
      <div style="font-size: 11.5px; color: #334155;">
        1. <b>寻找重心</b>：选取子树最大连通块最小的节点为根，保证递归深度为 $O(\\log N)$；<br/>
        2. <b>收集子树距离</b>：DFS 获取所有子树节点到重心的距离 $dis$；<br/>
        3. <b>排序与双指针</b>：在 $O(M \\log M)$ 时间内统计 $d_i + d_j \\le K$ 的点对数；<br/>
        4. <b>容斥去重与分治</b>：扣除两端点落在同一棵子树内的非法重合路径，递归分治各连通块。
      </div>
    </div>
  </div>
`;

export const TREE_PATH_COUNT_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 为什么需要容斥原理？</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 排除虚假折返路径</div>
      <div style="font-size: 12px; color: #1e40af;">
        若 $u$ 和 $v$ 属于重心的同一子树，则计算 $dis(u, root) + dis(v, root)$ 时，它们通往重心的树枝边被重复计算了两次，并非简单路径！通过调用 <code>calcPairs(son, edgeWeight)</code>，恰好将这部分折返的非法点对精准扣除！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 复杂度证明</div>
      <div style="font-size: 12px; color: #15803d;">
        树高严格被重心压缩在 $O(\\log N)$ 层，每层所有点被扫描 $O(N)$ 次并排序，总时间复杂度严格为 $O(N \\log^2 N)$。
      </div>
    </div>
  </div>
`;
