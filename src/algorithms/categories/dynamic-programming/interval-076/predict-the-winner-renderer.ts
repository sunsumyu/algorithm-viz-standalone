/**
 * 预测赢家 (LeetCode 486 / 左程云 Class 076 Code02)
 * 接入顶层抽象架构：YAML 模型 + IntervalDpStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import {
  buildPredictTheWinnerSteps,
  parsePredictTheWinnerInputs,
} from '../../../../core/renderers/adapters/predict-the-winner-step-compiler';

export {
  buildPredictTheWinnerSteps,
  parsePredictTheWinnerInputs,
  UniversalStageVisualizer,
  UniversalStageVisualizer as PredictTheWinnerVisualizer,
};

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'predict-the-winner',
  name: '预测赢家 (Predict the Winner / 纸牌博弈)',
  viewId: 'predict-the-winner',
  category: 'dynamic-programming',
  description: '左程云算法讲解076 Code02：LeetCode 486 预测赢家/纸牌博弈，博弈论极小化极大区间动态规划。',
  icon: '🃏',
  aliases: ['class076-code02', 'predict-the-winner-486', 'leetcode-486', 'cards-in-line'],
  template: '<div id="predict-the-winner" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 486,
  learningGoal: '掌握博弈论双人轮流博弈的区间 DP 状态建模，理解 dp[i][j] 表示当前玩家在 [i, j] 区间能够获得的最大净胜分',
});
