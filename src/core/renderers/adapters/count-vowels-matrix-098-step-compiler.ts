/**
 * 元音排列矩阵快速幂 (Count Vowels Permutation) Step Compiler
 * 薄领域适配器 (Thin Domain Adapter) -> 委托给 MatrixFastPowerStepCompiler 深模块
 */

import { Math098Step } from '../../../algorithms/categories/math/math-098/math-098-shared';
import {
  MatrixFastPowerStepCompiler,
  countVowelsRecurrenceStrategy,
} from './matrix-fast-power-step-compiler';

export interface CountVowelsStep extends Math098Step {
  n?: number;
}

export function buildCountVowelsSteps(n: number): CountVowelsStep[] {
  return MatrixFastPowerStepCompiler.compile(countVowelsRecurrenceStrategy, n).map((s) => ({
    ...s,
    n,
  }));
}
