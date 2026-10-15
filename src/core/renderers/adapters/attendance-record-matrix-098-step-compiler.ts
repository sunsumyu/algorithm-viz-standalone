/**
 * 出勤记录 II 矩阵快速幂 (Student Attendance Record II) Step Compiler
 * 薄领域适配器 (Thin Domain Adapter) -> 委托给 MatrixFastPowerStepCompiler 深模块
 */

import { Math098Step } from '../../../algorithms/categories/math/math-098/math-098-shared';
import {
  MatrixFastPowerStepCompiler,
  attendanceRecordRecurrenceStrategy,
} from './matrix-fast-power-step-compiler';

export interface AttendanceStep extends Math098Step {
  n?: number;
}

export function buildAttendanceSteps(n: number): AttendanceStep[] {
  return MatrixFastPowerStepCompiler.compile(attendanceRecordRecurrenceStrategy, n).map((s) => ({
    ...s,
    n,
  }));
}
