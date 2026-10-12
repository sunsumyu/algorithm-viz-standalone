import {
  TWO_SAT_ALGORITHM_LINES,
  TWO_SAT_ADVANCED_LINES,
} from '../../../algorithms/categories/advanced-topics/advanced-191-195/advanced-191-195-stage-codes';
import {
  Advanced191Step,
  TwoSatClauseView,
} from '../../../algorithms/categories/advanced-topics/advanced-191-195/advanced-191-195-shared';

// ==========================================
// 1. Class 194: 2-SAT 基础步进契约与推演
// ==========================================
export interface TwoSatStep extends Advanced191Step {
  vars: number[];
  clauses: TwoSatClauseView[];
  sccId: Record<number, number>;
  assignment: Record<number, boolean>;
  isSatisfiable: boolean;
  stage: string;
}

export function buildTwoSatSteps(): TwoSatStep[] {
  const steps: TwoSatStep[] = [];
  const lines = TWO_SAT_ALGORITHM_LINES;

  const vars = [0, 1, 2]; // 3 个布尔变量: x0, x1, x2
  const clauses: TwoSatClauseView[] = [
    { u: 0, uVal: true, v: 1, vVal: true },
    { u: 0, uVal: false, v: 2, vVal: true },
    { u: 1, uVal: false, v: 2, vVal: false },
  ];

  // Step 0: 入口帧
  steps.push({
    vars,
    clauses,
    sccId: {},
    assignment: {},
    isSatisfiable: true,
    stage: '2-SAT 问题与析取子句输入',
    decision: `主函数入口：开始求解 3 个布尔变量 (x0, x1, x2) 在 3 条析取约束下的 2-SAT 赋值`,
    message: `析取条件 A or B 等价于对称蕴含式：~A -> B 且 ~B -> A，每个变量拆分为真节点与假节点`,
    log: `enter 2-sat: 3 vars, 3 clauses`,
    codeLine: lines.entry,
    metrics: { '变量数': 3, '子句数': 3, '图节点数': 6 },
  });

  // Step 1: 建立对称蕴含有向边
  steps.push({
    vars,
    clauses,
    sccId: {},
    assignment: {},
    isSatisfiable: true,
    stage: '构建对称蕴含有向图',
    decision: `添加蕴含边：(~x0 -> x1, ~x1 -> x0), (x0 -> x2, ~x2 -> ~x0), (x1 -> ~x2, x2 -> ~x1)`,
    message: `共生成 6 条有向蕴含边，逻辑链条闭环形成有向图`,
    log: `clauses converted to 6 implication edges`,
    codeLine: lines.addClauses,
    statusBadge: { text: '6 条蕴含边构建完成', type: 'info' },
    metrics: { '有向边数': 6, '对称性': '完全对称' },
  });

  // Step 2: 运行 Tarjan 强连通分量分解
  const sccId: Record<number, number> = {
    0: 3, 1: 1,
    2: 2, 3: 4,
    4: 3, 5: 1,
  };
  steps.push({
    vars,
    clauses,
    sccId,
    assignment: {},
    isSatisfiable: true,
    stage: 'Tarjan 求解强连通分量 (SCC)',
    decision: `Tarjan 算法执行完成：6 个节点被划分为若干强连通分量，计算出每个节点的 sccId`,
    message: `同分量意味着两者可以互相推导，真假状态必须完全相同`,
    log: `tarjan scc calculated for all 6 literal nodes`,
    codeLine: lines.tarjanRun,
    statusBadge: { text: 'SCC 划分完成', type: 'info' },
    metrics: { '分量数': 4, '算法': 'Tarjan' },
  });

  // Step 3: 检查矛盾性 (scc[2i] == scc[2i+1])
  steps.push({
    vars,
    clauses,
    sccId,
    assignment: {},
    isSatisfiable: true,
    stage: '矛盾性检测 (是否有 x 与 ~x 处于同一 SCC)',
    decision: `矛盾性校验：x0(3 vs 1), x1(2 vs 4), x2(3 vs 1)，均满足 scc[x] != scc[~x]`,
    message: `没有任何一个变量的真点与假点能够相互推导，证明本 2-SAT 问题必定有解！`,
    log: `conflict check passed: no variable has same scc for true and false`,
    codeLine: lines.conflictCheck,
    statusBadge: { text: '无矛盾，必有解', type: 'success' },
    metrics: { '矛盾检测': '无冲突', '判定': '可满足 (POSSIBLE)' },
  });

  // Step 4: 拓扑排序逆序选真值赋值 (scc[2i] < scc[2i+1] 为真)
  const assignment: Record<number, boolean> = {
    0: false,
    1: true,
    2: false,
  };
  steps.push({
    vars,
    clauses,
    sccId,
    assignment,
    isSatisfiable: true,
    stage: '构造可行解赋值 (拓扑序较大者取真)',
    decision: `由于 Tarjan 出栈编号逆序即为拓扑序，拓扑序较大者（即 sccId 较小者）不会导致矛盾推导：`,
    message: `成功赋值：x0 = FALSE (0), x1 = TRUE (1), x2 = FALSE (0)`,
    log: `assignment constructed: x0=0, x1=1, x2=0`,
    codeLine: lines.assignTrue,
    statusBadge: { text: '解构造: [0, 1, 0]', type: 'success' },
    metrics: { 'x0': 'FALSE', 'x1': 'TRUE', 'x2': 'FALSE' },
  });

  // Step 5: 验证子句满足并返回
  steps.push({
    vars,
    clauses,
    sccId,
    assignment,
    isSatisfiable: true,
    stage: '2-SAT 求解完成',
    decision: `🎉 2-SAT 全流程结束：全部 3 个子句在赋值 [0, 1, 0] 下全部为 TRUE！`,
    message: `2-SAT 将逻辑布尔满足性巧妙降维为有向图强连通与拓扑序，时间复杂度稳定在 O(N + M) 线性极限`,
    log: `2-sat satisfied: assignment=[0, 1, 0]`,
    codeLine: lines.assignTrue,
    statusBadge: { text: '可满足求解完成', type: 'success' },
    metrics: { '最终结果': 'POSSIBLE', '解': '[0, 1, 0]', '状态': '求解完成' },
  });

  return steps;
}

// ==========================================
// 2. Class 195: 2-SAT 进阶步进契约与推演
// ==========================================
export interface TwoSatAdvancedStep extends Advanced191Step {
  vars: number[];
  atMostOneSet: number[];
  assignment: Record<number, boolean>;
  stage: string;
}

export function buildTwoSatAdvancedSteps(): TwoSatAdvancedStep[] {
  const steps: TwoSatAdvancedStep[] = [];
  const lines = TWO_SAT_ADVANCED_LINES;

  const vars = [1, 2, 3, 4];
  const atMostOneSet = [1, 2, 3]; // 集合 {X1, X2, X3} 至多选一个

  // Step 0: 入口帧
  steps.push({
    vars,
    atMostOneSet,
    assignment: { 1: false, 2: false, 3: false, 4: false },
    stage: '高阶 2-SAT 约束分析',
    decision: `主函数入口：处理包含高阶约束的 2-SAT 问题，其中子集 {X1, X2, X3} 满足“至多选一个”`,
    message: `如果两两连排他边，边数将是 O(K^2)；当子集极大时必炸空间。采用前缀虚点链仅需 O(K) 线性建图`,
    log: `enter 2-sat advanced: at-most-one for {1, 2, 3}`,
    codeLine: lines.entry,
    metrics: { '变量数': 4, '排他集合大小': 3, '朴素二次方边': 6 },
  });

  // Step 1: 建立前缀虚变量 Pre_1, Pre_2, Pre_3
  steps.push({
    vars,
    atMostOneSet,
    assignment: { 1: false, 2: false, 3: false, 4: false },
    stage: '创建前缀辅助布尔变量 pre[0..2]',
    decision: `执行 int[] pre = new int[k]：在 2-SAT 图中建立 3 个前缀布尔变量`,
    message: `pre[i] 为真表示“前缀 [0..i] 中至少有一个变量为真”`,
    log: `created 3 prefix boolean variables`,
    codeLine: lines.initPre,
    statusBadge: { text: '前缀虚变量建立', type: 'info' },
    metrics: { '虚变量个数': 3, '类型': '布尔状态承载' },
  });

  // Step 2: 建立原变量向虚变量的蕴含边 (X_i -> Pre_i)
  steps.push({
    vars,
    atMostOneSet,
    assignment: { 1: false, 2: false, 3: false, 4: false },
    stage: '原变量推导前缀变量 (X_i -> Pre_i)',
    decision: `连边 X1 -> Pre1, X2 -> Pre2, X3 -> Pre3 (及其逆否对称边 ~Pre_i -> ~X_i)`,
    message: `一旦某个变量为真，其对应的前缀指示变量自动为真`,
    log: `added implications: X_i -> Pre_i and ~Pre_i -> ~X_i`,
    codeLine: lines.implyPre,
    statusBadge: { text: '完成原点向虚点投射', type: 'warning' },
    metrics: { '蕴含边数': 3, '对称逆否边数': 3 },
  });

  // Step 3: 前缀单向传递与排他逆否闭环
  steps.push({
    vars,
    atMostOneSet,
    assignment: { 1: false, 2: false, 3: false, 4: false },
    stage: '前缀传递与排他约束 (Pre_{i-1} -> Pre_i & X_i -> ~Pre_{i-1})',
    decision: `连边 Pre1 -> Pre2, Pre2 -> Pre3，并添加排他约束：X_i -> ~Pre_{i-1}`,
    message: `若 X_i 为真，则它之前的前缀 Pre_{i-1} 必须为假，即前缀 [0..i-1] 中绝不能有任何其他元素为真！`,
    log: `added mutex implication: X_i -> ~Pre_{i-1}`,
    codeLine: lines.mutexImply,
    statusBadge: { text: '排他链条闭合', type: 'info' },
    metrics: { '排他约束': '线性 O(K)', '总建边': 10 },
  });

  // Step 4: Tarjan 求解并构造全局最优方案
  const finalAssignment: Record<number, boolean> = {
    1: false,
    2: true,
    3: false,
    4: false,
  };
  steps.push({
    vars,
    atMostOneSet,
    assignment: finalAssignment,
    stage: 'Tarjan 求解与方案生成',
    decision: `Tarjan 缩点检验无矛盾，依据拓扑序求出唯一相容布尔方案：X2 = TRUE，其余 X1, X3, X4 均为 FALSE`,
    message: `排他组 {X1, X2, X3} 仅选中 X2 一个，完美符合“至多选一个”的限定！`,
    log: `tarjan solved: X1=0, X2=1, X3=0, X4=0`,
    codeLine: lines.entry,
    statusBadge: { text: '至多选一个达成', type: 'success' },
    metrics: { 'X1': 'FALSE', 'X2': 'TRUE', 'X3': 'FALSE', 'X4': 'FALSE' },
  });

  // Step 5: 终态完成
  steps.push({
    vars,
    atMostOneSet,
    assignment: finalAssignment,
    stage: '高阶 2-SAT 求解完成',
    decision: `🎉 2-SAT 进阶应用求解完成：所有高阶排他与命题约束全部在 O(N + M) 线性时间完美满足`,
    message: `前缀优化将复杂的高维 SAT 问题降维打击，是信息学竞赛与工业级布尔求解器 (SAT Solver) 的基石算法`,
    log: `2-sat advanced finished: valid global assignment`,
    codeLine: lines.entry,
    statusBadge: { text: '方案全局一致', type: 'success' },
    metrics: { '满足状态': '完全满足', '时间复杂度': 'O(N + M)', '状态': '求解完成' },
  });

  return steps;
}
