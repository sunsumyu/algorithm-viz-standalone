/**
 * 所有可能的路径 (LC 797)
 * 4-Card 标准现代架构可视化器
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import {
  REACHABLE_PATHS_PROBLEM_HTML,
  REACHABLE_PATHS_ANALYSIS_HTML,
  REACHABLE_PATHS_CODE_LANGUAGES,
} from './reachable-paths-problem-content';

export interface RPStep extends StepBase {
  nodes: number[];
  edges: [number, number][];
  currentNode: number | null;
  currentPath: number[];
  allPaths: number[][];
  action: 'init' | 'dfs-enter' | 'target-reached' | 'backtrack' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export const DAG_NODES = [0, 1, 2, 3];
export const DAG_EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
];

export const DAG_POSITIONS = [
  { x: 70, y: 125 },
  { x: 200, y: 60 },
  { x: 200, y: 190 },
  { x: 380, y: 125 },
];

export const DEFAULT_GRAPH = [[1, 2], [3], [3], []];

export function buildReachableSteps(graph: number[][] = DEFAULT_GRAPH): RPStep[] {
  const steps: RPStep[] = [];
  const nodes = Array.from({ length: graph.length }, (_, i) => i);
  const edges: [number, number][] = [];
  for (let u = 0; u < graph.length; u++) {
    for (const v of graph[u]) {
      edges.push([u, v]);
    }
  }

  const target = graph.length - 1;
  const allPaths: number[][] = [];
  const currentPath: number[] = [0];

  steps.push({
    nodes,
    edges,
    currentNode: null,
    currentPath: [0],
    allPaths: [],
    action: 'init',
    statusText: `初始化 DAG 图结构，节点 0 为起点，节点 ${target} 为目标终点。`,
    log: `初始化: 0 -> ${target} 所有路径搜索`,
    codeLine: [1, 2, 3, 4],
  });

  const dfs = (node: number) => {
    steps.push({
      nodes,
      edges,
      currentNode: node,
      currentPath: [...currentPath],
      allPaths: allPaths.map((p) => [...p]),
      action: 'dfs-enter',
      statusText: `递归进入节点 ${node}，当前路径: [${currentPath.join(' -> ')}]。`,
      log: `访问节点: ${node}，路径: [${currentPath.join(' -> ')}]`,
      codeLine: [8, 9],
    });

    if (node === target) {
      allPaths.push([...currentPath]);
      steps.push({
        nodes,
        edges,
        currentNode: node,
        currentPath: [...currentPath],
        allPaths: allPaths.map((p) => [...p]),
        action: 'target-reached',
        statusText: `🎉 到达终点 ${target}！收集一条完整有效路径: [${currentPath.join(' -> ')}]。`,
        log: `✓ 命中目标: 找到路径 #${allPaths.length} [${currentPath.join(' -> ')}]`,
        codeLine: [10, 11, 12],
      });
      return;
    }

    for (const next of graph[node]) {
      currentPath.push(next);
      dfs(next);
      currentPath.pop();

      steps.push({
        nodes,
        edges,
        currentNode: node,
        currentPath: [...currentPath],
        allPaths: allPaths.map((p) => [...p]),
        action: 'backtrack',
        statusText: `回溯：从节点 ${next} 返回，当前路径恢复为 [${currentPath.join(' -> ')}]。`,
        log: `回溯返回: 节点 ${node}，弹出 ${next}`,
        codeLine: 16,
      });
    }
  };

  dfs(0);

  steps.push({
    nodes,
    edges,
    currentNode: null,
    currentPath: [],
    allPaths: allPaths.map((p) => [...p]),
    action: 'done',
    statusText: `🎉 路径搜索完成！从 0 到 ${target} 共发现 ${allPaths.length} 条所有可能路径。`,
    log: `✓ 搜索完毕: 共输出 ${allPaths.length} 条路径方案`,
    codeLine: 6,
  });

  return steps;
}

/** 解析邻接表文本输入（每行一个节点的邻居列表），非法输入回退默认图 */
function parseGraphInput(raw: string | undefined): number[][] {
  const fallback = DEFAULT_GRAPH.map((r) => [...r]);
  if (!raw || !raw.trim()) return fallback;
  try {
    const rows = raw
      .trim()
      .split('\n')
      .map((line) => line.trim().split(/[\s,]+/).filter(Boolean).map(Number));
    if (rows.length === 0 || rows.some((r) => r.some((v) => !Number.isInteger(v) || v < 0))) {
      return fallback;
    }
    return rows;
  } catch {
    return fallback;
  }
}

/** 附加指标卡快照（当前节点 / 当前路径 / 动作 / 已发现路径数） */
function withMetrics(steps: RPStep[]): RPStep[] {
  return steps.map((s) => ({
    ...s,
    metrics: {
      'metric-rp-cur-node': s.currentNode !== null ? `${s.currentNode}` : '—',
      'metric-rp-path': s.currentPath.length > 0 ? `[${s.currentPath.join(' ➔ ')}]` : '[ ]',
      'metric-rp-action':
        s.action === 'target-reached'
          ? '🎯 找到路径'
          : s.action === 'backtrack'
            ? '↩ 回溯弹出'
            : s.action === 'dfs-enter'
              ? '深入探索'
              : s.action === 'done'
                ? '搜索完成'
                : '准备开始',
      'metric-rp-total': `${s.allPaths.length}`,
    },
  }));
}

/** 主视觉：DAG SVG（当前路径高亮）+ 已收集路径芯片条 */
export function renderReachablePathsCanvas(container: HTMLElement, step: RPStep): void {
  const { nodes, edges, currentNode, currentPath, allPaths, action } = step;

  const positions = nodes.map((_, i) => DAG_POSITIONS[i] || { x: 70 + (i % 3) * 140, y: 60 + Math.floor(i / 3) * 70 });

  let svgHtml = `<svg viewBox="0 0 450 250" style="width:100%; height:100%; max-height:240px;">
    <defs>
      <marker id="arrow-rp-gray" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#94a3b8" />
      </marker>
      <marker id="arrow-rp-blue" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#2563eb" />
      </marker>
      <marker id="arrow-rp-green" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#16a34a" />
      </marker>
    </defs>`;

  // 当前路径边的集合
  const curEdgeSet = new Set<string>();
  if (currentPath.length > 1) {
    for (let i = 0; i < currentPath.length - 1; i++) {
      curEdgeSet.add(`${currentPath[i]}->${currentPath[i + 1]}`);
    }
  }

  // 绘制有向边
  for (const [u, v] of edges) {
    const p1 = positions[u] || { x: 50, y: 50 };
    const p2 = positions[v] || { x: 150, y: 150 };
    const isCurEdge = curEdgeSet.has(`${u}->${v}`);

    const stroke = isCurEdge ? '#2563eb' : '#cbd5e1';
    const strokeWidth = isCurEdge ? 3 : 2;
    const marker = isCurEdge ? 'url(#arrow-rp-blue)' : 'url(#arrow-rp-gray)';

    svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${stroke}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;
  }

  // 绘制节点
  for (const u of nodes) {
    const pos = positions[u] || { x: 50, y: 50 };
    const isCurrent = currentNode === u;
    const inPath = currentPath.includes(u);
    const isTarget = u === nodes.length - 1;

    let fill = '#ffffff';
    let stroke = '#94a3b8';
    let textColor = '#0f172a';

    if (action === 'target-reached' && inPath) {
      fill = '#f0fdf4';
      stroke = '#16a34a';
      textColor = '#15803d';
    } else if (isCurrent) {
      fill = '#eff6ff';
      stroke = '#2563eb';
      textColor = '#1d4ed8';
    } else if (inPath) {
      fill = '#fef9c3';
      stroke = '#facc15';
      textColor = '#854d0e';
    }

    let badge = u === 0 ? ' (S)' : isTarget ? ' (T)' : '';

    svgHtml += `
      <g>
        <circle cx="${pos.x}" cy="${pos.y}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
        <text x="${pos.x}" y="${pos.y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="${textColor}" font-family="JetBrains Mono">${u}${badge}</text>
      </g>
    `;
  }

  svgHtml += `</svg>`;

  const pathChips =
    allPaths.length > 0
      ? allPaths
          .map(
            (p) =>
              `<span style="padding: 4px 10px; border-radius: 999px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; font-family: monospace; font-size: 11px; font-weight: 700;">[${p.join('➔')}]</span>`
          )
          .join('')
      : `<span style="padding: 4px 10px; border-radius: 999px; background: #f8fafc; border: 1px solid #e2e8f0; color: #94a3b8; font-family: monospace; font-size: 11px; font-weight: 700;">[ ]</span>`;

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 8px; box-sizing: border-box;">
      <div style="width: 100%;">${svgHtml}</div>
      <div style="display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; width: 100%;">${pathChips}</div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'reachable-paths',
  name: '所有可能的路径 (LC 797)',
  category: 'graph',
  description: '回溯 DFS 搜索有向无环图 (DAG) 中从源点到目标点的所有可能路径',
  icon: '🎯',
  difficulty: 2,
  levelOrder: 21,
  learningGoal: '掌握 DAG 上的深度优先回溯搜索与路径压栈恢复机制',
  inputs: [
    {
      id: 'graph',
      label: '邻接表 (每行一个节点的邻居)',
      type: 'text',
      defaultValue: '1 2\n3\n3\n',
      placeholder: '每行如 1 2',
    },
  ],
  presets: [
    { label: '默认 DAG (4 节点)', values: { graph: '1 2\n3\n3\n' } },
    { label: '链式图 0→1→2→3', values: { graph: '1\n2\n3\n' } },
    { label: '星形图 (源点直连)', values: { graph: '1 2 3\n\n\n' } },
    { label: '5 节点 DAG', values: { graph: '1 2\n3\n3 4\n4\n' } },
  ],
  metrics: [
    { id: 'metric-rp-cur-node', label: '当前访问节点', color: '#2563eb' },
    { id: 'metric-rp-path', label: '当前路径 path', color: '#eab308' },
    { id: 'metric-rp-action', label: '当前动作', color: '#a855f7' },
    { id: 'metric-rp-total', label: '已发现路径数', color: '#16a34a' },
  ],
  legend: [
    { label: '当前访问栈 path', color: '#2563eb' },
    { label: '命中目标路径', color: '#16a34a' },
    { label: '路径途经节点', color: '#facc15' },
    { label: '待遍历边', color: '#94a3b8' },
  ],
  codeLanguages: REACHABLE_PATHS_CODE_LANGUAGES,
  problemHtml: REACHABLE_PATHS_PROBLEM_HTML,
  analysisHtml: REACHABLE_PATHS_ANALYSIS_HTML,
  generateSteps: (inputs) => withMetrics(buildReachableSteps(parseGraphInput(inputs?.graph))),
  renderCanvas: (container, step) => renderReachablePathsCanvas(container, step as RPStep),
});
