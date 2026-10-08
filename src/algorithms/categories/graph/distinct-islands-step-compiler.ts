/**
 * 不同岛屿的数量 (Number of Distinct Islands · LeetCode 694) 步骤推演编译器
 * 职责：平移不变性几何形状哈希化、相对坐标原点归一化与集合去重推演
 */

import { snapshotGrid2D } from '../../../core/strategies/grid-snapshot';
import { HighlightTarget } from '../../../core/code-panel';

export type DistinctIslandCellState =
  | 'water'
  | 'land'
  | 'origin'
  | 'visiting'
  | 'sunk';

export const DISTINCT_ISLANDS_CODE_LINES: Record<string, Record<string, number | number[]>> = {
  init: { java: [2, 3, 4], cpp: [4, 5, 6], python: [2, 3, 4], javascript: [2, 3] },
  scan: { java: [5, 6], cpp: [7, 8], python: [12, 13], javascript: [12, 13] },
  found: { java: [7, 8], cpp: [9, 10], python: [14, 15], javascript: [14, 15] },
  dfs: { java: [15, 16, 17, 18, 19, 20, 21], cpp: [16, 17, 18, 19, 20, 21, 22], python: [6, 7, 8, 9, 10, 11], javascript: [5, 6, 7, 8, 9, 10] },
  record: { java: [9, 10], cpp: [11, 12], python: [16, 17], javascript: [16, 17] },
  done: { java: 13, cpp: 14, python: 18, javascript: 20 },
};

const lines = DISTINCT_ISLANDS_CODE_LINES;

export interface DistinctIslandsStep {
  grid: number[][];
  states: DistinctIslandCellState[][];
  rows: number;
  cols: number;
  currentCell: [number, number] | null;
  originCell: [number, number] | null;
  currentSignature: string;
  shapesList: string[];
  totalIslands: number;
  distinctCount: number;
  isDuplicate: boolean;
  action: 'init' | 'scan' | 'found' | 'dfs' | 'record' | 'done';
  statusText: string;
  message?: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export const DEFAULT_DISTINCT_GRID: number[][] = [
  [1, 1, 0, 0, 0],
  [1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1],
  [0, 0, 0, 1, 1],
];

const DIRS: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export function buildDistinctIslandsSteps(initialGrid: number[][] = DEFAULT_DISTINCT_GRID): DistinctIslandsStep[] {
  const steps: DistinctIslandsStep[] = [];
  const R = initialGrid.length;
  if (R === 0) return steps;
  const C = initialGrid[0].length;
  const grid = snapshotGrid2D(initialGrid);

  const states: DistinctIslandCellState[][] = grid.map((row) =>
    row.map((v) => (v === 1 ? 'land' : 'water'))
  );

  const shapesSet = new Set<string>();
  const shapesList: string[] = [];
  let totalIslands = 0;

  const pushStep = (extra: Partial<DistinctIslandsStep>): void => {
    steps.push({
      grid: snapshotGrid2D(grid),
      states: snapshotGrid2D(states),
      rows: R,
      cols: C,
      currentCell: extra.currentCell ?? null,
      originCell: extra.originCell ?? null,
      currentSignature: extra.currentSignature ?? '',
      shapesList: [...shapesList],
      totalIslands,
      distinctCount: shapesList.length,
      isDuplicate: extra.isDuplicate ?? false,
      action: extra.action ?? 'scan',
      statusText: extra.statusText ?? '',
      message: extra.message ?? '',
      log: extra.log ?? '',
      codeLine: extra.codeLine ?? lines.init,
    });
  };

  // 初始帧
  pushStep({
    currentCell: null,
    originCell: null,
    action: 'init',
    statusText: '准备开始：相对坐标归一化与几何形状哈希去重',
    message: '网格初始载入完成：以每个岛屿首个陆地为原点 (r0, c0)，计算所有相对偏移并存入哈希集合去重。',
    log: `初始化网格 [${R}×${C}]。准备遍历网格以检测互不相同的岛屿形态。`,
    codeLine: lines.init,
  });

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] === 1) {
        totalIslands++;
        const originR = r;
        const originC = c;
        states[r][c] = 'origin';

        pushStep({
          currentCell: [r, c],
          originCell: [originR, originC],
          action: 'found',
          statusText: `在 (${r}, ${c}) 发现第 ${totalIslands} 座岛屿！锁定锚点原点`,
          message: `以 (${r}, ${c}) 为锚点原点 (0, 0)，发起 DFS 收集连通块所有相对偏移坐标`,
          log: `[发现岛屿] (${r}, ${c}) 命中新岛屿种子点，锁定原点 (${originR}, ${originC})。`,
          codeLine: lines.found,
        });

        // 收集相对坐标
        const relativeCoords: [number, number][] = [];
        const stack: [number, number][] = [[r, c]];
        grid[r][c] = 0;
        relativeCoords.push([0, 0]);

        while (stack.length > 0) {
          const [cr, cc] = stack.pop()!;
          states[cr][cc] = cr === originR && cc === originC ? 'origin' : 'sunk';

          pushStep({
            currentCell: [cr, cc],
            originCell: [originR, originC],
            action: 'dfs',
            statusText: `DFS 沉岛并记录相对偏移：(${cr - originR}, ${cc - originC})`,
            message: `绝对坐标 (${cr}, ${cc}) 映射为相对偏移 (${cr - originR}, ${cc - originC})，就地置 0 沉没`,
            log: `[相对坐标记录] 访问 (${cr}, ${cc})，记录偏移 Δ=(${cr - originR}, ${cc - originC})。`,
            codeLine: lines.dfs,
          });

          for (const [dr, dc] of DIRS) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (nr >= 0 && nr < R && nc >= 0 && nc < C && grid[nr][nc] === 1) {
              grid[nr][nc] = 0;
              relativeCoords.push([nr - originR, nc - originC]);
              stack.push([nr, nc]);
            }
          }
        }

        // 形状签名序列化
        relativeCoords.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        const sig = relativeCoords.map(([dr, dc]) => `${dr},${dc}`).join(';');
        const isDup = shapesSet.has(sig);

        if (!isDup) {
          shapesSet.add(sig);
          shapesList.push(sig);
        }

        pushStep({
          currentCell: [r, c],
          originCell: [originR, originC],
          currentSignature: sig,
          isDuplicate: isDup,
          action: 'record',
          statusText: isDup
            ? `形状签名 "${sig}" 已存在！判定为同构平移重复岛屿`
            : `发现全新几何形状！签名 "${sig}" 登记入库，独立形态总数：${shapesList.length}`,
          message: isDup
            ? `当前岛屿与既有岛屿平移全等（签名：${sig}），去重丢弃。`
            : `当前岛屿具有全新的独特几何轮廓（签名：${sig}），已加入形状库。`,
          log: isDup
            ? `[形状去重] 签名 ${sig} 已在集合中，重复形态不累加。`
            : `[全新形态] 登记形状 ${sig}，不同形态数增至 ${shapesList.length}。`,
          codeLine: lines.record,
        });
      }
    }
  }

  // 终局帧
  pushStep({
    currentCell: null,
    originCell: null,
    action: 'done',
    statusText: `遍历完成！全图共发现岛屿 ${totalIslands} 座，去重后不同形状岛屿共有 ${shapesList.length} 座`,
    message: `平移等价性去重完毕：共收录 ${shapesList.length} 种互不相同的岛屿拓扑轮廓！`,
    log: `推演结束：返回不同岛屿数量 ${shapesList.length}。`,
    codeLine: lines.done,
  });

  return steps;
}

export function withDistinctIslandsMetrics(steps: DistinctIslandsStep[]): DistinctIslandsStep[] {
  return steps.map((s) => {
    return {
      ...s,
      metrics: {
        'metric-scan': s.currentCell ? `(${s.currentCell[0]}, ${s.currentCell[1]})` : '无',
        'metric-origin': s.originCell ? `(${s.originCell[0]}, ${s.originCell[1]})` : '无',
        'metric-sig': s.currentSignature ? s.currentSignature : '计算中',
        'metric-total-islands': `${s.totalIslands} 座`,
        'metric-distinct-count': `${s.distinctCount} 种`,
        action: s.statusText,
      },
    };
  });
}
