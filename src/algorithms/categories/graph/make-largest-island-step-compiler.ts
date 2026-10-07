/**
 * 最大人工岛 (LC 827) 步骤推演编译器 (Step Compiler)
 */

import { snapshotGrid2D } from '../../../core/strategies/grid-snapshot';

const lines: Record<string, number | number[]> = {
  init: [1, 2, 3],
  label: [7, 8, 9, 10],
  try: [19, 20, 21, 22, 23, 24],
  done: 29,
};

export interface MLIStep {
  grid: number[][];
  islandId: number[][];
  areaMap: Record<number, number>;
  rows: number;
  cols: number;
  currentCell: [number, number] | null;
  stage: string;
  tryArea: number;
  maxArea: number;
  bestCell: [number, number] | null;
  action: 'init' | 'label' | 'try' | 'done';
  statusText: string;
  message?: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export const DEFAULT_GRID = [
  [1, 0, 1],
  [0, 1, 0],
  [1, 0, 1],
];

const DIRS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export function buildMakeLargestIslandSteps(initialGrid: number[][] = DEFAULT_GRID): MLIStep[] {
  const steps: MLIStep[] = [];
  const R = initialGrid.length;
  const C = initialGrid[0].length;
  const grid = snapshotGrid2D(initialGrid);
  const islandId = Array.from({ length: R }, () => Array(C).fill(0));
  const areaMap: Record<number, number> = {};

  steps.push({
    grid: snapshotGrid2D(grid),
    islandId: snapshotGrid2D(islandId),
    areaMap: {},
    rows: R,
    cols: C,
    currentCell: null,
    stage: '准备开始',
    tryArea: 0,
    maxArea: 0,
    bestCell: null,
    action: 'init',
    statusText: `初始化 ${R}×${C} 网格。第一阶段：通过 DFS 对各个独立岛屿进行编号染色 (ID >= 2) 并统计面积。`,
    log: `初始化: ${R}×${C} 二进制网格`,
    codeLine: lines.init,
  });

  let currentId = 2;
  let maxArea = 0;
  let bestCell: [number, number] | null = null;

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] === 1 && islandId[r][c] === 0) {
        let area = 0;
        const queue: [number, number][] = [[r, c]];
        islandId[r][c] = currentId;

        while (queue.length > 0) {
          const [cr, cc] = queue.shift()!;
          area++;
          for (const [dr, dc] of DIRS) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (nr >= 0 && nr < R && nc >= 0 && nc < C && grid[nr][nc] === 1 && islandId[nr][nc] === 0) {
              islandId[nr][nc] = currentId;
              queue.push([nr, nc]);
            }
          }
        }

        areaMap[currentId] = area;
        if (area > maxArea) {
          maxArea = area;
        }

        steps.push({
          grid: snapshotGrid2D(grid),
          islandId: snapshotGrid2D(islandId),
          areaMap: { ...areaMap },
          rows: R,
          cols: C,
          currentCell: [r, c],
          stage: '岛屿染色与统计',
          tryArea: area,
          maxArea,
          bestCell,
          action: 'label',
          statusText: `发现新岛屿并染色为 ID=${currentId}，总面积 = ${area}。`,
          log: `岛屿 ID ${currentId}: 染色完成，面积 = ${area}`,
          codeLine: lines.label,
        });

        currentId++;
      }
    }
  }

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] === 0) {
        const seenIds = new Set<number>();
        for (const [dr, dc] of DIRS) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < R && nc >= 0 && nc < C && islandId[nr][nc] > 1) {
            seenIds.add(islandId[nr][nc]);
          }
        }

        let curArea = 1;
        for (const id of seenIds) {
          curArea += areaMap[id] || 0;
        }

        if (curArea > maxArea) {
          maxArea = curArea;
          bestCell = [r, c];
        }

        const neighborStr = Array.from(seenIds).join(', ');
        steps.push({
          grid: snapshotGrid2D(grid),
          islandId: snapshotGrid2D(islandId),
          areaMap: { ...areaMap },
          rows: R,
          cols: C,
          currentCell: [r, c],
          stage: '尝试水域填海桥接',
          tryArea: curArea,
          maxArea,
          bestCell,
          action: 'try',
          statusText: `尝试在水域 (${r}, ${c}) 填海造陆：连通相邻岛屿 [${neighborStr || '无'}]，合并后总面积 = 1 + ${curArea - 1} = ${curArea}。当前最大面积 = ${maxArea}。`,
          log: `测试水域 (${r},${c}): 合并面积 = ${curArea} (相邻岛屿: ${neighborStr || '无'})`,
          codeLine: lines.try,
        });
      }
    }
  }

  steps.push({
    grid: snapshotGrid2D(grid),
    islandId: snapshotGrid2D(islandId),
    areaMap: { ...areaMap },
    rows: R,
    cols: C,
    currentCell: bestCell,
    stage: '求解完成',
    tryArea: maxArea,
    maxArea,
    bestCell,
    action: 'done',
    statusText: `🎉 最大人工岛计算完成！最佳填海位置为 ${bestCell ? `(${bestCell[0]}, ${bestCell[1]})` : '无需填海'}，最大可能面积为 ${maxArea} 格。`,
    log: `✓ 求解完成: 最大人工岛面积 = ${maxArea}，最佳桥接点 = ${bestCell ? `(${bestCell[0]}, ${bestCell[1]})` : '无'}`,
    codeLine: lines.done,
  });

  return steps;
}

export function withMLIMetrics(steps: MLIStep[]): any[] {
  return steps.map((s) => ({
    ...s,
    message: s.statusText,
    metrics: {
      'metric-cur-cell': s.currentCell ? `(${s.currentCell[0]}, ${s.currentCell[1]})` : '—',
      'metric-try-area': `${s.tryArea}`,
      'metric-best-cell': s.bestCell ? `(${s.bestCell[0]}, ${s.bestCell[1]})` : '—',
      'metric-max-area': `${s.maxArea}`,
      action:
        s.action === 'try'
          ? `桥接 (${s.currentCell ? s.currentCell.join(',') : ''}): 1 + sum(neighborAreas) = ${s.tryArea}`
          : s.action === 'label'
          ? 'DFS 染色: 岛屿 ID 面积缓存完成'
          : 'curArea = 1 + sum(areaMap[neighborId])',
    },
  }));
}
