import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { JumpGameIIStepCompiler } from './jump-game-ii-compiler';

/**
 * 跳跃游戏 II 顶层多态策略 (JumpGameIIStrategy)
 * 实现 IAlgorithmStrategy 统一接口，驱动 JumpGameIIStepCompiler。
 */
export class JumpGameIIStrategy implements IAlgorithmStrategy {
  public readonly modelId: string = 'jump-game-ii';

  public canHandle(modelId: string): boolean {
    return modelId === 'jump-game-ii' || modelId === 'jump-game';
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const rawNumsStr = String(params.customInputs?.nums || model.defaultParams?.nums || '2, 3, 1, 1, 4');
    const nums = rawNumsStr
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    return JumpGameIIStepCompiler.compile(model, {
      nums: nums.length > 0 ? nums : [2, 3, 1, 1, 4],
      anchorMap: params.anchorMap,
    });
  }
}
