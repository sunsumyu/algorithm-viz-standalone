/**
 * 威佐夫博弈 (Wythoff Game) - 声明式教学级沙盘渲染器
 * 核心原理：黄金分割比 phi = (sqrt(5)+1)/2，两堆差值 k = b - a，奇异局势 ak = floor(k * phi)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GAME_095_PROBLEMS } from './game-095-problem-content';
import { WYTHOFF_GAME_CODES } from './game-095-stage-codes';
import {
  WythoffStep,
  buildWythoffSteps,
} from '../../../../core/renderers/adapters/wythoff-game-095-step-compiler';
import { wythoffGame095CanvasAdapter } from '../../../../core/renderers/adapters/wythoff-game-095-canvas-adapter';

export type { WythoffStep };
export { buildWythoffSteps };

export const wythoffGameVisualizer = registerDeclarativeAlgorithm<WythoffStep>({
  id: 'wythoff-game-095',
  name: '威佐夫博弈 (Wythoff Game)',
  category: 'game',
  icon: '⚖️',
  difficulty: 3,
  levelOrder: 956,
  aliases: ['class095-code06', 'wythoff-game', 'poj-1067'],
  learningGoal: '领略黄金分割比 phi 在威佐夫博弈奇异局势生成中的精妙数学对应',
  problemHtml: GAME_095_PROBLEMS.wythoffGame.html,
  analysisHtml: GAME_095_PROBLEMS.wythoffGame.html,
  inputs: [
    {
      id: 'input-a',
      label: '第一堆石子 a',
      type: 'number',
      defaultValue: 3,
      min: 0,
      max: 100,
      step: 1,
      placeholder: '例如 3',
    },
    {
      id: 'input-b',
      label: '第二堆石子 b',
      type: 'number',
      defaultValue: 5,
      min: 0,
      max: 100,
      step: 1,
      placeholder: '例如 5',
    },
  ],
  codeLanguages: WYTHOFF_GAME_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const a = Math.max(0, parseInt(String(inputs?.['input-a'] ?? '3'), 10) || 0);
    const b = Math.max(0, parseInt(String(inputs?.['input-b'] ?? '5'), 10) || 0);
    return buildWythoffSteps(a, b);
  },
  renderCanvas: (stageContainer: HTMLElement, step: WythoffStep) => {
    wythoffGame095CanvasAdapter.render(stageContainer, step);
  },
});
