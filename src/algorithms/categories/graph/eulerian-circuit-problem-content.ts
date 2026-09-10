/**
 * 欧拉路径与欧拉回路 Hierholzer 算法 (Eulerian Path & Circuit)
 * 参考左程云《算法通关课》class067: 一笔画判定、度数平衡、当前弧优化与后序压栈 (洛谷 P7771 / LeetCode 332)
 */

export const EULERIAN_CIRCUIT_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 欧拉路径与 Hierholzer 算法 (洛谷 P7771 / LeetCode 332)',
    '// 核心思想：',
    '// 1. 度数校验：出度与入度差值判定欧拉回路或欧拉路径的存在性',
    '// 2. 当前弧优化 (head[u])：避免反复扫描已经遍历过的无用边，保证 O(V + E)',
    '// 3. 后序入栈与倒序输出：死胡同回溯时压入节点，子环自然嵌入主路径',
    'class EulerianHierholzer {',
    'public:',
    '    int n;',
    '    vector<vector<int>> graph;',
    '    vector<int> head, path;',
    '    ',
    '    EulerianHierholzer(int n) : n(n), graph(n + 1), head(n + 1, 0) {}',
    '    ',
    '    void addEdge(int u, int v) {',
    '        graph[u].push_back(v);',
    '    }',
    '    ',
    '    void dfs(int u) {',
    '        // 当前弧优化：head[u] 递增，走过即删除',
    '        while (head[u] < graph[u].size()) {',
    '            int v = graph[u][head[u]++];',
    '            dfs(v);',
    '        }',
    '        path.push_back(u); // 回溯压入后序栈',
    '    }',
    '    ',
    '    vector<int> solve(int startNode) {',
    '        // 邻接表排序保证字典序最小',
    '        for (int i = 1; i <= n; ++i) {',
    '            sort(graph[i].begin(), graph[i].end());',
    '        }',
    '        dfs(startNode);',
    '        reverse(path.begin(), path.end()); // 倒序得到正向回路',
    '        return path;',
    '    }',
    '};',
  ],
  java: [
    'package class067;',
    '',
    'import java.util.*;',
    '',
    '/**',
    ' * 欧拉路径与回路 - 左程云标准 Hierholzer 当前弧优化实现 (洛谷 P7771)',
    ' * 时间复杂度: O(V + E * log(deg))，空间复杂度: O(V + E)',
    ' * 核心机制: 深度优先探索 + 当前弧优化删边 + 逆序输出后序遍历序列',
    ' */',
    'public class Code01_EulerianCircuit {',
    '    public static class Solver {',
    '        public int n;',
    '        public ArrayList<ArrayList<Integer>> graph;',
    '        public int[] head;',
    '        public List<Integer> path;',
    '        ',
    '        public Solver(int n) {',
    '            this.n = n;',
    '            this.graph = new ArrayList<>();',
    '            for (int i = 0; i <= n; i++) graph.add(new ArrayList<>());',
    '            this.head = new int[n + 1];',
    '            this.path = new ArrayList<>();',
    '        }',
    '        ',
    '        public void addEdge(int u, int v) {',
    '            graph.get(u).add(v);',
    '        }',
    '        ',
    '        public void dfs(int u) {',
    '            // 当前弧优化：head[u] 直接跳过已访问边',
    '            while (head[u] < graph.get(u).size()) {',
    '                int v = graph.get(u).get(head[u]++);',
    '                dfs(v);',
    '            }',
    '            path.add(u); // 死胡同回溯压入栈',
    '        }',
    '        ',
    '        public List<Integer> getEulerianPath(int start) {',
    '            for (int i = 1; i <= n; i++) Collections.sort(graph.get(i));',
    '            dfs(start);',
    '            Collections.reverse(path);',
    '            return path;',
    '        }',
    '    }',
    '}',
  ],
  python: [
    '# 欧拉回路与欧拉路径 Hierholzer 算法 (Python 标准实现)',
    '# 核心原理: 当前弧优化跳过已走边 + 后序收集回溯压栈',
    '# 时间复杂度: O(V + E log E)，空间复杂度: O(V + E)',
    'import sys',
    'sys.setrecursionlimit(200000)',
    '',
    'class EulerianHierholzer:',
    '    def __init__(self, n: int):',
    '        self.n = n',
    '        self.graph = [[] for _ in range(n + 1)]',
    '        self.in_deg = [0] * (n + 1)',
    '        self.out_deg = [0] * (n + 1)',
    '        self.head = [0] * (n + 1)',
    '        self.path = []',
    '        ',
    '    def add_edge(self, u: int, v: int):',
    '        self.graph[u].append(v)',
    '        self.out_deg[u] += 1',
    '        self.in_deg[v] += 1',
    '        ',
    '    def check_validity(self) -> bool:',
    '        # 充要条件：所有节点入度等于出度（回路），或仅有一对奇点（路径）',
    '        diff_count = 0',
    '        for i in range(1, self.n + 1):',
    '            if self.in_deg[i] != self.out_deg[i]:',
    '                diff_count += 1',
    '        return diff_count == 0 or diff_count == 2',
    '        ',
    '    def dfs(self, u: int):',
    '        # 当前弧优化：每次循环递增指针，跳过已走边',
    '        while self.head[u] < len(self.graph[u]):',
    '            v = self.graph[u][self.head[u]]',
    '            self.head[u] += 1',
    '            self.dfs(v)',
    '        self.path.append(u)  # 回溯压入后序栈',
    '        ',
    '    def solve(self, start_node: int) -> list[int]:',
    '        # 邻接表排序保证字典序最小',
    '        for u in range(1, self.n + 1):',
    '            self.graph[u].sort()',
    '        self.dfs(start_node)',
    '        return self.path[::-1]  # 倒序即为一笔画欧拉回路',
  ],
  javascript: [
    '/**',
    ' * 欧拉回路与路径 Hierholzer 算法 (JavaScript 版)',
    ' * 解决一笔画问题：每条边恰好走一次',
    ' * 包含当前弧优化与度数奇偶判定',
    ' */',
    'class EulerianHierholzer {',
    '  constructor(n) {',
    '    this.n = n;',
    '    this.graph = Array.from({ length: n + 1 }, () => []);',
    '    this.inDeg = Array(n + 1).fill(0);',
    '    this.outDeg = Array(n + 1).fill(0);',
    '    this.head = Array(n + 1).fill(0);',
    '    this.path = [];',
    '  }',
    '  ',
    '  addEdge(u, v) {',
    '    this.graph[u].push(v);',
    '    this.outDeg[u]++;',
    '    this.inDeg[v]++;',
    '  }',
    '  ',
    '  checkEulerian() {',
    '    // 检查所有节点度数平衡条件',
    '    let diff = 0;',
    '    for (let i = 1; i <= this.n; i++) {',
    '      if (this.inDeg[i] !== this.outDeg[i]) diff++;',
    '    }',
    '    return diff === 0 || diff === 2;',
    '  }',
    '  ',
    '  dfs(u) {',
    '    // 当前弧优化：自增 head[u] 避免重复遍历边',
    '    while (this.head[u] < this.graph[u].length) {',
    '      const v = this.graph[u][this.head[u]++];',
    '      this.dfs(v);',
    '    }',
    '    this.path.push(u); // 回溯压入栈中',
    '  }',
    '  ',
    '  solve(startNode) {',
    '    for (let i = 1; i <= this.n; i++) {',
    '      this.graph[i].sort((a, b) => a - b);',
    '    }',
    '    this.dfs(startNode);',
    '    return this.path.reverse();',
    '  }',
    '}',
  ],
};

export const EULERIAN_CIRCUIT_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🎨 欧拉回路与一笔画 (Eulerian Circuit & Path)</h3>
    <p>
      给定一个连通图，请找到一条<b>恰好经过每一条边一次</b>的路径（一笔画问题）。
    </p>
    <ul>
      <li><b>欧拉回路 (Eulerian Circuit)</b>：起点与终点相同的欧拉路径。</li>
      <li><b>欧拉路径 (Eulerian Path)</b>：起点与终点不同的欧拉路径。</li>
    </ul>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">📐 欧拉图充分必要判定准则</div>
      <div style="font-size: 11.5px; color: #334155;">
        • <b>无向图</b>：连通且<b>奇度数节点数量为 0</b>（存在欧拉回路）或<b>恰好为 2</b>（存在以这两个奇点为端点的欧拉路径）。<br/>
        • <b>有向图</b>：所有节点入度等于出度（回路），或仅有起点 <code>out - in = 1</code> 与终点 <code>in - out = 1</code>，其余 <code>in == out</code>。
      </div>
    </div>
  </div>
`;

export const EULERIAN_CIRCUIT_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云 Hierholzer 算法与当前弧优化解析</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 为什么必须后序入栈并最终逆序？</div>
      <div style="font-size: 12px; color: #1e40af;">
        当 DFS 走到死胡同（无法继续向前扩展）时，该节点必然是路径的终点部分。<br/>
        在回溯时将走投无路的节点依次压入栈中，保证了“分支环路”被完整嵌入主环路中，最终逆序输出即为完美的一笔画路线！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 当前弧优化 (Current Arc Optimization)</div>
      <div style="font-size: 12px; color: #15803d;">
        使用 <code>head[u]</code> 记录节点 $u$ 当前处理到的邻接边下标，每次直接自增跳过已遍历的边，保证每条边仅被访问一次，将复杂度压至极速的 $O(V + E)$！
      </div>
    </div>
  </div>
`;
