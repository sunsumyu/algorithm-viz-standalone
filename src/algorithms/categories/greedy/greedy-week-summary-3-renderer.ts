/**
 * 贪心周总结（三）
 */

import { registerAlgorithm } from '../../../core/registry';
import { GreedyArticleVisualizer } from './article-visualizer';
import template from './greedy-week-summary.html?raw';

registerAlgorithm({
  id: 'greedy-week-summary-3',
  name: '贪心周总结',
  viewId: 'algo-greedy-week-summary-3-view',
  category: 'greedy',
  description: '贪心区间类题目阶段总结：队列重建、射箭、无重叠区间、划分字母与合并区间',
  icon: '🧭',
  template,
  Visualizer: GreedyArticleVisualizer,
  difficulty: 1,
  levelOrder: 52,
});
