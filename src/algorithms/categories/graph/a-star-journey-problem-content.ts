/**
 * A* 算法与迷宫启发式寻路 (A* Search Pathfinding)
 * 参考左程云《算法通关课》【必备篇】class065: F(x) = G(x) + H(x) 曼哈顿距离启发式剪枝与 Dijkstra 对比验证
 */

export const A_STAR_JOURNEY_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <queue>',
    '#include <cmath>',
    'using namespace std;',
    '',
    '// A* 算法节点结构：f = g + h',
    'struct Node {',
    '    int r, c, g, f;',
    '    bool operator>(const Node& o) const {',
    '        return f > o.f; // 小根堆按综合估价 f 升序',
    '    }',
    '};',
    '',
    '// 曼哈顿启发式距离 h(x, y)',
    'int manhattan(int r, int c, int tr, int tc) {',
    '    return abs(r - tr) + abs(c - tc);',
    '}',
    '',
    'int aStarMinDistance(const vector<vector<int>>& grid, int sr, int sc, int tr, int tc) {',
    '    if (grid[sr][sc] == 0 || grid[tr][tc] == 0) return -1;',
    '    int m = grid.size(), n = grid[0].size();',
    '    vector<vector<int>> gScore(m, vector<int>(n, 1e9));',
    '    vector<vector<bool>> closed(m, vector<bool>(n, false));',
    '    ',
    '    priority_queue<Node, vector<Node>, greater<Node>> openSet;',
    '    gScore[sr][sc] = 0;',
    '    openSet.push({sr, sc, 0, manhattan(sr, sc, tr, tc)});',
    '    ',
    '    int dirs[5] = {-1, 0, 1, 0, -1};',
    '    while (!openSet.empty()) {',
    '        Node cur = openSet.top();',
    '        openSet.pop();',
    '        ',
    '        if (cur.r == tr && cur.c == tc) return cur.g;',
    '        if (closed[cur.r][cur.c]) continue;',
    '        closed[cur.r][cur.c] = true;',
    '        ',
    '        for (int i = 0; i < 4; ++i) {',
    '            int nr = cur.r + dirs[i], nc = cur.c + dirs[i + 1];',
    '            if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == 1 && !closed[nr][nc]) {',
    '                int tentG = cur.g + 1;',
    '                if (tentG < gScore[nr][nc]) {',
    '                    gScore[nr][nc] = tentG;',
    '                    openSet.push({nr, nc, tentG, tentG + manhattan(nr, nc, tr, tc)});',
    '                }',
    '            }',
    '        }',
    '    }',
    '    return -1;',
    '}',
  ],
  java: [
    'package class065;',
    '',
    'import java.util.PriorityQueue;',
    '',
    '// A* 算法标准模版 - 左程云对数器验证',
    'public class Code01_AStarAlgorithm {',
    '    public static int[] move = { -1, 0, 1, 0, -1 };',
    '    ',
    '    public static int aStar(int[][] grid, int startX, int startY, int targetX, int targetY) {',
    '        if (grid[startX][startY] == 0 || grid[targetX][targetY] == 0) return -1;',
    '        int n = grid.length, m = grid[0].length;',
    '        int[][] distance = new int[n][m];',
    '        for (int i = 0; i < n; i++) java.util.Arrays.fill(distance[i], Integer.MAX_VALUE);',
    '        ',
    '        distance[startX][startY] = 0;',
    '        boolean[][] visited = new boolean[n][m];',
    '        // [0]:x, [1]:y, [2]:g, [3]:f = g + h',
    '        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> a[3] - b[3]);',
    '        heap.add(new int[] { startX, startY, 0, f(startX, startY, targetX, targetY) });',
    '        ',
    '        while (!heap.isEmpty()) {',
    '            int[] cur = heap.poll();',
    '            int x = cur[0], y = cur[1], g = cur[2];',
    '            if (visited[x][y]) continue;',
    '            visited[x][y] = true;',
    '            if (x == targetX && y == targetY) return g;',
    '            ',
    '            for (int i = 0; i < 4; i++) {',
    '                int nx = x + move[i], ny = y + move[i + 1];',
    '                if (nx >= 0 && nx < n && ny >= 0 && ny < m && grid[nx][ny] == 1 && !visited[nx][ny]) {',
    '                    if (g + 1 < distance[nx][ny]) {',
    '                        distance[nx][ny] = g + 1;',
    '                        heap.add(new int[] { nx, ny, g + 1, g + 1 + f(nx, ny, targetX, targetY) });',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return -1;',
    '    }',
    '    ',
    '    public static int f(int x, int y, int tx, int ty) {',
    '        return Math.abs(x - tx) + Math.abs(y - ty);',
    '    }',
    '}',
  ],
  python: [
    'import heapq',
    '',
    'def a_star(grid: list[list[int]], start: tuple[int, int], target: tuple[int, int]) -> int:',
    '    sr, sc = start',
    '    tr, tc = target',
    '    if grid[sr][sc] == 0 or grid[tr][tc] == 0:',
    '        return -1',
    '        ',
    '    m, n = len(grid), len(grid[0])',
    '    h = lambda r, c: abs(r - tr) + abs(c - tc)',
    '    ',
    '    # heap tuple: (f, g, r, c)',
    '    open_set = [(h(sr, sc), 0, sr, sc)]',
    '    g_score = { (sr, sc): 0 }',
    '    visited = set()',
    '    ',
    '    while open_set:',
    '        f, g, r, c = heapq.heappop(open_set)',
    '        if (r, c) == (tr, tc):',
    '            return g',
    '        if (r, c) in visited:',
    '            continue',
    '        visited.add((r, c))',
    '        ',
    '        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:',
    '            nr, nc = r + dr, c + dc',
    '            if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 1 and (nr, nc) not in visited:',
    '                tent_g = g + 1',
    '                if tent_g < g_score.get((nr, nc), float("inf")):',
    '                    g_score[(nr, nc)] = tent_g',
    '                    heapq.heappush(open_set, (tent_g + h(nr, nc), tent_g, nr, nc))',
    '                    ',
    '    return -1',
  ],
  javascript: [
    '// A* 算法网格寻路 (JavaScript 版)',
    'function aStar(grid, start, target) {',
    '  const [sr, sc] = start;',
    '  const [tr, tc] = target;',
    '  const m = grid.length, n = grid[0].length;',
    '  const h = (r, c) => Math.abs(r - tr) + Math.abs(c - tc);',
    '  ',
    '  const gScore = Array.from({ length: m }, () => Array(n).fill(Infinity));',
    '  const visited = Array.from({ length: m }, () => Array(n).fill(false));',
    '  gScore[sr][sc] = 0;',
    '  ',
    '  const heap = [{ r: sr, c: sc, g: 0, f: h(sr, sc) }];',
    '  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];',
    '  ',
    '  while (heap.length > 0) {',
    '    heap.sort((a, b) => a.f - b.f);',
    '    const { r, c, g } = heap.shift();',
    '    ',
    '    if (r === tr && c === tc) return g;',
    '    if (visited[r][c]) continue;',
    '    visited[r][c] = true;',
    '    ',
    '    for (const [dr, dc] of dirs) {',
    '      const nr = r + dr, nc = c + dc;',
    '      if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] === 1 && !visited[nr][nc]) {',
    '        const tentG = g + 1;',
    '        if (tentG < gScore[nr][nc]) {',
    '          gScore[nr][nc] = tentG;',
    '          heap.push({ r: nr, c: nc, g: tentG, f: tentG + h(nr, nc) });',
    '        }',
    '      }',
    '    }',
    '  }',
    '  return -1;',
    '}',
  ],
};

export const A_STAR_JOURNEY_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🧭 A* 启发式搜索算法 (A* Pathfinding)</h3>
    <p>
      在二维网格迷宫中，<code>0</code> 代表不可通行的障碍物，<code>1</code> 代表畅通的道路。
      只能进行上、下、左、右 4-方向移动，每走一步代价为 <code>1</code>。
    </p>
    <p>
      给定起点 <code>(startX, startY)</code> 与终点 <code>(targetX, targetY)</code>，利用 <b>A* 启发式搜索</b> 快速找到到达终点的最短路径。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">🎯 估价函数核心公式</div>
      <div style="font-family: monospace; font-size: 13px; color: #0f172a; font-weight: bold;">
        F(x) = G(x) + H(x)
      </div>
      <div style="font-size: 11.5px; color: #475569; margin-top: 4px;">
        • <b>G(x)</b>：起点到达当前节点的实际耗费步数。<br/>
        • <b>H(x)</b>：当前节点到达终点的曼哈顿启发预估距离 <code>|x - targetX| + |y - targetY|</code>。<br/>
        • <b>F(x)</b>：综合评估值，优先队列永远弹出 F 值最小的节点！
      </div>
    </div>
  </div>
`;

export const A_STAR_JOURNEY_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云 A* 启发式剪枝原理解析</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 为什么 A* 比 Dijkstra 快得多？</div>
      <div style="font-size: 12px; color: #1e40af;">
        Dijkstra 是“盲目全向扩散”（以起点为中心向所有方向同心圆扩散），搜索了海量远离终点的无用区域。<br/>
        A* 借助 $H(x)$ 赋予了搜索“引力导航”——背离终点的节点由于 $H(x)$ 剧增使得 $F(x)$ 很大，被堆延后处理；而朝着终点前进的节点被优先扩展，形成了直接瞄准终点的细长水滴波前！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 启发函数的“可采纳性” (Admissibility)</div>
      <div style="font-size: 12px; color: #15803d;">
        只要 $H(x) \le H^*(x)$（估算值不超过真实最短距离），A* 就<b>必定能保证找到全局最优最短路径</b>！网格中的曼哈顿距离无障碍直线步数永远 $\le$ 实际绕障步数，因此满足严格可采纳性。
      </div>
    </div>
  </div>
`;
