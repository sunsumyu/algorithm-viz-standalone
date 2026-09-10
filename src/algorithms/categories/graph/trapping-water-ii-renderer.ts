/**
 * 二维接雨水 II (Trapping Rain Water II - LeetCode 407) 声明式可视化器
 * 核心：外围木桶最短板出堆、小根堆贪心收缩、大根水面蔓延 max(water, height)、木桶短板效应
 * 遵循标准 4-Card 声明式沙盘架构，支持逐行指令执行与多状态矩阵 (waterLevel, visited, heap) 实时监控
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TRAPPING_WATER_II_CODE_LANGUAGES,
  TRAPPING_WATER_II_PROBLEM_HTML,
  TRAPPING_WATER_II_ANALYSIS_HTML,
} from './trapping-water-ii-problem-content';

export interface Trap2Step {
  grid: number[][];
  waterLevel: number[][];
  visited: boolean[][];
  curR: number;
  curC: number;
  curBoardHeight: number;
  totalWater: number;
  heapList: Array<{ r: number; c: number; w: number }>;
  activeArray?: 'water' | 'visited' | 'heap';
  activeSlot?: [number, number];
  status: 'init_border' | 'pop_board' | 'fill_water' | 'spread' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildTrappingWaterIISteps(preset: string = 'classic_3x6'): Trap2Step[] {
  const steps: Trap2Step[] = [];
  const is3x3 = preset === 'simple_3x3';

  // 网格地形
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

  const n = grid.length;
  const m = grid[0].length;

  const waterLevel: number[][] = grid.map((row) => [...row]);
  const visited: boolean[][] = Array.from({ length: n }, () => new Array(m).fill(false));
  const heap: Array<{ r: number; c: number; w: number }> = [];

  let totalWater = 0;
  let curR = 0;
  let curC = 0;
  let curBoardHeight = 0;

  function pushHeap(r: number, c: number, w: number): void {
    heap.push({ r, c, w });
    heap.sort((a, b) => a.w - b.w);
  }

  function pollHeap(): { r: number; c: number; w: number } {
    return heap.shift()!;
  }

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'init_border' | 'pop_board' | 'fill_water' | 'spread' | 'done',
    activeArray?: 'water' | 'visited' | 'heap',
    activeSlot?: [number, number]
  ): void {
    const boardStr = `(${curR}, ${curC}) 高度: ${curBoardHeight}`;
    const phaseStr =
      status === 'done'
        ? '积水计算完成'
        : status === 'fill_water'
          ? '内部低洼蓄水'
          : status === 'spread'
            ? '水线向内推移'
            : status === 'pop_board'
              ? '提取木桶最短板'
              : '四周木桶边界初始化';

    steps.push({
      grid: grid.map((row) => [...row]),
      waterLevel: waterLevel.map((row) => [...row]),
      visited: visited.map((row) => [...row]),
      curR,
      curC,
      curBoardHeight,
      totalWater,
      heapList: heap.map((item) => ({ ...item })),
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-trap2-total': `${totalWater} 滴`,
        'metric-trap2-board': boardStr,
        'metric-trap2-heap': `${heap.length} 个`,
        'metric-trap2-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化四周木桶外围 ====================
  // 行 2: trapRainWater
  makeStep(2, `🚀 [算法初始化] 建立 ${n}x${m} 二维地形高度矩阵，小根堆模拟木桶原理。`, 'trapRainWater 入口', 'init_border');

  // 行 7: 分配 PriorityQueue 与 visited
  makeStep(7, '📦 [构建小根堆与访问表] 优先队列 heap 维护木桶外围水线，visited 记录已锁定的单元格。', '分配 heap 与 visited', 'init_border');

  // 行 11: 四周边框入堆
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (i === 0 || i === n - 1 || j === 0 || j === m - 1) {
        visited[i][j] = true;
        pushHeap(i, j, grid[i][j]);
        curR = i;
        curC = j;
        curBoardHeight = grid[i][j];
        makeStep(12, `🧱 [外围边界入堆] 边界单元格 (${i}, ${j}, 高度=${grid[i][j]}) 作为木桶围栏压入小根堆。`, `边界 (${i}, ${j}) 入堆`, 'init_border', 'visited', [i, j]);
      }
    }
  }

  // 行 20: int ans = 0;
  makeStep(20, '💧 [积水总量初始化] 累计积水量 ans = 0。', 'ans = 0', 'init_border');

  // ==================== 2. 小根堆收缩主循环 ====================
  const dirs = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
  ];

  while (heap.length > 0) {
    // 行 24: cur = heap.poll();
    const top = pollHeap();
    curR = top.r;
    curC = top.c;
    curBoardHeight = top.w;
    makeStep(24, `🪵 [提取木桶最短板] 弹出当前全局最短围栏板 (${curR}, ${curC})，有效水线为 ${curBoardHeight}！`, `poll (${curR}, ${curC}, w=${curBoardHeight})`, 'pop_board');

    // 行 28: 遍历上下左右邻居
    for (const [dr, dc] of dirs) {
      const nr = curR + dr;
      const nc = curC + dc;

      if (nr >= 0 && nr < n && nc >= 0 && nc < m && !visited[nr][nc]) {
        visited[nr][nc] = true;
        const neighborH = grid[nr][nc];

        // 行 32: 检查是否有落差产生积水
        if (neighborH < curBoardHeight) {
          const diff = curBoardHeight - neighborH;
          totalWater += diff;
          waterLevel[nr][nc] = curBoardHeight;
          makeStep(33, `💦 [内部低洼蓄水] 发现内部低洼格 (${nr}, ${nc}, 原高=${neighborH})！低于木桶水线 ${curBoardHeight}！蓄水 ${diff} 滴！总积水增至 ${totalWater}！`, `蓄水 (${nr}, ${nc}) +${diff}`, 'fill_water', 'water', [nr, nc]);
        } else {
          makeStep(30, `⛰️ [遇到更高山峰] 邻格 (${nr}, ${nc}, 高度=${neighborH}) >= 木桶水线 (${curBoardHeight})，无积水产生。`, `高地 (${nr}, ${nc})`, 'spread');
        }

        // 行 35: 新水线入堆
        const nextW = Math.max(curBoardHeight, neighborH);
        pushHeap(nr, nc, nextW);
        makeStep(35, `🌊 [水线向内推移入堆] 单元格 (${nr}, ${nc}) 水线更新为 max(${curBoardHeight}, ${neighborH}) = ${nextW} 并压入小根堆！`, `push (${nr}, ${nc}, w=${nextW})`, 'spread', 'heap');
      }
    }
  }

  // 终态
  makeStep(39, `🎉 [二维接雨水求解完成] 所有内部低洼单元格已全部由外向内蔓延灌满，全网最终总蓄水量为 ${totalWater} 滴！木桶最短板贪心原理保证了结果的最优性！`, '计算结束', 'done');

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<Trap2Step>({
  id: 'trapping-water-ii',
  name: '二维接雨水 II (Trapping Rain Water II)',
  category: 'graph',
  icon: '🌊',
  badge: {
    mode: '小根堆最短板 + 由外向内波前收缩',
    complexity: 'O(MN log(MN)) · O(MN)',
  },
  card1Title: '🌊 3D 网格地形、木桶短板与水面蔓延沙盘',
  card2Title: '📊 水位状态监视器 (waterLevel, visited, 小根堆)',
  card2Desc: '逐行对齐四周边界入堆、木桶最短板出堆、低洼格蓄水 ans += w - h 与水线推移',
  legend: [
    { label: '🪵 当前木桶最短板', color: '#b45309' },
    { label: '💦 内部蓄水格', color: '#0284c7' },
    { label: '🧱 干燥山地/围栏', color: '#1e293b' },
    { label: '🟢 已锁定边界', color: '#065f46' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设地形高度',
      type: 'select',
      defaultValue: 'classic_3x6',
      options: [
        { label: '3x6 经典地形 (总蓄水 4 滴)', value: 'classic_3x6' },
        { label: '3x3 中心洼地 (总蓄水 2 滴)', value: 'simple_3x3' },
      ],
    },
  ],
  presets: [
    { label: '3x6 经典地形', values: { 'input-preset': 'classic_3x6' } },
    { label: '3x3 中心洼地', values: { 'input-preset': 'simple_3x3' } },
  ],
  metrics: [
    { id: 'metric-trap2-total', label: '累计总蓄水量', color: '#38bdf8' },
    { id: 'metric-trap2-board', label: '当前木桶最短板', color: '#f59e0b' },
    { id: 'metric-trap2-heap', label: '堆内边界板数量', color: '#10b981' },
    { id: 'metric-trap2-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: TRAPPING_WATER_II_CODE_LANGUAGES,
  problemHtml: TRAPPING_WATER_II_PROBLEM_HTML,
  analysisHtml: TRAPPING_WATER_II_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_3x6') as string;
    return buildTrappingWaterIISteps(preset);
  },
  renderCanvas: (container, step) => {
    const rows = step.grid.length;
    const cols = step.grid[0].length;

    const cellHtml = step.grid
      .map((row, r) => {
        const rowCells = row
          .map((h, c) => {
            const isCur = step.curR === r && step.curC === c && step.status !== 'done';
            const isVis = step.visited[r][c];
            const wLevel = step.waterLevel[r][c];
            const hasWater = wLevel > h;

            const bg = isCur
              ? '#b45309'
              : hasWater
                ? '#0369a1'
                : isVis
                  ? '#1e293b'
                  : '#0f172a';

            const border = isCur
              ? '2px solid #facc15'
              : hasWater
                ? '2px solid #38bdf8'
                : isVis
                  ? '1px solid #10b981'
                  : '1px solid #475569';

            return `
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 42px; height: 42px; background: ${bg}; border: ${border}; border-radius: 6px; font-family: monospace; font-size: 11px; font-weight: 800; color: #ffffff;">
                <span>${h}</span>
                <span style="font-size: 8px; color: ${hasWater ? '#7dd3fc' : '#94a3b8'};">${hasWater ? `+${wLevel - h}` : `${r},${c}`}</span>
              </div>
            `;
          })
          .join('');

        return `<div style="display: flex; gap: 6px;">${rowCells}</div>`;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #f8fafc; border-radius: 8px; padding: 10px; box-sizing: border-box; gap: 6px;">
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${cellHtml}
        </div>
        <div style="font-size: 10px; color: #64748b; text-align: center; margin-top: 4px;">
          深蓝高亮为蓄水格 (+水深) | 金色边框为当前木桶最短板 | 木桶原理：最矮围栏决定储水上限
        </div>
      </div>
    `;

    const rootEl =
      container.closest('#algo-trapping-water-ii-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (rootEl) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = rootEl.querySelector(`#${id}`);
        if (el) el.textContent = String(val);
      }

      // 多数组监视器
      const customMetricsContainer = rootEl.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const heapPreview =
          step.heapList.length > 0
            ? step.heapList
                .slice(0, 5)
                .map((x) => `<span style="background: #1e293b; border: 1px solid #f59e0b; color: #facc15; padding: 1px 4px; border-radius: 4px; font-size: 9.5px; font-family: monospace;">(${x.r},${x.c}:w=${x.w})</span>`)
                .join(' ')
            : '空堆';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 135px; color: #f59e0b;">小根堆短板序列:</span>
                <div style="display: flex; gap: 4px; flex-wrap: wrap;">${heapPreview}</div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
                <span style="color: #38bdf8; font-size: 10px; font-weight: 700;">累计全局蓄水量:</span>
                <strong style="color: #38bdf8; font-family: monospace; font-size: 11px;">Total Water: ${step.totalWater} 滴</strong>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #64748b; font-size: 10.5px;">执行语句:</span>
              <strong style="color: #38bdf8; font-family: monospace; font-size: 11px;">行 ${Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine}: ${step.log}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'trapping-water-ii',
  name: '二维接雨水 II (Trapping Rain Water II)',
  viewId: 'algo-trapping-water-ii-view',
  category: 'graph',
  description: '木桶原理与优先队列经典结合：外围边界构筑围栏、每次弹出最短板向内蔓延、低洼格产生积水 (LeetCode 407)',
  icon: '🌊',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 99,
  learningGoal: '掌握小根堆模拟木桶原理、二维水线动态扩展机制及外围向内收缩单调性证明',
});

export { Visualizer as TrappingWaterIIVisualizer };
