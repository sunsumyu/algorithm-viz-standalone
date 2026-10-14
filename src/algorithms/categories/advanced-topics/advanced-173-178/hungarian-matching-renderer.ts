/**
 * Class 175: 二分图最大匹配与匈牙利算法 (Hungarian Algorithm)
 * 增广路交替轨 DFS / 洛谷 P3386 【模板】二分图最大匹配
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_173_178_PROBLEMS } from './advanced-173-178-problem-content';
import { HUNGARIAN_MATCHING_CODES } from './advanced-173-178-stage-codes';
import { buildHungarianSteps, HungarianStep } from '../../../../core/renderers/adapters/hungarian-matching-175-step-compiler';
import { renderHungarianCanvas } from '../../../../core/renderers/adapters/hungarian-matching-175-canvas-adapter';

export { buildHungarianSteps, type HungarianStep };

export const hungarianMatchingVisualizer = registerDeclarativeAlgorithm<HungarianStep>({
  id: 'hungarian-matching-175',
  name: '二分图最大匹配 匈牙利算法 (Class 175)',
  aliases: ['class175-code01', 'hungarian-matching-175', 'hungarian'],
  category: 'graph',
  icon: '🎯',
  difficulty: 3,
  levelOrder: 175,
  description: '左程云算法通关课 Class 175：二分图最大匹配与匈牙利算法。交替轨与增广路翻转，DFS 伴侣腾挪协商机制，König 定理与最小点覆盖。',
  learningGoal: '掌握增广路交替轨核心性质，深刻理解已匹配顶点的递归让位机制与最大匹配与最小割的等价性',
  problemHtml: ADVANCED_173_178_PROBLEMS.hungarianMatching.html,
  analysisHtml: ADVANCED_173_178_PROBLEMS.hungarianMatching.html,
  presets: [
    { label: '3x3 二分图全链交替示例 (最大匹配: 3)', values: { preset: 'bipartite_3x3' } },
  ],
  codeLanguages: HUNGARIAN_MATCHING_CODES,
  generateSteps: () => buildHungarianSteps(),
  renderCanvas: (container, step) => renderHungarianCanvas(container, step),
});
