/**
 * 冗余连接 (LC 684) 可视化器 — 4-Card 标准现代架构
 * 并查集根节点追踪、动态加边合并与冗余环路截断
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  REDUNDANT_EDGE_PROBLEM_HTML,
  REDUNDANT_EDGE_ANALYSIS_HTML,
  REDUNDANT_EDGE_CODE_LANGUAGES,
} from './redundant-edge-problem-content';
import template from './redundant-edge.html?raw';

export interface RedundantStep extends StepBase {
  nodes: number[];
  edges: [number, number][];
  currentEdge: [number, number] | null;
  rootU: number | null;
  rootV: number | null;
  treeEdges: [number, number][];
  redundantEdge: [number, number] | null;
  parent: number[];
  action: 'init' | 'check' | 'union' | 'found-redundant' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
}

export const RE_NODES = [1, 2, 3, 4, 5];
export const RE_EDGES: [number, number][] = [
  [1, 2],
  [2, 3],
  [3, 4],
  [1, 4],
  [1, 5],
];

export const RE_NODE_POSITIONS: { x: number; y: number }[] = [
  { x: 120, y: 70 },
  { x: 280, y: 70 },
  { x: 280, y: 200 },
  { x: 120, y: 200 },
  { x: 380, y: 135 },
];

export function buildRedundantSteps(): RedundantStep[] {
  const steps: RedundantStep[] = [];
  const n = RE_NODES.length;
  const parent = Array.from({ length: n + 1 }, (_, i) => i);

  const find = (i: number): number => {
    let root = i;
    while (root !== parent[root]) {
      root = parent[root];
    }
    return root;
  };

  const treeEdges: [number, number][] = [];
  let foundRedundant: [number, number] | null = null;

  steps.push({
    nodes: RE_NODES,
    edges: RE_EDGES,
    currentEdge: null,
    rootU: null,
    rootV: null,
    treeEdges: [],
    redundantEdge: null,
    parent: [...parent],
    action: 'init',
    statusText: `初始化并查集：共有 ${n} 个节点，每个节点 parent[i] = i。准备按顺序扫描边集。`,
    log: `初始化并查集 parent=[${parent.slice(1).join(', ')}]`,
    codeLine: [3, 4, 5],
  });

  for (const edge of RE_EDGES) {
    const [u, v] = edge;
    const rU = find(u);
    const rV = find(v);

    if (rU === rV) {
      foundRedundant = edge;
      steps.push({
        nodes: RE_NODES,
        edges: RE_EDGES,
        currentEdge: edge,
        rootU: rU,
        rootV: rV,
        treeEdges: [...treeEdges],
        redundantEdge: edge,
        parent: [...parent],
        action: 'found-redundant',
        statusText: `🎯 考察边 [${u}, ${v}]：find(${u})=${rU} 与 find(${v})=${rV} 根相同！说明此边导致环形成，为冗余边！`,
        log: `[冗余边发现] [${u}, ${v}]: rootU(${rU}) == rootV(${rV})`,
        codeLine: [8, 9],
      });
      break;
    } else {
      parent[rU] = rV;
      treeEdges.push(edge);

      steps.push({
        nodes: RE_NODES,
        edges: RE_EDGES,
        currentEdge: edge,
        rootU: rU,
        rootV: rV,
        treeEdges: [...treeEdges],
        redundantEdge: null,
        parent: [...parent],
        action: 'union',
        statusText: `考察边 [${u}, ${v}]：find(${u})=${rU} !== find(${v})=${rV}。合并集合 parent[${rU}] = ${rV}。`,
        log: `合并边 [${u}, ${v}]: parent[${rU}]=${rV}`,
        codeLine: [8, 10],
      });
    }
  }

  steps.push({
    nodes: RE_NODES,
    edges: RE_EDGES,
    currentEdge: null,
    rootU: null,
    rootV: null,
    treeEdges: [...treeEdges],
    redundantEdge: foundRedundant,
    parent: [...parent],
    action: 'done',
    statusText: `🎉 算法执行完成！成功定位可以删去的冗余连接边: [${foundRedundant?.join(', ')}]。`,
    log: `✓ 检测完毕: 冗余边为 [${foundRedundant?.join(', ')}]`,
    codeLine: 12,
  });

  return steps;
}

export class RedundantEdgeVisualizer extends StepVisualizer<RedundantStep> {
  protected codeLanguages = REDUNDANT_EDGE_CODE_LANGUAGES;
  protected codeLines = REDUNDANT_EDGE_CODE_LANGUAGES['java'];
  protected codePanelTitle = '冗余连接 (LC 684) 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private svgCanvas: HTMLElement | null = null;
  private parentPillsWrap: HTMLElement | null = null;
  private metricCurEdgeEl: HTMLElement | null = null;
  private metricRootsEl: HTMLElement | null = null;
  private metricMergedCountEl: HTMLElement | null = null;
  private metricResultEdgeEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.svgCanvas = this.root.querySelector('#re-svg-canvas');
    this.parentPillsWrap = this.root.querySelector('#parent-pills-wrap');
    this.metricCurEdgeEl = this.root.querySelector('#metric-cur-edge');
    this.metricRootsEl = this.root.querySelector('#metric-roots');
    this.metricMergedCountEl = this.root.querySelector('#metric-merged-count');
    this.metricResultEdgeEl = this.root.querySelector('#metric-result-edge');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#re-live-text');
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
      problemHtml: REDUNDANT_EDGE_PROBLEM_HTML,
      analysisHtml: REDUNDANT_EDGE_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): RedundantStep[] {
    return buildRedundantSteps();
  }

  protected renderStep(step: RedundantStep): void {
    const { edges, currentEdge, rootU, rootV, treeEdges, redundantEdge, parent, statusText, action } = step;

    // 1. 绘制无向图 SVG 拓扑图
    if (this.svgCanvas) {
      let svgHtml = `<svg viewBox="0 0 460 260" style="width:100%; height:100%; max-height:240px;">`;

      const treeSet = new Set(treeEdges.map(([u, v]) => `${Math.min(u, v)}-${Math.max(u, v)}`));

      for (const e of edges) {
        const [u, v] = e;
        const p1 = RE_NODE_POSITIONS[u - 1];
        const p2 = RE_NODE_POSITIONS[v - 1];
        const key = `${Math.min(u, v)}-${Math.max(u, v)}`;
        const isTree = treeSet.has(key);
        const isRedundant = redundantEdge && ((redundantEdge[0] === u && redundantEdge[1] === v) || (redundantEdge[0] === v && redundantEdge[1] === u));
        const isCurrent = currentEdge && ((currentEdge[0] === u && currentEdge[1] === v) || (currentEdge[0] === v && currentEdge[1] === u));

        let strokeColor = '#cbd5e1';
        let strokeWidth = 1.8;
        let strokeDash = 'none';

        if (isRedundant) {
          strokeColor = '#ef4444';
          strokeWidth = 4;
          strokeDash = '4,4';
        } else if (isTree) {
          strokeColor = '#10b981';
          strokeWidth = 3.5;
        } else if (isCurrent) {
          strokeColor = '#f59e0b';
          strokeWidth = 3;
        }

        svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" />`;
      }

      // 绘制节点
      RE_NODES.forEach((node) => {
        const p = RE_NODE_POSITIONS[node - 1];
        const isCurrent = currentEdge && (currentEdge[0] === node || currentEdge[1] === node);

        let fill = '#ffffff';
        let stroke = '#cbd5e1';
        if (isCurrent) {
          fill = '#fef08a';
          stroke = '#eab308';
        }

        svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />`;
        svgHtml += `<text x="${p.x}" y="${p.y + 4}" fill="#0f172a" font-size="12" font-weight="800" text-anchor="middle">${node}</text>`;

        svgHtml += `<text x="${p.x}" y="${p.y + 32}" fill="#64748b" font-size="10.5" font-family="monospace" font-weight="700" text-anchor="middle">p:${parent[node]}</text>`;
      });

      svgHtml += `</svg>`;
      this.svgCanvas.innerHTML = svgHtml;
    }

    // 2. 渲染 parent 药丸栏
    if (this.parentPillsWrap) {
      this.parentPillsWrap.innerHTML = RE_NODES.map((node) => {
        return `<div class="re-parent-pill">
          <span style="color:#64748b;">${node}:</span>
          <span>${parent[node]}</span>
        </div>`;
      }).join('');
    }

    // 3. 更新状态监视器
    if (this.metricCurEdgeEl) {
      this.metricCurEdgeEl.textContent = currentEdge ? `[${currentEdge[0]}, ${currentEdge[1]}]` : '—';
    }
    if (this.metricRootsEl) {
      this.metricRootsEl.textContent = rootU != null && rootV != null ? `[${rootU}, ${rootV}]` : '—';
    }
    if (this.metricMergedCountEl) this.metricMergedCountEl.textContent = `${treeEdges.length}`;
    if (this.metricResultEdgeEl) {
      this.metricResultEdgeEl.textContent = redundantEdge ? `[${redundantEdge.join(', ')}]` : '未发现';
    }

    if (this.formulaActionEl) {
      if (action === 'found-redundant' && currentEdge) {
        this.formulaActionEl.textContent = `发现成环: find(${currentEdge[0]}) === find(${currentEdge[1]}) === ${rootU}`;
      } else if (action === 'union' && currentEdge) {
        this.formulaActionEl.textContent = `合并: parent[${rootU}] = ${rootV}`;
      } else {
        this.formulaActionEl.textContent = 'rootU === rootV -> 发现成环冗余边';
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
        action === 'done' || action === 'found-redundant'
          ? '#fef2f2'
          : action === 'union'
          ? '#eff6ff'
          : '#f8fafc';
      logEntry.style.color =
        action === 'done' || action === 'found-redundant'
          ? '#dc2626'
          : action === 'union'
          ? '#1d4ed8'
          : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (action === 'done' || action === 'found-redundant'
          ? '#fecaca'
          : action === 'union'
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
  id: 'redundant-edge',
  name: '冗余连接 (LC 684)',
  viewId: 'algo-redundant-edge-view',
  category: 'graph',
  description: '使用并查集动态查找无向树中导致成环的多余边',
  icon: '✂️',
  difficulty: 2,
  levelOrder: 13,
  learningGoal: '掌握并查集在无向图连通分量与环路检测中的核心应用',
  template,
  Visualizer: RedundantEdgeVisualizer,
});
