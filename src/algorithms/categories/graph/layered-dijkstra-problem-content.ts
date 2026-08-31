/**
 * 分层图最短路 (Layered Graph Dijkstra) - 题目描述、算法分析与多语言代码实现
 * 参考左程云《算法通关课》【必备篇】class064: 飞行路线 (洛谷 P4568) / K 次免费乘车券
 */

export const LAYERED_DIJKSTRA_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <queue>',
    '#include <cstring>',
    'using namespace std;',
    '',
    '// 状态节点：city 城市编号, used 已用免费券数, cost 累计花费',
    'struct State {',
    '    int city;',
    '    int used;',
    '    int cost;',
    '    bool operator>(const State& other) const {',
    '        return cost > other.cost; // 小根堆',
    '    }',
    '};',
    '',
    'struct Edge {',
    '    int to, weight;',
    '};',
    '',
    'const int INF = 0x3f3f3f3f;',
    'int n, m, k, s, t;',
    'vector<vector<Edge>> graph;',
    'int dist[10005][15];',
    'bool visited[10005][15];',
    '',
    'int layeredDijkstra() {',
    '    memset(dist, 0x3f, sizeof(dist));',
    '    memset(visited, 0, sizeof(visited));',
    '    priority_queue<State, vector<State>, greater<State>> pq;',
    '    ',
    '    dist[s][0] = 0;',
    '    pq.push({s, 0, 0});',
    '    ',
    '    while (!pq.empty()) {',
    '        State cur = pq.top();',
    '        pq.pop();',
    '        int u = cur.city, used = cur.used, c = cur.cost;',
    '        ',
    '        if (visited[u][used]) continue;',
    '        visited[u][used] = true;',
    '        if (u == t) return c;',
    '        ',
    '        for (const auto& e : graph[u]) {',
    '            int v = e.to, w = e.weight;',
    '            // 分支 1：正常购买机票（不使用免费券）',
    '            if (dist[v][used] > c + w) {',
    '                dist[v][used] = c + w;',
    '                pq.push({v, used, dist[v][used]});',
    '            }',
    '            // 分支 2：使用 1 张免费券跨层跃迁（若还有余量）',
    '            if (used < k && dist[v][used + 1] > c) {',
    '                dist[v][used + 1] = c;',
    '                pq.push({v, used + 1, c});',
    '            }',
    '        }',
    '    }',
    '    ',
    '    int ans = INF;',
    '    for (int i = 0; i <= k; ++i) ans = min(ans, dist[t][i]);',
    '    return ans == INF ? -1 : ans;',
    '}',
  ],
  java: [
    'package class064;',
    '',
    'import java.io.*;',
    'import java.util.*;',
    '',
    '// 飞行路线 (洛谷 P4568) - 左程云标准静态/优先队列分层图实现',
    'public class Code06_FlightPath1 {',
    '    public static int MAXN = 10005;',
    '    public static int MAXK = 15;',
    '    public static int INF = 0x3f3f3f3f;',
    '    ',
    '    public static int[][] distance = new int[MAXN][MAXK];',
    '    public static boolean[][] visited = new boolean[MAXN][MAXK];',
    '    ',
    '    // State: [0] city, [1] used_tickets, [2] cost',
    '    public static int layeredDijkstra(int n, int k, int s, int t, List<int[]>[] graph) {',
    '        for (int i = 0; i < n; i++) {',
    '            Arrays.fill(distance[i], INF);',
    '            Arrays.fill(visited[i], false);',
    '        }',
    '        ',
    '        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[2] - b[2]);',
    '        distance[s][0] = 0;',
    '        pq.add(new int[] { s, 0, 0 });',
    '        ',
    '        while (!pq.isEmpty()) {',
    '            int[] cur = pq.poll();',
    '            int u = cur[0], used = cur[1], cost = cur[2];',
    '            ',
    '            if (visited[u][used]) continue;',
    '            visited[u][used] = true;',
    '            if (u == t) return cost;',
    '            ',
    '            for (int[] edge : graph[u]) {',
    '                int v = edge[0], w = edge[1];',
    '                // 选择 1: 付费通行',
    '                if (distance[v][used] > cost + w) {',
    '                    distance[v][used] = cost + w;',
    '                    pq.add(new int[] { v, used, cost + w });',
    '                }',
    '                // 选择 2: 免单跨层跃迁 (used < k)',
    '                if (used < k && distance[v][used + 1] > cost) {',
    '                    distance[v][used + 1] = cost;',
    '                    pq.add(new int[] { v, used + 1, cost });',
    '                }',
    '            }',
    '        }',
    '        ',
    '        int ans = INF;',
    '        for (int i = 0; i <= k; i++) ans = Math.min(ans, distance[t][i]);',
    '        return ans == INF ? -1 : ans;',
    '    }',
    '}',
  ],
  python: [
    'import heapq',
    '',
    'def layered_dijkstra(n: int, k: int, s: int, t: int, edges: list) -> int:',
    '    # 建图：双向邻接表',
    '    graph = [[] for _ in range(n)]',
    '    for u, v, w in edges:',
    '        graph[u].append((v, w))',
    '        graph[v].append((u, w))',
    '    ',
    '    # dist[u][used] 表示使用 used 张免费券到达 u 的最短花费',
    '    INF = float("inf")',
    '    dist = [[INF] * (k + 1) for _ in range(n)]',
    '    visited = [[False] * (k + 1) for _ in range(n)]',
    '    ',
    '    # 优先队列：(cost, u, used)',
    '    pq = [(0, s, 0)]',
    '    dist[s][0] = 0',
    '    ',
    '    while pq:',
    '        cost, u, used = heapq.heappop(pq)',
    '        if visited[u][used]:',
    '            continue',
    '        visited[u][used] = True',
    '        if u == t:',
    '            return cost',
    '        ',
    '        for v, w in graph[u]:',
    '            # 分支 1：正常买票通行',
    '            if dist[v][used] > cost + w:',
    '                dist[v][used] = cost + w',
    '                heapq.heappush(pq, (cost + w, v, used))',
    '            # 分支 2：使用 1 张免单券跃迁',
    '            if used < k and dist[v][used + 1] > cost:',
    '                dist[v][used + 1] = cost',
    '                heapq.heappush(pq, (cost, v, used + 1))',
    '    ',
    '    ans = min(dist[t])',
    '    return -1 if ans == INF else ans',
  ],
  javascript: [
    '// 分层图最短路 Dijkstra 算法 (JavaScript 版)',
    'function layeredDijkstra(n, k, s, t, edges) {',
    '  const graph = Array.from({ length: n }, () => []);',
    '  for (const [u, v, w] of edges) {',
    '    graph[u].push({ to: v, weight: w });',
    '    graph[v].push({ to: u, weight: w });',
    '  }',
    '',
    '  const INF = 1e9;',
    '  const dist = Array.from({ length: n }, () => Array(k + 1).fill(INF));',
    '  const visited = Array.from({ length: n }, () => Array(k + 1).fill(false));',
    '',
    '  // 优先队列模拟 (简单列表或小根堆)',
    '  const pq = [{ cost: 0, u: s, used: 0 }];',
    '  dist[s][0] = 0;',
    '',
    '  while (pq.length > 0) {',
    '    pq.sort((a, b) => a.cost - b.cost);',
    '    const { cost, u, used } = pq.shift();',
    '',
    '    if (visited[u][used]) continue;',
    '    visited[u][used] = true;',
    '    if (u === t) return cost;',
    '',
    '    for (const { to: v, weight: w } of graph[u]) {',
    '      // 1. 正常付费通行',
    '      if (dist[v][used] > cost + w) {',
    '        dist[v][used] = cost + w;',
    '        pq.push({ cost: cost + w, u: v, used });',
    '      }',
    '      // 2. 免费跨层跃迁 (used < k)',
    '      if (used < k && dist[v][used + 1] > cost) {',
    '        dist[v][used + 1] = cost;',
    '        pq.push({ cost: cost, u: v, used: used + 1 });',
    '      }',
    '    }',
    '  }',
    '',
    '  let ans = INF;',
    '  for (let i = 0; i <= k; i++) ans = Math.min(ans, dist[t][i]);',
    '  return ans === INF ? -1 : ans;',
    '}',
  ],
};

export const LAYERED_DIJKSTRA_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🛫 飞行路线 (洛谷 P4568 / 优惠券分层图最短路)</h3>
    <p>
      Alice 和 Bob 打算乘飞机去旅行。城市标记为 <code>0 ~ n-1</code>，共有 <code>m</code> 条双向航线，每条航线连接两个城市并有一定票价。
      航空公司推出了优惠活动：乘客可以<b>免费在最多 <code>k</code> 条航线上搭乘飞机</b>（免单）。
    </p>
    <p>
      请计算从起点城市 <code>S</code> 到终点城市 <code>T</code> 的<b>最少总花费</b>。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">📥 输入示例</div>
      <div style="font-family: monospace; font-size: 12px; color: #0f172a;">
        城市数 n = 5, 航线数 m = 6, 免单券 k = 1<br/>
        起点 S = 0, 终点 T = 4<br/>
        航线: (0-1, 5), (0-2, 100), (1-2, 2), (1-3, 20), (2-4, 8), (3-4, 3)
      </div>
      <div style="font-weight: 700; color: #15803d; margin-top: 6px;">📤 输出示例: <code>7</code></div>
      <div style="font-size: 11px; color: #64748b;">
        解释：走 0 → 1 (付费 5)，1 → 3 (免费免单 0)，3 → 4 (付费 3)，总花费 5 + 0 + 3 = 8；或者 0 → 1 (5) + 1 → 2 (2) + 2 → 4 (免单 0) = 7，最优为 7！
      </div>
    </div>
  </div>
`;

export const LAYERED_DIJKSTRA_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云分层图思维：高维状态空间建模</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 为什么普通 Dijkstra 无法直接求解？</div>
      <div style="font-size: 12px; color: #1e40af;">
        普通 Dijkstra 只能记录到达城市 $u$ 的单一最短距离。但当前最短并不代表后续最优（例如可能把昂贵的边免单更划算）。
        “剩余/已用的免费券数量”具有<b>后效性</b>，必须将其<b>升维</b>并纳入状态表示中！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 分层图空间结构（$K+1$ 层平行平面）</div>
      <div style="font-size: 12px; color: #15803d;">
        我们将原始图复制出 $K+1$ 层（Layer 0, Layer 1, ... Layer K）：
        <ul style="margin: 4px 0 0 16px; padding: 0;">
          <li><b>层内水平边</b>：第 $i$ 层的 $u$ 到第 $i$ 层的 $v$，权重为原边权 $w$（表示正常付费通行）。</li>
          <li><b>跨层下行边</b>：第 $i$ 层的 $u$ 到第 $i+1$ 层的 $v$，权重为 $0$（表示使用 1 张免单券跃迁到下一层）。</li>
        </ul>
      </div>
    </div>

    <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #854d0e; margin-bottom: 4px;">3. 复杂度分析</div>
      <div style="font-size: 12px; color: #713f12;">
        • <b>顶点总数</b>：$N \times (K + 1)$<br/>
        • <b>边总数</b>：$M \times (K + 1) + M \times K = M \times (2K + 1)$<br/>
        • <b>时间复杂度</b>：$O((M \cdot K) \log (N \cdot K))$，对于 $K \le 15$ 的题目完全可以在几十毫秒内秒杀！
      </div>
    </div>
  </div>
`;
