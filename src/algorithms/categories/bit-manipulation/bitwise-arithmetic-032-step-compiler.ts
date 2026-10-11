/**
 * Class 032: 位运算实现加减乘除 (Bitwise Arithmetic Operations) - 步进编译器
 * 左程云算法通关课入门篇 Class 032
 */

import { StepBase } from '../../../core/step-visualizer';

export interface BitwiseArithmeticStep extends StepBase {
  stepIndex?: number;
  op: 'add' | 'minus' | 'multiply' | 'divide';
  a: number;
  b: number;
  xorSum?: number;
  carry?: number;
  currentResult: number;
  iter: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: number | Record<string, number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const BITWISE_ARITHMETIC_032_CODES = {
  java: `public class BitwiseArithmetic032 {
    // 1. 位运算加法
    public static int add(int a, int b) {
        int sum = a;
        while (b != 0) {
            sum = a ^ b;       // 无进位相加
            b = (a & b) << 1;  // 进位信息
            a = sum;
        }
        return sum;
    }

    // 2. 位运算减法：a - b = a + (-b) = a + (~b + 1)
    public static int minus(int a, int b) {
        return add(a, add(~b, 1));
    }

    // 3. 位运算乘法：二进制竖式乘法
    public static int multiply(int a, int b) {
        int ans = 0;
        while (b != 0) {
            if ((b & 1) != 0) {
                ans = add(ans, a);
            }
            a <<= 1;
            b >>>= 1;
        }
        return ans;
    }
}`,
  cpp: `class BitwiseArithmetic032 {
public:
    static int add(int a, int b) {
        while (b != 0) {
            unsigned int carry = (unsigned int)(a & b) << 1;
            a = a ^ b;
            b = carry;
        }
        return a;
    }

    static int minus(int a, int b) {
        return add(a, add(~b, 1));
    }

    static int multiply(int a, int b) {
        int ans = 0;
        unsigned int ub = b;
        while (ub != 0) {
            if (ub & 1) ans = add(ans, a);
            a <<= 1;
            ub >>= 1;
        }
        return ans;
    }
};`,
  python: `class BitwiseArithmetic032:
    @staticmethod
    def add(a: int, b: int) -> int:
        mask = 0xFFFFFFFF
        while b != 0:
            a, b = (a ^ b) & mask, ((a & b) << 1) & mask
        return a if a <= 0x7FFFFFFF else ~(a ^ mask)

    @staticmethod
    def minus(a: int, b: int) -> int:
        return BitwiseArithmetic032.add(a, BitwiseArithmetic032.add(~b, 1))

    @staticmethod
    def multiply(a: int, b: int) -> int:
        ans = 0
        while b != 0:
            if b & 1:
                ans = BitwiseArithmetic032.add(ans, a)
            a <<= 1
            b >>= 1
        return ans`,
  typescript: `export class BitwiseArithmetic032 {
  static add(a: number, b: number): number {
    let sum = a;
    while (b !== 0) {
      sum = a ^ b;
      b = (a & b) << 1;
      a = sum;
    }
    return sum;
  }

  static minus(a: number, b: number): number {
    return this.add(a, this.add(~b, 1));
  }

  static multiply(a: number, b: number): number {
    let ans = 0;
    while (b !== 0) {
      if ((b & 1) !== 0) {
        ans = this.add(ans, a);
      }
      a <<= 1;
      b >>>= 1;
    }
    return ans;
  }
}`
};

export const BITWISE_ARITHMETIC_032_CODE_LINES: Record<string, Record<string, number>> = {
  addInit: { java: 4, cpp: 4, python: 5, typescript: 3, javascript: 3 },
  addStep: { java: 7, cpp: 6, python: 6, typescript: 5, javascript: 5 },
  addDone: { java: 10, cpp: 10, python: 7, typescript: 9, javascript: 9 },
  minusDone: { java: 15, cpp: 13, python: 11, typescript: 13, javascript: 13 },
  mulInit: { java: 20, cpp: 17, python: 15, typescript: 17, javascript: 17 },
  mulStep: { java: 23, cpp: 20, python: 18, typescript: 20, javascript: 20 },
  mulDone: { java: 28, cpp: 24, python: 21, typescript: 25, javascript: 25 },
};

export function generateBitwiseSteps(a: number, b: number, op: 'add' | 'minus' | 'multiply' = 'add'): BitwiseArithmeticStep[] {
  const steps: BitwiseArithmeticStep[] = [];
  let stepIdx = 0;

  if (op === 'add') {
    let curA = a;
    let curB = b;
    let iter = 0;

    steps.push({
      stepIndex: stepIdx++,
      op: 'add',
      a: curA,
      b: curB,
      currentResult: curA,
      iter,
      decision: `准备执行位运算加法：计算 ${a} + ${b}`,
      message: `初始 a=${curA}, b=${curB}`,
      log: '初始化加法',
      codeLine: BITWISE_ARITHMETIC_032_CODE_LINES.addInit,
      statusBadge: { text: '开始加法', type: 'info' }
    });

    while (curB !== 0) {
      iter++;
      const xorSum = curA ^ curB;
      const carry = (curA & curB) << 1;

      steps.push({
        stepIndex: stepIdx++,
        op: 'add',
        a: curA,
        b: curB,
        xorSum,
        carry,
        currentResult: xorSum,
        iter,
        decision: `第 ${iter} 轮：无进位相加 (a ^ b) = ${xorSum}；进位信息 ((a & b) << 1) = ${carry}`,
        message: `sum=${xorSum}, carry=${carry}`,
        log: `第 ${iter} 轮计算完成`,
        codeLine: BITWISE_ARITHMETIC_032_CODE_LINES.addStep,
        statusBadge: carry !== 0 ? { text: `进位中 (${carry})`, type: 'warning' } : { text: '进位清零', type: 'success' }
      });

      curA = xorSum;
      curB = carry;
    }

    steps.push({
      stepIndex: stepIdx++,
      op: 'add',
      a: curA,
      b: 0,
      currentResult: curA,
      iter,
      decision: `进位为 0，计算终止！最终结果为 ${curA}`,
      message: `最终和 sum = ${curA}`,
      log: `加法计算完成: ${curA}`,
      codeLine: BITWISE_ARITHMETIC_032_CODE_LINES.addDone,
      statusBadge: { text: `结果: ${curA}`, type: 'success' }
    });
  } else if (op === 'minus') {
    const negB = ~b + 1;
    steps.push({
      stepIndex: stepIdx++,
      op: 'minus',
      a,
      b,
      currentResult: a - b,
      iter: 1,
      decision: `减法转化为负数加法：${a} - ${b} = ${a} + (~${b} + 1) = ${a} + (${negB}) = ${a + negB}`,
      message: `求得相反数 ~b + 1 = ${negB}`,
      log: '减法直接转化为补码加法',
      codeLine: BITWISE_ARITHMETIC_032_CODE_LINES.minusDone,
      statusBadge: { text: `结果: ${a - b}`, type: 'success' }
    });
  } else {
    // 乘法
    let curA = a;
    let curB = b;
    let ans = 0;
    let iter = 0;

    steps.push({
      stepIndex: stepIdx++,
      op: 'multiply',
      a: curA,
      b: curB,
      currentResult: 0,
      iter,
      decision: `开始二进制竖式乘法：${a} * ${b}`,
      message: `初始 ans=0`,
      log: '初始化乘法',
      codeLine: BITWISE_ARITHMETIC_032_CODE_LINES.mulInit,
      statusBadge: { text: '乘法启动', type: 'info' }
    });

    while (curB !== 0) {
      iter++;
      const hasOne = (curB & 1) !== 0;
      if (hasOne) {
        ans += curA;
      }

      steps.push({
        stepIndex: stepIdx++,
        op: 'multiply',
        a: curA,
        b: curB,
        currentResult: ans,
        iter,
        decision: `第 ${iter} 轮：b 末位为 ${hasOne ? '1 (累加 a 至结果)' : '0 (无需累加)'}，当前累加和 ans=${ans}；随后 a 左移一位，b 逻辑右移一位`,
        message: `ans = ${ans}`,
        log: `乘法第 ${iter} 位处理`,
        codeLine: BITWISE_ARITHMETIC_032_CODE_LINES.mulStep,
        statusBadge: hasOne ? { text: `累加 ${curA}`, type: 'warning' } : { text: '跳过累加', type: 'info' }
      });

      curA <<= 1;
      curB >>>= 1;
    }

    steps.push({
      stepIndex: stepIdx++,
      op: 'multiply',
      a: curA,
      b: 0,
      currentResult: ans,
      iter,
      decision: `乘法完成！所有有效二进制位均已乘算合并，最终积为 ${ans}`,
      message: `最终积 = ${ans}`,
      log: `乘法完毕: ${ans}`,
      codeLine: BITWISE_ARITHMETIC_032_CODE_LINES.mulDone,
      statusBadge: { text: `积: ${ans}`, type: 'success' }
    });
  }

  return steps;
}
