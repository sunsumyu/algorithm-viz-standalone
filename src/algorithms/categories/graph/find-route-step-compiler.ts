/**
 * 寻找图中有效路径 (LC 1971 / 面试题 04.01) — 步进推演编译器 (Deep Module)
 * 遵循 Matt Pocock 深模块哲学与统一 Trace 引擎规范
 * 职责：无向图 BFS 状态推演、前驱重构最优跳步路径、四语言 1-based 动态行号联动
 */

import { HighlightTarget } from '../../../core/code-panel';
import { AlgorithmExecutionTraceEngine } from '../../../core/algorithm-execution-trace-engine';

export interface FindRouteStepVars {
  nodes: number[];
  edges: [number, number][];
  positions?: { x: number; y: number }[];
  visited: Set<number>;
  currentNode: number | null;
  inspectingNeighbor: number | null;
  queue: number[];
  source: number;
  dest: number;
  destination: number;
  u: number | null;
  v: number | null;
  path: number[];
  found: boolean | null;
  action: 'init' | 'start' | 'dequeue' | 'inspect' | 'found' | 'done';
  statusText: string;
}

export interface FindRouteStep {
  nodes: number[];
  edges: [number, number][];
  positions?: { x: number; y: number }[];
  visited: Set<number>;
  currentNode: number | null;
  inspectingNeighbor: number | null;
  queue: number[];
  source: number;
  dest: number;
  destination: number;
  u: number | null;
  v: number | null;
  path: number[];
  found: boolean | null;
  action: 'init' | 'start' | 'dequeue' | 'inspect' | 'found' | 'done';
  statusText: string;
  message?: string;
  log: string;
  codeLine: HighlightTarget;
  metrics: Record<string, string>;
  vars?: FindRouteStepVars;
}

export interface FindRouteInput {
  nodes: number[];
  edges: [number, number][];
  source: number;
  dest: number;
  positions?: { x: number; y: number }[];
}

export const DEFAULT_FR_POSITIONS: { x: number; y: number }[] = [
  { x: 80, y: 70 },
  { x: 220, y: 50 },
  { x: 370, y: 70 },
  { x: 130, y: 190 },
  { x: 280, y: 190 },
  { x: 420, y: 190 },
];

export const FIND_ROUTE_PRESETS: Record<string, FindRouteInput> = {
  'connected-6': {
    nodes: [0, 1, 2, 3, 4, 5],
    edges: [
      [0, 1],
      [1, 2],
      [0, 3],
      [3, 4],
      [2, 5],
      [4, 5],
    ],
    source: 0,
    dest: 5,
    positions: DEFAULT_FR_POSITIONS,
  },
  'disconnected-6': {
    nodes: [0, 1, 2, 3, 4, 5],
    edges: [
      [0, 1],
      [0, 2],
      [1, 2],
      [3, 4],
      [4, 5],
      [3, 5],
    ],
    source: 0,
    dest: 5,
    positions: DEFAULT_FR_POSITIONS,
  },
  'diamond-4': {
    nodes: [0, 1, 2, 3],
    edges: [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3],
    ],
    source: 0,
    dest: 3,
    positions: [
      { x: 90, y: 120 },
      { x: 240, y: 60 },
      { x: 240, y: 180 },
      { x: 390, y: 120 },
    ],
  },
};

export const FIND_ROUTE_ANCHOR_MAP: Record<string, Record<string, number>> = {
  java: {
    entry: 2,
    checkBase: 3,
    buildGraph: 6,
    initVisited: 10,
    initQueue: 11,
    markSource: 13,
    whileQueue: 14,
    pollNode: 15,
    checkDest: 16,
    returnFound: 16,
    loopNeighbors: 17,
    checkVisited: 18,
    markVisited: 19,
    offerQueue: 20,
    returnFalse: 24,
  },
  cpp: {
    entry: 3,
    checkBase: 4,
    buildGraph: 6,
    initVisited: 10,
    initQueue: 11,
    markSource: 13,
    whileQueue: 14,
    pollNode: 15,
    checkDest: 16,
    returnFound: 16,
    loopNeighbors: 17,
    checkVisited: 18,
    markVisited: 19,
    offerQueue: 20,
    returnFalse: 24,
  },
  python: {
    entry: 2,
    checkBase: 3,
    buildGraph: 6,
    initVisited: 9,
    initQueue: 10,
    markSource: 9,
    whileQueue: 11,
    pollNode: 12,
    checkDest: 13,
    returnFound: 14,
    loopNeighbors: 15,
    checkVisited: 16,
    markVisited: 17,
    offerQueue: 18,
    returnFalse: 19,
  },
  javascript: {
    entry: 1,
    checkBase: 2,
    buildGraph: 4,
    initVisited: 8,
    initQueue: 9,
    markSource: 10,
    whileQueue: 11,
    pollNode: 12,
    checkDest: 13,
    returnFound: 13,
    loopNeighbors: 14,
    checkVisited: 15,
    markVisited: 16,
    offerQueue: 17,
    returnFalse: 21,
  },
};

function formatMetrics(
  currentNode: number | null,
  queue: number[],
  visitedCount: number,
  totalNodes: number,
  found: boolean | null,
  path: number[]
): Record<string, string> {
  return {
    'metric-cur-node': currentNode !== null ? `${currentNode}` : '—',
    'metric-queue': queue.length > 0 ? `[${queue.join(', ')}]` : '[ ]',
    'metric-visited-count': `${visitedCount} / ${totalNodes}`,
    'metric-found':
      found === true ? '存在路径 (true)' : found === false ? '不可达 (false)' : '搜索中...',
    'result-path': path.length > 0 ? `[${path.join(' -> ')}]` : '—',
  };
}

/**
 * 纯函数式、无 DOM 依赖的有效路径搜索追踪器
 */
export function traceFindRoute(input: FindRouteInput = FIND_ROUTE_PRESETS['connected-6']) {
  return AlgorithmExecutionTraceEngine.trace<FindRouteStepVars>(
    (recorder) => {
      const { nodes, edges, source, dest, positions } = input;

      const adjList = new Map<number, number[]>();
      for (const u of nodes) {
        adjList.set(u, []);
      }
      for (const [u, v] of edges) {
        adjList.get(u)?.push(v);
        adjList.get(v)?.push(u);
      }

      const visited = new Set<number>();
      const queue: number[] = [];
      const parentMap = new Map<number, number>();

      function emit(
        anchor: string,
        statusText: string,
        message: string,
        log: string,
        action: 'init' | 'start' | 'dequeue' | 'inspect' | 'found' | 'done',
        currentNode: number | null,
        inspectingNeighbor: number | null,
        path: number[],
        found: boolean | null
      ): void {
        const varsSnapshot: FindRouteStepVars = {
          nodes,
          edges,
          positions,
          visited: new Set(visited),
          currentNode,
          inspectingNeighbor,
          queue: [...queue],
          source,
          dest,
          destination: dest,
          u: currentNode,
          v: inspectingNeighbor,
          path: [...path],
          found,
          action,
          statusText,
        };

        recorder.step({
          anchor,
          message,
          log,
          type: action === 'done' ? 'done' : 'step',
          vars: varsSnapshot,
          metrics: formatMetrics(currentNode, queue, visited.size, nodes.length, found, path),
        });
      }

      // 1. 初始化步骤
      emit(
        'entry',
        `无向图包含 ${nodes.length} 个节点和 ${edges.length} 条边。目标：判断从起点 ${source} 到终点 ${dest} 是否存在路径。`,
        `无向图初始化，目标判断 ${source} -> ${dest} 连通性`,
        `初始化: source=${source}, destination=${dest}`,
        'init',
        null,
        null,
        [],
        null
      );

      // 边界特判：起点即终点
      if (source === dest) {
        emit(
          'checkBase',
          `起点与终点重合 (${source} === ${dest})，直接判定连通！`,
          `起点即终点，路径直接成立`,
          `✓ 起点即终点: [${source}]`,
          'found',
          source,
          null,
          [source],
          true
        );
        return;
      }

      // 2. 起点入队与标记
      visited.add(source);
      queue.push(source);
      emit(
        'initQueue',
        `起点 ${source} 加入队列并标记为已访问，启动广度优先遍历 (BFS)。`,
        `起点 ${source} 入队，启动 BFS 搜索`,
        `起点入队: ${source}`,
        'start',
        source,
        null,
        [],
        null
      );

      let foundPath: number[] = [];
      let isFound = false;

      // 3. BFS 遍历主循环
      while (queue.length > 0) {
        emit(
          'whileQueue',
          `检查队列非空，当前待处理节点数: ${queue.length}。`,
          `队列非空，当前队列长度: ${queue.length}`,
          `队列检查: len=${queue.length}`,
          'dequeue',
          null,
          null,
          [],
          null
        );

        const u = queue.shift()!;

        emit(
          'pollNode',
          `队首节点 ${u} 出队进行扩展探测，当前队列剩余: [${queue.join(', ')}]。`,
          `节点 ${u} 出队进行邻接点探索`,
          `队首出队: ${u}`,
          'dequeue',
          u,
          null,
          [],
          null
        );

        // 目标检测
        if (u === dest) {
          isFound = true;
          const p: number[] = [dest];
          let cur = dest;
          while (parentMap.has(cur)) {
            cur = parentMap.get(cur)!;
            p.unshift(cur);
          }
          foundPath = p;

          emit(
            'checkDest',
            `🎉 成功搜索到终点 ${dest}！利用前驱记录重构最优路径: [${foundPath.join(' -> ')}]。`,
            `到达目标节点 ${dest}，回溯得到最短路径`,
            `✓ 命中目标: 到达节点 ${dest}，路径存在！`,
            'found',
            u,
            null,
            foundPath,
            true
          );
          break;
        }

        const neighbors = adjList.get(u) || [];
        for (const v of neighbors) {
          emit(
            'loopNeighbors',
            `考察节点 ${u} 的出边邻居 ${v}。`,
            `检查邻居节点 ${v}`,
            `考察邻居: ${u} -> ${v}`,
            'inspect',
            u,
            v,
            [],
            null
          );

          if (!visited.has(v)) {
            visited.add(v);
            parentMap.set(v, u);
            queue.push(v);

            emit(
              'offerQueue',
              `节点 ${u} 探索未访问邻居 ${v}，将其加入队列并记录前驱 parent[${v}] = ${u}。`,
              `节点 ${u} 探索并入队邻居 ${v}`,
              `扩展邻居: ${u} -> ${v}，加入队列`,
              'inspect',
              u,
              v,
              [],
              null
            );
          }
        }
      }

      // 4. 结算步骤 (严格对齐正确返回语句)
      if (isFound) {
        emit(
          'returnFound',
          `🎉 搜索完成！起点 ${source} 与终点 ${dest} 连通，路径为: [${foundPath.join(' -> ')}]。`,
          `连通性判定完成：两点连通`,
          `✓ 算法执行完毕，连通性结果 = true`,
          'done',
          null,
          null,
          foundPath,
          true
        );
      } else {
        emit(
          'returnFalse',
          `❌ 搜索结束，队列已空，起点 ${source} 无法到达终点 ${dest}。`,
          `连通性判定完成：两点不连通`,
          `✓ 算法执行完毕，连通性结果 = false`,
          'done',
          null,
          null,
          [],
          false
        );
      }
    },
    {
      anchorMap: FIND_ROUTE_ANCHOR_MAP,
      specKey: 'find-route',
    }
  );
}

/**
 * 保持 100% 架构向后兼容的步骤构建适配器
 */
export function buildFindRouteSteps(input: FindRouteInput = FIND_ROUTE_PRESETS['connected-6']): FindRouteStep[] {
  const traceSteps = traceFindRoute(input);
  return traceSteps.map((step) => {
    const v = step.vars!;
    return {
      nodes: v.nodes,
      edges: v.edges,
      positions: v.positions,
      visited: v.visited,
      currentNode: v.currentNode,
      inspectingNeighbor: v.inspectingNeighbor,
      queue: v.queue,
      source: v.source,
      dest: v.dest,
      destination: v.destination,
      u: v.u,
      v: v.v,
      path: v.path,
      found: v.found,
      action: v.action,
      statusText: v.statusText,
      message: step.message || '',
      log: step.log || '',
      codeLine: (step.codeLinesByLang || step.codeLine) as HighlightTarget,
      metrics: step.metrics as Record<string, string>,
      vars: v,
    };
  });
}

export type FRStep = FindRouteStep;
export const FR_NODES = FIND_ROUTE_PRESETS['connected-6'].nodes;
export const FR_EDGES = FIND_ROUTE_PRESETS['connected-6'].edges;
export const FR_NODE_POSITIONS = DEFAULT_FR_POSITIONS;
export const buildFRSteps = () => buildFindRouteSteps();
