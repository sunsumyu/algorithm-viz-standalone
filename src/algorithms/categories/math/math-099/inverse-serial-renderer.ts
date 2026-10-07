/**
 * 线性递推求逆元 (Linear Inverses 1 to n) - 声明式教学级沙盘渲染器
 * 核心原理：inv[i] = (p - floor(p / i)) * inv[p % i] % p，O(n) 线性打表
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_099_PROBLEMS } from './math-099-problem-content';
import { INVERSE_SERIAL_CODES } from './math-099-stage-codes';
import {
  InverseSerialStep,
  buildInverseSerialSteps,
} from '../../../../core/renderers/adapters/inverse-serial-099-step-compiler';
import { inverseSerial099CanvasAdapter } from '../../../../core/renderers/adapters/inverse-serial-099-canvas-adapter';

export type { InverseSerialStep };
export { buildInverseSerialSteps };

export const inverseSerialVisualizer = registerDeclarativeAlgorithm<InverseSerialStep>({
  id: 'inverse-serial-099',
  name: '线性递推求逆元 (Linear Inverses)',
  category: 'math',
  icon: '📈',
  difficulty: 3,
  levelOrder: 992,
  aliases: ['class099-code02', 'inverse-serial', 'linear-inverses', 'luogu-p3811'],
  learningGoal: '掌握带余除法向模逆元递推式 inv[i] = (p - p/i) * inv[p%i] % p 的推导与 O(n) 实现',
  problemHtml: MATH_099_PROBLEMS.inverseSerial.html,
  analysisHtml: MATH_099_PROBLEMS.inverseSerial.html,
  inputs: [
    {
      id: 'input-n',
      label: '递推上限 n',
      type: 'number',
      defaultValue: 10,
      min: 1,
      max: 50,
      step: 1,
      placeholder: '例如 10',
    },
    {
      id: 'input-p',
      label: '模数 p (质数)',
      type: 'number',
      defaultValue: 1000000007,
      min: 2,
      max: 1000000007,
      step: 1,
      placeholder: '例如 1000000007',
    },
  ],
  codeLanguages: INVERSE_SERIAL_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(1, parseInt(String(inputs?.['input-n'] ?? '10'), 10) || 10);
    const p = Math.max(2, parseInt(String(inputs?.['input-p'] ?? '1000000007'), 10) || 1000000007);
    return buildInverseSerialSteps(n, p);
  },
  renderCanvas: (stageContainer: HTMLElement, step: InverseSerialStep) => {
    inverseSerial099CanvasAdapter.render(stageContainer, step);
  },
});
