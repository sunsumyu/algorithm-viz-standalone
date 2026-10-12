import { BLOCK_CUT_TREE_LINES } from '../../../algorithms/categories/advanced-topics/advanced-173-178/advanced-173-178-stage-codes';
import { Advanced173Step, BlockCutBlockView } from '../../../algorithms/categories/advanced-topics/advanced-173-178/advanced-173-178-shared';

export interface BlockCutStep extends Advanced173Step {
  origNodes: number[];
  blocks: BlockCutBlockView[];
  cutVertices: number[];
  stage: string;
}

export function buildBlockCutSteps(): BlockCutStep[] {
  const steps: BlockCutStep[] = [];
  const lines = BLOCK_CUT_TREE_LINES;

  const origNodes = [1, 2, 3, 4, 5];
  // 图由两个环在割点 3 处拼接: {1, 2, 3} 与 {3, 4, 5}
  const blocks: BlockCutBlockView[] = [];

  // Step 0: 入口帧
  steps.push({
    origNodes,
    blocks: [],
    cutVertices: [],
    stage: '主函数入口',
    decision: `主函数入口：开始对 5 节点图进行 Tarjan 点双连通分量 (BCC) 分解并构建圆方树`,
    message: `原图圆点包含 1~5，环结构将在 Tarjan 回溯时缩成方点，割点成为连通多个方点的枢纽圆点`,
    log: `enter tarjanBCT: nodes=5`,
    codeLine: lines.entry,
    metrics: { '原图顶点': 5, '分析模型': '极大点双连通分量' },
  });

  // Step 1: 发现第一个点双连通分量 BCC 1: {1, 2, 3}
  blocks.push({
    squareId: 1,
    circleMembers: [1, 2, 3],
  });
  steps.push({
    origNodes,
    blocks: [...blocks],
    cutVertices: [],
    stage: '发现点双分量 BCC #1',
    decision: `Tarjan 检索判定 low[2] >= dfn[1]：栈内弹出节点 1, 2, 3，构成极大点双分量 BCC #1`,
    message: `新建方点 S1，圆方树连边 (S1-V1), (S1-V2), (S1-V3)`,
    log: `bccFound: S1 -> {1, 2, 3}`,
    codeLine: lines.bccFound,
    statusBadge: { text: '建立方点 S1', type: 'info' },
    metrics: { '已建立方点': 1, '当前点双成员': 'V1, V2, V3' },
  });

  // Step 2: 发现第二个点双连通分量 BCC 2: {3, 4, 5}
  blocks.push({
    squareId: 2,
    circleMembers: [3, 4, 5],
  });
  steps.push({
    origNodes,
    blocks: [...blocks],
    cutVertices: [3],
    stage: '发现点双分量 BCC #2 (确定割点 3)',
    decision: `Tarjan 检索判定 low[4] >= dfn[3]：栈内弹出 4, 5，与 3 构成极大点双分量 BCC #2`,
    message: `新建方点 S2，圆方树连边 (S2-V3), (S2-V4), (S2-V5)。由于 V3 同时连接 S1 与 S2，判定 V3 为全图割点！`,
    log: `bccFound: S2 -> {3, 4, 5}, cutNode=3`,
    codeLine: lines.addSquare,
    statusBadge: { text: '建立方点 S2 (确定割点 V3)', type: 'warning' },
    metrics: { '已建立方点': 2, '全图割点': 'V3', '当前点双成员': 'V3, V4, V5' },
  });

  // Step 3: 终态返回
  steps.push({
    origNodes,
    blocks: [...blocks],
    cutVertices: [3],
    stage: '圆方树构建全部完成',
    decision: `🎉 圆方树构建完成：原图成功转化为无环树状二分图`,
    message: `圆方树性质：任意两圆点间在原图中的所有简单路径点集交集，等价于圆方树树上路径的所有圆点，树上倍增 LCA 直接秒解！`,
    log: `returnAns: totalSquares=2, cut=[3]`,
    codeLine: lines.returnAns,
    statusBadge: { text: '圆方二分树构建成功', type: 'success' },
    metrics: { '圆点数': 5, '方点数': 2, '割点集合': 'V3', '树上结构': '严格二分树' },
  });

  return steps;
}
