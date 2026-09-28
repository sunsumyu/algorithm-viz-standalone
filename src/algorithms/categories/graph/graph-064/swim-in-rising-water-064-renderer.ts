import { snapshotGrid2D } from '../../../../core/strategies/grid-snapshot';
/**
 * 左程云算法通关课 Class 064: 水位上升的泳池中游泳 (Swim In Rising Water · LeetCode 778)
 * 瓶颈最短路模型、max(t, grid[nr][nc]) 状态松弛与小根堆定向淹没搜索
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth & Bi-Version Synthesis):
 * 深度综合整合：
 * 1. 经典版本的水深高程矩阵、多预设选择 (leetcode5, simple3, cliff4)；
 * 2. 声明式规范、名师讲义与四语言 1-based 精准行号联动。
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_064_PROBLEMS } from './graph-064-problem-content';
import {
  SWIM_IN_WATER_064_CODES,
  SWIM_IN_WATER_064_LINES,
} from './graph-064-stage-codes';
import {
  Graph064StepBase,
  renderGraph064GridSandbox,
  renderGraph064PriorityQueue,
} from './graph-064-shared';

export interface SwimStep extends Graph064StepBase {
  grid: number[][];
  curCoord: [number, number] | null;
  curWaterLevel: number;
  distGrid: number[][];
  visitedGrid: boolean[][];
  pqSnapshot: Array<{ r: number; c: number; t: number }>;
  bestPath?: Array<[number, number]>;
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

export function buildSwimInRisingWater064Steps(gridType: string = 'leetcode5'): SwimStep[] {
  const grid = PRESET_GRIDS[gridType] || PRESET_GRIDS.leetcode5;
  const n = grid.length;
  const steps: SwimStep[] = [];
  const lines = SWIM_IN_WATER_064_LINES;

  const dist = Array.from({ length: n }, () => new Array(n).fill(Infinity));
  const visited = Array.from({ length: n }, () => new Array(n).fill(false));
  const parent: Record<string, [number, number]> = {};

  dist[0][0] = grid[0][0];
  const pq: Array<{ r: number; c: number; t: number }> = [{ r: 0, c: 0, t: grid[0][0] }];

  const reconstructPath = (endR: number, endC: number): Array<[number, number]> => {
    const res: Array<[number, number]> = [];
    let curKey: string | null = `${endR},${endC}`;
    while (curKey) {
      const [r, c] = curKey.split(',').map(Number);
      res.push([r, c]);
      const p: [number, number] | undefined = parent[curKey];
      curKey = p ? `${p[0]},${p[1]}` : null;
    }
    return res.reverse();
  };

  steps.push({
    grid,
    curCoord: [0, 0],
    curWaterLevel: grid[0][0],
    distGrid: snapshotGrid2D(dist),
    visitedGrid: snapshotGrid2D(visited),
    pqSnapshot: [...pq],
    bestPath: [[0, 0]],
    decision: `1. 初始化泳池水位与优先队列：起点 (0, 0) 初始蓄水高度为 grid[0][0] = ${grid[0][0]}，入堆`,
    message: `雨水开始积蓄，需等待水位上升至至少能容纳当前单元格深度。`,
    log: `Init dist[0][0]=${grid[0][0]}`,
    codeLine: lines.init,
    metrics: { '初始水位': grid[0][0], '网格尺寸': `${n}x${n}`, '终点坐标': `(${n-1},${n-1})` },
    statusBadge: { text: `起点水位: ${grid[0][0]}`, type: 'info' },
  });

  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  while (pq.length > 0) {
    pq.sort((a, b) => a.t - b.t);
    const { r, c, t } = pq.shift()!;

    if (visited[r][c]) continue;
    visited[r][c] = true;

    const curPath = reconstructPath(r, c);

    if (r === n - 1 && c === n - 1) {
      steps.push({
        grid,
        curCoord: [r, c],
        curWaterLevel: t,
        distGrid: snapshotGrid2D(dist),
        visitedGrid: snapshotGrid2D(visited),
        pqSnapshot: [...pq],
        bestPath: curPath,
        decision: `到达右下角泳池终点 (${r}, ${c})！堆顶首次弹出确认全局最优最少时间 t = ${t}`,
        message: `根据小根堆波前单调性，此时水位 ${t} 已经开辟了一条从起点到终点的畅通水路！`,
        log: `Hit pool end (${r}, ${c}) at waterLevel=${t}`,
        codeLine: lines.hitTarget,
        metrics: { '最终最少用时': t, '畅通泳道长度': curPath.length },
        statusBadge: { text: `到达终点: t=${t}`, type: 'success' },
      });
      break;
    }

    steps.push({
      grid,
      curCoord: [r, c],
      curWaterLevel: t,
      distGrid: snapshotGrid2D(dist),
      visitedGrid: snapshotGrid2D(visited),
      pqSnapshot: [...pq],
      bestPath: curPath,
      decision: `堆顶定向淹没至单元格 (${r}, ${c}) [原深度=${grid[r][c]}, 当前水位=${t}]，探查 4 向水流渗透`,
      message: `优先向当前能接触到的最浅处水洼延伸，模拟流体浸润过程。`,
      log: `Poll water cell (${r}, ${c}) t=${t}`,
      codeLine: lines.pollCell,
      metrics: { '淹没坐标': `(${r},${c})`, '当前水深': grid[r][c], '有效水位': t },
      statusBadge: { text: `渗透: (${r},${c})`, type: 'info' },
    });

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
        const nextT = Math.max(t, grid[nr][nc]);
        if (nextT < dist[nr][nc]) {
          dist[nr][nc] = nextT;
          parent[`${nr},${nc}`] = [r, c];
          pq.push({ r: nr, c: nc, t: nextT });

          steps.push({
            grid,
            curCoord: [r, c],
            curWaterLevel: t,
            distGrid: snapshotGrid2D(dist),
            visitedGrid: snapshotGrid2D(visited),
            pqSnapshot: [...pq],
            bestPath: reconstructPath(r, c),
            decision: `水流向相邻格 (${nr}, ${nc}) [高程=${grid[nr][nc]}] 渗透：新到达时刻 max(${t}, ${grid[nr][nc]}) = ${nextT}`,
            message: `松弛成功：dist[${nr}][${nc}] 更新为 ${nextT} 并推入水位小根堆。`,
            log: `Relax water (${r},${c}) -> (${nr},${nc}) newT=${nextT}`,
            codeLine: lines.relaxCell,
            metrics: { '渗透格高度': grid[nr][nc], '所需水位': nextT, '目标坐标': `(${nr},${nc})` },
            statusBadge: { text: `漫延: (${nr},${nc})`, type: 'info' },
          });
        }
      }
    }
  }

  return steps;
}

export const swimInRisingWater064Visualizer = registerDeclarativeAlgorithm<SwimStep>({
  id: 'swim-in-rising-water-064',
  aliases: ['swim-in-rising-water', 'class064-code03', 'leetcode-778'],
  name: '水位上升的泳池中游泳与定向淹没 (Class 064)',
  category: 'graph',
  icon: '🏊',
  difficulty: 3,
  levelOrder: 6403,
  learningGoal: '掌握优先队列定向淹没与最短路模拟、理解无后效性瓶颈状态转移',
  problemHtml: GRAPH_064_PROBLEMS.swimInRisingWater064.html,
  codeLanguages: SWIM_IN_WATER_064_CODES,
  inputs: [
    {
      id: 'gridType',
      label: '泳池地形预设',
      type: 'select',
      defaultValue: 'leetcode5',
      options: [
        { label: '5x5 LeetCode 经典水池 (最少用时=20)', value: 'leetcode5' },
        { label: '3x3 递增水阶 (最少用时=8)', value: 'simple3' },
        { label: '4x4 断崖水池 (最少用时=6)', value: 'cliff4' },
      ],
    },
  ],
  presets: [
    { label: '5x5 官方经典泳池 (LeetCode 778)', values: { gridType: 'leetcode5' } },
    { label: '3x3 简单阶梯', values: { gridType: 'simple3' } },
    { label: '4x4 断崖迷宫', values: { gridType: 'cliff4' } },
  ],
  generateSteps: (inputs) => buildSwimInRisingWater064Steps(inputs?.gridType),
  renderCanvas: (container, step) => {
    const pqItems = step.pqSnapshot.map((x) => ({
      label: `(${x.r},${x.c})`,
      priority: `水深${x.t}`,
      highlight: Boolean(step.curCoord && step.curCoord[0] === x.r && step.curCoord[1] === x.c),
    }));

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 8px;">
        ${renderGraph064GridSandbox(step.grid, step.curCoord, step.visitedGrid, {
          distGrid: step.distGrid,
          pathNodes: step.bestPath,
          customBg: (r, c) => {
            const isCur = step.curCoord && step.curCoord[0] === r && step.curCoord[1] === c;
            if (isCur) return '#fef3c7';
            const isPath = step.bestPath?.some(([pr, pc]) => pr === r && pc === c);
            if (isPath) return '#a7f3d0'; // 畅通绿道
            if (step.visitedGrid[r][c]) return '#bae6fd'; // 已淹没浅蓝
            return '#ffffff';
          },
        })}
        <div style="width: 100%; max-width: 480px;">
          ${renderGraph064PriorityQueue(pqItems, '小根堆水位波前 (按最低水位优先)')}
        </div>
      </div>
    `;
  },
});
