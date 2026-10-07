/**
 * 出勤记录 II 矩阵快速幂 (Student Attendance Record II) - 声明式教学级沙盘渲染器
 * 核心原理：6状态有限自动机 (DFA)，6×6 状态转移矩阵快速幂，求和 M^n[0][j]
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_098_PROBLEMS } from './math-098-problem-content';
import { ATTENDANCE_RECORD_CODES } from './math-098-stage-codes';
import {
  AttendanceStep,
  buildAttendanceSteps,
} from '../../../../core/renderers/adapters/attendance-record-matrix-098-step-compiler';
import { matrixPower098CanvasAdapter } from '../../../../core/renderers/adapters/matrix-power-098-canvas-adapter';

export type { AttendanceStep };
export { buildAttendanceSteps };

export const attendanceRecordMatrixVisualizer = registerDeclarativeAlgorithm<AttendanceStep>({
  id: 'attendance-record-matrix-098',
  name: '出勤记录 II 矩阵快速幂 (Attendance Record Matrix)',
  category: 'math',
  icon: '📋',
  difficulty: 3,
  levelOrder: 987,
  aliases: ['class098-code07', 'attendance-record-matrix', 'student-attendance-record-ii-552', 'leetcode-552'],
  learningGoal: '掌握有限状态机 (DFA) 到 6×6 状态转移矩阵的构建与多重合法约束解析',
  problemHtml: MATH_098_PROBLEMS.attendanceRecord.html,
  analysisHtml: MATH_098_PROBLEMS.attendanceRecord.html,
  inputs: [
    {
      id: 'input-n',
      label: '出勤天数 n',
      type: 'number',
      defaultValue: 4,
      min: 1,
      max: 100000,
      step: 1,
      placeholder: '例如 4',
    },
  ],
  codeLanguages: ATTENDANCE_RECORD_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(1, parseInt(String(inputs?.['input-n'] ?? '4'), 10) || 4);
    return buildAttendanceSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: AttendanceStep) => {
    matrixPower098CanvasAdapter.render(stageContainer, step);
  },
});
