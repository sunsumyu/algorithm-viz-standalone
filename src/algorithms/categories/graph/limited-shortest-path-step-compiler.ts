/**
 * K 站中转内最便宜的航班 (LC 787 - Limited Shortest Path) 步进编译器 (Deep Module)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：限制最多 K+1 条边的 Bellman-Ford 状态备份推演、防串联松弛、行号联动
 */

import { StepBase } from '../../../core/step-visualizer';

export interface LSPStep extends StepBase {
  dist: number[];
  prevDist: number[];
  round: number;
  maxK: number;
  currentEdge: { u: number; v: number; w: number } | null;
  relaxedEdge: boolean;
  relaxCount: number;
  source: number;
  target: number;
  action: 'init' | 'relax-success' | 'relax-skip' | 'round-done' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export const LSP_EDGES = [
  { u: 0, v: 1, w: 3 },
  { u: 0, v: 2, w: 5 },
  { u: 1, v: 2, w: 1 },
  { u: 1, v: 3, w: 6 },
  { u: 2, v: 3, w: 2 },
  { u: 2, v: 4, w: 7 },
  { u: 3, v: 4, w: 2 },
];

export const LSP_NODES = [0, 1, 2, 3, 4];
export const LSP_NODE_POS = [
  { x: 60, y: 130 },
  { x: 180, y: 60 },
  { x: 180, y: 200 },
  { x: 320, y: 60 },
  { x: 400, y: 150 },
];

export const LSP_SOURCE = 0;
export const LSP_TARGET = 4;
export const LSP_K = 2; // 最多 2 次中转 => 最多 3 条边

const lines: Record<string, number | number[]> = {
  init: [1, 2, 3, 4],
  relaxsuccess: [9, 10],
  relaxskip: 8,
  rounddone: 6,
  done: 13,
};

export function buildLSPSteps(): LSPStep[] {
  const steps: LSPStep[] = [];
  const n = LSP_NODES.length;
  const INF = 999999;
  const dist = new Array(n).fill(INF);
  dist[LSP_SOURCE] = 0;
  let totalRelax = 0;

  steps.push({
    dist: [...dist],
    prevDist: [...dist],
    round: 0,
    maxK: LSP_K + 1,
    currentEdge: null,
    relaxedEdge: false,
    relaxCount: 0,
    source: LSP_SOURCE,
    target: LSP_TARGET,
    action: 'init',
    statusText: `初始化：起点=${LSP_SOURCE}，终点=${LSP_TARGET}，最多允许中转 ${LSP_K} 次（最多走 ${LSP_K + 1} 条边）。dist[${LSP_SOURCE}]=0，其余=INF。`,
    log: `初始化: src=${LSP_SOURCE}, dst=${LSP_TARGET}, K=${LSP_K}`,
    codeLine: lines.init,
  });

  for (let round = 1; round <= LSP_K + 1; round++) {
    const clone = [...dist]; // 关键备份

    for (let ei = 0; ei < LSP_EDGES.length; ei++) {
      const e = LSP_EDGES[ei];

      if (clone[e.u] !== INF && clone[e.u] + e.w < dist[e.v]) {
        const oldVal = dist[e.v];
        dist[e.v] = clone[e.u] + e.w;
        totalRelax++;

        steps.push({
          dist: [...dist],
          prevDist: clone,
          round,
          maxK: LSP_K + 1,
          currentEdge: e,
          relaxedEdge: true,
          relaxCount: totalRelax,
          source: LSP_SOURCE,
          target: LSP_TARGET,
          action: 'relax-success',
          statusText: `第 ${round} 轮，航线 (${e.u})->(${e.v}) 价格=${e.w}：clone[${e.u}]+${e.w}=${clone[e.u] + e.w} < ${oldVal === INF ? 'INF' : oldVal}，松弛成功！更新 dist[${e.v}]=${dist[e.v]}。`,
          log: `[第 ${round} 轮] 松弛成功: (${e.u})->(${e.v})，价格更新为 ${dist[e.v]}`,
          codeLine: lines.relaxsuccess,
        });
      } else {
        const reason = clone[e.u] === INF ? `前驱 dist[${e.u}]=INF` : `${clone[e.u]}+${e.w} >= dist[${e.v}] (${dist[e.v]})`;
        steps.push({
          dist: [...dist],
          prevDist: clone,
          round,
          maxK: LSP_K + 1,
          currentEdge: e,
          relaxedEdge: false,
          relaxCount: totalRelax,
          source: LSP_SOURCE,
          target: LSP_TARGET,
          action: 'relax-skip',
          statusText: `第 ${round} 轮，航线 (${e.u})->(${e.v}) 价格=${e.w}：${reason}，跳过不更新。`,
          log: `[第 ${round} 轮] 航线 (${e.u})->(${e.v}): 无需松弛`,
          codeLine: lines.relaxskip,
        });
      }
    }

    steps.push({
      dist: [...dist],
      prevDist: clone,
      round,
      maxK: LSP_K + 1,
      currentEdge: null,
      relaxedEdge: false,
      relaxCount: totalRelax,
      source: LSP_SOURCE,
      target: LSP_TARGET,
      action: 'round-done',
      statusText: `✓ 第 ${round} 轮松弛迭代完成（已允许最多经过 ${round} 条边）。`,
      log: `✓ 完成第 ${round} 轮松弛，当前终点最低价格 = ${dist[LSP_TARGET] === INF ? 'INF' : dist[LSP_TARGET]}`,
      codeLine: lines.rounddone,
    });
  }

  const finalCost = dist[LSP_TARGET] === INF ? -1 : dist[LSP_TARGET];
  steps.push({
    dist: [...dist],
    prevDist: [...dist],
    round: LSP_K + 1,
    maxK: LSP_K + 1,
    currentEdge: null,
    relaxedEdge: false,
    relaxCount: totalRelax,
    source: LSP_SOURCE,
    target: LSP_TARGET,
    action: 'done',
    statusText: `🎉 有限最短路算法完成！在最多 ${LSP_K} 站中转内，从城市 ${LSP_SOURCE} 到城市 ${LSP_TARGET} 的最低总价格为 ${finalCost}。`,
    log: `✓ 求解完成: 最低总价格 = ${finalCost}`,
    codeLine: lines.done,
  });

  return steps;
}

export function withMetrics(steps: LSPStep[]): LSPStep[] {
  return steps.map((s) => ({
    ...s,
    metrics: {
      'metric-lsp-round': `${s.round} / ${s.maxK}`,
      'metric-lsp-edge': s.currentEdge ? `(${s.currentEdge.u} ➔ ${s.currentEdge.v}) [${s.currentEdge.w}]` : '—',
      'metric-lsp-relax': `${s.relaxCount}`,
      'metric-lsp-dst': `${s.dist[s.target] >= 999999 ? 'INF' : s.dist[s.target]}`,
    },
  }));
}
