/**
 * 弹簧鞋大冒险·跳跃覆盖范围 (Spring Jump Quest: Greedy Maximum Reach)
 * 经典贪心算法、动态最大覆盖光场与最少步数求解
 */

import { registerAlgorithm } from '../../../core/registry';
import {
  JumpQuestVisualizer,
  JUMP_QUEST_TEMPLATE,
  Platform,
} from './jump-quest-visualizer';

export {
  JumpQuestVisualizer,
  JUMP_QUEST_TEMPLATE,
  type Platform,
};

registerAlgorithm({
  id: 'jump-quest',
  name: '弹簧鞋大冒险·跳跃覆盖范围',
  viewId: 'algo-jump-quest-view',
  category: 'game',
  description: '跳跃游戏贪心算法：60 FPS 抛物线飞跃、动态最大覆盖光场辐射、最少跳跃步数求解与陷阱躲避',
  icon: '🦘',
  template: JUMP_QUEST_TEMPLATE,
  Visualizer: JumpQuestVisualizer,
  difficulty: 2,
  levelOrder: 13,
  learningGoal: '通过弹簧鞋平台飞跃，彻底掌握贪心算法如何通过维护最大覆盖范围（Max Reach）来替代复杂的递归与动规',
});
