/**
 * 深海声呐·二分探宝雷达 (Binary Search Sonar: Deep Ocean Probe)
 * 经典二分查找算法（LeetCode 704 & LeetCode 35）
 */

import { registerAlgorithm } from '../../../core/registry';
import {
  BinarySonarVisualizer,
  BINARY_SONAR_TEMPLATE,
  SonarAudio,
} from './binary-sonar-visualizer';
import type {
  TrenchSlot,
  SonarParticle,
  FloatingText,
} from './binary-sonar-visualizer';

export {
  BinarySonarVisualizer,
  BINARY_SONAR_TEMPLATE,
  SonarAudio,
};
export type {
  TrenchSlot,
  SonarParticle,
  FloatingText,
};

registerAlgorithm({
  id: 'binary-sonar',
  name: '深海声呐·二分探宝雷达',
  viewId: 'algo-binary-sonar-view',
  category: 'game',
  description: '二分查找探宝算法游戏：60 FPS 深海声呐扫描、左右区间折半缩减、中点探针雷达与对数复杂度探宝',
  icon: '📡',
  template: BINARY_SONAR_TEMPLATE,
  Visualizer: BinarySonarVisualizer,
  difficulty: 1,
  levelOrder: 19,
  learningGoal: '掌握二分查找经典双指针边界收缩（left <= right 与 left < right 循环不变量）、中点防溢出计算与 O(log N) 探宝机制',
});
