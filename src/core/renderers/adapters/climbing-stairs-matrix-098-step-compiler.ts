/**
 * 爬楼梯矩阵快速幂 (Climbing Stairs Matrix Power) Step Compiler
 * 薄领域适配器 (Thin Domain Adapter) -> 委托给 MatrixFastPowerStepCompiler 深模块
 */

import { Math098Step } from '../../../algorithms/categories/math/math-098/math-098-shared';
import {
  MatrixFastPowerStepCompiler,
  climbingStairsRecurrenceStrategy,
} from './matrix-fast-power-step-compiler';

export interface ClimbingStairsStep extends Math098Step {
  n?: number;
}

export function buildClimbingStairsSteps(n: number): ClimbingStairsStep[] {
  return MatrixFastPowerStepCompiler.compile(climbingStairsRecurrenceStrategy, n).map((s) => ({
    ...s,
    n,
  }));
}
