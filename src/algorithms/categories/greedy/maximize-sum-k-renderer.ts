/**
 * K 次取反后最大化的数组和 (Maximize Sum of Array After K Negations · LeetCode 1005) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../core/registry';
import { UniversalStageVisualizer } from '../dynamic-programming/unique-paths-renderer';
import {
  MaxSumKStep,
  MAXIMIZE_SUM_K_CODE_LINES,
  buildMaxSumKSteps,
} from '../../../core/renderers/adapters/maximize-sum-k-step-compiler';
import {
  renderMaximizeSumKCanvas,
} from '../../../core/renderers/adapters/maximize-sum-k-canvas-adapter';

export type { MaxSumKStep };
export {
  MAXIMIZE_SUM_K_CODE_LINES,
  buildMaxSumKSteps,
  renderMaximizeSumKCanvas,
};

registerAlgorithm({
  id: 'maximize-sum-k',
  name: 'K 次取反后最大化的数组和',
  viewId: 'maximize-sum-k',
  category: 'greedy',
  icon: '±',
  difficulty: 1,
  levelOrder: 7,
  learningGoal: '掌握贪心算法中的绝对值排序策略与奇偶性分类讨论思维，理解有限配额资源调度模型与四阶段状态机演进',
  description: '绝对值降序排序，负数优先转正，剩余奇数次翻转最小绝对值',
  template: `<div id="maximize-sum-k" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerMaximizeSumK(): void {
  // 保持向前兼容导出
}
