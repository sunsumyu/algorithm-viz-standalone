/**
 * Class 088: 树上背包 DP 与泛化物品优化 (Tree Knapsack DP)
 * 树形依赖选课问题与子树规模上下界剪枝 / 洛谷 P2014
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_084_088_PROBLEMS } from './dp-084-088-problem-content';
import { TREE_KNAPSACK_088_CODES } from './dp-084-088-stage-codes';
import {
  TreeKnapsack088Step,
  TreeKnapsack088Input,
  buildTreeKnapsack088Steps,
} from '../../../../core/renderers/adapters/tree-knapsack-dp-088-step-compiler';
import { treeKnapsackDp088CanvasAdapter } from '../../../../core/renderers/adapters/tree-knapsack-dp-088-canvas-adapter';

export type { TreeKnapsack088Step, TreeKnapsack088Input };
export { buildTreeKnapsack088Steps };

export const treeKnapsack088Visualizer = registerDeclarativeAlgorithm<TreeKnapsack088Step>({
  id: 'tree-knapsack-dp-088',
  name: '树上背包 DP 与泛化物品 (Class 088)',
  category: 'dynamic-programming',
  difficulty: 'hard',
  aliases: ['class088-tree-knapsack', 'tree-knapsack-dp', 'generalized-knapsack-on-tree', 'luogu-p2014'],
  problemContent: DP_084_088_PROBLEMS.treeKnapsack088,
  sourceCodes: TREE_KNAPSACK_088_CODES,
  generateSteps: buildTreeKnapsack088Steps,
  renderCanvas: (container, step) => treeKnapsackDp088CanvasAdapter.render(container, step),
});
