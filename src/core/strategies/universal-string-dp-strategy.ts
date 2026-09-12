import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { SequenceStepMatrixCompiler } from './sequence-step-matrix-compiler';

/**
 * 通用双串/序列动态规划策略模块 (UniversalStringDpStrategy)
 * 遵循「不同路径 II」黄金基准设计：
 * - 统一委托 SequenceStepMatrixCompiler 深模块推导 4 阶段高保真步骤流
 * - 支持 Stage 1/2 DFS 递归树与 activeStack 安全绳连线
 * - 支持 Stage 3 严格二维状态表拓扑填表 (null 未探索防御)
 * - 支持 Stage 4 一维空间优化与 leftUp 寄存器暂存
 */
export class UniversalStringDpStrategy implements IAlgorithmStrategy {
  public readonly modelId: string;

  constructor(modelId: string = 'longest-common-subsequence') {
    this.modelId = modelId;
  }

  public canHandle(modelId: string): boolean {
    return modelId === this.modelId || (this.modelId === 'longest-common-subsequence' && modelId === 'lcs');
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, isMemo, anchorMap, direction } = params;
    const dir = direction === 'reverse' ? 'reverse' : 'forward';

    switch (stage) {
      case 1:
      case 2:
        return SequenceStepMatrixCompiler.compileLcsStage1or2(model, Boolean(isMemo), anchorMap, dir);
      case 3:
        return SequenceStepMatrixCompiler.compileLcsStage3(model, anchorMap, dir);
      case 4:
        return SequenceStepMatrixCompiler.compileLcsStage4(model, anchorMap, dir);
      default:
        return [];
    }
  }
}
