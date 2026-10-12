/**
 * Class 149: Size Balanced Tree (SB 树)
 * 中国学者陈启峰发明 / 洛谷 P3369 【模板】普通平衡树
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_149_154_PROBLEMS } from './advanced-149-154-problem-content';
import { SB_TREE_CODES } from './advanced-149-154-stage-codes';
import { SBStep, buildSBSteps } from '../../../../core/renderers/adapters/sb-tree-step-compiler';
import { renderSBTreeCanvas } from '../../../../core/renderers/adapters/sb-tree-canvas-adapter';

export type { SBStep };
export { buildSBSteps };

export const sbTreeVisualizer = registerDeclarativeAlgorithm<SBStep>({
  id: 'sb-tree-149',
  name: 'Size Balanced Tree (Class 149)',
  aliases: ['class149-code01', 'sb-tree', 'sb-tree-149', 'size-balanced-tree'],
  category: 'tree',
  icon: '🌳',
  difficulty: 3,
  levelOrder: 149,
  description: '左程云算法通关课 Class 149：有序表专题 2 - SB 树 (Size Balanced Tree)。中国学者陈启峰发明，用子树大小 size 维持平衡，删除无需旋转，极速高效。',
  learningGoal: '深刻理解 Size Balanced 平衡准则与 Maintain 修复机制，掌握其删除不旋转的工程优势',
  problemHtml: ADVANCED_149_154_PROBLEMS.sbTree.html,
  analysisHtml: ADVANCED_149_154_PROBLEMS.sbTree.html,
  inputs: [
    {
      id: 'preset',
      label: '键值插入序列预设',
      type: 'select',
      defaultValue: 'keys_10_20_30_40_50_25',
      options: [
        { label: '[10, 20, 30, 40, 50, 25] (典型平衡测试)', value: 'keys_10_20_30_40_50_25' },
        { label: '[5, 4, 3, 2, 1] (单调降序触发 LL 维护)', value: 'keys_54321' },
      ],
    },
  ],
  codeLanguages: SB_TREE_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'keys_10_20_30_40_50_25');
    if (preset === 'keys_54321') {
      return buildSBSteps([5, 4, 3, 2, 1]);
    }
    return buildSBSteps([10, 20, 30, 40, 50, 25]);
  },
  renderCanvas: renderSBTreeCanvas,
});
