import { EDGE_DECOMPOSITION_LINES } from '../../../algorithms/categories/advanced-topics/advanced-185-190/advanced-185-190-stage-codes';
import { Advanced185Step, EdgeDecompEdge } from '../../../algorithms/categories/advanced-topics/advanced-185-190/advanced-185-190-shared';

export interface EdgeDecompStep extends Advanced185Step {
  nodes: number[];
  edges: EdgeDecompEdge[];
  activeEdgeId: number;
  blockA: number[];
  blockB: number[];
  stage: string;
}

export function buildEdgeDecompSteps(): EdgeDecompStep[] {
  const steps: EdgeDecompStep[] = [];
  const lines = EDGE_DECOMPOSITION_LINES;

  const nodes = [1, 2, 3, 4];
  const edges: EdgeDecompEdge[] = [
    { id: 1, u: 1, v: 2, w: 2, isCentroid: false, isCut: false },
    { id: 2, u: 2, v: 3, w: 1, isCentroid: false, isCut: false },
    { id: 3, u: 3, v: 4, w: 3, isCentroid: false, isCut: false },
  ];

  // Step 0: 入口帧
  steps.push({
    nodes,
    edges: edges.map(e => ({ ...e })),
    activeEdgeId: -1,
    blockA: [1, 2, 3, 4],
    blockB: [],
    stage: '三度化与边分治初始化',
    decision: `主函数入口：开始对树进行边分治，已完成多叉树三度化预处理 (每个点度数 <= 3)`,
    message: `边分治相比点分治最大优势：每次断开一条边，树被严格划分为 2 个连通块，递归结构是严格二叉树`,
    log: `enter edge decomposition: n=4`,
    codeLine: lines.entry,
    metrics: { '总点数': 4, '总边数': 3, '最大度数': '<= 3' },
  });

  // Step 1: 寻找第一层重心边 (Edge 2: 2 - 3)
  const edges1 = edges.map(e => ({ ...e }));
  edges1[1].isCentroid = true; // 边 2 是重心边
  steps.push({
    nodes,
    edges: edges1,
    activeEdgeId: 2,
    blockA: [1, 2],
    blockB: [3, 4],
    stage: '第一层分治：锁定重心边 (2-3)',
    decision: `树形 DP 计算各边两侧点数差：断开边 (2-3) 后两侧点数分别为 2 与 2，差值为 0 达到完美平衡`,
    message: `成功选定重心边为 (2-3, 权重 1)，将整树划分为左块 {1, 2} 与右块 {3, 4}`,
    log: `found centroid edge: id=2 (2-3), szA=2, szB=2`,
    codeLine: lines.cutEdge,
    statusBadge: { text: '锁定重心边 (2-3)', type: 'warning' },
    metrics: { '重心边': '2 - 3', '左块大小': 2, '右块大小': 2 },
  });

  // Step 2: 统计跨越重心边 (2-3) 的路径
  edges1[1].isCut = true;
  steps.push({
    nodes,
    edges: edges1,
    activeEdgeId: 2,
    blockA: [1, 2],
    blockB: [3, 4],
    stage: '统计跨越重心边的点对信息',
    decision: `分别在左块 {1, 2} 与右块 {3, 4} 遍历距离，合并统计跨越边 (2-3) 的点对权值`,
    message: `由于递归结构天然二分，左右两块数据结构可以高效归并，单次合并耗时仅与子树大小线性相关`,
    log: `calc cross edge 2-3 paths`,
    codeLine: lines.calcCross,
    statusBadge: { text: '跨边路径统计完成', type: 'info' },
    metrics: { '合并方式': '二叉归并', '阶段': '跨边合并' },
  });

  // Step 3: 递归进入左右子树
  steps.push({
    nodes,
    edges: edges1,
    activeEdgeId: -1,
    blockA: [1],
    blockB: [2],
    stage: '递归进入二叉子连通块',
    decision: `边 (2-3) 永久断开，递归进入左块 {1, 2}，在子块中选定重心边 (1-2) 继续严格二分`,
    message: `同理右块 {3, 4} 选定重心边 (3-4) 递归，边分治树高严格保持在 O(log N)`,
    log: `recurse into binary subproblems`,
    codeLine: lines.recurseSub,
    statusBadge: { text: '严格二分递归', type: 'info' },
    metrics: { '子分治深度': 2, '重构树形态': '严格二叉树' },
  });

  // Step 4: 终态返回
  steps.push({
    nodes,
    edges: edges.map(e => ({ ...e, isCut: true })),
    activeEdgeId: -1,
    blockA: [1, 2],
    blockB: [3, 4],
    stage: '边分治全流程结束',
    decision: `🎉 树上边分治完成：所有路径均已在 O(N log N) 时间内合并完毕`,
    message: `边分治与边分树天然契合单调栈与线段树合并，是解决树上两点复杂函数极值与动态二叉重构的殿堂级工具`,
    log: `edge decomposition finished`,
    codeLine: lines.recurseSub,
    statusBadge: { text: '边分治完成', type: 'success' },
    metrics: { '算法时间复杂度': 'O(N log N)', '重构树高度': 'O(log N)', '状态': '完成' },
  });

  return steps;
}
