/**
 * 拓扑排序 (Kahn 算法 · LC 210) 步进编译器 (TopologicalSortStepCompiler)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：入度统计、零入度队列进出、邻边消除与有向环判定推演
 */

import { StepBase } from '../../../core/step-visualizer';
import { HighlightTarget } from '../../../core/code-panel';

export interface TopoStep extends StepBase {
  nodes: number[];
  edges: { from: number; to: number }[];
  inDegree: number[];
  queue: number[];
  order: number[];
  currentNode: number | null;
  activeEdge: { from: number; to: number } | null;
  action: 'init' | 'poll' | 'reduce-degree' | 'enqueue' | 'done';
  statusText: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export const TOPO_NODES = [0, 1, 2, 3, 4, 5];
export const TOPO_EDGES = [
  { from: 5, to: 2 },
  { from: 5, to: 0 },
  { from: 4, to: 0 },
  { from: 4, to: 1 },
  { from: 2, to: 3 },
  { from: 3, to: 1 },
];

export const TOPO_NODE_POSITIONS: { x: number; y: number }[] = [
  { x: 170, y: 190 },
  { x: 330, y: 190 },
  { x: 170, y: 70 },
  { x: 330, y: 70 },
  { x: 250, y: 225 },
  { x: 90, y: 130 },
];

export function buildTopoSteps(): TopoStep[] {
  const steps: TopoStep[] = [];
  const n = TOPO_NODES.length;
  const inDegree = new Array(n).fill(0);
  const adj: number[][] = Array.from({ length: n }, () => []);

  // 精准 16 处四语言映射行号字典 (cpp / java / python / javascript 数组 1-based 索引)
  const lines = {
    entry: { cpp: 1, java: 2, python: 2, javascript: 1 },
    initInDegree: { cpp: 2, java: 3, python: 3, javascript: 2 },
    initAdj: { cpp: 3, java: 4, python: 4, javascript: 3 },
    forPrereq: { cpp: 4, java: 6, python: 5, javascript: 4 },
    addPrereqEdge: { cpp: 5, java: 7, python: 6, javascript: 5 },
    incrementInDegree: { cpp: 6, java: 8, python: 7, javascript: 6 },
    initQueue: { cpp: 8, java: 10, python: 8, javascript: 8 },
    pushZeroInDegree: { cpp: 9, java: 11, python: 8, javascript: 9 },
    initOrder: { cpp: 10, java: 12, python: 9, javascript: 10 },
    whileQueue: { cpp: 11, java: 14, python: 10, javascript: 11 },
    pollQueue: { cpp: 12, java: 15, python: 11, javascript: 12 },
    appendOrder: { cpp: 13, java: 16, python: 12, javascript: 13 },
    forAdj: { cpp: 14, java: 17, python: 13, javascript: 14 },
    decrementInDegree: { cpp: 15, java: 18, python: 14, javascript: 15 },
    pushNewZero: { cpp: 15, java: 18, python: 15, javascript: 15 },
    returnOrder: { cpp: 18, java: 21, python: 16, javascript: 18 },
  };

  const queue: number[] = [];
  const order: number[] = [];

  function makeStep(
    codeLine: HighlightTarget,
    action: 'init' | 'poll' | 'reduce-degree' | 'enqueue' | 'done',
    statusText: string,
    log: string,
    currentNode: number | null = null,
    activeEdge: { from: number; to: number } | null = null
  ): void {
    const qStr = queue.length > 0 ? `[${queue.join(', ')}]` : '[]';

    steps.push({
      nodes: TOPO_NODES,
      edges: TOPO_EDGES,
      inDegree: [...inDegree],
      queue: [...queue],
      order: [...order],
      currentNode,
      activeEdge,
      action,
      statusText,
      log,
      codeLine,
      metrics: {
        'metric-cur-node': currentNode !== null ? `${currentNode}` : '—',
        'metric-queue-elements': qStr,
        'metric-topo-len': `${order.length} / ${n}`,
        'metric-cycle-status': order.length === n ? '✅ 无环 (DAG)' : '检测中...',
      },
    });
  }

  // 1. 入口与初始化
  makeStep(lines.entry, 'init', '🚀 [算法启动] findOrder(numCourses=6, prerequisites)：初始化 Kahn 拓扑排序算法。', 'findOrder 入口');
  makeStep(lines.initInDegree, 'init', '📊 [初始化入度表] int[] inDegree = new int[6]，记录每个节点被指向的入度数。', 'init inDegree[]');
  makeStep(lines.initAdj, 'init', '📦 [构建邻接表] List<Integer>[] adj = new ArrayList[6]，初始化有向邻接链表。', 'init adj[]');

  // 建图与统计入度
  for (const e of TOPO_EDGES) {
    adj[e.from].push(e.to);
    inDegree[e.to]++;
    makeStep(lines.forPrereq, 'init', `🔎 [处理前置依赖] 依赖边 ${e.from} ➔ ${e.to}。`, `edge ${e.from}->${e.to}`, null, e);
    makeStep(lines.addPrereqEdge, 'init', `➕ [添加邻接边] adj[${e.from}].add(${e.to})。`, `adj[${e.from}].add(${e.to})`, null, e);
    makeStep(lines.incrementInDegree, 'init', `📈 [入度累加] inDegree[${e.to}]++ = ${inDegree[e.to]}。`, `inDegree[${e.to}]++`, null, e);
  }

  // 初始化队列与 0 入度入队
  makeStep(lines.initQueue, 'init', '📦 [初始化零入度队列] Queue<Integer> queue = new LinkedList<>()。', 'init queue');
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
      makeStep(lines.pushZeroInDegree, 'enqueue', `🌱 [0入度入队] 节点 ${i} 入度为 0，不受任何前置依赖约束，queue.offer(${i})！`, `offer 0-indegree node ${i}`, i);
    }
  }

  // 初始化拓扑序列容器
  makeStep(lines.initOrder, 'init', '📝 [初始化结果数组] int[] order = new int[6]; int idx = 0。', 'init order[]');

  // Kahn BFS 队列循环
  while (queue.length > 0) {
    makeStep(lines.whileQueue, 'init', `🔁 [Kahn 队列外层循环] while (!queue.isEmpty()) -> 当前就绪队列: [${queue.join(', ')}]。`, '!queue.isEmpty()');

    const cur = queue.shift()!;
    makeStep(lines.pollQueue, 'poll', `📤 [出队推进] int cur = queue.poll() -> 弹出节点 ${cur}。`, `poll node ${cur}`, cur);

    order.push(cur);
    makeStep(lines.appendOrder, 'poll', `📝 [写入拓扑序列] order[idx++] = ${cur}；当前拓扑序列为: [${order.join(' ➔ ')}]。`, `order.add(${cur})`, cur);

    // 遍历出边消元
    for (const next of adj[cur]) {
      const edge = { from: cur, to: next };
      makeStep(lines.forAdj, 'reduce-degree', `  ↳ [遍历邻居出边] 考察边 ${cur} ➔ ${next}。`, `edge ${cur}->${next}`, cur, edge);

      inDegree[next]--;
      const reducedToZero = inDegree[next] === 0;

      makeStep(lines.decrementInDegree, 'reduce-degree', `  📉 [削减邻居入度] 消除依赖！--inDegree[${next}] = ${inDegree[next]}。`, `--inDegree[${next}]=${inDegree[next]}`, cur, edge);

      if (reducedToZero) {
        queue.push(next);
        makeStep(lines.pushNewZero, 'enqueue', `  ✨ [新0入度入队] 节点 ${next} 的所有前置依赖均已消除，queue.offer(${next})！`, `offer ${next}`, cur, edge);
      }
    }
  }

  // 终局检测
  makeStep(lines.whileQueue, 'init', '🔁 [检查队列] while (!queue.isEmpty()) -> (false，队列已清空)。', 'queue empty');

  if (order.length === n) {
    makeStep(lines.returnOrder, 'done', `🎉 [Kahn 拓扑排序完成] return order！全图 6 个顶点全部成功排序，不存在环状依赖！拓扑序列: [${order.join(' ➔ ')}]。`, 'return order', null);
  } else {
    makeStep(lines.returnOrder, 'done', '❌ [检测到环路依赖] order 长度小于 6，图中存在回路，返回空序列！', 'cycle detected', null);
  }

  return steps;
}
