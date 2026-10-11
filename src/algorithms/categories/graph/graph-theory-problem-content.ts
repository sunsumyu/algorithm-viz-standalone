/**
 * 图论理论基础 (Graph Theory) — 讲义与四语言代码
 */

export const GRAPH_THEORY_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    '// === 图论表示基础 (Java - 邻接矩阵 vs 邻接表) ===',
    'public class GraphTheory {',
    '    // 1. 邻接矩阵 (V x V 二维数组, 空间 O(V²))',
    '    int[][] matrix = new int[5][5];',
    '    // 2. 邻接表 (List 数组, 空间 O(V+E))',
    '    List<List<Integer>> adj = new ArrayList<>();',
    '    ',
    '    // 添加边 (u, v)',
    '    public void addEdge(int u, int v) {',
    '        matrix[u][v] = matrix[v][u] = 1;',
    '        adj.get(u).add(v); adj.get(v).add(u);',
    '    }',
    '    // 删除边 (u, v)',
    '    public void removeEdge(int u, int v) {',
    '        matrix[u][v] = matrix[v][u] = 0;',
    '        adj.get(u).remove(Integer.valueOf(v));',
    '        adj.get(v).remove(Integer.valueOf(u));',
    '    }',
    '}',
  ],
  cpp: [
    '// === 图论表示基础 (C++ - 邻接矩阵 vs 邻接表) ===',
    'class GraphTheory {',
    '    // 1. 邻接矩阵 (V x V 二维 vector, 空间 O(V²))',
    '    vector<vector<int>> matrix = vector<vector<int>>(5, vector<int>(5, 0));',
    '    // 2. 邻接表 (vector 数组, 空间 O(V+E))',
    '    vector<vector<int>> adj = vector<vector<int>>(5);',
    'public:',
    '    // 添加边 (u, v)',
    '    void addEdge(int u, int v) {',
    '        matrix[u][v] = matrix[v][u] = 1;',
    '        adj[u].push_back(v); adj[v].push_back(u);',
    '    }',
    '    // 删除边 (u, v)',
    '    void removeEdge(int u, int v) {',
    '        matrix[u][v] = matrix[v][u] = 0;',
    '        erase(adj[u], v); erase(adj[v], u);',
    '    }',
    '};',
    '// 总结: 稠密图选矩阵, 稀疏图选邻接表',
  ],
  python: [
    '# === 图论表示基础 (Python - 邻接矩阵 vs 邻接表) ===',
    'class GraphTheory:',
    '    # 1. 邻接矩阵 (二维列表, 空间 O(V²))',
    '    matrix = [[0] * 5 for _ in range(5)]',
    '    # 2. 邻接表 (字典/列表, 空间 O(V+E))',
    '    adj = [[] for _ in range(5)]',
    '    ',
    '    # 添加边 (u, v)',
    '    def add_edge(self, u: int, v: int) -> None:',
    '        self.matrix[u][v] = self.matrix[v][u] = 1',
    '        self.adj[u].append(v); self.adj[v].append(u)',
    '    ',
    '    # 删除边 (u, v)',
    '    def remove_edge(self, u: int, v: int) -> None:',
    '        self.matrix[u][v] = self.matrix[v][u] = 0',
    '        self.adj[u].remove(v); self.adj[v].remove(u)',
    '    ',
    '',
    '# 总结: 稠密图选矩阵, 稀疏图选邻接表',
  ],
  javascript: [
    '// === 图论表示基础 (JavaScript - 邻接矩阵 vs 邻接表) ===',
    'class GraphTheory {',
    '  // 1. 邻接矩阵 (V x V, 空间 O(V²))',
    '  matrix = Array.from({ length: 5 }, () => Array(5).fill(0));',
    '  // 2. 邻接表 (数组, 空间 O(V+E))',
    '  adj = Array.from({ length: 5 }, () => []);',
    '  ',
    '  // 添加边 (u, v)',
    '  addEdge(u, v) {',
    '    this.matrix[u][v] = this.matrix[v][u] = 1;',
    '    this.adj[u].push(v); this.adj[v].push(u);',
    '  }',
    '  // 删除边 (u, v)',
    '  removeEdge(u, v) {',
    '    this.matrix[u][v] = this.matrix[v][u] = 0;',
    '    this.adj[u] = this.adj[u].filter(x => x !== v);',
    '    this.adj[v] = this.adj[v].filter(x => x !== u);',
    '  }',
    '}',
  ],
};

export const GRAPH_THEORY_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.7; color: #cbd5e1; display: flex; flex-direction: column; gap: 12px;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 7px; border-radius: 4px; background: rgba(16, 185, 129, 0.15); color: #34d399; font-weight: 700; font-size: 11px; border: 1px solid rgba(16, 185, 129, 0.3);">图论基石</span>
      <span style="padding: 2px 7px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-weight: 700; font-size: 11px; border: 1px solid rgba(56, 189, 248, 0.3);">数据结构选型</span>
      <span style="font-size: 13px; font-weight: 700; color: #f8fafc;">图的表示方法：邻接矩阵 vs 邻接表</span>
    </div>
    <p style="margin: 0;">
      图 $G = (V, E)$ 由顶点集合 $V$ 与边集合 $E$ 构成。在算法工程中，最核心的两大表示法是<b>邻接矩阵 (Adjacency Matrix)</b> 与 <b>邻接表 (Adjacency List)</b>。
    </p>

    <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(16, 185, 129, 0.3); border-left: 4px solid #10b981; padding: 10px 14px; border-radius: 6px;">
      <div style="font-weight: 700; color: #34d399; margin-bottom: 6px;">⚡ 两大表示法全景对决</div>
      <div style="font-size: 12px; color: #cbd5e1; display: flex; flex-direction: column; gap: 4px;">
        <div>1. <b>邻接矩阵 (Matrix)</b>：$V \\times V$ 二维布尔/整型数组。判边仅需 <b>O(1)</b>，空间占用恒定 <b>O(V²)</b>。适合顶点少、边极稠密的图 ($E \\approx V^2$) 或 Floyd-Warshall 算法。</div>
        <div>2. <b>邻接表 (List)</b>：每个顶点维护一个出边邻接链表。空间占用仅 <b>O(V + E)</b>，遍历邻居效率极高。是绝大多数稀疏图算法（Dijkstra、BFS、DFS、拓扑排序）的标准首选。</div>
        <div>3. <b>链式前向星 (Forward Star)</b>：数组模拟静态链表，具备极致的 CPU 缓存局部性与内存友好度，常用于竞赛或极端性能场景。</div>
      </div>
    </div>
  </div>
`;

export const GRAPH_THEORY_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.7; color: #cbd5e1; display: flex; flex-direction: column; gap: 12px;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 7px; border-radius: 4px; background: rgba(245, 158, 11, 0.15); color: #fbbf24; font-weight: 700; font-size: 11px; border: 1px solid rgba(245, 158, 11, 0.3);">性能权衡指南</span>
      <span style="font-size: 13px; font-weight: 700; color: #f8fafc;">时空复杂度与操作效率全览</span>
    </div>

    <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(245, 158, 11, 0.25); border-left: 4px solid #f59e0b; border-radius: 6px; padding: 10px 14px;">
      <div style="font-weight: 700; color: #fbbf24; margin-bottom: 4px;">📊 核心操作时空对照表</div>
      <div style="font-size: 12px; color: #cbd5e1; display: flex; flex-direction: column; gap: 4px;">
        <div>• <b>空间占用</b>：矩阵 $O(V^2)$ vs 邻接表 $O(V + E)$</div>
        <div>• <b>判断边 (u, v) 是否存在</b>：矩阵 $O(1)$ vs 邻接表 $O(\\text{deg}(u))$</div>
        <div>• <b>枚举顶点 u 的所有出边</b>：矩阵 $O(V)$ vs 邻接表 $O(\\text{deg}(u))$</div>
        <div>• <b>动态加边 / 删边</b>：矩阵 $O(1)$ vs 邻接表 $O(1) \\sim O(\\text{deg}(u))$</div>
      </div>
    </div>
  </div>
`;
