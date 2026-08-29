/**
 * Kruskal 最小生成树可视化器 — 4-Card 标准现代架构
 * 边权升序排序、并查集回路检测与加边法贪心合并
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  MST_KRUSKAL_PROBLEM_HTML,
  MST_KRUSKAL_ANALYSIS_HTML,
  MST_KRUSKAL_CODE_LANGUAGES,
} from './mst-kruskal-problem-content';
import { PRIM_NODES, PRIM_EDGES, PRIM_NODE_POSITIONS } from './mst-prim-renderer';
import template from './mst-kruskal.html?raw';

export interface KruskalStep extends StepBase {
  nodes: number[];
  allEdges: { u: number; v: number; w: number }[];
  currentEdge: { u: number; v: number; w: number } | null;
  currentEdgeIndex: number;
  rootU: number | null;
  rootV: number | null;
  mstEdges: { u: number; v: number; w: number }[];
  rejectedEdges: { u: number; v: number; w: number }[];
  totalWeight: number;
  parent: number[];
  action: 'init' | 'check' | 'accept' | 'reject' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
}

export function buildKruskalSteps(): KruskalStep[] {
  const steps: KruskalStep[] = [];
  const n = PRIM_NODES.length;
  const parent = Array.from({ length: n }, (_, i) => i);

  const find = (i: number): number => {
    let root = i;
    while (root !== parent[root]) {
      root = parent[root];
    }
    return root;
  };

  const union = (i: number, j: number): void => {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) {
      parent[rootI] = rootJ;
    }
  };

  // Sort edges ascending by weight
  const sortedEdges = [...PRIM_EDGES].sort((a, b) => a.w - b.w);
  const mstEdges: { u: number; v: number; w: number }[] = [];
  const rejectedEdges: { u: number; v: number; w: number }[] = [];
  let totalWeight = 0;

  steps.push({
    nodes: PRIM_NODES,
    allEdges: sortedEdges,
    currentEdge: null,
    currentEdgeIndex: -1,
    rootU: null,
    rootV: null,
    mstEdges: [],
    rejectedEdges: [],
    totalWeight: 0,
    parent: [...parent],
    action: 'init',
    statusText: `初始化 Kruskal 算法：将 ${sortedEdges.length} 条边按权值升序排列，并查集各节点独立成组。`,
    log: `初始化 Kruskal: 边集按权值升序排序`,
    codeLine: [3, 4, 5],
  });

  for (let idx = 0; idx < sortedEdges.length; idx++) {
    const edge = sortedEdges[idx];
    const { u, v, w } = edge;
    const rU = find(u);
    const rV = find(v);

    if (rU !== rV) {
      union(u, v);
      mstEdges.push(edge);
      totalWeight += w;

      steps.push({
        nodes: PRIM_NODES,
        allEdges: sortedEdges,
        currentEdge: edge,
        currentEdgeIndex: idx,
        rootU: rU,
        rootV: rV,
        mstEdges: [...mstEdges],
        rejectedEdges: [...rejectedEdges],
        totalWeight,
        parent: [...parent],
        action: 'accept',
        statusText: `考察边 (${u} - ${v}, w=${w})：find(${u})=${rU} !== find(${v})=${rV}（无环），成功选入 MST！总权值 = ${totalWeight}。`,
        log: `✓ 选入边 (${u}-${v}, w=${w}): 总权值=${totalWeight}`,
        codeLine: [8, 9, 10, 11],
      });

      if (mstEdges.length === n - 1) {
        break;
      }
    } else {
      rejectedEdges.push(edge);

      steps.push({
        nodes: PRIM_NODES,
        allEdges: sortedEdges,
        currentEdge: edge,
        currentEdgeIndex: idx,
        rootU: rU,
        rootV: rV,
        mstEdges: [...mstEdges],
        rejectedEdges: [...rejectedEdges],
        totalWeight,
        parent: [...parent],
        action: 'reject',
        statusText: `考察边 (${u} - ${v}, w=${w})：find(${u})=${rU} === find(${v})=${rV}（成环），舍弃此边。`,
        log: `✗ 舍弃边 (${u}-${v}, w=${w}): 属于同一连通块`,
        codeLine: 8,
      });
    }
  }

  steps.push({
    nodes: PRIM_NODES,
    allEdges: sortedEdges,
    currentEdge: null,
    currentEdgeIndex: sortedEdges.length,
    rootU: null,
    rootV: null,
    mstEdges: [...mstEdges],
    rejectedEdges: [...rejectedEdges],
    totalWeight,
    parent: [...parent],
    action: 'done',
    statusText: `🎉 Kruskal 算法执行完成！已选满 ${mstEdges.length} 条边，生成树最小总权值为 ${totalWeight}。`,
    log: `✓ Kruskal 构建完毕: 边数 ${mstEdges.length}, 总权值 ${totalWeight}`,
    codeLine: 14,
  });

  return steps;
}

export class KruskalMSTVisualizer extends StepVisualizer<KruskalStep> {
  protected codeLanguages = MST_KRUSKAL_CODE_LANGUAGES;
  protected codeLines = MST_KRUSKAL_CODE_LANGUAGES['java'];
  protected codePanelTitle = 'Kruskal 最小生成树 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private svgCanvas: HTMLElement | null = null;
  private edgePillsWrap: HTMLElement | null = null;
  private metricCurEdgeEl: HTMLElement | null = null;
  private metricRootsEl: HTMLElement | null = null;
  private metricMSTCountEl: HTMLElement | null = null;
  private metricTotalWeightEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.svgCanvas = this.root.querySelector('#kruskal-svg-canvas');
    this.edgePillsWrap = this.root.querySelector('#edge-pills-wrap');
    this.metricCurEdgeEl = this.root.querySelector('#metric-cur-edge');
    this.metricRootsEl = this.root.querySelector('#metric-roots');
    this.metricMSTCountEl = this.root.querySelector('#metric-mst-count');
    this.metricTotalWeightEl = this.root.querySelector('#metric-total-weight');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#kru-live-text');
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
        this.playbackSpeed = parseInt(speedSelect.value, 10) || 500;
      });
    }

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: MST_KRUSKAL_PROBLEM_HTML,
      analysisHtml: MST_KRUSKAL_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): KruskalStep[] {
    return buildKruskalSteps();
  }

  protected renderStep(step: KruskalStep): void {
    const { allEdges, currentEdge, currentEdgeIndex, rootU, rootV, mstEdges, rejectedEdges, totalWeight, statusText, action } = step;

    // 1. 绘制无向图 SVG 拓扑图
    if (this.svgCanvas) {
      let svgHtml = `<svg viewBox="0 0 460 260" style="width:100%; height:100%; max-height:240px;">`;

      const mstSet = new Set(mstEdges.map((e) => `${Math.min(e.u, e.v)}-${Math.max(e.u, e.v)}`));
      const rejSet = new Set(rejectedEdges.map((e) => `${Math.min(e.u, e.v)}-${Math.max(e.u, e.v)}`));

      for (const e of allEdges) {
        const p1 = PRIM_NODE_POSITIONS[e.u];
        const p2 = PRIM_NODE_POSITIONS[e.v];
        const key = `${Math.min(e.u, e.v)}-${Math.max(e.u, e.v)}`;
        const isMST = mstSet.has(key);
        const isRej = rejSet.has(key);
        const isCurr = currentEdge && ((currentEdge.u === e.u && currentEdge.v === e.v) || (currentEdge.u === e.v && currentEdge.v === e.u));

        let strokeColor = '#cbd5e1';
        let strokeWidth = 1.8;
        let strokeDash = 'none';

        if (isMST) {
          strokeColor = '#10b981';
          strokeWidth = 4;
        } else if (isCurr) {
          strokeColor = '#f59e0b';
          strokeWidth = 3.5;
        } else if (isRej) {
          strokeColor = '#fca5a5';
          strokeWidth = 1.5;
          strokeDash = '4,4';
        }

        svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" />`;

        const midX = (p1.x + p2.x) / 2 + (p1.y === p2.y ? 0 : p1.y > p2.y ? 10 : -10);
        const midY = (p1.y + p2.y) / 2 - 8;
        svgHtml += `<text x="${midX}" y="${midY}" fill="${isMST ? '#059669' : isCurr ? '#d97706' : '#64748b'}" font-size="11" font-weight="800" text-anchor="middle">${e.w}</text>`;
      }

      // 绘制节点
      PRIM_NODES.forEach((node) => {
        const p = PRIM_NODE_POSITIONS[node];
        const isCurrent = currentEdge && (currentEdge.u === node || currentEdge.v === node);

        let fill = '#ffffff';
        let stroke = '#cbd5e1';
        if (isCurrent) {
          fill = '#fef08a';
          stroke = '#eab308';
        }

        svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />`;
        svgHtml += `<text x="${p.x}" y="${p.y + 4}" fill="#0f172a" font-size="12" font-weight="800" text-anchor="middle">${node}</text>`;
      });

      svgHtml += `</svg>`;
      this.svgCanvas.innerHTML = svgHtml;
    }

    // 2. 渲染边排序 Track
    if (this.edgePillsWrap) {
      const mstSet = new Set(mstEdges.map((e) => `${Math.min(e.u, e.v)}-${Math.max(e.u, e.v)}`));
      const rejSet = new Set(rejectedEdges.map((e) => `${Math.min(e.u, e.v)}-${Math.max(e.u, e.v)}`));

      this.edgePillsWrap.innerHTML = allEdges.map((e, idx) => {
        const key = `${Math.min(e.u, e.v)}-${Math.max(e.u, e.v)}`;
        const isMST = mstSet.has(key);
        const isRej = rejSet.has(key);
        const isCurr = idx === currentEdgeIndex;

        let cls = 'kru-edge-pill';
        if (isCurr) cls += ' is-current';
        else if (isMST) cls += ' is-selected';
        else if (isRej) cls += ' is-rejected';

        return `<div class="${cls}">(${e.u}-${e.v}, w:${e.w})</div>`;
      }).join('');
    }

    // 3. 更新状态监视器
    if (this.metricCurEdgeEl) {
      this.metricCurEdgeEl.textContent = currentEdge ? `(${currentEdge.u} - ${currentEdge.v}, w=${currentEdge.w})` : '—';
    }
    if (this.metricRootsEl) {
      this.metricRootsEl.textContent = rootU != null && rootV != null ? `[${rootU}, ${rootV}]` : '—';
    }
    if (this.metricMSTCountEl) this.metricMSTCountEl.textContent = `${mstEdges.length} / ${PRIM_NODES.length - 1}`;
    if (this.metricTotalWeightEl) this.metricTotalWeightEl.textContent = `${totalWeight}`;

    if (this.formulaActionEl) {
      if (action === 'accept' && currentEdge) {
        this.formulaActionEl.textContent = `选入: find(${currentEdge.u})!=${rootV} -> union(${currentEdge.u}, ${currentEdge.v})`;
      } else if (action === 'reject' && currentEdge) {
        this.formulaActionEl.textContent = `成环舍弃: find(${currentEdge.u})===${rootV}`;
      } else if (action === 'done') {
        this.formulaActionEl.textContent = `Kruskal 完成: 总权值 = ${totalWeight}`;
      } else {
        this.formulaActionEl.textContent = 'find(u) !== find(v) -> union(u, v)';
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
          : action === 'accept'
          ? '#eff6ff'
          : action === 'reject'
          ? '#fef2f2'
          : '#f8fafc';
      logEntry.style.color =
        action === 'done'
          ? '#15803d'
          : action === 'accept'
          ? '#1d4ed8'
          : action === 'reject'
          ? '#dc2626'
          : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (action === 'done'
          ? '#bbf7d0'
          : action === 'accept'
          ? '#bfdbfe'
          : action === 'reject'
          ? '#fecaca'
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
    const indicator = this.root?.querySelector('#step-indicator');
    if (indicator) {
      indicator.textContent = `步骤 ${this.currentStepIndex + 1} / ${this.steps.length}`;
    }
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
    if (this.terminalInstance) this.terminalInstance.highlightLine(0);
  }
}

registerAlgorithm({
  id: 'mst-kruskal',
  name: 'Kruskal 最小生成树',
  viewId: 'algo-mst-kruskal-view',
  category: 'graph',
  description: '使用边权升序排序结合并查集判环的加边法构建最小生成树',
  icon: '🔗',
  difficulty: 2,
  levelOrder: 11,
  learningGoal: '掌握 Kruskal 贪心加边法与并查集连通分量合并的应用',
  template,
  Visualizer: KruskalMSTVisualizer,
});
