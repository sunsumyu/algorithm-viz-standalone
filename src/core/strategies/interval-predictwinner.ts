import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';
import { buildPredictTheWinnerSteps } from '../renderers/adapters/predict-the-winner-step-compiler';

/**
 * 预测赢家 (Predict the Winner / 纸牌博弈, LC 486, 左程云 83 课)
 * 职责：薄策略领域适配器，遵循深模块设计哲学与身材红线 (LOC < 120)，
 * 规约提取运行时参数并委托给核心族群推演编译器。
 */
export function compilePredictWinner(
  _model: IYamlAlgorithmModel,
  params: StageExecutionParams
): UniversalStep[] {
  return buildPredictTheWinnerSteps({
    stage: params.stage,
    direction: params.direction,
    isMemo: params.isMemo,
    anchorMap: params.anchorMap,
    params: params.params,
  });
}
