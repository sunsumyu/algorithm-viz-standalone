import { StepBase, HighlightTarget } from '../../step-visualizer';

export interface RainCell {
  r: number;
  c: number;
  h: number;
  water: number;
  isBoundary: boolean;
  visited: boolean;
}

export interface RainWater3DStep extends StepBase {
  grid: number[][];
  waterGrid: number[][];
  curR: number;
  curC: number;
  curH: number;
  totalWater: number;
  heapSize: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: number | HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
}

export const RAIN_WATER_3D_CODES = {
  java: `public class TrappingRainWaterII {
    static class Cell implements Comparable<Cell> {
        int r, c, h;
        Cell(int r, int c, int h) { this.r = r; this.c = c; this.h = h; }
        public int compareTo(Cell o) { return this.h - o.h; }
    }
    public int trapRainWater(int[][] heightMap) {
        int m = heightMap.length, n = heightMap[0].length;
        PriorityQueue<Cell> pq = new PriorityQueue<>();
        boolean[][] visited = new boolean[m][n];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (i == 0 || i == m - 1 || j == 0 || j == n - 1) {
                    pq.offer(new Cell(i, j, heightMap[i][j]));
                    visited[i][j] = true;
                }
            }
        }
        int water = 0;
        int[][] dirs = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
        while (!pq.isEmpty()) {
            Cell cur = pq.poll();
            for (int[] d : dirs) {
                int nr = cur.r + d[0], nc = cur.c + d[1];
                if (nr >= 0 && nr < m && nc >= 0 && nc < n && !visited[nr][nc]) {
                    visited[nr][nc] = true;
                    water += Math.max(0, cur.h - heightMap[nr][nc]);
                    pq.offer(new Cell(nr, nc, Math.max(heightMap[nr][nc], cur.h)));
                }
            }
        }
        return water;
    }
}`,
  cpp: `struct Cell {
    int r, c, h;
    bool operator>(const Cell& o) const { return h > o.h; }
};
int trapRainWater(vector<vector<int>>& heightMap) {
    int m = heightMap.size(), n = heightMap[0].size();
    priority_queue<Cell, vector<Cell>, greater<Cell>> pq;
    vector<vector<bool>> vis(m, vector<bool>(n, false));
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (i == 0 || i == m - 1 || j == 0 || j == n - 1) {
                pq.push({i, j, heightMap[i][j]}); vis[i][j] = true;
            }
        }
    }
    int water = 0, dirs[4][2] = {{-1,0},{1,0},{0,-1},{0,1}};
    while (!pq.empty()) {
        auto [r, c, h] = pq.top(); pq.pop();
        for (auto& d : dirs) {
            int nr = r + d[0], nc = c + d[1];
            if (nr >= 0 && nr < m && nc >= 0 && nc < n && !vis[nr][nc]) {
                vis[nr][nc] = true;
                water += max(0, h - heightMap[nr][nc]);
                pq.push({nr, nc, max(heightMap[nr][nc], h)});
            }
        }
    }
    return water;
}`,
  python: `import heapq

def trap_rain_water(height_map):
    m, n = len(height_map), len(height_map[0])
    pq, visited = [], [[False] * n for _ in range(m)]
    for i in range(m):
        for j in range(n):
            if i == 0 or i == m - 1 or j == 0 or j == n - 1:
                heapq.heappush(pq, (height_map[i][j], i, j))
                visited[i][j] = True
    water = 0
    dirs = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    while pq:
        h, r, c = heapq.heappop(pq)
        for dr, dc in dirs:
            nr, nc = r + dr, c + dc
            if 0 <= nr < m and 0 <= nc < n and not visited[nr][nc]:
                visited[nr][nc] = True
                water += max(0, h - height_map[nr][nc])
                heapq.heappush(pq, (max(h, height_map[nr][nc]), nr, nc))
    return water`,
  typescript: `export function trapRainWater(heightMap: number[][]): number {
    const m = heightMap.length, n = heightMap[0].length;
    const visited: boolean[][] = Array.from({ length: m }, () => new Array(n).fill(false));
    const pq: { r: number; c: number; h: number }[] = [];
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (i === 0 || i === m - 1 || j === 0 || j === n - 1) {
                pq.push({ r: i, c: j, h: heightMap[i][j] });
                visited[i][j] = true;
            }
        }
    }
    pq.sort((a, b) => a.h - b.h);
    let water = 0;
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    while (pq.length > 0) {
        const cur = pq.shift()!;
        for (const [dr, dc] of dirs) {
            const nr = cur.r + dr, nc = cur.c + dc;
            if (nr >= 0 && nr < m && nc >= 0 && nc < n && !visited[nr][nc]) {
                visited[nr][nc] = true;
                water += Math.max(0, cur.h - heightMap[nr][nc]);
                pq.push({ r: nr, c: nc, h: Math.max(heightMap[nr][nc], cur.h) });
                pq.sort((a, b) => a.h - b.h);
            }
        }
    }
    return water;
}`
};

export const RAIN_WATER_3D_CODE_LINES = {
  init: { java: 12, cpp: 10, python: 6, typescript: 7 },
  spread: { java: 27, cpp: 23, python: 18, typescript: 22 },
  finish: { java: 32, cpp: 28, python: 21, typescript: 28 },
};

export function buildRainWater3DSteps(grid: number[][]): RainWater3DStep[] {
  const steps: RainWater3DStep[] = [];
  const m = grid.length, n = grid[0].length;
  const visited: boolean[][] = Array.from({ length: m }, () => new Array(n).fill(false));
  const waterGrid: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  const pq: { r: number; c: number; h: number }[] = [];

  // 初始化外围一圈入堆
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (i === 0 || i === m - 1 || j === 0 || j === n - 1) {
        pq.push({ r: i, c: j, h: grid[i][j] });
        visited[i][j] = true;
      }
    }
  }
  pq.sort((a, b) => a.h - b.h);

  steps.push({
    grid,
    waterGrid: waterGrid.map((r) => [...r]),
    curR: -1,
    curC: -1,
    curH: 0,
    totalWater: 0,
    heapSize: pq.length,
    decision: `主函数入口：网格大小 ${m} × ${n}，将最外围 ${pq.length} 个边界木桶单元格压入小根堆`,
    message: '核心原理：木桶短板理论。水只能从最外围最矮的缺口向内漫灌，故优先弹出堆顶最矮边界',
    log: `init 3D rain water, boundaryCount=${pq.length}`,
    codeLine: RAIN_WATER_3D_CODE_LINES.init,
    statusBadge: { text: '外围木桶就绪', type: 'info' },
    metrics: {
      curH: '—',
      heapSize: `${pq.length} 格`,
      focusCoord: '准备就绪',
      totalWater: '0',
    },
    ans: '0',
  });

  let totalWater = 0;
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  while (pq.length > 0) {
    const cur = pq.shift()!;

    for (const [dr, dc] of dirs) {
      const nr = cur.r + dr, nc = cur.c + dc;
      if (nr >= 0 && nr < m && nc >= 0 && nc < n && !visited[nr][nc]) {
        visited[nr][nc] = true;
        const diff = Math.max(0, cur.h - grid[nr][nc]);
        totalWater += diff;
        waterGrid[nr][nc] = diff;
        const nextH = Math.max(grid[nr][nc], cur.h);
        pq.push({ r: nr, c: nc, h: nextH });
        pq.sort((a, b) => a.h - b.h);

        steps.push({
          grid,
          waterGrid: waterGrid.map((r) => [...r]),
          curR: nr,
          curC: nc,
          curH: cur.h,
          totalWater,
          heapSize: pq.length,
          decision: `从小根堆弹出最矮边界 (${cur.r}, ${cur.c}) 高度 ${cur.h}，向内扩散探测邻居 (${nr}, ${nc}) 自身高度 ${grid[nr][nc]}`,
          message: diff > 0 ? `🎉 邻居高度低于短板高度，成功蓄水 ${diff} 单位！新边界提升为 ${nextH}` : `邻居自身更高，未产生蓄水，直接作为新木桶短板 ${nextH} 入堆`,
          log: `cell (${nr}, ${nc}) water += ${diff}, nextH=${nextH}`,
          codeLine: RAIN_WATER_3D_CODE_LINES.spread,
          statusBadge: diff > 0 ? { text: `蓄水 +${diff}`, type: 'success' } : { text: '推高木桶边界', type: 'warning' },
          metrics: {
            curH: `${cur.h}`,
            heapSize: `${pq.length} 格`,
            focusCoord: `(${nr}, ${nc})`,
            totalWater: `${totalWater}`,
          },
          ans: `${totalWater}`,
        });
      }
    }
  }

  steps.push({
    grid,
    waterGrid: waterGrid.map((r) => [...r]),
    curR: -1,
    curC: -1,
    curH: 0,
    totalWater,
    heapSize: 0,
    decision: `🎉 3D 接雨水模拟完毕！内部所有盆地注水收敛，全局接雨水总量为: ${totalWater} 单位`,
    message: '小根堆已空，全部单元格已灌满',
    log: `done totalWater=${totalWater}`,
    codeLine: RAIN_WATER_3D_CODE_LINES.finish,
    statusBadge: { text: `总蓄水量 = ${totalWater}`, type: 'success' },
    metrics: {
      curH: '收敛',
      heapSize: '0 格',
      focusCoord: '全部完成',
      totalWater: `${totalWater}`,
    },
    ans: `${totalWater}`,
  });

  return steps;
}
