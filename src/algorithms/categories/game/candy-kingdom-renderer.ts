/**
 * 糖果王国·双向分配大派对 (Candy Kingdom: Two-Pass Greedy Feast)
 * 经典双向贪心算法、糖果堆叠物理与左右双向扫描透视
 */

import { registerAlgorithm } from '../../../core/registry';
import {
  CandyKingdomVisualizer,
  CANDY_KINGDOM_TEMPLATE,
  ChildNode,
} from './candy-kingdom-visualizer';

export {
  CandyKingdomVisualizer,
  CANDY_KINGDOM_TEMPLATE,
  type ChildNode,
};

registerAlgorithm({
  id: 'candy-kingdom',
  name: '糖果王国·双向分配大派对',
  viewId: 'algo-candy-kingdom-view',
  category: 'game',
  description: '双向贪心算法游戏：糖果堆叠物理、评分星标、正向与反向双光束扫描与峰谷全局最优分配',
  icon: '🍬',
  template: CANDY_KINGDOM_TEMPLATE,
  Visualizer: CandyKingdomVisualizer,
  difficulty: 3,
  levelOrder: 11,
  learningGoal: '掌握经典双向贪心算法如何通过拆解左右依赖，在两次 O(N) 线性遍历中解决局部峰谷最值分配问题',
});
