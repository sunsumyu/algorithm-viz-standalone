/**
 * 统计子岛屿 (Count Sub Islands · LeetCode 1905) 步骤推演编译器
 * 职责分层：双网格协同推演（阶段一：逆向剪枝排除非子岛；阶段二：统计确认合法子岛）
 */

import { snapshotGrid2D } from '../../../core/strategies/grid-snapshot';
import { HighlightTarget } from '../../../core/code-panel';

export type SubIslandCellState =
  | 'water'
  | 'land'
  | 'conflict'
  | 'excluded'
  | 'sub-island'
  | 'visiting';

export const SUB_ISLANDS_CODE_LINES: Record<string, Record<string, number | number[]>> = {
  init: { java: [2, 3], cpp: [4, 5], python: [2, 3], javascript: 2 },
  pruneScan: { java: [5, 6, 7], cpp: [6, 7, 8], python: [11, 12, 13], javascript: [9, 10, 11] },
  pruneDfs: { java: [8, 22, 23, 24, 25, 26], cpp: [9, 23, 24, 25, 26, 27], python: [14, 5, 6, 7, 8], javascript: [12, 4, 5, 6, 7] },
  subScan: { java: [14, 15, 16], cpp: [15, 16, 17], python: [17, 18, 19], javascript: [18, 19, 20] },
  subFound: { java: [17, 18], cpp: [18, 19], python: [20, 21], javascript: [21, 22] },
  subDfs: { java: [22, 23, 24, 25, 26], cpp: [23, 24, 25, 26, 27], python: [5, 6, 7, 8], javascript: [4, 5, 6, 7] },
  done: { java: 21, cpp: 22, python: 23, javascript: 25 },
};

const lines = SUB_ISLANDS_CODE_LINES;

export interface SubIslandsStep {
  grid1: number[][]; // 母图 (只读)
  grid2: number[][]; // 子岛图 (沉岛修改中)
  states2: SubIslandCellState[][];
  rows: number;
  cols: number;
  currentCell: [number, number] | null;
  phase: 'init' | 'prune-phase' | 'sub-phase' | 'done';
  excludedIslandCount: number;
  subIslandCount: number;
  action: 'init' | 'prune-scan' | 'prune-dfs' | 'sub-scan' | 'sub-found' | 'sub-dfs' | 'done';
  statusText: string;
  message?: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export const DEFAULT_GRID1: number[][] = [
  [1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 1, 0, 1, 1],
];

export const DEFAULT_GRID2: number[][] = [
  [1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1],
  [0, 1, 0, 0, 0],
  [1, 0, 1, 1, 0],
  [0, 1, 0, 1, 0],
];

const DIRS: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export function buildSubIslandsSteps(
  rawGrid1: number[][] = DEFAULT_GRID1,
  rawGrid2: number[][] = DEFAULT_GRID2
): SubIslandsStep[] {
  const steps: SubIslandsStep[] = [];
  const R = rawGrid2.length;
  if (R === 0) return steps;
  const C = rawGrid2[0].length;

  const g1 = snapshotGrid2D(rawGrid1);
  const g2 = snapshotGrid2D(rawGrid2);

  const states2: SubIslandCellState[][] = g2.map((row) =>
    row.map((v) => (v === 1 ? 'land' : 'water'))
  );

  let excludedIslandCount = 0;
  let subIslandCount = 0;

  const pushStep = (extra: Partial<SubIslandsStep>): void => {
    steps.push({
      grid1: snapshotGrid2D(g1),
      grid2: snapshotGrid2D(g2),
      states2: snapshotGrid2D(states2),
      rows: R,
      cols: C,
      currentCell: extra.currentCell ?? null,
      phase: extra.phase ?? 'sub-phase',
      excludedIslandCount,
      subIslandCount,
      action: extra.action ?? 'sub-scan',
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
    statusText: '准备开始：先逆向排除冒犯母图水域的非子岛，再统计纯净子岛',
    message: '母图 grid1 与子岛图 grid2 均加载完毕。若 grid2 陆地对应 grid1 水域，则该整座岛屿必非子岛。',
    log: `初始化双网格 [${R}×${C}]。准备执行两阶段逆向剪枝算法。`,
    codeLine: lines.init,
  });

  // 辅助沉岛函数
  const sinkIsland = (startR: number, startC: number, isPrune: boolean): void => {
    const stack: [number, number][] = [[startR, startC]];
    g2[startR][startC] = 0;
    states2[startR][startC] = isPrune ? 'excluded' : 'sub-island';

    while (stack.length > 0) {
      const [cr, cc] = stack.pop()!;
      pushStep({
        currentCell: [cr, cc],
        phase: isPrune ? 'prune-phase' : 'sub-phase',
        action: isPrune ? 'prune-dfs' : 'sub-dfs',
        statusText: isPrune
          ? `阶段一：逆向剪枝淹没中，消除非子岛单元格 (${cr}, ${cc})`
          : `阶段二：合法子岛浸没中，记录子岛单元格 (${cr}, ${cc})`,
        message: isPrune
          ? `(${cr}, ${cc}) 连通至非法水域冲突点，该整座岛屿在 grid2 中作废沉没`
          : `(${cr}, ${cc}) 属于确认的纯正子岛，原地置 0 防止重复计数`,
        log: isPrune
          ? `[逆向排除] 沉没 (${cr}, ${cc})，归一化非子岛 #${excludedIslandCount}。`
          : `[子岛收拢] 访问 (${cr}, ${cc})，子岛 #${subIslandCount} 连通块浸没。`,
        codeLine: isPrune ? lines.pruneDfs : lines.subDfs,
      });

      for (const [dr, dc] of DIRS) {
        const nr = cr + dr;
        const nc = cc + dc;
        if (nr >= 0 && nr < R && nc >= 0 && nc < C && g2[nr][nc] === 1) {
          g2[nr][nc] = 0;
          states2[nr][nc] = isPrune ? 'excluded' : 'sub-island';
          stack.push([nr, nc]);
        }
      }
    }
  };

  // 阶段一：逆向剪枝排除非子岛
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (g2[r][c] === 1 && g1[r][c] === 0) {
        excludedIslandCount++;
        states2[r][c] = 'conflict';
        pushStep({
          currentCell: [r, c],
          phase: 'prune-phase',
          action: 'prune-scan',
          statusText: `阶段一：发现冲突！grid2[${r}][${c}]=1 但 grid1 对应格为水域 0`,
          message: `单元格 (${r}, ${c}) 在母图中是水域！说明当前所属连通岛屿绝对不是子岛屿，发起整岛逆向淹没！`,
          log: `[冲突命中] (${r}, ${c}) 处 grid2=1, grid1=0。非子岛 #${excludedIslandCount} 触发整岛排除。`,
          codeLine: lines.pruneScan,
        });
        sinkIsland(r, c, true);
      }
    }
  }

  // 阶段二：剩下的岛屿 100% 全是纯正子岛屿
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (g2[r][c] === 1) {
        subIslandCount++;
        pushStep({
          currentCell: [r, c],
          phase: 'sub-phase',
          action: 'sub-found',
          statusText: `阶段二：发现合法纯正子岛屿！种子点 (${r}, ${c})`,
          message: `经逆向排查，当前岛屿所有陆地格子在母图 grid1 中全部对应陆地，确认子岛：subIslandCount = ${subIslandCount}`,
          log: `[子岛确认] 命中纯净子岛种子点 (${r}, ${c})，count 增至 ${subIslandCount}，发起 DFS 浸没。`,
          codeLine: lines.subFound,
        });
        sinkIsland(r, c, false);
      }
    }
  }

  // 终局帧
  pushStep({
    currentCell: null,
    phase: 'done',
    action: 'done',
    statusText: `推演完成！共排除非子岛 ${excludedIslandCount} 座，统计得到纯正子岛屿：${subIslandCount} 座`,
    message: `双网格协同推演闭环：所有连通块已判定完毕，最终子岛屿数目为 ${subIslandCount}！`,
    log: `推演结束：返回最终子岛屿数量 ${subIslandCount}。`,
    codeLine: lines.done,
  });

  return steps;
}

export function withSubIslandsMetrics(steps: SubIslandsStep[]): SubIslandsStep[] {
  return steps.map((s) => {
    const phaseLabel =
      s.phase === 'init'
        ? '初始载入'
        : s.phase === 'prune-phase'
          ? '逆向剪枝排除'
          : s.phase === 'sub-phase'
            ? '统计确认子岛'
            : '推演闭环';

    const cur = s.currentCell;
    const g1Val = cur ? (s.grid1[cur[0]][cur[1]] === 1 ? '陆地(1)' : '水域(0)') : '无';

    return {
      ...s,
      metrics: {
        'metric-phase': phaseLabel,
        'metric-scan': cur ? `(${cur[0]}, ${cur[1]})` : '无',
        'metric-grid1-val': g1Val,
        'metric-excluded-count': `${s.excludedIslandCount} 座`,
        'metric-sub-island-count': `${s.subIslandCount} 座`,
        action: s.statusText,
      },
    };
  });
}
