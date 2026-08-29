/**
 * Prim 最小生成树可视化器 — 4-Card 标准现代架构
 * 加点法贪心扩充、minDist 切边维护与生成树高亮
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  MST_PRIM_PROBLEM_HTML,
  MST_PRIM_ANALYSIS_HTML,
  MST_PRIM_CODE_LANGUAGES,
} from './mst-prim-problem-content';
import template from './mst-prim.html?raw';

export interface PrimStep extends StepBase {
  nodes: number[];
  edges: { u: number; v: number; w: number }[];
  minDist: number[];
  inMST: boolean[];
  mstEdges: { u: number; v: number; w: number }[];
  currentNode: number | null;
  activeEdge: { u: number; v: number; w: number } | null;
  totalWeight: number;
  action: 'init' | 'select' | 'update-edge' | 'skip' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
}

export const PRIM_NODES = [0, 1, 2, 3, 4];
export const PRIM_EDGES = [
  { u: 0, v: 1, w: 2 },
  { u: 0, v: 3, w: 6 },
  { u: 1, v: 2, w: 3 },
  { u: 1, v: 3, w: 8 },
  { u: 1, v: 4, w: 5 },
  { u: 2, v: 4, w: 7 },
  { u: 3, v: 4, w: 9 },
];

export const PRIM_NODE_POSITIONS: { x: number; y: number }[] = [
  { x: 70, y: 130 },
  { x: 210, y: 55 },
  { x: 370, y: 55 },
  { x: 210, y: 205 },
  { x: 370, y: 205 },
];

const INF = Infinity;

export function buildPrimSteps(): PrimStep[] {
  const steps: PrimStep[] = [];
  const n = PRIM_NODES.length;
  const minDist = new Array(n).fill(INF);
  const parent = new Array(n).fill(-1);
  const inMST = new Array(n).fill(false);
  const mstEdges: { u: number; v: number; w: number }[] = [];

  minDist[0] = 0;
  let totalWeight = 0;

  // Build undirected adjacency list
  const adj: { to: number; w: number }[][] = Array.from({ length: n }, () => []);
  for (const e of PRIM_EDGES) {
    adj[e.u].push({ to: e.v, w: e.w });
    adj[e.v].push({ to: e.u, w: e.w });
  }

  steps.push({
    nodes: PRIM_NODES,
    edges: PRIM_EDGES,
    minDist: [...minDist],
    inMST: [...inMST],
    mstEdges: [],
    currentNode: null,
    activeEdge: null,
    totalWeight: 0,
    action: 'init',
    statusText: `初始化 Prim 算法：选取节点 0 为生长起点，minDist[0] = 0，其余节点 minDist = ∞。`,
    log: `初始化 Prim: 起点 0`,
    codeLine: [3, 4, 5],
  });

  for (let i = 0; i < n; i++) {
    // Find unvisited node with min minDist
    let u = -1;
    let minVal = INF;
    for (let j = 0; j < n; j++) {
      if (!inMST[j] && minDist[j] < minVal) {
        minVal = minDist[j];
        u = j;
      }
    }

    if (u === -1) break;

    inMST[u] = true;
    totalWeight += minDist[u];

    if (parent[u] !== -1) {
      mstEdges.push({ u: parent[u], v: u, w: minDist[u] });
    }

    steps.push({
      nodes: PRIM_NODES,
      edges: PRIM_EDGES,
      minDist: [...minDist],
      inMST: [...inMST],
      mstEdges: [...mstEdges],
      currentNode: u,
      activeEdge: parent[u] !== -1 ? { u: parent[u], v: u, w: minDist[u] } : null,
      totalWeight,
      action: 'select',
      statusText: `贪心选取 minDist 最小节点 ${u} 并入生成树 (权值 +${minDist[u]})，当前生成树总权值 = ${totalWeight}。`,
      log: `选定节点 ${u} 加入 MST: 总权值=${totalWeight}`,
      codeLine: [8, 9, 10, 11, 12],
    });

    for (const edge of adj[u]) {
      const v = edge.to;
      const w = edge.w;

      if (!inMST[v]) {
        if (w < minDist[v]) {
          const old = minDist[v];
          minDist[v] = w;
          parent[v] = u;

          steps.push({
            nodes: PRIM_NODES,
            edges: PRIM_EDGES,
            minDist: [...minDist],
            inMST: [...inMST],
            mstEdges: [...mstEdges],
            currentNode: u,
            activeEdge: { u, v, w },
            totalWeight,
            action: 'update-edge',
            statusText: `节点 ${v} 发现更近切边 (${u} - ${v}, w=${w})：minDist[${v}] 从 ${
              old === INF ? '∞' : old
            } 缩短为 ${w}。`,
            log: `  更新切边 (${u}-${v}, w=${w}): minDist[${v}]=${w}`,
            codeLine: [14, 15, 16],
          });
        }
      }
    }
  }

  steps.push({
    nodes: PRIM_NODES,
    edges: PRIM_EDGES,
    minDist: [...minDist],
    inMST: [...inMST],
    mstEdges: [...mstEdges],
    currentNode: null,
    activeEdge: null,
    totalWeight,
    action: 'done',
    statusText: `🎉 Prim 算法执行完成！成功构建包含 ${mstEdges.length} 条边、最小总权值为 ${totalWeight} 的最小生成树。`,
    log: `✓ 最小生成树构建完成: 总权值 = ${totalWeight}`,
    codeLine: 21,
  });

  return steps;
}

export class PrimMSTVisualizer extends StepVisualizer<PrimStep> {
  protected codeLanguages = MST_PRIM_CODE_LANGUAGES;
  protected codeLines = MST_PRIM_CODE_LANGUAGES['java'];
  protected codePanelTitle = 'Prim 最小生成树 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private svgCanvas: HTMLElement | null = null;
  private distPillsWrap: HTMLElement | null = null;
  private metricCurNodeEl: HTMLElement | null = null;
  private metricInMSTCountEl: HTMLElement | null = null;
  private metricMSTEdgeCountEl: HTMLElement | null = null;
  private metricTotalWeightEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.svgCanvas = this.root.querySelector('#prim-svg-canvas');
    this.distPillsWrap = this.root.querySelector('#min-dist-pills-wrap');
    this.metricCurNodeEl = this.root.querySelector('#metric-cur-node');
    this.metricInMSTCountEl = this.root.querySelector('#metric-intree-count');
    this.metricMSTEdgeCountEl = this.root.querySelector('#metric-added-weight');
    this.metricTotalWeightEl = this.root.querySelector('#metric-total-weight');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#prim-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 绑定播放控制
    this.bindPlaybackControls();

    // 运行与重置
    this.root.querySelector('#btn-generate')?.addEventListener('click', () => this.start());
    this.root.querySelector('#btn-reset')?.addEventListener('click', () => this.reset());

    // 进度条 Scrubber
    const slider = this.root.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(val) && val >= 0 && val < this.steps.length) {
          this.goToStep(val);
        }
      });
    }

    // 步进控制
    this.root.querySelector('#btn-step-prev')?.addEventListener('click', () => this.prevStep());
    this.root.querySelector('#btn-step-next')?.addEventListener('click', () => this.nextStep());
    this.root.querySelector('#btn-play-pause')?.addEventListener('click', () => this.togglePlay());

    // 速度选择
    const speedSelect = this.root.querySelector('#select-speed') as HTMLSelectElement | null;
    if (speedSelect) {
      speedSelect.addEventListener('change', () => {
        this.playbackSpeed = parseInt(speedSelect.value, 10) || 600;
      });
    }

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: MST_PRIM_PROBLEM_HTML,
      analysisHtml: MST_PRIM_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): PrimStep[] {
    return buildPrimSteps();
  }

  protected renderStep(step: PrimStep): void {
    const { minDist, inMST, mstEdges, currentNode, activeEdge, totalWeight, statusText, action } = step;

    // 1. 绘制无向图 SVG 拓扑图
    if (this.svgCanvas) {
      let svgHtml = `<svg viewBox="0 0 460 260" style="width:100%; height:100%; max-height:240px;">`;

      // 边集合
      const mstEdgeSet = new Set(
        mstEdges.map((e) => `${Math.min(e.u, e.v)}-${Math.max(e.u, e.v)}`)
      );

      for (const e of PRIM_EDGES) {
        const p1 = PRIM_NODE_POSITIONS[e.u];
        const p2 = PRIM_NODE_POSITIONS[e.v];
        const key = `${Math.min(e.u, e.v)}-${Math.max(e.u, e.v)}`;
        const isMST = mstEdgeSet.has(key);
        const isActive = activeEdge && ((activeEdge.u === e.u && activeEdge.v === e.v) || (activeEdge.u === e.v && activeEdge.v === e.u));

        const strokeColor = isMST ? '#10b981' : isActive ? '#2563eb' : '#cbd5e1';
        const strokeWidth = isMST ? 4 : isActive ? 3 : 1.8;

        svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;

        const midX = (p1.x + p2.x) / 2 + (p1.y === p2.y ? 0 : p1.y > p2.y ? 10 : -10);
        const midY = (p1.y + p2.y) / 2 - 8;
        svgHtml += `<text x="${midX}" y="${midY}" fill="${isMST ? '#059669' : isActive ? '#1d4ed8' : '#64748b'}" font-size="11" font-weight="800" text-anchor="middle">${e.w}</text>`;
      }

      // 绘制节点
      PRIM_NODES.forEach((node) => {
        const p = PRIM_NODE_POSITIONS[node];
        const isIn = inMST[node];
        const isCurrent = currentNode === node;

        let fill = '#ffffff';
        let stroke = '#cbd5e1';
        if (isCurrent) {
          fill = '#fef08a';
          stroke = '#eab308';
        } else if (isIn) {
          fill = '#dcfce7';
          stroke = '#22c55e';
        }

        svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />`;
        svgHtml += `<text x="${p.x}" y="${p.y + 4}" fill="#0f172a" font-size="12" font-weight="800" text-anchor="middle">${node}</text>`;

        const dVal = minDist[node] === INF ? '∞' : minDist[node];
        svgHtml += `<text x="${p.x}" y="${p.y + 32}" fill="${isIn ? '#15803d' : '#64748b'}" font-size="10.5" font-family="monospace" font-weight="700" text-anchor="middle">d:${dVal}</text>`;
      });

      svgHtml += `</svg>`;
      this.svgCanvas.innerHTML = svgHtml;
    }

    // 2. 渲染 minDist 药丸栏
    if (this.distPillsWrap) {
      this.distPillsWrap.innerHTML = PRIM_NODES.map((node) => {
        const d = minDist[node] === INF ? '∞' : `${minDist[node]}`;
        const isIn = inMST[node];

        let cls = 'prim-dist-pill';
        if (isIn) cls += ' is-in-mst';

        return `<div class="${cls}">
          <span style="color:#64748b;">${node}:</span>
          <span>${d}</span>
        </div>`;
      }).join('');
    }

    // 3. 更新状态监视器
    if (this.metricCurNodeEl) this.metricCurNodeEl.textContent = currentNode != null ? `${currentNode}` : '—';
    if (this.metricInMSTCountEl) {
      const inCount = inMST.filter(Boolean).length;
      this.metricInMSTCountEl.textContent = `${inCount} / ${PRIM_NODES.length}`;
    }
    if (this.metricMSTEdgeCountEl) this.metricMSTEdgeCountEl.textContent = `${mstEdges.length}`;
    if (this.metricTotalWeightEl) this.metricTotalWeightEl.textContent = `${totalWeight}`;

    if (this.formulaActionEl) {
      if (action === 'update-edge' && activeEdge) {
        this.formulaActionEl.textContent = `切边更新: minDist[${activeEdge.v}] = weight(${activeEdge.u}, ${activeEdge.v}) = ${activeEdge.w}`;
      } else if (action === 'done') {
        this.formulaActionEl.textContent = `MST 构建完毕: 总权值 = ${totalWeight}`;
      } else {
        this.formulaActionEl.textContent = 'minDist[v] = min(minDist[v], weight(u, v))';
      }
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
          : action === 'select'
          ? '#fefce8'
          : action === 'update-edge'
          ? '#eff6ff'
          : '#f8fafc';
      logEntry.style.color =
        action === 'done'
          ? '#15803d'
          : action === 'select'
          ? '#854d0e'
          : action === 'update-edge'
          ? '#1d4ed8'
          : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (action === 'done'
          ? '#bbf7d0'
          : action === 'select'
          ? '#fef08a'
          : action === 'update-edge'
          ? '#bfdbfe'
          : '#e2e8f0');
      logEntry.innerHTML = `<span style="color:#94a3b8;">[Step ${stepIndex + 1}]</span> ${step.log}`;

      this.logContainer.appendChild(logEntry);
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.logContainer.children.length} 条记录`;
      }
    }

    // 5. 同步代码高亮
    if (this.terminalInstance) {
      const line = Array.isArray(step.codeLine) ? step.codeLine[0] : step.codeLine;
      this.terminalInstance.highlightLine(line);
    }

    // 6. 更新底部播放控制条
    const slider = this.root?.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.max = String(this.steps.length - 1);
      slider.value = String(this.currentStepIndex);
    }
    const stepCurEl = this.root?.querySelector('#step-cur');
    const stepTotalEl = this.root?.querySelector('#step-total');
    if (stepCurEl) stepCurEl.textContent = String(this.currentStepIndex + 1);
    if (stepTotalEl) stepTotalEl.textContent = String(this.steps.length);

    const badgeMST = this.root?.querySelector('#badge-mst-weight');
    if (badgeMST) badgeMST.textContent = `MST 总权值: ${totalWeight}`;
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
    if (this.terminalInstance) this.terminalInstance.highlightLine(0);
  }
}

registerAlgorithm({
  id: 'mst-prim',
  name: 'Prim 最小生成树',
  viewId: 'algo-mst-prim-view',
  category: 'graph',
  description: '使用加点法以点为中心贪心生长构建无向图的最小生成树',
  icon: '🌲',
  difficulty: 2,
  levelOrder: 10,
  learningGoal: '掌握 Prim 切割性质与 minDist 数组切边维护机制',
  template,
  Visualizer: PrimMSTVisualizer,
});
