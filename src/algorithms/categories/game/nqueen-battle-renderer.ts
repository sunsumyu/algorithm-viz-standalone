/**
 * 国际象棋·N皇后巅峰对弈 (N-Queens Chess Battle & Backtracking Arena)
 * 经典回溯算法、激光攻击射线与 92 解全景画廊
 */

import { registerAlgorithm } from '../../../core/registry';
import {
  NQueenBattleVisualizer,
  NQUEEN_BATTLE_TEMPLATE,
  QueenPlacement,
} from './nqueen-battle-visualizer';

export {
  NQueenBattleVisualizer,
  NQUEEN_BATTLE_TEMPLATE,
  type QueenPlacement,
};

registerAlgorithm({
  id: 'nqueen-battle',
  name: '国际象棋·N皇后对弈',
  viewId: 'algo-nqueen-battle-view',
  category: 'game',
  description: '回溯算法棋盘游戏：放置皇后投射激光射线、人机对弈与 92 组解全景画廊速览',
  icon: '👑',
  template: NQUEEN_BATTLE_TEMPLATE,
  Visualizer: NQueenBattleVisualizer,
  difficulty: 3,
  levelOrder: 4,
  learningGoal: '透视约束满足问题（CSP）在对角线、行、列的剪枝原理与回溯算法状态空间搜索',
});
