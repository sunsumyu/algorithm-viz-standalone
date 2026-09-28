/**
 * 左程云算法通关课 Class 060: 最大食物链计数 (洛谷 P4017 · DAG 路径动态规划)
 * 统计从入度为 0 的生产者到出度为 0 的消费者的全局食物链总数，模 80112002
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth & Bi-Version Synthesis)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_060_PROBLEMS } from './graph-060-problem-content';
import {
  FOOD_CHAIN_060_CODES,
  FOOD_CHAIN_060_LINES,
} from './graph-060-stage-codes';
import {
  Graph060StepBase,
  renderGraph060SvgTopology,
  renderGraph060InDegreeGrid,
  renderGraph060QueuePills,
  Graph060NodeCoord,
} from './graph-060-shared';

export interface FoodChainStep extends Graph060StepBase {
  nodes: Graph060NodeCoord[];
  edges: Array<{ from: number; to: number }>;
  inDegree: number[];
  outDegree: number[];
  lines: number[];
  queue: number[];
  curNode: number | null;
  activeEdge?: { from: number; to: number } | null;
  processed: boolean[];
  total: number;
}

const DEFAULT_NODES: Graph060NodeCoord[] = [
  { id: 1, x: 70, y: 110, label: '1:水稻' },
  { id: 2, x: 200, y: 50, label: '2:田鼠' },
  { id: 3, x: 200, y: 170, label: '3:蝗虫' },
  { id: 4, x: 330, y: 110, label: '4:蛇' },
  { id: 5, x: 440, y: 110, label: '5:老鹰' },
];

const DEFAULT_EDGES = [
  { from: 1, to: 2 },
  { from: 1, to: 3 },
  { from: 2, to: 4 },
  { from: 3, to: 4 },
  { from: 4, to: 5 },
  { from: 2, to: 5 },
];

export function buildFoodChain060Steps(preset: string = 'classic_ecosystem'): FoodChainStep[] {
  const steps: FoodChainStep[] = [];
  const linesCode = FOOD_CHAIN_060_LINES;
  const MOD = 80112002;

  let nodes = DEFAULT_NODES;
  let edges = DEFAULT_EDGES;

  if (preset === 'multi_producer') {
    nodes = [
      { id: 1, x: 70, y: 60, label: '1:浮游植物' },
      { id: 2, x: 70, y: 160, label: '2:水草' },
      { id: 3, x: 230, y: 60, label: '3:浮游动物' },
      { id: 4, x: 230, y: 160, label: '4:草食鱼' },
      { id: 5, x: 400, y: 110, label: '5:肉食大鱼' },
    ];
    edges = [
      { from: 1, to: 3 },
      { from: 2, to: 4 },
      { from: 3, to: 5 },
      { from: 4, to: 5 },
    ];
  }

  const n = nodes.length;
  const inDegree = new Array(n + 1).fill(0);
  const outDegree = new Array(n + 1).fill(0);
  const lines = new Array(n + 1).fill(0);
  const processed = new Array(n + 1).fill(false);
  const adj: Array<Array<number>> = Array.from({ length: n + 1 }, () => []);

  for (const e of edges) {
    adj[e.from].push(e.to);
    outDegree[e.from]++;
    inDegree[e.to]++;
  }

  // 1. 初始化
  steps.push({
    nodes,
    edges,
    inDegree: [...inDegree],
    outDegree: [...outDegree],
    lines: [...lines],
    queue: [],
    curNode: null,
    activeEdge: null,
    processed: [...processed],
    total: 0,
    decision: `1. 初始化食物网：统计全部生物顶点的入度与出度`,
    message: `入度为 0 表示顶级生产者，出度为 0 表示顶级消费者，中间节点构成营养流动级联。`,
    log: `Init food web: n=${n}, m=${edges.length}`,
    codeLine: linesCode.init,
    metrics: { '生物总数': n, '捕食关系': edges.length, '模数': MOD },
    statusBadge: { text: '建图完成', type: 'info' },
  });

  // 2. 生产者入队
  const queue: number[] = [];
  for (let i = 1; i <= n; i++) {
    if (inDegree[i] === 0) {
      lines[i] = 1;
      queue.push(i);
    }
  }

  steps.push({
    nodes,
    edges,
    inDegree: [...inDegree],
    outDegree: [...outDegree],
    lines: [...lines],
    queue: [...queue],
    curNode: null,
    activeEdge: null,
    processed: [...processed],
    total: 0,
    decision: `生产者初始化：入度为 0 的生物（[${queue.join(', ')}]）初始食物链计数 lines 置为 1 并入队`,
    message: `生产者是所有食物链的起点，为后续拓扑序动态规划累加提供基底路径。`,
    log: `Push producers to queue: [${queue.join(', ')}]`,
    codeLine: linesCode.findZeroIn,
    metrics: { '就绪生产者': queue.length, '当前总链数': 0 },
    statusBadge: { text: '生产者就绪', type: 'info' },
  });

  let total = 0;

  // 3. 拓扑排序累加
  while (queue.length > 0) {
    const u = queue.shift()!;
    processed[u] = true;

    steps.push({
      nodes,
      edges,
      inDegree: [...inDegree],
      outDegree: [...outDegree],
      lines: [...lines],
      queue: [...queue],
      curNode: u,
      activeEdge: null,
      processed: [...processed],
      total,
      decision: `Node ${u} 出队：当前生物已有累积到达路径 lines[${u}] = ${lines[u]} 条`,
      message: outDegree[u] === 0 ? `该节点出度为 0，是顶级消费者，将 lines[${u}] 累加至答案！` : `准备将 lines[${u}] 转移累加至其所有捕食者。`,
      log: `Poll Node ${u}, lines=${lines[u]}, outDeg=${outDegree[u]}`,
      codeLine: linesCode.pollNode,
      metrics: { '出队生物': `Node ${u}`, '到达路径数': lines[u], '剩余队列': queue.length },
      statusBadge: { text: `考察: Node ${u}`, type: 'info' },
    });

    if (outDegree[u] === 0) {
      total = (total + lines[u]) % MOD;
      steps.push({
        nodes,
        edges,
        inDegree: [...inDegree],
        outDegree: [...outDegree],
        lines: [...lines],
        queue: [...queue],
        curNode: u,
        activeEdge: null,
        processed: [...processed],
        total,
        decision: `顶级消费者命中：Node ${u} 出度为 0，将 lines[${u}](${lines[u]}) 计入完整食物链总数，total = ${total}`,
        message: `从生产者到 Node ${u} 形成完整封闭食物链！`,
        log: `Accumulate consumer Node ${u}: total=${total}`,
        codeLine: linesCode.accumulateConsumer,
        metrics: { '累计食物链': total, '终极消费者': `Node ${u}` },
        statusBadge: { text: `消费终端 +${lines[u]}`, type: 'success' },
      });
    }

    for (const v of adj[u]) {
      const oldLines = lines[v];
      lines[v] = (lines[v] + lines[u]) % MOD;
      inDegree[v]--;
      const pushed = inDegree[v] === 0;
      if (pushed) queue.push(v);

      steps.push({
        nodes,
        edges,
        inDegree: [...inDegree],
        outDegree: [...outDegree],
        lines: [...lines],
        queue: [...queue],
        curNode: u,
        activeEdge: { from: u, to: v },
        processed: [...processed],
        total,
        decision: `营养级传递 (${u} ➔ ${v})：捕食者 Node ${v} 的食物链数由 ${oldLines} 增至 ${lines[v]}${pushed ? `，且 inDegree 归零进入队列！` : ''}`,
        message: `状态转移：lines[${v}] = (lines[${v}] + lines[${u}]) % MOD。`,
        log: `Relax (${u}->${v}): lines[${v}]=${lines[v]}, inDeg[${v}]=${inDegree[v]}`,
        codeLine: pushed ? linesCode.pushQueue : linesCode.relaxEdge,
        metrics: { '被捕食关系': `${u} ➔ ${v}`, '新链数': lines[v], '剩余入度': inDegree[v] },
        statusBadge: { text: `传递: ${u}➔${v}`, type: 'warning' },
      });
    }
  }

  // 4. 终态
  steps.push({
    nodes,
    edges,
    inDegree: [...inDegree],
    outDegree: [...outDegree],
    lines: [...lines],
    queue: [],
    curNode: null,
    activeEdge: null,
    processed: [...processed],
    total,
    decision: `食物链拓扑统计完毕：全网完整食物链总数 = ${total}`,
    message: `全部有向路径均已根据无后效性拓扑序完成准确计数并输出。`,
    log: `Food chain count finished, total=${total}`,
    codeLine: linesCode.returnTotal,
    metrics: { '最终答案': total, '模数': MOD, '算法状态': '100% 收敛' },
    statusBadge: { text: '计算完成', type: 'success' },
  });

  return steps;
}

export const foodChain060Visualizer = registerDeclarativeAlgorithm<FoodChainStep>({
  id: 'food-chain-060',
  aliases: ['food-chain', 'luogu-p4017', 'class060-code01'],
  name: '最大食物链计数 (洛谷 P4017) (Class 060)',
  category: 'graph',
  icon: '🌱',
  difficulty: 2,
  levelOrder: 6001,
  learningGoal: '掌握 DAG 拓扑排序消除后效性机理、路径条数累加转移方程与出度为 0 终端结算',
  problemHtml: GRAPH_060_PROBLEMS.foodChain060.html,
  codeLanguages: FOOD_CHAIN_060_CODES,
  inputs: [
    {
      id: 'preset',
      label: '生态网拓扑选择',
      type: 'select',
      defaultValue: 'classic_ecosystem',
      options: [
        { label: '5 生物经典陆地生态网 (水稻/田鼠/蝗虫/蛇/老鹰)', value: 'classic_ecosystem' },
        { label: '5 生物双生产者水生网 (浮游植物/水草/大鱼)', value: 'multi_producer' },
      ],
    },
  ],
  presets: [
    { label: '陆地生态网', values: { preset: 'classic_ecosystem' } },
    { label: '水生生态网', values: { preset: 'multi_producer' } },
  ],
  generateSteps: (inputs) => buildFoodChain060Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 10px;">
        <div style="display: flex; gap: 16px; align-items: center; font-size: 11px; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 14px; border-radius: 6px;">
          <span>当前完整食物链总数: <strong style="color: #10b981; font-size: 13px;">${step.total}</strong></span>
          <span>待拓展队列: <strong>${step.queue.length}</strong></span>
        </div>
        ${renderGraph060SvgTopology(step.nodes, step.edges, {
          currentNode: step.curNode,
          inQueueNodes: step.queue,
          processedNodes: step.processed,
          activeEdge: step.activeEdge,
          nodeValues: step.lines,
          valueLabel: '链数',
        })}
        <div style="display: flex; gap: 10px; width: 100%; max-width: 500px; flex-direction: column;">
          ${renderGraph060InDegreeGrid(step.inDegree.slice(1), step.curNode !== null ? step.curNode - 1 : null, undefined, '生物入度表 inDegree (归零即解除依赖)')}
          ${renderGraph060QueuePills(step.queue, '入度为 0 待处理队列')}
        </div>
      </div>
    `;
  },
});
