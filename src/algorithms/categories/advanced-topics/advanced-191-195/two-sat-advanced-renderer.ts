/**
 * Class 195: 2-SAT 进阶应用与方案构造 (2-SAT Advanced Applications)
 * 前缀虚点优化“至多选一个” + 方案构造 / 洛谷 P6378 [PA2010] Riddles
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_191_195_PROBLEMS } from './advanced-191-195-problem-content';
import { TWO_SAT_ADVANCED_CODES, TWO_SAT_ADVANCED_LINES } from './advanced-191-195-stage-codes';
import { Advanced191Step, renderTwoSatAdvancedBoard } from './advanced-191-195-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

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
  // 假定外部条件约束 X4 与 X2 必须至少选一个，最终解选 X2=TRUE，其余 X1=FALSE, X3=FALSE, X4=FALSE (满足至多选一)
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

export const twoSatAdvancedVisualizer = registerDeclarativeAlgorithm<TwoSatAdvancedStep>({
  id: 'two-sat-advanced-195',
  name: '2-SAT 进阶应用与方案构造 (Class 195)',
  category: 'graph',
  icon: '👑',
  difficulty: 3,
  levelOrder: 195,
  description: '左程云算法通关课 Class 195：2-SAT 进阶应用与方案构造。前缀虚点链解决“至多选一个”排他约束，将 O(K^2) 降解为 O(K)，严密输出高阶无冲突布尔方案。',
  learningGoal: '掌握前缀优化 2-SAT 解决“至多/恰好选一个”的建模套路以及全局对称赋值的高阶技巧',
  problemHtml: ADVANCED_191_195_PROBLEMS.twoSatAdvanced.html,
  analysisHtml: ADVANCED_191_195_PROBLEMS.twoSatAdvanced.html,
  inputs: [
    {
      id: 'preset',
      label: '高阶约束系统预设',
      type: 'select',
      defaultValue: 'at_most_one_set',
      options: [
        { label: '4 变量，{X1, X2, X3} 至多选一个 (解: X2=1, 其它=0)', value: 'at_most_one_set' },
      ],
    },
  ],
  codeLanguages: TWO_SAT_ADVANCED_CODES,
  generateSteps: () => buildTwoSatAdvancedSteps(),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderTwoSatAdvancedBoard(
          step.vars,
          step.atMostOneSet,
          step.assignment,
          step.stage
        )}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #7c3aed;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">排他建模优化</div>
            <div style="font-size: 15px; font-weight: 700; color: #059669;">两两排他 O(K^2) => 前缀链 O(K)</div>
          </div>
        </div>

        ${renderFormulaCard(
          '前缀优化“至多选一个”核心逻辑',
          'X_i \\to \\text{pre}_i; \\quad \\text{pre}_{i-1} \\to \\text{pre}_i; \\quad X_i \\to \\neg \\text{pre}_{i-1} \\quad (O(K) \\text{ 边})',
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
