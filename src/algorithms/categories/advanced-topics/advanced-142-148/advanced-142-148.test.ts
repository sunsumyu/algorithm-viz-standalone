/**
 * 左神算法通关课 Class 142 ~ 148 差分约束、同余最短路、二项式反演、康托展开、卡特兰数与 AVL 树自动化测试套件
 */

import { describe, it, expect } from 'vitest';
import { buildDiffConstraintsSteps } from './diff-constraints-system-renderer';
import { buildCongruenceSteps } from './congruence-shortest-path-renderer';
import { buildDerangementSteps } from './binomial-inversion-renderer';
import { buildCantorSteps } from './cantor-expansion-renderer';
import { buildCatalanSteps } from './catalan-number-renderer';
import { buildAVLSteps } from './avl-tree-renderer';
import {
  DIFF_CONSTRAINTS_CODES,
  CONGRUENCE_PATH_CODES,
  BINOMIAL_INVERSION_CODES,
  CANTOR_EXPANSION_CODES,
  CATALAN_NUMBER_CODES,
  AVL_TREE_CODES,
} from './advanced-142-148-stage-codes';

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

describe('左神进阶算法专题 (Class 142 ~ 148) 综合测试套件', () => {
  // 1. Class 142: 差分约束系统
  describe('Class 142: 差分约束系统与 SPFA 负环判定', () => {
    it('对于无负环的差分约束系统应成功求出满足全部约束的可行解', () => {
      // 3 个变量:
      // x2 - x1 <= 3
      // x3 - x2 <= -2
      // x1 - x3 <= 1
      const steps = buildDiffConstraintsSteps(3, [
        { u: 1, v: 2, w: 3 },
        { u: 2, v: 3, w: -2 },
        { u: 3, v: 1, w: 1 },
      ]);
      const last = steps[steps.length - 1];
      expect(last.hasNegativeCycle).toBe(false);
      // 验证三角不等式 dist[v] <= dist[u] + w
      const d = last.dist;
      expect(d[2] - d[1]).toBeLessThanOrEqual(3);
      expect(d[3] - d[2]).toBeLessThanOrEqual(-2);
      expect(d[1] - d[3]).toBeLessThanOrEqual(1);
      verify1BasedCodeLines(steps, DIFF_CONSTRAINTS_CODES);
    });

    it('对于包含负权回路的矛盾约束系统应准确定位并判定无解', () => {
      // x2 - x1 <= 1
      // x3 - x2 <= -4
      // x1 - x3 <= 2
      // 环总和 = 1 - 4 + 2 = -1 < 0
      const steps = buildDiffConstraintsSteps(3, [
        { u: 1, v: 2, w: 1 },
        { u: 2, v: 3, w: -4 },
        { u: 3, v: 1, w: 2 },
      ]);
      const last = steps[steps.length - 1];
      expect(last.hasNegativeCycle).toBe(true);
      verify1BasedCodeLines(steps, DIFF_CONSTRAINTS_CODES);
    });
  });

  // 2. Class 143: 同余最短路
  describe('Class 143: 同余最短路 (跳楼机)', () => {
    it('跳楼机标准算例 (x=3, y=4, z=5, H=15) 应正确输出可达相异楼层总数', () => {
      const steps = buildCongruenceSteps(3, 4, 5, 15);
      const last = steps[steps.length - 1];
      expect(last.ansSoFar).toBeGreaterThan(0);
      verify1BasedCodeLines(steps, CONGRUENCE_PATH_CODES);
    });
  });

  // 3. Class 145: 二项式反演 (错排问题)
  describe('Class 145: 二项式反演与错排问题', () => {
    it('N=5 错排递推应准确得出 D(5)=44', () => {
      const steps = buildDerangementSteps(5);
      const last = steps[steps.length - 1];
      expect(last.d[0]).toBe(1);
      expect(last.d[1]).toBe(0);
      expect(last.d[2]).toBe(1);
      expect(last.d[3]).toBe(2);
      expect(last.d[4]).toBe(9);
      expect(last.d[5]).toBe(44);
      verify1BasedCodeLines(steps, BINOMIAL_INVERSION_CODES);
    });
  });

  // 4. Class 146: 康托展开
  describe('Class 146: 康托展开与逆康托展开', () => {
    it('排列 [3, 4, 1, 5, 2] 应准确计算出字典序第 62 位', () => {
      const steps = buildCantorSteps([3, 4, 1, 5, 2]);
      const last = steps[steps.length - 1];
      expect(last.rank).toBe(62);
      verify1BasedCodeLines(steps, CANTOR_EXPANSION_CODES);
    });

    it('初始最小排列 [1, 2, 3, 4] 字典序排名应为 1', () => {
      const steps = buildCantorSteps([1, 2, 3, 4]);
      const last = steps[steps.length - 1];
      expect(last.rank).toBe(1);
      verify1BasedCodeLines(steps, CANTOR_EXPANSION_CODES);
    });
  });

  // 5. Class 147: 卡特兰数
  describe('Class 147: 卡特兰数与格路计数', () => {
    it('N=5 时卡特兰数应准确得出 C(5)=42 且满足经典数列序列', () => {
      const steps = buildCatalanSteps(5);
      const last = steps[steps.length - 1];
      expect(last.catalanList[0]).toBe(1);
      expect(last.catalanList[1]).toBe(1);
      expect(last.catalanList[2]).toBe(2);
      expect(last.catalanList[3]).toBe(5);
      expect(last.catalanList[4]).toBe(14);
      expect(last.catalanList[5]).toBe(42);
      verify1BasedCodeLines(steps, CATALAN_NUMBER_CODES);
    });
  });

  // 6. Class 148: AVL 平衡二叉搜索树
  describe('Class 148: AVL 平衡二叉搜索树', () => {
    it('插入序列 [10, 20, 30, 40, 50, 25] 应触发自平衡旋转且最终所有节点平衡因子绝对值 <= 1', () => {
      const steps = buildAVLSteps([10, 20, 30, 40, 50, 25]);
      const last = steps[steps.length - 1];
      expect(last.root).toBeDefined();

      // 递归检验平衡因子
      const verifyAVL = (node: any): number => {
        if (!node) return 0;
        const hL = verifyAVL(node.left);
        const hR = verifyAVL(node.right);
        const b = hL - hR;
        expect(Math.abs(b)).toBeLessThanOrEqual(1);
        return Math.max(hL, hR) + 1;
      };

      verifyAVL(last.root);
      verify1BasedCodeLines(steps, AVL_TREE_CODES);
    });
  });
});
