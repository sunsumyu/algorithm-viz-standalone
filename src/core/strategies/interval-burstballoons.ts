import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';
import { buildBurstBalloonsSteps } from '../renderers/adapters/burst-balloons-step-compiler';

/**
 * 戳气球 (Burst Balloons, LC 312, 左程云 83 课)
 * 区间 DP 经典逆向思维：
 * 核心洞察：正向戳气球会导致左右相邻关系断裂；逆向思考“谁是开区间 (i, j) 中最后一个被戳破的气球 k”，
 * 则此时 k 的左右边界必定是开区间固定的两个端点 val[i] 和 val[j]！
 * 状态定义：dp[i][j] 表示开区间 (i, j) 内所有气球被戳破的最大硬币收益。
 * 转移方程：dp[i][j] = max_{k \in (i, j)} (dp[i][k] + dp[k][j] + val[i] * val[k] * val[j])
 */
export function compileBurstBalloons(
  _model: IYamlAlgorithmModel,
  params: StageExecutionParams
): UniversalStep[] {
  return buildBurstBalloonsSteps(params);
}
