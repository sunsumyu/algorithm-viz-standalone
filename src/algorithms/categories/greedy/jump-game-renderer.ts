/**
 * 跳跃游戏 II (Jump Game II · LeetCode 45) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../core/registry';
import { UniversalStageVisualizer } from '../dynamic-programming/unique-paths-renderer';
import {
  JumpStep,
  JUMP_GAME_CODE_LINES,
  buildJumpGameSteps,
} from '../../../core/renderers/adapters/jump-game-step-compiler';
import {
  renderJumpGameCanvas,
} from '../../../core/renderers/adapters/jump-game-canvas-adapter';

export type { JumpStep };
export {
  JUMP_GAME_CODE_LINES,
  buildJumpGameSteps,
  renderJumpGameCanvas,
};

registerAlgorithm({
  id: 'jump-game',
  name: '跳跃游戏 II',
  viewId: 'jump-game',
  category: 'greedy',
  icon: '🦘',
  difficulty: 2,
  levelOrder: 6,
  learningGoal: '掌握跳跃游戏 II 中双边界推进与最小步数贪心触发机制',
  description: '求到达数组末尾的最少跳跃次数，触碰当前步覆盖边界即贪心跳跃',
  template: `<div id="jump-game" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerJumpGame(): void {
  // 保持向前兼容导出
}
