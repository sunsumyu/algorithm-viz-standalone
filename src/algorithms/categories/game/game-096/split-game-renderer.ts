/**
 * 分裂石子游戏 SG 函数复合 (Split Game SG) - 声明式教学级沙盘渲染器
 * 核心原理：一分为二裂变博弈，单状态 SG(x) = mex{ SG(y) ^ SG(z) | y + z = x }
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GAME_096_PROBLEMS } from './game-096-problem-content';
import { SPLIT_GAME_CODES } from './game-096-stage-codes';
import {
  SplitGameStep,
  buildSplitGameSteps,
} from '../../../../core/renderers/adapters/split-game-096-step-compiler';
import { splitGame096CanvasAdapter } from '../../../../core/renderers/adapters/split-game-096-canvas-adapter';

export type { SplitGameStep };
export { buildSplitGameSteps };

export const splitGameVisualizer = registerDeclarativeAlgorithm<SplitGameStep>({
  id: 'split-game-sg-096',
  name: '分裂石子游戏 SG (Split Game)',
  category: 'game',
  icon: '🪓',
  difficulty: 3,
  levelOrder: 966,
  aliases: ['class096-code06', 'split-game-sg', 'split-stones-game', 'poj-2311'],
  learningGoal: '掌握游戏裂变为两个平行子游戏的 SG 函数异或合成与状态空间递归树解析',
  problemHtml: GAME_096_PROBLEMS.splitGameSg.html,
  analysisHtml: GAME_096_PROBLEMS.splitGameSg.html,
  inputs: [
    {
      id: 'input-n',
      label: '石子数量 n',
      type: 'number',
      defaultValue: 10,
      min: 2,
      max: 20,
      step: 1,
      placeholder: '例如 10',
    },
  ],
  codeLanguages: SPLIT_GAME_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(2, parseInt(String(inputs?.['input-n'] ?? '10'), 10) || 10);
    return buildSplitGameSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: SplitGameStep) => {
    splitGame096CanvasAdapter.render(stageContainer, step);
  },
});
