/**
 * 水位上升的泳池中游泳 (Swim In Rising Water - LeetCode 778) 声明式可视化器
 * 左程云《算法通关课》Class 064 Code03
 * 遵循项目标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  SWIM_IN_RISING_WATER_CODE_LANGUAGES,
  SWIM_IN_RISING_WATER_PROBLEM_HTML,
  SWIM_IN_RISING_WATER_ANALYSIS_HTML,
} from './swim-in-rising-water-problem-content';

export interface SwimStep {
  grid: number[][];
  r: number;
  c: number;
  curWaterLevel: number;
  distGrid: number[][];
  visitedGrid: boolean[][];
  pqSnapshot: Array<{ r: number; c: number; t: number }>;
  bestPath?: Array<{ r: number; c: number }>;
  status: 'init' | 'pop' | 'relax' | 'reach' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

const PRESET_GRIDS: Record<string, number[][]> = {
  leetcode5: [
    [0, 2, 1, 3, 4],
    [10, 11, 14, 12, 5],
    [23, 22, 21, 15, 16],
    [18, 17, 19, 20, 24],
    [9, 8, 7, 6, 13],
  ],
  simple3: [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
  ],
  cliff4: [
    [0, 3, 2, 1],
    [12, 13, 14, 4],
    [11, 15, 10, 5],
    [9, 8, 7, 6],
  ],
};

export function buildSwimInRisingWaterSteps(gridType: string): SwimStep[] {
  const grid = PRESET_GRIDS[gridType] || PRESET_GRIDS.leetcode5;
  const n = grid.length;
  const m = grid[0].length;
  const steps: SwimStep[] = [];

  const dist: number[][] = Array.from({ length: n }, () => Array(m).fill(Infinity));
  const visited: boolean[][] = Array.from({ length: n }, () => Array(m).fill(false));
  const parent: Record<string, { r: number; c: number }> = {};

  dist[0][0] = grid[0][0];
  const pq: Array<{ r: number; c: number; t: number }> = [{ r: 0, c: 0, t: grid[0][0] }];

  steps.push({
    grid,
    r: 0,
    c: 0,
    curWaterLevel: grid[0][0],
    distGrid: dist.map((row) => [...row]),
    visitedGrid: visited.map((row) => [...row]),
    pqSnapshot: pq.map((item) => ({ ...item })),
    status: 'init',
    message: `初始化起点 (0, 0)，平台高度 grid[0][0]=${grid[0][0]}，加入 Dijkstra 小根堆。`,
    log: `起点 (0,0) 入堆，水位 t=${grid[0][0]}`,
    codeLine: [18, 24],
  });

  const dr = [-1, 0, 1, 0];
  const dc = [0, 1, 0, -1];
  let foundTarget = false;

  while (pq.length > 0) {
    pq.sort((a, b) => a.t - b.t);
    const top = pq.shift()!;
    const { r, c, t } = top;

    if (visited[r][c]) continue;
    visited[r][c] = true;

    steps.push({
      grid,
      r,
      c,
      curWaterLevel: t,
      distGrid: dist.map((row) => [...row]),
      visitedGrid: visited.map((row) => [...row]),
      pqSnapshot: pq.map((item) => ({ ...item })),
      status: 'pop',
      message: `🏊 堆顶弹出平台 (${r}, ${c})，平台高度 = ${grid[r][c]}，到达所需最少水位 t = ${t}。`,
      log: `弹出 (${r},${c})，当前水位 t=${t}`,
      codeLine: [27, 33],
    });

    if (r === n - 1 && c === m - 1) {
      foundTarget = true;
      const bestPath: Array<{ r: number; c: number }> = [];
      let curr: { r: number; c: number } | undefined = { r, c };
      while (curr) {
        bestPath.push(curr);
        if (curr.r === 0 && curr.c === 0) break;
        curr = parent[`${curr.r},${curr.c}`];
      }
      bestPath.reverse();

      steps.push({
        grid,
        r,
        c,
        curWaterLevel: t,
        distGrid: dist.map((row) => [...row]),
        visitedGrid: visited.map((row) => [...row]),
        pqSnapshot: [],
        bestPath,
        status: 'reach',
        message: `🎉 成功到达终点 (${n - 1}, ${m - 1})！最少需要等待水位上升至 t = ${t}。`,
        log: `✓ 成功抵达终点，最少耗时 t=${t}`,
        codeLine: [34, 35],
      });
      break;
    }

    for (let i = 0; i < 4; ++i) {
      const nr = r + dr[i];
      const nc = c + dc[i];
      if (nr >= 0 && nr < n && nc >= 0 && nc < m && !visited[nr][nc]) {
        const nextTime = Math.max(t, grid[nr][nc]);
        if (nextTime < dist[nr][nc]) {
          dist[nr][nc] = nextTime;
          parent[`${nr},${nc}`] = { r, c };
          pq.push({ r: nr, c: nc, t: nextTime });

          steps.push({
            grid,
            r: nr,
            c: nc,
            curWaterLevel: nextTime,
            distGrid: dist.map((row) => [...row]),
            visitedGrid: visited.map((row) => [...row]),
            pqSnapshot: pq.map((item) => ({ ...item })),
            status: 'relax',
            message: `🌊 探索邻居 (${nr}, ${nc})：高度 ${grid[nr][nc]}，瓶颈转移 max(${t}, ${grid[nr][nc]}) = ${nextTime}，加入小根堆。`,
            log: `松弛 (${nr},${nc})，所需水位 -> ${nextTime}`,
            codeLine: [40, 44],
          });
        }
      }
    }
  }

  if (!foundTarget) {
    steps.push({
      grid,
      r: 0,
      c: 0,
      curWaterLevel: 0,
      distGrid: dist.map((row) => [...row]),
      visitedGrid: visited.map((row) => [...row]),
      pqSnapshot: [],
      status: 'done',
      message: '无法到达终点！',
      log: '❌ 无法到达终点',
      codeLine: 48,
    });
  }

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<SwimStep>({
  id: 'swim-in-rising-water',
  name: '水位上升的泳池中游泳',
  category: 'graph',
  icon: '🏊',
  badge: {
    mode: 'Dijkstra 小根堆瓶颈最短路',
    complexity: 'O(N² log N) · O(N²)',
  },
  card1Title: '🏊 泳池高程网格与动态淹没沙盘',
  card2Title: '🧭 水位与优先队列状态监视器',
  card2Desc: '当前探索平台、淹没水位 t 与 Dijkstra 小根堆前沿',
  legend: [
    { label: '未淹没平台', color: '#1e293b' },
    { label: '🌊 已淹没水面', color: '#0369a1' },
    { label: '🏊 当前探索节点', color: '#facc15' },
    { label: '🟢 最优瓶颈路径', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'input-grid-type',
      label: '矩阵用例',
      type: 'select',
      defaultValue: 'leetcode5',
      options: [
        { label: '经典 5x5 (LeetCode 778)', value: 'leetcode5' },
        { label: '基础 3x3 (阶梯高度)', value: 'simple3' },
        { label: '断崖 4x4 (中央高墙)', value: 'cliff4' },
      ],
      width: '160px',
    },
  ],
  presets: [
    { label: '经典 5x5 (ans=16)', values: { 'input-grid-type': 'leetcode5' } },
    { label: '基础 3x3 (ans=8)', values: { 'input-grid-type': 'simple3' } },
    { label: '断崖 4x4 (ans=15)', values: { 'input-grid-type': 'cliff4' } },
  ],
  metrics: [
    { id: 'cur-time', label: '当前水位 t', color: '#2563eb' },
    { id: 'cur-pos', label: '当前探索坐标', color: '#0d9488' },
    { id: 'pq-size', label: '小根堆待选数', color: '#d97706' },
  ],
  codeLanguages: SWIM_IN_RISING_WATER_CODE_LANGUAGES,
  problemHtml: SWIM_IN_RISING_WATER_PROBLEM_HTML,
  analysisHtml: SWIM_IN_RISING_WATER_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const gridType = inputs['input-grid-type'] || 'leetcode5';
    return buildSwimInRisingWaterSteps(gridType);
  },
  renderCanvas: (container, step) => {
    const grid = step.grid;
    const n = grid.length;
    const m = grid[0].length;

    // 1. 生成网格 HTML
    const cellSize = n <= 3 ? 56 : n <= 4 ? 46 : 38;
    let gridHtml = '';

    for (let r = 0; r < n; r++) {
      gridHtml += '<div style="display: flex; gap: 4px; justify-content: center;">';
      for (let c = 0; c < m; c++) {
        const val = grid[r][c];
        const isVisited = step.visitedGrid[r]?.[c] ?? false;
        const isCur = step.r === r && step.c === c;
        const isSubmerged = val <= step.curWaterLevel;
        const isPath = step.bestPath?.some((p) => p.r === r && p.c === c) ?? false;

        let bg = '#1e293b';
        let border = '#334155';
        let textColor = '#ffffff';

        if (isPath) {
          bg = '#065f46';
          border = '#10b981';
        } else if (isCur) {
          bg = '#854d0e';
          border = '#facc15';
        } else if (isVisited) {
          bg = '#1e3a8a';
          border = '#38bdf8';
        } else if (isSubmerged) {
          bg = '#0369a1';
          border = '#38bdf8';
        }

        const tag = r === 0 && c === 0 ? '<span style="font-size: 7.5px; color: #fde047; position: absolute; top: 2px;">START</span>' : r === n - 1 && c === m - 1 ? '<span style="font-size: 7.5px; color: #34d399; position: absolute; top: 2px;">END</span>' : '';

        gridHtml += `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; width: ${cellSize}px; height: ${cellSize}px; background: ${bg}; border: ${isCur || isPath ? '2.5px' : '1.5px'} solid ${border}; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); transition: all 0.2s;">
            ${tag}
            <span style="font-size: ${cellSize > 40 ? '14px' : '12px'}; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: ${textColor};">${val}</span>
            ${isSubmerged ? '<span style="font-size: 8px; color: #7dd3fc; margin-top: -2px;">🌊</span>' : ''}
          </div>
        `;
      }
      gridHtml += '</div>';
    }

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 12px; gap: 4px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 4px;">
          ${gridHtml}
        </div>
        <div style="margin-top: 8px; font-size: 11px; color: #94a3b8; text-align: center;">
          左上角 (0,0) 出发 ➔ 淹没水位随时间 t 递增 ➔ 首次弹出右下角 (${n - 1},${m - 1}) 即为最少等待时间
        </div>
      </div>
    `;

    // 2. 更新 Card 2 指标与自定义监控器
    const root = container.closest('#algo-swim-in-rising-water-view');
    if (root) {
      const timeEl = root.querySelector('#metric-cur-time');
      const posEl = root.querySelector('#metric-cur-pos');
      const pqEl = root.querySelector('#metric-pq-size');

      if (timeEl) timeEl.textContent = `${step.curWaterLevel}`;
      if (posEl) posEl.textContent = `(${step.r}, ${step.c})`;
      if (pqEl) pqEl.textContent = `${step.pqSnapshot.length}`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const top3 = step.pqSnapshot.slice(0, 3);
        const top3Html = top3.length > 0
          ? top3.map((it, idx) => `<span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 10.5px; color: #0f172a; font-family: monospace;">#${idx + 1}: (${it.r},${it.c}) t=${it.t}</span>`).join(' ')
          : '<span style="color: #94a3b8; font-size: 10.5px;">队列为空</span>';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>小根堆前沿 Top 待探索:</span>
              <div style="display: flex; gap: 4px;">${top3Html}</div>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 瓶颈最短路松弛:</span>
              <strong style="font-family: monospace; color: #2563eb;">nextTime = max(curT, height)</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'swim-in-rising-water',
  name: '水位上升的泳池中游泳',
  viewId: 'algo-swim-in-rising-water-view',
  category: 'graph',
  description: '左程云算法通关课 Class 064 Code03：网格图瓶颈最短路、max(t, grid[nr][nc]) 松弛、Dijkstra 小根堆 (LeetCode 778)',
  icon: '🏊',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 76,
  learningGoal: '掌握瓶颈最短路模型转化、网格图 Dijkstra 小根堆松弛技巧与二分+BFS/并查集等价判定',
});

export { Visualizer as SwimInRisingWaterVisualizer };
