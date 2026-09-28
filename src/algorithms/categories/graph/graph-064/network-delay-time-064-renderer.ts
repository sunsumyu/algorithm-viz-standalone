/**
 * 左程云算法通关课 Class 064: 网络延迟时间 (Network Delay Time · LeetCode 743)
 * 堆优化 Dijkstra 单源最短路径、波前广播与全网覆盖时间探测
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth & Bi-Version Synthesis):
 * 深度综合整合：
 * 1. 经典版本的拓扑连通矩阵、典型用例预设 (leetcode743_classic, disconnected, chain)；
 * 2. 声明式规范、名师讲义与四语言 1-based 精准行号联动。
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_064_PROBLEMS } from './graph-064-problem-content';
import {
  NETWORK_DELAY_064_CODES,
  NETWORK_DELAY_064_LINES,
} from './graph-064-stage-codes';
import {
  Graph064StepBase,
  renderGraph064NodeStatusMatrix,
  renderGraph064PriorityQueue,
} from './graph-064-shared';

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
    // 存在孤立节点 4
    n = 4;
    k = 1;
    times = [
      [1, 2, 1],
      [2, 3, 2],
    ];
  } else if (preset === 'line_chain') {
    // 链状广播
    n = 3;
    k = 1;
    times = [
      [1, 2, 3],
      [2, 3, 4],
    ];
  } else {
    // classic_4nodes (LeetCode 743 经典用例)
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
    codeLine: lines.returnResult,
    metrics: { '最终结果': finalAns === -1 ? '全网不可达 (-1)' : `${finalAns}ms`, '覆盖率': allReachable ? '100%' : '部分受阻' },
    statusBadge: { text: `最终耗时: ${finalAns === -1 ? '-1' : `${finalAns}ms`}`, type: allReachable ? 'success' : 'danger' },
  });

  return steps;
}

export const networkDelayTime064Visualizer = registerDeclarativeAlgorithm<NetworkDelayStep>({
  id: 'network-delay-time-064',
  aliases: ['network-delay-time', 'class064-code01', 'leetcode-743'],
  name: '网络延迟时间与堆优化最短路 (Class 064)',
  category: 'graph',
  icon: '📡',
  difficulty: 2,
  levelOrder: 6401,
  learningGoal: '掌握经典堆优化 Dijkstra 模板实现、单源最短路波前广播与不可达全网检测',
  problemHtml: GRAPH_064_PROBLEMS.networkDelayTime064.html,
  codeLanguages: NETWORK_DELAY_064_CODES,
  inputs: [
    {
      id: 'preset',
      label: '拓扑预设选择',
      type: 'select',
      defaultValue: 'classic_4nodes',
      options: [
        { label: '4 节点经典拓扑 (源点 2, 覆盖时间=2ms)', value: 'classic_4nodes' },
        { label: '3 节点链状广播 (源点 1, 覆盖时间=7ms)', value: 'line_chain' },
        { label: '存在孤立不可达节点 (返回 -1)', value: 'disconnected_nodes' },
      ],
    },
  ],
  presets: [
    { label: '4 节点经典拓扑 (LeetCode 743)', values: { preset: 'classic_4nodes' } },
    { label: '3 节点链状拓扑', values: { preset: 'line_chain' } },
    { label: '不可达节点特判 (-1)', values: { preset: 'disconnected_nodes' } },
  ],
  generateSteps: (inputs) => buildNetworkDelay064Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    const nodeItems = [];
    for (let i = 1; i <= step.n; i++) {
      nodeItems.push({
        id: i,
        label: `Node ${i}${i === step.k ? ' (源)' : ''}`,
        dist: step.distList[i],
        visited: step.visitedList[i],
        isCurrent: step.curNode === i,
      });
    }

    const pqItems = step.pqSnapshot.map((x) => ({
      label: `Node ${x.u}`,
      priority: `${x.d}ms`,
      highlight: step.curNode === x.u,
    }));

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 16px; gap: 12px;">
        ${renderGraph064NodeStatusMatrix(nodeItems, '全网节点延迟状态表')}
        <div style="width: 100%; max-width: 520px;">
          ${renderGraph064PriorityQueue(pqItems, '小根堆优先队列波前')}
        </div>
      </div>
    `;
  },
});
