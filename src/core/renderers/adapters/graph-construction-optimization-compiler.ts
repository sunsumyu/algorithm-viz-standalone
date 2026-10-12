import {
  EBCC_CONSTRUCTION_LINES,
  VIRTUAL_NODES_LINES,
} from '../../../algorithms/categories/advanced-topics/advanced-191-195/advanced-191-195-stage-codes';
import { Advanced191Step } from '../../../algorithms/categories/advanced-topics/advanced-191-195/advanced-191-195-shared';

// ==========================================
// 1. Class 191: 边双缩点添边构造步进
// ==========================================
export interface EBCCConstructionStep extends Advanced191Step {
  bccs: number[];
  bccDegrees: Record<number, number>;
  leafBCCs: number[];
  addedEdges: { u: number; v: number }[];
  minAdded: number;
  stage: string;
}

export function buildEBCCConstructionSteps(): EBCCConstructionStep[] {
  const steps: EBCCConstructionStep[] = [];
  const lines = EBCC_CONSTRUCTION_LINES;

  const bccs = [1, 2, 3, 4];
  // 缩点树拓扑：中心为 2，连接三个叶子 1, 3, 4 (度数: deg[1]=1, deg[2]=3, deg[3]=1, deg[4]=1)
  // 叶子数 = 3，最少加边 = ceil(3 / 2) = 2

  // Step 0: 入口帧
  steps.push({
    bccs,
    bccDegrees: { 1: 0, 2: 0, 3: 0, 4: 0 },
    leafBCCs: [],
    addedEdges: [],
    minAdded: 0,
    stage: '原图初始化与 Tarjan 准备',
    decision: `主函数入口：开始计算使无向连通图变为边双连通图的最少加边数`,
    message: `首先运行 Tarjan 算法缩点，所有极大边双连通块缩为巨点，割边作为连接边重构为无向树`,
    log: `enter ebcc construction: n=7, m=7`,
    codeLine: lines.entry,
    metrics: { '缩点块数': 4, '目标': '消灭所有割边' },
  });

  // Step 1: Tarjan 缩点成树
  steps.push({
    bccs,
    bccDegrees: { 1: 0, 2: 0, 3: 0, 4: 0 },
    leafBCCs: [],
    addedEdges: [],
    minAdded: 0,
    stage: 'Tarjan 边双缩点成树',
    decision: `Tarjan 算法执行完毕：原图成功聚类为 4 个边双连通块，缩点图是一棵以 BCC_2 为中心的星形树`,
    message: `树中共有 3 条割边连接 (1-2), (2-3), (2-4)`,
    log: `tarjan completed: 4 bccs, 3 bridges`,
    codeLine: lines.tarjanEBCC,
    statusBadge: { text: '缩点成树完成', type: 'info' },
    metrics: { '缩点分量': 4, '割边数': 3 },
  });

  // Step 2: 统计各缩点块树上度数
  const bccDegrees = { 1: 1, 2: 3, 3: 1, 4: 1 };
  steps.push({
    bccs,
    bccDegrees,
    leafBCCs: [],
    addedEdges: [],
    minAdded: 0,
    stage: '统计割边在各 BCC 上的度数',
    decision: `遍历所有割边累加度数：deg[1]=1, deg[2]=3, deg[3]=1, deg[4]=1`,
    message: `度数为 1 的节点意味着其仅有一条桥通往外界，正是导致图脆弱的叶子瓶颈`,
    log: `degrees counted: deg[2]=3, others=1`,
    codeLine: lines.countDegree,
    statusBadge: { text: '度数统计完毕', type: 'info' },
    metrics: { '中心块度数': 3, '其它块度数': 1 },
  });

  // Step 3: 锁定叶子节点并计算最少加边数
  const leafBCCs = [1, 3, 4];
  const minAdded = Math.floor((leafBCCs.length + 1) / 2); // 2
  steps.push({
    bccs,
    bccDegrees,
    leafBCCs,
    addedEdges: [],
    minAdded,
    stage: '锁定叶子节点集合并套用定理',
    decision: `锁定度数等于 1 的叶子块：{BCC_1, BCC_3, BCC_4}，共 3 个叶子`,
    message: `应用叶子消除定理：最少需添加边数 = ceil(3 / 2) = 2 条边`,
    log: `leaves identified: [1, 3, 4], minAdded=2`,
    codeLine: lines.calcLeaves,
    statusBadge: { text: '最少需添 2 条边', type: 'warning' },
    metrics: { '叶子总数': 3, '最少添边': 2 },
  });

  // Step 4: 贪心交叉添边
  const addedEdges = [
    { u: 1, v: 3 },
    { u: 4, v: 2 },
  ];
  steps.push({
    bccs,
    bccDegrees,
    leafBCCs,
    addedEdges,
    minAdded,
    stage: '输出最优加边构造方案',
    decision: `构造连边：在 BCC_1 与 BCC_3 之间添加新边，在 BCC_4 与 BCC_2 之间添加新边`,
    message: `所有叶子均被大环包裹，整张树的割边被全量消除，任意两点间连通度提升至 2`,
    log: `added edges: (1-3) and (4-2)`,
    codeLine: lines.returnAns,
    statusBadge: { text: '全图变为边双连通', type: 'success' },
    metrics: { '添加边数': 2, '全图边双连通': '达成' },
  });

  // Step 5: 终态返回
  steps.push({
    bccs,
    bccDegrees,
    leafBCCs,
    addedEdges,
    minAdded,
    stage: '边双构造求解完成',
    decision: `🎉 边双连通图改造完成：最少只需添加 2 条边即可使全图无任何割边`,
    message: `该定理揭示了树形瓶颈消除的数学本质，时间复杂度严格等同于单次 Tarjan 遍历 O(V + E)`,
    log: `return minAdded: 2`,
    codeLine: lines.returnAns,
    statusBadge: { text: '答案: 2', type: 'success' },
    metrics: { '最终答案': 2, '算法复杂度': 'O(V + E)', '状态': '求解完成' },
  });

  return steps;
}

// ==========================================
// 2. Class 192: 虚点优化建图与虚拟源汇步进
// ==========================================
export interface VirtualNodesStep extends Advanced191Step {
  setA: number[];
  setB: number[];
  vMid: number;
  edgeCountOld: number;
  edgeCountNew: number;
  stage: string;
}

export function buildVirtualNodesSteps(): VirtualNodesStep[] {
  const steps: VirtualNodesStep[] = [];
  const lines = VIRTUAL_NODES_LINES;

  const setA = [1, 2, 3];
  const setB = [4, 5, 6, 7];
  const edgeCountOld = setA.length * setB.length; // 12
  const edgeCountNew = setA.length + setB.length; // 7

  // Step 0: 入口帧
  steps.push({
    setA,
    setB,
    vMid: 0,
    edgeCountOld,
    edgeCountNew: 0,
    stage: '集合连边需求分析',
    decision: `主函数入口：集合 Set A (3 个点) 需要向集合 Set B (4 个点) 全部连边`,
    message: `朴素完全二分连接需要 3 * 4 = 12 条有向边；在多次批量操作下极易导致边数超过上限`,
    log: `set A size=3, set B size=4, old edges=12`,
    codeLine: lines.entry,
    metrics: { 'Set A 大小': 3, 'Set B 大小': 4, '朴素边数': 12 },
  });

  // Step 1: 创建虚拟中转点 V_mid
  steps.push({
    setA,
    setB,
    vMid: 8,
    edgeCountOld,
    edgeCountNew: 0,
    stage: '创建虚拟辅助节点 V_8',
    decision: `执行 int vMid = ++totalNodes：在图中动态开辟一个虚拟中转节点 V_8`,
    message: `V_8 不对应现实中的实体，仅作为信息流动的高速汇聚与分发中继`,
    log: `created virtual node: vMid=8`,
    codeLine: lines.createVMid,
    statusBadge: { text: '创建中转虚点 V_8', type: 'info' },
    metrics: { '虚拟节点编号': 8, '角色': '全连边中转站' },
  });

  // Step 2: 集合 A 向虚点连边 (权重 0)
  steps.push({
    setA,
    setB,
    vMid: 8,
    edgeCountOld,
    edgeCountNew: 3,
    stage: 'Set A 统一汇聚至虚点 (3 条边)',
    decision: `建立流入边：A1 -> V_8, A2 -> V_8, A3 -> V_8，边权均为 0`,
    message: `只需 3 条边即可让 A 集合的全体势能无损汇流至虚拟中转站`,
    log: `linked set A -> vMid (3 edges)`,
    codeLine: lines.connectA,
    statusBadge: { text: 'Set A 流入边构建完成', type: 'warning' },
    metrics: { '已建边数': 3, '边类型': '无权流入' },
  });

  // Step 3: 虚点向集合 B 分发连边 (权重 w)
  steps.push({
    setA,
    setB,
    vMid: 8,
    edgeCountOld,
    edgeCountNew: 7,
    stage: '虚点统一分发至 Set B (4 条边)',
    decision: `建立流出边：V_8 分别向 B4, B5, B6, B7 连边，边权均为目标权值 w`,
    message: `只需 4 条边即可将中转站信息精准广播给整个目标集合`,
    log: `linked vMid -> set B (4 edges)`,
    codeLine: lines.connectB,
    statusBadge: { text: '虚点优化降维完成', type: 'success' },
    metrics: { '总建边数': 7, '节省边数': 5 },
  });

  // Step 4: 终态返回
  steps.push({
    setA,
    setB,
    vMid: 8,
    edgeCountOld,
    edgeCountNew: 7,
    stage: '建图优化完成',
    decision: `🎉 虚点优化建图完毕：成功将乘积级 12 条边降解为线性加和级 7 条边`,
    message: `若两个集合规模各为 1000，朴素建边达 1,000,000 条 (炸内存)，虚点优化仅需 2,000 条，性能提升千倍`,
    log: `virtual nodes construction finished: 12 -> 7 edges`,
    codeLine: lines.connectB,
    statusBadge: { text: '边数由乘法变加法', type: 'success' },
    metrics: { '朴素边数': 12, '优化边数': 7, '复杂度': 'O(|A| + |B|)' },
  });

  return steps;
}
