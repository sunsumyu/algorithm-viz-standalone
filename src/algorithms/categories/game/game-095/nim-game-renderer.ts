/**
 * 经典尼姆博弈 (Nim Game) - 声明式教学级沙盘渲染器
 * 核心原理：Bouton 定理，所有石子堆的按位异或和 X != 0 则先手必胜
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GAME_095_PROBLEMS } from './game-095-problem-content';
import { NIM_GAME_CODES } from './game-095-stage-codes';
import {
  NimGameStep,
  buildNimGameSteps,
} from '../../../../core/renderers/adapters/nim-game-095-step-compiler';
import { nimGame095CanvasAdapter } from '../../../../core/renderers/adapters/nim-game-095-canvas-adapter';

export type { NimGameStep };
export { buildNimGameSteps };

export const nimGameVisualizer = registerDeclarativeAlgorithm<NimGameStep>({
  id: 'nim-game-095',
  name: '经典尼姆博弈 (Nim Game)',
  category: 'game',
  icon: '🎲',
  difficulty: 3,
  levelOrder: 953,
  aliases: ['class095-code03', 'nim-game', 'nim-game-292', 'leetcode-292', 'hdu-1850'],
  learningGoal: '深刻理解 Bouton 异或和定理、必胜态转化与二进制平衡拆解',
  problemHtml: GAME_095_PROBLEMS.nimGame.html,
  analysisHtml: GAME_095_PROBLEMS.nimGame.html,
  inputs: [
    {
      id: 'input-piles',
      label: '各堆石子数 (逗号隔开)',
      type: 'text',
      defaultValue: '3, 4, 5',
      placeholder: '例如 3, 4, 5',
    },
  ],
  codeLanguages: NIM_GAME_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-piles'] ?? '3, 4, 5');
    const piles = raw
      .split(/[,，\s]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n > 0);
    return buildNimGameSteps(piles.length > 0 ? piles : [3, 4, 5]);
  },
  renderCanvas: (stageContainer: HTMLElement, step: NimGameStep) => {
    nimGame095CanvasAdapter.render(stageContainer, step);
  },
});
