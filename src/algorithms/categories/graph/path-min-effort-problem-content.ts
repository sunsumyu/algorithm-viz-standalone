/**
 * 最小体力消耗路径 (Path With Minimum Effort - 2D Grid Dijkstra)
 * 左程云算法通关课 Class 064 Code02 (LeetCode 1631)
 * 核心：网格图瓶颈最短路、max(|h1 - h2|) 松弛、Dijkstra 优先队列贪心扩展
 */

export const PATH_MIN_EFFORT_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <queue>',
    '#include <cmath>',
    'using namespace std;',
    '',
    '// 最小体力消耗路径 (LeetCode 1631 / 左程云 Class064 Code02)',
    '// 核心：瓶颈最短路，松弛方程：newEffort = max(curEffort, |h[nr][nc] - h[r][c]|)',
    'class Solution {',
    'public:',
    '    struct Node {',
    '        int r, c, effort;',
    '        bool operator>(const Node& other) const {',
    '            return effort > other.effort;',
    '        }',
    '    };',
    '    ',
    '    int minimumEffortPath(vector<vector<int>>& heights) {',
    '        int rows = heights.size(), cols = heights[0].size();',
    '        vector<vector<int>> distance(rows, vector<int>(cols, 1e9));',
    '        vector<vector<bool>> visited(rows, vector<bool>(cols, false));',
    '        priority_queue<Node, vector<Node>, greater<Node>> pq;',
    '        ',
    '        distance[0][0] = 0;',
    '        pq.push({0, 0, 0});',
    '        int dr[] = {-1, 1, 0, 0};',
    '        int dc[] = {0, 0, -1, 1};',
    '        ',
    '        while (!pq.empty()) {',
    '            Node cur = pq.top(); pq.pop();',
    '            int r = cur.r, c = cur.c, d = cur.effort;',
    '            if (visited[r][c]) continue;',
    '            visited[r][c] = true;',
    '            if (r == rows - 1 && c == cols - 1) return d;',
    '            ',
    '            for (int i = 0; i < 4; ++i) {',
    '                int nr = r + dr[i], nc = c + dc[i];',
    '                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {',
    '                    int stepEffort = abs(heights[nr][nc] - heights[r][c]);',
    '                    int nextEffort = max(d, stepEffort);',
    '                    if (nextEffort < distance[nr][nc]) {',
    '                        distance[nr][nc] = nextEffort;',
    '                        pq.push({nr, nc, nextEffort});',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return 0;',
    '    }',
    '};',
  ],
  java: [
    'package class064;',
    '',
    'import java.util.PriorityQueue;',
    'import java.util.Arrays;',
    '',
    '/**',
    ' * 最小体力消耗路径 (LeetCode 1631 / 左程云 Class064 Code02)',
    ' * 核心：网格图瓶颈最短路，Dijkstra 堆优化，松弛 max(curEffort, |h1 - h2|)',
    ' * 时间复杂度: O(R * C log(R * C))，空间复杂度: O(R * C)',
    ' */',
    'public class Code02_PathWithMinimumEffort {',
    '    public static int minimumEffortPath(int[][] heights) {',
    '        int rows = heights.length, cols = heights[0].length;',
    '        int[][] distance = new int[rows][cols];',
    '        for (int i = 0; i < rows; i++) {',
    '            Arrays.fill(distance[i], Integer.MAX_VALUE);',
    '        }',
    '        distance[0][0] = 0;',
    '        ',
    '        boolean[][] visited = new boolean[rows][cols];',
    '        // int[]: {r, c, effort}',
    '        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[2] - b[2]);',
    '        pq.add(new int[] { 0, 0, 0 });',
    '        ',
    '        int[] dr = { -1, 1, 0, 0 };',
    '        int[] dc = { 0, 0, -1, 1 };',
    '        ',
    '        while (!pq.isEmpty()) {',
    '            int[] cur = pq.poll();',
    '            int r = cur[0], c = cur[1], d = cur[2];',
    '            ',
    '            if (visited[r][c]) continue;',
    '            visited[r][c] = true;',
    '            ',
    '            // 终点出堆即为全局最优最小体力',
    '            if (r == rows - 1 && c == cols - 1) {',
    '                return d;',
    '            }',
    '            ',
    '            for (int i = 0; i < 4; i++) {',
    '                int nr = r + dr[i], nc = c + dc[i];',
    '                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {',
    '                    int stepEffort = Math.abs(heights[nr][nc] - heights[r][c]);',
    '                    int nextEffort = Math.max(d, stepEffort);',
    '                    if (nextEffort < distance[nr][nc]) {',
    '                        distance[nr][nc] = nextEffort;',
    '                        pq.add(new int[] { nr, nc, nextEffort });',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return 0;',
    '    }',
    '}',
  ],
  python: [
    '# 最小体力消耗路径 (LeetCode 1631 / Python 标准实现)',
    '# 核心：二维网格 Dijkstra 堆优化求瓶颈最短路',
    '# 时间复杂度: O(R * C log(R * C))，空间复杂度: O(R * C)',
    'import heapq',
    '',
    'class Solution:',
    '    def minimumEffortPath(self, heights: list[list[int]]) -> int:',
    '        rows, cols = len(heights), len(heights[0])',
    '        dist = [[float("inf")] * cols for _ in range(rows)]',
    '        visited = [[False] * cols for _ in range(rows)]',
    '        dist[0][0] = 0',
    '        ',
    '        # (effort, r, c)',
    '        pq = [(0, 0, 0)]',
    '        directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]',
    '        ',
    '        while pq:',
    '            d, r, c = heapq.heappop(pq)',
    '            if visited[r][c]:',
    '                continue',
    '            visited[r][c] = True',
    '            ',
    '            if r == rows - 1 and c == cols - 1:',
    '                return d',
    '                ',
    '            for dr, dc in directions:',
    '                nr, nc = r + dr, c + dc',
    '                if 0 <= nr < rows and 0 <= nc < cols and not visited[nr][nc]:',
    '                    step_effort = abs(heights[nr][nc] - heights[r][c])',
    '                    next_effort = max(d, step_effort)',
    '                    if next_effort < dist[nr][nc]:',
    '                        dist[nr][nc] = next_effort',
    '                        heapq.heappush(pq, (next_effort, nr, nc))',
    '                        ',
    '        return 0',
  ],
  javascript: [
    '/**',
    ' * 最小体力消耗路径 (LeetCode 1631 / JavaScript 版)',
    ' * 核心：2D 网格 Dijkstra 堆优化瓶颈最短路',
    ' * 时间复杂度: O(R * C log(R * C))，空间复杂度: O(R * C)',
    ' */',
    'function minimumEffortPath(heights) {',
    '  const rows = heights.length, cols = heights[0].length;',
    '  const dist = Array.from({ length: rows }, () => Array(cols).fill(Infinity));',
    '  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));',
    '  dist[0][0] = 0;',
    '  ',
    '  // 优先队列: [r, c, effort]',
    '  const pq = [[0, 0, 0]];',
    '  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];',
    '  ',
    '  while (pq.length > 0) {',
    '    pq.sort((a, b) => a[2] - b[2]);',
    '    const [r, c, d] = pq.shift();',
    '    ',
    '    if (visited[r][c]) continue;',
    '    visited[r][c] = true;',
    '    ',
    '    if (r === rows - 1 && c === cols - 1) {',
    '      return d;',
    '    }',
    '    ',
    '    for (const [dr, dc] of dirs) {',
    '      const nr = r + dr, nc = c + dc;',
    '      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {',
    '        const stepEffort = Math.abs(heights[nr][nc] - heights[r][c]);',
    '        const nextEffort = Math.max(d, stepEffort);',
    '        if (nextEffort < dist[nr][nc]) {',
    '          dist[nr][nc] = nextEffort;',
    '          pq.push([nr, nc, nextEffort]);',
    '        }',
    '      }',
    '    }',
    '  }',
    '  return 0;',
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
