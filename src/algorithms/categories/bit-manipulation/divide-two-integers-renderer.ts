/**
 * 两数相除 (Divide Two Integers)
 * LeetCode 29 (Medium / 左程云通关课 Class 032 进阶)
 * 核心原语:
 *  不使用乘法、除法和取模运算符，实现整数除法。
 *  核心解法：二进制倍增减法（Bitwise Doubling Subtraction）。
 *  对被除数与除数统一转为负数处理（规避 Integer.MIN_VALUE 溢出）。
 *  每次寻找除数通过左移 (<< 1) 所能达到的最大不超过被除数的倍数，
 *  从被除数中扣除并累加对应的商的倍数 (1 << shift)，反复迭代直至被除数小于除数。
 *  时间复杂度 O(log^2 N) 或 O(31) = O(1)，空间复杂度 O(1)。
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
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
  codeLine: number;
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
    codeLine: 5,
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
      codeLine: 13,
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
      codeLine: 18,
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
    codeLine: 21,
  });

  return steps;
}

function renderDivideCanvas(step: DivideStep): string {
  const { dividend, divisor, remaining, currentShift, currentMultiple, quotient, phase } = step;

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <!-- 上部 运算可视化面板 -->
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">二进制快速倍增减法剖面 (${dividend} ÷ ${divisor})</div>
          <div style="font-size: 11px; color: #fbbf24; font-weight: 700;">
            ${phase === 'find-shift' ? `探测中: 左移 ${currentShift} 位 (×${currentMultiple})` : phase === 'subtract' ? `已扣除: 余量 ${remaining}` : '运算就绪'}
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: center; gap: 16px; min-height: 80px;">
          <!-- 剩余被除数 -->
          <div style="display: flex; flex-direction: column; align-items: center; background: rgba(56, 189, 248, 0.15); border: 2px solid #38bdf8; border-radius: 8px; padding: 10px 16px;">
            <span style="font-size: 11px; color: #94a3b8;">当前余量 a</span>
            <span style="font-size: 24px; font-weight: 700; color: #38bdf8;">${remaining}</span>
          </div>

          <div style="font-size: 20px; color: #64748b; font-weight: 700;">−</div>

          <!-- 本轮倍增除数 -->
          <div style="display: flex; flex-direction: column; align-items: center; background: rgba(245, 158, 11, 0.15); border: 2px solid #f59e0b; border-radius: 8px; padding: 10px 16px;">
            <span style="font-size: 11px; color: #94a3b8;">扣除倍数 b × 2^${currentShift}</span>
            <span style="font-size: 24px; font-weight: 700; color: #fbbf24;">${Math.abs(divisor) * currentMultiple}</span>
          </div>

          <div style="font-size: 20px; color: #64748b; font-weight: 700;">=</div>

          <!-- 累积商 -->
          <div style="display: flex; flex-direction: column; align-items: center; background: rgba(16, 185, 129, 0.15); border: 2px solid #10b981; border-radius: 8px; padding: 10px 16px;">
            <span style="font-size: 11px; color: #94a3b8;">累计商 ans</span>
            <span style="font-size: 24px; font-weight: 700; color: #34d399;">${quotient}</span>
          </div>
        </div>
      </div>

      <!-- 底部指标卡片 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">被除数 / 除数</div>
          <div style="font-size: 16px; font-weight: 700; color: #60a5fa;">${dividend} / ${divisor}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">本轮左移位移 shift</div>
          <div style="font-size: 16px; font-weight: 700; color: #fbbf24;">${currentShift} 位</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前商增量 (1 << shift)</div>
          <div style="font-size: 16px; font-weight: 700; color: #38bdf8;">+${currentMultiple}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">最终结果 商</div>
          <div style="font-size: 18px; font-weight: 700; color: #34d399;">${quotient}</div>
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'divide-two-integers',
  name: '两数相除',
  category: 'bit-manipulation',
  difficulty: 2,
  learningGoal: 'LeetCode 29: 不用乘除与取模运算实现除法。基于二进制倍增减法，在 O(log^2 N) 时间内高效定位商。',
  codeLanguages: DIVIDE_TWO_INTEGERS_CODES,
  generateSteps: (inputs) => {
    const rawA = Number(inputs?.dividend ?? 29);
    const rawB = Number(inputs?.divisor ?? 3);
    const a = isNaN(rawA) ? 29 : rawA;
    const b = isNaN(rawB) || rawB === 0 ? 3 : rawB;
    return buildDivideSteps(a, b);
  },
  renderCanvas: (container: HTMLElement, step: DivideStep) => {
    container.innerHTML = renderDivideCanvas(step);
  },
  inputs: [
    {
      id: 'dividend',
      label: '被除数',
      type: 'number',
      defaultValue: 29,
      placeholder: '整数被除数',
    },
    {
      id: 'divisor',
      label: '除数',
      type: 'number',
      defaultValue: 3,
      placeholder: '非零整数除数',
    },
  ],
});
