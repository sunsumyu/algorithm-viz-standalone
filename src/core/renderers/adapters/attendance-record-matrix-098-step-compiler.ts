/**
 * 出勤记录 II 矩阵快速幂 (Student Attendance Record II) Step Compiler
 * 核心原理：6状态有限自动机 (DFA)，6×6 状态转移矩阵快速幂，求和 M^n[0][j]
 */

import { ATTENDANCE_RECORD_LINES } from '../../../algorithms/categories/math/math-098/math-098-stage-codes';
import { Math098Step, matrixPower } from '../../../algorithms/categories/math/math-098/math-098-shared';

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
    line: lines.entry.javascript,
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
      line: lines.guard.javascript,
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
    line: lines.initMatrix.javascript,
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
    line: lines.powerCompute.javascript,
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
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    metrics: { [`ValidRecords(${n})`]: `${ans}` },
    finalValue: ans,
  });

  return steps;
}
