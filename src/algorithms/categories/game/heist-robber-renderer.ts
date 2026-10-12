/**
 * 暗夜神偷·街区金库潜行 (Cyberpunk House Robber: Heist DP)
 * 经典动态规划算法（LeetCode 198 打家劫舍 & LeetCode 213 环形打家劫舍）
 */

import { registerAlgorithm } from '../../../core/registry';
import {
  HeistRobberVisualizer,
  HEIST_ROBBER_TEMPLATE,
  HeistAudio,
} from './heist-robber-visualizer';
import type {
  HouseItem,
  CoinParticle,
  FloatingText,
} from './heist-robber-visualizer';

export {
  HeistRobberVisualizer,
  HEIST_ROBBER_TEMPLATE,
  HeistAudio,
};
export type {
  HouseItem,
  CoinParticle,
  FloatingText,
};

registerAlgorithm({
  id: 'heist-robber',
  name: '暗夜神偷·街区金库潜行',
  viewId: 'algo-heist-robber-view',
  category: 'game',
  description: '动态规划潜行算法游戏：60 FPS 赛博街区夜景、金库别墅激光警报、实时 DP 状态机与最优潜行决策',
  icon: '🥷',
  template: HEIST_ROBBER_TEMPLATE,
  Visualizer: HeistRobberVisualizer,
  difficulty: 2,
  levelOrder: 17,
  learningGoal: '掌握动态规划状态转移方程 dp[i] = max(dp[i-1], dp[i-2] + nums[i]) 的物理含义与二选一无后效性推导',
});
