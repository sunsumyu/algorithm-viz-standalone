import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { IntervalSchedulingStepCompiler } from './interval-scheduling-step-compiler';

/**
 * 划分字母区间 领域适配策略 (PartitionLabelsStrategy)
 * 极简薄适配器（< 50 行）：负责 s 字符串入参解析，
 * 全权委托至顶层通用的 IntervalSchedulingStepCompiler 编译引擎。
 */
export class PartitionLabelsStrategy implements IAlgorithmStrategy {
  public readonly modelId: string = 'partition-labels';

  public canHandle(modelId: string): boolean {
    return modelId === 'partition-labels';
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const rawStr = String(
      params.customInputs?.['input-s'] ??
      params.customInputs?.s ??
      model.defaultParams?.s ??
      'ababcbacadefegdehijhklij'
    );

    return IntervalSchedulingStepCompiler.compilePartitionLabels(
      model,
      rawStr,
      {
        anchorMap: params.anchorMap,
        direction: params.direction as 'forward' | 'reverse' | undefined,
      },
      params.stage ?? 1
    );
  }
}
