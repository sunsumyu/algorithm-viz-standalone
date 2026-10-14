/**
 * 情侣牵手 (Couples Holding Hands · LeetCode 765) 领域适配器
 * 遵循 Matt Pocock 深模块哲学：
 * 纯声明式元数据配置与委托挂载，身材保持在 100 行内
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  COUPLES_CODE_LANGUAGES,
  COUPLES_PROBLEM_HTML,
  COUPLES_ANALYSIS_HTML,
} from './couples-holding-hands-problem-content';
import {
  CouplesStep,
  buildCouplesSteps,
} from './couples-holding-hands-step-compiler';
import {
  renderCouplesHoldingHandsCanvas,
  renderCouplesHoldingHandsCustomMetrics,
} from '../../../core/renderers/adapters/couples-holding-hands-canvas-adapter';

const { template, Visualizer } = createDeclarativeVisualizer<CouplesStep>({
  id: 'couples-holding-hands',
  name: '情侣牵手 (Couples Holding Hands)',
  viewId: 'algo-couples-holding-hands-view',
  category: 'graph',
  icon: '👫',
  badge: {
    mode: '并查集置换环 + 最少交换定理',
    complexity: 'O(N · α(N)) · O(N)',
  },
  card1Title: '👫 沙发席位排布与置换环拓扑沙盘',
  card2Title: '📊 并查集状态与置换环理论监视器',
  card2Desc: '展示沙发人员情侣映射、并查集连通分量合并与最少交换次数 N - sets 计算',
  legend: [
    { label: '情侣对节点 (C0..Cn-1)', color: '#1e3a8a' },
    { label: '🛋️ 当前考察沙发连边', color: '#f59e0b' },
    { label: '🟢 置换环连边 / 已成对', state: 'discovered' },
  ],
  presets: [
    { label: '双环排布 (2次交换)', values: { preset: 'two_cycles' } },
    { label: '大环排布 (3次交换)', values: { preset: 'big_cycle' } },
    { label: '完美排布 (0次交换)', values: { preset: 'perfect' } },
  ],
  metrics: [
    { id: 'metric-disjoint-sets', label: '并查集连通分量', color: '#10b981' },
    { id: 'metric-min-swaps', label: '最少交换次数', color: '#ef4444' },
    { id: 'metric-current-couch', label: '当前巡查沙发', color: '#38bdf8' },
    { id: 'metric-cycle-count', label: '置换环数目', color: '#f59e0b' },
  ],
  codeLanguages: COUPLES_CODE_LANGUAGES,
  problemHtml: COUPLES_PROBLEM_HTML,
  analysisHtml: COUPLES_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs.preset || inputs['input-preset'] || 'two_cycles') as string;
    return buildCouplesSteps(preset);
  },
  renderCanvas: renderCouplesHoldingHandsCanvas,
  renderCustomMetrics: renderCouplesHoldingHandsCustomMetrics,
});

registerAlgorithm({
  id: 'couples-holding-hands',
  name: '情侣牵手 (Couples Holding Hands)',
  viewId: 'algo-couples-holding-hands-view',
  category: 'graph',
  description: '经典置换环模型：并查集将相邻不同情侣缩环、置换环最少交换次数定理 N - 连通分量数 (LeetCode 765)',
  icon: '👫',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 92,
  learningGoal: '掌握情侣对并查集建模技巧、置换环数学定理及最少交换次数最优解证明',
});

export { buildCouplesSteps, type CouplesStep };
export { Visualizer as CouplesHoldingHandsVisualizer };
