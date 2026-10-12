/**
 * 穿云神箭·极光引爆重叠气球 (Arrow Balloon Sniper: Greedy Interval Burst)
 * 经典贪心区间选点算法（LeetCode 452 & LeetCode 435）
 */

import { registerAlgorithm } from '../../../core/registry';
import {
  ArrowBalloonVisualizer,
  ARROW_BALLOON_TEMPLATE,
  ArrowBalloonAudio,
} from './arrow-balloon-visualizer';
import type {
  BalloonItem,
  Particle,
  FloatingText,
  LaserShot,
} from './arrow-balloon-visualizer';

export {
  ArrowBalloonVisualizer,
  ARROW_BALLOON_TEMPLATE,
  ArrowBalloonAudio,
};
export type {
  BalloonItem,
  Particle,
  FloatingText,
  LaserShot,
};

registerAlgorithm({
  id: 'arrow-balloon',
  name: '穿云神箭·极光引爆重叠气球',
  viewId: 'algo-arrow-balloon-view',
  category: 'game',
  description: '极光穿透射击贪心算法游戏：60 FPS 悬浮霓虹气球、X轴激光重叠引爆、贪心右边界排序与一键神箭破敌',
  icon: '🎯',
  template: ARROW_BALLOON_TEMPLATE,
  Visualizer: ArrowBalloonVisualizer,
  difficulty: 2,
  levelOrder: 16,
  learningGoal: '掌握贪心区间选点与无重叠区间核心思想：按右端点升序排序、射点贪心逼近局部重叠右界以覆盖最大区间群',
});
