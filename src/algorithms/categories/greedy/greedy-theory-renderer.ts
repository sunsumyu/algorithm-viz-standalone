/**
 * 贪心算法理论基础
 */

import { registerAlgorithm } from '../../../core/registry';
import { GreedyArticleVisualizer } from './article-visualizer';
import template from './greedy-theory.html?raw';

registerAlgorithm({
  id: 'greedy-theory',
  name: '贪心算法理论基础',
  viewId: 'algo-greedy-theory-view',
  category: 'greedy',
  description: '贪心算法的适用条件、证明方法与通用解题流程',
  icon: '📘',
  template,
  Visualizer: GreedyArticleVisualizer,
  difficulty: 1,
  levelOrder: 0,
});
