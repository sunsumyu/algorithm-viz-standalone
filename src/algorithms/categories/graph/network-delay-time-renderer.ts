/**
 * 网络延迟时间 (Network Delay Time - LeetCode 743 / 左程云 Class 064 Code01) 声明式可视化器
 * 核心：单源最短路径 Dijkstra 堆优化、信号广播向外扩散、全网收齐时间 max(dist[1..n])、不可达节点判定 (-1)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  NETWORK_DELAY_CODE_LANGUAGES,
  NETWORK_DELAY_PROBLEM_HTML,
  NETWORK_DELAY_ANALYSIS_HTML,
} from './network-delay-time-problem-content';

export interface DelayStep {
  curNode: number;
  distList: number[];
  visitedList: boolean[];
  pqSnapshot: Array<{ u: number; d: number }>;
  maxDelaySoFar: number;
  isAllReached: boolean;
  status: 'emit' | 'relax' | 'pop' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildNetworkDelaySteps(isReachableCase: boolean): DelayStep[] {
  const steps: DelayStep[] = [];

  if (isReachableCase) {
    // 经典用例：4 节点，源点 K=2
    // times = [[2,1,1],[2,3,1],[3,4,1]], n=4, k=2
    steps.push({
      curNode: 2,
      distList: [Infinity, Infinity, 0, Infinity, Infinity],
      visitedList: [false, false, false, false, false],
      pqSnapshot: [{ u: 2, d: 0 }],
      maxDelaySoFar: 0,
      isAllReached: false,
      status: 'emit',
      message: '📡 [发射初始广播信号] 从源节点 2 发出信号，dist[2] = 0，压入小根堆！',
      log: '发射信号：源点 K=2, dist[2]=0',
      codeLine: [18, 22],
    });

    steps.push({
      curNode: 2,
      distList: [Infinity, 1, 0, 1, Infinity],
      visitedList: [false, false, true, false, false],
      pqSnapshot: [
        { u: 1, d: 1 },
        { u: 3, d: 1 },
      ],
      maxDelaySoFar: 1,
      isAllReached: false,
      status: 'relax',
      message: '⚡ [松弛邻接节点] 节点 2 松弛节点 1(耗时 1) 与节点 3(耗时 1)，压入堆中。',
      log: '松弛边: 2->1(d=1), 2->3(d=1)',
      codeLine: [31, 38],
    });

    steps.push({
      curNode: 1,
      distList: [Infinity, 1, 0, 1, Infinity],
      visitedList: [false, true, true, false, false],
      pqSnapshot: [{ u: 3, d: 1 }],
      maxDelaySoFar: 1,
      isAllReached: false,
      status: 'pop',
      message: '🎯 [堆弹出最小节点 1] 节点 1 确认最短耗时 = 1，无出边。',
      log: '弹出节点 1: dist[1]=1 确定',
      codeLine: [25, 30],
    });

    steps.push({
      curNode: 3,
      distList: [Infinity, 1, 0, 1, 2],
      visitedList: [false, true, true, true, false],
      pqSnapshot: [{ u: 4, d: 2 }],
      maxDelaySoFar: 2,
      isAllReached: false,
      status: 'relax',
      message: '⚡ [堆弹出节点 3 并松弛节点 4] 节点 3 确认最短耗时 1，松弛边 3➔4(耗时 1)，dist[4] = 1 + 1 = 2！',
      log: '弹出节点 3: 松弛 3->4 (dist[4]=2)',
      codeLine: [31, 38],
    });

    steps.push({
      curNode: 4,
      distList: [Infinity, 1, 0, 1, 2],
      visitedList: [false, true, true, true, true],
      pqSnapshot: [],
      maxDelaySoFar: 2,
      isAllReached: true,
      status: 'done',
      message: '🎉 [全网所有节点均收到信号] 全网收齐信号的最小时间为 max(dist[1..4]) = max(1, 0, 1, 2) = 2！',
      log: '✓ 全网收齐：最大延迟时间 = 2',
      codeLine: [42, 48],
    });
  } else {
    // 存在孤立点用例 (返回 -1)
    steps.push({
      curNode: 1,
      distList: [Infinity, 0, 1, Infinity],
      visitedList: [false, true, true, false],
      pqSnapshot: [],
      maxDelaySoFar: -1,
      isAllReached: false,
      status: 'done',
      message: '❌ [存在不可达节点] 节点 3 无法从源点收到信号 (dist[3] = ∞)，返回 -1！',
      log: '❌ 存在不可达孤立点，返回 -1',
      codeLine: 45,
    });
  }

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<DelayStep>({
  id: 'network-delay-time',
  name: '网络延迟时间 (Network Delay Time)',
  category: 'graph',
  icon: '📡',
  badge: {
    mode: 'Dijkstra 堆优化最短路',
    complexity: 'O((V + E) log V) · O(V + E)',
  },
  card1Title: '🌐 网络拓扑与广播信号传播沙盘',
  card2Title: '🧭 最短延迟 dist[u] 与优先队列监视器',
  card2Desc: '各节点到达延迟、Dijkstra 小根堆待扩展节点与全网广播耗时',
  legend: [
    { label: '未接收信号', color: '#334155' },
    { label: '📡 广播发射源', color: '#f59e0b' },
    { label: '🟢 已接收确认', color: '#10b981' },
    { label: '⚡ 当前探索节点', color: '#38bdf8' },
  ],
  inputs: [
    {
      id: 'input-network-case',
      label: '网络拓扑',
      type: 'select',
      defaultValue: 'reachable',
      options: [
        { label: '经典 4 节点全覆盖 (LeetCode 743)', value: 'reachable' },
        { label: '含孤立不可达节点 (-1)', value: 'unreachable' },
      ],
      width: '210px',
    },
  ],
  presets: [
    { label: '4 节点全连通 (ans=2)', values: { 'input-network-case': 'reachable' } },
    { label: '含孤立点 (ans=-1)', values: { 'input-network-case': 'unreachable' } },
  ],
  metrics: [
    { id: 'metric-cur-explore', label: '当前信号前沿', color: '#38bdf8' },
    { id: 'metric-max-delay', label: '当前全网最大延迟', color: '#10b981' },
    { id: 'metric-all-done', label: '全网收齐判定', color: '#f59e0b' },
  ],
  codeLanguages: NETWORK_DELAY_CODE_LANGUAGES,
  problemHtml: NETWORK_DELAY_PROBLEM_HTML,
  analysisHtml: NETWORK_DELAY_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const isReachable = (inputs['input-network-case'] || 'reachable') === 'reachable';
    return buildNetworkDelaySteps(isReachable);
  },
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      2: { x: 75, y: 110 },
      1: { x: 165, y: 55 },
      3: { x: 165, y: 165 },
      4: { x: 255, y: 110 },
    };

    const edges = [
      { u: 2, v: 1, w: 1 },
      { u: 2, v: 3, w: 1 },
      { u: 3, v: 4, w: 1 },
    ];

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const isReached = step.visitedList[e.v];

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${isReached ? '#10b981' : '#475569'}" stroke-width="${isReached ? 2.5 : 1.5}" marker-end="url(#arrow-${isReached ? 'green' : 'gray'})" />
            <rect x="${midX - 12}" y="${midY - 8}" width="24" height="14" rx="3" fill="#0f172a" fill-opacity="0.85" />
            <text x="${midX}" y="${midY + 3}" fill="${isReached ? '#34d399' : '#94a3b8'}" font-size="9" font-weight="700" font-family="monospace" text-anchor="middle">w:${e.w}</text>
          </g>
        `;
      })
      .join('');

    const nodes = [2, 1, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isSource = u === 2;
        const isVisited = step.visitedList[u];
        const isCur = step.curNode === u;
        const dist = step.distList[u];
        const distStr = dist === Infinity ? '∞' : String(dist);
        const bg = isCur ? '#0284c7' : isVisited ? '#065f46' : isSource ? '#f59e0b' : '#1e293b';
        const border = isCur ? '#38bdf8' : isVisited ? '#10b981' : '#64748b';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isCur || isVisited ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="${isVisited ? '#34d399' : '#94a3b8'}" font-size="9.5" font-weight="700" text-anchor="middle">d:${distStr}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 200">
          <defs>
            <marker id="arrow-green" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
            </marker>
            <marker id="arrow-gray" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
            </marker>
          </defs>
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🟢 绿色节点已确认接收信号 | 节点下方标注源点出发最短到达耗时 $d[u]$
        </div>
      </div>
    `;

    const root = container.closest('#algo-network-delay-time-view');
    if (root) {
      const curEl = root.querySelector('#metric-cur-explore');
      const maxEl = root.querySelector('#metric-max-delay');
      const doneEl = root.querySelector('#metric-all-done');

      if (curEl) curEl.textContent = `Node ${step.curNode}`;
      if (maxEl) maxEl.textContent = step.maxDelaySoFar === -1 ? '-1 (不可达)' : `${step.maxDelaySoFar} ms`;
      if (doneEl) {
        doneEl.textContent = step.isAllReached ? '✓ 全网收齐' : '信号传播中...';
        doneEl.style.color = step.isAllReached ? '#10b981' : '#d97706';
      }

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const pqItems = step.pqSnapshot.length > 0
          ? step.pqSnapshot.map((item) => `<span style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10px;">(N${item.u}, d:${item.d})</span>`).join(' ')
          : '<span style="color: #94a3b8; font-size: 10.5px;">(空)</span>';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>优先队列小根堆:</span>
              <div style="display: flex; gap: 4px;">${pqItems}</div>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 全网信号收齐公式:</span>
              <strong style="font-family: monospace; color: #2563eb;">ans = max(dist[1..n])</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'network-delay-time',
  name: '网络延迟时间 (Network Delay Time)',
  viewId: 'algo-network-delay-time-view',
  category: 'graph',
  description: '单源最短路径 Dijkstra 堆优化经典应用：信号广播向外扩散、全网收齐时间 max(dist[1..n])、不可达节点判定 (LeetCode 743)',
  icon: '📡',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 67,
  learningGoal: '掌握 Dijkstra 堆优化算法在广播时延模型中的应用、全网收齐时间计算及不可达判定',
});

export { Visualizer as NetworkDelayTimeVisualizer };
