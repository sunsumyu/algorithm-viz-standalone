/**
 * 部落冲突·战术攻防实战游戏 (Clash of Algorithms: High-Fidelity 2.5D Tactical Game & Algorithm Lab)
 * 深度算法教学实验室 + 2.5D 精细矢量策略游戏
 */

import { registerAlgorithm } from '../../../core/registry';
import {
  ClashOfAlgorithmsGameVisualizer,
  ClashOfAlgorithmsVisualizer,
  CLASH_GAME_TEMPLATE,
} from './clash-of-algorithms-visualizer';
import type {
  BuildingType,
  TroopType,
  HeuristicType,
  GameBuilding,
  GameTroop,
  Projectile,
  FloatingText,
  ParticleEffect,
  LightningStrikeEffect,
} from './clash-of-algorithms-visualizer';

export {
  ClashOfAlgorithmsGameVisualizer,
  ClashOfAlgorithmsVisualizer,
  CLASH_GAME_TEMPLATE,
};
export type {
  BuildingType,
  TroopType,
  HeuristicType,
  GameBuilding,
  GameTroop,
  Projectile,
  FloatingText,
  ParticleEffect,
  LightningStrikeEffect,
};

registerAlgorithm({
  id: 'clash-of-algorithms',
  name: '部落冲突·战术攻防沙盘',
  viewId: 'algo-clash-of-algorithms-view',
  category: 'game',
  description: '真交互即时策略游戏与算法实验室：调节城墙代价滑块、切换启发式函数、透视 A* 搜索热力图与算路打分',
  icon: '⚔️',
  template: CLASH_GAME_TEMPLATE,
  Visualizer: ClashOfAlgorithmsGameVisualizer,
  difficulty: 3,
  levelOrder: 1,
  learningGoal: '通过调节 A* 惩罚权重与启发式函数，亲自观察小兵在绕路与破墙之间的动态决策边界与搜索热力图展开',
});
