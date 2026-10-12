/**
 * 星际华尔街·买卖股票的波段时机 (Stock Trader Empire: Wave Harvest)
 * 经典贪心与动态规划状态机算法（LeetCode 121 & LeetCode 122）
 */

import { registerAlgorithm } from '../../../core/registry';
import {
  StockTraderVisualizer,
  STOCK_TRADER_TEMPLATE,
  StockAudio,
} from './stock-trader-visualizer';
import type {
  PricePoint,
  SlopeSegment,
  CoinParticle,
  FloatingText,
} from './stock-trader-visualizer';

export {
  StockTraderVisualizer,
  STOCK_TRADER_TEMPLATE,
  StockAudio,
};
export type {
  PricePoint,
  SlopeSegment,
  CoinParticle,
  FloatingText,
};

registerAlgorithm({
  id: 'stock-trader',
  name: '星际华尔街·买卖股票的最佳时机',
  viewId: 'algo-stock-trader-view',
  category: 'game',
  description: '股票交易贪心与动规算法游戏：60 FPS 霓虹K线走势、正上坡波段贪心捕捉、买卖交易决策与状态机推演',
  icon: '📈',
  template: STOCK_TRADER_TEMPLATE,
  Visualizer: StockTraderVisualizer,
  difficulty: 2,
  levelOrder: 18,
  learningGoal: '掌握贪心买卖股票（收集所有正向斜率收益）与动态规划状态机模型（买入/卖出/冷冻期状态转移）的核心原理',
});
