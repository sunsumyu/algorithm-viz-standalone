/**
 * 左程云算法通关课 Class 064: 飞行路线与分层图最短路 (Flight Routes · 洛谷 P4568) - 步进推演编译器
 */

import { snapshotGrid2D } from '../../../../core/strategies/grid-snapshot';
import { LAYERED_DIJKSTRA_064_LINES } from './graph-064-stage-codes';
import { Graph064StepBase } from './graph-064-shared';

export interface LayeredStep extends Graph064StepBase {
  n: number;
  k: number;
  s: number;
  t: number;
  curNode: number | null;
  curUsed: number | null;
  distTable: number[][]; // dist[u][used]
  pqSnapshot: Array<{ u: number; used: number; d: number }>;
  bestCostSoFar: number;
}

export function buildLayeredDijkstra064Steps(preset: string = 'p4568_standard'): LayeredStep[] {
  const steps: LayeredStep[] = [];
  const lines = LAYERED_DIJKSTRA_064_LINES;

  let n = 5;
  let k = 1;
  let s = 0;
  let t = 4;
  let edges: Array<{ u: number; v: number; w: number }> = [];

  if (preset === 'simple_3node') {
    n = 3;
    k = 1;
    s = 0;
    t = 2;
    edges = [
      { u: 0, v: 1, w: 5 },
      { u: 1, v: 2, w: 2 },
      { u: 0, v: 2, w: 9 },
    ];
  } else {
    n = 5;
    k = 1;
    s = 0;
    t = 4;
    edges = [
      { u: 0, v: 1, w: 2 },
      { u: 0, v: 2, w: 5 },
      { u: 1, v: 2, w: 2 },
      { u: 1, v: 3, w: 4 },
      { u: 2, v: 3, w: 1 },
      { u: 2, v: 4, w: 7 },
      { u: 3, v: 4, w: 3 },
    ];
  }

  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n }, () => []);
  for (const e of edges) {
    adj[e.u].push({ to: e.v, w: e.w });
    adj[e.v].push({ to: e.u, w: e.w });
  }

  const dist: number[][] = Array.from({ length: n }, () => new Array(k + 1).fill(Infinity));
  dist[s][0] = 0;

  const pq: Array<{ u: number; used: number; d: number }> = [{ u: s, used: 0, d: 0 }];

  steps.push({
    n,
    k,
    s,
    t,
    curNode: null,
    curUsed: null,
    distTable: snapshotGrid2D(dist),
    pqSnapshot: [...pq],
    bestCostSoFar: Infinity,
    decision: `1. 初始化分层图二维距离矩阵 dist[${n}][${k + 1}]：起点 (城市 ${s}, 已用免票 0) 初始距离置为 0`,
    message: `将图扩维为 ${k + 1} 层，Layer 0 代表原图自费，Layer 1 代表消耗 1 次免费机票。`,
    log: `Init dist[${s}][0]=0`,
    line: lines.init.javascript,
    codeLine: lines.init,
    metrics: { '城市数': n, '免费票数': k, '起点': `城市 ${s}`, '终点': `城市 ${t}` },
    statusBadge: { text: `起点就绪: 城市${s}`, type: 'info' },
  });

  while (pq.length > 0) {
    pq.sort((a, b) => a.d - b.d);
    const { u, used, d } = pq.shift()!;

    if (d > dist[u][used]) continue;

    steps.push({
      n,
      k,
      s,
      t,
      curNode: u,
      curUsed: used,
      distTable: snapshotGrid2D(dist),
      pqSnapshot: [...pq],
      bestCostSoFar: dist[t][used] === Infinity ? Infinity : dist[t][used],
      decision: `堆顶弹出最优状态 (城市 ${u}, 已用机票 ${used} 次) [总费用 = ${d}]，进行双决策分层扩展`,
      message: `考虑：1. 同层正常购票飞往邻居；2. 跨层消耗 1 张免票免费跃迁。`,
      log: `Poll state (u=${u}, used=${used}) d=${d}`,
      line: lines.pollNode.javascript,
      codeLine: lines.pollNode,
      metrics: { '当前城市': `城市 ${u}`, '已用免票': `${used}/${k}`, '当前累计费用': d },
      statusBadge: { text: `探查: 城市${u} (票${used})`, type: 'info' },
    });

    if (u === t) {
      steps.push({
        n,
        k,
        s,
        t,
        curNode: u,
        curUsed: used,
        distTable: snapshotGrid2D(dist),
        pqSnapshot: [...pq],
        bestCostSoFar: d,
        decision: `到达目的地城市 ${t}！当前最短费用即为全局最优答案 ${d}`,
        message: `首次从堆顶弹出的终点状态即为全局最短路。`,
        log: `Target reached with cost ${d}`,
        line: lines.hitTarget.javascript,
        codeLine: lines.hitTarget,
        metrics: { '最终费用': d, '使用机票数': used },
        statusBadge: { text: `达成终点: 花费=${d}`, type: 'success' },
      });
      break;
    }

    for (const edge of adj[u]) {
      const v = edge.to;
      const w = edge.w;

      // 决策 1：同层买票
      if (dist[u][used] + w < dist[v][used]) {
        dist[v][used] = dist[u][used] + w;
        pq.push({ u: v, used, d: dist[v][used] });

        steps.push({
          n,
          k,
          s,
          t,
          curNode: u,
          curUsed: used,
          distTable: snapshotGrid2D(dist),
          pqSnapshot: [...pq],
          bestCostSoFar: dist[t][used] === Infinity ? Infinity : dist[t][used],
          decision: `[同层买票] 飞往城市 ${v}：花费票价 ${w}，更新 dist[${v}][${used}] = ${dist[v][used]}`,
          message: `未消耗免票机会，保持在 Layer ${used}。`,
          log: `Same-layer relax (${u}->${v}, w=${w}) -> dist[${v}][${used}]=${dist[v][used]}`,
          line: lines.sameLayerRelax.javascript,
          codeLine: lines.sameLayerRelax,
          metrics: { '决策': '正常购票', '下一城市': `城市 ${v}`, '费用': dist[v][used] },
          statusBadge: { text: `买票: 城市${v}`, type: 'info' },
        });
      }

      // 决策 2：跨层免费
      if (used < k && dist[u][used] < dist[v][used + 1]) {
        dist[v][used + 1] = dist[u][used];
        pq.push({ u: v, used: used + 1, d: dist[v][used + 1] });

        steps.push({
          n,
          k,
          s,
          t,
          curNode: u,
          curUsed: used,
          distTable: snapshotGrid2D(dist),
          pqSnapshot: [...pq],
          bestCostSoFar: dist[t][used + 1] === Infinity ? Infinity : dist[t][used + 1],
          decision: `[跨层免票] 使用 1 张免费机票飞往城市 ${v}：费用 +0，更新 Layer ${used + 1} 的 dist[${v}][${used + 1}] = ${dist[v][used + 1]}`,
          message: `成功消耗 1 次免费权利，状态跃迁至下一层图。`,
          log: `Free-layer relax (${u}->${v}, free) -> dist[${v}][${used+1}]=${dist[v][used+1]}`,
          line: lines.freeLayerRelax.javascript,
          codeLine: lines.freeLayerRelax,
          metrics: { '决策': '🎟️ 免费跃迁', '下一城市': `城市 ${v}`, '剩余免票': k - (used + 1) },
          statusBadge: { text: `免票: 城市${v}`, type: 'success' },
        });
      }
    }
  }

  return steps;
}
