/**
 * 斐波那契博弈 (Fibonacci Game) - 声明式教学级沙盘渲染器
 * 核心原理：齐肯多夫定理，n 为斐波那契数则先手必败；非斐波那契数则先手必胜（首步取最小分解项）
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GAME_095_PROBLEMS } from './game-095-problem-content';
import { FIBONACCI_GAME_CODES } from './game-095-stage-codes';
import {
  FibonacciStep,
  buildFibonacciSteps,
} from '../../../../core/renderers/adapters/fibonacci-game-095-step-compiler';
import { fibonacciGame095CanvasAdapter } from '../../../../core/renderers/adapters/fibonacci-game-095-canvas-adapter';

export type { FibonacciStep };
export { buildFibonacciSteps };

export const fibonacciGameVisualizer = registerDeclarativeAlgorithm<FibonacciStep>({
  id: 'fibonacci-game-095',
  name: '斐波那契博弈 (Fibonacci Game)',
  category: 'game',
  icon: '🌀',
  difficulty: 3,
  levelOrder: 955,
  aliases: ['class095-code05', 'fibonacci-game', 'zeckendorf-game'],
  learningGoal: '掌握齐肯多夫定理 (Zeckendorf) 唯一不连续斐波那契分解与必胜步取法',
  problemHtml: GAME_095_PROBLEMS.fibonacciGame.html,
  analysisHtml: GAME_095_PROBLEMS.fibonacciGame.html,
  inputs: [
    {
      id: 'input-n',
      label: '石子总数 n',
      type: 'number',
      defaultValue: 16,
      min: 2,
      max: 200,
      step: 1,
      placeholder: '例如 13 或 16',
    },
  ],
  codeLanguages: FIBONACCI_GAME_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(2, parseInt(String(inputs?.['input-n'] ?? '16'), 10) || 16);
    return buildFibonacciSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: FibonacciStep) => {
    fibonacciGame095CanvasAdapter.render(stageContainer, step);
  },
});
