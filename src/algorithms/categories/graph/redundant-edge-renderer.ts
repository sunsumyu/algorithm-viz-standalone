/**
 * 冗余连接 (LC 684) 可视化器 — 4-Card 标准现代架构
 * 并查集根节点追踪、动态加边合并与冗余环路截断 (左程云 class056)
 * 深度架构重构：严格解释器级全流程逐行高亮执行（并查集初始化、逐边遍历、边元解构、find寻根、根相等判环、根不等union合并、冗余边截获返回均发射独立Step）、四语言行号映射
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  REDUNDANT_EDGE_PROBLEM_HTML,
  REDUNDANT_EDGE_ANALYSIS_HTML,
  REDUNDANT_EDGE_CODE_LANGUAGES,
} from './redundant-edge-problem-content';
import template from './redundant-edge.html?raw';
import { HighlightTarget } from '../../../core/code-panel';

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
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
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

  // 精准 8 处四语言映射行号字典 (cpp / java / python / javascript 数组 1-based 索引)
  const lines = {
    entry: { cpp: 3, java: 2, python: 2, javascript: 1 },
    initParent: { cpp: 5, java: 4, python: 3, javascript: 2 },
    forEdge: { cpp: 6, java: 5, python: 7, javascript: 4 },
    unpackEdge: { cpp: 7, java: 6, python: 7, javascript: 4 },
    findRoots: { cpp: 7, java: 7, python: 8, javascript: 5 },
    checkRoots: { cpp: 8, java: 8, python: 9, javascript: 6 },
    unionRoots: { cpp: 9, java: 9, python: 10, javascript: 7 },
    returnEmpty: { cpp: 11, java: 11, python: 11, javascript: 9 },
  };

  const find = (i: number): number => {
    let root = i;
    while (root !== parent[root]) {
      root = parent[root];
    }
    return root;
  };

  const treeEdges: [number, number][] = [];
  let foundRedundant: [number, number] | null = null;

  function makeStep(
    codeLine: HighlightTarget,
    action: 'init' | 'check' | 'union' | 'found-redundant' | 'done',
    statusText: string,
    log: string,
    currentEdge: [number, number] | null = null,
    rootU: number | null = null,
    rootV: number | null = null
  ): void {
    const pStr = parent.slice(1).map((p, i) => `${i + 1}:${p}`).join(', ');

    steps.push({
      nodes: RE_NODES,
      edges: RE_EDGES,
      currentEdge,
      rootU,
      rootV,
      treeEdges: [...treeEdges],
      redundantEdge: foundRedundant,
      parent: [...parent],
      action,
      statusText,
      log,
      codeLine,
      metrics: {
        'metric-re-cur-edge': currentEdge ? `[${currentEdge[0]}, ${currentEdge[1]}]` : '—',
        'metric-re-redundant': foundRedundant ? `[${foundRedundant[0]}, ${foundRedundant[1]}]` : '未发现',
        'metric-re-tree-edges': `${treeEdges.length}`,
        'metric-re-parent': `[${pStr}]`,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, 'init', '🚀 [算法启动] findRedundantConnection(edges)：启动并查集冗余连接判环。', 'findRedundantConnection 入口');
  makeStep(lines.initParent, 'init', `📊 [初始化并查集] parent[i] = i；节点 1~${n} 各自独立为一个集合。`, 'init parent[]');

  // 2. 逐边遍历
  for (const edge of RE_EDGES) {
    const [u, v] = edge;

    makeStep(lines.forEdge, 'check', `🔁 [遍历边] 考察边 [${u}, ${v}]。`, `for edge [${u}, ${v}]`, edge);
    makeStep(lines.unpackEdge, 'check', `  ↳ [解构边两端] u = ${u}, v = ${v}。`, `u=${u}, v=${v}`, edge);

    const rU = find(u);
    const rV = find(v);
    makeStep(lines.findRoots, 'check', `  🔍 [查找根节点] find(${u}) = ${rU}, find(${v}) = ${rV}。`, `rootU=${rU}, rootV=${rV}`, edge, rU, rV);

    const isCycle = rU === rV;
    makeStep(lines.checkRoots, isCycle ? 'found-redundant' : 'check', `  🔎 [判环核验] if (rootU == rootV) -> (${rU} == ${rV}) -> (${isCycle})。`, `check rootU == rootV`, edge, rU, rV);

    if (isCycle) {
      foundRedundant = edge;
      makeStep(lines.checkRoots, 'found-redundant', `⚠️ [捕获冗余边] return edge！边 [${u}, ${v}] 两端已在同一连通集合中 (根为 ${rU})，加入该边导致环路形成，此边即为冗余边！`, `found redundant [${u}, ${v}]`, edge, rU, rV);
      break;
    } else {
      parent[rU] = rV;
      treeEdges.push(edge);
      makeStep(lines.unionRoots, 'union', `  🔗 [合并集合] parent[${rU}] = ${rV}；边 [${u}, ${v}] 为树边，将两连通块合并！`, `union: parent[${rU}] = ${rV}`, edge, rU, rV);
    }
  }

  makeStep(lines.checkRoots, 'done', `🎉 [冗余连接定位完毕] 检测出最终成环冗余边: [${foundRedundant?.[0]}, ${foundRedundant?.[1]}]，移除后恢复为树结构！`, 'done', foundRedundant);

  return steps;
}

export class RedundantEdgeVisualizer extends StepVisualizer<RedundantStep> {
  protected codeLanguages = REDUNDANT_EDGE_CODE_LANGUAGES;
  protected codeLines = REDUNDANT_EDGE_CODE_LANGUAGES['java'];
  protected codePanelTitle = '冗余连接 算法代码调试';

  private svgCanvas: HTMLElement | null = null;
  private edgeListBody: HTMLElement | null = null;
  private metricCurEdgeEl: HTMLElement | null = null;
  private metricRedundantEl: HTMLElement | null = null;
  private metricTreeEdgesEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.svgCanvas = this.root.querySelector('#re-svg-canvas');
    this.edgeListBody = this.root.querySelector('#re-edge-list-body');
    this.metricCurEdgeEl = this.root.querySelector('#metric-cur-edge');
    this.metricRedundantEl = this.root.querySelector('#metric-redundant-edge');
    this.metricTreeEdgesEl = this.root.querySelector('#metric-tree-edges');
    this.liveTextEl = this.root.querySelector('#re-live-text');

    this.bindPlaybackControls();

    this.mountTerminal({
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
    const { currentEdge, treeEdges, redundantEdge, parent, action, statusText } = step;

    if (this.svgCanvas) {
      let svgHtml = `<svg viewBox="0 0 460 250" style="width:100%; height:100%; max-height:240px;">`;

      for (const e of RE_EDGES) {
        const p1 = RE_NODE_POSITIONS[e[0] - 1];
        const p2 = RE_NODE_POSITIONS[e[1] - 1];
        const isCurrent = currentEdge && currentEdge[0] === e[0] && currentEdge[1] === e[1];
        const isTree = treeEdges.some((te) => (te[0] === e[0] && te[1] === e[1]) || (te[0] === e[1] && te[1] === e[0]));
        const isRedundant = redundantEdge && redundantEdge[0] === e[0] && redundantEdge[1] === e[1];

        let strokeColor = '#cbd5e1';
        let strokeWidth = 2;
        let strokeDash = 'none';

        if (isRedundant) {
          strokeColor = '#ef4444';
          strokeWidth = 4;
          strokeDash = '5,5';
        } else if (isCurrent && action === 'found-redundant') {
          strokeColor = '#ef4444';
          strokeWidth = 4;
          strokeDash = '5,5';
        } else if (isTree) {
          strokeColor = '#10b981';
          strokeWidth = 3.5;
        } else if (isCurrent) {
          strokeColor = '#3b82f6';
          strokeWidth = 3;
        }

        svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" />`;
      }

      RE_NODES.forEach((node) => {
        const p = RE_NODE_POSITIONS[node - 1];
        const isCurrentNode = currentEdge && (currentEdge[0] === node || currentEdge[1] === node);

        let fill = '#ffffff';
        let stroke = '#cbd5e1';
        if (isCurrentNode && (action === 'found-redundant' || action === 'done')) {
          fill = '#fee2e2';
          stroke = '#ef4444';
        } else if (isCurrentNode) {
          fill = '#dbeafe';
          stroke = '#3b82f6';
        }

        svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />`;
        svgHtml += `<text x="${p.x}" y="${p.y + 4}" fill="#0f172a" font-size="12" font-weight="800" text-anchor="middle">${node}</text>`;
        svgHtml += `<text x="${p.x}" y="${p.y + 30}" fill="#64748b" font-size="10" font-family="monospace" text-anchor="middle">p:${parent[node]}</text>`;
      });

      svgHtml += `</svg>`;
      this.svgCanvas.innerHTML = svgHtml;
    }

    if (this.edgeListBody) {
      this.edgeListBody.innerHTML = RE_EDGES.map((e) => {
        const isCur = currentEdge && currentEdge[0] === e[0] && currentEdge[1] === e[1];
        const isTree = treeEdges.some((te) => (te[0] === e[0] && te[1] === e[1]) || (te[0] === e[1] && te[1] === e[0]));
        const isRedundant = redundantEdge && redundantEdge[0] === e[0] && redundantEdge[1] === e[1];

        let statusBadge = '<span class="text-slate-400">待检查</span>';
        if (isRedundant) statusBadge = '<span class="text-red-500 font-bold">⚠️ 冗余成环边</span>';
        else if (isTree) statusBadge = '<span class="text-emerald-600 font-bold">✔ 树边 (已合并)</span>';
        else if (isCur) statusBadge = '<span class="text-blue-600 font-bold">检查中</span>';

        return `<tr class="${isCur ? 'bg-blue-50/70 font-semibold' : ''}">
          <td class="px-3 py-1.5 text-center font-mono font-bold text-slate-800">[${e[0]}, ${e[1]}]</td>
          <td class="px-3 py-1.5 text-center font-mono text-xs">${statusBadge}</td>
        </tr>`;
      }).join('');
    }

    if (this.metricCurEdgeEl) {
      this.metricCurEdgeEl.textContent = currentEdge ? `[${currentEdge[0]}, ${currentEdge[1]}]` : '—';
    }
    if (this.metricRedundantEl) {
      this.metricRedundantEl.textContent = redundantEdge ? `[${redundantEdge[0]}, ${redundantEdge[1]}]` : '暂未发现';
      this.metricRedundantEl.className = `font-mono font-bold ${redundantEdge ? 'text-red-600 animate-pulse' : 'text-slate-500'}`;
    }
    if (this.metricTreeEdgesEl) {
      this.metricTreeEdgesEl.textContent = `${treeEdges.length} / ${RE_NODES.length - 1}`;
    }

    if (this.liveTextEl) {
      this.liveTextEl.textContent = statusText;
    }
  }
}

registerAlgorithm({
  id: 'redundant-edge',
  name: '冗余连接 (Redundant Connection)',
  category: 'graph',
  difficulty: 2,
  levelOrder: 31,
  description: '左程云算法通关课 Class 056：并查集经典实战，无向图动态加边判环，快速识别导致多余回路的冗余边 (LeetCode 684)',
  learningGoal: '掌握并查集连通性判环机制、动态合并原则与树的环路消除策略',
  template,
  Visualizer: RedundantEdgeVisualizer,
});
