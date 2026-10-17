import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { compileRegexMatchingSteps } from '../renderers/adapters/regex-matching-step-compiler';

/**
 * 正则表达式匹配独立算法策略 (SequenceRegexMatchingStrategy)
 * 覆盖：LeetCode 10 / 左程云 Class 074 Code04
 * 遵循深模块架构，委托 compileRegexMatchingSteps 生成四阶段全生命周期步进
 */
export class SequenceRegexMatchingStrategy implements IAlgorithmStrategy {
  public readonly modelId: string;

  constructor(modelId: string = 'regex-matching') {
    this.modelId = modelId;
  }

  public canHandle(modelId: string): boolean {
    return (
      modelId === this.modelId ||
      modelId === 'regex-matching' ||
      modelId === 'class074-code04' ||
      modelId === 'regex-matching-074' ||
      modelId === 'regular-expression-matching' ||
      modelId === 'leetcode-10'
    );
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const rawParams = params.params || {};
    const s = String(rawParams.s ?? rawParams['input-s'] ?? params.s ?? model.defaultParams?.s ?? 'aab');
    const p = String(
      rawParams.p ?? rawParams.pat ?? rawParams['input-pat'] ?? rawParams['input-p'] ?? params.p ?? model.defaultParams?.p ?? 'c*a*b'
    );

    return compileRegexMatchingSteps(
      s,
      p,
      params.stage,
      Boolean(params.isMemo),
      params.anchorMap,
      params.direction
    );
  }
}
