/**
 * Class 183: CDQ 分治 (CDQ Divide & Conquer)
 * 三维偏序 (陌上花开) + 归并排序 + 树状数组统计 / 洛谷 P3810 【模板】三维偏序
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_179_184_PROBLEMS } from './advanced-179-184-problem-content';
import { CDQ_DIVIDE_CODES } from './advanced-179-184-stage-codes';
import {
  buildCDQDivideSteps,
  CDQDivideStep,
} from '../../../../core/renderers/adapters/cdq-divide-183-step-compiler';
import { renderCDQDivideCanvas } from '../../../../core/renderers/adapters/cdq-divide-183-canvas-adapter';

export { buildCDQDivideSteps, type CDQDivideStep };

export const cdqDivideVisualizer = registerDeclarativeAlgorithm<CDQDivideStep>({
  id: 'cdq-divide-183',
  name: 'CDQ 分治 (CDQ Divide & Conquer / Class 183)',
  aliases: ['class183-code01', 'cdq-divide-183', 'cdq-divide-conquer'],
  category: 'search',
  icon: '🎯',
  difficulty: 3,
  levelOrder: 183,
  description: '左程云算法通关课 Class 183：CDQ 分治 (CDQ Divide & Conquer)。三维偏序陌上花开，第一维排序+第二维归并+第三维树状数组统计，降维解决多维空间偏序。',
  learningGoal: '掌握 CDQ 分治计算左区间对右区间贡献的思想、双指针归并排序与树状数组动态维护',
  problemHtml: ADVANCED_179_184_PROBLEMS.cdqDivide.html,
  analysisHtml: ADVANCED_179_184_PROBLEMS.cdqDivide.html,
  inputs: [
    {
      id: 'preset',
      label: '三维点集预设',
      type: 'select',
      defaultValue: 'points_4',
      options: [
        { label: '4 点三维偏序测试集', value: 'points_4' },
      ],
    },
  ],
  codeLanguages: CDQ_DIVIDE_CODES,
  generateSteps: () => buildCDQDivideSteps(),
  renderCanvas: (container, step) => renderCDQDivideCanvas(container, step),
});
