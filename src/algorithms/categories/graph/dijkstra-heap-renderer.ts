/**
 * 堆优化 Dijkstra (O(E log V)) 可视化器 — 4-Card 标准现代架构
 * 优先队列动态提取、惰性丢弃、邻接边松弛与拓扑高亮 (左程云 class061)
 * 深度架构重构：严格解释器级全流程逐行高亮执行（源点入堆、堆非空循环、堆顶出堆与解构、惰性丢弃判定、邻边松弛核验、距离缩短更新、新距离二元组入堆均发射独立Step）、四语言行号映射
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DIJKSTRA_HEAP_PROBLEM_HTML,
  DIJKSTRA_HEAP_ANALYSIS_HTML,
  DIJKSTRA_HEAP_CODE_LANGUAGES,
} from './dijkstra-heap-problem-content';
import { DJB_NODES, DJB_EDGES, DJB_NODE_POSITIONS } from './dijkstra-basic-renderer';
import template from './dijkstra-heap.html?raw';
import { HighlightTarget } from '../../../core/code-panel';

export interface DJHStep extends StepBase {
  nodes: number[];
  edges: { from: number; to: number; w: number }[];
  dist: number[];
  pq: { d: number; u: number }[];
  currentNode: number | null;
  currentDist: number | null;
  relaxEdge: { from: number; to: number } | null;
  relaxCount: number;
  action: 'init' | 'poll' | 'skip-lazy' | 'relax' | 'skip' | 'done';
  statusText: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

const INF = Infinity;

export function buildDJHSteps(): DJHStep[] {
  const steps: DJHStep[] = [];
  const n = DJB_NODES.length;
  const source = 0;

  // 精准 15 处四语言映射行号字典 (cpp / java / python / javascript 数组 1-based 索引)
  const lines = {
    entry: { cpp: 1, java: 2, python: 1, javascript: 1 },
    initDist: { cpp: 2, java: 4, python: 2, javascript: 2 },
    setSrc: { cpp: 3, java: 5, python: 3, javascript: 3 },
    initPQ: { cpp: 4, java: 6, python: 4, javascript: 4 },
    pushSrc: { cpp: 5, java: 7, python: 4, javascript: 4 },
    whilePQ: { cpp: 6, java: 8, python: 5, javascript: 5 },
    pollPQ: { cpp: 7, java: 9, python: 6, javascript: 7 },
    unpackCur: { cpp: 7, java: 10, python: 6, javascript: 7 },
    checkLazy: { cpp: 8, java: 11, python: 7, javascript: 8 },
    forAdj: { cpp: 9, java: 12, python: 9, javascript: 9 },
    unpackEdge: { cpp: 9, java: 13, python: 9, javascript: 9 },
    checkRelax: { cpp: 10, java: 14, python: 10, javascript: 10 },
    updateDist: { cpp: 11, java: 15, python: 11, javascript: 11 },
    pushPQ: { cpp: 12, java: 16, python: 12, javascript: 12 },
    returnDist: { cpp: 16, java: 20, python: 13, javascript: 16 },
  };

  const dist = new Array(n).fill(INF);
  dist[source] = 0;
  let relaxCount = 0;

  // Build adjacency list
  const adj: { to: number; w: number }[][] = Array.from({ length: n }, () => []);
  for (const e of DJB_EDGES) {
    adj[e.from].push({ to: e.to, w: e.w });
  }

  // Priority Queue: min-heap of {d, u}
  const pq: { d: number; u: number }[] = [{ d: 0, u: source }];

  function makeStep(
    codeLine: HighlightTarget,
    action: 'init' | 'poll' | 'skip-lazy' | 'relax' | 'skip' | 'done',
    statusText: string,
    log: string,
    currentNode: number | null = null,
    currentDist: number | null = null,
    relaxEdge: { from: number; to: number } | null = null
  ): void {
    const pqStr = pq.length > 0 ? pq.map((item) => `(${item.d}, ${item.u})`).join(', ') : '空堆';
    const dStr = dist.map((d, i) => `${i}:${d === INF ? '∞' : d}`).join(', ');

    steps.push({
      nodes: DJB_NODES,
      edges: DJB_EDGES,
      dist: [...dist],
      pq: pq.map((item) => ({ ...item })),
      currentNode,
      currentDist,
      relaxEdge,
      relaxCount,
      action,
      statusText,
      log,
      codeLine,
      metrics: {
        'metric-cur-extract': currentNode !== null ? `(d=${currentDist}, u=${currentNode})` : '—',
        'metric-pq-size': `${pq.length}`,
        'metric-relax-count': `${relaxCount}`,
        'metric-dist-info': `[${dStr}]`,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, 'init', '🚀 [算法启动] dijkstraHeap(n=5, adj, src=0)：启动堆优化 Dijkstra 算法。', 'dijkstraHeap 入口');
  makeStep(lines.initDist, 'init', '📊 [初始化距离表] Arrays.fill(dist, INF)；除源点外全部设为正无穷。', 'init dist[]');

  dist[source] = 0;
  makeStep(lines.setSrc, 'init', '🌱 [设置源点距离] dist[0] = 0。', 'dist[0] = 0');
  makeStep(lines.initPQ, 'init', '📦 [初始化小顶堆] PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0])。', 'init PriorityQueue');
  makeStep(lines.pushSrc, 'init', '📥 [源点入堆] pq.offer(new int[]{0, 0})；初始二元组 (d=0, u=0) 进堆。', 'pq.offer({0, 0})');

  // 2. 堆非空主循环
  while (pq.length > 0) {
    makeStep(lines.whilePQ, 'init', `🔁 [检查堆状态] while (!pq.isEmpty()) -> 当前堆大小: ${pq.length}。`, '!pq.isEmpty()');

    // 小顶堆弹出最小值
    pq.sort((a, b) => a.d - b.d);
    const top = pq.shift()!;
    const { d, u } = top;

    makeStep(lines.pollPQ, 'poll', `📤 [弹出堆顶] int[] cur = pq.poll() -> 提取出当前距离最小的二元组 (d=${d}, u=${u})。`, `poll ({d:${d}, u:${u}})`, u, d);
    makeStep(lines.unpackCur, 'poll', `  ↳ [解构二元组] 当前探索节点 u=${u}，出堆距离标号 d=${d}。`, `d=${d}, u=${u}`, u, d);

    // 惰性删除检查
    const isLazy = d > dist[u];
    makeStep(lines.checkLazy, isLazy ? 'skip-lazy' : 'poll', `  🔎 [惰性删除检查] if (d > dist[u]) -> (${d} > ${dist[u]}) -> (${isLazy})。`, `lazy check ${d} > ${dist[u]}`, u, d);

    if (isLazy) {
      makeStep(lines.checkLazy, 'skip-lazy', `  🗑️ [惰性丢弃] 节点 ${u} 的该距离标号 (d=${d}) 大于全局最优 dist[${u}] (${dist[u]})，为历史过期冗余，直接丢弃！`, `lazy drop ${u}`, u, d);
      continue;
    }

    // 遍历邻接边
    for (const edge of adj[u]) {
      const v = edge.to;
      const w = edge.w;
      const canRelax = dist[u] + w < dist[v];
      const curEdge = { from: u, to: v };

      makeStep(lines.forAdj, canRelax ? 'relax' : 'skip', `  ↳ [遍历出边] 考察边 (${u} ➔ ${v}, 权重 w=${w})。`, `edge (${u}->${v}, w=${w})`, u, d, curEdge);
      makeStep(lines.unpackEdge, canRelax ? 'relax' : 'skip', `    ↳ [解构目标] 目标邻居 v=${v}，边权 w=${w}。`, `v=${v}, w=${w}`, u, d, curEdge);

      makeStep(lines.checkRelax, canRelax ? 'relax' : 'skip', `    🔎 [松弛核验] if (dist[${u}](${dist[u]}) + ${w} < dist[${v}](${dist[v] === INF ? '∞' : dist[v]})) -> (${canRelax})。`, `check relax ${u}->${v}`, u, d, curEdge);

      if (canRelax) {
        const oldVal = dist[v];
        dist[v] = dist[u] + w;
        relaxCount++;
        makeStep(lines.updateDist, 'relax', `    ⚡ [更新距离] 成功松弛！dist[${v}] 从 ${oldVal === INF ? '∞' : oldVal} 缩短为 ${dist[v]}！`, `dist[${v}]=${dist[v]}`, u, d, curEdge);

        pq.push({ d: dist[v], u: v });
        makeStep(lines.pushPQ, 'relax', `    📥 [推入优先队列] pq.offer(new int[]{${dist[v]}, ${v}})；新最优距离入堆排队。`, `offer ({d:${dist[v]}, u:${v}})`, u, d, curEdge);
      } else {
        makeStep(lines.checkRelax, 'skip', `    ⏭️ [跳过边] 边 (${u} ➔ ${v}) 不满足三角不等式缩短条件。`, `skip (${u}->${v})`, u, d, curEdge);
      }
    }
  }

  makeStep(lines.whilePQ, 'init', '🔁 [检查堆状态] while (!pq.isEmpty()) -> (false，堆已清空)。', 'pq empty');
  makeStep(lines.returnDist, 'done', `🎉 [堆优化 Dijkstra 算法达成] return dist！全图 ${n} 个顶点的单源最短路径全部求得！结果: [${dist.join(', ')}]。`, 'return dist');

  return steps;
}

export class DijkstraHeapVisualizer extends StepVisualizer<DJHStep> {
  protected codeLanguages = DIJKSTRA_HEAP_CODE_LANGUAGES;
  protected codeLines = DIJKSTRA_HEAP_CODE_LANGUAGES['java'];
  protected codePanelTitle = '堆优化 Dijkstra 代码调试';

  private svgCanvas: HTMLElement | null = null;
  private distTableBody: HTMLElement | null = null;
  private pqElementsEl: HTMLElement | null = null;
  private metricCurExtractEl: HTMLElement | null = null;
  private metricPqSizeEl: HTMLElement | null = null;
  private metricRelaxCountEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.svgCanvas = this.root.querySelector('#djh-svg-canvas');
    this.distTableBody = this.root.querySelector('#djh-dist-table-body');
    this.pqElementsEl = this.root.querySelector('#metric-pq-elements');
    this.metricCurExtractEl = this.root.querySelector('#metric-cur-extract');
    this.metricPqSizeEl = this.root.querySelector('#metric-pq-size');
    this.metricRelaxCountEl = this.root.querySelector('#metric-relax-count');
    this.liveTextEl = this.root.querySelector('#djh-live-text');

    this.bindPlaybackControls();

    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: DIJKSTRA_HEAP_PROBLEM_HTML,
      analysisHtml: DIJKSTRA_HEAP_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): DJHStep[] {
    return buildDJHSteps();
  }

  protected renderStep(step: DJHStep): void {
    const { dist, pq, currentNode, currentDist, relaxEdge, relaxCount, action, statusText } = step;

    if (this.svgCanvas) {
      let svgHtml = `<svg viewBox="0 0 500 250" style="width:100%; height:100%; max-height:240px;">
        <defs>
          <marker id="arrow-djh" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
          <marker id="arrow-djh-relax" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
          </marker>
          <marker id="arrow-djh-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
          </marker>
        </defs>`;

      for (const e of DJB_EDGES) {
        const p1 = DJB_NODE_POSITIONS[e.from];
        const p2 = DJB_NODE_POSITIONS[e.to];
        const isCurrent = relaxEdge && relaxEdge.from === e.from && relaxEdge.to === e.to;
        const isRelaxed = isCurrent && action === 'relax';

        const strokeColor = isRelaxed ? '#10b981' : isCurrent ? '#3b82f6' : '#cbd5e1';
        const strokeWidth = isCurrent ? 3.5 : 1.8;
        const marker = isRelaxed ? 'url(#arrow-djh-relax)' : isCurrent ? 'url(#arrow-djh-active)' : 'url(#arrow-djh)';

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 + (e.from === 2 && e.to === 1 ? -12 : 8);

        svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;
        svgHtml += `<rect x="${midX - 10}" y="${midY - 8}" width="20" height="15" rx="3" fill="#ffffff" stroke="${strokeColor}" stroke-width="1" />`;
        svgHtml += `<text x="${midX}" y="${midY + 3}" fill="#0f172a" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${e.w}</text>`;
      }

      DJB_NODES.forEach((node) => {
        const p = DJB_NODE_POSITIONS[node];
        const dVal = dist[node];
        const isCur = currentNode === node;
        const isTarget = relaxEdge && relaxEdge.to === node;
        const inPQ = pq.some((item) => item.u === node);

        let fill = '#ffffff';
        let stroke = '#cbd5e1';
        if (isCur && action === 'skip-lazy') {
          fill = '#fee2e2';
          stroke = '#ef4444';
        } else if (isCur) {
          fill = '#fef08a';
          stroke = '#eab308';
        } else if (isTarget && action === 'relax') {
          fill = '#dcfce7';
          stroke = '#10b981';
        } else if (inPQ) {
          fill = '#eff6ff';
          stroke = '#3b82f6';
        }

        svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />`;
        svgHtml += `<text x="${p.x}" y="${p.y + 4}" fill="#0f172a" font-size="12" font-weight="800" text-anchor="middle">${node}</text>`;
        svgHtml += `<text x="${p.x}" y="${p.y + 32}" fill="${dVal === INF ? '#94a3b8' : '#2563eb'}" font-size="11" font-family="monospace" font-weight="800" text-anchor="middle">${dVal === INF ? '∞' : dVal}</text>`;
      });

      svgHtml += `</svg>`;
      this.svgCanvas.innerHTML = svgHtml;
    }

    if (this.distTableBody) {
      this.distTableBody.innerHTML = DJB_NODES.map((node) => {
        const dVal = dist[node];
        const isCur = currentNode === node;
        const inPQ = pq.some((item) => item.u === node);
        return `<tr class="${isCur ? 'bg-yellow-50/70 font-semibold' : ''}">
          <td class="px-3 py-1.5 text-center font-mono font-bold text-slate-800">${node}</td>
          <td class="px-3 py-1.5 text-center font-mono font-extrabold ${dVal === INF ? 'text-slate-400' : 'text-blue-600'}">${dVal === INF ? '∞' : dVal}</td>
          <td class="px-3 py-1.5 text-center font-mono font-bold ${inPQ ? 'text-blue-600' : 'text-slate-400'}">${inPQ ? '在堆中' : '—'}</td>
        </tr>`;
      }).join('');
    }

    if (this.metricCurExtractEl) {
      this.metricCurExtractEl.textContent = currentNode !== null ? `(d=${currentDist}, u=${currentNode})` : '—';
    }
    if (this.metricPqSizeEl) {
      this.metricPqSizeEl.textContent = `${pq.length}`;
    }
    if (this.metricRelaxCountEl) {
      this.metricRelaxCountEl.textContent = `${relaxCount}`;
    }
    if (this.pqElementsEl) {
      this.pqElementsEl.textContent = pq.length > 0 ? pq.map((item) => `(d=${item.d}, u=${item.u})`).join(', ') : '空堆';
    }

    if (this.liveTextEl) {
      this.liveTextEl.textContent = statusText;
    }
  }
}

registerAlgorithm({
  id: 'dijkstra-heap',
  name: 'Dijkstra 堆优化最短路',
  viewId: 'algo-dijkstra-heap-view',
  icon: '⚡',
  category: 'graph',
  difficulty: 3,
  levelOrder: 28,
  description: '左程云算法通关课 Class 061：基于优先队列（小顶堆）与惰性删除的单源最短路算法，时间复杂度 O(E log V)',
  learningGoal: '深刻理解优先队列加速选点、惰性删除冗余标号与稀疏图性能优势',
  template,
  Visualizer: DijkstraHeapVisualizer,
});
