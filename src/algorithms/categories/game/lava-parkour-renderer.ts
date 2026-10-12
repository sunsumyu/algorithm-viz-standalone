/**
 * 熔岩跑酷·单调栈跳跃者 (Monotonic Stack Lava Parkour)
 * 沉浸式 60 FPS 物理跑酷、单调栈推演与动态熔岩躲避
 */

import { registerAlgorithm } from '../../../core/registry';
import {
  LavaParkourVisualizer,
  LAVA_PARKOUR_TEMPLATE,
  Pillar,
} from './lava-parkour-visualizer';

export {
  LavaParkourVisualizer,
  LAVA_PARKOUR_TEMPLATE,
  type Pillar,
};

registerAlgorithm({
  id: 'lava-parkour',
  name: '熔岩跑酷·单调栈跳跃者',
  viewId: 'algo-lava-parkour-view',
  category: 'game',
  description: '单调栈物理跑酷游戏：60 FPS 抛物线跳跃、动态熔岩上涨躲避、实时单调递减栈透视与下一个更大元素求解',
  icon: '🌋',
  template: LAVA_PARKOUR_TEMPLATE,
  Visualizer: LavaParkourVisualizer,
  difficulty: 3,
  levelOrder: 5,
  learningGoal: '通过熔岩逃逸飞跃实战，彻底掌握单调递减栈的入栈、出栈与下一个更大元素（NGE）计算规律',
});
