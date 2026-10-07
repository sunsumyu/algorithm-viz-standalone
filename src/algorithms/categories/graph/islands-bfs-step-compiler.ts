/**
 * 岛屿数量 (BFS) 步骤编译器 (Step Compiler)
 * 职责分层：负责状态推演状态机、四向连通队列波浪式扩散与多语言代码行号联动
 */

import { CellState } from './islands-renderer';
import { snapshotGrid2D } from '../../../core/strategies/grid-snapshot';
import { HighlightTarget } from '../../../core/code-panel';

/** 代码面板高亮行号锚点（1-based，与源码逐行对应） */
export const ISLANDS_BFS_CODE_LINES: Record<string, Record<string, number | number[]>> = {
  init: { java: 3, cpp: 5, python: 3, javascript: 2 },
  scan: { java: [6, 7], cpp: [7, 8], python: [6, 7], javascript: [5, 6] },
  found: { java: [8, 9, 10], cpp: [9, 10, 11], python: [8, 9, 10], javascript: [7, 8, 9] },
  poll: { java: 14, cpp: 15, python: 13, javascript: 12 },
  enqueue: { java: [18, 19], cpp: [19, 20], python: [17, 18], javascript: [16, 17] },
  done: { java: 26, cpp: 27, python: 19, javascript: 24 },
};

const lines = ISLANDS_BFS_CODE_LINES;

export interface IslandsBFSStep {
  grid: number[][];
  states: CellState[][];
  current: [number, number] | null;
  queue: [number, number][];
  scan: [number, number] | null;
  count: number;
  visitedLand: number;
  action: 'init' | 'scan' | 'found' | 'enqueue' | 'poll' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function buildIslandsBFSSteps(grid: number[][]): IslandsBFSStep[] {
  const steps: IslandsBFSStep[] = [];
  const m = grid.length;
  if (m === 0) return steps;
  const n = grid[0].length;
  const states: CellState[][] = grid.map((row) => row.map((v) => (v === 1 ? 'land' : 'water')));
  let count = 0;
  let visitedLand = 0;
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  const snapshot = (extra: Partial<IslandsBFSStep>): void => {
    steps.push({
      grid,
      states: snapshotGrid2D(states),
      current: extra.current ?? null,
      queue: extra.queue ? [...extra.queue] : [],
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

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (states[r][c] === 'land') {
        count++;
        states[r][c] = 'visited';
        visitedLand++;
        const q: [number, number][] = [[r, c]];

        snapshot({
          scan: [r, c],
          current: [r, c],
          queue: [...q],
          action: 'found',
          message: `🎯 在 (${r}, ${c}) 发现新岛屿起点！count = ${count}。起点入队并立即染色标记。`,
          log: `[新岛屿 #${count}] 发现起点 (${r}, ${c}) 并入队`,
          codeLine: lines.found,
        });

        while (q.length > 0) {
          const [cr, cc] = q.shift()!;

          snapshot({
            scan: [r, c],
            current: [cr, cc],
            queue: [...q],
            action: 'poll',
            message: `出队 (${cr}, ${cc})：检查四周邻格是否存在连通陆地。`,
            log: `  出队 (${cr}, ${cc})`,
            codeLine: lines.poll,
          });

          for (const [dr, dc] of dirs) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (nr >= 0 && nr < m && nc >= 0 && nc < n && states[nr][nc] === 'land') {
              states[nr][nc] = 'visited';
              visitedLand++;
              q.push([nr, nc]);

              snapshot({
                scan: [r, c],
                current: [nr, nc],
                queue: [...q],
                action: 'enqueue',
                message: `发现邻接陆地 (${nr}, ${nc})：立即染色沉没并推入队列。`,
                log: `  发现陆地 (${nr}, ${nc}) -> 入队`,
                codeLine: lines.enqueue,
              });
            }
          }
        }
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
    message: `🎉 全网格 BFS 扫描探索完成！共发现 ${count} 座独立岛屿，共计访问 ${visitedLand} 格陆地。`,
    log: `✓ BFS 探索完成: 岛屿总数 = ${count}`,
    codeLine: lines.done,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withIslandsBFSMetrics(steps: IslandsBFSStep[]): IslandsBFSStep[] {
  return steps.map((s) => ({
    ...s,
    metrics: {
      'metric-scan': s.scan ? `(${s.scan[0]}, ${s.scan[1]})` : '—',
      'metric-curr': s.current ? `(${s.current[0]}, ${s.current[1]})` : '—',
      'metric-queue-size': `${s.queue.length}`,
      'metric-island-count': `${s.count}`,
      action:
        s.queue.length > 0
          ? `[ ${s.queue.map(([r, c]) => `(${r},${c})`).join(', ')} ]`
          : '[ (空) ]',
    },
  }));
}
