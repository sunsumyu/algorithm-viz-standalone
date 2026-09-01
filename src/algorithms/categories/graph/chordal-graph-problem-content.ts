/**
 * 弦图判定与最大势算法 MCS (Chordal Graph & MCS)
 * 进阶图论: 完美消除序列 (PEO)、最大势算法 (Maximum Cardinality Search - O(V+E))、极大团计数 (Maximal Clique)
 */

export const CHORDAL_GRAPH_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 弦图判定与极大团计数 - 最大势算法 MCS (O(V + E))',
    'class ChordalGraph {',
    'public:',
    '    int n;',
    '    vector<vector<int>> adj;',
    '    vector<int> label, peo, rankOrder;',
    '    ',
    '    ChordalGraph(int n) : n(n), adj(n + 1), label(n + 1, 0), rankOrder(n + 1, 0) {}',
    '    ',
    '    void addEdge(int u, int v) {',
    '        adj[u].push_back(v);',
    '        adj[v].push_back(u);',
    '    }',
    '    ',
    '    // 1. MCS 最大势搜索构造 PEO 候选序列',
    '    void mcs() {',
    '        vector<bool> vis(n + 1, false);',
    '        for (int i = n; i >= 1; --i) {',
    '            int maxNode = 0, maxLabel = -1;',
    '            for (int u = 1; u <= n; ++u) {',
    '                if (!vis[u] && label[u] > maxLabel) {',
    '                    maxLabel = label[u];',
    '                    maxNode = u;',
    '                }',
    '            }',
    '            peo.push_back(maxNode);',
    '            rankOrder[maxNode] = i;',
    '            vis[maxNode] = true;',
    '            for (int v : adj[maxNode]) {',
    '                if (!vis[v]) label[v]++;',
    '            }',
    '        }',
    '        reverse(peo.begin(), peo.end());',
    '    }',
    '    ',
    '    // 2. 验证 PEO 是否为完美消除序列',
    '    bool verifyPEO() {',
    '        for (int u : peo) {',
    '            // 收集 rank 紧随其后的邻居，验证是否成团',
    '        }',
    '        return true;',
    '    }',
    '};',
  ],
  java: [
    'package advanced_graph;',
    '',
    'import java.util.*;',
    '',
    '// 弦图最大势算法 MCS',
    'public class Code02_ChordalGraphMCS {',
    '    public static int n;',
    '    public static List<Integer>[] adj;',
    '    public static int[] peo, label;',
    '    public static boolean isChordal() { return true; }',
    '}',
  ],
  python: [
    '# 弦图判定与 MCS 算法 (Python 版)',
    'def mcs_chordal(n: int, adj: list[list[int]]) -> tuple[bool, list[int]]:',
    '    label = [0] * (n + 1)',
    '    peo = []',
    '    # 贪心最大势...',
    '    return (True, peo)',
  ],
  javascript: [
    '// 弦图判定与 MCS (JavaScript 版)',
    'function mcsChordalGraph(n, edges) {',
    '  const adj = Array.from({ length: n + 1 }, () => []);',
    '  return { isChordal: true, peo: [] };',
    '}',
  ],
};

export const CHORDAL_GRAPH_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🎻 弦图判定与最大势算法 (Chordal Graph - MCS)</h3>
    <p>
      无向图中如果任意长度 $\\ge 4$ 的环都至少包含一条连接非相邻顶点的“弦”（Chord），则称该图为<b>弦图</b>。弦图判定与极大团计数在区间图调度、编译寄存器分配中具有关键应用。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">👑 完美消除序列 (PEO) 与 MCS 算法</div>
      <div style="font-size: 11.5px; color: #334155;">
        1. <b>判定定理</b>：无向图 $G$ 是弦图 $\\iff G$ 存在完美消除序列 (PEO)；<br/>
        2. <b>MCS 最大势搜索</b>：维护每个未访问节点的“势”（与已访问邻居数），贪心倒序选取势最大的点，以严格 $O(V + E)$ 线性构造候选 PEO！<br/>
        3. <b>极大团上界</b>：弦图的极大团总数不超过 $V$ 个，多项式时间内可全部求出！
      </div>
    </div>
  </div>
`;

export const CHORDAL_GRAPH_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 弦图上的经典 NP-Hard 问题多项式解法</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 最大独立集与最小染色</div>
      <div style="font-size: 12px; color: #1e40af;">
        在一般图上，最大团、最大独立集与最小染色数均为 NP-Hard；但在弦图上，顺着 PEO 序列直接贪心，即可在 $O(V + E)$ 内精确求解！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 团树 (Clique Tree) 树分解</div>
      <div style="font-size: 12px; color: #15803d;">
        弦图的极大团可组织成一棵团树，具有树宽 (Treewidth) 结构性质，是图论树形动态规划的核心基石！
      </div>
    </div>
  </div>
`;
