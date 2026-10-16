/**
 * 最小体力消耗路径 (Path With Minimum Effort - 2D Grid Dijkstra)
 * 左程云算法通关课 Class 064 Code02 (LeetCode 1631)
 * 核心：网格图瓶颈最短路、max(|h1 - h2|) 松弛、Dijkstra 优先队列贪心扩展
 */

export const PATH_MIN_EFFORT_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <vector>',
    '#include <queue>',
    '#include <cmath>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 最小体力消耗路径 (LeetCode 1631 / 左程云 Class064 Code02)',
    'class Code02_PathWithMinimumEffort {',
    'public:',
    '    // 0:上，1:右，2:下，3:左',
    '    static inline int move[5] = {-1, 0, 1, 0, -1};',
    '',
    '    static int minimumEffortPath(vector<vector<int>>& heights) {',
    '        int n = heights.size(), m = heights[0].size();',
    '        vector<vector<int>> distance(n, vector<int>(m, 1e9));',
    '        distance[0][0] = 0;',
    '        vector<vector<bool>> visited(n, vector<bool>(m, false));',
    '        // {c, x, y}',
    '        priority_queue<vector<int>, vector<vector<int>>, greater<vector<int>>> heap;',
    '        heap.push({0, 0, 0});',
    '        while (!heap.empty()) {',
    '            auto record = heap.top(); heap.pop();',
    '            int c = record[0], x = record[1], y = record[2];',
    '            if (visited[x][y]) continue;',
    '            if (x == n - 1 && y == m - 1) return c;',
    '            visited[x][y] = true;',
    '            for (int i = 0; i < 4; i++) {',
    '                int nx = x + move[i], ny = y + move[i + 1];',
    '                if (nx >= 0 && nx < n && ny >= 0 && ny < m && !visited[nx][ny]) {',
    '                    int nc = max(c, abs(heights[x][y] - heights[nx][ny]));',
    '                    if (nc < distance[nx][ny]) {',
    '                        distance[nx][ny] = nc;',
    '                        heap.push({nc, nx, ny});',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return -1;',
    '    }',
    '};',
  ],
  java: [
    'package class064;',
    '',
    'import java.util.PriorityQueue;',
    'import java.util.Arrays;',
    '',
    '// 最小体力消耗路径 (LeetCode 1631 / 左程云 Class064 Code02)',
    'public class Code02_PathWithMinimumEffort {',
    '',
    '    // 0:上，1:右，2:下，3:左',
    '    public static int[] move = new int[] { -1, 0, 1, 0, -1 };',
    '',
    '    public static int minimumEffortPath(int[][] heights) {',
    '        int n = heights.length, m = heights[0].length;',
    '        int[][] distance = new int[n][m];',
    '        for (int i = 0; i < n; i++) {',
    '            Arrays.fill(distance[i], Integer.MAX_VALUE);',
    '        }',
    '        distance[0][0] = 0;',
    '        boolean[][] visited = new boolean[n][m];',
    '        // 0:当前x, 1:当前y, 2:从(0,0)到当前格子的最小体力',
    '        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> a[2] - b[2]);',
    '        heap.add(new int[] { 0, 0, 0 });',
    '        while (!heap.isEmpty()) {',
    '            int[] record = heap.poll();',
    '            int x = record[0], y = record[1], c = record[2];',
    '            if (visited[x][y]) {',
    '                continue;',
    '            }',
    '            if (x == n - 1 && y == m - 1) {',
    '                return c;',
    '            }',
    '            visited[x][y] = true;',
    '            for (int i = 0; i < 4; i++) {',
    '                int nx = x + move[i], ny = y + move[i + 1];',
    '                if (nx >= 0 && nx < n && ny >= 0 && ny < m && !visited[nx][ny]) {',
    '                    int nc = Math.max(c, Math.abs(heights[x][y] - heights[nx][ny]));',
    '                    if (nc < distance[nx][ny]) {',
    '                        distance[nx][ny] = nc;',
    '                        heap.add(new int[] { nx, ny, nc });',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return -1;',
    '    }',
    '}',
  ],
  python: [
    'import heapq',
    '',
    '"""',
    '最小体力消耗路径 (LeetCode 1631 / 左程云 Class064 Code02)',
    '核心：二维网格 Dijkstra 堆优化求瓶颈最短路',
    '状态松弛：nc = max(c, |heights[x][y] - heights[nx][ny]|)',
    '时间复杂度: O(R * C log(R * C))，空间复杂度: O(R * C)',
    '"""',
    'class Code02_PathWithMinimumEffort:',
    '    # 0:上，1:右，2:下，3:左',
    '    move = [-1, 0, 1, 0, -1]',
    '',
    '    def minimumEffortPath(self, heights: list[list[int]]) -> int:',
    '        n, m = len(heights), len(heights[0])',
    '        distance = [[float("inf")] * m for _ in range(n)]',
    '        distance[0][0] = 0',
    '        visited = [[False] * m for _ in range(n)]',
    '        # 堆元素为 (c, x, y)，按体力消耗 c 升序',
    '        heap = [(0, 0, 0)]',
    '        while heap:',
    '            c, x, y = heapq.heappop(heap)',
    '            if visited[x][y]:',
    '                continue',
    '            if x == n - 1 and y == m - 1:',
    '                # 终点出堆即为全局最优解',
    '                return c',
    '            visited[x][y] = True',
    '            for i in range(4):',
    '                nx = x + self.move[i]',
    '                ny = y + self.move[i + 1]',
    '                if 0 <= nx < n and 0 <= ny < m and not visited[nx][ny]:',
    '                    # 瓶颈高度差松弛计算',
    '                    step_effort = abs(heights[x][y] - heights[nx][ny])',
    '                    nc = max(c, step_effort)',
    '                    if nc < distance[nx][ny]:',
    '                        distance[nx][ny] = nc',
    '                        heapq.heappush(heap, (nc, nx, ny))',
    '        return -1',
  ],
  javascript: [
    '/**',
    ' * 最小体力消耗路径 (LeetCode 1631 / 左程云 Class064 Code02)',
    ' * 核心：2D 网格 Dijkstra 堆优化瓶颈最短路',
    ' * 时间复杂度: O(R * C log(R * C))，空间复杂度: O(R * C)',
    ' */',
    '// 0:上，1:右，2:下，3:左',
    'const move = [-1, 0, 1, 0, -1];',
    '',
    'function minimumEffortPath(heights) {',
    '  const n = heights.length, m = heights[0].length;',
    '  const distance = Array.from({ length: n }, () => Array(m).fill(Infinity));',
    '  distance[0][0] = 0;',
    '  const visited = Array.from({ length: n }, () => Array(m).fill(false));',
    '  // 小根堆记录: [x, y, c]',
    '  const heap = [[0, 0, 0]];',
    '  while (heap.length > 0) {',
    '    heap.sort((a, b) => a[2] - b[2]);',
    '    const [x, y, c] = heap.shift();',
    '    if (visited[x][y]) {',
    '      continue;',
    '    }',
    '    if (x === n - 1 && y === m - 1) {',
    '      // 终点出堆即为全局最优最小体力',
    '      return c;',
    '    }',
    '    visited[x][y] = true;',
    '    for (let i = 0; i < 4; i++) {',
    '      const nx = x + move[i];',
    '      const ny = y + move[i + 1];',
    '      if (nx >= 0 && nx < n && ny >= 0 && ny < m && !visited[nx][ny]) {',
    '        const stepEffort = Math.abs(heights[nx][ny] - heights[x][y]);',
    '        const nc = Math.max(c, stepEffort);',
    '        if (nc < distance[nx][ny]) {',
    '          distance[nx][ny] = nc;',
    '          heap.push([nx, ny, nc]);',
    '        }',
    '      }',
    '    }',
    '  }',
    '  return -1;',
    '}',
  ],
};

export const PATH_MIN_EFFORT_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">⛰️ 最小体力消耗路径 (Path With Minimum Effort)</h3>
    <p>
      你准备参加一项远足活动。你位于网格左上角 $(0, 0)$，目标到达右下角 $(R-1, C-1)$。一条路径耗费的<b>“体力”</b>定义为路径上连续两格之间的<b>绝对高度差的最大值</b>。求到达终点所需的最小体力消耗（左程云 Class064 Code02 / LeetCode 1631）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">📈 瓶颈最短路松弛转移方程</div>
      <div style="font-size: 11.5px; color: #334155;">
        $$\\text{nextEffort} = \\max(\\text{dist}[r][c], |\\text{height}[nr][nc] - \\text{height}[r][c]|)$$
        利用小根堆维护当前代价最小的未锁定格子，首度出堆终点时即为全局最优解！
      </div>
    </div>
  </div>
`;

export const PATH_MIN_EFFORT_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 为什么 Dijkstra 能解决最大值最小化？</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 满足最优子结构与单调性</div>
      <div style="font-size: 12px; color: #1e40af;">
        虽然传统 Dijkstra 针对边权求和，但由于 $\\max(a, b) \\ge a$，从源点扩展时路径上的最大差值依然具有单调递增性，因此优先队列的贪心策略完全成立！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 与二分答案 + BFS / 并查集的对比</div>
      <div style="font-size: 12px; color: #15803d;">
        本题亦可用二分体力上限 $O(R \\times C \\log(\\max H))$ 判定连通性，而堆优化 Dijkstra 复杂度为 $O(R \\times C \\log(R \\times C))$，在密集搜索中常数极优！
      </div>
    </div>
  </div>
`;
