/**
 * 回溯周末总结（一）
 */

import { registerAlgorithm } from '../../../core/registry';
import { ArticleVisualizer } from '../../../core/article-visualizer';
import template from './backtracking-week-summary-1.html?raw';

registerAlgorithm({
  id: 'backtracking-week-summary-1',
  name: '回溯周末总结（一）',
  viewId: 'algo-backtracking-week-summary-1-view',
  category: 'backtracking',
  description: '组合类题目的 startIndex、剪枝与复用边界总结',
  icon: '🧭',
  template,
  Visualizer: ArticleVisualizer,
  difficulty: 1,
  levelOrder: 5,
});
