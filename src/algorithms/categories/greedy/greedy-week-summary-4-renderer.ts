/**
 * 贪心周总结（四）
 */

import { registerAlgorithm } from '../../../core/registry';
import { GreedyArticleVisualizer } from './article-visualizer';
import template from './greedy-week-summary.html?raw';

registerAlgorithm({
  id: 'greedy-week-summary-4',
  name: '贪心周总结',
  viewId: 'algo-greedy-week-summary-4-view',
  category: 'greedy',
  description: '贪心收尾阶段总结：合并区间、单调递增数字与二叉树摄像头',
  icon: '🧭',
  template,
  Visualizer: GreedyArticleVisualizer,
  difficulty: 1,
  levelOrder: 53,
});
