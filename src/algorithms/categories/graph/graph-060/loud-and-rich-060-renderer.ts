/**
 * 左程云算法通关课 Class 060: 喧闹和富有 (LeetCode 851 · 拓扑排序最值传递)
 * 建立财富流动有向图 (富 ➔ 穷)，沿拓扑序传播并更新祖先中最安静者
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth & Bi-Version Synthesis)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_060_PROBLEMS } from './graph-060-problem-content';
import {
  LOUD_AND_RICH_060_CODES,
  LOUD_AND_RICH_060_LINES,
} from './graph-060-stage-codes';
import {
  Graph060StepBase,
  renderGraph060SvgTopology,
  renderGraph060InDegreeGrid,
  renderGraph060QueuePills,
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

const DEFAULT_NODES: Graph060NodeCoord[] = [
  { id: 0, x: 70, y: 70, label: '0' },
  { id: 1, x: 180, y: 70, label: '1' },
  { id: 2, x: 290, y: 50, label: '2' },
  { id: 3, x: 290, y: 160, label: '3' },
  { id: 4, x: 410, y: 110, label: '4' },
];

const DEFAULT_RICHER = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 1, to: 3 },
  { from: 2, to: 4 },
  { from: 3, to: 4 },
];

const DEFAULT_QUIET = [3, 2, 5, 1, 4];

function renderAnsCards(ans: number[], quiet: number[], curNode: number | null): string {
  const cards = ans.map((best, idx) => {
    const isCur = curNode === idx;
    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 58px; padding: 4px 6px; background: ${isCur ? '#fef3c7' : '#ffffff'}; border: ${isCur ? '2px solid #f59e0b' : '1px solid #cbd5e1'}; border-radius: 6px; box-sizing: border-box;">
        <span style="font-size: 9px; color: #64748b;">人 ${idx}</span>
        <span style="font-size: 11px; font-weight: 800; color: #0f172a;">最静: <strong style="color: #6366f1;">${best}</strong></span>
        <span style="font-size: 8px; color: #10b981;">q: ${quiet[best]}</span>
      </div>
    `;
  }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 4px; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; max-width: 500px; box-sizing: border-box;">
      <span style="font-size: 11px; font-weight: 700; color: #475569;">当前推得最安静富人表 answer[]:</span>
      <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">${cards}</div>
    </div>
  `;
}

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

export const loudAndRich060Visualizer = registerDeclarativeAlgorithm<LoudAndRichStep>({
  id: 'loud-and-rich-060',
  aliases: ['loud-and-rich', 'leetcode-851', 'class060-code02'],
  name: '喧闹和富有 (LeetCode 851 · 拓扑最值传播) (Class 060)',
  category: 'graph',
  icon: '🤫',
  difficulty: 2,
  levelOrder: 6002,
  learningGoal: '掌握有向图偏序关系建模、拓扑排序最值动态传播与安静值贪心更新机制',
  problemHtml: GRAPH_060_PROBLEMS.loudAndRich060.html,
  codeLanguages: LOUD_AND_RICH_060_CODES,
  inputs: [
    {
      id: 'preset',
      label: '人员财富网络选择',
      type: 'select',
      defaultValue: 'classic_5people',
      options: [
        { label: '5 人经典富裕图 (多前驱财富汇流)', value: 'classic_5people' },
        { label: '4 人单向链式富裕图 (线性单调递推)', value: 'linear_chain' },
      ],
    },
  ],
  presets: [
    { label: '5 人财富图', values: { preset: 'classic_5people' } },
    { label: '4 人链式图', values: { preset: 'linear_chain' } },
  ],
  generateSteps: (inputs) => buildLoudAndRich060Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 10px;">
        <div style="display: flex; gap: 16px; align-items: center; font-size: 11px; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 14px; border-radius: 6px;">
          <span>当前考察人员: <strong style="color: #f59e0b;">${step.curNode !== null ? `人 ${step.curNode}` : '无'}</strong></span>
          <span>待拓展队列: <strong>${step.queue.length}</strong></span>
        </div>
        ${renderGraph060SvgTopology(step.nodes, step.edges, {
          currentNode: step.curNode,
          inQueueNodes: step.queue,
          processedNodes: step.processed,
          activeEdge: step.activeEdge,
          nodeValues: step.quiet,
          valueLabel: '静',
        })}
        <div style="display: flex; gap: 10px; width: 100%; max-width: 500px; flex-direction: column;">
          ${renderAnsCards(step.ans, step.quiet, step.curNode)}
          ${renderGraph060InDegreeGrid(step.inDegree, step.curNode, undefined, '富裕依赖入度表 inDegree')}
          ${renderGraph060QueuePills(step.queue, '入度为 0 待处理队列')}
        </div>
      </div>
    `;
  },
});
