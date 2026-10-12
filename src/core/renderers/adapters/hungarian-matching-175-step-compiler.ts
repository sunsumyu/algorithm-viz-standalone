import { HUNGARIAN_MATCHING_LINES } from '../../../algorithms/categories/advanced-topics/advanced-173-178/advanced-173-178-stage-codes';
import { Advanced173Step } from '../../../algorithms/categories/advanced-topics/advanced-173-178/advanced-173-178-shared';

export interface HungarianStep extends Advanced173Step {
  nLeft: number;
  nRight: number;
  edges: { u: number; v: number }[];
  matchRight: number[];
  activeLeft: number;
  stage: string;
}

export function buildHungarianSteps(): HungarianStep[] {
  const steps: HungarianStep[] = [];
  const lines = HUNGARIAN_MATCHING_LINES;

  const nLeft = 3;
  const nRight = 3;
  const edges = [
    { u: 0, v: 0 },
    { u: 0, v: 1 },
    { u: 1, v: 0 },
    { u: 1, v: 2 },
    { u: 2, v: 1 },
  ];

  let match = [-1, -1, -1];

  // Step 0: 入口帧
  steps.push({
    nLeft,
    nRight,
    edges,
    matchRight: [...match],
    activeLeft: -1,
    stage: '准备二分图匹配',
    decision: `主函数入口：开始在包含 ${nLeft} 个左部点与 ${nRight} 个右部点的二分图中计算最大匹配`,
    message: `利用交替路与增广链翻转，寻找使得没有两条匹配边共享公共顶点的最大边集合`,
    log: `enter hungarian: nL=3, nR=3`,
    codeLine: lines.entry,
    metrics: { '左部点数': nLeft, '右部点数': nRight, '可选边数': edges.length, '初始匹配': 0 },
  });

  // Step 1: 处理左部点 U0 (U0 与 V0 直连成功)
  match[0] = 0;
  steps.push({
    nLeft,
    nRight,
    edges,
    matchRight: [...match],
    activeLeft: 0,
    stage: '为左部点 U0 寻增广路',
    decision: `U0 尝试与未配对的 V0 配对：V0 当前空闲，直接达成匹配 U0 <-> V0`,
    message: `匹配数提升至 1`,
    log: `match: U0 -> V0`,
    codeLine: lines.reassign,
    statusBadge: { text: '匹配 U0 <-> V0', type: 'info' },
    metrics: { '当前匹配数': 1, '当前增广点': 'U0' },
  });

  // Step 2: 处理左部点 U1 (U1 协商 V0，U0 腾挪至 V1)
  match[1] = 0; // U0 挪到 V1
  match[0] = 1; // U1 拿到 V0
  steps.push({
    nLeft,
    nRight,
    edges,
    matchRight: [...match],
    activeLeft: 1,
    stage: '为左部点 U1 寻增广路 (伴侣腾挪协商)',
    decision: `U1 尝试配对 V0：V0 已有伴侣 U0；递归要求 U0 寻找替代，U0 成功挪窝至空闲点 V1！`,
    message: `达成增广轨翻转：原边 U0-V0 变为 U1-V0，新增 U0-V1，匹配数提升至 2`,
    log: `reassign: U1->V0, U0->V1`,
    codeLine: lines.reassign,
    statusBadge: { text: '增广翻转成功 (匹配 2)', type: 'warning' },
    metrics: { '当前匹配数': 2, '增广链': 'U1 -> V0 -> U0 -> V1' },
  });

  // Step 3: 处理左部点 U2 (链式传递腾挪：U2 争 V1，U0 争 V0，U1 挪到 V2)
  match[2] = 1; // U1 挪到 V2
  match[0] = 0; // U0 挪回 V0
  match[1] = 2; // U2 拿到 V1
  steps.push({
    nLeft,
    nRight,
    edges,
    matchRight: [...match],
    activeLeft: 2,
    stage: '为左部点 U2 寻增广路 (多级链式交替腾挪)',
    decision: `U2 尝试配对 V1 (伴侣 U0) &rarr; U0 尝试配对 V0 (伴侣 U1) &rarr; U1 成功找到空闲点 V2！`,
    message: `整条交替路 U2 -> V1 -> U0 -> V0 -> U1 -> V2 状态全面反转，所有左部点全部完美配对！`,
    log: `reassignChain: U2->V1, U0->V0, U1->V2`,
    codeLine: lines.reassign,
    statusBadge: { text: '完美匹配达成 (匹配 3)', type: 'success' },
    metrics: { '当前匹配数': 3, '交替轨长度': 5 },
  });

  // Step 4: 终态
  steps.push({
    nLeft,
    nRight,
    edges,
    matchRight: [...match],
    activeLeft: -1,
    stage: '二分图最大匹配全部完成',
    decision: `🎉 匈牙利算法计算完成：二分图最大匹配数为 3 (完美匹配)`,
    message: `匹配方案为：U0 <-> V0, U1 <-> V2, U2 <-> V1。根据 König 定理，最小点覆盖数亦为 3`,
    log: `returnAns: matches=3`,
    codeLine: lines.returnAns,
    statusBadge: { text: 'MaxMatch = 3', type: 'success' },
    metrics: { '最大匹配数': 3, '最小点覆盖数': 3, '独立集大小': 3 },
  });

  return steps;
}
