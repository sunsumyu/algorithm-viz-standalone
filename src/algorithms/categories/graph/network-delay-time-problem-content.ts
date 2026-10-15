/**
 * 网络延迟时间 (Network Delay Time - LeetCode 743 / 左程云 Class 064 Code01)
 * 核心：单源最短路径 Dijkstra 堆优化、信号广播向外扩散、全网收齐时间 max(dist[1..n])、不可达节点判定 (-1)
 */

export const NETWORK_DELAY_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    'class Solution {',
    'public:',
    '    int networkDelayTime(vector<vector<int>>& times, int n, int k) {',
    '        // 1. 构建邻接表',
    '        vector<vector<pair<int, int>>> adj(n + 1);',
    '        for (const auto& t : times) {',
    '            adj[t[0]].push_back({t[1], t[2]});',
    '        }',
    '        ',
    '        // 2. 最短距离数组与优先队列 (小根堆)',
    '        vector<int> dist(n + 1, 1e9);',
    '        vector<bool> visited(n + 1, false);',
    '        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;',
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
    '        // 3. 统计全网收到信号的最迟时间',
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
    'public class Solution {',
    '    public static int networkDelayTime(int[][] times, int n, int k) {',
    '        // 1. 构建邻接表',
    '        ArrayList<ArrayList<int[]>> graph = new ArrayList<>();',
    '        for (int i = 0; i <= n; i++) graph.add(new ArrayList<>());',
    '        for (int[] edge : times) {',
    '            graph.get(edge[0]).add(new int[] { edge[1], edge[2] });',
    '        }',
    '        ',
    '        // 2. 堆优化 Dijkstra',
    '        int[] distance = new int[n + 1];',
    '        Arrays.fill(distance, Integer.MAX_VALUE);',
    '        boolean[] visited = new boolean[n + 1];',
    '        distance[k] = 0;',
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
    '        // 3. 统计全网延迟时间',
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
    '        # 4. 返回覆盖全网所需的最小延迟',
    '        return max_delay',
    '        ',
    '    # end of networkDelayTime',
  ],
  javascript: [
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

export const NETWORK_DELAY_PRUNED_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    'class Solution {',
    'public:',
    '    int networkDelayTime(vector<vector<int>>& times, int n, int k) {',
    '        // 1. 构建邻接表',
    '        vector<vector<pair<int, int>>> graph(n + 1);',
    '        for (const auto& edge : times) {',
    '            graph[edge[0]].push_back({edge[1], edge[2]});',
    '        }',
    '        ',
    '        // 2. 最短距离数组与优先队列 (无 visited)',
    '        vector<int> distance(n + 1, 1e9);',
    '        distance[k] = 0;',
    '        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;',
    '        pq.push({0, k}); // {d, u}',
    '        ',
    '        while (!pq.empty()) {',
    '            auto [d, u] = pq.top(); pq.pop();',
    '            if (d > distance[u]) {',
    '                continue; // 距离剪枝',
    '            }',
    '            ',
    '            for (const auto& [v, w] : graph[u]) {',
    '                if (distance[u] + w < distance[v]) { // 无 !visited',
    '                    distance[v] = distance[u] + w;',
    '                    pq.push({distance[v], v});',
    '                }',
    '            }',
    '        }',
    '        ',
    '        // 3. 统计全网延迟时间',
    '        int ans = 0;',
    '        for (int i = 1; i <= n; ++i) {',
    '            if (distance[i] == 1e9) return -1;',
    '            ans = max(ans, distance[i]);',
    '        }',
    '        return ans;',
    '    }',
    '};',
  ],
  java: [
    'public class Solution {',
    '    public static int networkDelayTime(int[][] times, int n, int k) {',
    '        // 1. 构建邻接表',
    '        ArrayList<ArrayList<int[]>> graph = new ArrayList<>();',
    '        for (int i = 0; i <= n; i++) graph.add(new ArrayList<>());',
    '        for (int[] edge : times) {',
    '            graph.get(edge[0]).add(new int[]{ edge[1], edge[2] });',
    '        }',
    '        ',
    '        // 2. 距离数组与优先队列 (无 visited)',
    '        int[] distance = new int[n + 1];',
    '        Arrays.fill(distance, Integer.MAX_VALUE);',
    '        distance[k] = 0;',
    '        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);',
    '        pq.add(new int[]{ k, 0 });',
    '        ',
    '        while (!pq.isEmpty()) {',
    '            int[] cur = pq.poll();',
    '            int u = cur[0];',
    '            int d = cur[1];',
    '            ',
    '            if (d > distance[u]) {',
    '                continue; // 距离剪枝跳过',
    '            }',
    '            ',
    '            for (int[] edge : graph.get(u)) {',
    '                int v = edge[0], w = edge[1];',
    '                if (distance[u] + w < distance[v]) {',
    '                    distance[v] = distance[u] + w;',
    '                    pq.add(new int[]{ v, distance[v] });',
    '                }',
    '            }',
    '        }',
    '        ',
    '        // 3. 统计全网延迟时间',
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
    'import heapq',
    '',
    'class Solution:',
    '    def networkDelayTime(self, times: list[list[int]], n: int, k: int) -> int:',
    '        # 1. 构建邻接表',
    '        graph = [[] for _ in range(n + 1)]',
    '        for u, v, w in times:',
    '            graph[u].append((v, w))',
    '        ',
    '        # 2. 距离数组与最小堆 (无 visited)',
    '        distance = [float("inf")] * (n + 1)',
    '        distance[k] = 0',
    '        pq = [(0, k)] # (d, u)',
    '        ',
    '        while pq:',
    '            d, u = heapq.heappop(pq)',
    '            if d > distance[u]:',
    '                continue # 距离剪枝',
    '            ',
    '            for v, w in graph[u]:',
    '                if distance[u] + w < distance[v]: # 无 not visited',
    '                    distance[v] = distance[u] + w',
    '                    heapq.heappush(pq, (distance[v], v))',
    '        ',
    '        # 3. 统计全网收到信号的最迟时间',
    '        ans = 0',
    '        for i in range(1, n + 1):',
    '            if distance[i] == float("inf"):',
    '                return -1',
    '            ans = max(ans, distance[i])',
    '        return ans',
  ],
  javascript: [
    'function networkDelayTime(times, n, k) {',
    '  // 1. 构建邻接表',
    '  const graph = Array.from({ length: n + 1 }, () => []);',
    '  for (const [u, v, w] of times) {',
    '    graph[u].push({ v, w });',
    '  }',
    '  ',
    '  // 2. 最短距离数组与优先队列 (无 visited)',
    '  const distance = Array(n + 1).fill(Infinity);',
    '  distance[k] = 0;',
    '  const pq = [[k, 0]]; // [u, d]',
    '  ',
    '  while (pq.length > 0) {',
    '    pq.sort((a, b) => a[1] - b[1]);',
    '    const [u, d] = pq.shift();',
    '    if (d > distance[u]) {',
    '      continue; // 距离剪枝',
    '    }',
    '    ',
    '    for (const { v, w } of graph[u]) {',
    '      if (distance[u] + w < distance[v]) { // 无 !visited',
    '        distance[v] = distance[u] + w;',
    '        pq.push([v, distance[v]]);',
    '      }',
    '    }',
    '  }',
    '  ',
    '  // 3. 统计全网收到信号的最迟时间',
    '  let ans = 0;',
    '  for (let i = 1; i <= n; i++) {',
    '    if (distance[i] === Infinity) return -1;',
    '    ans = Math.max(ans, distance[i]);',
    '  }',
    '  return ans;',
    '}',
  ],
};

export const NETWORK_DELAY_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.7; color: #cbd5e1; display: flex; flex-direction: column; gap: 12px;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 7px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-weight: 700; font-size: 11px; border: 1px solid rgba(56, 189, 248, 0.3);">LeetCode 743</span>
      <span style="padding: 2px 7px; border-radius: 4px; background: rgba(245, 158, 11, 0.15); color: #fbbf24; font-weight: 700; font-size: 11px; border: 1px solid rgba(245, 158, 11, 0.3);">Class 064 Code01</span>
      <span style="font-size: 13px; font-weight: 700; color: #f8fafc;">网络延迟时间 (Network Delay Time)</span>
    </div>
    <p style="margin: 0;">
      有 <code style="color: #38bdf8; font-family: monospace; background: rgba(56, 189, 248, 0.1); padding: 1px 5px; border-radius: 4px;">n</code> 个网络节点，标记为 <code style="color: #38bdf8; font-family: monospace; background: rgba(56, 189, 248, 0.1); padding: 1px 5px; border-radius: 4px;">1</code> 到 <code style="color: #38bdf8; font-family: monospace; background: rgba(56, 189, 248, 0.1); padding: 1px 5px; border-radius: 4px;">n</code>。给你一个列表 <code style="color: #38bdf8; font-family: monospace; background: rgba(56, 189, 248, 0.1); padding: 1px 5px; border-radius: 4px;">times</code>，表示信号经过有向边的传递时间 <code>times[i] = (u<sub>i</sub>, v<sub>i</sub>, w<sub>i</sub>)</code>。现在从某个节点 <code style="color: #fbbf24; font-family: monospace; background: rgba(245, 158, 11, 0.1); padding: 1px 5px; border-radius: 4px;">k</code> 发出一个信号。问需要多久才能使所有节点都收到信号？如果不能使所有节点收到信号，返回 <code style="color: #f87171; font-family: monospace; background: rgba(248, 113, 113, 0.1); padding: 1px 5px; border-radius: 4px;">-1</code>。
    </p>

    <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(56, 189, 248, 0.3); border-left: 4px solid #38bdf8; padding: 10px 14px; border-radius: 6px;">
      <div style="font-weight: 700; color: #38bdf8; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
        <span>👑</span> 信号广播与 Dijkstra 最短路对应
      </div>
      <div style="font-size: 12px; color: #cbd5e1; display: flex; flex-direction: column; gap: 4px;">
        <div>1. <b>单源最短路</b>：信号以光速沿各链路并行扩散，节点 <code style="color: #38bdf8; font-family: monospace;">u</code> 收到信号的最早时刻即为 <code style="color: #38bdf8; font-family: monospace;">dist[k → u]</code>；</div>
        <div>2. <b>全网收齐时间</b>：所有节点均收到信号的时刻为 <code style="color: #34d399; font-family: monospace;">max(dist[1], dist[2], ..., dist[n])</code>；</div>
        <div>3. <b>连通性判别</b>：若存在任意 <code style="color: #f87171; font-family: monospace;">dist[i] = ∞</code>，说明信号无法覆盖全网，返回 <code style="color: #f87171; font-family: monospace;">-1</code>！</div>
      </div>
    </div>
  </div>
`;

export const NETWORK_DELAY_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.7; color: #cbd5e1; display: flex; flex-direction: column; gap: 12px;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 7px; border-radius: 4px; background: rgba(52, 211, 153, 0.15); color: #34d399; font-weight: 700; font-size: 11px; border: 1px solid rgba(52, 211, 153, 0.3);">Dijkstra 最短路核心</span>
      <span style="font-size: 13px; font-weight: 700; color: #f8fafc;">左程云 Class 064 标准模版精讲</span>
    </div>

    <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(59, 130, 246, 0.25); border-left: 4px solid #3b82f6; border-radius: 6px; padding: 10px 14px;">
      <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">1. 基础版本：系统堆优化 + visited 数组防重</div>
      <div style="font-size: 12px; color: #cbd5e1;">
        通过 <code style="color: #34d399; font-family: monospace; background: rgba(52, 211, 153, 0.1); padding: 1px 4px; border-radius: 3px;">visited[u]</code> 记录节点是否已被锁定，出堆遇到已锁定时直接跳过，防止环路与重复探索。
      </div>
    </div>

    <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(16, 185, 129, 0.25); border-left: 4px solid #10b981; border-radius: 6px; padding: 10px 14px;">
      <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">2. 升级版本：距离剪枝优化 (d &gt; distance[u] 替代 visited 数组)</div>
      <div style="font-size: 12px; color: #a7f3d0;">
        工业界与竞赛中的更优解法！省去维护 <code style="color: #6ee7b7; font-family: monospace;">visited[]</code> 布尔数组，仅利用堆元素自带的 <code style="color: #6ee7b7; font-family: monospace;">d</code>。若 <code style="color: #6ee7b7; font-family: monospace;">d &gt; distance[u]</code> 说明当前出堆记录已过期，直接 continue 剪枝！松弛判定也无需检查 <code style="color: #6ee7b7; font-family: monospace;">!visited[v]</code>，更加纯粹轻量。
      </div>
    </div>

    <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(168, 85, 247, 0.25); border-left: 4px solid #a855f7; border-radius: 6px; padding: 10px 14px;">
      <div style="font-weight: 700; color: #c084fc; margin-bottom: 4px;">3. 终极版本：反向索引堆实现 (Dijkstra with Index Heap)</div>
      <div style="font-size: 12px; color: #e9d5ff;">
        引入 <code>where[u]</code> 数组三态映射（-1 未入堆、&gt;=0 堆中下标、-2 已结算锁定），在松弛发现更短距离时执行 <b>O(log V) 原地 decreaseKey</b> 上浮更新，堆内节点数严格不超过 V 个，彻底消除冗余死节点压堆！
      </div>
    </div>
  </div>
`;

export const DELAY_LEGEND = [
  { label: '📡 广播发射源点 (k)', state: 'secondary' as const },
  { label: '✔ 信号已接收锁定', state: 'discovered' as const },
  { label: '⚡ 当前波前扩散点', color: '#f59e0b' },
  { label: '🔵 最短路径 (走过的路)', color: '#0284c7' },
  { label: '🟢/⚡ 当前活跃选择路径', color: '#10b981' },
];

export const DELAY_METRICS = [
  { id: 'metric-delay-cur', label: '当前扩散节点', color: '#f59e0b' },
  { id: 'metric-delay-max', label: '全网延迟时间', color: '#10b981' },
  { id: 'metric-delay-pq', label: '波前优先队列', color: '#38bdf8' },
  { id: 'metric-delay-phase', label: '当前算法阶段', color: '#a855f7' },
];

export const INDEX_HEAP_LEGEND = [
  { label: '⚡ 当前堆顶出堆节点', color: '#f59e0b' },
  { label: '✔ 已锁定最短路节点 (where=-2)', state: 'discovered' as const },
  { label: '📥 处于小根堆中 (where>=0)', state: 'scanning' as const },
  { label: '🔵 最短路径 (走过的路)', color: '#0284c7' },
  { label: '🟢/⚡ 当前活跃选择路径', color: '#10b981' },
];

export const INDEX_HEAP_METRICS = [
  { id: 'metric-heap-size', label: '堆内有效节点', color: '#38bdf8' },
  { id: 'metric-settled-count', label: '已锁定节点数', color: '#10b981' },
  { id: 'metric-heap-cur', label: '当前出堆代表元', color: '#f59e0b' },
  { id: 'metric-heap-phase', label: '当前算法阶段', color: '#a855f7' },
];

