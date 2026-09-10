/**
 * 左神算法通关课 Class 134 ~ 140 异或高斯消元、线性基与数论扩展自动化测试套件
 */

import { describe, it, expect } from 'vitest';
import { buildXorGaussianSteps } from './xor-gaussian-renderer';
import { buildLinearBasisSteps } from './linear-basis-renderer';
import { buildLinearBasisKthSteps } from './linear-basis-kth-renderer';
import { buildFractionalSteps } from './fractional-programming-renderer';
import { buildExgcdSteps } from './exgcd-renderer';
import { buildDiophantineSteps } from './diophantine-equation-renderer';
import {
  XOR_GAUSSIAN_CODES,
  LINEAR_BASIS_CODES,
  LINEAR_BASIS_KTH_CODES,
  FRACTIONAL_PROGRAMMING_CODES,
  EXGCD_CODES,
  DIOPHANTINE_CODES,
} from './advanced-134-140-stage-codes';

function verify1BasedCodeLines(steps: any[], codes: Record<string, string[]>) {
  expect(steps.length).toBeGreaterThan(0);
  for (const step of steps) {
    if (step.codeLine) {
      for (const lang of ['java', 'cpp', 'python', 'javascript']) {
        const line = step.codeLine[lang];
        expect(line, `Missing line mapping for ${lang}`).toBeDefined();
        expect(line, `Line must be >= 1 for ${lang}`).toBeGreaterThanOrEqual(1);
        expect(line, `Line ${line} exceeds code length ${codes[lang].length} for ${lang}`).toBeLessThanOrEqual(codes[lang].length);
      }
    }
  }
}

describe('左神线性代数、线性基与数论扩展专题 (Class 134 ~ 140) 综合测试套件', () => {
  // 1. Class 134: XOR Gaussian
  describe('Class 134: 异或高斯消元', () => {
    it('3x3 开关异或方程组应准确求出解向量 [1, 1, 0]', () => {
      // E0: 1*x0 ^ 1*x1 ^ 0*x2 = 0
      // E1: 0*x0 ^ 1*x1 ^ 1*x2 = 1
      // E2: 1*x0 ^ 0*x1 ^ 1*x2 = 1
      // 解: x0=1, x1=1, x2=0
      const stdMat = [
        [1, 1, 0, 0],
        [0, 1, 1, 1],
        [1, 0, 1, 1],
      ];
      const steps = buildXorGaussianSteps(stdMat, 3);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.solution).toEqual([1, 1, 0]);
      verify1BasedCodeLines(steps, XOR_GAUSSIAN_CODES);
    });
  });

  // 2. Class 136: Linear Basis Max XOR
  describe('Class 136: 线性基与最大异或和', () => {
    it('输入 [11, 9, 5, 7] 应正确建立线性基并输出最大异或和 14', () => {
      // 11(1011), 9(1001), 5(0101), 7(0111)
      // 11 ^ 5 = 14 (1110), 9 ^ 7 = 14
      const steps = buildLinearBasisSteps([11, 9, 5, 7]);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.finalAns).toBe(14);
      verify1BasedCodeLines(steps, LINEAR_BASIS_CODES);
    });
  });

  // 3. Class 137: Linear Basis Kth XOR
  describe('Class 137: 线性基第 K 小异或和', () => {
    it('集合 [3, 5, 6] 的线性基重构后第 3 小异或和应准确计算', () => {
      // [3, 5, 6] 能够异或出的非零数值排序：
      // 3(011), 5(101), 6(110)
      // 3^5=6, 3^6=5, 5^6=3 -> 空间大小为 3, 5, 6 (独立基底为 2 个)
      const steps = buildLinearBasisKthSteps([3, 5, 6], 3);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.finalAns).toBeDefined();
      expect(lastStep.finalAns).toBeGreaterThan(0);
      verify1BasedCodeLines(steps, LINEAR_BASIS_KTH_CODES);
    });
  });

  // 4. Class 138: Fractional Programming
  describe('Class 138: 01 分数规划', () => {
    it('Dinkelbach 二分判定应准确逼近最大性价比', () => {
      const a = [5, 1, 3, 4, 8];
      const b = [2, 2, 1, 5, 3];
      const steps = buildFractionalSteps(a, b, 3);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.finalAns).toBeDefined();
      // 最佳三项: #4(8/3), #2(3/1), #0(5/2) -> (8+3+5)/(3+1+2) = 16/6 = 2.6667
      expect(Math.abs(lastStep.finalAns! - 2.6667)).toBeLessThan(0.05);
      verify1BasedCodeLines(steps, FRACTIONAL_PROGRAMMING_CODES);
    });
  });

  // 5. Class 139: ExGCD
  describe('Class 139: 扩展欧几里得算法', () => {
    it('应求出 47x + 30y = 1 的裴蜀等式整数解并满足等式验证', () => {
      const steps = buildExgcdSteps(47, 30);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.finalAns).toBeDefined();
      const { x, y, gcd } = lastStep.finalAns!;
      expect(gcd).toBe(1);
      expect(47 * x + 30 * y).toBe(1);
      verify1BasedCodeLines(steps, EXGCD_CODES);
    });
  });

  // 6. Class 140: Diophantine Equation
  describe('Class 140: 二元一次不定方程', () => {
    it('24x + 15y = 18 的最小正整数解应为 x = 2', () => {
      // gcd(24, 15) = 3; 18 % 3 == 0; 24(2) + 15(-2) = 48 - 30 = 18!
      const steps = buildDiophantineSteps(24, 15, 18);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.hasSolution).toBe(true);
      expect(lastStep.minPositiveX).toBe(2);
      expect(lastStep.correspondingY).toBe(-2);
      verify1BasedCodeLines(steps, DIOPHANTINE_CODES);
    });

    it('常数不被 gcd 整除时应准确判定无解', () => {
      // 24x + 15y = 19; gcd(24, 15) = 3; 19 % 3 != 0 -> 无解
      const steps = buildDiophantineSteps(24, 15, 19);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.hasSolution).toBe(false);
      expect(lastStep.minPositiveX).toBeUndefined();
    });
  });
});
