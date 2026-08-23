/**
 * 贪心算法总结篇
 */

import { registerAlgorithm } from '../../../core/registry';
import { GreedyArticleVisualizer } from './article-visualizer';
import template from './greedy-final-summary.html?raw';

registerAlgorithm({
  id: 'greedy-final-summary',
  name: '贪心算法总结篇',
  viewId: 'algo-greedy-final-summary-view',
  category: 'greedy',
  description: '贪心专题最终复盘：排序、覆盖、贡献、局部约束四类套路',
  icon: '🏁',
  template,
  Visualizer: GreedyArticleVisualizer,
  difficulty: 1,
  levelOrder: 54,
});
