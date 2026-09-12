/**
 * 有向图强连通性检测 (Kosaraju 双 DFS)
 * 4-Card 标准现代架构可视化器
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import {
  STRONGLY_CONNECTED_PROBLEM_HTML,
  STRONGLY_CONNECTED_ANALYSIS_HTML,
  STRONGLY_CONNECTED_CODE_LANGUAGES,
} from './strongly-connected-problem-content';

export interface SCCStep extends StepBase {
  nodes: number[];
  edges: [number, number][];
  isReversed: boolean;
  stage: string;
  currentNode: number | null;
  visited: Set<number>;
  isStronglyConnected: boolean | null;
  action: 'init' | 'forward-dfs' | 'reverse-build' | 'reverse-dfs' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export const SCC_NODES = [0, 1, 2, 3];
export const SCC_ORIGINAL_EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
];

export const SCC_POSITIONS = [
  { x: 100, y: 70 },
  { x: 300, y: 70 },
  { x: 300, y: 190 },
  { x: 100, y: 190 },
];

export function buildSCCSteps(): SCCStep[] {
  const steps: SCCStep[] = [];
  const nodes = [...SCC_NODES];
  const originalEdges = [...SCC_ORIGINAL_EDGES];

  const adjList: number[][] = Array.from({ length: 4 }, () => []);
  for (const [u, v] of originalEdges) {
    adjList[u].push(v);
  }

  const revEdges: [number, number][] = originalEdges.map(([u, v]) => [v, u]);
  const revAdjList: number[][] = Array.from({ length: 4 }, () => []);
  for (const [u, v] of revEdges) {
    revAdjList[u].push(v);
  }

  steps.push({
    nodes,
    edges: originalEdges,
    isReversed: false,
    stage: '准备开始',
    currentNode: null,
    visited: new Set(),
    isStronglyConnected: null,
    action: 'init',
    statusText: `初始化：包含 ${nodes.length} 个节点和 ${originalEdges.length} 条有向边。Kosaraju 算法第一阶段：从节点 0 出发做正向 DFS 遍历。`,
    log: `初始化: ${nodes.length} 节点有向图`,
    codeLine: [1, 2, 3, 4],
  });

  // 1. 正向 DFS
  const visitedForward = new Set<number>();
  const dfsForward = (u: number) => {
    visitedForward.add(u);
    steps.push({
      nodes,
      edges: originalEdges,
      isReversed: false,
      stage: '正向 DFS 遍历',
      currentNode: u,
      visited: new Set(visitedForward),
      isStronglyConnected: null,
      action: 'forward-dfs',
      statusText: `正向 DFS 访问节点 ${u}，已访问节点: [${Array.from(visitedForward).join(', ')}]。`,
      log: `正向访问: 节点 ${u}`,
      codeLine: [16, 17, 18],
    });

    for (const v of adjList[u]) {
      if (!visitedForward.has(v)) {
        dfsForward(v);
      }
    }
  };

  dfsForward(0);

  const forwardAllReached = visitedForward.size === nodes.length;

  if (!forwardAllReached) {
    steps.push({
      nodes,
      edges: originalEdges,
      isReversed: false,
      stage: '正向遍历未全达',
      currentNode: null,
      visited: new Set(visitedForward),
      isStronglyConnected: false,
      action: 'done',
      statusText: `❌ 正向 DFS 从节点 0 出发未能访问所有节点（仅访问了 ${visitedForward.size}/${nodes.length}），该图不是强连通图。`,
      log: `判定失败: 正向未全达 -> 不是强连通`,
      codeLine: 6,
    });
    return steps;
  }

  // 2. 构建反向图
  steps.push({
    nodes,
    edges: revEdges,
    isReversed: true,
    stage: '构建反向图 (Reverse Graph)',
    currentNode: null,
    visited: new Set(),
    isStronglyConnected: null,
    action: 'reverse-build',
    statusText: `正向 DFS 全可达！现在反转所有边的方向 (u->v 变为 v->u)，第二阶段：从节点 0 出发做反向 DFS 遍历。`,
    log: `构建反向图: 反转所有边的方向`,
    codeLine: [7, 8, 9, 10, 11],
  });

  // 3. 反向 DFS
  const visitedReverse = new Set<number>();
  const dfsReverse = (u: number) => {
    visitedReverse.add(u);
    steps.push({
      nodes,
      edges: revEdges,
      isReversed: true,
      stage: '反向 DFS 遍历',
      currentNode: u,
      visited: new Set(visitedReverse),
      isStronglyConnected: null,
      action: 'reverse-dfs',
      statusText: `反向 DFS 访问节点 ${u}，已访问节点: [${Array.from(visitedReverse).join(', ')}]。`,
      log: `反向访问: 节点 ${u}`,
      codeLine: [16, 17, 18],
    });

    for (const v of revAdjList[u]) {
      if (!visitedReverse.has(v)) {
        dfsReverse(v);
      }
    }
  };

  dfsReverse(0);

  const reverseAllReached = visitedReverse.size === nodes.length;

  steps.push({
    nodes,
    edges: originalEdges,
    isReversed: false,
    stage: '判定完成',
    currentNode: null,
    visited: new Set(nodes),
    isStronglyConnected: reverseAllReached,
    action: 'done',
    statusText: reverseAllReached
      ? `🎉 检测完成！正向 DFS 与反向 DFS 均能完全遍历所有节点，该有向图是【强连通图】(返回 true)！`
      : `❌ 检测完成！反向 DFS 未能遍历所有节点，该有向图不是强连通图 (返回 false)。`,
    log: `✓ 判定完成: 强连通性 = ${reverseAllReached}`,
    codeLine: 14,
  });

  return steps;
}


/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: SCCStep[]): SCCStep[] {
  return steps.map((s) => ({
    ...s,
    metrics: {
      stage: s.stage,
      'cur-node': s.currentNode !== null ? String(s.currentNode) : '—',
      visited: `${s.visited.size} / ${s.nodes.length}`,
      'is-scc':
        s.isStronglyConnected === true
          ? '是 (True)'
          : s.isStronglyConnected === false
          ? '否 (False)'
          : '检测中...',
    },
  }));
}

/** 主视觉：有向图 SVG（正向/反向 DFS 着色） */
export function renderStronglyConnectedCanvas(container: HTMLElement, step: SCCStep): void {
  const { nodes, edges, isReversed, currentNode, visited, isStronglyConnected, action } = step;

  let svgHtml = `<svg viewBox="0 0 420 250" style="width:100%; height:100%; max-height:240px;">
    <defs>
      <marker id="scc-arrow-gray" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#94a3b8" />
      </marker>
      <marker id="scc-arrow-blue" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#2563eb" />
      </marker>
    </defs>`;

  for (const [u, v] of edges) {
    const p1 = SCC_POSITIONS[u];
    const p2 = SCC_POSITIONS[v];
    const isCurrentEdge = (currentNode === u && visited.has(v)) || (currentNode === v && visited.has(u));

    const stroke = isCurrentEdge ? '#2563eb' : isReversed ? '#a855f7' : '#cbd5e1';
    const strokeWidth = isCurrentEdge ? 3 : 2;
    const marker = isCurrentEdge ? 'url(#scc-arrow-blue)' : 'url(#scc-arrow-gray)';

    svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${stroke}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;
  }

  for (const u of nodes) {
    const pos = SCC_POSITIONS[u];
    const isCurrent = currentNode === u;
    const isVisited = visited.has(u);

    let fill = '#ffffff';
    let stroke = '#94a3b8';
    let textColor = '#0f172a';

    if (action === 'done' && isStronglyConnected) {
      fill = '#f0fdf4';
      stroke = '#16a34a';
      textColor = '#15803d';
    } else if (isCurrent) {
      fill = '#eff6ff';
      stroke = '#2563eb';
      textColor = '#1d4ed8';
    } else if (isVisited) {
      fill = '#f0fdf4';
      stroke = '#22c55e';
      textColor = '#16a34a';
    }

    svgHtml += `
      <g>
        <circle cx="${pos.x}" cy="${pos.y}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
        <text x="${pos.x}" y="${pos.y + 4.5}" text-anchor="middle" font-size="13" font-weight="800" fill="${textColor}" font-family="JetBrains Mono">${u}</text>
      </g>
    `;
  }

  svgHtml += `</svg>`;

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 8px; box-sizing: border-box;">
      ${svgHtml}
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'strongly-connected',
  name: '有向图强连通性检测 (Kosaraju)',
  category: 'graph',
  description: 'Kosaraju 双向 DFS 遍历：正向 DFS 验证可达全集，反向图 DFS 验证全源互通性',
  icon: '🔗',
  difficulty: 2,
  levelOrder: 25,
  learningGoal: '掌握利用有向图反转与两次 DFS 遍历高效判定强连通性的线性时间算法',
  inputs: [],
  metrics: [
    { id: 'stage', label: '当前阶段', color: '#7e22ce' },
    { id: 'cur-node', label: '当前访问节点', color: '#2563eb' },
    { id: 'visited', label: '已访问计数', color: '#22c55e' },
    { id: 'is-scc', label: '强连通判定', color: '#16a34a' },
  ],
  legend: [
    { label: '当前节点', color: '#2563eb' },
    { label: '已访问', color: '#22c55e' },
    { label: '反向图边', color: '#a855f7' },
  ],
  codeLanguages: STRONGLY_CONNECTED_CODE_LANGUAGES,
  problemHtml: STRONGLY_CONNECTED_PROBLEM_HTML,
  analysisHtml: STRONGLY_CONNECTED_ANALYSIS_HTML,
  generateSteps: (inputs) => withMetrics(buildSCCSteps()),
  renderCanvas: (container, step) => renderStronglyConnectedCanvas(container, step as SCCStep),
});
