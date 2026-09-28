import { snapshotGrid2D } from '../../../../core/strategies/grid-snapshot';
/**
 * 左程云算法通关课 Class 062: 二维接雨水 II (Trapping Rain Water II · LeetCode 407)
 * 小根堆优先队列 + 木桶短板效应向内收缩
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth & Bi-Version Synthesis):
 * 深度综合整合了：
 * 1. 经典版本 (trapping-water-ii-renderer.ts) 的三维高程图、多预设选择 (classic_3x6, simple_3x3) 与水线矩阵；
 * 2. 现代大厂版本 (trapping-rain-water-ii-renderer.ts) 的声明式规范、指标网格、左神名师讲义与四语言 1-based 行号联动。
 * 统一主 ID 为 'trapping-rain-water-ii-062'，兼容 aliases: ['trapping-water-ii', 'trapping-rain-water-ii', 'trap-rain-water-407']。
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_062_PROBLEMS } from './graph-062-problem-content';
import {
  TRAPPING_RAIN_WATER_II_062_CODES,
  TRAPPING_RAIN_WATER_II_062_LINES,
} from './graph-062-stage-codes';
import { Graph062StepBase, renderGridSandbox, renderDequeVisualization } from './graph-062-shared';

export interface Trap2Step extends Graph062StepBase {
  grid: number[][];
  waterLevel: number[][];
  visited: boolean[][];
  curR: number;
  curC: number;
  curBoardHeight: number;
  totalWater: number;
  heapList: Array<{ r: number; c: number; w: number }>;
}

export function buildTrappingWaterII062Steps(preset: string = 'classic_3x6'): Trap2Step[] {
  const steps: Trap2Step[] = [];
  const lines = TRAPPING_RAIN_WATER_II_062_LINES;

  const is3x3 = preset === 'simple_3x3';
  const grid: number[][] = is3x3
    ? [
        [3, 3, 3],
        [3, 1, 3],
        [3, 3, 3],
      ]
    : [
        [1, 4, 3, 1, 3, 2],
        [3, 2, 1, 3, 2, 4],
        [2, 3, 3, 2, 3, 1],
      ];

  const m = grid.length;
  const n = grid[0].length;

  const waterLevel: number[][] = snapshotGrid2D(grid);
  const visited: boolean[][] = Array.from({ length: m }, () => new Array(n).fill(false));
  const heap: Array<{ r: number; c: number; w: number }> = [];

  let totalWater = 0;

  // Step 0: 入口
  steps.push({
    grid: snapshotGrid2D(grid),
    waterLevel: snapshotGrid2D(waterLevel),
    visited: snapshotGrid2D(visited),
    curR: -1,
    curC: -1,
    curBoardHeight: 0,
    totalWater: 0,
    heapList: [],
    decision: '算法启动：识别三维地形高度图，准备边界木桶构筑',
    message: `高度图网格尺寸 ${m}x${n}。雨水由外向内渗透，决定储水高度的是外围边界木桶的最短板。`,
    log: `enter trapRainWater: grid ${m}x${n}`,
    codeLine: lines.entry,
    metrics: { '地形尺寸': `${m}x${n}`, '累计积水量': 0, '外围堆规模': 0 },
    statusBadge: { text: '算法启动', type: 'info' },
  });

  // 1. 外围边界格子全部加入小根堆
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (i === 0 || i === m - 1 || j === 0 || j === n - 1) {
        heap.push({ r: i, c: j, w: grid[i][j] });
        visited[i][j] = true;
      }
    }
  }
  heap.sort((a, b) => a.w - b.w);

  steps.push({
    grid: snapshotGrid2D(grid),
    waterLevel: snapshotGrid2D(waterLevel),
    visited: snapshotGrid2D(visited),
    curR: -1,
    curC: -1,
    curBoardHeight: heap[0]?.w ?? 0,
    totalWater: 0,
    heapList: heap.map((h) => ({ ...h })),
    decision: '外围木桶闭环构筑：四边所有边界格子加入小根堆优先队列',
    message: `成功将 ${heap.length} 个外边界格子入堆，初始木桶最短板高度为 ${heap[0]?.w}。`,
    log: `boundary heap initialized with ${heap.length} cells`,
    codeLine: lines.initBoundaryHeap,
    metrics: { '边界木桶规模': heap.length, '初始最低短板': heap[0]?.w ?? 0, '累计积水': 0 },
    statusBadge: { text: '边界木桶就绪', type: 'info' },
  });

  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  while (heap.length > 0) {
    const cur = heap.shift()!;
    const { r, c, w: boardH } = cur;

    steps.push({
      grid: snapshotGrid2D(grid),
      waterLevel: snapshotGrid2D(waterLevel),
      visited: snapshotGrid2D(visited),
      curR: r,
      curC: c,
      curBoardHeight: boardH,
      totalWater,
      heapList: heap.map((h) => ({ ...h })),
      decision: `小根堆弹出当前全局最短木桶板 (${r}, ${c})，挡水高度为 ${boardH}`,
      message: `木桶短板效应：水流只可能越过高度最低的边界泄出，当前最短板高度为 ${boardH}。探查其向内邻居。`,
      log: `pop shortest board (${r}, ${c}) with height=${boardH}`,
      codeLine: lines.popShortestBoard,
      metrics: { '当前短板': `(${r}, ${c})`, '短板挡水高度': boardH, '剩余堆规模': heap.length },
      statusBadge: { text: `弹出短板: 高度 ${boardH}`, type: 'info' },
    });

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < m && nc >= 0 && nc < n && !visited[nr][nc]) {
        visited[nr][nc] = true;
        const groundH = grid[nr][nc];

        if (groundH < boardH) {
          const trapped = boardH - groundH;
          totalWater += trapped;
          waterLevel[nr][nc] = boardH;

          steps.push({
            grid: snapshotGrid2D(grid),
            waterLevel: snapshotGrid2D(waterLevel),
            visited: snapshotGrid2D(visited),
            curR: nr,
            curC: nc,
            curBoardHeight: boardH,
            totalWater,
            heapList: heap.map((h) => ({ ...h })),
            decision: `内陆洼地积水！单元格 (${nr}, ${nc}) 地面高度 ${groundH} < 短板 ${boardH}，积水 ${trapped}`,
            message: `低洼格被水漫延注满至水位高度 ${boardH}，贡献积水量 +${trapped}，总积水量到达 ${totalWater}！`,
            log: `cell (${nr}, ${nc}) trapped ${trapped} water, total=${totalWater}`,
            codeLine: lines.accumulateWater,
            metrics: { '低洼格': `(${nr}, ${nc})`, '地面高度': groundH, '填补水深': trapped, '总积水': totalWater },
            statusBadge: { text: `积水 +${trapped}`, type: 'success' },
          });
        }

        const newBoardH = Math.max(boardH, groundH);
        heap.push({ r: nr, c: nc, w: newBoardH });
        heap.sort((a, b) => a.w - b.w);

        steps.push({
          grid: snapshotGrid2D(grid),
          waterLevel: snapshotGrid2D(waterLevel),
          visited: snapshotGrid2D(visited),
          curR: nr,
          curC: nc,
          curBoardHeight: newBoardH,
          totalWater,
          heapList: heap.map((h) => ({ ...h })),
          decision: `单元格 (${nr}, ${nc}) 成为新围栏木桶板，对外挡水高度提升为 max(${boardH}, ${groundH}) = ${newBoardH} 入堆`,
          message: `无论该格原本是高山还是已注满水的低洼，其向内部呈现的挡水有效高度均为 ${newBoardH}。`,
          log: `push new board (${nr}, ${nc}) with effective height ${newBoardH}`,
          codeLine: lines.pushNewBoard,
          metrics: { '新木桶板': `(${nr}, ${nc})`, '有效挡水高度': newBoardH, '堆规模更新': heap.length },
          statusBadge: { text: `入堆: 高度 ${newBoardH}`, type: 'info' },
        });
      }
    }
  }

  // 终态步骤
  steps.push({
    grid: snapshotGrid2D(grid),
    waterLevel: snapshotGrid2D(waterLevel),
    visited: snapshotGrid2D(visited),
    curR: -1,
    curC: -1,
    curBoardHeight: 0,
    totalWater,
    heapList: [],
    decision: `木桶收缩计算完毕：三维地形总接雨水量为 ${totalWater}`,
    message: `全部网格收缩完毕，依据木桶原理在 O(MN log(MN)) 时间复杂度内精准求得总积水量。`,
    log: `trapRainWater complete -> totalWater=${totalWater}`,
    codeLine: lines.returnTotalWater,
    metrics: { '最终总积水量': totalWater, '时间复杂度': 'O(MN log(MN))', '空间复杂度': 'O(MN)' },
    statusBadge: { text: `总积水: ${totalWater} 立方`, type: 'success' },
  });

  return steps;
}

export const trappingRainWaterII062Visualizer = registerDeclarativeAlgorithm<Trap2Step>({
  id: 'trapping-rain-water-ii-062',
  aliases: ['trapping-rain-water-ii-class062', 'trap-rain-water-407-062'],
  name: '二维接雨水 II 与木桶原理 (Class 062)',
  category: 'graph',
  icon: '🌊',
  difficulty: 3,
  levelOrder: 6205,
  learningGoal: '深刻理解小根堆优先队列模拟木桶短板收缩算法，水面高度只增不减的外围向内单调性证明',
  problemHtml: GRAPH_062_PROBLEMS.trappingRainWaterII062.html,
  codeLanguages: TRAPPING_RAIN_WATER_II_062_CODES,
  inputs: [
    {
      id: 'preset',
      label: '地形用例选择',
      type: 'select',
      defaultValue: 'classic_3x6',
      options: [
        { label: '3x6 经典地形 (总积水量 4)', value: 'classic_3x6' },
        { label: '3x3 中心凹陷盆地 (总积水量 2)', value: 'simple_3x3' },
      ],
    },
  ],
  presets: [
    { label: '3x6 经典凹陷盆地 (积水 4)', values: { preset: 'classic_3x6' } },
    { label: '3x3 单心凹陷低洼 (积水 2)', values: { preset: 'simple_3x3' } },
  ],
  generateSteps: (inputs) => buildTrappingWaterII062Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    const customBg = (r: number, c: number) => {
      const isCur = step.curR === r && step.curC === c;
      if (isCur) return '#fef3c7'; // 活跃黄色
      const trapped = step.waterLevel[r][c] - step.grid[r][c];
      if (trapped > 0) return '#bae6fd'; // 积水区 (浅天蓝)
      if (step.visited[r][c]) return '#f1f5f9'; // 围栏陆地
      return '#ffffff';
    };

    const customText = (r: number, c: number) => {
      const h = step.grid[r][c];
      const trapped = step.waterLevel[r][c] - h;
      if (trapped > 0) return `💧+${trapped}`;
      return `⛰️${h}`;
    };

    const heapItems = step.heapList.slice(0, 8).map((h, idx) => ({
      label: `(${h.r},${h.c})`,
      tag: `高:${h.w}`,
      isFront: idx === 0,
    }));

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px;">
        ${renderGridSandbox(step.grid, step.curR >= 0 ? [step.curR, step.curC] : null, step.visited, {
          customBg,
          customText,
        })}
        <div style="margin-top: 10px; display: flex; gap: 16px; font-size: 11px; color: #475569; font-weight: 600;">
          <span style="display: inline-flex; align-items: center; gap: 4px;">
            <span style="width: 10px; height: 10px; border-radius: 2px; background: #bae6fd; border: 1px solid #38bdf8;"></span>
            积水区域 (高差填补)
          </span>
          <span style="display: inline-flex; align-items: center; gap: 4px;">
            <span style="width: 10px; height: 10px; border-radius: 2px; background: #fef3c7; border: 1.5px solid #f59e0b;"></span>
            当前木桶最短板
          </span>
        </div>
        ${renderDequeVisualization(heapItems, '小根堆 (堆顶优先弹出最短木桶板)')}
      </div>
    `;
  },
});

// 双版本长处整合导出兼容
export { buildTrappingWaterII062Steps as buildTrappingWaterIISteps };
