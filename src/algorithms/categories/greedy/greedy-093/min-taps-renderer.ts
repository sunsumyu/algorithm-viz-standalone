/**
 * 灌溉花园的最少水龙头数目 (LeetCode 1326) - 声明式教学级沙盘渲染器
 * 核心贪心：区间转换为右端点最远延伸 + 跳跃游戏模型
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import {
  TapInterval,
  MinTapsStep,
  buildMinTapsSteps,
} from '../../../../core/renderers/adapters/min-taps-093-step-compiler';

export type { TapInterval, MinTapsStep };
export { buildMinTapsSteps };

export const minTapsVisualizer = registerAlgorithm({
  id: 'minimum-number-of-taps-to-water-a-garden',
  name: '灌溉花园的最少水龙头数目',
  viewId: 'minimum-number-of-taps-to-water-a-garden',
  category: 'greedy',
  icon: '🚰',
  difficulty: 3,
  levelOrder: 932,
  aliases: ['class093-code02', 'min-taps-1326', 'leetcode-1326', 'min-taps', 'water-garden'],
  learningGoal: '掌握区间辐射模型转换为右边界跳跃最远延伸的贪心转化',
  description: '将水龙头覆盖区间规约为区间接力模型，求解覆盖花园的最少水龙头数目',
  template: `<div id="minimum-number-of-taps-to-water-a-garden" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerMinTaps(): void {
  // 保持向前兼容导出
}
