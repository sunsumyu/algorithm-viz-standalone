/**
 * 买卖股票的最佳时机 II (Best Time to Buy and Sell Stock II · LeetCode 122) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../core/registry';
import { UniversalStageVisualizer } from '../dynamic-programming/unique-paths-renderer';
import {
  StockPhase,
  StockStep,
  BEST_TIME_STOCK_CODE_LINES,
  buildStockSteps,
} from '../../../core/renderers/adapters/best-time-stock-step-compiler';
import {
  renderBestTimeStockCanvas,
} from '../../../core/renderers/adapters/best-time-stock-canvas-adapter';

export type { StockPhase, StockStep };
export {
  BEST_TIME_STOCK_CODE_LINES,
  buildStockSteps,
  renderBestTimeStockCanvas,
};

registerAlgorithm({
  id: 'best-time-stock',
  name: '买卖股票的最佳时机 II',
  viewId: 'best-time-stock',
  category: 'greedy',
  icon: '📈',
  difficulty: 2,
  levelOrder: 4,
  learningGoal: '掌握贪心算法中的利润等价分解思想，化解复杂多买多卖调度问题',
  description: '跨天利润贪心分解为每天相邻价差，只收集所有正向收益',
  template: `<div id="best-time-stock" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerBestTimeStock(): void {
  // 保持向前兼容导出
}
