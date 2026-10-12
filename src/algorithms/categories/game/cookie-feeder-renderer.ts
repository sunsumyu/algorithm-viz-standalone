/**
 * 萌宠餐厅·饼干大派送 (Cookie Pets: Greedy Two-Pointer Feeder)
 * 经典双指针贪心算法、单调双序列匹配与咀嚼投喂动画
 */

import { registerAlgorithm } from '../../../core/registry';
import {
  CookieFeederVisualizer,
  COOKIE_FEEDER_TEMPLATE,
  Pet,
  CookieItem,
  FlyingCookie,
} from './cookie-feeder-visualizer';

export {
  CookieFeederVisualizer,
  COOKIE_FEEDER_TEMPLATE,
  type Pet,
  type CookieItem,
  type FlyingCookie,
};

registerAlgorithm({
  id: 'cookie-feeder',
  name: '萌宠餐厅·饼干大派送',
  viewId: 'algo-cookie-feeder-view',
  category: 'game',
  description: '双指针贪心算法游戏：萌宠餐厅、香脆饼干托盘、抛物线咀嚼投喂动画与双序列最优匹配',
  icon: '🍪',
  template: COOKIE_FEEDER_TEMPLATE,
  Visualizer: CookieFeederVisualizer,
  difficulty: 2,
  levelOrder: 8,
  learningGoal: '掌握双排序 + 双指针贪心算法在双序列容量与需求匹配中的核心应用',
});
