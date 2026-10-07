/**
 * 跳跃游戏 II (LeetCode 45) - 声明式教学级沙盘渲染器
 * 核心贪心：右边界分段推进与最远跳跃探测
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import {
  JumpGameIIStep,
  buildJumpGameIISteps,
} from '../../../../core/renderers/adapters/jump-game-ii-093-step-compiler';

export type { JumpGameIIStep };
export { buildJumpGameIISteps };

export const jumpGameIIVisualizer = registerAlgorithm({
  id: 'jump-game-ii',
  name: '跳跃游戏 II (Jump Game II)',
  viewId: 'jump-game-ii',
  category: 'greedy',
  icon: '🦘',
  difficulty: 2,
  levelOrder: 931,
  aliases: ['class093-code01', 'jump-game-ii-45', 'leetcode-45', 'jump-game-2'],
  learningGoal: '掌握分段推进右边界与下一步最远覆盖的贪心跳跃策略',
  description: '跳跃游戏 II (Jump Game II)：维护当前跳跃右边界 curEnd 与下一步最远覆盖 nextReach，触碰边界即贪心跳跃',
  template: `<div id="jump-game-ii" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerJumpGameII(): void {
  // 保持向前兼容导出
}
