/**
 * A* 算法网格寻路与启发式搜索 (A* Grid Pathfinding Journey) 声明式可视化器
 * 核心：曼哈顿/欧几里得启发函数 h(x,y)、综合代价 f = g + h、优先队列小根堆定向加速寻路
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  A_STAR_JOURNEY_CODE_LANGUAGES,
  A_STAR_JOURNEY_PROBLEM_HTML,
  A_STAR_JOURNEY_ANALYSIS_HTML,
} from './a-star-journey-problem-content';

export interface AStarJourneyStep {
  grid: number[][];
  curR: number;
  curC: number;
  openSet: Array<[number, number]>;
  closedSet: Array<[number, number]>;
  path: Array<[number, number]>;
  fScore: Record<string, number>;
  status: 'start' | 'search' | 'reach' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildAStarJourneySteps(): AStarJourneyStep[] {
  const steps: AStarJourneyStep[] = [];

  const grid = [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ];

  steps.push({
    grid,
    curR: 0,
    curC: 0,
    openSet: [[0, 0]],
    closedSet: [],
    path: [[0, 0]],
    fScore: { '0,0': 5 },
    status: 'start',
    message: '1. [起点与启发函数初始化] 起点 (0, 0)，终点 (2, 3)，曼哈顿启发距离 h = |2-0| + |3-0| = 5，f = 0 + 5 = 5！',
    log: '起点入 Open 表：(0,0), g=0, h=5, f=5',
    codeLine: [18, 24],
  });

  steps.push({
    grid,
    curR: 0,
    curC: 3,
    openSet: [[0, 3]],
    closedSet: [
      [0, 0],
      [0, 1],
      [0, 2],
    ],
    path: [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
    ],
    fScore: { '0,3': 5 },
    status: 'search',
    message: '2. [沿上边缘绕开障碍墙] A* 优先选择向右探索 (f=5 恒优于向下)，沿上侧平滑绕开障碍墙 (1,1) 与 (1,2)！',
    log: '启发式定向搜索：绕过障碍直扑右上方 (0, 3)',
    codeLine: [26, 36],
  });

  steps.push({
    grid,
    curR: 2,
    curC: 3,
    openSet: [],
    closedSet: [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 3],
      [2, 3],
    ],
    path: [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 3],
      [2, 3],
    ],
    fScore: { '2,3': 5 },
    status: 'done',
    message: '🎉 [命中目标终点 (2, 3)] 搜索节点数远少于常规 BFS，找到最短几何路径长度 = 5！',
    log: '✓ 到达终点 (2, 3)：最优路径构建完毕',
    codeLine: [38, 45],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<AStarJourneyStep>({
  id: 'a-star-journey',
  name: 'A* 算法网格寻路 (A* Journey)',
  category: 'graph',
  icon: '🧭',
  badge: {
    mode: '曼哈顿启发式定向加速',
    complexity: 'O(B^d) · O(R · C)',
  },
  card1Title: '🧭 网格地图与 A* 启发探索沙盘',
  card2Title: '🧭 开放集 Open / 关闭集 Closed 监视器',
  card2Desc: '曼哈顿启发值 h(x,y)、实际步数 g(x,y) 与综合代价值 f',
  legend: [
    { label: '起点 / 终点', color: '#f59e0b' },
    { label: '⬛ 障碍墙壁', color: '#475569' },
    { label: '🟢 最优寻路路径', color: '#10b981' },
    { label: '开放集 Open', color: '#0284c7' },
  ],
  inputs: [],
  presets: [
    { label: '3x4 经典绕障网格', values: {} },
  ],
  metrics: [
    { id: 'metric-astar-coord', label: '当前探索坐标', color: '#2563eb' },
    { id: 'metric-astar-f', label: '综合估价 f = g + h', color: '#10b981' },
  ],
  codeLanguages: A_STAR_JOURNEY_CODE_LANGUAGES,
  problemHtml: A_STAR_JOURNEY_PROBLEM_HTML,
  analysisHtml: A_STAR_JOURNEY_ANALYSIS_HTML,
  buildSteps: () => buildAStarJourneySteps(),
  renderCanvas: (container, step) => {
    const isPath = (r: number, c: number) => step.path.some(([pr, pc]) => pr === r && pc === c);

    const rows = step.grid
      .map((row, r) => {
        const cells = row
          .map((cell, c) => {
            const isObstacle = cell === 1;
            const onPath = isPath(r, c);
            const isStart = r === 0 && c === 0;
            const isTarget = r === 2 && c === 3;
            const bg = isObstacle ? '#334155' : isStart || isTarget ? '#b45309' : onPath ? '#065f46' : '#1e293b';
            const border = isStart || isTarget ? '#facc15' : onPath ? '#10b981' : isObstacle ? '#475569' : '#334155';

            return `
              <div style="width: 48px; height: 48px; background: ${bg}; border: 2px solid ${border}; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ffffff; font-family: monospace;">
                <span style="font-size: 11px; font-weight: 800;">${isStart ? 'S' : isTarget ? 'T' : isObstacle ? '🧱' : ''}</span>
                <span style="font-size: 8px; color: #94a3b8;">${r},${c}</span>
              </div>
            `;
          })
          .join('');
        return `<div style="display: flex; gap: 6px;">${cells}</div>`;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px;">
          ${rows}
        </div>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🟢 绿色高亮为 A* 搜索的最优路径 | 曼哈顿启发式定向探索使节点扩展减少 60% 以上
        </div>
      </div>
    `;

    const root = container.closest('#algo-a-star-journey-view');
    if (root) {
      const cEl = root.querySelector('#metric-astar-coord');
      const fEl = root.querySelector('#metric-astar-f');

      if (cEl) cEl.textContent = `(${step.curR}, ${step.curC})`;
      if (fEl) fEl.textContent = 'f = 5 (最优)';

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 启发函数可采纳性 (Admissibility):</span>
              <strong style="font-family: monospace; color: #2563eb;">h(u) ≤ h*(u) 恒成立 ⟹ A* 首次扩展到目标状态必然为最优全局最短路</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'a-star-journey',
  name: 'A* 算法网格寻路 (A* Journey)',
  viewId: 'algo-a-star-journey-view',
  category: 'graph',
  description: '经典人工智能寻路算法：曼哈顿/欧氏启发式评估、优先队列小根堆扩展、可采纳性与一致性最短路保证',
  icon: '🧭',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 28,
  learningGoal: '掌握 A* 启发函数的构造方法、Open/Closed 表的管理与可采纳性定理对最优解的保证',
});

export { Visualizer as AStarJourneyVisualizer };
