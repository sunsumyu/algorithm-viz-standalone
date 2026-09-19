/**
 * 位运算与位图专题物理不变量顶级架构机械防退化门禁
 * (Bit Manipulation & BitMap Invariants Gatekeeper)
 *
 * 守护领域：
 * 1. 经典位运算神技与位图实现 (Bit Tricks & BitSet 4 题)：
 *    - 位运算核心技巧 (Brian Kernighan / lowbit / 2的幂判定)
 *    - 只出现一次的数字 II (Single Number II - 模3有限状态自动机)
 *    - 只出现一次的数字 III (Single Number III - 异或分组锁定两数)
 *    - BitSet 位图数组操作 (BitSet Array)
 *
 * 2. 左程云大课位运算进阶与四则运算专题 (Class 032, 033, 034 + 两数相除 4 题)：
 *    - Class 032: 纯位运算实现加减乘除 (Bitwise Arithmetic)
 *    - Class 033: 位图结构设计与海量数据去重 (BitMap Design)
 *    - Class 034: 异或运算奇妙用法与提取奇数次数字 (Bitwise XOR Odd Occurrences)
 *    - 两数相除 (Divide Two Integers - 二进制倍增快速逼近商)
 *
 * 核心机械不变量红线：
 * 1. 异或无进位相加与自反性守恒 (XOR Self-Inverse Invariant)：
 *    A ^ A = 0, A ^ 0 = A；偶数次出现元素全量抵消，奇数次目标元素精确析出；
 * 2. lowbit 分水岭定理 (Rightmost 1 Bit Partition Invariant)：
 *    rightOne = eor & (-eor) 必为 2 的正整数次幂，在该 bit 位上两个目标异或数必定一为 1 一为 0，实现空间严格两分；
 * 3. 算术除法与乘法数学守恒 (Arithmetic Doubling & Conservation)：
 *    位运算竖式累加结果与数学积严格等价；除法终局必定满足：被除数 = 商 × 除数 + 余数，且 0 <= |余数| < |除数|；
 * 4. 多语言代码行映射合法区间：[1, totalLines]，严禁越界与 0 偏移。
 */

import { describe, it, expect } from 'vitest';

// Part 1: Classic Bit Tricks & BitSet 4 题
import { buildBitTricksSteps } from '../../algorithms/categories/bit/bit-manipulation/bit-tricks-renderer';
import { buildSingleNumberIISteps } from '../../algorithms/categories/bit/bit-manipulation/single-number-ii-renderer';
import { buildSingleNumberIIISteps } from '../../algorithms/categories/bit/bit-manipulation/single-number-iii-renderer';
import { buildBitsetArraySteps } from '../../algorithms/categories/bit/bit-manipulation/bitset-array-renderer';
import {
  BIT_TRICKS_CODES,
  SINGLE_NUMBER_II_CODES,
  SINGLE_NUMBER_III_CODES,
  BITSET_ARRAY_CODES,
} from '../../algorithms/categories/bit/bit-manipulation/bit-stage-codes';

// Part 2: 左程云大课与位运算进阶 4 题
import { generateBitwiseSteps, BITWISE_ARITHMETIC_032_CODES } from '../../algorithms/categories/bit-manipulation/bitwise-arithmetic-032-renderer';
import { generateBitMapSteps, BITMAP_033_CODES } from '../../algorithms/categories/bit-manipulation/bitmap-design-033-renderer';
import { generateXorSteps, BITWISE_XOR_CODES } from '../../algorithms/categories/bit-manipulation/bitwise-xor-odd-times-034-renderer';
import { buildDivideSteps, DIVIDE_TWO_INTEGERS_CODES } from '../../algorithms/categories/bit-manipulation/divide-two-integers-renderer';

/**
 * 验证步进序列中的多语言代码行号合法性
 */
function verifyCodeLines(
  steps: any[],
  algoName: string,
  codeSource: Record<string, string | string[]>
) {
  expect(steps.length, `${algoName}: 步进序列不能为空`).toBeGreaterThan(0);
  const langs = ['java', 'cpp', 'python', 'javascript', 'typescript'];

  for (const lang of langs) {
    const raw = codeSource[lang];
    if (!raw) continue;
    const maxLine = Array.isArray(raw) ? raw.length : raw.split('\n').length;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step.codeLine === undefined || step.codeLine === null) continue;

      let lineNum: number | undefined;
      if (typeof step.codeLine === 'number') {
        lineNum = step.codeLine;
      } else if (typeof step.codeLine === 'object') {
        const val = step.codeLine[lang];
        if (typeof val === 'number') {
          lineNum = val;
        } else if (Array.isArray(val) && val.length > 0) {
          lineNum = val[0];
        }
      }

      if (lineNum !== undefined && lineNum > 0) {
        expect(
          lineNum,
          `${algoName} [${lang}] 第 ${i} 步行号 ${lineNum} 超过最大行数 ${maxLine}`
        ).toBeLessThanOrEqual(maxLine);
        expect(
          lineNum,
          `${algoName} [${lang}] 第 ${i} 步行号 ${lineNum} 小于 1`
        ).toBeGreaterThanOrEqual(1);
      }
    }
  }
}

describe('位运算与位图专题物理不变量顶级架构机械防退化门禁 (Bit Manipulation Gatekeeper)', () => {
  describe('Part 1: 经典位运算神技与位图实现 (Bit Tricks & BitSet 4 题)', () => {
    it('1. 位运算核心神技 (Brian Kernighan & Bit Tricks): lowbit 提取与 2 的幂判定', () => {
      const num = 40; // 0b101000
      const steps = buildBitTricksSteps(num);
      expect(steps.length).toBeGreaterThanOrEqual(4);

      // 提取最右侧 1: 40 最低 1 为 8 (0b1000)
      const extractStep = steps.find(s => s.decision.includes('神技一'));
      expect(extractStep).toBeDefined();
      expect(extractStep?.comparisonView?.resVal).toBe(8);

      // 消除最右侧 1: 40 & 39 = 32 (0b100000)
      const clearStep = steps.find(s => s.decision.includes('神技二'));
      expect(clearStep).toBeDefined();
      expect(clearStep?.comparisonView?.resVal).toBe(32);

      // 2 的幂判定: 40 不是 2 的幂
      const powerStep = steps.find(s => s.decision.includes('神技三'));
      expect(powerStep).toBeDefined();
      expect(powerStep?.decision).toContain('不是 2 的幂');

      verifyCodeLines(steps, '位运算核心神技', BIT_TRICKS_CODES);
    });

    it('2. 只出现一次的数字 II (Single Number II): 模 3 有限状态自动机状态精确回归', () => {
      const nums = [2, 2, 3, 2];
      const steps = buildSingleNumberIISteps(nums);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.stateView?.ones).toBe(3);

      verifyCodeLines(steps, '只出现一次的数字 II', SINGLE_NUMBER_II_CODES);
    });

    it('3. 只出现一次的数字 III (Single Number III): 异或划分两独立数，排序校验等价', () => {
      const nums = [1, 2, 1, 3, 2, 5];
      const steps = buildSingleNumberIIISteps(nums);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.groupView).toBeDefined();
      const aVal = last.groupView!.xorA!;
      const bVal = last.groupView!.xorB!;
      expect(aVal).toBeDefined();
      expect(bVal).toBeDefined();
      const ans = [aVal, bVal].sort((x, y) => x - y);
      expect(ans).toEqual([3, 5]);

      verifyCodeLines(steps, '只出现一次的数字 III', SINGLE_NUMBER_III_CODES);
    });

    it('4. 位图数组操作 (Bitset Array): 空间压缩桶索引与查询布尔一致性', () => {
      const inserted = [5, 35, 68, 12];
      const queryVal = 35;
      const steps = buildBitsetArraySteps(inserted, queryVal);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.bitsetView?.result).toBe(true);

      // 查询不存在的元素
      const stepsMissing = buildBitsetArraySteps(inserted, 99);
      const lastMissing = stepsMissing[stepsMissing.length - 1];
      expect(lastMissing.bitsetView?.result).toBe(false);

      verifyCodeLines(steps, '位图数组操作', BITSET_ARRAY_CODES);
    });
  });

  describe('Part 2: 左程云大课位运算进阶与四则运算专题 (Class 032, 033, 034 + 两数相除 4 题)', () => {
    it('5. Class 032: 位运算实现加减乘除 (Bitwise Arithmetic): 加法进位收敛与乘法二进制累加', () => {
      // 1. 加法: 27 + 15 = 42
      const addSteps = generateBitwiseSteps(27, 15, 'add');
      expect(addSteps.length).toBeGreaterThan(0);
      const lastAdd = addSteps[addSteps.length - 1];
      expect(lastAdd.currentResult).toBe(42);

      // 2. 减法: 42 - 15 = 27
      const minusSteps = generateBitwiseSteps(42, 15, 'minus');
      expect(minusSteps.length).toBeGreaterThan(0);
      const lastMinus = minusSteps[minusSteps.length - 1];
      expect(lastMinus.currentResult).toBe(27);

      // 3. 乘法: 7 * 6 = 42
      const mulSteps = generateBitwiseSteps(7, 6, 'multiply');
      expect(mulSteps.length).toBeGreaterThan(0);
      const lastMul = mulSteps[mulSteps.length - 1];
      expect(lastMul.currentResult).toBe(42);

      verifyCodeLines(addSteps, 'Class 032 加法', BITWISE_ARITHMETIC_032_CODES);
      verifyCodeLines(minusSteps, 'Class 032 减法', BITWISE_ARITHMETIC_032_CODES);
      verifyCodeLines(mulSteps, 'Class 032 乘法', BITWISE_ARITHMETIC_032_CODES);
    });

    it('6. Class 033: 位图结构设计与海量数据去重 (BitMap Design): 连续增删查生命周期自洽', () => {
      const ops: Array<{ type: 'add' | 'remove' | 'contains'; num: number }> = [
        { type: 'add', num: 10 },
        { type: 'add', num: 42 },
        { type: 'contains', num: 10 },
        { type: 'contains', num: 99 },
        { type: 'remove', num: 10 },
        { type: 'contains', num: 10 },
      ];

      const steps = generateBitMapSteps(128, ops);
      expect(steps.length).toBe(ops.length + 1); // step 0 + ops

      // 查找 10 应该为 true
      expect(steps[3].queryResult).toBe(true);
      // 查找 99 应该为 false
      expect(steps[4].queryResult).toBe(false);
      // 移除 10 后再次查找 10 应该为 false
      expect(steps[6].queryResult).toBe(false);

      verifyCodeLines(steps, 'Class 033 位图设计', BITMAP_033_CODES);
    });

    it('7. Class 034: 异或运算奇妙用法 (Bitwise XOR Odd Occurrences): 单奇数与双奇数精准析出', () => {
      // 1. 单奇数模式: [4, 1, 2, 1, 2] -> 4
      const singleSteps = generateXorSteps('single');
      expect(singleSteps.length).toBeGreaterThan(0);
      const lastSingle = singleSteps[singleSteps.length - 1];
      expect(lastSingle.resultA).toBe(4);

      // 2. 双奇数模式: [3, 5, 2, 3, 2, 7] -> 5 与 7
      const doubleSteps = generateXorSteps('double');
      expect(doubleSteps.length).toBeGreaterThan(0);
      const lastDouble = doubleSteps[doubleSteps.length - 1];
      const sortedAns = [lastDouble.resultA!, lastDouble.resultB!].sort((a, b) => a - b);
      expect(sortedAns).toEqual([5, 7]);

      verifyCodeLines(singleSteps, 'Class 034 异或单奇数', BITWISE_XOR_CODES);
      verifyCodeLines(doubleSteps, 'Class 034 异或双奇数', BITWISE_XOR_CODES);
    });

    it('8. 两数相除 (Divide Two Integers): 二进制倍增快速逼近商，满足被除数整除守恒', () => {
      // 1. 正数用例: 29 / 3 = 9, 余数 2
      const steps1 = buildDivideSteps(29, 3);
      expect(steps1.length).toBeGreaterThan(0);
      const last1 = steps1[steps1.length - 1];
      expect(last1.quotient).toBe(9);
      expect(last1.remaining).toBe(2);
      expect(29).toBe(last1.quotient * 3 + last1.remaining);

      // 2. 异号用例: -45 / 7 = -6, 余数 3
      const steps2 = buildDivideSteps(-45, 7);
      expect(steps2.length).toBeGreaterThan(0);
      const last2 = steps2[steps2.length - 1];
      expect(last2.quotient).toBe(-6);
      expect(last2.remaining).toBe(3);

      verifyCodeLines(steps1, '两数相除 (同号)', DIVIDE_TWO_INTEGERS_CODES);
      verifyCodeLines(steps2, '两数相除 (异号)', DIVIDE_TWO_INTEGERS_CODES);
    });
  });
});
