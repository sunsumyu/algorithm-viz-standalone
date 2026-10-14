/**
 * Class 150: 红黑树 (Red-Black Tree)
 * 工业界标准自平衡二叉搜索树 / Java TreeMap, C++ std::map 核心实现
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_149_154_PROBLEMS } from './advanced-149-154-problem-content';
import { RED_BLACK_CODES } from './advanced-149-154-stage-codes';
import { RBStep, buildRBSteps } from '../../../../core/renderers/adapters/red-black-tree-step-compiler';
import { renderRBTreeCanvas } from '../../../../core/renderers/adapters/red-black-tree-canvas-adapter';

export type { RBStep };
export { buildRBSteps };

export const redBlackTreeVisualizer = registerDeclarativeAlgorithm<RBStep>({
  id: 'red-black-tree-150',
  name: '红黑树 (Class 150)',
  aliases: ['class150-code01', 'red-black-tree', 'red-black-tree-150', 'rbtree'],
  category: 'tree',
  icon: '🔴',
  difficulty: 3,
  levelOrder: 150,
  description: '左程云算法通关课 Class 150：有序表专题 3 - 红黑树 (Red-Black Tree)。解析五大公理、双红冲突与变色/单旋/双旋修复流程。',
  learningGoal: '掌握红黑树五大公理与插入修复的三种经典 Case 处理逻辑及黑高平衡原理',
  problemHtml: ADVANCED_149_154_PROBLEMS.redBlackTree.html,
  analysisHtml: ADVANCED_149_154_PROBLEMS.redBlackTree.html,
  presets: [
    { label: '[10, 20, 30, 15, 25] (触发变色与旋转)', values: { preset: 'keys_10_20_30_15_25' } },
    { label: '[12, 1, 9, 2, 0, 11] (经典多 Case 演示)', values: { preset: 'keys_multi_case' } },
  ],
  codeLanguages: RED_BLACK_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'keys_10_20_30_15_25');
    if (preset === 'keys_multi_case') {
      return buildRBSteps([12, 1, 9, 2, 0, 11]);
    }
    return buildRBSteps([10, 20, 30, 15, 25]);
  },
  renderCanvas: renderRBTreeCanvas,
});
