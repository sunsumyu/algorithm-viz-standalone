/**
 * Class 088: 树上背包 DP 与泛化物品优化 (Tree Knapsack DP)
 * 树形依赖选课问题与子树规模上下界剪枝 / 洛谷 P2014
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_084_088_PROBLEMS } from './dp-084-088-problem-content';
import { TREE_KNAPSACK_088_CODES, TREE_KNAPSACK_088_LINES } from './dp-084-088-stage-codes';
import { Dp084Step, renderTreeKnapsackBoard } from './dp-084-088-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface TreeKnapsack088Step extends Dp084Step {
  nodes: { id: number; score: number }[];
  m: number;
  curU: number;
  dpRow: number[];
}

export function buildTreeKnapsack088Steps(): TreeKnapsack088Step[] {
  const steps: TreeKnapsack088Step[] = [];
  const lines = TREE_KNAPSACK_088_LINES;

  const nodes = [
    { id: 0, score: 0 }, // 虚拟根
    { id: 1, score: 3 }, // 课 1
    { id: 2, score: 2 }, // 课 2 (前置课 1)
  ];
  const m = 2; // 最多选修 2 门真实课程（对应根节点容量 m+1=3）

  // Step 0: 入口
  steps.push({
    nodes,
    m,
    curU: 0,
    dpRow: [0, 0, 0, 0],
    decision: '主函数入口：准备在课程依赖树中选修最多 M=2 门课，最大化学分收益。',
    message: '创建虚拟超级根 0，将所有没有前置要求的课程连接至根节点 0。',
    log: 'enter courseSchedule: n=2, m=2',
    codeLine: lines.entry,
    metrics: { '课程数': 2, '选修上限': 2 },
  });

  // Step 1: 处理叶子节点 2 (学分 2)
  steps.push({
    nodes,
    m,
    curU: 2,
    dpRow: [0, 2, 0, 0],
    decision: 'DFS 处理节点 2：为叶子节点，容量为 1 时获得其自身学分 2 分。',
    message: 'dp[2][1] = 2，作为泛化物品打包向父节点 1 汇总。',
    log: 'leaf node 2: dp[2][1] = 2',
    codeLine: lines.pickSelf,
    statusBadge: { text: '处理课 2', type: 'info' },
    metrics: { '当前节点': 2, '学分': 2 },
  });

  // Step 2: 处理节点 1 并合并子节点 2
  // 选 1 门课: 只选课 1 -> 3
  // 选 2 门课: 选课 1 + 课 2 -> 3 + 2 = 5
  steps.push({
    nodes,
    m,
    curU: 1,
    dpRow: [0, 3, 5, 0],
    decision: 'DFS 处理节点 1：自身学分 3 分，与子树 2 做背包容量分配合并！',
    message: '修 1 门课学分为 3；修 2 门课（同时修读课 1 和课 2）学分累加为 3 + 2 = 5 分！',
    log: 'node 1 merge child 2: dp[1][1]=3, dp[1][2]=5',
    codeLine: lines.mergeChild,
    statusBadge: { text: '节点 1 合并完成', type: 'info' },
    metrics: { '当前节点': 1, '修 2 门课学分': 5 },
  });

  // Step 3: 虚拟根汇总并返回
  steps.push({
    nodes,
    m,
    curU: 0,
    dpRow: [0, 0, 3, 5],
    decision: '虚拟根 0 汇总终结：最多选修 M=2 门课程所能获得的最大学分为 5 分！',
    message: '树上背包借助子树规模剪枝，保证了紧致的 O(N * M) 复杂度。',
    log: 'courseSchedule complete -> return 5',
    codeLine: lines.returnMax,
    statusBadge: { text: '最大学分: 5', type: 'success' },
    metrics: { '最大学分': 5, '时间复杂度': 'O(N * M)' },
  });

  return steps;
}

export const treeKnapsack088Visualizer = registerDeclarativeAlgorithm<TreeKnapsack088Step>({
  id: 'tree-knapsack-dp-088',
  name: '树上背包 DP 与泛化物品 (Class 088)',
  category: 'dynamic-programming',
  difficulty: 'hard',
  problemContent: DP_084_088_PROBLEMS.treeKnapsack088,
  sourceCodes: TREE_KNAPSACK_088_CODES,
  generateSteps: buildTreeKnapsack088Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderTreeKnapsackBoard(
          step.nodes,
          step.m,
          step.curU,
          step.dpRow
        )}
        ${renderFormulaCard(
          '树上背包泛化物品合并方程',
          'dp[u][j] = \\max_{0 \\le k < j} \\{ dp[u][j - k] + dp[v][k] \\}',
          '将每棵子树抽象为一个权值随占用体积变化的泛化物品。先强制扣除根节点自身的占用体积（保证拓扑依赖合规），剩余容量以分组背包的形式在各子树间进行最优资源切分。'
        )}
      </div>
    `;
  },
});
