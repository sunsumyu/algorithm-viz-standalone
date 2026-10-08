/**
 * 跳跃游戏 I (Jump Game I · LeetCode 55) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../core/registry';
import { UniversalStageVisualizer } from '../dynamic-programming/unique-paths-renderer';
import {
  CanJumpStep,
  CAN_JUMP_CODE_LINES,
  canJumpSteps,
} from '../../../core/renderers/adapters/can-jump-step-compiler';
import {
  renderCanJumpCanvas,
} from '../../../core/renderers/adapters/can-jump-canvas-adapter';

export type { CanJumpStep };
export {
  CAN_JUMP_CODE_LINES,
  canJumpSteps,
  renderCanJumpCanvas,
};

registerAlgorithm({
  id: 'can-jump',
  name: '跳跃游戏 I',
  viewId: 'can-jump',
  category: 'greedy',
  icon: '🦘',
  difficulty: 2,
  levelOrder: 5,
  learningGoal: '理解贪心算法中覆盖范围（Cover Range）思想，避免陷入局部单步推导陷阱',
  description: '维护最大跳跃覆盖范围，贪心判断能否到达数组末尾',
  template: `<div id="can-jump" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerCanJump(): void {
  // 保持向前兼容导出
}
