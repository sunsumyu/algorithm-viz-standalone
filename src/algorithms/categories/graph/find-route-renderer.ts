/**
 * 寻找图中有效路径 (LC 1971) — 声明式 4-Card 标准架构
 * BFS 连通性判定 + 前驱记录回溯路径重构
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  FIND_ROUTE_PROBLEM_HTML,
  FIND_ROUTE_ANALYSIS_HTML,
  FIND_ROUTE_CODE_LANGUAGES,
} from './find-route-problem-content';

export interface FRStep {
  nodes: number[];
  edges: [number, number][];
  visited: Set<number>;
  currentNode: number | null;
  queue: number[];
  source: number;
  dest: number;
  path: number[];
  found: boolean | null;
  action: 'init' | 'explore' | 'found' | 'notfound' | 'done';
  statusText: string;
  message?: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export const FR_NODES = [0, 1, 2, 3, 4, 5];
export const FR_EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [0, 3],
  [3, 4],
  [2, 5],
  [4, 5],
];

export const FR_NODE_POSITIONS = [
  { x: 80, y: 70 },
  { x: 220, y: 50 },
  { x: 370, y: 70 },
  { x: 130, y: 190 },
  { x: 280, y: 190 },
  { x: 420, y: 190 },
];

export function buildFRSteps(): FRStep[] {
  const steps: FRStep[] = [];
  const nodes = [...FR_NODES];
  const edges = [...FR_EDGES];
  const source = 0;
  const dest = 5;

  const adjList: number[][] = Array.from({ length: 6 }, () => []);
  for (const [u, v] of edges) {
    adjList[u].push(v);
    adjList[v].push(u);
  }

  const visited = new Set<number>();
  const queue: number[] = [];
  const parentMap = new Map<number, number>();

  steps.push({
    nodes,
    edges,
    visited: new Set(),
    currentNode: null,
    queue: [],
    source,
    dest,
    path: [],
    found: null,
    action: 'init',
    statusText: `无向图包含 ${nodes.length} 个节点和 ${edges.length} 条边。目标：判断从起点 ${source} 到终点 ${dest} 是否存在路径。`,
    log: `初始化: source=${source}, destination=${dest}`,
    codeLine: [1, 2, 3],
  });

  visited.add(source);
  queue.push(source);

  steps.push({
    nodes,
    edges,
    visited: new Set(visited),
    currentNode: source,
    queue: [...queue],
    source,
    dest,
    path: [],
    found: null,
    action: 'explore',
    statusText: `起点 ${source} 加入队列并标记为已访问，启动 BFS 连通性搜索。`,
    log: `起点入队: ${source}`,
    codeLine: [11, 12, 13],
  });

  let foundPath: number[] = [];
  let isFound = false;

  while (queue.length > 0) {
    const u = queue.shift()!;

    if (u === dest) {
      isFound = true;
      const p: number[] = [dest];
      let cur = dest;
      while (parentMap.has(cur)) {
        cur = parentMap.get(cur)!;
        p.unshift(cur);
      }
      foundPath = p;

      steps.push({
        nodes,
        edges,
        visited: new Set(visited),
        currentNode: u,
        queue: [...queue],
        source,
        dest,
        path: [...foundPath],
        found: true,
        action: 'found',
        statusText: `🎉 成功搜索到终点 ${dest}！重构最优路径: [${foundPath.join(' -> ')}]。`,
        log: `✓ 命中目标: 到达节点 ${dest}，路径存在！`,
        codeLine: [16, 17],
      });
      break;
    }

    for (const v of adjList[u]) {
      if (!visited.has(v)) {
        visited.add(v);
        parentMap.set(v, u);
        queue.push(v);

        steps.push({
          nodes,
          edges,
          visited: new Set(visited),
          currentNode: u,
          queue: [...queue],
          source,
          dest,
          path: [],
          found: null,
          action: 'explore',
          statusText: `节点 ${u} 探测到邻居 ${v}，将其加入遍历队列。`,
          log: `扩展邻居: ${u} -> ${v}，入队`,
          codeLine: [18, 19, 20, 21],
        });
      }
    }
  }

  steps.push({
    nodes,
    edges,
    visited: new Set(visited),
    currentNode: null,
    queue: [],
    source,
    dest,
    path: foundPath,
    found: isFound,
    action: 'done',
    statusText: isFound
      ? `🎉 搜索完成！起点 ${source} 与终点 ${dest} 连通，路径为: [${foundPath.join(' -> ')}]。`
      : `❌ 搜索结束，队列为空，起点 ${source} 无法到达终点 ${dest}。`,
    log: `✓ 算法执行完毕，连通性结果 = ${isFound}`,
    codeLine: 25,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: FRStep[]): FRStep[] {
  return steps.map((s) => ({
    ...s,
    message: s.statusText,
    metrics: {
      'metric-cur-node': s.currentNode !== null ? `${s.currentNode}` : '—',
      'metric-queue': s.queue.length > 0 ? `[${s.queue.join(', ')}]` : '[ ]',
      'metric-visited-count': `${s.visited.size} / ${s.nodes.length}`,
      'metric-found':
        s.found === true ? '存在路径 (true)' : s.found === false ? '不可达 (false)' : '搜索中...',
      'result-path': s.path.length > 0 ? `[${s.path.join(' -> ')}]` : '—',
    },
  }));
}

export function renderFindRouteCanvas(container: HTMLElement, step: FRStep): void {
  const { nodes, edges, visited, currentNode, source, dest, path } = step;

  let svgHtml = `<svg viewBox="0 0 480 250" style="width:100%; height:100%; max-height:240px;">`;

  // 边路径 Set
  const pathEdgeSet = new Set<string>();
  if (path.length > 1) {
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i];
      const v = path[i + 1];
      pathEdgeSet.add(`${Math.min(u, v)}-${Math.max(u, v)}`);
    }
  }

  // 绘制边
  for (const [u, v] of edges) {
    const p1 = FR_NODE_POSITIONS[u];
    const p2 = FR_NODE_POSITIONS[v];
    const isPath = pathEdgeSet.has(`${Math.min(u, v)}-${Math.max(u, v)}`);

    const strokeColor = isPath ? '#f59e0b' : '#cbd5e1';
    const strokeWidth = isPath ? 3.5 : 2;

    svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
  }

  // 绘制节点
  for (const u of nodes) {
    const pos = FR_NODE_POSITIONS[u];
    const isCurrent = currentNode === u;
    const isVisited = visited.has(u);
    const isSource = source === u;
    const isDest = dest === u;
    const inPath = path.includes(u);

    let fill = '#ffffff';
    let stroke = '#94a3b8';
    let textColor = '#0f172a';

    if (inPath) {
      fill = '#fef3c7';
      stroke = '#f59e0b';
      textColor = '#b45309';
    } else if (isCurrent) {
      fill = '#eff6ff';
      stroke = '#2563eb';
      textColor = '#1d4ed8';
    } else if (isVisited) {
      fill = '#f0fdf4';
      stroke = '#16a34a';
      textColor = '#15803d';
    }

    const badge = isSource ? ' (S)' : isDest ? ' (D)' : '';

    svgHtml += `
      <g>
        <circle cx="${pos.x}" cy="${pos.y}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
        <text x="${pos.x}" y="${pos.y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="${textColor}" font-family="JetBrains Mono">${u}${badge}</text>
      </g>
    `;
  }

  svgHtml += `</svg>`;

  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100%; width: 100%; padding: 8px; box-sizing: border-box;">
      ${svgHtml}
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'find-route',
  name: '寻找图中有效路径 (LC 1971)',
  category: 'graph',
  description: '使用广度优先搜索 (BFS) 与前驱节点映射判断无向图中两点连通性并重构路径',
  icon: '🧭',
  difficulty: 1,
  levelOrder: 20,
  learningGoal: '掌握无向图连通性判定与前驱记录回溯最短跳步路径',
  metrics: [
    { id: 'metric-cur-node', label: '当前出队点', color: '#2563eb' },
    { id: 'metric-queue', label: '队列内容', color: '#3b82f6' },
    { id: 'metric-visited-count', label: '已访问节点', color: '#10b981' },
    { id: 'metric-found', label: '连通结果', color: '#16a34a' },
    { id: 'result-path', label: '最终路径', color: '#f59e0b' },
  ],
  legend: [
    { label: '当前出队点 u', color: '#2563eb' },
    { label: '已访问节点', color: '#16a34a' },
    { label: '最终路径边', color: '#f59e0b' },
    { label: '未访问节点', color: '#94a3b8' },
  ],
  codeLanguages: FIND_ROUTE_CODE_LANGUAGES,
  problemHtml: FIND_ROUTE_PROBLEM_HTML,
  analysisHtml: FIND_ROUTE_ANALYSIS_HTML,
  generateSteps: () => withMetrics(buildFRSteps()),
  renderCanvas: (container, step) => renderFindRouteCanvas(container, step as FRStep),
});
