/**
 * 左程云算法通关课 Class 060: 参加会议的最多员工数 (LeetCode 2127 · 内向基环树拓扑分解)
 * 拓扑排序剥离树枝统计外链深度 maxDepth，分类汇总：大小 >= 3 的独立大环 vs 大小 = 2 的互偶对挂链累加
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth & Bi-Version Synthesis)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_060_PROBLEMS } from './graph-060-problem-content';
import {
  MAX_EMPLOYEES_060_CODES,
  MAX_EMPLOYEES_060_LINES,
} from './graph-060-stage-codes';
import {
  Graph060StepBase,
  renderGraph060SvgTopology,
  renderGraph060InDegreeGrid,
  Graph060NodeCoord,
} from './graph-060-shared';

export interface MaxEmployeesStep extends Graph060StepBase {
  nodes: Graph060NodeCoord[];
  edges: Array<{ from: number; to: number }>;
  favorite: number[];
  inDegree: number[];
  maxDepth: number[];
  queue: number[];
  curNode: number | null;
  activeEdge?: { from: number; to: number } | null;
  phase: 'peeling' | 'rings' | 'done';
  maxRing: number;
  sumTwoRing: number;
  finalAns: number;
}

const DEFAULT_NODES: Graph060NodeCoord[] = [
  { id: 0, x: 70, y: 50, label: '0' },
  { id: 1, x: 190, y: 50, label: '1' },
  { id: 2, x: 190, y: 170, label: '2' },
  { id: 3, x: 70, y: 170, label: '3' },
  { id: 4, x: 330, y: 80, label: '4' },
  { id: 5, x: 440, y: 80, label: '5' },
];

const DEFAULT_FAVORITE = [1, 2, 1, 2, 5, 4];

export function buildMaxEmployees060Steps(preset: string = 'mixed_rings'): MaxEmployeesStep[] {
  const steps: MaxEmployeesStep[] = [];
  const linesCode = MAX_EMPLOYEES_060_LINES;

  let nodes = DEFAULT_NODES;
  let favorite = DEFAULT_FAVORITE;

  if (preset === 'big_ring_3') {
    nodes = [
      { id: 0, x: 150, y: 50, label: '0' },
      { id: 1, x: 320, y: 50, label: '1' },
      { id: 2, x: 235, y: 170, label: '2' },
      { id: 3, x: 70, y: 170, label: '3' },
    ];
    favorite = [1, 2, 0, 0]; // 0->1->2->0 (大环大小 3), 3->0 (挂树枝)
  }

  const n = nodes.length;
  const inDegree = new Array(n).fill(0);
  const maxDepth = new Array(n).fill(0);
  const edges: Array<{ from: number; to: number }> = [];

  for (let i = 0; i < n; i++) {
    const v = favorite[i];
    edges.push({ from: i, to: v });
    inDegree[v]++;
  }

  // 1. 初始化
  steps.push({
    nodes,
    edges,
    favorite,
    inDegree: [...inDegree],
    maxDepth: [...maxDepth],
    queue: [],
    curNode: null,
    activeEdge: null,
    phase: 'peeling',
    maxRing: 0,
    sumTwoRing: 0,
    finalAns: 0,
    decision: `1. 初始化内向基环树网络：统计每个员工的受喜欢入度（每个节点出度恒为 1）`,
    message: `整个图必定由若干颗不相交的“内向基环树”构成（每棵树包含唯一的环，环上各节点可外挂树枝）。`,
    log: `Init maxEmployees: n=${n}`,
    codeLine: linesCode.init,
    metrics: { '员工总数': n, '当前阶段': '拓扑剥离树枝' },
    statusBadge: { text: '建图完成', type: 'info' },
  });

  // 2. 拓扑排序剥离树枝
  const queue: number[] = [];
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  steps.push({
    nodes,
    edges,
    favorite,
    inDegree: [...inDegree],
    maxDepth: [...maxDepth],
    queue: [...queue],
    curNode: null,
    activeEdge: null,
    phase: 'peeling',
    maxRing: 0,
    sumTwoRing: 0,
    finalAns: 0,
    decision: `外围树枝叶子入队：入度为 0 的员工 [${queue.join(', ')}] 无人喜欢，必属于外围树枝`,
    message: `这些员工无法独立成环，只能作为某条链延伸进环。开始进行拓扑剥离！`,
    log: `Queue zero-in-degree leaf nodes: [${queue.join(', ')}]`,
    codeLine: linesCode.peelBranch,
    metrics: { '叶子员工数': queue.length },
    statusBadge: { text: '剥离树枝', type: 'info' },
  });

  while (queue.length > 0) {
    const u = queue.shift()!;
    const v = favorite[u];
    maxDepth[v] = Math.max(maxDepth[v], maxDepth[u] + 1);
    inDegree[v]--;
    const pushed = inDegree[v] === 0;
    if (pushed) queue.push(v);

    steps.push({
      nodes,
      edges,
      favorite,
      inDegree: [...inDegree],
      maxDepth: [...maxDepth],
      queue: [...queue],
      curNode: u,
      activeEdge: { from: u, to: v },
      phase: 'peeling',
      maxRing: 0,
      sumTwoRing: 0,
      finalAns: 0,
      decision: `剥离员工 Node ${u} ➔ 更新其喜欢的人 Node ${v} 的挂载链深度为 ${maxDepth[v]}${pushed ? `，且 Node ${v} 也成为纯树枝入队！` : ''}`,
      message: `maxDepth[${v}] = max(maxDepth[${v}], maxDepth[${u}] + 1) = ${maxDepth[v]}。`,
      log: `Peel ${u}->${v}: maxDepth[${v}]=${maxDepth[v]}, inDeg[${v}]=${inDegree[v]}`,
      codeLine: linesCode.updateDepth,
      metrics: { '当前剥离': `员工 ${u}`, '延伸链深': maxDepth[v], '剩余入度': inDegree[v] },
      statusBadge: { text: `剥离: ${u}➔${v}`, type: 'warning' },
    });
  }

  // 3. 统计环路
  let maxRing = 0;
  let sumTwoRing = 0;

  for (let i = 0; i < n; i++) {
    if (inDegree[i] > 0) {
      inDegree[i] = 0;
      let ringSize = 1;
      const ringNodes: number[] = [i];

      for (let curr = favorite[i]; curr !== i; curr = favorite[curr]) {
        ringSize++;
        inDegree[curr] = 0;
        ringNodes.push(curr);
      }

      if (ringSize === 2) {
        const u = ringNodes[0];
        const v = ringNodes[1];
        const gain = 2 + maxDepth[u] + maxDepth[v];
        sumTwoRing += gain;

        steps.push({
          nodes,
          edges,
          favorite,
          inDegree: [...inDegree],
          maxDepth: [...maxDepth],
          queue: [],
          curNode: i,
          activeEdge: null,
          phase: 'rings',
          maxRing,
          sumTwoRing,
          finalAns: Math.max(maxRing, sumTwoRing),
          decision: `发现二元互偶小环 (${u} ⇄ ${v})：两人互喜，各自可接入外向长链！贡献增量 = 2 + depth[${u}](${maxDepth[u]}) + depth[${v}](${maxDepth[v]}) = ${gain}`,
          message: `由于两人互对而坐，两端各自挂的最长链绝不冲突，所有大小为 2 的小环加链长均可【全部拼入同个大圆桌】！累计 sumTwoRing = ${sumTwoRing}。`,
          log: `Found size-2 ring (${u}, ${v}): gain=${gain}, sumTwoRing=${sumTwoRing}`,
          codeLine: linesCode.classifyRing,
          metrics: { '环类型': '二元互偶环 (可拼接)', '环大小': 2, '两端链长': `${maxDepth[u]} + ${maxDepth[v]}`, '累加总人数': sumTwoRing },
          statusBadge: { text: `二元环 +${gain}`, type: 'success' },
        });
      } else {
        maxRing = Math.max(maxRing, ringSize);

        steps.push({
          nodes,
          edges,
          favorite,
          inDegree: [...inDegree],
          maxDepth: [...maxDepth],
          queue: [],
          curNode: i,
          activeEdge: null,
          phase: 'rings',
          maxRing,
          sumTwoRing,
          finalAns: Math.max(maxRing, sumTwoRing),
          decision: `发现大环 [${ringNodes.join(' ➔ ')} ➔ ${i}]，环大小 = ${ringSize} ≥ 3`,
          message: `大环中员工必须首尾相接围成封闭闭环，外界任何挂链都无法入座（会破坏相邻喜爱），因此大环无法挂枝，只能取最大环 maxRing = ${maxRing}。`,
          log: `Found size-${ringSize} ring: [${ringNodes.join(', ')}], maxRing=${maxRing}`,
          codeLine: linesCode.classifyRing,
          metrics: { '环类型': '封闭大环 (独占桌)', '环大小': ringSize, '历史最大环': maxRing },
          statusBadge: { text: `大环: ${ringSize}人`, type: 'info' },
        });
      }
    }
  }

  // 4. 终态
  const finalAns = Math.max(maxRing, sumTwoRing);
  steps.push({
    nodes,
    edges,
    favorite,
    inDegree: [...inDegree],
    maxDepth: [...maxDepth],
    queue: [],
    curNode: null,
    activeEdge: null,
    phase: 'done',
    maxRing,
    sumTwoRing,
    finalAns,
    decision: `内向基环树拓扑分析完毕：max(最大大环 ${maxRing}, 所有二元互偶环链和 ${sumTwoRing}) = ${finalAns} 位员工`,
    message: `两者取其大即为全局最大入座邀请人数。`,
    log: `MaxEmployees finished: maxRing=${maxRing}, sumTwoRing=${sumTwoRing} -> ans=${finalAns}`,
    codeLine: linesCode.returnResult,
    metrics: { '最大独立大环': `${maxRing} 人`, '二元环拼接和': `${sumTwoRing} 人`, '最多邀请人数': `${finalAns} 人` },
    statusBadge: { text: `最终答案: ${finalAns}`, type: 'success' },
  });

  return steps;
}

export const maxEmployees060Visualizer = registerDeclarativeAlgorithm<MaxEmployeesStep>({
  id: 'max-employees-meeting-060',
  aliases: ['max-employees-meeting', 'leetcode-2127', 'class060-code04', 'functional-graph-rings'],
  name: '参加会议最多员工数 (LeetCode 2127 · 内向基环树) (Class 060)',
  category: 'graph',
  icon: '🪑',
  difficulty: 3,
  levelOrder: 6004,
  learningGoal: '掌握内向基环树拓扑剥离树枝方法、环路大小分类讨论与二元互偶链全量拼接机理',
  problemHtml: GRAPH_060_PROBLEMS.maxEmployees060.html,
  codeLanguages: MAX_EMPLOYEES_060_CODES,
  inputs: [
    {
      id: 'preset',
      label: '基环树形态选择',
      type: 'select',
      defaultValue: 'mixed_rings',
      options: [
        { label: '6 员工双二元环带外挂长链 (二元环拼接胜出)', value: 'mixed_rings' },
        { label: '4 员工 3 节点大环带外挂叶子 (独立大环胜出)', value: 'big_ring_3' },
      ],
    },
  ],
  presets: [
    { label: '二元环链拼接', values: { preset: 'mixed_rings' } },
    { label: '3 节点大环', values: { preset: 'big_ring_3' } },
  ],
  generateSteps: (inputs) => buildMaxEmployees060Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 10px;">
        <div style="display: flex; gap: 16px; align-items: center; font-size: 11px; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 14px; border-radius: 6px;">
          <span>独占大环 maxRing: <strong style="color: #6366f1;">${step.maxRing} 人</strong></span>
          <span>二元环拼接 sumTwoRing: <strong style="color: #10b981;">${step.sumTwoRing} 人</strong></span>
          <span>当前优选人数: <strong style="color: #f59e0b; font-size: 13px;">${step.finalAns} 人</strong></span>
        </div>
        ${renderGraph060SvgTopology(step.nodes, step.edges, {
          currentNode: step.curNode,
          inQueueNodes: step.queue,
          activeEdge: step.activeEdge,
          nodeValues: step.maxDepth,
          valueLabel: '链深',
        })}
        <div style="display: flex; gap: 10px; width: 100%; max-width: 500px; flex-direction: column;">
          ${renderGraph060InDegreeGrid(step.inDegree, step.curNode, undefined, '受喜欢入度表 inDegree (剥离完毕后 >0 者即为环节点)')}
        </div>
      </div>
    `;
  },
});
