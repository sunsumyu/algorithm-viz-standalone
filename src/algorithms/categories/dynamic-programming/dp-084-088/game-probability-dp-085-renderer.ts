/**
 * Class 085: 博弈概率 DP 与倒推期望状态 (Game Probability DP)
 * 石子博弈与极大极小定理相对净得分 / LeetCode 486
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_084_088_PROBLEMS } from './dp-084-088-problem-content';
import { GAME_PROBABILITY_085_CODES } from './dp-084-088-stage-codes';
import {
  GameDp085Step,
  buildGameDp085Steps,
} from '../../../../core/renderers/adapters/game-probability-dp-085-step-compiler';
import { gameProbabilityDp085CanvasAdapter } from '../../../../core/renderers/adapters/game-probability-dp-085-canvas-adapter';

export type { GameDp085Step };
export { buildGameDp085Steps };

export const gameProbability085Visualizer = registerDeclarativeAlgorithm<GameDp085Step>({
  id: 'game-probability-dp-085',
  name: '博弈概率 DP 与倒推状态 (Class 085)',
  category: 'dynamic-programming',
  difficulty: 'medium',
  aliases: ['class085-game-dp', 'game-probability-dp', 'stone-game-877', 'leetcode-877'],
  problemContent: DP_084_088_PROBLEMS.gameProbability085,
  sourceCodes: GAME_PROBABILITY_085_CODES,
  generateSteps: buildGameDp085Steps,
  renderCanvas: (container, step) => gameProbabilityDp085CanvasAdapter.render(container, step),
});
