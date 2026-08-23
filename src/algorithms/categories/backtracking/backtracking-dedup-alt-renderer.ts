/**
 * 回溯算法去重问题的另一种写法
 */

import { registerAlgorithm } from '../../../core/registry';
import { ArticleVisualizer } from '../../../core/article-visualizer';
import template from './backtracking-dedup-alt.html?raw';

registerAlgorithm({
  id: 'backtracking-dedup-alt',
  name: '回溯算法去重问题的另一种写法',
  viewId: 'algo-backtracking-dedup-alt-view',
  category: 'backtracking',
  description: '从 used 数组与本层集合两个角度理解回溯去重',
  icon: '♻️',
  template,
  Visualizer: ArticleVisualizer,
  difficulty: 2,
  levelOrder: 18,
  learningGoal: '掌握另一种回溯去重思路',
});
