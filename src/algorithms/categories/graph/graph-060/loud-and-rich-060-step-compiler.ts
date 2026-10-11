/**
 * Class 060: Code02 喧闹和富有 Step Compiler
 */

import { LOUD_AND_RICH_060_LINES } from './graph-060-stage-codes';
import {
  Graph060StepBase,
  Graph060NodeCoord,
} from './graph-060-shared';

export interface LoudAndRichStep extends Graph060StepBase {
  nodes: Graph060NodeCoord[];
  edges: Array<{ from: number; to: number }>;
  inDegree: number[];
  ans: number[];
  quiet: number[];
  queue: number[];
  curNode: number | null;
  activeEdge?: { from: number; to: number } | null;
  processed: boolean[];
}

export const DEFAULT_NODES: Graph060NodeCoord[] = [
  { id: 0, x: 70, y: 70, label: '0' },
  { id: 1, x: 180, y: 70, label: '1' },
  { id: 2, x: 290, y: 50, label: '2' },
  { id: 3, x: 290, y: 160, label: '3' },
  { id: 4, x: 410, y: 110, label: '4' },
];

export const DEFAULT_RICHER = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 1, to: 3 },
  { from: 2, to: 4 },
  { from: 3, to: 4 },
];

export const DEFAULT_QUIET = [3, 2, 5, 1, 4];

export function buildLoudAndRich060Steps(preset: string = 'classic_5people'): LoudAndRichStep[] {
  const steps: LoudAndRichStep[] = [];
  const linesCode = LOUD_AND_RICH_060_LINES;

  let nodes = DEFAULT_NODES;
  let edges = DEFAULT_RICHER;
  let quiet = DEFAULT_QUIET;

  if (preset === 'linear_chain') {
    nodes = [
      { id: 0, x: 80, y: 110, label: '0' },
      { id: 1, x: 200, y: 110, label: '1' },
      { id: 2, x: 320, y: 110, label: '2' },
      { id: 3, x: 440, y: 110, label: '3' },
    ];
    edges = [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
    ];
    quiet = [4, 1, 6, 2];
  }

  const n = nodes.length;
  const inDegree = new Array(n).fill(0);
  const ans = Array.from({ length: n }, (_, i) => i);
  const processed = new Array(n).fill(false);
  const adj: Array<Array<number>> = Array.from({ length: n }, () => []);

  for (const e of edges) {
    adj[e.from].push(e.to);
    inDegree[e.to]++;
  }

  // 1. 初始化
  steps.push({
    nodes,
    edges,
    inDegree: [...inDegree],
    ans: [...ans],
    quiet: [...quiet],
    queue: [],
    curNode: null,
    activeEdge: null,
    processed: [...processed],
    decision: `1. 初始化图与答案数组：初始每个人已知最富有且安静的人是他自己 answer[i] = i`,
    message: `建图规则：若 u 比 v 富有，则连接有向边 u ➔ v。入度为 0 表示没有已知更富有的人。`,
    log: `Init loudAndRich: n=${n}, richer edges=${edges.length}`,
    codeLine: linesCode.init,
    metrics: { '人数': n, '关系边数': edges.length },
    statusBadge: { text: '初始化', type: 'info' },
  });

  // 2. 寻找入度为 0
  const queue: number[] = [];
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  steps.push({
    nodes,
    edges,
    inDegree: [...inDegree],
    ans: [...ans],
    quiet: [...quiet],
    queue: [...queue],
    curNode: null,
    activeEdge: null,
    processed: [...processed],
    decision: `最富有顶层入队：入度为 0 的人员 [${queue.join(', ')}] 加入拓扑就绪队列`,
    message: `这些人财富顶级，没有比他们更富裕的人，他们的最安静者直接锁定为自身。`,
    log: `Push zero-in-degree nodes: [${queue.join(', ')}]`,
    codeLine: linesCode.findZeroIn,
    metrics: { '就绪人员': queue.length, '拓扑起点': queue.join(', ') },
    statusBadge: { text: '顶层人员就绪', type: 'info' },
  });

  // 3. 拓扑排序传播
  while (queue.length > 0) {
    const u = queue.shift()!;
    processed[u] = true;

    steps.push({
      nodes,
      edges,
      inDegree: [...inDegree],
      ans: [...ans],
      quiet: [...quiet],
      queue: [...queue],
      curNode: u,
      activeEdge: null,
      processed: [...processed],
      decision: `Node ${u} 出队 (安静值 = ${quiet[ans[u]]})，向下游较贫穷人员传播最安静富豪信息`,
      message: `在比 ${u} 拥有不小于其财富的人中，最安静者为 Node ${ans[u]}。`,
      log: `Poll Node ${u}, bestAns=${ans[u]} (quiet=${quiet[ans[u]]})`,
      codeLine: linesCode.pollNode,
      metrics: { '当前考察': `人 ${u}`, '当前最静': `人 ${ans[u]}`, '安静值': quiet[ans[u]] },
      statusBadge: { text: `考察: 人 ${u}`, type: 'info' },
    });

    for (const v of adj[u]) {
      const oldAns = ans[v];
      let updated = false;
      if (quiet[ans[u]] < quiet[ans[v]]) {
        ans[v] = ans[u];
        updated = true;
      }
      inDegree[v]--;
      const pushed = inDegree[v] === 0;
      if (pushed) queue.push(v);

      steps.push({
        nodes,
        edges,
        inDegree: [...inDegree],
        ans: [...ans],
        quiet: [...quiet],
        queue: [...queue],
        curNode: u,
        activeEdge: { from: u, to: v },
        processed: [...processed],
        decision: `沿财富边 (${u} ➔ ${v}) 松弛：${updated ? `人 ${v} 发现更安静更富裕者由人 ${oldAns}(q:${quiet[oldAns]}) 更新为人 ${ans[v]}(q:${quiet[ans[v]]})` : `人 ${v} 当前已知最静者人 ${oldAns} 更优，保持不变`}${pushed ? `，且人 ${v} 所有上游富豪已扫描完，入队！` : ''}`,
        message: `比较：quiet[ans[${u}]] (${quiet[ans[u]]}) vs quiet[ans[${v}]] (${quiet[oldAns]})。`,
        log: `Propagate (${u}->${v}): updated=${updated}, ans[${v}]=${ans[v]}`,
        codeLine: pushed ? linesCode.pushQueue : linesCode.updateQuiet,
        metrics: { '松弛边': `${u} ➔ ${v}`, '最新候选': `人 ${ans[v]}`, '更新状态': updated ? '更优' : '保持' },
        statusBadge: { text: updated ? `更新人 ${v}` : `无更优`, type: updated ? 'warning' : 'info' },
      });
    }
  }

  // 4. 终态
  steps.push({
    nodes,
    edges,
    inDegree: [...inDegree],
    ans: [...ans],
    quiet: [...quiet],
    queue: [],
    curNode: null,
    activeEdge: null,
    processed: [...processed],
    decision: `喧闹和富有计算完成：成功求得全员对应的最安静富人 answer 向量`,
    message: `最终结果：[${ans.join(', ')}]，完美兼顾了富裕传递性与拓扑依赖。`,
    log: `LoudAndRich finished: ans=[${ans.join(', ')}]`,
    codeLine: linesCode.returnAns,
    metrics: { '结果向量': `[${ans.join(', ')}]`, '总人数': n, '算法状态': '已收敛' },
    statusBadge: { text: '计算完成', type: 'success' },
  });

  return steps;
}
