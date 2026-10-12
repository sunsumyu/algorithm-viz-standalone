import { EULERIAN_PATH_LINES } from '../../../algorithms/categories/advanced-topics/advanced-185-190/advanced-185-190-stage-codes';
import { Advanced185Step, EulerianEdge } from '../../../algorithms/categories/advanced-topics/advanced-185-190/advanced-185-190-shared';

export interface EulerianStep extends Advanced185Step {
  nodes: number[];
  edges: EulerianEdge[];
  inDeg: Record<number, number>;
  outDeg: Record<number, number>;
  pathStack: number[];
  stage: string;
}

export function buildEulerianSteps(): EulerianStep[] {
  const steps: EulerianStep[] = [];
  const lines = EULERIAN_PATH_LINES;

  const nodes = [1, 2, 3, 4];
  const edges: EulerianEdge[] = [
    { u: 1, v: 2, used: false },
    { u: 2, v: 3, used: false },
    { u: 3, v: 4, used: false },
    { u: 4, v: 2, used: false }, // 构成 2-3-4-2 的环
  ];
  const inDeg: Record<number, number> = { 1: 0, 2: 2, 3: 1, 4: 1 };
  const outDeg: Record<number, number> = { 1: 1, 2: 1, 3: 1, 4: 1 };

  // Step 0: 入口帧
  steps.push({
    nodes,
    edges: edges.map(e => ({ ...e })),
    inDeg,
    outDeg,
    pathStack: [],
    stage: '判定欧拉图起点与终点',
    decision: `主函数入口：检查各节点出入度，节点 1 满足 outDeg = inDeg + 1 (出度 1, 入度 0)，必为欧拉路径起点`,
    message: `节点 2 出度 1, 入度 2，为欧拉路径终点；节点 3 和 4 出度等于入度；存在唯一合法欧拉路径`,
    log: `check degree: startNode=1, endNode=2`,
    codeLine: lines.entry,
    metrics: { '起点': 1, '终点': 2, '边总数': 4 },
  });

  // Step 1: 从起点 1 出发访问 1 -> 2
  const edges1 = edges.map(e => ({ ...e }));
  edges1[0].used = true;
  steps.push({
    nodes,
    edges: edges1,
    inDeg,
    outDeg,
    pathStack: [],
    stage: 'DFS 遍历出边 (1 -> 2)',
    decision: `从节点 1 出发，当前弧优化删除边 (1 -> 2)，递归进入节点 2`,
    message: `瞬时修改链表头指针，确保后续任何深搜永远不会扫描已使用的废弃边`,
    log: `hierholzer: visit 1 -> 2`,
    codeLine: lines.recurseDFS,
    statusBadge: { text: '遍历 1 -> 2', type: 'info' },
    metrics: { '当前顶点': 2, '已遍历边数': 1 },
  });

  // Step 2: 沿环遍历 2 -> 3 -> 4 -> 2
  const edges2 = edges1.map(e => ({ ...e }));
  edges2[1].used = true; // 2->3
  edges2[2].used = true; // 3->4
  edges2[3].used = true; // 4->2
  steps.push({
    nodes,
    edges: edges2,
    inDeg,
    outDeg,
    pathStack: [],
    stage: '圈套圈遍历环 (2 -> 3 -> 4 -> 2)',
    decision: `节点 2 继续推进：连续沿 2 -> 3 -> 4 -> 2 完成回路扫描，图中所有边全部标记已访问`,
    message: `此时节点 2 已无任何可用出边，深搜递归开始到达最深基底准备归途弹栈`,
    log: `cycle traversed: 2-3-4-2`,
    codeLine: lines.recurseDFS,
    statusBadge: { text: '环路扫描完毕', type: 'warning' },
    metrics: { '当前顶点': 2, '已遍历边数': 4 },
  });

  // Step 3: 归途入栈逆序记录节点
  // 归途顺序：节点 2 无出边入栈，接着 4 入栈，接着 3 入栈，接着 2 入栈，最后 1 入栈
  // pathStack = [2, 4, 3, 2, 1]
  steps.push({
    nodes,
    edges: edges2,
    inDeg,
    outDeg,
    pathStack: [2, 4, 3, 2, 1],
    stage: '递归归途节点逐个压栈',
    decision: `DFS 递归返回：依次将 2, 4, 3, 2, 1 压入路径栈，弹栈逆序即可得到正向欧拉路径`,
    message: `归途压栈能够完美将深搜过程中提前完成的小环嵌套进主干路径中，形成圈套圈解`,
    log: `pushStack: 2 -> 4 -> 3 -> 2 -> 1`,
    codeLine: lines.pushStack,
    statusBadge: { text: '路径栈填充完成', type: 'info' },
    metrics: { '栈长度': 5, '栈顶元素': 1 },
  });

  // Step 4: 终态弹栈输出欧拉路径
  steps.push({
    nodes,
    edges: edges2,
    inDeg,
    outDeg,
    pathStack: [2, 4, 3, 2, 1],
    stage: '欧拉路径求解完成',
    decision: `🎉 欧拉路径构造完成：弹栈正向序列为 1 -> 2 -> 3 -> 4 -> 2`,
    message: `所有 4 条边恰好被精确经过一次，Hierholzer 结合当前弧优化达成 O(V + E) 线性极限性能`,
    log: `eulerian path: 1 -> 2 -> 3 -> 4 -> 2`,
    codeLine: lines.pushStack,
    statusBadge: { text: '输出路径: 1-2-3-4-2', type: 'success' },
    metrics: { '总步长': 4, '时间复杂度': 'O(V + E)', '状态': '求解完成' },
  });

  return steps;
}
