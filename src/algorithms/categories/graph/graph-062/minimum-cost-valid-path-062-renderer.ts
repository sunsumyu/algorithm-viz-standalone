/**
 * 左程云算法通关课 Class 062: 使网格图至少有一条有效路径的最小代价 (LeetCode 1368)
 * 0-1 BFS 边权判定：顺应箭头代价为 0 插队头，更改箭头代价为 1 插队尾
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_062_PROBLEMS } from './graph-062-problem-content';
import {
  MINIMUM_COST_VALID_PATH_062_CODES,
  MINIMUM_COST_VALID_PATH_062_LINES,
} from './graph-062-stage-codes';
import { Graph062StepBase, renderGridSandbox, renderDequeVisualization } from './graph-062-shared';

export interface ValidPathStep extends Graph062StepBase {
  grid: number[][];
  curCoord: [number, number] | null;
  distMap: number[][];
  dequeSnapshot: Array<{ r: number; c: number; dist: number }>;
  visited: boolean[][];
  minCost: number;
}

const ARROW_SYMBOLS: Record<number, string> = {
  1: '→',
  2: '←',
  3: '↓',
  4: '↑',
};

export function buildMinimumCostValidPath062Steps(preset: string = 'classic_3x3'): ValidPathStep[] {
  const steps: ValidPathStep[] = [];
  const lines = MINIMUM_COST_VALID_PATH_062_LINES;

  let g: number[][];
  if (preset === 'zero_cost') {
    // 零修改直达路径: (0,0)右->(0,1)右->(0,2)下->(1,2)下->(2,2)
    g = [
      [1, 1, 3],
      [2, 2, 3],
      [2, 2, 1],
    ];
  } else {
    // 经典需改 1 次箭头: (1,2) 处原箭头是 2(向左)，需改向 3(向下) 进 (2,2)
    g = [
      [1, 1, 3],
      [2, 2, 2],
      [1, 1, 4],
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
    minCost: Infinity,
    decision: '算法启动：识别网格初始方向箭头 (1:右, 2:左, 3:下, 4:上)',
    message: `网格尺寸 ${m}x${n}，目标以最小修改代价从 (0, 0) 到达 (${m - 1}, ${n - 1})。`,
    log: `enter minCost: grid ${m}x${n}`,
    codeLine: lines.entry,
    metrics: { '起点': '(0, 0)', '终点': `(${m - 1}, ${n - 1})`, '初始代价': '∞' },
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
    minCost: 0,
    decision: '起点初始入队：dist[0][0] = 0，加入双端队列队头',
    message: '从 (0, 0) 出发初始修改代价为 0，插在队头。',
    log: 'dist[0][0] = 0, dq.addFirst((0, 0))',
    codeLine: lines.initQueue,
    metrics: { '当前位置': '(0, 0)', '箭头方向': ARROW_SYMBOLS[grid[0][0]], '累计代价': 0 },
    statusBadge: { text: '起点入队', type: 'info' },
  });

  // 1: 右 [0, 1], 2: 左 [0, -1], 3: 下 [1, 0], 4: 上 [-1, 0]
  const dirs = [
    [0, 0],
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
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
      minCost: curD,
      decision: `弹出当前格 (${r}, ${c})，当前累计修改箭头代价为 ${curD}`,
      message: `格 (${r}, ${c}) 的天然指向为 ${ARROW_SYMBOLS[grid[r][c]]}。准备探测四周 4 个移动方向。`,
      log: `pollFirst (${r}, ${c}), dist=${curD}, dir=${grid[r][c]}`,
      codeLine: lines.pollCoord,
      metrics: { '当前格': `(${r}, ${c})`, '天然箭头': ARROW_SYMBOLS[grid[r][c]], '当前花费': curD },
      statusBadge: { text: `探测 (${r}, ${c})`, type: 'info' },
    });

    if (r === m - 1 && c === n - 1) {
      minAns = curD;
      break;
    }

    for (let d = 1; d <= 4; d++) {
      const nr = r + dirs[d][0];
      const nc = c + dirs[d][1];

      if (nr >= 0 && nr < m && nc >= 0 && nc < n) {
        const weight = grid[r][c] === d ? 0 : 1;

        steps.push({
          grid: grid.map((row) => [...row]),
          curCoord: [r, c],
          distMap: dist.map((row) => [...row]),
          dequeSnapshot: deque.map((x) => ({ ...x })),
          visited: visited.map((row) => [...row]),
          minCost: curD,
          decision: `向 ${ARROW_SYMBOLS[d]} 探查邻格 (${nr}, ${nc})：${weight === 0 ? '顺应天然箭头 (代价 0)' : '需改箭头 (代价 1)'}`,
          message: weight === 0
            ? `移动方向与天然箭头 ${ARROW_SYMBOLS[d]} 一致！转移边权为 0，插在队头！`
            : `移动方向与当前箭头不同，需花费 1 修改方向。边权为 1，插在队尾！`,
          log: `try dir ${ARROW_SYMBOLS[d]} to (${nr}, ${nc}): weight=${weight}`,
          codeLine: lines.checkDirectionWeight,
          metrics: { '移动方向': ARROW_SYMBOLS[d], '箭头对比': weight === 0 ? '一致 (0)' : '修改 (+1)', '转移边权': weight },
          statusBadge: { text: weight === 0 ? '顺路 (0权)' : '改向 (1权)', type: weight === 0 ? 'success' : 'warning' },
        });

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
              minCost: curD,
              decision: `零代价转移到 (${nr}, ${nc})：插在队头 (addFirst)`,
              message: `到达 (${nr}, ${nc}) 累计代价仍为 ${dist[nr][nc]}，立即加入队头参与同层探索。`,
              log: `0-weight edge to (${nr}, ${nc}) -> push_front`,
              codeLine: lines.pushZeroFront,
              metrics: { '新格': `(${nr}, ${nc})`, '累计修改数': dist[nr][nc], '队列操作': '队头 push_front' },
              statusBadge: { text: '队头入队', type: 'info' },
            });
          } else {
            deque.push({ r: nr, c: nc, dist: dist[nr][nc] });
            steps.push({
              grid: grid.map((row) => [...row]),
              curCoord: [nr, nc],
              distMap: dist.map((row) => [...row]),
              dequeSnapshot: deque.map((x) => ({ ...x })),
              visited: visited.map((row) => [...row]),
              minCost: curD,
              decision: `改向代价 1 转移到 (${nr}, ${nc})：插在队尾 (addLast)`,
              message: `到达 (${nr}, ${nc}) 累计代价提升为 ${dist[nr][nc]}，入队尾等待后续轮次。`,
              log: `1-weight edge to (${nr}, ${nc}) -> push_back`,
              codeLine: lines.pushOneBack,
              metrics: { '新格': `(${nr}, ${nc})`, '累计修改数': dist[nr][nc], '队列操作': '队尾 push_back' },
              statusBadge: { text: '队尾入队', type: 'warning' },
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
    minCost: minAns,
    decision: `0-1 BFS 搜索完成：到达终点所需最小箭头修改代价为 ${minAns}`,
    message: `成功找到有效路径！通过将网格箭头转向建模为 0-1 边权图，在严格 O(M×N) 时间内达成全局最优解。`,
    log: `validPath complete -> minCost=${minAns}`,
    codeLine: lines.returnMinCost,
    metrics: { '最小修改代价': minAns, '时间复杂度': 'O(M×N)', '队列双段性': '100% 保持' },
    statusBadge: { text: `最少需修改 ${minAns} 箭头`, type: 'success' },
  });

  return steps;
}

export const minimumCostValidPath062Visualizer = registerDeclarativeAlgorithm<ValidPathStep>({
  id: 'minimum-cost-valid-path-062',
  aliases: ['minimum-cost-valid-path', 'valid-path-1368'],
  name: '有效路径最小代价与0-1广搜 (Class 062)',
  category: 'graph',
  icon: '🧭',
  difficulty: 3,
  levelOrder: 6204,
  learningGoal: '掌握网格箭头图到 0-1 BFS 边权的数学归约：顺向边权 0、改向边权 1，线性求解全局最小修改代价',
  problemHtml: GRAPH_062_PROBLEMS.minimumCostValidPath062.html,
  codeLanguages: MINIMUM_COST_VALID_PATH_062_CODES,
  inputs: [
    {
      id: 'preset',
      label: '网格箭头用例',
      type: 'select',
      defaultValue: 'classic_3x3',
      options: [
        { label: '3x3 经典用例 (需改 1 次箭头)', value: 'classic_3x3' },
        { label: '3x3 天然直通 (需改 0 次箭头)', value: 'zero_cost' },
      ],
    },
  ],
  presets: [
    { label: '经典需改 1 处箭头用例', values: { preset: 'classic_3x3' } },
    { label: '天然直通 0 代价用例', values: { preset: 'zero_cost' } },
  ],
  generateSteps: (inputs) => buildMinimumCostValidPath062Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    const customBg = (r: number, c: number) => {
      const isCur = step.curCoord && step.curCoord[0] === r && step.curCoord[1] === c;
      if (isCur) return '#fef3c7';
      if (step.visited[r][c]) return '#ecfdf5';
      return '#ffffff';
    };

    const customText = (r: number, c: number) => {
      const arrow = ARROW_SYMBOLS[step.grid[r][c]];
      const d = step.distMap[r][c];
      const dStr = d === Infinity ? '—' : `${d}`;
      return `${arrow} (${dStr})`;
    };

    const dequeItems = step.dequeSnapshot.map((x) => ({
      label: `(${x.r},${x.c})`,
      tag: `代价:${x.dist}`,
      isFront: x.dist === (step.dequeSnapshot[0]?.dist ?? 0),
    }));

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px;">
        ${renderGridSandbox(step.grid, step.curCoord, step.visited, {
          customBg,
          customText,
        })}
        ${renderDequeVisualization(dequeItems, '0-1 BFS 双端队列 (箭头修改代价流)')}
      </div>
    `;
  },
});
