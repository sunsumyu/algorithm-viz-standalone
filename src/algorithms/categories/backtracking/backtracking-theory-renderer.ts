/**
 * 回溯算法理论基础
 */

import { registerAlgorithm } from '../../../core/registry';
import { ArticleVisualizer } from '../../../core/article-visualizer';
import template from './backtracking-theory.html?raw';

registerAlgorithm({
  id: 'backtracking-theory',
  name: '回溯算法理论基础',
  viewId: 'algo-backtracking-theory-view',
  category: 'backtracking',
  description: '回溯算法的递归模板、搜索树与剪枝方法',
  icon: '📘',
  template,
  Visualizer: ArticleVisualizer,
  difficulty: 1,
  levelOrder: 0,
});
