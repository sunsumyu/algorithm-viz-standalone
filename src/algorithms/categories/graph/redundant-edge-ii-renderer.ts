/**
 * 冗余连接 II (LC 685) 可视化器 — 4-Card 标准现代架构
 * 有向图双父节点冲突统计、并查集有向环判定与多场景分类精讲
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  REDUNDANT_EDGE_II_PROBLEM_HTML,
  REDUNDANT_EDGE_II_ANALYSIS_HTML,
  REDUNDANT_EDGE_II_CODE_LANGUAGES,
} from './redundant-edge-ii-problem-content';
import template from './redundant-edge-ii.html?raw';

export interface RedundantIIStep extends StepBase {
  nodes: number[];
  edges: [number, number][];
  inDegree: number[];
  conflictIndex: number;
  cycleIndex: number;
  currentEdgeIndex: number;
  currentEdge: [number, number] | null;
  resultEdge: [number, number] | null;
  parent: number[];
  action: 'init' | 'check-indegree' | 'check-cycle' | 'union' | 'found-conflict' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
}

export const RE2_NODES = [1, 2, 3];
export const RE2_EDGES: [number, number][] = [
  [1, 2],
  [1, 3],
  [2, 3],
];

export const RE2_NODE_POSITIONS: { x: number; y: number }[] = [
  { x: 120, y: 70 },
  { x: 300, y: 70 },
  { x: 210, y: 190 },
];

export function buildRedundantIISteps(): RedundantIIStep[] {
  const steps: RedundantIIStep[] = [];
  const n = RE2_NODES.length;
  const edges = RE2_EDGES;
  const inDegree = new Array(n + 1).fill(0);
  let conflict = -1;
  let cycle = -1;

  steps.push({
    nodes: RE2_NODES,
    edges,
    inDegree: [...inDegree],
    conflictIndex: -1,
    cycleIndex: -1,
    currentEdgeIndex: -1,
    currentEdge: null,
    resultEdge: null,
    parent: Array.from({ length: n + 1 }, (_, i) => i),
    action: 'init',
    statusText: `初始化：共 ${n} 个节点，开始第一阶段——统计各节点入度，检测是否存在入度为 2 的双父冲突。`,
    log: `初始化 LC 685: 统计节点入度`,
    codeLine: [3, 4, 5],
  });

  // Step 1: Detect indegree == 2
  for (let i = 0; i < edges.length; i++) {
    const [u, v] = edges[i];
    if (inDegree[v] > 0) {
      conflict = i;
      steps.push({
        nodes: RE2_NODES,
        edges,
        inDegree: [...inDegree],
        conflictIndex: conflict,
        cycleIndex: -1,
        currentEdgeIndex: i,
        currentEdge: [u, v],
        resultEdge: null,
        parent: Array.from({ length: n + 1 }, (_, i) => i),
        action: 'found-conflict',
        statusText: `🚨 边 #${i + 1} [${u}, ${v}]：节点 ${v} 已经有入边，现再次被指向！入度为 2，标记 conflict 边为 [${u}, ${v}]。`,
        log: `[双父冲突] 发现节点 ${v} 入度为 2 (边 #${i + 1} [${u}, ${v}])`,
        codeLine: [8, 9, 10],
      });
    } else {
      inDegree[v]++;
    }
  }

  // Step 2: Union-Find check
  const parent = Array.from({ length: n + 1 }, (_, i) => i);
  const find = (i: number): number => {
    let root = i;
    while (root !== parent[root]) root = parent[root];
    return root;
  };

  for (let i = 0; i < edges.length; i++) {
    if (i === conflict) continue; // Skip conflict edge temporarily
    const [u, v] = edges[i];
    const rU = find(u);
    const rV = find(v);

    if (rU === rV) {
      cycle = i;
      steps.push({
        nodes: RE2_NODES,
        edges,
        inDegree: [...inDegree],
        conflictIndex: conflict,
        cycleIndex: cycle,
        currentEdgeIndex: i,
        currentEdge: [u, v],
        resultEdge: null,
        parent: [...parent],
        action: 'check-cycle',
        statusText: `⚠️ 边 #${i + 1} [${u}, ${v}]：find(${u}) === find(${v})，在跳过 conflict 边后仍发现有向环！`,
        log: `[环路检测] 边 #${i + 1} [${u}, ${v}] 构成环路`,
        codeLine: [15, 16],
      });
    } else {
      parent[rU] = rV;
      steps.push({
        nodes: RE2_NODES,
        edges,
        inDegree: [...inDegree],
        conflictIndex: conflict,
        cycleIndex: cycle,
        currentEdgeIndex: i,
        currentEdge: [u, v],
        resultEdge: null,
        parent: [...parent],
        action: 'union',
        statusText: `考察边 #${i + 1} [${u}, ${v}]：并查集无环，合并 parent[${rU}] = ${rV}。`,
        log: `合并边 #${i + 1} [${u}, ${v}]`,
        codeLine: 17,
      });
    }
  }

  // Determine result
  let result: [number, number];
  if (conflict < 0) {
    result = edges[cycle];
  } else if (cycle >= 0) {
    // Both conflict and cycle exist -> first parent edge is redundant
    const targetV = edges[conflict][1];
    let firstParentEdge: [number, number] = edges[conflict];
    for (let i = 0; i < conflict; i++) {
      if (edges[i][1] === targetV) {
        firstParentEdge = edges[i];
        break;
      }
    }
    result = firstParentEdge;
  } else {
    result = edges[conflict];
  }

  steps.push({
    nodes: RE2_NODES,
    edges,
    inDegree: [...inDegree],
    conflictIndex: conflict,
    cycleIndex: cycle,
    currentEdgeIndex: -1,
    currentEdge: null,
    resultEdge: result,
    parent: [...parent],
    action: 'done',
    statusText: `🎉 判定完成！根据分类决策，最终需删去的冗余有向边为: [${result.join(', ')}]。`,
    log: `✓ 冗余有向边为: [${result.join(', ')}]`,
    codeLine: [19, 20, 21],
  });

  return steps;
}

export class RedundantEdgeIIVisualizer extends StepVisualizer<RedundantIIStep> {
  protected codeLanguages = REDUNDANT_EDGE_II_CODE_LANGUAGES;
  protected codeLines = REDUNDANT_EDGE_II_CODE_LANGUAGES['java'];
  protected codePanelTitle = '冗余连接 II (LC 685) 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private svgCanvas: HTMLElement | null = null;
  private degreePillsWrap: HTMLElement | null = null;
  private metricConflictEl: HTMLElement | null = null;
  private metricCycleEl: HTMLElement | null = null;
  private metricCurEdgeEl: HTMLElement | null = null;
  private metricResultEdgeEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.svgCanvas = this.root.querySelector('#re2-svg-canvas');
    this.degreePillsWrap = this.root.querySelector('#degree-pills-wrap');
    this.metricConflictEl = this.root.querySelector('#metric-conflict');
    this.metricCycleEl = this.root.querySelector('#metric-cycle');
    this.metricCurEdgeEl = this.root.querySelector('#metric-cur-edge');
    this.metricResultEdgeEl = this.root.querySelector('#metric-result-edge');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#re2-live-text');
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
      problemHtml: REDUNDANT_EDGE_II_PROBLEM_HTML,
      analysisHtml: REDUNDANT_EDGE_II_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): RedundantIIStep[] {
    return buildRedundantIISteps();
  }

  protected renderStep(step: RedundantIIStep): void {
    const { edges, inDegree, conflictIndex, cycleIndex, currentEdge, resultEdge, statusText, action } = step;

    // 1. 绘制有向图 SVG 拓扑图
    if (this.svgCanvas) {
      let svgHtml = `<svg viewBox="0 0 420 250" style="width:100%; height:100%; max-height:240px;">
        <defs>
          <marker id="arrow-re2" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
          <marker id="arrow-re2-red" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
          </marker>
          <marker id="arrow-re2-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
          </marker>
        </defs>`;

      for (let i = 0; i < edges.length; i++) {
        const [u, v] = edges[i];
        const p1 = RE2_NODE_POSITIONS[u - 1];
        const p2 = RE2_NODE_POSITIONS[v - 1];
        const isConflict = i === conflictIndex;
        const isResult = resultEdge && resultEdge[0] === u && resultEdge[1] === v;
        const isCurrent = currentEdge && currentEdge[0] === u && currentEdge[1] === v;

        let strokeColor = '#cbd5e1';
        let strokeWidth = 2;
        let strokeDash = 'none';
        let marker = 'url(#arrow-re2)';

        if (isResult) {
          strokeColor = '#ef4444';
          strokeWidth = 4;
          strokeDash = '4,4';
          marker = 'url(#arrow-re2-red)';
        } else if (isConflict) {
          strokeColor = '#f87171';
          strokeWidth = 3;
          marker = 'url(#arrow-re2-red)';
        } else if (isCurrent) {
          strokeColor = '#2563eb';
          strokeWidth = 3.5;
          marker = 'url(#arrow-re2-active)';
        }

        svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" marker-end="${marker}" />`;

        const midX = (p1.x + p2.x) / 2 + (p1.y === p2.y ? 0 : p1.x > p2.x ? 12 : -12);
        const midY = (p1.y + p2.y) / 2 - 8;
        svgHtml += `<text x="${midX}" y="${midY}" fill="${isResult ? '#dc2626' : '#64748b'}" font-size="10.5" font-weight="800" text-anchor="middle">#${i + 1}</text>`;
      }

      // 绘制节点
      RE2_NODES.forEach((node) => {
        const p = RE2_NODE_POSITIONS[node - 1];
        const isCurrent = currentEdge && (currentEdge[0] === node || currentEdge[1] === node);
        const isDualParent = inDegree[node] >= 2;

        let fill = '#ffffff';
        let stroke = '#cbd5e1';
        if (isDualParent) {
          fill = '#fee2e2';
          stroke = '#ef4444';
        } else if (isCurrent) {
          fill = '#fef08a';
          stroke = '#eab308';
        }

        svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />`;
        svgHtml += `<text x="${p.x}" y="${p.y + 4}" fill="#0f172a" font-size="12" font-weight="800" text-anchor="middle">${node}</text>`;

        svgHtml += `<text x="${p.x}" y="${p.y + 32}" fill="${isDualParent ? '#dc2626' : '#64748b'}" font-size="10.5" font-family="monospace" font-weight="700" text-anchor="middle">in:${inDegree[node]}</text>`;
      });

      svgHtml += `</svg>`;
      this.svgCanvas.innerHTML = svgHtml;
    }

    // 2. 渲染 inDegree 药丸栏
    if (this.degreePillsWrap) {
      this.degreePillsWrap.innerHTML = RE2_NODES.map((node) => {
        const deg = inDegree[node];
        let cls = 're2-degree-pill';
        if (deg >= 2) cls += ' is-conflict';

        return `<div class="${cls}">
          <span style="color:#64748b;">${node}:</span>
          <span>${deg}</span>
        </div>`;
      }).join('');
    }

    // 3. 更新状态监视器
    if (this.metricConflictEl) {
      this.metricConflictEl.textContent = conflictIndex >= 0 ? `边 #${conflictIndex + 1} [${edges[conflictIndex].join(', ')}]` : '无';
    }
    if (this.metricCycleEl) {
      this.metricCycleEl.textContent = cycleIndex >= 0 ? `边 #${cycleIndex + 1} [${edges[cycleIndex].join(', ')}]` : '无';
    }
    if (this.metricCurEdgeEl) {
      this.metricCurEdgeEl.textContent = currentEdge ? `[${currentEdge[0]}, ${currentEdge[1]}]` : '—';
    }
    if (this.metricResultEdgeEl) {
      this.metricResultEdgeEl.textContent = resultEdge ? `[${resultEdge.join(', ')}]` : '未确定';
    }

    if (this.formulaActionEl) {
      if (action === 'found-conflict') {
        this.formulaActionEl.textContent = `发现双父冲突: inDegree[${currentEdge?.[1]}] === 2`;
      } else if (action === 'check-cycle') {
        this.formulaActionEl.textContent = `跳过 conflict 仍有环: 需删第一条父边`;
      } else if (action === 'done' && resultEdge) {
        this.formulaActionEl.textContent = `判定完成: 删去边 [${resultEdge.join(', ')}]`;
      } else {
        this.formulaActionEl.textContent = 'conflict >= 0 ? 优先删 conflict 边 : 删成环边';
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
          : action === 'found-conflict' || action === 'check-cycle'
          ? '#fef2f2'
          : '#f8fafc';
      logEntry.style.color =
        action === 'done'
          ? '#15803d'
          : action === 'found-conflict' || action === 'check-cycle'
          ? '#dc2626'
          : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (action === 'done'
          ? '#bbf7d0'
          : action === 'found-conflict' || action === 'check-cycle'
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
  id: 'redundant-edge-ii',
  name: '冗余连接 II (LC 685)',
  viewId: 'algo-redundant-edge-ii-view',
  category: 'graph',
  description: '处理有向树中双父节点入度冲突与有向环并存的复杂冗余边判定',
  icon: '🔱',
  difficulty: 3,
  levelOrder: 14,
  learningGoal: '掌握有向树入度冲突分析与并查集有向环检验的分类讨论模型',
  template,
  Visualizer: RedundantEdgeIIVisualizer,
});
