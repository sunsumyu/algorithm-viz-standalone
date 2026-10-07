/**
 * 购买足量干草的最小花费 (洛谷 P2918 [USACO08NOV] Buying Hay S) - 声明式 4-Card 沙盘渲染器
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  BUYING_HAY_MIN_COST_PROBLEM_HTML,
  BUYING_HAY_MIN_COST_ANALYSIS_HTML,
  BUYING_HAY_MIN_COST_CODE_LANGUAGES,
} from './knapsack-074-problem-content';
import {
  createBuyingHayStages,
  renderBuyingHayArena,
  renderBuyingHayVectorMatrix,
} from '../../../../core/renderers/adapters/buying-hay-canvas-adapter';
import {
  buildBuyingHayMinCostSteps,
  parseBuyingHayInputs,
  type BuyingHayStep,
  type HayPurchaseItem,
} from '../../../../core/renderers/adapters/buying-hay-step-compiler';

export { buildBuyingHayMinCostSteps, parseBuyingHayInputs };
export type { BuyingHayStep, HayPurchaseItem };

const { template, Visualizer } = createDeclarativeVisualizer<any>({
  id: 'buying-hay-min-cost',
  name: '购买足量干草的最小花费 (洛谷 P2918)',
  category: 'dynamic-programming',
  badge: {
    mode: '完全背包 · 允许超额',
    complexity: 'O(N · (H + maxV)) · O(H + maxV)',
  },
  defaultStage: 'stage-4',
  stages: createBuyingHayStages(),
  card1Title: '🌾 干草供销市场与实时采购载荷舱',
  card2Title: '📊 滚动状态向量 dp[0..m] 监视器',
  card2Desc: '展示扩充容量范围 [0, H+maxV] 内寻找全局最小花费的动态规划过程',
  legend: [
    { label: '未达需求区间 (< H)', color: '#38bdf8' },
    { label: '达标合规区间 (>= H)', color: '#10b981' },
    { label: '不可达状态 (INF)', color: '#64748b' },
  ],
  inputs: [
    { id: 'input-h', label: '目标需求量 H (磅)', type: 'number', defaultValue: 60, width: '70px' },
    { id: 'input-costs', label: '单价数组 costs (元)', type: 'text', defaultValue: '5, 100', width: '120px' },
    { id: 'input-vals', label: '单包磅数 vals (磅)', type: 'text', defaultValue: '10, 100', width: '120px' },
  ],
  presets: [
    {
      label: '洛谷经典案例 (H=60, 供货商[5元/10磅, 100元/100磅], Ans=30元)',
      values: { 'input-h': 60, 'input-costs': '5, 100', 'input-vals': '10, 100' },
    },
    {
      label: '超额反而更省案例 (H=15, [10元/8磅, 12元/16磅], Ans=12元)',
      values: { 'input-h': 15, 'input-costs': '10, 12', 'input-vals': '8, 16' },
    },
  ],
  metrics: [
    { id: 'metric-cur-supplier', label: '当前供货商', color: '#f59e0b' },
    { id: 'metric-cur-j', label: '当前重量 j', color: '#38bdf8' },
    { id: 'metric-expanded-m', label: '扩充容量上限 m', color: '#8b5cf6' },
    { id: 'metric-min-cost', label: '最低采购总花费', color: '#10b981' },
  ],
  codeLanguages: BUYING_HAY_MIN_COST_CODE_LANGUAGES,
  problemHtml: BUYING_HAY_MIN_COST_PROBLEM_HTML,
  analysisHtml: BUYING_HAY_MIN_COST_ANALYSIS_HTML,
  buildSteps: (inputs: Record<string, any>) => {
    const { h, cost, val } = parseBuyingHayInputs(inputs);
    return buildBuyingHayMinCostSteps(h, cost, val);
  },
  renderCanvas: renderBuyingHayArena,
  renderCustomMetrics: renderBuyingHayVectorMatrix,
});

export const BuyingHayMinCostVisualizer = Visualizer;

registerAlgorithm({
  id: 'buying-hay-min-cost',
  name: '购买足量干草的最小花费 (洛谷 P2918)',
  viewId: 'algo-buying-hay-min-cost-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 074 Code06：洛谷 P2918 购买干草，至少 H 磅允许超额，容量上界扩充至 H + maxVal 的完全背包求极小值',
  icon: '🌾',
  aliases: ['class074-code06', 'buying-hay-min-cost-074', 'buying-hay', 'luogu-p2918'],
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 89,
  learningGoal: '掌握允许超额时的容量上界安全扩充证明（H + maxVal）与求最小花费完全背包的状态转移',
});
