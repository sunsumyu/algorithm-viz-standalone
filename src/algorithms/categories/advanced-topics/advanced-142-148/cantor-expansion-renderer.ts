/**
 * Class 146: 康托展开与逆康托展开 (Cantor Expansion)
 * 洛谷 P5367 【模板】康托展开 / 洛谷 P3014 [USACO11FEB] Cow Line G
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_142_148_PROBLEMS } from './advanced-142-148-problem-content';
import { CANTOR_EXPANSION_CODES } from './advanced-142-148-stage-codes';
import {
  CantorStep,
  buildCantorSteps,
} from '../../../../core/renderers/adapters/cantor-expansion-step-compiler';
import { renderCantorExpansionCanvas } from '../../../../core/renderers/adapters/cantor-expansion-canvas-adapter';

export type { CantorStep };
export { buildCantorSteps };

export const cantorExpansionVisualizer = registerDeclarativeAlgorithm<CantorStep>({
  id: 'cantor-expansion-146',
  name: '康托展开与逆康托展开 (Class 146)',
  aliases: ['class146-code01', 'cantor-expansion', 'cantor-expansion-146', 'cantor-ranking'],
  category: 'math',
  icon: '🔢',
  difficulty: 2,
  levelOrder: 146,
  description: '左程云算法通关课 Class 146：康托展开与逆展开。将一个全排列双射映射为其在全体全排列中的字典序序号，基于阶乘变进制数展开。',
  learningGoal: '掌握康托展开与逆展开在变进制阶乘数系统中的双射映射与字典序排名算法',
  problemHtml: ADVANCED_142_148_PROBLEMS.cantorExpansion.html,
  analysisHtml: ADVANCED_142_148_PROBLEMS.cantorExpansion.html,
  inputs: [
    {
      id: 'preset',
      label: '输入全排列预设',
      type: 'select',
      defaultValue: 'perm_34152',
      options: [
        { label: '[3, 4, 1, 5, 2] (5元素典型用例)', value: 'perm_34152' },
        { label: '[2, 4, 1, 3] (4元素用例)', value: 'perm_2413' },
        { label: '[1, 2, 3, 4] (最小初始全排列)', value: 'perm_1234' },
      ],
    },
  ],
  codeLanguages: CANTOR_EXPANSION_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'perm_34152');
    if (preset === 'perm_2413') {
      return buildCantorSteps([2, 4, 1, 3]);
    }
    if (preset === 'perm_1234') {
      return buildCantorSteps([1, 2, 3, 4]);
    }
    return buildCantorSteps([3, 4, 1, 5, 2]);
  },
  renderCanvas: (container, step) => {
    renderCantorExpansionCanvas(container, step);
  },
});
