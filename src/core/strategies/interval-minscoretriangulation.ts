import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';
import { buildMinScoreTriangulationSteps } from '../renderers/adapters/min-score-triangulation-step-compiler';

/**
 * 多边形三角剖分的最低得分 (Minimum Score Triangulation, LC 1039, 左程云 84 课)
 * 职责：薄策略领域适配器，遵循深模块设计哲学与身材红线 (LOC < 120)，
 * 规约提取运行时参数并委托给核心族群推演编译器。
 */
export function compileMinScoreTriangulation(
  _model: IYamlAlgorithmModel,
  params: StageExecutionParams
): UniversalStep[] {
  return buildMinScoreTriangulationSteps({
    stage: params.stage,
    direction: params.direction,
    isMemo: params.isMemo,
    anchorMap: params.anchorMap,
    params: params.params,
  });
}
