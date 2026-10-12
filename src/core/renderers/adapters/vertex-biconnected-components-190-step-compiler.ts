import { VERTEX_BCC_LINES } from '../../../algorithms/categories/advanced-topics/advanced-185-190/advanced-185-190-stage-codes';
import { Advanced185Step } from '../../../algorithms/categories/advanced-topics/advanced-185-190/advanced-185-190-shared';

export interface VertexBCCStep extends Advanced185Step {
  nodes: number[];
  cutVertices: number[];
  vbccs: number[][];
  stage: string;
}

export function buildVertexBCCSteps(): VertexBCCStep[] {
  const steps: VertexBCCStep[] = [];
  const lines = VERTEX_BCC_LINES;

  const nodes = [1, 2, 3, 4, 5];
  // 拓扑：三元环 (1-2-3-1) 与三元环 (3-4-5-3) 在割点 3 处相交，类似 8 字形
  // 割点为 3；点双为 {1, 2, 3} 与 {3, 4, 5}

  // Step 0: 入口帧
  steps.push({
    nodes,
    cutVertices: [],
    vbccs: [],
    stage: '点双与割点检测初始化',
    decision: `主函数入口：开始在 8 字形拓扑无向图中检测割点 (Cut Vertex) 与极大点双连通分量 (v-BCC)`,
    message: `割点判定准则：非根节点 u 若存在子节点 v 满足 low[v] >= dfn[u]，说明 v 无法脱离 u 回溯，u 必为割点`,
    log: `enter vertex bcc: n=5`,
    codeLine: lines.entry,
    metrics: { '顶点数': 5, '割点数': 0, '点双数': 0 },
  });

  // Step 1: DFS 遍历环 1-2-3
  steps.push({
    nodes,
    cutVertices: [],
    vbccs: [],
    stage: '遍历左半环 1 -> 2 -> 3',
    decision: `DFS 递归遍历节点 1 -> 2 -> 3，边相继压入栈中：dfn[1]=1, dfn[2]=2, dfn[3]=3`,
    message: `节点 1, 2, 3 构成局部强连通环路，等待右半区探测`,
    log: `dfs path: 1-2-3`,
    codeLine: lines.exploreDFS,
    statusBadge: { text: '探测左半环', type: 'info' },
    metrics: { '当前深入节点': 3, '搜索深度': 3 },
  });

  // Step 2: 从节点 3 出发遍历右半环 3 -> 4 -> 5 -> 3
  steps.push({
    nodes,
    cutVertices: [],
    vbccs: [],
    stage: '从节点 3 深入遍历右半环 4-5',
    decision: `节点 3 深入遍历至 4 与 5，并通过返祖边 5 -> 3 回溯：low[4]=3, low[5]=3`,
    message: `注意 low[4] 无法小于 dfn[3]=3，因为右半环没有任何边能跨越节点 3 触达节点 1 或 2`,
    log: `dfs path: 3-4-5, low[4]=3`,
    codeLine: lines.exploreDFS,
    statusBadge: { text: '探测右半环', type: 'info' },
    metrics: { '当前深入节点': 5, '返祖边': '5 -> 3' },
  });

  // Step 3: 回溯到节点 3，满足 low[4] >= dfn[3]，锁定割点 3！
  steps.push({
    nodes,
    cutVertices: [3],
    vbccs: [[3, 4, 5]],
    stage: '发现割点 3 并弹出点双 #1',
    decision: `回溯至节点 3：儿子 4 满足 low[4] = 3 >= dfn[3] = 3，且 3 不是根节点，锁定节点 3 为割点！`,
    message: `弹栈收集边至 (3, 4)，成功提取出极大点双连通分量 v-BCC #1: {3, 4, 5}`,
    log: `cut vertex hit: 3, v-bcc {3, 4, 5} popped`,
    codeLine: lines.cutHit,
    statusBadge: { text: '锁定割点: 节点 3', type: 'danger' },
    metrics: { '割点': 3, '弹出点双': '{3, 4, 5}' },
  });

  // Step 4: 回溯到根节点 1，弹出点双 #2
  steps.push({
    nodes,
    cutVertices: [3],
    vbccs: [[3, 4, 5], [1, 2, 3]],
    stage: '回溯至根节点 1 并弹出点双 #2',
    decision: `回溯至根节点 1：根节点只有一个搜索树子树分支，因此根节点 1 自身不是割点`,
    message: `弹栈收集剩余边，提取出极大点双连通分量 v-BCC #2: {1, 2, 3}`,
    log: `v-bcc {1, 2, 3} popped`,
    codeLine: lines.popVBCC,
    statusBadge: { text: '弹出点双 #2: {1, 2, 3}', type: 'success' },
    metrics: { '割点总数': 1, '点双总数': 2 },
  });

  // Step 5: 终态完成
  steps.push({
    nodes,
    cutVertices: [3],
    vbccs: [[3, 4, 5], [1, 2, 3]],
    stage: '割点与点双连通分量求解完毕',
    decision: `🎉 割点与点双连通分量求解完成：全图唯一割点为节点 3，划分为 2 个极大点双连通块`,
    message: `割点 3 同时属于两个点双，是两个点双块之间的关节点；以此割点与两个点双方点相连即可构建圆方树`,
    log: `vertex bcc finished: cut=[3], vbccs=2`,
    codeLine: lines.entry,
    statusBadge: { text: '求解完成', type: 'success' },
    metrics: { '割点数': 1, '点双数': 2, '状态': '求解完成' },
  });

  return steps;
}
