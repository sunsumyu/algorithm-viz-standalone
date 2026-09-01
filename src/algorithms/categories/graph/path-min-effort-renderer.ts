/**
 * 最小体力消耗路径 (Path With Minimum Effort - LeetCode 1631 / 左程云 Class 064 题目2) 声明式可视化器
 * 核心：2D 网格 Dijkstra 小根堆瓶颈最短路、max(effort, |h1 - h2|) 松弛
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  PATH_MIN_EFFORT_CODE_LANGUAGES,
  PATH_MIN_EFFORT_PROBLEM_HTML,
  PATH_MIN_EFFORT_ANALYSIS_HTML,
} from './path-min-effort-problem-content';

export interface EffortStep {
  grid: number[][];
  dist: number[][];
  visited: boolean[][];
  curR: number;
  curC: number;
  minEffortSoFar: number;
  pathNodes: Array<[number, number]>;
  status: 'start' | 'explore' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildPathMinEffortSteps(): EffortStep[] {
  const steps: EffortStep[] = [];

  const grid = [
    [1, 2, 2],
    [3, 8, 2],
    [5, 3, 5],
  ];

  steps.push({
    grid,
    dist: [
      [0, Infinity, Infinity],
      [Infinity, Infinity, Infinity],
      [Infinity, Infinity, Infinity],
    ],
    visited: [
      [false, false, false],
      [false, false, false],
      [false, false, false],
    ],
    curR: 0,
    curC: 0,
    minEffortSoFar: 0,
    pathNodes: [[0, 0]],
    status: 'start',
    message: '1. [起点初始化] 从 (0, 0) 出发，自身消耗 effort = 0，压入小根堆！',
    log: '起点 (0,0) 入堆，dist[0][0] = 0',
    codeLine: [18, 22],
  });

  steps.push({
    grid,
    dist: [
      [0, 1, Infinity],
      [2, Infinity, Infinity],
      [Infinity, Infinity, Infinity],
    ],
    visited: [
      [true, false, false],
      [false, false, false],
      [false, false, false],
    ],
    curR: 0,
    curC: 1,
    minEffortSoFar: 1,
    pathNodes: [
      [0, 0],
      [0, 1],
    ],
    status: 'explore',
    message: '2. [松弛相邻格子] (0,0) ➔ (0,1) 落差 |1-2|=1；(0,0) ➔ (1,0) 落差 |1-3|=2。小根堆优先弹出 (0,1)！',
    log: '松弛邻居：(0,1) effort=1, (1,0) effort=2',
    codeLine: [28, 38],
  });

  steps.push({
    grid,
    dist: [
      [0, 1, 1],
      [2, Infinity, Infinity],
      [Infinity, Infinity, Infinity],
    ],
    visited: [
      [true, true, false],
      [false, false, false],
      [false, false, false],
    ],
    curR: 0,
    curC: 2,
    minEffortSoFar: 1,
    pathNodes: [
      [0, 0],
      [0, 1],
      [0, 2],
    ],
    status: 'explore',
    message: '3. [沿平缓路径向右探索] (0,1) ➔ (0,2) 落差 |2-2|=0，路径瓶颈仍为 max(1, 0) = 1！',
    log: '探索 (0,2)：落差 0，总瓶颈 effort = 1',
    codeLine: [28, 38],
  });

  steps.push({
    grid,
    dist: [
      [0, 1, 1],
      [2, Infinity, 1],
      [Infinity, Infinity, Infinity],
    ],
    visited: [
      [true, true, true],
      [false, false, false],
      [false, false, false],
    ],
    curR: 1,
    curC: 2,
    minEffortSoFar: 1,
    pathNodes: [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
    ],
    status: 'explore',
    message: '4. [向下绕过中央高山] (0,2) ➔ (1,2) 落差 |2-2|=0，避免了中央高山 (8) 的巨大落差！',
    log: '探索 (1,2)：落差 0，成功绕开高点 (1,1)[8]',
    codeLine: [28, 38],
  });

  steps.push({
    grid,
    dist: [
      [0, 1, 1],
      [2, Infinity, 1],
      [Infinity, Infinity, 2],
    ],
    visited: [
      [true, true, true],
      [false, false, true],
      [false, false, true],
    ],
    curR: 2,
    curC: 2,
    minEffortSoFar: 2,
    pathNodes: [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
      [2, 2],
    ],
    status: 'done',
    message: '🎉 [到达右下终点] (1,2) ➔ (2,2) 落差 |2-5|=3，但绕道路径全局最大落差仅为 2！最小体力消耗 = 2！',
    log: '✓ 到达终点 (2,2)：最优瓶颈路径消耗 = 2',
    codeLine: [40, 45],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<EffortStep>({
  id: 'path-min-effort',
  name: '最小体力消耗路径 (Min Effort Path)',
  category: 'graph',
  icon: '⛰️',
  badge: {
    mode: '2D 网格 Dijkstra 瓶颈松弛',
    complexity: 'O(R · C · log(R · C)) · O(R · C)',
  },
  card1Title: '⛰️ 2D 高程网格与路径扩散沙盘',
  card2Title: '🧭 瓶颈松弛与最小消耗监视器',
  card2Desc: '网格探索前沿 (r, c)、瓶颈转移 max(d, |h1-h2|) 与最优路径',
  legend: [
    { label: '未探索网格', color: '#1e293b' },
    { label: '⚡ 当前探索节点', color: '#facc15' },
    { label: '🟢 最优瓶颈路径', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '3x3 经典绕山路径 (LeetCode 1631)', values: {} },
  ],
  metrics: [
    { id: 'metric-cur-coord', label: '当前探索坐标', color: '#2563eb' },
    { id: 'metric-min-effort', label: '最小体力消耗', color: '#10b981' },
  ],
  codeLanguages: PATH_MIN_EFFORT_CODE_LANGUAGES,
  problemHtml: PATH_MIN_EFFORT_PROBLEM_HTML,
  analysisHtml: PATH_MIN_EFFORT_ANALYSIS_HTML,
  buildSteps: () => buildPathMinEffortSteps(),
  renderCanvas: (container, step) => {
    const isPath = (r: number, c: number) => step.pathNodes.some(([pr, pc]) => pr === r && pc === c);

    const cells = step.grid
      .map((row, r) => {
        const rowCells = row
          .map((h, c) => {
            const isCur = step.curR === r && step.curC === c;
            const onPath = isPath(r, c);
            const distVal = step.dist[r][c];
            const bg = isCur ? '#f59e0b' : onPath ? '#065f46' : '#1e293b';
            const border = isCur ? '#facc15' : onPath ? '#10b981' : '#334155';

            return `
              <div style="width: 55px; height: 55px; background: ${bg}; border: 2px solid ${border}; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ffffff; font-family: monospace; transition: all 0.2s;">
                <span style="font-size: 14px; font-weight: 800;">${h}</span>
                <span style="font-size: 9px; color: ${onPath ? '#34d399' : '#94a3b8'};">d:${distVal === Infinity ? '∞' : distVal}</span>
              </div>
            `;
          })
          .join('');
        return `<div style="display: flex; gap: 8px;">${rowCells}</div>`;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${cells}
        </div>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center; margin-top: 8px;">
          🟢 绿色为绕过中央高山 (8) 的最优路径 | 单元格显示 高程 与 到达最小瓶颈消耗 $d$
        </div>
      </div>
    `;

    const root = container.closest('#algo-path-min-effort-view');
    if (root) {
      const coordEl = root.querySelector('#metric-cur-coord');
      const effEl = root.querySelector('#metric-min-effort');

      if (coordEl) coordEl.textContent = `(${step.curR}, ${step.curC})`;
      if (effEl) effEl.textContent = `${step.minEffortSoFar}`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 瓶颈松弛转移方程:</span>
              <strong style="font-family: monospace; color: #2563eb;">dist[nr][nc] = min(dist[nr][nc], max(dist[r][c], |h - nh|))</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'path-min-effort',
  name: '最小体力消耗路径 (Min Effort Path)',
  viewId: 'algo-path-min-effort-view',
  category: 'graph',
  description: '左程云算法通关课 Class 064 题目2：2D 网格瓶颈最短路、max(effort, |h1-h2|) 堆优化松弛 (LeetCode 1631)',
  icon: '⛰️',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 59,
  learningGoal: '掌握瓶颈最短路在 2D 网格上的建模技巧、Dijkstra 小根堆贪心松弛与二分+BFS 等价解法',
});

export { Visualizer as PathMinEffortVisualizer };
