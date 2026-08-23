/**
 * 回溯法总结篇
 */

import { registerAlgorithm } from '../../../core/registry';
import { ArticleVisualizer } from '../../../core/article-visualizer';
import template from './backtracking-final-summary.html?raw';

registerAlgorithm({
  id: 'backtracking-final-summary',
  name: '回溯法总结篇',
  viewId: 'algo-backtracking-final-summary-view',
  category: 'backtracking',
  description: '回溯专题的题型、模板、剪枝和去重总复盘',
  icon: '🏁',
  template,
  Visualizer: ArticleVisualizer,
  difficulty: 1,
  levelOrder: 50,
});
