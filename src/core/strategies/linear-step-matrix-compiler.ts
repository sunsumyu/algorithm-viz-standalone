import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { compileLinearStage1or2 } from './linear-compile-stage12';
import { compileLinearStage3 } from './linear-compile-stage3';
import { compileLinearStage4 } from './linear-compile-stage4';
import { compileLinearStage5 } from './linear-compile-stage5';

export interface LinearCompileOptions {
  modelId: string;
  stage: number;
  n: number;
  isMemo?: boolean;
  anchorMap?: Record<string, number>;
  customData?: any;
}

/**
 * 基础线性 DP 统一步骤矩阵流水线编译器 (LinearStepMatrixCompiler Deep Module)
 * 遵循流水线模式 (Pipeline) 与策略模式 (Strategy Pattern)，统一编译：
 * 1. Stage 1: 暴力递归树 (DFS Recursion Tree & Subproblem Overlap)
 * 2. Stage 2: 记忆化搜索 (Memoization Pruning & O(1) Cache Hit)
 * 3. Stage 3: 一维 DP 状态表递推 (Bottom-Up Tabulation)
 * 4. Stage 4: 空间压缩与滚动变量 (Rolling Variable Space Optimization)
 * 5. Stage 5: 数学极值进阶与封闭解 (Closed-form Math / Matrix Exponentiation / Greedy)
 *
 * 职责分层（SRP 拆分）：各阶段编译逻辑见 linear-compile-stage*.ts，本模块为统一调度门面。
 */
export class LinearStepMatrixCompiler {
  /**
   * 统一编译入口
   */
  public static compile(model: IYamlAlgorithmModel, options: LinearCompileOptions): UniversalStep[] {
    const { stage, n, isMemo, anchorMap } = options;

    switch (stage) {
      case 1:
      case 2:
        return this.compileStage1or2(model, n, Boolean(isMemo), anchorMap);
      case 3:
        return this.compileStage3(model, n, anchorMap);
      case 4:
        return this.compileStage4(model, n, anchorMap);
      case 5:
        return this.compileStage5(model, n, anchorMap);
      default:
        return [];
    }
  }

  /**
   * Stage 1 & 2: 递归树与记忆化剪枝
   */
  public static compileStage1or2(
    model: IYamlAlgorithmModel,
    nVal: number,
    isMemo: boolean = false,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    return compileLinearStage1or2(model, nVal, isMemo, anchorMap);
  }

  /**
   * Stage 3: 一维 DP 状态表递推
   */
  public static compileStage3(
    model: IYamlAlgorithmModel,
    nVal: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    return compileLinearStage3(model, nVal, anchorMap);
  }

  /**
   * Stage 4: 空间压缩与滚动变量
   */
  public static compileStage4(
    model: IYamlAlgorithmModel,
    nVal: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    return compileLinearStage4(model, nVal, anchorMap);
  }

  /**
   * Stage 5: 数学极值进阶与封闭解
   */
  public static compileStage5(
    model: IYamlAlgorithmModel,
    nVal: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    return compileLinearStage5(model, nVal, anchorMap);
  }
}
