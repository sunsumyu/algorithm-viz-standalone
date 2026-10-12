/**
 * Class 152: 伸展树与区间翻转 (Splay Tree)
 * Tarjan 发明 / 洛谷 P3391 【模板】文艺平衡树
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_149_154_PROBLEMS } from './advanced-149-154-problem-content';
import { SPLAY_TREE_CODES } from './advanced-149-154-stage-codes';
import { SplayStep, buildSplaySteps } from '../../../../core/renderers/adapters/splay-tree-step-compiler';
import { renderSplayTreeCanvas } from '../../../../core/renderers/adapters/splay-tree-canvas-adapter';

export type { SplayStep };
export { buildSplaySteps };

export const splayTreeVisualizer = registerDeclarativeAlgorithm<SplayStep>({
  id: 'splay-tree-152',
  name: '伸展树与区间翻转 (Class 152)',
  aliases: ['class152-code01', 'splay-tree', 'splay-tree-152', 'splay'],
  category: 'tree',
  icon: '🎯',
  difficulty: 3,
  levelOrder: 152,
  description: '左程云算法通关课 Class 152：有序表专题 5 - 伸展树 (Splay Tree)。Tarjan 发明，Zig-Zig 先父后己双旋将访问节点提升至根，支持区间翻转。',
  learningGoal: '深刻理解 Splay 树的 Zig-Zig 与 Zig-Zag 双旋势能平衡证明，掌握将区间 [L, R] 夹在子树下的提取机制',
  problemHtml: ADVANCED_149_154_PROBLEMS.splayTree.html,
  analysisHtml: ADVANCED_149_154_PROBLEMS.splayTree.html,
  inputs: [
    {
      id: 'preset',
      label: 'Splay 演示场景预设',
      type: 'select',
      defaultValue: 'zig_zig_demo',
      options: [
        { label: '一字形同向双旋 (链式 [5, 4, 3, 2, 1], Splay 1)', value: 'zig_zig_demo' },
        { label: '之字形异向双旋 ([10, 5, 20, 7], Splay 7)', value: 'zig_zag_demo' },
      ],
    },
  ],
  codeLanguages: SPLAY_TREE_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'zig_zig_demo');
    if (preset === 'zig_zag_demo') {
      return buildSplaySteps([10, 5, 20, 7], 7);
    }
    return buildSplaySteps([5, 4, 3, 2, 1], 1);
  },
  renderCanvas: renderSplayTreeCanvas,
});
