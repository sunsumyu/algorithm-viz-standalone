/**
 * 出勤记录 II 矩阵快速幂 (Student Attendance Record II) - 声明式教学级沙盘渲染器
 * 核心原理：6状态有限自动机 (DFA)，6×6 状态转移矩阵快速幂，求和 M^n[0][j]
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_098_PROBLEMS } from './math-098-problem-content';
import { ATTENDANCE_RECORD_CODES, ATTENDANCE_RECORD_LINES } from './math-098-stage-codes';
import { Math098Step, matrixPower, renderMatrix } from './math-098-shared';

export interface AttendanceStep extends Math098Step {
  n: number;
}

export function buildAttendanceSteps(n: number): AttendanceStep[] {
  const steps: AttendanceStep[] = [];
  const lines = ATTENDANCE_RECORD_LINES;

  const baseMatrix = [
    [1, 1, 0, 1, 0, 0],
    [1, 0, 1, 1, 0, 0],
    [1, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1, 0],
    [0, 0, 0, 1, 0, 1],
    [0, 0, 0, 1, 0, 0],
  ];

  // Step 0: 入口
  steps.push({
    n,
    decision: `主函数入口：计算长度为 n=${n} 的出勤奖励序列总数 (缺勤 A < 2 且连续迟到 L < 3)`,
    message: '构建 6 种合法状态 DFA 状态机，使用 6×6 矩阵快速幂在 O(log n) 内求解',
    log: `enter checkRecord(n=${n})`,
    codeLine: lines.entry,
    metrics: { '序列长度 n': `${n}` },
    curPowerMatrix: baseMatrix,
  });

  // Step 1: n = 1 特判
  if (n === 1) {
    steps.push({
      n,
      decision: '边界特判：n=1 时，序列可为 ["P", "A", "L"] 共 3 种，直接返回 3',
      message: '基础初值',
      log: 'n == 1, return 3',
      codeLine: lines.guard,
      metrics: { '最终结果': '3' },
      finalValue: 3,
    });
    return steps;
  }

  // Step 2: 矩阵初始化
  steps.push({
    n,
    curPowerMatrix: baseMatrix,
    decision: '构建 6×6 状态机状态转移矩阵 base：状态由 (countA, consecutiveL) 唯一确定',
    message: '6 状态为: (0,0), (0,1), (0,2), (1,0), (1,1), (1,2)',
    log: 'init 6x6 attendance DFA matrix',
    codeLine: lines.initMatrix,
    metrics: { '矩阵阶数': '6×6', '状态数': '6' },
  });

  // Step 3: 快速幂
  const res = matrixPower(baseMatrix, n);

  steps.push({
    n,
    curPowerMatrix: baseMatrix,
    curAnsMatrix: res,
    decision: `执行 6×6 矩阵快速幂：base^(${n}) 完成！`,
    message: '计算完成，初始向量 [1, 0, 0, 0, 0, 0] 乘以转移矩阵',
    log: `computed matrixPower(base, ${n})`,
    codeLine: lines.powerCompute,
    metrics: { '幂次': `${n}` },
  });

  // Step 4: 结果统计返回
  let sum = 0n;
  for (let j = 0; j < 6; j++) {
    sum = (sum + BigInt(res[0][j])) % 1000000007n;
  }
  const ans = Number(sum);

  steps.push({
    n,
    curPowerMatrix: baseMatrix,
    curAnsMatrix: res,
    decision: `🎉 计算完毕！长度为 ${n} 的合法出勤奖励序列共有 res[0][0..5] 之和 = ${ans} 种！`,
    message: '收敛返回',
    log: `return ${ans}`,
    codeLine: lines.returnAns,
    metrics: { [`ValidRecords(${n})`]: `${ans}` },
    finalValue: ans,
  });

  return steps;
}

export const attendanceRecordMatrixVisualizer = registerDeclarativeAlgorithm<AttendanceStep>({
  id: 'attendance-record-matrix-098',
  name: '出勤记录 II 矩阵快速幂 (Attendance Record Matrix)',
  category: 'math',
  icon: '📋',
  difficulty: 3,
  levelOrder: 987,
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
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 矩阵展示
    const matricesRow = document.createElement('div');
    matricesRow.style.cssText = 'display: flex; gap: 12px; flex-wrap: wrap;';
    if (step.curPowerMatrix) renderMatrix(matricesRow, step.curPowerMatrix, '6×6 出勤状态机转移矩阵');
    if (step.curAnsMatrix) renderMatrix(matricesRow, step.curAnsMatrix, `幂次结果矩阵 (base^${step.n})`);
    root.appendChild(matricesRow);

    // 2. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  },
});
