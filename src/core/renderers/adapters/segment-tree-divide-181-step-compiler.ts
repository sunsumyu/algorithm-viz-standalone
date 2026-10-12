import { SEGMENT_TREE_DIVIDE_LINES } from '../../../algorithms/categories/advanced-topics/advanced-179-184/advanced-179-184-stage-codes';
import { Advanced179Step, TimeEdgeView } from '../../../algorithms/categories/advanced-topics/advanced-179-184/advanced-179-184-shared';

export interface SegmentTreeDivideStep extends Advanced179Step {
  totalTime: number;
  curTime: number;
  edges: TimeEdgeView[];
  activeEdges: { u: number; v: number }[];
  isBipartite: boolean;
  stage: string;
}

export function buildSegmentTreeDivideSteps(): SegmentTreeDivideStep[] {
  const steps: SegmentTreeDivideStep[] = [];
  const lines = SEGMENT_TREE_DIVIDE_LINES;

  const totalTime = 3;
  const edges: TimeEdgeView[] = [
    { u: 1, v: 2, l: 1, r: 3 },
    { u: 2, v: 3, l: 1, r: 2 },
    { u: 1, v: 3, l: 2, r: 3 },
  ];

  // Step 0: 入口帧
  steps.push({
    totalTime,
    curTime: 0,
    edges,
    activeEdges: [],
    isBipartite: true,
    stage: '时间线段树初始化',
    decision: `主函数入口：处理时间跨度 T=1..3 的动态加边与删边操作，并在线判定各时刻图是否为二分图`,
    message: `线段树分治将离线的每条边 [l, r] 插入到时间轴线段树的 O(log T) 个对应区间节点上，转化为只加不删的前序遍历`,
    log: `enter segment tree divide: totalTime=3, edges=3`,
    codeLine: lines.entry,
    metrics: { '总时间步': 3, '边总数': 3, '当前时刻': 0 },
  });

  // Step 1: 遍历到叶子 T = 1
  steps.push({
    totalTime,
    curTime: 1,
    edges,
    activeEdges: [{ u: 1, v: 2 }, { u: 2, v: 3 }],
    isBipartite: true,
    stage: '到达时刻 T = 1 (叶子节点)',
    decision: `DFS 递归到达叶子 T=1：激活边 (1-2) 与边 (2-3)，扩展域可撤销并查集判定无奇环`,
    message: `时刻 T=1 时图中只有链 (1-2-3)，是合法二分图，记录答案 ans[1] = "YES"`,
    log: `dfs leaf: T=1, isBipartite=true`,
    codeLine: lines.leafAns,
    statusBadge: { text: 'T=1: 是二分图 (YES)', type: 'success' },
    metrics: { '当前时刻': 1, '活跃边数': 2, '二分图': 'YES' },
  });

  // Step 2: 遍历到叶子 T = 2 (插入边 1-3 出现奇环)
  steps.push({
    totalTime,
    curTime: 2,
    edges,
    activeEdges: [{ u: 1, v: 2 }, { u: 2, v: 3 }, { u: 1, v: 3 }],
    isBipartite: false,
    stage: '到达时刻 T = 2 (触发奇环)',
    decision: `DFS 递归到达叶子 T=2：此时边 (1-3) 亦加入图，与 (1-2) 和 (2-3) 构成三角形奇环！`,
    message: `扩展域并查集中 1 和 1+n 在同一连通块，判定存在奇环，非二分图，记录 ans[2] = "NO"`,
    log: `dfs leaf: T=2, cycle detected, isBipartite=false`,
    codeLine: lines.leafAns,
    statusBadge: { text: 'T=2: 存在奇环 (NO)', type: 'danger' },
    metrics: { '当前时刻': 2, '活跃边数': 3, '二分图': 'NO' },
  });

  // Step 3: 回溯撤销 T=2 处的贡献
  steps.push({
    totalTime,
    curTime: 2,
    edges,
    activeEdges: [{ u: 1, v: 2 }],
    isBipartite: true,
    stage: '回溯撤销历史操作',
    decision: `DFS 回溯：利用可撤销并查集的 historySnapshot 快照，一键弹栈撤销边 (2-3) 与 (1-3) 的合并`,
    message: `无损恢复先前的拓扑结构，准备进入右子树时间节点 T=3`,
    log: `dsu rollback to snapshot`,
    codeLine: lines.rollback,
    statusBadge: { text: '并查集精准回退', type: 'warning' },
    metrics: { '当前时刻': 2, '状态': '状态回退完成' },
  });

  // Step 4: 遍历到叶子 T = 3
  steps.push({
    totalTime,
    curTime: 3,
    edges,
    activeEdges: [{ u: 1, v: 2 }, { u: 1, v: 3 }],
    isBipartite: true,
    stage: '到达时刻 T = 3 (叶子节点)',
    decision: `DFS 递归到达叶子 T=3：边 (2-3) 已于 T=2 结束生命周期，当前活跃边仅为 (1-2) 与 (1-3)`,
    message: `此时图为中心辐射结构，不存在奇环，记录 ans[3] = "YES"`,
    log: `dfs leaf: T=3, isBipartite=true`,
    codeLine: lines.leafAns,
    statusBadge: { text: 'T=3: 是二分图 (YES)', type: 'success' },
    metrics: { '当前时刻': 3, '活跃边数': 2, '二分图': 'YES' },
  });

  // Step 5: 分治结束，返回全时段判定
  steps.push({
    totalTime,
    curTime: 3,
    edges,
    activeEdges: [],
    isBipartite: true,
    stage: '线段树分治全流程结束',
    decision: `🎉 线段树分治完成：3 个时刻的判定结果分别为 [YES, NO, YES]`,
    message: `线段树分治规避了传统并查集难以支持删边的缺陷，以 O((N + M) log T) 时间完美处理带生命周期的动态图连通与二分判定`,
    log: `segment tree divide finished: [YES, NO, YES]`,
    codeLine: lines.rollback,
    statusBadge: { text: '全时刻判定完成', type: 'success' },
    metrics: { '输出': '[YES, NO, YES]', '总复杂度': 'O(M log T)', '状态': '求解完成' },
  });

  return steps;
}
