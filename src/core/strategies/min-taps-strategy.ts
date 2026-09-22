import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { IntervalRelayStepCompiler } from './interval-relay-step-compiler';

/**
 * 灌溉花园的最少水龙头数目 领域适配策略 (MinTapsStrategy)
 * 极简薄适配器（< 50 行）：负责 (n, ranges) 入参提取与边界规约，
 * 全权委托至顶层通用的 IntervalRelayStepCompiler 编译引擎。
 */
export class MinTapsStrategy implements IAlgorithmStrategy {
  public readonly modelId: string = 'minimum-number-of-taps-to-water-a-garden';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'minimum-number-of-taps-to-water-a-garden' ||
      modelId === 'min-taps'
    );
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const rawN = params.customInputs?.['input-n'] ?? params.customInputs?.n ?? model.defaultParams?.n ?? 5;
    const n = parseInt(String(rawN), 10);

    const rawRangesStr = String(
      params.customInputs?.['input-ranges'] ??
      params.customInputs?.ranges ??
      model.defaultParams?.ranges ??
      '3, 4, 1, 1, 0, 0'
    );
    const ranges = rawRangesStr
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((num) => !isNaN(num));

    return IntervalRelayStepCompiler.compileFromTaps(
      model,
      isNaN(n) ? 5 : n,
      ranges.length > 0 ? ranges : [3, 4, 1, 1, 0, 0],
      {
        anchorMap: params.anchorMap,
        direction: params.direction as 'forward' | 'reverse' | undefined,
      },
      params.stage ?? 1
    );
  }
}

