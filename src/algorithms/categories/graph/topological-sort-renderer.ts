/**
 * 拓扑排序 (Kahn 算法) 可视化器 — 4-Card 标准现代架构
 * 入度统计、零入度队列进出、邻边剥离与 DAG 拓扑序列重构
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  TOPOLOGICAL_SORT_PROBLEM_HTML,
  TOPOLOGICAL_SORT_ANALYSIS_HTML,
  TOPOLOGICAL_SORT_CODE_LANGUAGES,
} from './topological-sort-problem-content';
import template from './topological-sort.html?raw';

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
  codeLine: number | number[];
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

  for (const e of TOPO_EDGES) {
    adj[e.from].push(e.to);
    inDegree[e.to]++;
  }

  const queue: number[] = [];
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  const order: number[] = [];

  steps.push({
    nodes: TOPO_NODES,
    edges: TOPO_EDGES,
    inDegree: [...inDegree],
    queue: [...queue],
    order: [],
    currentNode: null,
    activeEdge: null,
    action: 'init',
    statusText: `初始化：统计全图所有节点的入度 inDegree。将入度为 0 的节点 [${queue.join(
      ', '
    )}] 推入队列。`,
    log: `初始化入度: [${inDegree.join(', ')}]，初始入队 [${queue.join(', ')}]`,
    codeLine: [3, 4, 5, 6, 7, 8, 9],
  });

  while (queue.length > 0) {
    const cur = queue.shift()!;
    order.push(cur);

    steps.push({
      nodes: TOPO_NODES,
      edges: TOPO_EDGES,
      inDegree: [...inDegree],
      queue: [...queue],
      order: [...order],
      currentNode: cur,
      activeEdge: null,
      action: 'poll',
      statusText: `出队节点 ${cur} 并加入拓扑序列：order=[${order.join(
        ', '
      )}]。准备将其所有出边的终点入度减 1。`,
      log: `出队节点 ${cur} -> 写入拓扑序列`,
      codeLine: [12, 13],
    });

    for (const next of adj[cur]) {
      inDegree[next]--;
      const reducedToZero = inDegree[next] === 0;
      if (reducedToZero) {
        queue.push(next);
      }

      steps.push({
        nodes: TOPO_NODES,
        edges: TOPO_EDGES,
        inDegree: [...inDegree],
        queue: [...queue],
        order: [...order],
        currentNode: cur,
        activeEdge: { from: cur, to: next },
        action: reducedToZero ? 'enqueue' : 'reduce-degree',
        statusText: `删除出边 (${cur} -> ${next})：节点 ${next} 的入度减为 ${
          inDegree[next]
        }。${reducedToZero ? `入度降为 0，将节点 ${next} 推入队列！` : ''}`,
        log: `  边 (${cur}->${next}): inDegree[${next}]=${inDegree[next]}${
          reducedToZero ? ' -> 入队' : ''
        }`,
        codeLine: [14, 15],
      });
    }
  }

  steps.push({
    nodes: TOPO_NODES,
    edges: TOPO_EDGES,
    inDegree: [...inDegree],
    queue: [],
    order: [...order],
    currentNode: null,
    activeEdge: null,
    action: 'done',
    statusText: `🎉 拓扑排序执行完成！最终线性拓扑序列为: [ ${order.join(
      ' -> '
    )} ]。`,
    log: `✓ 拓扑排序完成: [ ${order.join(' -> ')} ]`,
    codeLine: 18,
  });

  return steps;
}

export class TopologicalSortVisualizer extends StepVisualizer<TopoStep> {
  protected codeLanguages = TOPOLOGICAL_SORT_CODE_LANGUAGES;
  protected codeLines = TOPOLOGICAL_SORT_CODE_LANGUAGES['java'];
  protected codePanelTitle = '拓扑排序 (Kahn 算法) 代码调试';

  private svgCanvas: HTMLElement | null = null;
  private degreePillsWrap: HTMLElement | null = null;
  private metricCurNodeEl: HTMLElement | null = null;
  private metricQueueSizeEl: HTMLElement | null = null;
  private metricOrderCountEl: HTMLElement | null = null;
  private metricCycleStatusEl: HTMLElement | null = null;
  private queueElementsEl: HTMLElement | null = null;
  private orderElementsEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.svgCanvas = this.root.querySelector('#topo-svg-canvas');
    this.degreePillsWrap = this.root.querySelector('#indegree-pills-wrap');
    this.metricCurNodeEl = this.root.querySelector('#metric-cur-node');
    this.metricQueueSizeEl = this.root.querySelector('#metric-queue-elements');
    this.metricOrderCountEl = this.root.querySelector('#metric-topo-len');
    this.metricCycleStatusEl = this.root.querySelector('#metric-cycle-status');
    this.queueElementsEl = this.root.querySelector('#metric-queue-elements');
    this.orderElementsEl = this.root.querySelector('#topo-result-order');
    this.liveTextEl = this.root.querySelector('#topo-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: TOPOLOGICAL_SORT_PROBLEM_HTML,
      analysisHtml: TOPOLOGICAL_SORT_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): TopoStep[] {
    return buildTopoSteps();
  }

  protected renderStep(step: TopoStep): void {
    const { inDegree, queue, order, currentNode, activeEdge, statusText, action } = step;

    // 1. 绘制有向图 SVG 拓扑图
    if (this.svgCanvas) {
      let svgHtml = `<svg viewBox="0 0 460 260" style="width:100%; height:100%; max-height:240px;">
        <defs>
          <marker id="arrow-topo" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
          <marker id="arrow-topo-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
          </marker>
        </defs>`;

      // 边绘制
      for (const e of TOPO_EDGES) {
        const p1 = TOPO_NODE_POSITIONS[e.from];
        const p2 = TOPO_NODE_POSITIONS[e.to];
        const isActive = activeEdge && activeEdge.from === e.from && activeEdge.to === e.to;

        const strokeColor = isActive ? '#2563eb' : '#cbd5e1';
        const strokeWidth = isActive ? 3.5 : 2;
        const marker = isActive ? 'url(#arrow-topo-active)' : 'url(#arrow-topo)';

        svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;
      }

      // 节点绘制
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
      this.svgCanvas.innerHTML = svgHtml;
    }

    // 2. 渲染 inDegree 药丸栏
    if (this.degreePillsWrap) {
      this.degreePillsWrap.innerHTML = TOPO_NODES.map((node) => {
        const deg = inDegree[node];
        let cls = 'topo-degree-pill';
        if (deg === 0) cls += ' is-zero';

        return `<div class="${cls}">
          <span style="color:#64748b;">${node}:</span>
          <span>${deg}</span>
        </div>`;
      }).join('');
    }

    // 3. 更新状态监视器
    if (this.metricCurNodeEl) this.metricCurNodeEl.textContent = currentNode != null ? `${currentNode}` : '—';
    if (this.metricQueueSizeEl) this.metricQueueSizeEl.textContent = `${queue.length}`;
    if (this.metricOrderCountEl) this.metricOrderCountEl.textContent = `${order.length} / ${TOPO_NODES.length}`;
    if (this.metricCycleStatusEl) this.metricCycleStatusEl.textContent = '无环 (DAG)';

    if (this.queueElementsEl) {
      this.queueElementsEl.textContent = queue.length > 0 ? `[ ${queue.join(', ')} ]` : '[ (空) ]';
    }
    if (this.orderElementsEl) {
      this.orderElementsEl.textContent = order.length > 0 ? `[ ${order.join(' -> ')} ]` : '[ ]';
    }

    if (this.liveTextEl) this.liveTextEl.textContent = statusText;

    // 4. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background =
        action === 'done'
          ? '#f0fdf4'
          : action === 'poll'
          ? '#eff6ff'
          : action === 'enqueue'
          ? '#fefce8'
          : '#f8fafc';
      logEntry.style.color =
        action === 'done'
          ? '#15803d'
          : action === 'poll'
          ? '#1d4ed8'
          : action === 'enqueue'
          ? '#854d0e'
          : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (action === 'done'
          ? '#bbf7d0'
          : action === 'poll'
          ? '#bfdbfe'
          : action === 'enqueue'
          ? '#fef08a'
          : '#e2e8f0');
      logEntry.innerHTML = `<span style="color:#94a3b8;">[Step ${stepIndex + 1}]</span> ${step.log}`;

      this.logContainer.appendChild(logEntry);
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.logContainer.children.length} 条记录`;
      }
    }

    const badgeTopo = this.root?.querySelector('#badge-topo-count');
    if (badgeTopo) badgeTopo.textContent = `已排序: ${order.length} / ${TOPO_NODES.length}`;
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
  }
}

registerAlgorithm({
  id: 'topological-sort',
  name: '拓扑排序',
  viewId: 'algo-topological-sort-view',
  category: 'graph',
  description: '使用 Kahn 入度剥离队列算法计算有向无环图 (DAG) 的拓扑依赖序列',
  icon: '🎯',
  difficulty: 2,
  levelOrder: 12,
  learningGoal: '掌握 DAG 依赖拓扑排序与零入度队列驱动的状态转移模型',
  template,
  Visualizer: TopologicalSortVisualizer,
});
