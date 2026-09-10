/**
 * Class 199: 基环树与基环树 DP (Pseudotree DP)
 * 拓扑剥皮找环 + 子树树形 DP + 环上破环成链 / 洛谷 P1453 骑士 / 最大权独立集
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_196_200_PROBLEMS } from './advanced-196-200-problem-content';
import { PSEUDOTREE_DP_CODES, PSEUDOTREE_DP_LINES } from './advanced-196-200-stage-codes';
import { Advanced196Step, renderPseudotreeDPBoard } from './advanced-196-200-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

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

export const pseudotreeDPVisualizer = registerDeclarativeAlgorithm<PseudotreeDPStep>({
  id: 'pseudotree-dp-199',
  name: '基环树与基环树 DP (Class 199)',
  category: 'tree',
  difficulty: 'hard',
  problemContent: ADVANCED_196_200_PROBLEMS.pseudotreeDP,
  sourceCodes: PSEUDOTREE_DP_CODES,
  generateSteps: buildPseudotreeDPSteps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderPseudotreeDPBoard(
          step.nodes,
          step.cycleNodes,
          step.brokenEdge,
          step.schemes,
          step.phase
        )}
        ${renderFormulaCard(
          '基环树最大权独立集断边破环定理',
          '\\text{Ans} = \\max\\Big( \\text{DP}_{\\text{chain}}(\\text{forceNot } u), \\; \\text{DP}_{\\text{chain}}(\\text{forceNot } v) \\Big)',
          '环上相邻两点 $u, v$ 必然不能同时被选中，因此断开边 $(u, v)$ 破坏环形约束后，分别强制 $u$ 不选或 $v$ 不选，即可覆盖所有合法最优配置。'
        )}
      </div>
    `;
  },
});
