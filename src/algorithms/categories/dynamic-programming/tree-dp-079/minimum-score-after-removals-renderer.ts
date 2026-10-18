/**
 * 从树中删除边的最小分数 (Minimum Score After Removals on a Tree / LeetCode 2322 / 左程云 Class 079 Code06)
 * 接入顶层抽象架构：YAML 模型 + TreeDpStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import { compileMinimumScoreAfterRemovals } from '../../../../core/strategies/tree-minimumscoreafterremovals';

export {
  compileMinimumScoreAfterRemovals,
  UniversalStageVisualizer,
  UniversalStageVisualizer as MinimumScoreAfterRemovalsVisualizer,
};

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'minimum-score-after-removals',
  name: '从树中删除边的最小分数 (LeetCode 2322)',
  viewId: 'minimum-score-after-removals',
  category: 'dynamic-programming',
  description: '左程云算法讲解079 Code06：LeetCode 2322 从树中删除边的最小分数。树型 DP 与拓扑关系判定经典技巧：先序遍历记录时间戳 DFN 序与子树规模 size，O(1) 判定被切除子树的包含与并列关系，O(n^2) 枚举断边方案求 3 独立连通块最小异或差值。',
  icon: '🪓',
  aliases: ['class079-code06', 'min-score-removals-2322', 'leetcode-2322'],
  template: '<div id="minimum-score-after-removals" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 7906,
  learningGoal: '深入掌握树型 DP 与 DFN 序拓扑关系判定：深刻理解边定向转子树切除、DFN 序区间包含判定定理，以及三连通块异或分解与全局极差最小化收敛机制。',
});
