import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { compileWildcardMatchingSteps } from '../renderers/adapters/wildcard-matching-step-compiler';

/**
 * 通配符匹配独立算法策略 (SequenceWildcardMatchingStrategy)
 * 覆盖：LeetCode 44 / 左程云 Class 074 Code05
 * 遵循深模块架构，委托 compileWildcardMatchingSteps 生成四阶段全生命周期步进
 */
export class SequenceWildcardMatchingStrategy implements IAlgorithmStrategy {
  public readonly modelId: string;

  constructor(modelId: string = 'wildcard-matching') {
    this.modelId = modelId;
  }

  public canHandle(modelId: string): boolean {
    return (
      modelId === this.modelId ||
      modelId === 'wildcard-matching' ||
      modelId === 'class074-code05' ||
      modelId === 'wildcard-matching-074' ||
      modelId === 'wildcard-matching-problem' ||
      modelId === 'leetcode-44'
    );
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const rawParams = params.params || {};
    const s = String(rawParams.s ?? rawParams['input-s'] ?? params.s ?? model.defaultParams?.s ?? 'cb');
    const p = String(
      rawParams.p ?? rawParams.pat ?? rawParams['input-pat'] ?? rawParams['input-p'] ?? params.p ?? model.defaultParams?.p ?? '?a'
    );

    return compileWildcardMatchingSteps(
      s,
      p,
      params.stage,
      Boolean(params.isMemo),
      params.anchorMap,
      params.direction
    );
  }
}
