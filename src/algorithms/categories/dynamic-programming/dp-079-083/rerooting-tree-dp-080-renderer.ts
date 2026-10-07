/**
 * Class 080: 换根 DP 专题 (Rerooting Tree DP) - 声明式沙盘渲染器
 * 两次 DFS 自底向上与自顶向下全树距离和 / LeetCode 834
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_079_083_PROBLEMS } from './dp-079-083-problem-content';
import { REROOTING_TREE_DP_080_CODES } from './dp-079-083-stage-codes';
import {
  buildRerooting080Steps,
  type Rerooting080Step,
  type Rerooting080Input,
} from '../../../../core/renderers/adapters/rerooting-tree-dp-080-step-compiler';
import { renderRerootingDpCanvas } from '../../../../core/renderers/adapters/rerooting-tree-dp-080-canvas-adapter';

export type { Rerooting080Step, Rerooting080Input };
export { buildRerooting080Steps };

export const rerootingTreeDp080Visualizer = registerDeclarativeAlgorithm<Rerooting080Step>({
  id: 'rerooting-tree-dp-080',
  name: '换根 DP 专题 (Class 080)',
  category: 'dynamic-programming',
  difficulty: 'hard',
  aliases: ['class080-rerooting-dp', 'rerooting-tree-dp', 'sum-of-distances-in-tree-834', 'leetcode-834'],
  problemContent: DP_079_083_PROBLEMS.rerootingDp080,
  sourceCodes: REROOTING_TREE_DP_080_CODES,
  generateSteps: buildRerooting080Steps,
  renderCanvas: (container, step) => {
    renderRerootingDpCanvas(container, step);
  },
});
