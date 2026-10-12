/**
 * 背包商人·地牢探险 (Knapsack Dungeon: Action DP Crawler)
 * 具备真正游戏性、即时动作战斗与暗黑风格背包的 60 FPS 地牢探险游戏
 */

import { registerAlgorithm } from '../../../core/registry';
import {
  KnapsackDungeonVisualizer,
  KNAPSACK_DUNGEON_TEMPLATE,
  DUNGEON_FLOORS,
  DungeonAudio,
} from './knapsack-dungeon-visualizer';
import type {
  DungeonItem,
  BossEntity,
  HeroEntity,
  AttackSlash,
  FloatingNumber,
  DungeonFloor,
} from './knapsack-dungeon-visualizer';

export {
  KnapsackDungeonVisualizer,
  KNAPSACK_DUNGEON_TEMPLATE,
  DUNGEON_FLOORS,
  DungeonAudio,
};
export type {
  DungeonItem,
  BossEntity,
  HeroEntity,
  AttackSlash,
  FloatingNumber,
  DungeonFloor,
};

registerAlgorithm({
  id: 'knapsack-dungeon',
  name: '背包商人·地牢探险',
  viewId: 'algo-knapsack-dungeon-view',
  category: 'game',
  description: '真动作即时战斗与背包规划游戏：60 FPS 走位挥砍、红圈躲避、暗黑式背包配装、大战地牢守关魔王',
  icon: '🎒',
  template: KNAPSACK_DUNGEON_TEMPLATE,
  Visualizer: KnapsackDungeonVisualizer,
  difficulty: 3,
  levelOrder: 2,
  learningGoal: '通过即时地牢动作走位、装备负重权衡与 Boss 决战，彻底掌握 0-1 背包与完全背包的最优子结构',
});
