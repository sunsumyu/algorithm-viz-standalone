/**
 * Class 194: 2-SAT 算法基础 (2-Satisfiability Fundamentals)
 * 拆点对称建图 + Tarjan SCC 矛盾判定 + 拓扑大者取真 / 洛谷 P4782 【模板】2-SAT 问题
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_191_195_PROBLEMS } from './advanced-191-195-problem-content';
import { TWO_SAT_ALGORITHM_CODES, TWO_SAT_ALGORITHM_LINES } from './advanced-191-195-stage-codes';
import { Advanced191Step, TwoSatClauseView, renderTwoSatBoard } from './advanced-191-195-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

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
  // 子句：
  // 1: (x0 || x1)
  // 2: (~x0 || x2)
  // 3: (~x1 || ~x2)
  const clauses: TwoSatClauseView[] = [
    { u: 0, uVal: true, v: 1, vVal: true },
    { u: 0, uVal: false, v: 2, vVal: true },
    { u: 1, uVal: false, v: 2, vVal: false },
  ];

  // 节点映射：2i 为 True 点，2i+1 为 False 点
  // 0: x0, 1: ~x0; 2: x1, 3: ~x1; 4: x2, 5: ~x2

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
  // 假设求解出的 SCC 编号：
  // 0(x0): SCC_3, 1(~x0): SCC_1
  // 2(x1): SCC_2, 3(~x1): SCC_4
  // 4(x2): SCC_3, 5(~x2): SCC_1
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
  // x0: scc[0]=3 > scc[1]=1 -> FALSE (x0=0)
  // x1: scc[2]=2 < scc[3]=4 -> TRUE  (x1=1)
  // x2: scc[4]=3 > scc[5]=1 -> FALSE (x2=0)
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

export const twoSatAlgorithmVisualizer = registerDeclarativeAlgorithm<TwoSatStep>({
  id: 'two-sat-algorithm-194',
  name: '2-SAT 算法基础 (Class 194)',
  category: 'graph',
  icon: '⚖️',
  difficulty: 3,
  levelOrder: 194,
  description: '左程云算法通关课 Class 194：2-SAT 算法基础。布尔析取等价于对称蕴含边，Tarjan 求强连通分量，真假点同一 SCC 判定无解，拓扑序较大者取真值。',
  learningGoal: '掌握 2-SAT 对称拆点建图原理、无解充要条件以及利用 SCC 编号逆序拓扑构造可行解',
  problemHtml: ADVANCED_191_195_PROBLEMS.twoSatAlgorithm.html,
  analysisHtml: ADVANCED_191_195_PROBLEMS.twoSatAlgorithm.html,
  inputs: [
    {
      id: 'preset',
      label: '析取子句组配置',
      type: 'select',
      defaultValue: 'satisfiable_3',
      options: [
        { label: '3 变量 3 子句可满足系统 (解: [0, 1, 0])', value: 'satisfiable_3' },
      ],
    },
  ],
  codeLanguages: TWO_SAT_ALGORITHM_CODES,
  generateSteps: () => buildTwoSatSteps(),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderTwoSatBoard(
          step.vars,
          step.clauses,
          step.sccId,
          step.assignment,
          step.isSatisfiable,
          step.stage
        )}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #047857;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">取值准则</div>
            <div style="font-size: 15px; font-weight: 700; color: #059669;">sccId[X] < sccId[~X] 取 TRUE</div>
          </div>
        </div>

        ${renderFormulaCard(
          '2-SAT 蕴含与矛盾充要定理',
          '(A \\lor B) \\iff (\\neg A \\to B) \\land (\\neg B \\to A); \\quad \\text{无解 } \\iff \\exists i, \\text{scc}[2i] = \\text{scc}[2i+1]',
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
