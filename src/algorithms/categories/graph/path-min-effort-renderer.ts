/**
 * 最小体力消耗路径 (Path With Minimum Effort - LeetCode 1631) 声明式可视化器
 * 核心：2D 网格 Dijkstra 瓶颈最短路、max(effort, |h1 - h2|) 状态松弛、小根堆贪心搜索
 * 深度架构重构：严格解释器级全流程逐行高亮执行（初始化网格、起点入堆、堆非空循环、poll出队、已访问continue、终点命中、4向邻接探索松弛、落差方程计算均发射独立Step）、四语言行号映射
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  PATH_MIN_EFFORT_CODE_LANGUAGES,
  PATH_MIN_EFFORT_PROBLEM_HTML,
  PATH_MIN_EFFORT_ANALYSIS_HTML,
} from './path-min-effort-problem-content';
import { HighlightTarget } from '../../../core/code-panel';

export interface EffortStep {
  grid: number[][];
  dist: number[][];
  visited: boolean[][];
  curR: number;
  curC: number;
  minEffortSoFar: number;
  pathNodes: Array<[number, number]>;
  pqList: Array<{ r: number; c: number; effort: number }>;
  activeArray?: 'dist' | 'visited' | 'pq';
  activeSlot?: [number, number];
  status: 'start' | 'explore' | 'relax' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildPathMinEffortSteps(preset: string = 'classic_mountain_3x3'): EffortStep[] {
  const steps: EffortStep[] = [];
  const isValley = preset === 'valley_3x3';

  const grid: number[][] = isValley
    ? [
        [1, 3, 5],
        [2, 8, 4],
        [1, 1, 2],
      ]
    : [
        [1, 2, 2],
        [3, 8, 2],
        [5, 3, 4],
      ];

  const rows = grid.length;
  const cols = grid[0].length;

  const distance: number[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(Infinity)
  );
  const visited: boolean[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(false)
  );
  const pre: Record<string, [number, number]> = {};

  const pq: Array<{ r: number; c: number; effort: number }> = [];

  function pushPq(r: number, c: number, effort: number): void {
    pq.push({ r, c, effort });
    pq.sort((a, b) => a.effort - b.effort);
  }

  function pollPq(): { r: number; c: number; effort: number } {
    return pq.shift()!;
  }

  let curR = 0;
  let curC = 0;
  let minEffortSoFar = 0;
  let reachedTarget = false;

  // 精准 18 处四语言映射行号字典 (cpp / java / python / javascript)
  const lines = {
    entry: { cpp: 26, java: 12, python: 4, javascript: 2 },
    initDist: { cpp: 28, java: 14, python: 6, javascript: 4 },
    initDistSrc: { cpp: 32, java: 18, python: 9, javascript: 9 },
    initVisited: { cpp: 29, java: 20, python: 7, javascript: 5 },
    initHeap: { cpp: 30, java: 22, python: 10, javascript: 8 },
    pushSrc: { cpp: 33, java: 23, python: 10, javascript: 8 },
    whileHeap: { cpp: 37, java: 28, python: 13, javascript: 12 },
    pollCur: { cpp: 38, java: 29, python: 14, javascript: 14 },
    checkVisited: { cpp: 40, java: 32, python: 15, javascript: 15 },
    continueVisited: { cpp: 40, java: 32, python: 16, javascript: 15 },
    markVisited: { cpp: 41, java: 33, python: 17, javascript: 16 },
    checkTarget: { cpp: 42, java: 36, python: 18, javascript: 17 },
    returnCost: { cpp: 42, java: 37, python: 19, javascript: 17 },
    forDirs: { cpp: 44, java: 40, python: 21, javascript: 19 },
    checkValidNeighbor: { cpp: 46, java: 42, python: 23, javascript: 21 },
    calcBottleneck: { cpp: 48, java: 44, python: 24, javascript: 22 },
    checkRelax: { cpp: 49, java: 45, python: 25, javascript: 23 },
    updateDist: { cpp: 50, java: 46, python: 26, javascript: 24 },
    pushHeap: { cpp: 51, java: 47, python: 27, javascript: 25 },
    returnFail: { cpp: 56, java: 52, python: 28, javascript: 30 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'start' | 'explore' | 'relax' | 'done',
    activeArray?: 'dist' | 'visited' | 'pq',
    activeSlot?: [number, number]
  ): void {
    const curH = grid[curR][curC];
    const coordStr = `(${curR}, ${curC})`;
    const effortStr = `${minEffortSoFar}`;
    const heightStr = `${curH} m`;

    const phaseStr =
      status === 'done'
        ? '最小体力路径达成'
        : status === 'relax'
          ? '松弛瓶颈体力值'
          : status === 'explore'
            ? '弹出最小体力格'
            : '算法初始化';

    let pathNodes: Array<[number, number]> = [];
    if (status === 'done') {
      let curr: [number, number] | undefined = [rows - 1, cols - 1];
      while (curr) {
        pathNodes.unshift(curr);
        if (curr[0] === 0 && curr[1] === 0) break;
        curr = pre[`${curr[0]},${curr[1]}`];
      }
    } else {
      pathNodes = [[curR, curC]];
    }

    steps.push({
      grid: grid.map((r) => [...r]),
      dist: distance.map((r) => [...r]),
      visited: visited.map((r) => [...r]),
      curR,
      curC,
      minEffortSoFar,
      pathNodes,
      pqList: pq.map((item) => ({ ...item })),
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-cur-coord': coordStr,
        'metric-min-effort': effortStr,
        'metric-cur-height': heightStr,
        'metric-effort-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, `🚀 [算法初始化] minimumEffortPath(heights ${rows}x${cols})：开启最小体力消耗瓶颈路径搜索。`, 'minimumEffortPath 入口', 'start');

  makeStep(lines.initDist, `📊 [初始化体力矩阵] distance[${rows}][${cols}] 全部填充 ∞；记录到达各格子所需最小高度落差。`, 'init distance[][]', 'start', 'dist');

  distance[0][0] = 0;
  makeStep(lines.initDistSrc, '🌱 [起点体力初始化] distance[0][0] = 0；自身移动体力消耗为 0。', 'distance[0][0] = 0', 'start', 'dist', [0, 0]);

  makeStep(lines.initVisited, `🏷️ [初始化锁定矩阵] visited[${rows}][${cols}] = false；记录已出堆锁定的终局格子。`, 'init visited[][]', 'start', 'visited');

  makeStep(lines.initHeap, '📦 [初始化小根堆] PriorityQueue 按体力消耗 effort 升序排序。', 'init PriorityQueue', 'start', 'pq');

  pushPq(0, 0, 0);
  makeStep(lines.pushSrc, '📥 [起点入堆] pq.add([0, 0, effort=0])；起点加入 Dijkstra 搜索前沿！', 'push (0,0,0)', 'start', 'pq', [0, 0]);

  const dr = [-1, 1, 0, 0];
  const dc = [0, 0, -1, 1];

  while (pq.length > 0) {
    makeStep(lines.whileHeap, `🔁 [检查堆非空] while (!pq.isEmpty()) -> 小根堆待选格子数: ${pq.length}。`, '!pq.isEmpty()', 'explore');

    const top = pollPq();
    curR = top.r;
    curC = top.c;
    minEffortSoFar = top.effort;

    makeStep(lines.pollCur, `📤 [弹出体力最小格] poll() -> (${curR}, ${curC}) [高度 ${grid[curR][curC]}, 累计瓶颈体力 effort=${minEffortSoFar}]！`, `poll (${curR},${curC},effort=${minEffortSoFar})`, 'explore', 'pq', [curR, curC]);

    makeStep(lines.checkVisited, `🔎 [检查是否已探索] if (visited[${curR}][${curC}]) -> (${visited[curR][curC]})。`, `visited[${curR}][${curC}]?`, 'explore');
    if (visited[curR][curC]) {
      makeStep(lines.continueVisited, `⏭️ [跳过冗余格子] 格子 (${curR}, ${curC}) 之前已被更小体力锁定，跳过。`, `skip visited (${curR},${curC})`, 'explore');
      continue;
    }

    visited[curR][curC] = true;
    makeStep(lines.markVisited, `🔒 [锁定体力状态] visited[${curR}][${curC}] = true；锁定到达 (${curR}, ${curC}) 的全局最小体力 = ${minEffortSoFar}！`, `visited[${curR}][${curC}]=true`, 'explore', 'visited', [curR, curC]);

    makeStep(lines.checkTarget, `🎯 [终点核验] if (r == ${rows - 1} && c == ${cols - 1}) -> (${curR === rows - 1 && curC === cols - 1})。`, 'check target', 'explore');
    if (curR === rows - 1 && curC === cols - 1) {
      reachedTarget = true;
      makeStep(lines.returnCost, `🏆 [抵达终点目标] return d = ${minEffortSoFar}！首次弹出右下角，最小体力消耗路径锁定为 ${minEffortSoFar}！`, `return ${minEffortSoFar}`, 'done', 'dist', [curR, curC]);
      break;
    }

    // 考察四周 4 个邻接方向
    for (let i = 0; i < 4; i++) {
      const nr = curR + dr[i];
      const nc = curC + dc[i];

      makeStep(lines.forDirs, `  ↳ [考察出边] 方向 ${i} -> 邻接格 (${nr}, ${nc})。`, `dir ${i} -> (${nr},${nc})`, 'relax');

      const inBound = nr >= 0 && nr < rows && nc >= 0 && nc < cols;
      const notVis = inBound && !visited[nr][nc];

      makeStep(lines.checkValidNeighbor, `  🔎 [界内与未访问核验] 界内(${inBound})、未访问(${notVis})。`, `valid (${nr},${nc})?`, 'relax');

      if (inBound && notVis) {
        const stepEffort = Math.abs(grid[nr][nc] - grid[curR][curC]);
        const nextEffort = Math.max(minEffortSoFar, stepEffort);

        makeStep(lines.calcBottleneck, `  🧗 [落差松弛计算] stepEffort=|${grid[nr][nc]} - ${grid[curR][curC]}|=${stepEffort}, nextEffort=max(${minEffortSoFar}, ${stepEffort})=${nextEffort}。`, `max(${minEffortSoFar},${stepEffort})=${nextEffort}`, 'relax');

        makeStep(lines.checkRelax, `  🔎 [松弛检验] if (${nextEffort} < distance[${nr}][${nc}]=${distance[nr][nc] === Infinity ? '∞' : distance[nr][nc]})。`, `check relax (${nr},${nc})`, 'relax');

        if (nextEffort < distance[nr][nc]) {
          distance[nr][nc] = nextEffort;
          pre[`${nr},${nc}`] = [curR, curC];
          pushPq(nr, nc, nextEffort);

          makeStep(lines.updateDist, `  ⚡ [更新最短体力] distance[${nr}][${nc}] = ${nextEffort}。`, `dist[${nr}][${nc}]=${nextEffort}`, 'relax', 'dist', [nr, nc]);

          makeStep(lines.pushHeap, `  📥 [候选入堆] pq.add([${nr}, ${nc}, ${nextEffort}])；加入小根堆！`, `push (${nr},${nc},${nextEffort})`, 'relax', 'pq', [nr, nc]);
        }
      }
    }
  }

  if (reachedTarget) {
    makeStep(lines.returnCost, `🎉 [寻路完成] 成功构建最小体力消耗路径！全程最大落差仅为 ${minEffortSoFar}！`, `完成: effort=${minEffortSoFar}`, 'done');
  } else {
    makeStep(lines.returnFail, '❌ [无路可达] return 0：无法连通终点。', 'return 0', 'done');
  }

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<EffortStep>({
  id: 'path-min-effort',
  name: '最小体力消耗路径 (Path With Minimum Effort)',
  viewId: 'algo-path-min-effort-view',
  category: 'graph',
  icon: '🧗',
  badge: {
    mode: 'Dijkstra 瓶颈最短路 · max(|h1 - h2|) 松弛',
    complexity: 'O(R · C log(R · C)) · O(R · C)',
  },
  card1Title: '🧗 网格等高线地形与落差沙盘',
  card2Title: '📊 状态监视器 (distance, visited, 优先队列)',
  card2Desc: '展示当前考察网格平台、瓶颈落差体力值与 Dijkstra 小根堆松弛全过程',
  legend: [
    { label: '🚀 起点 / 🏁 终点', color: '#a855f7' },
    { label: '🧗 当前探索平台', color: '#f59e0b' },
    { label: '🔒 已锁定平台', color: '#065f46' },
    { label: '🟢 最优体力路径', color: '#10b981' },
    { label: '⛰️ 高山障碍地形', color: '#854d0e' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设地形地图',
      type: 'select',
      defaultValue: 'classic_mountain_3x3',
      options: [
        { label: '经典高山地图 (中央峰值 8，绕行最短体力 2)', value: 'classic_mountain_3x3' },
        { label: '山谷绕行地图 (中央峰值 8，沿边缘最短体力 1)', value: 'valley_3x3' },
      ],
    },
  ],
  presets: [
    { label: '经典高山地图 (ans=2)', values: { 'input-preset': 'classic_mountain_3x3' } },
    { label: '山谷绕行地图 (ans=1)', values: { 'input-preset': 'valley_3x3' } },
  ],
  metrics: [
    { id: 'metric-cur-coord', label: '当前坐标', color: '#38bdf8' },
    { id: 'metric-min-effort', label: '瓶颈最小体力', color: '#10b981' },
    { id: 'metric-cur-height', label: '平台海拔高度', color: '#f59e0b' },
    { id: 'metric-effort-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: PATH_MIN_EFFORT_CODE_LANGUAGES,
  problemHtml: PATH_MIN_EFFORT_PROBLEM_HTML,
  analysisHtml: PATH_MIN_EFFORT_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_mountain_3x3') as string;
    return buildPathMinEffortSteps(preset);
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
            const onPath = step.pathNodes.some(([pr, pc]) => pr === r && pc === c);
            const isStart = r === 0 && c === 0;
            const isEnd = r === rows - 1 && c === cols - 1;

            let bg = isVis ? '#0f766e' : '#1e293b';
            if (onPath) bg = '#065f46';
            if (isCur) bg = '#b45309';

            let border = isVis ? '#14b8a6' : '#334155';
            if (onPath) border = '#10b981';
            if (isCur) border = '#facc15';

            let tag = '';
            if (isStart) tag = '<span style="font-size: 7.5px; color: #a855f7;">起</span>';
            else if (isEnd) tag = '<span style="font-size: 7.5px; color: #34d399;">终</span>';

            const dVal = step.dist[r][c];
            const dStr = dVal === Infinity ? '∞' : `${dVal}`;

            return `
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 62px; height: 52px; background: ${bg}; border: 2px solid ${border}; border-radius: 6px; box-sizing: border-box; position: relative;">
                ${tag ? `<div style="position: absolute; top: 2px; left: 4px;">${tag}</div>` : ''}
                <span style="font-size: 13px; font-weight: 800; font-family: monospace; color: #ffffff;">${h}m</span>
                <span style="font-size: 9px; color: ${onPath ? '#6ee7b7' : '#f59e0b'}; font-weight: 700;">落差:${dStr}</span>
              </div>
            `;
          })
          .join('');

        return `<div style="display: flex; gap: 8px;">${rowCells}</div>`;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; justify-content: flex-start; align-items: stretch; background: #0b0f19; padding: 12px; border-radius: 8px; box-sizing: border-box; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 700;">🧗 网格海拔与高度落差地图 (${rows}x${cols})</span>
          <span style="font-size: 11px; color: #e2e8f0; background: #1e293b; padding: 2px 8px; border-radius: 4px; border: 1px solid #334155;">
            当前位置: <b style="color: #f59e0b;">(${step.curR}, ${step.curC})</b> | 瓶颈体力: <b style="color: #10b981;">${step.minEffortSoFar}</b>
          </span>
        </div>

        <div style="width: 100%; min-height: 190px; background: #0f172a; border-radius: 8px; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 1px solid #334155; padding: 12px; box-sizing: border-box; gap: 8px;">
          ${cellHtml}
        </div>

        <!-- 底部瓶颈松弛舱 -->
        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11.5px; font-weight: 800; color: #cbd5e1;">🧗 最小体力瓶颈松弛舱</span>
            <div style="font-size: 11px; color: #38bdf8;">
              松弛方程: <b>nextEffort = max(curEffort, |h_next - h_cur|)</b>
            </div>
          </div>

          <div style="display: flex; gap: 8px; font-size: 11px;">
            <div style="background: rgba(3, 105, 161, 0.4); border: 1px solid #0284c7; border-radius: 4px; padding: 4px 8px; color: #bae6fd;">
              <b>小根堆前沿待选:</b> ${step.pqList.length} 个候选平台
            </div>
            <div style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; border-radius: 4px; padding: 4px 8px; color: #a7f3d0;">
              <b>贪心保证:</b> 每次按当前瓶颈体力最小出堆，终点出堆即为全局最优
            </div>
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const pqBadges = step.pqList.slice(0, 4).map((it, idx) => {
      return `<span style="background: #1e3a8a; border: 1px solid #38bdf8; border-radius: 4px; padding: 2px 6px; color: #bae6fd; font-family: monospace; font-size: 10.5px;">#${idx + 1}: (${it.r},${it.c}) 落差:${it.effort}</span>`;
    }).join(' ');

    const pathStr = step.pathNodes.length > 0
      ? step.pathNodes.map(([r, c]) => `(${r},${c})`).join(' ➔ ')
      : '寻路进行中';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #cbd5e1; padding: 4px 8px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; background: #0f172a; padding: 10px; border-radius: 6px; border: 1px solid #334155;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-family: monospace; font-size: 11px; font-weight: 700; color: #38bdf8;">小根堆候选 Top4:</span>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">${pqBadges || '队列为空'}</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
            <span style="color: #10b981; font-size: 10.5px; font-weight: 700;">当前路径:</span>
            <strong style="color: #10b981; font-family: monospace; font-size: 11px;">${pathStr}</strong>
          </div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'path-min-effort',
  name: '最小体力消耗路径 (Path With Minimum Effort)',
  viewId: 'algo-path-min-effort-view',
  icon: '🧗',
  category: 'graph',
  description: '左程云算法通关课 Class 064 Code02：网格图瓶颈最短路、max(|h1 - h2|) 松弛、Dijkstra 优先队列贪心扩展 (LeetCode 1631)',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 75,
  learningGoal: '深刻理解瓶颈最短路模型转化、网格图 Dijkstra 堆优化松弛与 MiniMax 问题求解',
});

export { Visualizer as PathMinEffortVisualizer };
