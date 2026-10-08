/**
 * 左程云算法通关课 Class 064: 网络延迟时间 (Network Delay Time · LeetCode 743) - 步进推演编译器
 */

import { NETWORK_DELAY_064_LINES } from './graph-064-stage-codes';
import { Graph064StepBase } from './graph-064-shared';

export interface NetworkDelayStep extends Graph064StepBase {
  n: number;
  k: number;
  curNode: number | null;
  distList: number[];
  visitedList: boolean[];
  pqSnapshot: Array<{ u: number; d: number }>;
  maxDelaySoFar: number;
  activeEdge?: [number, number, number];
}

export function buildNetworkDelay064Steps(preset: string = 'classic_4nodes'): NetworkDelayStep[] {
  const steps: NetworkDelayStep[] = [];
  const lines = NETWORK_DELAY_064_LINES;

  let n = 4;
  let k = 2;
  let times: Array<[number, number, number]> = [];

  if (preset === 'disconnected_nodes') {
    n = 4;
    k = 1;
    times = [
      [1, 2, 1],
      [2, 3, 2],
    ];
  } else if (preset === 'line_chain') {
    n = 3;
    k = 1;
    times = [
      [1, 2, 3],
      [2, 3, 4],
    ];
  } else {
    n = 4;
    k = 2;
    times = [
      [2, 1, 1],
      [2, 3, 1],
      [3, 4, 1],
    ];
  }

  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of times) {
    adj[u].push({ to: v, w });
  }

  const dist = new Array(n + 1).fill(Infinity);
  const visited = new Array(n + 1).fill(false);
  dist[k] = 0;

  const pq: Array<{ u: number; d: number }> = [{ u: k, d: 0 }];

  // 1. 初始化
  steps.push({
    n,
    k,
    curNode: null,
    distList: [...dist],
    visitedList: [...visited],
    pqSnapshot: [...pq],
    maxDelaySoFar: 0,
    decision: `1. 初始化 Dijkstra 最短路环境：源点设为 Node ${k}，dist[${k}] = 0，其余节点置为 ∞`,
    message: `准备利用小根堆维护信号到达波前，探查向外广播的最短时间。`,
    log: `Init -> dist[${k}]=0, all others=INF`,
    line: lines.init.javascript,
    codeLine: lines.init,
    metrics: { '源点': `Node ${k}`, '总节点数': n, '全网状态': '准备就绪' },
    statusBadge: { text: `源点就绪: Node ${k}`, type: 'info' },
  });

  steps.push({
    n,
    k,
    curNode: k,
    distList: [...dist],
    visitedList: [...visited],
    pqSnapshot: [...pq],
    maxDelaySoFar: 0,
    decision: `源点信号发射：Node ${k} 携带到达时间 0 入堆`,
    message: `小根堆加入首个波前元素 (u=${k}, d=0)。`,
    log: `Push source -> (${k}, 0)`,
    line: lines.pushSrc.javascript,
    codeLine: lines.pushSrc,
    metrics: { '堆中元素': 1, '当前波前': `Node ${k}` },
    statusBadge: { text: `发射信号: N${k}`, type: 'info' },
  });

  while (pq.length > 0) {
    pq.sort((a, b) => a.d - b.d);
    const { u, d } = pq.shift()!;

    if (visited[u]) {
      steps.push({
        n,
        k,
        curNode: u,
        distList: [...dist],
        visitedList: [...visited],
        pqSnapshot: [...pq],
        maxDelaySoFar: Math.max(...dist.filter((x) => x !== Infinity)),
        decision: `弹出节点 Node ${u}，但该节点先前已锁定 (visited[${u}]=true)，跳过冗余拓展`,
        message: `防止同一节点因多条边松弛重复入堆导致的无效计算。`,
        log: `Skip visited -> Node ${u}`,
        line: lines.skipVisited.javascript,
        codeLine: lines.skipVisited,
        metrics: { '当前节点': `Node ${u}`, '状态': '已访问跳过' },
        statusBadge: { text: `跳过冗余: N${u}`, type: 'warning' },
      });
      continue;
    }

    visited[u] = true;

    steps.push({
      n,
      k,
      curNode: u,
      distList: [...dist],
      visitedList: [...visited],
      pqSnapshot: [...pq],
      maxDelaySoFar: Math.max(...dist.filter((x) => x !== Infinity)),
      decision: `堆顶贪心弹出全局最小距离节点 Node ${u} (到达时间=${d}ms)，锁定该节点最短路`,
      message: `非负权图中，当前堆顶节点距离已不可被更优路径松弛，状态定格。`,
      log: `Poll min -> Node ${u}, dist=${d}`,
      line: lines.pollNode.javascript,
      codeLine: lines.pollNode,
      metrics: { '锁定节点': `Node ${u}`, '最短到达时间': `${d}ms` },
      statusBadge: { text: `锁定最短路: N${u}`, type: 'success' },
    });

    for (const edge of adj[u]) {
      const v = edge.to;
      const w = edge.w;
      const newDist = d + w;

      if (newDist < dist[v]) {
        dist[v] = newDist;
        pq.push({ u: v, d: newDist });

        steps.push({
          n,
          k,
          curNode: u,
          distList: [...dist],
          visitedList: [...visited],
          pqSnapshot: [...pq],
          maxDelaySoFar: Math.max(...dist.filter((x) => x !== Infinity)),
          activeEdge: [u, v, w],
          decision: `沿有向边 (${u} ➔ ${v}, 耗时 ${w}ms) 松弛成功：dist[${v}] 更新为 ${newDist}ms 并入堆`,
          message: `发现到达 Node ${v} 的更快路径：${d} + ${w} = ${newDist}ms。`,
          log: `Relax edge (${u} -> ${v}, w=${w}) -> dist[${v}]=${newDist}`,
          line: lines.relaxEdge.javascript,
          codeLine: lines.relaxEdge,
          metrics: { '松弛边': `${u}➔${v}`, '权重': `${w}ms`, '新到达时间': `${newDist}ms` },
          statusBadge: { text: `松弛: N${u}➔N${v}`, type: 'info' },
        });
      }
    }
  }

  // 终态统计
  let maxDelay = 0;
  let allReachable = true;
  for (let i = 1; i <= n; i++) {
    if (dist[i] === Infinity) {
      allReachable = false;
      break;
    }
    maxDelay = Math.max(maxDelay, dist[i]);
  }

  const finalAns = allReachable ? maxDelay : -1;

  steps.push({
    n,
    k,
    curNode: null,
    distList: [...dist],
    visitedList: [...visited],
    pqSnapshot: [],
    maxDelaySoFar: finalAns,
    decision: allReachable
      ? `波前搜索完成：全网所有节点均收到信号，最终全网延迟时间 max(dist[1..n]) = ${finalAns}ms`
      : `波前搜索完成：存在无法收到信号的孤立节点 (dist=∞)，全网不可达，返回 -1`,
    message: allReachable
      ? `全网覆盖时间取决于最晚到达的节点。`
      : `图不连通，信号无法覆盖全体网络。`,
    log: `Dijkstra completed -> result = ${finalAns}`,
    line: lines.returnResult.javascript,
    codeLine: lines.returnResult,
    metrics: { '最终结果': finalAns === -1 ? '全网不可达 (-1)' : `${finalAns}ms`, '覆盖率': allReachable ? '100%' : '部分受阻' },
    statusBadge: { text: `最终耗时: ${finalAns === -1 ? '-1' : `${finalAns}ms`}`, type: allReachable ? 'success' : 'danger' },
  });

  return steps;
}
