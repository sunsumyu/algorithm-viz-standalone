/**
 * 火柴拼正方形 (Matchsticks to Square / LeetCode 473 / 左程云 Class 080 Code02)
 * 接入顶层抽象架构：YAML 模型 + BitmaskDpStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import { compileMatchsticks } from '../../../../core/strategies/bitmask-matchsticks';

export {
  compileMatchsticks,
  UniversalStageVisualizer,
  UniversalStageVisualizer as MatchsticksToSquareVisualizer,
};

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'matchsticks-to-square',
  name: '火柴拼正方形 (LeetCode 473)',
  viewId: 'matchsticks-to-square',
  category: 'dynamic-programming',
  description: '左程云算法讲解080 Code02：LeetCode 473 火柴拼正方形，状压DP与子集和划分，将火柴等分至4条等长边。二进制掩码状态压缩与前置贪心剪枝。',
  icon: '🔥',
  aliases: ['class080-code02', 'class080-code02-ext', 'matchsticks-to-square-473', 'leetcode-473'],
  template: '<div id="matchsticks-to-square" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 8002,
  learningGoal: '掌握状态压缩回溯在子集均分装箱问题中的应用：位掩码标记已用火柴集合，配合降序贪心与记忆化表剪枝提升搜索效率。',
});
