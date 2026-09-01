/**
 * K 短路与 A* 搜索 (K-th Shortest Path - A* Algorithm) 声明式可视化器
 * 进阶搜索: 反向图 Dijkstra 预处理 h(u)、A* 优先队列启发式估价 f(u) = g(u) + h(u)、第 K 次出堆即为答案 (洛谷 P2483 / P4467)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  K_SHORTEST_PATH_CODE_LANGUAGES,
  K_SHORTEST_PATH_PROBLEM_HTML,
  K_SHORTEST_PATH_ANALYSIS_HTML,
} from './k-shortest-path-problem-content';

export interface KPathStep {
  curNode: number;
  gVal: number;
  hVal: number;
  fVal: number;
  popCountAtTarget: number;
  targetK: number;
  foundPaths: Array<{ path: number[]; len: number }>;
  status: 'start' | 'search' | 'hit' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildKShortestPathSteps(): KPathStep[] {
  const steps: KPathStep[] = [];

  steps.push({
    curNode: 1,
    gVal: 0,
    hVal: 4,
    fVal: 4,
    popCountAtTarget: 0,
    targetK: 2,
    foundPaths: [],
    status: 'start',
    message: '1. [启发式评估初始状态] 反向 Dijkstra 算出 h[1..4]。起点 1 压入优先队列，f = g(0) + h(4) = 4！',
    log: '起点 1 入堆：g=0, h=4, f=4',
    codeLine: [18, 24],
  });

  steps.push({
    curNode: 4,
    gVal: 4,
    hVal: 0,
    fVal: 4,
    popCountAtTarget: 1,
    targetK: 2,
    foundPaths: [{ path: [1, 2, 4], len: 4 }],
    status: 'hit',
    message: '2. [第 1 次弹出终点 4] 找到第 1 短路 1 ➔ 2 ➔ 4，长度 = 4！继续搜索第 2 短路！',
    log: '第 1 次到达终点 4: 路径 [1, 2, 4], 长度 = 4',
    codeLine: [28, 35],
  });

  steps.push({
    curNode: 4,
    gVal: 6,
    hVal: 0,
    fVal: 6,
    popCountAtTarget: 2,
    targetK: 2,
    foundPaths: [
      { path: [1, 2, 4], len: 4 },
      { path: [1, 3, 4], len: 6 },
    ],
    status: 'done',
    message: '🎉 [第 2 次弹出终点 4] 找到第 2 短路 1 ➔ 3 ➔ 4，长度 = 6！满足 A* 第 K 次到达终点定理！',
    log: '✓ 第 2 次到达终点 4: 第 2 短路 = 6，搜索完成',
    codeLine: [38, 42],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<KPathStep>({
  id: 'k-shortest-path',
  name: 'K 短路与 A* 搜索 (K-th Shortest Path)',
  category: 'graph',
  icon: '🚀',
  badge: {
    mode: 'A* 启发式搜索 (f=g+h)',
    complexity: 'O(K · E log V) · O(V + E)',
  },
  card1Title: '🚀 有向带权图与 A* 启发式搜索沙盘',
  card2Title: '🧭 A* 估价 f(u)=g(u)+h(u) 监视器',
  card2Desc: '反向最短路启发估价 h(u)、实际路径长 g(u) 与第 K 次出堆记录',
  legend: [
    { label: '普通节点', color: '#0284c7' },
    { label: '🚀 起点 / 终点', color: '#f59e0b' },
    { label: '🟢 最优 K 短路', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '4 节点经典第 2 短路用例', values: {} },
  ],
  metrics: [
    { id: 'metric-cur-node', label: '当前出堆节点', color: '#2563eb' },
    { id: 'metric-f-val', label: '综合估价 f = g + h', color: '#f59e0b' },
    { id: 'metric-hit-count', label: '终点出堆次数', color: '#10b981' },
  ],
  codeLanguages: K_SHORTEST_PATH_CODE_LANGUAGES,
  problemHtml: K_SHORTEST_PATH_PROBLEM_HTML,
  analysisHtml: K_SHORTEST_PATH_ANALYSIS_HTML,
  buildSteps: () => buildKShortestPathSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number; h: number }> = {
      1: { x: 75, y: 110, h: 4 },
      2: { x: 155, y: 55, h: 2 },
      3: { x: 155, y: 165, h: 3 },
      4: { x: 235, y: 110, h: 0 },
    };

    const edges = [
      { u: 1, v: 2, w: 2 },
      { u: 2, v: 4, w: 2 },
      { u: 1, v: 3, w: 3 },
      { u: 3, v: 4, w: 3 },
    ];

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 6;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#475569" stroke-width="1.5" marker-end="url(#arrow-default)" />
            <text x="${midX}" y="${midY}" fill="#94a3b8" font-size="8.5" font-weight="700" font-family="monospace" text-anchor="middle">w:${e.w}</text>
          </g>
        `;
      })
      .join('');

    const nodes = [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isCur = step.curNode === u;
        const isTarget = u === 4;
        const bg = isCur ? '#f59e0b' : isTarget ? '#065f46' : '#1e3a8a';
        const border = isCur ? '#facc15' : isTarget ? '#10b981' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isCur ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="#34d399" font-size="9" font-weight="700" text-anchor="middle">h:${p.h}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 200">
          <defs>
            <marker id="arrow-default" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
            </marker>
          </defs>
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🚀 A* 优先队列以 $f(u) = g(u) + h(u)$ 排序 | 终点第 K 次出堆即可得到第 K 短路
        </div>
      </div>
    `;

    const root = container.closest('#algo-k-shortest-path-view');
    if (root) {
      const nodeEl = root.querySelector('#metric-cur-node');
      const fEl = root.querySelector('#metric-f-val');
      const hitEl = root.querySelector('#metric-hit-count');

      if (nodeEl) nodeEl.textContent = `Node ${step.curNode}`;
      if (fEl) fEl.textContent = `${step.gVal} + ${step.hVal} = ${step.fVal}`;
      if (hitEl) hitEl.textContent = `${step.popCountAtTarget} / ${step.targetK}`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const pathList = step.foundPaths.map((p, idx) => `第${idx + 1}短: [${p.path.join('➔')}] (长度:${p.len})`).join(' | ') || '搜索中...';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>已捕获短路:</span>
              <strong style="color: #10b981; font-family: monospace;">${pathList}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 A* 搜索第 K 短路定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">终点 target 第 K 次出堆时对应路径长度必为第 K 短路</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'k-shortest-path',
  name: 'K 短路与 A* 搜索 (K-th Shortest Path)',
  viewId: 'algo-k-shortest-path-view',
  category: 'graph',
  description: '进阶图论搜索经典：反向图 Dijkstra 预处理启发估价 h(u)、A* 优先队列启发式搜索、第 K 次出堆即为第 K 短路 (洛谷 P2483)',
  icon: '🚀',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 53,
  learningGoal: '掌握 A* 启发式函数 f(u)=g(u)+h(u) 在图搜索中的应用及第 K 短路正确性证明',
});

export { Visualizer as KShortestPathVisualizer };
