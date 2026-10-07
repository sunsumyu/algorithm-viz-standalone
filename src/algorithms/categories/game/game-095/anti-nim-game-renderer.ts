/**
 * 反尼姆博弈 / SJ 定理 (Anti-Nim Game) - 声明式教学级沙盘渲染器
 * 核心原理：拿最后一颗石子者判负。所有堆<=1看堆数奇偶，存在>1堆看异或和是否非0
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GAME_095_PROBLEMS } from './game-095-problem-content';
import { ANTI_NIM_CODES } from './game-095-stage-codes';
import {
  AntiNimStep,
  buildAntiNimSteps,
} from '../../../../core/renderers/adapters/anti-nim-game-095-step-compiler';
import { antiNimGame095CanvasAdapter } from '../../../../core/renderers/adapters/anti-nim-game-095-canvas-adapter';

export type { AntiNimStep };
export { buildAntiNimSteps };

export const antiNimGameVisualizer = registerDeclarativeAlgorithm<AntiNimStep>({
  id: 'anti-nim-game-095',
  name: '反尼姆博弈 (Anti-Nim / SJ 定理)',
  category: 'game',
  icon: '🪞',
  difficulty: 3,
  levelOrder: 954,
  aliases: ['class095-code04', 'anti-nim-game', 'misere-nim', 'sj-theorem', 'poj-3480'],
  learningGoal: '掌握 Misère 反博弈、SJ (Sprague-Grundy for Misère) 定理与充裕堆控制权',
  problemHtml: GAME_095_PROBLEMS.antiNimGame.html,
  analysisHtml: GAME_095_PROBLEMS.antiNimGame.html,
  inputs: [
    {
      id: 'input-piles',
      label: '各堆石子数 (逗号隔开)',
      type: 'text',
      defaultValue: '1, 1, 1, 1',
      placeholder: '例如 1, 1, 1, 1 或 3, 5, 7',
    },
  ],
  codeLanguages: ANTI_NIM_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-piles'] ?? '1, 1, 1, 1');
    const piles = raw
      .split(/[,，\s]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n > 0);
    return buildAntiNimSteps(piles.length > 0 ? piles : [1, 1, 1, 1]);
  },
  renderCanvas: (stageContainer: HTMLElement, step: AntiNimStep) => {
    antiNimGame095CanvasAdapter.render(stageContainer, step);
  },
});
