/**
 * 三堆石子取斐波那契数 SG 博弈 (Three Stones Pick Fibonacci) - 声明式教学级沙盘渲染器
 * 核心原理：单堆转移集合由斐波那契数限定，三堆局势通过 SG 异或合成
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GAME_096_PROBLEMS } from './game-096-problem-content';
import { THREE_STONES_FIB_CODES } from './game-096-stage-codes';
import {
  ThreeStonesFibStep,
  buildThreeStonesFibSteps,
} from '../../../../core/renderers/adapters/three-stones-fibonacci-096-step-compiler';
import { threeStonesFibonacci096CanvasAdapter } from '../../../../core/renderers/adapters/three-stones-fibonacci-096-canvas-adapter';

export type { ThreeStonesFibStep };
export { buildThreeStonesFibSteps };

export const threeStonesFibonacciVisualizer = registerDeclarativeAlgorithm<ThreeStonesFibStep>({
  id: 'three-stones-fibonacci-096',
  name: '三堆取斐波那契数 SG (Three Stones Fib)',
  category: 'game',
  icon: '🪨',
  difficulty: 3,
  levelOrder: 964,
  aliases: ['class096-code04', 'three-stones-fibonacci', 'hdu-1847-ext'],
  learningGoal: '掌握非传统转移步长（斐波那契数）下的单堆 SG 打表与多堆异或合成',
  problemHtml: GAME_096_PROBLEMS.threeStonesFibonacciSg.html,
  analysisHtml: GAME_096_PROBLEMS.threeStonesFibonacciSg.html,
  inputs: [
    {
      id: 'input-n1',
      label: '第一堆 n1',
      type: 'number',
      defaultValue: 5,
      min: 1,
      max: 20,
      step: 1,
      placeholder: '例如 5',
    },
    {
      id: 'input-n2',
      label: '第二堆 n2',
      type: 'number',
      defaultValue: 7,
      min: 1,
      max: 20,
      step: 1,
      placeholder: '例如 7',
    },
    {
      id: 'input-n3',
      label: '第三堆 n3',
      type: 'number',
      defaultValue: 9,
      min: 1,
      max: 20,
      step: 1,
      placeholder: '例如 9',
    },
  ],
  codeLanguages: THREE_STONES_FIB_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n1 = Math.max(1, parseInt(String(inputs?.['input-n1'] ?? '5'), 10) || 5);
    const n2 = Math.max(1, parseInt(String(inputs?.['input-n2'] ?? '7'), 10) || 7);
    const n3 = Math.max(1, parseInt(String(inputs?.['input-n3'] ?? '9'), 10) || 9);
    return buildThreeStonesFibSteps(n1, n2, n3);
  },
  renderCanvas: (stageContainer: HTMLElement, step: ThreeStonesFibStep) => {
    threeStonesFibonacci096CanvasAdapter.render(stageContainer, step);
  },
});
