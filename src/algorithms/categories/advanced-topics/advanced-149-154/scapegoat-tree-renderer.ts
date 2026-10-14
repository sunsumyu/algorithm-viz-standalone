/**
 * Class 153: 替罪羊树 (Scapegoat Tree)
 * 不自旋的暴力重构平衡二叉树 / 洛谷 P3369 【模板】普通平衡树
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_149_154_PROBLEMS } from './advanced-149-154-problem-content';
import { SCAPEGOAT_CODES } from './advanced-149-154-stage-codes';
import { ScapegoatStep, buildScapegoatSteps } from '../../../../core/renderers/adapters/scapegoat-tree-step-compiler';
import { renderScapegoatTreeCanvas } from '../../../../core/renderers/adapters/scapegoat-tree-canvas-adapter';

export type { ScapegoatStep };
export { buildScapegoatSteps };

export const scapegoatTreeVisualizer = registerDeclarativeAlgorithm<ScapegoatStep>({
  id: 'scapegoat-tree-153',
  name: '替罪羊树 (Class 153)',
  aliases: ['class153-code01', 'scapegoat-tree', 'scapegoat-tree-153'],
  category: 'tree',
  icon: '🐐',
  difficulty: 3,
  levelOrder: 153,
  description: '左程云算法通关课 Class 153：有序表专题 6 - 替罪羊树 (Scapegoat Tree)。不自旋的暴力重构美学，alpha 平衡阈值监控、中序拍扁与二分重构。',
  learningGoal: '深刻掌握替罪羊树基于 alpha 倾斜阈值的失衡判定、中序拍扁与分治重构的均摊 O(log N) 势能机制',
  problemHtml: ADVANCED_149_154_PROBLEMS.scapegoatTree.html,
  analysisHtml: ADVANCED_149_154_PROBLEMS.scapegoatTree.html,
  presets: [
    { label: '[10, 20, 30, 40, 50, 60] (连续单调插入触发暴力拍扁)', values: { preset: 'keys_increasing' } },
    { label: '[30, 20, 10, 5, 25] (降序偏斜重构)', values: { preset: 'keys_decreasing' } },
  ],
  codeLanguages: SCAPEGOAT_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'keys_increasing');
    if (preset === 'keys_decreasing') {
      return buildScapegoatSteps([30, 20, 10, 5, 25], 0.7);
    }
    return buildScapegoatSteps([10, 20, 30, 40, 50, 60], 0.7);
  },
  renderCanvas: renderScapegoatTreeCanvas,
});
