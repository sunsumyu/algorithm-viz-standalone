/**
 * 网络延迟时间 (Network Delay Time - LeetCode 743 / 左程云 Class 064 Code01)
 * 核心：单源最短路径 Dijkstra 堆优化、信号广播向外扩散、全网收齐时间 max(dist[1..n])、不可达节点判定 (-1)
 */

export const NETWORK_DELAY_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <queue>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 网络延迟时间 (LeetCode 743 / 左程云 Class064 Code01)',
    '// 核心：从源点 k 出发跑 Dijkstra，全网到达时间即为 max(dist[1..n])',
    'class Solution {',
    'public:',
    '    int networkDelayTime(vector<vector<int>>& times, int n, int k) {',
    '        // 1. 建图：邻接表',
    '        vector<vector<pair<int, int>>> adj(n + 1);',
    '        for (const auto& t : times) {',
    '            adj[t[0]].push_back({t[1], t[2]});',
    '        }',
    '        ',
    '        // 2. dist 数组与优先队列 (小根堆)',
    '        vector<int> dist(n + 1, 1e9);',
    '        vector<bool> visited(n + 1, false);',
    '        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;',
    '        ',
    '        dist[k] = 0;',
    '        pq.push({0, k});',
    '        ',
    '        while (!pq.empty()) {',
    '            auto [d, u] = pq.top(); pq.pop();',
    '            if (visited[u]) continue;',
    '            visited[u] = true;',
    '            ',
    '            for (const auto& edge : adj[u]) {',
    '                int v = edge.first, w = edge.second;',
    '                if (dist[u] + w < dist[v]) {',
    '                    dist[v] = dist[u] + w;',
    '                    pq.push({dist[v], v});',
    '                }',
    '            }',
    '        }',
    '        ',
    '        // 3. 统计最大延迟时间',
    '        int maxDelay = 0;',
    '        for (int i = 1; i <= n; ++i) {',
    '            if (dist[i] == 1e9) return -1; // 存在无法收齐信号的节点',
    '            maxDelay = max(maxDelay, dist[i]);',
    '        }',
    '        return maxDelay;',
    '    }',
    '};',
  ],
  java: [
    'package class064;',
    '',
    'import java.util.*;',
    '',
    '// Dijkstra算法模版 (Leetcode 743. 网络延迟时间)',
    '// 测试链接 : https://leetcode.cn/problems/network-delay-time',
    'public class Code01_DijkstraLeetcode {',
    '    public static int networkDelayTime(int[][] times, int n, int k) {',
    '        // 建图',
    '        ArrayList<ArrayList<int[]>> graph = new ArrayList<>();',
    '        for (int i = 0; i <= n; i++) graph.add(new ArrayList<>());',
    '        for (int[] edge : times) {',
    '            graph.get(edge[0]).add(new int[] { edge[1], edge[2] });',
    '        }',
    '        ',
    '        // 堆优化 Dijkstra',
    '        int[] distance = new int[n + 1];',
    '        Arrays.fill(distance, Integer.MAX_VALUE);',
    '        distance[k] = 0;',
    '        boolean[] visited = new boolean[n + 1];',
    '        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);',
    '        pq.add(new int[] { k, 0 });',
    '        ',
    '        while (!pq.isEmpty()) {',
    '            int[] cur = pq.poll();',
    '            int u = cur[0];',
    '            if (visited[u]) continue;',
    '            visited[u] = true;',
    '            for (int[] edge : graph.get(u)) {',
    '                int v = edge[0], w = edge[1];',
    '                if (!visited[v] && distance[u] + w < distance[v]) {',
    '                    distance[v] = distance[u] + w;',
    '                    pq.add(new int[] { v, distance[v] });',
    '                }',
    '            }',
    '        }',
    '        ',
    '        int ans = 0;',
    '        for (int i = 1; i <= n; i++) {',
    '            if (distance[i] == Integer.MAX_VALUE) return -1;',
    '            ans = Math.max(ans, distance[i]);',
    '        }',
    '        return ans;',
    '    }',
    '}',
  ],
  python: [
    '# 网络延迟时间 (LeetCode 743 / Python 标准实现)',
    '# 核心：Dijkstra 堆优化求源点 k 到全网各节点单源最短路径',
    '# 时间复杂度: O(M log N)，空间复杂度: O(N + M)',
    'import heapq',
    '',
    'class Solution:',
    '    def networkDelayTime(self, times: list[list[int]], n: int, k: int) -> int:',
    '        # 1. 邻接表建图: u -> (v, w)',
    '        adj = [[] for _ in range(n + 1)]',
    '        for u, v, w in times:',
    '            adj[u].append((v, w))',
    '            ',
    '        # 2. 距离数组与优先队列 (最小堆)',
    '        dist = [float("inf")] * (n + 1)',
    '        visited = [False] * (n + 1)',
    '        dist[k] = 0',
    '        pq = [(0, k)] # (distance, node)',
    '        ',
    '        while pq:',
    '            d, u = heapq.heappop(pq)',
    '            if visited[u]:',
    '                continue',
    '            visited[u] = True',
    '            ',
    '            for v, w in adj[u]:',
    '                if not visited[v] and dist[u] + w < dist[v]:',
    '                    dist[v] = dist[u] + w',
    '                    heapq.heappush(pq, (dist[v], v))',
    '                    ',
    '        # 3. 统计全网收到信号的最大时间',
    '        max_delay = 0',
    '        for i in range(1, n + 1):',
    '            if dist[i] == float("inf"):',
    '                return -1 # 存在孤立或不可达节点',
    '            max_delay = max(max_delay, dist[i])',
    '            ',
    '        return max_delay',
  ],
  javascript: [
    '/**',
    ' * 网络延迟时间 (LeetCode 743 / JavaScript 版)',
    ' * 核心：堆优化 Dijkstra 求解单源最短路径',
    ' * 时间复杂度: O(M log N)，空间复杂度: O(N + M)',
    ' */',
    'function networkDelayTime(times, n, k) {',
    '  // 1. 构建邻接表',
    '  const adj = Array.from({ length: n + 1 }, () => []);',
    '  for (const [u, v, w] of times) {',
    '    adj[u].push({ to: v, weight: w });',
    '  }',
    '  ',
    '  // 2. 初始化最短距离与访问标记',
    '  const dist = Array(n + 1).fill(Infinity);',
    '  const visited = Array(n + 1).fill(false);',
    '  dist[k] = 0;',
    '  ',
    '  // 优先队列: [node, distance]',
    '  const pq = [[k, 0]];',
    '  ',
    '  while (pq.length > 0) {',
    '    // 按距离升序出堆',
    '    pq.sort((a, b) => a[1] - b[1]);',
    '    const [u, d] = pq.shift();',
    '    ',
    '    if (visited[u]) continue;',
    '    visited[u] = true;',
    '    ',
    '    // 松弛所有出边邻居',
    '    for (const edge of adj[u]) {',
    '      const v = edge.to;',
    '      const w = edge.weight;',
    '      if (!visited[v] && dist[u] + w < dist[v]) {',
    '        dist[v] = dist[u] + w;',
    '        pq.push([v, dist[v]]);',
    '      }',
    '    }',
    '  }',
    '  ',
    '  // 3. 统计全网收到信号的最大延迟',
    '  let maxDelay = 0;',
    '  for (let i = 1; i <= n; i++) {',
    '    if (dist[i] === Infinity) return -1; // 存在无法接收信号的节点',
    '    maxDelay = Math.max(maxDelay, dist[i]);',
    '  }',
    '  ',
    '  return maxDelay;',
    '}',
  ],
};

export const NETWORK_DELAY_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">📡 网络延迟时间 (LeetCode 743 / Class 064 Code01)</h3>
    <p>
      有 $n$ 个网络节点，标记为 $1$ 到 $n$。给你一个列表 <code>times</code>，表示信号经过有向边的传递时间 <code>times[i] = (u_i, v_i, w_i)</code>。现在从某个节点 $k$ 发出一个信号。问需要多久才能使所有节点都收到信号？如果不能使所有节点收到信号，返回 <code>-1</code>。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">👑 信号广播与 Dijkstra 最短路对应</div>
      <div style="font-size: 11.5px; color: #334155;">
        1. <b>单源最短路</b>：信号以光速沿各链路并行扩散，节点 $u$ 收到信号的最早时刻即为 $dist[k \to u]$；<br/>
        2. <b>全网收齐时间</b>：所有节点均收到信号的时刻为 $\max(dist[1], dist[2], \dots, dist[n])$；<br/>
        3. <b>连通性判别</b>：若存在任意 $dist[i] = \infty$，则说明信号无法覆盖全网，返回 $-1$！
      </div>
    </div>
  </div>
`;

export const NETWORK_DELAY_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云 Class064 模板要点</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 堆优化防重复展开 (visited 数组 / 惰性删除)</div>
      <div style="font-size: 12px; color: #1e40af;">
        当同一个节点被多次松弛入堆时，堆顶先出的是当前距离最短的记录。一旦锁定 <code>visited[u] = true</code>，后续弹出的陈旧大距离记录直接丢弃，保证每条边仅松弛一次！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 复杂度分析</div>
      <div style="font-size: 12px; color: #15803d;">
        时间复杂度严格为 $O(E \log E) = O(E \log V)$，空间复杂度 $O(V + E)$，在网络通信与路由广播中达到工业级最优！
      </div>
    </div>
  </div>
`;
