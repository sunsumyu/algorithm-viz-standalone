/**
 * SPFA 队列优化最短路径可视化器 — 4-Card 标准现代架构
 * 队列按需触发松弛、在队标记防止重复进队与负权图高效求解 (左程云 class061)
 * 深度架构重构：严格解释器级全流程逐行高亮执行（源点入队与标记、队列循环、出队消标、邻边松弛条件核验、距离更新、进队与在队标记均发射独立Step）、四语言行号映射
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  SPFA_PROBLEM_HTML,
  SPFA_ANALYSIS_HTML,
  SPFA_CODE_LANGUAGES,
} from './spfa-problem-content';
import { BF_NODES, BF_EDGES, BF_NODE_POSITIONS } from './bellman-ford-renderer';
import template from './spfa.html?raw';
import { HighlightTarget } from '../../../core/code-panel';

export interface SPFAStep extends StepBase {
  nodes: number[];
  edges: { from: number; to: number; w: number }[];
  dist: number[];
  queue: number[];
  inQueue: boolean[];
  currentNode: number | null;
  relaxEdge: { from: number; to: number; w: number } | null;
  relaxCount: number;
  action: 'init' | 'poll' | 'relax' | 'skip' | 'done';
  statusText: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

const INF = Infinity;

export function buildSPFASteps(): SPFAStep[] {
  const steps: SPFAStep[] = [];
  const n = BF_NODES.length;
  const source = 0;

  // 精准 16 处四语言映射行号字典 (cpp / java / python / javascript 数组 1-based 索引)
  const lines = {
    entry: { cpp: 1, java: 2, python: 1, javascript: 1 },
    initDist: { cpp: 2, java: 4, python: 2, javascript: 2 },
    setSrc: { cpp: 4, java: 5, python: 4, javascript: 4 },
    initInQueue: { cpp: 3, java: 6, python: 3, javascript: 3 },
    initQueue: { cpp: 5, java: 7, python: 5, javascript: 5 },
    pushSrc: { cpp: 6, java: 8, python: 5, javascript: 5 },
    setSrcInQueue: { cpp: 7, java: 9, python: 6, javascript: 6 },
    whileQueue: { cpp: 8, java: 10, python: 7, javascript: 7 },
    pollQueue: { cpp: 9, java: 11, python: 8, javascript: 8 },
    clearInQueue: { cpp: 10, java: 12, python: 9, javascript: 9 },
    forAdj: { cpp: 11, java: 13, python: 10, javascript: 10 },
    checkRelax: { cpp: 12, java: 15, python: 11, javascript: 11 },
    updateDist: { cpp: 13, java: 16, python: 12, javascript: 12 },
    checkInQueue: { cpp: 14, java: 17, python: 13, javascript: 13 },
    pushQueue: { cpp: 15, java: 18, python: 14, javascript: 14 },
    returnDist: { cpp: 21, java: 24, python: 16, javascript: 20 },
  };

  const dist = new Array(n).fill(INF);
  dist[source] = 0;
  const inQueue = new Array(n).fill(false);
  const queue: number[] = [source];
  inQueue[source] = true;
  let relaxCount = 0;

  // Build adjacency list
  const adj: { to: number; w: number }[][] = Array.from({ length: n }, () => []);
  for (const e of BF_EDGES) {
    adj[e.from].push({ to: e.to, w: e.w });
  }

  function makeStep(
    codeLine: HighlightTarget,
    action: 'init' | 'poll' | 'relax' | 'skip' | 'done',
    statusText: string,
    log: string,
    currentNode: number | null = null,
    relaxEdge: { from: number; to: number; w: number } | null = null
  ): void {
    const qStr = queue.length > 0 ? `[${queue.join(', ')}]` : '[]';
    const dStr = dist.map((d, i) => `${i}:${d === INF ? '∞' : d}`).join(', ');

    steps.push({
      nodes: BF_NODES,
      edges: BF_EDGES,
      dist: [...dist],
      queue: [...queue],
      inQueue: [...inQueue],
      currentNode,
      relaxEdge,
      relaxCount,
      action,
      statusText,
      log,
      codeLine,
      metrics: {
        'metric-spfa-queue': qStr,
        'metric-spfa-cur': currentNode !== null ? `${currentNode}` : '—',
        'metric-spfa-relax': `${relaxCount}`,
        'metric-spfa-dist': `[${dStr}]`,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, 'init', '🚀 [算法启动] spfa(n=5, adj, src=0)：初始化 SPFA 队列优化最短路。', 'spfa 入口');
  makeStep(lines.initDist, 'init', '📊 [初始化距离表] Arrays.fill(dist, INF)；除源点外初始距离为无穷大。', 'init dist[]');
  makeStep(lines.setSrc, 'init', '🌱 [设置源点距离] dist[0] = 0。', 'dist[0] = 0');
  makeStep(lines.initInQueue, 'init', '🏷️ [初始化在队标记] boolean[] inQueue = new boolean[5]；防止重复入队。', 'init inQueue[]');
  makeStep(lines.initQueue, 'init', '📦 [初始化队列] Queue<Integer> queue = new LinkedList<>()。', 'init queue');
  makeStep(lines.pushSrc, 'init', '📥 [源点入队] queue.offer(0)；源点进入待松弛波前。', 'queue.offer(0)');
  makeStep(lines.setSrcInQueue, 'init', '🏷️ [标记源点在队] inQueue[0] = true。', 'inQueue[0] = true');

  // 2. 队列主循环
  while (queue.length > 0) {
    makeStep(lines.whileQueue, 'init', `🔁 [检查队列] while (!queue.isEmpty()) -> 当前就绪队列: [${queue.join(', ')}]。`, '!queue.isEmpty()');

    const u = queue.shift()!;
    makeStep(lines.pollQueue, 'poll', `📤 [出队推进] int u = queue.poll() -> 弹出节点 ${u}。`, `poll node ${u}`, u);

    inQueue[u] = false;
    makeStep(lines.clearInQueue, 'poll', `🏷️ [清除在队标记] inQueue[${u}] = false；节点 ${u} 出队后可再次接收松弛。`, `inQueue[${u}] = false`, u);

    for (const edge of adj[u]) {
      const v = edge.to;
      const w = edge.w;
      const curEdge = { from: u, to: v, w };

      makeStep(lines.forAdj, 'skip', `  ↳ [遍历出边] 考察边 (${u} ➔ ${v}, 权值 w=${w})。`, `edge (${u}->${v}, w=${w})`, u, curEdge);

      const canRelax = dist[u] !== INF && dist[u] + w < dist[v];
      makeStep(lines.checkRelax, canRelax ? 'relax' : 'skip', `  🔎 [松弛检验] if (dist[${u}](${dist[u]}) + ${w} < dist[${v}](${dist[v] === INF ? '∞' : dist[v]})) -> (${canRelax})。`, `check relax ${u}->${v}`, u, curEdge);

      if (canRelax) {
        const oldDist = dist[v];
        dist[v] = dist[u] + w;
        relaxCount++;

        makeStep(lines.updateDist, 'relax', `  ⚡ [更新距离] 成功松弛！dist[${v}] 从 ${oldDist === INF ? '∞' : oldDist} 缩短为 ${dist[v]}！`, `dist[${v}]=${dist[v]}`, u, curEdge);

        makeStep(lines.checkInQueue, 'relax', `  🔎 [检查是否在队] if (!inQueue[${v}]) -> (${!inQueue[v]})。`, `!inQueue[${v}]?`, u, curEdge);
        if (!inQueue[v]) {
          queue.push(v);
          inQueue[v] = true;
          makeStep(lines.pushQueue, 'relax', `  📥 [触发入队] 节点 ${v} 距离被优化，queue.offer(${v}), inQueue[${v}] = true！`, `offer ${v}`, u, curEdge);
        }
      } else {
        makeStep(lines.checkRelax, 'skip', `  ⏭️ [跳过边] 边 (${u} ➔ ${v}) 不满足松弛条件。`, `skip ${u}->${v}`, u, curEdge);
      }
    }
  }

  makeStep(lines.whileQueue, 'init', '🔁 [检查队列] while (!queue.isEmpty()) -> (false，队列已清空)。', 'queue empty');
  makeStep(lines.returnDist, 'done', `🎉 [SPFA 算法达成] return dist！队列已完全收敛，总松弛次数: ${relaxCount}。最终最短路: [${dist.join(', ')}]。`, 'return dist');

  return steps;
}

export class SPFAVisualizer extends StepVisualizer<SPFAStep> {
  protected codeLanguages = SPFA_CODE_LANGUAGES;
  protected codeLines = SPFA_CODE_LANGUAGES['java'];
  protected codePanelTitle = 'SPFA 算法代码调试';

  private svgCanvas: HTMLElement | null = null;
  private distTableBody: HTMLElement | null = null;
  private metricCurNodeEl: HTMLElement | null = null;
  private metricQueueSizeEl: HTMLElement | null = null;
  private metricRelaxCountEl: HTMLElement | null = null;
  private queueElementsEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.svgCanvas = this.root.querySelector('#spfa-svg-canvas');
    this.distTableBody = this.root.querySelector('#spfa-dist-table-body');
    this.metricCurNodeEl = this.root.querySelector('#metric-cur-node');
    this.metricQueueSizeEl = this.root.querySelector('#metric-queue-elements');
    this.metricRelaxCountEl = this.root.querySelector('#metric-relax-count');
    this.queueElementsEl = this.root.querySelector('#metric-queue-elements');
    this.liveTextEl = this.root.querySelector('#spfa-live-text');

    this.bindPlaybackControls();

    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: SPFA_PROBLEM_HTML,
      analysisHtml: SPFA_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): SPFAStep[] {
    return buildSPFASteps();
  }

  protected renderStep(step: SPFAStep): void {
    const { dist, queue, inQueue, currentNode, relaxEdge, relaxCount, action, statusText } = step;

    if (this.svgCanvas) {
      let svgHtml = `<svg viewBox="0 0 500 250" style="width:100%; height:100%; max-height:240px;">
        <defs>
          <marker id="arrow-spfa" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
          <marker id="arrow-spfa-relax" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
          </marker>
          <marker id="arrow-spfa-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
          </marker>
        </defs>`;

      for (const e of BF_EDGES) {
        const p1 = BF_NODE_POSITIONS[e.from];
        const p2 = BF_NODE_POSITIONS[e.to];
        const isCurrent = relaxEdge && relaxEdge.from === e.from && relaxEdge.to === e.to;
        const isRelaxed = isCurrent && action === 'relax';

        const strokeColor = isRelaxed ? '#10b981' : isCurrent ? '#3b82f6' : '#cbd5e1';
        const strokeWidth = isCurrent ? 3.5 : 1.8;
        const marker = isRelaxed ? 'url(#arrow-spfa-relax)' : isCurrent ? 'url(#arrow-spfa-active)' : 'url(#arrow-spfa)';

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 + (e.from === 1 && e.to === 2 ? 12 : -8);

        svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;
        svgHtml += `<rect x="${midX - 12}" y="${midY - 8}" width="24" height="15" rx="3" fill="#ffffff" stroke="${strokeColor}" stroke-width="1" />`;
        svgHtml += `<text x="${midX}" y="${midY + 3}" fill="${e.w < 0 ? '#ef4444' : '#0f172a'}" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${e.w}</text>`;
      }

      BF_NODES.forEach((node) => {
        const p = BF_NODE_POSITIONS[node];
        const dVal = dist[node];
        const isInQ = inQueue[node];
        const isCur = currentNode === node;
        const isTarget = relaxEdge && relaxEdge.to === node;

        let fill = '#ffffff';
        let stroke = '#cbd5e1';
        if (isTarget && action === 'relax') {
          fill = '#dcfce7';
          stroke = '#10b981';
        } else if (isCur) {
          fill = '#fef08a';
          stroke = '#eab308';
        } else if (isInQ) {
          fill = '#dbeafe';
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
      this.distTableBody.innerHTML = BF_NODES.map((node) => {
        const dVal = dist[node];
        const isInQ = inQueue[node];
        const isCur = currentNode === node;
        return `<tr class="${isCur ? 'bg-yellow-50/70 font-semibold' : ''}">
          <td class="px-3 py-1.5 text-center font-mono font-bold text-slate-800">${node}</td>
          <td class="px-3 py-1.5 text-center font-mono font-extrabold ${dVal === INF ? 'text-slate-400' : 'text-blue-600'}">${dVal === INF ? '∞' : dVal}</td>
          <td class="px-3 py-1.5 text-center font-mono font-bold ${isInQ ? 'text-blue-600' : 'text-slate-400'}">${isInQ ? 'true' : 'false'}</td>
        </tr>`;
      }).join('');
    }

    if (this.metricCurNodeEl) {
      this.metricCurNodeEl.textContent = currentNode !== null ? `${currentNode}` : '—';
    }
    if (this.metricQueueSizeEl) {
      this.metricQueueSizeEl.textContent = queue.length > 0 ? `[ ${queue.join(', ')} ]` : '空队列';
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
  id: 'spfa',
  name: 'SPFA 队列优化最短路',
  category: 'graph',
  difficulty: 3,
  levelOrder: 24,
  description: '左程云算法通关课 Class 061：Bellman-Ford 的队列优化算法，动态维护被更新距离的顶点，快速逼近全局最短路径',
  learningGoal: '深刻理解队列驱动松弛机制、在队标记 inQueue 的作用与负环检测原理',
  template,
  Visualizer: SPFAVisualizer,
});
