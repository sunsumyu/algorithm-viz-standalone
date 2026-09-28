/**
 * 左程云算法通关课 Class 061: Bellman-Ford 最短路算法 (V-1 轮全边松弛)
 * 能够完美处理负权边，通过 n-1 轮全局松弛与提前收敛早停优化
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth & Bi-Version Synthesis)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_061_PROBLEMS } from './graph-061-problem-content';
import {
  BELLMAN_FORD_061_CODES,
  BELLMAN_FORD_061_LINES,
} from './graph-061-stage-codes';
import {
  Graph061StepBase,
  renderGraph061SvgTopology,
  renderGraph061DistGrid,
  Graph061NodeCoord,
} from './graph-061-shared';

export interface BellmanFordStep extends Graph061StepBase {
  nodes: Graph061NodeCoord[];
  edges: Array<{ from: number; to: number; w: number }>;
  dist: number[];
  round: number;
  maxRounds: number;
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
  { from: 0, to: 1, w: 6 },
  { from: 0, to: 2, w: 4 },
  { from: 1, to: 3, w: -2 }, // 负权边
  { from: 2, to: 1, w: -1 }, // 负权边
  { from: 2, to: 3, w: 3 },
  { from: 3, to: 4, w: 2 },
  { from: 1, to: 4, w: 5 },
];

export function buildBellmanFord061Steps(preset: string = 'negative_weight'): BellmanFordStep[] {
  const steps: BellmanFordStep[] = [];
  const lines = BELLMAN_FORD_061_LINES;

  let nodes = DEFAULT_NODES;
  let edges = DEFAULT_EDGES;

  if (preset === 'positive_simple') {
    nodes = [
      { id: 0, x: 80, y: 110, label: '0(源)' },
      { id: 1, x: 220, y: 60 },
      { id: 2, x: 220, y: 160 },
      { id: 3, x: 380, y: 110 },
    ];
    edges = [
      { from: 0, to: 1, w: 2 },
      { from: 0, to: 2, w: 5 },
      { from: 1, to: 2, w: 1 },
      { from: 1, to: 3, w: 4 },
      { from: 2, to: 3, w: 1 },
    ];
  }

  const n = nodes.length;
  const s = 0;
  const dist = new Array(n).fill(Infinity);
  dist[s] = 0;
  let relaxCount = 0;

  // 1. 初始化
  steps.push({
    nodes,
    edges,
    dist: [...dist],
    round: 0,
    maxRounds: n - 1,
    activeEdge: null,
    relaxCount: 0,
    decision: `1. 初始化 Bellman-Ford：源点 dist[${s}] = 0，其余全网顶点置为 ∞`,
    message: `准备开展至多 n - 1 = ${n - 1} 轮全边遍历松弛。Bellman-Ford 能自然处理负权边。`,
    log: `Init dist[${s}]=0, maxRounds=${n - 1}`,
    codeLine: lines.init,
    metrics: { '当前轮次': '0 / ' + (n - 1), '负权边支持': '是', '时间复杂度': 'O(V·E)' },
    statusBadge: { text: '初始化', type: 'info' },
  });

  // 2. V-1 轮松弛
  for (let k = 1; k < n; k++) {
    let updated = false;

    steps.push({
      nodes,
      edges,
      dist: [...dist],
      round: k,
      maxRounds: n - 1,
      activeEdge: null,
      relaxCount,
      decision: `第 ${k}/${n - 1} 轮松弛开始：依次遍历全部 ${edges.length} 条有向边`,
      message: `本轮将扫描所有边 (u, v, w)，若发现 dist[u] + w < dist[v] 则执行松弛。`,
      log: `Start round ${k}`,
      codeLine: lines.roundLoop,
      metrics: { '当前轮次': `${k} / ${n - 1}`, '已松弛次数': relaxCount },
      statusBadge: { text: `第 ${k} 轮`, type: 'info' },
    });

    for (const e of edges) {
      const { from: u, to: v, w } = e;
      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        const oldVal = dist[v];
        dist[v] = dist[u] + w;
        updated = true;
        relaxCount++;

        steps.push({
          nodes,
          edges,
          dist: [...dist],
          round: k,
          maxRounds: n - 1,
          activeEdge: { from: u, to: v },
          relaxCount,
          decision: `第 ${k} 轮松弛成功：边 (${u} ➔ ${v}, w=${w}) 使 dist[${v}] 由 ${oldVal === Infinity ? '∞' : oldVal} 缩短为 ${dist[v]}`,
          message: `三角不等式成立：dist[${u}](${dist[u]}) + ${w} < dist[${v}](${oldVal === Infinity ? '∞' : oldVal})，距离成功被更优路径更新！`,
          log: `Round ${k}: relax (${u}->${v}, w=${w}): dist[${v}]=${dist[v]}`,
          codeLine: lines.relaxEdge,
          metrics: { '松弛边': `${u}➔${v}`, '新距离': dist[v], '总松弛': relaxCount },
          statusBadge: { text: `松弛: ${u}➔${v}`, type: 'warning' },
        });
      }
    }

    if (!updated) {
      steps.push({
        nodes,
        edges,
        dist: [...dist],
        round: k,
        maxRounds: n - 1,
        activeEdge: null,
        relaxCount,
        decision: `早停优化触发：第 ${k} 轮全图边未发生任何距离更新，算法提前全局收敛！`,
        message: `在第 ${k} 轮中所有边均已满足三角不等式，后续无须再空转扫描，直接终止！`,
        log: `Round ${k}: early break triggered!`,
        codeLine: lines.earlyBreak,
        metrics: { '早停轮次': `${k} / ${n - 1}`, '总松弛次数': relaxCount, '状态': '提前收敛' },
        statusBadge: { text: '提前早停', type: 'success' },
      });
      break;
    }
  }

  // 终态
  steps.push({
    nodes,
    edges,
    dist: [...dist],
    round: n - 1,
    maxRounds: n - 1,
    activeEdge: null,
    relaxCount,
    decision: `Bellman-Ford 算法计算完成：成功获得源点到全网的最短距离`,
    message: `最终距离向量为 [${dist.map((x) => (x === Infinity ? '∞' : x)).join(', ')}]，能够稳健兼容负权边。`,
    log: `Bellman-Ford finished -> dist=[${dist.join(', ')}]`,
    codeLine: lines.returnDist,
    metrics: { '全局最短路': dist.join(', '), '总松弛': relaxCount, '耗费轮次': `${steps[steps.length - 1].round} 轮` },
    statusBadge: { text: '计算完成', type: 'success' },
  });

  return steps;
}

export const bellmanFord061Visualizer = registerDeclarativeAlgorithm<BellmanFordStep>({
  id: 'bellman-ford-061',
  aliases: ['bellman-ford', 'class061-code03'],
  name: 'Bellman-Ford 负权最短路算法 (Class 061)',
  category: 'graph',
  icon: '⚡',
  difficulty: 2,
  levelOrder: 6103,
  learningGoal: '理解 V-1 轮全边暴力松弛机理、负权边兼容性以及早停提前收敛优化',
  problemHtml: GRAPH_061_PROBLEMS.bellmanFord061.html,
  codeLanguages: BELLMAN_FORD_061_CODES,
  inputs: [
    {
      id: 'preset',
      label: '拓扑预设选择',
      type: 'select',
      defaultValue: 'negative_weight',
      options: [
        { label: '5 节点图 (含负权边有效松弛)', value: 'negative_weight' },
        { label: '4 节点图 (正权经典拓扑)', value: 'positive_simple' },
      ],
    },
  ],
  presets: [
    { label: '含负权边拓扑', values: { preset: 'negative_weight' } },
    { label: '正权标准拓扑', values: { preset: 'positive_simple' } },
  ],
  generateSteps: (inputs) => buildBellmanFord061Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 12px;">
        <div style="display: flex; gap: 16px; align-items: center; font-size: 11px; color: #475569; background: #f1f5f9; padding: 4px 12px; border-radius: 6px;">
          <span>轮次进度: <strong style="color: #6366f1;">${step.round} / ${step.maxRounds}</strong></span>
          <span>累计松弛: <strong style="color: #f59e0b;">${step.relaxCount} 次</strong></span>
        </div>
        ${renderGraph061SvgTopology(step.nodes, step.edges, {
          activeEdge: step.activeEdge,
          distMap: step.dist,
        })}
        ${renderGraph061DistGrid(step.dist, undefined, undefined, '全网节点距离表 dist[]')}
      </div>
    `;
  },
});
