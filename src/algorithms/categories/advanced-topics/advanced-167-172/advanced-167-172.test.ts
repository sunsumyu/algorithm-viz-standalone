/**
 * 左神算法通关课 Class 167 ~ 172 扩展卢卡斯、EXCRT、EXBSGS、多项式除法、多项式开方与多项式 ln/exp 自动化测试套件
 */

import { describe, it, expect } from 'vitest';
import { buildEXLucasSteps } from './exlucas-renderer';
import { buildEXCRTSteps } from './excrt-renderer';
import { buildEXBSGSSteps } from './exbsgs-renderer';
import { buildPolyDivSteps } from './polynomial-division-renderer';
import { buildPolySqrtSteps } from './polynomial-sqrt-renderer';
import { buildPolyLnExpSteps } from './polynomial-ln-exp-renderer';
import {
  EXLUCAS_CODES,
  EXCRT_CODES,
  EXBSGS_CODES,
  POLYNOMIAL_DIVISION_CODES,
  POLYNOMIAL_SQRT_CODES,
  POLYNOMIAL_LN_EXP_CODES,
} from './advanced-167-172-stage-codes';

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

describe('左神进阶数论与高阶形式幂级数专题 (Class 167 ~ 172) 综合测试套件', () => {
  // 1. Class 167: 扩展卢卡斯定理 (EXLucas)
  describe('Class 167: 扩展卢卡斯定理 (EXLucas)', () => {
    it('模合数 P=10 时 C(7, 3) mod 10 正确输出 5', () => {
      const steps = buildEXLucasSteps(7, 3, 10);
      const last = steps[steps.length - 1];
      expect(last.ans).toBe(5);
      expect(last.factors.length).toBe(2);
      verify1BasedCodeLines(steps, EXLUCAS_CODES);
    });

    it('含重因子素数幂 P=9 时 C(6, 2) mod 9 正确输出 6', () => {
      const steps = buildEXLucasSteps(6, 2, 9);
      const last = steps[steps.length - 1];
      expect(last.ans).toBe(6);
    });
  });

  // 2. Class 168: 扩展中国剩余定理 (EXCRT)
  describe('Class 168: 扩展中国剩余定理 (EXCRT)', () => {
    it('模数不互质同余方程组求解最小正整数解 46', () => {
      const steps = buildEXCRTSteps([
        { m: 4, r: 2 },
        { m: 6, r: 4 },
        { m: 5, r: 1 },
      ]);
      const last = steps[steps.length - 1];
      expect(last.ans).toBe(46);
      expect(last.currM).toBe(60);
      verify1BasedCodeLines(steps, EXCRT_CODES);
    });

    it('矛盾无解方程组能够及时判定无解返回 -1', () => {
      const steps = buildEXCRTSteps([
        { m: 4, r: 2 },
        { m: 4, r: 3 },
      ]);
      const last = steps[steps.length - 1];
      expect(last.ans).toBe(-1);
    });
  });

  // 3. Class 169: 扩展 BSGS (EXBSGS)
  describe('Class 169: 扩展 BSGS (EXBSGS)', () => {
    it('底数与模数不互质 2^x = 4 (mod 12) 准确求得 x = 2', () => {
      const steps = buildEXBSGSSteps(2, 4, 12);
      const last = steps[steps.length - 1];
      expect(last.ans).toBe(2);
      verify1BasedCodeLines(steps, EXBSGS_CODES);
    });

    it('公因子无法整除 2^x = 3 (mod 4) 正确判定无解 -1', () => {
      const steps = buildEXBSGSSteps(2, 3, 4);
      const last = steps[steps.length - 1];
      expect(last.ans).toBe(-1);
    });
  });

  // 4. Class 170: 多项式除法与取模 (Polynomial Division)
  describe('Class 170: 多项式除法与取模 (Polynomial Division)', () => {
    it('(x^3+2x^2+3x+4) / (x+1) 精确输出商 x^2+x+2 与余式 2', () => {
      const steps = buildPolyDivSteps([4, 3, 2, 1], [1, 1]);
      const last = steps[steps.length - 1];
      expect(last.polyQ).toEqual([2, 1, 1]);
      expect(last.polyR).toEqual([2]);
      verify1BasedCodeLines(steps, POLYNOMIAL_DIVISION_CODES);
    });
  });

  // 5. Class 171: 多项式开方 (Polynomial Sqrt)
  describe('Class 171: 多项式开方 (Polynomial Sqrt)', () => {
    it('(1+x)^2 = 1+2x+x^2 经牛顿开方准确还原 [1, 1, 0]', () => {
      const steps = buildPolySqrtSteps([1, 2, 1], 3);
      const last = steps[steps.length - 1];
      expect(last.polyB.slice(0, 2)).toEqual([1, 1]);
      expect(last.polyB[2]).toBe(0);
      verify1BasedCodeLines(steps, POLYNOMIAL_SQRT_CODES);
    });
  });

  // 6. Class 172: 多项式对数与指数 (Polynomial Ln & Exp)
  describe('Class 172: 多项式对数与指数 (Polynomial Ln & Exp)', () => {
    it('ln(1+x) 首两项为 x - x^2/2 (mod 998244353)', () => {
      const steps = buildPolyLnExpSteps([1, 1, 0, 0], 4);
      const last = steps[steps.length - 1];
      expect(last.polyLn).toBeDefined();
      expect(last.polyLn![0]).toBe(0);
      expect(last.polyLn![1]).toBe(1);
      expect(last.polyExp).toBeDefined();
      expect(last.polyExp![0]).toBe(1);
      verify1BasedCodeLines(steps, POLYNOMIAL_LN_EXP_CODES);
    });
  });
});
