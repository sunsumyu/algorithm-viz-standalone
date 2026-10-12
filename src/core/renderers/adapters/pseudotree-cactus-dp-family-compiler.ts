import {
  PSEUDOTREE_DP_LINES,
  CACTUS_GRAPH_DP_LINES,
} from '../../../algorithms/categories/advanced-topics/advanced-196-200/advanced-196-200-stage-codes';
import { Advanced196Step } from '../../../algorithms/categories/advanced-topics/advanced-196-200/advanced-196-200-shared';

// ==========================================
// Class 199: 基环树与基环树 DP
// ==========================================
export interface PseudotreeDPStep extends Advanced196Step {
  nodes: { id: number; val: number; degree: number; inCycle: boolean; dp0: number; dp1: number }[];
  cycleNodes: number[];
  brokenEdge: { u: number; v: number } | null;
  schemes: { planA: { forceNot: number; bestVal: number }; planB: { forceNot: number; bestVal: number } } | null;
  phase: string;
}

export function buildPseudotreeDPSteps(): PseudotreeDPStep[] {
  const steps: PseudotreeDPStep[] = [];
  const lines = PSEUDOTREE_DP_LINES;

  const initialNodes = [
    { id: 1, val: 10, degree: 3, inCycle: true, dp0: 0, dp1: 0 },
    { id: 2, val: 20, degree: 2, inCycle: true, dp0: 0, dp1: 0 },
    { id: 3, val: 15, degree: 2, inCycle: true, dp0: 0, dp1: 0 },
    { id: 4, val: 25, degree: 1, inCycle: false, dp0: 0, dp1: 0 },
  ];

  // Step 0: 入口帧
  steps.push({
    nodes: initialNodes,
    cycleNodes: [],
    brokenEdge: null,
    schemes: null,
    phase: '初始化基环树',
    decision: `主函数入口：开始求解基环树上的最大权独立集 (N=4 个节点，4 条边)`,
    message: `拓扑结构为一个由点 {1, 2, 3} 构成的 3 节点核心简单环，点 1 挂载着叶子外挂子树点 4`,
    log: `enter solvePseudotreeDP: n=4, m=4`,
    codeLine: lines.entry,
    metrics: { '图规模': 'N=4, M=4', '类型': '无向基环树' },
  });

  // Step 1: 拓扑排序剥除叶子找环
  steps.push({
    nodes: [
      { id: 1, val: 10, degree: 2, inCycle: true, dp0: 0, dp1: 0 },
      { id: 2, val: 20, degree: 2, inCycle: true, dp0: 0, dp1: 0 },
      { id: 3, val: 15, degree: 2, inCycle: true, dp0: 0, dp1: 0 },
      { id: 4, val: 25, degree: 0, inCycle: false, dp0: 0, dp1: 25 },
    ],
    cycleNodes: [1, 2, 3],
    brokenEdge: null,
    schemes: null,
    phase: '拓扑剥皮分离环与子树',
    decision: `运行拓扑剥皮：点 4 度数为 1，入队剥除；剩余点 {1, 2, 3} 入度均为 2，锁认为基环节点`,
    message: `成功提取出基环核心序列 [1, 2, 3]，树枝与环完美分离`,
    log: `topsort peel leaves completed: cycle = [1, 2, 3]`,
    codeLine: lines.findCycle,
    statusBadge: { text: '锁定核心环', type: 'info' },
    metrics: { '基环节点数': 3, '外挂子树根': '点 1' },
  });

  // Step 2: 外挂子树树形 DP
  steps.push({
    nodes: [
      { id: 1, val: 10, degree: 2, inCycle: true, dp0: 25, dp1: 10 },
      { id: 2, val: 20, degree: 2, inCycle: true, dp0: 0, dp1: 20 },
      { id: 3, val: 15, degree: 2, inCycle: true, dp0: 0, dp1: 15 },
      { id: 4, val: 25, degree: 0, inCycle: false, dp0: 0, dp1: 25 },
    ],
    cycleNodes: [1, 2, 3],
    brokenEdge: null,
    schemes: null,
    phase: '外挂子树树形 DP',
    decision: `对外挂子树进行树形 DP：点 1 不选时可累加子节点 4 的最大值 (dp0=25)，选点 1 时自身权值 10`,
    message: `纯环上节点 2、3 无额外子树，初始状态 dp0=0, dp1=val`,
    log: `tree dp on attached subtrees finished: node 1 dp0=25, dp1=10`,
    codeLine: lines.treeDP,
    statusBadge: { text: '子树 DP 完成', type: 'info' },
    metrics: { '点1-dp0': 25, '点1-dp1': 10 },
  });

  // Step 3: 破环成链 - 方案 1 (断开 (1, 2)，强制不选 1)
  steps.push({
    nodes: [
      { id: 1, val: 10, degree: 2, inCycle: true, dp0: 25, dp1: 10 },
      { id: 2, val: 20, degree: 2, inCycle: true, dp0: 0, dp1: 20 },
      { id: 3, val: 15, degree: 2, inCycle: true, dp0: 0, dp1: 15 },
      { id: 4, val: 25, degree: 0, inCycle: false, dp0: 0, dp1: 25 },
    ],
    cycleNodes: [1, 2, 3],
    brokenEdge: { u: 1, v: 2 },
    schemes: { planA: { forceNot: 1, bestVal: 45 }, planB: { forceNot: 2, bestVal: 0 } },
    phase: '断边方案 1 (强制不选点 1)',
    decision: `断开环边 (1, 2) 破环成链：强制不选点 1，点 1 贡献为其 dp0=25`,
    message: `链上其余部分求解：不选 1 则点 2 可选 (贡献 20)，点 3 与点 2 互斥不选，方案 1 权值 = 25 + 20 = 45`,
    log: `plan A: force not pick 1 -> max val = 45`,
    codeLine: lines.solvePlanA,
    statusBadge: { text: '方案 1 计算完成', type: 'warning' },
    metrics: { '方案1收益': 45, '强制限制': '不选点1' },
  });

  // Step 4: 破环成链 - 方案 2 (强制不选 2) 并汇总全局最优解
  steps.push({
    nodes: [
      { id: 1, val: 10, degree: 2, inCycle: true, dp0: 25, dp1: 10 },
      { id: 2, val: 20, degree: 2, inCycle: true, dp0: 0, dp1: 20 },
      { id: 3, val: 15, degree: 2, inCycle: true, dp0: 0, dp1: 15 },
      { id: 4, val: 25, degree: 0, inCycle: false, dp0: 0, dp1: 25 },
    ],
    cycleNodes: [1, 2, 3],
    brokenEdge: { u: 1, v: 2 },
    schemes: { planA: { forceNot: 1, bestVal: 45 }, planB: { forceNot: 2, bestVal: 40 } },
    phase: '断边方案 2 与取 max 汇总结算',
    decision: `方案 2：强制不选点 2，点 1 可根据子树独立选/不选最优，方案 2 收益为 40`,
    message: `比较两方案全局最大值：max(45, 40) = 45，成功求出基环树最大权独立集！`,
    log: `pseudotree dp completed: final answer = 45`,
    codeLine: lines.returnMax,
    statusBadge: { text: '全局最优达成', type: 'success' },
    metrics: { '全局最优': 45, '最优决策': '方案 1 (不选点1)' },
  });

  return steps;
}

// ==========================================
// Class 200: 仙人掌图与仙人掌 DP
// ==========================================
export interface CactusGraphDPStep extends Advanced196Step {
  dfsStates: { u: number; dfn: number; low: number; f: number }[];
  currentCycle: { nodes: number[]; len: number; cycleSeq: number[] } | null;
  monotonicQueue: { pos: number; val: number }[];
  globalDiameter: number;
  phase: string;
}

export function buildCactusGraphDPSteps(): CactusGraphDPStep[] {
  const steps: CactusGraphDPStep[] = [];
  const lines = CACTUS_GRAPH_DP_LINES;

  const baseStates = [
    { u: 1, dfn: 1, low: 1, f: 0 },
    { u: 2, dfn: 2, low: 2, f: 0 },
    { u: 3, dfn: 3, low: 3, f: 0 },
    { u: 4, dfn: 4, low: 4, f: 0 },
  ];

  // Step 0: 入口帧
  steps.push({
    dfsStates: [
      { u: 1, dfn: 0, low: 0, f: 0 },
      { u: 2, dfn: 0, low: 0, f: 0 },
      { u: 3, dfn: 0, low: 0, f: 0 },
      { u: 4, dfn: 0, low: 0, f: 0 },
    ],
    currentCycle: null,
    monotonicQueue: [],
    globalDiameter: 0,
    phase: '仙人掌图 DFS 初始化',
    decision: `主函数入口：开始求解仙人掌图的图上最长直径 (左神第 200 讲终极大课)`,
    message: `仙人掌图是每条边至多出现在一个简单环内的图；在 DFS 树上区分树枝边与返祖边进行环形分解`,
    log: `enter dfsCactus: root=1`,
    codeLine: lines.entry,
    metrics: { '课时编号': 'Class 200', '专题': '仙人掌图与圆方树DP' },
  });

  // Step 1: DFS 树枝边遍历与时间戳标记
  steps.push({
    dfsStates: baseStates,
    currentCycle: null,
    monotonicQueue: [],
    globalDiameter: 0,
    phase: 'DFS 遍历生成 DFS 树',
    decision: `从根节点 1 出发 DFS：访问 1 -> 2 -> 3 -> 4，标记各点 dfn 与 low 时间戳`,
    message: `当前树枝链长度 3，已为各点分配唯一的时间戳`,
    log: `dfs tree path: 1 -> 2 -> 3 -> 4, dfn assigned`,
    codeLine: lines.initDfn,
    statusBadge: { text: 'DFS 树构建中', type: 'info' },
    metrics: { '当前搜索深度': 4, '时间戳': 4 },
  });

  // Step 2: 发现返祖边构成简单环
  steps.push({
    dfsStates: [
      { u: 1, dfn: 1, low: 1, f: 0 },
      { u: 2, dfn: 2, low: 1, f: 0 },
      { u: 3, dfn: 3, low: 1, f: 0 },
      { u: 4, dfn: 4, low: 1, f: 0 },
    ],
    currentCycle: { nodes: [1, 2, 3, 4], len: 4, cycleSeq: [1, 2, 3, 4, 1, 2, 3, 4] },
    monotonicQueue: [],
    globalDiameter: 0,
    phase: '返祖边 (4, 1) 检测到简单环',
    decision: `节点 4 探测到返祖边向点 1 (dfn[1] < dfn[4])：检测到 4 元简单环 [1, 2, 3, 4]！`,
    message: `low[4] 回传更新为 dfn[1]=1，环根为点 1，准备倍长破环成链`,
    log: `back-edge detected from 4 to 1: cycle length = 4`,
    codeLine: lines.updateBack,
    statusBadge: { text: '锁定简单环', type: 'warning' },
    metrics: { '环长 L': 4, '环根': '点 1' },
  });

  // Step 3: 单调队列处理倍增环上两点最长距离
  steps.push({
    dfsStates: [
      { u: 1, dfn: 1, low: 1, f: 0 },
      { u: 2, dfn: 2, low: 1, f: 1 },
      { u: 3, dfn: 3, low: 1, f: 1 },
      { u: 4, dfn: 4, low: 1, f: 1 },
    ],
    currentCycle: { nodes: [1, 2, 3, 4], len: 4, cycleSeq: [1, 2, 3, 4, 1, 2, 3, 4] },
    monotonicQueue: [
      { pos: 1, val: 1 },
      { pos: 2, val: 2 },
    ],
    globalDiameter: 3,
    phase: '单调队列滑动窗口求解环上最长直径',
    decision: `单调队列优化：维护窗口大小 <= L/2 (2) 的最优转移点，滑动计算 f[i] + f[j] + (i - j) 最大值`,
    message: `在环内最远对径点间计算出最大路径贡献为 3，更新仙人掌全局直径 = 3`,
    log: `monotonic queue cycle DP: max dist in cycle = 3`,
    codeLine: lines.solveCycle,
    statusBadge: { text: '环形 DP 完成', type: 'info' },
    metrics: { '窗口大小': 2, '环上直径': 3 },
  });

  // Step 4: 环根向上汇报与仙人掌全局最优收官
  steps.push({
    dfsStates: [
      { u: 1, dfn: 1, low: 1, f: 2 },
      { u: 2, dfn: 2, low: 1, f: 1 },
      { u: 3, dfn: 3, low: 1, f: 1 },
      { u: 4, dfn: 4, low: 1, f: 1 },
    ],
    currentCycle: null,
    monotonicQueue: [],
    globalDiameter: 3,
    phase: '全局求解完成 (通关课 100~200 盛大圆满)',
    decision: `环根 1 汇总环内最长链向上回传 (f[1]=2)，仙人掌图全图直径最终锁定为 3！`,
    message: `左程云《算法通关课》Class 100 ~ 200 全套 101 门高阶算法课全景图谱至此全部完美通关！`,
    log: `cactus graph DP completed: global diameter = 3. ALL CLASSES 100-200 DONE!`,
    codeLine: lines.updateTree,
    statusBadge: { text: '第 200 讲终极通关', type: 'success' },
    metrics: { '仙人掌直径': 3, '课程进度': '100% 达成' },
  });

  return steps;
}
