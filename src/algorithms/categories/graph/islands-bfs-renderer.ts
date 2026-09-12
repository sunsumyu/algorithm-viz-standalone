/**
 * 岛屿数量 (BFS 广度优先搜索) 可视化器 — 声明式 4-Card 标准架构
 * 队列波浪式扩散、入队即时沉岛染色、避免重复进队
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  ISLANDS_BFS_PROBLEM_HTML,
  ISLANDS_BFS_ANALYSIS_HTML,
  ISLANDS_BFS_CODE_LANGUAGES,
} from './islands-bfs-problem-content';
import { CellState } from './islands-renderer';
import { parseBinaryGrid } from '../../../core/input-primitives';

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
  codeLine: number | number[];
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
      states: states.map((r) => [...r]),
      current: extra.current ?? null,
      queue: extra.queue ? [...extra.queue] : [],
      scan: extra.scan ?? null,
      count,
      visitedLand,
      action: extra.action ?? 'scan',
      message: extra.message ?? '',
      log: extra.log ?? '',
      codeLine: extra.codeLine ?? 1,
    });
  };

  snapshot({
    action: 'init',
    message: `初始化 ${m}×${n} 网格。准备双重循环扫描寻找未访问陆地 (1)。`,
    log: `初始化网格 ${m}x${n}`,
    codeLine: 2,
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
          codeLine: [6, 7, 8, 9],
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
            codeLine: 11,
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
                codeLine: [14, 15, 16],
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
          codeLine: 5,
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
    codeLine: 20,
  });

  return steps;
}

const PRESET_CASES: Record<string, { label: string; grid: number[][] }> = {
  classic: {
    label: '经典 3 岛屿 [4×5]',
    grid: [
      [1, 1, 0, 0, 0],
      [1, 1, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 1, 1],
    ],
  },
  single: {
    label: '单座大岛 [4×4]',
    grid: [
      [1, 1, 1, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  scattered: {
    label: '多散点 4 岛屿 [4×5]',
    grid: [
      [1, 0, 1, 0, 1],
      [0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ],
  },
};

/** 将网格序列化为文本输入（预设值与 inputs.grid 解析共用） */
function gridToText(grid: number[][]): string {
  return grid.map((row) => row.join('')).join('\n');
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: IslandsBFSStep[]): IslandsBFSStep[] {
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

export function renderIslandsBFSCanvas(container: HTMLElement, step: IslandsBFSStep): void {
  const { states, current, queue, scan } = step;
  const m = states.length;
  const n = states[0]?.length || 0;
  const qSet = new Set(queue.map(([r, c]) => `${r},${c}`));

  let html = '';
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      const state = states[r][c];
      const isCurr = current && current[0] === r && current[1] === c;
      const isScan = scan && scan[0] === r && scan[1] === c && !isCurr;
      const inQueue = qSet.has(`${r},${c}`);

      let bg = '#f1f5f9';
      let color = '#64748b';
      let border = '#cbd5e1';
      let transform = 'none';
      let boxShadow = 'none';
      if (state === 'water') {
        bg = '#eff6ff';
        color = '#93c5fd';
        border = '#dbeafe';
      } else if (state === 'land') {
        bg = '#f0fdf4';
        color = '#16a34a';
        border = '#86efac';
      } else if (state === 'visited') {
        bg = '#f1f5f9';
        color = '#94a3b8';
        border = '#e2e8f0';
      }

      if (inQueue) {
        bg = '#fef9c3';
        border = '#ca8a04';
        color = '#a16207';
        transform = 'scale(1.06)';
        boxShadow = '0 0 0 2px rgba(234, 179, 8, 0.35)';
      }
      if (isScan) {
        bg = '#fef9c3';
        border = '#ca8a04';
        color = '#a16207';
        transform = 'scale(1.06)';
        boxShadow = '0 0 0 2px rgba(234, 179, 8, 0.35)';
      }
      if (isCurr) {
        bg = '#dbeafe';
        border = '#2563eb';
        color = '#1d4ed8';
        transform = 'scale(1.08)';
        boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.4)';
      }

      const text = state === 'water' ? '0' : state === 'land' ? '1' : '✓';
      html += `<div style="width: 44px; height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 800; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); border: 1.5px solid ${border}; background: ${bg}; color: ${color}; transform: ${transform}; box-shadow: ${boxShadow}; position: relative; z-index: ${isCurr ? 3 : isScan || inQueue ? 2 : 1};">${text}</div>`;
    }
  }

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(${n}, 44px); gap: 6px; justify-content: center; align-content: center; height: 100%; width: 100%; padding: 8px; box-sizing: border-box;">
      ${html}
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'islands-bfs',
  name: '岛屿数量 (BFS)',
  category: 'graph',
  description: '使用广度优先搜索队列波浪式染色计算二维网格中连通岛屿的数量',
  icon: '🌊',
  difficulty: 2,
  levelOrder: 2,
  learningGoal: '掌握网格图 BFS 逐层扩散与入队即染色的内存控制技巧',
  inputs: [
    {
      id: 'grid',
      label: '网格 (每行一串 0/1)',
      type: 'text',
      defaultValue: gridToText(PRESET_CASES.classic.grid),
      placeholder: '每行如 11000',
    },
  ],
  presets: [
    { label: PRESET_CASES.classic.label, values: { grid: gridToText(PRESET_CASES.classic.grid) } },
    { label: PRESET_CASES.single.label, values: { grid: gridToText(PRESET_CASES.single.grid) } },
    { label: PRESET_CASES.scattered.label, values: { grid: gridToText(PRESET_CASES.scattered.grid) } },
  ],
  metrics: [
    { id: 'metric-scan', label: '扫描位置', color: '#3b82f6' },
    { id: 'metric-curr', label: '当前出队格', color: '#fbbf24' },
    { id: 'metric-queue-size', label: '队列长度', color: '#a855f7' },
    { id: 'metric-island-count', label: '岛屿总数', color: '#10b981' },
    { id: 'action', label: '队列内容', color: '#3b82f6' },
  ],
  legend: [
    { label: '陆地 (1)', color: '#16a34a' },
    { label: '水域 (0)', color: '#60a5fa' },
    { label: '队列处理中', color: '#fbbf24' },
    { label: '沉没/已访问', color: '#94a3b8' },
  ],
  codeLanguages: ISLANDS_BFS_CODE_LANGUAGES,
  problemHtml: ISLANDS_BFS_PROBLEM_HTML,
  analysisHtml: ISLANDS_BFS_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(buildIslandsBFSSteps(parseBinaryGrid(inputs?.grid, PRESET_CASES.classic.grid))),
  renderCanvas: (container, step) => renderIslandsBFSCanvas(container, step as IslandsBFSStep),
});
