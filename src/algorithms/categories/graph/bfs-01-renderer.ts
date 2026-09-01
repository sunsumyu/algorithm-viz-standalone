/**
 * 0-1 BFS 双端队列最短路 (0-1 BFS with Deque) 声明式可视化器
 * 核心：边权为 0 放队头 pushFront、边权为 1 放队尾 pushBack、保持队列两段性与单调性 (LeetCode 1368 / 洛谷 P4568)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  BFS_01_CODE_LANGUAGES,
  BFS_01_PROBLEM_HTML,
  BFS_01_ANALYSIS_HTML,
} from './bfs-01-problem-content';

export interface BFS01Step {
  dequeList: Array<{ u: number; dist: number }>;
  distMap: Record<number, number>;
  curU: number;
  status: 'init' | 'pop' | 'relax0' | 'relax1' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildBFS01Steps(): BFS01Step[] {
  const steps: BFS01Step[] = [];

  steps.push({
    dequeList: [{ u: 1, dist: 0 }],
    distMap: { 1: 0, 2: Infinity, 3: Infinity, 4: Infinity },
    curU: 1,
    status: 'init',
    message: '1. [起点入双端队列] 起点 1 入 Deque 队头，dist[1] = 0！',
    log: '初始化：dist[1]=0, deque=[(1, d:0)]',
    codeLine: [18, 25],
  });

  steps.push({
    dequeList: [
      { u: 2, dist: 0 },
      { u: 3, dist: 1 },
    ],
    distMap: { 1: 0, 2: 0, 3: 1, 4: Infinity },
    curU: 1,
    status: 'relax0',
    message: '2. [弹出 1 并松弛出边] 1 ➔ 2 边权为 0，pushFront 插入队头！1 ➔ 3 边权为 1，pushBack 插入队尾！',
    log: '松弛边：0 边插队头 (2, d:0)，1 边插队尾 (3, d:1)',
    codeLine: [28, 38],
  });

  steps.push({
    dequeList: [],
    distMap: { 1: 0, 2: 0, 3: 1, 4: 1 },
    curU: 4,
    status: 'done',
    message: '🎉 [0-1 最短路求解完成] 队列始终保持单调递增性，严格 O(V + E) 线性时间求得到达终点 4 的最短代价 = 1！',
    log: '✓ 0-1 BFS 求解完成：dist[4] = 1, 时间复杂度 O(V+E)',
    codeLine: [40, 45],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<BFS01Step>({
  id: 'bfs-01',
  name: '0-1 BFS 双端队列 (0-1 BFS)',
  category: 'graph',
  icon: '0️⃣',
  badge: {
    mode: '双端队列维持两段性',
    complexity: 'O(V + E) · O(V)',
  },
  card1Title: '0️⃣ 0-1 带权图与双端队列沙盘',
  card2Title: '🧭 双端队列 Deque 结构与最短路监视器',
  card2Desc: '边权为 0 压入队头、边权为 1 压入队尾与队列单调性',
  legend: [
    { label: '图节点 (1..4)', color: '#0284c7' },
    { label: '🟢 0 权边 (零代价转移)', color: '#10b981' },
    { label: '⚡ 1 权边 (单位代价转移)', color: '#f59e0b' },
  ],
  inputs: [],
  presets: [
    { label: '4 节点 0-1 经典测试图', values: {} },
  ],
  metrics: [
    { id: 'metric-bfs01-node', label: '当前队头出队点', color: '#2563eb' },
    { id: 'metric-bfs01-dist', label: '终点最短路 dist[4]', color: '#10b981' },
  ],
  codeLanguages: BFS_01_CODE_LANGUAGES,
  problemHtml: BFS_01_PROBLEM_HTML,
  analysisHtml: BFS_01_ANALYSIS_HTML,
  buildSteps: () => buildBFS01Steps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 75, y: 110 },
      2: { x: 155, y: 55 },
      3: { x: 155, y: 165 },
      4: { x: 235, y: 110 },
    };

    const edges = [
      { u: 1, v: 2, w: 0 },
      { u: 1, v: 3, w: 1 },
      { u: 2, v: 4, w: 1 },
      { u: 3, v: 4, w: 0 },
    ];

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const color = e.w === 0 ? '#10b981' : '#f59e0b';
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 6;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="2" />
            <text x="${midX}" y="${midY}" fill="${color}" font-size="9" font-weight="700" font-family="monospace" text-anchor="middle">w:${e.w}</text>
          </g>
        `;
      })
      .join('');

    const nodes = [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const d = step.distMap[u];
        const isCur = step.curU === u;

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${isCur ? '#b45309' : '#0369a1'}" stroke="${isCur ? '#facc15' : '#38bdf8'}" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="#34d399" font-size="9" font-weight="700" text-anchor="middle">d:${d === Infinity ? '∞' : d}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 200">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🟢 绿色为 0 权边 (插队头) | 🟡 金色为 1 权边 (插队尾) | 严格 $O(V + E)$ 无需优先队列
        </div>
      </div>
    `;

    const root = container.closest('#algo-bfs-01-view');
    if (root) {
      const nEl = root.querySelector('#metric-bfs01-node');
      const dEl = root.querySelector('#metric-bfs01-dist');

      if (nEl) nEl.textContent = `Node ${step.curU}`;
      if (dEl) dEl.textContent = `${step.distMap[4]}`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 双端队列两段性定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">队列中元素距离至多差 1，队头出队必然满足最优贪心选择性质</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'bfs-01',
  name: '0-1 BFS 双端队列 (0-1 BFS)',
  viewId: 'algo-bfs-01-view',
  category: 'graph',
  description: '左程云算法通关课核心：双端队列 Deque 维护两段性、0 边插队头 1 边插队尾、替代 Dijkstra 实现 O(V+E) 极速最短路',
  icon: '0️⃣',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 23,
  learningGoal: '掌握 0-1 BFS 的双端队列入队规则、两段性单调性证明及与 Dijkstra 堆优化的常数差异',
});

export { Visualizer as BFS01Visualizer };
