/**
 * 斐波那契数矩阵快速幂 (Fibonacci Matrix Power) Step Compiler
 * 薄领域适配器 (Thin Domain Adapter) -> 委托给 MatrixFastPowerStepCompiler 深模块
 */

import { Math098Step } from '../../../algorithms/categories/math/math-098/math-098-shared';
import {
  MatrixFastPowerStepCompiler,
  fibonacciRecurrenceStrategy,
} from './matrix-fast-power-step-compiler';

export interface FibMatrixStep extends Math098Step {
  n?: number;
}

export function buildFibMatrixSteps(n: number): FibMatrixStep[] {
  return MatrixFastPowerStepCompiler.compile(fibonacciRecurrenceStrategy, n).map((s) => ({
    ...s,
    n,
  }));
}
