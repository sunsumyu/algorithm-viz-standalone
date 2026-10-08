/**
 * 分发饼干 (Assign Cookies · LeetCode 455) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../core/registry';
import { UniversalStageVisualizer } from '../dynamic-programming/unique-paths-renderer';
import {
  AcPhase,
  AssignCookiesStep,
  ASSIGN_COOKIES_CODE_LINES,
  assignCookiesSteps,
} from '../../../core/renderers/adapters/assign-cookies-step-compiler';
import {
  renderAssignCookiesCanvas,
} from '../../../core/renderers/adapters/assign-cookies-canvas-adapter';

export type { AcPhase, AssignCookiesStep };
export {
  ASSIGN_COOKIES_CODE_LINES,
  assignCookiesSteps,
  renderAssignCookiesCanvas,
};

registerAlgorithm({
  id: 'assign-cookies',
  name: '分发饼干',
  viewId: 'assign-cookies',
  category: 'greedy',
  icon: '🍪',
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握贪心算法在排序+双指针场景下的局部最优到全局最优推导',
  description: '贪心双指针小饼干优先分配，最大化满足孩子数量',
  template: `<div id="assign-cookies" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerAssignCookies(): void {
  // 保持向前兼容导出
}
