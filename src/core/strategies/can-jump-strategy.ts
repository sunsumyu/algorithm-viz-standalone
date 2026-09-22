import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { CanJumpStepCompiler } from './can-jump-compiler';

/**
 * 跳跃游戏 I 顶层多态策略 (CanJumpStrategy)
 * 实现 IAlgorithmStrategy 统一接口，驱动 CanJumpStepCompiler。
 */
export class CanJumpStrategy implements IAlgorithmStrategy {
  public readonly modelId: string = 'can-jump';

  public canHandle(modelId: string): boolean {
    return modelId === 'can-jump';
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const rawNumsStr = String(params.customInputs?.nums || model.defaultParams?.nums || '2, 3, 1, 1, 4');
    const nums = rawNumsStr
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    return CanJumpStepCompiler.compile(
      model,
      {
        nums: nums.length > 0 ? nums : [2, 3, 1, 1, 4],
        anchorMap: params.anchorMap,
        direction: params.direction as 'forward' | 'reverse' | undefined,
      },
      params.stage ?? 1
    );
  }
}
