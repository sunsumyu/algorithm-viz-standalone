/**
 * 好路径数目与点权升序并查集 (Number of Good Paths)
 * 参考左程云《算法通关课》【必备篇】class057: 点权升序加边、并查集最大权维护与组合数累加 (LeetCode 2421)
 */

export const GOOD_PATHS_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <numeric>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 好路径数目 (LeetCode 2421 / 左程云 class057)',
    '// 核心：按边两端最大点权升序建图 + 并查集维护最大点权出现频次',
    'int numberOfGoodPaths(vector<int>& vals, vector<vector<int>>& edges) {',
    '    int n = vals.size();',
    '    vector<int> parent(n);',
    '    iota(parent.begin(), parent.end(), 0);',
    '    ',
    '    // count[i] 记录集合 i 中具有当前集合最大点权的节点个数',
    '    vector<int> count(n, 1);',
    '    ',
    '    auto find = [&](auto& self, int i) -> int {',
    '        if (parent[i] != i) parent[i] = self(self, parent[i]);',
    '        return parent[i];',
    '    };',
    '    ',
    '    // 按边两端的 max(vals[u], vals[v]) 升序排序',
    '    sort(edges.begin(), edges.end(), [&](const auto& a, const auto& b) {',
    '        return max(vals[a[0]], vals[a[1]]) < max(vals[b[0]], vals[b[1]]);',
    '    });',
    '    ',
    '    int goodPaths = n; // 每个节点自身算一条好路径',
    '    ',
    '    for (const auto& e : edges) {',
    '        int fx = find(find, e[0]);',
    '        int fy = find(find, e[1]);',
    '        ',
    '        if (vals[fx] == vals[fy]) {',
    '            goodPaths += count[fx] * count[fy]; // 跨集合配对产生好路径',
    '            parent[fy] = fx;',
    '            count[fx] += count[fy];',
    '        } else if (vals[fx] > vals[fy]) {',
    '            parent[fy] = fx; // 权值大的作为根',
    '        } else {',
    '            parent[fx] = fy;',
    '        }',
    '    }',
    '    return goodPaths;',
    '}',
  ],
  java: [
    'package class057;',
    '',
    'import java.util.*;',
    '',
    '// 好路径数目 - 左程云标准并查集点权升序实现',
    'public class Code03_NumberOfGoodPaths {',
    '    public static int[] father;',
    '    public static int[] count;',
    '    ',
    '    public static int find(int i) {',
    '        if (father[i] != i) father[i] = find(father[i]);',
    '        return father[i];',
    '    }',
    '    ',
    '    public static int numberOfGoodPaths(int[] vals, int[][] edges) {',
    '        int n = vals.length;',
    '        father = new int[n];',
    '        count = new int[n];',
    '        for (int i = 0; i < n; i++) {',
    '            father[i] = i;',
    '            count[i] = 1;',
    '        }',
    '        ',
    '        Arrays.sort(edges, (a, b) -> Math.max(vals[a[0]], vals[a[1]]) - Math.max(vals[b[0]], vals[b[1]]));',
    '        int ans = n;',
    '        ',
    '        for (int[] edge : edges) {',
    '            int fx = find(edge[0]);',
    '            int fy = find(edge[1]);',
    '            ',
    '            if (vals[fx] == vals[fy]) {',
    '                ans += count[fx] * count[fy];',
    '                father[fy] = fx;',
    '                count[fx] += count[fy];',
    '            } else if (vals[fx] > vals[fy]) {',
    '                father[fy] = fx;',
    '            } else {',
    '                father[fx] = fy;',
    '            }',
    '        }',
    '        return ans;',
    '    }',
    '}',
  ],
  python: [
    'def number_of_good_paths(vals: list[int], edges: list[list[int]]) -> int:',
    '    n = len(vals)',
    '    parent = list(range(n))',
    '    count = [1] * n',
    '    ',
    '    def find(i):',
    '        if parent[i] != i:',
    '            parent[i] = find(parent[i])',
    '        return parent[i]',
    '        ',
    '    edges.sort(key=lambda e: max(vals[e[0]], vals[e[1]]))',
    '    good_paths = n',
    '    ',
    '    for u, v in edges:',
    '        fu, fv = find(u), find(v)',
    '        if vals[fu] == vals[fv]:',
    '            good_paths += count[fu] * count[fv]',
    '            parent[fv] = fu',
    '            count[fu] += count[fv]',
    '        elif vals[fu] > vals[fv]:',
    '            parent[fv] = fu',
    '        else:',
    '            parent[fu] = fv',
    '            ',
    '    return good_paths',
  ],
  javascript: [
    '// 好路径数目 (JavaScript 版)',
    'function numberOfGoodPaths(vals, edges) {',
    '  const n = vals.length;',
    '  const parent = Array.from({ length: n }, (_, i) => i);',
    '  const count = Array(n).fill(1);',
    '  ',
    '  function find(i) {',
    '    if (parent[i] !== i) parent[i] = find(parent[i]);',
    '    return parent[i];',
    '  }',
    '  ',
    '  edges.sort((a, b) => Math.max(vals[a[0]], vals[a[1]]) - Math.max(vals[b[0]], vals[b[1]]));',
    '  let ans = n;',
    '  ',
    '  for (const [u, v] of edges) {',
    '    const fu = find(u), fv = find(v);',
    '    if (vals[fu] === vals[fv]) {',
    '      ans += count[fu] * count[fv];',
    '      parent[fv] = fu;',
    '      count[fu] += count[fv];',
    '    } else if (vals[fu] > vals[fv]) {',
    '      parent[fv] = fu;',
    '    } else {',
    '      parent[fu] = fv;',
    '    }',
    '  }',
    '  return ans;',
    '}',
  ],
};

export const GOOD_PATHS_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🛤️ 好路径数目 (LeetCode 2421)</h3>
    <p>
      给你一棵 <code>n</code> 个节点的树，节点从 <code>0</code> 到 <code>n - 1</code> 编号。每个节点有一个点权 <code>vals[i]</code>。
    </p>
    <p>
      一条<b>好路径</b>是一条从节点 $a$ 到节点 $b$ 的简单路径，满足：
    </p>
    <ul>
      <li>起点与终点的点权相同：<code>vals[a] == vals[b]</code></li>
      <li>路径上的所有中间节点的点权都不大于起点点权：<code>vals[mid] &le; vals[a]</code></li>
    </ul>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">📥 输入示例</div>
      <div style="font-family: monospace; font-size: 12px; color: #0f172a;">
        vals = [1,3,2,1,3], edges = [[0,1],[0,2],[2,3],[2,4]]
      </div>
      <div style="font-weight: 700; color: #15803d; margin-top: 6px;">📤 输出: <code>6</code></div>
      <div style="font-size: 11px; color: #64748b;">
        解释：5 个单节点自身各为一条好路径。另外节点 1 与节点 4 点权均为 3，中间经过 0,2 权值分别为 1,2（均 &le; 3），构成第 6 条好路径！
      </div>
    </div>
  </div>
`;

export const GOOD_PATHS_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云点权升序加边与乘法原理分析</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 逆向思维：按点权升序逐步激活连通分量</div>
      <div style="font-size: 12px; color: #1e40af;">
        若直接在全图上 DFS 查找匹配点对，受中间高权点阻隔判断繁琐。<br/>
        反过来将边按 $\\max(vals[u], vals[v])$ 从小到大排序加入并查集。这样在处理权值 $w$ 时，<b>已加入的所有边构成的路径中间点点权必然 &le; $w$</b>！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 乘法原理：分量最大权同频碰撞</div>
      <div style="font-size: 12px; color: #15803d;">
        当一条边连接两个根节点 $fx, fy$ 且 <code>vals[fx] == vals[fy]</code> 时，两集合内各有 <code>count[fx]</code> 和 <code>count[fy]</code> 个最大权节点。
        两两跨集合配对产生 <code>count[fx] * count[fy]</code> 条全新的好路径！
      </div>
    </div>
  </div>
`;
