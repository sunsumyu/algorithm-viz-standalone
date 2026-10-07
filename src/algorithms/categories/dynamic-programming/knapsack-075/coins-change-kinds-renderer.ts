/**
 * 能成功找零的钱数种类 (POJ 1742 混合窗口优化) - 声明式 4-Card 沙盘渲染器
 * 核心：混合背包三路分支 (c=1 -> 01, v*c>=m -> 完全, 其它 -> 布尔滑块滑动更新)，平摊 O(1)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { KNAPSACK_075_PROBLEMS } from './knapsack-075-problem-content';
import {
  parseCoinsChangeInputs,
  buildCoinsChangeKindsSteps,
  type CoinType,
  type CoinsChangeKindsStep,
} from '../../../../core/renderers/adapters/coins-change-kinds-step-compiler';
import {
  renderCoinsChangeSandbox,
  renderCoinsChangeVectorMatrix,
  createCoinsChangeStages,
} from '../../../../core/renderers/adapters/coins-change-kinds-canvas-adapter';

export type { CoinType, CoinsChangeKindsStep };
export { parseCoinsChangeInputs, buildCoinsChangeKindsSteps };

const { template, Visualizer } = createDeclarativeVisualizer<CoinsChangeKindsStep | any>({
  id: 'coins-change-kinds',
  name: '能成功找零的钱数种类 (POJ 1742 混合窗口优化)',
  category: 'dynamic-programming',
  badge: {
    mode: '混合背包 · 布尔滑窗优化',
    complexity: 'O(N · M) · O(M)',
  },
  card1Title: '🪙 货币储备资产库与找零面值解锁仓',
  card2Title: '📊 找零金额可行性向量 dp[1..M]',
  card2Desc: '展示 01背包、完全背包与布尔滑窗根据货币面值与数量的自适应分流推演',
  legend: [
    { label: '不可凑出金额 (False)', color: '#475569' },
    { label: '可成功凑出金额 (True)', color: '#10b981' },
    { label: '当前正在考察金额 j', color: '#38bdf8' },
  ],
  inputs: [
    { id: 'input-m', label: '上限 m:', type: 'number', defaultValue: 10, width: '55px' },
    { id: 'input-vals', label: '面值 vals:', type: 'text', defaultValue: '1, 2, 4', width: '110px' },
    { id: 'input-cnts', label: '张数 cnts:', type: 'text', defaultValue: '2, 1, 1', width: '110px' },
  ],
  presets: [
    {
      label: 'POJ 经典样例 (m=10, vals=[1,2,4], cnts=[2,1,1], Ans=8种)',
      values: { 'input-m': 10, 'input-vals': '1, 2, 4', 'input-cnts': '2, 1, 1' },
    },
    {
      label: '完全充裕货币 (m=15, vals=[3,5], cnts=[10,10], Ans=10种)',
      values: { 'input-m': 15, 'input-vals': '3, 5', 'input-cnts': '10, 10' },
    },
  ],
  metrics: [
    { id: 'metric-target-m', label: '金额上限 M', color: '#94a3b8' },
    { id: 'metric-cur-coin', label: '当前考察货币', color: '#f59e0b' },
    { id: 'metric-branch-strategy', label: '采用分支策略', color: '#8b5cf6' },
    { id: 'metric-total-kinds', label: '可找零钱数种类', color: '#10b981' },
  ],
  defaultStage: 'stage-4',
  stages: createCoinsChangeStages(),
  codeLanguages: KNAPSACK_075_PROBLEMS['coins-change-kinds'].codeLanguages,
  problemHtml: KNAPSACK_075_PROBLEMS['coins-change-kinds'].problemHtml,
  analysisHtml: KNAPSACK_075_PROBLEMS['coins-change-kinds'].analysisHtml,
  buildSteps: buildCoinsChangeKindsSteps,
  renderCanvas: (container, step) => renderCoinsChangeSandbox(container, step),
  renderCustomMetrics: (container, step) => renderCoinsChangeVectorMatrix(container, step),
});

export const CoinsChangeKindsVisualizer = Visualizer;

registerAlgorithm({
  id: 'coins-change-kinds',
  name: '能成功找零的钱数种类 (POJ 1742 混合窗口优化)',
  viewId: 'algo-coins-change-kinds-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 075 Code05：POJ 1742 找零硬币，混合背包三路分支与布尔窗口滑块统计平摊 O(1) 状态转移',
  icon: '💰',
  aliases: ['class075-code05', 'coins-change-kinds-075', 'coins-change-kinds-problem', 'poj-1742'],
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 94,
  learningGoal: '掌握混合背包的工程条件分流思想、布尔可行性问题的窗口滑块优化技巧',
});
