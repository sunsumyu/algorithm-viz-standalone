/**
 * 柠檬水找零 (Lemonade Change · LeetCode 860) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../core/registry';
import { UniversalStageVisualizer } from '../dynamic-programming/unique-paths-renderer';
import {
  LemonadeStep,
  LEMONADE_CODE_LINES,
  buildLemonadeSteps,
} from '../../../core/renderers/adapters/lemonade-step-compiler';
import {
  renderLemonadeCanvas,
} from '../../../core/renderers/adapters/lemonade-canvas-adapter';

export type { LemonadeStep };
export {
  LEMONADE_CODE_LINES,
  buildLemonadeSteps,
  renderLemonadeCanvas,
};

registerAlgorithm({
  id: 'lemonade',
  name: '柠檬水找零',
  viewId: 'lemonade',
  category: 'greedy',
  icon: '🍋',
  difficulty: 1,
  levelOrder: 14,
  learningGoal: '理解贪心策略中通用资源与受限资源的优先级调度思想，掌握货币池受限优先消耗的决策树与状态机演进',
  description: '贪心维护各面额纸币数量，找零 $20 优先消耗专用 $10 纸币，保留万能 $5',
  template: `<div id="lemonade" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerLemonade(): void {
  // 保持向前兼容导出
}
