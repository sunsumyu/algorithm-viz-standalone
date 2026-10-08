/**
 * 分发糖果 (Candy · LeetCode 135) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../core/registry';
import { UniversalStageVisualizer } from '../dynamic-programming/unique-paths-renderer';
import {
  CandyStep,
  CANDY_CODE_LINES,
  buildCandySteps,
} from '../../../core/renderers/adapters/candy-step-compiler';
import {
  renderCandyCanvas,
} from '../../../core/renderers/adapters/candy-canvas-adapter';

export type { CandyStep };
export {
  CANDY_CODE_LINES,
  buildCandySteps,
  renderCandyCanvas,
};

registerAlgorithm({
  id: 'candy',
  name: '分发糖果',
  viewId: 'candy',
  category: 'greedy',
  icon: '🍬',
  difficulty: 3,
  levelOrder: 9,
  learningGoal: '掌握双向两次贪心求解范式，学会将双边相邻约束拆解为单向独立推导并取 max 融合',
  description: '相邻两个孩子评分更高者糖果更多，拆解为左右两次单向贪心遍历求解最少糖果总数',
  template: `<div id="candy" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerCandy(): void {
  // 保持向前兼容导出
}
