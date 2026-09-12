/**
 * 沉没孤岛 (LC 130) — 声明式 4-Card 标准架构
 * 两阶段 DFS：边缘保护标记 + 内部孤岛淹没与还原
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  SINK_ISLANDS_PROBLEM_HTML,
  SINK_ISLANDS_ANALYSIS_HTML,
  SINK_ISLANDS_CODE_LANGUAGES,
} from './sink-islands-problem-content';

export interface SinkStep {
  grid: number[][]; // 0: water/sunk, 1: land, 2: protected
  rows: number;
  cols: number;
  currentCell: [number, number] | null;
  stage: string;
  protectedCount: number;
  sunkCount: number;
  action: 'init' | 'border-protect' | 'sink' | 'restore' | 'done';
  statusText: string;
  message?: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

const DEFAULT_SINK_GRID = [
  [1, 1, 1, 1, 1],
  [1, 0, 1, 0, 1],
  [1, 1, 1, 0, 1],
  [0, 1, 0, 1, 0],
  [1, 1, 1, 1, 1],
];

const DIRS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export function buildSinkSteps(initialGrid: number[][] = DEFAULT_SINK_GRID): SinkStep[] {
  const steps: SinkStep[] = [];
  const R = initialGrid.length;
  const C = initialGrid[0].length;
  const grid = initialGrid.map((r) => [...r]);

  let protectedCount = 0;
  let sunkCount = 0;

  steps.push({
    grid: grid.map((r) => [...r]),
    rows: R,
    cols: C,
    currentCell: null,
    stage: '准备开始',
    protectedCount,
    sunkCount,
    action: 'init',
    statusText: `初始化 ${R}×${C} 网格。第一阶段：将从四周边缘出发将连通陆地标记为受保护 (2)。`,
    log: `初始化: ${R}×${C} 网格地图`,
    codeLine: [1, 2, 3],
  });

  // 第一阶段：边缘连通 DFS
  const dfsProtect = (r: number, c: number) => {
    if (r < 0 || r >= R || c < 0 || c >= C || grid[r][c] !== 1) return;
    grid[r][c] = 2; // protected
    protectedCount++;

    steps.push({
      grid: grid.map((row) => [...row]),
      rows: R,
      cols: C,
      currentCell: [r, c],
      stage: '边缘连通保护',
      protectedCount,
      sunkCount,
      action: 'border-protect',
      statusText: `边缘保护 DFS 访问 (${r}, ${c})，标记为受保护陆地 (2)。当前受保护陆地: ${protectedCount} 格。`,
      log: `保护边沿陆地: (${r}, ${c}) -> 受保护 (2)`,
      codeLine: [19, 20, 21, 22],
    });

    for (const [dr, dc] of DIRS) {
      dfsProtect(r + dr, c + dc);
    }
  };

  // 左右两侧边界
  for (let r = 0; r < R; r++) {
    if (grid[r][0] === 1) dfsProtect(r, 0);
    if (grid[r][C - 1] === 1) dfsProtect(r, C - 1);
  }

  // 上下两侧边界
  for (let c = 0; c < C; c++) {
    if (grid[0][c] === 1) dfsProtect(0, c);
    if (grid[R - 1][c] === 1) dfsProtect(R - 1, c);
  }

  // 第二阶段：淹没孤岛与还原保护区
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] === 1) {
        grid[r][c] = 0;
        sunkCount++;
        steps.push({
          grid: grid.map((row) => [...row]),
          rows: R,
          cols: C,
          currentCell: [r, c],
          stage: '淹没真正孤岛',
          protectedCount,
          sunkCount,
          action: 'sink',
          statusText: `检测到孤立陆地 (${r}, ${c}) 未与边缘相连，将其淹没为水域 (0)。已淹没孤岛: ${sunkCount} 格。`,
          log: `淹没孤岛: (${r}, ${c}) 1 -> 0`,
          codeLine: 13,
        });
      } else if (grid[r][c] === 2) {
        grid[r][c] = 1;
        steps.push({
          grid: grid.map((row) => [...row]),
          rows: R,
          cols: C,
          currentCell: [r, c],
          stage: '还原保护区',
          protectedCount,
          sunkCount,
          action: 'restore',
          statusText: `将受保护陆地 (${r}, ${c}) 还原为正常陆地 (1)。`,
          log: `还原陆地: (${r}, ${c}) 2 -> 1`,
          codeLine: 14,
        });
      }
    }
  }

  steps.push({
    grid: grid.map((row) => [...row]),
    rows: R,
    cols: C,
    currentCell: null,
    stage: '处理完成',
    protectedCount,
    sunkCount,
    action: 'done',
    statusText: `🎉 沉没孤岛计算完成！成功淹没 ${sunkCount} 格被包围的孤立陆地。`,
    log: `✓ 处理完成: 共淹没 ${sunkCount} 格孤岛`,
    codeLine: 17,
  });

  return steps;
}

const PRESET_CASES: Record<string, { label: string; grid: number[][] }> = {
  classic: {
    label: '经典 5×5 围岛',
    grid: DEFAULT_SINK_GRID,
  },
  open: {
    label: '开放边缘 [4×5]',
    grid: [
      [1, 1, 0, 1, 1],
      [1, 0, 1, 0, 1],
      [0, 1, 1, 1, 0],
      [1, 0, 1, 0, 1],
    ],
  },
  allProtected: {
    label: '全域连通 [3×4]',
    grid: [
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
    ],
  },
};

/** 将网格序列化为文本输入（预设值与 inputs.grid 解析共用） */
function gridToText(grid: number[][]): string {
  return grid.map((row) => row.join('')).join('\n');
}

function parseGridText(input: string): number[][] {
  const rows = input
    .split(/[\r\n]+|;/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) =>
      line
        .replace(/[\[\]\s,，]+/g, '')
        .split('')
        .map((ch) => (ch === '1' ? 1 : 0))
    );
  return rows.length > 0 ? rows : DEFAULT_SINK_GRID;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: SinkStep[]): SinkStep[] {
  return steps.map((s) => ({
    ...s,
    message: s.statusText,
    metrics: {
      'metric-cur-cell': s.currentCell ? `(${s.currentCell[0]}, ${s.currentCell[1]})` : '—',
      'metric-stage': s.stage,
      'metric-protected-count': `${s.protectedCount}`,
      'metric-sunk-count': `${s.sunkCount}`,
      action:
        s.action === 'border-protect'
          ? `DFS: (${s.currentCell ? s.currentCell.join(',') : ''}) 标记为 2 (受保护)`
          : s.action === 'sink'
          ? `孤岛判定: (${s.currentCell ? s.currentCell.join(',') : ''}) 1 -> 0 (淹没)`
          : s.action === 'restore'
          ? `还原: (${s.currentCell ? s.currentCell.join(',') : ''}) 2 -> 1 (保护区保留)`
          : '1. 边缘连通 DFS (1->2) 2. 内部孤岛沉没 (1->0) 与还原 (2->1)',
    },
  }));
}

export function renderSinkIslandsCanvas(container: HTMLElement, step: SinkStep): void {
  const { grid, rows, cols, currentCell, action } = step;

  let html = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = grid[r][c];
      const isCurrent = currentCell && currentCell[0] === r && currentCell[1] === c;

      let bg = '#f1f5f9';
      let border = '1px solid #cbd5e1';
      let color = '#94a3b8';
      let label = String(val);

      if (val === 1) {
        bg = '#dcfce7';
        border = '1.5px solid #86efac';
        color = '#16a34a';
      } else if (val === 2) {
        bg = '#e0e7ff';
        border = '1.5px solid #a5b4fc';
        color = '#4338ca';
        label = '🛡️';
      }

      if (isCurrent && action === 'sink') {
        bg = '#fee2e2';
        border = '1.5px solid #fca5a5';
        color = '#dc2626';
      }

      let boxShadow = 'none';
      let transform = 'none';
      if (isCurrent) {
        boxShadow = '0 0 0 3px #facc15';
        transform = 'scale(1.06)';
      }

      html += `<div style="aspect-ratio: 1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position: relative; box-sizing: border-box; background: ${bg}; border: ${border}; color: ${color}; box-shadow: ${boxShadow}; transform: ${transform}; z-index: ${isCurrent ? 10 : 1};"><span>${label}</span></div>`;
    }
  }

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 6px; justify-content: center; align-content: center; height: 100%; width: 100%; max-width: 560px; margin: 0 auto; padding: 8px; box-sizing: border-box;">
      ${html}
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'sink-islands',
  name: '沉没孤岛 (LC 130)',
  category: 'graph',
  description: '两阶段 DFS：从边界出发标记边缘保护区，将内部所有未相连的孤岛淹没',
  icon: '🏝️',
  difficulty: 2,
  levelOrder: 16,
  learningGoal: '掌握逆向思维边界保护 DFS 遍历与多状态标记法',
  inputs: [
    {
      id: 'grid',
      label: '网格 (每行一串 0/1)',
      type: 'text',
      defaultValue: gridToText(DEFAULT_SINK_GRID),
      placeholder: '每行如 11111',
    },
  ],
  presets: [
    { label: PRESET_CASES.classic.label, values: { grid: gridToText(PRESET_CASES.classic.grid) } },
    { label: PRESET_CASES.open.label, values: { grid: gridToText(PRESET_CASES.open.grid) } },
    { label: PRESET_CASES.allProtected.label, values: { grid: gridToText(PRESET_CASES.allProtected.grid) } },
  ],
  metrics: [
    { id: 'metric-cur-cell', label: '当前格子', color: '#3b82f6' },
    { id: 'metric-stage', label: '当前阶段', color: '#6366f1' },
    { id: 'metric-protected-count', label: '保护区格数', color: '#4338ca' },
    { id: 'metric-sunk-count', label: '已淹没孤岛', color: '#dc2626' },
    { id: 'action', label: '处理动作', color: '#f59e0b' },
  ],
  legend: [
    { label: '陆地 (1)', color: '#86efac' },
    { label: '边沿保护 (2)', color: '#a5b4fc' },
    { label: '已淹没孤岛 (0)', color: '#fca5a5' },
    { label: '水域 (0)', color: '#94a3b8' },
  ],
  codeLanguages: SINK_ISLANDS_CODE_LANGUAGES,
  problemHtml: SINK_ISLANDS_PROBLEM_HTML,
  analysisHtml: SINK_ISLANDS_ANALYSIS_HTML,
  generateSteps: (inputs) => withMetrics(buildSinkSteps(parseGridText(String(inputs?.grid ?? '')))),
  renderCanvas: (container, step) => renderSinkIslandsCanvas(container, step as SinkStep),
});
