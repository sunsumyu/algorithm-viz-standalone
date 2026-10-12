/**
 * Class 151: 跳表 (SkipList)
 * Redis 核心存储结构 / 概率跳跃多层索引
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_149_154_PROBLEMS } from './advanced-149-154-problem-content';
import { SKIPLIST_CODES } from './advanced-149-154-stage-codes';
import { SkipListStep, buildSkipListSteps } from '../../../../core/renderers/adapters/skiplist-step-compiler';
import { renderSkipListCanvas } from '../../../../core/renderers/adapters/skiplist-canvas-adapter';

export type { SkipListStep };
export { buildSkipListSteps };

export const skiplistVisualizer = registerDeclarativeAlgorithm<SkipListStep>({
  id: 'skiplist-151',
  name: '跳表 (Class 151)',
  aliases: ['class151-code01', 'skiplist', 'skiplist-151', 'skip-list'],
  category: 'tree',
  icon: '📑',
  difficulty: 2,
  levelOrder: 151,
  description: '左程云算法通关课 Class 151：有序表专题 4 - 跳表 (SkipList)。基于概率平衡的多层链表索引，无全局自旋锁，高并发区间范围查找标准实现。',
  learningGoal: '理解跳表基于几何分布的概率升层机制，掌握自顶向下前驱探测与 O(log N) 期望检索原理',
  problemHtml: ADVANCED_149_154_PROBLEMS.skiplist.html,
  analysisHtml: ADVANCED_149_154_PROBLEMS.skiplist.html,
  inputs: [
    {
      id: 'preset',
      label: '数值插入序列预设',
      type: 'select',
      defaultValue: 'vals_standard',
      options: [
        { label: '[3, 7, 9, 12, 19, 21, 26] (经典稀疏跳跃演示)', value: 'vals_standard' },
        { label: '[5, 15, 25, 35, 45] (均匀升序用例)', value: 'vals_sparse' },
      ],
    },
  ],
  codeLanguages: SKIPLIST_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'vals_standard');
    if (preset === 'vals_sparse') {
      return buildSkipListSteps([5, 15, 25, 35, 45]);
    }
    return buildSkipListSteps([3, 7, 9, 12, 19, 21, 26]);
  },
  renderCanvas: renderSkipListCanvas,
});
