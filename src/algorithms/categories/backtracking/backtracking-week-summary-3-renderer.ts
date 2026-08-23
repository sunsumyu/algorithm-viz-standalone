/**
 * 回溯周末总结（三）
 */

import { registerAlgorithm } from '../../../core/registry';
import { ArticleVisualizer } from '../../../core/article-visualizer';
import template from './backtracking-week-summary-3.html?raw';

registerAlgorithm({
  id: 'backtracking-week-summary-3',
  name: '回溯周末总结（三）',
  viewId: 'algo-backtracking-week-summary-3-view',
  category: 'backtracking',
  description: '递增子序列、排列与棋盘问题总结',
  icon: '🧭',
  template,
  Visualizer: ArticleVisualizer,
  difficulty: 1,
  levelOrder: 17,
});
