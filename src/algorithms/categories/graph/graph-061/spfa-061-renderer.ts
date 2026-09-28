/**
 * 左程云算法通关课 Class 061: SPFA 算法 (Shortest Path Faster Algorithm · 队列优化的 Bellman-Ford)
 * 仅让距离发生缩短的顶点入队参与后续边松弛，平均时间复杂度接近 O(k·E)
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth & Bi-Version Synthesis)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_061_PROBLEMS } from './graph-061-problem-content';
import {
  SPFA_061_CODES,
  SPFA_061_LINES,
} from './graph-061-stage-codes';
import {
  Graph061StepBase,
  renderGraph061SvgTopology,
  renderGraph061DistGrid,
  Graph061NodeCoord,
} from './graph-061-shared';

export interface SpfaStep extends Graph061StepBase {
  nodes: Graph061NodeCoord[];
  edges: Array<{ from: number; to: number; w: number }>;
  dist: number[];
  inQueue: boolean[];
  queue: number[];
  curNode: number | null;
  activeEdge?: { from: number; to: number } | null;
  relaxCount: number;
}

const DEFAULT_NODES: Graph061NodeCoord[] = [
  { id: 0, x: 70, y: 110, label: '0(源)' },
  { id: 1, x: 200, y: 50 },
  { id: 2, x: 200, y: 170 },
  { id: 3, x: 330, y: 60 },
  { id: 4, x: 420, y: 140 },
];

const DEFAULT_EDGES = [
  { from: 0, to: 1, w: 2 },
  { from: 0, to: 2, w: 5 },
  { from: 1, to: 2, w: -2 }, // 负权边
  { from: 1, to: 3, w: 4 },
  { from: 2, to: 3, w: 3 },
  { from: 3, to: 4, w: 2 },
  { from: 2, to: 4, w: 7 },
];

export function buildSpfa061Steps(preset: string = 'negative_chain'): SpfaStep[] {
  const steps: SpfaStep[] = [];
  const lines = SPFA_061_LINES;

  let nodes = DEFAULT_NODES;
  let edges = DEFAULT_EDGES;

  if (preset === 'dense_positive') {
    nodes = [
      { id: 0, x: 80, y: 110, label: '0(源)' },
      { id: 1, x: 220, y: 60 },
      { id: 2, x: 220, y: 160 },
      { id: 3, x: 380, y: 110 },
    ];
    edges = [
      { from: 0, to: 1, w: 3 },
      { from: 0, to: 2, w: 4 },
      { from: 1, to: 2, w: 1 },
      { from: 1, to: 3, w: 5 },
      { from: 2, to: 3, w: 2 },
    ];
  }

  const n = nodes.length;
  const s = 0;
  const dist = new Array(n).fill(Infinity);
  const inQueue = new Array(n).fill(false);
  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n }, () => []);
  for (const e of edges) {
    adj[e.from].push({ to: e.to, w: e.w });
  }

  dist[s] = 0;
  const queue: number[] = [s];
  inQueue[s] = true;
  let relaxCount = 0;

  // 1. 初始化
  steps.push({
    nodes,
    edges,
    dist: [...dist],
    inQueue: [...inQueue],
    queue: [...queue],
    curNode: null,
    activeEdge: null,
    relaxCount: 0,
    decision: `1. 初始化 SPFA 队列：源点 ${s} 入队，dist[${s}] = 0，inQueue[${s}] = true`,
    message: `SPFA 核心思想：只有最短距离被更新的顶点，才有可能让它的邻居的最短距离发生缩短。`,
    log: `Init SPFA: q=[${s}], dist[${s}]=0`,
    codeLine: lines.init,
    metrics: { '队列长度': 1, '已松弛': 0, '平均复杂度': 'O(k·E)' },
    statusBadge: { text: '入队源点', type: 'info' },
  });

  // 2. 队列循环
  while (queue.length > 0) {
    const u = queue.shift()!;
    inQueue[u] = false;

    steps.push({
      nodes,
      edges,
      dist: [...dist],
      inQueue: [...inQueue],
      queue: [...queue],
      curNode: u,
      activeEdge: null,
      relaxCount,
      decision: `顶点 Node ${u} 出队 (inQueue[${u}] = false)，准备考察所有出边`,
      message: `顶点 ${u} 当前已知最短距离为 dist[${u}] = ${dist[u]}，即将对相邻顶点进行松弛。`,
      log: `Pop Node ${u}, inQueue=false`,
      codeLine: lines.pollNode,
      metrics: { '当前出队': `Node ${u}`, '当前距离': dist[u], '剩余排队': queue.length },
      statusBadge: { text: `出队: Node ${u}`, type: 'info' },
    });

    for (const { to: v, w } of adj[u]) {
      if (dist[u] + w < dist[v]) {
        const oldDist = dist[v];
        dist[v] = dist[u] + w;
        relaxCount++;

        let pushed = false;
        if (!inQueue[v]) {
          queue.push(v);
          inQueue[v] = true;
          pushed = true;
        }

        steps.push({
          nodes,
          edges,
          dist: [...dist],
          inQueue: [...inQueue],
          queue: [...queue],
          curNode: u,
          activeEdge: { from: u, to: v },
          relaxCount,
          decision: `成功松弛边 (${u} ➔ ${v}, w=${w})：dist[${v}] 由 ${oldDist === Infinity ? '∞' : oldDist} 降至 ${dist[v]}${pushed ? `，Node ${v} 重新入队` : ' (Node ' + v + ' 已在队中，无需重复入队)'}`,
          message: `三角不等式成立！${pushed ? `顶点 ${v} 获得更优距离后被重新激活入队。` : `顶点 ${v} 虽被缩短，但已在等待队列中，避免冗余入队。`}`,
          log: `Relax (${u}->${v}, w=${w}) dist[${v}]=${dist[v]}, pushed=${pushed}`,
          codeLine: pushed ? lines.pushQueue : lines.relaxEdge,
          metrics: { '松弛边': `${u}➔${v}`, '新距离': dist[v], '在队状态': pushed ? '新入队' : '已在队' },
          statusBadge: { text: `松弛: ${u}➔${v}`, type: 'warning' },
        });
      }
    }
  }

  // 终态
  steps.push({
    nodes,
    edges,
    dist: [...dist],
    inQueue: [...inQueue],
    queue: [],
    curNode: null,
    activeEdge: null,
    relaxCount,
    decision: `SPFA 算法运行完毕：等待队列已清空，全局最短路径成功计算`,
    message: `全部距离收敛，最终结果为 [${dist.map((x) => (x === Infinity ? '∞' : x)).join(', ')}]。`,
    log: `SPFA finished -> dist=[${dist.join(', ')}]`,
    codeLine: lines.returnDist,
    metrics: { '全局最短路': dist.join(', '), '总松弛次数': relaxCount, '算法状态': '已收敛' },
    statusBadge: { text: '计算完成', type: 'success' },
  });

  return steps;
}

export const spfa061Visualizer = registerDeclarativeAlgorithm<SpfaStep>({
  id: 'spfa-061',
  aliases: ['spfa', 'class061-code04', 'shortest-path-faster-algorithm'],
  name: 'SPFA 队列优化最短路算法 (Class 061)',
  category: 'graph',
  icon: '⚡',
  difficulty: 2,
  levelOrder: 6104,
  learningGoal: '理解队列动态更新准则、inQueue 去重标记机制以及负权图快速收敛机制',
  problemHtml: GRAPH_061_PROBLEMS.spfa061.html,
  codeLanguages: SPFA_061_CODES,
  inputs: [
    {
      id: 'preset',
      label: '拓扑预设选择',
      type: 'select',
      defaultValue: 'negative_chain',
      options: [
        { label: '5 节点图 (含负权缩短更新)', value: 'negative_chain' },
        { label: '4 节点图 (稠密正权)', value: 'dense_positive' },
      ],
    },
  ],
  presets: [
    { label: '含负权边拓扑', values: { preset: 'negative_chain' } },
    { label: '稠密正权拓扑', values: { preset: 'dense_positive' } },
  ],
  generateSteps: (inputs) => buildSpfa061Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    const queuePills = step.queue.length > 0
      ? step.queue.map((node) => `<span style="padding: 2px 8px; background: #3b82f6; color: #ffffff; border-radius: 4px; font-weight: 700; font-size: 11px;">Node ${node}</span>`).join(' ➔ ')
      : '<span style="color: #94a3b8; font-size: 11px;">队列为空</span>';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 12px;">
        <div style="display: flex; gap: 12px; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 14px; border-radius: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: #475569;">SPFA 待松弛队列 [Front ➔ Rear]:</span>
          <div style="display: flex; gap: 6px; align-items: center;">${queuePills}</div>
        </div>
        ${renderGraph061SvgTopology(step.nodes, step.edges, {
          currentNode: step.curNode,
          activeEdge: step.activeEdge,
          distMap: step.dist,
        })}
        ${renderGraph061DistGrid(step.dist, step.inQueue, step.curNode, '全网节点距离表 dist[] (绿色代表当前在队中)')}
      </div>
    `;
  },
});
