/**
 * Class 159: 莫队算法 (Mo's Algorithm)
 * 莫涛发明 / 洛谷 P1494 [国家集训队] 小 Z 的袜子
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_155_160_PROBLEMS } from './advanced-155-160-problem-content';
import { MO_ALGORITHM_CODES } from './advanced-155-160-stage-codes';
import { MoStep, buildMoSteps } from '../../../../core/renderers/adapters/mo-algorithm-step-compiler';
import { renderMoCanvas } from '../../../../core/renderers/adapters/mo-algorithm-canvas-adapter';

export type { MoStep };
export { buildMoSteps };

export const moAlgorithmVisualizer = registerDeclarativeAlgorithm<MoStep>({
  id: 'mo-algorithm-159',
  name: '莫队算法 (Class 159)',
  aliases: ['class159-code01', 'mo-algorithm-159'],
  category: 'search',
  icon: '🔍',
  difficulty: 3,
  levelOrder: 159,
  description: '左程云算法通关课 Class 159：莫队算法与离线分块。莫涛发明，奇偶排序块双指针平滑移动，O(N sqrt(Q)) 优雅解决区间无修改离线统计。',
  learningGoal: '深刻理解莫队算法的分块划分原理与奇偶排序优化，掌握双指针 [L, R] 的四向伸缩转移机制',
  problemHtml: ADVANCED_155_160_PROBLEMS.moAlgorithm.html,
  analysisHtml: ADVANCED_155_160_PROBLEMS.moAlgorithm.html,
  presets: [
    { label: '8 元素 4 询问测试 ([1, 2, 1, 1, 1, 2, 3, 2])', values: { preset: 'mo_standard' } },
  ],
  codeLanguages: MO_ALGORITHM_CODES,
  generateSteps: () => {
    const arr = [1, 2, 1, 1, 1, 2, 3, 2];
    const queries = [
      { l: 0, r: 2, id: 1 },
      { l: 1, r: 4, id: 2 },
      { l: 2, r: 6, id: 3 },
      { l: 3, r: 7, id: 4 },
    ];
    return buildMoSteps(arr, queries);
  },
  renderCanvas: renderMoCanvas,
});
