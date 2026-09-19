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

export function buildGameDp085Steps(input?: { nums?: number[] } | number[]): GameDp085Step[] {
  const steps: GameDp085Step[] = [];
  const lines = GAME_PROBABILITY_085_LINES;

  let rawNums = [1, 5, 2];
  if (Array.isArray(input)) {
    rawNums = input;
  } else if (input && Array.isArray(input.nums)) {
    rawNums = input.nums;
  }
  const nums = rawNums.length > 0 ? rawNums.slice(0, 6) : [1, 5, 2];
  const n = nums.length;

  // dp[i][j]: 当前行动方在区间 [i, j] 上的最大相对净胜分
  const dp: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  // Step 0: 入口帧
  steps.push({
    nums,
    i: 0,
    j: n - 1,
    pickLeftScore: 0,
    pickRightScore: 0,
    bestDiff: 0,
    decision: `主函数入口：考察石子数组 [${nums.join(', ')}]，判定先手是否有必胜策略。`,
    message: '双方均追求自身净胜分最大化，定义 dp[i][j] 为当前行动方在区间 [i, j] 上的最大相对净胜分。',
    log: `enter predictTheWinner: nums=[${nums.join(', ')}]`,
    codeLine: lines.entry,
    metrics: { '石子堆数': n, '初始状态': '准备博弈' },
  });

  // Step 1: 长度为 1 的基础区间初始化
  for (let i = 0; i < n; i++) {
    dp[i]![i] = nums[i]!;
    steps.push({
      nums,
      i,
      j: i,
      pickLeftScore: nums[i]!,
      pickRightScore: nums[i]!,
      bestDiff: nums[i]!,
      decision: `初始化单张纸牌区间 [${i}, ${i}]：只有一张牌 nums[${i}]=${nums[i]}，先手直接拿走获得 +${nums[i]} 净胜分。`,
      message: `单元素边界就绪：dp[${i}][${i}] = ${nums[i]}。`,
      log: `init base: dp[${i}][${i}] = ${nums[i]}`,
      codeLine: lines.initBase,
      statusBadge: { text: `dp[${i}][${i}] = ${nums[i]}`, type: 'info' },
      metrics: { '区间': `[${i}, ${i}]`, '净胜分': nums[i]! },
    });
  }

  // 长度 len 从 2 递增至 n
  for (let len = 2; len <= n; len++) {
    steps.push({
      nums,
      i: 0,
      j: len - 1,
      pickLeftScore: 0,
      pickRightScore: 0,
      bestDiff: dp[0]![len - 1] ?? 0,
      decision: `推进至区间长度 len=${len}：从小区间向大区间递推求解。`,
      message: `区间 DP 核心不变量：必须先求解所有较短区间的博弈劣势与优势，大区间查表时子状态才保证已就绪。`,
      log: `start length loop: len = ${len}`,
      codeLine: lines.lenLoop,
      metrics: { '当前区间长度': len },
    });

    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      const pickLeft = nums[i]! - dp[i + 1]![j]!;
      const pickRight = nums[j]! - dp[i]![j - 1]!;
      const best = Math.max(pickLeft, pickRight);
      dp[i]![j] = best;

      const chooseDesc =
        pickLeft >= pickRight
          ? `拿左端 nums[${i}]=${nums[i]} 更优 (净得 ${pickLeft} >= ${pickRight})`
          : `拿右端 nums[${j}]=${nums[j]} 更优 (净得 ${pickRight} > ${pickLeft})`;

      steps.push({
        nums,
        i,
        j,
        pickLeftScore: pickLeft,
        pickRightScore: pickRight,
        bestDiff: best,
        decision: `决策区间 [${i}, ${j}] (石子 [${nums.slice(i, j + 1).join(', ')}])：${chooseDesc}。`,
        message: `左选: ${nums[i]} - dp[${i + 1}][${j}](${dp[i + 1]![j]}) = ${pickLeft}；右选: ${nums[j]} - dp[${i}][${j - 1}](${dp[i]![j - 1]}) = ${pickRight}。最大相对净胜分 dp[${i}][${j}] = ${best}。`,
        log: `len=${len} [${i}, ${j}]: left=${pickLeft}, right=${pickRight} -> dp[${i}][${j}]=${best}`,
        codeLine: lines.minimaxTrans,
        statusBadge: { text: `区间 [${i}, ${j}] 净胜分: ${best}`, type: best >= 0 ? 'success' : 'danger' },
        metrics: { '区间': `[${i}, ${j}]`, '最优净分': best },
      });
    }
  }

  const finalDiff = dp[0]![n - 1]!;
  const isWinner = finalDiff >= 0;

  // 终结返回帧
  steps.push({
    nums,
    i: 0,
    j: n - 1,
    pickLeftScore: finalDiff,
    pickRightScore: finalDiff,
    bestDiff: finalDiff,
    decision: `全局博弈裁决：整组纸牌 [${nums.join(', ')}] 先手最大相对净得分为 ${finalDiff}。`,
    message: isWinner
      ? `🎉 先手净胜分 ${finalDiff} >= 0，先手采取最优策略必胜（或打平）！`
      : `🛑 先手净胜分 ${finalDiff} < 0，后手必胜（先手必败）！`,
    log: `predictTheWinner complete: diff=${finalDiff} -> return ${isWinner}`,
    codeLine: lines.returnJudge,
    statusBadge: { text: isWinner ? '先手必胜 (true)' : '后手必胜 (false)', type: isWinner ? 'success' : 'danger' },
    metrics: { '最终净得分': finalDiff, '胜负判定': isWinner ? '先手胜' : '后手胜' },
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
