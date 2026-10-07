/**
 * 有依赖的背包(模版) (洛谷 P1064 金明的预算方案) - 声明式 4-Card 沙盘渲染器
 * 核心：主件 + 至多2个附件展开为 4 种互斥方案的分组背包
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  DEPENDENT_KNAPSACK_PROBLEM_HTML,
  DEPENDENT_KNAPSACK_ANALYSIS_HTML,
  DEPENDENT_KNAPSACK_CODE_LANGUAGES,
} from './knapsack-073-problem-content';
import {
  buildDependentKnapsackSteps,
  parseDependentKnapsackInputs,
  type DependentItem,
  type DependentKnapsackStep,
} from '../../../../core/renderers/adapters/dependent-knapsack-step-compiler';
import {
  renderDependentKnapsackBoard,
  renderDependentKnapsackMetrics,
} from '../../../../core/renderers/adapters/dependent-knapsack-canvas-adapter';

export { buildDependentKnapsackSteps, parseDependentKnapsackInputs };
export type { DependentItem, DependentKnapsackStep };

const { template, Visualizer } = createDeclarativeVisualizer<DependentKnapsackStep>({
  id: 'dependent-knapsack-standard',
  name: '有依赖的背包模版 (金明的预算方案)',
  category: 'dynamic-programming',
  badge: {
    mode: '有依赖背包 · 主件附件互斥转分组',
    complexity: 'O(M · N) · O(N)',
  },
  card1Title: '主件与归属附件展开方案及实时预算载荷舱',
  card2Title: '分组背包收益 DP 向量 dp[0..N]',
  card2Desc: '展示主件与至多 2 个附件展开为 4 种互斥组合并按组内互斥 01 背包倒序转移过程',
  legend: [
    { label: '未选方案', color: '#475569' },
    { label: '当前考察组/方案', color: '#f59e0b' },
    { label: '带来更优更新', color: '#10b981' },
  ],
  inputs: [
    { id: 'input-budget', label: '总预算 N', type: 'number', defaultValue: 1000, width: '70px' },
    { id: 'input-m', label: '物品总数 M', type: 'number', defaultValue: 5, width: '50px' },
    {
      id: 'input-items',
      label: '物品列表 (价格, 满意度乘积, 所属主件q; 分号分隔)',
      type: 'text',
      defaultValue: '800, 1600, 0; 400, 1200, 1; 300, 900, 1; 400, 1200, 0; 200, 400, 4',
      width: '240px',
    },
  ],
  presets: [
    {
      label: '洛谷经典案例 (N=1000, M=5, 主件1含2附件, 主件4含1附件, Ans=2200)',
      values: {
        'input-budget': 1000,
        'input-m': 5,
        'input-items': '800, 1600, 0; 400, 1200, 1; 300, 900, 1; 400, 1200, 0; 200, 400, 4',
      },
    },
  ],
  metrics: [
    { id: 'metric-cur-group', label: '当前考察主件组', color: '#f59e0b' },
    { id: 'metric-cur-budget', label: '当前预算 j', color: '#38bdf8' },
    { id: 'metric-chosen-combo', label: '本轮选中方案', color: '#10b981' },
    { id: 'metric-max-profit', label: '最大满足度收益', color: '#a855f7' },
  ],
  codeLanguages: DEPENDENT_KNAPSACK_CODE_LANGUAGES,
  problemHtml: DEPENDENT_KNAPSACK_PROBLEM_HTML,
  analysisHtml: DEPENDENT_KNAPSACK_ANALYSIS_HTML,
  buildSteps: (inputs: Record<string, any>) => {
    const { budget, m, rawItems } = parseDependentKnapsackInputs(inputs);
    return buildDependentKnapsackSteps(budget, m, rawItems);
  },
  renderCanvas: (container, step) => renderDependentKnapsackBoard(container, step),
  renderCustomMetrics: (container, step) => renderDependentKnapsackMetrics(container, step),
});

export const DependentKnapsackVisualizer = Visualizer;

registerAlgorithm({
  id: 'dependent-knapsack-standard',
  name: '有依赖的背包模版 (金明的预算方案)',
  viewId: 'algo-dependent-knapsack-standard-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 073 Code05：洛谷 P1064 金明的预算方案，主件附件组合展开为互斥分组背包求解',
  icon: '🛍️',
  aliases: ['class073-code05', 'dependent-knapsack-073', 'dependent-knapsack', 'luogu-p1064'],
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 81,
  learningGoal: '掌握主附件组合向分组背包的转化思想，深刻体会至多2个附件常数展开的工程设计',
});
