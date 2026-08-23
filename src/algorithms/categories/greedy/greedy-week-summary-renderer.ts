/**
 * 贪心周总结
 */

import { registerAlgorithm } from '../../../core/registry';
import { GreedyArticleVisualizer } from './article-visualizer';
import template from './greedy-week-summary.html?raw';

registerAlgorithm({
  id: 'greedy-week-summary',
  name: '贪心周总结',
  viewId: 'algo-greedy-week-summary-view',
  category: 'greedy',
  description: '按分配、序列、覆盖、区间、树形贪心整理专题套路',
  icon: '🧭',
  template,
  Visualizer: GreedyArticleVisualizer,
  difficulty: 1,
  levelOrder: 50,
});
