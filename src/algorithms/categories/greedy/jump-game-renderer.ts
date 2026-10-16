/**
 * 跳跃游戏 II (Jump Game II · LeetCode 45)
 * 统一收敛至单一事实来源：src/algorithms/categories/greedy/greedy-093/jump-game-ii-renderer
 */

import { jumpGameIIVisualizer } from './greedy-093/jump-game-ii-renderer';
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

/**
 * 桥接导出已统合的唯一事实来源 Visualizer
 */
export const jumpGameVisualizer = jumpGameIIVisualizer;
export const Visualizer = jumpGameIIVisualizer;

export function registerJumpGame(): void {
  // 保持向前兼容导出
}
