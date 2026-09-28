/**
 * 左程云算法通关课 Class 061: 负权环判定算法 (洛谷 P3385 · SPFA 计数法)
 * 记录每个节点最短路径所包含的边数 count[v]，若 count[v] >= n 则判定存在负权环
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth & Bi-Version Synthesis)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_061_PROBLEMS } from './graph-061-problem-content';
import {
  NEGATIVE_CYCLE_061_CODES,
  NEGATIVE_CYCLE_061_LINES,
} from './graph-061-stage-codes';
import {
  Graph061StepBase,
  renderGraph061SvgTopology,
  Graph061NodeCoord,
} from './graph-061-shared';

export interface NegativeCycleStep extends Graph061StepBase {
  nodes: Graph061NodeCoord[];
  edges: Array<{ from: number; to: number; w: number }>;
  dist: number[];
  count: number[];
  inQueue: boolean[];
  queue: number[];
  curNode: number | null;
  activeEdge?: { from: number; to: number } | null;
  hasCycle: boolean;
}

const DEFAULT_NODES: Graph061NodeCoord[] = [
  { id: 0, x: 80, y: 110, label: '0(源)' },
  { id: 1, x: 200, y: 60, label: '1' },
  { id: 2, x: 340, y: 60, label: '2' },
  { id: 3, x: 270, y: 170, label: '3' },
];

// 包含负权环: 1 -> 2 -> 3 -> 1 权值和: 2 + (-4) + (-1) = -3 < 0
const CYCLE_EDGES = [
  { from: 0, to: 1, w: 1 },
  { from: 1, to: 2, w: 2 },
  { from: 2, to: 3, w: -4 },
  { from: 3, to: 1, w: -1 },
];

const NO_CYCLE_EDGES = [
  { from: 0, to: 1, w: 3 },
  { from: 1, to: 2, w: -1 },
  { from: 2, to: 3, w: 2 },
  { from: 3, to: 1, w: 4 },
];

function renderNegativeCycleGrid(dist: number[], count: number[], n: number, inQueue: boolean[], curNode: number | null): string {
  const cards = dist.map((d, idx) => {
    const isCur = curNode === idx;
    const cnt = count[idx];
    const isDanger = cnt >= n;

    const bg = isDanger ? '#fee2e2' : isCur ? '#fef3c7' : '#ffffff';
    const border = isDanger ? '2px solid #ef4444' : isCur ? '2px solid #f59e0b' : '1px solid #cbd5e1';
    const textCol = isDanger ? '#dc2626' : isCur ? '#b45309' : '#1e293b';

    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 68px; padding: 4px 6px; background: ${bg}; border: ${border}; border-radius: 6px; box-sizing: border-box;">
        <span style="font-size: 10px; color: #64748b;">Node ${idx}</span>
        <span style="font-size: 12px; font-weight: 800; color: ${textCol}; font-family: monospace;">d: ${d === Infinity ? '∞' : d}</span>
        <span style="font-size: 9px; font-weight: 700; color: ${isDanger ? '#ef4444' : '#6366f1'}; font-family: monospace;">边数: ${cnt} / ${n}</span>
      </div>
    `;
  }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 4px; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; max-width: 500px; box-sizing: border-box;">
      <span style="font-size: 11px; font-weight: 700; color: #475569;">距离与入队边数监控 (count[v] ≥ ${n} 即判定负权环):</span>
      <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">${cards}</div>
    </div>
  `;
}

export function buildNegativeCycle061Steps(preset: string = 'has_cycle'): NegativeCycleStep[] {
  const steps: NegativeCycleStep[] = [];
  const lines = NEGATIVE_CYCLE_061_LINES;

  const nodes = DEFAULT_NODES;
  const edges = preset === 'no_cycle' ? NO_CYCLE_EDGES : CYCLE_EDGES;
  const n = nodes.length;

  const dist = new Array(n).fill(0);
  const count = new Array(n).fill(0);
  const inQueue = new Array(n).fill(true);
  const queue = Array.from({ length: n }, (_, i) => i);

  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n }, () => []);
  for (const e of edges) {
    adj[e.from].push({ to: e.to, w: e.w });
  }

  // 1. 初始化
  steps.push({
    nodes,
    edges,
    dist: [...dist],
    count: [...count],
    inQueue: [...inQueue],
    queue: [...queue],
    curNode: null,
    activeEdge: null,
    hasCycle: false,
    decision: `1. 初始化负环判定：全量顶点 0..${n - 1} 悉数入队，超级源点距离全部置为 0`,
    message: `为防止图不连通漏判负环，将所有顶点初始化入队并赋初始距离 0。`,
    log: `Init negative cycle detection (n=${n})`,
    codeLine: lines.init,
    metrics: { '初始队列': `0..${n - 1}`, '判环阈值': `count >= ${n}`, '状态': '检测中' },
    statusBadge: { text: '全节点入队', type: 'info' },
  });

  let detected = false;

  // 2. 队列循环
  while (queue.length > 0) {
    const u = queue.shift()!;
    inQueue[u] = false;

    steps.push({
      nodes,
      edges,
      dist: [...dist],
      count: [...count],
      inQueue: [...inQueue],
      queue: [...queue],
      curNode: u,
      activeEdge: null,
      hasCycle: false,
      decision: `Node ${u} 出队 (inQueue[${u}] = false)，展开邻边松弛与深度检测`,
      message: `顶点 ${u} 当前松弛步数 count[${u}] = ${count[u]}。`,
      log: `Pop Node ${u}`,
      codeLine: lines.pollNode,
      metrics: { '当前出队': `Node ${u}`, '步数': count[u], '队列剩余': queue.length },
      statusBadge: { text: `出队: Node ${u}`, type: 'info' },
    });

    for (const { to: v, w } of adj[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        count[v] = count[u] + 1;

        if (count[v] >= n) {
          detected = true;
          steps.push({
            nodes,
            edges,
            dist: [...dist],
            count: [...count],
            inQueue: [...inQueue],
            queue: [...queue],
            curNode: u,
            activeEdge: { from: u, to: v },
            hasCycle: true,
            decision: `🚨 负权环警报触发！顶点 Node ${v} 的松弛边数 count[${v}] = ${count[v]} ≥ ${n}！`,
            message: `根据鸽巢原理，在包含 ${n} 个顶点的简单路径上至多只有 ${n - 1} 条边。出现第 ${n} 条松弛边必定存在环路，且距离持续变小，即存在负权环！`,
            log: `Negative cycle detected at Node ${v}: count=${count[v]} >= ${n}`,
            codeLine: lines.detectCycle,
            metrics: { '检测结果': '存在负权环', '越界顶点': `Node ${v}`, '松弛边数': `${count[v]} >= ${n}` },
            statusBadge: { text: '🚨 发现负权环', type: 'danger' },
          });
          break;
        }

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
          count: [...count],
          inQueue: [...inQueue],
          queue: [...queue],
          curNode: u,
          activeEdge: { from: u, to: v },
          hasCycle: false,
          decision: `松弛边 (${u} ➔ ${v}, w=${w})：dist[${v}] = ${dist[v]}, 边数 count[${v}] 更新为 ${count[v]}`,
          message: `count[${v}] = ${count[v]} < ${n}，尚未达到环判定阈值。`,
          log: `Relax (${u}->${v}, w=${w}): dist=${dist[v]}, count=${count[v]}`,
          codeLine: lines.relaxEdge,
          metrics: { '松弛边': `${u}➔${v}`, '最新边数': `${count[v]}/${n}`, '入队状态': pushed ? '已入队' : '队内' },
          statusBadge: { text: `松弛: ${u}➔${v}`, type: 'warning' },
        });
      }
    }

    if (detected) break;
  }

  // 3. 终态
  if (!detected) {
    steps.push({
      nodes,
      edges,
      dist: [...dist],
      count: [...count],
      inQueue: [...inQueue],
      queue: [],
      curNode: null,
      activeEdge: null,
      hasCycle: false,
      decision: `负权环检测完毕：队列清空且全图任意顶点 count 均未达到 ${n}，判定无负权环！`,
      message: `所有顶点的最短路径均为简单路径，算法安全收敛并输出 false。`,
      log: `Negative cycle detection finished: NO negative cycle`,
      codeLine: lines.returnResult,
      metrics: { '检测结果': '无负权环', '算法判定': '安全 (false)', '全网收敛': '是' },
      statusBadge: { text: '无负权环', type: 'success' },
    });
  }

  return steps;
}

export const negativeCycle061Visualizer = registerDeclarativeAlgorithm<NegativeCycleStep>({
  id: 'negative-cycle-061',
  aliases: ['negative-cycle', 'luogu-p3385', 'class061-code06'],
  name: '负权环判定算法 (洛谷 P3385 · SPFA 计数) (Class 061)',
  category: 'graph',
  icon: '🔄',
  difficulty: 3,
  levelOrder: 6106,
  learningGoal: '理解超级源点初始化、鸽巢原理以及 count[v] >= n 判定负权环的数学本质',
  problemHtml: GRAPH_061_PROBLEMS.negativeCycle061.html,
  codeLanguages: NEGATIVE_CYCLE_061_CODES,
  inputs: [
    {
      id: 'preset',
      label: '拓扑预设选择',
      type: 'select',
      defaultValue: 'has_cycle',
      options: [
        { label: '含负权环图 (1➔2➔3➔1 权值和 -3)', value: 'has_cycle' },
        { label: '无负权环图 (含负权边但无负环)', value: 'no_cycle' },
      ],
    },
  ],
  presets: [
    { label: '含负权环拓扑', values: { preset: 'has_cycle' } },
    { label: '无负权环拓扑', values: { preset: 'no_cycle' } },
  ],
  generateSteps: (inputs) => buildNegativeCycle061Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 12px;">
        <div style="display: flex; gap: 16px; align-items: center; font-size: 11px; color: #475569; background: ${step.hasCycle ? '#fee2e2' : '#f8fafc'}; border: 1px solid ${step.hasCycle ? '#f87171' : '#e2e8f0'}; padding: 6px 14px; border-radius: 6px;">
          <span>判定状态: <strong style="color: ${step.hasCycle ? '#dc2626' : '#10b981'};">${step.hasCycle ? '🚨 检测到负权环 (count ≥ n)' : '暂未发现负环'}</strong></span>
          <span>待检测队列长度: <strong>${step.queue.length}</strong></span>
        </div>
        ${renderGraph061SvgTopology(step.nodes, step.edges, {
          currentNode: step.curNode ?? undefined,
          activeEdge: step.activeEdge,
          distMap: step.dist,
        })}
        ${renderNegativeCycleGrid(step.dist, step.count, step.nodes.length, step.inQueue, step.curNode)}
      </div>
    `;
  },
});
