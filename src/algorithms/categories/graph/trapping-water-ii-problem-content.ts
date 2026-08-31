/**
 * 接雨水 II 与三维木桶边界优先队列收缩 (Trapping Rain Water II 3D)
 * 参考左程云《算法通关课》【必备篇】class062: 二维高度图、小根堆由外向内木桶短板收缩 (LeetCode 407)
 */

export const TRAPPING_WATER_II_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <queue>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 接雨水 II (LeetCode 407) - 木桶短板优先队列收缩',
    'struct Cell {',
    '    int r, c, w;',
    '    bool operator>(const Cell& o) const {',
    '        return w > o.w; // 小根堆',
    '    }',
    '};',
    '',
    'int trapRainWater(vector<vector<int>>& heightMap) {',
    '    if (heightMap.empty() || heightMap[0].empty()) return 0;',
    '    int m = heightMap.size(), n = heightMap[0].size();',
    '    vector<vector<bool>> visited(m, vector<bool>(n, false));',
    '    priority_queue<Cell, vector<Cell>, greater<Cell>> pq;',
    '    ',
    '    // 1. 将四周最外层边界全部入堆',
    '    for (int i = 0; i < m; ++i) {',
    '        for (int j = 0; j < n; ++j) {',
    '            if (i == 0 || i == m - 1 || j == 0 || j == n - 1) {',
    '                pq.push({i, j, heightMap[i][j]});',
    '                visited[i][j] = true;',
    '            }',
    '        }',
    '    }',
    '    ',
    '    int ans = 0;',
    '    int dirs[5] = {-1, 0, 1, 0, -1};',
    '    ',
    '    // 2. 每次弹出当前木桶最短板向内灌水',
    '    while (!pq.empty()) {',
    '        Cell cur = pq.top();',
    '        pq.pop();',
    '        ',
    '        for (int k = 0; k < 4; ++k) {',
    '            int nr = cur.r + dirs[k];',
    '            int nc = cur.c + dirs[k + 1];',
    '            if (nr >= 0 && nr < m && nc >= 0 && nc < n && !visited[nr][nc]) {',
    '                visited[nr][nc] = true;',
    '                // 若邻居高度小于当前水线，产生积水',
    '                if (heightMap[nr][nc] < cur.w) {',
    '                    ans += cur.w - heightMap[nr][nc];',
    '                }',
    '                // 更新邻居水线为 max(当前水线, 邻居高度) 并入堆',
    '                pq.push({nr, nc, max(cur.w, heightMap[nr][nc])});',
    '            }',
    '        }',
    '    }',
    '    return ans;',
    '}',
  ],
  java: [
    'package class062;',
    '',
    'import java.util.PriorityQueue;',
    '',
    '// 二维接雨水 (LeetCode 407) - 左程云标准小根堆由外向内收缩',
    'public class Code05_TrappingRainWaterII {',
    '    public static int trapRainWater(int[][] heightMap) {',
    '        if (heightMap == null || heightMap.length == 0) return 0;',
    '        int n = heightMap.length, m = heightMap[0].length;',
    '        ',
    '        // [0] r, [1] c, [2] waterLine 水线',
    '        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> a[2] - b[2]);',
    '        boolean[][] visited = new boolean[n][m];',
    '        ',
    '        // 四周边界入堆',
    '        for (int i = 0; i < n; i++) {',
    '            for (int j = 0; j < m; j++) {',
    '                if (i == 0 || i == n - 1 || j == 0 || j == m - 1) {',
    '                    heap.add(new int[] { i, j, heightMap[i][j] });',
    '                    visited[i][j] = true;',
    '                }',
    '            }',
    '        }',
    '        ',
    '        int ans = 0;',
    '        int[] move = { -1, 0, 1, 0, -1 };',
    '        ',
    '        while (!heap.isEmpty()) {',
    '            int[] cur = heap.poll();',
    '            int r = cur[0], c = cur[1], w = cur[2];',
    '            ',
    '            for (int i = 0; i < 4; i++) {',
    '                int nr = r + move[i];',
    '                int nc = c + move[i + 1];',
    '                if (nr >= 0 && nr < n && nc >= 0 && nc < m && !visited[nr][nc]) {',
    '                    visited[nr][nc] = true;',
    '                    if (heightMap[nr][nc] < w) {',
    '                        ans += w - heightMap[nr][nc];',
    '                    }',
    '                    heap.add(new int[] { nr, nc, Math.max(w, heightMap[nr][nc]) });',
    '                }',
    '            }',
    '        }',
    '        return ans;',
    '    }',
    '}',
  ],
  python: [
    'import heapq',
    '',
    'def trap_rain_water(height_map: list[list[int]]) -> int:',
    '    if not height_map or not height_map[0]:',
    '        return 0',
    '    m, n = len(height_map), len(height_map[0])',
    '    visited = [[False] * n for _ in range(m)]',
    '    heap = []',
    '    ',
    '    # 边界所有单元格入堆',
    '    for i in range(m):',
    '        for j in range(n):',
    '            if i == 0 or i == m - 1 or j == 0 or j == n - 1:',
    '                heapq.heappush(heap, (height_map[i][j], i, j))',
    '                visited[i][j] = True',
    '                ',
    '    ans = 0',
    '    dirs = [(-1, 0), (1, 0), (0, -1), (0, 1)]',
    '    ',
    '    while heap:',
    '        w, r, c = heapq.heappop(heap)',
    '        for dr, dc in dirs:',
    '            nr, nc = r + dr, c + dc',
    '            if 0 <= nr < m and 0 <= nc < n and not visited[nr][nc]:',
    '                visited[nr][nc] = True',
    '                if height_map[nr][nc] < w:',
    '                    ans += w - height_map[nr][nc]',
    '                heapq.heappush(heap, (max(w, height_map[nr][nc]), nr, nc))',
    '                ',
    '    return ans',
  ],
  javascript: [
    '// 接雨水 II 优先队列实现 (JavaScript 版)',
    'function trapRainWater(heightMap) {',
    '  const m = heightMap.length, n = heightMap[0].length;',
    '  const visited = Array.from({ length: m }, () => Array(n).fill(false));',
    '  const heap = [];',
    '  ',
    '  for (let i = 0; i < m; i++) {',
    '    for (let j = 0; j < n; j++) {',
    '      if (i === 0 || i === m - 1 || j === 0 || j === n - 1) {',
    '        heap.push({ w: heightMap[i][j], r: i, c: j });',
    '        visited[i][j] = true;',
    '      }',
    '    }',
    '  }',
    '  ',
    '  let ans = 0;',
    '  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];',
    '  ',
    '  while (heap.length > 0) {',
    '    heap.sort((a, b) => a.w - b.w);',
    '    const { w, r, c } = heap.shift();',
    '    ',
    '    for (const [dr, dc] of dirs) {',
    '      const nr = r + dr, nc = c + dc;',
    '      if (nr >= 0 && nr < m && nc >= 0 && nc < n && !visited[nr][nc]) {',
    '        visited[nr][nc] = true;',
    '        if (heightMap[nr][nc] < w) {',
    '          ans += w - heightMap[nr][nc];',
    '        }',
    '        heap.push({ w: Math.max(w, heightMap[nr][nc]), r: nr, c: nc });',
    '      }',
    '    }',
    '  }',
    '  return ans;',
    '}',
  ],
};

export const TRAPPING_WATER_II_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🌊 接雨水 II (LeetCode 407 / 3D 木桶优先队列收缩)</h3>
    <p>
      给你一个 <code>m x n</code> 的二维整数矩阵 <code>heightMap</code>，代表一个三维地形图各个单元格的地表高度。
    </p>
    <p>
      下雨后，水会流向四周较低的区域，或者在低洼盆地形成积水。请计算下雨后图中<b>最多能接多少体积的雨水</b>。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">📥 输入示例</div>
      <div style="font-family: monospace; font-size: 12px; color: #0f172a;">
        heightMap = [<br/>
        &nbsp;&nbsp;[1, 4, 3, 1, 3, 2],<br/>
        &nbsp;&nbsp;[3, 2, 1, 3, 2, 4],<br/>
        &nbsp;&nbsp;[2, 3, 3, 2, 3, 1]<br/>
        ]
      </div>
      <div style="font-weight: 700; color: #15803d; margin-top: 6px;">📤 输出示例: <code>4</code></div>
      <div style="font-size: 11px; color: #64748b;">
        解释：中间 (1,1) 原高 2 蓄水至高 3 (+1)；(1,2) 原高 1 蓄水至高 3 (+2)；(1,4) 原高 2 蓄水至高 3 (+1)，总积水量为 1 + 2 + 1 = 4！
      </div>
    </div>
  </div>
`;

export const TRAPPING_WATER_II_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 左程云三维木桶原理：小根堆由外向内收缩</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 木桶效应在二维向三维的推广</div>
      <div style="font-size: 12px; color: #1e40af;">
        一维接雨水（双指针）之所以有效，是因为木桶的高度永远取决于<b>左右两边最矮的那根短板</b>。
        在三维矩阵中，木桶的“边框”是一个闭合环（初始为整个矩阵最外层的四周边界）。水若要溢出，必定从这圈边界中<b>最矮的一块短板</b>漏出！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 小根堆推进机制与状态更新</div>
      <div style="font-size: 12px; color: #15803d;">
        1. <b>初始边界压堆</b>：将所有四周外围单元格 $(r, c, H[r][c])$ 放入小根堆。<br/>
        2. <b>弹出全局最矮短板 $(r, c, W)$</b>：向内扩散其 4-邻居 $(nr, nc)$。<br/>
        3. <b>计算积水与更新水线</b>：若邻居高度 $H[nr][nc] < W$，积水增加 $W - H[nr][nc]$；将邻居以新水线 $\max(W, H[nr][nc])$ 加入小根堆。<br/>
        时间复杂度为严格 $O(M \cdot N \log(M \cdot N))$！
      </div>
    </div>
  </div>
`;
