/**
 * 左程云算法通关课 Class 060: 并行课程 III (LeetCode 2050 · DAG 关键路径 CPM)
 * 求所有课程并行开展情况下的全局最早完工总月份数，状态转移：cost[v] = max(cost[v], cost[u] + time[v])
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth & Bi-Version Synthesis)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_060_PROBLEMS } from './graph-060-problem-content';
import {
  PARALLEL_COURSES_060_CODES,
  PARALLEL_COURSES_060_LINES,
} from './graph-060-stage-codes';
import {
  Graph060StepBase,
  renderGraph060SvgTopology,
  renderGraph060InDegreeGrid,
  renderGraph060QueuePills,
  Graph060NodeCoord,
} from './graph-060-shared';

export interface ParallelCoursesStep extends Graph060StepBase {
  nodes: Graph060NodeCoord[];
  edges: Array<{ from: number; to: number; w?: number }>;
  inDegree: number[];
  cost: number[];
  time: number[];
  queue: number[];
  curNode: number | null;
  activeEdge?: { from: number; to: number } | null;
  processed: boolean[];
  total: number;
}

const DEFAULT_NODES: Graph060NodeCoord[] = [
  { id: 1, x: 70, y: 110, label: 'C1' },
  { id: 2, x: 190, y: 50, label: 'C2' },
  { id: 3, x: 190, y: 170, label: 'C3' },
  { id: 4, x: 320, y: 110, label: 'C4' },
  { id: 5, x: 440, y: 110, label: 'C5' },
];

const DEFAULT_RELATIONS = [
  { from: 1, to: 2 },
  { from: 1, to: 3 },
  { from: 2, to: 4 },
  { from: 3, to: 4 },
  { from: 4, to: 5 },
];

const DEFAULT_TIME = [3, 2, 5, 2, 4]; // 1-indexed: c1:3, c2:2, c3:5, c4:2, c5:4

function renderCourseCostGrid(cost: number[], time: number[], curNode: number | null): string {
  const cards = time.map((t, idx) => {
    const courseId = idx + 1;
    const isCur = curNode === courseId;
    const c = cost[courseId];

    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 62px; padding: 4px 6px; background: ${isCur ? '#fef3c7' : '#ffffff'}; border: ${isCur ? '2px solid #f59e0b' : '1px solid #cbd5e1'}; border-radius: 6px; box-sizing: border-box;">
        <span style="font-size: 9px; color: #64748b;">课程 ${courseId} (需${t}月)</span>
        <span style="font-size: 12px; font-weight: 800; color: #6366f1; font-family: monospace;">完工: ${c === 0 ? '-' : `${c}月`}</span>
      </div>
    `;
  }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 4px; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; max-width: 500px; box-sizing: border-box;">
      <span style="font-size: 11px; font-weight: 700; color: #475569;">各课程最早完工用时表 cost[]:</span>
      <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">${cards}</div>
    </div>
  `;
}

export function buildParallelCourses060Steps(preset: string = 'classic_5courses'): ParallelCoursesStep[] {
  const steps: ParallelCoursesStep[] = [];
  const linesCode = PARALLEL_COURSES_060_LINES;

  let nodes = DEFAULT_NODES;
  let edges = DEFAULT_RELATIONS;
  let time = DEFAULT_TIME;

  if (preset === 'diamond_4courses') {
    nodes = [
      { id: 1, x: 80, y: 110, label: 'C1' },
      { id: 2, x: 230, y: 50, label: 'C2' },
      { id: 3, x: 230, y: 170, label: 'C3' },
      { id: 4, x: 380, y: 110, label: 'C4' },
    ];
    edges = [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 4 },
      { from: 3, to: 4 },
    ];
    time = [2, 3, 4, 1];
  }

  const n = nodes.length;
  const inDegree = new Array(n + 1).fill(0);
  const cost = new Array(n + 1).fill(0);
  const processed = new Array(n + 1).fill(false);
  const adj: Array<Array<number>> = Array.from({ length: n + 1 }, () => []);

  for (const e of edges) {
    adj[e.from].push(e.to);
    inDegree[e.to]++;
  }

  // 1. 初始化
  steps.push({
    nodes,
    edges,
    inDegree: [...inDegree],
    cost: [...cost],
    time,
    queue: [],
    curNode: null,
    activeEdge: null,
    processed: [...processed],
    total: 0,
    decision: `1. 初始化课程依赖 DAG：统计每门课程的先修依赖入度`,
    message: `无先修限制的课程（入度为 0）可于第 0 月立即并行开课，其完成时间为其自身学习月份。`,
    log: `Init parallel courses: n=${n}, relations=${edges.length}`,
    codeLine: linesCode.init,
    metrics: { '课程数': n, '依赖边数': edges.length },
    statusBadge: { text: '建图完成', type: 'info' },
  });

  // 2. 初始零入度课程入队
  const queue: number[] = [];
  for (let i = 1; i <= n; i++) {
    if (inDegree[i] === 0) {
      cost[i] = time[i - 1];
      queue.push(i);
    }
  }

  steps.push({
    nodes,
    edges,
    inDegree: [...inDegree],
    cost: [...cost],
    time,
    queue: [...queue],
    curNode: null,
    activeEdge: null,
    processed: [...processed],
    total: 0,
    decision: `首批课程并行开跑：课程 [${queue.join(', ')}] 无先修限制，cost[i] = time[i] 并入队`,
    message: `初始完成时间直接等于该门课所需课时。`,
    log: `Zero-in-degree courses start: [${queue.join(', ')}]`,
    codeLine: linesCode.findZeroIn,
    metrics: { '首批并行课': queue.length, '开课列表': queue.join(', ') },
    statusBadge: { text: '首批开课', type: 'info' },
  });

  let total = 0;

  // 3. 拓扑排序更新关键路径
  while (queue.length > 0) {
    const u = queue.shift()!;
    processed[u] = true;
    total = Math.max(total, cost[u]);

    steps.push({
      nodes,
      edges,
      inDegree: [...inDegree],
      cost: [...cost],
      time,
      queue: [...queue],
      curNode: u,
      activeEdge: null,
      processed: [...processed],
      total,
      decision: `课程 C${u} 修完出队：该课程于第 ${cost[u]} 月结课，当前全局最长路径耗时更新为 ${total} 月`,
      message: `即将向下游后继课程宣告完工，推动后继课程尽早达到开课条件。`,
      log: `Poll C${u}: cost=${cost[u]}, globalMax=${total}`,
      codeLine: linesCode.pollNode,
      metrics: { '当前结课': `课程 C${u}`, '结课时间': `${cost[u]} 月`, '全局最大': `${total} 月` },
      statusBadge: { text: `结课: C${u}`, type: 'info' },
    });

    for (const v of adj[u]) {
      const oldCost = cost[v];
      const candidate = cost[u] + time[v - 1];
      if (candidate > cost[v]) {
        cost[v] = candidate;
      }
      inDegree[v]--;
      const pushed = inDegree[v] === 0;
      if (pushed) queue.push(v);

      steps.push({
        nodes,
        edges,
        inDegree: [...inDegree],
        cost: [...cost],
        time,
        queue: [...queue],
        curNode: u,
        activeEdge: { from: u, to: v },
        processed: [...processed],
        total,
        decision: `先修约束推进 (C${u} ➔ C${v})：后继课程 C${v} 必须等待先修 C${u} 结课，最早结课时间更新为 ${cost[v]} 月${pushed ? `，全部先修已满足，C${v} 正式开课入队！` : ` (尚有 ${inDegree[v]} 门先修未完)`}`,
        message: `状态转移：cost[C${v}] = max(cost[C${v}], cost[C${u}](${cost[u]}) + time[C${v}](${time[v - 1]})) = ${cost[v]}。`,
        log: `Relax relation (C${u}->C${v}): cost[C${v}]=${cost[v]}, inDeg=${inDegree[v]}`,
        codeLine: pushed ? linesCode.pushQueue : linesCode.relaxCost,
        metrics: { '依赖边': `C${u} ➔ C${v}`, '更新完工用时': `${cost[v]} 月`, '剩余依赖': inDegree[v] },
        statusBadge: { text: pushed ? `C${v} 就绪开课` : `等待前驱`, type: pushed ? 'success' : 'warning' },
      });
    }
  }

  // 4. 终态
  steps.push({
    nodes,
    edges,
    inDegree: [...inDegree],
    cost: [...cost],
    time,
    queue: [],
    curNode: null,
    activeEdge: null,
    processed: [...processed],
    total,
    decision: `关键路径 (CPM) 计算完毕：修完全部课程所需最少月份数 = ${total} 月`,
    message: `由于并行化最优安排，瓶颈取决于 DAG 的关键路径长度，最终答案为 ${total}。`,
    log: `Parallel courses finished: total=${total}`,
    codeLine: linesCode.returnTotal,
    metrics: { '最终答案': `${total} 月`, '算法模型': '关键路径 CPM', '状态': '已收敛' },
    statusBadge: { text: '计算完成', type: 'success' },
  });

  return steps;
}

export const parallelCourses060Visualizer = registerDeclarativeAlgorithm<ParallelCoursesStep>({
  id: 'parallel-courses-iii-060',
  aliases: ['parallel-courses-iii', 'leetcode-2050', 'class060-code03', 'topo-dp-cpm'],
  name: '并行课程 III (LeetCode 2050 · DAG 关键路径 CPM) (Class 060)',
  category: 'graph',
  icon: '⏱️',
  difficulty: 3,
  levelOrder: 6003,
  learningGoal: '掌握 DAG 关键路径最长路动态规划方程、并行化前驱瓶颈分析与拓扑更新准则',
  problemHtml: GRAPH_060_PROBLEMS.parallelCourses060.html,
  codeLanguages: PARALLEL_COURSES_060_CODES,
  inputs: [
    {
      id: 'preset',
      label: '课程拓扑图选择',
      type: 'select',
      defaultValue: 'classic_5courses',
      options: [
        { label: '5 门课程经典依赖图 (带汇聚关键瓶颈路径)', value: 'classic_5courses' },
        { label: '4 门课程菱形并行图 (双路并行对比)', value: 'diamond_4courses' },
      ],
    },
  ],
  presets: [
    { label: '5 门课程依赖图', values: { preset: 'classic_5courses' } },
    { label: '4 门课程菱形图', values: { preset: 'diamond_4courses' } },
  ],
  generateSteps: (inputs) => buildParallelCourses060Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 10px;">
        <div style="display: flex; gap: 16px; align-items: center; font-size: 11px; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 14px; border-radius: 6px;">
          <span>当前全局最长路径用时: <strong style="color: #6366f1; font-size: 13px;">${step.total} 月</strong></span>
          <span>当前开课队列: <strong>${step.queue.length}</strong></span>
        </div>
        ${renderGraph060SvgTopology(step.nodes, step.edges, {
          currentNode: step.curNode,
          inQueueNodes: step.queue,
          processedNodes: step.processed,
          activeEdge: step.activeEdge,
          nodeValues: step.cost,
          valueLabel: '完工',
        })}
        <div style="display: flex; gap: 10px; width: 100%; max-width: 500px; flex-direction: column;">
          ${renderCourseCostGrid(step.cost, step.time, step.curNode)}
          ${renderGraph060InDegreeGrid(step.inDegree.slice(1), step.curNode !== null ? step.curNode - 1 : null, undefined, '课程先修入度表 (归零即开课)')}
          ${renderGraph060QueuePills(step.queue, '已满足先修开课队列')}
        </div>
      </div>
    `;
  },
});
