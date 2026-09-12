/**
 * 岛屿数量可视化器（DFS 网格搜索）— 声明式 4-Card 标准架构
 * LeetCode 200: 双重循环扫描、深度优先扩散、实时沉岛染色
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseBinaryGrid } from '../../../core/input-primitives';
import {
  ISLANDS_PROBLEM_HTML,
  ISLANDS_ANALYSIS_HTML,
  ISLANDS_CODE_LANGUAGES,
} from './islands-problem-content';

export type CellState = 'water' | 'land' | 'visited';

export interface IslandsStep {
  grid: number[][];                 // 原始网格
  states: CellState[][];            // 每格状态
  current: [number, number] | null; // 当前 DFS 访问格
  stack: [number, number][];        // 当前 DFS 栈
  scan: [number, number] | null;    // 外层扫描到的位置
  count: number;                    // 岛屿数
  visitedLand: number;              // 已访问陆地数
  action: 'init' | 'scan' | 'found' | 'enter' | 'mark' | 'backtrack' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
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
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  const snapshot = (extra: Partial<IslandsStep>): void => {
    steps.push({
      grid,
      states: states.map((r) => [...r]),
      current: extra.current ?? null,
      stack: extra.stack ? [...extra.stack] : [],
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
    message: `初始化 ${m}×${n} 网格。准备双重循环扫描寻找未访问的陆地 (1)。`,
    log: `初始化网格 ${m}x${n}`,
    codeLine: 2,
  });

  const dfs = (r: number, c: number, callStack: [number, number][]): void => {
    callStack.push([r, c]);
    states[r][c] = 'visited';
    visitedLand++;

    snapshot({
      current: [r, c],
      stack: callStack,
      scan: [r, c],
      action: 'mark',
      message: `DFS 沉岛：标记格 (${r}, ${c}) 为已访问（沉没）。`,
      log: `  沉没陆地 (${r}, ${c})`,
      codeLine: [12, 13],
    });

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < m && nc >= 0 && nc < n && states[nr][nc] === 'land') {
        snapshot({
          current: [nr, nc],
          stack: callStack,
          scan: [r, c],
          action: 'enter',
          message: `从 (${r}, ${c}) 向邻格 (${nr}, ${nc}) 发起深度优先扩散。`,
          log: `  深入扩散 (${r},${c}) -> (${nr},${nc})`,
          codeLine: [14, 15, 16, 17],
        });
        dfs(nr, nc, callStack);
      }
    }

    callStack.pop();
    snapshot({
      current: callStack.length > 0 ? callStack[callStack.length - 1] : null,
      stack: callStack,
      scan: [r, c],
      action: 'backtrack',
      message: `回溯：格 (${r}, ${c}) 四周邻格已探索完毕。`,
      log: `  回溯离开 (${r}, ${c})`,
      codeLine: 18,
    });
  };

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (states[r][c] === 'land') {
        count++;
        snapshot({
          scan: [r, c],
          current: [r, c],
          action: 'found',
          message: `🎯 在 (${r}, ${c}) 发现新岛屿起点！当前岛屿总数 = ${count}。启动 DFS 沉岛扩散。`,
          log: `[新岛屿 #${count}] 发现起点 (${r}, ${c})`,
          codeLine: [5, 6, 7],
        });
        dfs(r, c, []);
      } else {
        snapshot({
          scan: [r, c],
          current: null,
          action: 'scan',
          message: `扫描格 (${r}, ${c})：${states[r][c] === 'water' ? '水域 (0)' : '已访问陆地'}，跳过。`,
          log: `扫描 (${r}, ${c}): ${states[r][c]}`,
          codeLine: [4, 5],
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
    codeLine: 10,
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
function withMetrics(steps: IslandsStep[]): IslandsStep[] {
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

export function renderIslandsCanvas(container: HTMLElement, step: IslandsStep): void {
  const { states, current, scan } = step;
  const m = states.length;
  const n = states[0]?.length || 0;

  let html = '';
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      const state = states[r][c];
      const isCurr = current && current[0] === r && current[1] === c;
      const isScan = scan && scan[0] === r && scan[1] === c && !isCurr;

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
      html += `<div style="width: 44px; height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 800; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); border: 1.5px solid ${border}; background: ${bg}; color: ${color}; transform: ${transform}; box-shadow: ${boxShadow}; position: relative; z-index: ${isCurr ? 3 : isScan ? 2 : 1};">${text}</div>`;
    }
  }

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(${n}, 44px); gap: 6px; justify-content: center; align-content: center; height: 100%; width: 100%; padding: 8px; box-sizing: border-box;">
      ${html}
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'islands',
  name: '岛屿数量 (DFS)',
  category: 'graph',
  description: '使用深度优先搜索沉岛法计算二维网格中连通岛屿的数量',
  icon: '🏝️',
  difficulty: 2,
  levelOrder: 1,
  learningGoal: '掌握网格图 DFS 连通分量遍历与沉岛染色技巧',
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
    { id: 'metric-curr', label: '当前 DFS 格', color: '#fbbf24' },
    { id: 'metric-visited-land', label: '已访问陆地', color: '#a855f7' },
    { id: 'metric-island-count', label: '岛屿总数', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#16a34a' },
  ],
  legend: [
    { label: '陆地 (1)', color: '#16a34a' },
    { label: '水域 (0)', color: '#60a5fa' },
    { label: '访问中', color: '#fbbf24' },
    { label: '沉没/已访问', color: '#94a3b8' },
  ],
  codeLanguages: ISLANDS_CODE_LANGUAGES,
  problemHtml: ISLANDS_PROBLEM_HTML,
  analysisHtml: ISLANDS_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(buildIslandsSteps(parseBinaryGrid(inputs?.grid, PRESET_CASES.classic.grid))),
  renderCanvas: (container, step) => renderIslandsCanvas(container, step as IslandsStep),
});
