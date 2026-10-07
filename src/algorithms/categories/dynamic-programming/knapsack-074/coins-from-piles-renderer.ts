/**
 * 从栈中取出K个硬币的最大面值和 (LeetCode 2218) - 声明式 4-Card 沙盘渲染器
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  COINS_FROM_PILES_PROBLEM_HTML,
  COINS_FROM_PILES_ANALYSIS_HTML,
  COINS_FROM_PILES_CODE_LANGUAGES,
} from './knapsack-074-problem-content';
import {
  createCoinsFromPilesStages,
  renderCoinsFromPilesSandbox,
  renderCoinsFromPilesVectorMatrix,
} from '../../../../core/renderers/adapters/coins-from-piles-canvas-adapter';
import {
  buildCoinsFromPilesSteps,
  parseCoinsFromPilesInputs,
  type CoinsFromPilesStep,
  type CoinPileTake,
} from '../../../../core/renderers/adapters/coins-from-piles-step-compiler';

export { buildCoinsFromPilesSteps, parseCoinsFromPilesInputs };
export type { CoinsFromPilesStep, CoinPileTake };

const { template, Visualizer } = createDeclarativeVisualizer<any>({
  id: 'coins-from-piles',
  name: '从栈中取出K个硬币的最大面值和',
  category: 'dynamic-programming',
  badge: {
    mode: '分组背包 · 前缀和预处理',
    complexity: 'O(N · K · min(len, K)) · O(K)',
  },
  defaultStage: 'stage-4',
  stages: createCoinsFromPilesStages(),
  card1Title: '🪙 硬币栈阵列与实时拾取沙盘',
  card2Title: '📊 抽取次数容量收益向量 dp[j] 监视器',
  card2Desc: '展示利用前缀和将每个硬币栈转为互斥物品组（选1枚、2枚...至多选一种）的分组背包推演',
  legend: [
    { label: '未被抽取的硬币', color: '#334155' },
    { label: '已被当前最优解选中的硬币', color: '#10b981' },
    { label: '当前考察中的试算拿取', color: '#38bdf8' },
  ],
  inputs: [
    { id: 'input-k', label: '拿取硬币总数 K', type: 'number', defaultValue: 2, width: '60px' },
    { id: 'input-piles-json', label: '硬币栈数组 JSON (从顶向下)', type: 'text', defaultValue: '[[1,100,3],[7,8,9]]', width: '240px' },
  ],
  presets: [
    {
      label: 'LeetCode 样例 (K=2, 栈[[1,100,3],[7,8,9]], Ans=101)',
      values: { 'input-k': 2, 'input-piles-json': '[[1,100,3],[7,8,9]]' },
    },
    {
      label: '深度抉择用例 (K=4, 栈[[10,20],[1,1,100],[50]], Ans=151)',
      values: { 'input-k': 4, 'input-piles-json': '[[10,20],[1,1,100],[50]]' },
    },
  ],
  metrics: [
    { id: 'metric-cur-pile', label: '当前硬币栈', color: '#f59e0b' },
    { id: 'metric-cur-j', label: '当前总步数 j', color: '#38bdf8' },
    { id: 'metric-cur-c', label: '当前拿取枚数 c', color: '#8b5cf6' },
    { id: 'metric-max-coins', label: '当前最大面值', color: '#10b981' },
  ],
  codeLanguages: COINS_FROM_PILES_CODE_LANGUAGES,
  problemHtml: COINS_FROM_PILES_PROBLEM_HTML,
  analysisHtml: COINS_FROM_PILES_ANALYSIS_HTML,
  buildSteps: (inputs: Record<string, any>) => {
    const { k, piles } = parseCoinsFromPilesInputs(inputs);
    return buildCoinsFromPilesSteps(piles, k);
  },
  renderCanvas: renderCoinsFromPilesSandbox,
  renderCustomMetrics: renderCoinsFromPilesVectorMatrix,
});

export const CoinsFromPilesVisualizer = Visualizer;

registerAlgorithm({
  id: 'coins-from-piles',
  name: '从栈中取出K个硬币的最大面值和',
  viewId: 'algo-coins-from-piles-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 074 Code02：LeetCode 2218 取硬币，自顶向下连续拿取的前缀和预处理转分组背包互斥选择',
  icon: '🪙',
  aliases: ['class074-code02', 'coins-from-piles-074', 'maximum-value-of-k-coins-from-piles', 'leetcode-2218'],
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 85,
  learningGoal: '掌握硬币栈连续操作向互斥物品组的转化、前缀和预处理加速与步数容量分组背包',
});
