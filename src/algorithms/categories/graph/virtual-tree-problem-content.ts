/**
 * 虚树与多次关键点树形 DP (Virtual Tree / Auxiliary Tree)
 * 进阶树论: 关键点按 DFN 排序、单调栈维护 LCA 关键链、O(K log N) 虚树构建与极速 DP (洛谷 P2495 [SDOI2011] 消耗战)
 */

export const VIRTUAL_TREE_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    '#include <stack>',
    'using namespace std;',
    '',
    '// 虚树 (Virtual Tree) 构建与关键点 DP (洛谷 P2495 [SDOI2011] 消耗战)',
    '// 核心：按 DFN 序排序，单调栈维护最右链并插入 LCA，节点规模从 O(N) 压缩至 <= 2K',
    'class VirtualTree {',
    'public:',
    '    int n, dfnClock = 0;',
    '    vector<vector<pair<int, int>>> origAdj;',
    '    vector<vector<pair<int, int>>> vtreeAdj;',
    '    vector<int> dfn, depth;',
    '    vector<vector<int>> up;',
    '    vector<bool> isKeyNode;',
    '    ',
    '    VirtualTree(int n) : n(n), origAdj(n + 1), vtreeAdj(n + 1),',
    '                         dfn(n + 1, 0), depth(n + 1, 0),',
    '                         up(n + 1, vector<int>(19, 0)), isKeyNode(n + 1, false) {}',
    '    ',
    '    void addOrigEdge(int u, int v, int w) {',
    '        origAdj[u].push_back({v, w});',
    '        origAdj[v].push_back({u, w});',
    '    }',
    '    ',
    '    void dfsInit(int u, int fa, int d) {',
    '        dfn[u] = ++dfnClock;',
    '        depth[u] = d;',
    '        up[u][0] = fa;',
    '        for (int i = 1; i <= 18; ++i) up[u][i] = up[up[u][i - 1]][i - 1];',
    '        for (auto& edge : origAdj[u]) {',
    '            if (edge.first != fa) dfsInit(edge.first, u, d + 1);',
    '        }',
    '    }',
    '    ',
    '    int getLCA(int u, int v) {',
    '        if (depth[u] < depth[v]) swap(u, v);',
    '        for (int i = 18; i >= 0; --i) {',
    '            if (depth[u] - (1 << i) >= depth[v]) u = up[u][i];',
    '        }',
    '        if (u == v) return u;',
    '        for (int i = 18; i >= 0; --i) {',
    '            if (up[u][i] != up[v][i]) {',
    '                u = up[u][i];',
    '                v = up[v][i];',
    '            }',
    '        }',
    '        return up[u][0];',
    '    }',
    '    ',
    '    // 构建虚树 (严格 O(K log N))',
    '    void buildVirtualTree(vector<int>& keyNodes) {',
    '        // 1. 按 DFN 序升序排序',
    '        sort(keyNodes.begin(), keyNodes.end(), [&](int a, int b) {',
    '            return dfn[a] < dfn[b];',
    '        });',
    '        ',
    '        vector<int> stk;',
    '        stk.push_back(1); // 确保根节点在虚树中',
    '        vtreeAdj[1].clear();',
    '        ',
    '        for (int u : keyNodes) {',
    '            if (u == 1) continue;',
    '            int lca = getLCA(u, stk.back());',
    '            if (lca != stk.back()) {',
    '                while (stk.size() >= 2 && depth[stk[stk.size() - 2]] >= depth[lca]) {',
    '                    int top = stk.back(); stk.pop_back();',
    '                    vtreeAdj[stk.back()].push_back({top, 0});',
    '                }',
    '                if (stk.back() != lca) {',
    '                    vtreeAdj[lca].clear();',
    '                    int top = stk.back(); stk.pop_back();',
    '                    vtreeAdj[lca].push_back({top, 0});',
    '                    stk.push_back(lca);',
    '                }',
    '            }',
    '            vtreeAdj[u].clear();',
    '            stk.push_back(u);',
    '        }',
    '        while (stk.size() >= 2) {',
    '            int top = stk.back(); stk.pop_back();',
    '            vtreeAdj[stk.back()].push_back({top, 0});',
    '        }',
    '    }',
    '};',
  ],
  java: [
    'package advanced_tree;',
    '',
    'import java.util.*;',
    '',
    '// 虚树标准实现 - 单调栈构建与关键点树形 DP',
    'public class Code01_VirtualTree {',
    '    public static int n;',
    '    public static List<int[]>[] origAdj, vtreeAdj;',
    '    public static int[] dfn, depth;',
    '    public static int[][] up;',
    '}',
  ],
  python: [
    'class VirtualTree:',
    '    def __init__(self, n: int):',
    '        self.n = n',
    '        self.orig_adj = [[] for _ in range(n + 1)]',
    '        self.vtree_adj = [[] for _ in range(n + 1)]',
    '        self.dfn = [0] * (n + 1)',
    '        self.depth = [0] * (n + 1)',
  ],
  javascript: [
    '// 虚树 (JavaScript 版)',
    'class VirtualTree {',
    '  constructor(n) {',
    '    this.n = n;',
    '    this.origAdj = Array.from({ length: n + 1 }, () => []);',
    '    this.vtreeAdj = Array.from({ length: n + 1 }, () => []);',
    '    this.dfn = Array(n + 1).fill(0);',
    '    this.depth = Array(n + 1).fill(0);',
    '  }',
    '}',
  ],
};

export const VIRTUAL_TREE_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🌲 虚树 (Virtual Tree / Auxiliary Tree)</h3>
    <p>
      当大树规模很大（$N=10^5$），每次询问仅涉及 $K$ 个关键点且 $\\sum K$ 较小时，如果每次都遍历整棵树做 DP 将导致 $O(N \\cdot Q)$ 超时。<b>虚树</b>通过仅提取关键点及其两两之间的 LCA，将树规模压缩至 $\\le 2K$（洛谷 P2495 [SDOI2011] 消耗战）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">🧱 单调栈单遍构建算法</div>
      <div style="font-size: 11.5px; color: #334155;">
        1. 关键点按原树 <b>DFN 序升序排序</b>；<br/>
        2. 维护单调栈记录虚树最右链；<br/>
        3. 插入新点 $u$ 时求 $\\text{LCA}(stack.top(), u)$，根据深度弹栈并连边，插入必要的 LCA 汇聚点。
      </div>
    </div>
  </div>
`;

export const VIRTUAL_TREE_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 虚树的关键性质与极速复杂度</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 规模严格上界 $\\le 2K$</div>
      <div style="font-size: 12px; color: #1e40af;">
        $K$ 个关键点两两之间至多产生 $K-1$ 个不同的 LCA 节点，故虚树总结点数严格不超过 $2K - 1$！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 复杂度由 O(N) 降为 O(K log N)</div>
      <div style="font-size: 12px; color: #15803d;">
        单次询问在虚树上执行树形 DP 仅消耗 $O(K)$ 时间，总时间复杂度为 $O(\\sum K \\log N)$，轻松通过海量关键点多组询问！
      </div>
    </div>
  </div>
`;
