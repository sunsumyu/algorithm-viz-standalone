/**
 * Class 085: 博弈概率 DP 与倒推期望状态 (Game Probability DP)
 * 石子博弈与极大极小定理相对净得分 / LeetCode 486
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_084_088_PROBLEMS } from './dp-084-088-problem-content';
import { GAME_PROBABILITY_085_CODES, GAME_PROBABILITY_085_LINES } from './dp-084-088-stage-codes';
import { Dp084Step, renderGameProbabilityBoard } from './dp-084-088-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface GameDp085Step extends Dp084Step {
  nums: number[];
  i: number;
  j: number;
  pickLeftScore: number;
  pickRightScore: number;
  bestDiff: number;
}

export function buildGameDp085Steps(): GameDp085Step[] {
  const steps: GameDp085Step[] = [];
  const lines = GAME_PROBABILITY_085_LINES;

  const nums = [1, 5, 2];
  // 长度为 1: dp[0][0]=1, dp[1][1]=5, dp[2][2]=2
  // 长度为 2:
  // [0, 1]: max(1 - 5, 5 - 1) = max(-4, 4) = 4
  // [1, 2]: max(5 - 2, 2 - 5) = max(3, -3) = 3
  // 长度为 3:
  // [0, 2]:
  // 左拿 nums[0]=1: 1 - dp[1][2] = 1 - 3 = -2
  // 右拿 nums[2]=2: 2 - dp[0][1] = 2 - 4 = -2
  // max(-2, -2) = -2 < 0 -> 先手必败！

  // Step 0: 入口与初始化
  steps.push({
    nums,
    i: 0,
    j: 2,
    pickLeftScore: 0,
    pickRightScore: 0,
    bestDiff: 0,
    decision: '主函数入口：考察石子数组 [1, 5, 2]，判定先手是否有必胜策略。',
    message: '双方均追求自身净胜分最大化，定义 dp[i][j] 为当前行动方在区间 [i, j] 上的最大相对净胜分。',
    log: 'enter predictTheWinner: nums=[1, 5, 2]',
    codeLine: lines.entry,
    metrics: { '石子堆数': 3, '初始状态': '准备博弈' },
  });

  // Step 1: 长度为 2 的区间 [0, 1]
  steps.push({
    nums,
    i: 0,
    j: 1,
    pickLeftScore: -4,
    pickRightScore: 4,
    bestDiff: 4,
    decision: '决策区间 [0, 1] (石子 1 和 5)：拿 1 净得分 1-5=-4，拿 5 净得分 5-1=4，选 5 必胜获得 +4 分。',
    message: '区间长度由短到长推进，dp[0][1] = 4。',
    log: 'len=2 [0, 1]: dp[0][1] = max(1-5, 5-1) = 4',
    codeLine: lines.minimaxTrans,
    statusBadge: { text: '区间 [0, 1] 净胜分: 4', type: 'info' },
    metrics: { '区间': '[0, 1]', '最优净分': 4 },
  });

  // Step 2: 长度为 2 的区间 [1, 2]
  steps.push({
    nums,
    i: 1,
    j: 2,
    pickLeftScore: 3,
    pickRightScore: -3,
    bestDiff: 3,
    decision: '决策区间 [1, 2] (石子 5 和 2)：拿 5 净得分 5-2=3，拿 2 净得分 2-5=-3，选 5 必胜获得 +3 分。',
    message: 'dp[1][2] = 3。',
    log: 'len=2 [1, 2]: dp[1][2] = max(5-2, 2-5) = 3',
    codeLine: lines.minimaxTrans,
    statusBadge: { text: '区间 [1, 2] 净胜分: 3', type: 'info' },
    metrics: { '区间': '[1, 2]', '最优净分': 3 },
  });

  // Step 3: 全局区间 [0, 2] 极大极小博弈
  steps.push({
    nums,
    i: 0,
    j: 2,
    pickLeftScore: -2,
    pickRightScore: -2,
    bestDiff: -2,
    decision: '决策全局区间 [0, 2]：先手无论拿左端 1 (1 - dp[1][2] = -2) 还是右端 2 (2 - dp[0][1] = -2)，都会把中间大分 5 拱手让给后手！',
    message: '先手最大净得分为 -2 < 0，后手必胜（先手必败）！',
    log: 'len=3 [0, 2]: dp[0][2] = max(1-3, 2-4) = -2 < 0',
    codeLine: lines.returnJudge,
    statusBadge: { text: '先手净得分为负 (必败)', type: 'danger' },
    metrics: { '最终净得分': -2, '胜负判定': '后手胜' },
  });

  return steps;
}

export const gameProbability085Visualizer = registerDeclarativeAlgorithm<GameDp085Step>({
  id: 'game-probability-dp-085',
  name: '博弈概率 DP 与倒推状态 (Class 085)',
  category: 'dynamic-programming',
  difficulty: 'medium',
  problemContent: DP_084_088_PROBLEMS.gameProbability085,
  sourceCodes: GAME_PROBABILITY_085_CODES,
  generateSteps: buildGameDp085Steps,
  renderCanvas: (container, step) => {
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
  },
});
