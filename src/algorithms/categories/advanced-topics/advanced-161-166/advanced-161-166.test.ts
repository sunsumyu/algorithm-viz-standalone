/**
 * 左神算法通关课 Class 161 ~ 166 快速数论变换、多项式求逆、FWT、杜教筛、莫比乌斯反演与卢卡斯定理 自动化测试套件
 */

import { describe, it, expect } from 'vitest';
import { buildNTTSteps } from './ntt-transform-renderer';
import { buildPolyInvSteps } from './polynomial-inverse-renderer';
import { buildFWTSteps } from './fwt-walsh-renderer';
import { buildDujiaoSteps } from './dujiao-sieve-renderer';
import { buildMobiusSteps } from './mobius-inversion-renderer';
import { buildLucasSteps } from './lucas-theorem-renderer';
import {
  NTT_CODES,
  POLYNOMIAL_INVERSE_CODES,
  FWT_WALSH_CODES,
  DUJIAO_SIEVE_CODES,
  MOBIUS_INVERSION_CODES,
  LUCAS_THEOREM_CODES,
} from './advanced-161-166-stage-codes';

function verify1BasedCodeLines(steps: any[], codes: Record<string, string[]>) {
  expect(steps.length).toBeGreaterThan(0);
  for (const step of steps) {
    if (step.codeLine) {
      for (const lang of ['java', 'cpp', 'python', 'javascript']) {
        const line = step.codeLine[lang];
        expect(line, `Missing line mapping for ${lang}`).toBeDefined();
        expect(line, `Line must be >= 1 for ${lang}`).toBeGreaterThanOrEqual(1);
        expect(
          line,
          `Line ${line} exceeds code length ${codes[lang].length} for ${lang}`
        ).toBeLessThanOrEqual(codes[lang].length);
      }
    }
  }
}

describe('左神多项式全家桶与进阶数论专题 (Class 161 ~ 166) 综合测试套件', () => {
  // 1. Class 161: 快速数论变换 (NTT)
  describe('Class 161: 快速数论变换 (NTT)', () => {
    it('NTT 模 998244353 多项式乘法 [1,2,3] * [2,1] 精确输出 [2,5,8,3]', () => {
      const steps = buildNTTSteps([1, 2, 3], [2, 1]);
      const last = steps[steps.length - 1];
      expect(last.convResult).toEqual([2, 5, 8, 3]);
      verify1BasedCodeLines(steps, NTT_CODES);
    });
  });

  // 2. Class 162: 多项式求逆 (Polynomial Inverse)
  describe('Class 162: 多项式求逆 (Polynomial Inverse)', () => {
    it('牛顿迭代法倍增求模 x^4 乘法逆元', () => {
      const steps = buildPolyInvSteps([1, 2, 3, 4], 4);
      const last = steps[steps.length - 1];
      expect(last.polyB.length).toBe(4);
      expect(last.polyB[0]).toBe(1);
      // 检查 (1 - 2x + x^2) mod x^4 对应的模 998244353 系数
      expect(last.polyB[1]).toBe(998244351); // 998244353 - 2
      expect(last.polyB[2]).toBe(1);
      expect(last.polyB[3]).toBe(0);
      verify1BasedCodeLines(steps, POLYNOMIAL_INVERSE_CODES);
    });
  });

  // 3. Class 163: 快速沃尔什变换 (FWT)
  describe('Class 163: 快速沃尔什变换 (FWT)', () => {
    it('XOR 位运算卷积准确合并异或下标乘积', () => {
      const steps = buildFWTSteps([1, 2, 3, 4], [1, 1, 1, 1], 'XOR');
      const last = steps[steps.length - 1];
      expect(last.res).toEqual([10, 10, 10, 10]);
      verify1BasedCodeLines(steps, FWT_WALSH_CODES);
    });
  });

  // 4. Class 164: 杜教筛 (Dujiao Sieve)
  describe('Class 164: 杜教筛 (Dujiao Sieve)', () => {
    it('狄利克雷卷积恒等式结合数论分块准确求 S(50)', () => {
      const steps = buildDujiaoSteps(50);
      const last = steps[steps.length - 1];
      expect(last.finalAns).toBeDefined();
      expect(last.memoCount).toBeGreaterThan(0);
      verify1BasedCodeLines(steps, DUJIAO_SIEVE_CODES);
    });
  });

  // 5. Class 165: 莫比乌斯反演 (Möbius Inversion)
  describe('Class 165: 莫比乌斯反演 (Möbius Inversion)', () => {
    it('N=6, M=8 区域内互质数对总数严格为 32', () => {
      const steps = buildMobiusSteps(6, 8);
      const last = steps[steps.length - 1];
      expect(last.currentSum).toBe(32);
      expect(last.blocks.length).toBeGreaterThan(0);
      verify1BasedCodeLines(steps, MOBIUS_INVERSION_CODES);
    });
  });

  // 6. Class 166: 卢卡斯定理 (Lucas Theorem)
  describe('Class 166: 卢卡斯定理 (Lucas Theorem)', () => {
    it('C(23, 11) mod 5 进制拆分后准确得到 3', () => {
      const steps = buildLucasSteps(23, 11, 5);
      const last = steps[steps.length - 1];
      expect(last.ans).toBe(3);
      expect(last.digits.length).toBe(2);
      verify1BasedCodeLines(steps, LUCAS_THEOREM_CODES);
    });

    it('C(12, 5) mod 7 准确得到 1', () => {
      const steps = buildLucasSteps(12, 5, 7);
      const last = steps[steps.length - 1];
      expect(last.ans).toBe(1);
    });
  });
});
