/**
 * Class 176: 二分图最大权完美匹配 KM 算法 (Kuhn-Munkres)
 * 顶标理论与相等子图 / 洛谷 P6577 【模板】二分图最大权完美匹配
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_173_178_PROBLEMS } from './advanced-173-178-problem-content';
import { KM_MATCHING_CODES } from './advanced-173-178-stage-codes';
import { buildKMSteps, KMStep } from '../../../../core/renderers/adapters/km-matching-176-step-compiler';
import { renderKMCanvas } from '../../../../core/renderers/adapters/km-matching-176-canvas-adapter';

export { buildKMSteps, type KMStep };

export const kmMatchingVisualizer = registerDeclarativeAlgorithm<KMStep>({
  id: 'km-matching-176',
  name: '二分图最大权完美匹配 KM 算法 (Class 176)',
  aliases: ['class176-code01', 'km-matching-176', 'km-algorithm'],
  category: 'graph',
  icon: '⚖️',
  difficulty: 3,
  levelOrder: 176,
  description: '左程云算法通关课 Class 176：二分图最大权完美匹配 KM 算法 (Kuhn-Munkres)。顶标维护 Lx + Ly >= W，相等子图寻找增广轨，O(N^3) 极速求出最大权重。',
  learningGoal: '掌握顶标可行性准则与相等子图增广机制，深刻理解最小松弛量 slack 调整顶标打破僵局的对偶优化思想',
  problemHtml: ADVANCED_173_178_PROBLEMS.kmMatching.html,
  analysisHtml: ADVANCED_173_178_PROBLEMS.kmMatching.html,
  inputs: [
    {
      id: 'preset',
      label: '带权完全二分图矩阵',
      type: 'select',
      defaultValue: 'matrix_3x3',
      options: [
        { label: '3x3 带权完全二分图 (最优权值: 15)', value: 'matrix_3x3' },
      ],
    },
  ],
  codeLanguages: KM_MATCHING_CODES,
  generateSteps: () => buildKMSteps(),
  renderCanvas: (container, step) => renderKMCanvas(container, step),
});
