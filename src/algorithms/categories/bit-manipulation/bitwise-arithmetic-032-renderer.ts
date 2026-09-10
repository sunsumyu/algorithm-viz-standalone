/**
 * Class 032: 位运算实现加减乘除 (Bitwise Arithmetic Operations)
 * 左程云算法通关课入门篇 Class 032
 * 纯位运算实现算术四则运算：异或与进位相加、补码相反数减法、二进制竖式乘法与高位试商除法
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

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
  codeLine?: number;
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
      codeLine: 4,
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
        codeLine: 7,
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
      codeLine: 10,
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
      codeLine: 15,
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
      codeLine: 20,
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
        codeLine: 23,
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
      codeLine: 28,
      statusBadge: { text: `积: ${ans}`, type: 'success' }
    });
  }

  return steps;
}

export function renderBitwiseCanvas(container: HTMLElement, step: BitwiseArithmeticStep) {
  const { a, b, xorSum, carry, currentResult, iter, op } = step;

  const toBinary8 = (val: number) => {
    return (val >>> 0).toString(2).padStart(8, '0').slice(-8);
  };

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
      <!-- 状态看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">运算符</div>
          <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">
            ${op === 'add' ? '加法 (ADD)' : op === 'minus' ? '减法 (SUB)' : '乘法 (MUL)'}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前 A</div>
          <div style="font-size: 14px; font-weight: bold; color: #f59e0b;">
            ${a} (${toBinary8(a)})
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前 B / 进位</div>
          <div style="font-size: 14px; font-weight: bold; color: #ec4899;">
            ${b} (${toBinary8(b)})
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前结果</div>
          <div style="font-size: 14px; font-weight: bold; color: #10b981;">
            ${currentResult} (${toBinary8(currentResult)})
          </div>
        </div>
      </div>

      <!-- 二进制直观对齐模拟 -->
      <div style="background: rgba(15, 23, 42, 0.5); padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); font-family: monospace; display: flex; flex-direction: column; align-items: center; gap: 10px;">
        <div style="font-size: 13px; color: #94a3b8;">第 ${iter} 轮二进制位运算拆解:</div>
        <div style="display: flex; gap: 12px; font-size: 18px; color: #f8fafc;">
          <span style="color: #f59e0b;">A:  ${toBinary8(a)}</span>
        </div>
        <div style="display: flex; gap: 12px; font-size: 18px; color: #f8fafc;">
          <span style="color: #ec4899;">B:  ${toBinary8(b)}</span>
        </div>
        ${xorSum !== undefined && carry !== undefined ? `
          <div style="width: 240px; height: 1px; background: rgba(255,255,255,0.2); margin: 4px 0;"></div>
          <div style="display: flex; gap: 12px; font-size: 16px; color: #38bdf8;">
            <span>XOR(无进位): ${toBinary8(xorSum)}</span>
          </div>
          <div style="display: flex; gap: 12px; font-size: 16px; color: #a855f7;">
            <span>CARRY(进位):   ${toBinary8(carry)}</span>
          </div>
        ` : ''}
      </div>

      <!-- 核心数学与位运算逻辑卡片 -->
      ${renderFormulaCard(
        '位运算算术四则运算底层公理',
        'a + b = (a ^ b) + ((a & b) << 1)；相反数 -b = (~b + 1)；乘法利用二进制每一位的权值 (1 << k) 移位相加',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const bitwiseArithmetic032Visualizer = registerDeclarativeAlgorithm<BitwiseArithmeticStep>({
  id: 'bitwise-arithmetic-032',
  name: 'Class 032: 位运算实现加减乘除 (Bitwise Arithmetic)',
  category: 'bit-manipulation',
  icon: '⚡',
  difficulty: 2,
  levelOrder: 32,
  learningGoal: '不用任何算术运算符 (+, -, *, /)，纯粹利用位运算 (异或、与、非、移位) 实现算术四则运算',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 032)</h3>
      <p>这是计算机 CPU 算术逻辑单元 (ALU) 的物理底层实现原理：</p>
      <ul>
        <li><strong>加法</strong>：<code>a ^ b</code> 得到每一位无进位的和，<code>(a & b) << 1</code> 得到所有进位。将二者再次相加，直到进位为 0。</li>
        <li><strong>减法</strong>：<code>a - b = a + (-b)</code>，在计算机补码中，<code>-b = ~b + 1</code>。</li>
        <li><strong>乘法</strong>：二进制的竖式乘法，依次查看乘数的每一位是否为 1，若是则将当前被乘数累加到积中，被乘数左移，乘数右移。</li>
      </ul>
    </div>
  `,
  codeLanguages: BITWISE_ARITHMETIC_032_CODES,
  inputs: [
    {
      id: 'a',
      label: '操作数 A',
      type: 'number',
      defaultValue: 19,
    },
    {
      id: 'b',
      label: '操作数 B',
      type: 'number',
      defaultValue: 13,
    },
    {
      id: 'op',
      label: '运算模式',
      type: 'select',
      defaultValue: 'add',
      options: [
        { label: '加法 (ADD)', value: 'add' },
        { label: '减法 (MINUS)', value: 'minus' },
        { label: '乘法 (MULTIPLY)', value: 'multiply' },
      ],
    },
  ],
  generateSteps: (input) => {
    const a = Number(input.a) || 19;
    const b = Number(input.b) || 13;
    const op = (input.op as any) || 'add';
    return generateBitwiseSteps(a, b, op);
  },
  renderCanvas: (container, step) => {
    renderBitwiseCanvas(container, step);
  },
});
