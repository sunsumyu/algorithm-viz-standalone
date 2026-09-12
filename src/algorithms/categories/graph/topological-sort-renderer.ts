/**
 * 拓扑排序 (Kahn 算法) 可视化器 — 声明式 4-Card 标准架构
 * 入度统计、零入度队列进出、邻边剥离与 DAG 拓扑序列重构 (LeetCode 210 / 洛谷 B3644)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  TOPOLOGICAL_SORT_PROBLEM_HTML,
  TOPOLOGICAL_SORT_ANALYSIS_HTML,
  TOPOLOGICAL_SORT_CODE_LANGUAGES,
} from './topological-sort-problem-content';
import { HighlightTarget } from '../../../core/code-panel';

export interface TopoStep {
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
    const ordStr = order.length > 0 ? order.join(' ➔ ') : '尚未产生';

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

export function renderTopologicalSortCanvas(container: HTMLElement, step: TopoStep): void {
  const { inDegree, queue, order, currentNode, activeEdge } = step;

  // 1. 有向图 SVG 拓扑图
  let svgHtml = `<svg viewBox="0 0 460 260" style="width:100%; height:100%; max-height:240px;">
    <defs>
      <marker id="arrow-topo" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
      </marker>
      <marker id="arrow-topo-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
      </marker>
    </defs>`;

  for (const e of TOPO_EDGES) {
    const p1 = TOPO_NODE_POSITIONS[e.from];
    const p2 = TOPO_NODE_POSITIONS[e.to];
    const isActive = activeEdge && activeEdge.from === e.from && activeEdge.to === e.to;

    const strokeColor = isActive ? '#2563eb' : '#cbd5e1';
    const strokeWidth = isActive ? 3.5 : 2;
    const marker = isActive ? 'url(#arrow-topo-active)' : 'url(#arrow-topo)';

    svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;
  }

  const orderSet = new Set(order);
  const qSet = new Set(queue);

  TOPO_NODES.forEach((node) => {
    const p = TOPO_NODE_POSITIONS[node];
    const isCurrent = currentNode === node;
    const isOrdered = orderSet.has(node);
    const inQueue = qSet.has(node);

    let fill = '#ffffff';
    let stroke = '#cbd5e1';
    if (isCurrent) {
      fill = '#fef08a';
      stroke = '#eab308';
    } else if (isOrdered) {
      fill = '#dcfce7';
      stroke = '#22c55e';
    } else if (inQueue) {
      fill = '#dbeafe';
      stroke = '#3b82f6';
    }

    svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />`;
    svgHtml += `<text x="${p.x}" y="${p.y + 4}" fill="#0f172a" font-size="12" font-weight="800" text-anchor="middle">${node}</text>`;

    svgHtml += `<text x="${p.x}" y="${p.y + 32}" fill="${isOrdered ? '#15803d' : '#64748b'}" font-size="10.5" font-family="monospace" font-weight="700" text-anchor="middle">in:${inDegree[node]}</text>`;
  });

  svgHtml += `</svg>`;

  // 2. 入度小胶囊栏 + 拓扑序列结果
  const pillsHtml = TOPO_NODES.map((node) => {
    const deg = inDegree[node];
    const isZero = deg === 0;
    return `<div style="display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:6px; background:${
      isZero ? '#ecfdf5' : '#f8fafc'
    }; border:1px solid ${isZero ? '#a7f3d0' : '#e2e8f0'}; font-size:11px;">
      <span style="font-weight:700; color:#334155;">节点 ${node}:</span>
      <span style="font-family:monospace; font-weight:800; color:${
        isZero ? '#059669' : '#2563eb'
      };">${deg}</span>
    </div>`;
  }).join('');

  const orderHtml =
    order.length > 0
      ? order
          .map(
            (v) =>
              `<span style="display:inline-block; padding:2px 7px; border-radius:4px; background:#dcfce7; color:#15803d; font-family:monospace; font-weight:800; border:1px solid #bbf7d0;">${v}</span>`
          )
          .join('<span style="color:#94a3b8; font-weight:bold; margin:0 4px;">➔</span>')
      : '<span style="color:#94a3b8; font-size:12px;">尚未产生元素</span>';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: 100%; width: 100%; padding: 8px; box-sizing: border-box;">
      <div style="flex: 1; width: 100%; display: flex; align-items: center; justify-content: center; min-height: 0;">${svgHtml}</div>
      <div style="display: flex; flex-wrap: wrap; gap: 6px; justify-content: center;">${pillsHtml}</div>
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 2px; justify-content: center; min-height: 26px;">${orderHtml}</div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'topological-sort',
  name: '拓扑排序 (Topological Sort)',
  category: 'graph',
  description: '左程云算法通关课 Class 059 / 060：基于入度削减的 Kahn 算法，实现有向无环图（DAG）的线性拓扑序列求解与环路检测 (LeetCode 210)',
  icon: '🔀',
  difficulty: 2,
  levelOrder: 22,
  learningGoal: '深入理解入度统计、零入度队列进出、邻边消除与有向环判定原理',
  metrics: [
    { id: 'metric-cur-node', label: '当前出队点 u', color: '#2563eb' },
    { id: 'metric-queue-elements', label: '就绪队列', color: '#10b981' },
    { id: 'metric-topo-len', label: '拓扑序列长度', color: '#a855f7' },
    { id: 'metric-cycle-status', label: '环路检测', color: '#16a34a' },
  ],
  legend: [
    { label: '当前出队点 u', color: '#eab308' },
    { label: '入度已为 0（队列中）', color: '#3b82f6' },
    { label: '已加入排序', color: '#22c55e' },
  ],
  codeLanguages: TOPOLOGICAL_SORT_CODE_LANGUAGES,
  problemHtml: TOPOLOGICAL_SORT_PROBLEM_HTML,
  analysisHtml: TOPOLOGICAL_SORT_ANALYSIS_HTML,
  generateSteps: () => buildTopoSteps(),
  renderCanvas: (container, step) => renderTopologicalSortCanvas(container, step as TopoStep),
});
