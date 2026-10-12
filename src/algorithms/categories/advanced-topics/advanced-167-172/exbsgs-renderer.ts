/**
 * Class 169: 扩展 BSGS (EXBSGS / Extended Baby-step Giant-step)
 * 底数与模数不互质的离散对数求解 / 洛谷 P4195 【模板】扩展 BSGS
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_167_172_PROBLEMS } from './advanced-167-172-problem-content';
import { EXBSGS_CODES } from './advanced-167-172-stage-codes';
import { buildEXBSGSSteps, EXBSGSStep } from '../../../../core/renderers/adapters/exbsgs-step-compiler';
import { renderEXBSGSCanvas } from '../../../../core/renderers/adapters/exbsgs-canvas-adapter';

export { buildEXBSGSSteps, type EXBSGSStep };

export const exbsgsVisualizer = registerDeclarativeAlgorithm<EXBSGSStep>({
  id: 'exbsgs-algorithm-169',
  name: '扩展 BSGS (Class 169)',
  aliases: ['class169-code01', 'exbsgs-algorithm-169', 'exbsgs'],
  category: 'math',
  icon: '🔍',
  difficulty: 3,
  levelOrder: 169,
  description: '左程云算法通关课 Class 169：扩展 BSGS (EXBSGS)。解决底数与模数不互质的离散对数方程 a^x = b (mod p)，提取公因子降模并转化为标准 BSGS。',
  learningGoal: '掌握同余公因子消除与方程可解性判定准则，理解常数因子前缀折半与标准大步小步法衔接',
  problemHtml: ADVANCED_167_172_PROBLEMS.exbsgs.html,
  analysisHtml: ADVANCED_167_172_PROBLEMS.exbsgs.html,
  inputs: [
    {
      id: 'preset',
      label: '离散对数方程参数',
      type: 'select',
      defaultValue: 'exbsgs_2_4_12',
      options: [
        { label: '2^x = 4 (mod 12) (不互质，结果: 2)', value: 'exbsgs_2_4_12' },
        { label: '2^x = 2 (mod 4) (不互质，结果: 1)', value: 'exbsgs_2_2_4' },
        { label: '2^x = 3 (mod 4) (公因子无法整除，无解: -1)', value: 'exbsgs_2_3_4' },
      ],
    },
  ],
  codeLanguages: EXBSGS_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'exbsgs_2_4_12');
    if (preset === 'exbsgs_2_2_4') return buildEXBSGSSteps(2, 2, 4);
    if (preset === 'exbsgs_2_3_4') return buildEXBSGSSteps(2, 3, 4);
    return buildEXBSGSSteps(2, 4, 12);
  },
  renderCanvas: (container, step) => renderEXBSGSCanvas(container, step),
});
