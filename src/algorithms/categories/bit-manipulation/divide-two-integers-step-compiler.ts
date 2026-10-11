/**
 * 两数相除 (Divide Two Integers) - 步进编译器
 * LeetCode 29 (Medium / 左程云通关课 Class 032 进阶)
 */

import { StepBase } from '../../../core/step-visualizer';

export interface DivideStep extends StepBase {
  dividend: number;
  divisor: number;
  remaining: number;
  currentShift: number;
  currentMultiple: number;
  quotient: number;
  phase: 'init' | 'find-shift' | 'subtract' | 'finish';
  message: string;
  log: string;
  codeLine: number | Record<string, number>;
}

export const DIVIDE_TWO_INTEGERS_CODES = {
  java: `public class Solution {
    public int divide(int dividend, int divisor) {
        if (dividend == Integer.MIN_VALUE && divisor == -1) return Integer.MAX_VALUE;
        boolean negative = (dividend > 0) ^ (divisor > 0);
        long a = Math.abs((long) dividend);
        long b = Math.abs((long) divisor);
        int ans = 0;
        
        while (a >= b) {
            long temp = b;
            int multiple = 1;
            while (a >= (temp << 1)) {
                temp <<= 1;
                multiple <<= 1;
            }
            a -= temp;
            ans += multiple;
        }
        return negative ? -ans : ans;
    }
}`,
  cpp: `class Solution {
public:
    int divide(int dividend, int divisor) {
        if (dividend == INT_MIN && divisor == -1) return INT_MAX;
        bool negative = (dividend > 0) ^ (divisor > 0);
        long long a = labs(dividend), b = labs(divisor);
        int ans = 0;
        while (a >= b) {
            long long temp = b;
            int multiple = 1;
            while (a >= (temp << 1)) {
                temp <<= 1;
                multiple <<= 1;
            }
            a -= temp;
            ans += multiple;
        }
        return negative ? -ans : ans;
    }
};`,
  python: `class Solution:
    def divide(self, dividend: int, divisor: int) -> int:
        if dividend == -2147483648 and divisor == -1:
            return 2147483647
        negative = (dividend > 0) ^ (divisor > 0)
        a, b = abs(dividend), abs(divisor)
        ans = 0
        while a >= b:
            temp, multiple = b, 1
            while a >= (temp << 1):
                temp <<= 1
                multiple <<= 1
            a -= temp
            ans += multiple
        return -ans if negative else ans`,
};

export const DIVIDE_LINES: Record<string, Record<string, number>> = {
  init: { java: 4, cpp: 5, python: 5 },
  findShift: { java: 11, cpp: 11, python: 10 },
  subtract: { java: 16, cpp: 16, python: 14 },
  finish: { java: 19, cpp: 19, python: 15 },
};

export function buildDivideSteps(dividend: number = 29, divisor: number = 3): DivideStep[] {
  const steps: DivideStep[] = [];

  const negative = (dividend > 0) !== (divisor > 0);
  let a = Math.abs(dividend);
  const b = Math.abs(divisor);
  let ans = 0;

  // Step 0: Init
  steps.push({
    dividend,
    divisor,
    remaining: a,
    currentShift: 0,
    currentMultiple: 0,
    quotient: 0,
    phase: 'init',
    message: `算法启动：被除数 ${dividend}，除数 ${divisor}。符号判定：${negative ? '异号(负)' : '同号(正)'}。转绝对值运算 |a|=${a}, |b|=${b}。`,
    log: `初始化两数相除: a=${a}, b=${b}, negative=${negative}`,
    codeLine: DIVIDE_LINES.init,
  });

  while (a >= b) {
    let temp = b;
    let multiple = 1;
    let shift = 0;

    // 探测最大倍增
    while (a >= temp * 2) {
      temp *= 2;
      multiple *= 2;
      shift++;
    }

    steps.push({
      dividend,
      divisor,
      remaining: a,
      currentShift: shift,
      currentMultiple: multiple,
      quotient: ans,
      phase: 'find-shift',
      message: `倍增逼近：除数 ${b} 左移 ${shift} 位得到 ${temp} (相当于 ${b} × ${multiple})，是 <= 剩余量 ${a} 的最大倍数。`,
      log: `找到最大二进制步长: temp=${temp} (${b}*${multiple}), shift=${shift}`,
      codeLine: DIVIDE_LINES.findShift,
    });

    a -= temp;
    ans += multiple;

    steps.push({
      dividend,
      divisor,
      remaining: a,
      currentShift: shift,
      currentMultiple: multiple,
      quotient: ans,
      phase: 'subtract',
      message: `扣减累加：被除数扣除 ${temp}，余量剩余 ${a}。商累加 ${multiple} 达到 ${ans}。`,
      log: `扣减完成: 余量=${a}, 累计商=${ans}`,
      codeLine: DIVIDE_LINES.subtract,
    });
  }

  const finalAns = negative ? -ans : ans;

  // Finish
  steps.push({
    dividend,
    divisor,
    remaining: a,
    currentShift: 0,
    currentMultiple: 0,
    quotient: finalAns,
    phase: 'finish',
    message: `除法收敛：余量 ${a} < 除数 ${b}，运算终止。结合符号位，最终商为 ${finalAns}，余数为 ${a}。`,
    log: `计算完成，最终商=${finalAns}, 余数=${a}`,
    codeLine: DIVIDE_LINES.finish,
  });

  return steps;
}
