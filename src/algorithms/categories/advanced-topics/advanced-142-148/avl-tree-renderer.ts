/**
 * Class 148: 有序表专题 (一) - AVL 平衡二叉搜索树 (AVL Tree Self-Balancing BST)
 * 洛谷 P3369 【模板】普通平衡树
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_142_148_PROBLEMS } from './advanced-142-148-problem-content';
import { AVL_TREE_CODES } from './advanced-142-148-stage-codes';
import {
  AVLStep,
  buildAVLSteps,
} from '../../../../core/renderers/adapters/avl-tree-step-compiler';
import { renderAVLTreeCanvas } from '../../../../core/renderers/adapters/avl-tree-canvas-adapter';

export type { AVLStep };
export { buildAVLSteps };

export const avlTreeVisualizer = registerDeclarativeAlgorithm<AVLStep>({
  id: 'avl-tree-148',
  name: 'AVL 平衡二叉搜索树 (Class 148)',
  aliases: ['class148-code01', 'avl-tree', 'avl-tree-148', 'self-balancing-bst'],
  category: 'tree',
  icon: '🌲',
  difficulty: 3,
  levelOrder: 148,
  description: '左程云算法通关课 Class 148：有序表专题 1 - AVL 树。演示二叉搜索树在节点失衡时的四种旋转调整 (LL, RR, LR, RL)，动态保持严格平衡。',
  learningGoal: '深刻掌握 AVL 树平衡因子动态维护与 LL, RR, LR, RL 四种自平衡旋转操作',
  problemHtml: ADVANCED_142_148_PROBLEMS.avlTree.html,
  analysisHtml: ADVANCED_142_148_PROBLEMS.avlTree.html,
  presets: [
    { label: '[10, 20, 30, 40, 50, 25] (触发 RR 与 RL 旋转)', values: { preset: 'keys_10_20_30_40_50_25' } },
    { label: '[30, 20, 10, 5, 25] (触发 LL 旋转)', values: { preset: 'keys_30_20_10_5_25' } },
  ],
  codeLanguages: AVL_TREE_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'keys_10_20_30_40_50_25');
    if (preset === 'keys_30_20_10_5_25') {
      return buildAVLSteps([30, 20, 10, 5, 25]);
    }
    return buildAVLSteps([10, 20, 30, 40, 50, 25]);
  },
  renderCanvas: (container, step) => {
    renderAVLTreeCanvas(container, step);
  },
});
