import { EDGE_BCC_LINES } from '../../../algorithms/categories/advanced-topics/advanced-185-190/advanced-185-190-stage-codes';
import { Advanced185Step, BridgeEdgeView } from '../../../algorithms/categories/advanced-topics/advanced-185-190/advanced-185-190-shared';

export interface EdgeBCCStep extends Advanced185Step {
  nodes: number[];
  edges: BridgeEdgeView[];
  ebccs: number[][];
  stage: string;
}

export function buildEdgeBCCSteps(): EdgeBCCStep[] {
  const steps: EdgeBCCStep[] = [];
  const lines = EDGE_BCC_LINES;

  const nodes = [1, 2, 3, 4, 5];
  // 拓扑：三元环 (1-2-3-1) 通过桥 (3-4) 连接二元环 (4-5-4)
  const edges: BridgeEdgeView[] = [
    { u: 1, v: 2, isBridge: false },
    { u: 2, v: 3, isBridge: false },
    { u: 3, v: 1, isBridge: false },
    { u: 3, v: 4, isBridge: false }, // 桥！
    { u: 4, v: 5, isBridge: false },
  ];

  // Step 0: 入口帧
  steps.push({
    nodes,
    edges: edges.map(e => ({ ...e })),
    ebccs: [],
    stage: '边双初始化与 DFS 准备',
    decision: `主函数入口：开始在包含 5 个节点与 5 条边的无向连通图中检测割边 (桥) 并划分边双连通分量`,
    message: `利用成对存储技巧 (e 与 e^1) 忽略反向父边，防止将无向树边误认为双向环`,
    log: `enter edge bcc: n=5, m=5`,
    codeLine: lines.entry,
    metrics: { '顶点数': 5, '边数': 5, '割边数': 0 },
  });

  // Step 1: 扫描三元环 (1-2-3-1)，无割边
  steps.push({
    nodes,
    edges: edges.map(e => ({ ...e })),
    ebccs: [],
    stage: '遍历三元环 1-2-3-1',
    decision: `DFS 遍历环 1 -> 2 -> 3，并通过返祖边 3 -> 1 回溯：low[2]=1, low[3]=1 <= dfn[1]`,
    message: `三元环内各边均有替代回路，不满足 low[v] > dfn[u]，均非割边`,
    log: `cycle 1-2-3 processed, low<=dfn`,
    codeLine: lines.exploreDFS,
    statusBadge: { text: '环内无割边', type: 'info' },
    metrics: { '环内顶点': '1, 2, 3', '当前最小 low': 1 },
  });

  // Step 2: 遍历边 (3-4)，发现满足 low[4] > dfn[3]，锁定割边！
  const edgesWithBridge = edges.map(e => ({ ...e }));
  edgesWithBridge[3].isBridge = true; // (3-4) 是桥
  steps.push({
    nodes,
    edges: edgesWithBridge,
    ebccs: [],
    stage: '发现割边 (3-4)',
    decision: `DFS 递归遍历至节点 4，4 无法通过其他后向边回溯至 3 或其上方祖先：low[4] = 4 > dfn[3] = 3`,
    message: `命中割边判定定理：边 (3-4) 删去后原图必不连通，成功标记为桥 (Bridge)！`,
    log: `bridge detected: (3-4) since low[4]=4 > dfn[3]=3`,
    codeLine: lines.bridgeHit,
    statusBadge: { text: '锁定割边: (3-4)', type: 'danger' },
    metrics: { '割边': '3 - 4', '判定条件': 'low[4] > dfn[3]' },
  });

  // Step 3: 遍历剩余子连通块 {4, 5}
  steps.push({
    nodes,
    edges: edgesWithBridge,
    ebccs: [],
    stage: '遍历子块 4-5',
    decision: `DFS 遍历边 (4-5)，整张图遍历完毕，全图唯一割边为 (3-4)`,
    message: `割边将图无损撕裂成相互独立的极大边双连通分量`,
    log: `all nodes visited, bridges=1`,
    codeLine: lines.exploreDFS,
    statusBadge: { text: '全图搜索完毕', type: 'info' },
    metrics: { '割边总数': 1, '连通分量预估': 2 },
  });

  // Step 4: 删去割边，划分极大边双分量
  const finalEbccs = [
    [1, 2, 3],
    [4, 5],
  ];
  steps.push({
    nodes,
    edges: edgesWithBridge,
    ebccs: finalEbccs,
    stage: '划分边双连通分量 (e-BCC)',
    decision: `删去割边 (3-4)，DFS 收集剩余连通块：成功划分出 e-BCC #1: {1, 2, 3} 与 e-BCC #2: {4, 5}`,
    message: `每个边双连通分量内部任意两点间都存在至少两条边不相交的路径`,
    log: `ebccs extracted: {1, 2, 3} and {4, 5}`,
    codeLine: lines.bridgeHit,
    statusBadge: { text: '划分 2 个 e-BCC', type: 'success' },
    metrics: { 'e-BCC 数量': 2, '缩点结果': 'BCC_1 -- BCC_2' },
  });

  // Step 5: 终态缩点成树
  steps.push({
    nodes,
    edges: edgesWithBridge,
    ebccs: finalEbccs,
    stage: '边双缩点成树完成',
    decision: `🎉 边双连通分量求解完毕：缩点后无向图退化为由桥连接的无向树`,
    message: `割边与边双缩点是无向网络鲁棒性分析、加最少边将图变为双连通图等竞赛压轴题的标准第一步`,
    log: `edge bcc finished: tree built`,
    codeLine: lines.entry,
    statusBadge: { text: '求解完成', type: 'success' },
    metrics: { '割边数': 1, '缩点后拓扑': '树 (Tree)', '状态': '求解完成' },
  });

  return steps;
}
