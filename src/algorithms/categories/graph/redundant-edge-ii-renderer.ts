/**
 * 冗余连接 II (LC 685) 可视化器 — 4-Card 标准现代架构
 * 有向图双父节点冲突统计、并查集有向环判定与多场景分类精讲 (左程云 class057)
 * 深度架构重构：严格解释器级全流程逐行高亮执行（入度初始化、首轮遍历统计入度2冲突边、并查集初始化、次轮跳过冲突边建树并检测环路、根判环、并查集合并、三大分支终局判定均发射独立Step）、四语言行号映射
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  REDUNDANT_EDGE_II_PROBLEM_HTML,
  REDUNDANT_EDGE_II_ANALYSIS_HTML,
  REDUNDANT_EDGE_II_CODE_LANGUAGES,
} from './redundant-edge-ii-problem-content';
import template from './redundant-edge-ii.html?raw';
import { HighlightTarget } from '../../../core/code-panel';

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
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
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

  // 精准 14 处四语言映射行号字典 (cpp / java / python / javascript 数组 1-based 索引)
  const lines = {
    entry: { cpp: 3, java: 2, python: 2, javascript: 1 },
    initVars: { cpp: 4, java: 3, python: 3, javascript: 2 },
    initParent: { cpp: 6, java: 7, python: 9, javascript: 8 },
    forInDegree: { cpp: 7, java: 8, python: 6, javascript: 5 },
    checkInDegree: { cpp: 8, java: 9, python: 7, javascript: 6 },
    recordInDegree: { cpp: 8, java: 10, python: 8, javascript: 6 },
    forCycle: { cpp: 10, java: 13, python: 10, javascript: 9 },
    skipConflict: { cpp: 11, java: 14, python: 11, javascript: 10 },
    findRoots: { cpp: 12, java: 16, python: 12, javascript: 11 },
    checkRoots: { cpp: 13, java: 17, python: 13, javascript: 12 },
    unionRoots: { cpp: 14, java: 18, python: 14, javascript: 13 },
    checkConflictLessZero: { cpp: 16, java: 20, python: 15, javascript: 15 },
    checkCycleGreaterEqualZero: { cpp: 17, java: 21, python: 16, javascript: 16 },
    returnConflict: { cpp: 18, java: 22, python: 17, javascript: 17 },
  };

  const parent = Array.from({ length: n + 1 }, (_, i) => i);

  const find = (i: number): number => {
    let root = i;
    while (root !== parent[root]) {
      root = parent[root];
    }
    return root;
  };

  function makeStep(
    codeLine: HighlightTarget,
    action: 'init' | 'check-indegree' | 'check-cycle' | 'union' | 'found-conflict' | 'done',
    statusText: string,
    log: string,
    currentEdgeIndex: number = -1,
    currentEdge: [number, number] | null = null,
    resultEdge: [number, number] | null = null
  ): void {
    const degStr = inDegree.slice(1).map((d, i) => `${i + 1}:${d}`).join(', ');
    const pStr = parent.slice(1).map((p, i) => `${i + 1}:${p}`).join(', ');

    steps.push({
      nodes: RE2_NODES,
      edges,
      inDegree: [...inDegree],
      conflictIndex: conflict,
      cycleIndex: cycle,
      currentEdgeIndex,
      currentEdge,
      resultEdge,
      parent: [...parent],
      action,
      statusText,
      log,
      codeLine,
      metrics: {
        'metric-re2-conflict': conflict >= 0 ? `edges[${conflict}]=[${edges[conflict][0]}, ${edges[conflict][1]}]` : '无',
        'metric-re2-cycle': cycle >= 0 ? `edges[${cycle}]=[${edges[cycle][0]}, ${edges[cycle][1]}]` : '无',
        'metric-re2-indegree': `[${degStr}]`,
        'metric-re2-uf': `[${pStr}]`,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, 'init', '🚀 [算法启动] findRedundantDirectedConnection(edges)：启动有向图冗余连接双父节点与有向环判定。', 'findRedundantDirectedConnection 入口');
  makeStep(lines.initVars, 'init', `📊 [初始化统计数据] inDegree = [0,0,0,0], conflict = -1, cycle = -1。`, 'init variables');

  // 2. 第一轮：统计入度检测双父节点冲突
  for (let i = 0; i < n; i++) {
    const [u, v] = edges[i];
    makeStep(lines.forInDegree, 'check-indegree', `🔁 [入度遍历] 考察边 edges[${i}] = [${u}, ➔ ${v}]。`, `edges[${i}] = [${u}, ${v}]`, i, edges[i]);

    if (inDegree[v] > 0) {
      conflict = i;
      makeStep(lines.checkInDegree, 'found-conflict', `⚠️ [捕获入度为2冲突] 顶点 ${v} 已有入边 (inDegree[${v}]=${inDegree[v]})，边 edges[${i}]=[${u}, ${v}] 为第二条入边！记录 conflict = ${i}。`, `conflict = ${i} ([${u}, ${v}])`, i, edges[i]);
    } else {
      inDegree[v]++;
      makeStep(lines.recordInDegree, 'check-indegree', `  ↳ [累加入度] inDegree[${v}] 自增为 ${inDegree[v]}。`, `inDegree[${v}]++`, i, edges[i]);
    }
  }

  // 3. 第二轮：并查集判环 (若有 conflict 则假设跳过 conflict 边)
  makeStep(lines.initParent, 'init', `🏷️ [初始化并查集] parent[i] = i；重置并查集准备进行环路检测。`, 'init parent[]');

  for (let i = 0; i < n; i++) {
    makeStep(lines.forCycle, 'check-cycle', `🔁 [环路检测遍历] 考察边 edges[${i}] = [${edges[i][0]}, ${edges[i][1]}]。`, `for cycle edges[${i}]`, i, edges[i]);

    if (i === conflict) {
      makeStep(lines.skipConflict, 'check-cycle', `⏭️ [假设跳过冲突边] i === conflict (${conflict})，跳过边 edges[${i}]=[${edges[i][0]}, ${edges[i][1]}]，检验其余边是否仍有环。`, `skip conflict edge ${i}`, i, edges[i]);
      continue;
    }

    const [u, v] = edges[i];
    const rU = find(u);
    const rV = find(v);
    makeStep(lines.findRoots, 'check-cycle', `  🔍 [查找并查集根] find(${u}) = ${rU}, find(${v}) = ${rV}。`, `find(${u})=${rU}, find(${v})=${rV}`, i, edges[i]);

    if (rU === rV) {
      cycle = i;
      makeStep(lines.checkRoots, 'check-cycle', `⚠️ [捕获有向环] rootU == rootV (${rU} == ${rV})！边 edges[${i}]=[${u}, ${v}] 导致形成环路，记录 cycle = ${i}。`, `cycle = ${i} ([${u}, ${v}])`, i, edges[i]);
    } else {
      parent[rU] = rV;
      makeStep(lines.unionRoots, 'union', `  🔗 [合并连通块] parent[${rU}] = ${rV}；将连通分支合并。`, `union: parent[${rU}]=${rV}`, i, edges[i]);
    }
  }

  // 4. 终局决策三大分支
  makeStep(lines.checkConflictLessZero, 'check-cycle', `🔎 [终局判定-分支1] if (conflict < 0) -> (${conflict} < 0) -> (${conflict < 0})；若无入度为2冲突，直接返回成环边。`, 'check conflict < 0');
  if (conflict < 0) {
    const res = edges[cycle];
    makeStep(lines.checkConflictLessZero, 'done', `🎉 [无双父节点冲突] return edges[cycle]！无入度2冲突，成环边 edges[${cycle}]=[${res[0]}, ${res[1]}] 即为冗余连接！`, 'return edges[cycle]', cycle, res, res);
    return steps;
  }

  makeStep(lines.checkCycleGreaterEqualZero, 'check-cycle', `🔎 [终局判定-分支2] if (cycle >= 0) -> (${cycle} >= 0) -> (${cycle >= 0})；若跳过 conflict 边后仍有环，说明导致环的必须是第一条入边！`, 'check cycle >= 0');
  if (cycle >= 0) {
    // 寻找指向 conflict 目标节点的首条边
    const targetV = edges[conflict][1];
    let firstParentEdge: [number, number] | null = null;
    for (let i = 0; i < n; i++) {
      if (edges[i][1] === targetV && i !== conflict) {
        firstParentEdge = edges[i];
        break;
      }
    }
    makeStep(lines.checkCycleGreaterEqualZero, 'done', `🎉 [双父且成环冲突] return firstParentEdge！跳过 conflict 边后仍检测到环 (cycle=${cycle})，故必须删除更早指向节点 ${targetV} 的第一条入边: [${firstParentEdge?.[0]}, ${firstParentEdge?.[1]}]！`, 'return firstParentEdge', conflict, firstParentEdge, firstParentEdge);
    return steps;
  }

  // 分支3：跳过 conflict 边后无环，说明 conflict 边就是冗余边
  const res = edges[conflict];
  makeStep(lines.returnConflict, 'done', `🎉 [双父且跳过无环] return edges[conflict]！跳过该边后整图成为无环合法有向树，边 edges[${conflict}]=[${res[0]}, ${res[1]}] 即为冗余连接！`, 'return edges[conflict]', conflict, res, res);

  return steps;
}

export class RedundantEdgeIIVisualizer extends StepVisualizer<RedundantIIStep> {
  protected codeLanguages = REDUNDANT_EDGE_II_CODE_LANGUAGES;
  protected codeLines = REDUNDANT_EDGE_II_CODE_LANGUAGES['java'];
  protected codePanelTitle = '冗余连接 II 算法代码调试';

  private svgCanvas: HTMLElement | null = null;
  private edgeListBody: HTMLElement | null = null;
  private metricConflictEl: HTMLElement | null = null;
  private metricCycleEl: HTMLElement | null = null;
  private metricResultEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.svgCanvas = this.root.querySelector('#re2-svg-canvas');
    this.edgeListBody = this.root.querySelector('#re2-edge-list-body');
    this.metricConflictEl = this.root.querySelector('#metric-re2-conflict');
    this.metricCycleEl = this.root.querySelector('#metric-re2-cycle');
    this.metricResultEl = this.root.querySelector('#metric-re2-result');
    this.liveTextEl = this.root.querySelector('#re2-live-text');

    this.bindPlaybackControls();

    this.mountTerminal({
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
    const { edges, conflictIndex, cycleIndex, currentEdgeIndex, resultEdge, parent, action, statusText } = step;

    if (this.svgCanvas) {
      let svgHtml = `<svg viewBox="0 0 460 250" style="width:100%; height:100%; max-height:240px;">
        <defs>
          <marker id="re2-arrow-normal" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
          </marker>
          <marker id="re2-arrow-cur" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#3b82f6" />
          </marker>
          <marker id="re2-arrow-red" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
          </marker>
        </defs>`;

      edges.forEach((e, idx) => {
        const p1 = RE2_NODE_POSITIONS[e[0] - 1];
        const p2 = RE2_NODE_POSITIONS[e[1] - 1];
        const isCur = currentEdgeIndex === idx;
        const isResult = resultEdge && resultEdge[0] === e[0] && resultEdge[1] === e[1];
        const isConflict = conflictIndex === idx;
        const isCycle = cycleIndex === idx;

        let strokeColor = '#94a3b8';
        let strokeWidth = 2;
        let strokeDash = 'none';
        let marker = 'url(#re2-arrow-normal)';

        if (isResult) {
          strokeColor = '#ef4444';
          strokeWidth = 4;
          strokeDash = '5,5';
          marker = 'url(#re2-arrow-red)';
        } else if (isConflict) {
          strokeColor = '#f59e0b';
          strokeWidth = 3;
          strokeDash = '4,4';
        } else if (isCycle) {
          strokeColor = '#ec4899';
          strokeWidth = 3;
        } else if (isCur) {
          strokeColor = '#3b82f6';
          strokeWidth = 3.5;
          marker = 'url(#re2-arrow-cur)';
        }

        svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" marker-end="${marker}" />`;
      });

      RE2_NODES.forEach((node) => {
        const p = RE2_NODE_POSITIONS[node - 1];
        const isCurNode = currentEdgeIndex >= 0 && (edges[currentEdgeIndex][0] === node || edges[currentEdgeIndex][1] === node);

        let fill = '#ffffff';
        let stroke = '#cbd5e1';
        if (isCurNode) {
          fill = '#dbeafe';
          stroke = '#3b82f6';
        }

        svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />`;
        svgHtml += `<text x="${p.x}" y="${p.y + 4}" fill="#0f172a" font-size="12" font-weight="800" text-anchor="middle">${node}</text>`;
        svgHtml += `<text x="${p.x}" y="${p.y + 30}" fill="#64748b" font-size="10" font-family="monospace" text-anchor="middle">in:${step.inDegree[node]}</text>`;
      });

      svgHtml += `</svg>`;
      this.svgCanvas.innerHTML = svgHtml;
    }

    if (this.edgeListBody) {
      this.edgeListBody.innerHTML = edges.map((e, idx) => {
        const isCur = currentEdgeIndex === idx;
        const isResult = resultEdge && resultEdge[0] === e[0] && resultEdge[1] === e[1];
        const isConflict = conflictIndex === idx;
        const isCycle = cycleIndex === idx;

        let statusBadge = '<span class="text-slate-400">常规边</span>';
        if (isResult) statusBadge = '<span class="text-red-500 font-bold">🎯 最终冗余边</span>';
        else if (isConflict) statusBadge = '<span class="text-amber-500 font-bold">⚠️ 双父节点冲突边</span>';
        else if (isCycle) statusBadge = '<span class="text-pink-500 font-bold">🔁 导致成环边</span>';
        else if (isCur) statusBadge = '<span class="text-blue-600 font-bold">检查中</span>';

        return `<tr class="${isCur ? 'bg-blue-50/70 font-semibold' : ''}">
          <td class="px-3 py-1.5 text-center font-mono font-bold text-slate-800">[${e[0]}, ${e[1]}]</td>
          <td class="px-3 py-1.5 text-center font-mono text-xs">${statusBadge}</td>
        </tr>`;
      }).join('');
    }

    if (this.metricConflictEl) {
      this.metricConflictEl.textContent = conflictIndex >= 0 ? `edges[${conflictIndex}] = [${edges[conflictIndex][0]}, ${edges[conflictIndex][1]}]` : '无';
      this.metricConflictEl.className = `font-mono font-bold ${conflictIndex >= 0 ? 'text-amber-600' : 'text-slate-500'}`;
    }
    if (this.metricCycleEl) {
      this.metricCycleEl.textContent = cycleIndex >= 0 ? `edges[${cycleIndex}] = [${edges[cycleIndex][0]}, ${edges[cycleIndex][1]}]` : '无';
      this.metricCycleEl.className = `font-mono font-bold ${cycleIndex >= 0 ? 'text-pink-600' : 'text-slate-500'}`;
    }
    if (this.metricResultEl) {
      this.metricResultEl.textContent = resultEdge ? `[${resultEdge[0]}, ${resultEdge[1]}]` : '计算中...';
      this.metricResultEl.className = `font-mono font-bold ${resultEdge ? 'text-red-600 animate-pulse' : 'text-slate-500'}`;
    }

    if (this.liveTextEl) {
      this.liveTextEl.textContent = statusText;
    }
  }
}

registerAlgorithm({
  id: 'redundant-edge-ii',
  name: '冗余连接 II (Redundant Connection II)',
  viewId: 'algo-redundant-edge-ii-view',
  icon: '🔁',
  category: 'graph',
  difficulty: 3,
  levelOrder: 32,
  description: '左程云算法通关课 Class 057：有向图并查集高阶应用，兼顾入度为 2 双父节点冲突与有向环两大难题 (LeetCode 685)',
  learningGoal: '掌握有向树双父节点冲突分析、并查集有向环检验与分支回溯消除策略',
  template,
  Visualizer: RedundantEdgeIIVisualizer,
});
