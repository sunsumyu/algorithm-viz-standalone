/**
 * 差分约束系统与 SPFA 负环判定 (System of Difference Constraints)
 * 参考左程云《算法通关课》class070: 三角不等式向最短路转化、超级源点建图与负环无解检测 (洛谷 P5960)
 */

export const DIFF_CONSTRAINTS_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <queue>',
    'using namespace std;',
    '',
    '// 差分约束系统 (洛谷 P5960 / LeetCode)',
    '// 不等式: x_i - x_j <= c -> 从 j 向 i 连一条权重为 c 的有向边',
    'struct Edge { int to, weight; };',
    '',
    'bool solveDifferenceConstraints(int n, const vector<vector<int>>& constraints, vector<int>& ans) {',
    '    vector<vector<Edge>> graph(n + 1);',
    '    ',
    '    // 1. 根据不等式 x_u - x_v <= w 建边: v -> u (权值 w)',
    '    for (const auto& c : constraints) {',
    '        int u = c[0], v = c[1], w = c[2];',
    '        graph[v].push_back({u, w});',
    '    }',
    '    ',
    '    // 2. 超级源点 0 向所有节点连权值为 0 的边',
    '    for (int i = 1; i <= n; ++i) {',
    '        graph[0].push_back({i, 0});',
    '    }',
    '    ',
    '    // 3. SPFA 算法求最短路并检测负权环',
    '    vector<int> dist(n + 1, 1e9);',
    '    vector<int> cnt(n + 1, 0);',
    '    vector<bool> inQueue(n + 1, false);',
    '    queue<int> q;',
    '    ',
    '    dist[0] = 0; q.push(0); inQueue[0] = true;',
    '    ',
    '    while (!q.empty()) {',
    '        int u = q.front(); q.pop(); inQueue[u] = false;',
    '        ',
    '        for (const auto& e : graph[u]) {',
    '            int v = e.to, w = e.weight;',
    '            if (dist[v] > dist[u] + w) {',
    '                dist[v] = dist[u] + w;',
    '                cnt[v] = cnt[u] + 1;',
    '                if (cnt[v] > n) return false; // 存在负环，系统无解',
    '                if (!inQueue[v]) {',
    '                    q.push(v);',
    '                    inQueue[v] = true;',
    '                }',
    '            }',
    '        }',
    '    }',
    '    ans = dist;',
    '    return true; // 存在可行解',
    '}',
  ],
  java: [
    'package class070;',
    '',
    'import java.util.*;',
    '',
    '// 差分约束系统 - 左程云标准超级源点 SPFA 实现',
    'public class Code01_DifferenceConstraints {',
    '    public static class Edge {',
    '        int to, weight;',
    '        Edge(int t, int w) { to = t; weight = w; }',
    '    }',
    '    ',
    '    public static boolean solve(int n, int[][] constraints, int[] dist) {',
    '        List<Edge>[] graph = new ArrayList[n + 1];',
    '        for (int i = 0; i <= n; i++) graph[i] = new ArrayList<>();',
    '        ',
    '        for (int[] c : constraints) {',
    '            graph[c[1]].add(new Edge(c[0], c[2]));',
    '        }',
    '        for (int i = 1; i <= n; i++) {',
    '            graph[0].add(new Edge(i, 0));',
    '        }',
    '        ',
    '        Arrays.fill(dist, 1000000000);',
    '        int[] count = new int[n + 1];',
    '        boolean[] inQueue = new boolean[n + 1];',
    '        Queue<Integer> q = new LinkedList<>();',
    '        ',
    '        dist[0] = 0; q.offer(0); inQueue[0] = true;',
    '        ',
    '        while (!q.isEmpty()) {',
    '            int u = q.poll(); inQueue[u] = false;',
    '            for (Edge e : graph[u]) {',
    '                if (dist[e.to] > dist[u] + e.weight) {',
    '                    dist[e.to] = dist[u] + e.weight;',
    '                    count[e.to] = count[u] + 1;',
    '                    if (count[e.to] > n) return false;',
    '                    if (!inQueue[e.to]) {',
    '                        q.offer(e.to);',
    '                        inQueue[e.to] = true;',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return true;',
    '    }',
    '}',
  ],
  python: [
    'from collections import deque',
    '',
    'def solve_difference_constraints(n: int, constraints: list[list[int]]):',
    '    graph = [[] for _ in range(n + 1)]',
    '    ',
    '    for u, v, w in constraints:',
    '        graph[v].append((u, w))',
    '    for i in range(1, n + 1):',
    '        graph[0].append((i, 0))',
    '        ',
    '    dist = [float("inf")] * (n + 1)',
    '    count = [0] * (n + 1)',
    '    in_queue = [False] * (n + 1)',
    '    ',
    '    q = deque([0])',
    '    dist[0] = 0',
    '    in_queue[0] = True',
    '    ',
    '    while q:',
    '        u = q.popleft()',
    '        in_queue[u] = False',
    '        ',
    '        for v, w in graph[u]:',
    '            if dist[v] > dist[u] + w:',
    '                dist[v] = dist[u] + w',
    '                count[v] = count[u] + 1',
    '                if count[v] > n:',
    '                    return False, [] # 负环无解',
    '                if not in_queue[v]:',
    '                    q.append(v)',
    '                    in_queue[v] = True',
    '                    ',
    '    return True, dist[1:]',
  ],
  javascript: [
    '// 差分约束系统 (JavaScript 版)',
    'function solveDiffConstraints(n, constraints) {',
    '  const graph = Array.from({ length: n + 1 }, () => []);',
    '  for (const [u, v, w] of constraints) {',
    '    graph[v].push({ to: u, weight: w });',
    '  }',
    '  for (let i = 1; i <= n; i++) {',
    '    graph[0].push({ to: i, weight: 0 });',
    '  }',
    '  ',
    '  const dist = Array(n + 1).fill(Infinity);',
    '  const count = Array(n + 1).fill(0);',
    '  const inQueue = Array(n + 1).fill(false);',
    '  const q = [0];',
    '  dist[0] = 0; inQueue[0] = true;',
    '  ',
    '  while (q.length > 0) {',
    '    const u = q.shift();',
    '    inQueue[u] = false;',
    '    ',
    '    for (const { to: v, weight: w } of graph[u]) {',
    '      if (dist[v] > dist[u] + w) {',
    '        dist[v] = dist[u] + w;',
    '        count[v] = count[u] + 1;',
    '        if (count[v] > n) return { feasible: false, dist: [] };',
    '        if (!inQueue[v]) {',
    '          q.push(v);',
    '          inQueue[v] = true;',
    '        }',
    '      }',
    '    }',
    '  }',
    '  return { feasible: true, dist: dist.slice(1) };',
    '}',
  ],
};

export const DIFF_CONSTRAINTS_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">⚖️ 差分约束系统 (System of Difference Constraints)</h3>
    <p>
      包含 $n$ 个变量 $x_1, x_2, \dots, x_n$ 以及 $m$ 个形如 <code>x_i - x_j &le; c_k</code> 的线性不等式约束。
    </p>
    <p>
      请判断该差分约束系统是否存在一组满足所有不等式的实数解。如果存在，输出其中一组解；如果由于逻辑矛盾不存在解（负环），报告无解。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">📐 图论同构转换法则</div>
      <div style="font-size: 11.5px; color: #334155;">
        不等式 $x_i - x_j \\le c \\iff x_i \\le x_j + c$。<br/>
        对比最短路三角不等式 $dist[i] \\le dist[j] + w(j, i)$，二者<b>形式完全相同</b>！<br/>
        因此建立有向边 <code>j &rarr; i (权值 c)</code>，并通过 SPFA 计算最短路即可求得可行解！
      </div>
    </div>
  </div>
`;

export const DIFF_CONSTRAINTS_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云超级源点与负环判定解析</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 为什么必须引入超级源点 0？</div>
      <div style="font-size: 12px; color: #1e40af;">
        原图可能不连通（由多个独立的连通块组成）。建立超级源点 0 并向所有点连边 <code>0 &rarr; i (权值 0)</code>，既保证了从源点 0 出发能遍历到所有变量，又赋予了 $x_i \\le 0$ 的统一基准上界。
      </div>
    </div>

    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #991b1b; margin-bottom: 4px;">2. 负权环与代数矛盾的等价性</div>
      <div style="font-size: 12px; color: #b91c1c;">
        若存在环 $x_1 - x_2 \le -3$ 且 $x_2 - x_1 \le 2$，两式相加得到 $0 \le -1$（荒谬的数学矛盾）。在图论中这恰好对应一条权值之和为 $-1$ 的负权环。SPFA 节点入队步数超过 $n$ 即可精准捕捉！
      </div>
    </div>
  </div>
`;
