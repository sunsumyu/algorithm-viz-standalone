import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';
import { buildMergeStonesSteps } from '../renderers/adapters/merge-stones-step-compiler';

/**
 * 合并石头的最低成本 (Minimum Cost to Merge Stones, LC 1000, 左程云 84 课)
 * 职责：薄策略领域适配器，遵循深模块设计哲学与身材红线 (LOC < 120)，
 * 规约提取运行时参数并委托给核心族群推演编译器。
 */
export function compileMergeStones(
  _model: IYamlAlgorithmModel,
  params: StageExecutionParams
): UniversalStep[] {
  return buildMergeStonesSteps({
    stage: params.stage,
    direction: params.direction,
    isMemo: params.isMemo,
    anchorMap: params.anchorMap,
    params: params.params,
  });
}
