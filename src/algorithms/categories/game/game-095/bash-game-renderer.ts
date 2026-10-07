/**
 * 巴什博弈 (Bash Game) - 声明式教学级沙盘渲染器
 * 核心原理：n % (m + 1) != 0 则先手必胜
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GAME_095_PROBLEMS } from './game-095-problem-content';
import { BASH_GAME_CODES } from './game-095-stage-codes';
import {
  BashGameStep,
  buildBashGameSteps,
} from '../../../../core/renderers/adapters/bash-game-095-step-compiler';
import { bashGame095CanvasAdapter } from '../../../../core/renderers/adapters/bash-game-095-canvas-adapter';

export type { BashGameStep };
export { buildBashGameSteps };

export const bashGameVisualizer = registerDeclarativeAlgorithm<BashGameStep>({
  id: 'bash-game-095',
  name: '巴什博弈 (Bash Game)',
  category: 'game',
  icon: '🪨',
  difficulty: 2,
  levelOrder: 951,
  aliases: ['class095-code01', 'bash-game', 'hdu-1846'],
  learningGoal: '掌握经典巴什博弈的周期剩余与互补配对制胜原理',
  problemHtml: GAME_095_PROBLEMS.bashGame.html,
  analysisHtml: GAME_095_PROBLEMS.bashGame.html,
  inputs: [
    {
      id: 'input-n',
      label: '石子总数 n',
      type: 'number',
      defaultValue: 15,
      min: 1,
      max: 100,
      step: 1,
      placeholder: '例如 15',
    },
    {
      id: 'input-m',
      label: '单次上限 m',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 20,
      step: 1,
      placeholder: '例如 3',
    },
  ],
  codeLanguages: BASH_GAME_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(1, parseInt(String(inputs?.['input-n'] ?? '15'), 10) || 15);
    const m = Math.max(1, parseInt(String(inputs?.['input-m'] ?? '3'), 10) || 3);
    return buildBashGameSteps(n, m);
  },
  renderCanvas: (stageContainer: HTMLElement, step: BashGameStep) => {
    bashGame095CanvasAdapter.render(stageContainer, step);
  },
});
