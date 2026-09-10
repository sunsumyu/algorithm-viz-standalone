/**
 * 大厂高频真题 01: 3D 接雨水 (Trapping Rain Water II)
 * LeetCode 407 / 大厂系统压轴高频题
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../../core/step-visualizer';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

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
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
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
    codeLine: 1,
    statusBadge: { text: '外围木桶就绪', type: 'info' },
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
          codeLine: 26,
          statusBadge: diff > 0 ? { text: `蓄水 +${diff}`, type: 'success' } : { text: '推高木桶边界', type: 'warning' },
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
    codeLine: 31,
    statusBadge: { text: `总蓄水量 = ${totalWater}`, type: 'success' },
  });

  return steps;
}

export const trappingRainWaterIIVisualizer = registerDeclarativeAlgorithm<RainWater3DStep>({
  id: 'trapping-rain-water-ii',
  name: '3D 接雨水 (Trapping Rain Water II)',
  category: 'search',
  icon: '🌊',
  difficulty: 3,
  levelOrder: 407,
  learningGoal: '掌握小根堆由外向内收缩木桶短板注水算法，秒杀二维网格三维几何积水高频压轴题',
  problemHtml: `
    <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目描述 (LeetCode 407)</h3>
      <p>给你一个 <code>m x n</code> 的矩阵，其中的值均为非负整数，代表二维高度图，请计算下雨后该地形一共能接多少立方米的雨水。</p>
      <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0;">
        <strong>样例地形：</strong><br/>
        [1, 4, 3, 1, 3, 2]<br/>
        [3, 2, 1, 3, 2, 4]<br/>
        [2, 3, 3, 2, 3, 1]<br/>
        <strong>总积水量：</strong>4
      </div>
    </div>
  `,
  inputs: [],
  codeLanguages: RAIN_WATER_3D_CODES,
  generateSteps: () => {
    const defaultGrid = [
      [1, 4, 3, 1, 3, 2],
      [3, 2, 1, 3, 2, 4],
      [2, 3, 3, 2, 3, 1],
    ];
    return buildRainWater3DSteps(defaultGrid);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        <!-- 顶部指标卡 -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">当前外围短板高度</div>
            <div style="font-size: 18px; font-weight: 700; color: #0284c7; margin-top: 4px;">${step.curH > 0 ? step.curH : '-'}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">小根堆活跃边界数</div>
            <div style="font-size: 18px; font-weight: 700; color: #8b5cf6; margin-top: 4px;">${step.heapSize} 格</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">聚焦单元格坐标</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669; margin-top: 4px;">${step.curR >= 0 ? `(${step.curR}, ${step.curC})` : '完成'}</div>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #166534;">累计接雨水总量</div>
            <div style="font-size: 22px; font-weight: 800; color: #15803d; margin-top: 4px;">${step.totalWater}</div>
          </div>
        </div>

        <!-- 3D 俯视热力图与注水展板 -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 12px;">🌊 地形高度与积水等高网格</div>
          <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
            ${step.grid.map((row, r) => `
              <div style="display: flex; gap: 8px;">
                ${row.map((val, c) => {
                  const water = step.waterGrid[r][c];
                  const isActive = r === step.curR && c === step.curC;
                  let bg = '#ffffff';
                  let border = '#cbd5e1';
                  if (water > 0) {
                    bg = '#bfdbfe';
                    border = '#3b82f6';
                  }
                  if (isActive) {
                    border = '#f59e0b';
                  }

                  return `
                    <div style="width: 58px; height: 50px; background: ${bg}; border: 2px solid ${border}; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                      <span style="font-size: 12px; font-weight: 700; color: #1e293b;">地:${val}</span>
                      <span style="font-size: 11px; font-weight: 700; color: ${water > 0 ? '#0284c7' : '#94a3b8'};">水:+${water}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 决策卡片 -->
        ${renderFormulaCard(
          '木桶注水核心公式',
          `water += max(0, boundaryH - terrainH) | nextH = max(boundaryH, terrainH)`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
