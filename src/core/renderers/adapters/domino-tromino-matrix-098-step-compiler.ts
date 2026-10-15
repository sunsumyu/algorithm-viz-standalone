/**
 * 多米诺和托米诺平铺矩阵快速幂 (Domino Tromino Matrix Power) Step Compiler
 * 薄领域适配器 (Thin Domain Adapter) -> 委托给 MatrixFastPowerStepCompiler 深模块
 */

import { Math098Step } from '../../../algorithms/categories/math/math-098/math-098-shared';
import {
  MatrixFastPowerStepCompiler,
  dominoTrominoRecurrenceStrategy,
} from './matrix-fast-power-step-compiler';

export interface DominoStep extends Math098Step {
  n?: number;
}

export function buildDominoSteps(n: number): DominoStep[] {
  return MatrixFastPowerStepCompiler.compile(dominoTrominoRecurrenceStrategy, n).map((s) => ({
    ...s,
    n,
  }));
}
