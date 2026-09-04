/**
 * 朴素 Dijkstra (O(V^2)) 可视化器 — 4-Card 标准现代架构
 * 贪心选点、邻接边松弛、距离数组实时追踪与拓扑高亮 (左程云 class061)
 * 深度架构重构：严格解释器级全流程逐行高亮执行（源点初始化、V轮外层扫描、未访问最小点u寻找、不可达截断、锁定visited[u]、出边松弛核验、距离缩短更新均发射独立Step）、四语言行号映射
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DIJKSTRA_BASIC_PROBLEM_HTML,
  DIJKSTRA_BASIC_ANALYSIS_HTML,
  DIJKSTRA_BASIC_CODE_LANGUAGES,
} from './dijkstra-basic-problem-content';
import template from './dijkstra-basic.html?raw';
import { HighlightTarget } from '../../../core/code-panel';

export interface DJBStep extends StepBase {
  nodes: number[];
  edges: { from: number; to: number; w: number }[];
  dist: number[];
  prevDist: number[];
  visited: Set<number>;
  currentNode: number | null;
  relaxEdge: { from: number; to: number } | null;
  relaxCount: number;
  action: 'init' | 'select' | 'relax' | 'skip' | 'done';
  statusText: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export const DJB_NODES = [0, 1, 2, 3, 4];
export const DJB_EDGES = [
  { from: 0, to: 1, w: 4 },
  { from: 0, to: 2, w: 1 },
  { from: 2, to: 1, w: 2 },
  { from: 1, to: 3, w: 1 },
  { from: 2, to: 3, w: 5 },
  { from: 3, to: 4, w: 3 },
];

export const DJB_NODE_POSITIONS: { x: number; y: number }[] = [
  { x: 70, y: 130 },
  { x: 210, y: 55 },
  { x: 210, y: 205 },
  { x: 350, y: 130 },
  { x: 440, y: 130 },
];

const INF = Infinity;

export function buildDJBSteps(): DJBStep[] {
  const steps: DJBStep[] = [];
  const n = DJB_NODES.length;
  const source = 0;

  // 精准 12 处四语言映射行号字典 (cpp / java / python / javascript 数组 1-based 索引)
  const lines = {
    entry: { cpp: 1, java: 2, python: 1, javascript: 1 },
    initDist: { cpp: 2, java: 4, python: 2, javascript: 2 },
    setSrc: { cpp: 4, java: 5, python: 4, javascript: 4 },
    initVisited: { cpp: 3, java: 6, python: 3, javascript: 3 },
    forStep: { cpp: 5, java: 7, python: 5, javascript: 5 },
    initU: { cpp: 6, java: 8, python: 6, javascript: 6 },
    findMinU: { cpp: 7, java: 9, python: 7, javascript: 7 },
    checkReachable: { cpp: 9, java: 11, python: 9, javascript: 9 },
    lockU: { cpp: 10, java: 12, python: 10, javascript: 10 },
    forAdj: { cpp: 11, java: 13, python: 11, javascript: 11 },
    relaxEdge: { cpp: 13, java: 15, python: 12, javascript: 12 },
    returnDist: { cpp: 16, java: 18, python: 14, javascript: 15 },
  };

  const dist = new Array(n).fill(INF);
  dist[source] = 0;
  const visited = new Set<number>();
  let relaxCount = 0;
  let prevDistSnapshot = [...dist];

  // 邻接表
  const adj: { to: number; w: number }[][] = Array.from({ length: n }, () => []);
  for (const e of DJB_EDGES) {
    adj[e.from].push({ to: e.to, w: e.w });
  }

  function makeStep(
    codeLine: HighlightTarget,
    action: 'init' | 'select' | 'relax' | 'skip' | 'done',
    statusText: string,
    log: string,
    currentNode: number | null = null,
    relaxEdge: { from: number; to: number } | null = null
  ): void {
    const dStr = dist.map((d, i) => `${i}:${d === INF ? '∞' : d}`).join(', ');
    const visStr = visited.size > 0 ? Array.from(visited).join(', ') : '无';

    steps.push({
      nodes: DJB_NODES,
      edges: DJB_EDGES,
      dist: [...dist],
      prevDist: [...prevDistSnapshot],
      visited: new Set(visited),
      currentNode,
      relaxEdge,
      relaxCount,
      action,
      statusText,
      log,
      codeLine,
      metrics: {
        'metric-cur-node': currentNode !== null ? `${currentNode}` : '—',
        'metric-visited-nodes': `[${visStr}]`,
        'metric-relax-count': `${relaxCount}`,
        'metric-dist-info': `[${dStr}]`,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, 'init', '🚀 [算法启动] dijkstra(n=5, edges, src=0)：启动朴素 Dijkstra 最短路径算法。', 'dijkstra 入口');
  makeStep(lines.initDist, 'init', '📊 [初始化距离表] Arrays.fill(dist, INF)；除源点外全部设为正无穷。', 'init dist[]');

  dist[source] = 0;
  prevDistSnapshot = [...dist];
  makeStep(lines.setSrc, 'init', '🌱 [设置源点] dist[0] = 0；从源点 0 出发开始贪心探索。', 'dist[0] = 0');
  makeStep(lines.initVisited, 'init', '🏷️ [初始化访问标记] boolean[] visited = new boolean[5]；记录最短路已确定的点。', 'init visited[]');

  // 2. V 轮贪心探索
  for (let step = 0; step < n; step++) {
    makeStep(lines.forStep, 'select', `🔁 [外层探索轮次] 正在执行第 ${step + 1} / ${n} 次顶点锁定。`, `--- 第 ${step + 1} 轮 ---`);

    makeStep(lines.initU, 'select', '🔍 [初始化选点指针] int u = -1；准备在未访问顶点中寻找 dist 最小者。', 'u = -1');

    let u = -1;
    for (let j = 0; j < n; j++) {
      if (!visited.has(j) && (u === -1 || dist[j] < dist[u])) {
        u = j;
      }
    }
    makeStep(lines.findMinU, 'select', `💡 [贪心确定最小点] 选出未访问节点 u = ${u}，当前 dist[${u}] = ${dist[u] === INF ? '∞' : dist[u]} 为全局最小！`, `选点: u = ${u}`);

    makeStep(lines.checkReachable, 'select', `🔎 [检查连通可达性] if (dist[${u}] == INF) -> (${dist[u] === INF})。`, `check dist[${u}]`);
    if (dist[u] === INF) {
      break;
    }

    visited.add(u);
    makeStep(lines.lockU, 'select', `🔒 [锁定最短路径] visited[${u}] = true；源点到节点 ${u} 的最短路径已确定为 ${dist[u]}！`, `锁定: visited[${u}] = true`, u);

    // 松弛 u 的出边
    for (const edge of adj[u]) {
      const v = edge.to;
      const w = edge.w;
      const canRelax = dist[u] + w < dist[v];
      const curEdge = { from: u, to: v };

      makeStep(lines.forAdj, canRelax ? 'relax' : 'skip', `  ↳ [考察出边] 考察边 (${u} ➔ ${v}, 权重 w=${w})。`, `edge (${u}->${v}, w=${w})`, u, curEdge);

      if (canRelax) {
        const oldVal = dist[v];
        dist[v] = dist[u] + w;
        relaxCount++;
        makeStep(lines.relaxEdge, 'relax', `  ⚡ [松弛更新] if (dist[${u}] + ${w} < dist[${v}]) 成立！dist[${v}] 从 ${oldVal === INF ? '∞' : oldVal} 缩短为 ${dist[v]}！`, `dist[${v}]=${dist[v]}`, u, curEdge);
        prevDistSnapshot = [...dist];
      } else {
        makeStep(lines.relaxEdge, 'skip', `  ⏭️ [跳过松弛] dist[${u}] + ${w} (${dist[u] + w}) >= dist[${v}] (${dist[v] === INF ? '∞' : dist[v]})，无需更新。`, `skip (${u}->${v})`, u, curEdge);
      }
    }
  }

  makeStep(lines.returnDist, 'done', `🎉 [Dijkstra 算法达成] return dist！全图 ${n} 个顶点的单源最短路径全部确定！结果: [${dist.join(', ')}]。`, 'return dist');

  return steps;
}

export class DijkstraBasicVisualizer extends StepVisualizer<DJBStep> {
  protected codeLanguages = DIJKSTRA_BASIC_CODE_LANGUAGES;
  protected codeLines = DIJKSTRA_BASIC_CODE_LANGUAGES['java'];
  protected codePanelTitle = '朴素 Dijkstra 代码调试';

  private svgCanvas: HTMLElement | null = null;
  private distTableBody: HTMLElement | null = null;
  private metricCurNodeEl: HTMLElement | null = null;
  private metricVisitedCountEl: HTMLElement | null = null;
  private metricRelaxCountEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.svgCanvas = this.root.querySelector('#djb-svg-canvas');
    this.distTableBody = this.root.querySelector('#djb-dist-table-body');
    this.metricCurNodeEl = this.root.querySelector('#metric-cur-node');
    this.metricVisitedCountEl = this.root.querySelector('#metric-visited-nodes');
    this.metricRelaxCountEl = this.root.querySelector('#metric-relax-count');
    this.liveTextEl = this.root.querySelector('#djb-live-text');

    this.bindPlaybackControls();

    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: DIJKSTRA_BASIC_PROBLEM_HTML,
      analysisHtml: DIJKSTRA_BASIC_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): DJBStep[] {
    return buildDJBSteps();
  }

  protected renderStep(step: DJBStep): void {
    const { dist, visited, currentNode, relaxEdge, relaxCount, action, statusText } = step;

    if (this.svgCanvas) {
      let svgHtml = `<svg viewBox="0 0 500 250" style="width:100%; height:100%; max-height:240px;">
        <defs>
          <marker id="arrow-djb" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
          <marker id="arrow-djb-relax" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
          </marker>
          <marker id="arrow-djb-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
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
        const marker = isRelaxed ? 'url(#arrow-djb-relax)' : isCurrent ? 'url(#arrow-djb-active)' : 'url(#arrow-djb)';

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 + (e.from === 2 && e.to === 1 ? -12 : 8);

        svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;
        svgHtml += `<rect x="${midX - 10}" y="${midY - 8}" width="20" height="15" rx="3" fill="#ffffff" stroke="${strokeColor}" stroke-width="1" />`;
        svgHtml += `<text x="${midX}" y="${midY + 3}" fill="#0f172a" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${e.w}</text>`;
      }

      DJB_NODES.forEach((node) => {
        const p = DJB_NODE_POSITIONS[node];
        const dVal = dist[node];
        const isVisited = visited.has(node);
        const isCurrent = currentNode === node;
        const isTarget = relaxEdge && relaxEdge.to === node;

        let fill = '#ffffff';
        let stroke = '#cbd5e1';
        if (isCurrent) {
          fill = '#fef08a';
          stroke = '#eab308';
        } else if (isTarget && action === 'relax') {
          fill = '#dcfce7';
          stroke = '#10b981';
        } else if (isVisited) {
          fill = '#dcfce7';
          stroke = '#22c55e';
        } else if (dVal !== INF) {
          fill = '#eff6ff';
          stroke = '#3b82f6';
        }

        svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />`;
        svgHtml += `<text x="${p.x}" y="${p.y + 4}" fill="#0f172a" font-size="12" font-weight="800" text-anchor="middle">${node}</text>`;
        svgHtml += `<text x="${p.x}" y="${p.y + 32}" fill="${dVal === INF ? '#94a3b8' : isVisited ? '#15803d' : '#2563eb'}" font-size="11" font-family="monospace" font-weight="800" text-anchor="middle">${dVal === INF ? '∞' : dVal}</text>`;
      });

      svgHtml += `</svg>`;
      this.svgCanvas.innerHTML = svgHtml;
    }

    if (this.distTableBody) {
      this.distTableBody.innerHTML = DJB_NODES.map((node) => {
        const dVal = dist[node];
        const isVisited = visited.has(node);
        const isCur = currentNode === node;
        return `<tr class="${isCur ? 'bg-yellow-50/70 font-semibold' : ''}">
          <td class="px-3 py-1.5 text-center font-mono font-bold text-slate-800">${node}</td>
          <td class="px-3 py-1.5 text-center font-mono font-extrabold ${dVal === INF ? 'text-slate-400' : 'text-blue-600'}">${dVal === INF ? '∞' : dVal}</td>
          <td class="px-3 py-1.5 text-center font-mono font-bold ${isVisited ? 'text-emerald-600' : 'text-slate-400'}">${isVisited ? '已锁定' : '待处理'}</td>
        </tr>`;
      }).join('');
    }

    if (this.metricCurNodeEl) {
      this.metricCurNodeEl.textContent = currentNode !== null ? `${currentNode}` : '—';
    }
    if (this.metricVisitedCountEl) {
      this.metricVisitedCountEl.textContent = `${visited.size} / ${DJB_NODES.length}`;
    }
    if (this.metricRelaxCountEl) {
      this.metricRelaxCountEl.textContent = `${relaxCount}`;
    }

    if (this.liveTextEl) {
      this.liveTextEl.textContent = statusText;
    }
  }
}

registerAlgorithm({
  id: 'dijkstra-basic',
  name: 'Dijkstra 朴素最短路',
  viewId: 'algo-dijkstra-basic-view',
  icon: '📍',
  category: 'graph',
  difficulty: 2,
  levelOrder: 27,
  description: '左程云算法通关课 Class 061：基于贪心策略与三角不等式松弛的单源最短路算法，适用于无负权图与稠密图',
  learningGoal: '掌握贪心选点、最短路锁定准则以及边松弛操作的核心本质',
  template,
  Visualizer: DijkstraBasicVisualizer,
});
