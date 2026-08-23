/**
 * 回溯周末总结（二）
 */

import { registerAlgorithm } from '../../../core/registry';
import { ArticleVisualizer } from '../../../core/article-visualizer';
import template from './backtracking-week-summary-2.html?raw';

registerAlgorithm({
  id: 'backtracking-week-summary-2',
  name: '回溯周末总结（二）',
  viewId: 'algo-backtracking-week-summary-2-view',
  category: 'backtracking',
  description: '切割、子集与同层去重的阶段性总结',
  icon: '🧭',
  template,
  Visualizer: ArticleVisualizer,
  difficulty: 1,
  levelOrder: 11,
});
