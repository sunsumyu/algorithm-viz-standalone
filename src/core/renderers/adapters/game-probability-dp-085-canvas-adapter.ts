/**
 * Class 085: 博弈概率 DP 与倒推期望状态 (Game Probability DP) CanvasAdapter
 * 职责：挂载与更新极大极小石子博弈看板及数学公式卡
 */

import { GameDp085Step } from './game-probability-dp-085-step-compiler';
import { renderGameProbabilityBoard } from '../../../algorithms/categories/dynamic-programming/dp-084-088/dp-084-088-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export class GameProbabilityDp085CanvasAdapter {
  render(container: HTMLElement, step: GameDp085Step): void {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderGameProbabilityBoard(
          step.nums,
          step.i,
          step.j,
          step.pickLeftScore,
          step.pickRightScore,
          step.bestDiff
        )}
        ${renderFormulaCard(
          '零和博弈极大极小转移定理',
          'dp[i][j] = \\max \\{ nums[i] - dp[i+1][j], \\; nums[j] - dp[i][j-1] \\}',
          '由于对手同样采取最优策略，当前行动方拿走一端石子后，在剩余区间中对手将作为先手获得最佳相对净得分。因此当前方获得的净得分为自身拿走的数值减去对手在下一轮所能取得的最大优势。'
        )}
      </div>
    `;
  }
}

export const gameProbabilityDp085CanvasAdapter = new GameProbabilityDp085CanvasAdapter();
