/**
 * 夏季特惠 (LeetCode LCP 51 / tJau2o) - 声明式 4-Card 沙盘渲染器
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  BUY_GOODS_DISCOUNT_PROBLEM_HTML,
  BUY_GOODS_DISCOUNT_ANALYSIS_HTML,
  BUY_GOODS_DISCOUNT_CODE_LANGUAGES,
} from './knapsack-073-problem-content';
import {
  buildBuyGoodsDiscountSteps,
  parseBuyGoodsInputs,
  type BuyGoodsStep,
} from '../../../../core/renderers/adapters/buy-goods-discount-step-compiler';
import {
  renderBuyGoodsBoard,
  renderBuyGoodsStage4Metrics,
  createBuyGoodsStages,
} from '../../../../core/renderers/adapters/buy-goods-discount-canvas-adapter';

export { buildBuyGoodsDiscountSteps, parseBuyGoodsInputs };
export type { BuyGoodsStep };

const { template, Visualizer } = createDeclarativeVisualizer<any>({
  id: 'buy-goods-discount',
  name: '夏季特惠 (贪心白嫖+01背包)',
  category: 'dynamic-programming',
  badge: {
    mode: '贪心白嫖 · 01背包转化',
    complexity: 'O(N · X) · O(X)',
  },
  defaultStage: 'stage-4',
  stages: createBuyGoodsStages(),
  card1Title: 'Steam 游戏折扣与实时购物车载荷',
  card2Title: '普通折扣游戏 01 背包 DP 向量 dp[0..X]',
  card2Desc: '展示将心理不吃亏判定与背包收益极值转化过程，清晰展现贪心必选白嫖与背包选购',
  legend: [
    { label: '倒贴白嫖', color: '#10b981' },
    { label: '背包购入', color: '#8b5cf6' },
    { label: '当前考察容量 j', color: '#f59e0b' },
  ],
  inputs: [
    { id: 'input-budget', label: '初始预算 X', type: 'number', defaultValue: 10, width: '60px' },
    { id: 'input-games', label: '游戏列表 (原价,现价,快乐值; 分隔)', type: 'text', defaultValue: '3,1,2; 5,2,4; 4,3,1; 6,4,3', width: '220px' },
  ],
  presets: [
    { label: 'LeetCode 样例 1 (X=10, 4款游戏, 最大快乐=7)', values: { 'input-budget': 10, 'input-games': '3,1,2; 5,2,4; 4,3,1; 6,4,3' } },
    { label: '含纯白嫖游戏样例 (X=5, 最大快乐=6)', values: { 'input-budget': 5, 'input-games': '4,1,3; 2,1,1; 3,2,2' } },
  ],
  metrics: [
    { id: 'metric-init-budget', label: '初始预算 X', color: '#38bdf8' },
    { id: 'metric-eff-budget', label: '白嫖后可用预算', color: '#10b981' },
    { id: 'metric-greedy-happy', label: '白嫖获得快乐', color: '#f59e0b' },
    { id: 'metric-total-happy', label: '总快乐值', color: '#a855f7' },
  ],
  codeLanguages: BUY_GOODS_DISCOUNT_CODE_LANGUAGES,
  problemHtml: BUY_GOODS_DISCOUNT_PROBLEM_HTML,
  analysisHtml: BUY_GOODS_DISCOUNT_ANALYSIS_HTML,
  buildSteps: (inputs: Record<string, any>) => {
    const { initialBudget, a, b, w } = parseBuyGoodsInputs(inputs);
    return buildBuyGoodsDiscountSteps(initialBudget, a, b, w);
  },
  renderCanvas: (container, step) => renderBuyGoodsBoard(container, step),
  renderCustomMetrics: renderBuyGoodsStage4Metrics,
});

export const BuyGoodsDiscountVisualizer = Visualizer;

registerAlgorithm({
  id: 'buy-goods-discount',
  name: '夏季特惠 (贪心白嫖+01背包)',
  viewId: 'algo-buy-goods-discount-view',
  category: 'dynamic-programming',
  description: '左程云算法讲解073 Code02：LeetCode LCP 51 夏季特惠，心理不吃亏判别式 -> 贪心白嫖必选 (well >= 0) + 剩余游戏 01 背包转化',
  icon: '🛍️',
  aliases: ['class073-code02', 'buy-goods-discount-073', 'summer-discount', 'lcp-51'],
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 102,
  learningGoal: '掌握题目隐含贪心白嫖与数学等价变形，化简状态维度转化为标准 01 背包最值模型',
});
