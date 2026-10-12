/**
 * Class 142: 差分约束系统与负环判定 步进推演编译器
 * 核心：约束不等式转有向图、超级源点初始化、SPFA 最短路松弛与入队次数负环判定
 */

import { Advanced142Step } from '../../../algorithms/categories/advanced-topics/advanced-142-148/advanced-142-148-shared';
import { DIFF_CONSTRAINTS_LINES } from '../../../algorithms/categories/advanced-topics/advanced-142-148/advanced-142-148-stage-codes';

export interface DiffConstraintsEdge {
  u: number;
  v: number;
  w: number;
  active?: boolean;
}

export interface DiffConstraintsStep extends Advanced142Step {
  n: number;
  dist: number[];
  count: number[];
  inQueue: boolean[];
  activeNode: number;
  edges: DiffConstraintsEdge[];
  hasNegativeCycle: boolean;
}

export function buildDiffConstraintsSteps(
  n: number,
  rawEdges: { u: number; v: number; w: number }[]
): DiffConstraintsStep[] {
  const steps: DiffConstraintsStep[] = [];
  const lines = DIFF_CONSTRAINTS_LINES;

  const dist = new Array(n + 1).fill(0);
  const count = new Array(n + 1).fill(0);
  const inQueue = new Array(n + 1).fill(false);
  const edges: DiffConstraintsEdge[] = rawEdges.map(e => ({ ...e }));

  const cloneDist = () => [...dist];
  const cloneCount = () => [...count];
  const cloneInQ = () => [...inQueue];
  const cloneEdges = () => edges.map(e => ({ ...e }));

  // Step 0: 入口
  steps.push({
    n,
    dist: cloneDist(),
    count: cloneCount(),
    inQueue: cloneInQ(),
    activeNode: -1,
    edges: cloneEdges(),
    hasNegativeCycle: false,
    decision: `主函数入口：开始求解规模为 ${n} 个变量的差分约束系统`,
    message: `将约束形如 x_v - x_u <= w 转化为有向边 u -> v (权值 w)，建立超级源点 0 向各点连权值 0 边`,
    log: `enter solveDiffConstraints(n=${n})`,
    codeLine: lines.entry,
    metrics: { '变量个数 N': n, '约束条数 M': edges.length, '源点类型': '超级源点全入队' },
  });

  // Step 1: 超级源点虚拟连边初始化，所有点入队
  const q: number[] = [];
  for (let i = 1; i <= n; i++) {
    q.push(i);
    inQueue[i] = true;
  }

  steps.push({
    n,
    dist: cloneDist(),
    count: cloneCount(),
    inQueue: cloneInQ(),
    activeNode: -1,
    edges: cloneEdges(),
    hasNegativeCycle: false,
    decision: `超级源点初始化：将所有变量 x1 ~ x${n} 初始入队，dist 数组全部赋 0`,
    message: `保证连通性并能检测图中任意连通分量中存在的负权环`,
    log: `initQueue: push all [1..${n}] into queue`,
    codeLine: lines.initQueue,
    metrics: { '队列长度': q.length, '当前处理点': '初始化' },
  });

  // 邻接表
  const adj: { v: number; w: number; edgeIdx: number }[][] = Array.from({ length: n + 1 }, () => []);
  edges.forEach((e, idx) => {
    adj[e.u].push({ v: e.v, w: e.w, edgeIdx: idx });
  });

  let hasNegCycle = false;
  let relaxCountTotal = 0;

  while (q.length > 0) {
    const u = q.shift()!;
    inQueue[u] = false;

    for (const e of adj[u]) {
      // 激活边
      edges.forEach((ed, i) => { ed.active = (i === e.edgeIdx); });

      if (dist[u] + e.w < dist[e.v]) {
        dist[e.v] = dist[u] + e.w;
        relaxCountTotal++;

        steps.push({
          n,
          dist: cloneDist(),
          count: cloneCount(),
          inQueue: cloneInQ(),
          activeNode: e.v,
          edges: cloneEdges(),
          hasNegativeCycle: false,
          decision: `松弛边 x${u} -> x${e.v} (权值 ${e.w})：dist[x${e.v}] 由原先值更新为 ${dist[e.v]}`,
          message: `满足三角形不等式 dist[${e.v}] <= dist[${u}] + (${e.w})`,
          log: `relaxEdge: u=${u} -> v=${e.v}, w=${e.w}, newDist=${dist[e.v]}`,
          codeLine: lines.relaxEdge,
          metrics: { '更新节点': `x${e.v}`, '新距离': dist[e.v], '累计松弛次数': relaxCountTotal },
        });

        if (!inQueue[e.v]) {
          count[e.v]++;
          if (count[e.v] >= n) {
            hasNegCycle = true;
            steps.push({
              n,
              dist: cloneDist(),
              count: cloneCount(),
              inQueue: cloneInQ(),
              activeNode: e.v,
              edges: cloneEdges(),
              hasNegativeCycle: true,
              decision: `🚨 发现负权回路！节点 x${e.v} 入队松弛次数达到 ${count[e.v]} >= N(${n})`,
              message: `根据抽屉原理，最短路包含至少 ${n + 1} 个节点，必定存在负权环，该差分约束系统无解 (NO)`,
              log: `checkCycle: negative cycle detected at node x${e.v}`,
              codeLine: lines.checkCycle,
              statusBadge: { text: '发现负权环 (无可行解)', type: 'danger' },
              metrics: { '矛盾节点': `x${e.v}`, '入队次数': count[e.v], '判定结果': 'NO (无解)' },
            });
            break;
          }

          q.push(e.v);
          inQueue[e.v] = true;
        }
      }
    }

    if (hasNegCycle) break;
  }

  // 清理激活状态
  edges.forEach(e => { e.active = false; });

  // 终态返回
  steps.push({
    n,
    dist: cloneDist(),
    count: cloneCount(),
    inQueue: cloneInQ(),
    activeNode: -1,
    edges: cloneEdges(),
    hasNegativeCycle: hasNegCycle,
    decision: hasNegCycle ? '系统无可行解：存在相互矛盾的差分约束' : `系统求解成功：已找到一组可行解 [${dist.slice(1).map((d, i) => `x${i + 1}=${d}`).join(', ')}]`,
    message: hasNegCycle ? '算法判定返回 false (NO)' : '所有差分约束三角形不等式全部满足，返回 true (YES)',
    log: `returnAns: result=${!hasNegCycle}`,
    codeLine: lines.returnAns,
    statusBadge: hasNegCycle ? { text: '无解 (NO)', type: 'danger' } : { text: '求解成功 (YES)', type: 'success' },
    metrics: { '最终状态': hasNegCycle ? '负环矛盾' : '满足全部约束', '可行解向量': hasNegCycle ? '无' : dist.slice(1).join(', ') },
  });

  return steps;
}
