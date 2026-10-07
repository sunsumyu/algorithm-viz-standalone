/**
 * 岛屿周长 (LC 463) 步骤推演编译器 (Step Compiler)
 */

import { HighlightTarget } from '../../../core/code-panel';

export interface CLStep {
  grid: number[][];
  rows: number;
  cols: number;
  currentCell: [number, number] | null;
  landCount: number;
  perimeter: number;
  cellEdges: number;
  exposedEdges: Record<string, [boolean, boolean, boolean, boolean]>;
  statusText: string;
  codeLine: HighlightTarget;
}

const lines = {
  init: { java: 3, cpp: 4, python: 3, javascript: 2 },
  scan: { java: [6, 7], cpp: [6, 7], python: [5, 6], javascript: [5, 6] },
  isLand: { java: 8, cpp: 8, python: 7, javascript: 7 },
  checkDirs: { java: [10, 11, 12, 13, 14], cpp: [10, 11, 12, 13, 14], python: [9, 10, 11, 12, 13], javascript: [9, 10, 11, 12, 13] },
  done: { java: 19, cpp: 19, python: 17, javascript: 18 },
};

export function buildCoastlineSteps(grid: number[][]): CLStep[] {
  const steps: CLStep[] = [];
  const rows = grid.length;
  if (rows === 0) return steps;
  const cols = grid[0].length;

  let landCount = 0;
  let perimeter = 0;
  const exposedEdges: Record<string, [boolean, boolean, boolean, boolean]> = {};

  steps.push({
    grid,
    rows,
    cols,
    currentCell: null,
    landCount: 0,
    perimeter: 0,
    cellEdges: 0,
    exposedEdges: {},
    statusText: `初始化网格 [${rows}×${cols}]，准备遍历所有格子寻找陆地并统计周长`,
    codeLine: lines.init,
  });

  const dirs = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      steps.push({
        grid,
        rows,
        cols,
        currentCell: [r, c],
        landCount,
        perimeter,
        cellEdges: 0,
        exposedEdges: { ...exposedEdges },
        statusText: `扫描格 (${r}, ${c})：当前值为 ${grid[r][c] === 1 ? '陆地 (1)' : '水域 (0)'}`,
        codeLine: lines.scan,
      });

      if (grid[r][c] === 1) {
        landCount++;
        let localEdges = 0;
        const edgeFlags: [boolean, boolean, boolean, boolean] = [false, false, false, false];

        steps.push({
          grid,
          rows,
          cols,
          currentCell: [r, c],
          landCount,
          perimeter,
          cellEdges: 0,
          exposedEdges: { ...exposedEdges },
          statusText: `命中陆地 (${r}, ${c})！开始检查其 4 邻域方向是否有与水域或边界接壤的暴露边`,
          codeLine: lines.isLand,
        });

        for (let d = 0; d < 4; d++) {
          const nr = r + dirs[d][0];
          const nc = c + dirs[d][1];
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] === 0) {
            localEdges++;
            edgeFlags[d] = true;
          }
        }

        perimeter += localEdges;
        exposedEdges[`${r},${c}`] = edgeFlags;

        steps.push({
          grid,
          rows,
          cols,
          currentCell: [r, c],
          landCount,
          perimeter,
          cellEdges: localEdges,
          exposedEdges: { ...exposedEdges },
          statusText: `陆地格 (${r}, ${c}) 贡献了 ${localEdges} 条周长边，当前累计总周长: ${perimeter}`,
          codeLine: lines.checkDirs,
        });
      }
    }
  }

  steps.push({
    grid,
    rows,
    cols,
    currentCell: null,
    landCount,
    perimeter,
    cellEdges: 0,
    exposedEdges: { ...exposedEdges },
    statusText: `网格遍历完成！共访问陆地格 ${landCount} 个，最终岛屿周长为: ${perimeter}`,
    codeLine: lines.done,
  });

  return steps;
}

export function withCoastlineMetrics(steps: CLStep[]): any[] {
  return steps.map((s) => ({
    ...s,
    message: s.statusText,
    metrics: {
      'metric-cur-cell': s.currentCell ? `(${s.currentCell[0]}, ${s.currentCell[1]})` : '—',
      'metric-cell-edges': `${s.cellEdges}`,
      'metric-land-count': `${s.landCount}`,
      'metric-total-perimeter': `${s.perimeter}`,
      action:
        s.currentCell && s.cellEdges > 0
          ? `(${s.currentCell[0]}, ${s.currentCell[1]}) 外露边 +${s.cellEdges} -> 累计周长 = ${s.perimeter}`
          : '若邻格越界或为水域 (0)，则周长 perimeter++',
    },
  }));
}
