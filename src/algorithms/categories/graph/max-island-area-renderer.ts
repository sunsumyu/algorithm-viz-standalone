/**
 * 岛屿的最大面积可视化器 — 声明式 4-Card 标准架构
 * DFS 面积累加递归、实时沉岛与全局最大值动态追踪
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  MAX_ISLAND_AREA_PROBLEM_HTML,
  MAX_ISLAND_AREA_ANALYSIS_HTML,
  MAX_ISLAND_AREA_CODE_LANGUAGES,
} from './max-island-area-problem-content';
import { CellState } from './islands-renderer';

export interface MIAStep {
  grid: number[][];
  states: CellState[][];
  current: [number, number] | null;
  scan: [number, number] | null;
  currentArea: number;
  maxArea: number;
  action: 'init' | 'scan' | 'found' | 'mark' | 'accumulate' | 'update-max' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function buildMIASteps(grid: number[][]): MIAStep[] {
  const steps: MIAStep[] = [];
  const m = grid.length;
  if (m === 0) return steps;
  const n = grid[0].length;
  const states: CellState[][] = grid.map((row) => row.map((v) => (v === 1 ? 'land' : 'water')));
  let maxArea = 0;
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  const snapshot = (extra: Partial<MIAStep>): void => {
    steps.push({
      grid,
      states: states.map((r) => [...r]),
      current: extra.current ?? null,
      scan: extra.scan ?? null,
      currentArea: extra.currentArea ?? 0,
      maxArea,
      action: extra.action ?? 'scan',
      message: extra.message ?? '',
      log: extra.log ?? '',
      codeLine: extra.codeLine ?? 1,
    });
  };

  snapshot({
    action: 'init',
    message: `初始化 ${m}×${n} 二进制矩阵。准备扫描统计最大岛屿面积。`,
    log: `初始化矩阵 ${m}x${n}`,
    codeLine: 2,
  });

  const dfs = (r: number, c: number, runningAreaRef: { val: number }): number => {
    if (r < 0 || r >= m || c < 0 || c >= n || states[r][c] !== 'land') {
      return 0;
    }

    states[r][c] = 'visited';
    runningAreaRef.val++;
    let myArea = 1;

    snapshot({
      current: [r, c],
      scan: [r, c],
      currentArea: runningAreaRef.val,
      action: 'mark',
      message: `访问并沉没陆地 (${r}, ${c})，当前岛屿面积累加至 ${runningAreaRef.val}。`,
      log: `  沉没陆地 (${r}, ${c}) -> 面积=${runningAreaRef.val}`,
      codeLine: [12, 13],
    });

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < m && nc >= 0 && nc < n && states[nr][nc] === 'land') {
        myArea += dfs(nr, nc, runningAreaRef);
      }
    }

    return myArea;
  };

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (states[r][c] === 'land') {
        const areaRef = { val: 0 };
        snapshot({
          scan: [r, c],
          current: [r, c],
          currentArea: 0,
          action: 'found',
          message: `🎯 在 (${r}, ${c}) 发现新岛屿！启动 DFS 递归计算该连通块面积。`,
          log: `发现新岛屿起点 (${r}, ${c})`,
          codeLine: [5, 6],
        });

        const thisArea = dfs(r, c, areaRef);
        const prevMax = maxArea;
        maxArea = Math.max(maxArea, thisArea);

        snapshot({
          scan: [r, c],
          current: [r, c],
          currentArea: thisArea,
          action: 'update-max',
          message: `岛屿面积计算完毕：${thisArea}。更新全局最大面积 max(${prevMax}, ${thisArea}) = ${maxArea}。`,
          log: `本岛面积=${thisArea}, maxArea=${maxArea}`,
          codeLine: 6,
        });
      } else {
        snapshot({
          scan: [r, c],
          current: null,
          currentArea: 0,
          action: 'scan',
          message: `扫描格 (${r}, ${c})：${states[r][c] === 'water' ? '水域 (0)' : '已统计陆地'}，跳过。`,
          log: `扫描 (${r}, ${c}): 跳过`,
          codeLine: [4, 5],
        });
      }
    }
  }

  snapshot({
    action: 'done',
    current: null,
    scan: null,
    currentArea: 0,
    message: `🎉 全网格扫描探索完成！最大岛屿面积为 ${maxArea}。`,
    log: `✓ 统计完成: maxArea = ${maxArea}`,
    codeLine: 9,
  });

  return steps;
}

const PRESET_CASES: Record<string, { label: string; grid: number[][] }> = {
  classic: {
    label: '经典 5 格大岛 [4×5]',
    grid: [
      [0, 0, 1, 0, 0],
      [1, 1, 1, 0, 0],
      [0, 1, 0, 0, 1],
      [0, 0, 0, 1, 1],
    ],
  },
  large: {
    label: '连片 15 格大岛 [4×5]',
    grid: [
      [1, 1, 0, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 0, 1],
      [0, 0, 0, 0, 0],
    ],
  },
  empty: {
    label: '全域水域 [3×3]',
    grid: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
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
  return rows.length > 0 ? rows : PRESET_CASES.classic.grid;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: MIAStep[]): MIAStep[] {
  return steps.map((s) => ({
    ...s,
    metrics: {
      'metric-scan': s.scan ? `(${s.scan[0]}, ${s.scan[1]})` : '—',
      'metric-curr': s.current ? `(${s.current[0]}, ${s.current[1]})` : '—',
      'metric-cur-area': `${s.currentArea}`,
      'metric-max-area': `${s.maxArea}`,
      action:
        s.action === 'update-max'
          ? `maxArea = Math.max(maxArea, ${s.currentArea}) -> ${s.maxArea}`
          : s.action === 'mark'
          ? `grid[${s.current?.[0]}][${s.current?.[1]}] = 0 (area=${s.currentArea})`
          : s.action === 'done'
          ? `探索完毕: maxArea = ${s.maxArea}`
          : 'area = 1 + dfs(上) + dfs(下) + dfs(左) + dfs(右)',
    },
  }));
}

export function renderMaxIslandAreaCanvas(container: HTMLElement, step: MIAStep): void {
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
      let color = '#94a3b8';
      let border = '#cbd5e1';
      let transform = 'none';
      let boxShadow = 'none';
      if (state === 'water') {
        bg = '#eff6ff';
        color = '#93c5fd';
        border = '#dbeafe';
      } else if (state === 'land') {
        bg = '#ecfdf5';
        color = '#059669';
        border = '#a7f3d0';
      } else if (state === 'visited') {
        bg = '#f1f5f9';
        color = '#94a3b8';
        border = '#cbd5e1';
      }

      if (isScan) {
        bg = '#fef9c3';
        border = '#ca8a04';
        color = '#a16207';
        transform = 'scale(1.06)';
        boxShadow = '0 0 0 2px rgba(234, 179, 8, 0.35)';
      }
      if (isCurr) {
        bg = '#d1fae5';
        border = '#10b981';
        color = '#047857';
        transform = 'scale(1.08)';
        boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.4)';
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
  id: 'max-island-area',
  name: '岛屿的最大面积',
  category: 'graph',
  description: '使用深度优先搜索计算并返回网格中最大连通岛屿的面积',
  icon: '📐',
  difficulty: 2,
  levelOrder: 3,
  learningGoal: '掌握 DFS 递归计数与全局极值维护的经典网格图解法',
  inputs: [
    {
      id: 'grid',
      label: '网格 (每行一串 0/1)',
      type: 'text',
      defaultValue: gridToText(PRESET_CASES.classic.grid),
      placeholder: '每行如 00100',
    },
  ],
  presets: [
    { label: PRESET_CASES.classic.label, values: { grid: gridToText(PRESET_CASES.classic.grid) } },
    { label: PRESET_CASES.large.label, values: { grid: gridToText(PRESET_CASES.large.grid) } },
    { label: PRESET_CASES.empty.label, values: { grid: gridToText(PRESET_CASES.empty.grid) } },
  ],
  metrics: [
    { id: 'metric-scan', label: '当前扫描格', color: '#3b82f6' },
    { id: 'metric-curr', label: '当前 DFS 坐标', color: '#fbbf24' },
    { id: 'metric-cur-area', label: '当前岛屿面积', color: '#059669' },
    { id: 'metric-max-area', label: '最大面积', color: '#10b981' },
    { id: 'action', label: '递归公式', color: '#6366f1' },
  ],
  legend: [
    { label: '陆地 (1)', color: '#059669' },
    { label: '水域 (0)', color: '#60a5fa' },
    { label: 'DFS 探查中', color: '#fbbf24' },
    { label: '已沉没计数', color: '#94a3b8' },
  ],
  codeLanguages: MAX_ISLAND_AREA_CODE_LANGUAGES,
  problemHtml: MAX_ISLAND_AREA_PROBLEM_HTML,
  analysisHtml: MAX_ISLAND_AREA_ANALYSIS_HTML,
  generateSteps: (inputs) => withMetrics(buildMIASteps(parseGridText(String(inputs?.grid ?? '')))),
  renderCanvas: (container, step) => renderMaxIslandAreaCanvas(container, step as MIAStep),
});
