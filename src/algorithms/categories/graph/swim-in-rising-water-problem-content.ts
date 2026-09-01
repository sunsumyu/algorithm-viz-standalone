/**
 * 水位上升的泳池中游泳 (Swim In Rising Water - LeetCode 778)
 * 左程云《算法通关课》Class 064 Code03
 * 核心：网格图瓶颈最短路、max(dis, grid[nx][ny]) 松弛、Dijkstra 小根堆 / 二分+BFS
 */

export const SWIM_IN_RISING_WATER_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'package class064;',
    '',
    'import java.util.PriorityQueue;',
    '',
    '// 水位上升的泳池中游泳',
    '// 在一个 n x n 的整数矩阵 grid 中',
    '// 每一个方格的值 grid[i][j] 表示位置 (i, j) 的平台高度',
    '// 当开始下雨时，在时间为 t 时，水池中的水位为 t',
    '// 你可以从一个平台游向四周相邻的任意一个平台，但是前提是此时水位必须同时淹没这两个平台',
    '// 假定你可以瞬间移动无限距离，也就是默认在方格内部游动是不耗时的',
    '// 你从坐标方格的左上平台 (0, 0) 出发',
    '// 返回 你到达坐标方格的右下平台 (n-1, n-1) 所需的最少时间',
    '// 测试链接 : https://leetcode.cn/problems/swim-in-rising-water/',
    'public class Code03_SwimInRisingWater {',
    '',
    '    // Dijkstra 小根堆算法',
    '    // 时间复杂度 O(N^2 * log(N))',
    '    public static int swimInWater(int[][] grid) {',
    '        int n = grid.length;',
    '        int m = grid[0].length;',
    '        int[][] distance = new int[n][m];',
    '        for (int i = 0; i < n; i++) {',
    '            for (int j = 0; j < m; j++) {',
    '                distance[i][j] = Integer.MAX_VALUE;',
    '            }',
    '        }',
    '        distance[0][0] = grid[0][0];',
    '        boolean[][] visited = new boolean[n][m];',
    '        // 堆中存放 [行, 列, 到达该格子的最少时间/水位]',
    '        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> a[2] - b[2]);',
    '        heap.add(new int[] { 0, 0, grid[0][0] });',
    '        int[] move = new int[] { -1, 0, 1, 0, -1 };',
    '        ',
    '        while (!heap.isEmpty()) {',
    '            int[] record = heap.poll();',
    '            int r = record[0];',
    '            int c = record[1];',
    '            int cost = record[2];',
    '            ',
    '            if (visited[r][c]) {',
    '                continue;',
    '            }',
    '            visited[r][c] = true;',
    '            if (r == n - 1 && c == m - 1) {',
    '                return cost; // 首次弹出右下角，必是最优解',
    '            }',
    '            ',
    '            for (int i = 0; i < 4; i++) {',
    '                int nr = r + move[i];',
    '                int nc = c + move[i + 1];',
    '                if (nr >= 0 && nr < n && nc >= 0 && nc < m && !visited[nr][nc]) {',
    '                    // 瓶颈转移方程：max(当前水位, 邻居平台高度)',
    '                    int ncCost = Math.max(cost, grid[nr][nc]);',
    '                    if (ncCost < distance[nr][nc]) {',
    '                        distance[nr][nc] = ncCost;',
    '                        heap.add(new int[] { nr, nc, ncCost });',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return -1;',
    '    }',
    '}',
  ],
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <queue>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 水位上升的泳池中游泳 (LeetCode 778)',
    'class Solution {',
    'public:',
    '    struct Node {',
    '        int r, c, t;',
    '        bool operator>(const Node& o) const { return t > o.t; }',
    '    };',
    '    ',
    '    int swimInWater(vector<vector<int>>& grid) {',
    '        int n = grid.size(), m = grid[0].size();',
    '        vector<vector<int>> dist(n, vector<int>(m, 1e9));',
    '        vector<vector<bool>> vis(n, vector<bool>(m, false));',
    '        priority_queue<Node, vector<Node>, greater<Node>> pq;',
    '        ',
    '        dist[0][0] = grid[0][0];',
    '        pq.push({0, 0, grid[0][0]});',
    '        int dr[] = {-1, 0, 1, 0}, dc[] = {0, 1, 0, -1};',
    '        ',
    '        while (!pq.empty()) {',
    '            auto [r, c, t] = pq.top(); pq.pop();',
    '            if (vis[r][c]) continue;',
    '            vis[r][c] = true;',
    '            if (r == n - 1 && c == m - 1) return t;',
    '            ',
    '            for (int i = 0; i < 4; ++i) {',
    '                int nr = r + dr[i], nc = c + dc[i];',
    '                if (nr >= 0 && nr < n && nc >= 0 && nc < m && !vis[nr][nc]) {',
    '                    int nt = max(t, grid[nr][nc]);',
    '                    if (nt < dist[nr][nc]) {',
    '                        dist[nr][nc] = nt;',
    '                        pq.push({nr, nc, nt});',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return -1;',
    '    }',
    '};',
  ],
  python: [
    'import heapq',
    '',
    '# 水位上升的泳池中游泳 (LeetCode 778)',
    'def swim_in_water(grid):',
    '    n, m = len(grid), len(grid[0])',
    '    dist = [[float("inf")] * m for _ in range(n)]',
    '    vis = [[False] * m for _ in range(n)]',
    '    ',
    '    dist[0][0] = grid[0][0]',
    '    pq = [(grid[0][0], 0, 0)] # (time, r, c)',
    '    dirs = [(-1, 0), (1, 0), (0, -1), (0, 1)]',
    '    ',
    '    while pq:',
    '        t, r, c = heapq.heappop(pq)',
    '        if vis[r][c]:',
    '            continue',
    '        vis[r][c] = True',
    '        if r == n - 1 and c == m - 1:',
    '            return t',
    '            ',
    '        for dr, dc in dirs:',
    '            nr, nc = r + dr, c + dc',
    '            if 0 <= nr < n and 0 <= nc < m and not vis[nr][nc]:',
    '                nt = max(t, grid[nr][nc])',
    '                if nt < dist[nr][nc]:',
    '                    dist[nr][nc] = nt',
    '                    heapq.heappush(pq, (nt, nr, nc))',
    '    return -1',
  ],
  javascript: [
    '// 水位上升的泳池中游泳 (LeetCode 778)',
    'function swimInWater(grid) {',
    '  const n = grid.length, m = grid[0].length;',
    '  const dist = Array.from({ length: n }, () => Array(m).fill(Infinity));',
    '  const vis = Array.from({ length: n }, () => Array(m).fill(false));',
    '  ',
    '  // 简易优先队列',
    '  const pq = [{ r: 0, c: 0, t: grid[0][0] }];',
    '  dist[0][0] = grid[0][0];',
    '  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];',
    '  ',
    '  while (pq.length > 0) {',
    '    pq.sort((a, b) => a.t - b.t);',
    '    const { r, c, t } = pq.shift();',
    '    if (vis[r][c]) continue;',
    '    vis[r][c] = true;',
    '    if (r === n - 1 && c === m - 1) return t;',
    '    ',
    '    for (const [dr, dc] of dirs) {',
    '      const nr = r + dr, nc = c + dc;',
    '      if (nr >= 0 && nr < n && nc >= 0 && nc < m && !vis[nr][nc]) {',
    '        const nt = Math.max(t, grid[nr][nc]);',
    '        if (nt < dist[nr][nc]) {',
    '          dist[nr][nc] = nt;',
    '          pq.push({ r: nr, c: nc, t: nt });',
    '        }',
    '      }',
    '    }',
    '  }',
    '  return -1;',
    '}',
  ],
};

export const SWIM_IN_RISING_WATER_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🏊 水位上升的泳池中游泳 (LeetCode 778)</h3>
    <p>
      在一个 $n \\times n$ 的整数矩阵 <code>grid</code> 中，每一个方格的值 <code>grid[i][j]</code> 表示位置 $(i, j)$ 的平台高度。
    </p>
    <p>
      当开始下雨时，在时间为 $t$ 时，水池中的水位为 $t$。你可以从一个平台游向四周相邻的任意一个平台，但是前提是此时水位必须<b>同时淹没这两个平台</b>。
    </p>
    <p>
      假定你可以瞬间移动无限距离，也就是默认在方格内部游动是不耗时的。你从坐标方格的左上平台 $(0, 0)$ 出发，返回你到达坐标方格的右下平台 $(n-1, n-1)$ 所需的<b>最少时间</b>。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">👑 瓶颈最短路模型转化</div>
      <div style="font-size: 11.5px; color: #334155;">
        从 $(0, 0)$ 到达 $(n-1, n-1)$ 的任意一条路径，其所需的最少等待时间等于<b>路径上所有方格平台高度的最大值</b>：
        $$\\text{cost}(path) = \\max_{(r, c) \\in path} \\text{grid}[r][c]$$
        我们要寻找一条路径，使得该路径上的最大高度最小（<b>MiniMax 瓶颈最短路</b>）！
      </div>
    </div>
  </div>
`;

export const SWIM_IN_RISING_WATER_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 两种最优解法深度对比</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">解法一：Dijkstra 优先队列 (左神推荐)</div>
      <div style="font-size: 12px; color: #1e40af;">
        定义 $distance[i][j]$ 为到达 $(i, j)$ 所需的最少水位高度。<br/>
        松弛转移：<code>nextTime = max(curTime, grid[nr][nc])</code>。<br/>
        因为权值单调非递减，小根堆每次弹出的一定是全局水位最低的连通前沿，首次弹出 $(n-1, n-1)$ 时即可立即返回！<br/>
        时间复杂度：$O(N^2 \\log(N^2)) = O(N^2 \\log N)$。
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">解法二：二分时间 + BFS/并查集</div>
      <div style="font-size: 12px; color: #15803d;">
        二分水位高度 $t \\in [0, N^2 - 1]$，在矩阵中只保留高度 $\\le t$ 的可行方格，用 BFS/DFS 或并查集判断 $(0, 0)$ 与 $(n-1, n-1)$ 是否连通。<br/>
        时间复杂度：$O(N^2 \\log(N^2))$。
      </div>
    </div>
  </div>
`;
