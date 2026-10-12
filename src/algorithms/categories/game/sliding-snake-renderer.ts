/**
 * 贪吃蛇·滑动窗口大吞噬 (Sliding Window Snake: Dynamic Window Quest)
 * 经典滑动窗口算法、双指针单调收缩与 60 FPS 贪吃蛇身躯伸缩动画
 */

import { registerAlgorithm } from '../../../core/registry';
import {
  SlidingSnakeVisualizer,
  SLIDING_SNAKE_TEMPLATE,
} from './sliding-snake-visualizer';

// 向后兼容导出
export {
  SlidingSnakeVisualizer,
  SLIDING_SNAKE_TEMPLATE,
};

registerAlgorithm({
  id: 'sliding-snake',
  name: '贪吃蛇·滑动窗口大吞噬',
  viewId: 'algo-sliding-snake-view',
  category: 'game',
  description: '滑动窗口双指针游戏：赛博贪吃蛇身躯伸缩、符文排异机制、实时哈希映射与无重复最长子串求解',
  icon: '🐍',
  template: SLIDING_SNAKE_TEMPLATE,
  Visualizer: SlidingSnakeVisualizer,
  difficulty: 2,
  levelOrder: 10,
  learningGoal: '通过贪吃蛇身躯伸缩实战，彻底掌握滑动窗口右边界主动探索、左边界被动收缩与哈希去重的时空优化',
});
