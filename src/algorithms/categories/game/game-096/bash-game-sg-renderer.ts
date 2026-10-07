/**
 * 巴什博弈与 SG 函数打表 (Bash Game SG) - 声明式教学级沙盘渲染器
 * 核心原理：后继状态取 mex，自底向上严格归纳出 SG(x) = x % (m + 1)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GAME_096_PROBLEMS } from './game-096-problem-content';
import { BASH_SG_CODES } from './game-096-stage-codes';
import {
  BashSgStep,
  buildBashSgSteps,
} from '../../../../core/renderers/adapters/bash-game-sg-096-step-compiler';
import { bashGameSg096CanvasAdapter } from '../../../../core/renderers/adapters/bash-game-sg-096-canvas-adapter';

export type { BashSgStep };
export { buildBashSgSteps };

export const bashGameSgVisualizer = registerDeclarativeAlgorithm<BashSgStep>({
  id: 'bash-game-sg-096',
  name: '巴什博弈 SG 打表 (Bash SG)',
  category: 'game',
  icon: '🧮',
  difficulty: 3,
  levelOrder: 961,
  aliases: ['class096-code01', 'bash-game-sg', 'bash-sg'],
  learningGoal: '通过自底向上推导与 mex 算子观察巴什博弈 SG(x) = x % (m+1) 周期性的诞生',
  problemHtml: GAME_096_PROBLEMS.bashGameSg.html,
  analysisHtml: GAME_096_PROBLEMS.bashGameSg.html,
  inputs: [
    {
      id: 'input-n',
      label: '打表石子数 n',
      type: 'number',
      defaultValue: 12,
      min: 1,
      max: 30,
      step: 1,
      placeholder: '例如 12',
    },
    {
      id: 'input-m',
      label: '单次上限 m',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 10,
      step: 1,
      placeholder: '例如 3',
    },
  ],
  codeLanguages: BASH_SG_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(1, parseInt(String(inputs?.['input-n'] ?? '12'), 10) || 12);
    const m = Math.max(1, parseInt(String(inputs?.['input-m'] ?? '3'), 10) || 3);
    return buildBashSgSteps(n, m);
  },
  renderCanvas: (stageContainer: HTMLElement, step: BashSgStep) => {
    bashGameSg096CanvasAdapter.render(stageContainer, step);
  },
});
