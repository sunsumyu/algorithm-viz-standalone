/**
 * Class 165: 莫比乌斯反演 (Möbius Inversion)
 * sum_{d} mu(d) * floor(n/d) * floor(m/d) / 洛谷 P3455 [POI2007] ZAP-Queries
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_161_166_PROBLEMS } from './advanced-161-166-problem-content';
import { MOBIUS_INVERSION_CODES } from './advanced-161-166-stage-codes';
import { MobiusStep, buildMobiusSteps } from '../../../../core/renderers/adapters/mobius-inversion-step-compiler';
import { renderMobiusInversionCanvas } from '../../../../core/renderers/adapters/mobius-inversion-canvas-adapter';

export type { MobiusStep };
export { buildMobiusSteps };

export const mobiusInversionVisualizer = registerDeclarativeAlgorithm<MobiusStep>({
  id: 'mobius-inversion-165',
  name: '莫比乌斯反演 (Class 165)',
  aliases: ['class165-code01', 'mobius-inversion-165', 'mobius-inversion'],
  category: 'math',
  icon: '🔍',
  difficulty: 3,
  levelOrder: 165,
  description: '左程云算法通关课 Class 165：莫比乌斯反演。利用因数容斥性质 sum_{d|n} mu(d) = [n=1]，配合二维数论分块，O(sqrt(N)+sqrt(M)) 极速统计区间互质数对。',
  learningGoal: '掌握莫比乌斯函数因数容斥本质，理解整除分块在二维双曲区域内的公共跳跃区间划分技巧',
  problemHtml: ADVANCED_161_166_PROBLEMS.mobiusInversion.html,
  analysisHtml: ADVANCED_161_166_PROBLEMS.mobiusInversion.html,
  inputs: [
    {
      id: 'preset',
      label: '矩形区域 N 与 M 规模',
      type: 'select',
      defaultValue: 'rect_6x8',
      options: [
        { label: 'N = 6, M = 8 (标准互质 32 对测试)', value: 'rect_6x8' },
        { label: 'N = 10, M = 10 (方阵互质 63 对测试)', value: 'rect_10x10' },
        { label: 'N = 5, M = 5 (小规模方阵互质 19 对)', value: 'rect_5x5' },
      ],
    },
  ],
  codeLanguages: MOBIUS_INVERSION_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'rect_6x8');
    if (preset === 'rect_10x10') return buildMobiusSteps(10, 10);
    if (preset === 'rect_5x5') return buildMobiusSteps(5, 5);
    return buildMobiusSteps(6, 8);
  },
  renderCanvas: renderMobiusInversionCanvas,
});
