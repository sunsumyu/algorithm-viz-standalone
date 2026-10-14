/**
 * Class 156: 可持久化线段树 / 主席树 (Persistent Segment Tree)
 * 中国学者黄嘉泰发明 / 洛谷 P3834 【模板】可持久化线段树 2
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_155_160_PROBLEMS } from './advanced-155-160-problem-content';
import { PERSISTENT_SEGMENT_CODES } from './advanced-155-160-stage-codes';
import { PersistentSegStep, buildPersistentSegSteps } from '../../../../core/renderers/adapters/persistent-segment-tree-step-compiler';
import { renderPersistentSegmentTreeCanvas } from '../../../../core/renderers/adapters/persistent-segment-tree-canvas-adapter';

export type { PersistentSegStep };
export { buildPersistentSegSteps };

export const persistentSegmentTreeVisualizer = registerDeclarativeAlgorithm<PersistentSegStep>({
  id: 'persistent-segment-tree-156',
  name: '可持久化线段树 / 主席树 (Class 156)',
  aliases: ['class156-code01', 'persistent-segment-tree-156', 'chairman-tree'],
  category: 'tree',
  icon: '📚',
  difficulty: 3,
  levelOrder: 156,
  description: '左程云算法通关课 Class 156：可持久化线段树 (主席树)。黄嘉泰发明，历史版本节点复用，前缀和差分 O(log N) 求解区间第 K 小。',
  learningGoal: '深刻理解主席树版本共享指针复用机制与利用前缀权值线段树差分求区间第 K 小的数学模型',
  problemHtml: ADVANCED_155_160_PROBLEMS.persistentSegmentTree.html,
  analysisHtml: ADVANCED_155_160_PROBLEMS.persistentSegmentTree.html,
  presets: [
    { label: '[2, 5, 1, 4, 3] (查区间 [2..4] 第 2 小)', values: { preset: 'arr_25143' } },
    { label: '[1, 5, 2, 6, 3, 7, 4] (查区间 [2..6] 第 3 小)', values: { preset: 'arr_longer' } },
  ],
  codeLanguages: PERSISTENT_SEGMENT_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'arr_25143');
    if (preset === 'arr_longer') {
      return buildPersistentSegSteps([1, 5, 2, 6, 3, 7, 4], 2, 6, 3);
    }
    return buildPersistentSegSteps([2, 5, 1, 4, 3], 2, 4, 2);
  },
  renderCanvas: renderPersistentSegmentTreeCanvas,
});
