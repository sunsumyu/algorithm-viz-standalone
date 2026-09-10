/**
 * 左神算法通关课 Class 124 ~ 134 高阶遍历、动态规划优化与高斯消元自动化测试套件
 */

import { describe, it, expect } from 'vitest';
import { buildMorrisSteps } from './morris-traversal-renderer';
import { buildProfileDpSteps } from './profile-dp-renderer';
import { buildTernaryDpSteps } from './ternary-dp-renderer';
import { buildBinaryLiftingDpSteps } from './binary-lifting-dp-renderer';
import { buildMonotonicQueueDpSteps } from './monotonic-queue-dp-renderer';
import { buildGaussianSteps } from './gaussian-elimination-renderer';
import {
  MORRIS_CODES,
  PROFILE_DP_CODES,
  TERNARY_DP_CODES,
  BINARY_LIFTING_DP_CODES,
  MONOTONIC_QUEUE_DP_CODES,
  GAUSSIAN_ELIMINATION_CODES,
} from './advanced-124-134-stage-codes';

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

describe('左神高阶遍历与 DP/高斯消元专题 (Class 124 ~ 134) 综合测试套件', () => {
  // 1. Class 124: Morris Traversal
  describe('Class 124: Morris 遍历 (O(1) 空间二叉树中序遍历)', () => {
    it('BST 树应输出严格单调递增中序序列且满足 1-based 行号', () => {
      const bst = [
        { id: 1, val: 4, left: 2, right: 3 },
        { id: 2, val: 2, left: 4, right: 5 },
        { id: 3, val: 6, left: 6, right: 7 },
        { id: 4, val: 1 },
        { id: 5, val: 3 },
        { id: 6, val: 5 },
        { id: 7, val: 7 },
      ];
      const steps = buildMorrisSteps(bst, 1);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.traversalList).toEqual([1, 2, 3, 4, 5, 6, 7]);
      verify1BasedCodeLines(steps, MORRIS_CODES);
    });

    it('单支链状二叉树应正确遍历', () => {
      const lineTree = [
        { id: 1, val: 10, right: 2 },
        { id: 2, val: 20, right: 3 },
        { id: 3, val: 30 },
      ];
      const steps = buildMorrisSteps(lineTree, 1);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.traversalList).toEqual([10, 20, 30]);
    });
  });

  // 2. Class 125: Profile DP
  describe('Class 125: 轮廓线 DP (骨牌铺砖)', () => {
    it('2x3 网格完全铺满方案数应准确为 3', () => {
      // 2x3 网格的多米诺骨牌铺法已知为 3 种
      const steps = buildProfileDpSteps(2, 3);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.finalAns).toBe(3);
      verify1BasedCodeLines(steps, PROFILE_DP_CODES);
    });

    it('奇数面积网格铺满方案数必定为 0', () => {
      // 1x3 网格面积为 3（奇数），无法被 1x2 骨牌铺满
      const steps = buildProfileDpSteps(1, 3);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.finalAns).toBe(0);
    });
  });

  // 3. Class 126: Ternary DP
  describe('Class 126: 三进制状压 DP', () => {
    it('3x3 网格在两步约束下应找到最优放置数', () => {
      const steps = buildTernaryDpSteps(3, 3);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.bestAns).toBeGreaterThan(0);
      verify1BasedCodeLines(steps, TERNARY_DP_CODES);
    });
  });

  // 4. Class 129: Binary Lifting DP
  describe('Class 129: 倍增优化 DP', () => {
    it('环形状态图在超长步数下应快速瞬移至准确节点', () => {
      // 6 节点环: 0->1->2->3->4->5->0
      const succ = [1, 2, 3, 4, 5, 0];
      // 从 0 出发跳 13 步: 13 % 6 = 1 -> 到达 1
      const steps = buildBinaryLiftingDpSteps(6, succ, 0, 13);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.finalResult).toBe(1);
      verify1BasedCodeLines(steps, BINARY_LIFTING_DP_CODES);
    });
  });

  // 5. Class 130: Monotonic Queue DP
  describe('Class 130: 单调队列优化 DP', () => {
    it('滑动窗口优化应准确求解跳跃最大收益', () => {
      const val = [0, 2, -3, 5, 1, 4, -2, 6];
      // 跳跃跨度 [1, 3]
      const steps = buildMonotonicQueueDpSteps(val, 1, 3);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.bestAns).toBeDefined();
      expect(lastStep.bestAns).toBeGreaterThan(0);
      verify1BasedCodeLines(steps, MONOTONIC_QUEUE_DP_CODES);
    });
  });

  // 6. Class 133: Gaussian Elimination
  describe('Class 133: 高斯消元法 (线性方程组)', () => {
    it('标准 3x3 方程组应精确解出 x0=1, x1=2, x2=3', () => {
      const stdMat = [
        [1, 1, 1, 6],
        [2, 3, 1, 11],
        [1, -1, 2, 5],
      ];
      const steps = buildGaussianSteps(stdMat, 3);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.solution).toBeDefined();
      const sol = lastStep.solution!;
      expect(Math.abs(sol[0] - 1.0)).toBeLessThan(1e-4);
      expect(Math.abs(sol[1] - 2.0)).toBeLessThan(1e-4);
      expect(Math.abs(sol[2] - 3.0)).toBeLessThan(1e-4);
      verify1BasedCodeLines(steps, GAUSSIAN_ELIMINATION_CODES);
    });
  });
});
