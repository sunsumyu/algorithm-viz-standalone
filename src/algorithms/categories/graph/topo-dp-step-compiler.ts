/**
 * 拓扑排序与 DAG 动态规划步进编译器 (TopoDPStepCompiler)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：DAG 无后效性拓扑遍历、dp[v] = max(dp[v], dp[u] + w) 递推与关键路径 CPM 求解
 */

import { StepBase } from '../../../core/step-visualizer';
import { HighlightTarget } from '../../../core/code-panel';

export interface TopoDPStep extends StepBase {
  curNode: number;
  dpDist: Record<number, number>;
  inDegrees: Record<number, number>;
  topoQueue: number[];
  activeEdge?: { u: number; v: number; w: number };
  criticalPath?: number[];
  dpArray: number[];
  inDegreeArray: number[];
  activeArray?: 'dp' | 'inDegree' | 'queue';
  activeSlot?: number;
  status: 'init' | 'pop' | 'relax' | 'push' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export const TOPO_DP_EDGES_5 = [
  { u: 1, v: 2, w: 3 },
  { u: 1, v: 3, w: 2 },
  { u: 2, v: 4, w: 4 },
  { u: 3, v: 4, w: 1 },
  { u: 4, v: 5, w: 2 },
];

export const TOPO_DP_EDGES_4 = [
  { u: 1, v: 2, w: 3 },
  { u: 1, v: 3, w: 2 },
  { u: 2, v: 4, w: 4 },
  { u: 3, v: 4, w: 3 },
];

export const TOPO_DP_COORDS_5: Record<number, { x: number; y: number }> = {
  1: { x: 45, y: 85 },
  2: { x: 115, y: 45 },
  3: { x: 115, y: 125 },
  4: { x: 195, y: 85 },
  5: { x: 265, y: 85 },
};

export const TOPO_DP_COORDS_4: Record<number, { x: number; y: number }> = {
  1: { x: 55, y: 85 },
  2: { x: 135, y: 45 },
  3: { x: 135, y: 125 },
  4: { x: 245, y: 85 },
};

export function buildTopoDPSteps(preset: string = 'classic_5node'): TopoDPStep[] {
  const steps: TopoDPStep[] = [];
  const is5Node = preset === 'classic_5node';
  const n = is5Node ? 5 : 4;

  const edges = is5Node ? TOPO_DP_EDGES_5 : TOPO_DP_EDGES_4;

  const inDegree: number[] = new Array(n + 1).fill(0);
  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n + 1 }, () => []);
  for (const e of edges) {
    adj[e.u].push({ to: e.v, w: e.w });
    inDegree[e.v]++;
  }

  const dp: number[] = new Array(n + 1).fill(0);
  const pre: number[] = new Array(n + 1).fill(0);
  const queue: number[] = [];
  let curNode = 1;
  let activeEdge: { u: number; v: number; w: number } | undefined = undefined;

  // 精准 18 处四语言映射行号字典 (cpp / java / python / javascript)
  const lines = {
    entry: { cpp: 9, java: 7, python: 11, javascript: 11 },
    initGraph: { cpp: 10, java: 8, python: 12, javascript: 12 },
    initInDeg: { cpp: 11, java: 11, python: 13, javascript: 13 },
    loopRelations: { cpp: 14, java: 12, python: 15, javascript: 14 },
    incInDeg: { cpp: 16, java: 14, python: 17, javascript: 16 },
    initCostQueue: { cpp: 19, java: 17, python: 19, javascript: 19 },
    loopFindZero: { cpp: 20, java: 21, python: 21, javascript: 21 },
    checkZeroDeg: { cpp: 21, java: 22, python: 22, javascript: 22 },
    initCostZero: { cpp: 22, java: 23, python: 23, javascript: 23 },
    pushZeroQueue: { cpp: 23, java: 24, python: 24, javascript: 24 },
    whileQueue: { cpp: 28, java: 29, python: 27, javascript: 29 },
    popNode: { cpp: 29, java: 30, python: 28, javascript: 30 },
    updateAns: { cpp: 31, java: 31, python: 29, javascript: 31 },
    loopNeighbors: { cpp: 33, java: 33, python: 31, javascript: 33 },
    relaxCost: { cpp: 34, java: 34, python: 32, javascript: 34 },
    decInDeg: { cpp: 35, java: 35, python: 33, javascript: 35 },
    pushNextQueue: { cpp: 36, java: 36, python: 35, javascript: 37 },
    returnAns: { cpp: 40, java: 40, python: 37, javascript: 41 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'init' | 'pop' | 'relax' | 'push' | 'done',
    activeArray?: 'dp' | 'inDegree' | 'queue',
    activeSlot?: number
  ): void {
    const dpRec: Record<number, number> = {};
    const inDegRec: Record<number, number> = {};
    for (let i = 1; i <= n; i++) {
      dpRec[i] = dp[i];
      inDegRec[i] = inDegree[i];
    }

    let criticalPath: number[] | undefined = undefined;
    if (status === 'done') {
      let maxNode = 1;
      for (let i = 2; i <= n; i++) {
        if (dp[i] > dp[maxNode]) maxNode = i;
      }
      criticalPath = [];
      let curr = maxNode;
      while (curr !== 0) {
        criticalPath.unshift(curr);
        curr = pre[curr];
      }
    }

    const curMax = Math.max(...Object.values(dpRec));
    steps.push({
      curNode,
      dpDist: dpRec,
      inDegrees: inDegRec,
      topoQueue: [...queue],
      activeEdge: activeEdge ? { ...activeEdge } : undefined,
      criticalPath,
      dpArray: [...dp],
      inDegreeArray: [...inDegree],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-topodp-cur': status === 'done' ? '算法结束' : `Node ${curNode}`,
        'metric-topodp-max': `${curMax}`,
        'metric-topo-queue': queue.length > 0 ? `[${queue.join(', ')}]` : '[]',
        'metric-topodp-phase':
          status === 'init'
            ? '初始化与入度统计'
            : status === 'pop'
            ? '出队推进拓扑序'
            : status === 'relax'
            ? '松弛转移 DP 状态'
            : status === 'push'
            ? '新零入度点入队'
            : 'DAG 最长路收官',
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, '🚀 [算法启动] topologicalDP(n, edges)：初始化 DAG 动态规划引擎。', '拓扑DP启动', 'init');
  makeStep(lines.initGraph, '📦 [构建邻接表] vector<vector<Edge>> adj(n + 1)：构建有向加权图结构。', '构建邻接表', 'init');
  makeStep(lines.initInDeg, '📊 [初始化入度表] vector<int> inDegree(n + 1, 0)：初始化入度计数器。', '初始化入度数组', 'init');

  // 建图累加入度
  for (const e of edges) {
    makeStep(lines.loopRelations, `🔍 [扫描先决依赖] 考察有向工程边 ${e.u} ➔ ${e.v} (耗时权重 ${e.w})。`, `遍历边 ${e.u}->${e.v}`, 'init');
    makeStep(lines.incInDeg, `📈 [入度累加] inDegree[${e.v}]++ -> 当前节点 ${e.v} 入度为 ${inDegree[e.v]}。`, `inDegree[${e.v}]=${inDegree[e.v]}`, 'init', 'inDegree', e.v);
  }

  // 队列与零入度扫描
  makeStep(lines.initCostQueue, '📦 [初始化状态与队列] dp 数组清零，建立拓扑就绪队列 queue。', '初始化队列与dp', 'init');
  for (let i = 1; i <= n; i++) {
    makeStep(lines.loopFindZero, `🔎 [检查入度] 考察节点 ${i} 的前置依赖数：inDegree[${i}] = ${inDegree[i]}。`, `检查节点 ${i} 入度`, 'init', 'inDegree', i);
    if (inDegree[i] === 0) {
      makeStep(lines.checkZeroDeg, `🌱 [发现源头节点] inDegree[${i}] == 0，节点 ${i} 无前置约束！`, `节点 ${i} 入度为0`, 'init', 'inDegree', i);
      dp[i] = 0;
      makeStep(lines.initCostZero, `⚡ [初始化基准代价] dp[${i}] = 0：源节点初始最长路径设为 0。`, `dp[${i}]=0`, 'init', 'dp', i);
      queue.push(i);
      makeStep(lines.pushZeroQueue, `📥 [源节点入队] queue.push(${i})：将节点 ${i} 加入拓扑就绪队列。`, `入队 ${i}`, 'push', 'queue', queue.length - 1);
    }
  }

  let totalMax = 0;

  // 2. 拓扑排序与 DP 松弛递推循环
  while (queue.length > 0) {
    makeStep(lines.whileQueue, `🔁 [拓扑推进循环] 当前队列就绪元素: [${queue.join(', ')}]。`, 'while(!queue.empty())', 'init');
    curNode = queue.shift()!;
    makeStep(lines.popNode, `📤 [出队推进] int u = queue.poll() -> 弹出当前拓扑先序节点 ${curNode}。`, `弹出节点 ${curNode}`, 'pop');

    totalMax = Math.max(totalMax, dp[curNode]);
    makeStep(lines.updateAns, `🏆 [刷新全局最大耗时] totalMax = max(${totalMax}, dp[${curNode}] = ${dp[curNode]}) -> ${totalMax}。`, `totalMax=${totalMax}`, 'pop');

    for (const edge of adj[curNode]) {
      const v = edge.to;
      const w = edge.w;
      activeEdge = { u: curNode, v, w };

      makeStep(lines.loopNeighbors, `  ↳ [遍历出边] 考察后继节点 ${v} (转移耗时 +${w})。`, `扫描边 ${curNode}->${v}`, 'relax');

      const oldDp = dp[v];
      if (dp[curNode] + w > dp[v]) {
        dp[v] = dp[curNode] + w;
        pre[v] = curNode;
        makeStep(
          lines.relaxCost,
          `  ⚡ [动态规划转移] 发现更长路径！dp[${v}] = max(${oldDp}, dp[${curNode}]+${w}) = ${dp[v]}！前驱更新为 ${curNode}。`,
          `dp[${v}]=${dp[v]}`,
          'relax',
          'dp',
          v
        );
      } else {
        makeStep(
          lines.relaxCost,
          `  ⏭️ [保留既有路径] dp[${curNode}]+${w}=${dp[curNode] + w} <= dp[${v}]=${dp[v]}，无需更新。`,
          `dp[${v}]维持${dp[v]}`,
          'relax',
          'dp',
          v
        );
      }

      inDegree[v]--;
      makeStep(
        lines.decInDeg,
        `  📉 [前置依赖削减] 节点 ${curNode} 完成推演，--inDegree[${v}] 降为 ${inDegree[v]}。`,
        `inDegree[${v}]=${inDegree[v]}`,
        'relax',
        'inDegree',
        v
      );

      if (inDegree[v] === 0) {
        queue.push(v);
        makeStep(
          lines.pushNextQueue,
          `  🎉 [后继入度清零] 节点 ${v} 的所有前驱均已推演完毕！queue.push(${v}) 入队！`,
          `queue.push(${v})`,
          'push',
          'queue',
          queue.length - 1
        );
      }
    }
    activeEdge = undefined;
  }

  makeStep(
    lines.returnAns,
    `🎉 [DAG 最长路确立] return totalMax = ${totalMax}！关键路径长度为 ${totalMax}，全图无后效性拓扑推进圆满完成！`,
    `return ${totalMax}`,
    'done'
  );

  return steps;
}
