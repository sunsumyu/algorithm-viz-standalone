/**
 * 统计封闭岛屿的数目 (Closed Islands · LeetCode 1254) 步骤推演编译器
 * 职责：双阶段泛洪算法推演（阶段一：消除边界连通陆地；阶段二：内部封闭岛屿计数与浸没）
 */

import { snapshotGrid2D } from '../../../core/strategies/grid-snapshot';
import { HighlightTarget } from '../../../core/code-panel';

export type ClosedIslandCellState =
  | 'land'
  | 'water'
  | 'visiting'
  | 'border-sunk'
  | 'closed-sunk';

export const CLOSED_ISLANDS_CODE_LINES: Record<string, Record<string, number | number[]>> = {
  init: { java: [2, 3], cpp: [4, 5], python: [2, 3], javascript: 2 },
  borderScan: { java: [5, 6, 7, 9, 10, 11], cpp: [6, 7, 8, 10, 11, 12], python: [11, 12, 13, 14], javascript: [9, 10, 11, 12] },
  borderDfs: { java: [26, 27, 28, 29, 30], cpp: [26, 27, 28, 29, 30], python: [5, 6, 7, 8], javascript: [4, 5, 6, 7] },
  innerScan: { java: [15, 16, 17], cpp: [16, 17, 18], python: [16, 17, 18], javascript: [15, 16, 17] },
  closedFound: { java: [18, 19, 20], cpp: [19, 20, 21], python: [19, 20, 21], javascript: [18, 19, 20] },
  innerDfs: { java: [26, 27, 28, 29, 30], cpp: [26, 27, 28, 29, 30], python: [6, 7, 8], javascript: [5, 6, 7] },
  done: { java: 23, cpp: 24, python: 22, javascript: 23 },
};

const lines = CLOSED_ISLANDS_CODE_LINES;

export interface ClosedIslandsStep {
  grid: number[][]; // 当前网格值 (0: 陆地, 1: 水域)
  states: ClosedIslandCellState[][];
  rows: number;
  cols: number;
  currentCell: [number, number] | null;
  phase: 'init' | 'border-phase' | 'inner-phase' | 'done';
  borderSunkCount: number;
  closedCount: number;
  action: 'init' | 'border-scan' | 'border-dfs' | 'inner-scan' | 'closed-found' | 'inner-dfs' | 'done';
  statusText: string;
  message?: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export const DEFAULT_CLOSED_GRID: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 0],
  [1, 0, 0, 0, 0, 1, 1, 0],
  [1, 0, 1, 0, 1, 1, 1, 0],
  [1, 0, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0],
];

const DIRS: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export function buildClosedIslandsSteps(initialGrid: number[][] = DEFAULT_CLOSED_GRID): ClosedIslandsStep[] {
  const steps: ClosedIslandsStep[] = [];
  const R = initialGrid.length;
  if (R === 0) return steps;
  const C = initialGrid[0].length;
  const grid = snapshotGrid2D(initialGrid);

  const states: ClosedIslandCellState[][] = grid.map((row) =>
    row.map((v) => (v === 0 ? 'land' : 'water'))
  );

  let borderSunkCount = 0;
  let closedCount = 0;

  const pushStep = (extra: Partial<ClosedIslandsStep>): void => {
    steps.push({
      grid: snapshotGrid2D(grid),
      states: snapshotGrid2D(states),
      rows: R,
      cols: C,
      currentCell: extra.currentCell ?? null,
      phase: extra.phase ?? 'inner-phase',
      borderSunkCount,
      closedCount,
      action: extra.action ?? 'inner-scan',
      statusText: extra.statusText ?? '',
      message: extra.message ?? '',
      log: extra.log ?? '',
      codeLine: extra.codeLine ?? lines.init,
    });
  };

  // 初始帧
  pushStep({
    currentCell: null,
    phase: 'init',
    action: 'init',
    statusText: '准备开始：先淹没边界陆地，再统计内部封闭岛屿',
    message: '网格初始载入完成：0 为陆地，1 为水域。封闭岛屿必须 100% 被水域包围且不碰边界。',
    log: `载入网格 [${R}×${C}]，准备执行两阶段泛洪算法：第一阶段排除边界连通伪孤岛，第二阶段统计内部封闭岛。`,
    codeLine: lines.init,
  });

  // 阶段一：淹没四周边界相连的非封闭陆地
  const dfsFlood = (startR: number, startC: number, isBorder: boolean): void => {
    const stack: [number, number][] = [[startR, startC]];
    grid[startR][startC] = 1;
    states[startR][startC] = isBorder ? 'border-sunk' : 'closed-sunk';
    if (isBorder) borderSunkCount++;

    while (stack.length > 0) {
      const [cr, cc] = stack.pop()!;
      pushStep({
        currentCell: [cr, cc],
        phase: isBorder ? 'border-phase' : 'inner-phase',
        action: isBorder ? 'border-dfs' : 'inner-dfs',
        statusText: isBorder
          ? `阶段一：边界连通泛洪中，淹没单元格 (${cr}, ${cc})`
          : `阶段二：封闭岛屿连通浸没中，浸没单元格 (${cr}, ${cc})`,
        message: isBorder
          ? `边界陆地 (${cr}, ${cc}) 连通外围，绝对无法封闭，就地淹没为水域 1`
          : `内部封闭岛屿单元格 (${cr}, ${cc}) 正在浸没染色，防止重复计数`,
        log: isBorder
          ? `[边界泛洪] 访问 (${cr}, ${cc})，置为水域 1，累计排除边界陆地 ${borderSunkCount} 格。`
          : `[封闭浸没] 访问 (${cr}, ${cc})，置为水域 1，封闭岛 #${closedCount} 持续收拢。`,
        codeLine: isBorder ? lines.borderDfs : lines.innerDfs,
      });

      for (const [dr, dc] of DIRS) {
        const nr = cr + dr;
        const nc = cc + dc;
        if (nr >= 0 && nr < R && nc >= 0 && nc < C && grid[nr][nc] === 0) {
          grid[nr][nc] = 1;
          states[nr][nc] = isBorder ? 'border-sunk' : 'closed-sunk';
          if (isBorder) borderSunkCount++;
          stack.push([nr, nc]);
        }
      }
    }
  };

  // 扫描第一列与最后一列
  for (let r = 0; r < R; r++) {
    if (grid[r][0] === 0) {
      pushStep({
        currentCell: [r, 0],
        phase: 'border-phase',
        action: 'border-scan',
        statusText: `阶段一：在左边界发现陆地 (行 ${r}, 列 0)`,
        message: `左边界暴露陆地 (${r}, 0)，发起 DFS 泛洪淹没其所属全部连通块`,
        log: `扫描左边界 (${r}, 0) 遭遇陆地 0，启动边界连通块定向淹没。`,
        codeLine: lines.borderScan,
      });
      dfsFlood(r, 0, true);
    }
    if (grid[r][C - 1] === 0) {
      pushStep({
        currentCell: [r, C - 1],
        phase: 'border-phase',
        action: 'border-scan',
        statusText: `阶段一：在右边界发现陆地 (行 ${r}, 列 ${C - 1})`,
        message: `右边界暴露陆地 (${r}, ${C - 1})，发起 DFS 泛洪淹没其所属全部连通块`,
        log: `扫描右边界 (${r}, ${C - 1}) 遭遇陆地 0，启动边界连通块定向淹没。`,
        codeLine: lines.borderScan,
      });
      dfsFlood(r, C - 1, true);
    }
  }

  // 扫描第一行与最后一行
  for (let c = 0; c < C; c++) {
    if (grid[0][c] === 0) {
      pushStep({
        currentCell: [0, c],
        phase: 'border-phase',
        action: 'border-scan',
        statusText: `阶段一：在上边界发现陆地 (行 0, 列 ${c})`,
        message: `上边界暴露陆地 (0, ${c})，发起 DFS 泛洪淹没其所属全部连通块`,
        log: `扫描上边界 (0, ${c}) 遭遇陆地 0，启动边界连通块定向淹没。`,
        codeLine: lines.borderScan,
      });
      dfsFlood(0, c, true);
    }
    if (grid[R - 1][c] === 0) {
      pushStep({
        currentCell: [R - 1, c],
        phase: 'border-phase',
        action: 'border-scan',
        statusText: `阶段一：在下边界发现陆地 (行 ${R - 1}, 列 ${c})`,
        message: `下边界暴露陆地 (${R - 1}, ${c})，发起 DFS 泛洪淹没其所属全部连通块`,
        log: `扫描下边界 (${R - 1}, ${c}) 遭遇陆地 0，启动边界连通块定向淹没。`,
        codeLine: lines.borderScan,
      });
      dfsFlood(R - 1, c, true);
    }
  }

  // 阶段二：遍历内部网格，统计真正封闭的孤岛
  for (let r = 1; r < R - 1; r++) {
    for (let c = 1; c < C - 1; c++) {
      if (grid[r][c] === 0) {
        closedCount++;
        pushStep({
          currentCell: [r, c],
          phase: 'inner-phase',
          action: 'closed-found',
          statusText: `阶段二：在内陆发现全新封闭岛屿！坐标 (${r}, ${c})`,
          message: `单元格 (${r}, ${c}) 是未接触边界的纯内陆陆地，确认发现封闭岛屿：closedCount = ${closedCount}`,
          log: `[封闭岛确认] 内部扫描在 (${r}, ${c}) 命中封闭岛种子点，count 增至 ${closedCount}，发起 DFS 连通块浸没。`,
          codeLine: lines.closedFound,
        });
        dfsFlood(r, c, false);
      }
    }
  }

  // 终局帧
  pushStep({
    currentCell: null,
    phase: 'done',
    action: 'done',
    statusText: `全网格遍历完成！最终封闭岛屿总数：${closedCount}`,
    message: `双阶段泛洪完毕：共排除边界陆地 ${borderSunkCount} 格，成功锁定并统计封闭岛屿 ${closedCount} 座！`,
    log: `推演结束：所有边界陆地已被消除，内部扫描确认封闭岛屿共 ${closedCount} 座，返回 ${closedCount}。`,
    codeLine: lines.done,
  });

  return steps;
}

export function withClosedIslandsMetrics(steps: ClosedIslandsStep[]): ClosedIslandsStep[] {
  return steps.map((s) => {
    const phaseLabel =
      s.phase === 'init'
        ? '初始载入'
        : s.phase === 'border-phase'
          ? '边界淹没阶段'
          : s.phase === 'inner-phase'
            ? '内陆封闭岛统计'
            : '推演闭环';

    return {
      ...s,
      metrics: {
        'metric-phase': phaseLabel,
        'metric-scan': s.currentCell ? `(${s.currentCell[0]}, ${s.currentCell[1]})` : '无',
        'metric-border-sunk': `${s.borderSunkCount} 格`,
        'metric-closed-count': `${s.closedCount} 座`,
        action: s.statusText,
      },
    };
  });
}
