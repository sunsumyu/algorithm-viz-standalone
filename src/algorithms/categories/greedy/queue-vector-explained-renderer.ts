/**
 * 根据身高重建队列（vector 原理讲解）
 */

import { registerAlgorithm } from '../../../core/registry';
import { GreedyArticleVisualizer } from './article-visualizer';
import template from './queue-vector-explained.html?raw';

registerAlgorithm({
  id: 'queue-vector-explained',
  name: '根据身高重建队列（vector原理讲解）',
  viewId: 'algo-queue-vector-explained-view',
  category: 'greedy',
  description: '解释按身高降序、按 k 插入的 vector/数组重建队列原理',
  icon: '📚',
  template,
  Visualizer: GreedyArticleVisualizer,
  difficulty: 3,
  levelOrder: 12,
});
