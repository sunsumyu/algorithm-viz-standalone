/**
 * 岛屿数量 (DFS) 步骤编译器 (Step Compiler)
 * 负责深度优先连通分量遍历状态机与四语言 1-based 代码行号锚点
 */

import { snapshotGrid2D } from '../../../core/strategies/grid-snapshot';
import { HighlightTarget } from '../../../core/code-panel';

export type CellState = 'water' | 'land' | 'visited';

/** 代码面板高亮行号锚点（1-based，与源码逐行对应） */
export const ISLANDS_CODE_LINES: Record<string, Record<string, number | number[]>> = {
  init: { java: 3, cpp: 4, python: 3, javascript: 2 },
  scan: { java: [4, 5], cpp: [5, 6], python: [11, 12], javascript: [10, 11] },
  found: { java: [6, 7], cpp: [7, 8], python: [13, 14], javascript: [12, 13] },
  dfsEntry: { java: 14, cpp: 15, python: 5, javascript: 4 },
  baseCheck: { java: 15, cpp: 16, python: [6, 7], javascript: 5 },
  markVisited: { java: 16, cpp: 17, python: 8, javascript: 6 },
  dfsRecurse: { java: [17, 18, 19, 20], cpp: [18, 19], python: [9, 10], javascript: [7, 8] },
  done: { java: 12, cpp: 13, python: 16, javascript: 18 },
};

const lines = ISLANDS_CODE_LINES;

export interface IslandsStep {
  grid: number[][];
  states: CellState[][];
  current: [number, number] | null;
  scan: [number, number] | null;
  count: number;
  visitedLand: number;
  action: 'init' | 'scan' | 'found' | 'dfs-enter' | 'check' | 'mark' | 'dfs-return' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function buildIslandsSteps(grid: number[][]): IslandsStep[] {
  const steps: IslandsStep[] = [];
  const m = grid.length;
  if (m === 0) return steps;
  const n = grid[0].length;
  const states: CellState[][] = grid.map((row) => row.map((v) => (v === 1 ? 'land' : 'water')));
  let count = 0;
  let visitedLand = 0;

  const snapshot = (extra: Partial<IslandsStep>): void => {
    steps.push({
      grid,
      states: snapshotGrid2D(states),
      current: extra.current ?? null,
      scan: extra.scan ?? null,
      count,
      visitedLand,
      action: extra.action ?? 'scan',
      message: extra.message ?? '',
      log: extra.log ?? '',
      codeLine: extra.codeLine ?? lines.init,
    });
  };

  snapshot({
    action: 'init',
    message: `初始化 ${m}×${n} 网格。准备双重循环扫描寻找未访问陆地 (1)。`,
    log: `初始化网格 ${m}x${n}`,
    codeLine: lines.init,
  });

  const dfs = (r: number, c: number, from: [number, number] | null): void => {
    snapshot({
      current: [r, c],
      scan: from,
      action: 'check',
      message: `检查坐标 (${r}, ${c})：边界与水域判定。`,
      log: `  dfs(${r}, ${c}) 边界检查`,
      codeLine: lines.baseCheck,
    });

    if (r < 0 || r >= m || c < 0 || c >= n || states[r][c] !== 'land') {
      return;
    }

    states[r][c] = 'visited';
    visitedLand++;

    snapshot({
      current: [r, c],
      scan: from,
      action: 'mark',
      message: `染色沉没 (${r}, ${c})：将其标记为已访问 (0)，防止重复遍历。`,
      log: `  沉没陆地 (${r}, ${c})`,
      codeLine: lines.markVisited,
    });

    const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < m && nc >= 0 && nc < n && states[nr][nc] === 'land') {
        snapshot({
          current: [nr, nc],
          scan: [r, c],
          action: 'dfs-enter',
          message: `从 (${r}, ${c}) 深入向相邻陆地 (${nr}, ${nc}) 递归扩展。`,
          log: `  -> 递归深入 (${nr}, ${nc})`,
          codeLine: lines.dfsRecurse,
        });
        dfs(nr, nc, [r, c]);
      }
    }
  };

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (states[r][c] === 'land') {
        count++;
        snapshot({
          scan: [r, c],
          current: [r, c],
          action: 'found',
          message: `🎯 在 (${r}, ${c}) 发现新岛屿起点！count = ${count}。启动 DFS 连通分量遍历。`,
          log: `[新岛屿 #${count}] 发现起点 (${r}, ${c})`,
          codeLine: lines.found,
        });
        dfs(r, c, null);
      } else {
        snapshot({
          scan: [r, c],
          current: null,
          action: 'scan',
          message: `扫描格 (${r}, ${c})：${states[r][c] === 'water' ? '水域 (0)' : '已访问陆地'}，跳过。`,
          log: `扫描 (${r}, ${c}): ${states[r][c]}`,
          codeLine: lines.scan,
        });
      }
    }
  }

  snapshot({
    action: 'done',
    current: null,
    scan: null,
    message: `🎉 全网格扫描探索完成！共发现 ${count} 座独立岛屿，共计访问 ${visitedLand} 格陆地。`,
    log: `✓ 探索完成: 岛屿总数 = ${count}`,
    codeLine: lines.done,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withIslandsMetrics(steps: IslandsStep[]): IslandsStep[] {
  return steps.map((s) => {
    let formula = 'dfs(grid, r, c) -> 四向沉岛';
    if (s.action === 'found') {
      formula = `发现新岛屿: grid[${s.scan?.[0]}][${s.scan?.[1]}] == '1' -> count++ (${s.count})`;
    } else if (s.action === 'mark') {
      formula = `沉岛染色: grid[${s.current?.[0]}][${s.current?.[1]}] = '0' (visited)`;
    } else if (s.action === 'done') {
      formula = `探索完毕: 岛屿总数 count = ${s.count}`;
    }

    return {
      ...s,
      metrics: {
        'metric-scan': s.scan ? `(${s.scan[0]}, ${s.scan[1]})` : '—',
        'metric-curr': s.current ? `(${s.current[0]}, ${s.current[1]})` : '—',
        'metric-visited-land': `${s.visitedLand}`,
        'metric-island-count': `${s.count}`,
        action: formula,
      },
    };
  });
}
