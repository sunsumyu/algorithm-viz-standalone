/**
 * Kruskal 重构树与路径瓶颈 LCA (Kruskal Reconstruction Tree)
 * 参考左程云《算法通关课》进阶图论: 边权升序构造 2n-1 节点二叉树、LCA 快速查询路径瓶颈与子树可达性
 */

export const KRUSKAL_TREE_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <numeric>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// Kruskal 重构树 (Kruskal Reconstruction Tree)',
    '// 核心：边权升序合并，新建虚点作为左右子树的父节点，点权单调，LCA 对应路径瓶颈',
    'struct Edge {',
    '    int u, v, w;',
    '    bool operator<(const Edge& o) const { return w < o.w; }',
    '};',
    '',
    'class KruskalReconstructionTree {',
    'public:',
    '    int n, nodeCount;',
    '    vector<int> parent, val;',
    '    vector<vector<int>> tree;',
    '    ',
    '    KruskalReconstructionTree(int n) : n(n), nodeCount(n), parent(2 * n + 1), val(2 * n + 1, 0), tree(2 * n + 1) {',
    '        iota(parent.begin(), parent.end(), 0);',
    '    }',
    '    ',
    '    int find(int i) {',
    '        if (parent[i] != i) parent[i] = find(parent[i]);',
    '        return parent[i];',
    '    }',
    '    ',
    '    void build(vector<Edge>& edges) {',
    '        sort(edges.begin(), edges.end());',
    '        ',
    '        for (const auto& e : edges) {',
    '            int fu = find(e.u), fv = find(e.v);',
    '            if (fu != fv) {',
    '                nodeCount++; // 新建虚节点',
    '                val[nodeCount] = e.w;',
    '                parent[nodeCount] = nodeCount;',
    '                parent[fu] = nodeCount;',
    '                parent[fv] = nodeCount;',
    '                tree[nodeCount].push_back(fu);',
    '                tree[nodeCount].push_back(fv);',
    '            }',
    '        }',
    '    }',
    '    ',
    '    // 原图中 u, v 路径最大边权最小值 == 重构树上 LCA(u, v) 的点权',
    '    int queryBottleneck(int lcaNode) {',
    '        return val[lcaNode];',
    '    }',
    '};',
  ],
  java: [
    'package class072;',
    '',
    'import java.util.*;',
    '',
    '// Kruskal 重构树 - 左程云进阶图论标准实现',
    'public class Code01_KruskalReconstructionTree {',
    '    public static class Edge {',
    '        public int u, v, w;',
    '        public Edge(int u, int v, int w) { this.u = u; this.v = v; this.w = w; }',
    '    }',
    '    ',
    '    public static int[] father, val;',
    '    public static List<Integer>[] tree;',
    '    public static int nodeCount;',
    '    ',
    '    public static int find(int i) {',
    '        if (father[i] != i) father[i] = find(father[i]);',
    '        return father[i];',
    '    }',
    '    ',
    '    public static void build(int n, List<Edge> edges) {',
    '        father = new int[2 * n + 1];',
    '        val = new int[2 * n + 1];',
    '        tree = new ArrayList[2 * n + 1];',
    '        for (int i = 0; i <= 2 * n; i++) {',
    '            father[i] = i;',
    '            tree[i] = new ArrayList<>();',
    '        }',
    '        nodeCount = n;',
    '        edges.sort((a, b) -> a.w - b.w);',
    '        ',
    '        for (Edge e : edges) {',
    '            int fu = find(e.u), fv = find(e.v);',
    '            if (fu != fv) {',
    '                nodeCount++;',
    '                val[nodeCount] = e.w;',
    '                father[nodeCount] = nodeCount;',
    '                father[fu] = nodeCount;',
    '                father[fv] = nodeCount;',
    '                tree[nodeCount].add(fu);',
    '                tree[nodeCount].add(fv);',
    '            }',
    '        }',
    '    }',
    '}',
  ],
  python: [
    'class KruskalReconstructionTree:',
    '    def __init__(self, n: int):',
    '        self.n = n',
    '        self.node_count = n',
    '        self.parent = list(range(2 * n + 1))',
    '        self.val = [0] * (2 * n + 1)',
    '        self.tree = [[] for _ in range(2 * n + 1)]',
    '        ',
    '    def find(self, i: int) -> int:',
    '        if self.parent[i] != i:',
    '            self.parent[i] = self.find(self.parent[i])',
    '        return self.parent[i]',
    '        ',
    '    def build(self, edges: list[tuple[int, int, int]]):',
    '        edges.sort(key=lambda x: x[2])',
    '        for u, v, w in edges:',
    '            fu, fv = self.find(u), self.find(v)',
    '            if fu != fv:',
    '                self.node_count += 1',
    '                nc = self.node_count',
    '                self.val[nc] = w',
    '                self.parent[nc] = nc',
    '                self.parent[fu] = nc',
    '                self.parent[fv] = nc',
    '                self.tree[nc].append(fu)',
    '                self.tree[nc].append(fv)',
  ],
  javascript: [
    '// Kruskal 重构树 (JavaScript 版)',
    'class KruskalReconstructionTree {',
    '  constructor(n) {',
    '    this.n = n;',
    '    this.nodeCount = n;',
    '    this.parent = Array.from({ length: 2 * n + 1 }, (_, i) => i);',
    '    this.val = Array(2 * n + 1).fill(0);',
    '    this.tree = Array.from({ length: 2 * n + 1 }, () => []);',
    '  }',
    '  ',
    '  find(i) {',
    '    if (this.parent[i] !== i) this.parent[i] = this.find(this.parent[i]);',
    '    return this.parent[i];',
    '  }',
    '  ',
    '  build(edges) {',
    '    edges.sort((a, b) => a.w - b.w);',
    '    for (const { u, v, w } of edges) {',
    '      const fu = this.find(u), fv = this.find(v);',
    '      if (fu !== fv) {',
    '        this.nodeCount++;',
    '        const nc = this.nodeCount;',
    '        this.val[nc] = w;',
    '        this.parent[nc] = nc;',
    '        this.parent[fu] = nc;',
    '        this.parent[fv] = nc;',
    '        this.tree[nc].push(fu, fv);',
    '      }',
    '    }',
    '  }',
    '}',
  ],
};

export const KRUSKAL_TREE_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🌲 Kruskal 重构树与路径瓶颈 LCA</h3>
    <p>
      在无向带权图中，我们经常需要快速回答：
    </p>
    <ul>
      <li>两点 $u, v$ 之间所有可能路径中，“最大边权的最小值”（路径瓶颈距离）是多少？</li>
      <li>从节点 $u$ 出发，只经过边权 $\le x$ 的边，能到达多少个节点？</li>
    </ul>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">🌟 Kruskal 重构树绝妙构造</div>
      <div style="font-size: 11.5px; color: #334155;">
        将边按权值升序排序。每次连接两个连通块时，<b>新建一个虚节点代表当前边</b>（点权为边权 $w$），将两块的根分别挂为它的左右儿子！
        最终生成一棵共 $2n-1$ 个节点的二叉树，原图中任意两点的路径瓶颈严格等价于重构树上的 <b>LCA 节点的点权</b>！
      </div>
    </div>
  </div>
`;

export const KRUSKAL_TREE_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云 Kruskal 重构树核心性质</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 点权大根堆/小根堆性质</div>
      <div style="font-size: 12px; color: #1e40af;">
        由于按边权升序加点，从叶子到根节点的点权是<b>单调递增</b>的。
        因此树上倍增可以在 $O(\log n)$ 内快速找到深度最浅且点权 $\le x$ 的祖先节点！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 连通块转化连通子树</div>
      <div style="font-size: 12px; color: #15803d;">
        原图中所有受限可达节点，完美对应重构树上该祖先节点的<b>整个子树叶子节点集合</b>（通过 DFS 序拍平成连续区间，可直接套用线段树/树状数组）！
      </div>
    </div>
  </div>
`;
