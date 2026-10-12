/**
 * 时间折跃·星际航道区间合并 (Warp Gate: Interval Merge Fleet)
 * 经典贪心算法、星舰时空折跃与等离子融合透视
 */

import { registerAlgorithm } from '../../../core/registry';
import {
  IntervalItem,
  IntervalWarpVisualizer,
  INTERVAL_WARP_TEMPLATE,
} from './interval-warp-visualizer';

// 向后兼容导出
export type { IntervalItem };
export {
  IntervalWarpVisualizer,
  INTERVAL_WARP_TEMPLATE,
};

registerAlgorithm({
  id: 'interval-warp',
  name: '时间折跃·星际航道区间合并',
  viewId: 'algo-interval-warp-view',
  category: 'game',
  description: '区间贪心算法游戏：60 FPS 星舰折跃航道、时间轴刻度、等离子能量融合与最优航道生成',
  icon: '🛸',
  template: INTERVAL_WARP_TEMPLATE,
  Visualizer: IntervalWarpVisualizer,
  difficulty: 2,
  levelOrder: 15,
  learningGoal: '掌握经典区间重叠合并问题的排序与双端点贪心维护机制，理解相邻单调性对算法复杂度的降维威力',
});
