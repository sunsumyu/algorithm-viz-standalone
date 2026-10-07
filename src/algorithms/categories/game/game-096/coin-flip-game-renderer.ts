/**
 * 欧几里得翻硬币博弈 (Coin Flip Game SG) - 声明式教学级沙盘渲染器
 * 核心原理：翻硬币博弈分解定理，多硬币综合 SG 值为所有正面硬币位置独立 SG 值的异或和
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GAME_096_PROBLEMS } from './game-096-problem-content';
import { COIN_FLIP_CODES } from './game-096-stage-codes';
import {
  CoinFlipStep,
  buildCoinFlipSteps,
} from '../../../../core/renderers/adapters/coin-flip-game-096-step-compiler';
import { coinFlipGame096CanvasAdapter } from '../../../../core/renderers/adapters/coin-flip-game-096-canvas-adapter';

export type { CoinFlipStep };
export { buildCoinFlipSteps };

export const coinFlipGameVisualizer = registerDeclarativeAlgorithm<CoinFlipStep>({
  id: 'coin-flip-game-sg-096',
  name: '翻硬币博弈 SG 分解 (Coin Flip Game)',
  category: 'game',
  icon: '🪙',
  difficulty: 3,
  levelOrder: 965,
  aliases: ['class096-code05', 'coin-flip-game', 'coin-flip-sg', 'turning-turtles'],
  learningGoal: '掌握翻硬币博弈独立可加性与 Turning Turtles 正面朝上位置 SG 异或合成',
  problemHtml: GAME_096_PROBLEMS.coinFlipGameSg.html,
  analysisHtml: GAME_096_PROBLEMS.coinFlipGameSg.html,
  inputs: [
    {
      id: 'input-coins',
      label: '硬币状态序列 (0/1，逗号隔开)',
      type: 'text',
      defaultValue: '1, 0, 1, 1, 0, 1',
      placeholder: '例如 1, 0, 1, 1, 0, 1',
    },
  ],
  codeLanguages: COIN_FLIP_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-coins'] ?? '1, 0, 1, 1, 0, 1');
    const coins = raw
      .split(/[,，\s]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => n === 0 || n === 1);
    return buildCoinFlipSteps(coins.length > 0 ? coins : [1, 0, 1, 1, 0, 1]);
  },
  renderCanvas: (stageContainer: HTMLElement, step: CoinFlipStep) => {
    coinFlipGame096CanvasAdapter.render(stageContainer, step);
  },
});
