/**
 * 柠檬水摊贩·贪心收银大亨 (Lemonade Tycoon: Greedy Cashier Simulation)
 * 经典贪心算法、收银抽屉与万能零钱保留策略
 */

import { registerAlgorithm } from '../../../core/registry';
import {
  LemonadeTycoonVisualizer,
  LEMONADE_TYCOON_TEMPLATE,
  Customer,
} from './lemonade-tycoon-visualizer';

export {
  LemonadeTycoonVisualizer,
  LEMONADE_TYCOON_TEMPLATE,
  type Customer,
};

registerAlgorithm({
  id: 'lemonade-tycoon',
  name: '柠檬水摊贩·贪心收银大亨',
  viewId: 'algo-lemonade-tycoon-view',
  category: 'game',
  description: '经典贪心经营游戏：海滩柠檬水小摊、实时钞票抽屉、$20 找零贪心权衡与一键自动收银推演',
  icon: '🍹',
  template: LEMONADE_TYCOON_TEMPLATE,
  Visualizer: LemonadeTycoonVisualizer,
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '掌握贪心选择性质（Greedy Choice Property）在硬币找零与资源通用性权衡中的关键作用',
});
