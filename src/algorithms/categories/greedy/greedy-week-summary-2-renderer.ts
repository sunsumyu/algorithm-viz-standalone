/**
 * 贪心周总结（二）
 */

import { registerAlgorithm } from '../../../core/registry';
import { GreedyArticleVisualizer } from './article-visualizer';
import template from './greedy-week-summary.html?raw';

registerAlgorithm({
  id: 'greedy-week-summary-2',
  name: '贪心周总结',
  viewId: 'algo-greedy-week-summary-2-view',
  category: 'greedy',
  description: '贪心覆盖类题目阶段总结：股票、跳跃游戏、K 次取反与加油站',
  icon: '🧭',
  template,
  Visualizer: GreedyArticleVisualizer,
  difficulty: 1,
  levelOrder: 51,
});
