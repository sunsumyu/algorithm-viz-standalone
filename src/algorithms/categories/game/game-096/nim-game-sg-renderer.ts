/**
 * 尼姆博弈 SG 函数证明 (Nim Game SG) - 声明式教学级沙盘渲染器
 * 核心原理：后继集合为 {0, 1, ..., x - 1}，故 mex 恒为 x，数学证明 SG(x) = x
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GAME_096_PROBLEMS } from './game-096-problem-content';
import { NIM_SG_CODES } from './game-096-stage-codes';
import {
  NimSgStep,
  buildNimSgSteps,
} from '../../../../core/renderers/adapters/nim-game-sg-096-step-compiler';
import { nimGameSg096CanvasAdapter } from '../../../../core/renderers/adapters/nim-game-sg-096-canvas-adapter';

export type { NimSgStep };
export { buildNimSgSteps };

export const nimGameSgVisualizer = registerDeclarativeAlgorithm<NimSgStep>({
  id: 'nim-game-sg-096',
  name: '尼姆博弈 SG 证明 (Nim SG)',
  category: 'game',
  icon: '📐',
  difficulty: 3,
  levelOrder: 962,
  aliases: ['class096-code02', 'nim-game-sg', 'nim-sg'],
  learningGoal: '通过数学归纳法与 mex 算子证明 SG(x) = x 恒成立，揭示 Bouton 定理本质',
  problemHtml: GAME_096_PROBLEMS.nimGameSg.html,
  analysisHtml: GAME_096_PROBLEMS.nimGameSg.html,
  inputs: [
    {
      id: 'input-n',
      label: '单堆石子最大上限 n',
      type: 'number',
      defaultValue: 10,
      min: 1,
      max: 20,
      step: 1,
      placeholder: '例如 10',
    },
  ],
  codeLanguages: NIM_SG_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(1, parseInt(String(inputs?.['input-n'] ?? '10'), 10) || 10);
    return buildNimSgSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: NimSgStep) => {
    nimGameSg096CanvasAdapter.render(stageContainer, step);
  },
});
