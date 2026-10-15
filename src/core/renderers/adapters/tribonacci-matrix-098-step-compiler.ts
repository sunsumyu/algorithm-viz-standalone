/**
 * 泰波那契数矩阵快速幂 (Tribonacci Matrix Power) Step Compiler
 * 薄领域适配器 (Thin Domain Adapter) -> 委托给 MatrixFastPowerStepCompiler 深模块
 */

import { Math098Step } from '../../../algorithms/categories/math/math-098/math-098-shared';
import {
  MatrixFastPowerStepCompiler,
  tribonacciRecurrenceStrategy,
} from './matrix-fast-power-step-compiler';

export interface TribonacciStep extends Math098Step {
  n?: number;
}

export function buildTribonacciSteps(n: number): TribonacciStep[] {
  return MatrixFastPowerStepCompiler.compile(tribonacciRecurrenceStrategy, n).map((s) => ({
    ...s,
    n,
  }));
}
