/**
 * Class 060: Code03 并行课程 III Step Compiler
 */

import { PARALLEL_COURSES_060_LINES } from './graph-060-stage-codes';
import {
  Graph060StepBase,
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

export const DEFAULT_NODES: Graph060NodeCoord[] = [
  { id: 1, x: 70, y: 110, label: 'C1' },
  { id: 2, x: 190, y: 50, label: 'C2' },
  { id: 3, x: 190, y: 170, label: 'C3' },
  { id: 4, x: 320, y: 110, label: 'C4' },
  { id: 5, x: 440, y: 110, label: 'C5' },
];

export const DEFAULT_RELATIONS = [
  { from: 1, to: 2 },
  { from: 1, to: 3 },
  { from: 2, to: 4 },
  { from: 3, to: 4 },
  { from: 4, to: 5 },
];

export const DEFAULT_TIME = [3, 2, 5, 2, 4]; // 1-indexed: c1:3, c2:2, c3:5, c4:2, c5:4

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
    decision: `关键路径求解完成：所有课程修毕所需全局最早完工时间 = ${total} 月`,
    message: `整个项目工期瓶颈（关键路径 CPM）已精准锁定，任何关键路径上的课程延期都会直接导致总工期推迟。`,
    log: `Parallel courses finished, minTotalMonths=${total}`,
    codeLine: linesCode.returnTotal,
    metrics: { '全局最早完工': `${total} 月`, '课程总数': n, '算法状态': '已收敛' },
    statusBadge: { text: '求解成功', type: 'success' },
  });

  return steps;
}
