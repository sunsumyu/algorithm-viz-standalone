/**
 * 矩阵快速幂通用编译深模块 (MatrixFastPowerStepCompiler · Deep Module)
 * 架构规范：
 * 1. 模板方法模式 (Template Method Pattern): 封装快速幂执行全生命周期骨架：
 *    📥 算法入口 -> 🔍 边界特判 -> 📐 状态矩阵构造 -> ⚡ 二进制位权展开累乘与底数翻倍 -> 🎯 结果向量规约返回
 * 2. 策略规格模式 (Strategy Pattern): 隔离不同算法的转移矩阵构建、指数位移法则与结果标量投影
 * 3. 严格遵循 One-Line-One-Step 与 4 语言代码行号联动契约
 */

import { HighlightTarget } from '../../step-visualizer';
import {
  Math098Step,
  multiplyMatrix,
  identityMatrix,
  MOD_1E9_7,
} from '../../../algorithms/categories/math/math-098/math-098-shared';
import {
  FIBONACCI_MATRIX_LINES,
  CLIMBING_STAIRS_LINES,
  TRIBONACCI_MATRIX_LINES,
  DOMINO_TROMINO_LINES,
  COUNT_VOWELS_LINES,
  ATTENDANCE_RECORD_LINES,
} from '../../../algorithms/categories/math/math-098/math-098-stage-codes';

// =========================================================================
// 1. 策略规格契约 (Strategy Specification Interface)
// =========================================================================

export interface MatrixStrategyLines {
  entry: Record<string, number>;
  guard: Record<string, number>;
  initMatrix: Record<string, number>;
  powerCompute: Record<string, number>;
  returnAns: Record<string, number>;
}

export interface IMatrixRecurrenceStrategy {
  /** 策略唯一标识符 */
  readonly id: string;
  /** 策略中文名 */
  readonly name: string;
  /** 状态向量维度 (K 阶方阵) */
  readonly dimension: number;
  /** 取模常数 (默认为 1_000_000_007) */
  readonly mod?: number;
  /** 多语言代码行号字典 */
  readonly lines: MatrixStrategyLines;

  /** 构造 K × K 基础状态转移矩阵 */
  getBaseMatrix(n: number): number[][];

  /** 边界特判：当命中特定初始值时直接返回基底结果，返回 null 则进入快速幂主干 */
  checkBaseCase(n: number): {
    decision: string;
    message: string;
    log: string;
    finalValue: number;
  } | null;

  /** 计算转移矩阵的幂次 p (例如 n-2, n-1 或 n) */
  resolvePower(n: number): number;

  /** 从最终幂次矩阵 ansMatrix 中规约/提取标量最终结果 */
  extractFinalResult(ansMatrix: number[][], n: number): {
    ans: number;
    formulaExplain: string;
  };

  /** 定制主入口决策文案 (可选) */
  formatEntryDecision?(n: number): { decision: string; message: string; log: string };

  /** 定制矩阵构建决策文案 (可选) */
  formatInitMatrixDecision?(n: number, matrix: number[][]): { decision: string; message: string; log: string };
}

// =========================================================================
// 2. 核心模板方法编译器 (Template Method Engine)
// =========================================================================

export interface MatrixCompilerOptions {
  /** 是否启用细粒度二进制位权展开步进 (默认 true) */
  fineGrained?: boolean;
}

export class MatrixFastPowerStepCompiler {
  /**
   * 模板方法：驱动矩阵快速幂全生命周期推演
   */
  public static compile(
    strategy: IMatrixRecurrenceStrategy,
    n: number,
    options: MatrixCompilerOptions = {}
  ): Math098Step[] {
    const steps: Math098Step[] = [];
    const mod = strategy.mod ?? MOD_1E9_7;
    const lines = strategy.lines;
    const dim = strategy.dimension;
    const baseMatrix = strategy.getBaseMatrix(n);

    // ----------------------------------------------------
    // Step 0: 算法入口帧 (Entry)
    // ----------------------------------------------------
    const entryDesc = strategy.formatEntryDecision
      ? strategy.formatEntryDecision(n)
      : {
          decision: `主函数入口：准备求解 ${strategy.name}，目标规模 n=${n}`,
          message: `构建 ${dim}×${dim} 状态转移矩阵，利用矩阵快速幂在 O(log n) 时间内求解。`,
          log: `enter ${strategy.id}(n=${n})`,
        };

    steps.push({
      decision: entryDesc.decision,
      message: entryDesc.message,
      log: entryDesc.log,
      codeLine: lines.entry,
      line: lines.entry.javascript,
      metrics: { '目标项 n': `${n}`, '矩阵阶数': `${dim}×${dim}` },
      curPowerMatrix: baseMatrix,
    });

    // ----------------------------------------------------
    // Step 1: 边界基底特判帧 (Base Case Guard)
    // ----------------------------------------------------
    const baseCase = strategy.checkBaseCase(n);
    if (baseCase !== null) {
      steps.push({
        decision: baseCase.decision,
        message: baseCase.message,
        log: baseCase.log,
        codeLine: lines.guard,
        line: lines.guard.javascript,
        metrics: { '最终结果': `${baseCase.finalValue}` },
        finalValue: baseCase.finalValue,
      });
      return steps;
    }

    // ----------------------------------------------------
    // Step 2: 状态转移矩阵初始化帧 (Init Matrix)
    // ----------------------------------------------------
    const initDesc = strategy.formatInitMatrixDecision
      ? strategy.formatInitMatrixDecision(n, baseMatrix)
      : {
          decision: `构建 ${dim}×${dim} 线性状态转移矩阵 base`,
          message: `根据线性齐次递推关系确定 ${dim}×${dim} 转移矩阵，准备进行矩阵对数幂运算。`,
          log: `init ${dim}x${dim} base matrix`,
        };

    steps.push({
      curPowerMatrix: baseMatrix,
      decision: initDesc.decision,
      message: initDesc.message,
      log: initDesc.log,
      codeLine: lines.initMatrix,
      line: lines.initMatrix.javascript,
      metrics: { '矩阵阶数': `${dim}×${dim}` },
    });

    // ----------------------------------------------------
    // Step 3: 二进制快速幂展开推演帧 (Binary Exponentiation)
    // ----------------------------------------------------
    const p = strategy.resolvePower(n);
    let res = identityMatrix(dim);
    let base = baseMatrix.map((row) => [...row]);
    let exp = p;
    let bitIndex = 0;

    if (p <= 0) {
      // 零次幂退化为单位矩阵
      steps.push({
        curPowerMatrix: baseMatrix,
        curAnsMatrix: res,
        decision: `幂次 p=${p} <= 0，矩阵幂退化为 ${dim} 阶单位矩阵 I`,
        message: '任何非零矩阵的 0 次幂均为单位矩阵。',
        log: `power ${p} <= 0 -> Identity matrix`,
        codeLine: lines.powerCompute,
        line: lines.powerCompute.javascript,
        metrics: { '当前幂次': `${p}` },
      });
    } else {
      const fineGrained = options.fineGrained !== false;

      while (exp > 0) {
        const isBitSet = exp % 2 === 1;
        const currentWeight = 1 << bitIndex;

        if (isBitSet) {
          res = multiplyMatrix(res, base, mod);
          if (fineGrained) {
            steps.push({
              curPowerMatrix: base,
              curAnsMatrix: res,
              decision: `⚡ 二进制位权匹配：exp 第 ${bitIndex} 位为 1 (权值 2^${bitIndex} = ${currentWeight})，执行 ans = (ans × base) % mod`,
              message: `当前累乘位命中：将当前的底数矩阵 base^(2^${bitIndex}) 累乘入结果矩阵 ans。`,
              log: `bit ${bitIndex} is 1 -> ans = ans * base^(2^${bitIndex})`,
              codeLine: lines.powerCompute,
              line: lines.powerCompute.javascript,
              metrics: {
                '当前扫描位': `第 ${bitIndex} 位 (权值 ${currentWeight})`,
                '剩余指数 exp': `${exp}`,
              },
            });
          }
        }

        // 底数平方自乘翻倍
        base = multiplyMatrix(base, base, mod);
        exp = Math.floor(exp / 2);

        if (fineGrained && exp > 0) {
          steps.push({
            curPowerMatrix: base,
            curAnsMatrix: res,
            decision: `🔄 底数平方自乘：base = (base × base) % mod，幂位权升级为 2^${bitIndex + 1} = ${currentWeight * 2}，exp 右移至 ${exp}`,
            message: `底数矩阵完成自乘平方，对应下一个更高二进制位权；指数右移一位继续扫描。`,
            log: `base = base^2, exp >>= 1 -> ${exp}`,
            codeLine: lines.powerCompute,
            line: lines.powerCompute.javascript,
            metrics: {
              '下一位权': `2^${bitIndex + 1} = ${currentWeight * 2}`,
              '剩余指数 exp': `${exp}`,
            },
          });
        }

        bitIndex++;
      }

      // 如果非细粒度模式，发射一次收敛步骤
      if (!fineGrained) {
        steps.push({
          curPowerMatrix: baseMatrix,
          curAnsMatrix: res,
          decision: `执行矩阵快速幂：base^(${p}) % ${mod} 运算完成！`,
          message: `在 O(${dim}^3 · log ${p}) 步内完成矩阵对数运算，获得幂次结果矩阵。`,
          log: `computed matrix power base^${p}`,
          codeLine: lines.powerCompute,
          line: lines.powerCompute.javascript,
          metrics: { '目标幂次 p': `${p}` },
        });
      }
    }

    // ----------------------------------------------------
    // Step 4: 结果向量规约与收敛返回帧 (Result Extraction)
    // ----------------------------------------------------
    const { ans, formulaExplain } = strategy.extractFinalResult(res, n);

    steps.push({
      curPowerMatrix: baseMatrix,
      curAnsMatrix: res,
      decision: `🎉 计算完毕！${formulaExplain}`,
      message: `${strategy.name} 矩阵快速幂推演收敛，在对数时间内高效输出结果 【${ans}】。`,
      log: `return ${strategy.id}(${n}) = ${ans}`,
      codeLine: lines.returnAns,
      line: lines.returnAns.javascript,
      metrics: { '最终计算结果': `${ans}` },
      finalValue: ans,
    });

    return steps;
  }
}

// =========================================================================
// 3. 六大具体递推策略实现 (Concrete Recurrence Strategies)
// =========================================================================

/** 1. 斐波那契数递推策略 (Fibonacci: 2x2) */
export const fibonacciRecurrenceStrategy: IMatrixRecurrenceStrategy = {
  id: 'fibonacci-matrix',
  name: '斐波那契数矩阵快速幂',
  dimension: 2,
  lines: FIBONACCI_MATRIX_LINES,
  getBaseMatrix: () => [
    [1, 1],
    [1, 0],
  ],
  checkBaseCase: (n) => {
    if (n <= 0) {
      return {
        decision: `边界特判：n=${n} <= 0，返回 0`,
        message: 'F(0) = 0',
        log: 'n <= 0, return 0',
        finalValue: 0,
      };
    }
    if (n <= 2) {
      return {
        decision: `边界特判：n=${n} <= 2，F(1)=1, F(2)=1，直接返回 1`,
        message: '基础斐波那契项',
        log: 'n <= 2, return 1',
        finalValue: 1,
      };
    }
    return null;
  },
  resolvePower: (n) => n - 2,
  extractFinalResult: (ansMatrix, n) => {
    const ans = (ansMatrix[0][0] + ansMatrix[1][0]) % MOD_1E9_7;
    return {
      ans,
      formulaExplain: `F(${n}) = res[0][0] + res[1][0] = ${ansMatrix[0][0]} + ${ansMatrix[1][0]} = ${ans}`,
    };
  },
  formatEntryDecision: (n) => ({
    decision: `主函数入口：准备计算第 n=${n} 项斐波那契数`,
    message: '构造状态转移矩阵 [[1, 1], [1, 0]]，利用矩阵快速幂在 O(log n) 内求解',
    log: `enter fib(n=${n})`,
  }),
  formatInitMatrixDecision: () => ({
    decision: '构建 2×2 线性递推状态转移矩阵 base = [[1, 1], [1, 0]]',
    message: '转移方程 [F(n), F(n-1)] = [F(n-1), F(n-2)] × [[1,1],[1,0]]',
    log: 'init base matrix',
  }),
};

/** 2. 爬楼梯递推策略 (Climbing Stairs: 2x2) */
export const climbingStairsRecurrenceStrategy: IMatrixRecurrenceStrategy = {
  id: 'climbing-stairs-matrix',
  name: '爬楼梯矩阵快速幂',
  dimension: 2,
  lines: CLIMBING_STAIRS_LINES,
  getBaseMatrix: () => [
    [1, 1],
    [1, 0],
  ],
  checkBaseCase: (n) => {
    if (n <= 2) {
      return {
        decision: `边界特判：n=${n} <= 2，直接返回 ${n}`,
        message: '基础初值：dp[1]=1, dp[2]=2',
        log: `n <= 2, return ${n}`,
        finalValue: n,
      };
    }
    return null;
  },
  resolvePower: (n) => n - 2,
  extractFinalResult: (ansMatrix, n) => {
    const ans = (2 * ansMatrix[0][0] + ansMatrix[1][0]) % MOD_1E9_7;
    return {
      ans,
      formulaExplain: `dp[${n}] = 2 * res[0][0] + res[1][0] = 2 * ${ansMatrix[0][0]} + ${ansMatrix[1][0]} = ${ans}`,
    };
  },
  formatEntryDecision: (n) => ({
    decision: `主函数入口：计算到达第 n=${n} 阶台阶的不同走法`,
    message: '转移方程 dp[n] = dp[n-1] + dp[n-2]，使用 2×2 矩阵快速幂在 O(log n) 时间内求解',
    log: `enter climbStairs(n=${n})`,
  }),
  formatInitMatrixDecision: () => ({
    decision: '构建 2×2 线性递推状态转移矩阵 base = [[1, 1], [1, 0]]',
    message: '转移向量关系: [dp(n), dp(n-1)] = [dp(2), dp(1)] × base^(n-2)',
    log: 'init climbing stairs base matrix',
  }),
};

/** 3. 泰波那契数递推策略 (Tribonacci: 3x3) */
export const tribonacciRecurrenceStrategy: IMatrixRecurrenceStrategy = {
  id: 'tribonacci-matrix',
  name: '泰波那契数矩阵快速幂',
  dimension: 3,
  lines: TRIBONACCI_MATRIX_LINES,
  getBaseMatrix: () => [
    [1, 1, 0],
    [1, 0, 1],
    [1, 0, 0],
  ],
  checkBaseCase: (n) => {
    if (n === 0) {
      return {
        decision: '边界特判：n=0，T(0)=0，直接返回 0',
        message: '基础初值',
        log: 'n == 0, return 0',
        finalValue: 0,
      };
    }
    if (n <= 2) {
      return {
        decision: `边界特判：n=${n} <= 2，T(1)=1, T(2)=1，直接返回 1`,
        message: '基础初值',
        log: `n <= 2, return 1`,
        finalValue: 1,
      };
    }
    return null;
  },
  resolvePower: (n) => n - 2,
  extractFinalResult: (ansMatrix, n) => {
    const ans = (ansMatrix[0][0] + ansMatrix[1][0]) % MOD_1E9_7;
    return {
      ans,
      formulaExplain: `T(${n}) = res[0][0] + res[1][0] = ${ansMatrix[0][0]} + ${ansMatrix[1][0]} = ${ans}`,
    };
  },
  formatEntryDecision: (n) => ({
    decision: `主函数入口：计算第 n=${n} 项泰波那契数 T(n) = T(n-1) + T(n-2) + T(n-3)`,
    message: '三阶齐次线性递推数列，利用 3×3 矩阵快速幂加速至 O(log n)',
    log: `enter tribonacci(n=${n})`,
  }),
  formatInitMatrixDecision: () => ({
    decision: '构建 3×3 状态转移矩阵 base = [[1, 1, 0], [1, 0, 1], [1, 0, 0]]',
    message: '三维状态向量 [T(n), T(n-1), T(n-2)] 的跃迁矩阵',
    log: 'init 3x3 tribonacci matrix',
  }),
};

/** 4. 多米诺和托米诺平铺递推策略 (Domino Tromino: 3x3 紧凑状态) */
export const dominoTrominoRecurrenceStrategy: IMatrixRecurrenceStrategy = {
  id: 'domino-tromino-matrix',
  name: '多米诺和托米诺平铺矩阵快速幂',
  dimension: 3,
  lines: DOMINO_TROMINO_LINES,
  getBaseMatrix: () => [
    [2, 1, 0],
    [0, 0, 1],
    [1, 0, 0],
  ],
  checkBaseCase: (n) => {
    if (n <= 2) {
      return {
        decision: `边界特判：n=${n} <= 2，直接返回 ${n}`,
        message: '基础初值：dp[1]=1, dp[2]=2',
        log: `n <= 2, return ${n}`,
        finalValue: n,
      };
    }
    if (n === 3) {
      return {
        decision: '边界特判：n=3，初值 dp[3]=5，直接返回 5',
        message: '基础初值',
        log: 'n == 3, return 5',
        finalValue: 5,
      };
    }
    return null;
  },
  resolvePower: (n) => n - 3,
  extractFinalResult: (ansMatrix, n) => {
    const term1 = (5n * BigInt(ansMatrix[0][0])) % BigInt(MOD_1E9_7);
    const term2 = (2n * BigInt(ansMatrix[1][0])) % BigInt(MOD_1E9_7);
    const term3 = (1n * BigInt(ansMatrix[2][0])) % BigInt(MOD_1E9_7);
    const ans = Number((term1 + term2 + term3) % BigInt(MOD_1E9_7));
    return {
      ans,
      formulaExplain: `dp[${n}] = 5*res[0][0] + 2*res[1][0] + res[2][0] = ${ans}`,
    };
  },
  formatEntryDecision: (n) => ({
    decision: `主函数入口：计算 2×${n} 面板使用多米诺与托米诺平铺的方案数`,
    message: '递推方程 dp[n] = 2*dp[n-1] + dp[n-3]，使用 3×3 矩阵快速幂求解',
    log: `enter numTilings(n=${n})`,
  }),
  formatInitMatrixDecision: () => ({
    decision: '构建 3×3 状态转移矩阵 base = [[2, 1, 0], [0, 0, 1], [1, 0, 0]]',
    message: '向量映射 [dp(n), dp(n-1), dp(n-2)] = [dp(3), dp(2), dp(1)] × base^(n-3)',
    log: 'init domino matrix',
  }),
};

/** 5. 元音排列递推策略 (Count Vowels: 5x5 DFA) */
export const countVowelsRecurrenceStrategy: IMatrixRecurrenceStrategy = {
  id: 'count-vowels-matrix',
  name: '元音排列矩阵快速幂',
  dimension: 5,
  lines: COUNT_VOWELS_LINES,
  getBaseMatrix: () => [
    [0, 1, 0, 0, 0],
    [1, 0, 1, 0, 0],
    [1, 1, 0, 1, 1],
    [0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0],
  ],
  checkBaseCase: (n) => {
    if (n === 1) {
      return {
        decision: '边界特判：n=1 时，单个元音 [a, e, i, o, u] 均合法，直接返回 5',
        message: '基础初值',
        log: 'n == 1, return 5',
        finalValue: 5,
      };
    }
    return null;
  },
  resolvePower: (n) => n - 1,
  extractFinalResult: (ansMatrix, n) => {
    let sum = 0n;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        sum = (sum + BigInt(ansMatrix[i][j])) % BigInt(MOD_1E9_7);
      }
    }
    const ans = Number(sum);
    return {
      ans,
      formulaExplain: `长度为 ${n} 的合法元音排列共有全矩阵和 = ${ans} 个！`,
    };
  },
  formatEntryDecision: (n) => ({
    decision: `主函数入口：计算长度为 n=${n} 的合法元音排列字符串数量`,
    message: '元音 a, e, i, o, u 遵循转移规则，建模为 5×5 状态机矩阵',
    log: `enter countVowelPermutation(n=${n})`,
  }),
  formatInitMatrixDecision: () => ({
    decision: '构建 5×5 元音状态转移矩阵 base (对应 a, e, i, o, u 互相转移规则)',
    message: '状态向量 [c(a), c(e), c(i), c(o), c(u)]',
    log: 'init 5x5 vowel matrix',
  }),
};

/** 6. 出勤记录 II 递推策略 (Attendance Record II: 6x6 DFA) */
export const attendanceRecordRecurrenceStrategy: IMatrixRecurrenceStrategy = {
  id: 'attendance-record-matrix',
  name: '出勤记录 II 矩阵快速幂',
  dimension: 6,
  lines: ATTENDANCE_RECORD_LINES,
  getBaseMatrix: () => [
    [1, 1, 0, 1, 0, 0],
    [1, 0, 1, 1, 0, 0],
    [1, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1, 0],
    [0, 0, 0, 1, 0, 1],
    [0, 0, 0, 1, 0, 0],
  ],
  checkBaseCase: (n) => {
    if (n === 1) {
      return {
        decision: '边界特判：n=1 时，序列可为 ["P", "A", "L"] 共 3 种，直接返回 3',
        message: '基础初值',
        log: 'n == 1, return 3',
        finalValue: 3,
      };
    }
    return null;
  },
  resolvePower: (n) => n,
  extractFinalResult: (ansMatrix, n) => {
    let sum = 0n;
    for (let j = 0; j < 6; j++) {
      sum = (sum + BigInt(ansMatrix[0][j])) % BigInt(MOD_1E9_7);
    }
    const ans = Number(sum);
    return {
      ans,
      formulaExplain: `长度为 ${n} 的合法出勤奖励序列共有 res[0][0..5] 之和 = ${ans} 种！`,
    };
  },
  formatEntryDecision: (n) => ({
    decision: `主函数入口：计算长度为 n=${n} 的出勤奖励序列总数 (缺勤 A < 2 且连续迟到 L < 3)`,
    message: '构建 6 种合法状态 DFA 状态机，使用 6×6 矩阵快速幂在 O(log n) 内求解',
    log: `enter checkRecord(n=${n})`,
  }),
  formatInitMatrixDecision: () => ({
    decision: '构建 6×6 状态机状态转移矩阵 base：状态由 (countA, consecutiveL) 唯一确定',
    message: '6 状态为: (0,0), (0,1), (0,2), (1,0), (1,1), (1,2)',
    log: 'init 6x6 attendance DFA matrix',
  }),
};
