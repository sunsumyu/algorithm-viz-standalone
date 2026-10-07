/**
 * 双堆巴什博弈与 SG 矩阵 (Two Stones Bash Game) - 声明式教学级沙盘渲染器
 * 核心原理：独立游戏 SG 定理，SG(n1, n2) = SG(n1) ^ SG(n2) = (n1 % (m+1)) ^ (n2 % (m+1))
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GAME_096_PROBLEMS } from './game-096-problem-content';
import { TWO_STONES_BASH_CODES } from './game-096-stage-codes';
import {
  TwoStonesBashStep,
  buildTwoStonesBashSteps,
} from '../../../../core/renderers/adapters/two-stones-bash-096-step-compiler';
import { twoStonesBash096CanvasAdapter } from '../../../../core/renderers/adapters/two-stones-bash-096-canvas-adapter';

export type { TwoStonesBashStep };
export { buildTwoStonesBashSteps };

export const twoStonesBashVisualizer = registerDeclarativeAlgorithm<TwoStonesBashStep>({
  id: 'two-stones-bash-096',
  name: '双堆巴什博弈 SG 矩阵 (Two Stones Bash)',
  category: 'game',
  icon: '🧱',
  difficulty: 3,
  levelOrder: 963,
  aliases: ['class096-code03', 'two-stones-bash', 'two-pile-bash'],
  learningGoal: '通过二维 SG 状态转移矩阵理解两个独立博弈子系统的异或合成与对称平衡',
  problemHtml: GAME_096_PROBLEMS.twoStonesBashSg.html,
  analysisHtml: GAME_096_PROBLEMS.twoStonesBashSg.html,
  inputs: [
    {
      id: 'input-n1',
      label: '第一堆石子 n1',
      type: 'number',
      defaultValue: 7,
      min: 0,
      max: 20,
      step: 1,
      placeholder: '例如 7',
    },
    {
      id: 'input-n2',
      label: '第二堆石子 n2',
      type: 'number',
      defaultValue: 5,
      min: 0,
      max: 20,
      step: 1,
      placeholder: '例如 5',
    },
    {
      id: 'input-m',
      label: '单次上限 m',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 6,
      step: 1,
      placeholder: '例如 3',
    },
  ],
  codeLanguages: TWO_STONES_BASH_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n1 = Math.max(0, parseInt(String(inputs?.['input-n1'] ?? '7'), 10) || 7);
    const n2 = Math.max(0, parseInt(String(inputs?.['input-n2'] ?? '5'), 10) || 5);
    const m = Math.max(1, parseInt(String(inputs?.['input-m'] ?? '3'), 10) || 3);
    return buildTwoStonesBashSteps(n1, n2, m);
  },
  renderCanvas: (stageContainer: HTMLElement, step: TwoStonesBashStep) => {
    twoStonesBash096CanvasAdapter.render(stageContainer, step);
  },
});
