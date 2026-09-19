import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { PartitionDPCompiler } from './partition-dp-compiler';

/**
 * 前缀切分动态规划族群通用策略 (PartitionDPStrategy)
 * 遵循策略模式 (Strategy Pattern)，委托通用切分编译器 PartitionDPCompiler 生成执行步骤
 * 通用支持：整数拆分 (LC 343)、完全平方数 (LC 279)、单词拆分 (LC 139) 等
 */
export class PartitionDPStrategy implements IAlgorithmStrategy {
  constructor(public readonly modelId: string = 'integer-break') {}

  public canHandle(modelId: string): boolean {
    return modelId === this.modelId;
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, m, n, anchorMap, direction } = params;
    const len = Math.max(m ?? 0, n ?? 0) || Number(model.defaultParams?.n ?? 6);
    const dir: 'forward' | 'reverse' = direction === 'reverse' ? 'reverse' : 'forward';

    switch (stage) {
      case 3:
        return PartitionDPCompiler.compileStage3(model, {
          n: len,
          stage: 3,
          direction: dir,
          anchorMap
        });
      case 4:
        return PartitionDPCompiler.compileStage4(model, {
          n: len,
          stage: 4,
          direction: dir,
          anchorMap
        });
      default:
        // Stage 1 & Stage 2 暂时回退或委托
        return PartitionDPCompiler.compileStage3(model, {
          n: len,
          stage: 3,
          direction: dir,
          anchorMap
        });
    }
  }
}

export { PartitionDPStrategy as PartitionIntegerBreakStrategy };
