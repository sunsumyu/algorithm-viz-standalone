/**
 * 所有可能的路径 (LC 797) — 步进推演编译器 (Deep Module)
 * 遵循 Matt Pocock 深模块哲学与统一 Trace 引擎规范
 * 职责：DAG 回溯 DFS 状态推演、多路径收集、四语言 1-based 动态行号联动
 */

import { HighlightTarget } from '../../../core/code-panel';
import { AlgorithmExecutionTraceEngine } from '../../../core/algorithm-execution-trace-engine';
import { snapshotGrid2D } from '../../../core/strategies/grid-snapshot';

export interface ReachablePathsStepVars {
  nodes: number[];
  edges: [number, number][];
  currentNode: number | null;
  node: number | null;
  next: number | null;
  target: number;
  currentPath: number[];
  allPaths: number[][];
  action: 'init' | 'dfs-enter' | 'target-reached' | 'backtrack' | 'done';
  statusText: string;
}

export interface ReachablePathsStep {
  nodes: number[];
  edges: [number, number][];
  currentNode: number | null;
  currentPath: number[];
  allPaths: number[][];
  action: 'init' | 'dfs-enter' | 'target-reached' | 'backtrack' | 'done';
  statusText: string;
  log: string;
  message?: string;
  codeLine: HighlightTarget;
  metrics: Record<string, string | number>;
  vars?: ReachablePathsStepVars;
}

export type RPStep = ReachablePathsStep;

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

export const REACHABLE_PATHS_ANCHOR_MAP: Record<string, Record<string, number>> = {
  java: {
    entry: 2,
    initPath: 5,
    callDfs: 6,
    returnRes: 7,
    dfsHead: 9,
    checkTarget: 10,
    collectPath: 11,
    returnBase: 12,
    loopNeighbors: 14,
    pushNext: 15,
    recurse: 16,
    backtrack: 17,
    done: 7,
  },
  cpp: {
    entry: 3,
    initPath: 5,
    callDfs: 6,
    returnRes: 7,
    dfsHead: 10,
    checkTarget: 11,
    collectPath: 12,
    returnBase: 13,
    loopNeighbors: 15,
    pushNext: 16,
    recurse: 17,
    backtrack: 18,
    done: 7,
  },
  python: {
    entry: 2,
    initPath: 4,
    callDfs: 13,
    returnRes: 14,
    dfsHead: 5,
    checkTarget: 6,
    collectPath: 7,
    returnBase: 8,
    loopNeighbors: 9,
    pushNext: 10,
    recurse: 11,
    backtrack: 12,
    done: 14,
  },
  javascript: {
    entry: 1,
    initPath: 3,
    callDfs: 15,
    returnRes: 16,
    dfsHead: 4,
    checkTarget: 5,
    collectPath: 6,
    returnBase: 7,
    loopNeighbors: 9,
    pushNext: 10,
    recurse: 11,
    backtrack: 12,
    done: 16,
  },
};

export function parseGraphInput(raw: string | undefined): number[][] {
  const fallback = snapshotGrid2D(DEFAULT_GRAPH);
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

function formatMetrics(
  currentNode: number | null,
  currentPath: number[],
  action: 'init' | 'dfs-enter' | 'target-reached' | 'backtrack' | 'done',
  allPathsCount: number
): Record<string, string | number> {
  let actionText = '准备开始';
  if (action === 'target-reached') actionText = '🎯 找到路径';
  else if (action === 'backtrack') actionText = '↩ 回溯弹出';
  else if (action === 'dfs-enter') actionText = '深入探索';
  else if (action === 'done') actionText = '搜索完成';

  return {
    'metric-rp-cur-node': currentNode !== null ? `${currentNode}` : '—',
    'metric-rp-path': currentPath.length > 0 ? `[${currentPath.join(' ➔ ')}]` : '[ ]',
    'metric-rp-action': actionText,
    'metric-rp-total': allPathsCount,
  };
}

export function traceReachablePaths(graph: number[][] = DEFAULT_GRAPH) {
  return AlgorithmExecutionTraceEngine.trace<ReachablePathsStepVars>(
    (recorder) => {
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

      function emit(
        anchor: string,
        statusText: string,
        message: string,
        log: string,
        action: 'init' | 'dfs-enter' | 'target-reached' | 'backtrack' | 'done',
        currentNode: number | null,
        node: number | null,
        next: number | null
      ): void {
        const varsSnapshot: ReachablePathsStepVars = {
          nodes,
          edges,
          currentNode,
          node,
          next,
          target,
          currentPath: [...currentPath],
          allPaths: allPaths.map((p) => [...p]),
          action,
          statusText,
        };

        recorder.step({
          anchor,
          message,
          log,
          type: action === 'done' ? 'done' : 'step',
          vars: varsSnapshot,
          metrics: formatMetrics(currentNode, currentPath, action, allPaths.length),
        });
      }

      // 1. 初始化
      emit(
        'initPath',
        `初始化 DAG 图结构，节点 0 为起点，节点 ${target} 为目标终点。`,
        `初始化 DFS 路径搜索: 0 -> ${target}`,
        `初始化: 0 -> ${target} 所有路径搜索`,
        'init',
        null,
        0,
        null
      );

      const dfs = (node: number) => {
        emit(
          'dfsHead',
          `递归进入节点 ${node}，当前探索路径: [${currentPath.join(' -> ')}]。`,
          `深入探索节点 ${node}`,
          `访问节点: ${node}，路径: [${currentPath.join(' -> ')}]`,
          'dfs-enter',
          node,
          node,
          null
        );

        if (node === target) {
          allPaths.push([...currentPath]);
          emit(
            'collectPath',
            `🎉 到达终点 ${target}！收集一条完整有效路径: [${currentPath.join(' -> ')}]。`,
            `命中目标终点，收集路径 #${allPaths.length}`,
            `✓ 命中目标: 找到路径 #${allPaths.length} [${currentPath.join(' -> ')}]`,
            'target-reached',
            node,
            node,
            null
          );
          return;
        }

        const neighbors = graph[node] || [];
        for (const next of neighbors) {
          emit(
            'loopNeighbors',
            `节点 ${node} 探测分支出边邻居 ${next}。`,
            `从节点 ${node} 探测邻居 ${next}`,
            `探测出边: ${node} -> ${next}`,
            'dfs-enter',
            node,
            node,
            next
          );

          currentPath.push(next);
          dfs(next);
          currentPath.pop();

          emit(
            'backtrack',
            `回溯：从节点 ${next} 返回，当前路径恢复为 [${currentPath.join(' -> ')}]。`,
            `回溯弹出节点 ${next}`,
            `回溯返回: 节点 ${node}，弹出 ${next}`,
            'backtrack',
            node,
            node,
            next
          );
        }
      };

      emit(
        'callDfs',
        `从源节点 0 启动 DFS 深度递归。`,
        `启动递归: dfs(0)`,
        `调用 dfs(0)`,
        'dfs-enter',
        0,
        0,
        null
      );

      dfs(0);

      emit(
        'done',
        `🎉 路径搜索完成！从 0 到 ${target} 共发现 ${allPaths.length} 条所有可能路径。`,
        `DFS 搜索完成，总计发现 ${allPaths.length} 条有效路径`,
        `✓ 搜索完毕: 共输出 ${allPaths.length} 条路径方案`,
        'done',
        null,
        null,
        null
      );
    },
    {
      anchorMap: REACHABLE_PATHS_ANCHOR_MAP,
      specKey: 'reachable-paths',
    }
  );
}

export function buildReachableSteps(graph: number[][] = DEFAULT_GRAPH): ReachablePathsStep[] {
  const traceSteps = traceReachablePaths(graph);
  return traceSteps.map((step) => {
    const v = step.vars!;
    return {
      nodes: v.nodes,
      edges: v.edges,
      currentNode: v.currentNode,
      currentPath: v.currentPath,
      allPaths: v.allPaths,
      action: v.action,
      statusText: v.statusText,
      log: step.log || '',
      message: step.message || '',
      codeLine: (step.codeLinesByLang || step.codeLine) as HighlightTarget,
      metrics: (step.metrics || {}) as Record<string, string | number>,
      vars: v,
    };
  });
}

export function withMetrics(steps: ReachablePathsStep[]): ReachablePathsStep[] {
  return steps;
}
