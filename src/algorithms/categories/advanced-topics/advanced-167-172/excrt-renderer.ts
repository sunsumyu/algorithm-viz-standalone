/**
 * Class 168: 扩展中国剩余定理 (EXCRT / Extended Chinese Remainder Theorem)
 * 模数不保证互质的同余方程组求解 / 洛谷 P4777 【模板】扩展中国剩余定理
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_167_172_PROBLEMS } from './advanced-167-172-problem-content';
import { EXCRT_CODES } from './advanced-167-172-stage-codes';
import { buildEXCRTSteps, EXCRTStep } from '../../../../core/renderers/adapters/excrt-step-compiler';
import { renderEXCRTCanvas } from '../../../../core/renderers/adapters/excrt-canvas-adapter';

export { buildEXCRTSteps, type EXCRTStep };

export const excrtVisualizer = registerDeclarativeAlgorithm<EXCRTStep>({
  id: 'excrt-theorem-168',
  name: '扩展中国剩余定理 EXCRT (Class 168)',
  aliases: ['class168-code01', 'excrt-theorem-168', 'excrt'],
  category: 'math',
  icon: '🧩',
  difficulty: 3,
  levelOrder: 168,
  description: '左程云算法通关课 Class 168：扩展中国剩余定理 (EXCRT)。解决模数不两两互质的线性同余方程组求解，双方程递推合并，exgcd 维护通解。',
  learningGoal: '掌握双方程合并代数构造模型，理解差值被公约数整除性判定无解与模数最小公倍数扩展',
  problemHtml: ADVANCED_167_172_PROBLEMS.excrt.html,
  analysisHtml: ADVANCED_167_172_PROBLEMS.excrt.html,
  presets: [
    { label: 'x=2(mod 4), x=4(mod 6), x=1(mod 5) (结果: 46, 不互质)', values: { preset: 'eq_4_6_5' } },
    { label: 'x=2(mod 3), x=3(mod 5), x=2(mod 7) (结果: 23, 互质测试)', values: { preset: 'eq_coprime' } },
  ],
  codeLanguages: EXCRT_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'eq_4_6_5');
    if (preset === 'eq_coprime') {
      return buildEXCRTSteps([
        { m: 3, r: 2 },
        { m: 5, r: 3 },
        { m: 7, r: 2 },
      ]);
    }
    return buildEXCRTSteps([
      { m: 4, r: 2 },
      { m: 6, r: 4 },
      { m: 5, r: 1 },
    ]);
  },
  renderCanvas: (container, step) => renderEXCRTCanvas(container, step),
});
