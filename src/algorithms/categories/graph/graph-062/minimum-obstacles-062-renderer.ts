/**
 * 左程云算法通关课 Class 062: 到达角落需要移除障碍物的最小数目 (LeetCode 2290)
 * 0-1 BFS 双端队列 (Deque) 最短路与网格障碍消减
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth):
 * 本实现综合整合了原有 bfs-01-renderer.ts 的双端队列拓扑与经典预设，
 * 升级为纯正 LeetCode 2290 二维网格 0-1 BFS 沙盘与四语言行号映射。
 * 兼容 aliases: ['minimum-obstacles-062', 'minimum-obstacles', 'bfs-01-deque', 'class062-code03']。
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_062_PROBLEMS } from './graph-062-problem-content';
import {
  MINIMUM_OBSTACLES_062_CODES,
  MINIMUM_OBSTACLES_062_LINES,
} from './graph-062-stage-codes';
import { Graph062StepBase, renderGridSandbox, renderDequeVisualization } from './graph-062-shared';

export interface MinimumObstaclesStep extends Graph062StepBase {
  grid: number[][];
  curCoord: [number, number] | null;
  distMap: number[][];
  dequeSnapshot: Array<{ r: number; c: number; dist: number }>;
  visited: boolean[][];
  minObstacles: number;
}

export function buildMinimumObstacles062Steps(preset: string = 'classic_3x3'): MinimumObstaclesStep[] {
  const steps: MinimumObstaclesStep[] = [];
  const lines = MINIMUM_OBSTACLES_062_LINES;

  let g: number[][];
  if (preset === 'straight_wall') {
    // 3x3 中间整列是障碍物，必须穿破至少 1 个障碍物到达 (2, 2)
    g = [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ];
  } else if (preset === 'corner_blocked') {
    // 终点四周全被障碍包围，最少穿 1 个
    g = [
      [0, 0, 1],
      [0, 1, 1],
      [1, 1, 0],
    ];
  } else {
    // classic_3x3: 绕道 0 路径可达，最少移除 0 个！
    g = [
      [0, 1, 1],
      [0, 0, 1],
      [1, 0, 0],
    ];
  }

  const m = g.length;
  const n = g[0].length;
  const grid = g.map((r) => [...r]);
  const dist = Array.from({ length: m }, () => new Array(n).fill(Infinity));
  const visited = Array.from({ length: m }, () => new Array(n).fill(false));

  const deque: Array<{ r: number; c: number; dist: number }> = [];

  // Step 0: 入口
  steps.push({
    grid: grid.map((r) => [...r]),
    curCoord: null,
    distMap: dist.map((r) => [...r]),
    dequeSnapshot: [],
    visited: visited.map((r) => [...r]),
    minObstacles: Infinity,
    decision: '算法启动：初始化距离矩阵 dist 为无穷大，双端队列 Deque 置空',
    message: `网格尺寸 ${m}x${n}，目标从左上角 (0, 0) 前往右下角 (${m - 1}, ${n - 1})，求最少消除障碍数。`,
    log: `enter minimumObstacles: grid ${m}x${n}`,
    codeLine: lines.entry,
    metrics: { '起点': '(0, 0)', '终点': `(${m - 1}, ${n - 1})`, '初始距离': '∞', '队列状态': '空' },
    statusBadge: { text: '初始化', type: 'info' },
  });

  // Step 1: 起点入队
  dist[0][0] = 0;
  deque.push({ r: 0, c: 0, dist: 0 });
  steps.push({
    grid: grid.map((r) => [...r]),
    curCoord: [0, 0],
    distMap: dist.map((r) => [...r]),
    dequeSnapshot: deque.map((x) => ({ ...x })),
    visited: visited.map((r) => [...r]),
    minObstacles: Infinity,
    decision: '起点初始化：dist[0][0] = 0，加入双端队列队头',
    message: '从 (0, 0) 出发，自身无需消耗移除障碍物的代价，代价为 0，插队头。',
    log: 'dist[0][0] = 0, deque.addFirst((0, 0))',
    codeLine: lines.initDeque,
    metrics: { '当前节点': '(0, 0)', '距离 dist': 0, '双端队列': 1 },
    statusBadge: { text: '起点入队', type: 'info' },
  });

  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  let minAns = -1;

  while (deque.length > 0) {
    const cur = deque.shift()!;
    const { r, c, dist: curD } = cur;

    if (visited[r][c]) continue;
    visited[r][c] = true;

    steps.push({
      grid: grid.map((row) => [...row]),
      curCoord: [r, c],
      distMap: dist.map((row) => [...row]),
      dequeSnapshot: deque.map((x) => ({ ...x })),
      visited: visited.map((row) => [...row]),
      minObstacles: curD,
      decision: `队头弹出节点 (${r}, ${c})，当前累计移除障碍物代价为 ${curD}`,
      message: `从双端队列队头取出的元素天然具备单调最优性，当前到达 (${r}, ${c}) 的最短障碍代价确定为 ${curD}。`,
      log: `pollFirst (${r}, ${c}), dist=${curD}`,
      codeLine: lines.pollNode,
      metrics: { '活跃节点': `(${r}, ${c})`, '移除障碍数': curD, '剩余待搜队列': deque.length },
      statusBadge: { text: `出队: (${r}, ${c})`, type: 'info' },
    });

    if (r === m - 1 && c === n - 1) {
      minAns = curD;
      steps.push({
        grid: grid.map((row) => [...row]),
        curCoord: [r, c],
        distMap: dist.map((row) => [...row]),
        dequeSnapshot: deque.map((x) => ({ ...x })),
        visited: visited.map((row) => [...row]),
        minObstacles: curD,
        decision: `到达终点目标格 (${m - 1}, ${n - 1})！最少需要移除障碍物 ${curD} 个`,
        message: `由 0-1 BFS 的单调性保证，首次从队头弹出终点即为全局最优解，最小障碍数为 ${curD}。`,
        log: `reached target (${m - 1}, ${n - 1}) -> return ${curD}`,
        codeLine: lines.targetCheck,
        metrics: { '最终结果': curD, '单调性保障': '100% 最优', '时间复杂度': 'O(M×N)' },
        statusBadge: { text: `成功到达: 最少 ${curD} 个`, type: 'success' },
      });
      break;
    }

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < m && nc >= 0 && nc < n) {
        const weight = grid[nr][nc]; // 0 或 1
        if (dist[nr][nc] > curD + weight) {
          dist[nr][nc] = curD + weight;

          if (weight === 0) {
            deque.unshift({ r: nr, c: nc, dist: dist[nr][nc] });
            steps.push({
              grid: grid.map((row) => [...row]),
              curCoord: [nr, nc],
              distMap: dist.map((row) => [...row]),
              dequeSnapshot: deque.map((x) => ({ ...x })),
              visited: visited.map((row) => [...row]),
              minObstacles: curD,
              decision: `转移到空格 (${nr}, ${nc})：边权为 0，插在队头 (addFirst)`,
              message: `空格无需消耗代价 (weight=0)，新距离为 ${dist[nr][nc]}。插在队头与当前层并发探索，保持队列单调性！`,
              log: `0-weight edge to (${nr}, ${nc}) -> push_front`,
              codeLine: lines.pushZeroFront,
              metrics: { '目标格': `(${nr}, ${nc})`, '边权': '0 (空格)', '操作': '插队头 push_front' },
              statusBadge: { text: '0 权插队头', type: 'info' },
            });
          } else {
            deque.push({ r: nr, c: nc, dist: dist[nr][nc] });
            steps.push({
              grid: grid.map((row) => [...row]),
              curCoord: [nr, nc],
              distMap: dist.map((row) => [...row]),
              dequeSnapshot: deque.map((x) => ({ ...x })),
              visited: visited.map((row) => [...row]),
              minObstacles: curD,
              decision: `转移到障碍格 (${nr}, ${nc})：边权为 1，插在队尾 (addLast)`,
              message: `进入障碍格需消耗 1 个代价 (weight=1)，新距离为 ${dist[nr][nc]}。插在队尾等待下一批次探索。`,
              log: `1-weight edge to (${nr}, ${nc}) -> push_back`,
              codeLine: lines.pushOneBack,
              metrics: { '目标格': `(${nr}, ${nc})`, '边权': '1 (障碍)', '操作': '插队尾 push_back' },
              statusBadge: { text: '1 权插队尾', type: 'warning' },
            });
          }
        }
      }
    }
  }

  // 终态步骤
  steps.push({
    grid: grid.map((row) => [...row]),
    curCoord: [m - 1, n - 1],
    distMap: dist.map((row) => [...row]),
    dequeSnapshot: [],
    visited: visited.map((row) => [...row]),
    minObstacles: minAns,
    decision: `0-1 BFS 运行完毕：到达右下角最少移除障碍物数目为 ${minAns}`,
    message: `利用双端队列 Deque 维持双段性，无需使用堆，时间复杂度由 O(MN log(MN)) 成功优化至严格 O(M×N)。`,
    log: `minimumObstacles complete -> result=${minAns}`,
    codeLine: lines.returnResult,
    metrics: { '最少移除障碍数': minAns, '时间复杂度': 'O(M×N)', '空间复杂度': 'O(M×N)' },
    statusBadge: { text: `计算完成: 最少 ${minAns} 障`, type: 'success' },
  });

  return steps;
}

export const minimumObstacles062Visualizer = registerDeclarativeAlgorithm<MinimumObstaclesStep>({
  id: 'minimum-obstacles-062',
  aliases: ['minimum-obstacles', 'obstacle-removal-2290', 'bfs-01-deque', 'class062-code03'],
  name: '0-1 BFS 到达角落移除障碍物 (Class 062)',
  category: 'graph',
  icon: '🧱',
  difficulty: 3,
  levelOrder: 6203,
  learningGoal: '深刻理解 0-1 BFS 双端队列如何通过 0权插队头/1权插队尾 天然保持单调性并规避 Dijkstra 堆排开销',
  problemHtml: GRAPH_062_PROBLEMS.minimumObstacles062.html,
  codeLanguages: MINIMUM_OBSTACLES_062_CODES,
  inputs: [
    {
      id: 'preset',
      label: '网格障碍地形',
      type: 'select',
      defaultValue: 'classic_3x3',
      options: [
        { label: '3x3 经典全通 (绕道0障碍可达)', value: 'classic_3x3' },
        { label: '3x3 纵向直立障碍墙 (必破1障碍)', value: 'straight_wall' },
        { label: '3x3 终点障碍围栏 (必破1障碍)', value: 'corner_blocked' },
      ],
    },
  ],
  presets: [
    { label: '3x3 经典可绕用例 (0障碍)', values: { preset: 'classic_3x3' } },
    { label: '3x3 必穿障碍墙用例 (1障碍)', values: { preset: 'straight_wall' } },
    { label: '3x3 终点被围用例 (1障碍)', values: { preset: 'corner_blocked' } },
  ],
  generateSteps: (inputs) => buildMinimumObstacles062Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    const customBg = (r: number, c: number) => {
      const isCur = step.curCoord && step.curCoord[0] === r && step.curCoord[1] === c;
      if (isCur) return '#fef3c7';
      if (step.grid[r][c] === 1) return '#fee2e2'; // 障碍物 (浅红)
      if (step.visited[r][c]) return '#ecfdf5'; // 已探查 (浅绿)
      return '#ffffff';
    };

    const customText = (r: number, c: number) => {
      const d = step.distMap[r][c];
      const dStr = d === Infinity ? '∞' : `${d}`;
      const isObs = step.grid[r][c] === 1;
      return `${isObs ? '🧱' : '⬜'} ${dStr}`;
    };

    const dequeItems = step.dequeSnapshot.map((x) => ({
      label: `(${x.r},${x.c})`,
      tag: `d:${x.dist}`,
      isFront: x.dist === (step.dequeSnapshot[0]?.dist ?? 0),
    }));

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px;">
        ${renderGridSandbox(step.grid, step.curCoord, step.visited, {
          customBg,
          customText,
        })}
        ${renderDequeVisualization(dequeItems, '0-1 BFS 双端队列 (Deque)')}
      </div>
    `;
  },
});
