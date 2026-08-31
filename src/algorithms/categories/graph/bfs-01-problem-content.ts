/**
 * 0-1 BFS 双端队列最短路 (0-1 BFS Deque Shortest Path)
 * 参考左程云《算法通关课》【必备篇】class062: 0-1 BFS、到达角落移除障碍物的最小数目 (LeetCode 2290 / 1368)
 */

export const BFS_01_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <deque>',
    '#include <cstring>',
    'using namespace std;',
    '',
    '// 0-1 BFS 核心结构：双端队列 deque',
    '// 边权为 0 的转移 -> push_front（保持单调性）',
    '// 边权为 1 的转移 -> push_back',
    'const int INF = 0x3f3f3f3f;',
    'int minObstacles(vector<vector<int>>& grid) {',
    '    int m = grid.size(), n = grid[0].size();',
    '    vector<vector<int>> dist(m, vector<int>(n, INF));',
    '    deque<pair<int, int>> dq;',
    '    ',
    '    dist[0][0] = 0;',
    '    dq.push_front({0, 0});',
    '    ',
    '    int dx[4] = {-1, 1, 0, 0};',
    '    int dy[4] = {0, 0, -1, 1};',
    '    ',
    '    while (!dq.empty()) {',
    '        auto [x, y] = dq.front();',
    '        dq.pop_front();',
    '        ',
    '        if (x == m - 1 && y == n - 1) return dist[x][y];',
    '        ',
    '        for (int i = 0; i < 4; ++i) {',
    '            int nx = x + dx[i], ny = y + dy[i];',
    '            if (nx < 0 || nx >= m || ny < 0 || ny >= n) continue;',
    '            ',
    '            int weight = grid[nx][ny]; // 0 或 1',
    '            if (dist[nx][ny] > dist[x][y] + weight) {',
    '                dist[nx][ny] = dist[x][y] + weight;',
    '                if (weight == 0) {',
    '                    dq.push_front({nx, ny}); // 零权边插队头',
    '                } else {',
    '                    dq.push_back({nx, ny});  // 一权边插队尾',
    '                }',
    '            }',
    '        }',
    '    }',
    '    return dist[m - 1][n - 1];',
    '}',
  ],
  java: [
    'package class062;',
    '',
    'import java.util.ArrayDeque;',
    'import java.util.Arrays;',
    '',
    '// 0-1 BFS：到达角落需要移除障碍物的最小数目 (LeetCode 2290)',
    '// 左程云标准双端队列实现：时间复杂度 O(M * N)',
    'public class Code03_MinimumObstacleRemovalToReachCorner {',
    '    public static int minimumObstacles(int[][] grid) {',
    '        int m = grid.length, n = grid[0].length;',
    '        int[][] distance = new int[m][n];',
    '        for (int i = 0; i < m; i++) {',
    '            Arrays.fill(distance[i], Integer.MAX_VALUE);',
    '        }',
    '        ',
    '        ArrayDeque<int[]> deque = new ArrayDeque<>();',
    '        distance[0][0] = 0;',
    '        deque.addFirst(new int[] { 0, 0 });',
    '        ',
    '        int[] move = { -1, 0, 1, 0, -1 };',
    '        ',
    '        while (!deque.isEmpty()) {',
    '            int[] cur = deque.pollFirst();',
    '            int x = cur[0], y = cur[1];',
    '            ',
    '            if (x == m - 1 && y == n - 1) return distance[x][y];',
    '            ',
    '            for (int i = 0; i < 4; i++) {',
    '                int nx = x + move[i];',
    '                int ny = y + move[i + 1];',
    '                if (nx >= 0 && nx < m && ny >= 0 && ny < n) {',
    '                    int weight = grid[nx][ny];',
    '                    if (distance[nx][ny] > distance[x][y] + weight) {',
    '                        distance[nx][ny] = distance[x][y] + weight;',
    '                        if (weight == 0) {',
    '                            deque.addFirst(new int[] { nx, ny }); // 0 权插队头',
    '                        } else {',
    '                            deque.addLast(new int[] { nx, ny });  // 1 权插队尾',
    '                        }',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return distance[m - 1][n - 1];',
    '    }',
    '}',
  ],
  python: [
    'from collections import deque',
    '',
    'def minimum_obstacles(grid: list[list[int]]) -> int:',
    '    m, n = len(grid), len(grid[0])',
    '    dist = [[float("inf")] * n for _ in range(m)]',
    '    dq = deque([(0, 0)])',
    '    dist[0][0] = 0',
    '    ',
    '    dx = [-1, 1, 0, 0]',
    '    dy = [0, 0, -1, 1]',
    '    ',
    '    while dq:',
    '        x, y = dq.popleft()',
    '        if x == m - 1 and y == n - 1:',
    '            return dist[x][y]',
    '            ',
    '        for i in range(4):',
    '            nx, ny = x + dx[i], y + dy[i]',
    '            if 0 <= nx < m and 0 <= ny < n:',
    '                w = grid[nx][ny]',
    '                if dist[nx][ny] > dist[x][y] + w:',
    '                    dist[nx][ny] = dist[x][y] + w',
    '                    if w == 0:',
    '                        dq.appendleft((nx, ny))  # 零权边入队头',
    '                    else:',
    '                        dq.append((nx, ny))      # 一权边入队尾',
    '                        ',
    '    return dist[m - 1][n - 1]',
  ],
  javascript: [
    '// 0-1 BFS 双端队列算法实现 (JavaScript 版)',
    'function minimumObstacles(grid) {',
    '  const m = grid.length, n = grid[0].length;',
    '  const dist = Array.from({ length: m }, () => Array(n).fill(Infinity));',
    '  const dq = [[0, 0]]; // 使用数组模拟双端队列 (unshift/push/shift)',
    '  dist[0][0] = 0;',
    '  ',
    '  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];',
    '  ',
    '  while (dq.length > 0) {',
    '    const [x, y] = dq.shift(); // popleft',
    '    if (x === m - 1 && y === n - 1) return dist[x][y];',
    '    ',
    '    for (const [dx, dy] of dirs) {',
    '      const nx = x + dx, ny = y + dy;',
    '      if (nx >= 0 && nx < m && ny >= 0 && ny < n) {',
    '        const w = grid[nx][ny];',
    '        if (dist[nx][ny] > dist[x][y] + w) {',
    '          dist[nx][ny] = dist[x][y] + w;',
    '          if (w === 0) {',
    '            dq.unshift([nx, ny]); // 权为 0 头部插入',
    '          } else {',
    '            dq.push([nx, ny]);    // 权为 1 尾部插入',
    '          }',
    '        }',
    '      }',
    '    }',
    '  }',
    '  return dist[m - 1][n - 1];',
    '}',
  ],
};

export const BFS_01_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🧱 消除障碍物的最小数目 (LeetCode 2290 / 0-1 BFS 经典)</h3>
    <p>
      给定一个 <code>m x n</code> 的二维网格 <code>grid</code>，单元格中：
      <br/>• <code>0</code> 表示空地（可通过，通行代价为 <b>0</b>）。
      <br/>• <code>1</code> 表示障碍物（需移除该障碍物才能通行，通行代价为 <b>1</b>）。
    </p>
    <p>
      你需要从左上角 <code>(0, 0)</code> 移动到右下角 <code>(m - 1, n - 1)</code>。请计算需要移除障碍物的<b>最小数目</b>（即最短路径）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">📥 输入示例</div>
      <div style="font-family: monospace; font-size: 12px; color: #0f172a;">
        grid = [<br/>
        &nbsp;&nbsp;[0, 1, 1],<br/>
        &nbsp;&nbsp;[1, 1, 0],<br/>
        &nbsp;&nbsp;[1, 1, 0]<br/>
        ]
      </div>
      <div style="font-weight: 700; color: #15803d; margin-top: 6px;">📤 输出示例: <code>2</code></div>
      <div style="font-size: 11px; color: #64748b;">
        解释：沿 (0,0) → (0,1 障) → (1,1 障) → (1,2 空) → (2,2 空) 移动，移除 2 个障碍物即可到达终点！
      </div>
    </div>
  </div>
`;

export const BFS_01_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云 0-1 BFS 原理：双端队列保证单调性</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 什么是 0-1 BFS？为什么能替代堆优化 Dijkstra？</div>
      <div style="font-size: 12px; color: #1e40af;">
        当图中边的权重<b>只有 0 和 1 两种取值</b>时，如果用堆优化 Dijkstra，时间复杂度为 $O(E \log V)$。
        而使用<b>双端队列 (Deque)</b>：
        <ul style="margin: 4px 0 0 16px; padding: 0;">
          <li><b>0 权边</b>：到达新节点的距离等于当前距离 $D$，直接插入<b>队头</b>（<code>push_front</code>）。</li>
          <li><b>1 权边</b>：到达新节点的距离等于 $D+1$，插入<b>队尾</b>（<code>push_back</code>）。</li>
        </ul>
        此时双端队列中的距离天然保持单调递增（队列中最多只存在 $D$ 和 $D+1$ 两种距离值），完全等价于优先队列，且出入队均为 $O(1)$！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 复杂度极致对比</div>
      <div style="font-size: 12px; color: #15803d;">
        • <b>0-1 BFS 复杂度</b>：$O(V + E) = O(M \times N)$ 严格线性时间！<br/>
        • <b>空间复杂度</b>：$O(M \times N)$。<br/>
        • <b>适用场景</b>：边权只有 0/1 的网格迷宫、翻转传送门、旋转方向最小代价等。
      </div>
    </div>
  </div>
`;
