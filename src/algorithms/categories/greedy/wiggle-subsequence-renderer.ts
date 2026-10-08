/**
 * 摆动序列 (Wiggle Subsequence · LeetCode 376) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../core/registry';
import { UniversalStageVisualizer } from '../dynamic-programming/unique-paths-renderer';
import {
  WiggleStep,
  WIGGLE_SUBSEQUENCE_CODE_LINES,
  wiggleSubsequenceSteps,
} from '../../../core/renderers/adapters/wiggle-subsequence-step-compiler';
import {
  renderWiggleSubsequenceCanvas,
} from '../../../core/renderers/adapters/wiggle-subsequence-canvas-adapter';

export type { WiggleStep };
export {
  WIGGLE_SUBSEQUENCE_CODE_LINES,
  wiggleSubsequenceSteps,
  renderWiggleSubsequenceCanvas,
};

registerAlgorithm({
  id: 'wiggle-subsequence',
  name: '摆动序列',
  viewId: 'wiggle-subsequence',
  category: 'greedy',
  icon: '〰️',
  difficulty: 2,
  levelOrder: 2,
  learningGoal: '掌握贪心算法在波形折线分析中的局部最优（保留峰谷）到全局最长的转化，理解状态机交替演进',
  description: '求最长摆动子序列，贪心过滤单调坡度与平坡，只统计波峰波谷',
  template: `<div id="wiggle-subsequence" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerWiggleSubsequence(): void {
  // 保持向前兼容导出
}
