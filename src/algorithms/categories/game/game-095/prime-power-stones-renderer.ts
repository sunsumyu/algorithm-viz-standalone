/**
 * 素数幂石子博弈 (Prime Power Stones) - 声明式教学级沙盘渲染器
 * 核心原理：任何素数幂 p^k % 6 != 0，因而 n % 6 != 0 先手必胜，n % 6 == 0 先手必败
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GAME_095_PROBLEMS } from './game-095-problem-content';
import { PRIME_POWER_CODES } from './game-095-stage-codes';
import {
  PrimePowerStep,
  buildPrimePowerSteps,
} from '../../../../core/renderers/adapters/prime-power-stones-095-step-compiler';
import { primePowerStones095CanvasAdapter } from '../../../../core/renderers/adapters/prime-power-stones-095-canvas-adapter';

export type { PrimePowerStep };
export { buildPrimePowerSteps };

export const primePowerStonesVisualizer = registerDeclarativeAlgorithm<PrimePowerStep>({
  id: 'prime-power-stones-095',
  name: '素数幂石子博弈 (Prime Power Game)',
  category: 'game',
  icon: '⚡',
  difficulty: 2,
  levelOrder: 952,
  aliases: ['class095-code02', 'prime-power-stones', 'prime-power-game'],
  learningGoal: '理解素数幂不可整除 6 的数论特性与博弈周期规律打表证明',
  problemHtml: GAME_095_PROBLEMS.primePowerStones.html,
  analysisHtml: GAME_095_PROBLEMS.primePowerStones.html,
  inputs: [
    {
      id: 'input-n',
      label: '石子总数 n',
      type: 'number',
      defaultValue: 14,
      min: 1,
      max: 100,
      step: 1,
      placeholder: '例如 14',
    },
  ],
  codeLanguages: PRIME_POWER_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(1, parseInt(String(inputs?.['input-n'] ?? '14'), 10) || 14);
    return buildPrimePowerSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: PrimePowerStep) => {
    primePowerStones095CanvasAdapter.render(stageContainer, step);
  },
});
