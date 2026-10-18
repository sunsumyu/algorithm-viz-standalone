/**
 * 我能赢吗 (Can I Win / LeetCode 464 / 左程云 Class 080 Code01)
 * 接入顶层抽象架构：YAML 模型 + BitmaskDpStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import { compileCanIWin } from '../../../../core/strategies/bitmask-caniwin';

export {
  compileCanIWin,
  UniversalStageVisualizer,
  UniversalStageVisualizer as CanIWinVisualizer,
};

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'can-i-win',
  name: '我能赢吗 (LeetCode 464)',
  viewId: 'can-i-win',
  category: 'dynamic-programming',
  description: '左程云算法讲解080 Code01：LeetCode 464 我能赢吗，经典状态压缩博弈论 DP：二进制掩码 status 记录可选数字集合，极大极小 (Minimax) 搜索与记忆化剪枝判断先手必胜。',
  icon: '🎲',
  aliases: ['class080-code01', 'class080-code03', 'can-i-win-464', 'leetcode-464'],
  template: '<div id="can-i-win" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 8001,
  learningGoal: '掌握状态压缩在博弈论决策树中的应用：二进制位掩码表示已选数字池，依据必胜转移与对手必败反转逻辑完成极小化极大记忆化搜索。',
});
