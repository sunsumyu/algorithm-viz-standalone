/**
 * 左程云算法通关课 Class 060: 有向图中的最长颜色路径 (LeetCode 1857 · 26 维拓扑动态规划)
 * 拓扑排序出队计数拦截有向环，26 种字符颜色频次沿拓扑序松弛取 max，求全局最大颜色值
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth & Bi-Version Synthesis)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_060_PROBLEMS } from './graph-060-problem-content';
import {
  LARGEST_COLOR_VALUE_060_CODES,
  LARGEST_COLOR_VALUE_060_LINES,
} from './graph-060-stage-codes';
import {
  Graph060StepBase,
  renderGraph060SvgTopology,
  renderGraph060InDegreeGrid,
  renderGraph060QueuePills,
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

const DEFAULT_NODES: Graph060NodeCoord[] = [
  { id: 0, x: 70, y: 110, label: '0:a' },
  { id: 1, x: 190, y: 50, label: '1:b' },
  { id: 2, x: 190, y: 170, label: '2:a' },
  { id: 3, x: 320, y: 170, label: '3:c' },
  { id: 4, x: 440, y: 110, label: '4:a' },
];

const DEFAULT_EDGES = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 4 },
  { from: 1, to: 4 },
];

const DEFAULT_COLORS = 'abaca';

function renderColorFrequencyGrid(
  dp: number[][],
  colors: string,
  curNode: number | null
): string {
  const cards = colors.split('').map((ch, idx) => {
    const isCur = curNode === idx;
    // 找出该节点频次前 3 的颜色
    const freqs: Array<{ char: string; cnt: number }> = [];
    for (let c = 0; c < 26; c++) {
      if (dp[idx][c] > 0) {
        freqs.push({ char: String.fromCharCode(97 + c), cnt: dp[idx][c] });
      }
    }
    freqs.sort((a, b) => b.cnt - a.cnt);

    const freqStr = freqs.length > 0
      ? freqs.slice(0, 3).map((f) => `<span style="color: ${f.char === ch ? '#6366f1' : '#475569'}; font-weight: 700;">${f.char}:${f.cnt}</span>`).join(' ')
      : '<span style="color: #94a3b8;">暂无</span>';

    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 68px; padding: 4px 6px; background: ${isCur ? '#fef3c7' : '#ffffff'}; border: ${isCur ? '2px solid #f59e0b' : '1px solid #cbd5e1'}; border-radius: 6px; box-sizing: border-box;">
        <span style="font-size: 10px; color: #64748b;">Node ${idx} (${ch})</span>
        <div style="font-size: 11px; font-family: monospace; display: flex; gap: 4px;">${freqStr}</div>
      </div>
    `;
  }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 4px; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; max-width: 500px; box-sizing: border-box;">
      <span style="font-size: 11px; font-weight: 700; color: #475569;">到达各节点的颜色最大频次 dp[u][char]:</span>
      <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">${cards}</div>
    </div>
  `;
}

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

export const largestColorValue060Visualizer = registerDeclarativeAlgorithm<LargestColorStep>({
  id: 'largest-color-value-060',
  aliases: ['largest-color-value', 'largest-path-value', 'leetcode-1857', 'class060-code06'],
  name: '有向图最大颜色值 (LeetCode 1857 · 26维拓扑动规) (Class 060)',
  category: 'graph',
  icon: '🎨',
  difficulty: 3,
  levelOrder: 6006,
  learningGoal: '掌握拓扑排序出队计数判环机制、26 维颜色频次状态转移方程以及全局最值维护',
  problemHtml: GRAPH_060_PROBLEMS.largestColorValue060.html,
  codeLanguages: LARGEST_COLOR_VALUE_060_CODES,
  inputs: [
    {
      id: 'preset',
      label: '图结构用例选择',
      type: 'select',
      defaultValue: 'dag_colors',
      options: [
        { label: '5 节点标准 DAG (colors="abaca", 最大颜色 a=3)', value: 'dag_colors' },
        { label: '4 节点含有向环图 (colors="abab", 拓扑中断触发环警报)', value: 'cycle_colors' },
      ],
    },
  ],
  presets: [
    { label: '标准颜色 DAG', values: { preset: 'dag_colors' } },
    { label: '含有向环测试', values: { preset: 'cycle_colors' } },
  ],
  generateSteps: (inputs) => buildLargestColorValue060Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    // 构造当前 dp
    const n = step.colors.length;
    const dp = Array.from({ length: n }, () => new Array(26).fill(0));
    // 简略渲染
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 10px;">
        <div style="display: flex; gap: 16px; align-items: center; font-size: 11px; color: #475569; background: ${step.hasCycle ? '#fee2e2' : '#f8fafc'}; border: 1px solid ${step.hasCycle ? '#f87171' : '#e2e8f0'}; padding: 6px 14px; border-radius: 6px;">
          <span>当前最大颜色值: <strong style="color: ${step.hasCycle ? '#dc2626' : '#6366f1'}; font-size: 13px;">${step.ans}</strong></span>
          <span>拓扑出队计数: <strong>${step.visitedCount} / ${step.colors.length}</strong></span>
          <span>环路状态: <strong style="color: ${step.hasCycle ? '#dc2626' : '#10b981'};">${step.hasCycle ? '🚨 存在有向环 (-1)' : '无环 DAG'}</strong></span>
        </div>
        ${renderGraph060SvgTopology(step.nodes, step.edges, {
          currentNode: step.curNode,
          inQueueNodes: step.queue,
          activeEdge: step.activeEdge,
        })}
        <div style="display: flex; gap: 10px; width: 100%; max-width: 500px; flex-direction: column;">
          ${renderColorFrequencyGrid(dp, step.colors, step.curNode)}
          ${renderGraph060InDegreeGrid(step.inDegree, step.curNode, undefined, '节点入度表 inDegree (出队总数小于 n 即为有环)')}
          ${renderGraph060QueuePills(step.queue, '拓扑就绪队列')}
        </div>
      </div>
    `;
  },
});
