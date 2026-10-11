/**
 * Class 060: Code06 有向图最大颜色值 Step Compiler
 */

import { LARGEST_COLOR_VALUE_060_LINES } from './graph-060-stage-codes';
import {
  Graph060StepBase,
  Graph060NodeCoord,
} from './graph-060-shared';

export interface LargestColorStep extends Graph060StepBase {
  nodes: Graph060NodeCoord[];
  edges: Array<{ from: number; to: number }>;
  colors: string;
  inDegree: number[];
  dpSnapshot: Array<{ node: number; char: string; count: number }>;
  queue: number[];
  curNode: number | null;
  activeEdge?: { from: number; to: number } | null;
  visitedCount: number;
  ans: number;
  hasCycle: boolean;
}

export const DEFAULT_NODES: Graph060NodeCoord[] = [
  { id: 0, x: 70, y: 110, label: '0:a' },
  { id: 1, x: 190, y: 50, label: '1:b' },
  { id: 2, x: 190, y: 170, label: '2:a' },
  { id: 3, x: 320, y: 170, label: '3:c' },
  { id: 4, x: 440, y: 110, label: '4:a' },
];

export const DEFAULT_EDGES = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 4 },
  { from: 1, to: 4 },
];

export const DEFAULT_COLORS = 'abaca';

export function buildLargestColorValue060Steps(preset: string = 'dag_colors'): LargestColorStep[] {
  const steps: LargestColorStep[] = [];
  const linesCode = LARGEST_COLOR_VALUE_060_LINES;

  let nodes = DEFAULT_NODES;
  let edges = DEFAULT_EDGES;
  let colors = DEFAULT_COLORS;

  if (preset === 'cycle_colors') {
    nodes = [
      { id: 0, x: 120, y: 110, label: '0:a' },
      { id: 1, x: 260, y: 60, label: '1:b' },
      { id: 2, x: 400, y: 110, label: '2:a' },
      { id: 3, x: 260, y: 160, label: '3:b' },
    ];
    edges = [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 1 }, // 1 ➔ 2 ➔ 3 ➔ 1 环路
    ];
    colors = 'abab';
  }

  const n = colors.length;
  const inDegree = new Array(n).fill(0);
  const adj: Array<Array<number>> = Array.from({ length: n }, () => []);

  for (const e of edges) {
    adj[e.from].push(e.to);
    inDegree[e.to]++;
  }

  const dp = Array.from({ length: n }, () => new Array(26).fill(0));

  // 1. 初始化
  steps.push({
    nodes,
    edges,
    colors,
    inDegree: [...inDegree],
    dpSnapshot: [],
    queue: [],
    curNode: null,
    activeEdge: null,
    visitedCount: 0,
    ans: 0,
    hasCycle: false,
    decision: `1. 初始化有向图与 26 维颜色频次表：统计入度`,
    message: `dp[u][c] 表示以节点 u 为终点的所有路径中，颜色字符 c 的最大频次。`,
    log: `Init largestColorValue: colors="${colors}", n=${n}`,
    codeLine: linesCode.init,
    metrics: { '节点数': n, '边数': edges.length, '颜色数': 26 },
    statusBadge: { text: '建图完成', type: 'info' },
  });

  // 2. 初始零入度节点入队
  const queue: number[] = [];
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  steps.push({
    nodes,
    edges,
    colors,
    inDegree: [...inDegree],
    dpSnapshot: [],
    queue: [...queue],
    curNode: null,
    activeEdge: null,
    visitedCount: 0,
    ans: 0,
    hasCycle: false,
    decision: `初始起点入队：入度为 0 的节点 [${queue.join(', ')}] 加入拓扑就绪队列`,
    message: queue.length === 0 ? `🚨 警报：没有入度为 0 的节点，图必定存在环！` : `准备展开拓扑序 26 维动态规划传播。`,
    log: `Queue zero-in-degree nodes: [${queue.join(', ')}]`,
    codeLine: linesCode.findZeroIn,
    metrics: { '就绪起点数': queue.length, '起点列表': queue.join(', ') },
    statusBadge: { text: '起点就绪', type: 'info' },
  });

  let visitedCount = 0;
  let ans = 0;

  // 3. 拓扑排序传播
  while (queue.length > 0) {
    const u = queue.shift()!;
    visitedCount++;
    const c = colors.charCodeAt(u) - 97;
    dp[u][c]++;
    ans = Math.max(ans, dp[u][c]);

    steps.push({
      nodes,
      edges,
      colors,
      inDegree: [...inDegree],
      dpSnapshot: [],
      queue: [...queue],
      curNode: u,
      activeEdge: null,
      visitedCount,
      ans,
      hasCycle: false,
      decision: `Node ${u} 出队 (自身颜色 '${colors[u]}')：自身颜色频次累加，当前全局最大颜色值 = ${ans}`,
      message: `dp[${u}]['${colors[u]}'] 递增为 ${dp[u][c]}。`,
      log: `Poll Node ${u}: color=${colors[u]}, dp=${dp[u][c]}, globalAns=${ans}`,
      codeLine: linesCode.pollNode,
      metrics: { '出队节点': `Node ${u}`, '颜色': colors[u], '该色频次': dp[u][c], '全局最大值': ans },
      statusBadge: { text: `出队: Node ${u}`, type: 'info' },
    });

    for (const v of adj[u]) {
      for (let k = 0; k < 26; k++) {
        if (dp[u][k] > dp[v][k]) {
          dp[v][k] = dp[u][k];
        }
      }
      inDegree[v]--;
      const pushed = inDegree[v] === 0;
      if (pushed) queue.push(v);

      steps.push({
        nodes,
        edges,
        colors,
        inDegree: [...inDegree],
        dpSnapshot: [],
        queue: [...queue],
        curNode: u,
        activeEdge: { from: u, to: v },
        visitedCount,
        ans,
        hasCycle: false,
        decision: `沿边 (${u} ➔ ${v}) 传递 26 种颜色历史最大频次${pushed ? `，且 Node ${v} 入度归零进入队列！` : ''}`,
        message: `状态转移：dp[${v}][c] = max(dp[${v}][c], dp[${u}][c])。`,
        log: `Relax (${u}->${v}): inDeg[${v}]=${inDegree[v]}`,
        codeLine: pushed ? linesCode.pushQueue : linesCode.relax26Colors,
        metrics: { '传播边': `${u} ➔ ${v}`, '剩余依赖': inDegree[v] },
        statusBadge: { text: `传播: ${u}➔${v}`, type: 'warning' },
      });
    }
  }

  // 4. 终态判定
  const hasCycle = visitedCount < n;
  const finalAns = hasCycle ? -1 : ans;

  steps.push({
    nodes,
    edges,
    colors,
    inDegree: [...inDegree],
    dpSnapshot: [],
    queue: [],
    curNode: null,
    activeEdge: null,
    visitedCount,
    ans: finalAns,
    hasCycle,
    decision: hasCycle
      ? `🚨 环路警报：拓扑出队节点数 visitedCount (${visitedCount}) < 总节点数 (${n})，图中存在有向环，返回 -1`
      : `计算完毕：拓扑序无环完整覆盖全部 ${n} 个节点，全局最长路径颜色值 = ${finalAns}`,
    message: hasCycle
      ? `在有向环中颜色频次可无限循环累加，根据题意必须判定非法并返回 -1！`
      : `成功求得 DAG 中任意单一颜色在某条路径上的最大出现次数。`,
    log: `LargestColorValue finished: hasCycle=${hasCycle}, ans=${finalAns}`,
    codeLine: linesCode.returnResult,
    metrics: { '最终结果': finalAns, '访问节点': `${visitedCount} / ${n}`, '图类型': hasCycle ? '含环 (非法)' : '标准 DAG' },
    statusBadge: { text: hasCycle ? '🚨 存在有向环' : '计算完成', type: hasCycle ? 'danger' : 'success' },
  });

  return steps;
}
