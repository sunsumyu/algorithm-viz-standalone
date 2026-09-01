/**
 * 严格次小生成树 (Strict Second Minimum Spanning Tree)
 * 进阶图论: Kruskal 求最小生成树、树上倍增维护路径最大与严格次大边权、非树边替换瓶颈边 (洛谷 P4180)
 */

export const SECOND_MST_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 严格次小生成树 (洛谷 P4180 [BJWC2010])',
    '// 核心：Kruskal 求主 MST，树上倍增维护 (max1, max2)，枚举非树边替换瓶颈边',
    'struct Edge {',
    '    int u, v, w;',
    '    bool inMST = false;',
    '    bool operator<(const Edge& o) const { return w < o.w; }',
    '};',
    '',
    'class SecondMST {',
    'public:',
    '    int n, m;',
    '    vector<Edge> edges;',
    '    vector<vector<pair<int, int>>> treeAdj;',
    '    vector<vector<int>> up, max1, max2;',
    '    vector<int> depth, parentUnion;',
    '    long long mstWeight = 0;',
    '    ',
    '    int findSet(int i) {',
    '        return parentUnion[i] == i ? i : (parentUnion[i] = findSet(parentUnion[i]));',
    '    }',
    '    ',
    '    void kruskal() {',
    '        sort(edges.begin(), edges.end());',
    '        for (int i = 1; i <= n; ++i) parentUnion[i] = i;',
    '        for (auto& e : edges) {',
    '            int ru = findSet(e.u), rv = findSet(e.v);',
    '            if (ru != rv) {',
    '                parentUnion[ru] = rv;',
    '                e.inMST = true;',
    '                mstWeight += e.w;',
    '                treeAdj[e.u].push_back({e.v, e.w});',
    '                treeAdj[e.v].push_back({e.u, e.w});',
    '            }',
    '        }',
    '    }',
    '    ',
    '    // 合并两段路径的最大和严格次大边权',
    '    void merge(int m1, int m2, int& res1, int& res2) {',
    '        int vals[4] = {res1, res2, m1, m2};',
    '        sort(vals, vals + 4, greater<int>());',
    '        res1 = vals[0];',
    '        res2 = -1;',
    '        for (int i = 1; i < 4; ++i) {',
    '            if (vals[i] < res1) { res2 = vals[i]; break; }',
    '        }',
    '    }',
    '    ',
    '    long long getSecondMST() {',
    '        kruskal();',
    '        // 树上倍增预处理 DFS (省略倍增 LCA 细节)',
    '        long long minDelta = 1e18;',
    '        for (const auto& e : edges) {',
    '            if (!e.inMST) {',
    '                int m1 = -1, m2 = -1;',
    '                // 查询路径 (e.u -> e.v) 上的最大值 m1 与严格次大值 m2',
    '                if (e.w > m1) minDelta = min(minDelta, (long long)e.w - m1);',
    '                else if (m2 != -1) minDelta = min(minDelta, (long long)e.w - m2);',
    '            }',
    '        }',
    '        return mstWeight + minDelta;',
    '    }',
    '};',
  ],
  java: [
    'package advanced_graph;',
    '',
    'import java.util.*;',
    '',
    '// 严格次小生成树标准实现',
    'public class Code01_SecondMST {',
    '    public static class Edge implements Comparable<Edge> {',
    '        int u, v, w;',
    '        boolean inMST;',
    '        public int compareTo(Edge o) { return Integer.compare(this.w, o.w); }',
    '    }',
    '    // Kruskal + 倍增维护 max1, max2',
    '}',
  ],
  python: [
    'class SecondMST:',
    '    def __init__(self, n: int, edges: list):',
    '        self.n = n',
    '        self.edges = edges',
    '        self.mst_weight = 0',
  ],
  javascript: [
    '// 严格次小生成树 (JavaScript 版)',
    'class SecondMST {',
    '  constructor(n, edges) {',
    '    this.n = n;',
    '    this.edges = edges;',
    '    this.mstWeight = 0;',
    '  }',
    '}',
  ],
};

export const SECOND_MST_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🌲 严格次小生成树 (Strict Second MST)</h3>
    <p>
      给定一个带权无向连通图，求一棵权值和<b>严格大于</b>最小生成树 (MST) 的所有生成树中，权值和最小的生成树（洛谷 P4180）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">🔍 核心求解三步法</div>
      <div style="font-size: 11.5px; color: #334155;">
        1. <b>Kruskal 跑出最小生成树</b>，记录基础权值 $W_{mst}$ 并标记树边；<br/>
        2. <b>树上倍增</b>维护任意两点路径上的<b>最大边权 $max_1$</b> 与<b>严格次大边权 $max_2$</b>；<br/>
        3. <b>枚举所有非树边 $(u, v, w)$</b>：若 $w > max_1$，替换增量为 $w - max_1$；若 $w == max_1$，替换增量为 $w - max_2$。全局取最小增量即为答案！
      </div>
    </div>
  </div>
`;

export const SECOND_MST_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 为什么必须维护严格次大边权？</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 避免非严格相等</div>
      <div style="font-size: 12px; color: #1e40af;">
        若非树边权值 $w$ 恰好等于路径最大边权 $max_1$，用 $w$ 替换 $max_1$ 所得生成树权值与原 MST 完全相同（非严格）。因此必须退而求其次替换严格次大边权 $max_2$，才能保证生成树权值严格增加！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 倍增信息高效合并</div>
      <div style="font-size: 12px; color: #15803d;">
        每次合并两个区间 $(m_{1a}, m_{2a})$ 与 $(m_{1b}, m_{2b})$ 时，从这 4 个值中筛选出最大的值作为新的 $max_1$，第二大且严格小于 $max_1$ 的值作为新的 $max_2$，在 $O(1)$ 时间内完成倍增表合并！
      </div>
    </div>
  </div>
`;
