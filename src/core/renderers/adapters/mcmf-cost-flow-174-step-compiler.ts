import { MCMF_COST_FLOW_LINES } from '../../../algorithms/categories/advanced-topics/advanced-173-178/advanced-173-178-stage-codes';
import { Advanced173Step, MCMFEdgeView } from '../../../algorithms/categories/advanced-topics/advanced-173-178/advanced-173-178-shared';

export interface MCMFStep extends Advanced173Step {
  nodes: number[];
  edges: MCMFEdgeView[];
  totalFlow: number;
  totalCost: number;
  stage: string;
}

export function buildMCMFSteps(): MCMFStep[] {
  const steps: MCMFStep[] = [];
  const lines = MCMF_COST_FLOW_LINES;

  const nodes = [1, 2, 3, 4];
  const edges: MCMFEdgeView[] = [
    { u: 1, v: 2, cap: 2, flow: 0, cost: 1 },
    { u: 1, v: 3, cap: 1, flow: 0, cost: 3 },
    { u: 2, v: 3, cap: 1, flow: 0, cost: 1 },
    { u: 2, v: 4, cap: 1, flow: 0, cost: 2 },
    { u: 3, v: 4, cap: 2, flow: 0, cost: 1 },
  ];

  // Step 0: 入口帧
  steps.push({
    nodes,
    edges: edges.map(e => ({ ...e })),
    totalFlow: 0,
    totalCost: 0,
    stage: '准备费用流网络',
    decision: `主函数入口：开始计算网络中源点 S=1 到汇点 T=4 的最小费用最大流`,
    message: `每条边具备容量与单位费用属性，反向边具备相反费用支持反悔`,
    log: `enter mcmf: S=1, T=4`,
    codeLine: lines.entry,
    metrics: { '源点 S': 1, '汇点 T': 4, '初始流': 0, '初始费用': 0 },
  });

  // Step 1: SPFA Path 1 (1 -> 2 -> 4, cost=3, flow=1)
  edges[0].flow += 1;
  edges[3].flow += 1; // 2->4 满载
  steps.push({
    nodes,
    edges: edges.map(e => ({ ...e })),
    totalFlow: 1,
    totalCost: 3,
    stage: '增广路 1: 1 -> 2 -> 4 (费用: 3, 流量: 1)',
    decision: `SPFA 检索得费用最短增广路 1 -> 2 -> 4 (单位费用 1+2=3)，瓶颈流量 1`,
    message: `推送流量 1，费用增加 1 * 3 = 3，边 2->4 达到饱和`,
    log: `pushFlow: path 1-2-4, f=1, cost=3`,
    codeLine: lines.pushFlow,
    statusBadge: { text: '推流 1 (费用 3)', type: 'info' },
    metrics: { '当前流量': 1, '当前费用': 3, '最短路单价': 3 },
  });

  // Step 2: SPFA Path 2 (1 -> 2 -> 3 -> 4, cost=3, flow=1)
  edges[0].flow += 1; // 1->2 满载
  edges[2].flow += 1; // 2->3 满载
  edges[4].flow += 1;
  steps.push({
    nodes,
    edges: edges.map(e => ({ ...e })),
    totalFlow: 2,
    totalCost: 6,
    stage: '增广路 2: 1 -> 2 -> 3 -> 4 (费用: 3, 流量: 1)',
    decision: `SPFA 再次寻得当前费用最短路 1 -> 2 -> 3 -> 4 (单位费用 1+1+1=3)，瓶颈流量 1`,
    message: `推送流量 1，费用增加 1 * 3 = 3，累计流量 2，总费用 6`,
    log: `pushFlow: path 1-2-3-4, f=1, cost=3`,
    codeLine: lines.pushFlow,
    statusBadge: { text: '推流 1 (费用 3)', type: 'warning' },
    metrics: { '当前流量': 2, '当前费用': 6, '最短路单价': 3 },
  });

  // Step 3: SPFA Path 3 (1 -> 3 -> 4, cost=4, flow=1)
  edges[1].flow += 1; // 1->3 满载
  edges[4].flow += 1; // 3->4 满载
  steps.push({
    nodes,
    edges: edges.map(e => ({ ...e })),
    totalFlow: 3,
    totalCost: 10,
    stage: '增广路 3: 1 -> 3 -> 4 (费用: 4, 流量: 1)',
    decision: `SPFA 寻得最后一条增广路 1 -> 3 -> 4 (单位费用 3+1=4)，瓶颈流量 1`,
    message: `推送流量 1，费用增加 1 * 4 = 4，累计流量 3，总费用 10`,
    log: `pushFlow: path 1-3-4, f=1, cost=4`,
    codeLine: lines.pushFlow,
    statusBadge: { text: '推流 1 (费用 4)', type: 'info' },
    metrics: { '当前流量': 3, '当前费用': 10, '最短路单价': 4 },
  });

  // Step 4: SPFA 无增广路，终态
  steps.push({
    nodes,
    edges: edges.map(e => ({ ...e })),
    totalFlow: 3,
    totalCost: 10,
    stage: 'MCMF 求解全部完成',
    decision: `🎉 最小费用最大流求解完成：最大流 MaxFlow = 3，最小费用 MinCost = 10`,
    message: `残量网络中源点已无费用最短路可达汇点，已达到全局最小费用的最大流`,
    log: `returnAns: flow=3, cost=10`,
    codeLine: lines.returnAns,
    statusBadge: { text: 'Flow=3, Cost=10', type: 'success' },
    metrics: { '最终最大流': 3, '最小总费用': 10 },
  });

  return steps;
}
