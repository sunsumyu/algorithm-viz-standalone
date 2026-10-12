/**
 * Class 142: 差分约束系统与负环判定 (Difference Constraints System & SPFA Negative Cycle)
 * 洛谷 P5960 【模板】差分约束算法 / POJ 3159 Candies
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_142_148_PROBLEMS } from './advanced-142-148-problem-content';
import { DIFF_CONSTRAINTS_CODES } from './advanced-142-148-stage-codes';
import {
  DiffConstraintsEdge,
  DiffConstraintsStep,
  buildDiffConstraintsSteps,
} from '../../../../core/renderers/adapters/diff-constraints-system-step-compiler';
import { renderDiffConstraintsCanvas } from '../../../../core/renderers/adapters/diff-constraints-system-canvas-adapter';

export type { DiffConstraintsEdge, DiffConstraintsStep };
export { buildDiffConstraintsSteps };

export const diffConstraintsVisualizer = registerDeclarativeAlgorithm<DiffConstraintsStep>({
  id: 'diff-constraints-system-142',
  name: '差分约束系统与负环判定 (Class 142)',
  aliases: ['class142-code01', 'diff-constraints-system', 'diff-constraints-system-142', 'difference-constraints'],
  category: 'graph',
  icon: '🌐',
  difficulty: 3,
  levelOrder: 142,
  description: '左程云算法通关课 Class 142：差分约束系统与 SPFA 负环判定。将一组不等式 x_v - x_u <= w 映射为有向图最短路，利用超级源点与入队次数判定是否存在可行解。',
  learningGoal: '深刻理解差分约束系统与最短路松弛不等式的双射转化，掌握 SPFA 负环检测判别机制',
  problemHtml: ADVANCED_142_148_PROBLEMS.diffConstraints.html,
  analysisHtml: ADVANCED_142_148_PROBLEMS.diffConstraints.html,
  inputs: [
    {
      id: 'preset',
      label: '约束方程预设用例',
      type: 'select',
      defaultValue: 'solvable_system',
      options: [
        { label: '有解系统 (3变量, 正权无负环)', value: 'solvable_system' },
        { label: '矛盾无解系统 (3变量, 存在负权环)', value: 'negative_cycle_system' },
      ],
    },
  ],
  codeLanguages: DIFF_CONSTRAINTS_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'solvable_system');
    if (preset === 'negative_cycle_system') {
      return buildDiffConstraintsSteps(3, [
        { u: 1, v: 2, w: 1 },
        { u: 2, v: 3, w: -4 },
        { u: 3, v: 1, w: 2 },
      ]);
    }
    return buildDiffConstraintsSteps(3, [
      { u: 1, v: 2, w: 3 },
      { u: 2, v: 3, w: -2 },
      { u: 3, v: 1, w: 1 },
    ]);
  },
  renderCanvas: renderDiffConstraintsCanvas,
});
